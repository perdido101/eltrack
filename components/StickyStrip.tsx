"use client";
import { useEffect, useRef, useState } from "react";
import { useFeed } from "@/lib/useFeed";
import type { OniData } from "@/lib/sources/oni";
import type { WeeklySstData } from "@/lib/sources/weeklySst";
import type { AlertStatus } from "@/lib/sources/alertStatus";
import { rampColor } from "@/lib/ramp";
import { PROJECT } from "@/config/project";

const HOUR = 3600_000;

function Pill({ label, value, color, href, pulseKey }: { label: string; value: string; color?: string; href: string; pulseKey?: string }) {
  const [pulse, setPulse] = useState(false);
  const seen = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (pulseKey && seen.current && seen.current !== pulseKey) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1300);
      return () => clearTimeout(t);
    }
    seen.current = pulseKey;
  }, [pulseKey]);
  return (
    <a href={href} className={`pill pill-text${pulse ? " pulse" : ""}`} style={{ textDecoration: "none" }}>
      {color && <span className="dot" style={{ background: color, color }} aria-hidden />}
      <span style={{ color: "var(--color-ink-3)", fontWeight: 500 }}>{label}</span>
      <span>{value}</span>
    </a>
  );
}

/** Three plain pills, always visible (COPY.md §0). */
export function StickyStrip() {
  const oni = useFeed<OniData>("oni", 6 * HOUR);
  const weekly = useFeed<WeeklySstData>("weekly-sst", HOUR);
  const alert = useFeed<AlertStatus>("alert", HOUR);
  const cur = oni.data?.current;
  const v = oni.data?.latest.anom ?? 0;

  const event = cur
    ? cur.phase === "Neutral" ? { label: "Pacific:", value: "NORMAL" } : { label: `${cur.phase}:`, value: (cur.strength ?? "").toUpperCase() }
    : { label: "Pacific:", value: "…" };
  const trend = weekly.data ? weekly.data.trend.kind : "…";
  const status = alert.data ? alert.data.status.replace(/^(final\s+)?(el niño|la niña)\s+/i, (m, f) => (f ? "Final " : "")) : "…";

  return (
    <div className="strip">
      <nav className="strip-inner" aria-label="Current state">
        <span className="strip-name">{PROJECT.name}</span>
        <Pill label={event.label} value={event.value} color={cur ? rampColor(v) : undefined} href="#now-h" pulseKey={oni.fetchedAt} />
        <Pill label="Trend:" value={trend} href="#regions-h" pulseKey={weekly.fetchedAt} />
        <Pill label="Official status:" value={status} href="#now-h" pulseKey={alert.fetchedAt} />
      </nav>
    </div>
  );
}
