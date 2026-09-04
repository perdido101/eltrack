"use client";
import { useFeed } from "@/lib/useFeed";
import type { SoiData } from "@/lib/sources/soi";
import { fmtAnom } from "@/lib/enso";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { fmtMonth } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";
import { Term } from "./Term";

const W = 1000, H = 220, PAD = { top: 12, right: 8, bottom: 20, left: 34 };
const YMAX = 4;
const MONTHS = 36;

export function SouthernOscillation() {
  const feed = useFeed<SoiData>("soi", 6 * 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const d = feed.data;
  const win = d ? d.series.slice(-MONTHS) : [];
  const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;
  const zero = PAD.top + plotH / 2;
  const s = plotH / 2 / YMAX;
  const bw = plotW / MONTHS;
  // Negative SOI accompanies El Niño, so the ramp is applied to −SOI (warm colours = El Niño sense).
  const fill = (v: number) => rampColor(-v * 0.75);

  return (
    <Plate
      id="soi"
      title="Southern Oscillation Index · monthly, standardised"
      state={state}
      provenance={<Provenance source="NOAA CPC" obs={d ? fmtMonth(d.latest.month) : undefined} refresh="6H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CPC" file="data/indices/soi" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <p className="label-xs m-0 text-ink-3">Latest · {d ? fmtMonth(d.latest.month) : "—"}</p>
              <p className="value-lg m-0 mt-1 inline-block px-2" style={{ background: d ? fill(d.latest.value) : "transparent", color: d ? rampTextColor(-d.latest.value * 0.75) : "inherit" }}>
                {d ? fmtAnom(d.latest.value) : <span className="dash" />}
              </p>
            </div>
            <div>
              <p className="label-xs m-0 text-ink-3">Rank in record since 1951</p>
              <p className="value-sm m-0 mt-2">{d ? `Lower than ${(100 - d.percentile * 100).toFixed(0)}% of all months` : <span className="dash" />}</p>
            </div>
            <div>
              <p className="label-xs m-0 text-ink-3">Record low</p>
              <p className="value-sm m-0 mt-2">{d ? `${fmtAnom(d.min.value)} · ${fmtMonth(d.min.month)}` : <span className="dash" />}</p>
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monthly Southern Oscillation Index, last three years, with the historical range for each calendar month." style={{ display: "block" }}>
            {/* Historical range band per calendar month */}
            {d && win.map((m, i) => {
              const r = d.rangeByMonth[+m.month.slice(5) - 1];
              return <rect key={m.month} x={PAD.left + i * bw} y={zero - Math.min(YMAX, r.max) * s} width={bw} height={(Math.min(YMAX, r.max) - Math.max(-YMAX, r.min)) * s} fill="#16181A" fillOpacity={0.06} />;
            })}
            {[-4, -2, 0, 2, 4].map((v) => (
              <g key={v}>
                <line x1={PAD.left} x2={W - PAD.right} y1={zero - v * s} y2={zero - v * s} stroke="#C9C4B8" strokeWidth={v === 0 ? 0 : 0.5} />
                <text x={PAD.left - 6} y={zero - v * s + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#83888C">{v > 0 ? `+${v}` : v}</text>
              </g>
            ))}
            {win.map((m, i) => {
              const h = Math.min(plotH / 2, Math.abs(m.value) * s);
              return <rect key={m.month} x={PAD.left + i * bw + 2} y={m.value >= 0 ? zero - h : zero} width={bw - 4} height={Math.max(h, 0.5)} fill={fill(m.value)} />;
            })}
            <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#16181A" strokeWidth={0.75} />
            {win.map((m, i) => m.month.endsWith("-01") ? (
              <text key={m.month} x={PAD.left + i * bw + bw / 2} y={H - 5} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#55595C">{m.month.slice(0, 4)}</text>
            ) : null)}
          </svg>
          <p className="meta m-0 text-ink-3" style={{ fontFamily: "var(--font-sans)", fontSize: 13 }}>
            The <Term k="soi">SOI</Term>: standardised Tahiti − Darwin sea-level pressure, the atmospheric half of ENSO. Negative values mean the <Term k="walker">Walker circulation</Term> has weakened, as it does during El Niño; sustained values beyond ±1 indicate a coupled event. Grey band: the full 1951–present range for that calendar month.
          </p>
        </div>
      )}
    </Plate>
  );
}
