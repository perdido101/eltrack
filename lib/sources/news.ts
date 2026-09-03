import { fetchText, REVALIDATE } from "@/lib/http";
import { ok, fail, type Result } from "@/lib/result";
import { NEWS_FALLBACK, NEWS_FALLBACK_AS_OF } from "./newsFallback";

/**
 * Mainstream coverage of the event via the GDELT DOC 2.0 API, filtered hard:
 * title must name the event, recognisable outlets are preferred, syndicated
 * wire copies are collapsed, twelve items max, newest first.
 */
export const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc";

export type NewsItem = {
  title: string;
  url: string;
  domain: string;
  /** Short outlet badge, e.g. "REUTERS". */
  badge: string;
  /** ISO timestamp GDELT first saw the article. */
  seen: string;
  tier: 1 | 2 | 3;
};

export type NewsData = {
  items: NewsItem[];
  /** "live" when GDELT answered; "archive" when the frozen fallback set is shown. */
  mode: "live" | "archive";
  /** Date the archive set was frozen; only present in archive mode. */
  archiveAsOf?: string;
};

type GdeltArticle = { url: string; title: string; seendate: string; domain: string; language: string };

/** Tier 1: recognisable mainstream outlets. Tier 2: institutional and scientific sources. */
const OUTLETS: Record<string, { badge: string; tier: 1 | 2 }> = {
  "reuters.com": { badge: "REUTERS", tier: 1 },
  "apnews.com": { badge: "AP", tier: 1 },
  "bbc.com": { badge: "BBC", tier: 1 },
  "bbc.co.uk": { badge: "BBC", tier: 1 },
  "cnn.com": { badge: "CNN", tier: 1 },
  "newsweek.com": { badge: "NEWSWEEK", tier: 1 },
  "theguardian.com": { badge: "GUARDIAN", tier: 1 },
  "nytimes.com": { badge: "NYT", tier: 1 },
  "foxweather.com": { badge: "FOX WEATHER", tier: 1 },
  "washingtonpost.com": { badge: "WASH. POST", tier: 1 },
  "bloomberg.com": { badge: "BLOOMBERG", tier: 1 },
  "ft.com": { badge: "FT", tier: 1 },
  "wsj.com": { badge: "WSJ", tier: 1 },
  "aljazeera.com": { badge: "AL JAZEERA", tier: 1 },
  "abc.net.au": { badge: "ABC AU", tier: 1 },
  "nbcnews.com": { badge: "NBC", tier: 1 },
  "cbsnews.com": { badge: "CBS", tier: 1 },
  "abcnews.go.com": { badge: "ABC", tier: 1 },
  "npr.org": { badge: "NPR", tier: 1 },
  "axios.com": { badge: "AXIOS", tier: 1 },
  "usatoday.com": { badge: "USA TODAY", tier: 1 },
  "economist.com": { badge: "ECONOMIST", tier: 1 },
  "time.com": { badge: "TIME", tier: 1 },
  "weather.com": { badge: "WEATHER.COM", tier: 1 },
  "accuweather.com": { badge: "ACCUWEATHER", tier: 1 },
  "scientificamerican.com": { badge: "SCI. AMERICAN", tier: 1 },
  "nature.com": { badge: "NATURE", tier: 1 },
  "smh.com.au": { badge: "SMH", tier: 1 },
  "theage.com.au": { badge: "THE AGE", tier: 1 },
  "thehindu.com": { badge: "THE HINDU", tier: 1 },
  "independent.co.uk": { badge: "INDEPENDENT", tier: 1 },
  "telegraph.co.uk": { badge: "TELEGRAPH", tier: 1 },
  "latimes.com": { badge: "LA TIMES", tier: 1 },
  "noaa.gov": { badge: "NOAA", tier: 2 },
  "climate.gov": { badge: "NOAA CLIMATE.GOV", tier: 2 },
  "wmo.int": { badge: "WMO", tier: 2 },
  "bom.gov.au": { badge: "BOM", tier: 2 },
  "nasa.gov": { badge: "NASA", tier: 2 },
  "metoffice.gov.uk": { badge: "MET OFFICE", tier: 2 },
  "un.org": { badge: "UN", tier: 2 },
  "news.un.org": { badge: "UN NEWS", tier: 2 },
  "fao.org": { badge: "FAO", tier: 2 },
  "who.int": { badge: "WHO", tier: 2 },
  "columbia.edu": { badge: "IRI COLUMBIA", tier: 2 },
  "csiro.au": { badge: "CSIRO", tier: 2 },
  "ecmwf.int": { badge: "ECMWF", tier: 2 },
};

const EVENT_RE = /\bel\s*ni[ñn]o\b|\bni[ñn]o\s*3\.4\b|\benso\b/i;
const EXCLUDE_RE = /\b(casino|betting|crypto|token|coin|memecoin|horoscope|recipe)\b/i;

