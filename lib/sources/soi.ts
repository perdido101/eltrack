import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/**
 * CPC monthly Southern Oscillation Index: standardised Tahiti − Darwin sea-level
 * pressure. Negative values accompany El Niño. (BoM's 30-day SOI is not served to
 * non-browser clients, and BoM itself now points users to other providers.)
 */
export const SOI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/soi";

export type SoiMonth = { month: string; value: number }; // "2026-07"

export type SoiData = {
  /** Standardised series, oldest first. */
  series: SoiMonth[];
  latest: SoiMonth;
  /** Min and max of the standardised index for each calendar month across the record. */
  rangeByMonth: { min: number; max: number }[];
  /** Fraction of all months in the record with a value at or below the latest. */
  percentile: number;
  /** Lowest value ever recorded, with its month. */
  min: SoiMonth;
};

const ROW = /^(\d{4})((?:\s*-?\d+\.\d)+)\s*$/;

/** The file has an ANOMALY block then a STANDARDIZED block; the latter is what BoM-style charts show. */
export function parseSoi(text: string): SoiMonth[] {
  const std = text.indexOf("STANDARDIZED");
  const block = std >= 0 ? text.slice(std) : text;
  const out: SoiMonth[] = [];
  for (const line of block.split("\n")) {
    const m = ROW.exec(line.trim());
    if (!m) continue;
    // Values are 6 characters wide and may run together when negative.
    const vals = m[2].match(/-?\d+\.\d/g) ?? [];
    vals.forEach((v, i) => {
      const n = Number(v);
      if (n > -99 && i < 12) out.push({ month: `${m[1]}-${String(i + 1).padStart(2, "0")}`, value: n });
    });
  }
  return out;
}

export function deriveSoi(series: SoiMonth[]): SoiData {
  const latest = series[series.length - 1];
  const rangeByMonth = Array.from({ length: 12 }, () => ({ min: Infinity, max: -Infinity }));
  let min = series[0];
  for (const s of series) {
    const m = +s.month.slice(5) - 1;
    rangeByMonth[m].min = Math.min(rangeByMonth[m].min, s.value);
    rangeByMonth[m].max = Math.max(rangeByMonth[m].max, s.value);
    if (s.value < min.value) min = s;
  }
  const below = series.filter((s) => s.value <= latest.value).length;
  return { series, latest, rangeByMonth, percentile: below / series.length, min };
}

export async function getSoi(): Promise<Result<SoiData>> {
  try {
    const series = parseSoi(await fetchText(SOI_URL, REVALIDATE.monthly));
    if (series.length < 120) return fail("SOI file parsed to too few months");
    return ok(deriveSoi(series));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
