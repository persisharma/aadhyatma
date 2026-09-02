# Plan — Font-size control (PRD-04 Reading comfort, T1)

_Status: proposed (loop run, plan-first). Awaiting human approval before slice 1._

## Problem

Readers can't adjust text size. The reading scale is fixed in
`mobile/src/theme/typography.ts` (a flat map of named styles, each with
`fontSize` and usually `lineHeight`). Comfort for older devotees and
low-vision users is the gap (PRD-04).

## Design decisions (the reason this is plan-first)

1. **Scale model — two presets only (user decision):** `M = 1.0` (default) and
   `L = 1.15`. No S, no XL. A simple two-way toggle; line-height stays proportional.
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

## Rendering verification (ensure ALL content renders right at every scale)

The feature must render correctly across every script and reader, not just crash-free.
Acceptance criteria, gated in CI where possible:

1. **Single-source scaling** — only `scaleTypography()` applies the factor; every
   screen via `useTheme().typography`. No per-screen scaling. (Prevents missed surfaces.)
2. **Proportional** — `fontSize` AND `lineHeight` scale by the same factor for every
   reading style; chrome styles unchanged. Unit-tested per style key.
3. **Cross-script / cross-screen render matrix** — extend the reader smoke tests to
   mount **each reader × {M, L}** and assert the first verse renders without throwing,
   in `hi` and a `latin` pass. Covers Devanagari, Gujarati, Kannada, and Latin
   transliteration. Runs in `ci.yml`.
4. **Worst-case overflow (visual)** — at XL, eyeball the longest content (a long Gita
   shloka, a Sundarkand doha) in the running app: text must wrap/scroll within the
   paged `VersePage`, never clip. Screenshot S vs XL.
5. **Chrome integrity** — top-bar title, page counter, dots, tab labels stay fixed
   size at XL (no clipping). Asserted in the matrix + visual pass.

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
- **OS font scaling interplay:** RN `<Text>` defaults to `allowFontScaling: true`, so
  the device accessibility text size already scales fonts — our multiplier would
  **compound** on it. Pick one: (a) keep OS scaling, treat ours as additional
  (simplest, but XL + large OS setting can get very big), or (b) set our factor and
  cap/normalize OS scaling on reading text to keep total size controlled. _(recommend
  (a) for slice 1, revisit if testing shows runaway sizes.)_
