# DESIGN — token system and module layout

Written before any code, per BRIEF.md §2. Nothing here is implemented yet.

---

## 0. The premise

The Pacific is in a strong, still-strengthening El Niño *right now* (ONI MJJ 2026
`+1.39`, weekly Niño 3.4 `+2.6`, upper-300m heat content anomaly `+3.21 °C`). The
site is not a dormant monitoring tool waiting for something to happen. It is a
bulletin published during an event.

That fixes the register: **operational bulletin, not dashboard.** The references
are the CPC weekly ENSO update, a BoM climate driver page, and a ship's instrument
bulkhead. Printed, authoritative, slightly austere. Not a product.

---

## 1. Principles

These are the rules everything else is derived from. Where a later decision looks
odd, it is because of one of these.

1. **Colour means one thing: distance from normal.** A single diverging ramp,
   anchored at zero, is the only colour on the page. If something is coloured, it
   is an anomaly, and its colour states the magnitude. Nothing else earns colour —
   not links, not buttons, not the brand, not errors.
2. **Errors are not red.** `SIGNAL LOST` is grey and typographic. Red at full
   saturation means `+3 °C`, and it cannot also mean "the RSS feed timed out."
   This is the clearest test of principle 1 and the first thing a generic
   dashboard would get wrong.
3. **Type carries hierarchy, not size-of-box or colour.** The largest object on
   any screen is a number. The second largest is the CPC classification of that
   number. Everything else is 11–15px.
4. **Reading order is information order.** One column, top to bottom, in BRIEF §4
   priority order. No sidebar, no tabs, no dashboard grid, no drag-to-rearrange.
   The page has an argument and it makes it in sequence.
5. **The sheet is continuous.** Modules are *plates* divided by hairline rules
   with no gutter between them — one printed sheet, not a deck of cards. No
   shadow, no radius, no hover-lift, no card float.
6. **Every number carries its provenance.** Value, unit, observation date, and
   source appear together or the number does not ship. A figure with no date is
   a fabricated figure.
7. **One motion.** The basin paints itself once on load. Nothing else on the page
   moves except direct response to input.

---

## 2. Colour

### 2.1 The anomaly ramp — the only colour system

Diverging, anchored at 0, domain −3 … +3 °C, clamped. Blue↔amber↔ember rather
than blue↔white↔red: the neutral stop is the paper itself, so a zero anomaly is
literally *absence of ink*, and the warm arm runs through amber into an oxidised
ember rather than a fire-alarm red.

```
-3.0  #0B3B57   abyss
-2.5  #10506F
-2.0  #1A6785
-1.5  #3A819A
-1.0  #6BA0B0
-0.5  #A8C4C8
 0.0  #E8E4D9   bone  (= paper)
+0.5  #E5C9A3
+1.0  #DDA46F
+1.5  #CE7A45
+2.0  #B85326
+2.5  #9A3313
+3.0  #74180B   ember
```

Interpolated in Oklab so mid-ramp steps stay perceptually even. Blue↔amber is the
colour-vision-deficiency-safe diverging pair; red↔green would not be.

Two consequences, both deliberate:

- The ramp is **monotonic in lightness from each end toward the centre**, so in
  greyscale it reads as magnitude but *loses sign*. Therefore **a ramp fill is
  never the only encoding of sign** — every filled element carries a signed
  numeral (`+2.6`, `−0.4`) or sits on a signed axis.
- The same ramp colours the map, the ONI history bars, the region readouts, the
  sparkline fills, and the lit band of the threshold ladder. One legend, printed
  once, governs the whole page.

Text over a ramp fill: `ink` where |anomaly| < 1.5, `paper` where ≥ 1.5.

### 2.2 Ground and ink

```
--paper        #F4F1EA   page ground (warm bulletin stock, not white)
--paper-plate  #FAF8F3   plate fill, a half-step up
--paper-sink   #EDE9E0   inset wells (table headers, code, CA field)
--ink          #16181A   values, headings
--ink-2        #55595C   prose, secondary
--ink-3        #83888C   labels, units, timestamps, SIGNAL LOST
--rule         #C9C4B8   hairlines
--rule-strong  #16181A   the one heavy rule under the hero
```

No accent colour exists. Links are `--ink` with a 1px underline at 0.15em offset,
thickening on hover. That is the entire interactive palette.

### 2.3 Light only, permanently

Decided: no night variant. A paper metaphor with a dark twin collapses into a
generic dashboard, and the ramp is calibrated against the bone neutral. The page
declares `color-scheme: light only`.

---

## 3. Type

**Public Sans** — labels, prose, UI. It is the typeface of the US Web Design
System; it is what a federal climate product is actually set in. Chosen over Inter
precisely because Inter is what the generic version of this brief would use.

**IBM Plex Mono** — every figure on the page, without exception. Real tabular
figures, instrument-panel lineage, no cyberpunk connotation. All numbers are
tabular-lining so columns and the live-updating hero value never reflow.

