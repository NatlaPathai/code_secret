(function (root) {
  'use strict';
  const COLORS = ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet'];
  const MESSAGES = {
    'game-not-started': 'Commencez une nouvelle partie avant de proposer un code.',
    'game-finished': 'La partie est terminée. Lancez une nouvelle partie.',
    'invalid-type': 'Le code doit être un tableau complet de noms de couleurs.',
    'invalid-length': 'Choisissez exactement quatre couleurs.',
    'invalid-color': 'Choisissez une couleur autorisée pour chacune des quatre positions.',
    'invalid-options': 'Les options doivent être un objet contenant uniquement un éventuel code secret.'
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  const failure = code => ({ code, message: MESSAGES[code] });

  function validate(code) {
    if (!Array.isArray(code)) return 'invalid-type';
    for (let i = 0; i < code.length; i++) {
      if (!Object.hasOwn(code, i) || typeof code[i] !== 'string') return 'invalid-type';
    }
    if (code.length !== 4) return 'invalid-length';
    if (code.some(color => !COLORS.includes(color))) return 'invalid-color';
    return null;
  }

  // On retire d'abord les positions exactes pour ne jamais compter un pion deux fois.
  function score(secret, guess) {
    let wellPlaced = 0;
    const remainingSecret = [], remainingGuess = [];
    secret.forEach((color, i) => {
      if (color === guess[i]) wellPlaced++;
      else { remainingSecret.push(color); remainingGuess.push(guess[i]); }
    });
    let misplaced = 0;
    for (const color of remainingGuess) {
      const index = remainingSecret.indexOf(color);
      if (index !== -1) { misplaced++; remainingSecret.splice(index, 1); }
    }
    return { wellPlaced, misplaced };
  }

  function createGame(onChange = () => {}) {
    let secret = null;
    let state = { status: 'not-started', attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
    const getState = () => copy(state);
    function emit() { onChange(getState()); return getState(); }
    return {
      version: '0.2',
      getConfig: () => ({ apiVersion: '0.2', rulesVersion: 'code-couleurs-1.0', secretLength: 4, maxAttempts: 10, allowDuplicates: true, colors: [...COLORS] }),
      getState,
      async startGame(options = {}) {
        let error = null;
        if (options === null || typeof options !== 'object' || Array.isArray(options)
          || ![Object.prototype, null].includes(Object.getPrototypeOf(options))
          || Reflect.ownKeys(options).some(key => key !== 'secret')) error = 'invalid-options';
        const imposed = !error && Object.hasOwn(options, 'secret');
        if (!error && imposed) error = validate(options.secret);
        if (error) throw Object.assign(new Error(MESSAGES[error]), { code: error });
        secret = imposed ? [...options.secret] : Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
        state = { status: 'playing', attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null };
        return emit();
      },
      async submitGuess(guess) {
        const error = state.status === 'not-started' ? 'game-not-started'
          : state.status !== 'playing' ? 'game-finished' : validate(guess);
        if (error) { state.lastError = failure(error); return emit(); }
        const savedGuess = [...guess];
        const result = score(secret, savedGuess);
        state.history.push({ guess: savedGuess, result });
        state.attempts++;
        state.lastGuess = savedGuess;
        state.lastResult = result;
        state.lastError = null;
        state.status = result.wellPlaced === 4 ? 'won' : state.attempts === 10 ? 'lost' : 'playing';
        return emit();
      }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { createGame };
  else root.CodeSecret = Object.freeze({ createGame });
})(typeof window === 'undefined' ? globalThis : window);
