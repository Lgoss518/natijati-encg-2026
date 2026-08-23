import { readFile } from "node:fs/promises";
import path from "node:path";

type Network = "ensa" | "ensam" | "health";

const staticCatalog = {
  ensa: {
    campaign: "2026-2027", reference_date: "2026-08-04", next_result: "2026-09-09",
    evidence: {
      current: "Après la liste d’attente 1 du 4 août 2026, Cursussup annonce une consultation le 9 septembre 2026.",
      historical: "En 2025, plusieurs écoles ont encore publié des listes complémentaires en septembre.",
      source_url: "https://www.tawjihnet.net/resultats-definitifs-ensa-maroc-2026-2027/",
    },
    items: ["Agadir", "Al Hoceima", "Beni Mellal", "Berrechid", "El Jadida", "Fes", "Kenitra", "Khouribga", "Marrakech", "Oujda", "Safi", "Tanger", "Tetouan"].map((city) => ({
      city, track: "Cycle préparatoire", status: "rank_input",
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
    items: ["Casablanca", "Meknes", "Rabat"].map((city) => ({ city, track: "Cycle préparatoire intégré", status: "rank_input" })),
  },
};

function parseLine(line: string) { return line.split(",").map((cell) => cell.trim()); }

export async function GET(request: Request) {
  const network = new URL(request.url).searchParams.get("network")?.toLowerCase() as Network | undefined;
  if (network === "ensa" || network === "ensam") {
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
    return Response.json({ network, campaign: "2026-2027", reference_date: "2026-08-04", next_result: null, items }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch { return Response.json({ error: "Catalog unavailable" }, { status: 500 }); }
}
