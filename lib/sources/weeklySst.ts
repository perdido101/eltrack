import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/**
 * CPC weekly Niño-region SSTs on the 1991–2020 base period.
 * NB: the older wksst8110.for named in the brief stopped updating in Jan 2021.
 */
export const WEEKLY_SST_URL = "https://www.cpc.ncep.noaa.gov/data/indices/wksst9120.for";

export const REGIONS = ["Niño 1+2", "Niño 3", "Niño 3.4", "Niño 4"] as const;
export type Region = (typeof REGIONS)[number];

export type WeeklyRow = {
  /** ISO date of the week centre. */
  date: string;
  sst: Record<Region, number>;
  anom: Record<Region, number>;
};

export type Trend = "strengthening" | "holding" | "weakening";

export type WeeklySstData = {
  latest: WeeklyRow;
  /** Trailing 52 weeks, oldest first. */
  last52: WeeklyRow[];
  /** Central-Pacific change over four weeks, signed by phase (COPY.md §0). */
  trend: { kind: Trend; delta: number };
  /** For the central Pacific: the last earlier week at or beyond today's value, or a record. */
  highestSince: { kind: "record" } | { kind: "since"; date: string } | { kind: "normal" };
  /** Record weekly central-Pacific anomaly in the file, by magnitude in the current direction. */
  record34: { date: string; value: number };
};

export function deriveWeekly(rows: WeeklyRow[]): WeeklySstData {
  const latest = rows[rows.length - 1];
  const v = latest.anom["Niño 3.4"];
  const sign = v >= 0 ? 1 : -1;
  const back = rows[rows.length - 5]; // four weeks earlier
  const delta = back ? +(v - back.anom["Niño 3.4"]).toFixed(2) : 0;
  const signed = delta * sign;
  const trend: Trend = signed >= 0.2 ? "strengthening" : signed <= -0.2 ? "weakening" : "holding";
  let highestSince: WeeklySstData["highestSince"] = { kind: "normal" };
  if (Math.abs(v) >= 0.5) {
    let since: string | null = null;
    for (let i = rows.length - 2; i >= 0; i--) {
      const w = rows[i].anom["Niño 3.4"] * sign;
      if (w >= Math.abs(v) && rows[i].date < latest.date.slice(0, 4) + "-01-01") { since = rows[i].date; break; }
    }
    highestSince = since ? { kind: "since", date: since } : { kind: "record" };
  }
  let record34 = { date: rows[0].date, value: rows[0].anom["Niño 3.4"] };
  for (const r of rows) if (r.anom["Niño 3.4"] * sign > record34.value * sign) record34 = { date: r.date, value: r.anom["Niño 3.4"] };
  return { latest, last52: rows.slice(-52), trend: { kind: trend, delta }, highestSince, record34 };
}

const MONTHS: Record<string, string> = {
  JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
  JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
};

// SST and anomaly are printed with no separator when the anomaly is negative
// ("23.4-0.4"), so the pairs are matched with an optional space between them.
const NUM = "(-?\\d+\\.\\d)";
const PAIR = `${NUM}\\s*${NUM}`;
const LINE = new RegExp(
  `^\\s*(\\d{2})([A-Z]{3})(\\d{4})\\s+${PAIR}\\s+${PAIR}\\s+${PAIR}\\s+${PAIR}\\s*$`,
);

export function parseWeekly(text: string): WeeklyRow[] {
  const rows: WeeklyRow[] = [];
  for (const line of text.split("\n")) {
    const m = LINE.exec(line);
    if (!m) continue;
    const [, dd, mon, yyyy, ...nums] = m;
    const v = nums.map(Number);
    rows.push({
      date: `${yyyy}-${MONTHS[mon]}-${dd}`,
      sst: { "Niño 1+2": v[0], "Niño 3": v[2], "Niño 3.4": v[4], "Niño 4": v[6] },
      anom: { "Niño 1+2": v[1], "Niño 3": v[3], "Niño 3.4": v[5], "Niño 4": v[7] },
    });
  }
  return rows;
}

export async function getWeeklySst(): Promise<Result<WeeklySstData>> {
  try {
    const text = await fetchText(WEEKLY_SST_URL, REVALIDATE.weekly);
    const rows = parseWeekly(text);
    if (rows.length < 52) return fail("Weekly SST file parsed to too few rows");
    return ok(deriveWeekly(rows));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
