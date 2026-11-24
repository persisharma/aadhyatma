# Telugu & Marathi Language Support — Design + Implementation Notes

**Date:** 2026-11-24 · **Branch:** `claude/happy-bohr-o06xoa` · **Status:** implemented on branch; native visual QA pending

Builds directly on [the Gujarati/Kannada design](2026-06-13-gujarati-kannada-language-support-design.md): same
runtime-derivation architecture, same helper API, no new content fields.

## 1. Goal

Add **Marathi (`mr`)** and **Telugu (`te`)** as first-class reading languages — selectable in the More-tab language
sheet and the first-run setup sheet, occupying the reader toggle's regional slot, and honoured by every user-facing
surface — without changing hi/en/gu/kn behaviour or authoring new content JSON.

## 2. Why these two first (and not Tamil)

| | Script work | Verse text | Decision |
|---|---|---|---|
| Marathi | None — Devanagari | Renders the authored Devanagari as-is | Ship |
| Telugu | One new Brahmi map, ~1:1 like Kannada | Lossless re-scripting | Ship |
| Tamil | Tamil script lacks voiced/aspirated stops (क/ख/ग/घ → க) | Lossy without Grantha/superscript convention | Separate project |

## 3. Language model

```
Lang = 'hi' | 'en' | 'gu' | 'kn' | 'mr' | 'te'        RegionalLang = Exclude<Lang, 'en'>
```

| | script | verse lines | meaning / commentary | UI chrome |
|---|---|---|---|---|
| `mr` | Devanagari | Devanagari `lines` (unchanged) | native `meaningMr` if verified, else `meaningHi` | hand-authored Marathi |
| `te` | Telugu | `toTelugu(lines)` | native `meaningTe` if verified, else `toTelugu(meaningHi)` | hand-authored Telugu |

New helpers in `utils/localize.ts`: `isDevanagariLang` (hi, mr), `isRescriptLang` (gu, kn, te), `authoredByLang`
for authored label objects with optional mr/te, and `LANG_VALUES` in `data/gita/language.tsx`. Every former
`lang === 'hi'` branch now uses `isDevanagariLang`, so Marathi follows Hindi's script path; every gu/kn font branch
gained a Telugu arm.

## 4. Telugu transliteration

`TELUGU` spec in `utils/transliterate.ts`, offset `0x300`, ISO-15919 faithful: ए/ओ → long ఏ/ఓ, ऎ/ऒ → short ఎ/ఒ,
candra vowels → short, ॐ → ఓం, candrabindu → ఁ, nukta preserved as U+0C3C (present in the bundled Noto Serif Telugu
cmap — verified), precomposed क़…य़ decompose to base + nukta, digits → ౦–౯. `transliterateDevanagari(text, 'mr')` is the
identity.

**Cross-check:** all 103,517 distinct Devanagari strings under `mobile/src/data` were converted and diffed against
`indic_transliteration` (sanscript): 91.0% identical, and every remaining string is one where sanscript leaves nukta
letters (ड़/ढ़/ज़…) in Devanagari — zero disagreements where the reference produced Telugu. Six source strings contain a
stray U+093A (content defect, already visible in hi/gu/kn); the engine passes it through unchanged.

## 5. Fallbacks for content without a Marathi/Telugu edition

- **Kids stories** (`storyText`): mr → Hindi narrative, te → English narrative (never re-scripted Hindi, matching the
  existing kids-story rule). Deity/Navadurga names carry authored mr/te.
- **Ramayana comic** (`comicLanguage`): mr → Hindi edition, te → English edition; `ComicLanguageNotice` states it.
- **Home-screen widget**: the native decoders (Swift/Kotlin) accept only hi/en/gu/kn, so the payload is written with
  `widgetLocale(lang)` (mr/te → hi). In-app previews re-script for te via `widgetText`/`widgetLines`. A native Telugu
  widget requires a native build — follow-up.
- **Read-aloud**: `mr-IN` and `te-IN` voices; unavailable voices report unavailable as for other languages.

## 6. Per-language metrics

Marathi copies every Hindi metric (same font). Telugu copies Kannada's wrap/advance and leading values: HarfBuzz-shaped
Noto Serif Telugu runs ~11% narrower per character than Noto Serif Kannada on the Hanuman Chalisa corpus, so the
Kannada values over-count lines rather than clip. PanchangShareCard optical offsets for Telugu are borrowed from
Kannada and need a native export check.

## 7. Verification status

- Unit: `transliterate.test.ts` (Telugu golden pairs), `localizeMrTe.test.ts`, `langType.test.ts`,
  `titleByLanguage.test.ts`; full `npm test`.
- Type safety: `LocalizedStrings` requires mr/te, so tsc rejects any UI string missing them.
- E2E: `.maestro/language-smoke.yaml` extended to Marathi and Telugu (not executed in the cloud session — no simulator).
- **Pending:** native visual QA of all changed surfaces in mr/te at Standard/Large and enlarged system text; native
  share-card exports in te; editorial review of the authored Marathi/Telugu UI strings by native speakers.

## 8. Follow-ups

Native Telugu home widget; verified native `meaningMr`/`meaningTe` content scale-out; Marathi/Telugu kids-story and
comic editions; mr/te-script search input; What's New entry at the next version bump; Tamil (needs a Sanskrit-in-Tamil
convention decision first).
