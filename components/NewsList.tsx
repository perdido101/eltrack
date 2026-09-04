"use client";
import { useFeed } from "@/lib/useFeed";
import type { NewsData } from "@/lib/sources/news";
import { ago, longDate } from "@/lib/words";
import { useNow } from "@/lib/useNow";
import { Card, stateOf } from "./Card";

export function NewsList() {
  const feed = useFeed<NewsData>("news", 15 * 60_000);
  const now = useNow();
  const items = feed.data?.items ?? [];
  return (
    <Card
      id="news"
      headline="El Niño in the news"
      state={stateOf(feed)}
      sourceName="the news feed"
      failed="the GDELT query"
      lastGoodAt={feed.lastGoodAt}
      fetchedAt={feed.fetchedAt}
      source="English-language coverage, filtered to major outlets · GDELT Project"
      details={<p>Headlines are shown exactly as published. Wire stories syndicated across many sites are shown once. Weighted toward Reuters, AP, BBC, CNN, the Guardian, NYT, Newsweek, Fox Weather, NOAA and WMO.</p>}
    >
      {feed.data?.mode === "archive" && feed.data.archiveAsOf && (
        <p className="caption m-0">Couldn't reach the news feed just now — showing headlines saved on {longDate(feed.data.archiveAsOf, false)}.</p>
      )}
      <ol className="m-0 grid list-none gap-1 p-0">
        {items.length ? items.map((it) => (
          <li key={it.url} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2" style={{ borderTop: "1px solid var(--color-rule)" }}>
            <span className="caption" style={{ minWidth: 84, fontWeight: 600, color: "var(--color-ink-2)" }}>{it.badge}</span>
            <a href={it.url} target="_blank" rel="noopener noreferrer" className="body" style={{ flex: "1 1 320px", textDecoration: "none" }}>{it.title}</a>
            <span className="caption">{ago(it.seen, now)}</span>
          </li>
        )) : [0, 1, 2].map((i) => <li key={i} className="py-3 dash" style={{ borderTop: "1px solid var(--color-rule)" }} />)}
      </ol>
    </Card>
  );
}