```
label-xs   10px / 1.2  / 600 / 0.09em tracking / uppercase   Public Sans
label-sm   11px / 1.3  / 600 / 0.07em tracking / uppercase   Public Sans
meta       12px / 1.4  / 400                                 IBM Plex Mono
body       14px / 1.55 / 400                                 Public Sans
prose      15px / 1.62 / 400  (max 68ch — impacts, glossary) Public Sans
value-sm   18px / 1.0  / 500                                 IBM Plex Mono
value-md   28px / 1.0  / 500 / -0.01em                       IBM Plex Mono
value-lg   44px / 1.0  / 500 / -0.015em                      IBM Plex Mono
value-hero clamp(64px, 13vw, 128px) / 0.9 / 500 / -0.025em   IBM Plex Mono
```

Headings are `label-sm`, not large text. A module title is a small tracked cap
label sitting on the plate's top rule — the way a chart panel is labelled on a
printed bulletin. The heading never competes with the value.

---

## 4. Layout, space, and the plate

Base unit **4px**. Space scale: 4 8 12 16 20 24 32 40 56 72.

```
--measure-prose   68ch
--measure-plate   1080px
--measure-bleed   1360px   (map only)
--plate-pad       20px  /  16px below 480px
--radius          0      everywhere, no exceptions
```

A **plate** is: 1px `--rule` top border, `--paper-plate` fill, `--plate-pad`
padding, a `label-sm` title flush left on the top rule, and a right-aligned
`meta` provenance line (`CPC · OBS 26 AUG 2026 · 1h`). Plates stack with **no
gap** — adjacent borders form the continuous sheet. Full-bleed rules run edge to
edge; plate content stays within `--measure-plate`.

Responsive: the column is the design at every width. 360px is the design target,
not a fallback. Desktop is the same column, centred, with the map permitted to
bleed to `--measure-bleed`. There is no two-column breakpoint. Wide tables and the
map scroll inside their own `overflow-x: auto` well; the page body never scrolls
sideways.

---

## 5. Motion

```
--dur-sweep  700ms   basin paint-in, once per load
--dur-ui     120ms   direct response to input only
--ease       cubic-bezier(0.22, 0.61, 0.36, 1)
```

**The one moment** (plus the wire, see §7): on first paint the Pacific basin fills west→east over 700ms,
the ramp arriving in the direction warm water actually propagates during an event.
It runs once. It never replays on data refresh. Under `prefers-reduced-motion:
reduce` the map renders filled with no sweep — same final frame, zero motion.

Nothing else animates: no scroll reveals, no counter roll-ups, no hover lift, no
shimmer. `--dur-ui` is spent on the lag slider, the map layer toggles, the copy
confirmation, and focus rings. That is the complete inventory.

---

## 6. States

**Loading.** The plate renders its real layout at real size, with each value
replaced by an em-dash rule in `--ink-3` and each chart by its own axes with an
empty plot area. No shimmer, no spinner, no grey blobs. The page does not reflow
when data lands, because the skeleton is already the right shape.

**Signal lost.** The plate frame persists; its border becomes 1px dashed `--rule`.
The value area is replaced by, in `--ink-3`:

```
SIGNAL LOST
NOAA CPC · oni.ascii.txt
LAST GOOD 26 AUG 2026 14:03 UTC
```

Named feed, named file, last good timestamp. Grey, never red (§1.2). If a cached
last-good value exists it is shown at 60% opacity beneath, explicitly labelled
`STALE`, never silently.

**Stale but live.** When a source's own publication lags (CPC weekly posts
Mondays), the provenance line states the observation date, not the fetch date. A
value observed nine days ago says so.

**Focus.** 2px solid `--ink` at 2px offset, with a 1px `--paper` inner ring so it
survives over any ramp fill. Applied to a `:focus-visible` selector only, never
removed.

---

## 7. Module layout — the sheet, top to bottom

