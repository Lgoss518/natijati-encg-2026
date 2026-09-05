# Avancement de l'étude

## Vérification ENSA / ENSAM — 23 août 2026

- La campagne ENSA 2026 confirme que les candidats encore en attente après la phase du 4 août doivent consulter Cursussup le 9 septembre 2026. Cette date est donc affichée pour ENSA seulement, sans la généraliser à ENSAM ou Santé.
- ENSA Safi a publié en septembre 2025 une liste régionale d'attente 3 avec 25 admis, atteignant le rang 70, puis une liste régionale d'attente 5 avec 40 admis, atteignant le rang 300. Ces jalons sont vérifiés, mais les rangs régionaux ne sont pas directement comparables aux rangs nationaux Cursussup.
- L'archive ENSAM 2025 décrit explicitement la comparaison entre les fichiers du 25 juillet et du 4 août : les candidats présents dans le premier et absents du second ont été admis. Les six fichiers Google Drive liés ne sont plus disponibles ou renvoient 404 ; aucun volume de mouvement par ville n'est donc publié dans le simulateur.
- Règle produit : l'existence et le calendrier d'un mouvement peuvent être affichés ; une probabilité numérique reste masquée tant que deux instantanés comparables au niveau candidat ne peuvent pas être rétrovérifiés.

## 2026-08-23

- Registre de sources créé pour ENCG, ENSA, ENSAM, FMP/FMD, FST et EST.
- Deux PDF FMPD du 04/08/2026 téléchargés et contrôlés.
- Médecine Rabat : 660 candidats encore classés; choix 1 = 563, choix 2 = 77, choix 3 = 20.
- Médecine Casablanca : 680 candidats encore classés; choix 1 = 550, choix 2 = 105, choix 3 = 25.
- Les PDF du 19/07/2026 liés par Tawjihnet ne sont plus téléchargeables directement (liens Google Drive renvoyant 404). Une copie miroir ou une source officielle reste à retrouver avant de calculer le mouvement exact entre les deux phases.
- La page Tawjihnet confirme que les candidats présents le 19/07 et absents le 04/08 ont reçu une proposition; la comparaison par Code Massar est donc la méthode correcte dès récupération des fichiers initiaux.

### Lot FMPD du 04/08/2026 terminé

- 24 listes PDF récupérées et analysées : 13 listes Médecine, 8 Pharmacie et 3 Dentaire, réparties sur les villes publiées par Tawjihnet. Certaines villes proposent plusieurs filières, d'où 24 combinaisons ville-filière.
- 6 940 lignes candidats extraites et validées; chaque liste possède des rangs continus et des Codes Massar uniques.
- Médecine : les listes courantes vont de 140 candidats (Guelmim) à 680 (Casablanca).
- Pharmacie : les listes courantes vont de 50 candidats (Laayoune) à 240 (Rabat).
- Dentaire : 90 candidats à Fès, 170 à Rabat et 190 à Casablanca.
- Les nombres ci-dessus représentent le stock restant en liste d'attente au 04/08, jamais le nombre de places ni le nombre d'admis.
- Le fichier `medicine_2026_snapshot.csv` contient la ventilation complète par ville, filière et ordre de choix.
- Le fichier `medicine_2026_candidates.csv` ajoute 6 907 identifiants Massar/CIN lisibles, avec ville, filière, rang et ordre de choix pour le snapshot du 04/08/2026. La recherche par Code Massar est ainsi disponible pour les 24 combinaisons publiées.
- La calibration santé documente 5 campagnes (2022 à 2026) et 12 dates de publication. Les 20 PDF encore lisibles de la vague du 08/09/2023 ont été extraits; les anciens liens supprimés servent uniquement à documenter le calendrier et ne sont pas présentés comme observations numériques.

### Archives historiques et contraintes de récupération

