/** Plain-language helpers — COPY.md §3a, §4c, §10. */

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SEASON_MONTHS: Record<string, [number, number]> = {
  DJF: [11, 1], JFM: [0, 2], FMA: [1, 3], MAM: [2, 4], AMJ: [3, 5], MJJ: [4, 6],
  JJA: [5, 7], JAS: [6, 8], ASO: [7, 9], SON: [8, 10], OND: [9, 11], NDJ: [10, 0],
};

export const monthName = (m0: number) => MONTHS[((m0 % 12) + 12) % 12];

/** "JJA", 2026 → "June–August 2026". DJF 2026 → "December 2025–February 2026". */
export function seasonRange(season: string, year: number, withYear = true): string {
  const [a, b] = SEASON_MONTHS[season] ?? [0, 2];
  if (!withYear) return `${monthName(a)}–${monthName(b)}`;
  // NOAA labels DJF by the January/February year and every other season by its first month.
  if (season === "DJF") return `${monthName(a)} ${year - 1}–${monthName(b)} ${year}`;
  if (a > b) return `${monthName(a)} ${year}–${monthName(b)} ${year + 1}`;
  return `${monthName(a)}–${monthName(b)} ${year}`;
}

/** "JJA", 2026 → "June–August" (no year). */
export const seasonMonths = (season: string) => seasonRange(season, 2000, false);

/** "2026-08" → "August 2026"; "2026-08-26" → "26 August 2026". */
export function longDate(iso: string, withYear = true): string {
  const [y, m, d] = iso.split("-").map(Number);
  const mo = monthName(m - 1);
  if (d) return withYear ? `${d} ${mo} ${y}` : `${d} ${mo}`;
  return withYear ? `${mo} ${y}` : mo;
}

/** Word for a °C departure from normal. */
export function strengthWord(v: number): string {
  const a = Math.abs(v);
  const side = v >= 0 ? "warm" : "cool";
  if (a < 0.5) return "near normal";
  if (a < 1.0) return side;
  if (a < 2.0) return `very ${side}`;
  return `extremely ${side}`;
}

/** "1.8 °C warmer than normal" / "0.3 °C cooler than normal" / "about normal". */
export function vsNormal(v: number, digits = 1): string {
  if (Math.abs(v) < 0.05) return "about normal";
  return `${Math.abs(v).toFixed(digits)} °C ${v > 0 ? "warmer" : "cooler"} than normal`;
}

export function probabilityWord(p: number): string {
  if (p >= 95) return "almost certain";
  if (p >= 80) return "very likely";
  if (p >= 60) return "likely";
  if (p >= 40) return "a coin flip";
  if (p >= 20) return "unlikely";
  return "very unlikely";
}

/** "8 in 10"; at the extremes, plain words instead of "10 in 10" / "0 in 10". */
export const inTen = (p: number) =>
  p >= 95 ? "a near-100%" : p <= 5 ? "almost no" : `${Math.max(1, Math.min(9, Math.round(p / 10)))} in 10`;

/** "just now", "4 minutes ago", "2 hours ago", "yesterday", "3 days ago". */
export function ago(iso: string | undefined, now = Date.now()): string {
  if (!iso) return "";
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/** "yesterday" / "3 days ago" / "26 August" for an observation date. */
export function throughDate(isoDate: string, now = Date.now()): string {
  const days = Math.round((now - Date.parse(isoDate + "T12:00:00Z")) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return longDate(isoDate, false);
}

export const strengthLower = (s: string | null | undefined) => (s ? s.toLowerCase() : "");
