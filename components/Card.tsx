"use client";
import type { ReactNode } from "react";
import { ago } from "@/lib/words";
import { useNow } from "@/lib/useNow";

export type CardState = "ok" | "loading" | "lost" | "stale";

type Props = {
  id: string;
  headline: ReactNode;
  /** The answer / number line under the headline. */
  lead?: ReactNode;
  children?: ReactNode;
  /** One plain sentence. Rendered after the content with a "What this means" label. */
  meaning?: ReactNode;
  /** Forecaster's version, behind a tap. */
  details?: ReactNode;
  /** Source text before the "updated … ago" clause. */
  source?: ReactNode;
  fetchedAt?: string;
  state?: CardState;
  /** Plain-words description of the source for the error copy, e.g. "NOAA". */
  sourceName?: string;
  /** What failed, in words, e.g. "the ONI file". */
  failed?: string;
  lastGoodAt?: string;
  error?: string;
  bleed?: boolean;
};

/** A panel: headline → lead → content → what this means → details → source. (DESIGN r2 §4) */
export function Card({ id, headline, lead, children, meaning, details, source, fetchedAt, state = "ok", sourceName = "the source", failed, lastGoodAt, bleed }: Props) {
  const now = useNow();
  return (
    <section className={`card${bleed ? " bleed" : ""}`} data-state={state} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="headline">{headline}</h2>
      {state === "lost" ? (
        <div className="grid gap-2">
          <p className="number m-0">Couldn't reach {sourceName} just now.</p>
          <p className="m-0">We'll keep trying every few minutes.</p>
          {failed && <p className="caption m-0">What failed: {failed}{lastGoodAt ? ` · last good copy ${ago(lastGoodAt, now)}` : ""}</p>}
        </div>
      ) : (
        <>
          {state === "stale" && (
            <p className="m-0 caption">Couldn't reach {sourceName} just now — showing data from {ago(lastGoodAt ?? fetchedAt, now)}.</p>
          )}
          {lead && <div className="stale-dim">{lead}</div>}
          {children && <div className="stale-dim grid gap-4">{children}</div>}
        </>
      )}
      {meaning && state !== "lost" && (
        <p className="meaning"><strong>What this means </strong>{meaning}</p>
      )}
      {details && (
        <details className="drawer">
          <summary>Details</summary>
          <div className="drawer-body">{details}</div>
        </details>
      )}
      {(source || fetchedAt) && (
        <p className="source m-0">{source}{source && fetchedAt ? " · " : ""}{fetchedAt ? `updated ${ago(fetchedAt, now)}` : ""}</p>
      )}
    </section>
  );
}

export const stateOf = (f: { isLoading: boolean; error?: string; data?: unknown }): CardState =>
  f.isLoading ? "loading" : f.error && !f.data ? "lost" : f.error ? "stale" : "ok";
