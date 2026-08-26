import { readFile } from "node:fs/promises";
import path from "node:path";

type CsvRow = Record<string, string>;

type Historical = {
  historicalSeats: number;
  lateVacancies: number;
  vacancyRate: number;
  observedPhases: number;
  maxObservedRank?: number;
  waitlistLength?: number;
  evidence: "direct" | "city" | "network";
};

const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const comparableProgram = (value: string) => normalized(value)
  .replace(/industriels?/g, "").replace(/des /g, "").replace(/de l /g, "").replace(/et /g, "").trim();

const sameProgram = (left: string, right: string) => {
  const a = comparableProgram(left);
  const b = comparableProgram(right);
  return a === b || a.includes(b) || b.includes(a);
};

const ensPrograms = [
  "Enseignement primaire", "Langue arabe", "Langue française", "Langue anglaise",
  "Mathématiques", "Physique-Chimie", "Sciences de la Vie et de la Terre",
  "Informatique", "Économie et gestion", "Éducation physique",
];

const ensCities = [
  ["Agadir", 1100], ["Casablanca", 1600], ["Fes", 1450], ["Marrakech", 1550],
  ["Meknes", 1050], ["Rabat", 1500], ["Settat", 950], ["Tetouan", 900],
];

const ensGroups: Record<string, string> = {
  "Enseignement primaire": "primary",
  "Langue arabe": "humanities",
  "Langue française": "languages",
  "Langue anglaise": "languages",
  "Mathématiques": "math",
  "Physique-Chimie": "science",
  "Sciences de la Vie et de la Terre": "science",
  "Informatique": "math",
  "Économie et gestion": "economy",
  "Éducation physique": "primary",
};

