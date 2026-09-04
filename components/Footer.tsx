import { PROJECT } from "@/config/project";
import { ONI_URL } from "@/lib/sources/oni";
import { WEEKLY_SST_URL } from "@/lib/sources/weeklySst";
import { ALERT_URL } from "@/lib/sources/alertStatus";
import { GDELT_URL } from "@/lib/sources/news";
import { PACIFIC_SST_URL } from "@/lib/sources/pacificSst";
import { GLOBAL_SST_URL } from "@/lib/sources/globalSst";
import { SOI_URL } from "@/lib/sources/soi";
import { HEAT_CONTENT_URL } from "@/lib/sources/heatContent";
import { BUOYS_URL } from "@/lib/sources/buoys";
import { IRI_URL } from "@/lib/sources/plume";
import { CopyButton } from "./CopyButton";

const SOURCES = [
  { name: "Oceanic Niño Index (ONI)", org: "NOAA Climate Prediction Center", url: ONI_URL, refresh: "6 h" },
  { name: "ENSO Alert System status and diagnostic discussion", org: "NOAA Climate Prediction Center", url: ALERT_URL, refresh: "1 h" },
  { name: "Weekly Niño-region SST (1991–2020 base)", org: "NOAA Climate Prediction Center", url: WEEKLY_SST_URL, refresh: "1 h" },
  { name: "Equatorial Pacific SST and anomaly, 1° (OISST v2.1 NRT)", org: "NOAA NCEI via CoastWatch ERDDAP", url: PACIFIC_SST_URL, refresh: "1 h" },
  { name: "Daily global mean SST (OISST v2.1)", org: "Climate Reanalyzer, University of Maine", url: GLOBAL_SST_URL, refresh: "1 h" },
  { name: "Southern Oscillation Index, monthly standardised", org: "NOAA Climate Prediction Center", url: SOI_URL, refresh: "6 h" },
  { name: "Equatorial upper-300 m heat content anomaly, monthly", org: "NOAA Climate Prediction Center", url: HEAT_CONTENT_URL, refresh: "6 h" },
  { name: "TAO/TRITON moorings: daily SST, subsurface temperature, 20 °C isotherm", org: "NOAA PMEL via ERDDAP", url: BUOYS_URL, refresh: "1 h" },
  { name: "Model-based probabilistic ENSO forecast (read from the published figure)", org: "CCSR/IRI, Columbia Climate School", url: IRI_URL, refresh: "6 h" },
  { name: "News wire (English-language coverage, filtered by outlet)", org: "GDELT Project DOC 2.0", url: GDELT_URL, refresh: "15 min" },
];

export function Footer() {
  const links = [
    PROJECT.links.x !== "PENDING" && { label: "X", href: PROJECT.links.x },
    PROJECT.links.telegram !== "PENDING" && { label: "Telegram", href: PROJECT.links.telegram },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="plate-inner grid gap-8" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <section aria-labelledby="sources-title">
        <h2 id="sources-title" className="label-sm m-0 mb-3">Data sources</h2>
        <ul className="m-0 list-none p-0">
          {SOURCES.map((s) => (
            <li key={s.url} className="flex flex-wrap justify-between gap-x-6 gap-y-0 py-2" style={{ borderTop: "1px solid var(--color-rule)" }}>
              <span>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
                <span className="meta ml-2 text-ink-3">{s.org}</span>
              </span>
              <span className="meta text-ink-3">refresh {s.refresh}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="notes-title" className="prose">
        <h2 id="notes-title" className="label-sm m-0 mb-3">Notes</h2>
        <p className="m-0 text-ink-2">
          {PROJECT.name} is not affiliated with NOAA, the Climate Prediction Center, IRI, the Bureau of
          Meteorology or PMEL. Data are shown as published by those agencies and may lag their official
          releases. Values are never estimated or filled in: when a feed cannot be reached, the panel says so.
        </p>
        <p className="m-0 mt-3 text-ink-2">
          {PROJECT.token.ticker} is a memecoin with no intrinsic value. Nothing on this page is financial advice.
        </p>
      </section>

      <section aria-labelledby="ca-title">
        <h2 id="ca-title" className="label-sm m-0 mb-3">{PROJECT.token.ticker} · Solana contract</h2>
        <div className="flex flex-wrap items-center gap-3">
          <code className="meta well px-3 py-2" style={{ overflowWrap: "anywhere" }}>{PROJECT.token.address}</code>
          <CopyButton text={PROJECT.token.address} />
        </div>
        {links.length > 0 && (
          <p className="meta m-0 mt-3">
            {links.map((l, i) => (
              <span key={l.label}>{i > 0 && " · "}<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></span>
            ))}
          </p>
        )}
      </section>
    </footer>
  );
}
