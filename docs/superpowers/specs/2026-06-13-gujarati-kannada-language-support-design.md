# Gujarati & Kannada Language Support — Design + Implementation Plan

**Date:** 2026-06-13 · **Branch:** `add-gujarati-kannada-language-support` · **Status:** approved-for-implementation (autonomous run)

## 1. Goal

Vedansh's reading-language preference is binary today: `'hi' | 'en'` (`useGitaLanguage`,
persisted at `@vedansh/language`, default `'hi'`). Add **Gujarati (`gu`)** and **Kannada
(`kn`)** as first-class reading languages — selectable everywhere the toggle exists, honored
by every user-facing surface — **without changing any hi/en behavior** and without touching
any content JSON.

## 2. The key architecture decision: runtime script transliteration

All verse text, titles, and Sanskrit-term labels in the corpus are Devanagari. Gujarati and
Kannada are sister Brahmi scripts with essentially 1:1 codepoint correspondence to
Devanagari, and devotional content in Gujarat/Karnataka is traditionally printed exactly
this way — the same Sanskrit/Awadhi text in the regional script.

**Chosen approach: derive gu/kn renderings at runtime** from the existing Devanagari fields
via a pure, dependency-free mapping module (`utils/transliterate.ts`).

Why not the alternatives:

- **Authoring `*Gu`/`*Kn` fields in ~150 content JSONs** — months of content work, triples
  bundle size, and every string would fall under RULEBOOK §10's two-source verification
  gates. Runtime derivation adds **zero stored content**, so §10 is untouched and every
  *future* section gets gu/kn for free.
- **An i18n library (i18next etc.)** — new dependency, key-indirection refactor of 70 files,
  against the repo's hand-rolled-table precedent (`scripts/transliterate-shloka.mjs`).

Precedent: the repo already hand-rolls Devanagari→IAST tables in
`scripts/transliterate-shloka.mjs`. This adds the Devanagari→Gujarati/Kannada equivalent,
in-app.

**Why this is faithful (and §3.1-compliant):** design.md §3.1's romanization rules
(IAST vs pronunciation-ASCII) govern *Latin* rendering, where schwa-deletion and recitation
matter. Script-to-script conversion is orthography-preserving — ગુજરાતી/ಕನ್ನಡ readers recite
from the identical spelling — so mechanical conversion is correct where mechanical
romanization would not be. §3.1 gets a clarifying note, not a change.

## 3. Language model

```
Lang = 'hi' | 'en' | 'gu' | 'kn'        (GitaLang kept as alias — RULEBOOK §3 forbids parallel contexts)
```

Per-language policy (single source of truth, `LANGUAGES` in `data/gita/language.tsx`):

| | script | verse lines | meaning / commentary | UI chrome strings |
|---|---|---|---|---|
| `hi` | Devanagari | `lines`/`sanskrit` (unchanged) | `meaningHi` (unchanged) | Hindi (unchanged) |
| `en` | Latin | `linesEn`/`transliteration` (unchanged) | `meaningEn` (unchanged) | English (unchanged) |
| `gu` | Gujarati | toGujarati(Devanagari lines) | **toGujarati(`meaningHi`)** | hand-authored Gujarati |
| `kn` | Kannada | toKannada(Devanagari lines) | **`meaningEn` (English)** | hand-authored Kannada |

**Meaning-language policy (explicit, revisitable):** Hindi prose re-scripted to Gujarati is
readable+intelligible for Gujarati devotees (high Hindi comprehension in Gujarat; script is
the barrier). For Kannada speakers Hindi vocabulary is *not* assumed — English meaning is the
honest, useful fallback. Encoded in one place (`meaningByLang`); flipping a language's policy
is a one-line change. Native `meaningGu`/`meaningKn` fields can take precedence later without
schema breaks. Gita's commentary fallback note (the existing hi/en pattern in
`GitaVersePage`) generalizes to all four languages.

**Titles & labels:** listing cards keep the bilingual pair (RULEBOOK §3): primary = the
selected language (for gu/kn: transliterated `nameHi` in the script font), secondary =
English (for `en` primary, secondary stays Hindi — unchanged). Top-bar/pill rule unchanged:
single language, swapped by `lang` (gu/kn get transliterated `titleHi`/`labelHi`, including
Devanagari→Gujarati/Kannada digits ०→૦/೦).

**Panchang names** (tithi/nakshatra/yoga/karana/vara/month) are Sanskrit terms — the `_HI`
arrays transliterate perfectly; no new arrays, one picker helper.

