import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";
import { SEASON_CENTRE, phaseFor, strengthFor, type Phase, type Strength } from "@/lib/enso";

export const ONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt";

export type OniRow = {
  season: string; // "MJJ"
  year: number;
  /** ISO month of the season centre, e.g. "2026-06" */
  centre: string;
  total: number;
  anom: number;
};

export type OniEvent = {
  phase: Exclude<Phase, "Neutral">;
  start: string; // centre month of first season
  end: string;
  peak: number;
  peakSeason: string;
  seasons: number;
  strength: Strength;
};

export type OniData = {
  series: OniRow[];
  latest: OniRow;
  current: {
    phase: Phase;
    strength: Strength | null;
    /** Seasons in the current run at or beyond ±0.5, ending at `latest`. */
    runLength: number;
    /** First season of the current run, if any. */
    runStart: OniRow | null;
    /** True once the run reaches CPC's five-season episode threshold. */
    isEpisode: boolean;
  };
  /** Every event since 1950 meeting the five-consecutive-season rule. */
  events: OniEvent[];
  /** Plain-language comparison for the latest value (COPY.md §1). */
  comparison:
    | { kind: "record" }
    | { kind: "since"; event: OniEvent }
    | { kind: "normal" };
  /** How many past episodes of the same phase the latest value already exceeds. */
  rankAmongEvents: { stronger: number; total: number };
  /** Latest minus previous three-month value. */
  delta: number;
};

export function parseOni(text: string): OniRow[] {
  const rows: OniRow[] = [];
  for (const line of text.split("\n")) {
    const p = line.trim().split(/\s+/);
    if (p.length !== 4 || !(p[0] in SEASON_CENTRE)) continue;
    const year = Number(p[1]);
    const total = Number(p[2]);
    const anom = Number(p[3]);
    if (!Number.isFinite(year) || !Number.isFinite(anom)) continue;
    const m = SEASON_CENTRE[p[0]];
    rows.push({
      season: p[0],
      year,
      centre: `${year}-${String(m + 1).padStart(2, "0")}`,
      total,
      anom,
    });
  }
  return rows;
}

/** Runs of ≥5 consecutive seasons at or beyond ±0.5 — the CPC episode definition. */
export function findEvents(series: OniRow[]): OniEvent[] {
  const events: OniEvent[] = [];
  let i = 0;
  while (i < series.length) {
    const sign = Math.sign(series[i].anom);
    const inRun = (r: OniRow) =>
      sign > 0 ? r.anom >= 0.5 : sign < 0 ? r.anom <= -0.5 : false;
    if (!inRun(series[i])) { i++; continue; }
    let j = i;
    while (j < series.length && inRun(series[j])) j++;
    const run = series.slice(i, j);
    if (run.length >= 5) {
      const peakRow = run.reduce((a, b) => (Math.abs(b.anom) > Math.abs(a.anom) ? b : a));
      events.push({
        phase: sign > 0 ? "El Niño" : "La Niña",
        start: run[0].centre,
        end: run[run.length - 1].centre,
        peak: peakRow.anom,
        peakSeason: `${peakRow.season} ${peakRow.year}`,
        seasons: run.length,
        strength: strengthFor(peakRow.anom)!,
      });
    }
    i = j;
  }
  return events;
}

export function deriveOni(series: OniRow[]): OniData {
  const latest = series[series.length - 1];
  const phase = phaseFor(latest.anom);
  let runLength = 0;
  let runStart: OniRow | null = null;
  if (phase !== "Neutral") {
    for (let k = series.length - 1; k >= 0; k--) {
      if (phaseFor(series[k].anom) !== phase) break;
      runLength++;
      runStart = series[k];
    }
  }
  const events = findEvents(series);
  const same = events.filter((e) => e.phase === phase);
  const mag = Math.abs(latest.anom);
  let comparison: OniData["comparison"] = { kind: "normal" };
  if (phase !== "Neutral") {
    // The most recent past episode whose peak beat today's value; none → a record.
    const beat = same.filter((e) => Math.abs(e.peak) >= mag && e.end < latest.centre);
    comparison = beat.length ? { kind: "since", event: beat[beat.length - 1] } : { kind: "record" };
  }
  const prev = series[series.length - 2];
  return {
    series,
    latest,
    events,
    comparison,
    rankAmongEvents: { stronger: same.filter((e) => Math.abs(e.peak) < mag && e.end < latest.centre).length, total: same.filter((e) => e.end < latest.centre).length },
    delta: prev ? +(latest.anom - prev.anom).toFixed(2) : 0,
    current: {
      phase,
      strength: strengthFor(latest.anom),
      runLength,
      runStart,
      isEpisode: runLength >= 5,
    },
  };
}

export async function getOni(): Promise<Result<OniData>> {
  try {
    const text = await fetchText(ONI_URL, REVALIDATE.monthly);
    const series = parseOni(text);
    if (series.length < 100) return fail("ONI file parsed to too few rows");
    return ok(deriveOni(series));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
