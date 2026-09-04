import type { ReactNode } from "react";

type Props = {
  id: string;
  title: ReactNode;
  /** Right-aligned provenance line: source · observation date · refresh. */
  provenance?: ReactNode;
  state?: "ok" | "loading" | "lost" | "stale";
  bleed?: boolean;
  children: ReactNode;
};

export function Plate({ id, title, provenance, state = "ok", bleed, children }: Props) {
  return (
    <section className="plate" data-state={state} aria-labelledby={`${id}-title`}>
      <div className={`plate-inner${bleed ? " bleed" : ""}`}>
        <header className="plate-head">
          <h2 id={`${id}-title`} className="label-sm">{title}</h2>
          {provenance && <p className="meta m-0">{provenance}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
