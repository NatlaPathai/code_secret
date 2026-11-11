// Scénarios du contrat 0.2 : appels à l'API de la page intégrée, jamais à un moteur de remplacement.
window.runContractChecks = async function ({ frame, open, check }) {
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const clone = value => JSON.parse(JSON.stringify(value));
  const core = state => { const { lastError, ...rest } = state; return rest; };
  const [R,B,V,J,O,Vi] = ['rouge','bleu','vert','jaune','orange','violet'];
  const four = color => Array(4).fill(color);
  const initial = {status:'not-started',attempts:0,history:[],lastGuess:null,lastResult:null,lastError:null};
  await open('../index.html?atelier=4');
  check('Contrat : API absente avec un paramètre ordinaire.', typeof frame.contentWindow.codeSecretTest === 'undefined');
  await open('../index.html?atelier=4&test=1');
  const win=frame.contentWindow, d=frame.contentDocument, $=id=>d.getElementById(id), api=win.codeSecretTest;
  const options = properties => Object.assign(new win.Object(),properties);
  const start = secret => api.startGame(options({secret}));
  const snapshotUI = () => JSON.stringify({text:d.body.innerText,values:[...d.querySelectorAll('select')].map(s=>s.value),disabled:$('submit').disabled});
  function matchesUI(s) {
    const rows=[...$('history').children];
    return $('counter').textContent===`${s.attempts} / 10 essais`
      && $('submit').disabled===(s.status!=='playing') && rows.length===s.history.length
      && rows.every((row,i)=>same([...row.querySelectorAll('.token')].map(p=>p.classList[1]),s.history[i].guess)
        && row.querySelector('.result').children[0].textContent===`${s.history[i].result.wellPlaced} bien placée(s)`
        && row.querySelector('.result').children[1].textContent===`${s.history[i].result.misplaced} mal placée(s)`);
  }
  function validState(s) {
    return ['not-started','playing','won','lost'].includes(s.status)
      && Number.isInteger(s.attempts)&&s.attempts>=0&&s.attempts<=10&&s.attempts===s.history.length
      && same(s.lastGuess,s.history.at(-1)?.guess??null)&&same(s.lastResult,s.history.at(-1)?.result??null)
      && !('secret' in s)&&!('solution' in s)&&same(s,JSON.parse(JSON.stringify(s)))
      && s.history.every(e=>e.guess.length===4&&e.guess.every(c=>[R,B,V,J,O,Vi].includes(c))
        && Number.isInteger(e.result.wellPlaced)&&Number.isInteger(e.result.misplaced)
        && e.result.wellPlaced>=0&&e.result.misplaced>=0&&e.result.wellPlaced+e.result.misplaced<=4);
  }
  check('Contrat : état initial exact et écran à zéro avec atelier=4&test=1.',same(api.getState(),initial)&&matchesUI(api.getState()));
  const config=api.getConfig();
  check('Contrat : version, configuration exacte et getters synchrones.',api.version==='0.2'&&!(config instanceof win.Promise)&&!(api.getState() instanceof win.Promise)&&same(config,{apiVersion:'0.2',rulesVersion:'code-couleurs-1.0',secretLength:4,maxAttempts:10,allowDuplicates:true,colors:[R,B,V,J,O,Vi]}));
  const beforeStart=api.getState();let result=api.submitGuess(null);
  check('Contrat : submitGuess retourne une promesse.',result instanceof win.Promise);
  let s=await result;
  check('Contrat : game-not-started prioritaire, aucune donnée de partie modifiée.',s.lastError.code==='game-not-started'&&!!s.lastError.message&&same(core(s),core(beforeStart))&&matchesUI(s));
  const beforeRead=JSON.stringify(s), beforeReadUI=snapshotUI();api.getState();api.getConfig();
  check('Contrat : les getters conservent état, lastError et interface.',JSON.stringify(api.getState())===beforeRead&&snapshotUI()===beforeReadUI);
  for(const [label,args] of [['sans argument',[]],['undefined',[undefined]],['objet vide',[options({})]]]) {
    result=api.startGame(...args); const promise=result instanceof win.Promise; s=await result;
    check(`Contrat : startGame ${label}, promesse et remise à zéro.`,promise&&same(s,{...initial,status:'playing'})&&matchesUI(s));
  }
  const examples=[
    [[R,B,V,J],[R,V,B,O],1,2],[[R,B,V,J],[O,Vi,R,B],0,2],[[R,B,V,J],[B,R,J,V],0,4],
    [[R,B,V,J],[R,B,J,V],2,2],[[R,B,V,J],[R,B,V,J],4,0],[[R,R,B,V],four(R),2,0],
    [[R,R,B,V],[R,B,R,V],2,2],[[R,R,B,V],[R,R,B,V],4,0],[[R,R,B,V],[R,B,R,R],1,2]
  ];
  for(let i=0;i<examples.length;i++) {
    const [secret,guess,wellPlaced,misplaced]=examples[i];await start(secret);s=await api.submitGuess(guess);
    check(`Contrat T${String(i+1).padStart(2,'0')} : attendu ${wellPlaced}/${misplaced}, obtenu ${s.lastResult.wellPlaced}/${s.lastResult.misplaced}, historique et écran concordants.`,same(s.lastResult,{wellPlaced,misplaced})&&s.attempts===1&&s.lastError===null&&s.status===(wellPlaced===4?'won':'playing')&&same(s.lastGuess,guess)&&validState(s)&&matchesUI(s));
  }
  await start(four(R));await api.submitGuess(four(B));
  const invalidGuesses=[
    ['null',null,'invalid-type'],['chaîne','rouge','invalid-type'],['tableau creux',new win.Array(4),'invalid-type'],
    ['élément absent',[R,,B,V],'invalid-type'],['type avant longueur',[R,null],'invalid-type'],
    ['tableau vide',[],'invalid-length'],['trois couleurs',[R,B,V],'invalid-length'],['cinq couleurs',[R,B,V,J,O],'invalid-length'],
    ['longueur avant couleur',['purple'],'invalid-length'],['majuscule',['Violet',R,R,R],'invalid-color'],
    ['espace final',['violet ',R,R,R],'invalid-color'],['traduction',['purple',R,R,R],'invalid-color']
  ];
  for(const [label,guess,code] of invalidGuesses) {
    const before=api.getState();s=await api.submitGuess(guess);
    check(`Contrat refus ${label} : attendu ${code}, obtenu ${s.lastError?.code}.`,s.lastError?.code===code&&typeof s.lastError.message==='string'&&s.lastError.message.length>0&&same(core(s),core(before))&&matchesUI(s)&&$('error').textContent===s.lastError.message);
  }
  s=await api.submitGuess(four(Vi));check('Contrat : violet et quatre répétitions acceptés ; lastError effacé.',s.attempts===2&&s.lastError===null&&matchesUI(s));
  await api.submitGuess([R]);
  const invalidOptions=[
    ['null',null,'invalid-options'],['tableau',[],'invalid-options'],['chaîne','x','invalid-options'],['nombre',1,'invalid-options'],['date',new win.Date(),'invalid-options'],
    ['clé inconnue avant secret invalide',options({autre:1,secret:null}),'invalid-options'],
    ['clé symbole',options({[Symbol('inconnue')]:1}),'invalid-options'],
    ['secret undefined',options({secret:undefined}),'invalid-type'],['secret null',options({secret:null}),'invalid-type'],
    ['secret creux',options({secret:new win.Array(4)}),'invalid-type'],['type avant longueur',options({secret:[R,null]}),'invalid-type'],
    ['secret court',options({secret:[R]}),'invalid-length'],['couleur exacte',options({secret:[R,B,V,'Violet']}),'invalid-color']
  ];
  for(const [label,opt,code] of invalidOptions) {
    const before=api.getState(),ui=snapshotUI();let error=null;
    try{await api.startGame(opt);}catch(e){error=e;}
    check(`Contrat démarrage ${label} : rejet ${code}, état et écran intacts.`,error instanceof win.Error&&error.code===code&&!!error.message&&same(api.getState(),before)&&snapshotUI()===ui);
  }
  const imposed=[R,R,B,V];const started=await start(imposed);imposed.fill(O);started.history.push({});started.status='lost';
  const guess=[R,B,R,V];const returned=await api.submitGuess(guess);guess.fill(O);const saved=api.getState();
  returned.history[0].guess.fill(J);returned.lastGuess.fill(J);returned.lastResult.wellPlaced=4;
  const getter=api.getState();getter.history.length=0;const cfg=api.getConfig();cfg.colors.fill('inconnue');
  check('Contrat : modifier secret fourni, proposition, états et configuration ne modifie pas la partie.',same(api.getState(),saved)&&same(saved.lastResult,{wellPlaced:2,misplaced:2})&&api.getConfig().colors[0]===R&&matchesUI(saved));
  s=await api.submitGuess([R,R,B,V]);check('Contrat : code imposé conservé après mutation du tableau fourni.',s.status==='won'&&validState(s)&&matchesUI(s));
  const won=api.getState();s=await api.submitGuess(null);
  check('Contrat : après victoire, game-finished avant invalid-type et données conservées.',s.lastError.code==='game-finished'&&same(core(s),core(won))&&matchesUI(s));
  s=await start(four(R));check('Contrat : redémarrage depuis won efface tout.',same(s,{...initial,status:'playing'})&&matchesUI(s));
  for(let i=0;i<9;i++)await api.submitGuess(four(B));
  s=await api.submitGuess([R]);check('Contrat : refus au neuvième essai, attempts et historique restent à 9.',s.attempts===9&&s.history.length===9&&s.lastError.code==='invalid-length'&&matchesUI(s));
  s=await api.submitGuess(four(R));check('Contrat : victoire au dixième, dix entrées et résultat 4/0.',s.status==='won'&&s.attempts===10&&same(s.lastResult,{wellPlaced:4,misplaced:0})&&s.lastError===null&&validState(s)&&matchesUI(s)&&$('status').textContent.includes('Code trouvé en 10 essais'));
  await start(four(R));for(let i=0;i<10;i++)s=await api.submitGuess(four(B));
  check('Contrat : défaite au dixième, dix entrées et résultat 0/0.',s.status==='lost'&&s.attempts===10&&same(s.lastResult,{wellPlaced:0,misplaced:0})&&validState(s)&&matchesUI(s)&&$('status').textContent.includes('épuisés'));
  const lost=api.getState();s=await api.submitGuess(four(R));
  check('Contrat : après défaite, aucun onzième essai.',s.lastError.code==='game-finished'&&same(core(s),core(lost))&&matchesUI(s));
  s=await api.startGame();check('Contrat : redémarrage depuis lost efface aussi lastError.',same(s,{...initial,status:'playing'})&&matchesUI(s));
  await start([R,R,B,V]);await api.submitGuess([R,B,R,V]);
  [R,R,B,V].forEach((color,i)=>{const el=$('position-'+(i+1));el.value=color;el.dispatchEvent(new win.Event('change',{bubbles:true}));});
  $('submit').click();await Promise.resolve();s=api.getState();
  check('Contrat : action utilisateur après appel API, même historique et victoire.',s.status==='won'&&s.attempts===2&&matchesUI(s));
  check('Contrat : aucune révélation du secret, même après victoire.',$('secret')===null&&d.querySelector('.secret').textContent==='????'&&!('secret' in s)&&!('solution' in s));
  await open('../index.html?atelier=4&test=1');
  check('Contrat : rechargement en mode test, état initial sans secret persistant.',same(frame.contentWindow.codeSecretTest.getState(),initial));
};