**User-typed routine names** (`nameHi`/`nameEn`): gu/kn display = toScript(`nameHi`).

## 4. Transliteration engine (`mobile/src/utils/transliterate.ts`)

Pure functions `toGujarati(text)` / `toKannada(text)`; non-Devanagari codepoints pass
through untouched (so mixed strings, numerals, punctuation, and already-converted text are
safe; both functions are no-ops on non-Devanagari input).

Mapping notes (the non-obvious cases):
- Devanagari block U+0900–U+097F → Gujarati U+0A80–U+0AFF / Kannada U+0C80–U+0CFF.
- ॐ → ૐ (U+0AD0) / **ಓಂ** (no Kannada OM codepoint — standard two-char rendering).
- Candrabindu ँ → ઁ / Kannada has none → **ಂ** (anusvara, standard practice).
- Nukta ़: Gujarati keeps it (U+0ABC); **Kannada drops it** (ज़→ಜ, ड़→ಡ — script has no nukta).
- Avagraha ऽ → ઽ / ಽ. Digits ०–९ → ૦–૯ / ೦–೯. Dandas । ॥ shared — pass through.
- ZWJ/ZWNJ/Vedic signs pass through; unmapped Devanagari falls back to passthrough (never
  throws, never emits tofu replacements).

Tested with golden pairs per category + real corpus lines (Gita 1.1, Chalisa chaupai,
panchang terms) + idempotence/passthrough properties.

## 5. Code changes by file (the full touchpoint inventory)

**Foundations**
1. `data/gita/language.tsx` — widen union; storage validation accepts 4 (unknown → default
   `'hi'`, unchanged); export `LANGUAGES` metadata (value, native label, a11y label, script).
2. `utils/transliterate.ts` (+ tests) — new.
3. `utils/localize.ts` (+ tests) — new: `contentByLang(lang, hi, en)` (gu/kn ⇒
   transliterated hi), `meaningByLang`/`commentaryByLang` (policy table),
   `pick(lang, {hi,en,gu,kn})` for UI strings (type-enforced all-4), `scriptOf(lang)`.
4. Fonts — add `@expo-google-fonts/noto-serif-gujarati` + `noto-serif-kannada`
   (500Medium/600SemiBold), load in `App.tsx`, extend `theme/typography.ts` `fontFamilies`
   (gujarati/gujaratiBold/kannada/kannadaBold) + script-keyed accessors. Pure-JS + asset
   deps → OTA-compatible. *Fallback if npm unreachable:* system fonts for gu/kn (iOS
   Kohinoor / Android Noto Sans render both scripts) via undefined fontFamily mapping.
5. `utils/titleByLanguage.ts` — `orderTitlesByLanguage` handles 4 languages; gu/kn primary
   uses script font at Devanagari sizes (matching x-height class); secondary = Latin italic
   (unchanged shape). hi/en outputs byte-identical to today (existing tests prove it).

**Pickers**
6. `components/LanguageToggle.tsx` — data-driven over `LANGUAGES`; 4 compact segments
   (हिं · En · ગુ · ಕನ), full names as a11y labels; testIDs `lang-toggle-{hi,en,gu,kn}`;
   same pill visual system (design.md §16 updated).
7. `screens/MoreScreen.tsx` language card — 4 radios mapped over `LANGUAGES`, full native
   names; stat labels via `pick`.

**Sweep (mechanical, helper-per-site; hi/en behavior preserved by construction)**
8. Verse pages: `GitaVersePage`, `VersePage`, `SundarkandVersePage`, `BajrangBaanVersePage`,
   `SanskarVersePage`, `ShivaStrotamVersePage` — verse-line slot renders transliterated
   Devanagari for gu/kn in script font; meanings/commentary via policy; pills/labels via
   `contentByLang`.
9. ~30 reader/chapters screens — top-bar titles, next/prev card titles, font ternaries.
10. Listings: `LibraryCard`/`GitaChapterCard`/Category/Deity/Home (flow through
    `orderTitlesByLanguage`), `SearchScreen` labels, `WishlistScreen`, `ProfileScreen`.
11. Routine surfaces: 5 screens + `RoutineBanner`/`Shell`/`Celebration`/`AddToRoutine*` —
    UI strings via `pick`, names/units via `contentByLang`; `data/routine/vaar.ts` +
    `data/routine/units.ts` label fns widened.
