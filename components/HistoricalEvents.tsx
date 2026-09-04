"use client";
import { useState } from "react";
import { useFeed } from "@/lib/useFeed";
import type { OniData, OniEvent } from "@/lib/sources/oni";
import { fmtAnom } from "@/lib/enso";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { fmtMonth } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";

type Props = { selected: OniEvent | null; onSelect: (e: OniEvent | null) => void };

export function HistoricalEvents({ selected, onSelect }: Props) {
  const feed = useFeed<OniData>("oni", 6 * 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const [showLaNina, setShowLaNina] = useState(false);
  const events = (feed.data?.events ?? []).filter((e) => showLaNina || e.phase === "El Niño").slice().reverse();

  return (
    <Plate
      id="events"
      title={`Episodes since 1950 · ${showLaNina ? "El Niño and La Niña" : "El Niño"}`}
      state={state}
      provenance={<Provenance source="NOAA CPC ONI" obs={feed.data ? `${feed.data.latest.season} ${feed.data.latest.year}` : undefined} refresh="6H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CPC" file="oni.ascii.txt" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="meta m-0 text-ink-3">Select a row to frame it on the ONI chart above. Episodes: five or more consecutive overlapping seasons at or beyond ±0.5 °C, classified by peak.</p>
            <button type="button" className="tbtn" aria-pressed={showLaNina} onClick={() => setShowLaNina((v) => !v)}>Include La Niña</button>
          </div>
          <div className="overflow-well">
            <table style={{ minWidth: 560 }}>
              <thead>
                <tr><th>Episode</th><th>Peak ONI</th><th>Peak season</th><th>Seasons</th><th>Classification</th></tr>
              </thead>
              <tbody>
                {events.length ? events.map((e) => {
                  const sel = selected?.start === e.start;
                  return (
                    <tr
                      key={e.start}
                      className="row-btn"
                      role="button"
                      tabIndex={0}
                      aria-selected={sel}
                      onClick={() => onSelect(sel ? null : e)}
                      onKeyDown={(k) => { if (k.key === "Enter" || k.key === " ") { k.preventDefault(); onSelect(sel ? null : e); } }}
                    >
                      <td className="meta">{fmtMonth(e.start)} → {fmtMonth(e.end)}</td>
                      <td><span className="value-sm inline-block px-1" style={{ background: rampColor(e.peak), color: rampTextColor(e.peak) }}>{fmtAnom(e.peak, 2)}</span></td>
                      <td className="meta">{e.peakSeason}</td>
                      <td className="meta">{e.seasons}</td>
                      <td>{e.strength} {e.phase}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={5} className="dash" /></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="meta m-0 text-ink-3">Derived from CPC's ONI file with CPC's episode definition, so the table updates as the record does. The current run is listed only once it reaches five seasons.</p>
        </div>
      )}
    </Plate>
  );
}
