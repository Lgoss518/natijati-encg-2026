import { readFile } from "node:fs/promises";
import path from "node:path";

type CsvRow = Record<string, string>;

const splitCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else current += char;
  }
  cells.push(current.trim());
  return cells;
};

async function csv(file: string): Promise<CsvRow[]> {
  const source = await readFile(path.join(process.cwd(), "research", file), "utf8");
  const lines = source.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift() || "");
  return lines.map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
  });
}

export async function GET(request: Request) {
  const network = new URL(request.url).searchParams.get("network")?.toLowerCase();
  if (network !== "fst" && network !== "est") {
    return Response.json({ error: "Unsupported network" }, { status: 400 });
  }

  try {
    if (network === "est") {
      const [programRows, weightRows] = await Promise.all([
        csv("est_2026_programs.csv"),
        csv("est_2026_weighting_groups.csv"),
      ]);
      const programs = programRows.map((row) => ({
        city: row.city,
        program: row.program,
        seats: Number(row.seats),
        group: row.weight_group,
      }));
      const weights = Object.fromEntries(
        weightRows.map((row) => [`${row.group}:${row.bac_track}`, Number(row.weight)]),
      );
      return Response.json({ network, campaign: "2026-2027", programs, weights }, {
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      });
    }

    const [seatRows, weightRows] = await Promise.all([
      csv("fst_2026_seats.csv"),
      csv("fst_2026_weighting.csv"),
    ]);
    const programs = seatRows
      .filter((row) => row.city !== "TOTAL")
      .flatMap((row) => Object.entries(row)
        .filter(([key, value]) => !["city", "total"].includes(key) && Number(value) > 0)
        .map(([program, seats]) => ({ city: row.city, program, seats: Number(seats), group: program })));
    const weights = Object.fromEntries(
      weightRows.map((row) => [`${row.program}:${row.bac_track}`, Number(row.weight)]),
    );
    return Response.json({ network, campaign: "2026-2027", programs, weights }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json({ error: "Catalog unavailable" }, { status: 500 });
  }
}
