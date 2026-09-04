"use client";
import { useFeed } from "@/lib/useFeed";
import type { OniData } from "@/lib/sources/oni";
import type { AlertStatus } from "@/lib/sources/alertStatus";
import { STRENGTH_LADDER, fmtAnom } from "@/lib/enso";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { fmtCpcDate, fmtMonth } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";
import { Term } from "./Term";

const HOUR = 3600_000;

export function CurrentState() {
  const oni = useFeed<OniData>("oni", 6 * HOUR);
  const alert = useFeed<AlertStatus>("alert", HOUR);

  const state = oni.isLoading ? "loading" : oni.error && !oni.data ? "lost" : oni.error ? "stale" : "ok";
  const latest = oni.data?.latest;
  const cur = oni.data?.current;

  return (
    <Plate
      id="current"
      title="Current state · Oceanic Niño Index"
      state={state}
      provenance={
        <Provenance
          source="NOAA CPC"
          obs={latest ? `${latest.season} ${latest.year}` : undefined}
          refresh="6H"
          stale={state === "stale"}
        />
      }
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CPC" file="oni.ascii.txt" lastGoodAt={oni.lastGoodAt} error={oni.error} />
      ) : (
        <div className="grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
          {/* The number */}
          <div>
            <p className="label-xs m-0 text-ink-3">
              <Term k="oni">ONI</Term> · 3-month mean SST anomaly, <Term k="nino34">Niño 3.4</Term>{latest ? ` · ${latest.season} ${latest.year}` : ""}
            </p>
            <p className="value-hero m-0 mt-1" aria-live="polite">
              {latest ? fmtAnom(latest.anom, 2) : <span className="dash" aria-label="loading" />}
            </p>
            <div
              aria-hidden
              className="mt-3 h-2 w-full"
              style={{ background: latest ? rampColor(latest.anom) : "transparent", transition: "background-color var(--dur-ui) var(--ease-ui)" }}
            />
          </div>

          {/* CPC alert status — verbatim from the diagnostic discussion */}
          <div className="grid gap-1">
            <p className="label-xs m-0 text-ink-3"><Term k="enso">ENSO</Term> Alert System status</p>
            <p className="m-0" style={{ font: "600 clamp(18px, 3.2vw, 26px)/1.1 var(--font-sans)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {alert.data ? alert.data.status : alert.error ? <span className="text-ink-3">Status unavailable</span> : <span className="dash" />}
            </p>
            <p className="meta m-0 text-ink-3">
              {alert.data?.issued ? `CPC · ISSUED ${fmtCpcDate(alert.data.issued)} · 1H` : alert.error ? `CPC · ${alert.error}` : "CPC · 1H"}
            </p>
          </div>

          {/* Phase and run */}
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <p className="label-xs m-0 text-ink-3">Phase by ONI threshold</p>
              <p className="value-sm m-0 mt-1">
                {cur ? `${cur.strength ? `${cur.strength} ` : ""}${cur.phase}` : <span className="dash" />}
              </p>
            </div>
            <div>
              <p className="label-xs m-0 text-ink-3">Consecutive seasons beyond ±0.5</p>
              <p className="value-sm m-0 mt-1">
                {cur ? (
                  cur.runLength > 0 && cur.runStart
                    ? `${cur.runLength} since ${cur.runStart.season} ${cur.runStart.year}${cur.isEpisode ? "" : " · episode at 5"}`
                    : "0"
                ) : <span className="dash" />}
              </p>
            </div>
          </div>

          {/* Threshold ladder */}
          <div>
            <p className="label-xs m-0 mb-2 text-ink-3">Strength ladder · peak |ONI|</p>
            <ol className="m-0 grid list-none grid-cols-2 gap-px bg-rule p-0 sm:grid-cols-4" style={{ border: "1px solid var(--color-rule)" }}>
              {STRENGTH_LADDER.map((s) => {
                const lit = !!latest && cur?.strength === s.band;
                const bg = lit ? rampColor(latest!.anom) : "var(--color-paper-plate)";
                const fg = lit ? rampTextColor(latest!.anom) : "var(--color-ink)";
                return (
                  <li key={s.band} className="px-3 py-2" style={{ background: bg, color: fg }} aria-current={lit ? "true" : undefined}>
                    <span className="label-sm block">{s.band}</span>
                    <span className="meta block" style={{ opacity: lit ? 1 : 0.7 }}>≥ {fmtAnom(s.min)}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* CPC synopsis */}
          {alert.data?.synopsis && (
            <figure className="m-0">
              <blockquote className="prose m-0" style={{ borderLeft: "1px solid var(--color-ink)", paddingLeft: 14 }}>
                {alert.data.synopsis}
              </blockquote>
              <figcaption className="meta mt-2 text-ink-3">
                NOAA CPC ENSO diagnostic discussion{alert.data.issued ? `, ${alert.data.issued}` : ""}
              </figcaption>
            </figure>
          )}

          {/* Seasonal run */}
          <div>
            <p className="label-xs m-0 mb-2 text-ink-3">Last twelve overlapping seasons</p>
            <div className="overflow-well">
              <ol className="m-0 grid list-none gap-px bg-rule p-0" style={{ gridTemplateColumns: "repeat(12, minmax(56px, 1fr))", border: "1px solid var(--color-rule)", minWidth: 680 }}>
                {(oni.data ? oni.data.series.slice(-12) : Array.from({ length: 12 })).map((r, i) => {
                  const row = r as OniData["series"][number] | undefined;
                  return (
                    <li key={i} className="px-2 py-2" style={{ background: row ? rampColor(row.anom) : "var(--color-paper-plate)", color: row ? rampTextColor(row.anom) : "var(--color-ink-3)" }}>
                      <span className="label-xs block" style={{ opacity: 0.85 }}>{row ? `${row.season} ${String(row.year).slice(2)}` : "—"}</span>
                      <span className="value-sm block mt-1">{row ? fmtAnom(row.anom, 2) : "—"}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            {cur?.runStart && (
              <p className="meta m-0 mt-2 text-ink-3">
                Run began {fmtMonth(cur.runStart.centre)} (centre month of {cur.runStart.season} {cur.runStart.year}).
              </p>
            )}
          </div>
        </div>
      )}
    </Plate>
  );
}
