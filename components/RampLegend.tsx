import { RAMP_STOPS } from "@/lib/ramp";

/** Printed once, beneath the map; governs every ramp fill on the page. */
export function RampLegend() {
  return (
    <div className="grid gap-1" aria-label="Anomaly colour scale">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${RAMP_STOPS.length}, 1fr)`, height: 10, border: "1px solid var(--color-rule)" }}>
        {RAMP_STOPS.map(([v, hex]) => <span key={v} style={{ background: hex }} />)}
      </div>
      <div className="meta flex justify-between text-ink-3">
        <span>−3 °C</span><span>−1.5</span><span>0</span><span>+1.5</span><span>+3 °C</span>
      </div>
    </div>
  );
}
