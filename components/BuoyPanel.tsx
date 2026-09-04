import type { Buoy } from "@/lib/sources/buoys";
import { longDate } from "@/lib/words";

const W = 320, H = 170, PAD = { top: 8, right: 8, bottom: 20, left: 36 };

function label(id: string) {
  const m = /^(\d+)([ns])(\d+)([ew])$/i.exec(id);
  return m ? `${m[1]}°${m[2].toUpperCase()} ${m[3]}°${m[4].toUpperCase()}` : id.toUpperCase();
}

/** Latest surface and subsurface readings from one mooring (COPY.md §2). */
export function BuoyPanel({ buoy, onClose }: { buoy: Buoy; onClose: () => void }) {
  const prof = buoy.profile.filter((p) => p.depth <= 300);
  const tMin = 8, tMax = 32;
  const x = (t: number) => PAD.left + ((t - tMin) / (tMax - tMin)) * (W - PAD.left - PAD.right);
  const y = (d: number) => PAD.top + (d / 300) * (H - PAD.top - PAD.bottom);
  const iso = prof.find((p, i) => i > 0 && prof[i - 1].t >= 20 && p.t < 20);
  const depth = buoy.iso20?.value ?? (iso ? Math.round(iso.depth) : null);
  const nearEq = Math.abs(buoy.lat) <= 2;
  const lon = buoy.lon;
  const normal = nearEq ? (lon >= 200 ? 50 : lon >= 180 ? 100 : 150) : null;

  return (
    <div className="grid gap-4 well-bg p-5 sm:grid-cols-[1fr_auto]">
      <div className="grid gap-3 content-start">
        <div className="flex items-baseline justify-between gap-4">
          <p className="m-0" style={{ fontWeight: 600, color: "var(--color-ink)", fontSize: 18 }}>Buoy at {label(buoy.id)}</p>
          <button type="button" className="btn" onClick={onClose}>Close</button>
        </div>
        <dl className="m-0 grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt className="caption">Surface water</dt>
          <dd className="m-0 strong">{buoy.sst ? `${buoy.sst.value.toFixed(1)} °C on ${longDate(buoy.sst.date, false)}` : "no recent reading"}</dd>
          <dt className="caption">Warm layer reaches down to</dt>
          <dd className="m-0 strong">{depth != null ? `${depth} m${normal ? ` — normally about ${normal} m here` : ""}` : "not reported"}</dd>
        </dl>
        <p className="caption m-0">
          {depth != null && normal && depth > normal * 1.5
            ? "The warm water isn't just a thin skin — it runs deep, which is what keeps an El Niño going."
            : "How deep the warm water goes is a good guide to how much staying power an event has."}
        </p>
        {prof.length <= 1 && <p className="caption m-0">No depth readings in the last few days.</p>}
      </div>
      {prof.length > 1 && (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: "100%", display: "block" }} role="img" aria-label="Temperature by depth to 300 metres">
          {[10, 15, 20, 25, 30].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={PAD.top} y2={H - PAD.bottom} stroke="#26324A" strokeWidth={0.75} />
              <text x={x(t)} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="#8592A6">{t}°</text>
            </g>
          ))}
          {[0, 100, 200, 300].map((d) => (
            <text key={d} x={PAD.left - 5} y={y(d) + 3} textAnchor="end" fontSize="10" fontFamily="var(--font-sans)" fill="#8592A6">{d} m</text>
          ))}
          <line x1={x(20)} x2={x(20)} y1={PAD.top} y2={H - PAD.bottom} stroke="#EEF2F7" strokeWidth={0.75} strokeDasharray="2 3" />
          <path d={prof.map((p, i) => `${i ? "L" : "M"}${x(Math.min(tMax, Math.max(tMin, p.t))).toFixed(1)},${y(p.depth).toFixed(1)}`).join("")} fill="none" stroke="#F07A1E" strokeWidth={2} />
          {prof.map((p) => <circle key={p.depth} cx={x(Math.min(tMax, Math.max(tMin, p.t)))} cy={y(p.depth)} r={2} fill="#EEF2F7" />)}
          <text x={x(20) + 3} y={PAD.top + 9} fontSize="9" fontFamily="var(--font-sans)" fill="#8592A6">20 °C line</text>
        </svg>
      )}
    </div>
  );
}
