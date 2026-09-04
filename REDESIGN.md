# REDESIGN BRIEF — READ BEFORE ANY MORE UI WORK

Save as `REDESIGN.md`. Then tell Claude Code:
"Read REDESIGN.md. Do step 1 (the copy deck) and stop for my approval before
touching any component."

---

## 1. What's wrong

The data layer is right. Keep every adapter, route, parser, cache and fallback
exactly as they are. Do not touch `/lib/sources/` or `/app/api/`.

The presentation layer failed the actual audience. I said "credibility is the
aesthetic" and you built a NOAA bulletin: beige paper, season codes, acronyms in
every subtitle, captions written for forecasters. A normal person lands on this
page and understands nothing. That's on the brief as much as on you, and it's
what we fix now.

New target: **a person who knows "El Niño means weird weather" and nothing else
should understand every panel within five seconds of looking at it.** Think weather
app, not journal. The science stays exactly as rigorous; the surface stops
assuming a degree.

---

## 2. The audience test — apply to every element

Before any label, number, or caption ships, ask: would my friend who has never
heard of the Pacific Ocean's temperature understand this without help?

Concretely:

- **No unexplained acronym or code anywhere visible.** ONI, SST, SOI, OISST, JJA,
  MJJ, NRT, CPC — none of these appear in headlines, subtitles or big labels.
  They may appear in a small "source" line at the bottom of a panel, and inside
  the glossary. Nowhere else.
- **Every panel opens with an answer, not a metric.** The metric comes second.
- **Every panel closes with "what this means" in one plain sentence.**
- **Season codes become months.** `JJA 2026` → `June–August 2026`.
  `OBS JJA 2026 · 6H` → `Data through August · updates every 6 hours`.
- **Numbers get units and a comparison.** `+1.80` on its own means nothing.
  `+1.8 °C warmer than normal` means something. `Warmest since 2015–16` means more.
- **Anything a forecaster would need but a visitor wouldn't goes behind a
  tap.** A small "Details" or "?" affordance per panel opens the technical
  version: the exact index, base period, region coordinates, the caveats you
  wrote. That content is good — it just can't be the default view.

### Before → after, so the register is unambiguous

| Now | Should be |
|---|---|
| CURRENT STATE · OCEANIC NIÑO INDEX / 3-MONTH MEAN SST ANOMALY, NIÑO 3.4 · JJA 2026 / **+1.80** | **El Niño is here, and it's strong.** / The central Pacific is **1.8 °C warmer than normal** — the official "strong" range. / *Based on June–August. Updated every 6 hours from NOAA.* |
| ENSO ALERT SYSTEM STATUS / EL NIÑO ADVISORY / CPC · ISSUED 13 AUG 2026 · 1H | **Official status: El Niño Advisory** / NOAA's forecasters confirmed the event on 13 August. They give a >90% chance it becomes very strong this winter. |
| NIÑO REGIONS · WEEKLY SST ANOMALY / NIÑO 1+2 / 0–10°S · 90–80°W / **+4.2** | **How warm is each part of the Pacific?** / **Off the coast of Peru** · +4.2 °C · extremely warm / **Central Pacific** (the one forecasters watch) · +2.6 °C · strong / … |
| SOUTHERN OSCILLATION INDEX · MONTHLY, STANDARDISED / **−2.4** / Lower than 99% of all months | **Is the atmosphere joining in?** / Yes — the air pressure pattern over the Pacific is the most El Niño-like it's been since records began in 1951. / *What this means: when ocean and atmosphere lock together like this, the event usually strengthens.* |
| EQUATORIAL PACIFIC · SEA-SURFACE TEMPERATURE ANOMALY / NOAA OISST v2.1 NRT · OBS 2 SEP 2026 | **Where the ocean is warmer than normal** / Red is warmer, blue is cooler. The warm band along the equator is El Niño. / *Yesterday's satellite data.* |
| GLOBAL SEA SURFACE · DAILY MEAN, 60°S–60°N / 21.16 °C / ANOMALY VS 1991–2020 | **The whole ocean is near its all-time record** / 21.16 °C today · record is 21.17 °C, set April 2024 / *Global ocean surface, measured daily.* |
| Hatched bands mark episodes of five or more consecutive seasons beyond ±0.5. | Shaded areas are past El Niño (red) and La Niña (blue) events. Tap one to compare it with today. |

