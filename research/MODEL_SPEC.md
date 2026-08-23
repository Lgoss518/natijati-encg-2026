# Spécification des moteurs d'estimation

## Principe général

La plateforme ne doit jamais présenter une probabilité comme officielle. Chaque résultat doit contenir :

- un horizon explicite (`prochaine_liste`, `fin_septembre`, `final`);
- trois scénarios (prudent, central, optimiste);
- un niveau de confiance fondé sur la quantité et la qualité des observations;
- la date et la version du jeu de données;
- une explication courte des variables qui ont le plus influencé le résultat.

Les réseaux ne partagent pas le même processus d'admission. Deux moteurs séparés sont donc nécessaires.

## Moteur A — rang et mouvement de liste

Réseaux concernés : ENCG, ENSA, ENSAM, Médecine, Pharmacie et Médecine dentaire.

### Entrées

- réseau;
- ville;
- filière lorsque le réseau en possède plusieurs;
- phase et date de la liste de référence;
- rang courant;
- ordre du choix lorsqu'il est publié;
- Code Massar facultatif pour retrouver automatiquement le rang.

### Variables historiques

- capacité initiale;
- stock de candidats de la liste courante;
- nombre de candidats devant l'utilisateur;
- concurrents pondérés par ordre de choix;
- mouvement observé entre deux phases comparables;
- places vacantes annoncées;
- profondeur des appels complémentaires;
- variation de capacité entre campagnes;
- calendrier restant avant clôture.

### Sorties

- probabilité de proposition à la prochaine phase;
- probabilité avant fin septembre;
- probabilité finale;
- rang prudent, central et optimiste atteint;
- concurrents bruts et concurrents pondérés;
- conseil opérationnel lié au prochain délai.

### Calibration

Le modèle doit être calibré par réseau, puis par ville/filière lorsque les données le permettent. Un multiplicateur national unique est interdit. Les distributions empiriques de rangs admis sont prioritaires sur les seuils déclaratifs.

## Moteur B — score pondéré avant publication des listes

Réseaux concernés : FST et EST.

### Entrées

- réseau;
- année du baccalauréat;
- série du baccalauréat;
- note nationale;
- note régionale;
- ville;
- tronc commun ou filière.

### Score officiel

`score_base = 0,75 × note_nationale + 0,25 × note_régionale`

`score_pondéré = score_base × coefficient(série, famille_de_filière)`

Le coefficient doit provenir uniquement de la note ministérielle de la campagne concernée.

### Sorties avant liste principale

- score de base et score pondéré;
- coefficient appliqué et justification;
- capacité exacte ville-filière;
- chance liste principale;
- chance liste 2 / attente;
- chance finale incluant les appels locaux;
- niveau de confiance.

### Limite actuelle

Les notes ministérielles donnent la formule, les coefficients et les capacités, mais pas un seuil national chiffré par filière. Une probabilité de liste principale ne peut être publiée qu'après reconstruction de distributions historiques de derniers admis ou collecte de résultats utilisateurs vérifiés.

## Niveaux de confiance

- `élevé` : au moins deux campagnes comparables ou plusieurs phases reliées par Code Massar, échantillon suffisant et source officielle;
- `moyen` : une campagne complète avec mouvement vérifié;
- `exploratoire` : capacité et calendrier vérifiés mais cutoff historique incomplet;
- `indisponible` : données insuffisantes pour produire une probabilité honnête.

Le site peut calculer et afficher le score officiel lorsque la confiance probabiliste est exploratoire, mais doit remplacer le pourcentage par une fourchette qualitative jusqu'à validation.

## Protection contre les faux résultats

- ne jamais transformer arbitrairement un rang en pourcentage;
- ne jamais interpréter la longueur totale d'une liste comme le nombre de concurrents actifs;
- dédupliquer les Codes Massar;
- ne pas additionner des snapshots successifs de places vacantes;
- distinguer candidats convoqués, admis, inscrits et places vacantes;
- signaler les doublons et lignes illisibles dans les sources;
- conserver la version du modèle utilisée pour chaque simulation enregistrée.

## Schéma de données minimal

Chaque observation historique doit inclure :

`campaign, network, city, program, phase, snapshot_date, metric, value, source_type, source_url, verified_at`

Chaque configuration publiée doit inclure :

`model_version, data_version, horizon, low, central, high, confidence, sample_size, updated_at`

## État d'intégration recommandé

- ENCG : moteur actuel conservé, puis recalibré avec les phases complètes disponibles;
- EST : score officiel activable; probabilité finale en calibration avec les appels 2025 reconstruits;
- FST : score officiel activable; probabilité finale en calibration avec les vacances tardives 2025;
- ENSA, ENSAM et santé : formulaire rang prêt après consolidation des listes historiques;
- aucun nouveau pourcentage ne doit passer en production avant un backtest documenté.
