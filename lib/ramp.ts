/**
 * The anomaly ramp — the only colour system on the page (DESIGN §2.1).
 * Diverging, anchored at 0 °C, clamped to ±3, interpolated in Oklab.
 */
export const RAMP_STOPS: ReadonlyArray<readonly [number, string]> = [
  [-3.0, "#8FD0F5"],
  [-2.5, "#5FADE6"],
  [-2.0, "#3C8BD0"],
  [-1.5, "#2C6AA6"],
  [-1.0, "#244C78"],
  [-0.5, "#22354F"],
  [0.0, "#1C2433"],
  [0.5, "#4A3529"],
  [1.0, "#8C4A22"],
  [1.5, "#C9601F"],
  [2.0, "#F07A1E"],
  [2.5, "#F04E2B"],
  [3.0, "#E02424"],
];

type Lab = [number, number, number];

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toSrgb = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

function hexToOklab(hex: string): Lab {
  const n = parseInt(hex.slice(1), 16);
  const r = toLinear(((n >> 16) & 255) / 255);
  const g = toLinear(((n >> 8) & 255) / 255);
  const b = toLinear((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToHex([L, a, b]: Lab): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.round(Math.min(1, Math.max(0, toSrgb(c))) * 255));
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

const LAB_STOPS = RAMP_STOPS.map(([v, hex]) => [v, hexToOklab(hex)] as const);

/** Colour for an anomaly in °C. NaN / null → the card colour (no departure, no colour). */
export function rampColor(anomaly: number | null | undefined): string {
  if (anomaly == null || Number.isNaN(anomaly)) return "#1C2433";
  const v = Math.max(-3, Math.min(3, anomaly));
  for (let i = 0; i < LAB_STOPS.length - 1; i++) {
    const [v0, c0] = LAB_STOPS[i];
    const [v1, c1] = LAB_STOPS[i + 1];
    if (v >= v0 && v <= v1) {
      const t = (v - v0) / (v1 - v0);
      return oklabToHex([
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
      ]);
    }
  }
  return oklabToHex(LAB_STOPS[LAB_STOPS.length - 1][1]);
}

/** Text over a ramp fill (DESIGN r2 §2.2): light ink except on the brightest cool stops and the +2 orange. */
export const rampTextColor = (anomaly: number) =>
  anomaly <= -2.0 || (anomaly >= 1.75 && anomaly < 2.4) ? "#0B1220" : "#EEF2F7";

/** Soft glow in the fill's own colour for values at or beyond +2 °C (hero number, hot map cells). */
export const rampGlow = (anomaly: number) =>
  anomaly >= 2 ? `0 0 24px ${rampColor(anomaly)}66` : "none";