| # | Plate | Notes |
|---|---|---|
| — | **Masthead** | Wordmark at `label-sm`, one line. Below it, right-aligned, `LAST UPDATE · UTC`. Under 40px tall. The name is not the hero — the number is. |
| 4.1 | **Current state** | `value-hero` ONI in ink (a ramp-coloured numeral fails contrast near zero), with an 8px ramp-filled band beneath it carrying the colour. Under it the CPC classification in tracked caps. Then the threshold ladder as four hairline cells (Weak / Moderate / Strong / Very Strong) with the current band filled from the ramp. Then months-since-onset and the seasonal run of ONI values that established it. Closed by `--rule-strong`, the only heavy rule on the page. |
| — | **Wire** | Full-bleed band directly under the hero: a continuous chyron of mainstream headlines about the event (GDELT, filtered by outlet, deduplicated, twelve max), each a source badge plus headline plus age, linking out. Pauses on hover and focus. Under reduced motion it becomes a static stacked list. This is the one standing exception to §1.7 — a second continuous motion — accepted because the bar's job is to show coverage arriving, and the type never changes register. Headlines are shown untouched. |
| 4.2 | **Pacific basin** | Bleeds to `--measure-bleed`. Equatorial Pacific with the four Niño boxes drawn as hairline rectangles, filled from the ramp. Layer toggles as a row of tracked-caps text buttons, not pills. The load sweep lives here. The ramp legend prints once, beneath it, and serves the whole page. |
| 4.3 | **Region readouts** | Four rows: region name, latest weekly SSTA at `value-md` ramp-coloured, 52-week sparkline with a zero rule and ramp-filled area. |
| 4.7 | **Global SST** | One `value-lg` number, one sparkline, the record line marked as a labelled hairline. |
| 4.8 | **Subsurface** | Upper-300m heat content anomaly, three longitude bands, with a note that this is the leading indicator. Currently the most dramatic panel on the page. |
| 4.4 | **Southern Oscillation** | The atmospheric half. Monthly standardised SOI from CPC Darwin/Tahiti, with the historical range as a grey band behind. Labelled with the exact product shown. |
| 4.5 | **Forecast plume** | Nine overlapping seasons, stacked bars, three outcomes. |
| 4.6 | **Buoy array** | Reads as an annex to 4.2 rather than a separate map. |
| 4.11 | **ONI history** | 1950→now, bars ramp-coloured by value, event bands behind. Zoom by brush. |
| 4.10 | **Historical events** | Table. Row click highlights that window in 4.11 above. |
| 4.12 | **Impacts** | Prose at `--measure-prose`. Sourced, attributed inline. |
| 4.13 | **News wire** | Rows: relative time in `meta`, headline in `body`, source in `label-xs`. |
| 5.1 | **Market anomalies** | Below every climate module. Same plate, same type, same ramp — no visual break in register, which is what makes it read as a curiosity rather than a pitch. |
| — | **Footer** | Sources with refresh intervals, disclaimers, CA, links, `?` hint. |

4.9 (trade winds) is omitted until a clean source is confirmed, per BRIEF §4.9.
4.14 (glossary) is not a plate — it is a dotted underline on defined terms
throughout, opening an inline definition on hover/focus/tap.

---

## 8. Self-check against a generic dashboard brief (BRIEF §2)

What the default version of this brief produces: dark ground, cyan or violet
accent, rounded cards on a 12-column grid with gutters and soft shadows, Inter
throughout, animated counters, scroll-triggered fade-ups, red for errors and green
for good, a sidebar nav, a KPI row of four equal tiles at the top.

Every one of those is inverted here, and each inversion has a reason:

| Default | Here | Why |
|---|---|---|
| Dark + neon accent | Warm paper, no accent | Accent colour competes with the anomaly ramp for meaning. Deleting it makes the data the only coloured thing. |
| Rounded shadowed cards | Hairline plates, zero radius, no gap | Cards imply independent widgets. This is one document making one argument. |
| Inter | Public Sans + IBM Plex Mono | Public Sans is what a federal climate product is actually set in. Inter is what a SaaS product is set in. |
| KPI tile row | One hero number at 128px | Four equal tiles say four things matter equally. One number matters. |
| Red = error, green = ok | Errors grey, no green exists | Red is reserved for `+3 °C`. A status colour would corrupt the ramp. |
| Counters roll up, cards fade in | One 700ms basin sweep, nothing else | Motion on a monitoring tool implies the data is moving. It isn't; it updates hourly. |
| Sidebar nav | None | Fourteen modules in fixed priority order need reading, not navigating. |

The one thing I would cut if forced: **4.6, the buoy array**, folded entirely into
4.2 as a toggle layer. As its own plate it repeats the map without adding an
argument.

---

## 9. Decisions and open items

1. **Site name** — Super El Niño Monitor; domain `senmonitor.com` once registered.
2. **Night variant** — none, permanently (§2.3).
3. **Map anomaly baseline** — Open-Meteo Marine returns absolute SST with no
   climatology, so it cannot produce an anomaly on its own. Either a static OISST
   1991–2020 climatology grid is committed to the repo (honest, versioned,
   auditable, ~tens of KB) or an OISST anomaly product is used directly. Resolve
   before 4.2 is built, not during.
4. **On-chain token name is "Super El Niño", symbol `ElNiño`** — BRIEF §8 has
   ticker `$ElNiño`. Confirm which string the ticker row should print.
5. **Weekly SST source** — `wksst9120.for` (1991–2020 base), not the brief's
   `wksst8110.for`, which stopped updating in January 2021.
6. **SOI and global SST** — BoM and Climate Reanalyzer refuse datacenter IPs;
   NOAA substitutes (CPC Darwin/Tahiti pressures; OISST) per the Phase 2 decision.
