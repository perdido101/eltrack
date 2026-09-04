import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";

/** TAO/TRITON moored buoys, daily, from NOAA PMEL's ERDDAP. Pacific array only (120°E–70°W). */
const BASE = "https://data.pmel.noaa.gov/pmel/erddap/tabledap";
export const BUOYS_URL = `${BASE}/pmelTaoDySst.html`;

export type Buoy = {
  id: string; // "0n140w"
  lat: number;
  lon: number; // 0–360
  /** Latest daily SST (1 m) and its date. */
  sst: { date: string; value: number } | null;
  /** Depth of the 20 °C isotherm in metres — a thermocline proxy. */
  iso20: { date: string; value: number } | null;
  /** Latest subsurface profile, shallow to deep. */
  profile: { depth: number; t: number }[];
  profileDate: string | null;
};

export type BuoysData = { buoys: Buoy[]; count: number };

type Table = { columnNames: string[]; rows: (string | number | null)[][] };

function col(t: Table, name: string) {
  const i = t.columnNames.indexOf(name);
  if (i < 0) throw new Error(`ERDDAP table missing column ${name}`);
  return i;
}

export function buildBuoys(sst: Table, iso: Table | null, temp: Table | null): Buoy[] {
  const byId = new Map<string, Buoy>();
  const sId = col(sst, "station"), sLon = col(sst, "longitude"), sLat = col(sst, "latitude"), sT = col(sst, "time"), sV = col(sst, "T_25");
  for (const r of sst.rows) {
    const id = String(r[sId]);
    const v = r[sV];
    const b = byId.get(id) ?? { id, lat: r[sLat] as number, lon: r[sLon] as number, sst: null, iso20: null, profile: [], profileDate: null };
    const date = String(r[sT]).slice(0, 10);
    if (typeof v === "number" && (!b.sst || date > b.sst.date)) b.sst = { date, value: +v.toFixed(2) };
    byId.set(id, b);
  }
  if (iso) {
    const iId = col(iso, "station"), iT = col(iso, "time"), iV = col(iso, "ISO_6");
    for (const r of iso.rows) {
      const b = byId.get(String(r[iId]));
      const v = r[iV];
      if (!b || typeof v !== "number") continue;
      const date = String(r[iT]).slice(0, 10);
      if (!b.iso20 || date > b.iso20.date) b.iso20 = { date, value: Math.round(v) };
    }
  }
  if (temp) {
    const tId = col(temp, "station"), tD = col(temp, "depth"), tT = col(temp, "time"), tV = col(temp, "T_20");
    // Keep the most recent date per station that has at least three good depths.
    const perStation = new Map<string, Map<string, { depth: number; t: number }[]>>();
    for (const r of temp.rows) {
      const v = r[tV];
      if (typeof v !== "number") continue;
      const id = String(r[tId]);
      const date = String(r[tT]).slice(0, 10);
      const m = perStation.get(id) ?? new Map();
      const arr = m.get(date) ?? [];
      arr.push({ depth: r[tD] as number, t: +v.toFixed(2) });
      m.set(date, arr);
      perStation.set(id, m);
    }
    for (const [id, m] of perStation) {
      const b = byId.get(id);
      if (!b) continue;
      const dates = [...m.keys()].filter((d) => m.get(d)!.length >= 3).sort();
      const date = dates[dates.length - 1];
      if (!date) continue;
      b.profile = m.get(date)!.sort((a, c) => a.depth - c.depth);
      b.profileDate = date;
    }
  }
  return [...byId.values()].sort((a, b) => a.lon - b.lon || b.lat - a.lat);
}

async function table(url: string): Promise<Table> {
  return (JSON.parse(await fetchText(url, REVALIDATE.daily, 40_000)) as { table: Table }).table;
}

export async function getBuoys(): Promise<Result<BuoysData>> {
  try {
    // Moorings report daily with a lag of a day or two; six days catches every
    // active one, and orderByMax returns only the latest report per station.
    const since = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
    const where = `&time%3E=${since}T00:00:00Z&longitude%3E=120&longitude%3C=290`;
    const [sst, iso, temp] = await Promise.allSettled([
      table(`${BASE}/pmelTaoDySst.json?station,longitude,latitude,time,T_25${where}&orderByMax(%22station,time%22)`),
      table(`${BASE}/pmelTaoDyIso.json?station,time,ISO_6${where}&orderByMax(%22station,time%22)`),
      table(`${BASE}/pmelTaoDyT.json?station,depth,time,T_20${where}&orderByMax(%22station,depth,time%22)`),
    ]);
    if (sst.status === "rejected") throw sst.reason;
    const buoys = buildBuoys(sst.value, iso.status === "fulfilled" ? iso.value : null, temp.status === "fulfilled" ? temp.value : null);
    if (!buoys.length) return fail("No reporting TAO buoys in the last six days");
    return ok({ buoys, count: buoys.length });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
