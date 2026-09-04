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
  { name: "El Niño index (ONI)", org: "NOAA Climate Prediction Center", url: ONI_URL, every: "6 hours" },
  { name: "Official alert status and forecasters' discussion", org: "NOAA Climate Prediction Center", url: ALERT_URL, every: "hour" },
  { name: "Weekly temperatures for the four Pacific regions", org: "NOAA Climate Prediction Center", url: WEEKLY_SST_URL, every: "hour" },
  { name: "Satellite map of the Pacific (OISST v2.1)", org: "NOAA, via CoastWatch ERDDAP", url: PACIFIC_SST_URL, every: "hour" },
  { name: "Ocean buoys (TAO/TRITON)", org: "NOAA PMEL, via ERDDAP", url: BUOYS_URL, every: "hour" },
  { name: "Global ocean temperature, daily", org: "Climate Reanalyzer, University of Maine", url: GLOBAL_SST_URL, every: "hour" },
  { name: "Pacific pressure index (SOI)", org: "NOAA Climate Prediction Center", url: SOI_URL, every: "6 hours" },
  { name: "Heat stored under the surface", org: "NOAA Climate Prediction Center", url: HEAT_CONTENT_URL, every: "6 hours" },
  { name: "Forecast probabilities", org: "IRI, Columbia Climate School", url: IRI_URL, every: "6 hours" },
  { name: "News headlines", org: "GDELT Project", url: GDELT_URL, every: "15 minutes" },
];

export function Footer() {
  const links = [
    PROJECT.links.x !== "PENDING" && { label: "X", href: PROJECT.links.x },
    PROJECT.links.telegram !== "PENDING" && { label: "Telegram", href: PROJECT.links.telegram },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="card" style={{ marginBottom: 40 }}>
      <h2 className="headline" style={{ fontSize: 22 }}>Where the data comes from</h2>
      <ul className="m-0 list-none p-0">
        {SOURCES.map((s) => (
          <li key={s.url} className="flex flex-wrap justify-between gap-x-6 gap-y-0 py-2" style={{ borderTop: "1px solid var(--color-rule)" }}>
            <span><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a><span className="caption ml-2">{s.org}</span></span>
            <span className="caption">checked every {s.every}</span>
          </li>
        ))}
      </ul>
      <div className="grid gap-3" style={{ fontSize: 15 }}>
        <p className="m-0">
          {PROJECT.name} isn't affiliated with NOAA, the Climate Prediction Center, IRI, Australia's Bureau of Meteorology or PMEL. The data is shown as those agencies publish it and may lag their official releases. Nothing is estimated or filled in: when a source can't be reached, the panel says so.
        </p>
        <p className="m-0">{PROJECT.token.ticker} is a memecoin with no intrinsic value. Nothing on this page is financial advice.</p>
      </div>
      <div className="grid gap-2">
        <p className="caption m-0">{PROJECT.token.ticker} · Solana contract address</p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="source well-bg px-3 py-2" style={{ overflowWrap: "anywhere", color: "var(--color-ink-2)" }}>{PROJECT.token.address}</code>
          <CopyButton text={PROJECT.token.address} />
        </div>
        {links.length > 0 && (
          <p className="m-0" style={{ fontSize: 15 }}>
            {links.map((l, i) => <span key={l.label}>{i > 0 && " · "}<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></span>)}
          </p>
        )}
      </div>
    </footer>
  );
}