- Les 42 liens FMPD 2025 ont été indexés : 21 combinaisons ville-filière au 21/07/2025 et les mêmes 21 au 04/08/2025. Le manifeste `medicine_2025_manifest.csv` conserve la date, la ville, la filière et l'identifiant Google Drive de chaque document.
- Tawjihnet confirme explicitement que l'absence d'un candidat au 04/08/2025 alors qu'il figurait au 21/07/2025 signifie qu'il a reçu une proposition selon le mérite. C'est donc une vérité terrain exploitable pour le backtest.
- Les fichiers Google Drive 2025 sont désormais bloqués par Google pour non-respect de ses conditions et renvoient 404, y compris depuis une session navigateur. Les identifiants restent conservés afin de retrouver des copies miroir ou officielles sans perdre la correspondance.
- L'archive FMPD 2024 a été cartographiée : listes du 05/08, du 03/09 et du 13/09, puis certaines itérations 4 en décembre. Les identifiants des 40 PDF des phases 03/09 et 13/09 ont été retrouvés; leur disponibilité doit encore être testée ou remplacée par des copies officielles.

### Cadre confirmé pour les autres réseaux

- ENSA 2026 : la première liste d'attente est datée du 04/08 et la consultation annoncée pour les résultats définitifs est le 09/09/2026. Le modèle ENSA doit donc prendre le rang courant du 04/08 comme référence, conformément au besoin produit.
- ENSA 2025 : liste d'attente 1 le 04/08 puis résultats définitifs début septembre; plusieurs écoles ont ensuite publié des listes complémentaires jusqu'à fin septembre.
- ENSAM 2025 : listes d'attente initiales publiées le 25/07 pour Casablanca, Meknès et Rabat; première affectation/amélioration du 05 au 07/08.
- FST/EST 2025 : phase principale le 01/09, phase 2 le 12/09, puis listes complémentaires locales. Les données ne sont pas homogènes entre établissements; le modèle devra être calibré par établissement et filière, sans appliquer un cutoff national unique.

### FST / EST 2026 : données officielles structurées

- Les 20 images des notes ministérielles 02/0136 (EST) et 02/0139 (FST), datées du 24/07/2026, ont été récupérées pour contrôle visuel.
- Formule officielle commune : `score = (0,75 × note nationale + 0,25 × note régionale) × facteur de pondération`.
- FST : 11 450 places en première année, contre 11 170 en 2025 et 10 750 en 2024. La ventilation exacte par ville et tronc commun est enregistrée dans `fst_2026_seats.csv`; les totaux par ligne et colonne ont été contrôlés.
- FST : huit troncs communs (GB, GEG, GMSI, GP, MSD, GI, GESE et GC). Les facteurs officiels des principales séries générales et technologiques sont enregistrés dans `fst_2026_weighting.csv`. Les baccalauréats professionnels autorisés seront ajoutés séparément pour éviter de confondre les intitulés très spécifiques.
- FST : le Génie Informatique représente 2 480 places, soit le plus grand contingent; GMSI est le plus petit tronc national avec 810 places. La disponibilité varie fortement selon la ville : un modèle national unique serait donc incorrect.
- EST : 14 015 places en 2026, contre 13 450 en 2025 et 12 800 en 2024. La note ministérielle contient la ventilation par établissement et filière; sa transcription structurée est en cours.
- Calendrier officiel FST/EST 2026 : liste principale le 31/08, inscriptions du 02 au 04/09, amélioration et liste d'attente 1 le 07/09, inscriptions de cette phase du 08 au 10/09.
- ENSAM 2026 : la page publique confirme la liste principale du 27/07 et la liste d'attente 1 du 04/08, mais ne publie pas les PDF de rangs. Le rang saisi par l'utilisateur restera donc la donnée courante de référence; la calibration historique aura une incertitude supérieure à ENCG tant que les listes 2026 ne sont pas récupérées.

### EST 2026 : capacité et pondération

- La capacité officielle de 14 015 places a été transcrite pour les 22 EST dans `est_2026_capacity_by_city.csv`; la somme des établissements a été recalculée et correspond exactement au total ministériel.
- Les deux pages complètes de l'annexe 2 sur la pondération ont été récupérées. Huit familles de filières ont été identifiées : management, informatique, électrique/industriel, mécanique, environnement/procédés/mines, agro/biologie, génie civil et instrumentation.
- Les coefficients par série de bac et famille sont structurés dans `est_2026_weighting_groups.csv`. Exemples contrôlés : filières informatiques = 1,5 pour SMA/SMB et 1,3 pour PC; filières électriques/industrielles = 1,5 pour STE, 1,4 pour STM/SMA/SMB et 1,3 pour PC; filières agro/biologie = 1,4 pour PC et 1,2 pour SVT/agricole.
- La prochaine sous-étape consiste à rattacher chaque intitulé exact des nombreuses filières EST à sa famille de pondération, puis à transcrire les places par filière et ville. Ce rattachement sera vérifié par somme contre la capacité de chaque établissement.
- Une recherche ciblée des seuils 2025 n'a pas trouvé de tableau national officiel : Cursussup communique les propositions dans l'espace personnel et les établissements publient surtout les procédures/listes d'inscription. Il ne faudra donc pas présenter des « seuils nationaux » inventés. Les seuils historiques devront être reconstruits à partir des derniers admis/listes locales, ou alimentés par des résultats utilisateurs vérifiés.

