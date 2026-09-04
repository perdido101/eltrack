"use client";
import { useFeed } from "@/lib/useFeed";
import type { PlumeData, PlumeSeason } from "@/lib/sources/plume";
import { rampColor } from "@/lib/ramp";
import { probabilityWord, inTen, seasonMonths, seasonRange } from "@/lib/words";
import { Card, stateOf } from "./Card";

const EN = rampColor(2), LN = rampColor(-2), NEU = "#2E3A52";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lead = (s: PlumeSeason) => s.elNino >= s.neutral && s.elNino >= s.laNina ? { name: "El Niño", p: s.elNino } : s.laNina >= s.neutral ? { name: "La Niña", p: s.laNina } : { name: "neutral conditions", p: s.neutral };

export function ForecastPlume() {
  const feed = useFeed<PlumeData>("plume", 6 * 3600_000);
  const d = feed.data;
  // "Through winter" = the last season ending in February; "next spring" = the last season shown.
  const winter = d?.seasons.find((s) => s.season === "DJF" || s.season === "JFM") ?? d?.seasons[Math.min(4, (d?.seasons.length ?? 1) - 1)];
  const spring = d?.seasons[d.seasons.length - 1];

  return (
    <Card
      id="forecast"
      headline="What forecasters expect"
      lead={d && winter && spring ? (
        <div className="grid gap-2">
          <p className="m-0 number" style={{ fontWeight: 500 }}>
            {cap(lead(winter).name)} lasting through winter: <span className="strong">{probabilityWord(lead(winter).p)}</span> — {inTen(lead(winter).p)} chance through {seasonRange(winter.season, winter.year).replace(/^.*?–/, "")}.
          </p>
          <p className="m-0 body">
            Still going next spring: <span className="strong">{probabilityWord(lead(spring).p)}</span> — {inTen(lead(spring).p)} chance of {lead(spring).name} in {seasonRange(spring.season, spring.year)}.
          </p>
        </div>
      ) : <p className="m-0 number"><span className="dash" /></p>}
      state={stateOf(feed)}
      sourceName="the forecast centre"
      failed="IRI's forecast figure"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source={<>Issued {d?.issued ?? "…"} · IRI / Columbia Climate School{d?.mode === "archive" ? " · showing the last saved forecast" : ""}</>}
      meaning={<>These are the odds from 26 climate models combined. They agree unusually well right now. Strong El Niños usually fade fast in spring, which is why the odds drop after {d ? seasonMonths(d.seasons[d.seasons.length - 2]?.season ?? "MAM").split("–")[0] : "March"}.</>}
      details={
        <>
          <p>The CCSR/IRI model-based probabilistic forecast: an objective combination of dynamical and statistical models, equally weighted. Nine overlapping three-month periods; thresholds ±0.5 °C on the central-Pacific anomaly.</p>
          <p>NOAA's official forecast is a separate, human-judged product issued around the 10th of each month; NOAA's own sentence is quoted in the first panel.</p>
          <p>IRI publishes the numbers only as a figure, so this site reads them back from the figure's geometry and checks each column sums to 100. If that fails, the last saved forecast is shown and the source line says so.</p>
        </>
      }
    >
      <div className="well">
        <ol className="m-0 grid list-none gap-2 p-0" style={{ gridTemplateColumns: "repeat(9, minmax(64px, 1fr))", minWidth: 660 }}>
          {(d ? d.seasons : Array.from({ length: 9 })).map((s, i) => {
            const row = s as PlumeSeason | undefined;
            const l = row ? lead(row) : null;
            return (
              <li key={i} className="grid gap-2 well-bg px-2 py-2">
                <span className="caption block">{row ? seasonMonths(row.season).replace(/([A-Z][a-z]{2})[a-z]*/g, "$1") : "—"}</span>
                <div className="flex flex-col-reverse" style={{ height: 110, borderRadius: 6, overflow: "hidden", background: "var(--color-bg-2)" }} aria-hidden>
                  {row && [{ v: row.laNina, c: LN }, { v: row.neutral, c: NEU }, { v: row.elNino, c: EN }].map((seg, j) => <span key={j} style={{ height: `${seg.v}%`, background: seg.c }} />)}
                </div>
                <span className="strong block" style={{ fontSize: 18 }}>{row ? `${l!.p}%` : <span className="dash" />}</span>
                <span className="caption block" style={{ minHeight: 18 }}>{row ? (l!.name === "El Niño" ? "El Niño" : l!.name === "La Niña" ? "La Niña" : "neutral") : ""}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 caption">
        <span className="inline-flex items-center gap-2"><i style={{ width: 12, height: 12, borderRadius: 3, background: EN, display: "inline-block" }} />El Niño</span>
        <span className="inline-flex items-center gap-2"><i style={{ width: 12, height: 12, borderRadius: 3, background: NEU, display: "inline-block" }} />Neither</span>
        <span className="inline-flex items-center gap-2"><i style={{ width: 12, height: 12, borderRadius: 3, background: LN, display: "inline-block" }} />La Niña</span>
        <span>Each column is a three-month period; the number is the chance of the leading outcome.</span>
      </div>
    </Card>
  );
}
