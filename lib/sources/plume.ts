import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";
import { PLUME_FALLBACK } from "./plumeFallback";

/**
 * CCSR/IRI model-based probabilistic ENSO forecast. IRI publishes the numbers only
 * as a figure; the figure is a matplotlib SVG, so the bars are read back from its
 * geometry and the axis tick labels calibrate the scale. CPC's official
 * probability figure is not served to non-browser clients.
 */
export const IRI_URL = "https://iri.columbia.edu/our-expertise/climate/forecasts/enso/current/";
const FIGURE_HOST = "https://ensoforecast.iri.columbia.edu";

export type PlumeSeason = { season: string; year: number; elNino: number; neutral: number; laNina: number };
export type PlumeData = {
  issued: string;
  title: string;
  seasons: PlumeSeason[];
  mode: "live" | "archive";
};

const SEASON_START: Record<string, number> = {
  JFM: 0, FMA: 1, MAM: 2, AMJ: 3, MJJ: 4, JJA: 5, JAS: 6, ASO: 7, SON: 8, OND: 9, NDJ: 10, DJF: 11,
};

/** matplotlib maps glyph ids to code points offset by 29 in this figure's font subset. */
function decodeText(g: string): string {
  return (g.match(/href="#DejaVu[A-Za-z-]*-([0-9a-f]+)"/g) ?? [])
    .map((h) => String.fromCharCode(parseInt(h.replace(/.*-([0-9a-f]+)"$/, "$1"), 16) + 29))
    .join("");
}

export function parsePlumeSvg(svg: string, issueYear: number): Omit<PlumeData, "issued" | "mode"> | null {
  const texts: { x: number; y: number; t: string }[] = [];
  for (const m of svg.matchAll(/<g id="text_\d+">([\s\S]*?)<\/g>\s*<\/g>/g)) {
    const tr = /translate\(([\d.]+) ([\d.]+)\)/.exec(m[1]);
    if (tr) texts.push({ x: +tr[1], y: +tr[2], t: decodeText(m[1]) });
  }
  const y0 = texts.find((t) => t.t === "0")?.y;
  const y100 = texts.find((t) => t.t === "100")?.y;
  const ticks = texts.filter((t) => t.t in SEASON_START).sort((a, b) => a.x - b.x);
  const title = texts.find((t) => /Probabilistic ENSO/i.test(t.t))?.t ?? "";
  if (y0 == null || y100 == null || ticks.length < 5) return null;
  const axisRight = Math.max(...ticks.map((t) => t.x)) + (ticks[1].x - ticks[0].x) / 2;

  const seasons: PlumeSeason[] = [];
  let year = issueYear;
  // Year labels follow NOAA: DJF belongs to the January/February year, so it starts the new year.
  const eff = (s: string) => (s === "DJF" ? -1 : SEASON_START[s]);
  ticks.forEach((tk, i) => {
    if (i > 0 && eff(tk.t) < eff(ticks[i - 1].t)) year++;
    seasons.push({ season: tk.t, year, elNino: 0, neutral: 0, laNina: 0 });
  });

  for (const m of svg.matchAll(/<g id="patch_\d+">\s*<path([^>]*)\/>/g)) {
    const d = / d="([^"]+)"/.exec(m[1])?.[1];
    const fill = /fill: ?(#[0-9a-f]{6})/.exec(m[1])?.[1];
    if (!d || !fill || fill === "#ffffff") continue;
    const nums = d.match(/-?\d+\.?\d*/g)!.map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    if (cx > axisRight) continue; // legend swatches
    const pct = Math.round(((Math.max(...ys) - Math.min(...ys)) / (y0 - y100)) * 100);
    let best = 0;
    ticks.forEach((tk, i) => { if (Math.abs(tk.x - cx) < Math.abs(ticks[best].x - cx)) best = i; });
    const s = seasons[best];
    if (fill === "#ff0000") s.elNino = pct;
    else if (fill === "#0000ff") s.laNina = pct;
    else s.neutral = pct;
  }
  const sane = seasons.every((s) => Math.abs(s.elNino + s.neutral + s.laNina - 100) <= 3);
  return sane ? { title, seasons } : null;
}

export async function getPlume(): Promise<Result<PlumeData>> {
  try {
    const page = await fetchText(IRI_URL, REVALIDATE.monthly, 20_000);
    const fig = /figure3_plot\/(\d{4})\/(\d{1,2})/.exec(page);
    const issued = /Published:\s*([A-Z][a-z]+ \d{1,2}, \d{4})/.exec(page)?.[1];
    if (!fig) throw new Error("IRI page carries no figure3 link");
    const svg = await fetchText(`${FIGURE_HOST}/figure3_plot/${fig[1]}/${fig[2]}`, REVALIDATE.monthly, 20_000);
    const parsed = parsePlumeSvg(svg, +fig[1]);
    if (!parsed) throw new Error("Could not read probabilities from the IRI figure");
    return ok({ ...parsed, issued: issued ? fmtIssued(issued) : `${fig[1]}-${fig[2]}`, mode: "live" });
  } catch {
    return ok({ ...PLUME_FALLBACK, mode: "archive" });
  }
}

/** "August 19, 2026" → "19 August 2026" */
const fmtIssued = (s: string) => s.replace(/^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/, "$2 $1 $3");
