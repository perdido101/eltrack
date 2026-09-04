"use client";
import { useId, useMemo, useState } from "react";

const axisMoney = (v: number) => v >= 1e6 ? `$${v / 1e6}m` : v >= 1e3 ? `$${v / 1e3}k` : v >= 1 ? `$${v}` : `$${v}`;
import { useFeed } from "@/lib/useFeed";
import type { OniData } from "@/lib/sources/oni";
import type { BtcData } from "@/lib/sources/btc";
import type { TokenData } from "@/lib/sources/token";
import { rampColor } from "@/lib/ramp";
import { longDate } from "@/lib/words";
import { PROJECT } from "@/config/project";
import { Card, stateOf } from "./Card";
import { CopyButton } from "./CopyButton";

const W = 1000, H = 260, PAD = { top: 14, right: 56, bottom: 22, left: 40 };

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 3) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxy / Math.sqrt(sxx * syy);
}
const money = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}b` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}m` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}k` : `$${v.toFixed(0)}`;
const price = (v: number) => v >= 1 ? `$${v.toFixed(2)}` : `$${v.toPrecision(3)}`;

export function Market() {
  const oni = useFeed<OniData>("oni", 6 * 3600_000);
  const btc = useFeed<BtcData>("btc", 3600_000);
  const token = useFeed<TokenData>("token", 30_000);
  const [lag, setLag] = useState(0);
  const uid = useId();

  // Align ONI (by centre month) with bitcoin's monthly log return `lag` months later.
  const aligned = useMemo(() => {
    if (!oni.data || !btc.data) return null;
    const b = btc.data.series;
    const idx = new Map(b.map((m, i) => [m.month, i]));
    const rows: { month: string; oni: number; price: number; ret: number | null }[] = [];
    for (const r of oni.data.series) {
      const i = idx.get(r.centre);
      if (i == null) continue;
      const j = i + lag;
      const ret = j < b.length && j >= 1 ? Math.log(b[j].price / b[j - 1].price) : null;
      rows.push({ month: r.centre, oni: r.anom, price: b[i].price, ret });
    }
    const pairs = rows.filter((r) => r.ret != null);
    return { rows, r: pearson(pairs.map((p) => p.oni), pairs.map((p) => p.ret!)), n: pairs.length };
  }, [oni.data, btc.data, lag]);

  const rows = aligned?.rows ?? [];
  const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;
  const zero = PAD.top + plotH / 2, s = plotH / 2 / 3;
  const bw = rows.length ? plotW / rows.length : 1;
  const lp = rows.map((r) => Math.log10(r.price));
  const lo = lp.length ? Math.floor(Math.min(...lp)) : 0, hi = lp.length ? Math.ceil(Math.max(...lp)) : 5;
  const yP = (p: number) => PAD.top + (1 - (Math.log10(p) - lo) / (hi - lo)) * plotH;
  const state = oni.isLoading || btc.isLoading ? "loading" : (oni.error && !oni.data) || (btc.error && !btc.data) ? "lost" : "ok";
  const t = token.data;

  return (
    <Card
      id="market"
      headline="Some people track other anomalies against the Pacific"
      lead={<p className="m-0 body" style={{ fontSize: 18 }}>A curiosity, not a claim: the El Niño index plotted against the price of bitcoin, with a slider to shift one against the other.</p>}
      state={state}
      sourceName="one of the price feeds"
      failed="the bitcoin history or the ONI file"
      fetchedAt={token.fetchedAt ?? btc.fetchedAt}
      source="NOAA ONI · Blockchain.com · DexScreener"
      meaning="Four strong El Niños in bitcoin's lifetime aren't enough to prove anything. Move the slider and watch the number wander."
      details={
        <>
          <p>Bars: the Oceanic Niño Index by centre month. Line: bitcoin's monthly average price on a log scale (Blockchain.com market price, daily since 2009).</p>
          <p>The correlation is Pearson's r between the ONI value and bitcoin's monthly log return {lag} month{lag === 1 ? "" : "s"} later, over every month both series cover. Returns rather than prices, because a rising price correlates with anything that also rose.</p>
          <p>The token row is from DexScreener (the most liquid pair), with pump.fun as fallback. Neither publishes a holder count, so none is shown.</p>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 number" style={{ fontSize: "clamp(17px, 2.2vw, 22px)" }} aria-live="polite">
          {aligned && Number.isFinite(aligned.r) ? <>r = {aligned.r.toFixed(2)} at {lag}-month lag, n = {aligned.n}</> : <span className="dash" />}
        </p>
        <label className="flex items-center gap-3 caption" htmlFor={`${uid}-lag`} style={{ flex: "1 1 240px", maxWidth: 360, minWidth: 0 }}>
          <span style={{ whiteSpace: "nowrap" }}>Shift bitcoin by</span>
          <input id={`${uid}-lag`} className="brush" type="range" min={0} max={18} value={lag} onChange={(e) => setLag(Number(e.target.value))} style={{ flex: "1 1 80px", minWidth: 60 }} />
          <span className="strong" style={{ whiteSpace: "nowrap" }}>{lag} mo</span>
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="El Niño index bars with bitcoin's monthly price as a line." style={{ display: "block" }}>
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={zero - v * s} y2={zero - v * s} stroke="#26324A" strokeWidth={v === 0 ? 0 : 0.75} />
            <text x={PAD.left - 6} y={zero - v * s + 3.5} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{v > 0 ? `+${v}` : v}{v ? "°" : ""}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const h = Math.min(plotH / 2, Math.abs(r.oni) * s);
          return <rect key={r.month} x={PAD.left + i * bw} y={r.oni >= 0 ? zero - h : zero} width={Math.max(bw - 0.4, 0.5)} height={Math.max(h, 0.5)} fill={rampColor(r.oni)} />;
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#8592A6" strokeWidth={0.75} />
        <defs><clipPath id={`${uid}-clip`}><rect x={PAD.left} y={0} width={plotW} height={H} /></clipPath></defs>
        {rows.length > 1 && (
          <path clipPath={`url(#${uid}-clip)`} d={rows.map((r, i) => `${i ? "L" : "M"}${(PAD.left + i * bw + bw / 2).toFixed(1)},${yP(r.price).toFixed(1)}`).join("")} fill="none" stroke="#EEF2F7" strokeWidth={1.5} transform={lag ? `translate(${-lag * bw},0)` : undefined} />
        )}
        {Array.from({ length: hi - lo + 1 }, (_, k) => lo + k).map((e) => (
          <text key={e} x={W - PAD.right + 6} y={PAD.top + (1 - (e - lo) / (hi - lo)) * plotH + 3.5} fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{axisMoney(10 ** e)}</text>
        ))}
        {rows.filter((r) => r.month.endsWith("-01") && +r.month.slice(0, 4) % 2 === 0).map((r) => {
          const i = rows.indexOf(r);
          return <text key={r.month} x={PAD.left + i * bw} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{r.month.slice(0, 4)}</text>;
        })}
      </svg>
      <p className="caption m-0">Bars: how far the Pacific was from normal each month. White line: bitcoin's monthly price, log scale, shifted left by the slider.</p>

      <div className="well-bg flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3" style={{ fontSize: 15 }}>
        <span className="strong">{PROJECT.token.ticker}</span>
        {t ? (
          <>
            <span>{price(t.priceUsd)}</span>
            {t.change24h != null && <span style={{ color: t.change24h >= 0 ? rampColor(-1.5) : rampColor(1.5) }}>{t.change24h >= 0 ? "+" : "−"}{Math.abs(t.change24h).toFixed(1)}% today</span>}
            {t.marketCapUsd != null && <span className="caption">market cap {money(t.marketCapUsd)}</span>}
            <a href={t.chartUrl} target="_blank" rel="noopener noreferrer" className="ml-auto">View chart ↗</a>
          </>
        ) : token.error ? <span className="caption">price unavailable just now</span> : <span className="dash" />}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <code className="source well-bg px-3 py-2" style={{ overflowWrap: "anywhere", color: "var(--color-ink-2)" }}>{PROJECT.token.address}</code>
        <CopyButton text={PROJECT.token.address} />
        {btc.data && <span className="caption ml-auto">Bitcoin through {longDate(btc.data.latest.month)}</span>}
      </div>
    </Card>
  );
}
