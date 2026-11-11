const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('../engine.js');
const [R, B, V, J, O, Vi] = ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet'];
const repeat = color => Array(4).fill(color);

test('configuration et état initial ; refus avant démarrage', async () => {
  const game = createGame();
  assert.equal(game.version, '0.2');
  assert.deepEqual(game.getConfig(), { apiVersion: '0.2', rulesVersion: 'code-couleurs-1.0', secretLength: 4, maxAttempts: 10, allowDuplicates: true, colors: [R, B, V, J, O, Vi] });
  assert.deepEqual(game.getState(), { status: 'not-started', attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null });
  assert.equal((await game.submitGuess(null)).lastError.code, 'game-not-started');
});

const examples = [
  [[R,B,V,J],[R,V,B,O],1,2], [[R,B,V,J],[O,Vi,R,B],0,2],
  [[R,B,V,J],[B,R,J,V],0,4], [[R,B,V,J],[R,B,J,V],2,2],
  [[R,B,V,J],[R,B,V,J],4,0], [[R,R,B,V],[R,R,R,R],2,0],
  [[R,R,B,V],[R,B,R,V],2,2], [[R,R,B,V],[R,R,B,V],4,0],
  [[R,R,B,V],[R,B,R,R],1,2]
];
examples.forEach(([secret, guess, wellPlaced, misplaced], i) => {
  test(`T${String(i+1).padStart(2,'0')} : indices du contrat`, async () => {
    const game = createGame(); await game.startGame({ secret });
    const state = await game.submitGuess(guess);
    assert.deepEqual(state.lastResult, { wellPlaced, misplaced });
    assert.equal(state.status, wellPlaced === 4 ? 'won' : 'playing');
    assert.equal(state.attempts, 1); assert.equal(state.history.length, 1);
    assert.deepEqual(state.history[0], { guess, result: state.lastResult });
    assert.equal(state.lastError, null);
  });
});

test('priorités des refus, tableaux creux et identifiants exacts', async () => {
  const game = createGame(); await game.startGame({ secret: repeat(R) });
  await game.submitGuess(repeat(B));
  const original = game.getState();
  const cases = [[null,'invalid-type'], [[R,null],'invalid-type'], [Array(4),'invalid-type'], [[R],'invalid-length'], [[R,R,R,R,R],'invalid-length'], [['Violet',R,R,R],'invalid-color'], [['violet ',R,R,R],'invalid-color'], [['purple',R,R,R],'invalid-color']];
  for (const [guess, code] of cases) {
    const state = await game.submitGuess(guess);
    assert.equal(state.lastError.code, code); assert.ok(state.lastError.message);
    const { lastError, ...data } = state;
    const { lastError: ignored, ...before } = original;
    assert.deepEqual(data, before);
  }
  assert.equal((await game.submitGuess(repeat(Vi))).lastError, null);
});

test('démarrage invalide rejette sans mutation, même de lastError', async () => {
  let notifications = 0;
  const game = createGame(() => notifications++);
  await game.startGame({secret: repeat(R)}); await game.submitGuess([R]);
  const original = game.getState(), before = notifications;
  const cases = [[null,'invalid-options'], [[],'invalid-options'], ['x','invalid-options'], [new Date(),'invalid-options'], [{other:true,secret:null},'invalid-options'], [{[Symbol('x')]:1},'invalid-options'], [{secret:undefined},'invalid-type'], [{secret:null},'invalid-type'], [{secret:[R,null]},'invalid-type'], [{secret:[R]},'invalid-length'], [{secret:[R,R,R,'Violet']},'invalid-color']];
  for (const [options, code] of cases) {
    await assert.rejects(game.startGame(options), error => error instanceof Error && error.code === code && error.message.length > 0);
    assert.deepEqual(game.getState(), original);
  }
  assert.equal(notifications, before);
});

test('victoire au dixième après un refus au neuvième ; fin prioritaire', async () => {
  const game = createGame(); await game.startGame({secret:repeat(R)});
  for (let i=0;i<9;i++) await game.submitGuess(repeat(B));
  assert.equal((await game.submitGuess([R])).attempts, 9);
  const won = await game.submitGuess(repeat(R));
  assert.equal(won.status, 'won'); assert.equal(won.attempts, 10); assert.equal(won.history.length,10);
  const after = await game.submitGuess(null);
  assert.equal(after.lastError.code,'game-finished');
  assert.deepEqual({...after,lastError:null},won);
  assert.equal((await game.startGame()).attempts,0);
});

test('défaite après dix essais, refus après fin et redémarrage', async () => {
  const game = createGame(); await game.startGame({secret:repeat(R)});
  for (let i=0;i<10;i++) await game.submitGuess(repeat(B));
  const lost = game.getState(); assert.equal(lost.status,'lost'); assert.equal(lost.attempts,10);
  const after = await game.submitGuess(repeat(R));
  assert.equal(after.lastError.code,'game-finished'); assert.deepEqual({...after,lastError:null},lost);
  assert.deepEqual(await game.startGame({}), {status:'playing',attempts:0,history:[],lastGuess:null,lastResult:null,lastError:null});
});

test('entrées, lectures et résultats sont indépendants de la partie', async () => {
  const game = createGame(); const secret = [R,R,B,V];
  await game.startGame({secret}); secret.fill(O);
  const guess = [R,B,R,V]; const result = await game.submitGuess(guess); guess.fill(O);
  const original = game.getState(); assert.deepEqual(original.lastResult,{wellPlaced:2,misplaced:2});
  result.history[0].guess.fill(O); result.lastResult.wellPlaced=4; result.lastGuess.fill(O);
  const read = game.getState(); read.history.length=0;
  const config=game.getConfig(); config.colors.fill('x');
  assert.deepEqual(game.getState(), original); assert.equal(game.getConfig().colors[0],R);
  assert.equal('secret' in original,false); assert.equal('solution' in original,false);
  assert.equal((await game.submitGuess([R,R,B,V])).status,'won');
});

test('tous les codes de quatre couleurs, avec une référence par fréquences', async () => {
  // 1 296 secrets et 1 296 propositions : les répétitions sont vérifiées exhaustivement.
  const palette=[R,B,V,J,O,Vi]; const codes=[];
  for (const a of palette) for (const b of palette) for (const c of palette) for (const d of palette) codes.push([a,b,c,d]);
  const counts = codes.map(code => palette.map(color => code.filter(c => c === color).length));
  const game=createGame();
  for (let s=0;s<codes.length;s++) for (let g=0;g<codes.length;g++) {
    await game.startGame({secret:codes[s]});
    const result=(await game.submitGuess(codes[g])).lastResult;
    const exact=codes[s].filter((color,i)=>color===codes[g][i]).length;
    const total=counts[s].reduce((sum,n,i)=>sum+Math.min(n,counts[g][i]),0);
    if (result.wellPlaced !== exact || result.misplaced !== total-exact) assert.fail(JSON.stringify({secret:codes[s],guess:codes[g],result,expected:{wellPlaced:exact,misplaced:total-exact}}));
  }
});
