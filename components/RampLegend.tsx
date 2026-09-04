import { RAMP_STOPS } from "@/lib/ramp";

/** Plain legend: cooler ← → warmer, with the two ends labelled. */
export function RampLegend() {
  return (
    <div className="grid gap-1" aria-label="Colour scale">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${RAMP_STOPS.length}, 1fr)`, height: 10, borderRadius: 5, overflow: "hidden" }}>
        {RAMP_STOPS.map(([v, hex]) => <span key={v} style={{ background: hex }} />)}
      </div>
      <div className="caption flex justify-between" style={{ fontSize: 13, whiteSpace: "nowrap", gap: 8 }}>
        <span>−3 °C cooler</span><span>normal</span><span>+3 °C warmer</span>
      </div>
    </div>
  );
}