Every headline is a sentence with a verb. Every one answers a question the
visitor would actually ask.

---

## 3. Page structure — one question per screen

Rebuild the order so the page reads as a story:

1. **Right now** — the one-sentence answer, the big number with its unit and
   comparison, the official status. This screen alone should satisfy 80% of
   visitors.
2. **Where it's happening** — the map. Plain legend: "warmer" / "cooler", with
   the equator band called out.
3. **How strong, in context** — the four regions, plainly named by geography,
   and the 1950→now history reframed as "how this compares to past events."
4. **Is it getting stronger?** — the atmosphere (SOI), the subsurface heat
   (the leading indicator), the forecast plume as "what forecasters expect,"
   with the probabilities written as sentences: "9 in 10 chance El Niño lasts
   through winter."
5. **What it means for you** — the impacts panel, region by region, in plain
   language: "Wetter than usual: Peru, southern US, East Africa. Drier: Australia,
   Indonesia, southern Africa." With a "why" behind a tap.
6. **Latest news** — the wire, rewritten as a simple list of headlines with
   outlet and time.
7. **Explain the words** — glossary, still inline on tap wherever a term appears.
8. **Other anomalies** — the market panel, unchanged in placement and restraint.
9. Footer.

Sticky top strip: not a ticker of codes. Three plain pills:
`El Niño: STRONG` · `Trend: strengthening` · `Official status: Advisory`.

---

## 4. Visual direction — dark, alive, legible

You still own the design, but the paper direction is rejected. Constraints:

- **Dark base.** Deep navy/charcoal, not pure black. The page should feel like
  night over the ocean, not a terminal and not a spreadsheet.
- **The anomaly ramp is the identity, on dark.** Cool blues → near-neutral →
  warm orange → deep red. On a dark ground the warm end gets to glow; use that.
  Colour still means data — nothing is coloured for decoration.
- **Contrast for reading, not for style.** Body text at least AA on the dark
  ground. The big numbers are the brightest thing on the page.
- **Big, calm type.** The headline sentence on each panel is the largest text
  in that panel. Numbers second. Captions third. One sans for everything; mono
  only for the contract address and source lines. Stop using mono for headings.
- **Real space between panels.** Currently everything is jammed. Let each
  screen breathe; a visitor should be able to look at one thing at a time.
- **It should feel live.** "Updated 4 minutes ago" in human words on each
  panel. A gentle pulse on the status pill when data refreshes. The map can
  have a slow, subtle breathing animation on the warm band. That's the one
  motion budget — nothing else moves.
- Keep: reduced-motion support, keyboard access, skeleton loading, honest
  error states (rewritten in plain words: "Couldn't reach NOAA just now —
  showing data from 2 hours ago").
- Delete: the "last twelve seasons" strip. You already flagged it.

---

## 5. Process

**Step 1 — Copy deck first.** Produce a single markdown file, `COPY.md`, listing
every panel in the new order with its headline sentence, number line, "what this
means" line, source line, and the contents of its "Details" drawer. Plain
English throughout. Stop and wait for my approval. I will edit wording in that
file directly.

**Step 2 — Design tokens.** Update `DESIGN.md` for the dark direction. One
screenshot of a single panel (the "Right now" screen) before doing the rest.

**Step 3 — Rebuild every panel** against the approved copy. Screenshot at 1280
and 360. Then run the audience test on each screenshot yourself and list any
label a layperson would trip on.

No data changes at any step. If a panel's plain-language version needs a number
the adapter doesn't expose (e.g. "warmest since 2015–16" needs the max ONI per
historical episode), add a derived field in the adapter's output — but don't
change what's fetched.