/** GDELT pads punctuation with spaces and strips quotes; put the title back together. */
export function cleanTitle(t: string): string {
  return t
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;!?%)\]])/g, "$1")
    .replace(/([(\[])\s+/g, "$1")
    .replace(/\s+'\s*s\b/g, "'s")
    .replace(/(\d)\.\s+(\d)/g, "$1.$2")
    .replace(/\s+\|\s+[^|]{0,40}$/, "")
    .replace(/\s+[-–]\s+(?:[A-Z][\w&]*\s?){1,3}$/, "")
    .trim();
}

function outletFor(domain: string): { badge: string; tier: 1 | 2 | 3 } {
  const d = domain.toLowerCase().replace(/^www\./, "");
  const hit = Object.keys(OUTLETS).find((k) => d === k || d.endsWith("." + k));
  if (hit) return OUTLETS[hit];
  return { badge: d.replace(/\.(com|org|net|co\.uk|com\.au|co)$/, "").toUpperCase(), tier: 3 };
}

const tokens = (t: string) =>
  new Set(t.toLowerCase().replace(/[^a-z0-9ñ ]+/g, " ").split(/\s+/).filter((w) => w.length > 2));

function similar(a: string, b: string): boolean {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.size || !tb.size) return false;
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  return inter / Math.min(ta.size, tb.size) >= 0.6;
}

/** "20260903T161500Z" → ISO */
const seenToIso = (s: string) =>
  `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;

export function selectNews(articles: GdeltArticle[], cap = 12): NewsItem[] {
  const candidates: NewsItem[] = [];
  for (const a of articles) {
    if (!a.title || !a.url || a.language !== "English") continue;
    const title = cleanTitle(a.title);
    if (!EVENT_RE.test(title) || EXCLUDE_RE.test(title) || title.length < 24) continue;
    const { badge, tier } = outletFor(a.domain);
    candidates.push({ title, url: a.url, domain: a.domain, badge, seen: seenToIso(a.seendate), tier });
  }
  // Higher tier first, then newest, so the dedupe keeps the best copy of a wire story.
  candidates.sort((x, y) => x.tier - y.tier || y.seen.localeCompare(x.seen));
  const kept: NewsItem[] = [];
  for (const c of candidates) {
    if (kept.some((k) => k.domain === c.domain && similar(k.title, c.title))) continue;
    if (kept.some((k) => similar(k.title, c.title))) continue;
    kept.push(c);
  }
  // Fill the cap by tier, then present newest first.
  const chosen = kept.slice(0, cap);
  return chosen.sort((x, y) => y.seen.localeCompare(x.seen));
}

async function gdeltQuery(query: string, timespan: string): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    // 250 records trips the relay; 100 answers reliably.
    maxrecords: "100",
    sort: "DateDesc",
    timespan,
  });
  // GDELT answers 503 or drops the connection now and then; one short retry is
  // cheap, but the whole call must fail fast enough for the archive fallback to
  // reach the page well inside a serverless function budget.
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await fetchText(`${GDELT_URL}?${params}`, REVALIDATE.news, 7_000);
      const body = JSON.parse(text) as { articles?: GdeltArticle[] };
      return body.articles ?? [];
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

const EVENT_QUERY = '("El Niño" OR "El Nino")';

/**
 * Two pulls: everything recent (which at current volume only reaches back a few
 * hours), and a week of coverage from recognisable outlets so the wire is weighted
 * toward them rather than toward whoever syndicated the story last.
 */
export async function fetchGdelt(): Promise<GdeltArticle[]> {
  // GDELT rejects long queries, so only the outlets the wire is built around go here.
  const outlets = [
    "reuters.com", "apnews.com", "bbc.com", "cnn.com", "newsweek.com", "theguardian.com",
    "nytimes.com", "foxweather.com", "noaa.gov", "wmo.int", "aljazeera.com", "washingtonpost.com",
  ].map((d) => `domainis:${d}`).join(" OR ");
  const [broad, targeted] = await Promise.allSettled([
    gdeltQuery(`${EVENT_QUERY} sourcelang:english`, "3d"),
    gdeltQuery(`${EVENT_QUERY} (${outlets}) sourcelang:english`, "7d"),
  ]);
  if (broad.status === "rejected" && targeted.status === "rejected") throw broad.reason;
  const all = [
    ...(targeted.status === "fulfilled" ? targeted.value : []),
    ...(broad.status === "fulfilled" ? broad.value : []),
  ];
  const seen = new Set<string>();
  return all.filter((a) => (seen.has(a.url) ? false : (seen.add(a.url), true)));
}

export async function getNews(): Promise<Result<NewsData>> {
  try {
    const items = selectNews(await fetchGdelt());
    if (items.length >= 4) return ok({ items, mode: "live" });
    throw new Error(`GDELT returned ${items.length} usable items`);
  } catch (e) {
    // The archive set is real coverage frozen from an earlier live pull, never invented.
    const items = NEWS_FALLBACK.map((f) => ({ ...f, ...outletFor(f.domain) }));
    const res = ok<NewsData>({ items, mode: "archive", archiveAsOf: NEWS_FALLBACK_AS_OF });
    return items.length ? res : fail(e instanceof Error ? e.message : String(e));
  }
}
