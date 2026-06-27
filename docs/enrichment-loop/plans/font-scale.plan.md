# Plan — Font-size control (PRD-04 Reading comfort, T1)

_Status: proposed (loop run, plan-first). Awaiting human approval before slice 1._

## Problem

Readers can't adjust text size. The reading scale is fixed in
`mobile/src/theme/typography.ts` (a flat map of named styles, each with
`fontSize` and usually `lineHeight`). Comfort for older devotees and
low-vision users is the gap (PRD-04).

## Design decisions (the reason this is plan-first)

1. **Scale model — discrete steps, not a free multiplier.** Offer 4 presets:
   `S = 0.9`, `M = 1.0` (default), `L = 1.15`, `XL = 1.3`. Discrete steps keep the
   parchment layout predictable (line-height stays proportional) and the control
   trivial. _Recommended over a continuous slider._
2. **What scales — reading text only, not chrome.** Scale the verse/meaning
   families (`verse`, `meaning`, `verseLatin`, `meaningEnglish`, the gu/kn verse
   styles, etc.). Do **not** scale `screenTitle`, counters, tab labels, or buttons
   — scaling UI chrome risks clipping (cf. the recent Android button-clip fix #149).
3. **Persistence** — one AsyncStorage key `@vedansh/font-scale`, same pattern as
   the other contexts.
4. **Surface** — a 4-segment control (S/M/L/XL) in More → a "Reading" row. Exact
   placement confirmed in slice 2.

## Slices

- **Slice 1 (ship first — additive, low-risk, fully testable):**
  - `mobile/src/theme/fontScale.ts` — `FONT_SCALES` map + a pure
    `scaleTypography(typography, factor)` that returns a new typography object with
    `fontSize`/`lineHeight` of the *reading* styles multiplied (chrome untouched).
  - `FontScaleContext` (provider + `useFontScale()` hook) with AsyncStorage
    persistence, default `M`.
  - Unit tests: factor math, default, that chrome styles are unchanged, that
    `M` is identity.
  - **No screen changes yet** — nothing user-visible, so it's safe to land alone.
- **Slice 2:** wire `ThemeProvider`/`useTheme()` to apply the active scale, add the
  S/M/L/XL control in More, persist on change. (Touches the provider + a screen →
  goes through `/enrich` approval, not autonomous.)

## Files

- New: `mobile/src/theme/fontScale.ts`, `mobile/src/theme/__tests__/fontScale.test.ts`,
  `mobile/src/contexts/FontScaleContext.tsx`.
- Slice 2 later: `mobile/src/theme/ThemeContext.tsx`, `App.tsx` (provider), a More screen control.

## Risks

- **Line-height coupling:** scaling `fontSize` without `lineHeight` cramps text —
  the util scales both. Covered by a test.
- **Chrome clipping:** mitigated by scaling reading styles only (decision 2).
- **gu/kn parity:** the sister-script verse styles must scale identically — the
  util keys off the style list, so they're included.

## Open decisions for the human

- OK with **discrete S/M/L/XL** (vs a slider)? (recommend yes)
- OK scaling **reading text only**, leaving UI chrome fixed? (recommend yes)
- Preferred surface: More → "Reading" row, or a control in the reader itself?
