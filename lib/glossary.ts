/** Definitions follow NOAA CPC / NWS glossary usage. Keep them short; the popover is small. */
export const GLOSSARY = {
  enso: {
    term: "ENSO",
    full: "El Niño–Southern Oscillation",
    def: "The coupled ocean–atmosphere oscillation of the tropical Pacific, recurring every two to seven years. El Niño is the warm phase, La Niña the cool phase; the Southern Oscillation is its atmospheric pressure see-saw.",
  },
  oni: {
    term: "ONI",
    full: "Oceanic Niño Index",
    def: "NOAA's primary ENSO index: the three-month running mean of Niño 3.4 sea-surface temperature anomalies, on centred 30-year base periods updated every five years. Five consecutive overlapping seasons at or beyond ±0.5 °C define an episode.",
  },
  soi: {
    term: "SOI",
    full: "Southern Oscillation Index",
    def: "The standardised difference in sea-level pressure between Tahiti and Darwin. Sustained negative values accompany El Niño, positive values La Niña.",
  },
  nino34: {
    term: "Niño 3.4",
    full: "Niño 3.4 region",
    def: "The box from 5°N to 5°S and 170°W to 120°W in the central equatorial Pacific. Its SST anomaly is the standard measure of ENSO state and the basis of the ONI.",
  },
  kelvin: {
    term: "Kelvin wave",
    full: "Equatorial Kelvin wave",
    def: "An eastward-travelling wave along the equatorial thermocline, set off by westerly wind bursts in the west. A downwelling Kelvin wave deepens the thermocline and warms the surface as it arrives in the east, taking two to three months to cross the basin.",
  },
  thermocline: {
    term: "thermocline",
    full: "Thermocline",
    def: "The layer where temperature falls steeply between the warm surface and the cold deep ocean. Along the equator it normally sits near 150 m in the west and 50 m in the east; during El Niño it deepens in the east and the slope flattens.",
  },
  walker: {
    term: "Walker circulation",
    full: "Walker circulation",
    def: "The east–west atmospheric overturning along the equatorial Pacific: air rises over the warm west, sinks over the cool east, and returns westward at the surface as the trade winds. It weakens or reverses during El Niño.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
