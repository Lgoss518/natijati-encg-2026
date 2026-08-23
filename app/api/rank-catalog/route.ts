import { readFile } from "node:fs/promises";
import path from "node:path";

type Network = "ensa" | "ensam" | "health";

const staticCatalog = {
  ensa: {
    campaign: "2026-2027", reference_date: "2026-08-04", next_result: "2026-09-09",
    items: ["Agadir", "Al Hoceima", "Beni Mellal", "Berrechid", "El Jadida", "Fes", "Kenitra", "Khouribga", "Marrakech", "Oujda", "Safi", "Tanger", "Tetouan"].map((city) => ({ city, track: "Cycle préparatoire", status: "rank_input" })),
  },
  ensam: {
    campaign: "2026-2027", reference_date: "2026-08-04", next_result: null,
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
