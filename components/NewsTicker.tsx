"use client";
import { useEffect, useState } from "react";
import { useFeed } from "@/lib/useFeed";
import type { NewsData, NewsItem } from "@/lib/sources/news";
import { fmtDate } from "@/lib/format";

function age(iso: string, now: number): string {
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function List({ items, now, hidden }: { items: NewsItem[]; now: number; hidden?: boolean }) {
  return (
    <ul className="ticker-list" aria-hidden={hidden ? "true" : undefined}>
      {items.map((it) => (
        <li key={it.url} className="ticker-item">
          <a href={it.url} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined}>
            <span className="ticker-badge">{it.badge}</span>
            <span className="ticker-headline">{it.title}</span>
            <span className="ticker-age meta">{age(it.seen, now)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Mainstream headlines about the event, untouched. Full-bleed band under the hero. */
export function NewsTicker() {
  const feed = useFeed<NewsData>("news", 15 * 60_000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const items = feed.data?.items ?? [];
  const label =
    feed.data?.mode === "archive" && feed.data.archiveAsOf
      ? `Wire · archive ${fmtDate(feed.data.archiveAsOf)}`
      : "Wire";

  return (
    <section className="ticker" aria-label="News wire: mainstream coverage of the event" style={{ ["--ticker-dur" as string]: `${Math.max(items.length, 6) * 8}s` }}>
      <div className="ticker-label label-sm">{label}</div>
      <div className="ticker-viewport">
        {items.length ? (
          <div className="ticker-track">
            <List items={items} now={now} />
            <List items={items} now={now} hidden />
          </div>
        ) : (
          <p className="meta m-0 px-4 text-ink-3">
            {feed.error ? `Signal lost · GDELT · ${feed.error}` : "———"}
          </p>
        )}
      </div>
    </section>
  );
}
