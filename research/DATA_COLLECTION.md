# Orientation LGOSS — Registre de collecte

Dernière mise à jour : 2026-08-23

## Principe méthodologique

- ENCG, ENSA, ENSAM et FMP/FMD : modèle fondé sur le rang actuel, la ville, la filière, le choix, les places et le mouvement entre la liste principale, les itérations et les listes complémentaires.
- FST et EST : modèle antérieur aux résultats, fondé sur la note nationale, la note régionale, le type de bac, la filière, la ville et le coefficient de pondération appliqué automatiquement.
- Chaque réseau possède son propre modèle. Aucun seuil ou taux de mouvement n'est transféré d'un réseau à l'autre.
- Toute estimation doit afficher un intervalle, un niveau de confiance et la date de mise à jour.

## Sources indexées — réseaux à rang

| Réseau | 2024 | 2025 | 2026 | État initial |
|---|---|---|---|---|
| ENCG | à compléter | [Tawjihnet 2025](https://www.tawjihnet.net/resultats-tafem-encg-concours-2025-2026/) | [Tawjihnet 2026](https://www.tawjihnet.net/resultats-definitifs-encg-tafem-2026-2027/) | Listes PDF 2026 disponibles par ville; iteration 1 du 04/08; prochaine phase à modéliser |
| ENSA | [Tawjihnet 2024](https://www.tawjihnet.net/resultats-definitifs-ensa-maroc-2024-2025/) | [Tawjihnet 2025](https://www.tawjihnet.net/resultats-definitifs-ensa-maroc-2025-2026/) | [Tawjihnet 2026](https://www.tawjihnet.net/resultats-definitifs-ensa-maroc-2026-2027/) | Historique exploitable sur trois campagnes; phase 04/08/2026 puis 09/09/2026 |
| ENSAM | [Tawjihnet 2024](https://www.tawjihnet.net/resultats-definitifs-ensam-maroc-2024-2025/) | [Tawjihnet 2025](https://www.tawjihnet.net/resultats-definitifs-ensam-maroc-2025-2026/) | [Tawjihnet 2026](https://www.tawjihnet.net/resultats-definitifs-ensam-maroc-2026-2027/) | Trois villes; PDF historiques et listes complémentaires jusqu'en octobre 2024 |
| Médecine / Pharmacie / Dentaire | [Principale 2024](https://www.tawjihnet.net/resultats-definitifs-concours-medecine-fmpd-2024-2025/) et [attente 2024](https://www.tawjihnet.net/listes-dattente-medecine-pharmacie-dentaire-2024/) | à compléter | [Principale 2026](https://www.tawjihnet.net/resultats-definitifs-concours-medecine-fmpd-2026-2027/) et [attente 2026](https://www.tawjihnet.net/listes-dattente-medecine-pharmacie-dentaire-2026-2027/) | Modèle séparé par filière et faculté; vérifier le périmètre géographique et les rangs publiés |

## Sources indexées — réseaux à note

| Réseau | Sources historiques | Variables obligatoires | État initial |
|---|---|---|---|
| FST | [Résultats 2025](https://www.tawjihnet.net/resultats-et-inscription-definitive-fst-maroc-2025-2026/) et comparatif des seuils Tawjihnet | Bac, national, régional, tronc/filière, établissement, coefficient | Des appels tardifs et places vacantes sont documentés; matrice complète des coefficients à reconstruire |
| EST | [Résultats 2025](https://www.tawjihnet.net/resultats-et-inscription-definitive-est-maroc-2025-2026/) et [attentes 2024](https://www.tawjihnet.net/listes-dattente-complementaire-est-maroc-2024-2025/) | Bac, national, régional, filière DUT, établissement, coefficient | Données riches mais fragmentées par école et filière; certaines séries vont jusqu'à l'appel 4 |

## Données à extraire pour chaque liste

- année, réseau, établissement, ville et filière;
- date et numéro de la phase;
- rang, choix et Code Massar lorsqu'ils sont publiés;
- dernier rang appelé et nombre de nouveaux admis;
- nombre de places annoncé ou restant;
- seuil et formule de calcul pour FST/EST;
- URL source, nature officielle ou relais, date de consultation;
- qualité de la source : A (officielle complète), B (Tawjihnet/PDF complet), C (avis partiel), D (témoignage non vérifié).

## Règles avant publication d'un pourcentage

1. Au moins deux campagnes comparables, ou une campagne complète avec toutes les phases.
2. Backtest : simuler une ancienne phase sans utiliser son résultat futur.
3. Afficher séparément « prochaine liste » et « admission finale ».
4. Ne pas calculer les concurrents réels sans rangs et choix individuels disponibles.
5. Élargir l'intervalle lorsque les places, les rangs ou une phase manquent.
