# Avancement de l'étude

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

## Contrôles à appliquer

- Vérifier que les rangs sont continus et que chaque Code Massar est unique.
- Séparer chaque ville et chaque filière (Médecine, Pharmacie, Dentaire).
- Calculer le mouvement brut et le mouvement pondéré par ordre de choix.
- Ne publier aucun cutoff de prochaine liste avant comparaison avec au moins une phase antérieure ou une campagne historique complète.