12. `panchang/names.ts` + `PanchangScreen` — `panchangName(kind, idx, lang)`.
13. `data/shareLinks.ts` — 4-way caption (native first line + translated CTA).
14. `ResumeReadingSheet`, `JumpToStartButton`, `ReminderOptInModal`, `NextChapterCard`/
    `PrevChapterCard`, `JapamAudioPlayer`, `JapamCounterScreen`, `DailyBhaktiScreen`.

**Update (2026-06-13) — everything in the selected script.** The meaning policy was changed
so **both gu and kn render meaning/commentary in their own script** (Hindi wording re-scripted),
instead of Kannada falling back to English. `meaningSourceLang` is now identity. The
**daily-verse notification is now localized** to the reading language too
(`formatNotificationContent(verse, lang)`; `scheduler.ts` + the prefs provider thread the
persisted language and reschedule on language change). Net: when a user picks Gujarati/Kannada,
the whole app — verse, meaning, commentary, titles, UI chrome, and the daily notification —
renders in that script. (The meaning/commentary text remains the Hindi wording transliterated;
true native translation is a separate content effort that this architecture accepts via future
`meaningGu`/`meaningKn` fields.)

**Explicit non-changes:** content JSONs (no new content authored); search index structure
(Devanagari/Latin queries keep working in any display language — gu/kn-script *query input* is
a noted follow-up); `searchIndex.ts`; `entryRoutes.ts`; navigation.

## 6. Verification

- **Unit/data (existing = behavior-preservation proof; new = feature proof):**
  `npm test` = typecheck + jest (readers/components/utils/contexts) + tsx engine + tsx data
  suites. New: `transliterate.test.ts`, `localize.test.ts`; extended: `titleByLanguage`,
  `LanguageToggle` (4 options), reader smoke samples in gu/kn where cheap.
- **E2E (Maestro, iOS simulator):** new `language-smoke.yaml` — More → ગુજરાતી → assert
  Gujarati script on More + open Hanuman Chalisa reader, assert Gujarati verse line; switch
  ಕನ್ನಡ → assert Kannada; restore हिन्दी (suite-stable). Re-run `more-smoke` + `chalisa-smoke`
  to prove no regression. README table updated.
- **RULEBOOK §4-style checks:** no new hex/font/size literals outside tokens; no `as any`;
  language-leak spot-check in all 4 modes.
- **Transliteration accuracy — cross-checked against an independent authority (2026-06-13).**
  Ran `toGujarati`/`toKannada` over all **5,548** distinct Devanagari strings in the content
  corpus and diffed against the `indic_transliteration` (sanscript) reference implementation:
  **Gujarati 5536/5548 (99.8%)**, **Kannada 5538/5548 (99.8%)** identical (NFC-normalized).
  Every remaining diff is a case where *this engine* is correct and sanscript leaks Devanagari
  (it leaves precomposed क़…य़ unconverted; we decompose to base+nukta). Finding that prompted
  a fix: the initial Kannada mapping simplified candrabindu→anusvara and dropped nukta on a
  wrong premise ("Kannada lacks them"); in fact Noto Serif Kannada renders **U+0C81 candrabindu
  and U+0CBC nukta** (verified against the bundled font's cmap), so the engine was corrected to
  the faithful ISO-15919 mapping (candrabindu→ಁ, nukta preserved, क़…य़→base+಼). This both
  raised Kannada agreement from 80%→99.8% and made the output match the standard.
- **Surfaced content-data artifact (NOT fixed here — out of scope):** ~6 Gita source strings
  carry a malformed nukta-on-matra (e.g. `भ्रातृ़न्`, `कुतो़`, `पितृ़` — likely meant ृ→ॄ long
  vocalic-R or a stray nukta). This is a Devanagari *content* bug (it mis-renders in Hindi too)
  that RULEBOOK §10 source-verification should fix in the JSON; transliteration faithfully
  preserves whatever the source contains.

## 7. Docs & follow-ups

- RULEBOOK §3: toggle is 4-language; "Every user-facing string respects `lang`" examples
  gain gu/kn; new-section contract note: *gu/kn derive automatically — author hi/en only*.
- design.md: §3 typefaces (+2), §3.1 clarifying note, §16 four segments; fix two stale
  lines (language **is** persisted; Gita verse lines **swap** on toggle — code-canonical).
- Wiki: `concepts/languages.md` + overview touch; log entries.
- Follow-ups (out of scope): native `meaningGu`/`meaningKn` authoring, gu/kn search-query
  transliteration, localized notification copy.
