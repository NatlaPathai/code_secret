# Consignes pour travailler sur Code secret

- Lire `README.md` avant de modifier le projet. Les règles communes et le contrat API 0.2 cités dans ses sources font référence. Si un document est inaccessible ou ambigu, le signaler sans inventer de règle.
- Examiner l’existant et limiter chaque étape à la demande en cours. Distinguer règles imposées, choix proposés et questions ouvertes. Les bonus du cours sont facultatifs.
- Si le message de l’utilisateur se termine par `??`, reformuler brièvement la demande et attendre son `GO`. Sinon, avancer dans le périmètre demandé.
- Écrire le résultat attendu avant une modification de comportement. Conserver un seul moteur pour l’interface et l’API ; ne jamais exposer le secret dans l’état de l’API ou un affichage de solution.
- Vérifier le comportement modifié et un cas valide. Pour les règles du moteur, lancer `npm test`. Pour l’interface ou l’API, servir ce dossier par HTTP, ouvrir `tests/browser.html`, puis essayer les commandes concernées dans le vrai jeu. Une simulation mobile ne remplace pas un smartphone réel.
- Rapporter les résultats réellement observés avec attendu, obtenu, type de test, version et limites. Distinguer les contrôles réussis, échoués et non vérifiés. Pour une correction, conserver le même essai avant/après ; ne pas créer artificiellement un défaut.
- Mettre à jour le README et retirer les indications périmées. Faire un commit local pour chaque changement important vérifié. Ne pas publier, pousser sur GitHub, créer un tag de remise ou déposer sur Cyberlearn sans demande de l’utilisateur.
- Garder conversations, vidéos, pièces jointes pédagogiques, données personnelles et secrets d’accès hors du dépôt public. Le jeu fonctionne sans serveur applicatif, compte ni service d’IA.
