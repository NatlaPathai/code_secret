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

Ouvrir la [page publique de vérification](https://natlapathai.github.io/code_secret/tests/browser.html) et attendre le bilan. Elle teste le vrai jeu affiché dans une fenêtre intégrée, avec sa propre API. Les contrôles ont été rejoués le **14 novembre 2026** sur la version **0.4.0** publiée : **76 contrôles réussis, 0 échec**, dans le navigateur intégré de Codex sur ordinateur. La version du dépôt consultée était [545b92a](https://github.com/NatlaPathai/code_secret/commit/545b92a2e1abd17f8ea3932a7fb1931fdf21dc48).

Ces contrôles couvrent les exemples du contrat, les répétitions, les refus et leur priorité, la victoire au dixième essai, la défaite, le redémarrage et la concordance entre l’API et l’écran. Les [résultats détaillés et leur historique](docs/VERIFICATIONS.md) conservent les observations et versions précédentes. Voici trois vérifications reproductibles, réussies lors de cette exécution du 14 novembre :

| Action, sur la version 0.4.0 | Attendu | Obtenu |
| --- | --- | --- |
| Imposer rouge–rouge–bleu–vert, puis proposer rouge–bleu–rouge–vert | 2 bien placées, 2 mal placées, 1 essai ; mêmes indices à l’écran | Conforme dans l’API et l’historique visible |
| Pendant une partie, envoyer un tableau de trois couleurs | Refus invalid-length ; compteur et historique conservés | Code attendu, aucun essai consommé |
| Imposer quatre rouges, jouer neuf fois quatre bleus, puis quatre rouges | Victoire au dixième essai, dix lignes dans l’historique | État won, compteur à 10, résultat 4/0 et message de victoire |

Ces observations proviennent de tests automatisés exécutés par Codex. Elles sont distinguées des essais personnels du joueur et ne remplacent pas un essai sur téléphone réel.

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

### Mon essai sur un smartphone réel

J’ai essayé le jeu sur un **Fairphone 6 sous Android**, avec **Firefox pour Android**. J’ai soumis des propositions complètes ainsi qu’une proposition incomplète ne contenant qu’une couleur. J’ai également terminé une partie par une victoire, une autre par une défaite, puis essayé de relancer le jeu. **Je n’ai rencontré aucun problème pendant ces essais.**

| Action essayée | Comportement attendu | Retour de mon essai |
| --- | --- | --- |
| Composer et soumettre des propositions complètes | Pouvoir choisir les couleurs et jouer | Aucun problème rencontré |
| Soumettre une proposition d’une seule couleur | Refus sans essai consommé | Aucune anomalie signalée ; le message et le compteur ne sont pas précisés séparément dans mon retour |
| Gagner, perdre et relancer le jeu | Reconnaître la fin de partie et pouvoir recommencer | Victoire, défaite et relance essayées sans problème |

Ce retour personnel a été communiqué le **14 novembre 2026**. La date exacte de l’essai, le numéro de version affiché et les versions d’Android et de Firefox ne sont pas précisés dans ce retour. Il s’agit de mon observation sur téléphone, distincte des tests automatisés exécutés par Codex ; elle ne prouve pas que toutes les situations possibles ont été couvertes.

## Ma démarche avec Codex

J’ai fourni les consignes du projet, le contrat de l’API et les critères d’évaluation. J’ai confié à Codex la préparation du jeu, l’implémentation, les tests techniques et une première rédaction de la documentation. J’ai ensuite demandé des changements ciblés : rendre les couleurs plus visibles, remplacer les listes déroulantes par des boutons et réorganiser le plateau. J’ai également demandé une vérification de l’API en ligne, une comparaison aux critères d’évaluation et une refonte du README.

J’ai demandé de remplacer les listes déroulantes par une sélection **emplacement puis couleur** pour rendre le choix plus ergonomique et plus visuel. Les pastilles et les boutons permettent de voir directement les couleurs proposées. L’emplacement reste actif après un choix, ce qui permet de le modifier.

J’ai aussi demandé de placer les règles au-dessus du jeu, les essais à gauche et la proposition à droite pour mieux visualiser les propositions déjà soumises. Ces changements portent sur l’ergonomie ; ils ne modifient pas les règles communes.

Codex a proposé et réalisé l’implémentation en HTML, CSS et JavaScript sans bibliothèque. L’interface et l’API commandent le même moteur ; les tests ne disposent pas d’un second jeu indépendant. Ces choix techniques viennent de sa proposition ; les demandes de modification de l’interface viennent de moi.

### Mon retour après essai du jeu d’un camarade

J’ai essayé le jeu d’un camarade et je n’ai pas rencontré de problème de fonctionnement pendant cet essai. Il manquait notamment un indicateur du nombre de couleurs déjà sélectionnées pour la proposition. Cela ne gênait pas particulièrement la jouabilité. Mon jeu affiche ce nombre sous la forme 0/4 à 4/4 pour aider à repérer les choix restant à remplir.

## Limites et activités à compléter

Les vérifications réalisées ne prouvent pas l’absence de tout défaut. Mon essai sur smartphone, mes choix d’ergonomie et mon retour sur le jeu d’un camarade sont décrits ci-dessus. La date exacte et le numéro de la version essayée sur téléphone restent à préciser pour rattacher ce retour à une version identifiée.

Un essai avec lecteur d’écran et une vérification dans un second navigateur sur ordinateur restent non réalisés. Firefox sur téléphone a bien été essayé, comme indiqué ci-dessus. Les contrôles complémentaires ne constituent pas des exigences supplémentaires ajoutées aux critères d’évaluation.

Je n’ai rencontré aucun problème lors de mes essais de mon propre jeu. Aucun défaut fonctionnel nécessitant une correction du moteur n’a non plus été constaté lors de l’audit de l’API par Codex. Un contrôle susceptible de produire un faux positif a été renforcé dans les tests ; le détail figure dans l’historique. Il reste à clarifier avec l’enseignant la preuve adaptée pour l’exigence de correction, si aucun défaut du jeu n’est rencontré. Aucune correction de jeu fictive n’est revendiquée.

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

Pour la remise : J1 le **20 novembre 2026** avec le tag jalon-1 ; J2 le **18 décembre 2026** avec le tag final. Les horaires précis sont sur Cyberlearn. Les tags de remise, le document de liens et la vidéo restent à préparer ; les observations personnelles doivent correspondre à la version effectivement remise.

## Aide et suivi

Projet individuel porté par le compte GitHub [NatlaPathai](https://github.com/NatlaPathai). Pour signaler un problème, ouvrir une [issue dans le dépôt](https://github.com/NatlaPathai/code_secret/issues) en précisant le navigateur, les étapes, le résultat attendu et le résultat observé. Pour une question sur l’évaluation, s’adresser à l’enseignant.

Avant de modifier le code, lire AGENTS.md, limiter le changement à un objectif précis, puis vérifier le comportement concerné. Garder les conversations, vidéos, données personnelles et secrets d’accès hors du dépôt public.
