import { GLOSSARY } from "@/lib/glossary";
import { Plate } from "./Plate";

export function Glossary() {
  return (
    <Plate id="glossary" title="Glossary" provenance="Definitions follow NOAA CPC usage">
      <dl className="m-0 grid gap-x-10 gap-y-4 sm:grid-cols-2" style={{ maxWidth: "var(--measure-plate)" }}>
        {Object.entries(GLOSSARY).map(([k, g]) => (
          <div key={k}>
            <dt className="label-sm">{g.full}{g.term !== g.full && g.term !== g.full.toLowerCase() ? <span className="meta ml-2 text-ink-3 normal-case tracking-normal">{g.term}</span> : null}</dt>
            <dd className="m-0 mt-1 text-ink-2" style={{ fontSize: 14, lineHeight: 1.5 }}>{g.def}</dd>
          </div>
        ))}
      </dl>
    </Plate>
  );
}
