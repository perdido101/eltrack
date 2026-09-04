"use client";
import { useFeed } from "@/lib/useFeed";
import type { GlobalSstData } from "@/lib/sources/globalSst";
import { rampColor } from "@/lib/ramp";
import { longDate, throughDate, vsNormal } from "@/lib/words";
import { Card, stateOf } from "./Card";

const W = 1000, H = 220, PAD = { top: 14, right: 8, bottom: 22, left: 44 };

function path(values: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "", pen = false;
  values.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`; pen = true; });
  return d;
}

export function GlobalSst() {
  const feed = useFeed<GlobalSstData>("global-sst", 3600_000);
  const d = feed.data;
  const all = d ? [...d.year.map((p) => p.value), ...d.clim, d.record.value].filter((v): v is number => v != null) : [];
  const lo = all.length ? Math.floor(Math.min(...all) * 10) / 10 - 0.1 : 19.5;
  const hi = all.length ? Math.ceil(Math.max(...all) * 10) / 10 + 0.1 : 21.5;
  const n = d?.year.length ?? 365;
  const x = (i: number) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);
  const ticks: number[] = [];
  for (let t = Math.ceil(lo * 2) / 2; t <= hi; t += 0.5) ticks.push(+t.toFixed(1));
  const gap = d ? d.record.value - d.latest.value : 1;
  const headline = !d ? "The whole ocean" : gap <= 0 ? "The whole ocean is at a new all-time record" : gap <= 0.1 ? "The whole ocean is near its all-time record" : `The whole ocean is ${vsNormal(d.anom)}`;

  return (
    <Card
      id="global"
      headline={headline}
      lead={d ? (
        <div className="grid gap-2">
          <p className="m-0 number"><span style={{ color: d.anom >= 1.5 ? rampColor(d.anom) : undefined }}>{d.latest.value.toFixed(2)} °C</span> <span className="body" style={{ color: "var(--color-ink-2)", fontWeight: 400 }}>{d.latest.date === d.year[d.year.length - 1].date ? throughDate(d.latest.date) : longDate(d.latest.date, false)}</span></p>
          <p className="m-0 body">The record is {d.record.value.toFixed(2)} °C, set {longDate(d.record.date)}. Today the global ocean surface is <span className="strong">{vsNormal(d.anom, 2)}</span>.</p>
        </div>
      ) : <p className="m-0 number"><span className="dash" /></p>}
      state={stateOf(feed)}
      sourceName="the ocean temperature feed"
      failed="Climate Reanalyzer's daily file"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source="Global ocean surface, measured daily · NOAA OISST via Climate Reanalyzer"
      meaning="El Niño releases heat from the Pacific into the air, so the whole planet runs warmer while it lasts. That is why El Niño years so often set global temperature records."
      details={
        <>
          <p>Daily average sea-surface temperature between 60°S and 60°N from NOAA OISST v2.1, as compiled by Climate Reanalyzer. Departure is against the 1991–2020 daily average. The most recent days are preliminary and can be revised.</p>
          <p>The solid grey line is the 1991–2020 average for each day of the year; the dotted line is the all-time daily record.</p>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Global ocean surface temperature over the last year against the 1991–2020 average and the all-time record." style={{ display: "block" }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#26324A" strokeWidth={0.75} />
            <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{t.toFixed(1)}°</text>
          </g>
        ))}
        {d && (
          <>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(d.record.value)} y2={y(d.record.value)} stroke="#EEF2F7" strokeWidth={0.75} strokeDasharray="2 4" />
            <text x={W - PAD.right} y={y(d.record.value) - 5} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#B7C0CE">Record · {longDate(d.record.date)}</text>
            <path d={path(d.clim, x, y)} fill="none" stroke="#8592A6" strokeWidth={1.25} />
            <path d={path(d.year.map((p) => p.value), x, y)} fill="none" stroke={rampColor(2)} strokeWidth={2} />
            {[0, Math.floor(n / 2), n - 1].map((i) => (
              <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{longDate(d.year[i].date)}</text>
            ))}
          </>
        )}
      </svg>
      <p className="caption m-0">Orange: the last 365 days. Grey: the 1991–2020 average for each day. Dotted: the all-time record.</p>
    </Card>
  );
}
