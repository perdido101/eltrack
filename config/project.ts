export const PROJECT = {
  name: "Super El Niño Monitor",
  shortName: "SEN Monitor",
  strapline: "Equatorial Pacific ENSO monitoring",
  token: {
    ticker: "$ElNiño",
    onChainName: "Super El Niño",
    address: "2hbzoDxzvyspvXhxFkHkuxRNDyo3j2Z6aXUDy1A7pump",
    chain: "solana",
  },
  // "PENDING" hides a link until it is set.
  links: { x: "https://x.com/SuperElnino_", telegram: "PENDING" } as { x: string; telegram: string },
} as const;
