import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/**
 * NOAA OISST v2.1 near-real-time, served by NOAA CoastWatch ERDDAP. One request
 * returns SST and anomaly (against OISST's own 1971–2000 climatology) on a 1°
 * grid across the equatorial Pacific. Preliminary until the final OISST lands.
 */
const DATASET = "ncdcOisst21NrtAgg";
export const PACIFIC_SST_URL = `https://coastwatch.pfeg.noaa.gov/erddap/griddap/${DATASET}.html`;

export const EXTENT = { lat: [-25, 25], lon: [120, 290] } as const; // 120°E → 70°W
const STRIDE = 4; // 0.25° cells → 1°

export type NinoBox = { id: string; name: string; lat: [number, number]; lon: [number, number] };
export const NINO_BOXES: NinoBox[] = [
  { id: "n12", name: "Niño 1+2", lat: [-10, 0], lon: [270, 280] },
  { id: "n3", name: "Niño 3", lat: [-5, 5], lon: [210, 270] },
  { id: "n34", name: "Niño 3.4", lat: [-5, 5], lon: [190, 240] },
  { id: "n4", name: "Niño 4", lat: [-5, 5], lon: [160, 210] },
];

export type PacificGrid = {
  /** Observation time from the dataset. */
  time: string;
  lat0: number;
  lon0: number;
  step: number;
  nLat: number;
  nLon: number;
  /** Row-major (lat outer, lon inner). null = land or missing. */
  anom: (number | null)[];
  sst: (number | null)[];
  /** Area-weighted mean anomaly per Niño box, from this grid. */
  boxes: Record<string, number | null>;
};

type Table = { columnNames: string[]; rows: (string | number | null)[][] };

export function gridFromTable(t: Table): PacificGrid {
  const iLat = t.columnNames.indexOf("latitude");
  const iLon = t.columnNames.indexOf("longitude");
  const iAnom = t.columnNames.indexOf("anom");
  const iSst = t.columnNames.indexOf("sst");
  const lats = [...new Set(t.rows.map((r) => r[iLat] as number))].sort((a, b) => a - b);
  const lons = [...new Set(t.rows.map((r) => r[iLon] as number))].sort((a, b) => a - b);
  const step = lats.length > 1 ? +(lats[1] - lats[0]).toFixed(3) : 1;
  const nLat = lats.length, nLon = lons.length;
  const anom: (number | null)[] = new Array(nLat * nLon).fill(null);
  const sst: (number | null)[] = new Array(nLat * nLon).fill(null);
  for (const r of t.rows) {
    const y = Math.round(((r[iLat] as number) - lats[0]) / step);
    const x = Math.round(((r[iLon] as number) - lons[0]) / step);
    const k = y * nLon + x;
    anom[k] = typeof r[iAnom] === "number" ? +(r[iAnom] as number).toFixed(2) : null;
    sst[k] = typeof r[iSst] === "number" ? +(r[iSst] as number).toFixed(2) : null;
  }
  const boxes: Record<string, number | null> = {};
  for (const b of NINO_BOXES) {
    let sum = 0, w = 0;
    for (let y = 0; y < nLat; y++) {
      const lat = lats[0] + y * step;
      if (lat < b.lat[0] || lat > b.lat[1]) continue;
      const cw = Math.cos((lat * Math.PI) / 180);
      for (let x = 0; x < nLon; x++) {
        const lon = lons[0] + x * step;
        if (lon < b.lon[0] || lon > b.lon[1]) continue;
        const v = anom[y * nLon + x];
        if (v == null) continue;
        sum += v * cw; w += cw;
      }
    }
    boxes[b.id] = w ? +(sum / w).toFixed(2) : null;
  }
  return { time: String(t.rows[0]?.[0] ?? ""), lat0: lats[0], lon0: lons[0], step, nLat, nLon, anom, sst, boxes };
}

export async function getPacificSst(): Promise<Result<PacificGrid>> {
  try {
    const sel = `[(last)][(0.0)][(${EXTENT.lat[0]}):${STRIDE}:(${EXTENT.lat[1]})][(${EXTENT.lon[0]}):${STRIDE}:(${EXTENT.lon[1]})]`;
    const url = `https://coastwatch.pfeg.noaa.gov/erddap/griddap/${DATASET}.json?anom${sel},sst${sel}`;
    const text = await fetchText(url, REVALIDATE.daily, 40_000);
    const table = (JSON.parse(text) as { table: Table }).table;
    if (!table?.rows?.length) return fail("ERDDAP returned no rows");
    return ok(gridFromTable(table));
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
