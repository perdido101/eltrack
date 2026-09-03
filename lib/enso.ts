/** ENSO domain helpers — thresholds and classification in CPC vocabulary. */

export type Strength = "Weak" | "Moderate" | "Strong" | "Very Strong";

export const STRENGTH_LADDER: ReadonlyArray<{ band: Strength; min: number }> = [
  { band: "Weak", min: 0.5 },
  { band: "Moderate", min: 1.0 },
  { band: "Strong", min: 1.5 },
  { band: "Very Strong", min: 2.0 },
];

/** Strength band for an ONI magnitude, or null when within ±0.5 (neutral). */
export function strengthFor(oni: number): Strength | null {
  const a = Math.abs(oni);
  let band: Strength | null = null;
  for (const s of STRENGTH_LADDER) if (a >= s.min) band = s.band;
  return band;
}

export type Phase = "El Niño" | "La Niña" | "Neutral";

export const phaseFor = (oni: number): Phase =>
  oni >= 0.5 ? "El Niño" : oni <= -0.5 ? "La Niña" : "Neutral";

/** Three-letter season → 0-based centre month (DJF centres on January). */
export const SEASON_CENTRE: Record<string, number> = {
  DJF: 0, JFM: 1, FMA: 2, MAM: 3, AMJ: 4, MJJ: 5,
  JJA: 6, JAS: 7, ASO: 8, SON: 9, OND: 10, NDJ: 11,
};

export const SEASONS = Object.keys(SEASON_CENTRE);

export const fmtAnom = (v: number, digits = 1) =>
  (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(digits);
