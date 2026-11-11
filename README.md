# Code secret en couleurs

Version **0.2.0**, adaptée avec Codex à l’atelier du 11 novembre 2026. Jeu solo inspiré du Mastermind, sans compte ni serveur applicatif. Dépôt : https://github.com/NatlaPathai/code_secret. Cette version du jeu conserve le contrat API **0.2**, dont le numéro est indépendant.

## Jouer

Ouvrir `index.html` dans un navigateur récent, puis choisir « Commencer une partie ». Composer quatre couleurs à l’aide des listes et valider. Les commandes sont utilisables au clavier ; les couleurs portent aussi un nom ou une abréviation.

Jeu publié : https://natlapathai.github.io/code_secret/ · Mode API : https://natlapathai.github.io/code_secret/?test=1.

Le programme choisit quatre couleurs parmi rouge, bleu, vert, jaune, orange et violet. Les répétitions sont autorisées. Chaque essai valide donne le nombre de couleurs bien placées et présentes ailleurs, sans compter un pion deux fois. Le code reste caché. Dix essais au maximum ; trouver le code au dixième gagne la partie. Une saisie refusée ne consomme pas d’essai. « Nouvelle partie » remet tout à zéro.

Sources pédagogiques fournies : *Projet — Code secret en couleurs*, édition 2.2, annexe `code-couleurs-1.0` ; *API commune de test*, contrat 0.2 ; *Évaluation du projet*, version 1.3. Ces documents de référence ne sont pas inclus dans le dépôt.

Source complémentaire : *Atelier 4 du 11 novembre 2026 — Démarrer et vérifier le Code secret*, édition 1.25, diapositives 6–18 et notes. `AGENTS.md`, à la racine, définit la méthode de modification et de vérification du projet.

## Étape de l’atelier

**Résultats attendus avant modification.** À l’ouverture et après « Nouvelle partie », l’indicateur affiche **0/4 couleurs choisies**. Après trois sélections, il affiche **3/4** ; après la quatrième, **4/4**. Vider un choix doit diminuer ce nombre. Refuser une proposition de trois couleurs doit conserver le compteur d’essais et l’historique ; une proposition valide de quatre couleurs doit continuer à consommer exactement un essai.

**Choix d’interface proposé par Codex.** Placer l’indicateur près des quatre listes pour aider à repérer une saisie incomplète. Son emplacement et son apparence sont des choix de réalisation, pas des règles communes.

**Décision de l’utilisateur.** Reporter les bonus du robot et de l’écran de démonstration à plus tard. Ils ne sont pas ajoutés à cette version. Le cas de répétitions du bonus 4.3 est déjà couvert par T09 ; cela ne constitue pas un nouveau test exécuté.

**Questions ouvertes.** L’emplacement de l’indicateur et les listes de choix conviennent-ils après un essai personnel ? Quel appareil utilisera l’étudiant pour l’essai sur smartphone ? La relecture du cadrage en binôme reste à réaliser, avec un point clair et une question utile. Elle est distincte de l’essai ultérieur du jeu d’un camarade.

**Vérification de cette étape.** Réalisée le 11 novembre 2026, sur la version locale **0.2.0**, dans le navigateur intégré de Codex, par HTTP local. Les attendus ci-dessus ont été écrits avant la modification.

| Type et comportement vérifié | Attendu | Observé | Statut |
| --- | --- | --- | --- |
| Automatisé, `tests/browser.html` | Contrôles existants de l’API et de l’écran, indicateur, saisie de trois couleurs via interface et API | 17 contrôles réussis, 0 échec | Réussi |
| Manuel assisté, commandes du jeu : démarrer, choisir rouge–bleu–vert, compléter par jaune | Indicateur 0/4, puis 3/4, puis 4/4 | Ces trois valeurs affichées dans cet ordre | Réussi |
| Manuel assisté, valider avec trois couleurs | Refus visible, 0 essai et historique vide | Message de refus, 0/10, historique vide | Réussi |
| Manuel assisté, compléter avec jaune et valider | 1 essai et une entrée dans l’historique | Compteur à 1/10, quatre couleurs et leurs indices visibles | Réussi |
| Automatisé, vider un choix et redémarrer | 3/4 après effacement, 0/4 après nouvelle partie | Valeurs conformes | Réussi |

Limite à cette étape : essais locaux sur ordinateur. Le téléphone réel restait non vérifié et le site n’était pas encore publié. La vérification ultérieure du site est consignée dans la section Publication. Les tests du moteur de 0.1.0 n’ont pas été relancés : `engine.js` et les règles n’ont pas changé. Cette étape est une amélioration d’interface, pas la correction d’un défaut inventé.

## Organisation et choix proposés par Codex

- HTML, CSS et JavaScript sans bibliothèque : pas d’installation pour jouer, chemins relatifs compatibles avec GitHub Pages.
- `engine.js` gère les règles et garde le secret dans une fermeture ; `app.js` relie ce même moteur aux commandes de l’écran et à l’API. Aucun second jeu pour les tests.
- Listes de couleurs natives, noms et abréviations pour rendre le jeu utilisable au clavier et ne pas dépendre uniquement des couleurs.

Ces choix et l’apparence sont des propositions de Codex à examiner par l’étudiant. Ils ne constituent pas une décision personnelle déjà justifiée par celui-ci. Codex a préparé l’implémentation et les vérifications ci-dessous ; l’étudiant doit essayer le jeu, comprendre les règles et expliquer ses propres décisions.

## API commune 0.2

Ouvrir `index.html?test=1` (ou l’URL publiée suivie de `?test=1`). `window.codeSecretTest` est exposé seulement dans ce mode. Au chargement, l’état est `not-started` et aucun secret imposé n’est conservé. `getConfig()` et `getState()` sont synchrones ; attendre les promesses de `startGame()` et `submitGuess()`.

