# BUILD BRIEF — EL NIÑO LIVE TRACKER

Save as `BRIEF.md` in an empty repo. Then tell Claude Code:
"Read BRIEF.md. Propose your design direction and module layout first — one screen
of text — and wait for my go before writing code."

---

## 1. What this is

A **real, working El Niño / ENSO monitoring dashboard**. One page, live data, built
well enough that a weather nerd, a surfer, or a Peruvian fisherman would bookmark it
without ever noticing the second layer.

The second layer: the project is backed by a Solana token, **$ElNiño**. The token is
present but never the point. It is not in the hero, not in the headline, not in the
first screen. A first-time visitor should read the page as a climate tool. Someone
who already knows should be able to find the contract address within ten seconds.

Everything on the page that can be live is live. **No fabricated data, ever.** When a
feed fails, the module shows `SIGNAL LOST` with the last good timestamp.

```
TOKEN        $ElNiño
ADDRESS      2hbzoDxzvyspvXhxFkHkuxRNDyo3j2Z6aXUDy1A7pump
CHAIN        Solana (launched on pump.fun)
```

---

## 2. Design brief — you own the direction

Constraints, not a palette:

- Ground the design in real oceanography: CPC anomaly products, buoy telemetry,
  forecast plumes, ship instrument panels. Not cyberpunk, not a SaaS dashboard kit,
  not the memecoin-terminal genre.
- Credibility is the aesthetic. If NOAA linked to this page it should not embarrass
  them. That rules out glitch text, scanlines, blinking "BREAKING" labels.
- Colour carries data. An anomaly's colour says how far from normal it is. Choose
  the ramp yourself; be consistent everywhere.
- One memorable element, everything else disciplined. One page-load moment at most.
  No scroll-triggered fade-ups, no hover-lift on cards.
- Write your token system (colour, type, layout, principles) before coding, then
  check it against what you'd produce for any generic dashboard brief. If it looks
  default, change it and say why.
- Quality floor: responsive to 360px, keyboard focus visible, reduced-motion
  respected, real skeletons on load, error states that name the failed feed.

---

## 3. Stack

- Next.js (App Router), TypeScript, Tailwind.
- All external fetches in server route handlers under `/app/api/*` — CORS, caching,
  key hiding. Revalidation per source: monthly data 6h, weekly 1h, daily 1h, news
  15m, market 30s, on-chain 60s.
- One adapter per source in `/lib/sources/`, all returning
  `{ ok: true, data, fetchedAt } | { ok: false, error, lastGoodAt? }`.
- Client polling with SWR, interval per module.
- No database, no auth, no wallet adapter. Deploy on Vercel.

---

## 4. Climate modules — the whole visible page

Priority order. Build every one that can be made genuinely live.

**4.1 Current state** — the hero. ONI value, ENSO phase, alert classification in real
CPC vocabulary (`La Niña Advisory` / `Neutral` / `El Niño Watch` / `El Niño Advisory`),
months since onset, and the threshold ladder (Weak ≥0.5 / Moderate ≥1.0 /
Strong ≥1.5 / Very Strong ≥2.0) with the current band lit. Source: NOAA CPC
`oni.ascii.txt`.

**4.2 Pacific anomaly map** — equatorial Pacific with the Niño 1+2 / 3 / 3.4 / 4
boxes drawn on, filled by current SST anomaly. Source: Open-Meteo Marine API sampled
on a grid across the basin. Strongest candidate for the memorable element. Toggle
layers: anomaly, absolute SST, buoys, region boxes.

**4.3 Niño region readouts** — latest weekly SST anomaly for all four regions, each
with a 52-week sparkline. Source: NOAA CPC weekly file `wksst8110.for`.

**4.4 Southern Oscillation Index** — the atmospheric half. 30-day SOI, with the
historical range for context. Source: BoM Australia.

**4.5 Forecast plume** — CPC/IRI probabilities for El Niño / Neutral / La Niña
across the next 9 overlapping seasons, stacked bars. Source: IRI. If it cannot be
fetched live, hardcode the current table with a visible "updated [date]" label.

