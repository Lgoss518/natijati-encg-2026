import csv
import re
import sys
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent
PDF_DIR = ROOT / "raw" / "medicine" / "2026"
OUTPUT = ROOT / "medicine_2026_candidates.csv"

ALIASES = {
    "med": "Medecine",
    "pharmacie": "Pharmacie",
    "dentaire": "Dentaire",
}

ROW = re.compile(r"\b([A-Z][A-Z0-9]{7,13})\s+(\d{1,5})\s+([1-9]\d*)\b")


def identity(path: Path):
    stem = path.stem.replace("_2026-08-04", "")
    city, suffix = stem.rsplit("_", 1)
    return city.replace("benimellal", "Beni Mellal").replace("laayoune", "Laayoune").replace("errachidia", "Errachidia").replace("marrakech", "Marrakech").replace("casablanca", "Casablanca").replace("casa", "Casablanca").replace("agadir", "Agadir").replace("guelmim", "Guelmim").replace("kenitra", "Kenitra").replace("oujda", "Oujda").replace("rabat", "Rabat").replace("settat", "Settat").replace("tanger", "Tanger").replace("fes", "Fes"), ALIASES[suffix]


rows = []
for pdf in sorted(PDF_DIR.glob("*.pdf")):
    city, track = identity(pdf)
    text = "\n".join((page.extract_text() or "") for page in PdfReader(str(pdf)).pages)
    found = {(int(rank), code.upper(), int(choice)) for code, rank, choice in ROW.findall(text)}
    for rank, code, choice in sorted(found):
        rows.append((city, track, code, rank, choice, "2026-08-04"))

with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
    writer = csv.writer(handle)
    writer.writerow(("city", "track", "code", "rank", "choice", "snapshot_date"))
    writer.writerows(rows)

print(f"{len(rows)} candidates -> {OUTPUT}")
