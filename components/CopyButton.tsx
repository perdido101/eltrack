"use client";
import { useEffect, useState } from "react";

/** Copies `text`; confirms in place for 1.5 s without changing width. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1500);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      className="btn"
      style={{ minWidth: "6.5em" }}
      aria-live="polite"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); } catch { /* clipboard unavailable */ }
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}
