import { readFile } from "node:fs/promises";
import path from "node:path";

type Network = "ensa" | "ensam" | "health" | "ena";

const staticCatalog = {
  ensa: {
    campaign: "2026-2027", reference_date: "2026-08-04", next_result: "2026-09-09",
    evidence: {
      current: "Après la liste d’attente 1 du 4 août 2026, Cursussup annonce une consultation le 9 septembre 2026.",
      historical: "En 2025, plusieurs écoles ont encore publié des listes complémentaires en septembre.",
      source_url: "https://www.tawjihnet.net/resultats-definitifs-ensa-maroc-2026-2027/",
    },
    items: ["Agadir", "Al Hoceima", "Beni Mellal", "Berrechid", "El Jadida", "Fes", "Kenitra", "Khouribga", "Marrakech", "Oujda", "Safi", "Tanger", "Tetouan"].map((city) => ({
      city, track: "Cycle préparatoire", status: city === "Safi" ? "official_milestone" : "official_calendar",
      ...(city === "Safi" ? { historical_phase: "Liste régionale n°5 (23 septembre 2025)", historical_max_rank: 300 } : {}),
    })),
  },
  ensam: {
    campaign: "2026-2027", reference_date: "2026-08-04", next_result: null,
    evidence: {
      current: "La liste principale, l’amélioration des choix et la liste d’attente 1 sont confirmées pour la campagne 2026.",
      historical: "Les archives 2025 confirment un mouvement entre les listes du 25 juillet et du 4 août, mais les fichiers complets ne sont plus téléchargeables.",
      source_url: "https://www.tawjihnet.net/resultats-definitifs-ensam-maroc-2026-2027/",
    },
    items: ["Casablanca", "Meknes", "Rabat"].map((city) => ({
      city, track: "Cycle préparatoire intégré", status: city === "Meknes" ? "official_waitlist" : "official_calendar",
    })),
  },
  ena: {
    campaign: "2026-2027", reference_date: "2026-07-28", next_result: "2026-09-09",
    evidence: {
      current: "Les listes principales et listes d’attente ENA 2026-2027 sont publiées par école. Les inscriptions de la liste principale sont prévues le 7 septembre, puis les listes d’attente le 9 et le 14 septembre.",
      historical: "La campagne 2025 montre que certaines ENA ont encore ouvert des inscriptions de listes d’attente en septembre, ce qui confirme l’existence d’un mouvement après la liste principale.",
      source_url: "https://www.tawjihnet.net/resultats-definitifs-ena-architecture-2026-2027/",
    },
    items: [
      { city: "Rabat", track: "Architecture", status: "official_waitlist", waitlist_size: 200 },
      { city: "Fes", track: "Architecture", status: "verified_codes", waitlist_size: 120 },
      { city: "Tetouan", track: "Architecture", status: "verified_codes", waitlist_size: 75 },
      { city: "Marrakech", track: "Architecture", status: "official_waitlist", waitlist_size: 120 },
      { city: "Agadir", track: "Architecture", status: "official_waitlist", waitlist_size: 120 },
      { city: "Oujda", track: "Architecture", status: "official_waitlist", waitlist_size: 120 },
    ],
  },
};

function parseLine(line: string) { return line.split(",").map((cell) => cell.trim()); }

export async function GET(request: Request) {
  const network = new URL(request.url).searchParams.get("network")?.toLowerCase() as Network | undefined;
  if (network === "ensa" || network === "ensam" || network === "ena") {
    if (network === "ena") {
      let candidates: Array<{ city: string; track: string; code: string; rank: number; choice: number }> = [];
      try {
        const source = await readFile(path.join(process.cwd(), "research", "ena_2026_candidates.csv"), "utf8");
        const lines = source.trim().split(/\r?\n/);
        const headers = parseLine(lines.shift() || "");
        candidates = lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] || ""]))).map((row) => ({
          city: String(row.city), track: String(row.track), code: String(row.code).toUpperCase(), rank: Number(row.rank), choice: Number(row.choice) || 1,
        }));
      } catch {
        candidates = [];
      }
      return Response.json({ network, ...staticCatalog.ena, candidates }, { headers: { "Cache-Control": "public, max-age=3600" } });
    }
    return Response.json({ network, ...staticCatalog[network] }, { headers: { "Cache-Control": "public, max-age=3600" } });
  }
  if (network !== "health") return Response.json({ error: "Unsupported network" }, { status: 400 });
  try {
    const source = await readFile(path.join(process.cwd(), "research", "medicine_2026_snapshot.csv"), "utf8");
    const lines = source.trim().split(/\r?\n/);
    const headers = parseLine(lines.shift() || "");
    const rows = lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] || ""])));
    const items = rows.map((row) => ({
      city: row.city, track: row.track, status: "verified_snapshot",
      candidates_remaining: Number(row.candidates_remaining), max_current_rank: Number(row.max_current_rank),
      choice_1: Number(row.choice_1), choice_2: Number(row.choice_2), choice_3: Number(row.choice_3),
    }));
    let candidates: Array<{ city: string; track: string; code: string; rank: number; choice: number }> = [];
    try {
      const candidateSource = await readFile(path.join(process.cwd(), "research", "medicine_2026_candidates.csv"), "utf8");
      const candidateLines = candidateSource.trim().split(/\r?\n/);
      const candidateHeaders = parseLine(candidateLines.shift() || "");
      candidates = candidateLines.map((line) => Object.fromEntries(candidateHeaders.map((header, index) => [header, parseLine(line)[index] || ""]))).map((row) => ({
        city: String(row.city), track: String(row.track), code: String(row.code).toUpperCase(), rank: Number(row.rank), choice: Number(row.choice) || 1,
      }));
    } catch {
      candidates = [];
    }
    return Response.json({
      network, campaign: "2026-2027", reference_date: "2026-08-04", next_result: null,
      evidence: {
        current: "Les listes d’attente du 4 août 2026 sont publiées pour médecine, pharmacie et dentaire.",
        historical: "Calibration avec 5 campagnes Tawjihnet (2022–2026), 12 phases publiées et la composition détaillée des listes 2023 et 2026. Les campagnes récentes ont le poids le plus fort.",
        source_url: "https://www.tawjihnet.net/listes-dattente-medecine-pharmacie-dentaire-2026-2027/",
      },
      items, candidates,
    }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch { return Response.json({ error: "Catalog unavailable" }, { status: 500 }); }
}