### Catalogue EST 2026 terminé

- Les 185 combinaisons établissement-filière ont été transcrites dans `est_2026_programs.csv`, avec le nombre de places et la famille de pondération correspondante.
- Contrôle d'intégrité réussi : chaque somme par établissement correspond à la note ministérielle et le total des 185 lignes est exactement 14 015.
- Répartition utile pour le modèle : informatique = 4 448 places; management = 3 923; électrique/industriel = 2 309; agro/biologie = 1 501; environnement/procédés/mines = 923; génie civil = 424; mécanique = 347; instrumentation = 140.
- Le calculateur peut désormais appliquer automatiquement le bon facteur à partir du bac et de la filière, puis utiliser la capacité exacte du couple ville-filière. Il manque encore les distributions de scores/cutoffs historiques pour transformer ce score en probabilité calibrée.

### Comparaison FST 2025–2026

- La répartition officielle 2025 (11 170 places) a été structurée et validée dans `fst_2025_seats.csv`.
- L'augmentation 2026 est de 280 places (+2,51 %), mais elle est très concentrée : GI +200 (+8,77 %), GMSI +30 (+3,85 %), MSD +30 (+2,86 %) et GESE +20 (+1,77 %). GB, GEG, GP et GC restent stables.
- Deux nouvelles implantations apparaissent dans la ventilation 2026 : Taourirt (100 places GI) et Guelmim (120 GI + 60 MSD). En parallèle, Settat GI passe de 460 à 440, Fès MSD de 150 à 100, tandis que Fès GMSI passe de 220 à 250 et GESE de 110 à 130.
- Conséquence modèle : une amélioration globale uniforme serait incorrecte. L'effet capacité doit être appliqué au couple ville-filière; la pression pourrait diminuer davantage pour GI à Guelmim/Taourirt, tout en pouvant rester stable ou augmenter à Settat.

### Comparaison des capacités EST 2025–2026

- La note ministérielle EST 2025 (02/0283 du 25/07/2025) a été récupérée sous forme d'images et contrôlée visuellement. Les capacités des 20 établissements sont structurées dans `est_2025_capacity_by_city.csv`; leur somme est exactement 13 450.
- En 2026, le réseau passe à 14 015 places, soit +565 places (+4,20 %). Deux nouveaux établissements apparaissent dans la ventilation : Al Hoceima (120) et Taounate (40).
- À périmètre ancien, les plus fortes hausses sont Laayoune +100 (+17,86 %), Dakhla +70 (+15,91 %), Kelaat Sraghna +60 (+13,33 %), Kenitra +45 (+9,00 %), Safi +40 (+6,45 %) et Meknes +40 (+4,00 %). Guelmim gagne 20 places, Ouarzazate 20 et Beni Mellal 10; onze établissements restent stables.
- Le détail comparatif est enregistré dans `est_2025_2026_capacity_change.csv`. Ces variations devront agir comme variable explicative, mais ne suffisent pas à elles seules à fixer un seuil : la hausse peut concerner une filière différente de celle demandée par l'utilisateur.
- La transcription 2025 par filière reste la prochaine vérification nécessaire afin de mesurer les hausses au niveau exact ville-filière, comme cela a déjà été fait pour les 185 combinaisons de 2026.

### Vérité terrain EST 2025 : places encore vacantes après la phase nationale

