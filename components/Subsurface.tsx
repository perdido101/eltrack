"use client";
import { useFeed } from "@/lib/useFeed";
import { HEAT_BANDS, type HeatContentData } from "@/lib/sources/heatContent";
import { rampColor } from "@/lib/ramp";
import { longDate } from "@/lib/words";
import { Card, stateOf } from "./Card";
import { Term } from "./Term";

const W = 1000, H = 220, PAD = { top: 12, right: 8, bottom: 22, left: 36 }, YMAX = 3.5;

function answer(d: HeatContentData): string {
  const v = d.latest.values[2];
  if (d.maxEast.month === d.latest.month) return "More than at any time since measurements began in 1979.";
  if (v >= 1.5) return "A lot — this is the fuel for the months ahead.";
  if (v >= 0.5) return "Above normal.";
  if (v > -0.5) return "About normal.";
  return "Below normal — the ocean is running down its reserve.";
}

export function Subsurface() {
  const feed = useFeed<HeatContentData>("heat-content", 6 * 3600_000);
  const d = feed.data;
  const series = d?.series ?? [];
  const plotW = W - PAD.left - PAD.right, plotH = H - PAD.top - PAD.bottom;
  const zero = PAD.top + plotH / 2, s = plotH / 2 / YMAX, bw = series.length ? plotW / series.length : 1;
  const v = d?.latest.values[2] ?? 0;

  return (
    <Card
      id="subsurface"
      headline="How much heat is stored under the surface?"
      lead={
        <div className="grid gap-2">
          <p className="m-0 number" style={{ fontWeight: 500 }}>{d ? answer(d) : <span className="dash" />}</p>
          {d && (
            <p className="m-0 body">
              Upper ocean, eastern Pacific: <span className="strong" style={{ color: Math.abs(v) >= 0.5 ? rampColor(v) : undefined }}>{Math.abs(v).toFixed(1)} °C {v >= 0 ? "warmer" : "cooler"} than normal</span> in {longDate(d.latest.month, false)}
              {d.maxEast.month === d.latest.month
                ? (() => { const [y, m] = d.latest.month.split("-").map(Number); const prevMonth = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, "0")}`; return d.previousRecord.month === prevMonth ? ` · up from ${d.previousRecord.value.toFixed(1)} °C last month, which was itself the record` : ` · the previous record was ${d.previousRecord.value.toFixed(1)} °C in ${longDate(d.previousRecord.month)}`; })()
                : ` · the record is ${d.maxEast.value.toFixed(1)} °C, set ${longDate(d.maxEast.month)}`}.
            </p>
          )}
        </div>
      }
      state={stateOf(feed)}
      sourceName="NOAA"
      failed="the heat content file"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source={<>Monthly, through {d ? longDate(d.latest.month, false) : "…"} · NOAA Climate Prediction Center</>}
      meaning="This is the number forecasters watch most. Warm water piled up below the surface takes months to work its way east and up — so what's stored now shows up as El Niño strength later."
      details={
        <>
          <p>Average temperature of the upper 300 m of the equatorial Pacific compared with a 1981–2010 baseline, in three bands.{d && ` Now: ${HEAT_BANDS.map((b, i) => `${d.latest.values[i].toFixed(2)} °C (${b})`).join(" · ")}.`}</p>
          <p>The chart shows the eastern band, 180°–100°W. Warm water is carried east along the <Term k="thermocline">warm layer's floor</Term> by <Term k="kelvin">Kelvin waves</Term> before it shows at the surface.</p>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Heat stored in the upper ocean of the eastern Pacific, month by month since 1979." style={{ display: "block" }}>
        {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={zero - t * s} y2={zero - t * s} stroke="#26324A" strokeWidth={t === 0 ? 0 : 0.75} />
            <text x={PAD.left - 6} y={zero - t * s + 3.5} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{t > 0 ? `+${t}` : t}{t ? "°" : ""}</text>
          </g>
        ))}
        {series.map((m, i) => {
          const val = m.values[2], h = Math.min(plotH / 2, Math.abs(val) * s);
          return <rect key={m.month} x={PAD.left + i * bw} y={val >= 0 ? zero - h : zero} width={Math.max(bw - 0.3, 0.5)} height={Math.max(h, 0.5)} fill={rampColor(val)} />;
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={zero} y2={zero} stroke="#8592A6" strokeWidth={0.75} />
        {series.map((m, i) => m.month.endsWith("-01") && +m.month.slice(0, 4) % 5 === 0 ? <text key={m.month} x={PAD.left + i * bw} y={H - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-sans)" fill="#8592A6">{m.month.slice(0, 4)}</text> : null)}
        {d && <text x={W - PAD.right} y={zero - d.maxEast.value * s - 4} textAnchor="end" fontSize="11" fontFamily="var(--font-sans)" fill="#B7C0CE">Record · {longDate(d.maxEast.month)}</text>}
      </svg>
      <p className="caption m-0">Temperature of the top 300 m of the eastern equatorial Pacific compared with normal, month by month since 1979.</p>
    </Card>
  );
}
