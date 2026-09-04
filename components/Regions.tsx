"use client";
import { useFeed } from "@/lib/useFeed";
import { REGIONS, type WeeklySstData } from "@/lib/sources/weeklySst";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { strengthWord, longDate } from "@/lib/words";
import { AnomalyBars } from "./AnomalyBars";
import { Card, stateOf } from "./Card";

const PLAIN: Record<(typeof REGIONS)[number], { name: string; note?: string }> = {
  "Niño 1+2": { name: "Off the coast of Peru" },
  "Niño 3": { name: "Eastern Pacific" },
  "Niño 3.4": { name: "Central Pacific", note: "the one forecasters watch" },
  "Niño 4": { name: "Western Pacific" },
};
const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} °C`;

export function Regions() {
  const feed = useFeed<WeeklySstData>("weekly-sst", 3600_000);
  const d = feed.data;
  const c = d?.latest.anom["Niño 3.4"] ?? 0;
  const peru = d?.latest.anom["Niño 1+2"] ?? 0;
  const meaning = !d ? "" : c >= 0.5
    ? (peru > c ? "An El Niño that's warmest off South America, like this one, tends to hit Peru and Ecuador hardest — heavy rain on the coast and a collapse in the anchovy fishery."
               : "An El Niño centred in the middle of the Pacific, like this one, tends to spread its effects more evenly around the world.")
    : c <= -0.5 ? "Cooler water across the central and eastern Pacific is the signature of La Niña."
    : "All four regions are close to normal.";
  const since = d ? d.highestSince.kind === "record" ? "The highest weekly reading in the central Pacific since this record began in 1990."
    : d.highestSince.kind === "since" ? `Highest weekly reading in the central Pacific since ${longDate(d.highestSince.date)}.` : "" : "";

  return (
    <Card
      id="regions"
      headline="How warm is each part of the Pacific?"
      lead={since ? <p className="m-0 body" style={{ fontSize: 18 }}>{since}</p> : undefined}
      state={stateOf(feed)}
      sourceName="NOAA"
      failed="the weekly region file"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source={<>Weekly, through {d ? longDate(d.latest.date, false) : "…"} · NOAA Climate Prediction Center</>}
      meaning={meaning}
      details={
        <>
          <p>Weekly averages against the 1991–2020 baseline, from NOAA's weekly Niño-region file (wksst9120.for).</p>
          <p><strong>The regions.</strong> Off Peru = Niño 1+2 (0–10°S, 90–80°W) · Eastern = Niño 3 (5°N–5°S, 150–90°W) · Central = Niño 3.4 (5°N–5°S, 170–120°W) · Western = Niño 4 (5°N–5°S, 160°E–150°W).</p>
          <p><strong>Words for numbers.</strong> Near normal under 0.5 °C · warm/cool 0.5–0.9 · very 1.0–1.9 · extremely 2.0 and above.</p>
          {d && <p><strong>Trend.</strong> The central Pacific has changed by {signed(d.trend.delta)} over the last four weeks — {d.trend.kind}.</p>}
          {d && <p><strong>Record.</strong> Central Pacific weekly record in this file: {signed(d.record34.value)}, {longDate(d.record34.date)}.</p>}
        </>
      }
    >
      <ol className="m-0 grid list-none gap-2 p-0">
        {REGIONS.map((region) => {
          const a = d?.latest.anom[region];
          const sst = d?.latest.sst[region];
          return (
            <li key={region} className="well-bg region-row px-4 py-3">
              <div className="min-w-0">
                <p className="m-0 strong" style={{ fontSize: 17 }}>{PLAIN[region].name}</p>
                <p className="caption m-0">{PLAIN[region].note ?? (sst != null ? `${sst.toFixed(1)} °C at the surface` : "")}</p>
              </div>
              <div className="text-right">
                <span className="number inline-block rounded-lg px-2 py-1" style={{ fontSize: 24, whiteSpace: "nowrap", background: a != null ? rampColor(a) : "transparent", color: a != null ? rampTextColor(a) : "var(--color-ink-3)" }}>
                  {a != null ? signed(a) : <span className="dash" />}
                </span>
                <p className="caption m-0 mt-1">{a != null ? strengthWord(a) : ""}</p>
              </div>
              <div className="spark">
                <AnomalyBars values={d ? d.last52.map((r) => r.anom[region]) : []} max={4} title={`${PLAIN[region].name}, last 52 weeks`} />
              </div>
            </li>
          );
        })}
      </ol>
      <p className="caption m-0">The strips show the last 52 weeks. Bars above the line are warmer than normal, below are cooler.</p>
    </Card>
  );
}
