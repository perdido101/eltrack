import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/** CPC equatorial Pacific upper-300 m temperature anomaly (heat content), monthly, three longitude bands. */
export const HEAT_CONTENT_URL =
  "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ocean/index/heat_content_index.txt";

export const HEAT_BANDS = ["130°E–80°W", "160°E–80°W", "180°–100°W"] as const;

export type HeatMonth = { month: string; values: [number, number, number] };
export type HeatContentData = {
  series: HeatMonth[];
  latest: HeatMonth;
  /** Record high of the eastern band (180°–100°W) with its month. */
  maxEast: { month: string; value: number };
  /** Record high of the eastern band excluding the latest month. */
  previousRecord: { month: string; value: number };
};

export function parseHeatContent(text: string): HeatMonth[] {
  const out: HeatMonth[] = [];
  for (const line of text.split("\n")) {
    const m = /^\s*(\d{4})\s+(\d{1,2})\s+(-?\d*\.\d+)\s+(-?\d*\.\d+)\s+(-?\d*\.\d+)\s*$/.exec(line);
    if (!m) continue;
    out.push({ month: `${m[1]}-${m[2].padStart(2, "0")}`, values: [Number(m[3]), Number(m[4]), Number(m[5])] });
  }
  return out;
}

export function deriveHeatContent(series: HeatMonth[]): HeatContentData {
  let maxEast = { month: series[0].month, value: series[0].values[2] };
  let previousRecord = maxEast;
  const latest = series[series.length - 1];
  for (const s of series) {
    if (s.values[2] > maxEast.value) maxEast = { month: s.month, value: s.values[2] };
    if (s.month !== latest.month && s.values[2] > previousRecord.value) previousRecord = { month: s.month, value: s.values[2] };
  }
  return { series, latest, maxEast, previousRecord };
}

export async function getHeatContent(): Promise<Result<HeatContentData>> {
  try {
    const series = parseHeatContent(await fetchText(HEAT_CONTENT_URL, REVALIDATE.monthly));
    if (series.length < 100) return fail("Heat content file parsed to too few rows");
    return ok(deriveHeatContent(series));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
