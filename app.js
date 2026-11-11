(() => {
  'use strict';
  const labels = { rouge: 'Rouge', bleu: 'Bleu', vert: 'Vert', jaune: 'Jaune', orange: 'Orange', violet: 'Violet' };
  const symbols = { rouge: 'R', bleu: 'B', vert: 'V', jaune: 'J', orange: 'O', violet: 'Vi' };
  const $ = id => document.getElementById(id);
  const positions = [];
  const draft = ['', '', '', ''];
  let activePosition = 0;
  const testMode = new URLSearchParams(window.location.search).getAll('test').includes('1');
  function updateSelectedCount() {
    positions.forEach((button, i) => {
      const color = draft[i];
      const preview = button.querySelector('.selection-preview');
      preview.className = `selection-preview token ${color || 'unselected'}`;
      preview.textContent = symbols[color] || '?';
      button.querySelector('.position-color').textContent = labels[color] || 'Vide';
      button.dataset.color = color;
      button.setAttribute('aria-pressed', String(i === activePosition));
      button.setAttribute('aria-label', `Position ${i + 1} : ${labels[color] || 'vide'}`);
    });
    const count = draft.filter(Boolean).length;
    $('selected-count').textContent = `${count}/4 couleurs choisies`;
    $('color-instruction').textContent = `Position ${activePosition + 1} sélectionnée. Choisissez sa couleur.`;
    $('clear-position').disabled = !draft[activePosition];
    $('color-buttons').querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.colorChoice === draft[activePosition]));
    });
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
      draft.fill('');
      activePosition = 0;
    }
    updateSelectedCount();
  }
  const game = window.CodeSecret.createGame(render);
  const colors = game.getConfig().colors;
  for (let i = 0; i < 4; i++) {
    const button = document.createElement('button'); button.className = 'slot';
    button.type = 'button'; button.id = `position-${i + 1}`;
    const title = document.createElement('span'); title.textContent = `Position ${i + 1}`;
    const preview = document.createElement('span');
    preview.className = 'selection-preview token unselected';
    preview.textContent = '?';
    preview.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span'); name.className = 'position-color';
    button.append(title, preview, name);
    button.addEventListener('click', () => { activePosition = i; updateSelectedCount(); });
    button.addEventListener('keydown', event => {
      const moves = { ArrowRight: (i + 1) % 4, ArrowLeft: (i + 3) % 4, Home: 0, End: 3 };
      if (Object.hasOwn(moves, event.key)) {
        event.preventDefault(); activePosition = moves[event.key];
        updateSelectedCount(); positions[activePosition].focus();
      }
    });
    $('slots').append(button); positions.push(button);
  }
  colors.forEach(color => {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'color-choice'; button.dataset.colorChoice = color;
    button.setAttribute('aria-label', labels[color]);
    const preview = token(color); preview.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span'); name.textContent = labels[color];
    button.append(preview, name);
    button.addEventListener('click', () => { draft[activePosition] = color; updateSelectedCount(); });
    $('color-buttons').append(button);
  });
  $('clear-position').addEventListener('click', () => { draft[activePosition] = ''; updateSelectedCount(); positions[activePosition].focus(); });
  colors.forEach(color => {
    const li = document.createElement('li'); const name = document.createElement('span'); name.textContent = labels[color];
    li.append(token(color), name); $('palette').append(li);
  });
  $('new-game').addEventListener('click', async () => { await game.startGame(); positions[0].focus(); });
  $('guess-form').addEventListener('submit', async event => {
    event.preventDefault();
    const state = await game.submitGuess([...draft]);
    if (state.status === 'playing') positions[activePosition].focus();
    else $('new-game').focus();
  });
  render(game.getState());
  // L'API commande le même objet que les boutons. Aucun secret n'est exposé.
  if (testMode) window.codeSecretTest = Object.freeze({
    version: game.version, getConfig: game.getConfig, getState: game.getState,
    startGame: game.startGame, submitGuess: game.submitGuess
  });
})();
