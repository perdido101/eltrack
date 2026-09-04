"use client";
import { useFeed } from "@/lib/useFeed";
import type { PlumeData } from "@/lib/sources/plume";
import { rampColor } from "@/lib/ramp";
import { Plate } from "./Plate";
import { SignalLost } from "./SignalLost";

const EN = rampColor(2), LN = rampColor(-2), NEU = "#E3DFD4";

export function ForecastPlume() {
  const feed = useFeed<PlumeData>("plume", 6 * 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : "ok";
  const d = feed.data;
  return (
    <Plate
      id="plume"
      title="Forecast · probability of each ENSO state"
      state={state}
      provenance={d ? `CCSR/IRI MODEL-BASED · ISSUED ${d.issued.toUpperCase()} · 6H${d.mode === "archive" ? " · ARCHIVE" : ""}` : "CCSR/IRI · 6H"}
    >
      {state === "lost" ? (
        <SignalLost source="IRI" file="figure3_plot" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-3">
          <div className="overflow-well">
            <ol className="m-0 grid list-none gap-px bg-rule p-0" style={{ gridTemplateColumns: "repeat(9, minmax(64px, 1fr))", border: "1px solid var(--color-rule)", minWidth: 640 }}>
              {(d ? d.seasons : Array.from({ length: 9 })).map((s, i) => {
                const row = s as PlumeData["seasons"][number] | undefined;
                return (
                  <li key={i} className="grid gap-2 px-2 py-2" style={{ background: "var(--color-paper-plate)" }}>
                    <span className="label-xs block">{row ? `${row.season} ${String(row.year).slice(2)}` : "—"}</span>
                    <div className="flex flex-col-reverse" style={{ height: 120, border: "1px solid var(--color-rule)" }} aria-hidden>
                      {row && [
                        { v: row.laNina, c: LN }, { v: row.neutral, c: NEU }, { v: row.elNino, c: EN },
                      ].map((seg, j) => <span key={j} style={{ height: `${seg.v}%`, background: seg.c }} />)}
                    </div>
                    <span className="value-sm block">{row ? `${row.elNino}%` : <span className="dash" />}</span>
                    <span className="meta block text-ink-3">{row ? `N ${row.neutral} · LN ${row.laNina}` : ""}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 meta text-ink-3">
            <span className="inline-flex items-center gap-2"><i style={{ width: 12, height: 12, background: EN, display: "inline-block" }} />El Niño</span>
            <span className="inline-flex items-center gap-2"><i style={{ width: 12, height: 12, background: NEU, display: "inline-block", border: "1px solid var(--color-rule)" }} />Neutral</span>
            <span className="inline-flex items-center gap-2"><i style={{ width: 12, height: 12, background: LN, display: "inline-block" }} />La Niña</span>
            <span>Large number: El Niño probability. Nine overlapping three-month seasons. Objective multi-model forecast; CPC's official outlook is issued separately.</span>
          </div>
        </div>
      )}
    </Plate>
  );
}
