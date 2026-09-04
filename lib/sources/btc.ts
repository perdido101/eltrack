import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/** Bitcoin market price, daily since 2009, from Blockchain.com's public charts API; averaged to months here. */
export const BTC_URL = "https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=false";

export type BtcMonth = { month: string; price: number };
export type BtcData = { series: BtcMonth[]; latest: BtcMonth };

export function toMonthly(values: { x: number; y: number }[]): BtcMonth[] {
  const sums = new Map<string, { s: number; n: number }>();
  for (const v of values) {
    if (!(v.y > 0)) continue;
    const d = new Date(v.x * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const cur = sums.get(key) ?? { s: 0, n: 0 };
    cur.s += v.y; cur.n++;
    sums.set(key, cur);
  }
  return [...sums.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, { s, n }]) => ({ month, price: +(s / n).toFixed(2) }));
}

export async function getBtc(): Promise<Result<BtcData>> {
  try {
    const text = await fetchText(BTC_URL, REVALIDATE.daily, 30_000);
    const values = (JSON.parse(text) as { values?: { x: number; y: number }[] }).values ?? [];
    const series = toMonthly(values);
    if (series.length < 60) return fail("Bitcoin series parsed to too few months");
    return ok({ series, latest: series[series.length - 1] });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
