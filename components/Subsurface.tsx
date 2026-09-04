"use client";
import { useFeed } from "@/lib/useFeed";
import { HEAT_BANDS, type HeatContentData } from "@/lib/sources/heatContent";
import { fmtAnom } from "@/lib/enso";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { fmtMonth } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";
import { Term } from "./Term";

const W = 1000, H = 220, PAD = { top: 12, right: 8, bottom: 20, left: 34 }, YMAX = 3.5;

export function Subsurface() {
  const feed = useFeed<HeatContentData>("heat-content", 6 * 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const d = feed.data;
  const series = d?.series ?? [];
  const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;
  const zero = PAD.top + plotH / 2, s = plotH / 2 / YMAX;
  const bw = series.length ? plotW / series.length : 1;

  return (
    <Plate
      id="subsurface"
      title="Subsurface · upper-300 m heat content anomaly"
      state={state}
      provenance={<Provenance source="NOAA CPC" obs={d ? fmtMonth(d.latest.month) : undefined} refresh="6H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CPC" file="heat_content_index.txt" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {HEAT_BANDS.map((band, i) => {
              const v = d?.latest.values[i];
              return (
                <div key={band}>
                  <p className="label-xs m-0 text-ink-3">{band}{i === 2 ? " · eastern" : i === 0 ? " · basin" : ""}</p>
                  <p className="value-lg m-0 mt-1 inline-block px-2" style={{ background: v != null ? rampColor(v) : "transparent", color: v != null ? rampTextColor(v) : "inherit" }}>
                    {v != null ? `${fmtAnom(v, 2)} °C` : <span className="dash" />}
                  </p>
                </div>
              );
            })}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monthly upper-300 m temperature anomaly, 180° to 100°W, since 1979." style={{ display: "block" }}>
            {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
              <g key={v}>
                <line x1={PAD.left} x2={W - PAD.right} y1={zero - v * s} y2={zero - v * s} stroke="#C9C4B8" strokeWidth={v === 0 ? 0 : 0.5} />
                <text x={PAD.left - 6} y={zero - v * s + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#83888C">{v > 0 ? `+${v}` : v}</text>
              </g>
            ))}
            {series.map((m, i) => {
              const v = m.values[2];
              const h = Math.min(plotH / 2, Math.abs(v) * s);
              return <rect key={m.month} x={PAD.left + i * bw} y={v >= 0 ? zero - h : zero} width={Math.max(bw - 0.3, 0.5)} height={Math.max(h, 0.5)} fill={rampColor(v)} />;
            })}
            <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#16181A" strokeWidth={0.75} />
            {series.map((m, i) => m.month.endsWith("-01") && +m.month.slice(0, 4) % 5 === 0 ? (
              <text key={m.month} x={PAD.left + i * bw} y={H - 5} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#55595C">{m.month.slice(0, 4)}</text>
            ) : null)}
            {d && (
              <text x={W - PAD.right} y={zero - d.maxEast.value * s - 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#55595C">RECORD {fmtAnom(d.maxEast.value, 2)} · {fmtMonth(d.maxEast.month)}</text>
            )}
          </svg>
          <p className="meta m-0 text-ink-3" style={{ fontFamily: "var(--font-sans)", fontSize: 13 }}>
            Chart: the eastern band, 180°–100°W, monthly since 1979 (1981–2010 base). Warm water piling up beneath the surface is the leading indicator forecasters watch: it deepens the <Term k="thermocline" /> and is carried east by <Term k="kelvin">Kelvin waves</Term> before it shows at the surface.
          </p>
        </div>
      )}
    </Plate>
  );
}
