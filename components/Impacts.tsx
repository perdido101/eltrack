"use client";
import { useFeed } from "@/lib/useFeed";
import type { OniData } from "@/lib/sources/oni";
import { Card } from "./Card";

type Item = { where: string; why: string };
const WETTER: Item[] = [
  { where: "Southern United States, California to Florida", why: "The subtropical jet stream shifts south and strengthens, steering Pacific storms into California and along the Gulf coast." },
  { where: "Coast of Peru and Ecuador", why: "Warm water right off the coast feeds thunderstorms over what is normally a desert; flooding can be severe." },
  { where: "Southeastern South America — Uruguay, southern Brazil, northern Argentina", why: "The same shifted jet stream brings repeated storms across the Río de la Plata basin." },
  { where: "East Africa — Kenya, Tanzania, Somalia", why: "The October–December \"short rains\" are boosted, especially when the Indian Ocean warms in step." },
  { where: "Central Pacific islands", why: "Rain follows the warm water eastward from Indonesia toward the dateline." },
];
const DRIER: Item[] = [
  { where: "Indonesia, Malaysia, the Philippines", why: "The rising air that normally sits over the warm western Pacific moves east, taking the rain with it. Wildfire and haze risk rises." },
  { where: "Eastern Australia", why: "Weaker trade winds and cooler water to the north cut off the moisture that feeds spring and summer rain." },
  { where: "Southern Africa", why: "December–February rains fail more often as the subtropical high strengthens over the region." },
  { where: "Northern Brazil and the Amazon", why: "Sinking air over the Atlantic side of South America suppresses the rainy season." },
  { where: "India — a weaker summer monsoon", why: "The shifted Walker circulation weakens the monsoon flow from June to September." },
  { where: "Central America and the Caribbean", why: "Stronger upper-level winds and sinking air reduce rainfall and suppress Atlantic hurricanes." },
];
const ALSO: Item[] = [
  { where: "Warmer winter across the northern US, Canada and Alaska", why: "The polar jet stream stays north, keeping Arctic air bottled up." },
  { where: "A quieter Atlantic hurricane season, a busier eastern-Pacific one", why: "Wind shear over the Atlantic tears storms apart; the warm eastern Pacific feeds them." },
  { where: "Coral bleaching in the tropical Pacific; Peru's anchovy fishery collapses", why: "Warm water stresses coral and shuts off the cold, nutrient-rich upwelling the fish depend on." },
  { where: "The global average temperature runs high", why: "The ocean gives back heat to the air; El Niño years set global temperature records." },
];

function List({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="grid gap-2 content-start">
      <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
      <ul className="m-0 grid gap-1 p-0" style={{ listStyle: "none" }}>
        {items.map((it) => (
          <li key={it.where}>
            <details className="drawer" style={{ borderTop: 0, paddingTop: 0 }}>
              <summary style={{ fontWeight: 500, color: "var(--color-ink)" }}>{it.where}</summary>
              <div className="drawer-body"><p>{it.why}</p></div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Static, sourced explainer — the one panel with no live data (COPY.md §5). */
export function Impacts() {
  const oni = useFeed<OniData>("oni", 6 * 3600_000);
  const phase = oni.data?.current.phase;
  const lead = phase === "El Niño"
    ? "These are the patterns a strong El Niño usually brings over the next six to nine months. \"Usually\" matters: each event is different, and El Niño tilts the odds rather than writing the forecast."
    : phase === "La Niña"
      ? "These are the patterns El Niño usually brings. During La Niña, the wet and dry lists broadly swap — see Details."
      : "With no El Niño or La Niña, none of these patterns is being pushed either way right now. Here is what a strong El Niño typically brings, for reference.";

  return (
    <Card
      id="impacts"
      headline="What it means for you"
      lead={<p className="m-0 body" style={{ fontSize: 18 }}>{lead}</p>}
      source="NOAA Climate Prediction Center and IRI seasonal composites, 1950–present · this panel is descriptive and doesn't change with the data"
      meaning="If you live in one of these places, this is the season to check local forecasts and flood or fire advice early. If you don't, you'll mostly notice it in food prices and the news."
      details={
        <>
          <p>Composites are the average of past events, weighted toward strong ones; individual events differ. Northern-hemisphere winter (December–February) is the season of the strongest, most reliable effects; some (India's monsoon, East Africa's short rains) come earlier.</p>
          <p><strong>La Niña:</strong> the wet and dry lists broadly swap, and the Atlantic hurricane season tends to be busier.</p>
          <p>Sources: <a href="https://www.climate.gov/enso" target="_blank" rel="noopener noreferrer">NOAA Climate.gov — El Niño and La Niña</a> · <a href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/impacts/warm.gif" target="_blank" rel="noopener noreferrer">CPC — typical El Niño impacts</a> · <a href="https://iri.columbia.edu/our-expertise/climate/enso/enso-essentials/" target="_blank" rel="noopener noreferrer">IRI — ENSO essentials</a>.</p>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <List title="Wetter than usual" items={WETTER} />
        <List title="Drier than usual" items={DRIER} />
      </div>
      <List title="Also typical" items={ALSO} />
      <p className="caption m-0">Tap a place for the why.</p>
    </Card>
  );
}
