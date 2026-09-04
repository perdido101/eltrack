# COPY DECK — every panel, in the new order

Step 1 of REDESIGN.md. Nothing here is built yet. Edit wording directly in this file.

Conventions used below:

- `{curly}` = a value filled from live data. Where the value needs a field the adapters
  don't expose yet, it is marked **derived** and listed in §12 — computed from data
  already fetched, never a new fetch.
- Lines marked **branch** change with the state of the Pacific. The page has to read
  correctly when the event fades, when it's neutral, and during a La Niña, not just
  today. Today's branch is shown first.
- Every panel has the same five parts: **Headline** (a sentence with a verb), **Number
  line**, **What this means**, **Source line** (small, bottom, the only place codes and
  agency names live), and a **Details** drawer (behind a tap; the forecaster's version).
- Numbers: one decimal, always with a unit, always with a comparison. Warmer/cooler,
  never positive/negative or +/− on its own. Months, never season codes.

---

## 0. Sticky strip — three pills

Visible on every screen. Plain words only.

| Pill | Copy (branch) | Rule |
|---|---|---|
| Event | `El Niño: STRONG` · `El Niño: VERY STRONG` · `El Niño: MODERATE` · `El Niño: WEAK` · `La Niña: …` · `Pacific: NORMAL` | From the ONI strength band. Neutral shows `Pacific: NORMAL`. |
| Trend | `Trend: strengthening` · `Trend: holding` · `Trend: weakening` | **derived** — change in the central-Pacific weekly anomaly over the last four weeks: warmer by 0.2 °C or more = strengthening, cooler by 0.2 °C or more = weakening, otherwise holding. Points the same way as the event (a La Niña getting colder is "strengthening"). |
| Status | `Official status: Advisory` · `Official status: Watch` · `Official status: Not active` · `Official status: Final Advisory` | Verbatim from NOAA's alert status, minus the "El Niño / La Niña" prefix (the first pill already says which). |

The status pill pulses once, gently, when its data refreshes. Nothing else in the strip moves.

Tap on any pill scrolls to the panel that explains it.

---

## 1. Right now

The screen that should satisfy most visitors on its own.

**Headline** (branch)
- Strong or very strong El Niño: **El Niño is here, and it's {strong | very strong}.**
- Moderate: **El Niño is here.**
- Weak: **A weak El Niño is underway.**
- Neutral, status Watch: **No El Niño right now — but forecasters think one is coming.**
- Neutral, no alert: **The Pacific is close to normal right now.**
- La Niña: **La Niña is here{, and it's strong | , and it's very strong}.** (the cool phase; the rest of the panel says "cooler than normal")

**Number line**
The central Pacific is **{1.8} °C warmer than normal** — the official "{strong}" range.

**Comparison line** — **derived**
- If this is the highest value since a past event: *Warmest it's been since the {2015–16} El Niño.*
- If it's the highest on record: *The warmest reading in the record, which goes back to 1950.*
- Neutral: *Within the normal range (less than 0.5 °C from average).*

**Official status block**
**Official status: {El Niño Advisory}**
NOAA's forecasters confirmed the event on {13 August}. In their words: "{synopsis sentence, verbatim}."
- Branch, Watch: *NOAA's forecasters say conditions favour an El Niño forming within six months.*
- Branch, Not active: *NOAA has no El Niño or La Niña alert in effect.*

**What this means**
- Strong / very strong El Niño: *Events this strong usually reshape weather on every continent for the next six to nine months. The "What it means for you" section below shows where.*
- Moderate / weak: *A moderate El Niño tilts the odds toward the patterns below, but doesn't guarantee them.*
- Neutral: *Nothing unusual is being driven by the Pacific right now.*
- La Niña: *La Niña tends to push weather the opposite way from El Niño — the section below shows where.*

**Source line**
Based on {June–August} data · NOAA Climate Prediction Center · updated {4 minutes ago}

**Details** (drawer)
- *The number.* The Oceanic Niño Index: the average sea-surface temperature in the Niño 3.4 region (5°N–5°S, 170°W–120°W), compared with a 30-year baseline, averaged over three months. NOAA's primary El Niño measure.
- *The ranges.* Weak 0.5–0.9 °C · Moderate 1.0–1.4 °C · Strong 1.5–1.9 °C · Very strong 2.0 °C and above. Shown as a ladder with the current rung lit.
- *How long it's lasted.* {3} three-month periods in a row above the 0.5 °C line, since {April–June 2026}. NOAA counts it an official "episode" at five.
- *Where the number comes from.* NOAA's ONI file, {oni.ascii.txt}, checked every 6 hours. Latest three-month period: {June–August 2026}.
- *A note on the base period.* NOAA updates the baseline every five years so that the long-term warming of the oceans doesn't get counted as El Niño.

Deleted from this panel: the "last twelve seasons" strip.

---

## 2. Where it's happening

**Headline**
**Where the ocean is warmer than normal**

**Lead line**
Red is warmer than usual, blue is cooler. The warm band along the equator is El Niño.
- Branch, neutral: *No strong band along the equator means no El Niño or La Niña right now.*
- Branch, La Niña: *The cool band along the equator is La Niña.*

**Map legend** — plain: `Cooler than normal` ← → `Warmer than normal`, with `−3 °C` and `+3 °C` at the ends and nothing else.

**Layer controls** — plain: `Warmer / cooler than normal` (default) · `Actual temperature` · `Show the four regions` · `Show buoys`

**Region labels on the map** — plain names replace the codes: `Off Peru` · `Eastern Pacific` · `Central Pacific` · `Western Pacific`, each with its value: `+2.8 °C`. (The codes Niño 1+2, 3, 3.4, 4 move to the Details drawer and the glossary.)

**Hover / tap readout** — `{0°N 140°W} · {4.0} °C warmer than normal · {29.6} °C`

**Buoy panel** (opens when a buoy is tapped)
- Heading: **Buoy at {0°N 140°W}**
- *Surface water:* {29.8} °C on {1 September}
- *Warm layer reaches down to:* {164} m — normally about 50 m here. **What this means:** *the warm water isn't just a thin skin; it runs deep, which is what keeps an El Niño going.*
- *Temperature by depth* chart, when reported. If not: *No depth readings in the last few days.*

**What this means**
*Normally the warmest water sits in the western Pacific and the coast of South America is cool. During El Niño the warm water spreads east along the equator — that's the red band, and it's what shifts rainfall and storms around the world.*

**Source line**
Satellite sea-surface temperature, {yesterday} · NOAA OISST · Buoys: NOAA PMEL · updated {12 minutes ago}

**Details** (drawer)
- 1° grid, 25°N–25°S, 120°E–70°W. Anomalies against OISST's own 1971–2000 daily baseline, which is why the region values here run a few tenths warmer than NOAA's weekly figures on the 1991–2020 baseline.
- The four regions: Niño 1+2 (0–10°S, 90–80°W, "off Peru"), Niño 3 (5°N–5°S, 150–90°W, "eastern"), Niño 3.4 (5°N–5°S, 170–120°W, "central" — the one forecasters use), Niño 4 (5°N–5°S, 160°E–150°W, "western").
- Region values on the map are area-weighted averages of this grid.
- Buoys: TAO/TRITON moorings, latest daily report per mooring; the "warm layer" depth is the 20 °C isotherm.
- Grey cells are land or missing data.

---

## 3. How strong, in context

Two panels.

### 3a. How warm is each part of the Pacific?

**Headline**
**How warm is each part of the Pacific?**

**Four rows**, plain names first, code in Details only. Each row: name · what it is · the number with a word for it · a 52-week strip.

| Row | Copy |
|---|---|
| Off the coast of Peru | `+{4.2} °C` · *{extremely warm}* |
| Eastern Pacific | `+{3.4} °C` · *{extremely warm}* |
| Central Pacific — the one forecasters watch | `+{2.6} °C` · *{very warm}* |
| Western Pacific | `+{1.0} °C` · *{warm}* |

Word scale (applies to any region, both directions): 0.0–0.4 *near normal* · 0.5–0.9 *warm / cool* · 1.0–1.9 *very warm / very cool* · 2.0 and above *extremely warm / extremely cool*.

**Strip caption**: *The last 52 weeks. Red bars above the line are warmer than normal.*

**What this means**
- El Niño: *An El Niño that's warmest off South America, like this one, tends to hit Peru and Ecuador hardest — heavy rain on the coast and a collapse in the anchovy fishery.* (Branch: if the central Pacific is warmer than the Peru coast: *An El Niño centred in the middle of the Pacific, like this one, tends to spread its effects more evenly around the world.*)
- Neutral: *All four regions are close to normal.*
- La Niña: *Cooler water across the central and eastern Pacific is the signature of La Niña.*

**Source line**
Weekly, through {26 August} · NOAA Climate Prediction Center · updated {31 minutes ago}

**Details**
- Values are weekly averages against the 1991–2020 baseline, from NOAA's weekly Niño-region file.
- Region boxes as in panel 2.
- **derived**: *Highest weekly value in the central Pacific since {November 2015}* / *the highest weekly value on record* — needs the full weekly history, which the adapter already downloads but only returns the last 52 weeks of.

### 3b. How this compares with past El Niños

**Headline**
**How this compares with past El Niños**

**Lead line** — **derived**
- Branch, current run below every past peak: *Today's reading is already stronger than {18} of the {23} El Niños since 1950. It has not yet passed the biggest ones — {1997–98} and {2015–16} both peaked above {2.3} °C.*
- Branch, current is the strongest: *Today's reading is the strongest in the record, ahead of {1997–98}.*
- Branch, neutral: *Nothing is underway right now. The chart shows every El Niño and La Niña since 1950.*

**Chart** — the 1950→now bar chart, kept. Caption rewritten:
*Shaded areas are past El Niño (red) and La Niña (blue) events. Tap one to compare it with today. Drag to zoom.*

**Readout line** (hover / arrow keys): `{November 1997} · {2.4} °C warmer than normal · {very strong} El Niño`

**Table** — heading **Every El Niño since 1950**. Columns: *When* ({May 1997 – April 1998}) · *Peak* (`+{2.4} °C`) · *Lasted* ({12 months}) · *Strength* ({Very strong}). Toggle: `Show La Niña too`. Tap a row to frame it on the chart.

**What this means**
*Only three El Niños since 1950 reached "very strong": 1982–83, 1997–98 and 2015–16. Each one made global headlines for floods, droughts and heat. {Forecasters expect this one to join them.}* (last sentence only when the forecast panel shows ≥ 50% for very strong / the CPC synopsis says so)

**Source line**
Monthly since 1950 · NOAA Climate Prediction Center · updated {4 minutes ago}

**Details**
- The chart is the Oceanic Niño Index (see panel 1), one bar per three-month period.
- Shading marks episodes by NOAA's rule: five three-month periods in a row at or beyond 0.5 °C. Strength is by peak value. "Lasted" counts months from the centre of the first period to the centre of the last.
- The current run appears in the table once it reaches five periods.

---

## 4. Is it getting stronger?

Three panels.

### 4a. Is the atmosphere joining in?

**Headline**
**Is the atmosphere joining in?**

**Answer line** (branch) — from the SOI value and rank
- ≤ −1.0 and in the lowest 5% of months: **Yes — the air pressure pattern over the Pacific is the most El Niño-like it's been since records began in 1951.** (or *…since {February 1983}* when a lower month exists — **derived**)
- ≤ −1.0 otherwise: **Yes — the pressure pattern over the Pacific has flipped into El Niño mode.**
- −1.0 to −0.5: **Partly — the atmosphere is leaning El Niño's way.**
- −0.5 to +0.5: **Not yet — the atmosphere is close to normal.**
- ≥ +0.5: **The atmosphere is in La Niña mode.**

**Number line**
Pressure index: **{−2.4}** for {July} · lower than {99}% of all months since 1951

**Chart** — last three years of monthly bars, kept, with the grey range band. Caption: *Bars below the line are the El Niño direction. The grey band shows how far each month has ever swung since 1951.*

**What this means**
*When ocean and atmosphere lock together like this, the event usually strengthens: weaker trade winds let more warm water slide east, which weakens the winds further.*

**Source line**
Monthly, through {July} · NOAA Climate Prediction Center (Tahiti − Darwin pressure) · updated {2 hours ago}

**Details**
- The Southern Oscillation Index: the standardised difference in sea-level air pressure between Tahiti and Darwin. Sustained negative values accompany El Niño.
- Australia's Bureau of Meteorology publishes a 30-day version but doesn't serve it to sites like this one, so the monthly NOAA series is shown.
- Record low: {−3.6}, {February 1983}.

### 4b. How much heat is stored under the surface?

**Headline**
**How much heat is stored under the surface?**

**Answer line** (branch)
- Record: **More than at any time since measurements began in 1979.**
- ≥ 1.5: **A lot — this is the fuel for the months ahead.**
- 0.5–1.5: **Above normal.**
- −0.5–0.5: **About normal.**
- ≤ −0.5: **Below normal — the ocean is running down its reserve.**

**Number line**
Upper ocean, eastern Pacific: **{3.2} °C warmer than normal** in {August} · previous record {2.9} °C ({May 1997}) — **derived** (record excluding the current month)

**Chart** — the monthly bars since 1979, kept. Caption: *Temperature of the top 300 m of the equatorial Pacific, compared with normal, month by month since 1979.*

**What this means**
*This is the number forecasters watch most. Warm water piled up below the surface takes months to work its way east and up — so what's stored now shows up as El Niño strength later.*

**Source line**
Monthly, through {August} · NOAA Climate Prediction Center · updated {2 hours ago}

**Details**
- Average temperature anomaly of the upper 300 m, 180°–100°W (chart) and two wider bands, against a 1981–2010 baseline.
- {2.19} °C basin-wide · {2.75} °C 160°E–80°W · {3.21} °C 180°–100°W.
- Warm water is carried east along the thermocline by Kelvin waves (see glossary).

### 4c. What forecasters expect

**Headline**
**What forecasters expect**

**Answer sentences** — probabilities written as words. Rules: 95–100% → *almost certain*; 80–94 → *very likely*; 60–79 → *likely*; 40–59 → *a coin flip*; 20–39 → *unlikely*; below 20 → *very unlikely*. Fractions in the line: `{9 in 10}` = round(p/10) in 10.

- **El Niño lasting through winter:** *{Almost certain} — {10 in 10} chance through {February 2027}.*
- **Still going next spring:** *{Likely} — about {8 in 10} chance in {April–June 2027}.*
- Branch when a La Niña is favoured or neutral is favoured: mirror the same two lines for whichever state leads.

**Chart** — the nine stacked bars, kept. Each column labelled with the month range (`Aug–Oct`, `Sep–Nov` …) and the leading probability only. The secondary line ("N 0 · LN 0") is shown only when non-zero.

**What this means**
*These are the odds from {26} climate models combined. They agree unusually well right now. Strong El Niños usually fade fast in spring, which is why the odds drop after {March}.*

**Source line**
Issued {19 August} · IRI / Columbia Climate School · updated {5 hours ago}{ · showing the last saved forecast}

**Details**
- The CCSR/IRI model-based probabilistic forecast: an objective combination of dynamical and statistical models, equally weighted.
- NOAA's official forecast is a separate, human-judged product issued around the 10th of each month; NOAA's own sentence is quoted in panel 1.
- Nine overlapping three-month periods; thresholds ±0.5 °C on the central-Pacific anomaly.
- If the live figure can't be read, the panel shows the last saved forecast and says so in the source line.

---

## 5. What it means for you

New panel. Static, sourced explainer — the only panel with no live data.

**Headline**
**What it means for you**

**Lead line** (branch)
- El Niño: *These are the patterns a strong El Niño usually brings over the next six to nine months. "Usually" matters: each event is different, and El Niño tilts the odds rather than writing the forecast.*
- La Niña: same sentence with La Niña, and the lists swap (Details explains).
- Neutral: *With no El Niño or La Niña, none of these patterns is being pushed either way right now. Here is what a strong El Niño typically brings, for reference.*

**Two plain lists** (El Niño, boreal autumn–winter, from NOAA CPC / IRI composites):

**Wetter than usual**
- Southern United States, California to Florida (winter storms)
- Coast of Peru and Ecuador (can be severe flooding)
- Southeastern South America — Uruguay, southern Brazil, northern Argentina
- East Africa — Kenya, Tanzania, Somalia (the October–December rains)
- Central Pacific islands

**Drier than usual**
- Indonesia, Malaysia, the Philippines (higher wildfire and haze risk)
- Eastern Australia
- Southern Africa (December–February)
- Northern Brazil and the Amazon
- India — a weaker summer monsoon
- Central America and the Caribbean

**Also typical**
- Warmer winter across the northern US, Canada and Alaska
- A quieter Atlantic hurricane season, a busier eastern-Pacific one
- Coral bleaching in the tropical Pacific; Peru's anchovy fishery collapses
- The global average temperature runs high — El Niño years set records

Each list item has a `why` tap that opens one sentence, e.g. *Southern US: the subtropical jet stream shifts south and strengthens, steering Pacific storms into California and along the Gulf coast.*

**What this means**
*If you live in one of these places, this is the season to check local forecasts and flood or fire advice early. If you don't, you'll mostly notice it in food prices and the news.*

**Source line**
NOAA Climate Prediction Center and IRI seasonal composites, 1950–present · this panel is descriptive and doesn't change with the data

**Details**
- Composites are the average of past events, weighted toward strong ones; individual events differ.
- Northern-hemisphere winter (December–February) is the season of strongest, most reliable effects; some (India's monsoon, East Africa's short rains) come earlier.
- La Niña: the wet and dry lists broadly swap, and the Atlantic hurricane season tends to be busier.
- Source pages linked: NOAA Climate.gov "El Niño and La Niña: FAQ"; CPC "Typical El Niño impacts"; IRI ENSO impacts maps.

---

## 6. Latest news

**Headline**
**El Niño in the news**

**List** — up to twelve rows: outlet · headline · {3 hours ago}. Newest first. Links open in a new tab. No marquee (the sticky strip replaces the moving element; see REDESIGN §4).

**Empty / archive states**
- Live: no extra copy.
- Archive: small line above the list: *Couldn't reach the news feed just now — showing headlines saved on {3 September}.*
- Loading: three grey rows.

**Source line**
English-language coverage, filtered to major outlets · GDELT Project · updated {9 minutes ago}

**Details**
- Headlines are shown exactly as published. Wire stories syndicated across many sites are shown once. Weighted toward Reuters, AP, BBC, CNN, the Guardian, NYT, Newsweek, Fox Weather, NOAA and WMO.

---

## 7. Explain the words

**Headline**
**Explain the words**

Seven entries, kept, with the plain-language first sentence promoted to the top of each:

- **El Niño** — *Warmer-than-normal water across the central and eastern tropical Pacific, lasting months, which shifts weather around the world.* Then the existing definition.
- **La Niña** — *The opposite: cooler-than-normal water in the same place.*
- **ENSO** — *The name for the whole El Niño / La Niña cycle.* + existing.
- **The central Pacific (Niño 3.4)** — existing.
- **The Pacific pressure index (SOI)** — existing.
- **The warm layer (thermocline)** — existing.
- **Kelvin wave** — existing.
- **Walker circulation** — existing.

Inline: any of these words, wherever they appear on the page, gets the dotted underline and the popover.

---

## 8. Other anomalies

Placement and restraint unchanged from BRIEF §5. Copy, for completeness:

**Headline**
**Some people track other anomalies against the Pacific**

**Lead line**
*A curiosity, not a claim: the El Niño index plotted against the price of bitcoin, with a slider to shift one against the other.*

**Readout**: `Correlation {0.12} at {0}-month shift · {n = 158} months`

**Honest sentence**: *Four strong El Niños in bitcoin's lifetime aren't enough to prove anything. Move the slider and watch the number wander.*

**Token row** (one line): `$ElNiño · ${0.000123} · {+4.1}% today · market cap ${…} · {…} holders` · `View chart ↗`

**Contract address** with `Copy` → `Copied`.

**Source line**
NOAA ONI · CoinGecko · DexScreener · updated {30 seconds ago}

---

## 9. Footer

**Sources** — heading *Where the data comes from*. Each source: plain name, agency, how often it's checked (`every 6 hours`). Codes stay in the link text only.

**Notes**
- *This site isn't affiliated with NOAA, the Climate Prediction Center, IRI, Australia's Bureau of Meteorology or PMEL. The data is shown as those agencies publish it and may lag their official releases. Nothing is estimated or filled in: when a source can't be reached, the panel says so.*
- *$ElNiño is a memecoin with no intrinsic value. Nothing on this page is financial advice.*

**Contract address**, **community links** (X, Telegram), and the hint: *Press ? for about this project.*

---

## 10. Shared copy — states and time

**"Updated … ago"** (every source line): `just now` (< 1 min) · `{n} minutes ago` · `{n} hours ago` · `yesterday` · `{n} days ago`. Re-rendered every minute.

**"Data through …"**: months and days in words — `through August`, `through 26 August`, `yesterday`, `1 September`.

**Loading**: the panel's real layout with a grey dash where each number will be. No spinners.

**Couldn't reach the source, no saved data**:
*Couldn't reach {NOAA} just now.* / *We'll keep trying every few minutes.* / small: {what failed, in words: "the ONI file"}

**Couldn't reach the source, saved data available**:
*Couldn't reach {NOAA} just now — showing data from {2 hours ago}.* The numbers stay, dimmed.

**Reduced motion**: the status-pill pulse and the map's breathing are off; everything else is already still.

---

## 11. Words we don't use on the surface

ONI · SST · SSTA · SOI · OISST · NRT · CPC · PMEL · IRI · ERDDAP · GDELT · TAO/TRITON · anomaly (say "warmer/cooler than normal") · standardised · base period / climatology (say "normal" or "the 30-year average") · season codes (DJF, JJA …) · 180°–100°W-style ranges · "obs" · "±" · "σ".

All of them are allowed inside Details drawers, source lines, the glossary, and the footer.

---

## 12. Derived fields needed (no fetch changes)

| Field | Adapter | How |
|---|---|---|
| `comparison` for panel 1 — the most recent past episode whose peak exceeds the current value, or "record" | `oni` | scan `events` for the latest with `|peak| ≥ latest.anom`; already have the data |
| `trend` — strengthening / holding / weakening | `weeklySst` | Niño 3.4 anomaly now minus four weeks ago, ±0.2 °C threshold, signed by phase |
| `weeklyRecord` / `weeklyHighestSince` for panel 3a | `weeklySst` | scan the full weekly history the adapter already parses before slicing to 52 |
| `rankAmongEvents` — "stronger than N of the M El Niños" | `oni` | count events with `peak < latest.anom` |
| `lowestSince` for panel 4a | `soi` | latest month with a value ≤ current, before the current run |
| `previousRecord` for panel 4b | `heatContent` | max of the eastern band excluding the current month |
| `strengthWord` for any °C value | shared helper | the word scale in §3a |
| `probabilityWord` for percentages | shared helper | the scale in §4c |