**4.6 Buoy array** — TAO/TRITON positions on the map; click for latest SST and
subsurface temps. Source: NOAA PMEL. If the data feed is impractical, positions only,
and say so in the popup.

**4.7 Global SST** — the daily planet-wide sea-surface temperature and its anomaly.
One big number, one sparkline, with the record line marked. Source: Climate
Reanalyzer / NOAA OISST.

**4.8 Subsurface** — equatorial Pacific upper-ocean heat content anomaly (the leading
indicator forecasters actually watch). Source: NOAA CPC TAO/heat content products.

**4.9 Trade winds** — 850hPa zonal wind anomaly over the central Pacific if a clean
source exists; otherwise skip rather than fake.

**4.10 Historical events** — a table of every El Niño since 1950 with peak ONI,
duration, and classification, verified against NOAA. Click a row to highlight its
window on the ONI history chart.

**4.11 ONI history** — the full 1950→now ONI series as a bar chart, coloured by sign,
with event bands. Zoomable.

**4.12 Impacts panel** — a static, sourced explainer: what El Niño typically means
for rainfall and temperature in each region, from NOAA/IRI composites. Real
teleconnection maps or clean summaries. Sourced, not vibes.

**4.13 News wire** — server-side RSS → JSON: NOAA CPC updates, BoM ENSO outlook,
climate-news query. Relative timestamps.

**4.14 Glossary** — ONI, ENSO, SOI, Niño 3.4, Kelvin wave, thermocline, Walker
circulation. Inline definitions on hover/tap wherever these terms appear.

---

## 5. The second layer — where the token lives

The token appears in exactly these places, and nowhere else:

**5.1 A "Market anomalies" panel** — well down the page, after the climate modules,
framed as a curiosity in the site's own voice: "Some people track other anomalies
against the Pacific." Contains:
- ONI × BTC dual-axis chart with a lag slider (0–18 months) recomputing Pearson r
  live, readout "r = 0.XX at N-month lag, n = XXX". Source: NOAA ONI + CoinGecko.
- Under it, one honest sentence about what four strong events prove.
- A small $ElNiño ticker: price, 24h change, market cap, holders. Source:
  DexScreener API by token address, pump.fun fallback if pre-graduation. The
  ticker is one row, not a module. A "view chart" link opens DexScreener in a new
  tab. No embedded chart, no trades feed, no how-to-buy.

**5.2 Contract address** — appears in three quiet places, each with a copy button
that confirms in place:
- inside the Market anomalies panel;
- in the footer, alongside the data-source attributions;
- in a keyboard shortcut: pressing `?` opens a small "About" overlay with the
  project description, the CA, and community links.

**5.3 Community links** — X and Telegram in the footer only.

Nothing on the page says "buy". Nothing says "to the moon". No roadmap, no
tokenomics table, no infection-protocol-style step cards. If a visitor wants the
token, the CA and a DexScreener link are enough.

---

## 6. Footer

- Every data source named and linked, with its refresh interval.
- Plain-language notes: not affiliated with NOAA, CPC, IRI, BoM or PMEL; data
  shown as published by those agencies, may lag official releases; the token is a
  memecoin with no intrinsic value and nothing here is financial advice.
- Community links, CA, and the `?` hint.

---

## 7. Build order

**Phase 1** — Tokens and shell, hero (4.1), ONI history (4.11), region readouts
(4.3), footer. Deployable end of phase.
**Phase 2** — Anomaly map (4.2), SOI (4.4), Global SST (4.7), news (4.13).
**Phase 3** — Forecast plume, buoys, subsurface, historical events table, glossary.
**Phase 4** — Market anomalies panel, CA placements, `?` overlay.

After each phase: build, screenshot, critique against §2, tell me one thing you'd
cut. Wait for my go before the next phase.

---

## 8. Config

```ts
// /config/project.ts
export const PROJECT = {
  name: "PENDING",              // site name — propose three options
  token: {
    ticker: "$ElNiño",
    address: "2hbzoDxzvyspvXhxFkHkuxRNDyo3j2Z6aXUDy1A7pump",
    chain: "solana",
  },
  links: { x: "PENDING", telegram: "PENDING" },
} as const;
```
