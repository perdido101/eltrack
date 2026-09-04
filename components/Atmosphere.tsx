"use client";
import { useFeed } from "@/lib/useFeed";
import type { SoiData } from "@/lib/sources/soi";
import { rampColor } from "@/lib/ramp";
import { longDate } from "@/lib/words";
import { Card, stateOf } from "./Card";
import { Term } from "./Term";

const W = 1000, H = 220, PAD = { top: 12, right: 8, bottom: 22, left: 36 }, YMAX = 4, MONTHS = 36;

function answer(d: SoiData): string {
  const v = d.latest.value;
  if (v <= -1 && d.percentile <= 0.05) return d.lowestSince ? `Yes — the air pressure pattern over the Pacific is the most El Niño-like it's been since ${longDate(d.lowestSince)}.` : "Yes — the air pressure pattern over the Pacific is the most El Niño-like it's been since records began in 1951.";
  if (v <= -1) return "Yes — the pressure pattern over the Pacific has flipped into El Niño mode.";
  if (v <= -0.5) return "Partly — the atmosphere is leaning El Niño's way.";
  if (v < 0.5) return "Not yet — the atmosphere is close to normal.";
  return "The atmosphere is in La Niña mode.";
}

export function Atmosphere() {
  const feed = useFeed<SoiData>("soi", 6 * 3600_000);
  const d = feed.data;
  const win = d ? d.series.slice(-MONTHS) : [];
  const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;
  const zero = PAD.top + plotH / 2, s = plotH / 2 / YMAX, bw = plotW / MONTHS;
  const fill = (v: number) => rampColor(-v * 0.75);
  const v = d?.latest.value ?? 0;

  return (
    <Card
      id="atmosphere"
      headline="Is the atmosphere joining in?"
      lead={
        <div className="grid gap-2">
          <p className="m-0 number" style={{ fontWeight: 500 }}>{d ? answer(d) : <span className="dash" />}</p>
          {d && <p className="m-0 body">Pressure index: <span className="strong">{v > 0 ? "+" : v < 0 ? "−" : ""}{Math.abs(v).toFixed(1)}</span> for {longDate(d.latest.month, false)} · lower than {Math.round(100 - d.percentile * 100)}% of all months since 1951.</p>}
        </div>
      }
      state={stateOf(feed)}
      sourceName="NOAA"
      failed="the Southern Oscillation Index file"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source={<>Monthly, through {d ? longDate(d.latest.month, false) : "…"} · NOAA Climate Prediction Center (Tahiti − Darwin pressure)</>}
      meaning={v <= -0.5
        ? "When ocean and atmosphere lock together like this, the event usually strengthens: weaker trade winds let more warm water slide east, which weakens the winds further."
        : v >= 0.5 ? "Stronger trade winds pile warm water up in the west and pull cold water to the surface in the east — the La Niña pattern."
        : "El Niño needs the atmosphere to respond. Until the winds shift, ocean warmth on its own tends to fade."}
      details={
        <>
          <p>The <Term k="soi">Southern Oscillation Index</Term>: the standardised difference in sea-level air pressure between Tahiti and Darwin. Sustained negative values accompany El Niño and a weakened <Term k="walker">Walker circulation</Term>; values beyond ±1 for several months indicate a coupled event.</p>
          <p>Australia's Bureau of Meteorology publishes a 30-day version but doesn't serve it to sites like this one, so NOAA's monthly series is shown.</p>
          {d && <p><strong>Record low:</strong> {d.min.value.toFixed(1)}, {longDate(d.min.month)}.</p>}
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monthly pressure index for the last three years, with each month's historical range." style={{ display: "block" }}>
        {d && win.map((m, i) => {
          const r = d.rangeByMonth[+m.month.slice(5) - 1];
          return <rect key={m.month} x={PAD.left + i * bw} y={zero - Math.min(YMAX, r.max) * s} width={bw} height={(Math.min(YMAX, r.max) - Math.max(-YMAX, r.min)) * s} fill="#EEF2F7" fillOpacity={0.06} />;
        })}
        {[-4, -2, 0, 2, 4].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={zero - t * s} y2={zero - t * s} stroke="#26324A" strokeWidth={t === 0 ? 0 : 0.75} />
            <text x={PAD.left - 6} y={zero - t * s + 3.5} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{t > 0 ? `+${t}` : t}</text>
          </g>
        ))}
        {win.map((m, i) => {
          const h = Math.min(plotH / 2, Math.abs(m.value) * s);
          return <rect key={m.month} x={PAD.left + i * bw + 2} y={m.value >= 0 ? zero - h : zero} width={bw - 4} height={Math.max(h, 0.5)} rx={1.5} fill={fill(m.value)} />;
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#8592A6" strokeWidth={0.75} />
        {win.map((m, i) => m.month.endsWith("-01") ? <text key={m.month} x={PAD.left + i * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{m.month.slice(0, 4)}</text> : null)}
        <text x={W - PAD.right} y={zero + 14} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">↓ El Niño direction</text>
        <text x={W - PAD.right} y={zero - 8} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">↑ La Niña direction</text>
      </svg>
      <p className="caption m-0">Bars below the line are the El Niño direction. The grey band shows how far each month has ever swung since 1951.</p>
    </Card>
  );
}
