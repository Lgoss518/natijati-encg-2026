import csv
import json
import re
from collections import Counter
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = Path(r"C:\Users\lgoss\Downloads\Liste 3")
OLD_SNAPSHOT = ROOT / "public" / "candidates.json"
OUTPUT_CANDIDATES = ROOT / "research" / "encg_2026_09_05_candidates.csv"
OUTPUT_MOVEMENT = ROOT / "research" / "encg_2026_08_04_to_09_05_movement.csv"
OUTPUT_PUBLIC = ROOT / "public" / "candidates.json"
MODEL_PATH = ROOT / "public" / "model.json"

CITY_KEYS = {
    "Agadir": "agadir",
    "Al Hoceima": "alhoceima",
    "Beni Mellal": "benimellal",
    "Casablanca": "casablanca",
    "Dakhla": "dakhla",
    "El Hajeb": "elhajeb",
    "El Jadida": "eljadida",
    "Fès": "fes",
    "Kenitra": "kenitra",
    "Marrakesh": "marrakech",
    "Oujda": "oujda",
    "Settat": "settat",
    "Tanger": "tanger",
}

ROW = re.compile(r"([A-Z][0-9]{8,12})\s+(\d+)\s+(\d+)")


def extract(path: Path):
    text = "\n".join((page.extract_text() or "") for page in PdfReader(str(path)).pages)
    rows = {}
    for code, rank, choice in ROW.findall(text):
        rows[code] = (int(rank), int(choice))
    return rows


with OLD_SNAPSHOT.open(encoding="utf-8") as handle:
    old = json.load(handle)
with MODEL_PATH.open(encoding="utf-8") as handle:
    old_model = json.load(handle)

candidate_rows = []
movement_rows = []
old_by_code = {}
new_by_code = {}
city_current = {}