```js
const api = window.codeSecretTest;
await api.startGame({ secret: ['rouge', 'rouge', 'bleu', 'vert'] });
const state = await api.submitGuess(['rouge', 'bleu', 'rouge', 'vert']);
// Attendu : 1 essai, 2 bien placées, 2 mal placées, état playing.
console.log(state);
```

Le secret n’apparaît pas dans l’état ni dans une révélation à l’écran. Les refus suivent les priorités du contrat. Un démarrage invalide rejette avec une Error et conserve l’état et l’écran précédents. Un refus de proposition renseigne seulement `lastError` et ne consomme pas d’essai.

## Vérifications réalisées

Résultats historiques : version **0.1.0**, conservée dans le commit local `fe4d7d7`, fichiers locaux testés le 11 novembre 2026. Ils ne sont pas présentés comme des tests rejoués sur 0.2.0. La vérification ultérieure du site publié figure dans la section Publication.

| Vérification et action | Attendu | Obtenu |
| --- | --- | --- |
| Tests du moteur : `npm test` avec Node.js | Configuration, T01–T09 du contrat, priorités des erreurs, refus sans mutation, lectures et entrées indépendantes, victoire au dixième, défaite et redémarrage | 16 tests réussis, 0 échec |
| Contrôle exhaustif des indices, inclus dans les 16 tests | Pour chaque couple secret/proposition, égalité avec un calcul indépendant par fréquences | 1 679 616 couples vérifiés, aucun écart |
| `tests/browser.html`, servi par HTTP local dans le navigateur intégré de Codex | API absente en mode normal ; API 0.2 en mode test ; état initial, synchronisation dans les deux sens, refus, victoire/défaite et remise à zéro | 10 vérifications réussies, 0 échec |
| Code imposé rouge–rouge–bleu–vert ; proposition rouge–bleu–rouge–vert via API | 1 essai, 2 bien placées, 2 mal placées, même historique visible | Valeurs et écran conformes dans le navigateur local |
| Saisie manuelle incomplète puis proposition complète dans les listes | Message clair sans essai, puis un essai dans l’historique | Observé dans le navigateur local |
| Touches Entrée, Début et flèches dans les commandes | Démarrer, composer et valider sans souris | Une proposition de quatre rouges validée, compteur à 1, historique visible |
| Simulation d’une vue de 375 × 812 pixels | Aucun débordement horizontal | Largeur du contenu 360 pixels avec barre de défilement, largeur disponible 375 pixels |

Pour reproduire les tests du moteur, installer Node.js puis exécuter `npm test` dans ce dossier ; aucune dépendance à installer. Le dernier test exhaustif peut prendre quelques dizaines de secondes. Pour les tests du navigateur, servir le dossier avec un serveur HTTP local, puis ouvrir `/tests/browser.html`. Cette page teste le vrai jeu dans une fenêtre intégrée et affiche ses résultats ; elle n’est pas l’outil enseignant.

### Corrections et limites

Aucun défaut fonctionnel du jeu n’a été constaté pendant ces vérifications ; aucune correction avant/après n’est donc revendiquée. Si cela reste le cas, demander à l’enseignant quelle preuve adaptée présenter. En cas de défaut rencontré ensuite, consigner le même essai avant et après sa correction.

- Essai sur **smartphone réel** : à faire ; noter l’appareil, le navigateur, l’action et le résultat. La simulation ci-dessus ne le remplace pas.
- Version publiée : les 17 contrôles du navigateur ont été exécutés avec succès, y compris la présence de l’API avec `test=1` et son absence en mode normal. Cela ne remplace pas l’essai sur smartphone réel.
- Accessibilité : commandes natives et vérification clavier effectuée ; essai avec un lecteur d’écran non réalisé.
- Retour après essai du jeu d’un camarade : à compléter par l’étudiant.
- La partie n’est pas conservée après actualisation. PWA et hors-ligne non prévus pour cette première version.
- La réussite des tests ne prouve pas l’absence de tout défaut et ne préjuge pas de l’évaluation.

## Publication et remises à préparer

Les fichiers du jeu sont publiés à la racine du dépôt, sur `main`. GitHub Pages est activé sur `main`, dossier `/ (root)`. Jeu accessible : https://natlapathai.github.io/code_secret/.

**Vérification de publication du 11 novembre 2026.** Version du jeu **0.2.0**, commit GitHub `397c63d70d49c59a98d4e0e7c431abd01fb8b691`, navigateur intégré de Codex sur ordinateur. L’accueil et les fichiers de style et de script se chargent. Les tests automatisés de https://natlapathai.github.io/code_secret/tests/browser.html ont donné **17 vérifications réussies, 0 échec**. Attendu : configuration et état initial corrects, API absente sans `test=1`, présente avec ce paramètre, indicateur et écran synchronisés, refus sans essai, victoire et défaite, redémarrage. Obtenu : tous ces contrôles réussis. Ce résultat n’atteste ni d’un essai personnel de l’étudiant ni d’un essai sur téléphone. La mise à jour de documentation qui suit ce commit ne modifie pas le jeu.

J1 : **20 novembre 2026 au soir**, tag `jalon-1`. J2 : **18 décembre 2026 au soir**, tag `final`, API fonctionnelle, README complété et capsule individuelle de 4 à 5 minutes sur Cyberlearn. Les horaires précis relèvent de Cyberlearn. Aucun tag de remise n’a encore été créé.

Les documents Word de remise doivent donner les liens du dépôt, du jeu et le tag. La vidéo, les conversations et les données personnelles restent hors du dépôt public. Ces étapes de remise sont à réaliser par l’étudiant ; elles ne sont pas accomplies par la création de cette première version.
