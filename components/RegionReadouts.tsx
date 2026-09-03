"use client";
import { useFeed } from "@/lib/useFeed";
import { REGIONS, type WeeklySstData } from "@/lib/sources/weeklySst";
import { fmtAnom } from "@/lib/enso";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { fmtDate } from "@/lib/format";
import { AnomalyBars } from "./AnomalyBars";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";

const BOXES: Record<(typeof REGIONS)[number], string> = {
  "Niño 1+2": "0–10°S · 90–80°W",
  "Niño 3": "5°N–5°S · 150–90°W",
  "Niño 3.4": "5°N–5°S · 170–120°W",
  "Niño 4": "5°N–5°S · 160°E–150°W",
};

export function RegionReadouts() {
  const feed = useFeed<WeeklySstData>("weekly-sst", 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const d = feed.data;

  return (
    <Plate
      id="regions"
      title="Niño regions · weekly SST anomaly"
      state={state}
      provenance={<Provenance source="NOAA CPC" obs={d ? fmtDate(d.latest.date) : undefined} refresh="1H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CPC" file="wksst9120.for" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <ol className="m-0 list-none p-0">
          {REGIONS.map((region) => {
            const a = d?.latest.anom[region];
            const sst = d?.latest.sst[region];
            return (
              <li
                key={region}
                className="region-row py-3"
                style={{ borderTop: "1px solid var(--color-rule)" }}
              >
                <div>
                  <p className="label-sm m-0">{region}</p>
                  <p className="meta m-0 text-ink-3">{BOXES[region]}</p>
                </div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="value-md inline-block px-2 py-1"
                    style={{ background: a != null ? rampColor(a) : "transparent", color: a != null ? rampTextColor(a) : "var(--color-ink-3)", minWidth: "4.2ch", textAlign: "right" }}
                  >
                    {a != null ? fmtAnom(a) : <span className="dash" />}
                  </span>
                  <span className="meta text-ink-3">{sst != null ? `${sst.toFixed(1)} °C` : ""}</span>
                </div>
                <div className="spark">
                  <AnomalyBars
                    values={d ? d.last52.map((r) => r.anom[region]) : []}
                    max={4}
                    title={`${region} weekly anomaly, last 52 weeks`}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="meta m-0 mt-3 text-ink-3">Anomalies against the 1991–2020 base period. Sparklines span 52 weeks; scale ±4 °C.</p>
    </Plate>
  );
}
