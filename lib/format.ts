const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

/** "2026-08-26" → "26 AUG 2026" */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m - 1]} ${y}`;
}

/** "2026-06" → "JUN 2026" */
export function fmtMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MON[m - 1]} ${y}`;
}

/** ISO timestamp → "26 AUG 2026 14:03 UTC" */
export function fmtStamp(iso: string): string {
  const t = new Date(iso);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  return `${t.getUTCDate()} ${MON[t.getUTCMonth()]} ${t.getUTCFullYear()} ${hh}:${mm} UTC`;
}

/** "13 August 2026" (as CPC prints it) → "13 AUG 2026" */
export const fmtCpcDate = (s: string) =>
  s.replace(/([A-Z][a-z]{2})[a-z]*/, (_, m: string) => m.toUpperCase());