- La page récapitulative des résultats EST 2025 a livré 61 observations chiffrées de places vacantes par ville, filière et date. Elles sont structurées dans `est_2025_late_vacancies.csv` et ne doivent pas être confondues avec des capacités initiales ou des rangs de candidats.
- Le 22/09/2025, Fès annonçait 485 places encore vacantes sur les 11 filières chiffrées (47,5 % de la capacité totale de l'établissement) et Salé 209 sur l'ensemble de ses 13 filières (23,0 %). Le 23/09, Essaouira annonçait 142 places (28,4 %); le 24/09, Casablanca 373 places (40,5 %).
- Kénitra annonçait le 26/09 un total de 74 places sur cinq filières seulement, dont 24 en Technologies Agroalimentaires, puis encore 15 places dans cette même filière le 02/10. Fquih Ben Salah annonçait 91 places sur quatre filières le 27/09.
- À Salé, le total chiffré passe de 209 places le 22/09 à 159 le 01/10, mais certaines filières peuvent recréer des vacances entre deux appels (désistement, amélioration ou non-inscription). On ne peut donc pas assimiler mécaniquement la différence entre deux snapshots au nombre d'admis.
- Conclusion modèle : les listes complémentaires tardives constituent une composante majeure du mouvement EST. Une probabilité « finale » doit avoir un horizon explicite (prochaine liste, fin septembre ou clôture), et le modèle doit distinguer places initiales, places vacantes observées et nombre de candidats convoqués.

### Vérité terrain FST 2025 : places vacantes tardives

- Quinze observations chiffrées ont été structurées dans `fst_2025_late_vacancies.csv` pour Tanger et Al Hoceima. Elles proviennent des annonces de listes complémentaires publiées après la phase 2 nationale.
- Tanger annonçait encore 301 places vacantes le 25/09/2025 sur six troncs communs, soit 18,8 % de sa capacité annuelle de 1 600 places. Le Génie Informatique concentrait à lui seul 128 places vacantes sur une capacité initiale de 300 (42,7 %).
- Al Hoceima annonçait 87 places sur six troncs le 23/09, puis une seconde liste le 08/10 avec encore 46 places sur trois troncs. Comme pour EST, une nouvelle vacance peut apparaître après un appel; les snapshots successifs ne représentent donc pas un simple stock décroissant.
- Cette preuve invalide une estimation basée uniquement sur le taux de remplissage de la liste principale. Pour FST, le modèle devra produire séparément une chance pour la prochaine phase nationale et une chance finale incluant les appels locaux de fin septembre/octobre.

### Profondeur des listes EST Casablanca 2025

- Les huit listes d'attente initiales officielles de l'EST Casablanca ont été retrouvées et leurs derniers numéros d'ordre contrôlés. Le fichier `est_casablanca_2025_waitlist_depth.csv` rapproche la taille du vivier, la capacité initiale et les places encore vacantes annoncées le 24/09.
- Les viviers sont très différents selon la filière : Génie des Procédés 2 902 candidats, Génie Informatique 2 848, Génie Electrique 2 265, contre seulement 763 en Génie Mécanique et 210 en Gestion Financière et Comptable.
- La taille brute de la liste ne mesure pas le nombre de concurrents réels : les mêmes candidats figurent dans plusieurs filières et établissements. Exemple révélateur : malgré 2 848 personnes listées pour 139 places en Génie Informatique, 90 places étaient encore déclarées vacantes le 24/09. Cela confirme un taux massif de doublons, de choix préférés ailleurs et de non-confirmations.
- Conséquence modèle : `rang / capacité` serait extrêmement pessimiste. Il faut estimer un taux d'activation du vivier par filière et par phase, puis dédupliquer/pondérer avec l'ordre de choix lorsque cette information existe. La liste complète sert de bassin de risque, pas de file d'attente pure.

### Premier mouvement de rang reconstruit : EST Casablanca GI

- La liste officielle initiale de Génie Informatique (2 848 candidats) a été croisée par Code Massar avec la liste officielle des admis publiée après l'appel de fin septembre. Les 90 lignes d'admis contiennent 89 Codes Massar uniques (un doublon dans le PDF); les 89 ont tous été retrouvés dans la liste initiale.
- Les rangs initiaux des admis tardifs s'étendent de 24 à 1 451. Médiane : 680; percentile 75 : 1 100; percentile 90 : 1 322. Les statistiques non nominatives sont conservées dans `est_casablanca_gi_2025_late_admission_ranks.csv`.
- Comme 90 places étaient annoncées vacantes le 24/09, la liste a dû atteindre au minimum le rang 1 451 pour produire environ 90 admissions, soit au moins 16,12 positions explorées par place tardive. Ce ratio est un minimum observé, pas une constante transférable automatiquement aux autres filières.
- C'est une validation directe de l'hypothèse de forte attrition : un rang très supérieur à la capacité peut rester réellement compétitif. Pour le futur calculateur, la distribution observée des rangs admis est plus informative qu'un simple seuil binaire.

### Extension du croisement Casablanca à GE et GP

- Le même croisement par Code Massar a été réalisé pour Génie Electrique et Génie des Procédés. Les résultats comparables des trois filières sont regroupés dans `est_casablanca_2025_late_admission_rank_summary.csv`.
- Génie Electrique : 75 lignes d'admis (74 codes uniques), toutes retrouvées; rang médian 860, rang 90e percentile 1 509 et rang maximal observé 1 667.
- Génie des Procédés : 83 lignes (81 codes uniques), toutes retrouvées; rang médian 1 302, rang 90e percentile 1 700 et rang maximal 1 781.
- Pour remplir les vacances annoncées, les listes ont donc atteint au minimum 16,12 positions par place en GI, 22,23 en GE et 21,46 en GP. La variation entre filières justifie un paramètre d'attrition spécifique plutôt qu'un multiplicateur EST unique.
- Les doublons présents dans les PDF d'admis sont conservés comme anomalie source mais exclus des statistiques individuelles. Le calculateur ne devra jamais compter deux fois un même Code Massar.

### Backtest complet des huit filières EST Casablanca

- Les cinq dernières filières ont été croisées à leur tour; les huit filières de l'établissement sont maintenant couvertes par la même méthode reproductible.
- Génie Mécanique présente un mouvement beaucoup plus compact : 25 admis uniques, médiane 63 et maximum 162 pour 25 vacances. À l'opposé, Banque Finance Assurance atteint le rang 1 635, Management Digital des Organisations 1 519 et E-Business et Management 1 544.
- Gestion Financière et Comptable n'avait que deux vacances tardives; les deux admis étaient initialement classés aux rangs 10 et 16. Cet échantillon est trop petit pour calibrer une distribution robuste.
- Les ratios minimaux de positions explorées par place annoncée vont de 6,48 en Génie Mécanique à plus de 50 en MDO/EBM. Ce contraste confirme que la capacité seule ne prédit pas le mouvement; la popularité, les recouvrements de candidatures et le taux de présence diffèrent fortement par famille.
- Pour l'interface, une estimation devra afficher une largeur d'incertitude plus grande lorsque l'échantillon historique est faible (cas GFC) ou lorsque la liste d'admis publiée ne couvre pas toutes les vacances annoncées (BFA et EBM).

## Contrôles à appliquer

- Vérifier que les rangs sont continus et que chaque Code Massar est unique.
- Séparer chaque ville et chaque filière (Médecine, Pharmacie, Dentaire).
- Calculer le mouvement brut et le mouvement pondéré par ordre de choix.
- Ne publier aucun cutoff de prochaine liste avant comparaison avec au moins une phase antérieure ou une campagne historique complète.
# ENCG - snapshot du 5 septembre 2026

- Les 13 PDF Cursussup du 05/09/2026 ont été extraits intégralement : 61 836 lignes ville-candidat et 17 793 candidats uniques.
- La comparaison Code Massar avec le snapshot du 04/08/2026 identifie 8 568 disparitions de lignes dans les listes et 3 903 candidats uniques ayant disparu d'au moins une ville. Ces valeurs mesurent la mobilité dans chaque liste; elles ne sont pas des admissions propres à une école, car un candidat peut apparaître dans plusieurs ENCG et disparaître après une affectation ou une amélioration ailleurs.
- 1 701 codes présents le 04/08 ne figurent plus dans aucune des 13 listes du 05/09. La liste seule ne permet pas de séparer une affectation en choix 1 d'un retrait ou d'une sortie de procédure.
- Les rangs et choix du 05/09 remplacent désormais ceux du 04/08 dans la recherche publique Code Massar.
- Les horizons du 09/09 ont été recalibrés en traduisant les anciens rangs cibles dans le nouveau classement, puis complétés par le mouvement national observé entre les itérations 2 et 3 de 2025, réparti selon les capacités et la composition actuelle des choix.
