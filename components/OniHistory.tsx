"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFeed } from "@/lib/useFeed";
import type { OniData, OniRow } from "@/lib/sources/oni";
import { fmtAnom, phaseFor, strengthFor } from "@/lib/enso";
import { rampColor } from "@/lib/ramp";
import { fmtMonth } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";

const W = 1000;
const H = 280;
const PAD = { top: 12, right: 8, bottom: 22, left: 34 };
const YMAX = 3;

export function OniHistory() {
  const feed = useFeed<OniData>("oni", 6 * 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const series = feed.data?.series ?? [];
  const events = feed.data?.events ?? [];

  const [range, setRange] = useState<[number, number] | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x0: number; x1: number } | null>(null);
  const [dragBox, setDragBox] = useState<[number, number] | null>(null);
  const uid = useId();

  const n = series.length;
  const [i0, i1] = range ?? [0, Math.max(n - 1, 0)];
  const visible = series.slice(i0, i1 + 1);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const zeroY = PAD.top + plotH / 2;
  const yScale = plotH / 2 / YMAX;
  const bw = visible.length ? plotW / visible.length : 0;
  const xOf = (idx: number) => PAD.left + (idx - i0) * bw;

  // Index → x in SVG units, and back, for pointer handling.
  const idxAt = (clientX: number): number => {
    const el = svgRef.current;
    if (!el || !visible.length) return i0;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * W;
    return Math.min(i1, Math.max(i0, i0 + Math.floor((x - PAD.left) / bw)));
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const idx = idxAt(e.clientX);
    drag.current = { x0: idx, x1: idx };
    setDragBox([idx, idx]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const idx = idxAt(e.clientX);
    setCursor(idx);
    if (drag.current) {
      drag.current.x1 = idx;
      setDragBox([drag.current.x0, idx]);
    }
  };
  const onPointerUp = () => {
    if (drag.current) {
      const a = Math.min(drag.current.x0, drag.current.x1);
      const b = Math.max(drag.current.x0, drag.current.x1);
      if (b - a >= 12) setRange([a, b]);
      drag.current = null;
      setDragBox(null);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    const c = cursor ?? i1;
    const step = e.shiftKey ? 12 : 1;
    if (e.key === "ArrowLeft") { setCursor(Math.max(i0, c - step)); e.preventDefault(); }
    if (e.key === "ArrowRight") { setCursor(Math.min(i1, c + step)); e.preventDefault(); }
    if (e.key === "Home") { setCursor(i0); e.preventDefault(); }
    if (e.key === "End") { setCursor(i1); e.preventDefault(); }
    if (e.key === "Escape") { setRange(null); }
  };

  // Keep the cursor inside the visible window when the range changes.
  useEffect(() => {
    if (cursor != null && (cursor < i0 || cursor > i1)) setCursor(null);
  }, [i0, i1, cursor]);

  const decades = useMemo(() => {
    const out: { idx: number; year: number }[] = [];
    let last = -1;
    for (let k = i0; k <= i1 && k < n; k++) {
      const y = series[k].year;
      if (y % 10 === 0 && y !== last && series[k].season === "DJF") { out.push({ idx: k, year: y }); last = y; }
    }
    // Fall back to every year when zoomed in far enough.
    if (out.length < 3) {
      out.length = 0;
      for (let k = i0; k <= i1 && k < n; k++) if (series[k].season === "DJF") out.push({ idx: k, year: series[k].year });
      if (out.length > 14) return out.filter((_, j) => j % Math.ceil(out.length / 14) === 0);
    }
    return out;
  }, [series, i0, i1, n]);

  const readout: OniRow | undefined = cursor != null ? series[cursor] : undefined;
  const centreIdx = (iso: string) => series.findIndex((r) => r.centre === iso);

  return (
    <Plate
      id="oni-history"
      title="Oceanic Niño Index · 1950 → present"
      state={state}
      provenance={<Provenance source="NOAA CPC" obs={feed.data ? `${feed.data.latest.season} ${feed.data.latest.year}` : undefined} refresh="6H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CPC" file="oni.ascii.txt" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-3">
          {/* Readout — replaces a floating tooltip */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1" style={{ minHeight: 22 }}>
            <p className="meta m-0" aria-live="polite">
              {readout
                ? `${readout.season} ${readout.year}  ${fmtAnom(readout.anom, 2)}  ${strengthFor(readout.anom) ?? ""} ${phaseFor(readout.anom)}`.replace(/\s+/g, " ")
                : n ? `${fmtMonth(series[i0].centre)} → ${fmtMonth(series[i1].centre)} · ${visible.length} seasons` : ""}
            </p>
            <p className="meta m-0 text-ink-3">Drag to zoom · arrows to step · Esc to reset</p>
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block", touchAction: "pan-y", cursor: "crosshair", userSelect: "none" }}
            role="application"
            aria-label="ONI history bar chart. Use arrow keys to step through seasons."
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={() => { if (!drag.current) setCursor(null); }}
            onKeyDown={onKeyDown}
          >
            <defs>
              <pattern id={`${uid}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#16181A" strokeOpacity="0.14" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Event bands */}
            {events.map((ev) => {
              const a = centreIdx(ev.start);
              const b = centreIdx(ev.end);
              if (a < 0 || b < i0 || a > i1) return null;
              const x0 = xOf(Math.max(a, i0));
              const x1 = xOf(Math.min(b, i1)) + bw;
              return <rect key={ev.start} x={x0} y={PAD.top} width={x1 - x0} height={plotH} fill={`url(#${uid}-hatch)`} />;
            })}

            {/* Y grid and thresholds */}
            {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
              <g key={v}>
                <line x1={PAD.left} x2={W - PAD.right} y1={zeroY - v * yScale} y2={zeroY - v * yScale} stroke="#C9C4B8" strokeWidth={v === 0 ? 0 : 0.5} />
                <text x={PAD.left - 6} y={zeroY - v * yScale + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="#83888C">{v > 0 ? `+${v}` : v}</text>
              </g>
            ))}
            {[0.5, -0.5].map((v) => (
              <line key={v} x1={PAD.left} x2={W - PAD.right} y1={zeroY - v * yScale} y2={zeroY - v * yScale} stroke="#16181A" strokeWidth={0.5} strokeDasharray="2 3" />
            ))}

            {/* Bars */}
            {visible.map((r, j) => {
              const h = Math.min(plotH / 2, Math.abs(r.anom) * yScale);
              return (
                <rect
                  key={r.centre}
                  x={PAD.left + j * bw}
                  y={r.anom >= 0 ? zeroY - h : zeroY}
                  width={Math.max(bw - (bw > 3 ? 0.6 : 0), 0.4)}
                  height={Math.max(h, 0.5)}
                  fill={rampColor(r.anom)}
                />
              );
            })}

            <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY} stroke="#16181A" strokeWidth={0.75} />

            {/* Decade ticks */}
            {decades.map((d) => (
              <g key={d.year}>
                <line x1={xOf(d.idx)} x2={xOf(d.idx)} y1={PAD.top + plotH} y2={PAD.top + plotH + 4} stroke="#16181A" strokeWidth={0.75} />
                <text x={xOf(d.idx)} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="#55595C">{d.year}</text>
              </g>
            ))}

            {/* Cursor */}
            {cursor != null && cursor >= i0 && cursor <= i1 && (
              <rect x={xOf(cursor)} y={PAD.top} width={Math.max(bw, 1)} height={plotH} fill="none" stroke="#16181A" strokeWidth={1} />
            )}

            {/* Drag box */}
            {dragBox && (
              <rect
                x={xOf(Math.min(...dragBox))}
                y={PAD.top}
                width={Math.max(xOf(Math.max(...dragBox)) + bw - xOf(Math.min(...dragBox)), 1)}
                height={plotH}
                fill="#16181A"
                fillOpacity={0.08}
                stroke="#16181A"
                strokeWidth={0.75}
              />
            )}

            {/* Skeleton axes carry the plate's shape before data lands */}
            {!n && <text x={W / 2} y={zeroY - 8} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="#83888C">———</text>}
          </svg>

          {/* Keyboard-accessible zoom */}
          <div className="grid gap-1" style={{ paddingLeft: PAD.left / W * 100 + "%", paddingRight: PAD.right / W * 100 + "%" }}>
            <label className="sr-only" htmlFor={`${uid}-from`}>Zoom start</label>
            <input id={`${uid}-from`} className="brush" type="range" min={0} max={Math.max(n - 1, 0)} value={i0} disabled={!n}
              onChange={(e) => setRange([Math.min(Number(e.target.value), i1 - 12), i1])} />
            <label className="sr-only" htmlFor={`${uid}-to`}>Zoom end</label>
            <input id={`${uid}-to`} className="brush" type="range" min={0} max={Math.max(n - 1, 0)} value={i1} disabled={!n}
              onChange={(e) => setRange([i0, Math.max(Number(e.target.value), i0 + 12)])} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="meta m-0 text-ink-3">
              Hatched bands mark episodes of five or more consecutive seasons beyond ±0.5. Dashed lines at ±0.5.
            </p>
            <button type="button" className="tbtn" onClick={() => setRange(null)} disabled={!range}>Reset zoom</button>
          </div>
        </div>
      )}
    </Plate>
  );
}
