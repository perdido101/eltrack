"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFeed } from "@/lib/useFeed";
import { NINO_BOXES, type PacificGrid } from "@/lib/sources/pacificSst";
import type { Buoy, BuoysData } from "@/lib/sources/buoys";
import { rampColor } from "@/lib/ramp";
import { vsNormal, throughDate } from "@/lib/words";
import { Card, stateOf } from "./Card";
import { BuoyPanel } from "./BuoyPanel";
import { RampLegend } from "./RampLegend";

type Layer = "anom" | "sst";
const LAND = "#2A3142";
const INK = "#EEF2F7";
const PLAIN: Record<string, string> = { n12: "Off Peru", n3: "Eastern", n34: "Central", n4: "Western" };
// Label placement: western and central above their boxes, eastern and Peru below, so none collide.
const BELOW = new Set(["n3", "n12"]);

/** Absolute temperature as light density — colour stays reserved for departure from normal. */
function sstColor(t: number): string {
  const a = Math.min(1, Math.max(0, (t - 16) / 16));
  const g = Math.round(28 + a * 200);
  return `rgb(${g},${Math.round(g * 0.97)},${Math.round(g * 0.9)})`;
}
const lonLabel = (lon: number) => (lon === 180 ? "180°" : lon < 180 ? `${lon}°E` : `${360 - lon}°W`);
const latLabel = (lat: number) => (lat === 0 ? "Equator" : lat > 0 ? `${lat}°N` : `${-lat}°S`);
const signed = (v: number, d = 1) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`;

export function PacificMap() {
  const feed = useFeed<PacificGrid>("pacific-sst", 3600_000);
  const buoys = useFeed<BuoysData>("buoys", 3600_000);
  const g = feed.data;
  const [layer, setLayer] = useState<Layer>("anom");
  const [showBoxes, setShowBoxes] = useState(true);
  const [showBuoys, setShowBuoys] = useState(true);
  const [picked, setPicked] = useState<string | null>(null);
  const [hover, setHover] = useState<{ lat: number; lon: number; anom: number | null; sst: number | null } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  // On narrow screens the map scrolls; open it on the eastern Pacific, where the action is.
  useEffect(() => {
    const el = wellRef.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
  }, [g]);
  const pickedBuoy: Buoy | undefined = buoys.data?.buoys.find((b) => b.id === picked);

  const lon0 = 120, lon1 = 290, lat0 = 25, lat1 = -25;
  const W = lon1 - lon0, H = lat0 - lat1;
  const xOf = (lon: number) => lon - lon0;
  const yOf = (lat: number) => lat0 - lat;

  const cells = useMemo(() => {
    if (!g) return null;
    const calm: { x: number; y: number; fill: string; k: number }[] = [];
    const hot: typeof calm = [];
    for (let j = 0; j < g.nLat; j++) for (let i = 0; i < g.nLon; i++) {
      const k = j * g.nLon + i;
      const v = layer === "anom" ? g.anom[k] : g.sst[k];
      const fill = v == null ? LAND : layer === "anom" ? rampColor(v) : sstColor(v);
      const c = { x: xOf(g.lon0 + i * g.step - g.step / 2), y: yOf(g.lat0 + j * g.step + g.step / 2), fill, k };
      (layer === "anom" && v != null && v >= 1.5 ? hot : calm).push(c);
    }
    return { calm, hot };
  }, [g, layer]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!g || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const lon = lon0 + ((e.clientX - r.left) / r.width) * W;
    const lat = lat0 - ((e.clientY - r.top) / r.height) * H;
    const i = Math.round((lon - g.lon0) / g.step), j = Math.round((lat - g.lat0) / g.step);
    if (i < 0 || j < 0 || i >= g.nLon || j >= g.nLat) return setHover(null);
    const k = j * g.nLon + i;
    setHover({ lat: g.lat0 + j * g.step, lon: g.lon0 + i * g.step, anom: g.anom[k], sst: g.sst[k] });
  };

  const n34 = g?.boxes.n34 ?? null;
  const lead = !g ? "" : n34 != null && n34 >= 0.5 ? "Red is warmer than usual, blue is cooler. The warm band along the equator is El Niño."
    : n34 != null && n34 <= -0.5 ? "Red is warmer than usual, blue is cooler. The cool band along the equator is La Niña."
    : "Red is warmer than usual, blue is cooler. No strong band along the equator means no El Niño or La Niña right now.";

  return (
    <Card
      id="map"
      bleed
      headline="Where the ocean is warmer than normal"
      lead={<p className="m-0 body" style={{ fontSize: 18 }}>{lead || <span className="dash" />}</p>}
      state={stateOf(feed)}
      sourceName="NOAA's satellite feed"
      failed="the sea-surface temperature grid"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source={<>Satellite sea-surface temperature, {g ? throughDate(g.time.slice(0, 10)) : "…"} · NOAA OISST · Buoys: NOAA PMEL</>}
      meaning="Normally the warmest water sits in the western Pacific and the coast of South America is cool. During El Niño the warm water spreads east along the equator — that's the red band, and it's what shifts rainfall and storms around the world."
      details={
        <>
          <p>1° grid, 25°N–25°S, 120°E–70°W, from NOAA OISST v2.1 near-real-time. Departures are from OISST's own 1971–2000 daily baseline, which is why the region values here run a few tenths warmer than NOAA's weekly figures on the 1991–2020 baseline.</p>
          <p><strong>The four regions.</strong> Niño 1+2 (0–10°S, 90–80°W, "off Peru") · Niño 3 (5°N–5°S, 150–90°W, "eastern") · Niño 3.4 (5°N–5°S, 170–120°W, "central" — the one forecasters use) · Niño 4 (5°N–5°S, 160°E–150°W, "western"). Region values on the map are area-weighted averages of this grid.</p>
          <p><strong>Buoys.</strong> TAO/TRITON moorings, latest daily report per mooring; the "warm layer" depth is the 20 °C isotherm. Grey cells are land or missing data.</p>
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Map layers">
          <button type="button" className="btn" aria-pressed={layer === "anom"} onClick={() => setLayer("anom")}>Warmer / cooler than normal</button>
          <button type="button" className="btn" aria-pressed={layer === "sst"} onClick={() => setLayer("sst")}>Actual temperature</button>
          <button type="button" className="btn" aria-pressed={showBoxes} onClick={() => setShowBoxes((v) => !v)}>Show the four regions</button>
          <button type="button" className="btn" aria-pressed={showBuoys} onClick={() => setShowBuoys((v) => !v)}>Show buoys</button>
        </div>
        <p className="caption m-0" aria-live="polite" style={{ minHeight: 20 }}>
          {hover ? `${latLabel(Math.round(hover.lat))} ${lonLabel(Math.round(hover.lon))} · ${hover.anom == null ? "land" : `${vsNormal(hover.anom)} · ${hover.sst?.toFixed(1)} °C`}` : g ? "Hover or tap the map for a reading" : ""}
        </p>
      </div>

      <div className="map-well" ref={wellRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={g ? `Map of where the Pacific is warmer or cooler than normal, ${throughDate(g.time.slice(0, 10))}. Central Pacific ${n34 != null ? vsNormal(n34) : ""}.` : "Map loading"}
          style={{ background: "var(--color-bg-3)", cursor: g ? "crosshair" : "default" }}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {cells && (
            <>
              <g shapeRendering="crispEdges">{cells.calm.map((c) => <rect key={c.k} x={c.x} y={c.y} width={g!.step} height={g!.step} fill={c.fill} />)}</g>
              <g shapeRendering="crispEdges" className="breathe">{cells.hot.map((c) => <rect key={c.k} x={c.x} y={c.y} width={g!.step} height={g!.step} fill={c.fill} />)}</g>
            </>
          )}
          {[-20, -10, 0, 10, 20].map((lat) => (
            <line key={lat} x1={0} x2={W} y1={yOf(lat)} y2={yOf(lat)} stroke={INK} strokeOpacity={lat === 0 ? 0.55 : 0.12} strokeWidth={lat === 0 ? 0.25 : 0.15} />
          ))}
          {[150, 180, 210, 240, 270].map((lon) => (
            <line key={lon} x1={xOf(lon)} x2={xOf(lon)} y1={0} y2={H} stroke={INK} strokeOpacity={0.12} strokeWidth={0.15} />
          ))}
          {showBoxes && NINO_BOXES.map((b) => {
            const val = g?.boxes[b.id];
            const right = b.lon[1] >= 280;
            const below = BELOW.has(b.id);
            return (
              <g key={b.id}>
                <rect x={xOf(b.lon[0])} y={yOf(b.lat[1])} width={b.lon[1] - b.lon[0]} height={b.lat[1] - b.lat[0]} fill="none" stroke={INK} strokeWidth={0.35} strokeDasharray={b.id === "n34" ? undefined : "1 0.7"} />
                <text x={right ? xOf(b.lon[1]) : xOf(b.lon[0]) + 1} textAnchor={right ? "end" : "start"} y={below ? yOf(b.lat[0]) + 2.8 : yOf(b.lat[1]) - 0.9} fontSize={2.3} fontFamily="var(--font-sans)" fontWeight={600} fill={INK} stroke="#0B1220" strokeWidth={0.7} paintOrder="stroke" strokeLinejoin="round">
                  {PLAIN[b.id]}{val != null ? `  ${signed(val)} °C` : ""}
                </text>
              </g>
            );
          })}
          {showBuoys && buoys.data?.buoys.map((b) => {
            const sel = b.id === picked;
            return (
              <g key={b.id} role="button" tabIndex={0} aria-label={`Buoy at ${b.id}${b.sst ? `, ${b.sst.value.toFixed(1)} degrees` : ""}`} aria-pressed={sel} style={{ cursor: "pointer", outline: "none" }}
                onClick={(e) => { e.stopPropagation(); setPicked(sel ? null : b.id); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPicked(sel ? null : b.id); } }}>
                <circle cx={xOf(b.lon)} cy={yOf(b.lat)} r={sel ? 1.7 : 1.1} fill={sel ? INK : "#0B1220"} stroke={INK} strokeWidth={0.35} />
              </g>
            );
          })}
          {[120, 150, 180, 210, 240, 270].map((lon) => (
            <text key={lon} x={xOf(lon) + 0.6} y={H - 0.9} fontSize={2} fontFamily="var(--font-sans)" fill={INK} fillOpacity={0.7}>{lonLabel(lon)}</text>
          ))}
          {[20, 0, -20].map((lat) => (
            <text key={lat} x={0.6} y={yOf(lat) - 0.7} fontSize={2} fontFamily="var(--font-sans)" fill={INK} fillOpacity={0.7}>{latLabel(lat)}</text>
          ))}
          {!g && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={3} fontFamily="var(--font-sans)" fill="#8592A6">Loading the map…</text>}
        </svg>
      </div>

      {showBuoys && (pickedBuoy ? <BuoyPanel buoy={pickedBuoy} onClose={() => setPicked(null)} /> : (
        <p className="caption m-0">
          {buoys.data ? `The dots are ${buoys.data.count} ocean buoys reporting this week. Tap one to see how deep the warm water goes.` : buoys.error ? "Couldn't reach the buoy network just now." : "Loading buoys…"}{" "}<span className="sm:hidden">Swipe the map sideways to see the whole Pacific.</span>
        </p>
      ))}
      <div className="legend-row">
        {layer === "anom" ? <RampLegend /> : (
          <div className="grid gap-1">
            <div style={{ height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${sstColor(16)}, ${sstColor(32)})` }} />
            <div className="caption flex justify-between"><span>16 °C</span><span>Actual temperature</span><span>32 °C</span></div>
          </div>
        )}
        <p className="caption m-0">{layer === "anom" ? "Dashed boxes are the four regions forecasters measure; the solid one is the central Pacific." : "Lighter is warmer. Switch back to see departures from normal."}</p>
      </div>
    </Card>
  );
}