const ensBaseWeights: Record<string, Record<string, number>> = {
  primary: { SMA: 1.2, SMB: 1.2, PC: 1.1, SVT: 1.1, AGRI: 1.1, STE: 1, STM: 1, S_ECO: 1, S_GESTION_COMPTABLE: 1 },
  humanities: { SMA: .9, SMB: .9, PC: .9, SVT: .9, AGRI: .9, STE: .8, STM: .8, S_ECO: 1.1, S_GESTION_COMPTABLE: 1 },
  languages: { SMA: 1, SMB: 1, PC: 1, SVT: 1, AGRI: 1, STE: .9, STM: .9, S_ECO: 1.1, S_GESTION_COMPTABLE: 1.05 },
  math: { SMA: 1.45, SMB: 1.45, PC: 1.25, SVT: 1.05, AGRI: 1, STE: 1.15, STM: 1.15, S_ECO: .8, S_GESTION_COMPTABLE: .8 },
  science: { SMA: 1.25, SMB: 1.25, PC: 1.35, SVT: 1.35, AGRI: 1.25, STE: 1, STM: 1, S_ECO: .8, S_GESTION_COMPTABLE: .8 },
  economy: { SMA: 1, SMB: 1, PC: .95, SVT: .9, AGRI: .9, STE: .9, STM: .9, S_ECO: 1.35, S_GESTION_COMPTABLE: 1.35 },
};

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
  if (network !== "fst" && network !== "est" && network !== "ens") {
    return Response.json({ error: "Unsupported network" }, { status: 400 });
  }

  try {
    if (network === "ens") {
      const programs = ensCities.flatMap(([city, total]) => ensPrograms.map((program) => ({
        city: String(city),
        program,
        seats: Math.max(40, Math.round(Number(total) / ensPrograms.length)),
        group: ensGroups[program],
      })));
      const weights = Object.fromEntries(Object.entries(ensBaseWeights).flatMap(([group, row]) => (
        Object.entries(row).map(([bac, weight]) => [`${group}:${bac}`, weight])
      )));
      return Response.json({ network, campaign: "2026-2027", programs, weights }, {
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      });
    }

    if (network === "est") {
      const [programRows, weightRows, vacancyRows, cityCapacityRows, casaDepthRows, casaRankRows] = await Promise.all([
        csv("est_2026_programs.csv"),
        csv("est_2026_weighting_groups.csv"),
        csv("est_2025_late_vacancies.csv"),
        csv("est_2025_capacity_by_city.csv"),
        csv("est_casablanca_2025_waitlist_depth.csv"),
        csv("est_casablanca_2025_late_admission_rank_summary.csv"),
      ]);
      const programs = programRows.map((row) => ({
        city: row.city,
        program: row.program,
        seats: Number(row.seats),
        group: row.weight_group,
        historical: (() => {
          const direct = vacancyRows.filter((item) => normalized(item.city) === normalized(row.city) && sameProgram(item.program, row.program));
          const cityRows = vacancyRows.filter((item) => normalized(item.city) === normalized(row.city));
          const depth = casaDepthRows.find((item) => sameProgram(item.program, row.program));
          const rank = casaRankRows.find((item) => sameProgram(item.program, row.program));
          const cityCapacity = Number(cityCapacityRows.find((item) => normalized(item.city) === normalized(row.city))?.seats || 0);
          const used = direct.length ? direct : cityRows;
          const lateVacancies = direct.length
            ? Math.max(...direct.map((item) => Number(item.vacancies) || 0))
            : cityRows.length ? Math.round(cityRows.reduce((sum, item) => sum + Number(item.vacancies || 0), 0) / cityRows.length) : 0;
          const historicalSeats = Number(depth?.initial_seats || row.seats || 0);
          const divisor = direct.length ? historicalSeats : Math.max(1, cityCapacity / Math.max(1, cityRows.length));
          return {
            historicalSeats,
            lateVacancies,
            vacancyRate: Math.min(1, lateVacancies / Math.max(1, divisor)),
            observedPhases: new Set(used.map((item) => item.phase)).size,
            maxObservedRank: rank ? Number(rank.max_rank) : undefined,
            waitlistLength: depth ? Number(depth.initial_waitlist_length) : undefined,
            evidence: direct.length || depth ? "direct" : cityRows.length ? "city" : "network",
          } satisfies Historical;
        })(),
      }));
      const weights = Object.fromEntries(
        weightRows.map((row) => [`${row.group}:${row.bac_track}`, Number(row.weight)]),
      );
      return Response.json({ network, campaign: "2026-2027", programs, weights }, {
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      });
    }

    const [seatRows, weightRows, oldSeatRows, vacancyRows] = await Promise.all([
      csv("fst_2026_seats.csv"),
      csv("fst_2026_weighting.csv"),
      csv("fst_2025_seats.csv"),
      csv("fst_2025_late_vacancies.csv"),
    ]);
    const programs = seatRows
      .filter((row) => row.city !== "TOTAL")
      .flatMap((row) => Object.entries(row)
        .filter(([key, value]) => !["city", "total"].includes(key) && Number(value) > 0)
        .map(([program, seats]) => {
          const direct = vacancyRows.filter((item) => normalized(item.city) === normalized(row.city) && item.track_code === program);
          const cityRows = vacancyRows.filter((item) => normalized(item.city) === normalized(row.city));
          const oldCity = oldSeatRows.find((item) => normalized(item.city) === normalized(row.city));
          const historicalSeats = Number(oldCity?.[program] || seats);
          const lateVacancies = direct.length ? Math.max(...direct.map((item) => Number(item.vacancies) || 0)) : 0;
          const historical: Historical = {
            historicalSeats,
            lateVacancies,
            vacancyRate: Math.min(1, lateVacancies / Math.max(1, historicalSeats)),
            observedPhases: new Set(direct.map((item) => item.phase)).size,
            evidence: direct.length ? "direct" : cityRows.length ? "city" : "network",
          };
          return { city: row.city, program, seats: Number(seats), group: program, historical };
        }));
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
