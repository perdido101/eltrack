# DESIGN — revision 2 (dark)

Supersedes the paper direction. Data layer unchanged. Copy is governed by COPY.md.

## 1. Principles

1. **One question per screen.** Each panel is a card that opens with a sentence
   answering a question a visitor would ask, then the number, then one line of
   "what this means". The forecaster's version lives behind a Details tap.
2. **Colour means one thing: distance from normal.** The anomaly ramp is the
   identity, and on a dark ground the warm end glows. Nothing else is coloured.
   Errors and status are typographic. Links are underlined text.
3. **Zero is the ground.** Normal water is the colour of the page. Only departure
   from normal has colour, so the map reads as "where something is happening".
4. **Big, calm type; one family.** Public Sans for everything. The headline
   sentence is the largest text in its panel; the number is the brightest thing on
   the page. Mono only for source lines and the contract address.
5. **Space is the structure.** Cards float on the ground with real gaps between
   them; there are no rules between panels. A visitor looks at one thing at a time.
6. **It feels live, quietly.** Every panel says when it was updated, in words. The
   motion budget is two things: the status pill's single pulse on refresh and a slow
   breathing on the map's warm band. Nothing else moves.
7. **Nothing on the surface needs a degree.** COPY.md §11 is the banned list.

## 2. Colour

### 2.1 Ground and text

```
--bg        #0B1220   page — night over the ocean, navy not black
--bg-2      #121B2C   card
--bg-3      #1A2539   wells, inputs, hover
--ink       #EEF2F7   headlines, numbers
--ink-2     #B7C0CE   body
--ink-3     #8592A6   captions, source lines   (5.3:1 on --bg-2 — AA)
--rule      #26324A   card edges, table lines
```

### 2.2 The anomaly ramp, on dark

Diverging, anchored at 0 °C = the card colour, clamped to ±3, Oklab interpolation.
The cool arm brightens into an icy blue; the warm arm goes rust → orange → red,
with saturation and a soft glow doing the work at the top end.

```
-3.0  #8FD0F5      +0.5  #4A3529
-2.5  #5FADE6      +1.0  #8C4A22
-2.0  #3C8BD0      +1.5  #C9601F
-1.5  #2C6AA6      +2.0  #F07A1E
-1.0  #244C78      +2.5  #F04E2B
-0.5  #22354F      +3.0  #E02424
 0.0  #1C2433
```

Text over a ramp fill: `--ink` everywhere except the three brightest cool stops and
the +2.0 orange, which take `--bg`. Glow: `text-shadow` / `filter: drop-shadow` in the
fill's own colour at 40% alpha, applied only to the hero number and to map cells at
or beyond +2.0 — that is the "glow" and it is data-driven, not decorative.

### 2.3 Words for magnitudes

The ramp is paired with the word scale in COPY.md §3a so colour is never the only
carrier: *near normal* · *warm/cool* · *very warm/cool* · *extremely warm/cool*.

## 3. Type

Public Sans only. Weights 400, 600, 700. Tabular figures on.

```
display   clamp(56px, 10vw, 104px) / 1.0 / 700 / -0.02em   the hero number
headline  clamp(24px, 3.4vw, 32px) / 1.2 / 600            one per panel, a sentence
number    clamp(28px, 4vw, 40px)  / 1.1 / 600             the panel's number line
body      16px / 1.55 / 400
caption   14px / 1.5  / 400   --ink-3
pill      13px / 1    / 600 / 0.02em
source    12px / 1.4  / 400   IBM Plex Mono, --ink-3
```

No uppercase tracked labels. Section names are sentences.

## 4. Layout

```
--measure     880px   card column
--bleed       1200px  map card
--card-pad    28px (20px under 480px)
--card-gap    40px (28px under 640px)
--radius      16px
```

One column. Cards are `--bg-2` with a 1px `--rule` edge and 16px radius, separated by
`--card-gap` of bare ground. The sticky strip sits above everything at 56px with a
blurred ground behind it. 360px is the design target; wide content scrolls inside
its card with `contain: inline-size` (never the page).

Each card, top to bottom: headline → lead/number line → content → *What this means*
→ Details (closed) → source line.

## 5. Motion

```
--pulse   1.2s   status pill, once, when its data refreshes
--breathe 7s     map cells ≥ +1.5 °C, opacity 0.82 → 1 → 0.82, looping
--ui      160ms  hover, focus, drawer open
```

Under `prefers-reduced-motion: reduce` the pulse and the breathing are off. There are
no load sweeps, counters, marquees, or scroll reveals.

## 6. States

**Loading**: the real layout with a grey dash where each number will be.
**Couldn't reach a source**: plain words per COPY.md §10, no colour.
**Stale**: numbers stay at 70% opacity with the "showing data from…" line.
**Focus**: 2px `--ink` ring at 2px offset on every interactive element.

## 7. Structure (COPY.md order)

Sticky strip · 1 Right now · 2 Where it's happening · 3a Regions · 3b Compared with
the past · 4a Atmosphere · 4b Subsurface heat · 4c Forecast · 5 What it means for you ·
6 News · 7 Glossary · 8 Other anomalies (Phase 4) · Footer.

## 8. Decisions carried forward

- Sources and substitutions as in revision 1 (OISST via ERDDAP for the map; CPC SOI;
  IRI figure read from geometry; GDELT wire; PMEL buoys).
- Derived fields added to adapters per COPY.md §12; nothing new is fetched.
- The "last twelve seasons" strip and the news marquee are removed.
