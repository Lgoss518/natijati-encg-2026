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

## Contrôles à appliquer

- Vérifier que les rangs sont continus et que chaque Code Massar est unique.
- Séparer chaque ville et chaque filière (Médecine, Pharmacie, Dentaire).
- Calculer le mouvement brut et le mouvement pondéré par ordre de choix.
- Ne publier aucun cutoff de prochaine liste avant comparaison avec au moins une phase antérieure ou une campagne historique complète.
