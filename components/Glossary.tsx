import { GLOSSARY } from "@/lib/glossary";

export function Glossary() {
  return (
    <section className="card" aria-labelledby="glossary-h">
      <h2 id="glossary-h" className="headline">Explain the words</h2>
      <dl className="m-0 grid gap-x-10 gap-y-5 sm:grid-cols-2">
        {Object.entries(GLOSSARY).map(([k, g]) => (
          <div key={k}>
            <dt className="strong" style={{ fontSize: 17 }}>{g.full}</dt>
            <dd className="m-0 mt-1" style={{ fontSize: 15, lineHeight: 1.55 }}>{g.def}</dd>
          </div>
        ))}
      </dl>
      <p className="source m-0">Wherever one of these words appears on the page, tap it for the definition.</p>
    </section>
  );
}
