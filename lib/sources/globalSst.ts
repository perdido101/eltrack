import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/** Daily global mean SST (60°S–60°N) from NOAA OISST v2.1, as compiled by Climate Reanalyzer. */
export const GLOBAL_SST_URL =
  "https://climatereanalyzer.org/clim/sst_daily/json_2clim/oisst2.1_world2_sst_day.json";

type Series = { name: string; data: (number | null)[] };

export type GlobalSstPoint = { date: string; value: number; preliminary: boolean };

export type GlobalSstData = {
  latest: GlobalSstPoint;
  /** Anomaly of `latest` against the 1991–2020 daily climatology. */
  anom: number;
  /** Trailing ~365 days, oldest first. */
  year: GlobalSstPoint[];
  /** 1991–2020 climatology aligned to `year` (same length). */
  clim: (number | null)[];
  /** Highest value on that calendar day in any earlier year, aligned to `year`. */
  priorRecord: (number | null)[];
  /** All-time daily record in the whole series. */
  record: { date: string; value: number };
};

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function dateOf(year: number, i: number): string {
  const d = new Date(Date.UTC(year, 0, 1 + i));
  return d.toISOString().slice(0, 10);
}

/** Index into a 366-slot climatology for day i of `year`. */
const climIndex = (year: number, i: number) => (isLeap(year) || i < 59 ? i : i + 1);

export function deriveGlobalSst(series: Series[]): GlobalSstData {
  const years = series.filter((s) => /^\d{4}$/.test(s.name)).map((s) => ({ y: +s.name, data: s.data }));
  const clim = series.find((s) => s.name === "1991-2020")?.data ?? [];
  const prelim = series.find((s) => s.name === "Preliminary")?.data ?? [];
  const cur = years[years.length - 1];

  // Daily points for the last two years, preliminary values filling the tail.
  const points: GlobalSstPoint[] = [];
  for (const { y, data } of years.slice(-2)) {
    data.forEach((v, i) => {
      const p = y === cur.y && v == null ? prelim[i] : null;
      if (v != null) points.push({ date: dateOf(y, i), value: v, preliminary: false });
      else if (p != null) points.push({ date: dateOf(y, i), value: p, preliminary: true });
    });
  }
  const year = points.slice(-365);
  const latest = year[year.length - 1];

  // Record for each calendar day across earlier years, and the all-time record.
  const byDoy: number[] = new Array(366).fill(-Infinity);
  let record = { date: "", value: -Infinity };
  for (const { y, data } of years) {
    data.forEach((v, i) => {
      if (v == null) return;
      const k = climIndex(y, i);
      if (y < cur.y && v > byDoy[k]) byDoy[k] = v;
      if (v > record.value) record = { date: dateOf(y, i), value: v };
    });
  }
  const alignedClim: (number | null)[] = [];
  const priorRecord: (number | null)[] = [];
  for (const p of year) {
    const y = +p.date.slice(0, 4);
    const i = Math.round((Date.parse(p.date) - Date.UTC(y, 0, 1)) / 86_400_000);
    const k = climIndex(y, i);
    alignedClim.push(clim[k] ?? null);
    priorRecord.push(Number.isFinite(byDoy[k]) ? byDoy[k] : null);
  }
  const anom = alignedClim[alignedClim.length - 1] != null ? +(latest.value - alignedClim[alignedClim.length - 1]!).toFixed(2) : NaN;
  return { latest, anom, year, clim: alignedClim, priorRecord, record };
}

export async function getGlobalSst(): Promise<Result<GlobalSstData>> {
  try {
    const text = await fetchText(GLOBAL_SST_URL, REVALIDATE.daily, 25_000);
    const series = JSON.parse(text) as Series[];
    if (!Array.isArray(series) || series.length < 10) return fail("Unexpected Climate Reanalyzer payload");
    return ok(deriveGlobalSst(series));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
