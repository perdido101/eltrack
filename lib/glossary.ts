/** Definitions follow NOAA CPC / NWS glossary usage. Keep them short; the popover is small. */
export const GLOSSARY = {
  elnino: {
    term: "El Niño",
    full: "El Niño",
    def: "Warmer-than-normal water across the central and eastern tropical Pacific, lasting months, which shifts weather around the world. The warm phase of ENSO; it recurs every two to seven years and usually peaks in northern-hemisphere winter.",
  },
  lanina: {
    term: "La Niña",
    full: "La Niña",
    def: "The opposite of El Niño: cooler-than-normal water in the same part of the Pacific, with broadly opposite effects on weather.",
  },
  enso: {
    term: "ENSO",
    full: "ENSO — El Niño–Southern Oscillation",
    def: "The name for the whole El Niño / La Niña cycle. The coupled ocean–atmosphere oscillation of the tropical Pacific, recurring every two to seven years. El Niño is the warm phase, La Niña the cool phase; the Southern Oscillation is its atmospheric pressure see-saw.",
  },
  oni: {
    term: "ONI",
    full: "Oceanic Niño Index",
    def: "NOAA's primary ENSO index: the three-month running mean of Niño 3.4 sea-surface temperature anomalies, on centred 30-year base periods updated every five years. Five consecutive overlapping seasons at or beyond ±0.5 °C define an episode.",
  },
  soi: {
    term: "SOI",
    full: "The Pacific pressure index (SOI)",
    def: "A measure of whether the atmosphere is in El Niño or La Niña mode. The standardised difference in sea-level pressure between Tahiti and Darwin. Sustained negative values accompany El Niño, positive values La Niña.",
  },
  nino34: {
    term: "Niño 3.4",
    full: "The central Pacific (Niño 3.4)",
    def: "The patch of ocean everyone measures El Niño by. The box from 5°N to 5°S and 170°W to 120°W in the central equatorial Pacific. Its SST anomaly is the standard measure of ENSO state and the basis of the ONI.",
  },
  kelvin: {
    term: "Kelvin wave",
    full: "Kelvin wave",
    def: "A slow underwater wave that carries warm water east along the equator. An eastward-travelling wave along the equatorial thermocline, set off by westerly wind bursts in the west. A downwelling Kelvin wave deepens the thermocline and warms the surface as it arrives in the east, taking two to three months to cross the basin.",
  },
  thermocline: {
    term: "thermocline",
    full: "The warm layer's floor (thermocline)",
    def: "Where the warm surface water ends and the cold deep ocean begins. The layer where temperature falls steeply between the warm surface and the cold deep ocean. Along the equator it normally sits near 150 m in the west and 50 m in the east; during El Niño it deepens in the east and the slope flattens.",
  },
  walker: {
    term: "Walker circulation",
    full: "Walker circulation",
    def: "The big loop of air over the Pacific that the trade winds are part of. The east–west atmospheric overturning along the equatorial Pacific: air rises over the warm west, sinks over the cool east, and returns westward at the surface as the trade winds. It weakens or reverses during El Niño.",
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
