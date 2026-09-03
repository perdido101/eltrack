"use client";
import { useFeed } from "@/lib/useFeed";
import type { GlobalSstData } from "@/lib/sources/globalSst";
import { fmtAnom } from "@/lib/enso";
import { rampColor } from "@/lib/ramp";
import { fmtDate } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";

const W = 1000, H = 220, PAD = { top: 12, right: 8, bottom: 20, left: 40 };

function path(values: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "", pen = false;
  values.forEach((v, i) => {
    if (v == null) { pen = false; return; }
    d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    pen = true;
  });
  return d;
}

export function GlobalSst() {
  const feed = useFeed<GlobalSstData>("global-sst", 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const d = feed.data;

  const all = d ? [...d.year.map((p) => p.value), ...d.clim, ...d.priorRecord].filter((v): v is number => v != null) : [];
  const lo = all.length ? Math.floor(Math.min(...all) * 10) / 10 - 0.1 : 19.5;
  const hi = all.length ? Math.ceil(Math.max(...all) * 10) / 10 + 0.1 : 21.5;
  const n = d?.year.length ?? 365;
  const x = (i: number) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);
  const ticks = [];
  for (let t = Math.ceil(lo * 2) / 2; t <= hi; t += 0.5) ticks.push(+t.toFixed(1));

  return (
    <Plate
      id="global-sst"
      title="Global sea surface · daily mean, 60°S–60°N"
      state={state}
      provenance={<Provenance source="NOAA OISST v2.1 · Climate Reanalyzer" obs={d ? fmtDate(d.latest.date) : undefined} refresh="1H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="Climate Reanalyzer" file="oisst2.1_world2_sst_day.json" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <p className="label-xs m-0 text-ink-3">Latest{d?.latest.preliminary ? " · preliminary" : ""}</p>
              <p className="value-lg m-0 mt-1">{d ? `${d.latest.value.toFixed(2)} °C` : <span className="dash" />}</p>
            </div>
            <div>
              <p className="label-xs m-0 text-ink-3">Anomaly vs 1991–2020</p>
              <p className="value-lg m-0 mt-1 inline-block px-2" style={{ background: d && Number.isFinite(d.anom) ? rampColor(d.anom) : "transparent", color: d && Math.abs(d.anom) >= 1.5 ? "#F4F1EA" : "inherit" }}>
                {d && Number.isFinite(d.anom) ? `${fmtAnom(d.anom, 2)} °C` : <span className="dash" />}
              </p>
            </div>
            <div>
              <p className="label-xs m-0 text-ink-3">Record daily value</p>
              <p className="value-sm m-0 mt-2">{d ? `${d.record.value.toFixed(2)} °C · ${fmtDate(d.record.date)}` : <span className="dash" />}</p>
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Global mean sea-surface temperature over the last year against the 1991–2020 climatology and the prior daily record." style={{ display: "block" }}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#C9C4B8" strokeWidth={0.5} />
                <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#83888C">{t.toFixed(1)}</text>
              </g>
            ))}
            {d && (
              <>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(d.record.value)} y2={y(d.record.value)} stroke="#16181A" strokeWidth={0.75} strokeDasharray="1 3" />
                <text x={W - PAD.right} y={y(d.record.value) - 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#55595C">RECORD {d.record.value.toFixed(2)} · {fmtDate(d.record.date)}</text>
                <path d={path(d.priorRecord, x, y)} fill="none" stroke="#83888C" strokeWidth={1} strokeDasharray="3 3" />
                <path d={path(d.clim, x, y)} fill="none" stroke="#83888C" strokeWidth={1} />
                <path d={path(d.year.map((p) => p.value), x, y)} fill="none" stroke="#16181A" strokeWidth={1.5} />
                {[0, Math.floor(n / 2), n - 1].map((i) => (
                  <text key={i} x={x(i)} y={H - 5} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="10" fontFamily="var(--font-mono)" fill="#55595C">{fmtDate(d.year[i].date)}</text>
                ))}
              </>
            )}
          </svg>
          <p className="meta m-0 text-ink-3">
            Solid ink: last 365 days. Solid grey: 1991–2020 daily mean. Dashed grey: highest value for that calendar day in any earlier year. Dotted: all-time daily record.
          </p>
        </div>
      )}
    </Plate>
  );
}
