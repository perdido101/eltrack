import type { Buoy } from "@/lib/sources/buoys";
import { fmtDate } from "@/lib/format";

const W = 320, H = 160, PAD = { top: 8, right: 8, bottom: 18, left: 34 };

function label(id: string) {
  const m = /^(\d+)([ns])(\d+)([ew])$/i.exec(id);
  if (!m) return id.toUpperCase();
  return `${m[1]}°${m[2].toUpperCase()} ${m[3]}°${m[4].toUpperCase()}`;
}

/** Latest surface and subsurface readings from one TAO/TRITON mooring. */
export function BuoyPanel({ buoy, onClose }: { buoy: Buoy; onClose: () => void }) {
  const prof = buoy.profile.filter((p) => p.depth <= 300);
  const tMin = 8, tMax = 32;
  const x = (t: number) => PAD.left + ((t - tMin) / (tMax - tMin)) * (W - PAD.left - PAD.right);
  const y = (d: number) => PAD.top + (d / 300) * (H - PAD.top - PAD.bottom);
  const iso = prof.length ? prof.find((p, i) => i > 0 && prof[i - 1].t >= 20 && p.t < 20) : undefined;

  return (
    <div className="grid gap-3 well p-4 sm:grid-cols-[1fr_auto]" style={{ border: "1px solid var(--color-rule)" }}>
      <div className="grid gap-2 content-start">
        <div className="flex items-baseline justify-between gap-4">
          <p className="label-sm m-0">Mooring {label(buoy.id)}</p>
          <button type="button" className="tbtn" onClick={onClose}>Close</button>
        </div>
        <dl className="m-0 grid gap-x-6 gap-y-2" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt className="label-xs text-ink-3">Sea surface</dt>
          <dd className="m-0 value-sm">{buoy.sst ? `${buoy.sst.value.toFixed(2)} °C · ${fmtDate(buoy.sst.date)}` : "no recent SST"}</dd>
          <dt className="label-xs text-ink-3">20 °C isotherm</dt>
          <dd className="m-0 value-sm">{buoy.iso20 ? `${buoy.iso20.value} m · ${fmtDate(buoy.iso20.date)}` : iso ? `≈ ${Math.round(iso.depth)} m (from profile)` : "not reported"}</dd>
          <dt className="label-xs text-ink-3">Profile</dt>
          <dd className="m-0 meta">{buoy.profileDate ? `${prof.length} depths · ${fmtDate(buoy.profileDate)}` : "not reported"}</dd>
        </dl>
        <p className="meta m-0 text-ink-3">The 20 °C isotherm tracks the thermocline. Near 140°W it normally sits close to 50 m.</p>
      </div>
      {prof.length > 1 && (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: "100%", display: "block" }} role="img" aria-label="Temperature against depth to 300 m">
        {[10, 15, 20, 25, 30].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={PAD.top} y2={H - PAD.bottom} stroke="#C9C4B8" strokeWidth={0.5} />
            <text x={x(t)} y={H - 5} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#83888C">{t}°</text>
          </g>
        ))}
        {[0, 100, 200, 300].map((d) => (
          <text key={d} x={PAD.left - 4} y={y(d) + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="#83888C">{d}m</text>
        ))}
        <line x1={x(20)} x2={x(20)} y1={PAD.top} y2={H - PAD.bottom} stroke="#16181A" strokeWidth={0.75} strokeDasharray="2 3" />
        {prof.length > 1 && (
          <path d={prof.map((p, i) => `${i ? "L" : "M"}${x(Math.min(tMax, Math.max(tMin, p.t))).toFixed(1)},${y(p.depth).toFixed(1)}`).join("")} fill="none" stroke="#16181A" strokeWidth={1.5} />
        )}
        {prof.map((p) => <circle key={p.depth} cx={x(Math.min(tMax, Math.max(tMin, p.t)))} cy={y(p.depth)} r={1.6} fill="#16181A" />)}
      </svg>
      )}
    </div>
  );
}
