# Code secret en couleurs

Jeu de logique solo inspiré du Mastermind : retrouvez un code de quatre couleurs en dix essais. Ce projet individuel a été développé avec Codex dans le cadre d’un atelier de co-conception et de vérification de logiciel.

**[Jouer en ligne](https://natlapathai.github.io/code_secret/)** · [Dépôt GitHub](https://github.com/NatlaPathai/code_secret) · [Vérifier le jeu et l’API](https://natlapathai.github.io/code_secret/tests/browser.html)

## État actuel

La version du jeu est **0.4.0** et son interface de test (API), qui permet de piloter la partie depuis le navigateur, suit le contrat **0.2**. Ces deux numéros désignent des choses différentes. Le jeu est publié sur GitHub Pages et fonctionne sans compte utilisateur ni serveur applicatif.

Les règles apparaissent au-dessus du plateau. Sur ordinateur, les essais sont à gauche et la proposition à droite. Sur petit écran, la composition passe au-dessus de l’historique. Les couleurs portent aussi un nom et une abréviation.

La partie est perdue lors de l’actualisation de la page. Le fonctionnement hors ligne, l’installation comme application et les bonus du robot et de la démonstration avec code imposé dans l’interface ne sont pas disponibles. Les deux bonus ont été reportés à la demande de l’utilisateur.

## Commencer

Pour jouer en ligne, aucune installation n’est nécessaire :

1. Ouvrir le [jeu publié](https://natlapathai.github.io/code_secret/) dans un navigateur avec JavaScript activé.
2. Choisir **Commencer une partie**.
3. Cliquer sur un emplacement, puis sur un des six boutons de couleur. Répéter pour remplir les quatre positions.
4. Choisir **Valider la proposition**, puis utiliser les indices pour préparer l’essai suivant.

Pour modifier une couleur, sélectionner son emplacement à nouveau. **Effacer cet emplacement** le vide ; **Nouvelle partie** efface toute la partie et tire un nouveau code.

Au clavier : **Tab** parcourt les commandes, **Entrée** ou **Espace** active un bouton. Sur les emplacements, les flèches gauche/droite, **Début** et **Fin** déplacent la sélection.

Pour jouer avec une copie du dépôt sur son ordinateur, ouvrir [index.html](index.html) dans le navigateur. Une adresse commençant par localhost désigne un service sur l’ordinateur du lecteur et ne remplace pas le lien public ci-dessus.

## Règles et exemple

Le code contient quatre couleurs ordonnées parmi **rouge, bleu, vert, jaune, orange et violet**. Les répétitions sont autorisées. Il reste fixe et caché pendant la partie.

- Une couleur **bien placée** a la bonne couleur et la bonne position.
- Une couleur **mal placée** est présente dans le code à une autre position.

Chaque pion compte une seule fois : les bien placés d’abord, puis les mal placés parmi les occurrences restantes. Les indices ne désignent pas les positions concernées. Une proposition incomplète est refusée sans consommer d’essai ni modifier l’historique.

**Exemple :** pour un code rouge–rouge–bleu–vert, la proposition rouge–bleu–rouge–vert donne **2 bien placées et 2 mal placées**. Proposer quatre rouges donne **2 bien placées et 0 mal placée**.

Trouver les quatre positions donne la victoire, même au dixième essai. Après dix propositions non gagnantes, la partie est perdue. Les commandes ne permettent plus d’ajouter un essai après la fin.

## Vérifier le résultat

### Contrôles dans le navigateur

Ouvrir la [page publique de vérification](https://natlapathai.github.io/code_secret/tests/browser.html) et attendre le bilan. Elle teste le vrai jeu affiché dans une fenêtre intégrée, avec sa propre API. Le dernier résultat observé pour la version 0.4.0, le **11 novembre 2026**, est de **76 contrôles réussis, 0 échec**, dans le navigateur intégré de Codex sur ordinateur, sur le commit [e03edbb](https://github.com/NatlaPathai/code_secret/commit/e03edbb4380132a629847e9503bbfa5e9c378b89).

Ces contrôles couvrent les exemples du contrat, les répétitions, les refus et leur priorité, la victoire au dixième essai, la défaite, le redémarrage et la concordance entre l’API et l’écran. Les [résultats détaillés et leur historique](docs/VERIFICATIONS.md) conservent les attendus, observations, versions et limites. La refonte documentaire du 14 novembre ne constitue pas une nouvelle exécution de ces contrôles dans le navigateur.

### Tests du moteur sur ordinateur

Node.js est nécessaire uniquement pour ces tests. Depuis le dossier du projet :

```sh
node --test tests/engine.test.js
```

Aucune bibliothèque supplémentaire n’est nécessaire. Le test exhaustif peut prendre quelques dizaines de secondes. La commande a été exécutée depuis le dossier du projet le **14 novembre 2026** : **16 tests réussis, aucun échec**, dont les 1 679 616 couples secret/proposition du contrôle exhaustif. Le détail est consigné dans l’historique.

### Essai manuel de l’API

L’API est un ensemble de fonctions JavaScript utilisables dans la console du navigateur. Ouvrir le [jeu avec le mode test](https://natlapathai.github.io/code_secret/?test=1), puis exécuter les appels un à un :

```js
const api = window.codeSecretTest;
await api.startGame({ secret: ["rouge", "rouge", "bleu", "vert"] });
const etat = await api.submitGuess(["rouge", "bleu", "rouge", "vert"]);
console.log(etat);
```

Attendu : un essai, état playing, résultat wellPlaced: 2 et misplaced: 2, avec la même proposition et les mêmes indices visibles à l’écran. getConfig() et getState() sont synchrones ; startGame() et submitGuess() renvoient des promesses, à attendre avec await. Sans test=1, window.codeSecretTest n’est pas exposé. Le secret ne figure pas dans l’état retourné.

## Choix de conception et points à vérifier

À la demande de l’utilisateur, les listes déroulantes ont été remplacées par une sélection **emplacement puis couleur**. L’emplacement reste actif après un choix. La disposition règles en haut, essais à gauche et proposition à droite répond aussi à sa demande.

Codex a proposé et réalisé l’implémentation en HTML, CSS et JavaScript sans bibliothèque. L’interface et l’API commandent le même moteur ; les tests ne disposent pas d’un second jeu indépendant. Ces décisions doivent pouvoir être expliquées par l’étudiant.

Les vérifications réalisées ne prouvent pas l’absence de tout défaut. Restent à documenter :

- un essai sur un **smartphone réel**, avec appareil, navigateur et résultat ; la simulation à 375 pixels ne le remplace pas ;
- un essai avec lecteur d’écran et une vérification dans un second navigateur ;
- le retour après essai du jeu d’un camarade et l’appréciation personnelle de l’ergonomie.

Aucun défaut fonctionnel nécessitant une correction du moteur n’a été constaté lors de l’audit de l’API. Un contrôle susceptible de produire un faux positif a été renforcé dans les tests ; le détail figure dans l’historique. Aucune correction de jeu fictive n’est revendiquée.

## Se repérer et reprendre le projet

| Fichier | Rôle |
| --- | --- |
| [index.html](index.html) et [styles.css](styles.css) | Structure et présentation du jeu |
| [app.js](app.js) | Commandes de l’interface et exposition de l’API |
| [engine.js](engine.js) | Règles, état de la partie et calcul des indices |
| [tests/browser.html](tests/browser.html) et [tests/contract-checks.js](tests/contract-checks.js) | Contrôles du jeu et de l’API dans le navigateur |
| [tests/engine.test.js](tests/engine.test.js) | Tests du moteur, dont le comptage exhaustif des indices |
| [AGENTS.md](AGENTS.md) | Consignes durables pour travailler avec Codex |
| [docs/VERIFICATIONS.md](docs/VERIFICATIONS.md) | Historique des choix et preuves de vérification |

Sources pédagogiques fournies : *Projet — Code secret en couleurs*, édition 2.2, annexe **code-couleurs-1.0** ; *API commune de test*, contrat **0.2**, édition Google 1.5 ; *Évaluation du projet*, version 1.3 ; *Atelier 4 du 11 novembre 2026*, édition 1.25. Les documents pédagogiques ne sont pas publiés dans ce dépôt. L’énoncé et le contrat définissent les règles communes.

Pour la remise : J1 le **20 novembre 2026** avec le tag jalon-1 ; J2 le **18 décembre 2026** avec le tag final. Les horaires précis sont sur Cyberlearn. Les tags de remise, le document de liens, la vidéo et les preuves personnelles restent à préparer.

## Aide et suivi

Projet individuel porté par le compte GitHub [NatlaPathai](https://github.com/NatlaPathai). Pour signaler un problème, ouvrir une [issue dans le dépôt](https://github.com/NatlaPathai/code_secret/issues) en précisant le navigateur, les étapes, le résultat attendu et le résultat observé. Pour une question sur l’évaluation, s’adresser à l’enseignant.

Avant de modifier le code, lire AGENTS.md, limiter le changement à un objectif précis, puis vérifier le comportement concerné. Garder les conversations, vidéos, données personnelles et secrets d’accès hors du dépôt public.
