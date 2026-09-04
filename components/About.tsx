"use client";
import { useEffect, useRef } from "react";
import { PROJECT } from "@/config/project";
import { CopyButton } from "./CopyButton";

/** The `?` overlay: project description, contract address, community links. */
export function About({ openSignal }: { openSignal?: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "?") { e.preventDefault(); ref.current?.open ? ref.current.close() : ref.current?.showModal(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (openSignal) ref.current?.showModal(); }, [openSignal]);
  const links = [
    PROJECT.links.x !== "PENDING" && { label: "X", href: PROJECT.links.x },
    PROJECT.links.telegram !== "PENDING" && { label: "Telegram", href: PROJECT.links.telegram },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <dialog ref={ref} className="about" aria-labelledby="about-h" onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <div className="about-body">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="about-h" className="headline" style={{ fontSize: 24 }}>About {PROJECT.name}</h2>
          <button type="button" className="btn" onClick={() => ref.current?.close()}>Close</button>
        </div>
        <p className="m-0 body">
          A live picture of the Pacific during the 2026 El Niño, built from what NOAA, PMEL and IRI publish — nothing estimated, nothing filled in. It's meant to be read by anyone, not just forecasters.
        </p>
        <p className="m-0 body">
          The project is backed by {PROJECT.token.ticker}, a memecoin on Solana. It has no intrinsic value and nothing here is financial advice. The site works the same whether or not you care about that.
        </p>
        <div className="grid gap-2">
          <p className="caption m-0">Contract address</p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="source well-bg px-3 py-2" style={{ overflowWrap: "anywhere", color: "var(--color-ink-2)" }}>{PROJECT.token.address}</code>
            <CopyButton text={PROJECT.token.address} />
          </div>
        </div>
        {links.length > 0 && (
          <p className="m-0 body">{links.map((l, i) => <span key={l.label}>{i > 0 && " · "}<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a></span>)}</p>
        )}
        <p className="source m-0">Press ? to open or close this.</p>
      </div>
    </dialog>
  );
}
