(() => {
  'use strict';
  const labels = { rouge: 'Rouge', bleu: 'Bleu', vert: 'Vert', jaune: 'Jaune', orange: 'Orange', violet: 'Violet' };
  const symbols = { rouge: 'R', bleu: 'B', vert: 'V', jaune: 'J', orange: 'O', violet: 'Vi' };
  const $ = id => document.getElementById(id);
  const selects = [];
  const testMode = new URLSearchParams(window.location.search).getAll('test').includes('1');
  function updateSelectedCount() {
    const count = selects.filter(select => select.value !== '').length;
    $('selected-count').textContent = `${count}/4 couleurs choisies`;
  }
  function token(color) {
    const el = document.createElement('span');
    el.className = `token ${color}`;
    el.textContent = symbols[color];
    el.setAttribute('aria-label', labels[color]);
    el.title = labels[color];
    return el;
  }
  function render(state) {
    const playing = state.status === 'playing';
    $('counter').textContent = `${state.attempts} / 10 essais`;
    $('choices').disabled = !playing;
    $('submit').disabled = !playing;
    $('new-game').textContent = state.status === 'not-started' ? 'Commencer une partie' : 'Nouvelle partie';
    $('status').textContent = {
      'not-started': 'Prêt à relever le défi ? Commencez une partie.',
      playing: `${10 - state.attempts} essai${10 - state.attempts > 1 ? 's' : ''} restant${10 - state.attempts > 1 ? 's' : ''}. À vous de jouer.`,
      won: `Code trouvé en ${state.attempts} essai${state.attempts > 1 ? 's' : ''}. Bien joué !`,
      lost: 'Les dix essais sont épuisés. Réessayez avec un nouveau code !'
    }[state.status];
    $('status').dataset.status = state.status;
    $('error').textContent = state.lastError ? state.lastError.message : '';
    $('empty').hidden = state.history.length > 0;
    $('history').replaceChildren();
    state.history.forEach((entry, i) => {
      const row = document.createElement('li');
      const number = document.createElement('span');
      number.className = 'attempt'; number.textContent = String(i + 1).padStart(2, '0');
      const pegs = document.createElement('div'); pegs.className = 'pegs';
      entry.guess.forEach(color => pegs.append(token(color)));
      const result = document.createElement('div'); result.className = 'result';
      const exact = document.createElement('span'); exact.textContent = `${entry.result.wellPlaced} bien placée(s)`;
      const elsewhere = document.createElement('span'); elsewhere.textContent = `${entry.result.misplaced} mal placée(s)`;
      result.append(exact, elsewhere); row.append(number, pegs, result); $('history').append(row);
    });
    if (state.status === 'playing' && state.attempts === 0 && !state.lastError) {
      selects.forEach(select => { select.value = ''; select.closest('label').dataset.color = ''; });
    }
    updateSelectedCount();
  }
  const game = window.CodeSecret.createGame(render);
  const colors = game.getConfig().colors;
  for (let i = 0; i < 4; i++) {
    const label = document.createElement('label'); label.className = 'slot';
    const title = document.createElement('span'); title.textContent = `Position ${i + 1}`;
    const select = document.createElement('select'); select.id = `position-${i + 1}`;
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Choisir…';
    select.append(placeholder);
    colors.forEach(color => { const opt = document.createElement('option'); opt.value = color; opt.textContent = labels[color]; select.append(opt); });
    select.addEventListener('change', () => { label.dataset.color = select.value; updateSelectedCount(); });
    label.append(title, select); $('slots').append(label); selects.push(select);
  }
  colors.forEach(color => {
    const li = document.createElement('li'); const name = document.createElement('span'); name.textContent = labels[color];
    li.append(token(color), name); $('palette').append(li);
  });
  $('new-game').addEventListener('click', async () => { await game.startGame(); selects[0].focus(); });
  $('guess-form').addEventListener('submit', async event => {
    event.preventDefault();
    const state = await game.submitGuess(selects.map(select => select.value));
    if (state.status === 'playing') selects[0].focus();
    else $('new-game').focus();
  });
  render(game.getState());
  // L'API commande le même objet que les boutons. Aucun secret n'est exposé.
  if (testMode) window.codeSecretTest = Object.freeze({
    version: game.version, getConfig: game.getConfig, getState: game.getState,
    startGame: game.startGame, submitGuess: game.submitGuess
  });
})();
