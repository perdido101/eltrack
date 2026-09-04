"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFeed } from "@/lib/useFeed";
import type { OniData, OniEvent, OniRow } from "@/lib/sources/oni";
import { phaseFor, strengthFor } from "@/lib/enso";
import { rampColor, rampTextColor } from "@/lib/ramp";
import { seasonRange, longDate, vsNormal, strengthLower } from "@/lib/words";
import { Card, stateOf } from "./Card";

const W = 1000, H = 280, PAD = { top: 12, right: 8, bottom: 22, left: 40 }, YMAX = 3;
const signed = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} °C`;

function months(a: string, b: string) {
  const [ay, am] = a.split("-").map(Number), [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am) + 1;
}

export function Compare() {
  const feed = useFeed<OniData>("oni", 6 * 3600_000);
  const d = feed.data;
  const series = d?.series ?? [];
  const events = d?.events ?? [];
  const [range, setRange] = useState<[number, number] | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [selected, setSelected] = useState<OniEvent | null>(null);
  const [showLaNina, setShowLaNina] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x0: number; x1: number } | null>(null);
  const [dragBox, setDragBox] = useState<[number, number] | null>(null);
  const uid = useId();

  const n = series.length;
  const [i0, i1] = range ?? [0, Math.max(n - 1, 0)];
  const visible = series.slice(i0, i1 + 1);
  const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;
  const zeroY = PAD.top + plotH / 2, yScale = plotH / 2 / YMAX;
  const bw = visible.length ? plotW / visible.length : 0;
  const xOf = (idx: number) => PAD.left + (idx - i0) * bw;
  const centreIdx = (iso: string) => series.findIndex((r) => r.centre === iso);

  const idxAt = (clientX: number) => {
    const el = svgRef.current;
    if (!el || !visible.length) return i0;
    const r = el.getBoundingClientRect();
    return Math.min(i1, Math.max(i0, i0 + Math.floor((((clientX - r.left) / r.width) * W - PAD.left) / bw)));
  };
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => { const i = idxAt(e.clientX); drag.current = { x0: i, x1: i }; setDragBox([i, i]); e.currentTarget.setPointerCapture(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => { const i = idxAt(e.clientX); setCursor(i); if (drag.current) { drag.current.x1 = i; setDragBox([drag.current.x0, i]); } };
  const onPointerUp = () => {
    if (!drag.current) return;
    const a = Math.min(drag.current.x0, drag.current.x1), b = Math.max(drag.current.x0, drag.current.x1);
    if (b - a >= 12) setRange([a, b]);
    else {
      // A tap: select the event under the pointer, if any.
      const row = series[a];
      const ev = row ? events.find((e) => e.start <= row.centre && row.centre <= e.end) ?? null : null;
      selectEvent(ev && ev.start === selected?.start ? null : ev);
    }
    drag.current = null; setDragBox(null);
  };
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    const c = cursor ?? i1, step = e.shiftKey ? 12 : 1;
    if (e.key === "ArrowLeft") { setCursor(Math.max(i0, c - step)); e.preventDefault(); }
    if (e.key === "ArrowRight") { setCursor(Math.min(i1, c + step)); e.preventDefault(); }
    if (e.key === "Home") { setCursor(i0); e.preventDefault(); }
    if (e.key === "End") { setCursor(i1); e.preventDefault(); }
    if (e.key === "Escape") { setRange(null); setSelected(null); }
  };
  const selectEvent = (ev: OniEvent | null) => {
    setSelected(ev);
    if (!ev) return;
    const a = centreIdx(ev.start), b = centreIdx(ev.end);
    if (a >= 0 && b >= 0) setRange([Math.max(0, a - 24), Math.min(n - 1, b + 24)]);
  };
  useEffect(() => { if (cursor != null && (cursor < i0 || cursor > i1)) setCursor(null); }, [i0, i1, cursor]);

  const ticks = useMemo(() => {
    const out: { idx: number; year: number }[] = [];
    for (let k = i0; k <= i1 && k < n; k++) if (series[k].season === "DJF" && series[k].year % 10 === 0) out.push({ idx: k, year: series[k].year });
    if (out.length < 3) {
      out.length = 0;
      for (let k = i0; k <= i1 && k < n; k++) if (series[k].season === "DJF") out.push({ idx: k, year: series[k].year });
      if (out.length > 14) return out.filter((_, j) => j % Math.ceil(out.length / 14) === 0);
    }
    return out;
  }, [series, i0, i1, n]);

  const readout: OniRow | undefined = cursor != null ? series[cursor] : undefined;
  const rows = events.filter((e) => showLaNina || e.phase === "El Niño").slice().reverse();
  const latest = d?.latest;
  const v = latest?.anom ?? 0;
  const lead = !d ? "" : d.current.phase === "Neutral"
    ? "Nothing is underway right now. The chart shows every El Niño and La Niña since 1950."
    : d.comparison.kind === "record"
      ? `Today's reading is the strongest ${d.current.phase} in the record, ahead of every event since 1950.`
      : `Today's reading is already stronger than ${d.rankAmongEvents.stronger} of the ${d.rankAmongEvents.total} ${d.current.phase}s since 1950.${(() => { const big = events.filter((e) => e.phase === d.current.phase && Math.abs(e.peak) > Math.abs(v)).sort((a, b) => Math.abs(b.peak) - Math.abs(a.peak)).slice(0, 2); return big.length ? ` It hasn't yet passed the biggest — ${big.map((e) => `${e.start.slice(0, 4)}–${e.end.slice(2, 4)}`).join(" and ")} peaked at ${signed(big[big.length - 1].peak)} or more.` : ""; })()}`;
  const veryStrong = events.filter((e) => e.phase === "El Niño" && e.strength === "Very Strong");

  return (
    <Card
      id="compare"
      headline="How this compares with past El Niños"
      lead={<p className="m-0 body" style={{ fontSize: 18 }}>{lead || <span className="dash" />}</p>}
      state={stateOf(feed)}
      sourceName="NOAA"
      failed="the Oceanic Niño Index file"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source="Monthly since 1950 · NOAA Climate Prediction Center"
      meaning={`Only ${veryStrong.length || "three"} El Niños since 1950 reached “very strong”: ${veryStrong.map((e) => `${e.start.slice(0, 4)}–${e.end.slice(2, 4)}`).join(", ") || "1982–83, 1997–98 and 2015–16"}. Each one made global headlines for floods, droughts and heat.`}
      details={
        <>
          <p>The chart is the Oceanic Niño Index (see the first panel), one bar per three-month period, coloured by how far from normal it was.</p>
          <p>Shading marks episodes by NOAA's rule: five three-month periods in a row at or beyond 0.5 °C. Strength is by peak value. "Lasted" counts months from the centre of the first period to the centre of the last.</p>
          <p>The current run appears in the table once it reaches five periods.</p>
        </>
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1" style={{ minHeight: 22 }}>
        <p className="caption m-0" aria-live="polite">
          {readout ? `${seasonRange(readout.season, readout.year)} · ${vsNormal(readout.anom)} · ${strengthLower(strengthFor(readout.anom))} ${phaseFor(readout.anom)}`.replace(/\s+/g, " ")
            : n ? `Showing ${longDate(series[i0].centre)} to ${longDate(series[i1].centre)}` : ""}
        </p>
        <p className="caption m-0">Drag to zoom · tap a shaded area to select it · Esc to reset</p>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", touchAction: "pan-y", cursor: "crosshair", userSelect: "none" }} role="application"
        aria-label="El Niño history since 1950. Use arrow keys to step through, Escape to reset." tabIndex={0}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={() => { if (!drag.current) setCursor(null); }} onKeyDown={onKeyDown}>
        {events.map((ev) => {
          const a = centreIdx(ev.start), b = centreIdx(ev.end);
          if (a < 0 || b < i0 || a > i1) return null;
          const x0 = xOf(Math.max(a, i0)), x1 = xOf(Math.min(b, i1)) + bw;
          const sel = selected?.start === ev.start;
          return <rect key={ev.start} x={x0} y={PAD.top} width={x1 - x0} height={plotH} fill={rampColor(ev.phase === "El Niño" ? 1.5 : -1.5)} fillOpacity={sel ? 0.28 : 0.12} stroke={sel ? "#EEF2F7" : "none"} strokeWidth={1.25} />;
        })}
        {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={zeroY - t * yScale} y2={zeroY - t * yScale} stroke="#26324A" strokeWidth={t === 0 ? 0 : 0.75} />
            <text x={PAD.left - 6} y={zeroY - t * yScale + 3.5} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{t > 0 ? `+${t}` : t}{t ? "°" : ""}</text>
          </g>
        ))}
        {visible.map((r, j) => {
          const h = Math.min(plotH / 2, Math.abs(r.anom) * yScale);
          return <rect key={r.centre} x={PAD.left + j * bw} y={r.anom >= 0 ? zeroY - h : zeroY} width={Math.max(bw - (bw > 3 ? 0.6 : 0), 0.4)} height={Math.max(h, 0.5)} fill={rampColor(r.anom)} />;
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={zeroY} y2={zeroY} stroke="#8592A6" strokeWidth={0.75} />
        {ticks.map((t) => (
          <text key={t.year} x={xOf(t.idx)} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{t.year}</text>
        ))}
        {cursor != null && cursor >= i0 && cursor <= i1 && <rect x={xOf(cursor)} y={PAD.top} width={Math.max(bw, 1)} height={plotH} fill="none" stroke="#EEF2F7" strokeWidth={1} />}
        {dragBox && <rect x={xOf(Math.min(...dragBox))} y={PAD.top} width={Math.max(xOf(Math.max(...dragBox)) + bw - xOf(Math.min(...dragBox)), 1)} height={plotH} fill="#EEF2F7" fillOpacity={0.08} stroke="#EEF2F7" strokeWidth={0.75} />}
        {!n && <text x={W / 2} y={zeroY - 8} textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="#8592A6">Loading the record…</text>}
      </svg>
      <div className="grid gap-1" style={{ paddingLeft: `${(PAD.left / W) * 100}%`, paddingRight: `${(PAD.right / W) * 100}%` }}>
        <label className="sr-only" htmlFor={`${uid}-from`}>Zoom start</label>
        <input id={`${uid}-from`} className="brush" type="range" min={0} max={Math.max(n - 1, 0)} value={i0} disabled={!n} onChange={(e) => setRange([Math.min(Number(e.target.value), i1 - 12), i1])} />
        <label className="sr-only" htmlFor={`${uid}-to`}>Zoom end</label>
        <input id={`${uid}-to`} className="brush" type="range" min={0} max={Math.max(n - 1, 0)} value={i1} disabled={!n} onChange={(e) => setRange([i0, Math.max(Number(e.target.value), i0 + 12)])} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="caption m-0">Shaded areas are past El Niño (red) and La Niña (blue) events. Tap one to compare it with today.</p>
        <button type="button" className="btn" onClick={() => { setRange(null); setSelected(null); }} disabled={!range && !selected}>Show everything</button>
      </div>

      <div className="grid gap-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Every El Niño since 1950</h3>
          <button type="button" className="btn" aria-pressed={showLaNina} onClick={() => setShowLaNina((v) => !v)}>Show La Niña too</button>
        </div>
        <div className="well">
          <table style={{ minWidth: 560 }}>
            <thead><tr><th>When</th><th>Peak</th><th>Lasted</th><th>Strength</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((e) => {
                const sel = selected?.start === e.start;
                return (
                  <tr key={e.start} className="row-btn" role="button" tabIndex={0} aria-selected={sel}
                    onClick={() => selectEvent(sel ? null : e)}
                    onKeyDown={(k) => { if (k.key === "Enter" || k.key === " ") { k.preventDefault(); selectEvent(sel ? null : e); } }}>
                    <td className="strong">{longDate(e.start)} – {longDate(e.end)}</td>
                    <td><span className="inline-block rounded-md px-2 py-0.5" style={{ background: rampColor(e.peak), color: rampTextColor(e.peak), fontWeight: 600 }}>{signed(e.peak)}</span></td>
                    <td>{months(e.start, e.end)} months</td>
                    <td>{e.strength === "Very Strong" ? "Very strong" : e.strength} {e.phase}</td>
                  </tr>
                );
              }) : <tr><td colSpan={4} className="dash" /></tr>}
            </tbody>
          </table>
        </div>
        <p className="caption m-0">Tap a row to frame it on the chart.</p>
      </div>
    </Card>
  );
}
