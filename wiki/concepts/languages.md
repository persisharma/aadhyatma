---
title: Reading Languages (hi/en/gu/kn)
type: concept
sources: [mobile/src/data/gita/language.tsx, mobile/src/utils/transliterate.ts, mobile/src/utils/localize.ts, mobile/src/utils/langType.ts, mobile/src/utils/titleByLanguage.ts, mobile/src/components/LanguageToggle.tsx, mobile/src/theme/typography.ts, docs/superpowers/specs/2026-06-13-gujarati-kannada-language-support-design.md]
last_verified_date: 2026-06-13
confidence: high
status: current
---

## Summary

The app has one shared reading-language preference, `Lang = 'hi' | 'en' | 'gu' | 'kn'`
(`useGitaLanguage()`, persisted at AsyncStorage `@vedansh/language`, default `'hi'`). Hindi and
English render the authored bilingual content fields; **Gujarati and Kannada carry no stored
content** — their script is derived at runtime by transliterating the Devanagari. Added
2026-06-13 (gu/kn support); `GitaLang` is kept as an alias of `Lang`.

## Details

**State** (`data/gita/language.tsx`): `Lang` union + `GitaLang` alias; `LANGUAGES` metadata
array (value, nativeLabel, shortLabel, a11yLabel, script) drives the toggle/radios;
`scriptOf(lang)`. Storage validation accepts the four values, unknown → default `'hi'`.

**Transliteration** (`utils/transliterate.ts`): pure `toGujarati`/`toKannada`/
`transliterateDevanagari(text, 'gu'|'kn')` — a dependency-free Devanagari→Brahmi codepoint map
following the faithful ISO-15919 / Unicode correspondence. Non-Devanagari passes through (safe
on mixed strings, idempotent). Notable: ॐ→ૐ / ಓಂ (no single Kannada om codepoint); candrabindu
ँ→ઁ/ಁ and nukta ़→઼/಼ preserved in **both** scripts; precomposed क़…य़ decompose to base+nukta;
Devanagari digits map to the script's digits. Golden-pair tests in `__tests__/transliterate.test.ts`.

**Verified against an independent authority (2026-06-13):** ran the engine over all 5,548
distinct Devanagari corpus strings and diffed vs `indic_transliteration` (sanscript) —
**99.8% identical** for both gu and kn; the handful of diffs are cases where sanscript leaks
Devanagari (precomposed क़…य़) and our engine is correct. This cross-check corrected an early
Kannada simplification (candrabindu→anusvara / nukta-dropped) to the faithful mapping, after
confirming Noto Serif Kannada renders U+0C81/U+0CBC.

**Selection helpers** (`utils/localize.ts`) — the API every UI site uses (never a bare
`lang === 'hi' ? … : …`):
- `pick(lang, {hi,en,gu,kn})` — hand-authored UI prose (all four required).
- `contentByLang(lang, hi, en)` — titles/labels/Sanskrit terms; gu/kn re-script `hi`.
- `meaningByLang(lang, hi, en)` / `commentaryByLang` — **meaning policy**: everything in the
  selected script — gu AND kn re-script the Hindi meaning/commentary into their script (Hindi
  wording in the regional script; no native translations authored yet); en stays English.
  `meaningSourceLang` is identity (each language styles in its own script).
- `verseLinesByLang(lang, deva, latin)` — recitation lines; gu/kn re-script the Devanagari.

**Typography** (`utils/langType.ts` + `theme/typography.ts`): `verseToken`/`meaningToken`/
`titleFontByLang`/`cardFontByLang`/`isLatinLang` select tokens per language. gu/kn use bundled
**Noto Serif Gujarati / Kannada** (`fontFamilies.gujarati(Bold)`/`kannada(Bold)`,
`verse/meaningGujarati/Kannada` tokens) at the Devanagari size class; loaded in `App.tsx`.
`titleByLanguage.orderTitlesByLanguage` returns gu/kn primary = re-scripted `nameHi` in the
script serif, secondary = English (listing cards stay bilingual; RULEBOOK §3).

**Why transliteration, not authored fields or i18n:** Gujarati/Kannada are sister Brahmi
scripts with ~1:1 Devanagari correspondence; devotional text is printed that way regionally, so
script conversion is orthography-preserving (correct where romanization would not be — design.md
§3.1). Adds zero stored content, keeps RULEBOOK §10 content gates untouched, and every future
section gets gu/kn for free. See [[overview]] and the design spec.

## Gotchas

- **No two-way ternaries for user-facing strings.** `lang === 'hi' ? hi : en` silently shows
  English for gu/kn — a correctness bug tsc cannot catch. Always route through the helpers.
- **Verse lines use `verseToken(lang)`; meaning uses `meaningToken(meaningSourceLang(lang))`** —
  kn meaning is English prose and must style as Latin, while kn verse lines are Kannada script.
- **Fonts must follow the script**, or gu/kn render as tofu/ OS-fallback. Small incidental
  Latin-font labels rely on OS fallback (same as Devanagari does today); reading content uses the
  bundled Noto serifs explicitly.
- **a11y / Maestro labels stay English** — `LibraryCard`/`CategoryCard` use `nameEn` for
  `accessibilityLabel`, so e2e tile taps are language-independent; only asserted *visible* script
  changes. The `language-smoke.yaml` flow pins the gu/kn renderings.
- **Daily-verse notification IS localized** (2026-06-13) — `formatNotificationContent(verse, lang)`
  renders verse line + source + label + title in the reading language; `scheduler.ts` and the
  NotificationPreferences provider thread the persisted `@vedansh/language` and reschedule the
  rolling window when the language changes (notifications are built ahead of time). gu/kn-script
  search-query *input* remains a noted follow-up (display works; typing queries in gu/kn doesn't).
- **Meaning/commentary text is transliterated Hindi, not native translation** — gu/kn show the
  Hindi meaning in their script. Genuine native gu/kn translations would be authored `meaningGu`/
  `meaningKn` content fields (a §10-gated content effort); `meaningByLang` is the single seam to
  prefer them when they exist.
