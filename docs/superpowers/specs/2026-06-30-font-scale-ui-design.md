# Design — Font-size control, UI integration (PRD-04 Reading comfort, slice 2)

_Status: approved in brainstorming 2026-06-30. Builds on slice 1 (#153: `theme/fontScale.ts` + `contexts/FontScaleContext.tsx`, already merged)._

## Problem / goal

Slice 1 shipped the scaling util + persistence context but **nothing consumes them** —
`FontScaleProvider` is not mounted and no code reads `useFontScale()`, so text size
does not change. This slice makes the M/L preference actually scale reading text,
adds a UI control to set it, and guarantees **no content clips at the larger size**.

## Decisions

1. **Presets: M (1.0) / L (1.15)** — unchanged from slice 1's product decision. No S/XL.
2. **Only reading text scales** — the eight `READING_STYLE_KEYS` (`verse`, `meaning`,
   `verseLatin`, `verseGujarati`, `verseKannada`, `meaningEnglish`, `meaningGujarati`,
   `meaningKannada`). Chrome (titles, counters, tab labels, pills) stays fixed. The
   slice-1 util already enforces this.
3. **Surface (Q1 → A):** a "Reading size" card on the **More tab**, mirroring the
   existing Language card. Two pills — **Standard / Large** — plus a one-line sample
   verse that re-renders at the chosen size so the effect is visible in place.
4. **OS `allowFontScaling` interplay (Q2 → keep OS scaling):** leave RN's default
   `allowFontScaling: true`. Our M/L factor is baked into `fontSize`+`lineHeight` via
   `scaleTypography`; the OS accessibility multiplier applies on top. Rationale: this
   feature's audience is comfort / low-vision devotees who already use the OS large-text
   setting — overriding it (via `allowFontScaling={false}` or a cap) would fight the
   goal. The mechanism is identical on iOS and Android (no platform-specific code), so
   behavior is consistent cross-platform; absolute size tracks the user's own OS setting,
   which is correct. No cap unless the no-clip verification (below) proves one is needed
   purely as a clip backstop.

## Architecture — single-source scaling, zero per-screen edits

```
App.tsx:  <FontScaleProvider>      ← new mount, ABOVE ThemeProvider
            <ThemeProvider>        ← reads useFontScale(), serves scaled typography
              … rest of tree …
```

- **`FontScaleProvider`** (exists) mounted in `App.tsx` just above `ThemeProvider`.
- **`ThemeProvider`** consumes `useFontScale()` and provides
  `scaleTypography(typography, fontScaleFactor(scale))` as `theme.typography`
  (memoized on `scale`). One change, one source of truth.
- **Readers need no edits.** Every reader sizes verse/meaning via
  `verseToken(lang, useTheme().typography)` / `meaningToken(...)`, which return the
  themed `verse`/`meaning`/… styles. Verified across all 8 `*VersePage` variants
  (`Krishna`/`Ramcharitmanas` re-export `ShivaStrotam`/`Sundarkand`). Scaling the theme
  scales them automatically. This satisfies acceptance criterion "single-source — no
  per-screen scaling, no missed surfaces."

## UI — "Reading size" card (More)

- New card in `MoreScreen`, placed near the Language card, same `styles.section` shell.
- Two pills using the existing radio/pill pattern: **Standard** (M) and **Large** (L);
  selected pill highlighted (saffron), `accessibilityRole="radio"`, label "Reading size".
- A sample line under the pills (a short verse in the current reading language) rendered
  with `useTheme().typography.verse` so it grows/shrinks live as the pill changes.
- Reads/writes `useFontScale()`; persists to existing `@vedansh/font-scale` (no new key).

## No-clip guarantee (hard gate — explicit user requirement)

Scaling is global (theme-level), so it reaches every `verse`/`meaning` consumer, not
only the scrolling readers. Clip-safety basis:

- **Reader body text** is rendered inside `ScrollView` in all `*VersePage`s → vertical
  overflow scrolls, never clips.
- **Fixed-size / truncating surfaces audited and cleared:** `ShareCard` (fixed
  width/height canvas, `numberOfLines={5}`) consumes only `typography.*.fontFamily`,
  not the scaled `fontSize` — unaffected. The lone `numberOfLines={1}` reading-ish spot
  (`SanskarVersePage`) is on `versePill`, **not** a scaled key.
- **Chrome** is never scaled (decision 2) → cannot clip from this feature.

Acceptance criteria, gated:
1. **Render matrix (CI, platform-agnostic):** mount each reader × {M, L} in `hi` and a
   `latin` pass; assert the first verse renders without throwing. Covers Devanagari,
   Gujarati, Kannada, Latin.
2. **Proportional:** `fontSize` AND `lineHeight` scale by the same factor for every
   reading key; chrome keys unchanged (unit-tested per key — slice 1 + new ThemeProvider test).
3. **Worst-case overflow (visual, iOS):** at **L** and at **L + a maxed-out OS text
   setting**, screenshot the longest content (a long Gita shloka, a Sundarkand doha) and
   a sample of non-reader scaled surfaces (search snippet, daily-verse, chapter cards) —
   text must wrap/scroll within its container, never clip. Screenshot M vs L side by side.
4. **Chrome integrity:** top-bar title, page counter, dots, tab labels stay fixed size
   at L (asserted in the matrix + visual pass).
5. **Android caveat:** live Android visual clip-check needs a device/emulator (not
   available here, same constraint as #154). The render matrix is platform-agnostic and
   covers the component-level behavior; Android visual sign-off is called out, not faked.

## Files

- `mobile/App.tsx` — mount `FontScaleProvider` above `ThemeProvider`.
- `mobile/src/theme/ThemeContext.tsx` — consume `useFontScale()`, apply `scaleTypography`.
- `mobile/src/screens/MoreScreen.tsx` — add the "Reading size" card.
- Tests: `mobile/src/theme/__tests__/themeFontScale.test.tsx` (ThemeProvider applies
  scale; chrome fixed), extend the reader render-matrix test for × {M, L}.
- (No changes to readers, `fontScale.ts`, or `FontScaleContext.tsx`.)

## Testing summary

- **Unit:** existing `fontScale.test.ts`; new ThemeProvider scale test.
- **Component:** More "Reading size" card toggles + persists; sample re-renders.
- **Render matrix:** readers × {M, L} × {hi, latin}.
- **E2E (iOS, Maestro/Expo Go):** More → set Large → open a reader → screenshot M vs L;
  confirm verse grew, chrome unchanged, no clip. Reuse the screenshot-based approach.
- **Full suite:** `npm test` (typecheck + readers + engine + data) stays green.

## Risks

- **Line-height cramping:** mitigated — util scales `lineHeight` too (slice-1 test).
- **Broad reach of global scaling:** mitigated — audit cleared the fixed-size surfaces;
  render matrix + visual pass gate the rest.
- **OS compounding runaway:** accepted (respects accessibility); bounded only if the
  worst-case visual pass shows a clip, and only then via a `maxFontSizeMultiplier`
  backstop on reading text.
