"use client";
import { useMemo, useRef, useState } from "react";
import { useFeed } from "@/lib/useFeed";
import { NINO_BOXES, type PacificGrid } from "@/lib/sources/pacificSst";
import { rampColor } from "@/lib/ramp";
import { fmtAnom } from "@/lib/enso";
import { fmtDate } from "@/lib/format";
import { Plate } from "./Plate";
import { Provenance } from "./Provenance";
import { SignalLost } from "./SignalLost";
import { RampLegend } from "./RampLegend";

type Layer = "anom" | "sst";
const LAND = "#B9B4A8";
const INK = "#16181A";

/** Absolute SST as ink density — colour stays reserved for anomalies. */
function sstColor(t: number): string {
  const a = Math.min(1, Math.max(0, (t - 16) / 16)); // 16 → 32 °C
  const g = Math.round(232 - a * 190);
  return `rgb(${g},${g - 2},${g - 6})`;
}

const lonLabel = (lon: number) => (lon === 180 ? "180°" : lon < 180 ? `${lon}°E` : `${360 - lon}°W`);
const latLabel = (lat: number) => (lat === 0 ? "0°" : lat > 0 ? `${lat}°N` : `${-lat}°S`);

export function PacificMap() {
  const feed = useFeed<PacificGrid>("pacific-sst", 3600_000);
  const state = feed.isLoading ? "loading" : feed.error && !feed.data ? "lost" : feed.error ? "stale" : "ok";
  const g = feed.data;
  const [layer, setLayer] = useState<Layer>("anom");
  const [showBoxes, setShowBoxes] = useState(true);
  const [hover, setHover] = useState<{ lat: number; lon: number; anom: number | null; sst: number | null } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Geometry: 1 SVG unit per degree; x runs 120°E → 70°W, y runs 25°N → 25°S.
  const lon0 = 120, lon1 = 290, lat0 = 25, lat1 = -25;
  const W = lon1 - lon0, H = lat0 - lat1;
  const xOf = (lon: number) => lon - lon0;
  const yOf = (lat: number) => lat0 - lat;

  const cells = useMemo(() => {
    if (!g) return null;
    const out: { x: number; y: number; fill: string; k: number }[] = [];
    for (let j = 0; j < g.nLat; j++) {
      for (let i = 0; i < g.nLon; i++) {
        const k = j * g.nLon + i;
        const v = layer === "anom" ? g.anom[k] : g.sst[k];
        const fill = v == null ? LAND : layer === "anom" ? rampColor(v) : sstColor(v);
        out.push({ x: xOf(g.lon0 + i * g.step - g.step / 2), y: yOf(g.lat0 + j * g.step + g.step / 2), fill, k });
      }
    }
    return out;
  }, [g, layer]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!g || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const lon = lon0 + ((e.clientX - r.left) / r.width) * W;
    const lat = lat0 - ((e.clientY - r.top) / r.height) * H;
    const i = Math.round((lon - g.lon0) / g.step);
    const j = Math.round((lat - g.lat0) / g.step);
    if (i < 0 || j < 0 || i >= g.nLon || j >= g.nLat) return setHover(null);
    const k = j * g.nLon + i;
    setHover({ lat: g.lat0 + j * g.step, lon: g.lon0 + i * g.step, anom: g.anom[k], sst: g.sst[k] });
  };

  return (
    <Plate
      id="basin"
      title="Equatorial Pacific · sea-surface temperature anomaly"
      state={state}
      bleed
      provenance={<Provenance source="NOAA OISST v2.1 NRT" obs={g ? fmtDate(g.time.slice(0, 10)) : undefined} refresh="1H" stale={state === "stale"} />}
    >
      {state === "lost" ? (
        <SignalLost source="NOAA CoastWatch ERDDAP" file="ncdcOisst21NrtAgg" lastGoodAt={feed.lastGoodAt} error={feed.error} />
      ) : (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Map layers">
              <button type="button" className="tbtn" aria-pressed={layer === "anom"} onClick={() => setLayer("anom")}>Anomaly</button>
              <button type="button" className="tbtn" aria-pressed={layer === "sst"} onClick={() => setLayer("sst")}>Sea surface temperature</button>
              <button type="button" className="tbtn" aria-pressed={showBoxes} onClick={() => setShowBoxes((v) => !v)}>Region boxes</button>
            </div>
            <p className="meta m-0 text-ink-3" aria-live="polite" style={{ minHeight: 18 }}>
              {hover
                ? `${latLabel(Math.round(hover.lat * 10) / 10)} ${lonLabel(Math.round(hover.lon * 10) / 10 > 180 ? Math.round(hover.lon) : Math.round(hover.lon))} · ${hover.anom == null ? "land" : `anomaly ${fmtAnom(hover.anom, 2)} °C · SST ${hover.sst?.toFixed(1)} °C`}`
                : g ? "Hover for a cell readout" : ""}
            </p>
          </div>

          <div className="map-well">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              role="img"
              aria-label={g ? `Sea-surface temperature ${layer === "anom" ? "anomaly" : ""} across the equatorial Pacific on ${fmtDate(g.time.slice(0, 10))}. Niño 3.4 box mean anomaly ${fmtAnom(g.boxes.n34 ?? 0, 2)} °C.` : "Map loading"}
              style={{ background: "var(--color-paper-sink)", border: "1px solid var(--color-rule)", cursor: g ? "crosshair" : "default" }}
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            >
              {cells && (
                <g className="sweep" shapeRendering="crispEdges">
                  {cells.map((c) => (
                    <rect key={c.k} x={c.x} y={c.y} width={g!.step} height={g!.step} fill={c.fill} />
                  ))}
                </g>
              )}
              {/* Graticule */}
              {[-20, -10, 0, 10, 20].map((lat) => (
                <line key={lat} x1={0} x2={W} y1={yOf(lat)} y2={yOf(lat)} stroke={INK} strokeOpacity={lat === 0 ? 0.6 : 0.15} strokeWidth={lat === 0 ? 0.25 : 0.15} />
              ))}
              {[150, 180, 210, 240, 270].map((lon) => (
                <line key={lon} x1={xOf(lon)} x2={xOf(lon)} y1={0} y2={H} stroke={INK} strokeOpacity={0.15} strokeWidth={0.15} />
              ))}
              {/* Niño boxes */}
              {showBoxes && NINO_BOXES.map((b) => (
                <g key={b.id}>
                  <rect x={xOf(b.lon[0])} y={yOf(b.lat[1])} width={b.lon[1] - b.lon[0]} height={b.lat[1] - b.lat[0]} fill="none" stroke={INK} strokeWidth={0.35} strokeDasharray={b.id === "n34" ? undefined : "1 0.7"} />
                  <text x={b.lon[1] >= 280 ? xOf(b.lon[1]) : xOf(b.lon[0]) + 1} textAnchor={b.lon[1] >= 280 ? "end" : "start"} y={yOf(b.lat[1]) - 0.8} fontSize={2.2} fontFamily="var(--font-sans)" fontWeight={600} fill={INK} letterSpacing={0.15} stroke="#F4F1EA" strokeWidth={0.7} paintOrder="stroke" strokeLinejoin="round">
                    {b.name.toUpperCase()}{g?.boxes[b.id] != null ? `  ${fmtAnom(g.boxes[b.id]!, 1)}` : ""}
                  </text>
                </g>
              ))}
              {/* Axis labels inside the frame */}
              {[120, 150, 180, 210, 240, 270].map((lon) => (
                <text key={lon} x={xOf(lon) + 0.6} y={H - 0.8} fontSize={2} fontFamily="var(--font-mono)" fill={INK} fillOpacity={0.7}>{lonLabel(lon)}</text>
              ))}
              {[20, 0, -20].map((lat) => (
                <text key={lat} x={0.6} y={yOf(lat) - 0.6} fontSize={2} fontFamily="var(--font-mono)" fill={INK} fillOpacity={0.7}>{latLabel(lat)}</text>
              ))}
              {!g && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={3} fontFamily="var(--font-mono)" fill="#83888C">———</text>}
            </svg>
          </div>

          <div className="grid gap-x-8 gap-y-3 sm:items-end" style={{ gridTemplateColumns: "minmax(220px, 320px) minmax(0, 1fr)" }}>
            {layer === "anom" ? <RampLegend /> : (
              <div className="grid gap-1">
                <div style={{ height: 10, border: "1px solid var(--color-rule)", background: `linear-gradient(90deg, ${sstColor(16)}, ${sstColor(32)})` }} />
                <div className="meta flex justify-between text-ink-3"><span>16 °C</span><span>24</span><span>32 °C</span></div>
              </div>
            )}
            <p className="meta m-0 text-ink-3">
              1° grid, 25°N–25°S, land in grey. Anomalies against OISST's own 1971–2000 daily climatology, so box means run a few tenths warmer than CPC's weekly values on the 1991–2020 base. Box means are area-weighted from this grid.
            </p>
          </div>
        </div>
      )}
    </Plate>
  );
}
