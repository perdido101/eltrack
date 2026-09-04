"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";

/** A defined term: dotted underline, definition on hover, focus, or tap. */
export function Term({ k, children }: { k: GlossaryKey; children?: ReactNode }) {
  const g = GLOSSARY[k];
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDoc = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDoc);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDoc); };
  }, [open]);
  return (
    <span ref={ref} className="term" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="term-btn"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children ?? g.term}
      </button>
      {open && (
        <span role="tooltip" id={id} className="term-pop">
          <span className="term-title">{g.full}</span>
          <span className="block">{g.def}</span>
        </span>
      )}
    </span>
  );
}
