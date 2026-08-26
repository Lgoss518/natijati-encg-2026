import csv
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent
CACHE = ROOT / "raw" / "medicine" / "history"
CACHE.mkdir(parents=True, exist_ok=True)

PHASES = {
    "2025": (["2025-08-04", "2025-07-21"], 21),
    "2024": (["2024-09-17", "2024-09-13", "2024-08-05"], 20),
    "2023": (["2023-09-08", "2023-08-04", "2023-07-31", "2023-07-24"], 20),
    "2022": (["2022-08-03"], 15),
}
ROW = re.compile(r"\b([A-Z][A-Z0-9]{7,13})\s+(\d{1,5})\s+([1-9]\d*)\b")


def identity(text):
    cleaned = text.replace("Filière", "").replace("Liste d’attente", "").replace("(Lien corrigé)", "").strip()
    track = "Dentaire" if "Dentaire" in cleaned else "Pharmacie" if "Pharmacie" in cleaned else "Medecine"
    city = re.sub(r"Médecine Dentaire|Médecine|Pharmacie|Dentaire|liste d’attente", "", cleaned, flags=re.I).strip()
    return city.replace("Fès", "Fes"), track


def download(entry):
    target = CACHE / f"{entry['year']}_{entry['phase']}_{entry['city'].lower().replace(' ', '-')}_{entry['track'].lower()}.pdf"
    if target.exists() and target.stat().st_size > 10000:
        return entry, target
    match = re.search(r"/d/([^/]+)", entry["url"])
    if not match:
        return entry, None
    url = f"https://drive.usercontent.google.com/download?id={match.group(1)}&export=download&confirm=t"
    try:
        with urllib.request.urlopen(url, timeout=45) as response:
            data = response.read()
        if len(data) < 10000:
            return entry, None
        target.write_bytes(data)
        return entry, target
    except Exception:
        return entry, None


manifest_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "AppData/Local/Temp/fmpd-historical-links.json"
raw = json.loads(manifest_path.read_text(encoding="utf-8"))
entries = []
for page, rows in raw.items():
    year = re.search(r"(202[2-5])", page).group(1)
    phases, width = PHASES[year]
    for index, row in enumerate(rows):
        city, track = identity(row["text"])
        entries.append({"year": year, "phase": phases[min(index // width, len(phases) - 1)], "city": city, "track": track, "url": row["links"][0]})

snapshots = []
sets = {}
with ThreadPoolExecutor(max_workers=6) as pool:
    for entry, pdf in pool.map(download, entries):
        if not pdf:
            continue
        try:
            text = "\n".join((page.extract_text() or "") for page in PdfReader(str(pdf)).pages)
        except Exception:
            continue
        found = {(code.upper(), int(rank), int(choice)) for code, rank, choice in ROW.findall(text)}
        if not found:
            continue
        key = (entry["year"], entry["phase"], entry["city"], entry["track"])
        sets[key] = {code for code, _, _ in found}
        choices = [sum(1 for _, _, c in found if c == choice) for choice in (1, 2, 3)]
        snapshots.append((*key, len(found), max(rank for _, rank, _ in found), *choices, entry["url"]))

with (ROOT / "medicine_history_snapshots.csv").open("w", newline="", encoding="utf-8") as handle:
    writer = csv.writer(handle)
    writer.writerow(("year", "phase_date", "city", "track", "candidates", "max_rank", "choice_1", "choice_2", "choice_3", "source_url"))
    writer.writerows(sorted(snapshots))

movements = []
for year in sorted({key[0] for key in sets}):
    combos = {(key[2], key[3]) for key in sets if key[0] == year}
    for city, track in combos:
        phases = sorted([key[1] for key in sets if key[0] == year and key[2:] == (city, track)])
        for before, after in zip(phases, phases[1:]):
            old, new = sets[(year, before, city, track)], sets[(year, after, city, track)]
            removed, added = len(old - new), len(new - old)
            movements.append((year, before, after, city, track, len(old), len(new), removed, added, round(removed / max(1, len(old)), 4)))

with (ROOT / "medicine_history_movements.csv").open("w", newline="", encoding="utf-8") as handle:
    writer = csv.writer(handle)
    writer.writerow(("year", "from_date", "to_date", "city", "track", "from_candidates", "to_candidates", "removed", "added", "removal_rate"))
    writer.writerows(sorted(movements))

print(json.dumps({"links": len(entries), "snapshots": len(snapshots), "movements": len(movements)}, ensure_ascii=False))
