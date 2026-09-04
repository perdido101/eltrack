"use client";
import { useFeed } from "@/lib/useFeed";
import type { OniData } from "@/lib/sources/oni";
import type { AlertStatus } from "@/lib/sources/alertStatus";
import { STRENGTH_LADDER } from "@/lib/enso";
import { rampColor, rampGlow, rampTextColor } from "@/lib/ramp";
import { seasonRange, seasonMonths, vsNormal, strengthLower } from "@/lib/words";
import { Card, stateOf } from "./Card";
import { Term } from "./Term";

const HOUR = 3600_000;

function headlineFor(d: OniData | undefined, alert: AlertStatus | undefined): string {
  if (!d) return "Checking the Pacific…";
  const { phase, strength } = d.current;
  if (phase === "El Niño") {
    if (strength === "Strong" || strength === "Very Strong") return `El Niño is here, and it's ${strengthLower(strength)}.`;
    if (strength === "Moderate") return "El Niño is here.";
    return "A weak El Niño is underway.";
  }
  if (phase === "La Niña") {
    const s = strength === "Strong" || strength === "Very Strong" ? `, and it's ${strengthLower(strength)}` : "";
    return `La Niña is here${s}.`;
  }
  if (alert && /watch/i.test(alert.status)) return `No ${/la ni/i.test(alert.status) ? "La Niña" : "El Niño"} right now — but forecasters think one is coming.`;
  return "The Pacific is close to normal right now.";
}

function meaningFor(d: OniData | undefined): string {
  if (!d) return "";
  const { phase, strength } = d.current;
  if (phase === "El Niño") {
    return strength === "Strong" || strength === "Very Strong"
      ? "Events this strong usually reshape weather on every continent for the next six to nine months. The \"What it means for you\" section below shows where."
      : "A moderate El Niño tilts the odds toward the patterns further down the page, but doesn't guarantee them.";
  }
  if (phase === "La Niña") return "La Niña tends to push weather the opposite way from El Niño — the section further down shows where.";
  return "Nothing unusual is being driven by the Pacific right now.";
}

export function RightNow() {
  const oni = useFeed<OniData>("oni", 6 * HOUR);
  const alert = useFeed<AlertStatus>("alert", HOUR);
  const d = oni.data;
  const latest = d?.latest;
  const cur = d?.current;
  const v = latest?.anom ?? 0;
  const seasonText = latest ? seasonRange(latest.season, latest.year) : "";

  const comparison = d
    ? d.comparison.kind === "record"
      ? "The warmest reading in the record, which goes back to 1950."
      : d.comparison.kind === "since"
        ? `${v >= 0 ? "Warmest" : "Coolest"} it's been since the ${d.comparison.event.start.slice(0, 4)}–${d.comparison.event.end.slice(2, 4)} ${d.comparison.event.phase}.`
        : "Within the normal range (less than 0.5 °C from average)."
    : "";

  return (
    <Card
      id="now"
      headline={headlineFor(d, alert.data)}
      state={stateOf(oni)}
      sourceName="NOAA"
      failed="the Oceanic Niño Index file"
      lastGoodAt={oni.lastGoodAt}
      fetchedAt={oni.fetchedAt}
      source={latest ? `Based on ${seasonMonths(latest.season)} data · NOAA Climate Prediction Center` : "NOAA Climate Prediction Center"}
      meaning={meaningFor(d)}
      lead={
        <div className="grid gap-3">
          <p className="display m-0" style={{ color: latest && Math.abs(v) >= 0.5 ? rampColor(v) : undefined, textShadow: latest ? rampGlow(v) : undefined }}>
            {latest ? `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} °C` : <span className="dash" />}
          </p>
          <p className="number m-0" style={{ fontWeight: 500 }}>
            {latest ? (
              <>The central Pacific is <span className="strong">{vsNormal(v)}</span>{cur?.strength ? <> — the official “{strengthLower(cur.strength)}” range.</> : "."}</>
            ) : <span className="dash" />}
          </p>
          {comparison && <p className="m-0 body">{comparison}</p>}
        </div>
      }
      details={
        <>
          <p><strong>The number.</strong> The <Term k="oni">Oceanic Niño Index</Term>: the average sea-surface temperature in the <Term k="nino34">Niño 3.4 region</Term> (5°N–5°S, 170°W–120°W), compared with a 30-year baseline, averaged over three months. NOAA's primary El Niño measure.</p>
          <div>
            <p><strong>The ranges.</strong> The current rung is lit.</p>
            <ol className="ladder m-0 mt-2 p-0">
              {STRENGTH_LADDER.map((s, i) => {
                const lit = !!latest && cur?.strength === s.band;
                const top = i < STRENGTH_LADDER.length - 1 ? `${s.min.toFixed(1)}–${(STRENGTH_LADDER[i + 1].min - 0.1).toFixed(1)} °C` : `${s.min.toFixed(1)} °C and above`;
                return (
                  <li key={s.band} style={lit ? { background: rampColor(v), color: rampTextColor(v), borderColor: "transparent" } : undefined} aria-current={lit ? "true" : undefined}>
                    <span className="block" style={{ fontWeight: 600 }}>{s.band}</span>
                    <span className="block" style={{ fontSize: 13, opacity: 0.85 }}>{top}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          {cur && latest && (
            <p><strong>How long it's lasted.</strong> {cur.runLength > 0 && cur.runStart
              ? `${cur.runLength} three-month period${cur.runLength === 1 ? "" : "s"} in a row beyond the 0.5 °C line, since ${seasonRange(cur.runStart.season, cur.runStart.year)}. NOAA counts it an official episode at five${cur.isEpisode ? " — it is one." : "."}`
              : "No run beyond the 0.5 °C line at the moment."}</p>
          )}
          <p><strong>Where the number comes from.</strong> NOAA's ONI file (oni.ascii.txt), checked every 6 hours. Latest three-month period: {seasonText}.</p>
          <p><strong>A note on the baseline.</strong> NOAA updates the 30-year baseline every five years so that the long-term warming of the oceans doesn't get counted as El Niño.</p>
        </>
      }
    >
      <div className="grid gap-1 pt-2" style={{ borderTop: "1px solid var(--color-rule)", paddingTop: 16 }}>
        <p className="m-0 number" style={{ fontSize: "clamp(20px, 2.6vw, 26px)" }}>
          Official status: {alert.data ? alert.data.status : alert.error ? <span className="caption">unavailable right now</span> : <span className="dash" />}
        </p>
        {alert.data && (
          <p className="m-0 body">
            {/advisory/i.test(alert.data.status)
              ? <>NOAA's forecasters confirmed the event{alert.data.issued ? ` on ${alert.data.issued.replace(/ \d{4}$/, "")}` : ""}.</>
              : /watch/i.test(alert.data.status)
                ? <>NOAA's forecasters say conditions favour an event forming within six months.</>
                : <>NOAA has no El Niño or La Niña alert in effect.</>}
            {alert.data.synopsis && <> In their words: “{alert.data.synopsis}”</>}
          </p>
        )}
      </div>
    </Card>
  );
}