for path in sorted(PDF_ROOT.glob("*.pdf")):
    city = path.stem
    key = CITY_KEYS[city]
    previous = {code: tuple(values) for code, values in old[key].items()}
    current = extract(path)
    city_current[key] = current
    for code, (rank, choice) in previous.items():
        old_by_code.setdefault(code, []).append((key, rank, choice))
    for code, (rank, choice) in current.items():
        new_by_code.setdefault(code, []).append((key, rank, choice))
    previous_codes = set(previous)
    current_codes = set(current)
    remaining = previous_codes & current_codes
    removed = previous_codes - current_codes
    added = current_codes - previous_codes
    removed_choices = Counter(previous[code][1] for code in removed)
    old_ranks_remaining = sorted(previous[code][0] for code in remaining)
    movement_rows.append({
        "city": city,
        "old_candidates_2026_08_04": len(previous),
        "new_candidates_2026_09_05": len(current),
        "removed_since_08_04": len(removed),
        "removal_rate_percent": round(100 * len(removed) / max(1, len(previous)), 2),
        "new_codes_not_in_old_snapshot": len(added),
        "choice_1_removed": removed_choices[1],
        "choice_2_removed": removed_choices[2],
        "choice_3_removed": removed_choices[3],
        "choice_4_plus_removed": sum(count for choice, count in removed_choices.items() if choice >= 4),
        "first_old_rank_still_waiting": old_ranks_remaining[0] if old_ranks_remaining else 0,
        "median_old_rank_still_waiting": old_ranks_remaining[len(old_ranks_remaining) // 2] if old_ranks_remaining else 0,
        "last_old_rank_still_waiting": old_ranks_remaining[-1] if old_ranks_remaining else 0,
        "max_new_rank": max((rank for rank, _ in current.values()), default=0),
        "median_rank_compression": 0,
        "p25_rank_compression": 0,
        "p75_rank_compression": 0,
        "inferred_assignment_strong": 0,
        "choice_1_exit_or_assignment": 0,
    })
    for code, (rank, choice) in sorted(current.items(), key=lambda item: item[1][0]):
        old_rank, old_choice = previous.get(code, (0, 0))
        candidate_rows.append({
            "city": city,
            "code": code,
            "rank_2026_09_05": rank,
            "choice_2026_09_05": choice,
            "rank_2026_08_04": old_rank,
            "choice_2026_08_04": old_choice,
        })

for movement in movement_rows:
    key = CITY_KEYS[movement["city"]]
    previous = {code: tuple(values) for code, values in old[key].items()}
    current = city_current[key]
    compressions = sorted(
        previous[code][0] - current[code][0]
        for code in set(previous) & set(current)
        if previous[code][0] >= current[code][0]
    )
    if compressions:
        movement["p25_rank_compression"] = compressions[len(compressions) // 4]
        movement["median_rank_compression"] = compressions[len(compressions) // 2]
        movement["p75_rank_compression"] = compressions[(3 * len(compressions)) // 4]

# A strong inferred assignment is a candidate who remains on a better choice
# while disappearing from the immediately less preferred school. A complete
# disappearance from choice 1 is kept separate because withdrawal cannot be
# distinguished from an actual assignment using waiting lists alone.
strong_by_city = Counter()
choice1_exit_by_city = Counter()
for code, previous_entries in old_by_code.items():
    current_cities = {city for city, _, _ in new_by_code.get(code, [])}
    removed_entries = sorted(
        (entry for entry in previous_entries if entry[0] not in current_cities),
        key=lambda entry: entry[2],
    )
    remaining_choices = [choice for city, _, choice in previous_entries if city in current_cities]
    if removed_entries and remaining_choices:
        candidate = removed_entries[0]
        if max(remaining_choices) < candidate[2]:
            strong_by_city[candidate[0]] += 1
    elif removed_entries and not current_cities:
        best = min(removed_entries, key=lambda entry: entry[2])
        if best[2] == 1:
            choice1_exit_by_city[best[0]] += 1

for movement in movement_rows:
    key = CITY_KEYS[movement["city"]]
    movement["inferred_assignment_strong"] = strong_by_city[key]
    movement["choice_1_exit_or_assignment"] = choice1_exit_by_city[key]

# Rebuild the public Code Massar index using the new official snapshot.
public_snapshot = {
    key: {code: [rank, choice] for code, (rank, choice) in rows.items()}
    for key, rows in city_current.items()
}

# Translate the previous 9 September horizon from the old ranks into the new
# ranking system. If the old target has already been passed, use the 2025
# iteration-2-to-3 national movement (425 assignments) distributed by capacity
# and current choice composition.
city_labels = {value: label for label, value in CITY_KEYS.items()}
choice_weights = {1: 1.0, 2: 0.42, 3: 0.20, 4: 0.11, 5: 0.07}
mobility_factors = {}
for key, school in old_model["schools"].items():
    rows = sorted(city_current[key].items(), key=lambda item: item[1][0])[:300]
    first_share = sum(choice == 1 for _, (_, choice) in rows) / max(1, len(rows))
    mobility_factors[key] = school["seats"] * (0.7 + (1 - first_share) * 0.8)
factor_total = sum(mobility_factors.values())


def weighted_cutoff(key, target_slots):
    cumulative = 0.0
    for _, (rank, choice) in sorted(city_current[key].items(), key=lambda item: item[1][0]):
        cumulative += choice_weights.get(choice, 0.05)
        if cumulative >= target_slots:
            return rank
    return max((rank for rank, _ in city_current[key].values()), default=1)


def translated_cutoff(key, old_target):
    pairs = sorted(
        (old[key][code][0], current_rank)
        for code, (current_rank, _) in city_current[key].items()
        if code in old[key]
    )
    if not pairs or old_target < pairs[0][0]:
        return 0
    return min(pairs, key=lambda pair: abs(pair[0] - old_target))[1]


new_schools = {}
for key, school in old_model["schools"].items():
    expected_slots = 425 * mobility_factors[key] / factor_total
    allocation_low = weighted_cutoff(key, expected_slots * 0.7)
    allocation_mid = weighted_cutoff(key, expected_slots)
    allocation_high = weighted_cutoff(key, expected_slots * 1.55)
    low = max(allocation_low, translated_cutoff(key, school["low"]))
    mid = max(allocation_mid, translated_cutoff(key, school["mid"]))
    high = max(allocation_high, translated_cutoff(key, school["high"]))
    new_schools[key] = {**school, "low": low, "mid": mid, "high": high}
    movement = next(item for item in movement_rows if item["city"] == city_labels[key])
    movement["next_list_central_rank"] = mid
    movement["next_list_optimistic_rank"] = high

new_model = {
    **old_model,
    "version": "2026.09.05",
    "updated_at": "2026-09-05T18:00:00+01:00",
    "next_list_date": "2026-09-09T00:00:00+01:00",
    "announcement": "تم إدماج لوائح ENCG الجديدة ديال 5 شتنبر وتحديث الرتب والتوقعات.",
    "schools": new_schools,
}

with OUTPUT_CANDIDATES.open("w", newline="", encoding="utf-8-sig") as handle:
    writer = csv.DictWriter(handle, fieldnames=candidate_rows[0].keys())
    writer.writeheader()
    writer.writerows(candidate_rows)

with OUTPUT_MOVEMENT.open("w", newline="", encoding="utf-8-sig") as handle:
    writer = csv.DictWriter(handle, fieldnames=movement_rows[0].keys())
    writer.writeheader()
    writer.writerows(movement_rows)

with OUTPUT_PUBLIC.open("w", encoding="utf-8") as handle:
    json.dump(public_snapshot, handle, ensure_ascii=False, separators=(",", ":"))

with MODEL_PATH.open("w", encoding="utf-8") as handle:
    json.dump(new_model, handle, ensure_ascii=False, indent=2)

print(json.dumps(movement_rows, ensure_ascii=False, indent=2))
