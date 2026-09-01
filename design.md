# Vedansh — Design System

Reference document for all Vedansh / Aadhyatma modules (Hanuman Chalisa, Ramcharitmanas, Bhagavad Gītā, Sundarkand, and future sacred-text modules).

The source-of-truth visual reference is `design-preview.html` at the repo root. Open it to see live mockups of Home and Reader screens. This document captures the tokens, components, and rules so the same language can be re-applied in React Native.

---

## 1. Philosophy

- **Parchment-first.** The app should feel like an old manuscript, not a glossy modern reader. Warm cream base, sepia ink, saffron/gold accents.
- **Reverent, not decorative.** Ornamentation is minimal: a single `॥` glyph as divider, simple crest on Home. Never clutter the verse.
- **Text is the hero.** Every screen exists to carry Devanagari gracefully. Backgrounds are faded sketches that sit behind a parchment overlay — they must never fight the text.
- **Book-like pacing.** One verse per page, swipe to advance. No endless scroll in the reader.
- **Bilingual but Hindi-led.** Titles and verses in Devanagari; Latin (Cormorant Garamond italic) is a quiet secondary label, never a translation.

---

## 2. Color Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `parchment` | `#F3E7C9` | Primary background for reader surfaces |
| `parchment-soft` | `#F8EFD6` | Lighter parchment for inner cards (with a soft `sm` shadow for lift) and flat controls |
| `parchment-deep` | `#E9D9B1` | Bottom-edge gradient, elevated surfaces |
| `ink` | `#1A0E03` | Primary Devanagari body text. Deepened from `#2F1E10` for contrast — ~15.4:1 on parchment (WCAG AAA). See `colors.ts` / `colors.contrast.test.ts`. |
| `ink-soft` | `#5A3A1E` | Secondary text / meaning body (~8.3:1) |
| `ink-muted` | `#6E5230` | Tertiary / metadata / placeholders / demoted secondary-language line. Deepened from `#8A6A47` (which only reached ~4.0:1) to ~5.9:1 (WCAG AA). |
| `saffron` | `#B8621B` | Primary accent, active states, arrows |
| `saffron-deep` | `#8A3E0B` | Strong accent, pager dot, labels |
| `gold` | `#A67C34` | Secondary accent, crest, section tags |
| `divider` | `rgba(138, 62, 11, 0.18)` | Borders, card outlines |
| `newBadgeBg` | `rgba(184, 98, 27, 0.16)` | "NEW" badge fill — saffron tint (recently-added content) |
| `newBadgeText` | `#8A3E0B` | "NEW" badge text — saffron-deep |
| `avoid` | `#9E4A2E` | Muted terracotta — inauspicious/त्याज्य timings (Rahu/Gulika/Yamaganda, avoid choghadiya). Warm palette, **never red**; PRD-14. |
| `avoidTint` | `rgba(158, 74, 46, 0.12)` | Fill behind an `avoid` row. Auspicious rows reuse `goldTint`; quality is always labelled in text too (§12). |
| `avoidChipBg` / `goldChipBg` | `rgba(158, 74, 46, 0.20)` / `rgba(166, 124, 52, 0.22)` | Fill behind a quality **chip/pill** (avoid / auspicious) on the Muhurat glance card. Deeper than the row tints so the pill reads as its own surface on the `cardActive` gradient — the 0.12–0.14 row tints were too faint to register as a chip (§31). |
| `avoidDeep` | `#7A3722` | Text **on** the avoid chip tint. Raw `avoid` clears AA on the card surfaces but drops to ~3.5:1 composited on `avoidChipBg` over the gradient's dark stop — chip text uses this deeper cut; pinned with compositing math in `colors.contrast.test.ts`. |

**Home gradient** (top → bottom): `#F6ECD0` → `#F1E3BF` (`parchmentHighlight` → `parchmentGradientEnd` in `colors.ts`).

**Reader overlay** (on top of background image): vertical gradient
`rgba(243,231,201,0.85)` → `rgba(243,231,201,0.55)` → `rgba(243,231,201,0.75)` → `rgba(233,217,177,0.95)`.

**Background image filters:** the CSS filter stack (`opacity: 0.52`, `sepia(0.35) saturate(0.85) brightness(1.02)`) applies only to `design-preview.html`. In React Native the sketch renders unfiltered — `BackgroundLayer.tsx` sets no `imageStyle` opacity or tint — and the fade comes solely from the parchment overlay gradient stacked above it.

### Scope of the warm-only rule

The palette is warm manuscript — **never green/red** — and signal colours stay inside it
(`avoid` is a muted terracotta, auspicious reuses the gold tint; both always carry a text cue,
§12). This rule governs **theme colour and UI chrome**, i.e. everything in
`mobile/src/theme/colors.ts`.

**One sanctioned exception:** the baked deity-glyph illustration palette
(`mobile/src/components/deityGlyphs/palette.ts`, §42) carries cool peacock/water hues —
`leafGreen #17715D`, `teal #0B7D82`, `deepBlue #064D5E`. They are **painted attributes of the
art, never signals**: Krishna's feather, Kartikeya's plume, Ganga's waves. The boundary is
what matters — nothing in that file may be imported into chrome (no badge, chip, border, state
colour or icon tint outside the glyph files). Chrome takes its colour from `colors.ts` only.
Both files carry this note so the exception cannot be mistaken for a precedent.

---

## 3. Typography

Two typefaces, four roles.

| Typeface | Usage |
| --- | --- |
| **Noto Serif Devanagari** | All Devanagari: titles, verses, meaning body, card names. Weights 400/500/600/700. |
| **Cormorant Garamond** | Latin subtitles, page counters, swipe hints, italic labels. Weights 400/500 for body prose, **600 non-italic** for transliteration and Latin chapter numbers, 600 italic for section labels. Italic is reserved for labels and short flourishes; long prose is always roman (non-italic) to keep English paragraphs readable over the faded parchment bg. |
| **Noto Serif Gujarati** | All Gujarati (`gu` reading language): titles, verses, meaning body, card names. Weights 500/600. Same family/weights as the Devanagari cut so the reading type scale carries over unchanged. |
| **Noto Serif Kannada** | All Kannada (`kn` reading language): titles, verses, card names (Kannada meaning prose follows English). Weights 500/600. |
| **Inter** | Only for tiny UI chrome where reading content is not involved. Loaded via `@expo-google-fonts/inter` in `App.tsx` (500/600) and carried by the `sectionLabel` / `versePill` / `cardMeta` tokens (`typography.ts`), plus the tab-bar labels. Indic-script pill/label text swaps off Inter to the script serif via `pillTextStyle()` (`utils/langType.ts`) — Inter has no Indic glyphs and Latin tracking splits the shirorekha. |

**Font families come from tokens, never from string literals.** Always
`fontFamilies.*` (`mobile/src/theme/typography.ts`) — never a hand-typed
`'Inter_600SemiBold'`. A family string that names an unloaded or misspelled face fails
**silently** in React Native: the node just renders in the system font. That is exactly how
four call sites shipped referencing `NotoSansDevanagari_600SemiBold`, a family the app never
installed or loaded — including the Jyotish share card, which is exported as an image and
shared outside the app. 125 such literals across 23 files were migrated to tokens in July
2026. **Enforced:** `eslint.config.js` bans font-family string literals outside `src/theme/`.

### 3.0 The 10 pt floor

**No UI chrome renders below 10 pt.** The font-scale system (§12) deliberately never scales
chrome — only reading content — so a 7 pt badge is 7 pt forever, at every accessibility
setting. 10 is the scale's own floor (`versePill` 10, `cardMeta` 11); anything smaller was
below the system's stated minimum.

A July 2026 audit found 50 chrome sites at 7–9 pt across Panchang, Kundali, Rashifal,
Theerth, Muhurat and the catalog cards. All were raised to 10, and the two fixed-size chips
that would then have clipped were grown rather than trimmed: the calendar `dateTag`
(24×12 → 28×16 — its label can be Devanagari, whose matras clip below ~1.4× leading) and
the Panchang `starBadge` (15 → 16).

**Leading is part of the floor.** A 10 pt line needs **≥ 1.4× leading** (14) whenever it can
carry Indic text; `lineHeight === fontSize` sits the first baseline so high that the top of
the line is sliced off, which reads as trimmed text rather than tight text. And a chrome line
that can render Indic must *name* a face that has the script — Inter does not, and the OS
fallback's metrics are taller than any fixed leading can predict, so route it through
`pillTextStyle` / `scriptTitleFont` (`utils/langType.ts`) — or `indicSafeTag` for the mixed-case
micro tags (`यही · this one`, `९ चरण · 12 अक्षर`) that keep their Latin case and tracking in English
but must not carry either over Devanagari. Both halves of this bit the Jyotish
share cards in August 2026: three micro lines shipped at 10/10, and the Kundali header
(Inter + a Devanagari label) rendered `जन्म कुंडली` as "जन्म कुंडला" while its method footer lost
its shirorekha. Guarded by `components/__tests__/jyotishShareCardFit.test.tsx`. Both halves recurred on Namkaran a fortnight later (§61) — a 58/78 hero syllable cropped `के`, and five Inter-tracked micro labels split their clusters — so treat "fixed leading on a Devanagari line" and "Inter on an Indic label" as the two things to check on any new card, not as one screen's history. Its guard is `components/__tests__/namkaranTypeFit.test.tsx`, which also pins that a hero line pins **no** leading at all: a fixed box cannot follow `maxFontSizeMultiplier`. The third form of the same fault is a fixed leading paired with **platform auto-fit**: `adjustsFontSizeToFit` scales the glyphs and leaves `lineHeight` where it was, so the leading ratio grows as the text shrinks — the verse share card's meaning reached 7 pt inside 24 pt of leading before it was sized in JS instead (§39). **A fixed `lineHeight` and `adjustsFontSizeToFit` must never sit on the same Text**; size in JS, derive the leading from that size.

**Enforced:** `eslint.config.js` bans `fontSize` below 10 outside `src/theme/`.

**One documented exception:** `NorthIndianChart` keeps sub-10 numbers because those are
**viewBox units**, not points — they scale with the chart's `size` prop, so the "chrome can
never grow" premise does not hold. Reasoning is recorded at the call site.

**The thin italic Cormorant face (`latinItalic`, 400) is never used for numerals, clock times, ranges, quality chips, or status labels** — only for prose subtitles and short flourishes. Those secondary elements use the **non-italic ≥600 face** (`latinSemiBold` / `latinBold`): the thin italic strokes wash out against parchment and the `cardActive` gradient even when the color technically clears WCAG AA, so a time or chip set in italic reads half-visible. This has been re-fixed several times (e.g. the Muhurat glance-card times & auspicious/avoid chip, §31) — treat "small secondary text in italic on a light surface" as a readability defect on sight.

### 3.1 Romanization Style by Source Language

The Latin-script `linesEn` / `transliteration` field is rendered very differently depending on the source language of the verse. Use the rule that matches the *source*, not the *module*:

**Sanskrit verses → IAST + Hunterian digraphs.**
This applies to the Bhagavad Gītā in full (`transliteration[]`) and to the Sanskrit shlokas embedded in other texts (e.g., the three opening shlokas in Sundarkand, where `section === 'shloka'`).

- Diacritics in scope: `ā ī ū ṛ ṝ ṅ ñ ṭ ḍ ṇ ś ṣ ḥ ṁ`.
- Digraphs: `śh` (श + h aspirate), `kṣh` (क्ष), `chh` (छ), `ch` (च). An epenthetic `i` follows `ṛ` (e.g., `dhṛitarāśhtra`, `pṛithivī`) — this matches the popular BhaktiVedanta-style romanization the Gita corpus already uses, not strict Sanskrit IAST (`dhṛtarāṣṭra`).
- Reference (Gita 1.1):

```
dhṛitarāśhtra uvācha
dharma-kṣhetre kuru-kṣhetre samavetā yuyutsavaḥ
māmakāḥ pāṇḍavāśhchaiva kimakurvata sañjaya
```

**Awadhi / Hindi verses → pronunciation-based ASCII (no diacritics).**
This applies to Sundarkand's chaupais, dohas, sorthas, and chhands, and to all of Hanuman Chalisa (opening dohas, chaupais, closing doha). Tulsidas's Awadhi is recited with schwa-deletion and regional consonant variations that strict IAST does not capture — IAST `mahābīra bikrama bajaraṁgī` does not match how `महाबीर बिक्रम बजरंगी` is actually chanted, but `Mahaabeer bikram bajarangee` does. The romanization is hand-curated to reflect recitation; do not regenerate mechanically from the Devanagari.

| | Verse-line romanization |
|---|---|
| ✓ Sanskrit shloka | `dhṛitarāśhtra uvācha` (Gita) |
| ✓ Sanskrit shloka | `nānyā spṛihā raghupate hṛidaye'smadīye` (Sundarkand opening shloka) |
| ✓ Awadhi chaupai | `Mahaabeer bikram bajarangee` (Hanuman Chalisa) |
| ✓ Awadhi doha | `Buddhiheen tanu jaanike, sumirau pavan-kumaar.` |
| ✗ | `dhritarashtra uvacha` for a Sanskrit verse (diacritics dropped) |
| ✗ | `mahābīra bikrama bajaraṁgī` for an Awadhi chaupai (IAST imposed where it doesn't fit) |

**Gujarati / Kannada (`gu` / `kn`) are script conversion, not romanization.** This §3.1 governs only the *Latin* `linesEn`/`transliteration` field, where schwa-deletion and recitation nuance matter. The Gujarati and Kannada reading languages instead render the Devanagari re-scripted to the sister Brahmi script (`mobile/src/utils/transliterate.ts`) — an orthography-preserving 1:1 codepoint mapping, which is exactly how this content is printed regionally. Mechanical conversion is correct there precisely because it is *not* romanization. (gu/kn carry no authored content fields; see RULEBOOK §1.)

**This whole section does NOT apply to:**

- Chapter titles' English subtitles (e.g., `Bhagavad Gītā`, `Arjuna's Dilemma`)
- Verse-pill subtitles (e.g., `Chapter 1`, `Opening`, `Closing`)
- Library-card English names (e.g., `Hanuman Chalisa`, `Sundarkand`)
- UI chrome — counts (`47 verses`), hints (`← swipe →`), labels (`Meaning`, `Commentary`)
- **Theerth prose.** `significanceHi/En` and `originStoryHi/En` on each `TheerthTemple` are independent prose translations, not romanizations of the same verse line. Temple names (`Somnath`, `Kashi Vishwanath`) use popular English spellings, not IAST.

These remain in everyday English. A handful of common Sanskrit terms keep their conventional spelling outside verse-lines (`Gītā`, `kāṇḍa`) — the diacritic-or-not call belongs to the editorial team, not this rule.

**Rendering layout** is module-specific:

- **Swap-on-toggle (all modules, Gita included):** the toggle swaps Devanagari ↔ romanization in place, so only one script is visible at a time (`verseLinesByLang`). See §9 / §10. Sanskrit shlokas swap to IAST (the Gita's `transliteration[]`, Sundarkand's opening shlokas); Awadhi chaupais swap to pronunciation-based ASCII. (An earlier Gita revision rendered both scripts side-by-side; the shipped readers use one script at a time everywhere.)

### Type scale

This table is the **single source of truth** for reading-content sizing, implemented in `mobile/src/theme/typography.ts`. Every reader section and every surface that shows verse / transliteration / meaning / commentary consumes these tokens — **no hardcoded `fontSize`/`lineHeight` on reading content**, no per-section scale. Both languages render the meaning at the same size, and the verse sits above the meaning. See `RULEBOOK.md` §3 ("One reading type scale") and the guard test at `mobile/src/components/__tests__/readerTypeScale.test.tsx`.

| Role | Typeface | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Screen title (`सनातन`) | Noto Serif Devanagari | 34 | 600 | Letter-spacing `0.01em` |
| Reader top-bar title | Noto Serif Devanagari | 16 | 600 | |
| Verse body (Devanagari) | Noto Serif Devanagari | 23 | 500 | Line-height 1.7 |
| Transliteration (Latin IAST) | Cormorant Garamond | 24 | 600 | `ink`, line-height 35. Sits one step above the meaning (20) so the verse stays dominant — mirrors the Devanagari verse↔meaning hierarchy. Cormorant's small x-height reads smaller than Devanagari, so it takes a few extra points; bumped 17 → 20 → 24. |
| Meaning body (Hindi) | Noto Serif Devanagari | 20 | 500 | `ink-soft`, line-height 34 (≈1.7). Bumped 15 → 20 to match the English meaning size, so both languages read at one meaning scale. |
| Meaning body (English) | Cormorant Garamond | 20 | 500 medium non-italic | `ink`, line-height 33. Italic 400 was previously used and rejected as too thin over the parchment bg; medium-weight roman is the shipping spec. Bumped from 18 → 20: Cormorant's small x-height read too small against the Devanagari meaning body. |
| Commentary body (Hindi) | Noto Serif Devanagari | 20 | 500 | `ink-soft`, line-height 34. Paragraph gap `14`. Commentary reuses the `meaning` token — one reading scale, no smaller commentary tier (see `bodyStyle` in `GitaVersePage.tsx`). |
| Commentary body (English) | Cormorant Garamond | 20 | 500 medium non-italic | `ink`, line-height 33. Paragraph gap `14`. Same `meaningEnglish` token as the English meaning body. |
| Commentary fallback note | Cormorant Garamond | 14 | 400 italic | `ink-muted`, centred. Shown when the selected language has no commentary for this verse but the other language does (e.g., Gita Chapter 1 has only ~20 % English commentary coverage in the published source). |
| Card name (primary language) | Noto Serif Devanagari (hi) / Cormorant Garamond (en) | 14–22 | 600 semibold upright (hi) / **700 bold** upright + `0.3` tracking (en) | Prominent top line on catalog, category, deity, and resume-sheet titles. The **active reading language** takes this slot — Devanagari-first by default (`'hi'`), English-first when the toggle is `'en'`. **Weight follows the slot, not the script.** The two scripts carry different *optical* weight at the same point size (Devanagari reads dark/dense, Cormorant reads light), so the English primary uses the heavier Bold face **and** is sized a step larger than the Devanagari primary at each call site (e.g. CategoryCard `latPrimary 17` vs `devPrimary 16`; LibraryCard `19` vs `17`) — otherwise an English-primary title reads as a peer of its demoted Hindi line. Ordering/weight/tracking is centralised in `orderTitlesByLanguage()`; per-script optical sizes are passed by each caller. |
| Card name (secondary language) | Cormorant Garamond italic (en) / Noto Serif Devanagari (hi) | 11–13 | 400 italic (en) / 500 medium (hi) | `ink-muted` lighter supporting line below the primary title — the language *not* selected. Sized ~2–5 pt below the primary and demoted to `ink-muted` (not `ink-soft`) across **all** call sites so it reads as a caption, not a peer. |
| Chapter card title (Hindi) | Noto Serif Devanagari | 17 | 600 | Gita Chapters Index. |
| Chapter card title (English) | Cormorant Garamond | 16 | 400 italic | Gita Chapters Index when language toggle = English. |
| Chapter tag (`अध्याय N` / `CHAPTER N`) | Inter | 10 | 600 | `0.3em` tracking, uppercase, `saffron-deep`. |
| Language toggle (Hindi half) | Noto Serif Devanagari | 15 | 600 | Active: `saffron-deep`; inactive: `ink-muted`. |
| Language toggle (English half) | Cormorant Garamond | 14 | 400 italic | Active: `saffron-deep`; inactive: `ink-muted`. |
| Page counter (e.g., `1 / 47`) | Cormorant Garamond | 14 | 400 italic | Lining figures |
| Section label (`LIBRARY`) | Inter (en) / script serif bold (hi·gu·kn) | 11 | 600 | `0.22em` tracking, uppercase. Latin-only labels (`CATEGORIES`, `DISCOVER`, `LIBRARY`) spread the token directly. **Bilingual** eyebrows (`आज के लिए` / `FOR TODAY`, `कब पाठ करें`, deity category rows, Panchang/Rashifal kickers) must route the token through `pillTextStyle()` (`utils/langType.ts`) — Inter has no Indic glyphs (silent system fallback) and `0.22em` tracking splits the shirorekha, so Indic scripts swap to the script serif with **no** tracking or case transform. Guarded by `utils/__tests__/langType.test.ts`. |
| Verse-type pill (`दोहा`, `चौपाई · 9`, `श्लोक · 1.1`) | Inter (en) / script serif bold (hi·gu·kn) | 10 | 600 | Saffron-deep on tinted bg. English pills keep Inter + `0.3em` tracking + uppercase; Indic-script pills render in the script serif bold with **no** tracking or case transform via `pillTextStyle()` (`utils/langType.ts`). |
| Meaning / Commentary label (`भावार्थ` / `Meaning`, `व्याख्या` / `Commentary`) | Cormorant Garamond (en) / script serif bold (hi·gu·kn) | 13 | 600 italic (en) / semibold (Indic) | **Single-language**: the label renders only in the reading language — `भावार्थ` (hi) / `Meaning` (en) / `ભાવાર્થ` (gu) / `ಭಾವಾರ್ಥ` (kn), and `व्याख्या` / `Commentary` etc. No bilingual dot-pair, no order flipping. English keeps `0.14em` tracking + italic + uppercase; Indic scripts use the script serif bold with no tracking. `saffron-deep`, centred. See the label styling in `GitaVersePage.tsx` / `VersePage.tsx`. |
| Sub tagline / swipe hint | Cormorant Garamond | 12–15 | 400 italic | |

---

## 4. Layout Tokens

| Token | Value |
| --- | --- |
| Screen side padding | `24–28` |
| Card padding | `18` |
| Card gap (list) | `12` |
| Section-to-section vertical gap | `20` |
| Card radius | `18` |
| Thumb radius | `14` |
| Pill radius | `999` |
| Surface radius (reader overlay ends, etc.) | `36` on phone screen only |

### Gutters

> **Runtime tokens (source of truth: `mobile/src/theme/spacing.ts`).** Two gutters, not one:
> `spacing.screenGutter` (**28**) for catalog and hub screens, and `spacing.readingGutter`
> (**22**) for reader/chapter surfaces, where a reading column wants more line length.
> The 22 was blessed into a token in July 2026 — every reader and chapters top bar had
> independently converged on it while the declared token said 28. `ReaderHeader` (§9)
> consumes `readingGutter`, so the ~32 reader/chapter screens share one value.
>
> Card padding, pill padding and modal insets that happen to equal 22 are **not** gutters
> and are not expected to use this token.

### Radii

> **Runtime tokens (source of truth: `mobile/src/theme/spacing.ts`).** One 4-step scale:
> `radii.sm` **10** · `radii.md` **14** · `radii.lg` **18** · `radii.xl` **22** · `radii.pill` **999**.
> `xl` was added in July 2026 for the shared **44 pt circular back-button control** — half of
> 44 is 22 — now used by `ReaderHeader.tsx` (every reader/index top bar) and `RashifalScreen.tsx`,
> after an audit found ten ad-hoc radii (11, 12, 15, 16, 17, 20, 22, 24, 26, 32) and none of them
> on the scale.
>
> **Not tokenised, on purpose:** an *incidental* circle — a radius that is exactly half its box —
> keeps a bare literal: the `DeityCard` avatar (`borderRadius: 22`), the profile badge, and the
> Panchang month stepper, as do `deityGlyphs/` + `CategoryIcon` illustration internals. Card /
> tile / pill corners and the one shared 44 pt back control take a token; one-off circles stay
> literals.

### Elevation

| Level | Shadow |
| --- | --- |
| `sm` | `0 1px 2px rgba(60, 30, 10, 0.06)` — default card |
| `md` | `0 8px 24px rgba(60, 30, 10, 0.14)` — active card |
| `lg` | `0 30px 60px rgba(60, 30, 10, 0.22)` — phone frame in preview only |

> **Runtime tokens (source of truth: `mobile/src/theme/elevation.ts`).** React Native exposes
> five named elevations rather than the `sm/md/lg` scale above. All share one warm shadow
> colour, defined once as `#3C1E0A` — never re-typed at a call site.
>
> | Token | Offset · opacity · radius · Android | Use |
> | --- | --- | --- |
> | `elevation.subtle` | `0,1` · `0.06` · `4` · `1` | dim/inactive card, grouped-list surface |
> | `elevation.card` | `0,2` · `0.10` · `6` · `2` | default card |
> | `elevation.lifted` | `0,4` · `0.11` · `12` · `3` | active/selected catalog tile, chapter card |
> | `elevation.raised` | `0,6` · `0.16` · `14` · `5` | the one focal element on a screen |
> | `elevation.overlay` | `0,6` · `0.25` · `14` · `10` | floats above a scrim (feature-tour card) |
>
> `subtle`, `lifted` and `overlay` were added in July 2026: an audit found 14 files
> hand-rolling shadows, so cards floated at slightly different heights, the warm hex was
> re-typed by hand (with `#3c1e0a` casing drift), and the tour card used an off-palette
> `#0a0604`. The tiers above are the clusters that audit found, so every real surface has a
> token. The cream palette has very low figure-ground contrast, so card surfaces must be
> opaque for the Android shadow to render.
>
> **Enforced:** `eslint.config.js` bans a hex literal on `shadowColor` outside `src/theme/`.

---

## 5. Iconography & Ornaments

- **Home wordmark (crest lockup).** A single compact row: thin rule · `ॐ` circle · `वेदांश़` · `ॐ` circle · thin rule, with the `Sacred Texts · Daily Reading` tagline beneath. ॐ on **both** sides of the wordmark. Rules 22px, circles 30px (ॐ 19px), title 27px, saffron stroke `1.5px`, row gap 11. Implemented in `HomeWordmark.tsx`. This replaced the older stacked crest + 34px title to reclaim ~50dp of hero height while keeping the centered, altar-like essence.
- **Verse divider.** `॥` centered between two 1px horizontal rules, 80px wide, saffron at 60% opacity. Use between verse and meaning on every reader page.
- **Back chevron.** `‹` inside a **44px** circle with `parchment-soft` fill and `divider` border — the circle itself meets the 44×44 a11y target (`ChalisaReaderScreen.tsx` `styles.back`). Browse screens that keep a smaller 34px visual top it up with `hitSlop` 16.
- **Forward chevron.** Single `›` in saffron on active cards.
- **Pager dots.** 6px circles, `rgba(138,62,11,0.25)` resting. Current page dot: saffron-deep, width 18, radius 999 (pill).
- **No emoji. No photos.** Only hand-drawn faded sketches as backgrounds.

---

## 6. Background Image System

Four faded vintage sketches serve the Hanuman texts, bundled at `mobile/assets/chalisa/` (source art in `/images/`):

1. `Hanuman_sita.webp`
2. `Ram_hanuman.webp`
3. `hanuman_lankadahan.webp`
4. `Hanuman_sea.webp`

### Rotation rule

- Selection is **deterministic per verse**, resolved by a curated registry — `mobile/src/data/backgrounds.ts` (`getReaderBackground(sourceId, verse)`) — **not** a `% 3` hash:
  - **Hanuman Chalisa:** a hand-picked per-verse override map (`hanumanChalisaOverrides`, keyed by verse id — e.g. `chaupai-18`/`chaupai-19` → the sea-crossing sketch), with `Ram_hanuman.webp` as the default for every other verse.
  - **Sundarkand:** stanza-range buckets — stanzas 1–4 sea, 5–11 Sita, 12–18 Lanka-dahan, remainder Ram-Hanuman.
  - **Every other source:** one pinned image per source id (`sourceBackgrounds`), plus category/deity fallback maps for browse screens.
- A given verse therefore always shows the same image — stable as the user swipes back and forth — but the mapping is curated to match the verse's story beat, never re-rolled per render.
- Apply the image as a `cover`-sized background. Then stack the parchment overlay (Section 2) on top. Then the content.

**Exception — Theerth.** Theerth detail screens resolve their background by **presiding deity**, with per-temple overrides for shrines whose deity plate is too generic (`getTheerthBackground(templeId, deityId)` in `backgrounds.ts`). The browse/map surface uses no background image — only the flat parchment gradient behind the stylised India SVG outline.

### Adding more modules

When Ramcharitmanas / Gita modules are added, new faded sketches should follow the same treatment: warm parchment tone, ~50% opacity after sepia, subject centered or top-anchored so the bottom third of the image stays clean for the meaning block.

---

## 7. Screen: Home / Index

> **Superseded.** The v1 one-scroll, tab-less Home (hero title + flat LIBRARY card list) has been replaced by the tabbed Home in **Section 18** — wordmark hero, DISCOVER carousel, and category grid. This heading is kept so section numbering holds; the flat library list now lives inside the Category List screens (§21).

The one element that carries over is the **footer mantra**: `॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥` — Noto Serif Devanagari **18** (token `footerMantra`, `typography.ts`), `ink-muted` at 55% opacity, centred at the end of the Home scroll content.

---

## 8. Component: Library Card

Two variants: `active` (live module) and `coming` (placeholder).

```
[ thumb ]  [ name (Hindi) ]                      [ › or badge ]
           [ name-en (Latin italic, muted) ]
           [ sub meta (counts, subtitle) ]
```

### Active

- Background: linear-gradient `#FFF5E0 → #F5DEAC`
- Border: `rgba(184, 98, 27, 0.4)`
- Shadow: `md` (runtime: **`elevation.raised`**)
- Thumb: gradient `#F8D291 → #E0A255` with the text's first Devanagari letter (`ह`, `रा`, `भ`, `सु`) in white, Noto Serif Devanagari 22.
- Right side: saffron `›` chevron.

### Coming

- Background: `rgba(255, 250, 235, 0.72)`
- Border: `divider`
- Shadow: `sm` (runtime: **`elevation.subtle`**)
- Thumb: flat `#F1E0B3` with `saffron-deep` letter.
- Content (thumb + names) at 55% opacity so it looks dormant but still legible.
- Top-right pill badge: `SOON` (**10**, uppercase, 0.18em tracking, `rgba(166,124,52,0.14)` fill — was 9, below the §3.0 floor).

### Content per card

| Text | Example |
| --- | --- |
| name (Hindi) | `हनुमान चालीसा` |
| name-en | `Hanuman Chalisa` |
| sub | `43 verses · Hindi with meaning` |

Tapping `active` card → push Reader (Section 9) for that module.

---

## 9. Screen: Text Reader

**Purpose.** Show one verse at a time with its meaning (and, for multi-layered texts like Gita, its commentary) over a parchment-tinted sketch background.

Applies to both readers — the Hanuman Chalisa reader (linear, single text) and the Bhagavad Gītā reader (chapter-scoped, language-toggleable). Structural differences per module are called out inline.

**Layer stack (back to front):**

1. Parchment base color.
2. Background image (Section 6), `cover`, sepia-tinted.
3. Parchment gradient overlay (Section 2).
4. Content column — every verse page is a vertical `ScrollView` (verses + commentary may exceed screen height), with **64px bottom padding** so the last line clears the pager-dot overlay (`GitaVersePage.tsx` / `VersePage.tsx` `scrollContent`).

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** — always `ReaderHeader` (see below); never a local copy.
   - Back button — returns to the previous surface (the Category List for Chalisa; Chapters Index for Gita — one level up in the stack, not always Home).
   - Title. Chalisa: `हनुमान चालीसा`. Gita: `अध्याय N · <titleHi>` (Hindi mode) or `Chapter N · <titleEn>` (English mode).
   - Progress counter (`1 / 47`, Cormorant Garamond italic). Counter is **chapter-scoped** for Gita (resets per chapter), **document-scoped** for Chalisa.
3. **Reading progress bar** (`ReadingProgressBar.tsx`) — a thin saffron track directly under the top bar showing position within the chapter/document.
4. **Toggle row** — rendered **once per reader**, in a persistent row above the pager (not on every verse page): `LanguageToggle` (Section 16) + `AddToRoutineButton`, centred.
5. **Verse area** (flex-1, 28px horizontal padding; each page scrolls vertically with 64px bottom padding so the last line clears the dots):
   - **Header row** (in-page): verse-type pill on the left, **Bookmark + Share buttons on the right** — the actions render on every verse page via the page's `topActions` prop (`GitaVersePage.tsx` / `VersePage.tsx`), not in the top bar.
   - Verse-type pill — vocabulary is consistent across modules: `दोहा · Opening` / `चौपाई · N` / `समापन दोहा · Closing` / `श्लोक · N.M` / future `मंत्र` etc. Uppercase Inter 10 @ 0.3em for English; script serif bold, no tracking, for Indic scripts (`pillTextStyle()`); saffron-deep on saffron-tint.
   - Verse lines — rendered in the reading language's script, **swapped in place by the toggle** on every reader, Gita included (`verseLinesByLang` + `verseToken`): Devanagari 23/39 for `hi`, the Latin romanization (Cormorant Garamond 24/35 600) for `en`, re-scripted Gujarati/Kannada 23/39 for `gu`/`kn`. Each line on its own row; preserve the original line breaks from the JSON. Only one script is visible at a time.
   - Ornament divider (Section 5).
   - **Meaning** section:
     - Label — **single-language**, in the reading language only: `भावार्थ` (hi) / `Meaning` (en) / `ભાવાર્થ` (gu) / `ಭಾವಾರ್ಥ` (kn). Cormorant Garamond 13 600 italic + `0.14em` tracking for English; script serif bold, no tracking, for Indic. `saffron-deep`, centred. No bilingual dot-pair, no order flipping.
     - Body: Hindi at 20/34 Noto Serif Devanagari 500 `ink-soft`; English at 20/33 Cormorant Garamond 500 medium non-italic `ink` — one meaning scale across languages. Only one language renders at a time based on the language toggle (Section 16).
   - Ornament divider (Gita only — separates Meaning from Commentary).
   - **Commentary** section (Gita only):
     - Label `व्याख्या` (hi) / `Commentary` (en) — same single-language treatment as the Meaning label.
     - Body: array of paragraphs, 14 px gap between paragraphs. Typography matches the Meaning body for the selected language (same tokens — no smaller commentary tier).
     - **Empty-commentary fallback.** If the selected language has no commentary for this verse but the other language does, hide the paragraph body and render a single italic line instead: `Extended commentary is available in Hindi only for this verse.` (or Hindi analogue) — Cormorant Garamond 14 italic, `ink-muted`, centred. This is how the reader handles the sparse English-commentary coverage in Chapter 1 of the Gita source.
     - If **both** languages are empty the whole Commentary block (including ornament + label) is hidden entirely.
6. **Bottom bar**: **centred pager dots only**, overlaid near the bottom edge — there is no `← swipe →` hint. Dots bucket the chapter into 5 segments for Gita (so a 78-verse chapter still fits one dot track); Chalisa uses its document-scoped bucketing.

**Interaction.**

- Horizontal swipe (pager). Left-edge swipe from first page or right-edge from last page should bounce, not dismiss.
- Language toggle: rendered **once per reader** in the persistent toggle row (Section 16) for all bilingual modules — Gita, Sundarkand, Hanuman Chalisa, and the rest. Sections that have a subsection listing (e.g., Gita's Chapters Index, Section 15) ALSO surface the toggle there. Both surfaces share state via `useGitaLanguage()` — same control, two screens, one source of truth.
- Chapter auto-advance (chaptered readers): the pager appends/prepends chapter-transition cards (`NextChapterCard.tsx` / `PrevChapterCard.tsx`) so swiping past a chapter edge advances to the neighbouring chapter.
- The Gita reader additionally shows a `JumpToStartButton` (floating, once the reader is past the first verse) to return to verse 1.
- Tap-hold on the verse (future): audio playback hook — leave structural space now, don't ship until audio lands. (Texts with recorded audio surface a `▶` play affordance in the top bar instead.)
- Back button or gesture returns one level up.

**Progress counter.**

- Chalisa: total = opening dohas + chaupais + closing dohas (`2 + 40 + 1 = 43`). Counter shows `currentIndex + 1 / total`.
- Gita: total = chapter verse count (e.g., `47` for Chapter 1). Counter shows `currentIndex + 1 / chapterVerseCount`. Switching chapters resets the counter.

### Component: Reader Header (`ReaderHeader.tsx`)

**Purpose.** The one reader/chapter top bar: `[back] [centred title] [right slot]`. Every
reader and chapters screen consumes it; none may re-implement it.

Until July 2026 all ~32 of those screens carried their own copy of this block, and the copies
had drifted — `paddingHorizontal` 16 **and** 22, `paddingBottom` 4/10/12, back buttons at 40
as well as 44, one title hard-coded to 18 instead of the `readerTitle` token. Extracting it
fixed the drift and, as a side effect, VratKathaReader's undersized back button.

**Spec.**

- Row: `spacing.readingGutter` (22) horizontal · `8` top · `12` bottom · `space-between`.
- **Back control**: 44×44 circle, `radii.xl`, `parchmentSoft` fill, `divider` border, `‹` at
  22 in `ink-soft`, `hitSlop={16}`, `opacity 0.7` while pressed.
- **Title**: `flex: 1`, centred, `numberOfLines={1}`, `titleFontByLang(lang)`, italic for
  English only. Two named scales via `variant` — **`reader`** (default) at
  `typography.readerTitle.fontSize` (16), and **`index`** at 22 (20 for Latin, whose smaller
  x-height needs less nominal size) for chapters/index landing screens. Two names rather than
  a loose number so the hierarchy stays a decision.
- **Side columns**: two balancing spacers of equal `sideWidth` keep the title optically
  centred; both must clear the wider side's content. Defaults to **120** when a `right` slot
  is present (counter + optional audio button) and **44** when it is not. Screens with a
  narrow trailing slot may pass a smaller value (GitaReader passes 60).
- **`right`** slot carries the page counter, the `▶` audio affordance, and any actions.

**Accessibility label.** The back control is labelled `"Back"` — deliberately English and
**not** localized. The Maestro flows tap that string literally (`deity-browse-smoke`,
`vrat-catalog-smoke`) and the default reading language is `hi`, so localizing it here breaks
e2e. Screens override it where the destination is worth naming (`"Back to chapters"`,
`"Back to home"`, `"Back to stotram list"`).

**Files:** `mobile/src/components/ReaderHeader.tsx`.

---

## 10. Content Model

Each module normalises its source into a typed, module-specific shape. Shapes stay separate so one module's reader never has to know another module's vocabulary (Chalisa doesn't know `'shloka'`; Gita doesn't know `'chaupai'`). A shared reader may be introduced later via a broader union — until then, keep types module-local.

### Chalisa (linear, single-text)

Source: `HanumanChalisa/hanuman-chalisa-hi-en.md` (hand-curated bilingual markdown) → generated, committed `mobile/src/data/hanuman-chalisa/hanuman-chalisa.json`, typed and invariant-checked in `mobile/src/data/hanuman-chalisa/index.ts`:

```ts
type HanumanChalisaVerse = {
  id: string;              // e.g. "opening-doha-1", "chaupai-09", "closing-doha"
  type: 'doha' | 'chaupai';
  section: 'opening' | 'body' | 'closing';
  number?: number;         // present for numbered verses
  labelHi: string;         // e.g. "दोहा 1", "चौपाई 9", "समापन दोहा"
  labelEn: string;         // e.g. "Doha 1", "Chaupai 9", "Closing Doha"
  lines: string[];         // raw Devanagari lines, in order
  linesEn: string[];       // pronunciation-based romanization, 1:1 with lines
  meaningHi: string;       // Hindi prose
  meaningEn: string;       // English prose
  meaningGu?: string;      // verified native Gujarati meaning (absent → transliteration fallback)
  meaningKn?: string;      // verified native Kannada meaning (absent → transliteration fallback)
};
```

**Order for Hanuman Chalisa:** `opening_dohas[0..]` → `chaupais[0..39]` → `closing_doha`.

### Gita (chapter-scoped, multi-layered, bilingual)

Source: `BhagwadGita/chapters/chapter-NN-*.md` (published translation + commentary). Parsed by `scripts/parse-gita.mjs` into `mobile/src/data/gita/chapter-NN.json` and a top-level `chapters-manifest.json`. Parser output is committed — Metro bundles JSON statically, so generated data must live in the source tree. Re-running the parser should produce a byte-identical diff.

```ts
type GitaVerse = {
  id: string;              // "bg-<chapter>-<number>" e.g. "bg-1-1"
  chapter: number;         // 1–18
  number: number;          // 1–chapter.verseCount
  sanskrit: string[];      // Devanagari lines (≥ 2)
  transliteration: string[]; // IAST lines, 1:1 with sanskrit where possible
  meaningHi: string;       // Hindi paraphrase (non-empty)
  meaningEn: string;       // English paraphrase (non-empty)
  commentaryHi: string[];  // Hindi paragraphs — may be [] when source lacks it
  commentaryEn: string[];  // English paragraphs — may be [] when source lacks it
  meaningGu?: string;      // verified native Gujarati meaning (absent → transliteration fallback)
  meaningKn?: string;      // verified native Kannada meaning (absent → transliteration fallback)
};

type GitaChapter = {
  chapter: number;
  titleHi: string;         // e.g. "अर्जुनविषादयोग"
  titleEn: string;         // e.g. "Arjuna's Dilemma"
  verseCount: number;
  summaryHi?: string;
  summaryEn?: string;
  verses: GitaVerse[];
};
```

**Totals (committed data):** 18 chapters · 701 verses. Chapter verse counts vary 20–78.

**Sundarkand follows the same chapter-scoped shape**, not the linear Chalisa one: 16 chapters · 354 verses, committed as `mobile/src/data/sundarkand/chapter-01..16.json` + `chapters-manifest.json` with its own verse vocabulary (shloka, doha, chaupai, sortha, chhand).

**Source-data rules the parser enforces:**

- Every verse must have at least 2 Sanskrit lines after splitting on daṇḍa (`।`). When the source crams the whole shloka onto one line, the parser splits on single `।` (not `।।`) and reattaches the trailing `।।N.M।।` verse number to the preceding chunk.
- Every verse must have a non-empty `meaningHi` and `meaningEn`.
- Commentary paragraphs shorter than 10 content characters (after stripping punctuation and daṇḍa) are dropped as placeholder entries — the published source sometimes emits a lone `.` under `**English Commentary**` for verses the translator skipped. The parser turns those into `[]` rather than keeping a ghost paragraph.
- Empty commentary in one language is tolerated as long as the other language is populated. If both are empty the parser fails loud.

### Display label vocabulary

Keep the verse-pill vocabulary consistent across modules — each pill pairs a Devanagari term with a Latin subtitle or number:

- `doha` + `section === 'opening'` → pill reads `दोहा · Opening` (or `· N` if multiple).
- `chaupai` → pill reads `चौपाई · <number>`.
- `doha` + `section === 'closing'` → pill reads `समापन दोहा · Closing`.
- Gita verse → pill reads `श्लोक · <chapter>.<verse>` (e.g. `श्लोक · 1.1`).
- Future: `मंत्र`, `सूत्र`, etc. — always paired with a Latin subtitle.

### Language state (Gita)

The app carries a single reading-language preference (`Lang = 'hi' | 'en' | 'gu' | 'kn'`) exposed via a React context (`useGitaLanguage()`). Default `'hi'`, **persisted** in `AsyncStorage` at `@vedansh/language`. The context also carries `regionalLang` (`'hi' | 'gu' | 'kn'` — never `'en'`), the user's chosen regional script, persisted separately at `@vedansh/regionalLanguage`; it feeds the 2-segment reader toggle (Section 16) and is updated whenever a non-English language is selected (`mobile/src/data/gita/language.tsx`). The same hook is shared across every section — there is no per-section context. The toggle is rendered both on subsection listings (Chapters Index, Section 15) and once per reader in the persistent toggle row (Section 9). On **every** reader — Gita included — the toggle swaps the verse lines in place between Devanagari (`lines[]`/`sanskrit[]`) and the romanization (`linesEn[]`/`transliteration[]`); meaning + commentary follow the same selection. For `gu`/`kn` **everything renders in the selected script** at runtime (§3.1): verse lines, titles, meaning, and commentary are the Devanagari re-scripted to Gujarati / Kannada, except where verified native `meaningGu`/`meaningKn` fields exist (see RULEBOOK §1). The daily-verse notification is localized the same way.

---

## 11. Motion & Haptics

- Page transitions: native horizontal swipe, default spring. No custom easing in v1.
- On page change: a light haptic tap (`Haptics.ImpactFeedbackStyle.Light`) if running on device.
- Avoid crossfades or scale effects in v1 — they fight the manuscript metaphor.
- The one sanctioned animated moment is the routine-completion pushpa-varsha (§30): a soft fall + fade, **no scale pops**.
- The Today's Practice completion **seal** (`PracticeSeal`, §30) appears with a brief **opacity fade only** — no scale or rotate — riding that completion-moment exception; it honors reduce-motion (`useReducedMotion`) by appearing instantly. The **mala** streak (`MalaStreak`) is fully **static**: the today-bead is marked with a static ring, never a pulse.

---

## 12. Accessibility

- Minimum tap target: 44×44 for back button, card tap, and pager dots.
- **The 44 minimum is about the *touch* target, which `hitSlop` counts toward; visual
  consistency is a separate rule.** A control smaller than 44 is acceptable only when
  `hitSlop` brings the real target to ≥44 *and* the smaller size is a deliberate choice for
  that control class. Back buttons are **always 44 visually** — they are the one control the
  user meets on every screen, so a 40 among 44s reads as a mistake even though its `hitSlop`
  cleared the minimum (Kundali and Rashifal both drifted to 40 and were corrected in July
  2026; `ReaderHeader` now owns the reader/chapter case). **Documented size exception:** the
  Panchang calendar month stepper stays 34×34 — a stepper is not a back button and 44 crowds
  the month header — with `hitSlop={10}` taking its real target to 54.
- **Chrome never scales, so it has a hard 10 pt floor** (§3.0). The reading-size presets
  multiply reading tokens only, which means an undersized label can never be enlarged by any
  accessibility setting; treat sub-10 chrome as an accessibility defect at authoring time.
- Ensure contrast on text over the parchment overlay. The overlay specified in Section 2 keeps `ink` at > 7:1 on the lightest area of every supplied background.
- **Every text element clears WCAG AA (4.5:1) against its *actual* rendered surface — not just base parchment.** Secondary/metadata text, signal colors (`avoid`, `saffronDeep`), and chip labels are frequently placed on `parchmentSoft` tiles, tint pills, or the `cardActive` gradient, which are *lighter* than `parchment`; contrast must be checked against those surfaces (worst case = the lightest gradient stop, `cardActiveFrom`). `mobile/src/theme/__tests__/colors.contrast.test.ts` pins the signal colors against the card surfaces so a palette tweak can't silently drop them below AA. Two forces cause the recurring "faint secondary text" regression and both must be avoided: (a) a color that only passed AA on base parchment, and (b) the thin italic face undercutting the measured ratio (§3) — small secondary text uses the non-italic ≥600 face.
- Support Dynamic Type: the in-app reading-size setting offers **two presets — M (×1.0, default) and L (×1.15)** (`mobile/src/theme/fontScale.ts`), multiplying `fontSize` and `lineHeight` of the reading tokens only (verse/meaning across all scripts), so the verse body tops out around **26** in-app while UI chrome (titles, counters, labels) never scales and nothing clips.
- The OS-level font scale still multiplies on top — `allowFontScaling` is not disabled anywhere — so Devanagari also honours the system's user-chosen scale, not a fixed point size.
- All accent-only information (saffron pill, saffron chevron) must also carry a text or shape cue — never color alone.
- **Honor "reduce motion".** `useReducedMotion` (`mobile/src/utils/useReducedMotion.ts`) reads `AccessibilityInfo.isReduceMotionEnabled()` and stays in sync via `reduceMotionChanged`; animated entrances (e.g. `PracticeSeal`) collapse to their final frame when it is on. Prefer static designs (e.g. `MalaStreak`) so nothing needs disabling.
- **Decorative vector art is hidden from assistive tech.** Bead/seal art sets `importantForAccessibility="no-hide-descendants"` / `accessibilityElementsHidden`; the mala exposes a single text label (e.g. "7 day mala") via `accessibilityLabel`, and completion marks carry an `accessibilityState={{ checked }}` plus a text label, never color alone.

---

## 13. Future Modules (extension notes)

When a new text is added, pick the pattern that fits the source:

**Linear text (single flow, ≤ ~100 verses) — like Hanuman Chalisa:**

1. Add the source JSON under its own folder (e.g., `Ramcharitmanas/ramcharitmanas.hi.json`).
2. Normalize to the per-module `Verse[]` model in Section 10.
3. Add 2–3 faded sketches to `/images/` that match the text's story and follow the treatment in Section 6.
4. Flip the Home card from `coming` to `active`.
5. Wire Home → Reader directly.

**Chapter-based text (multi-hundred verses, bilingual, with commentary) — like Bhagavad Gītā:**

1. Add the source Markdown files under `<Module>/chapters/chapter-NN-*.md` using the same `### BG N.M` + `**Section Name**` format the Gita parser consumes (or write a module-specific parser with the same output shape).
2. Generate per-chapter JSONs via a build-time Node script and commit the output to `mobile/src/data/<module>/chapter-NN.json` + `chapters-manifest.json`.
3. Define the module's content types (shape mirrors Gita's `GitaVerse` / `GitaChapter`) in `mobile/src/data/<module>/index.ts` with module-load invariants (chapter count, verse count per chapter, no duplicate ids, at least one language populated for optional sections).
4. Reuse the existing `useGitaLanguage()` context (`mobile/src/data/gita/language.tsx`) — do not create a parallel per-module context. The hook is already shared across Gita, Sundarkand, and Hanuman Chalisa.
5. Add a Chapters Index screen (Section 15) with a Language Toggle (Section 16) and a list of chapter cards. Render the same Language Toggle once in the reader's persistent toggle row too — same control, two surfaces, shared state.
6. Build a Reader screen that scopes the pager to a single chapter (one verse per page, chapter-scoped counter).
7. Add 1–3 faded sketches to `mobile/assets/<module>/` — for v1 a single image covering all verses is acceptable if sourcing more is a separate ticket.
8. Flip the Home card from `coming` to `active`. Active modules sort above `coming` ones in the library list.

**Shared rules for any module:**

- Keep the pill vocabulary consistent: `दोहा`, `चौपाई`, `श्लोक`, `मंत्र`, etc., always paired with a Latin subtitle or chapter.verse number.
- Never hard-code colours, spacings, or font names in a component — always pull from the theme.
- If a token is missing, add it to `colors.ts` / `typography.ts` / `spacing.ts` first, then update this doc, then use it.
- For bilingual prose (meaning, commentary): Cormorant Garamond 20 / 33 500 medium **non-italic** `ink` (the `meaningEnglish` token) is the English body standard. Italic is reserved for labels, fallback notes, and short flourishes.
- **Romanization.** Pick the style that matches the source language per §3.1: IAST + Hunterian digraphs for Sanskrit verses (Gita, embedded shlokas); pronunciation-based ASCII for Awadhi/Hindi verses (Tulsidas chaupais and dohas). Don't impose IAST on Awadhi — the diacritics misrepresent recitation.
- **Language toggle.** Reuse `useGitaLanguage()`. Render the toggle once per reader in the persistent toggle row; for sections with a subsection listing (e.g., Gita's Chapters Index), render it there too. State is shared.

---

## 14. File Map

**Documentation / reference:**
- `design-preview.html` — live visual reference at repo root. Open in any browser.
- `design.md` — this document.

**Source content:**
- `HanumanChalisa/hanuman-chalisa-hi-en.md` — curated bilingual source markdown for the Chalisa module.
- `BhagwadGita/chapters/chapter-NN-*.md` — 18 published-translation Markdown files for the Gita module.
- `scripts/parse-gita.mjs` — one-shot Node parser (`node scripts/parse-gita.mjs` from repo root) that reads the Gita Markdown, normalises it, and writes the per-chapter JSON + manifest. Idempotent.
- `scripts/transliterate-shloka.mjs` — one-shot Node script that regenerates `linesEn` (IAST) from Devanagari `lines` for **Sanskrit shlokas only** (verses where `section === 'shloka'`). Currently scoped to Sundarkand's three opening shlokas; Awadhi/Hindi verses are not regenerated mechanically (see §3.1). Idempotent.

**Generated / committed data consumed by Metro:**
- `mobile/src/data/gita/chapter-NN.json` — one per chapter, imported statically.
- `mobile/src/data/gita/chapters-manifest.json` — lightweight list of `{ chapter, titleHi, titleEn, verseCount }` used by the Chapters Index.
- `mobile/src/data/sundarkand/chapter-01..16.json` + `chapters-manifest.json` — 354 verses across 5 verse types (shloka, doha, chaupai, sortha, chhand), chapter-scoped like the Gita.
- `mobile/src/data/hanuman-chalisa/hanuman-chalisa.json` — 43 verses (2 opening dohas + 40 chaupais + 1 closing doha).
- Further content-module dirs under `mobile/src/data/` follow the same committed-JSON pattern: `aarti/`, `sanskar/`, `japam/`, `ramcharitmanas/`, `valmiki-ramayan/`, the chalisa dirs (`shiv-chalisa`, `durga-chalisa`, `ganesh-chalisa`, `gayatri-chalisa`, `bajrang-baan`), the Ashtakam-category legacy dir (`hanuman-ashtak`), and the stotram dirs (`shiva-strotam`, `durga-stotram`, `ganesh-stotram`, `saraswati-stotram`, `krishna-stotram`, `vishnu-sahasranama`, `ram-stuti`), plus `theerth/temples.ts`.

**Registries & cross-cutting data (`mobile/src/data/`):**
- `texts.ts` — the library registry (`library`): every content entry with category, deities, counts, status. Ordering is curated here (§21).
- `categories.ts` — the Home category tiles (§18).
- `deities.ts` — deity metadata + icon keys for the Deity Index.
- `backgrounds.ts` — background-selection registry (§6).
- `searchIndex.ts` — flat verse index behind the Search screen.
- `versePool.ts` — the Daily Bhakti verse pool (§23).

**Assets:**
- `images/*.png` — Hanuman parchment sketches (consumed in `mobile/assets/chalisa/`).
- `mobile/assets/chalisa/*` — Chalisa backgrounds + typed `index.ts` export.
- `mobile/assets/gita/*` — Gita backgrounds (v1: `krishna_arjuna_vishvarupa.webp` is the single sketch covering all verses) + typed `index.ts` export.

**Theme + state:**
- `mobile/src/theme/colors.ts` / `typography.ts` / `spacing.ts` / `elevation.ts` / `fontScale.ts` — source of tokens in Sections 2–4 plus the reading-size presets (§12).
- `mobile/src/theme/ThemeContext.tsx` — single source of runtime tokens.
- `mobile/src/data/gita/language.tsx` — shared reading-language context + `useGitaLanguage()` hook (§10, §16).
- `mobile/src/contexts/` — app state providers: bookmarks, reading progress, routine, notification preferences, audio player, font scale, panchang location, new-content tracking, etc.

**Navigation & subsystems:**
- `mobile/src/navigation/` — `TabNavigator` (§17) + per-tab stacks (`HomeStackNavigator`, `MoreStackNavigator`, `PanchangStackNavigator`, `AudioStackNavigator`), `entryRoutes.ts` (bookmark / entry navigation targets).
- `mobile/src/panchang/` — panchang engine, festival data, katha content.
- `mobile/src/notifications/` — daily-verse scheduler, japam alarms, vrat reminders.
- `mobile/src/audio/` — audio session setup (the player context lives in `contexts/`).

**Components:**
- `mobile/src/components/LibraryCard.tsx` — Home library entry (Section 8).
- `mobile/src/components/GitaChapterCard.tsx` — Chapters Index entry (Section 15).
- `mobile/src/components/LanguageToggle.tsx` — the two-segment regional-language/English pill (Section 16).
- `mobile/src/components/VersePage.tsx` — Hanuman Chalisa reader page body.
- `mobile/src/components/GitaVersePage.tsx` — Gita reader page body (swap-on-toggle verse lines + meaning/commentary).
- `mobile/src/components/SundarkandVersePage.tsx` — Sundarkand reader page body.
- `mobile/src/components/Ornament.tsx` — the `॥` verse divider (Section 5).

**Screens:**
- `mobile/src/screens/HomeScreen.tsx` — Home (Section 7).
- `mobile/src/screens/ChalisaReaderScreen.tsx` — Chalisa Reader.
- `mobile/src/screens/SundarkandReaderScreen.tsx` — Sundarkand Reader.
- `mobile/src/screens/GitaChaptersIndexScreen.tsx` — Gita Chapters Index (Section 15).
- `mobile/src/screens/GitaReaderScreen.tsx` — Gita Reader (chapter-scoped pager).
- …plus one `<Section>ReaderScreen` (and, for chaptered texts, `<Section>ChaptersScreen`) per content section, and the Category/Deity list, Theerth (§26–27), Daily Bhakti (§23), Wishlist (§24), Routine (§30–31), Panchang, and Search screens.

When building new components, pull tokens from the theme — never hard-code a hex. If a token is missing, add it to `colors.ts` first, update this doc, then use it.

---

## 15. Screen: Chapters Index (Gita-style modules)

**Purpose.** Let the reader pick a chapter and set their reading language before entering the Reader. Used by modules whose natural unit is a chapter (Gita's 18 adhyāyas; Vālmīki Rāmāyaṇa's 7 kāṇḍas, §53; future Ramcharitmanas kāṇḍas).

**Layer stack:** same as Reader (Section 9, parchment + background sketch + gradient overlay + content column).

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** — `ReaderHeader` with `variant="index"` (§9); never a local copy.
   - Back button (returns to Home).
   - Title centred: `भगवद् गीता` (Hindi mode) / `Bhagavad Gītā` (English mode) at the `index`
     title scale — 22, or 20 for Latin. This is deliberately larger than the reader's 16: a
     chapters index is a landing surface, the reader top bar is compact chrome.
   - The balancing right-side spacer is the header's own, matching the back-button footprint.
3. **Language toggle row** (8 top / 16 bottom padding, centred). See Section 16.
4. **Chapter list** (28 px side padding, 12 px gap between cards). Each card is a `GitaChapterCard` (see below). Scrollable.

**Chapter card (`GitaChapterCard`):**

- Background: the same `cardActiveFrom → cardActiveTo` gradient as the Home active library card, so active chapters feel consistent with the live module on Home.
- Layout: `[ chapter-number thumb ]  [ tag · title · verse-count ]  [ › ]`
  - Thumb: gradient `cardThumbActiveFrom → cardThumbActiveTo`, 46×46, radius `md`. Centre renders the chapter number in Noto Serif Devanagari 20 `parchment-soft`.
  - Tag (above title): `अध्याय N` or `CHAPTER N` in Inter 10 600, `0.3em`, uppercase, `saffron-deep`.
  - Title: rendered in the selected language — Hindi (Noto Serif Devanagari 17 600 `ink`) or English (Cormorant Garamond 16 400 italic `ink`). `numberOfLines={2}`.
  - Sub: `47 श्लोक` (Hindi) or `47 verses` (English), `cardMeta` size, `ink-muted`.
  - Right: saffron `›` chevron.
- Tap → Reader **resumes at the chapter's last-read verse** (`getChapterProgress` from the reading-progress context, `GitaChaptersIndexScreen.tsx`); a chapter with no prior progress opens at verse 1.

**Ordering.** Chapters appear in numerical order 1–18. No sorting.

---

## 16. Component: Language Toggle

**Purpose.** Single source of truth for the app-wide reading language. Used on the Chapters Index (Section 15) and in every reader's persistent toggle row (Section 9).

**Shape.** A deliberate **two-segment** pill (`LanguageToggle.tsx`): the left segment is the user's **chosen regional language** — Hindi by default, or Gujarati/Kannada if picked in the More-tab **language picker sheet** (`regionalLang`) — the right segment is always **English**. The segments come from `[regionalMeta, EN_META]` over the `LANGUAGES` metadata array; all four languages never render at once in the reader — gu/kn are chosen in More and then occupy the regional slot. The active segment is tinted with `saffron-tint` and typed in `saffron-deep`; the inactive segment is transparent and typed in `ink-muted`. Pressed (inactive) drops opacity to 0.7.

```
┌────── pill radius ──────┐
│ [ हिन्दी ] │ [ English ]  │      (or [ ગુજરાતી ] / [ ಕನ್ನಡ ] in the left slot)
└─────────────────────────┘
```

- Container: `parchment-soft` background, `divider` border 1 px, `pill` radius, 3 px inner padding.
- Each segment: `minWidth 56`, `minHeight 44`, centered.
- Each segment shows its **full native name** in its own script/face: `हिन्दी` Noto Serif Devanagari 15 600 · `English` Cormorant italic 14 · `ગુજરાતી` Gujarati serif 14 600 · `ಕನ್ನಡ` Kannada serif 13 600. The English names (`Hindi`/`English`/…) are the accessibility labels; the full four-way choice lives in the More-tab **language picker sheet** (§37).

**Behaviour.**

- Tapping a segment sets `lang` to that value via the `useGitaLanguage()` hook; selecting a non-English language also updates the persisted `regionalLang`.
- Accessibility: `accessibilityRole="radiogroup"` on the container, `accessibilityRole="radio"` + `accessibilityState={{ selected }}` on each segment.
- 8 px `hitSlop` on each segment so the tap target meets the 44×44 minimum.

**State scope.** Global and **persisted** — `@vedansh/language` for the reading language, `@vedansh/regionalLanguage` for the regional pick (§10). The choice survives restarts and is shared by every section.

---

## 17. Bottom Tab Bar

**Purpose.** Persistent navigation chrome across the app's five top-level surfaces (`TabNavigator.tsx`). Replaces the previous one-scroll-no-tabs Home.

**Spec:**

- Position: fixed bottom, above safe area inset
- Background: `parchment-soft` with 1px `divider` border on top edge
- Height: 60px (content) + safe area bottom inset (`height: 60 + insets.bottom`, `paddingTop: 6`)
- **5 tabs**, equally distributed:
  - **Home** — the Home stack (catalog, readers, routine, theerth, search)
  - **Bhakti** — Daily Bhakti verse of the day (§23)
  - **Panchang** — panchang / festivals stack
  - **Bhajan** — audio stack
  - **More** — profile, wishlist (§24), reminders, settings
- Tab labels: **reading-language localized** via `contentByLang` — होम · भक्ति · पंचांग · भजन · अन्य in hi (gu/kn transliterate; English labels in en). The bar was the last chrome surface still English-only under a fully Indic screen. Type: en = `fontFamilies.inter` 10 @ **`0.4`** tracking (was `0.02`, a no-op: RN `letterSpacing` is in **px**, not em, so 0.02 px is invisible; 0.4 matches the `cardMeta` chrome token); hi/gu/kn = their bold serif title faces (`scriptTitleFont`, hi → `devanagariBold`) at 10 with **no tracking** — tracking splits the shirorekha (§3). Maestro flows tap tabs by `tabBarButtonTestID` (`tab-home` … `tab-more`), never by label text, since the exposed text is now language-dependent.
- Each tab carries a custom icon in the tint colour. Home, Bhakti, Panchang, and More are hand-built from `View` strokes; Bhajan preserves the reference filled SVG glyph: a **round filled head**, vertical stem, and square flag (`d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"`). The head **must stay filled** — a hollow ring reads as a broken glyph rather than a note.
- Active tint: `saffron`; inactive: `ink-muted`. No active dot indicator — the tinted icon+label is the cue
- Tap targets: full tab width × full bar height (well above 44×44 minimum)
- The tab bar **stays visible inside readers**. The only exception is the immersive Vrat Katha reader (`IMMERSIVE_HOME_ROUTES = ['VratKathaReader']`), which hides the bar while focused

---

## 18. Screen: Home (Revised)

**Purpose.** Surface available content organized by category type and deity. Replaces the flat LIBRARY list from Section 7.

**Structure (top to bottom):**

1. Status bar area (safe region)
2. Hero block: the **Home wordmark lockup** (Section 5) — `ॐ वेदांश़ ॐ` on one row over the "Sacred Texts · Daily Reading" tagline. (Earlier revisions stacked a crest above a 34px title; the lockup is the compact replacement.)
   - **On a catalog festival day only** (the 18 festivals of `notifications/festiveReminders.ts`): the **Festive Toran** (§55) hangs directly below the lockup — a marigold garland with the day's greeting chip. Absent every other day.
3. **आज · Today strip** (§48) — a one-card daily-panchang glance (vara + tithi headline, one horizontal-scroll row of observance / Abhijit / Rahu Kaal chips). Tap → Panchang tab.
4. **आज के लिए · For Today recommendations** (§50) — a compact horizontal row of name-only `FeatureCard compact` strips (196×56, the same shell the DISCOVER carousel uses in its taller default form) chosen from today's vaar deity and active festival metadata. This keeps PRD-B's By-Day/By-Festival surfacing on Home without adding another calendar engine. Card tap → the text itself via `navigateToEntryStart` (§38) — single-chapter texts open their reader directly rather than a one-row chapters index.
5. **Routine banner** (§30), **inline** (not docked) on Home — the नित्य साधना nudge / progress / complete chip, sitting directly under the Today strip / recommendations cluster (16px gap each side). It moved out of the bottom overlay (July 2026) so it no longer floats over — and clips — the DISCOVER carousel; the "today" cluster (panchang → today's recommendations → today's practice) now reads as one block above the library. Still **docked** above the tab bar on Daily Bhakti (§21).
6. Section label "CATEGORIES" (Inter 11, uppercase, ink-muted, 0.22em tracking)
7. **Category grid** (3-column launcher layout, wraps as tiles are added):
   - **Rank = usefulness + app-USP first** (July 2026). `categories.ts` array order drives the grid; the sequence is **चालीसा · आरती · स्तोत्रम् · ग्रन्थ · जप** (daily-recite + flagship read + the Japa mala-counter USP) → **संस्कार · तीर्थ** (habit/browse USPs) → the thin PRD-A parity forms **कवच · अष्टकम् · सूक्तम्** last (2–4 texts each; their NEW badges handle discovery). (**स्तुति is not a tile** — its texts fold into `stotram`, §41.) The grid **interleaves four non-content tiles** at ranked spots plus one at the end: **व्रत · Vrat & Parv** and **कुंडली · Kundali** right after जप (व्रत opens the Panchang tab's `ObservanceList` vrat catalog via `panchangTabTarget()` — the `entryRoutes.ts` helper carrying `initial: false` so a lazily-mounted Panchang tab keeps its calendar as the initial route; PRD-09 — a grid door, **not** a `ContentCategory`; content lives in the observance engine, not the library — and कुंडली opens the Panchang tab's Jyotish mode, PRD-C), plus **देवता · By Deity** and **उद्देश्य · By Purpose** after तीर्थ. By Deity opens `DeityIndexScreen`; By Purpose opens `BrowseByPurposeScreen` (§50). A **मुहूर्त · Muhurat** tile (ghatika-dial mark, → the Panchang tab's `MuhuratFinder`, PRD-16 §60) follows कुंडली — the three Panchang-tab doors (व्रत · कुंडली · मुहूर्त) sit as one cluster after जप. A **नित्य साधना · Daily Practice** tile (lotus mark, → `RoutineToday`, the same surface as the RoutineBanner §20) is **appended last and renders full-width** as the grid's closing row, so the grid still ends clean now that the tile count is 16. HomeScreen anchors these by id (after `japam` / `theerth`, or at the end), not by index, so reordering categories keeps them in place.
   - **16 tiles total** (10 content categories + व्रत + कुंडली + मुहूर्त + देवता + उद्देश्य = 5 rows × 3, closed by the full-width नित्य साधना row), flowing as a 3-column launcher grid. Any `coming` tile renders inline at its registry position as a dimmed, non-interactive "SOON" launcher (Section 19). As more PRD-A forms (e.g. सहस्रनाम) land the grid keeps growing down; it is no longer a fixed square.
   - Gap: **10px** between tiles, **24px** side padding (`spacing.xxl`, the Home page gutter); tile width = a third of the remaining row
   - Tap → CategoryList for that category (तीर्थ opens the Theerth browse surface, §26; व्रत opens the vrat catalog; कुंडली opens Jyotish; देवता opens the Deity Index; उद्देश्य opens Browse by Purpose; नित्य साधना opens the daily routine)
   - Tile spec: the **launcher variant**, Section 19
8. Section label "DISCOVER" + **Feature Spotlight carousel** (§32) — a full-bleed horizontal row of `FeatureCard`s surfacing the app's cross-cutting sections (Daily Practice, Daily Verse, Sankalp, Pitru Smaran, Guided Pujas/पूजा विधि, Pilgrimage, Home-Screen Widgets — the Panchang card was retired when the Today strip took over that surface). Moved *below* the grid: the prime slot now belongs to today-relevant content; the carousel keeps its per-open shuffle one swipe down.
9. Footer mantra (Section 7 — token `footerMantra`, 18 @ 55% opacity) at the end of the scroll
10. **Floating search button** (`SearchFloatingButton`) docked bottom-right → opens the Search screen. Uses its default `spacing.xl` bottom offset now that the routine banner no longer docks at Home's bottom (it used to pass a banner-clearing offset). (The old Help floating button/modal never shipped.)

**First-tap recovery (all Home cards).** Every tappable Home card opens on the **first** tap, not the second. iOS can cancel a child `Pressable`'s `onPress` when it lives inside a `ScrollView` even when the finger never actually drags, so a naive `onPress` intermittently no-ops the first touch. A single shared controller (`contexts/TilePressContext.tsx`, `useTilePressController` + `TilePressProvider`) remembers the action on `onPressIn`, arms a one-tick fallback on `onPressOut`, and fires it unless a real `onPress` already ran or a scroll drag intervened. `activateTile` only consumes a pending action that belongs to the current gesture: a *dragged* pending (a scroll whose press was cancelled) is never reused, so an accessibility tap — which invokes `onPress` with no preceding `onPressIn` — always runs the tapped card's own action rather than a stale one left behind by an earlier scroll. It is shared (context) across the **whole** Home surface — the category grid (§19), the Today strip (§48), the For-Today row (§50), the routine banner (§30), and the DISCOVER carousel (§32) — because a card lives inside the outer vertical scroll, so a vertical page-drag started on a card must suppress *that card's* fallback; a per-component copy could not see the outer scroll and would navigate on a plain scroll. Each enclosing `ScrollView` (the outer vertical one and every inner horizontal row) wires `onScrollBeginDrag` to the controller's `markTileDrag`, so a swipe is always a scroll and never a tap. Introduced for the grid in July 2026 (#219) and extended to the Today/Discover cards immediately after; the routine banner (§30) was the last plain-`onPress` holdout and was wired in Aug 2026 (it intermittently no-opped its first tap on Home). Pinned by `contexts/__tests__/TilePressContext.test.tsx` and `components/__tests__/RoutineBanner.test.tsx`.

(A **Continue-reading card** briefly sat between the grid and DISCOVER — retired July 2026, §49.)

There is **no deity chip row on Home** — deity browsing lives in the Deity Index screen (§20), and intent browsing lives behind the By Purpose tile (§50).

**Why today-first:** a July 2026 competitive review found the previous Home never changed between visits (hero + DISCOVER carousel + 2-column catalog grid) — nothing on it answered "what matters today". The Today strip and the compact launcher put today's panchang state and the top-ranked sections inside the first viewport.

**Gradient background:** same as Section 2 Home gradient.

---

## 19. Component: Category Card

**Purpose.** Grid tile representing a content category on the Home screen.

Two status variants — `active` (has content) and `coming` (placeholder) — and two **layout variants** (`variant` prop in `CategoryCard.tsx`): `launcher` (the Home 3×3 grid) and `card` (the classic 2-column gradient card, kept for the `coming` state and any future 2-column layout).

**Launcher (Home grid, active):**

- Column layout: a compact **glyph tile** with the name *below* it (myBhakti-review learning: label-below is what lets three columns breathe; the name-inside card can't shrink past two columns without truncating).
- Tile: height **72**, full column width, `radii.lg`, `cardActiveFrom → cardActiveTo` gradient, 1px `cardActiveBorder`, **`elevation.card`** (the theme token — no inline shadow literals). The tile has an opaque `cardActiveFrom` base and **no `overflow: 'hidden'`** (it would clip the iOS shadow); the gradient carries its own matching radius. `CategoryIcon` stroke vector centered.
- Label: **one line, caption size** — `devPrimary 13` / `latPrimary 14` via `orderTitlesByLanguage()`, `ink`, centered, `numberOfLines 1`, 6px below the tile.
- **Label position** (`launcherLabelPosition`): `below` (Home's default, above) or `tile` — the dense-index variant that centres the name *inside* the 72 pt tile over up to two lines (`launcherLabelLines`), used by the 27-tile Namkaran nakshatra grid (§61). Either position keeps the label at the fixed caption size; the in-tile position adds `lineHeight 21` and a `maxFontSizeMultiplier` of 1.25 and must **never** enable `adjustsFontSizeToFit` (see §61 for the iOS shrink bug it caused).
- **Short English display names.** Under a ~⅓-row tile the full registry names ("Hymns & Praise", "Japa & Mantras") don't survive one line, so `categories.ts` carries an optional `shortNameEn` ("Hymns", "Japa", "Books", "Habits") used **only** by the launcher label. The **accessibility label always carries the full `nameEn`** (`"{nameEn}.{ New.?} Tap to open."`) — the Maestro smokes tap tiles by that full label, and screen readers keep the descriptive name.
- `NEW` badge: same pill as the card variant, inset 6px in the tile's top-right corner.
- **Coming (launcher).** A `status: 'coming'` tile keeps the launcher geometry: `cardSurface` tile at 55% opacity, same `elevation.card` lift as its active siblings, with the `SOON` pill (gold tint) and the caption label below; not pressable (`accessibilityState.disabled`). It does **not** fall through to the 2-column card layout.

**Active (card variant):**

- Background: linear-gradient `cardActiveFrom → cardActiveTo` (`#FFF5E0 → #F5DEAC`, same gradient as library card)
- Border: 1px `cardActiveBorder` (`rgba(184, 98, 27, 0.4)`)
- Shadow: **`elevation.lifted`** (§4 — offset `0,4`, opacity `0.11`, radius 12, Android 3). Was an inline `0.12` literal until July 2026.
- Radius: **`radii.lg`** (18). Was an ad-hoc `16`, off the radius scale (§4).
- Layout (vertical, centered):
  - Icon: a `CategoryIcon` stroke vector (saffron-deep), centered above the name
  - **One name line only** — the active reading language's primary via `orderTitlesByLanguage()` (`devPrimary 16` / `latPrimary 17`, `ink`), 6px below the icon. The demoted second-language line is **deliberately dropped** on Home tiles to tighten the grid (see the comment in `CategoryCard.tsx`); catalog/detail screens keep the bilingual pairing. The English `accessibilityLabel` stays intact so screen readers still announce the English name.
- Padding: 12px vertical, 10px horizontal
- Tap → pushes CategoryList screen

**Coming:**

- Background: `cardSurface` flat
- Border: 1px `divider`
- Shadow: `sm` (runtime: **`elevation.subtle`**)
- Card at 55% opacity
- "SOON" pill badge: top-right corner, 8px inset. **10** (the §3.0 floor; was 9), 600, uppercase, 0.18em tracking, `goldTint` fill, `ink-muted` text
- Tap disabled (no navigation)

**New content (active tiles & library cards):**

- Recently-added content (new since the user's last update) shows a `NEW` pill badge: top-right corner, same geometry as `SOON`. `newBadgeBg` fill (saffron tint) + `newBadgeText` (saffron-deep). Saffron — the primary/active accent — marks it as live & fresh, distinct from the muted gold `SOON`. The chip clears once the user opens that content. Carries the "NEW" text cue (never color-only, per §10 accessibility).

---

## 20. Component: Deity Chip

> **Superseded.** The circular deity chip row never survived past the Home redesign. Deity browsing now lives in the **Deity Index screen** (`DeityIndexScreen.tsx`, reached from the देवता tile in the Home grid): all 21 deities from `deities.ts` render as full-width `DeityCard` rows, each carrying a `DeityIcon` attribute vector (bow-and-arrow for Rama, bansuri for Krishna, trishul for Shiva, …), over a randomly-picked deity background plate (`getRandomDeityBackground`, stable per mount). Tapping a row pushes the Deity Detail page (§50), which carries the essay and grouped text list. The older `DeityListScreen` remains as a plain filtered-list route for compatibility.

---

## 21. Screen: Category List

**Purpose.** Shows all items belonging to a specific category type. Reached by tapping a category tile on Home.

**Structure:**

1. Status bar
2. Top bar: back button (‹ in 44px circle) + title "ग्रन्थ · Sacred Books" — primary/secondary ordered by the reading language via `orderTitlesByLanguage()` (primary `ink`, demoted secondary `ink-muted`, separated by `·`)
3. Item list: renders `LibraryCard` (Section 8) for each item in the category, 12px gap, 28px side padding
4. Items render in **registry order** — the ordering is curated in the `library` array (`mobile/src/data/texts.ts`), not sorted at render time (every shipped entry is `active` today; `hidden` entries are filtered out)
5. Tapping an item with prior reading progress opens a `ResumeReadingSheet` (resume at the saved verse / start over) before navigating; items with no progress navigate straight to their start

Background: the category's faded sketch plate (`getCategoryBackground`, §6) under the parchment overlay.

---

## 22. Screen: Deity List

The legacy Deity List is the plain filtered-list fallback: same as Section 21, but filtered by deity tag instead of category. Title shows deity name: "श्री राम · Shri Rama". The primary deity browse path now lands on the richer Deity Detail page (§50), then opens the same `LibraryCard` rows through `navigateToEntryStart()`.

---

## 23. Screen: Daily Bhakti

**Purpose.** A devotional "verse of the day" experience. Shows a random verse each time the user opens the tab.

**Structure:**

1. Status bar
2. Title area (centered): "दैनिक भक्ति" (Noto Serif 20 600, ink) + "Daily Verse" (Cormorant 14 400 italic, ink-muted, 4px below)
3. **Verse card** (centered, 28px side margins):
   - Background: `parchment-soft` base + the verse's **reader-page sketch** — `BackgroundLayer` over `getReaderBackground(verse.sourceId, { stanza: verse.chapter })`, so the card carries the same faded deity/source plate as the source's own reader (the pool verse's `chapter` doubles as the kāṇḍa/stanza key for Valmiki Ramayan / Sundarkand; sources without a plate fall back to the plain parchment gradient). Card clips it with `overflow: hidden`
   - Border: 1px `divider`
   - Shadow: `md` (runtime: **`elevation.raised`** — was an inline `0.14/24` shadow until July 2026)
   - Radius: 18
   - Padding: 24px
   - Content (top to bottom):
     - **Header row**: source pill on the left (Inter 10 600, 0.3em tracking, saffron-deep on saffron-tint bg, radius 999 — "भगवद् गीता · श्लोक 2.47" format, language-aware) · **BookmarkButton + ShareButton** on the right, matching the reader's in-page actions (§25)
     - Verse text: verse token for the reading language, `ink`. 16px below the header row
     - Ornament divider (Section 5 `॥` style). 16px vertical margin
     - Meaning label: single-language `भावार्थ` / `Meaning` (same treatment as Section 9)
     - Meaning body: meaning token for the reading language, `ink-soft`
     - **Card footer row**: source name on the left (Cormorant 12 400 italic / script serif, `ink-muted` — no "From" prefix) · an inline **`↻ next`** text pressable on the right (14px, `saffron`) that picks a new random verse. There is no separate 40px refresh circle or attribution line below the card
4. **Routine banner** (§30) docked above the tab bar. This is now the **only** screen that docks it — Home moved its banner inline (July 2026) to de-clutter its scroll, but Daily Bhakti's single centred verse card has no comparable inline seam, so the docked chip stays here.

**Gradient background:** same as Home.

**Verse pool:** an explicit registry — `mobile/src/data/versePool.ts` — mapping each participating section (Gita, Sundarkand, the stotrams, chalisas, Ramcharitmanas, Valmiki Ramayan, japam mantras, sanskar verses, …) into a `UniformVerse` shape. Membership is **registered per section**, not inferred from categories, so the pool only surfaces content with a well-formed verse + meaning mapping. Selection: `Math.random()` over the flat pool on each visit / `↻ next` tap.

**Deep-linking:** a daily-verse reminder tap can pin the tab to a specific verse via route params (`sourceId` / `chapter` / `verseIndex`); the pinned verse is resolved from the pool by identity and shown instead of a random pick.

---

## 24. Screen: Wishlist (saved verses)

**Purpose.** Displays user-saved verses for quick re-access. Persisted locally via AsyncStorage (`BookmarksContext`). There is **no Bookmarks tab** — the screen is reached via **More → Wishlist** (`MoreStackNavigator` → `WishlistScreen.tsx`).

**Structure:**

1. Status bar
2. **Top bar**: back button (44px circle) + bilingual title block — primary "संग्रह" / "Saved Verses" swaps with the reading language (title face 16), the other language demoted to an 11px `ink-muted` caption beneath
3. **Bookmark list** (28px side padding, 10px gap):
   - Each card:
     - Background: `parchment-soft`
     - Border: 1px `divider`
     - Radius: 14
     - Padding: 14px
     - Layout (horizontal): verse info (flex-1) + ♥ remove button + chevron
     - Preview text: **first 2 lines** of the verse (numberOfLines=2), 14/22, `ink`, in the reading language's serif
     - Meta row below the preview: verse pill (`श्लोक N` / `Shloka N.M`, Cormorant SemiBold 10 on saffron-tint, radius 999) + source line (Cormorant 12 400 italic, `ink-muted`, e.g. "हनुमान चालीसा")
     - **♥ remove button**: `saffron`, 18px glyph inside a 44×44 tap target — opens a **confirm modal** ("Remove from wishlist?" with Remove / Cancel, both ≥44px tall) rather than deleting immediately
     - Chevron: `›`, `saffron`, right-aligned (decorative — hidden from a11y)
   - Row tap → navigates to that verse in its reader via `buildBookmarkTarget` (`mobile/src/navigation/entryRoutes.ts`), bubbling up to the Home tab stack
4. **Empty state** (when no bookmarks):
   - Centered
   - `॥` ornament (24px, ink-muted, 40% opacity)
   - Text: "अभी तक कोई श्लोक सहेजा नहीं" (15, ink-muted, centered — script serif for gu/kn)
   - Subtext: "No verses saved yet" (Cormorant 14 400 italic, ink-muted)
   - Hint: "Tap the ♡ icon while reading to save verses" (Cormorant 12 400 italic, ink-muted, 60% opacity)

**Gradient background:** same as Home.

---

## 25. Component: Bookmark Button

**Purpose.** Toggle button allowing users to save/unsave the current verse (`BookmarkButton.tsx`).

- Position: **in-page**, in each verse page's header row (verse pill left, actions right — the `topActions` slot, §9), next to the Share button. Not in the reader top bar.
- Shape: 34×34 circle, `parchment-soft` fill, `divider` border
- Icon rendered as text: **"♡"** (unsaved, `ink-muted`) / **"♥"** (saved, `saffron`), 16px
- Tap: toggles bookmark state via BookmarksContext
- Animation: light scale pulse (1.0 → 1.15 → 1.0, 200ms) **on save only** — removal stays quiet; the pulse collapses to the final frame under reduce-motion (§12)
- Haptic: `Haptics.ImpactFeedbackStyle.Light` on every toggle
- Hit slop: 12px all sides (lifts the 34px visual past the 44×44 target)
- Accessibility: `accessibilityRole="button"`, label "Add bookmark" / "Remove bookmark", `accessibilityState={{ selected }}`

---

## 26. Screen: Theerth Browse (तीर्थ)

**Purpose.** Entry surface for the Theerth (pilgrimage) category — a browse **list**, not a map. Tapping the Theerth category tile on Home pushes this screen (`TheerthMapScreen.tsx` — the file keeps its historical name, but the landing view renders no map). The `<IndiaMap>` appears in the **drill-in** view after picking a state or category. Full proposal in `docs/roadmap/prds/07-temple-tour.md`.

**Layer stack:**

1. Flat parchment gradient only (`BackgroundLayer` with `source={null}`) — deliberately no faded sketch: a busy plate camouflaged the saffron map outline and pins in the drill-in view.
2. Content column.

**Structure — landing (top to bottom):**

1. Status bar.
2. **Top bar**: back button · title centred `तीर्थ` (Hindi mode) / `Theerth` (English mode), reader-title style — title swaps on language, never stacks · right-side spacer to keep the title centred.
3. **Language toggle row** (centred). Same `LanguageToggle` component as §16, consistent across every Theerth screen. State shared via `useGitaLanguage()` — do not fork.
4. **View toggle** (segmented control, parchment-soft fill, divider border, pill radius):
   - Two halves: `राज्य · By State` and `श्रेणी · By Category` (lang-swapped labels; category is the default).
   - Active half tinted `saffron-tint` with `saffron-deep` text; inactive transparent with `ink-muted`. Halves are minWidth 100 × minHeight 44, `radiogroup`/`radio` roles.
5. **Browse card list** — one gradient LibraryCard-style row per **category** or **state**: `[ thumb glyph ॥ (category) / ॐ (state) ]  [ name · meta "N तीर्थ / N temples" ]  [ › ]`, with a NEW badge when any temple inside is still unseen. The meta line follows the §46 meta convention: `cardMeta` size, Inter + tracking for English only; Indic meta takes the script serif with **no** tracking (tracking splits the shirorekha). Category rows follow the curated `groupOrder` — the `TheerthGroup` buckets द्वादश ज्योतिर्लिङ्ग, चार धाम, छोटा चार धाम, शक्ति पीठ, plus an "अन्य प्रसिद्ध तीर्थ · Other Famous Temples" bucket for ungrouped temples; state rows sort alphabetically by `stateEn`.

**Structure — drill-in** (the same screen pushed again with a `group` or `stateEn` param):

1. Top bar title becomes the category/state name; the language toggle row persists.
2. `<IndiaMap>` (Section 28), centred, scoped to the subsection — pins render only for the drilled-in temples; the By-State drill-in fills the focused state.
3. A single italic hint line below the map: `पिन छूकर मंदिर की कथा पढ़ें` / `Tap a pin to read the temple's story` — Cormorant Garamond 12 italic, `ink-muted`, centred. (There is **no** `introHi/En` prose field on the model — this hint is the only copy.)
4. Flat temple list (same browse-card rows; meta line = `city, state`), alphabetical by the localized temple name.

**Data:** **71 temples** in `mobile/src/data/theerth/temples.ts`, each tagged with zero or more `groups` — a temple may appear under multiple yatras (Kedarnath is both Jyotirlinga and Chota Char Dham); `groups: []` lands it under Other Famous Temples.

**Interactions:**

- Tap pin or list row → push `TheerthDetail` for that temple (and mark its NEW chip seen).
- Long-press pin → small label tooltip with temple name (lang-swapped). Auto-dismisses on release (Section 29).
- The By State / By Category choice is component state on the landing screen; drill-ins are separate pushes, so back from a detail returns to the same view.

**Gradient background:** flat parchment gradient (no sketch).

---

## 27. Screen: Theerth Detail

**Purpose.** Per-temple narrative screen. Reached by tapping a pin on the Map view (§26) or a row in the State list view.

**Layer stack:**

1. Parchment base.
2. Faded sketch background resolved by the temple's **presiding deity**, with per-temple id overrides for shrines whose deity plate is too generic (`getTheerthBackground(temple.id, temple.deity)`, `mobile/src/data/backgrounds.ts`). There is no per-temple `background` field on the model.
3. Parchment gradient overlay (§2).
4. Vertical-scroll content column.

**Structure (top to bottom):**

1. Status bar.
2. **Top bar**:
   - Back button — returns to the Theerth browse surface preserving its view state.
   - **Language toggle** centred (§16) — the temple name lives only in the hero below, never duplicated in the bar.
   - Spacer.
3. **Hero block** (centred):
   - Temple name in large title type: screen-title face at 28, `ink`, centred.
   - Subtitle line: `<city>, <state>` (lang-swapped), 14, `ink-muted`, centred (Cormorant italic for en; script serif for Indic).
   - Deity badge: a small pill (`saffron-tint` fill, `divider` border, `pill` radius, `saffron-deep` text) reading the presiding deity's name, typed via `pillTextStyle(lang, versePill)` — Inter 10 600 wide-tracked uppercase for English; script serif bold with **no** tracking for Indic (tracking split "शिव" into "शि व").
4. Ornament divider (`॥`, §5).
5. **Significance section:**
   - Label: `महिमा · Significance` (`Significance · महिमा` when lang = en) — reading-language form leads, the other supports. Rendered in the **script serif bold** at the `meaningLabel` size (13), `saffron-deep`, uppercase, **no tracking** — the label is always mixed-script, so a Latin face would clip the Devanagari half and tracking would split the shirorekha.
   - Body: **a single prose string** — `significanceHi` / `significanceEn` (not a paragraph array). Typography follows the meaning token for the reading language (Hindi 20/34 Noto Serif `ink-soft`; English 20/33 Cormorant 500 italic here, `ink-soft`), centred.
6. Ornament divider.
7. **Origin Story section:**
   - Label: `उद्भव कथा · Origin Story` (`Origin Story · उद्भव कथा` when lang = en). Same style as Significance label.
   - Body: a single prose string — `originStoryHi` / `originStoryEn`, same typography rules.
8. **Sources footer**:
   - One-line attribution: `स्रोत — <label 1>, <label 2>` (`Sources — …` in en) — 12 italic, `ink-muted`, centred, 70% opacity.
   - URLs are NOT links in v1 (rendered as plain text). v2 may make them tappable.

**Romanization:** §3.1 carve-out — temple-name spelling uses popular English (`Kashi Vishwanath`, not `Kāśī Viśvanātha`); origin-story `*En` fields are independent prose, not transliteration.

---

## 28. Component: India Map

**Purpose.** Reusable stylised SVG India outline used by `TheerthMapScreen` and (potentially in v2) by Profile / search "by state". Rendered with `react-native-svg`. Do **not** add `react-native-maps` or any tile provider.

**Visual treatment:**

- SVG outline of India (mainland + visible major islands), single `saffron-deep @ 0.6 opacity` stroke at 1.2 px, no fill (the parchment shows through).
- State boundaries (shown by default on the Theerth surface, PRD-08) as thinner `saffron @ 0.25 opacity` strokes at 0.6 px. The focused state in the By-State view is filled `saffron @ 0.12 opacity`.
- Aspect ratio ~1:1.2 (wider tail south, narrower north — proportional to India's actual extent).
- No labels on the map itself (state names are surface in the state-list view, not on pins).

**Props (API):**

```ts
type IndiaMapProps = {
  pins: Array<{ id: string; lat: number; lng: number; label: string }>;
  width: number;               // computed by parent from screen width
  onPinPress: (id: string) => void;
  showStates?: boolean;        // default true on the Theerth surface (PRD-08)
  highlightStateEn?: string;   // fill the matching state (By-State focus)
};
```

**Projection:** equirectangular, bounded by India's extent: lat ∈ [6, 38] → y ∈ [0, height]; lng ∈ [68, 98] → x ∈ [0, width]. Latitude is flipped (north = top). No distortion correction — the ~1:1.15 viewport aspect (`width 300 × height 345`) is achieved purely by the viewBox dimensions, a per-axis linear map. The pins are projected with the exact same `INDIA_PROJECTION` constants the paths were generated from, so a pin lands precisely on the real outline.

**Coordinate sanity:** the component warns (dev mode only) if any pin's lat/lng falls outside the bounding box — catches lat/lng swaps and bad source data before they render off-screen.

**Data provenance (PRD-08).** The outline + 36 state/UT boundaries are **real geography**, generated once by `scripts/build-india-map.mjs` and committed as static SVG path constants in `mobile/src/components/indiaMapPaths.generated.ts` (`INDIA_OUTLINE`, `INDIA_STATES`, `INDIA_PROJECTION`). Re-run the script to refresh; do **not** hand-edit the generated file. Sources: the **national outline** is DataMeet `india-composite` (© DataMeet, **CC-BY** — https://github.com/datameet/maps), which depicts India's official boundary including the full Jammu & Kashmir / Ladakh extent — Natural Earth's de-facto boundary truncates the northern Kashmir crown, so it is no longer used for the outline. The **state/UT boundaries** are public-domain Natural Earth 50m `admin_1_states_provinces` (their post-2019 state names match `TheerthTemple.stateEn`).

**Performance:** paths are static committed constants (~35 KB total). No runtime simplification, no GeoJSON parsing, no map provider, no API key. Render cost is dominated by the pin count — bounded in practice because the map only renders in drill-in views with the subsection's pins (a state or yatra group), never all 71 temples at once.

---

## 29. Component: Theerth Pin

**Purpose.** The individual pin glyph rendered on `<IndiaMap>`.

**Visual:**

- Glyph: `॥` in `saffron-deep`, Noto Serif Devanagari, 18 px (slightly larger than ornament dividers to read as an interactive element).
- No background circle / no shape underlay — the glyph itself is the pin. This keeps the map quiet.
- Tap-hold tooltip: small parchment-soft rectangle, `divider` border, 8 px padding, label in Noto Serif Devanagari 13 600 / Cormorant Garamond 13 400 italic (lang-swapped). Tooltip appears above the pin (or below if too close to top edge).

**Interaction:**

- Tap target: 44×44+ invisible hit area via `hitSlop` (16 px each side), even though the visible glyph is ~18 px.
- Tap → calls `onPress(id)`.
- Long-press (**250 ms** threshold, `delayLongPress`) → shows tooltip; tooltip auto-dismisses on release.
- Haptic on tap: `Haptics.ImpactFeedbackStyle.Light`.

## 30. Component: Routine Banner & Completion Celebration

**Purpose.** A banner surfacing today's नित्य साधना (daily routine). Two layouts via a `variant` prop: **`docked`** (default) — a floating chip pinned just above the tab bar, used on Daily Bhakti (§21); **`inline`** — flows in the Home scroll between the Today strip (§48) and CATEGORIES (§18), so it no longer overlays the content beneath it (July 2026 — the docked chip on Home floated over and clipped the DISCOVER carousel). The only visual difference is positioning + shadow direction (docked lifts upward off the bar; inline casts a soft downward card shadow); state logic and copy are identical. `RoutineBanner.tsx` + `routineBannerView.ts` (pure state logic).

**Docking.** `position: absolute; bottom: spacing.sm` — the tab bar already owns the bottom safe-area inset (`height: 60 + insets.bottom`), so the banner must **not** add `insets.bottom` again (doing so left an ~inset-sized dead gap below it).

**One line, language-aware.** A single line chosen by the active reading language (`useGitaLanguage`), never a stacked Hindi+English pair. 30px disc + tight `spacing.sm` vertical padding keep it compact.

**First-tap (Home).** The whole banner is one `Pressable` that bubble-up navigates to the routine screen. On Home it lives inside the outer vertical `ScrollView`, so — like every other Home card — it routes its press through the shared first-tap controller (`onPressIn`/`onPressOut`/`onPress` → `TilePressContext`, §18); a plain `onPress` intermittently no-opped the first tap. Outside a `TilePressProvider` (the docked usage on Daily Bhakti, §21) the controller's default is a no-op that runs the action immediately, so docked behaviour is unchanged.

**Three states** (`bannerStatus`):
- `nudge` (no routine) — dashed `gold` border, `नि` disc, "अपनी नित्य साधना बनाएँ" / "Set your daily practice" → opens RoutineCreate.
- `progress` (partial, or nothing scheduled today) — `goldTint` border, `doneCount/total` disc, "नित्य साधना · आज" / "Daily Routine · Today", + a saffron progress track → opens RoutineToday.
- `complete` (all done) — a bloomed **lotus** mark (`LotusMark.tsx`) + "साधना पूर्ण · आज" / "Complete for today". The prominent progress chip is replaced by this compact achievement badge → opens RoutineToday.

**Completion celebration (pushpa-varsha).** The moment today's routine becomes complete, a gentle one-shot flower shower of saffron/gold petals drifts down (`RoutineCelebration.tsx`), with a `Haptics.NotificationFeedbackType.Success` tap. Reverent, not confetti (Section 11): a soft fall + fade, no scale pops. The shower does **not** render from the banner — it fires app-wide from `RoutineCelebrationOverlay`, mounted once at the navigation root, so it plays on whatever screen completion happens (reading to the last page, finishing japa, or a manual mark). The once-per-day gate is `celebratedSignatureToday` persisted in `RoutineContext`: a record of today's **date + an order-independent signature of the scheduled item set** — so completing the same set celebrates once, while adding an item and completing again can celebrate anew; the gate is held until the context finishes loading to avoid a replay on launch. Vector art is built from `View` + `expo-linear-gradient` (no SVG — same convention as `CategoryIcon`). This pushpa-varsha is the **only** sanctioned exception to §11's no-animation stance; the Today's Practice seal (§31) reuses its fade, not a new effect.

---

## 31. Screen: Today's Practice (आज की साधना)

**Purpose.** The daily-driver screen the routine banner (§30) opens — today's scheduled items across all routines, presented as a devotional ledger rather than a utility checklist (PRD-10). `RoutineTodayScreen.tsx`, inside the parchment `RoutineShell`.

**Screen order.** The **नित्य साधना daily routine leads** — the completion summary card + item rows render first, because a screen titled *Today's Practice* should open on what you do every day. Any enrolled prebuilt-sankalp cards (`SankalpTodayCard`, §46) follow **below** the routine (separated by a `spacing.xl` gap that appears only when a routine is present above them), then the ghost **Browse sankalps** button. **Both ledgers are tap-to-expand accordions:** the daily-routine summary card (below) and each sankalp card (§46) show only their header until tapped, then drop their item rows down — the two use the same row spec and the same rotating `›` caret cue, so the surface reads as one system. The sankalp cards are themselves ordered by `orderSadhanaCards` (§46): daily-cadence/active first, then resting/upcoming by nearest date, completed last. (Before July 2026 the sankalp cards rendered above the routine — a screen-order bug that buried the everyday practice.)

**Components & where they live** (all pull tokens from the theme; no hard-coded hexes):
- `mobile/src/components/MalaStreak.tsx` — the streak drawn as a bead string.
- `mobile/src/components/PracticeSeal.tsx` — the completion seal (wraps `LotusMark`).
- `mobile/src/data/routine/practiceView.ts` — pure view-model (summary lines, offered-time formatting, mala math), unit-tested like `routineBannerView.ts`.
- `mobile/src/utils/useReducedMotion.ts` — shared reduce-motion hook (§12).

**Completion summary card (accordion header).** One centered `parchment-soft` card (`goldTint` border, `radii.lg`, `elevation.card`, `spacing.lg` padding) at the top. **The whole card is the accordion header — a `Pressable` (`accessibilityRole="button"` + `accessibilityState.expanded`) that toggles the item rows below.** The rows **collapse by default** so the screen opens on a compact summary, not a long list; a centred **dropdown caret** at the foot of the card (a `›` rotated to point down when collapsed, up when open — `summaryCaret`, matching §46's sankalp caret) signals it. Its contents:
- Headline: partial → `{done} of {total}`; complete → `{total} of {total} offered`. Latin headline uses Cormorant 600 upright; Hindi uses the Devanagari screen-title face.
- Italic sub-line (Cormorant italic / Devanagari `meaning` in Hindi): partial → `{n} reading(s) remaining`; complete → `Today's practice is complete` / `आज की साधना पूर्ण`.
- Progress strip: a gold→saffron `expo-linear-gradient` fill on a `parchment-deep` track. **Hidden when complete.**
- `MalaStreak` row + label.
- `PracticeSeal` — **absent while partial; fades in (opacity only, no scale pop) when complete**, riding the §30 completion-fade exception; instant under reduce-motion.

**Mala bead semantics (`MalaStreak`).** A horizontal string of beads filling toward a larger gold **meru** bead — the product's streak metaphor, never a fitness flame. `lit = min(streak, capacity)` (default capacity 7; the numeric label stays authoritative for longer streaks). Lit beads use a saffron gradient; unlit beads are `parchment-deep` with a `gold` hairline. The most-recent lit ("today") bead carries a **static** saffron ring — no pulse (§11). Streak 0 → all beads unlit with a "Start your mala today" / "आज से माला आरम्भ करें" label, never a hidden component. Built from `View` + gradient (no SVG, per §30).

**Devotional language — "offered" (अर्पित).** On this screen, completing an item is framed as *offering* it, not ticking a box. An offered row reads `offered {time}` / `{time} · अर्पित`; a pending row reads `Tap to read` / `पढ़ने के लिए टैप करें`. Completion **semantics** are unchanged from §30/PRD-07 (auto on reaching the last verse-page or target japa rounds; manual mark as fallback). (The banner and Profile keep their existing "पूर्ण / complete" copy for now; the "offered" register is scoped to this screen.)

**Offered-at timestamp format.** 12-hour clock with meridiem — `7:12 AM` / `7:12 पूर्वाह्न` (पूर्वाह्न before noon, अपराह्न after), via `formatOfferedTime`. A missing/sentinel time (auto-japam, which carries no per-round timestamp, or a migrated legacy mark) shows a plain `offered` / `अर्पित` with no time.

**No strikethrough.** A completed item's title is **muted (`ink-muted`), never struck through** — striking a sacred text reads as "cancelled," the opposite of "offered." The completion mark is a `saffron` ring that fills with a `✓` when offered; tapping it toggles the manual mark.

**Item rows (dropdown).** Rendered only when the summary header is expanded. Title in the card-title face (16 over a 24 line — ≥1.5× so Devanagari matras never clip); sub-line (`{alt title} · {tail}`) follows §46's meta convention (`scriptBodyFont` + `cardMeta` — never Cormorant on the mixed-script line). Rows align `flex-start` with a small optical offset on the ring and chevron so both pin to the title's **first** line instead of drifting to the middle of a wrapped two-line block. The help caption under the ledger uses the `meaning` face at 12/18 and drops down with the rows. This row spec is the shared contract §46's sankalp dropdown mirrors exactly.

**Browse sankalps.** A ghost `RoutineButton` "तैयार संकल्प चुनें / Browse sankalps" closes the ledger and opens the §46 catalog — one of the catalog's three standing entry points (the create-flow chooser and the §32 Home spotlight are the others), so sankalps stay discoverable after a routine exists.

**Data (PRD-10, additive).** Manual completion now stores a timestamp: `@vedansh/routine-done` persists `{ date, marks: Record<key, epochMs> }` (was `{ date, keys: string[] }`; legacy values migrate to `marks` with timestamp `0` = "offered, time unknown"). `RoutineContext` exposes `manualDoneAt(key)`; `useRoutineToday` surfaces `doneAt` per item (manual mark time, or the reader's last-progress `updatedAt` for an auto-complete). Still date-scoped and reset at the day boundary.

---

## 32. Home Feature Spotlight (DISCOVER carousel)

**Purpose.** Raise awareness of the app's distinct sections — not just the catalog categories, but the *cross-cutting surfaces* a first-time user easily misses (Daily Practice, the Daily Verse tab, Sankalp, Pitru Smaran, Guided Pujas (पूजा विधि → the §62 Vidhi Catalog, pushed on the Home stack), the Pilgrimage map, Home-Screen Widgets — the Panchang card was retired in favour of the Today strip, §48). A single horizontal carousel of feature cards sits **below the CATEGORIES grid** (§18) — it originally led the page, but the prime slot now belongs to today-relevant content (§48). One flexible card shell carries every section so any content fits.

**Placement & label.** A `DISCOVER` section label (Inter 11 600 `0.22em` uppercase `ink-muted`, same token as `CATEGORIES`) precedes the carousel. The carousel is a horizontal `ScrollView` that **full-bleeds** to the screen edges — it cancels the page gutter with `marginHorizontal: -spacing.xxl` and re-pads its content (`paddingHorizontal: spacing.xxl`) so the first card aligns with the page while the next card peeks. `snapToInterval = cardWidth + gap`, `decelerationRate="fast"`, `snapToAlignment="start"`.

**Touch band (Aug 2026).** The band's `contentContainerStyle` carries `paddingVertical: 10` — the §50 touch-band fix mirrored here. The cards are `Pressable`s inside the horizontal `ScrollView`, and the shared first-tap fallback (§ "First-tap recovery") is only suppressed when `onScrollBeginDrag` fires; an arced horizontal flick starting near the band edge can lose the first-pixel gesture negotiation to the card `Pressable` / outer vertical page-scroll, so a swipe randomly opened a card or stalled instead of scrolling. The vertical padding enlarges the *scrollable frame* and the arc tolerance — the touch target, not the visible cards — so the horizontal scroll reliably wins the drag. The `DISCOVER` label drops its own bottom margin (`marginBottom: 0` vs the shared label's 8) so the two spacings don't stack.

**Where a card's target lives.** Most spotlights push on the **Home stack**, so back returns to Home. Three hand off to another tab — Daily Verse (a bare tab switch, no stack push), Pitru Smaran and Home-Screen Widgets (both into the More hub, whose landing screen carries a row back into each flow, §37). Every such hand-off **must** be built with a `*TabTarget` helper (`moreTabTarget` / `panchangTabTarget`), never a hand-rolled `{ screen, params }`: the tab bar is lazy, so without `initial: false` the target becomes that stack's *initial* route — dead back button, hub unreachable for the session. The widgets card shipped exactly that bug (Aug 2026) and is now guarded by `navigation/__tests__/tabTargets.test.ts`, which scans every source file for the hand-rolled form. See RULEBOOK §6.0.

**Card width.** `min(320, screenWidth − gutter − 56)` so a sliver of the following card always shows (a peek cue that the row scrolls). Gap `spacing.md`.

**Order shuffle.** All cards always render — awareness is about *coverage*, so no section is ever hidden — but their order is **shuffled once per app open** so a different section leads each visit and the row never reads as a static, ignored banner (`shuffleBySeed(spotlights, seed)`, `utils/shuffleBySeed.ts`). The seed is captured at screen mount (`useMemo([])`), so the order is fresh on each open yet **stable across re-renders** while the user is on Home — it never reshuffles mid-interaction. The shuffle is a pure seeded Fisher–Yates (mulberry32 PRNG), not a raw `Math.random()` call, so it is unit-tested (same seed → same permutation). This is deliberately *not* a "show one random card" pattern — that would surface some sections rarely and undercut the awareness goal; novelty-per-visit is Daily Bhakti's job (§23), not this carousel's.

### Component: Feature Card (`FeatureCard.tsx`)

A content-agnostic spotlight card. Every text field is **bilingual**; the card renders the slot matching the active reading language (`useGitaLanguage` + `orderTitlesByLanguage`) and demotes the other — same contract as the catalog cards (§8/§19). The shell:

```
┌──────────────────────────────┐
│ [icon tile]          EYEBROW  │  header: icon tile (left) · eyebrow tag OR NEW badge (right)
│                               │
│  शीर्षक            (primary)  │  title — language-aware (dev 19 / lat 21 primary)
│  Title          (secondary)   │
│  One-line description that …   │  blurb — ink-soft, numberOfLines 1 (truncates any length)
│  explains the section …        │
│      (flex spacer)             │  pushes the CTA to the bottom so cards align
│  [ खोलें  › ]                 │  CTA pill (saffron-tint fill, saffron-deep text)
└──────────────────────────────┘
```

- **Surface.** `cardActiveFrom → cardActiveTo` gradient, `cardActiveBorder` 1px, `radii.lg`, `elevation.raised` (this is a focal hero element). `minHeight: 112` + the flex spacer keep the CTA pinned to a common baseline across cards of differing copy length.
- **Icon tile.** 36×36 (34 in `compact`), `saffronTint` fill, `radii.md`. Wraps any glyph: a `CategoryIcon` vector, the `LotusMark`, or a plain Devanagari `Text` glyph (e.g. `सं` for Sankalp) — the tile makes them all read as one family. Saffron-tint (light) keeps the `saffronDeep` vectors high-contrast.
- **Eyebrow.** Short uppercase context tag (`versePill` tokens, `saffronDeep`). When `hasNew`, the eyebrow slot is **replaced** by the saffron `NEW` badge (same geometry/colour as §19) — carries the text cue, never colour-only (§12).
- **Title.** `orderTitlesByLanguage`, primary `numberOfLines 1`, secondary demoted to `ink-muted`.
- **Description.** Hindi → Devanagari 13 `ink-soft`; English → Cormorant italic 14 `ink-soft`. `numberOfLines 1`.
- **CTA pill.** `saffronTint` fill, `pill` radius, label (language-aware: `पढ़ें`/`Read`, `देखें`/`View`, …) + `›` chevron in `saffronDeep`. The whole card is the press target; the pill is a visual affordance, not a nested button.
- **Accessibility.** Whole-card `Pressable`, `accessibilityRole="button"`, label = `"{titleEn}.{ New.?} {descEn} Tap to open."`.

**`compact` variant (Aug 2026).** A **name-only strip** form of the same shell, used by the FOR TODAY row (§50) — the DISCOVER carousel keeps the tall default. Home's today cluster (strip + FOR TODAY + routine banner) was consuming most of the first screenful before the CATEGORIES grid came into view, so the FOR TODAY cards were flattened to well under half their height (**56** vs ~130):

```
┌──────────────────────────────┐
│ [icon]  शीर्षक             › │  one row: icon tile · name · chevron
└──────────────────────────────┘
```

- **Dropped:** the blurb, the CTA pill, and the flex spacer between them. The pill was never a button (the whole card is the press target), so the bare `›` chevron in `saffronDeep` carries the same affordance at a fraction of the height. `descHi/En` and `ctaHi/En` stay on `FeatureSpotlight` — the default variant renders both, and `desc` still reaches the compact card's **accessibility label** (below).
- **Height** comes from the row itself — `paddingVertical: 11` + the 34 icon = 56 — with `minHeight: 0`, `paddingHorizontal: 12`. No fixed height, so a font-scale bump grows the strip instead of clipping it.
- **Icon tile** 34×34 (vs 36); **name** one step down (dev 17 / lat 18), `flex: 1`, `numberOfLines 1`.
- **Unchanged:** gradient surface, border, `radii.lg`, `elevation.raised`, the `NEW` badge (inline after the name), and the accessibility label — which still carries `descEn`, so a screen reader on a festival day hears *"Vishnu Chalisa. Today is Diwali. Tap to open."* off a card that shows only the name.
- **Width is the caller's**, and it is now load-bearing: with the blurb gone the name is the entire card, so a width that truncates it costs more here than it did on the default card. See §50 for the FOR TODAY row's 196 and what fits in it.

**Props.** `{ item: FeatureSpotlight; width: number; onPress: () => void; compact?: boolean }`. `width` is owned by the screen (viewport-sized). `FeatureSpotlight` is `{ key, eyebrowHi/En, titleHi/En, descHi/En, ctaHi/En, icon, hasNew? }`.

**Spotlight set (current).** Defined in `HomeScreen.tsx` with navigation wired per item: नित्य साधना → `RoutineToday`; दैनिक भक्ति → `DailyBhaktiTab`; संकल्प → `SadhanaPrograms` (a direct door into the §46 catalog — glyph tile `सं`); **पितृ स्मरण → `MoreTab/PitruSmaranList`** (standing zero-state awareness, `॥` gold glyph, NEW for its launch release); तीर्थ यात्रा → `TheerthMap`; Home-screen widgets → `MoreTab/WidgetGallery`. The former आज-का-पंचांग card was **retired** when the Today strip (§48) took over that surface — keeping both produced two "Today's Panchang." buttons for screen readers. Sibling-tab/More-stack targets navigate via the **parent** (`useNavigation()` → bubble up), not the Home stack — same pattern as `RoutineBanner`/`PanchangScreen`.

**Adding a spotlight.** Append a `FeatureSpotlight` to the `spotlights` array in `HomeScreen.tsx` with both-language copy, an icon node, and an `onPress`. No new tokens are needed — the shell reuses existing card/elevation/typography tokens.

---

## 33. Panchang Tab (पंचांग)

**Purpose.** A daily Hindu almanac plus a vrat/festival companion, living in its own bottom tab (`PanchangTab` → `PanchangStackNavigator`: `PanchangHome` → `ObservanceList` / `ObservanceDetail` / `KathaLibrary` / `MyVrat`). Everything is computed **on-device and offline**: the engine (`mobile/src/panchang/engine.ts`) derives tithi / nakshatra / yoga / karana / vara / lunar month from `astronomy-engine` sun–moon ephemerides with a linear Lahiri-style ayanamsa, so no network, no API, no panchang service. Observance dates come from bundled rules (`festivals.ts` / `festivalEngine.ts`) with a persisted per-city cache warmed off the interaction path. **Day selection is per-rule (`ObservanceRule.dayRule`, RULEBOOK §23):** absent ⇒ `udaya`, the tithi at sunrise, correct for the large majority; `chandrodaya` matches at **moonrise** and is what Sankashti Chaturthi and Karwa Chauth take, since the vrat ends with the moon sighting and arghya. Krishna Chaturthi typically opens mid-morning and closes before the next mid-morning, so sunrise matching named the day AFTER the night the moon is worshipped — Bhadrapada 2026 resolved to 1 Sep, whose 9:22 PM moonrise falls in Panchami, instead of 31 Aug, whose 8:39 PM moonrise falls in Chaturthi.

**Layer stack.** Parchment base · faded sketch background (`panchang_celestial_almanac` via `BackgroundLayer` — the §6 exception pattern: this surface pins its own celestial sketch) · content ScrollView at `spacing.xxl` gutters.

**Structure (top to bottom):**

1. **Surface modes** — the fixed first control in every mode: segmented pill `पंचांग · Panchang` / `व्रत-पर्व · Vrat & Parv` / `ज्योतिष · Jyotish` (13 pt, active `saffron-tint`/`saffron-deep`). It must not move vertically when the selected mode changes.
2. **Contextual Panchang header** — shown below the mode selector for Panchang and Vrat & Parv only; hidden in Jyotish because current city, lunar-month convention, and followed-vrat state do not apply to a birth chart. One compact row, equal-width flex sides so the centre toggle stays screen-centred:
   - *Location chip* (left): a drawn teardrop pin (11 px, `saffron`, counter-rotated `parchment-soft` hole — no emoji per §5) + city name at 12 pt, in a `parchment-soft` pill with `divider` border. Tap → Location Picker (below).
   - *Calendar-system toggle* (centre): segmented pill `पूर्णिमांत / अमान्त` (Purnimant default), active half `saffron-tint` + `saffron-deep`, inactive `ink-muted`. Persisted at `@vedansh:panchang-calendar-system`.
   - *My Vrat button* (right): 34 px circle, `gold` ★, with a `saffron` count badge when the user follows any vrat. → MyVrat.
3. **Calendar card** (`parchment-soft`, `divider` border, `radii.lg`, `elevation.card`): `‹ [full date over a one-line panchang subtitle] ›` day stepper — the date block (a11y label = the full date) carries the day's identity **inside the card**: full date (reader-title face 15) over `vara · lunar month (+अधिक) paksha पक्ष · विक्रम संवत् N` at 11 `ink-muted`, single line, `adjustsFontSizeToFit` to 0.75 (a space placeholder while the day solves keeps the card height stable). The old standalone date-header block below the card and the redundant bottom-left `<Month> <Year>` label are **gone** — the date is stated once (Aug 2026 UI/UX pass; ~70pt reclaimed, the anga grid reaches the fold). Below, one action row: a `माह देखें / माह छिपाएँ · Month view` toggle (left, `interSemiBold` 11 `saffron-deep`, padded + hitSlop to the 44pt floor; a11y `Expand calendar`/`Collapse calendar` — the smoke flows full-string match it, so the label lives only here; tapping the date block toggles too) and the `आज · Today` reset pill (right — it returns the user to the current date after browsing, always rendered). Tapping either expand affordance opens an inline month grid — weekday row (Inter **10**), **six rows of seven `flex: 1` cells** (min-height 38, radius 8; never one wrapping 42-cell row divided by a `100 / 7` percentage width — Yoga resolves percentages in 32-bit float, so seven such cells can sum to a hair over the container and drop the seventh onto the next line, laying out six columns under the seven-column header and sliding every date off its weekday: on a 390 dp iPhone 15 Aug 2026, a Saturday, read as मंगलवार. Fixed Aug 2026; `calendarWeeks()` in `panchang/calendarGrid.ts` chunks the month and `calendarGrid.test.ts` pins column index == `getDay()`), selected day `saffron-tint` + `saffron` border, today `gold` border, and **10 pt** observance tags per day (`पर्व` on `saffron-tint`, `व्रत` on `gold-tint`, `व्रत+` when mixed; tag box `minWidth 28 / minHeight 16 / radius 8`, line-height 14). Both were below the §3.0 floor until July 2026 (9 and 7); the tag box grew from 24×12 to fit, and its label now goes through `pillTextStyle` — it had named Inter, which has no Devanagari glyphs for `व्रत`. A horizontal swipe anywhere on the card (dx > 54, mostly-horizontal) steps one day.
4. **Day panel** (the panchang proper, once computed — an `ActivityIndicator` in `saffron` while the day is derived off the render path):
   - *No standalone date header* (removed Aug 2026): the vara · date · संवत् · paksha line lives as the calendar card's subtitle (item 3 above), so the day panel starts with the Muhurat glance card.
   - *Muhurat glance card* (`MuhuratGlanceCard`, PRD-14): the `cardActiveFrom → cardActiveTo` gradient hero, promoted to lead the day panel (directly under the calendar card, **above** the anga grid) — "is now auspicious?" is the live, time-sensitive answer users open Panchang for. Kicker row (Aug 2026): the `आज का मुहूर्त` eyebrow (`cardLatin` for en; script-bold serif, no tracking, for hi/gu/kn — Cormorant has no Indic glyphs, §3) on the left, and the **running tithi** right-aligned opposite it — a 10 pt `saffron-deep` `तिथि · ` eyebrow tag + the tithi name at 14.5 `ink` (title face) + a quiet 11 pt `ink-soft` `तक H:MM` end instant when this day's solve knows it (`formatEndInstant` short-date suffix on past-midnight ends; the तक line takes the script body face outside English — Cormorant has no Indic glyphs, §3). Baseline-aligned with the eyebrow, shrink-to-fit to 0.8. Beneath that line, when the sunrise tithi hands over **within the same civil day**, a quiet 10.5 pt `ink-muted` **handover line** — `फिर <tithi> — शेष दिन` / `then <Tithi> — rest of day` (`successorTithiToday()` in `panchang/prevailingTithi.ts`, pure). It is a second line, not an extension of the first, so neither has to shrink to fit both. `तक 8:51 AM` alone states when the day's label stops being true and never what is true for the remaining fifteen hours — the gap that made a Chaturthi vrat look like it belonged to the next date the almanac heads चतुर्थी (Aug 2026 report). The helper returns null — never a misleading name — when the tithi runs past the next sunrise, when it ends after midnight (the तक line already carries that date), and on kshaya days (the tile renders both tithis already); it is also suppressed once a today surface's live kicker has itself moved on to the successor. The tithi is the one calendar fact promoted into this first-viewport hero (the anga grid it belongs to sits past the fold on most phones), and on a today surface it is **live**: `prevailingTithi()` (`panchang/prevailingTithi.ts`, pure) walks sunrise tithi → kshaya tithi → successor-by-index on the minute tick, so past the end instant the kicker names the tithi actually running now — the successor renders name-only because its end belongs to the next day's solve, never a guess. Browsed dates keep the sunrise (udaya-vyapini) tithi. Renders only once the day's solve lands (the skeleton keeps a bare eyebrow); the anga Tithi tile below stays the canonical sunrise-tithi + kshaya detail. Then a hero "now" row (current choghadiya + quality tag when `isToday`, else the day's Abhijit) with, on a today surface, a **4pt live progress strip** under the `तक` line (`saffron` fill on `divider` track, `accessibilityRole="progressbar"` with a percent `accessibilityValue`; the `useMuhurat` minute tick advances it), and — **while the running period is त्याज्य only** — an **`अगला शुभ` row** (gold 8pt dot + `अगला शुभ: <name> चौघड़िया` in the title face + the start clock in Cormorant SemiBold `saffron-deep` + a script `से` suffix outside the Latin face, §3): the inauspicious "now" answers "when is it good next?" inline, from the pure `nextAuspiciousPeriod()` helper in `panchang/muhurat.ts` (null late at night when nothing auspicious remains — the row then hides). Then a two-up `राहु काल` / `अभिजीत` tile pair, and a `सभी मुहूर्त व चौघड़िया →` footer → `MuhuratDetail`. While its own `useMuhurat` solve is in flight it shows a **skeleton** in the same gradient card (kicker text + muted `divider`/`parchment-soft` placeholder bars sized to the real hero row, tile pair, and footer, `accessibilityRole="progressbar"`), so the section reserves its footprint instead of popping in below the day panel. The solve comes from the shared **`panchangDayStore`** (per `locationKey` + calendar system, keyed by absolute civil date, persisted — §60), so revisiting a date, re-mounting the card, a day the Muhurat Finder already swept, and a cold app start all render instantly with no skeleton; only the live "now" read recomputes each minute. `useMuhurat` owns no cache of its own — `MuhuratDay`/`nowPeriods` are re-derived per call because they are pure arithmetic over the three cached days. **Times, ranges, and the quality chip use the non-italic semibold/bold Cormorant face, never the thin italic `cardLatin` (§3), and the chip sits on `avoidChipBg`/`goldChipBg` so it reads as a solid pill on the gradient (§12); avoid-chip text uses `avoidDeep` — the tint composites darker than the card, dropping raw `avoid` under AA (§2).**
   - *Anga grid, uniform 2×2*: Tithi · Nakshatra · **Nitya Yoga** · Karana each render on identical elevated tiles (`parchment-soft`, `radii.md`, `elevation.card`) — one size, no prominent/secondary split. Each tile: a **10 pt** `saffron-deep` type label (tracked uppercase Cormorant in English; plain script serif otherwise — was 9, below the §3.0 floor, until July 2026), the value in the active reading language only at 18 pt `ink` (single-line, `adjustsFontSizeToFit` down to a 0.8 scale so the longest name — "Uttara Bhadrapada" — fits without truncation), and `till H:MM AM/PM` when the anga ends that day. No second cross-script line. End instants that fall past midnight carry a short-date suffix (`तक 2:04 AM, 12 जुल` — `formatEndInstant` in `panchang/muhuratFormat.ts`, shared with the Muhurat card) so a next-day end never reads as this morning; panchang convention shows end times only (an anga's start is the previous one's end, usually on the previous day). On **kshaya** days — a tithi or nakshatra that begins after this sunrise and ends before the next, touching neither (e.g. Ekadashi on 10 Jul 2026) — the Tithi/Nakshatra tile adds a second row: the skipped anga's name at 15 pt `ink` plus its own `तक` line, so the day reads `दशमी तक 8:16 AM · एकादशी तक 5:22 AM, 11 जुल` instead of Ekadashi silently vanishing between Dashami and Dwadashi. Data: `PanchangData.kshayaTithi` / `kshayaNakshatra` (engine-detected via the sunrise-to-sunrise index jump). The **Tithi tile alone** carries the same 11 pt `ink-muted` **handover line** as the glance-card kicker (`फिर <tithi> — शेष दिन`, `successorTithiToday()`) under its `तक` line, on the identical null rules — the tile headline stays the sunrise (udaya) tithi the almanac names the day by, and the handover says who holds the rest of it. No other anga carries it. **The yoga tile is labelled नित्य योग / Nitya Yoga, never bare योग** (PRD-27, RULEBOOK §24): the 27-cycle Sun+Moon yoga — one of which is literally named सिद्धि — must stay distinguishable from the शुभ योग card directly below it.
   - *शुभ योग card* (`ShubhYogaCard`, PRD-27 — §69): directly under the anga grid, **only on days a shubh yoga forms** — zero chrome otherwise (present-or-absent is the entire vocabulary; no empty state, no "no yoga today" copy). A `parchment-soft`/`divider`/`radii.lg` card: a `शुभ योग` eyebrow, then one row per window — the shared `MuhuratChip` (yoga tone: `goldChipBg` + `saffronDeep`, full "… योग" name) with the window range right-aligned (Cormorant SemiBold for en; the script body face otherwise, because `formatEndInstant`'s past-midnight short-date suffix is Devanagari — the anga-tile face rule). Windows run nakshatra-to-nakshatra via `useShubhYoga` → `computeShubhYogas` (store-backed, no private cache); the 26:12 extended-hour style is never used.
   - *Times card*: 2×2 grid — Sunrise, Sunset, Moonrise, Brahma Muhurta — each a `gold` ☀/☽ text-presentation glyph (variation selector forces monochrome; "no emoji") + 10 pt label + Cormorant SemiBold 13 value.
5. **व्रत और पर्व** for the selected date: `ObservanceCard`s (`parchment-soft`, `radii.md`, `elevation.card`) with a category pill (`व्रत` on `gold-tint` / `पर्व` on `saffron-tint`), deity, name — for `sankashti-chaturthi-vrat` the title is the **occurrence's published name** (`sankashtiOccurrenceName` in `panchang/sankashtiNames.ts`: the purnimant-month Ganapati form, e.g. `हेरम्ब संकष्टी चतुर्थी व्रत` on the Bhadrapada day, `विभुवन` in an adhik lunation, `(अंगारकी)` appended on a Tuesday; resolver failure falls back to the rule name, and list/search/detail surfaces keep the rule name) — short description, a **moonrise-vrat line** on `dayRule: 'chandrodaya'` rules only (12 pt `saffron-deep`: `व्रत इसी रात्रि — चंद्रोदय H:MM, दर्शन व अर्घ्य के बाद पारण` / `Kept this night — moonrise H:MM, parana after darshan and arghya`, from the selected day's `PanchangData.moonrise`; absent when the day has not solved). Such a vrat is kept through a night, not a calendar box — its tithi usually ends the next morning — so the card names the instant the fast is actually broken instead of leaving the reader to reconcile `व्रत` with a तिथि line that ends before noon. Then the action pills — `॥ पूजा विधि` (**filled `saffron`** pill, `parchment` text — renders only when the rule's `vidhiId` resolves in `VIDHI_BY_ID`; → `VidhiDetail` with the selected date, §61), `कथा पढ़ें · Read Katha` (gold-tint pill → katha reader) and `पढ़ें: <section>` (outline pill → the linked text via `buildEntryStartTarget`, §38). The vidhi pill leads the row: it is the day's *performed* action, the others are readings. Below the cards, on a saved पितृ स्मरण observance date only, the private muted **"॥ स्मरण — <relation>"** chip (`PitruSmaranDayChip`, `goldTint` fill + `gold` border + `inkSoft` text — never the festive pill style; device-only) → that person's detail (§62).
6. **आगामी · Upcoming** rows: coloured marker dot (`saffron` star-tier / `ink` halfmoon / `gold` default), short date, name.

**Muhurat Finder door** (`MuhuratFinderDoor`, PRD-16 §60) — one shared `ListCard` in its **`flat` variant** (`parchment-soft` on a `divider` border — Aug 2026: the gradient is reserved for the live glance card directly above, so the door no longer reads as part of it) with a नया/NEW badge, inserted **between the glance card and the anga grid**: "is now auspicious?" readers are the users with a date decision to make. Leading thumb: a **drawn sunrise glyph** (sun ring + three rays over a horizon bar, View-strokes like the §17 tab icons — no emoji, §5) in `saffron-deep` on a 46pt `saffron-tint` disc, replacing the gradient मु letter tile. It pushes `MuhuratFinder` in the same Panchang stack; nothing above or below it moves.

**Muhurat Detail** (`MuhuratDetailScreen` → shared `MuhuratCardBody`, reached from the glance-card footer — and, for a specific chosen day, from the Muhurat Finder day detail and Abujh rows, §60) — the gold-॥-framed panchang card (§5): panchang + sun rows, then the full 8+8 day/night choghadiya table and अभिजीत/राहु/गुलिक/यमगण्ड rows. The panchang rows use the same `formatEndInstant` next-day suffix as the anga tiles, and kshaya days add `क्षय तिथि` / `क्षय नक्षत्र` rows so the card (and its share PNG) never disagrees with the tiles. The yoga row is labelled **नित्य योग** (the PRD-27 collision rule, §69), and — full variant only, like the नित्य योग/करण rows themselves — a **शुभ योग** row per present yoga follows it (`<full name> · <window>`; end-only when the window opens at sunrise, start–end on a mid-day onset; derived per render from `computeShubhYogas(p, md.nextSunrise)`, never cached). Each is a quality-tinted `Muh` row (`goldTint` auspicious / `avoidTint` avoid) with the currently-running period ring-bordered in `saffron` + an `अभी` badge. **Name and time render in dark `ink`/`ink-soft` on both qualities** — the tint plus a small signal-coloured `· शुभ/त्याज्य` text tag carry the quality (§12, never colour alone); the text is never itself tinted-down (terracotta-on-`avoidTint` was muddy ~4.8:1). The quality tag, time range, and now-badge use the **non-italic semibold Cormorant face, never the thin italic `cardLatin`** (§3) — the same readability fix as the glance card. The card title (top bar + `MuhuratCardBody` heading) is **`आज का पंचांग` only when the date is today** (`useMuhurat().isToday`); a specific finder/abujh-selected day reads **`इस दिन का पंचांग`** so it never claims to be today while the dateline shows a different day. The same body renders the shareable PNG (`variant="share"`, captured off-screen).

**Catalog view** (`व्रत-पर्व` tab): a search field (44 high, `radii.md`) over `searchObservances`; a pinned **My Vrat** row (`gold-tint` fill, 1.5 px `gold` border); an **Upcoming** horizontal card rail (compact 136×72 pt cards, `radii.md`: category glyph ॐ/☾/✺ + uppercase date tag on top, one-line primary-language name beneath — no category caption); and a 2-up **Browse by type** grid of slim 60 pt half-tiles (`radii.md`, glyph in a 34 pt `saffron-tint` roundel inline-left; primary-language title 15 pt + live count — no secondary-language echo line): व्रत / पर्व / उपवास plus a **कथा** tile (॥ glyph, `getKathaCount()` stories) → Katha Library and a full-width **पूजा विधि** tile (॥ glyph, `VIDHI_ENTRIES.length` count) → the Vidhi Catalog (§61) — the vidhi's always-available door, since the day-panel pill is date-dependent.

**Observance List** (`ObservanceListScreen`) — category drill-in over the Home gradient, sorted soonest-first by next occurrence. Each row: a leading follow star (`gold` ★ filled / `ink-muted` ☆ outline, toggles without opening the detail), name + other-language caption, and right-aligned next date + relative label (`today` / `1d` / `Nd`). In-list search field on top.

**Observance Detail** (`ObservanceDetailScreen`) — hero (category pill + deity, name at 24 pt centred, other-language caption, and a `saffron-tint` "अगला · Next · date · in N days" pill), then an action row: **Follow** (outline `saffron` pill; fills `saffron` with `parchment` text when following — following also feeds vrat reminders, §38) and **॥ Read Katha** (filled `saffron`). Following shows a transient (3.5 s) `gold-tint` "Added to My Vrat — View →" bar. Below: **महत्व · About** prose, a katha card, and — **last on the page** — the single **"How to observe" home** (PRD-09 Phase 4 §65 composed with PRD-19 Phase 2B), in four states keyed off a verified upvas entry (`upvasId` → `getUpvasInfo`, verified-only) and a resolving `vidhiId`: **(1) upvas only** → `उपवास विधि · How to observe` heading + the §65 fast-facts panel; **(2) vidhi only** → exactly the shipped `पूजा विधि · How to observe` block, unchanged — the same card shell as the katha card (`parchment-soft`, `divider`, `radii.lg`, `elevation.card`) with a saffron ॥ glyph, the vidhi's bilingual title, a `N चरण · लगभग M मिनट` meta line, and › — tap → `VidhiDetail` (§62) carrying the next occurrence's `dateMs` so the samagri checklist keys to the right festival date; **(3) both** → the `उपवास विधि` heading, fast facts first, and the vidhi card beneath them inside the same panel, its meta line prefixed `पूजा विधि · ` so the card keeps its own identity; **(4) neither** → no section at all. There is never a "coming soon" placeholder here — the parent PRD-09 §6.2 placeholder slot is retired.

**My Vrat** (`MyVratScreen`) — the personal ledger: a three-cell metric band (`Following · Reminders on · This month`, Inter 22 `saffron-deep` values), a "🔔 Reminder defaults" row, the **My priority** list (rows in follow order with next date and a bell button per vrat), and an **Upcoming** timeline among followed vrats. Empty state: large `gold` ★, "अभी कोई व्रत नहीं / No vrats yet", and a filled `saffron` "Browse व्रत-पर्व →" pill.

**Vrat Reminder Sheet** (`VratReminderSheet.tsx`) — bottom sheet for per-vrat or global-default reminder prefs. Implemented as an **in-tree absolute overlay** (not a transparent RN `Modal`) over `modal-backdrop`, so VoiceOver and the Maestro e2e snapshot can read it. Grab handle (40×5, `divider`), then three option rows: *Advance notice* pills (`Off / 1 / 2 / 3 days` — evening before), *On the day* Switch (`saffron` track), *Day-of time* pills (`07:00 / 08:00 / Sunrise` — Sunrise is a labelled 06:00 proxy in v1). Selected pills fill `saffron` with `parchment` text; a filled `saffron` **Save reminders** pill commits. State lives in `VratFollowContext` (`@vedansh/vrat-follows` + `@vedansh/vrat-reminder-default`; built-in default = 1-day advance + 07:00 day-of).

**Katha Library** (`KathaLibraryScreen`) — searchable list of every bundled bilingual katha: ॥ glyph, title, `<n> sections` caption, `पढ़ें · Read` affordance.

**Vrat Katha Reader** (`VratKathaReaderScreen` + `KathaSectionPage`) — lives in the **Home stack** (`VratKathaReader` route; Panchang surfaces navigate cross-tab to it) and is currently the **only route in `IMMERSIVE_HOME_ROUTES`** (`TabNavigator.tsx`), so the bottom tab bar hides for immersive reading. Plain `parchment` (no sketch). Top bar: **`ReaderHeader`** (§9) — 44 px back circle · katha title · `n / m` counter; then `ReadingProgressBar` and the Language Toggle (§16). Until July 2026 this screen was the most-drifted top bar in the app: a 40 px button, a 16 gutter and a hard-coded 18 title, all of which the shared header replaced. Body: a horizontal paged `FlatList` of section cards — each page carries a `प्रसंग · n/m` / `Part · n/m` pill (`versePill` tokens on `saffron-tint`), section title at 20 pt, a vertically-compressed `॥` Ornament, and body paragraphs at the shared `meaning` token (14 pt paragraph gap); long sections scroll vertically inside the page. §5 pager dots overlay the bottom; light haptic per page.

**Location Picker** (`LocationPickerModal.tsx`) — a `pageSheet` modal on plain `parchment`: title `स्थान चुनें · Choose location` + ✕; a "📍 Use my location" row (GPS fixes **snap to the nearest pincode centroid, or the nearest bundled city when that is closer** — see the tier table — with denied/error fallback copy); a search field taking **a city name or a 6-digit pincode**; and the location list with a `saffron-deep` ✓ on the selection. Location state (`PanchangLocationContext`, `@vedansh:panchang-location`, default **Ujjain**) is the single reference for every location-sensitive computation; changing location warms that location's observance cache after interactions settle.

The list is **two browsable tiers**, rendered as one `FlatList` under two group headers (12 pt, `ink-muted`, `letterSpacing` 0.4, 14/4 pt padding, script title face), plus a **third, search-only pincode tier**:

| Group header | Source | Count |
| --- | --- | --- |
| `प्रमुख शहर · Major cities` | `MAJOR_CITIES` (`panchang/locations.ts`) | 52, Ujjain first (it is `DEFAULT_LOCATION`) |
| `राजस्थान · तहसील` / `Rajasthan · tehsils` | `RAJASTHAN_TEHSILS` (`panchang/rajasthanTehsils.ts`) | 342 across all 33 revenue districts |
| `पिनकोड · Pincode` | `pincodeData.json` via `panchang/pincodes.ts` | 18,466 nationwide — **never browsable**, surfaced only by an exact 6-digit query |

- **The pincode tier is deliberately not a browse list.** 18k rows is not a list anyone scrolls, and — decisively — neither source dataset carries Devanagari place names, so these entries cannot satisfy the `nameHi` contract every `City` row has. Typing a 6-digit code replaces the whole list with a single resolved row; a well-formed but unknown code renders an explanatory line rather than an empty list. Anything that is not 6 digits searches the two city tiers exactly as before.
- **Pincode row**: title line is `416001 · Maharashtra` (Devanagari digits and state name in Hindi/gu/kn — `४१६००१ · महाराष्ट्र`), caption is `<district> · <taluka>` in Latin, collapsed to one name when they are equal. The caption stays Latin in every language because inventing Devanagari spellings for 18k places would be worse than a script mismatch; the title line carries the Hindi. Selecting one stores `cityId: pin-416001`.
- **GPS picks whichever tier is genuinely closer**, never "pincode always". The geocoder's coverage is very uneven — 1 of 207 Jammu & Kashmir pincodes, 19 of 48 in Arunachal Pradesh — so a Srinagar fix finds its nearest pincode 156 km away in Doda while the bundled Srinagar entry sits on top of it. Ties go to the city, which is the better label.
- **The 700 KB table is lazily required** and never touches the launch path: it loads after interactions settle once this sheet opens. `panchangPrefs` (which *is* the launch path, see §60) therefore validates a stored `pin-` record structurally instead of looking it up: a `pin-` id skips the bundled-city rebuild and is range-checked field by field, so the record is self-describing on disk.

- **A tehsil is a `City` carrying `districtHi`/`districtEn`**; the national tier leaves both undefined, and the picker partitions the filtered list on that field rather than on an index. Groups whose filtered result is empty drop their header.
- **Row**: title line is the name in the current language + `· <district>` at 12 pt `ink-muted` (`numberOfLines` 1, `flexShrink`). Both halves are the same language, so one script face covers them — per §3.0 never mix a Devanagari district into a Latin caption. The caption line below stays the single-script cross-reference it always was.
- **Search** (`cityMatchesQuery`, exported from `locations.ts` and shared with the Kundali birth-city sheet) matches English name, Hindi name, and district in either script, so `alwar` surfaces all 21 Alwar tehsils.
- **The location chip (§ above) keeps showing the town alone**, not `town · district` — 12 pt in a pill has no room, and the picker's ✓ already resolves which same-named tehsil is active.
- **Birth-city sheet** (`KundaliScreen.tsx`) shares the same list, search predicate and `· district` caption, and is a `FlatList` rather than a mapped `ScrollView` — at ~390 rows, mounting every row stalled the sheet open.

---

## 34. Audio Tab (भजन) & Now Playing

**Purpose.** A small devotional audio library — recitations of existing texts plus standalone bhajans/aartis — with playback that persists across the whole app. The tab (`AudioTab` → `AudioStackNavigator`) holds a single `AudioLibrary` screen; the mini-player and the full Now Playing surface are **root overlays** mounted once in `App.tsx`, driven by `AudioPlayerContext`, not navigation screens.

**Data.** `data/audio/tracks.ts` is a pure catalog (`AudioTrack`: bilingual title, thumb grapheme, deity, `kind: 'recitation' | 'standalone'`, `linkedTextId`, nominal duration). Audio bytes resolve separately via `assets/audio-library/index.ts` — a track surfaces **only** when `hasRealAudio(id)` is true, so nothing appears without a recording behind it. [13 tracks defined, 10 bundled recordings today (`gayatri-mantra`, `hare-rama`, `govinda-hari-govinda`, `har-har-bhole`, `mahamrityunjay-mantra`, plus the standalone bhajans `govind-bolo`, `om-gam-ganapataye-namah`, `narayan-hari-hari`, `jai-nandlal-ki`, `krishnaya-vasudevaya`); the rest of the catalog is a labelled prototype Phase 2 curates. All bundled takes are 128 kbps 48 kHz stereo MP3 with no embedded cover art, keeping the library ≈21 MB.]

**Library screen** (`screens/audio/AudioLibraryScreen.tsx`), over the Home gradient:

1. Centred screen title `भजन` (reader-title face at 22, language-aware).
2. **Deity filter rail** — horizontal row of circular chips (§20 family): 54 px disc on the `cardThumbActiveFrom → cardThumbActiveTo` gradient with a `parchment-soft` Devanagari glyph, 11 pt label below; the selected chip gains a 2 px `saffron` ring on a `saffron-tint` pad. A leading `ॐ · सभी/All` chip clears the filter. Only deities that actually have an available track appear.
3. Sections with bilingual headings (`जारी रखें · Continue listening` when a track is loaded, `पाठ · Recitations`, `भजन व आरती · Bhajans & Aartis`), each a stack of `TrackCard`s.

**Track card** (`components/audio/TrackCard.tsx`) — the §8 catalog-card language on an audio row: `cardActiveFrom → cardActiveTo` gradient, `cardActiveBorder`, `radii.lg`, 18 padding; a 52 px deity-icon thumb on the thumb gradient; bilingual title via `orderTitlesByLanguage` (dev 17 / lat 19 primary); sub meta `पाठ · 8:14`-style (`cardMeta` size). The tail swaps the navigate chevron for a 38 px **play disc**: `saffron-tint` + `saffron-deep` ▶ at rest, filled `saffron` + `on-primary` ❚❚ for the currently playing track. Tapping a card plays the track and opens Now Playing.

**Playback state** (`AudioPlayerContext`) — one imperative `expo-audio` player for the whole session (unlike the component-scoped `JapamAudioPlayer`), so playback survives navigation. The session is configured for background audio via `audio/audioSession.ts`: `playsInSilentMode`, with the interruption mode branched per platform in the **single `interruptionMode` field** — `mixWithOthers` on iOS, `duckOthers` on Android. Android must NOT rely on `interruptionModeAndroid` (expo-audio resolves `interruptionMode ?? interruptionModeAndroid`, so the iOS value overrides it) and must not use `mixWithOthers` (expo-audio then never requests audio focus, and Android 12+ force-mutes focus-less players when another app holds focus — the "silent playback on Android 16 devices" bug). Exposes position/duration, ±15 s skip (`SKIP_SECONDS`), next/previous across the playable set, loop, rate 0.5–1.5×, and `nowPlayingOpen`.

**Auto-advance.** A finished track rolls straight on to the next one in the playable set — the library plays through without a tap, and the loop/repeat toggle is what opts out of it (repeat on = the native `loop` flag restarts the same track, so no advance). The ending is detected from `didJustFinish` **or** a reported position within `END_EPSILON_SEC` (0.35 s) of the duration while stopped, because `didJustFinish` isn't emitted uniformly across platforms (same caveat the japam bead counter works around, §35); a latch fires the advance exactly once per ending and re-arms as soon as playback moves off the end (resume, seek back, or a new source). Unlike the manual ◀◀/▶▶ buttons, auto-advance does **not** wrap: at the end of the library playback stops rather than cycling the catalog indefinitely in the background.

**MiniPlayer** (`components/audio/MiniPlayer.tsx`) — rendered once at the app root; appears whenever a track is loaded and floats over every tab/stack. Docks just above the tab bar (bottom = 60 + safe-area inset + `spacing.xs`; inset `spacing.lg` each side) — mirroring the RoutineBanner's docking (§30). Card: `parchment-soft`, `divider` border, `radii.lg`, upward shadow; 40 px deity thumb on the thumb gradient; title (reader-title face at 15) over a 3 px progress strip (`saffron` fill on `divider` track); then ▶/❚❚ (`saffron-deep`) and ✕ (stop & dismiss) buttons at 36 px. Tapping the body expands Now Playing.

**Now Playing** (`screens/audio/NowPlayingScreen.tsx`) — a full-screen `parchment` overlay (absolute-fill, mounted app-wide in `App.tsx`; no navigation plumbing), shown when `nowPlayingOpen`:

- Header: ⌄ minimise circle · uppercase `Now Playing` label (swipe-hint face) · spacer.
- Artwork: a 220 px `parchment-soft` framed square with the deity vector at 150 (or a 96 pt `saffron` ॐ fallback).
- Title at 26 centred (reader-title face), subtitle `<artist/kind> · <deity>` in Cormorant italic `ink-muted`.
- Seek bar: 4 px `saffron` fill on `divider` track, tap-to-seek; lining time labels either side (Cormorant SemiBold 15).
- Transport row: `−15 · ◀◀ · [▶/❚❚] · ▶▶ · +15`; the play button is a 72 px `saffron` disc with `saffron-deep` rim and `on-primary` glyph.
- Secondary row: a 44 px ⟳ loop toggle (kept for mantra japa) — outline at rest, filled `saffron` when looping. It doubles as the **repeat-one** control: while it is on, a finished track restarts instead of auto-advancing to the next one.

**Reader entry point.** Readers whose text has a linked recitation with real audio (via `getTrackForText` + `hasRealAudio`) show a small `saffron-deep` **▶** in the top bar after the page counter (`ChalisaReaderScreen.tsx`); tapping plays the recitation and opens Now Playing — the structural "audio hook" §9 reserved. Since July 2026 that `▶` is joined by the **read-aloud** control (§56), which speaks the text with the device voice for the many sections that have no recording. The two are **mutually exclusive**: both claim playback through `src/audio/playbackArbiter.ts`, so starting one silences the other — load-bearing on iOS, whose session is configured `mixWithOthers` and would otherwise play both at once. Read-aloud deliberately has **no mini-player and no lock-screen surface**: `expo-speech` exposes no media-session API, so it stays reader-scoped and stops when the app backgrounds.

---

## 35. Japam (जप)

**Purpose.** A mantra-counting practice surface: tap (or let the audio loop count for you) through 108-bead rounds of a chosen mantra. Mantras are first-class library entries (`category: 'japam'` in `texts.ts`, sourced from `data/japam/japam.json` — 4 mantras today: ॐ नमः शिवाय, हरे कृष्ण महामंत्र, गायत्री मंत्र, ॐ नमो भगवते वासुदेवाय), so they surface through the normal catalog/deity/search flows; `buildEntryStartTarget` routes a japam entry straight to `JapamCounter` (Home stack, lazy-loaded).

**Counter screen** (`JapamCounterScreen.tsx`). Layer stack: parchment · per-mantra sketch (`getSourceBackground`) · content.

1. **Top bar**: 44 px back circle · mantra title (language-aware) · a 34 px ⏰ alarm button (opens the shared `AlarmEditorSheet` pre-locked to this mantra) · Share button.
2. Language Toggle row (§16).
3. **Tap surface** — the whole remaining column is one large Pressable (inside a ScrollView so a large-type mantra scrolls rather than clips; pressed state dims to 0.92):
   - Mantra lines, centred, at the shared `verse` token (23/39; Latin languages use Cormorant italic scaled by the reading-size factor, §44).
   - `॥` Ornament.
   - **Count block**: the current bead count as a huge `saffron-deep` numeral — 88 pt (76 on screens under 720 px tall, 64 under 640) — over `/ 108 बीज` in the page-counter face; a 6 px round progress track (`saffron` fill on `dot-rest`) showing progress through the round; `N आवृत्ति` rounds line (reader-title face at 16).
   - Italic hint `जप के लिए स्पर्श करें · Tap to chant` (swipe-hint token).
   - Each tap = one bead with a light haptic; completing a round (bead 108 rolls the counter) fires a success haptic. Counts persist per mantra in `JapamCounterContext` (`@vedansh/japam-counter`). `JAPAM_BEADS_PER_ROUND = 108` (`data/japam/index.ts`).
4. **Audio row** (`components/JapamAudioPlayer.tsx`, above a `divider` hairline): an auto-chant loop of the mantra recording (`assets/japam-audio`). A `▶ चलाएँ / Play` pill (fills `saffron` while playing) and a **Tempo** stepper (− / 1.0× / +, range 0.5–1.5× in 0.1 steps, pitch-corrected). The clip loops natively and the bead count advances with the chanting: a single-recitation clip registers **one bead per completed loop** (loop-wrap detection on the reported position — reliable where `didJustFinish` isn't), while a musical rendition declares how many times it chants the mantra (`repetitions` in `assets/japam-audio`) and registers **one bead per repetition segment**, so a multi-minute kirtan doesn't count as a single bead. `autoPlay` starts the loop immediately when arriving from an alarm tap (§38) and **auto-stops after 30 s** (`ALARM_AUTO_STOP_MS`) so the alarm rings the mantra from the shared recording then falls silent rather than looping forever — reusing the same bundled mp3, with no separate size-adding alarm clip; any manual play/pause cancels the cap so a real chanting session isn't cut off. Mantras without a bundled clip show an italic "Audio not available" notice instead. Bundled today: `om-namah-shivaya` (own single-recitation clip, 1 bead/loop) plus `hare-krishna-mahamantra` and `gayatri-mantra`, which reuse the Audio-library rendition takes (`assets/audio-library/hare-rama.mp3` ≈4 reps — the 2:14 mahamantra rendition, `gayatri-mantra.mp3` ≈6 reps) via a relative `require` so the mp3 is bundled once rather than duplicated. The per-file `repetitions` counts are cadence estimates — tune them if a round drifts from 108 beads.
5. **Actions row**: two outline buttons — `बीज पुनः ० · Reset Beads` (`cardActiveBorder`, `saffron-deep` text; zeroes the current round, keeps completed rounds) and `सब साफ़ · Clear All` (`divider`, `ink-muted`). Both confirm via a centred modal card over `modal-backdrop` (title + italic body + filled `saffron` confirm + cancel). Disabled at 0.4 opacity when there is nothing to reset.

**Mantra selection.** There is no dedicated picker screen — the japam category tile / deity lists / search / routine items open the counter for a specific mantra; the alarm editor's mantra picker (below) is the one in-flow chooser.

**Alarms** (`JapamAlarmsScreen.tsx` in the More stack, `JapamAlarmsContext`, cap `MAX_JAPAM_ALARMS = 8`, persisted at `@vedansh/japam-alarms`):

- List screen over the Home gradient: intro line ("Wake to the mantra you chose, at the time you chose."), a permission banner when notifications are denied (tap → system settings; "denied" is the **effective** status of §38 — never a fresh Android install that hasn't been asked yet), alarm rows (`parchment-soft`, `radii.lg`: the time in the reader-title face — 12 h or 24 h per the device locale via `prefers12HourClock()`; a11y labels stay 24 h — mantra name, a repeat line "`Daily / Once / Weekdays / Weekends / day list` · `in 7 hr 25 min`" (live 30 s tick) plus "skips ‹date›" while a skip is pending, optional uppercase label, and a `saffron` Switch), and an outline `+ Add alarm` button. (No privacy footnote — implementation-detail messaging like "nothing goes to the server" is deliberately not shown anywhere in the app.)
- **AlarmEditorSheet** (exported and reused by the counter's ⏰) in a fade modal, internally scrollable (`maxHeight` 88 %): `TimeStepper` at **1-minute** steps (a chevron steps once per tap on press-release; the auto-repeat starts from **long-press** — 350 ms, then every 90 ms — so a scroll drag that begins on a chevron never mutates the time), a **Repeat** row of seven 38 px circular day chips (S M T W T F S; all on = Daily, none = Once — the summary line then warns "turns off after ringing"), the mantra picker (locked when opened from a counter), a **Label** `TextInput` (40 chars, optional), an edit-mode-only **Skip next** toggle chip showing the date it would skip, and a live "Rings in …" preview line above the filled confirm button (a11y label `Confirm alarm`).
- **Model** (`notifications/japamAlarms.ts`): `repeatDays?: number[]` (getDay() indices; absent = daily, `[]` = one-time, subset = weekly) and `skipNextDate?: 'YYYY-MM-DD'`. Pure helpers: `nextAlarmFireTimestamp(s)` (honours days + skip), the shared skip plan (`isSkipPending` / `skipOneshotPlan` — one pendency predicate and `:occN` id scheme for every tier), `repeatSummary`, `describeUntilFire`, `formatTimeLabel`, `prefers12HourClock`. The context clears `skipNextDate` whenever time/repeat change, prunes past skip dates on load/foreground, and **auto-disables fired one-time alarms** via the scheduler's once-armed bookkeeping (`firedOnceAlarmIds`; merge semantics — a past armed timestamp is evidence the alarm rang and is never overwritten, and a fired one-time alarm is never re-armed).
- Scheduling (`notifications/japamAlarmScheduler.ts`) is tiered: Android uses the native module (`AlarmManager.setAlarmClock` + a high-importance lock-screen notification with the mantra sound on the **alarm stream** — `USAGE_ALARM` audio attributes, so it rings through vibrate/silent and follows the alarm volume slider like the Clock app, matching AlarmKit's override-silent semantics on iOS — and **Stop / Snooze 5 m** actions — survives Doze and reboot; the user-controlled `SCHEDULE_EXACT_ALARM` access is requested through the screen's explanatory **Alarms & reminders** banner, otherwise Android falls back to an inexact Doze-tolerant alarm; the app deliberately does not declare Play-restricted `USE_EXACT_ALARM` or `USE_FULL_SCREEN_INTENT`; the Kotlin receiver re-arms the next *repeat day* after each fire, never for one-shots, dismisses by the exact posted notification key, and suppresses a snooze fire whose base alarm is no longer armed); iOS 26+ uses AlarmKit (weekly recurrence on the selected days, `.fixed` one-shots for Once, native **Snooze** countdown button; reconcile leaves a mid-countdown alarm untouched so opening the app never swallows a snoozed re-ring; a bare `repeatDays: []` means one-shot on both platforms); older iOS / Expo Go falls back to `expo-notifications` — DAILY trigger for daily, one WEEKLY trigger per selected day, DATE one-shots for Once, all under a `JAPAM_EXPO_SLOT_CAP = 24` pending-slot budget (whole-alarm granularity, soonest-first) so japam can't crowd the daily-verse window out of iOS's 64-pending cap, plus a `japam-alarm` notification category carrying a **Snooze 5 min** action (`maybeHandleJapamSnoozeResponse`, wired in App.tsx on the **live listener only** — the cold-start "last response" is ignored so a stale snooze tap can't schedule a phantom ring). A pending skip-next on recurrence-owning tiers is armed as discrete one-shots — `ALARMKIT_SKIP_ONESHOT_COUNT = 7` / `EXPO_SKIP_ONESHOT_COUNT = 4` — and reverts to plain recurrence on the next foreground reconcile. `scheduleJapamAlarms` is idempotent and **serialized** (concurrent reconciles chain, last caller wins) — cancel-then-reschedule on any change; in-flight `:snooze` one-shots for live alarms are spared while orphaned ones (alarm deleted/disabled) are cancelled. Tapping the alarm deep-links into the counter with `autoPlay` (§38).
- **Ring tune** (`assets/japam-alarm-sounds/index.ts`): the alarm rings the chosen mantra's own bundled clip — a ≤30 s mono 22.05 kHz PCM WAV resolved by `getJapamAlarmSoundName(mantraId)` on every tier (AlarmKit `.named()`, the Android receiver's `res/raw` lookup by underscored mantra id, and a per-mantra expo notification channel, since Android 8+ pins a channel's sound at creation). Android channels use **`-v2`/`:v2` ids** on both tiers: the v1 channels rang on the notification stream (muted by vibrate/silent and the notification-volume slider — the "no alarm volume on Android" bug) and a pinned channel can't be re-attributed, so the alarm-stream fix ships as fresh channels while the v1 ones are deleted on ensure. The Kotlin receiver's channel sound is a **name-based** `android.resource://<pkg>/raw/<name>` URI, never the int resource id (raw ids renumber across app updates and silently kill a pinned sound). Bundled today: `om-namah-shivaya` (single recitation, ~5.6 s) plus `hare-krishna-mahamantra` and `gayatri-mantra` (28 s loudness-normalised, faded excerpts cut from the Audio-library takes). A mantra without a clip (`om-namo-bhagavate-vasudevaya`) falls back to the system tone. A new clip must **also** be listed in `app.json` → `expo-notifications.sounds[]` — without that it isn't copied into the native bundles and the alarm silently falls back to the default chime. The bundled clip **filenames use underscores** (`om_namah_shivaya.wav`), not the hyphenated mantra id: `expo-notifications` copies each file into Android `res/raw/` verbatim and rejects hyphens at prebuild, so a hyphenated filename fails the Android build. The receiver bridges the two with `mantraId.replace('-','_')`.

---

## 36. Search

**Purpose.** On-device search across the entire library — sections, deities, and every verse — built from the same bundled data the readers load. No network, no service, no query logging; the index builds lazily on first open (`data/searchIndex.ts`).

**Entry point — floating button** (`components/SearchFloatingButton.tsx`). A 48 px circle, `parchment-soft` fill, 1 px `divider` border, holding a `saffron` ⌕ glyph at 26 (reader-title face). Anchored absolute at `right: spacing.xl`, `bottom: spacing.xl` (the default). It used to pass a banner-clearing offset on Home to sit above the docked RoutineBanner; since that banner moved inline (§30, July 2026) the FAB uses the default offset and keeps a positive `zIndex` so it stays above the scroll content. Currently rendered on Home only; tap → `Search` (Home stack).

**Search screen** (`SearchScreen.tsx`), over the Home gradient:

1. **Top bar**: 44 px back circle + a pill-shaped input row (`parchment-soft`, `divider`, `radii.md`, 44 high): `saffron` ⌕, the `TextInput` (Inter 500 at 15, language-aware placeholder "श्लोक, पाठ, मंत्र खोजें…"), and a ✕ clear button while typing. The input auto-focuses ~200 ms after mount.
2. **Empty state** (no query): *Recent* chips (last 6 queries, `@vedansh/search-recent`; pill chips with per-chip ✕ and a `Clear All` action) and a *Popular* 2-up grid of four fallback sections (Hanuman Chalisa, Gita, Sundarkand, Shiva Stotram) as thumb-glyph cells.
3. **Results** — grouped rows under `sectionLabel`-style headers with counts (`पाठ · Sections`, `देवता · Deities`, `श्लोक · Verses`):
   - *Section row*: Devanagari thumb glyph (`saffron-deep`), name in the active language, Hindi subtitle, `saffron` ›. Tap → the section's start via `navigateToEntryStart` (§38) — chalisa readers, chapters indexes, aarti/sanskar readers, the japam counter, or the Theerth map as appropriate. **Vidhi rows** (PRD-19 Phase 2B) ride this group too — one row per published vidhi (॥ thumb, `पूजा विधि · N चरण` subtitle); their sourceId is the vidhi id and tap opens `VidhiDetail` (§62) instead of a reader — pushed on the Home stack, which registers the vidhi flow alongside the Panchang one, so back returns to the search results.
   - *Deity row*: `gold` ॐ thumb; tap → `DeityList` filtered by that deity.
   - *Verse row*: the matched verse's first line in the verse face at 17, source · label meta in Cormorant italic; tap → **that verse in its reader** via `buildProgressTarget` (chapter + verse index), falling back to the section start.
   - Verse hits are capped at `VERSE_RESULT_CAP = 50`, with an italic "More results — type a more specific query" note when clipped.
4. **Zero state**: dimmed `॥`, "कोई परिणाम नहीं / No matches found", and a hint to try a Devanagari word or section name.

**Index coverage.** Sections (every active library entry **plus one row per published vidhi** — vidhis are procedures, so they contribute no verse entries), deities, and verses from every text module — the nine chalisas, aartis, japam mantras, Gita, Sundarkand, all stotram modules, Ramcharitmanas, Valmiki Ramayan, sanskar items, and the Theerth temples. Standard `lines`/`linesEn` shapes are picked up automatically when a section is added (RULEBOOK §7).

**Normalization** (`data/searchNormalize.ts`) — one pure fold applied to both index and query, so Devanagari and Latin queries meet in the middle: Unicode NFD with the combining nukta stripped (क़ ⇄ क), lowercase, IAST diacritics folded to ASCII (`kṛṣṇa` → `krsna`, so a plain-ASCII query matches the romanized corpus), punctuation dropped **including daṇḍa `।`/`॥`**, whitespace collapsed. Ranking is exact > prefix > substring per field (`MatchRank`), idempotent and unit-tested.

---

## 37. More Hub & Profile

**Purpose.** The settings-and-self tab (`MoreTab` → `MoreStackNavigator`: `MoreHome` → `Profile` / `Wishlist` / `Reminders` / `JapamAlarms`). One scroll over the Home gradient, **16 px gutters**, three grouped sections ~22 apart. **All hub chrome is single-language** (the selected reading language only) — bilingual pairing is reserved for actual reading content, never navigation/settings (V4 redesign).

**Hub** (`MoreScreen.tsx`), top to bottom:

1. **Title** — one left-aligned line, selected language only (`अन्य` / `More` / `અન્ય` / `ಇನ್ನಷ್ಟು`), 30 pt in the script's title face (`latinBold` for en, `scriptTitleFont` for hi/gu/kn). No `More` subtitle.
2. **Three grouped inset lists** — each is an uppercase **group label** (`saffron-deep`, 13; Latin gets tracking + uppercase via the chrome font, Indic drops both) above one **list container** (`parchment-soft`, **`radii.lg`**, 1 px `divider`, `overflow:hidden`, **`elevation.subtle`**) whose rows are split by hairline `divider` top-borders. Standard row anatomy: `[38 px icon tile, radii.sm] [label 18]  …  [state 15 ink-muted] [chevron › 19 gold]`. The container radius was an ad-hoc 20 and the icon tile 11, both off the radius scale (§4), with a hand-rolled shadow; all three are tokens as of July 2026, padding 15×16, pressed → `saffron-tint` wash.
   - **साधना / Practice** — a compact **profile hero row** (tinted `cardActiveFrom → cardActiveTo` gradient, 52 px circular `saffron` ॐ badge, `साधक प्रोफ़ाइल` title, sub-line "**`N`** श्लोक · **`N`** श्रृंखला" = lifetime verses + streak in `saffron`; the old `rounds` count is dropped; a11y "Open Sadhak profile" → Profile), then **संग्रह** (♥ `saffron`, state = saved count; label matches the WishlistScreen title → Wishlist §24), **स्मरण** (ॐ `gold`, state = reminder time(s) or Off → Reminder Settings §38), **जप अलार्म** (⏰ `saffron-deep`, state = active count → §35).
   - **ऐप / App** — **भाषा** (अ `gold`, state = current language's native name; opens the **Language picker sheet**, not an inline grid), **पाठ का आकार** (Aa `saffron`, state = मानक/बड़ा; opens the **Reading-size picker sheet**, §43), **पाठ सुनें / Read Aloud** (♪︎ `saffron-deep` at 15, state = what will be spoken + the rate via the exported `readAloudRowLabel`, or `उपलब्ध नहीं` when the device has no voice; opens the **Read-aloud settings sheet**, §56), **ऐप साझा करें**
     Both settings rows are also feature-tour spotlight targets (`languageRow` / `readingSizeRow`, §47 steps 23–24): each `SettingsRow` is wrapped in a measurable `View` and registers a `scrollNodeIntoView` reveal against the More `ScrollView`, since the App group can sit below the fold. The tour ends on them, and the post-tour setup sheet then asks the user to set both. (↗ `saffron`; OS share sheet via `buildAppShareMessage(lang)`, `data/shareLinks.ts` — the localized `APP_SHARE_INVITE` + `SMART_LINK`. The invite is a **multi-line feature list**, not a one-liner: a "complete bhakti in one app" lede, five `•` bullets — texts (Gita/Sundarkand/Chalisa/Aarti/Stotra), japa mala + alarms, Panchang (vrat-festival/muhurat/kundali/rashifal), bhajan audio + daily verse, nitya-sadhana routine — a four-script "read in" language line, then the download CTA with the smart link. Plain `•` bullets, no emoji per §5.), **ऐप को रेटिंग दें / Rate the App** (★ `gold` at 18, no state, a11y label constant "Rate the app") — the manual entry point for the rating sheet (§54): it calls `open()`, bypassing the auto-ask gate and spending no ask slot, and keeps working even after the user has opted out of the automatic prompt. Last in the group: **Instagram पर फ़ॉलो करें / Follow on Instagram** (◉ `saffron-deep` at 19, state = the `@vedansh.app` handle, a11y label constant "Follow on Instagram") — `Linking.openURL(INSTAGRAM_URL)` from the same `data/shareLinks.ts`, falling back to an `Alert` naming the handle if the OS can't open it. The link is the canonical `https://www.instagram.com/…` form, **not** `instagram://`: a custom scheme would need `LSApplicationQueriesSchemes` / `android.queries` in `app.json` (a store rebuild), whereas the https URL is claimed by the installed Instagram app via universal/app links and degrades to the browser otherwise — so the row ships over OTA.
   - **जानकारी / Info** — **परिचय व अस्वीकरण** (ⓘ `ink-muted`; opens the pageSheet disclaimer modal with the bilingual disclaimer + "Report an Error" CTA), **त्रुटि सूचित करें** (⚑ `ink-muted`; `mailto` via `buildDiscrepancyMailto`), and **ऐप भ्रमण फिर देखें / Show App Tour** (↻ `gold`; a11y label constant "Show App Tour") which calls `resetTour()` to replay the first-launch feature tour on demand (§47).

**Picker sheets** — `LanguagePickerSheet.tsx` and `ReadingSizePickerSheet.tsx` are bottom-sheet `Modal`s (slide up, `modalBackdrop`, grabber, `parchmentHighlight`) following the `AddToRoutineSheet` pattern. Language lists the four `LANGUAGES` as radios each in its own script; picking one applies it (`useGitaLanguage`, §16) and closes. Reading-size shows the M/L pills + the live "श्री राम जय राम" sample (§43) + a Done button; picking a size keeps the sheet open so the preview updates. The first-run setup sheet (§47) is the same two choices in one bilingual sheet, shown once after the walkthrough.

*Removed in V4:* the tall bilingual header + `More` subtitle, the big 3-stat profile card (→ compact hero row), the inline 2×2 language grid and inline reading-size card (→ rows opening sheets), and the Panchang methodology card (it duplicated the Panchang tab, §33).

**Profile** (`ProfileScreen.tsx`) — the साधक insights surface, fed by `UserActivityContext` (reads, japam beads/rounds, per-source and per-mantra tallies, all local):

1. **Identity card** (gradient, `radii.lg`): `saffron` ॐ crest, `साधक · Sadhak` name pair, hairline, and a three-cell footer — **day streak · active days · saved verses**.
2. **Range tabs** — a segmented pill `Lifetime / Monthly / Daily`; the active tab fills solid `saffron` with `on-primary` text. An italic range caption below.
3. **Stat tile grid** — four tiles: Verses Read, Beads Chanted, Rounds (Mala), Days Active.
4. **7-day trend** — a mini bar chart (`saffron` bars on `parchment-deep`-style tracks) of daily activity (reads + beads + rounds×108), weekday labels localized.
5. Per-source and per-mantra breakdown lists for the selected range, sorted by volume, with an empty state when the range has no activity.

---

## 38. Notifications & Deep Links

**Purpose.** All notifications are **local and on-device** — scheduled with `expo-notifications` (plus the native alarm tiers of §35); no server push. Four families, each owning an identifier prefix so cancel/re-arm cycles never touch each other's slots: daily verse (`daily-verse`), vrat reminders (`vrat-…`, PRD-09), festive reminders (`festive-reminder`), and japam alarms. **One OS permission grant serves all of them** — only the daily-verse and festive defaults ever request it, and the vrat/sadhana schedulers ride whatever the user already granted.

**Daily verse** (`notifications/scheduler.ts` + pure helpers in `pure.ts` / `seed.ts`; state in `NotificationPreferencesContext`, `@…/prefs` + meta in AsyncStorage):

- **Default on at 07:00.** Up to `MAX_REMINDER_TIMES = 4` times per day, edited in Reminder Settings (`ReminderSettingsScreen`: master Switch, per-time `TimeStepper` rows, add/remove up to the cap).
- A rolling **30-day window** (`ROLLING_WINDOW_DAYS`) is scheduled ahead, hard-capped at iOS's 64 pending-notification budget (`IOS_PENDING_CAP`, shared fairly across configured times). Idempotent cancel-then-reschedule on every relevant change and app foreground.
- **Deterministic verse per slot**: the local `YYYY-MM-DD` key is FNV-1a-hashed into the verse pool (`seed.ts`), so rescheduling never changes today's verse; multiple same-day times get distinct verses.
- **Localized by reading language** (§10): title `दैनिक भक्ति` / `Daily Verse`, body = first verse line + `source · label`, all rendered through the same language helpers the readers use — gu/kn arrive re-scripted, en romanized.
- **Panchang-aware title** (`notifications/dayAnga.ts` pure + `dayAngaResolver.ts` engine glue, fed by the headless `<DailyVerseAngaBridge>` in `App.tsx`). The title leads with the **fire day's** panchang context, then ` · ` + the base title: an observance day names its vrat/festival (`निर्जला एकादशी · दैनिक भक्ति`), an ordinary day its sunrise tithi with paksha (`शुक्ल एकादशी · दैनिक भक्ति`), and Purnima/Amavasya render bare since they name their paksha implicitly. **The body never changes** — the verse line stays the first thing read. One observance per day is chosen deterministically (`default` visibility only, ordered by `marker` significance → category → id), so a reschedule can never reword a day. Past `TITLE_MAX_CHARS = 38` the ` · दैनिक भक्ति` suffix is dropped whole rather than letting the OS slice a festival name or a Devanagari conjunct — the app name is already in the notification chrome. A day with no resolved anga falls back to the plain title, so a pending or failed solve is indistinguishable from the pre-panchang behaviour.
- **Why a bridge component**: notifications are baked at schedule time (up to 30 days ahead), so the whole window's tithi must be solved up front — per-day astronomy, which §33 established must never touch a render path, so the resolver runs behind `InteractionManager` and yields every 8 ms frame budget. Tithi is sunrise-anchored and therefore **location-dependent**, but `NotificationPreferencesProvider` sits *above* `PanchangLocationProvider`; `<DailyVerseAngaBridge>` mounts below both, resolves, and publishes up via `publishDayAngas(key, map)` — keyed by city + calendar system + day so a repeat publish is ignored and can't loop. Observances are skipped for any year whose location-accurate scan hasn't landed (`isObservanceDataReady`), because a festival name borrowed from Ujjain's calendar on another city's lock screen is worse than showing the tithi.
- **Opt-in modal** (`ReminderOptInModal.tsx`, mounted app-wide): a `pageSheet` — lede, a `TimeStepper`, a filled `saffron` **Enable**, and a quiet uppercase *Not now*. **Ask cadence (Aug 2026)**: reminders default on, and the ask repeats until the user has confirmed a yes or a no — then a "no" snoozes it. Concretely: (1) the provider fires the OS permission prompt on **every cold start** that finds the permission still unanswered (with the toggle on); (2) the sheet shows from the **first app open** whenever the reminder is off, on **every open while no "no" is on record**, and after a "no" it returns once **`OPT_IN_REOFFER_SNOOZE_DAYS = 15`** days have passed — each further "no" restarts the clock. (The count is bumped to ≥ 1 during hydration, so the `appOpenCount >= 1` gate offers on the very first launch — a change from the earlier "earn the ask" third-open gate.) A "no" is any of: refusing the OS prompt, tapping *Not now* / closing the sheet, or switching the reminder off in Reminder Settings — all three stamp `lastDeclinedAt` in the notif meta (the single record the gate consults; a "yes" needs no marker since the reminder being on holds the sheet closed). The sheet never shows while the OS is **hard-blocked** (`canAskAgain: false`) — its Enable button could not succeed, so that state belongs to the Reminders screen's Settings banner. It also waits out a **launch OS ask in flight** (permission unanswered with any notification toggle on — since festive reminders default on, that includes installs whose daily verse is off): the system prompt resolves first, then the sheet follows, so two asks never stack. `lastDeclinedAt` is deliberately absent on pre-cadence installs, so users the pre-fix Android builds silently opted out (see the permission-state bullet below) get re-offered on their first open after updating.
- **OS permission state — `notifications/permissionState.ts`** (shared by daily verse *and* japam alarms, §35, since the grant is app-wide). The module exists because `expo-notifications` reports a **never-requested** Android `POST_NOTIFICATIONS` as `denied` (it reads `areNotificationsEnabled()`, false until granted), so raw status alone cannot tell "never asked" from "user said no". It resolves an **effective** status from two extra signals: `canAskAgain` (false ⇒ hard block, Settings is the only path — Android < 13 and post-refusal iOS land here) and a persisted app-wide "we have shown the prompt" flag (`@vedansh/notif-permission-asked`). Only `denied` **after** we asked counts as a refusal. This is what makes the Android first-install flow behave like iOS: on a fresh Android install the app used to read `denied`, skip the launch prompt entirely, and then auto-flip the default-on toggle off, so reminders shipped silently disabled and never asked. The "keep the toggle honest" rule (enabled + denied ⇒ switch off) now runs on the effective status, so it can only fire once the user has actually been asked.
- **Permission banner** (Reminder Settings, under the master Switch — shown while the effective status is `denied`): `parchment-deep` fill, 1 px `divider`, `radii.sm`, `meaning` face in `ink-soft`. Two states, because a denial has two flavours: while the OS prompt is still available it reads "Notifications are off. Tap to allow them." and re-asks (granting also switches the reminder on); once `canAskAgain` is false it reads "Notifications are disabled. Tap to open Settings." and opens the system Settings app. Localized hi/en/gu/kn.

**Vrat reminders** (`vratScheduler.ts` / `vratReminderPure.ts`, armed by the headless `<VratReminderScheduler>` in `App.tsx`): derived from the user's **followed vrats** (§33) and their per-vrat / global reminder prefs. Each upcoming occurrence can produce an *advance* notice (evening before at `ADVANCE_HOUR = 18:00` local, 1–3 days ahead) and/or a *day-of* notice at the chosen morning time. Planned under a dedicated `VRAT_REMINDER_CAP = 24` pending budget — when over, **follow order is the priority tiebreak**. Re-arms on follow/pref/permission changes and on every app foreground; never prompts for permission itself (shares the daily-verse grant).

**Festive reminders** (`notifications/festiveReminders.ts` catalog + `festiveReminderPure.ts` planner + `festiveScheduler.ts` glue, armed by the headless `<FestiveReminderScheduler>` in `App.tsx`; pref lives beside the daily verse in `NotificationPreferencesContext`).

- **Default ON, no setup.** The vrat family above is opt-in (you follow a vrat first); this one is the opposite — every user gets one push on each famous festival without configuring anything. `festiveRemindersEnabled` defaults `true`, and a stored prefs blob written before the feature existed (no such key) also resolves to `true`, so upgraders are enabled rather than silently opted out. A hard OS denial flips it off alongside the daily verse, because a switch reading "on" for pushes the OS will never deliver is a lie; re-granting and re-toggling re-arms.
- **Curated catalog, not the whole calendar** (`festiveReminders.ts`). 18 hand-picked famous festivals, each pinned to (a) a hand-authored Devanagari-led greeting, (b) an invitation naming a specific bundled text, and (c) that text's `LibraryEntry.id`. Two curation rules, both test-enforced: only `default`-visibility observances qualify (an `advanced`/`regional` rule on every user's lock screen misrepresents the day — the same gate `pickTitleObservance` applies to titles), and **every entry must name real, routable content**. A famous festival with no honest content match (Raksha Bandhan, Bhai Dooj) is simply absent rather than pointed at a loosely-related text: the whole promise of the message is that the reading it names is one tap away.
- **Copy.** The **title is the festival's own name** (`दीपावली` / `Diwali`) — never a generic category label, and never concatenated, so no character budget can slice a Devanagari conjunct (the trap §3.0 and `TITLE_MAX_CHARS` exist for). The **body carries the customised message**: `<greeting> · <invite>` → `शुभ दीपावली · दीप जलाएँ और महालक्ष्म्यष्टकम् का पाठ करें।`. Rendered through `contentByLang` like every other content-bearing string (§10), so gu/kn arrive re-scripted from the Devanagari and en uses the authored English.
- **Timing.** One notification, **on the day, at 07:30 local** (`FESTIVE_HOUR`/`FESTIVE_MINUTE`) — thirty minutes after the daily-verse default so the two never land in the same instant and read as a duplicate. No advance notice: an eve-before nudge is what following a vrat (§33) buys, and doubling every festival would halve the trust in the default. A festival whose 07:30 has already passed today is dropped rather than fired late.
- **A 120-day rolling window** (`FESTIVE_WINDOW_DAYS`), far longer than the daily verse's 30, because festivals are roughly monthly and a user who does not open the app for six weeks should still get Diwali. Cheap: that window typically holds three or four festivals. Capped at `FESTIVE_REMINDER_CAP = 8` pending slots.
- **The cap is soonest-first, not fame-first** — the inverse of the vrat planner's followed-first rule. Nobody opted into these, so a festival three days out must never lose its slot to a more famous one four months out; catalog (fame) order only breaks a tie between two festivals landing on the same instant. **Budget note:** the daily-verse window alone can claim up to `IOS_PENDING_CAP`, so the four families are collectively over-subscribed against iOS's 64 pending limit in the worst case (4 reminder times + many followed vrats + enrolled sankalps). This slice is deliberately the smallest of the four for that reason.
- **Dates come from the bundled precomputed table, without a location** — exactly as vrat reminders resolve them. A festival's civil date shifts by at most a day across Indian cities, and the locationless path of `resolveObservancesForYear` is the offline precomputed table (§33), so no `<…AngaBridge>`-style plumbing is needed. Reading it still runs behind `InteractionManager` so a cold start's first frames are never charged for 18 rule lookups.
- **Own Android channel** `festive-reminders` (importance DEFAULT, `sound: 'default'`), so festival pushes can be muted in system settings without silencing the daily verse. A channel's sound and importance are pinned at creation, so changing either later needs a **new id** — the `-v2` dance documented for the japam channels in §35.
- **Setting** (`ReminderSettingsScreen`, §37): a third card below Times — title `पर्व स्मरण` / *Festival reminders*, a subtitle stating the festival count and fire time (both read off the planner constants so the copy can't drift), and a `saffron` Switch. No time picker: the fire time is fixed.
- **A tap lands on Home, and Home is already showing the festival** — see the deep-link table below and §50's FOR TODAY row. The catalog is the single source both surfaces read, and `festiveReminders.test.ts` asserts that on every catalog festival's own date the FOR TODAY row both contains that festival's `sourceId` and leads with a festival-attributed card. The notification's promise and the homepage cannot drift apart.
- **Home is also dressed for the day** — the Festive Toran (§55) hangs the same catalog greeting under the wordmark on those 18 days.

**Japam alarms** — see §35 for the scheduling tiers; they participate in deep-linking below.

**Notification tap → deep link** (`notifications/deepLink.ts`). A module-level `navigationRef` (attached to the `NavigationContainer` in `App.tsx`) lets `handleNotificationResponse` dispatch from outside the React tree; `App.tsx` wires both the cold-start response and the live `addNotificationResponseReceivedListener`. Routing by payload type:

- `daily-verse` → the **Daily Bhakti tab** carrying the exact verse identity (`sourceId`/`chapter`/`verseIndex`) baked into the notification — deliberately *not* a reader, because opening a reader would run its `setProgress` effect and clobber the user's resume position; the baked identity also survives OTA pool changes.
- `vrat-reminder` → `PanchangTab → ObservanceDetail` for that rule.
- `festive-reminder` → **`HomeTab → Home`**, and the reading its message named is the first card waiting there. Home's FOR TODAY row (§50) leads with the festival's own content on a festival day, reading the same curated catalog the notification's copy came from — so the invitation is honoured one tap in, not bypassed. Landing on Home rather than in a reader keeps three things true that a direct reader push would break: a tap made from a lock screen can't run a reader's `setProgress` effect and clobber the resume position (the same reason `daily-verse` stays on a tab), the day's Panchang strip and routine banner arrive alongside the reading, and a notification armed up to four months ago can't strand the user on content an OTA update has since renamed — Home recomputes today from today. `{ screen: 'Home' }` is passed explicitly: focusing `HomeTab` alone would restore whatever screen the Home stack was left on, possibly several readers deep. Routing gates on `ruleId` only; the payload still carries `sourceId` as the record of what the message promised.
- japam alarm → `HomeTab → JapamCounter` with `autoPlay: true`, so a lock-screen tap drops straight into chanting (mantra id validated against the catalog first; a stale alarm falls back to Home rather than crashing).

**Route mapping — `navigation/entryRoutes.ts`.** The single source of truth for "open this content": `buildEntryStartTarget(entry)` maps any library entry to its start route (japam → `JapamCounter`; theerth entries → `TheerthMap` with a group filter; the nine chalisas → `ChalisaReader`; sanskar → `SanskarReader`; aartis → `AartiReader`; a **multi**-chapter text → its Chapters screen — including the `ram-aarti` alias, which maps to the `ram-stuti` reader routes), with `navigateToRoutineItem`, `buildProgressTarget` (resume / search verse hits), and `buildBookmarkTarget` (Wishlist rows, §24) layered on top. Panchang's "Read: <section>" links, search results, routine items, wishlist, and the Home spotlight all route through this one module, so adding a section's route once wires every surface.

**Single-chapter texts skip the index (July 2026).** A "chaptered" text that ships exactly **one** chapter — `hanuman-ashtak`, `bajrang-baan`, `ram-stuti` (and its `ram-aarti` alias), `ramcharitmanas` — used to open a Chapters screen listing that single row, so reaching the verses took **two taps** from every entry surface (the Home आज के लिए row, By-Purpose discovery lists, search, category/deity lists, Rashifal). `buildEntryStartTarget` now sends those straight to their reader at `{ chapter: 1, initialIndex: 0 }`; a text with 2+ chapters keeps its index, because there is a real choice to make. Chapter counts are read off each text's shipped `*ChaptersManifest` (`chapterCountBySourceId` in `entryRoutes.ts`) — never mirrored by hand — so a text that gains a second chapter regains its index with no code change, and one that loses chapters stops showing a one-row list. `navigateToProgress()` follows the same rule: it normally pushes the chapters index *under* the reader so back reaches sibling chapters, and now skips that push for single-chapter texts, which have no siblings and would otherwise strand the user on the one-row list. `isChapteredEntry()` is unchanged: it still reports the **progress-key** shape (`<sourceId>::<chapter>`), which single-chapter texts keep. Pinned by `mobile/src/navigation/entryRoutes.test.ts` and `.maestro/single-chapter-open-smoke.yaml`.

---

## 39. Share Verse Cards

**Purpose.** Let a reader send any verse out of the app as a branded parchment image — composed off-screen, captured as a PNG, and handed to the native share sheet with a caption + install link (PRD-05). Tapping the share button opens a **target picker** (§39.1) with three destinations: the plain share sheet, an **Instagram post** (4:5), and an **Instagram story / reel** (9:16, §39.3) — the Instagram routes carry the same card with a per-verse hashtag block (§39.2). `ShareProvider` / `useShare()` in `mobile/src/utils/shareVerse.tsx`; card in `ShareCard.tsx`; picker in `ShareTargetSheet.tsx`; 9:16 wrapper in `ShareStoryCanvas.tsx`; links + captions in `mobile/src/data/shareLinks.ts`; hashtags in `mobile/src/data/shareHashtags.ts`. For a verse-less invite (the multi-line feature-list message + download link, §37), the More hub's **Share the App** card calls `buildAppShareMessage(lang)` from the same `shareLinks.ts` and opens the native share sheet directly.

### Component: Share Button (`ShareButton.tsx`)

- Same family as the Bookmark button (§25): 34×34 circle, `parchment-soft` fill, 1 px `divider` border, `↗` glyph in `saffron` (18, weight 600). 12 px `hitSlop`.
- Placement: in the verse page's **header row**, right of the verse-type pill, alongside the Bookmark button (readers pass both via the verse page's `topActions` slot). Every reader carries one — all 15 reader screens plus Daily Bhakti and the Japam counter. Because the picker lives inside the provider, all ~24 call sites gained the Instagram destination without a single call-site change; the button's own props are unchanged. It is also the **only** share affordance elsewhere in the app: the **Today's Panchang** (Muhurat detail) header uses this same circle rather than a bespoke button, so the share glyph reads identically everywhere.
- While a capture/share is in flight (`busy`), the button disables and drops to 50 % opacity — this debounces double-taps. On the Muhurat detail screen `busy` also covers the pre-ready window before the panchang is computed.
- Accessibility: `accessibilityRole="button"`; label defaults to "Share verse" and hint to "Long-press to share a screenshot of this reader instead", but both are **optional props** — non-verse surfaces override them (the Panchang header passes a localized "Share panchang" label and no hint, since it has no long-press path). [The verse provider supports a `mode: 'screenshot'` capture of a caller-supplied ref, and the button accepts `onLongPress` — but no shipping reader currently wires `onLongPress`, so only the card path is live today.]

### Component: Share Card (`ShareCard.tsx`)

A fixed-size 540×675 dp card (4:5 portrait), rendered **off-screen** and captured at 1080×1350 px PNG — the WhatsApp-friendly output size. Surface: `parchment` fill under the verse's **reader-page sketch** — `BackgroundLayer` over `getReaderBackground(sourceId, { stanza })`, the same faded plate + parchment overlay the source's reader shows (sources without a plate fall back to the plain gradient); 1 px `divider` border (`overflow: hidden` keeps the sketch inside it), padding 28 top / 28 horizontal / 22 bottom. `sourceId` is required; `stanza` is the optional kāṇḍa/stanza key for the per-subsection sources — the Valmiki Ramayan and Sundarkand readers pass the verse's own `stanza`, Daily Bhakti passes the pool verse's `chapter`. Guarded by `components/__tests__/shareCardBackground.test.tsx`.

**Structure (top to bottom):**

1. **Header band** (centred, 18 below): `<SECTION NAME> · <VERSE LABEL>` uppercased — `cardLatin` face at 13, `saffron-deep`, 2.4 letter-spacing. Both parts are content, so they follow the active reading language (`contentByLang`): Devanagari for `hi`, English for `en`, re-scripted for `gu`/`kn`.
2. **Verse block** (flex-grow, centred): the verse lines at 24/40, centred, `ink`. Line source follows the language: `linesHi` for `hi`, `linesEn` (romanization) for `en`, re-scripted Devanagari for `gu`/`kn` (`verseLinesByLang`). Font family follows the script — Gujarati/Kannada serif cuts for `gu`/`kn`, otherwise the `verse` token's Devanagari face (which also carries the Latin romanization glyphs). This card is a §13-sanctioned constrained surface: it keeps its own tuned sizes rather than the reader type scale.
3. **`॥` Ornament divider** (§5).
4. **Meaning** (optional): centred, `ink-soft`, at a size **chosen in JS** by `fitMeaningType` (`utils/shareCardType.ts`) — the largest step of an 18 → 12 ladder whose estimated wrap fits the height the card has left, with `lineHeight` derived as 1.5 × that size and `numberOfLines` set to the height-derived line budget. The budget subtracts the card's real chrome (padding, 13 pt header block, `Ornament`, branding footer — the `shareCardMetrics` constants, which the card's own StyleSheet also reads so the two cannot drift) **and the verse's actual line count**, so a four-line shloka correctly leaves the meaning less room than a two-line one. 95 % of shipped meanings land at 18/27; only the handful of Valmiki Ramayan prose meanings past ~1200 characters reach the 12 pt floor and show a readable excerpt rather than a full-length illegible one. Italic is applied **only** for `en` — Cormorant has a true italic cut, the Noto Serif Indic faces do not, so an italic there is a synthesised skew that blurs the matras (same rule as `captionFont`, `utils/scriptFont.ts`). Language-selected via `meaningByLang`, honouring verified native `meaningGu`/`meaningKn` overrides when the verse carries them.

   **Why not platform auto-fit (August 2026).** This block shipped as italic 14/24 with `numberOfLines={5}` + `adjustsFontSizeToFit` down to `minimumFontScale={0.5}`. The 5-line cap forced nearly every real meaning to shrink, the shrink bottomed out at **7 pt** — below the §3.0 10 pt floor — and because `lineHeight` stayed pinned at 24 while the glyphs shrank, the leading ratio blew out to ~3.4×: a scatter of tiny characters in cavernous white space, reported as unreadable in a shared WhatsApp image. That is the same trap already recorded on `CategoryCard` and Namkaran (§61) — *on iOS a multi-line label with a fixed `lineHeight` shrinks erratically and ignores `minimumFontScale`* — so the rule to carry forward is: **a fixed leading and platform auto-fit must never appear on the same Text.** Size it in JS, derive the leading from the size, and take the line cap from real geometry. Guarded by `components/__tests__/shareCardFit.test.tsx` (no auto-fit props, ≥12 pt, 1.4–1.7× leading, upright Indic) and `utils/__tests__/shareCardType.test.ts` (the ladder, the budget, and that the fitted block still fits the card).
5. **Branding footer** (1 px `divider` top rule, 14 above): `वेदांश़` wordmark (reader-title face, 18, `ink`) · `Vedansh — Sacred Texts, Daily Reading` (italic 12, `saffron-deep`) · `NOW AVAILABLE ON IOS & ANDROID` (uppercase 10, `ink-muted`, 2.0 tracking).

### §39.1 Component: Share Target Sheet (`ShareTargetSheet.tsx`)

A bottom sheet in the `LanguagePickerSheet` family (§37 sheet chrome): `parchment-highlight` base, 22 px top corners, 40×4 grabber, `xxl` horizontal padding, `modalBackdrop` behind, backdrop tap dismisses. Opened by `share(verse, lang)` when the caller names no `target`.

**Structure (top to bottom):**

1. **Title** — `श्लोक साझा करें` / `Share this verse` / gu / kn, `cardFontByLang` at 18, `ink`, centred.
2. **Row: Share** — `↗` glyph in `saffron` (18, 22-wide column), title at 17 (`cardFontByLang`, `ink`), sub-label "WhatsApp, Messages, anywhere" at 12. 1 px `divider` bottom rule. Runs the unchanged §39 flow.
3. **Row: Instagram post** — `◉` glyph, sub-label "4:5 card — for the feed", trailing **`4:5`** pill chip (10, `ink-muted`, 1 px `divider`, pill radius). 1 px `divider` bottom rule.
4. **Row: Instagram story / reel** — `▮` glyph, sub-label "Full screen 9:16 — nothing gets cropped", trailing **`9:16`** chip. Exports the §39.3 canvas.
5. **Copy note** — one shared line under both Instagram rows: "Either way the caption + hashtags are copied — just paste in Instagram". It sits below the rows rather than inside each, so the two rows differ only by the thing that actually differs: the aspect.
6. **Hashtag preview** — `parchment-soft` panel, 1 px `divider`, `radii.md`; an `indicSafeTag` eyebrow at 10 (`हैशटैग` / `HASHTAGS` / gu / kn) over the live tag line at 12/18 in `saffron-deep`, inside a 76 dp `maxHeight` scroll. The preview is not decoration: the tags change per verse, and a reader about to post under their own name gets to see them first.
7. **Cancel** — 44 pt text button, 13, `ink-muted`.

**Why Instagram is two rows.** The destination decides the aspect, and the reader is the only one who knows which they are about to post. A feed post shows a 4:5 image whole; a story or reel is 9:16 and fills the frame from a 4:5 source by scaling up and cropping — which takes the card's header band and branding footer with it. Offering one "Share on Instagram" row means half the shares silently ship a cropped card. The aspect chip states the difference numerically as well as in prose.

All three rows are 44 pt minimum and drop to 50 % opacity + `disabled` while `busy`. Every sub-label and eyebrow goes through `eyebrowTextStyle` / `indicSafeTag` (§3.0) rather than the Inter-based `sectionLabel` token — Inter has no Indic glyphs and Latin tracking splits the shirorekha. Accessibility: the rows carry the stable English labels **`Share to other apps`**, `Share on Instagram` and `Share as Instagram story or reel` — the first is deliberately not `Share verse`, which is the reader button's own label and would be ambiguous to an e2e selector (and to a screen reader) while the sheet is open. The Instagram row's hint states that the caption is copied; the preview exposes `Hashtags: <line>`. Guarded by `components/__tests__/ShareTargetSheet.test.tsx`.

### §39.2 Instagram hashtags (`data/shareHashtags.ts`)

**Why derived, not canned.** One fixed tag block on every share teaches Instagram nothing: a Chalisa chaupai and a Gita shloka land in the same bucket and compete with each other. Every tag is instead built from the verse being shared — its section title, its chapter, and the deities + category the registry (`library`, §41) files that text under. Change the verse and the block changes with it. Pure, bundle-only, no native deps — so it ships over OTA like the rest of `shareLinks.ts`.

**Five slots (`MAX_HASHTAGS = 5`).** That is what Instagram accepts, and it is also roughly what Instagram's own guidance recommends — so the cap is right on reach grounds regardless of the ceiling. Five changes the *strategy*, not just the length: a thirty-tag block can afford to lead with the long tail and let the broad tags ride behind, but at five a tag only a handful of people search costs a fifth of the budget. The order is therefore a deliberate blend, **not** "most specific first":

| # | Slot | Source | Example (Hanuman Chalisa, `hi`) |
|---|------|--------|---------------------------------|
| 1 | **Occasion** | the festival/vrat falling on the share date, **only when it belongs to one of the text's deities** | `#HanumanJayanti` |
| 2 | **Name** | section when narrower than the text, else `LibraryEntry.nameEn`, IAST-folded to PascalCase | `#HanumanChalisa` |
| 3 | **Native name** | the same title in the reading language's script — where that audience actually searches | `#हनुमानचालीसा` |
| 4 | **Deity** | two tags from the entry's **primary** deity | `#Hanuman` `#JaiHanuman` |
| 5 | **Anchor** | exactly **one** broad tag | `#Bhakti` |

One broad anchor, not six: five pure-niche tags give the post nowhere big to rank, while six broad ones drown it. When a slot is free — `en` spends none on a native title, and most days carry no occasion — it is filled from the tail in priority order (vaar, chapter, second deity, category, remaining broad, language, brand). Those tiers are still built so that raising the cap is a one-constant edit rather than a redesign, but at five they mostly fall outside it. **No slot goes to the brand**: `#Vedansh` buys no reach, and the card's wordmark plus the caption's `@vedansh.app` already carry it.

Worked examples: Hanuman Chalisa `en` → `#HanumanChalisa #Hanuman #JaiHanuman #Bhakti #JaiShriRam`; Gita 2.47 `en` → `#BhagavadGita #Krishna #JaiShreeKrishna #Bhakti #GitaChapter2`; the same Gita verse on Janmashtami → `#Janmashtami` takes slot 1 and pushes the chapter out.

**What is deliberately absent.** No `#viral`, `#trending`, `#explorepage`, `#fyp`. Tags with no topical relation to the post are what integrity systems look for, several in that family have been restricted outright, and they dilute the classification the specific tags exist to provide. Hashtags are in any case a modest lever since Instagram de-emphasised hashtag discovery — they classify a post's topic more than they distribute it — which is an argument for a clean block, not a loud one.

**The timely tier (§0 and §3b).** The one reach advantage this app has that a generic quote account does not: the panchang engine knows what today is. Sharing a Krishna verse on Janmashtami adds `#Janmashtami` + `#Janmashtami2026` — hyper-relevant *and* spiking in volume on exactly the day it is used. Both timely tiers are **gated on deity relevance**: the observance's `deityEn` (plus its name) is matched against `DEITY_MATCH_TOKENS` for the deities the registry files the text under, so `#HanumanJayanti` attaches to a Hanuman Chalisa verse and to nothing else. Ungated, this would be exactly the irrelevance the paragraph above refuses. **One** observance contributes (a day can carry several, and at five slots a second festival tag crowds out the deity and the anchor), and there is no `#Janmashtami2026` year variant — it duplicates the topic at a fraction of the volume. `hi` also gets the festival name in Devanagari.

`shareHashtags.ts` stays pure and date-free — resolving observances needs a location and a warmed year cache, so the **caller** supplies a `TimelyContext`. `ShareProvider` builds it from `useObservancesForDate(today, calendarSystem)` + `deityForWeekday()`, with `useTodayKey` rolling it over at midnight/foreground. The resolve is `InteractionManager`-deferred and shares the year cache Home's Today strip already warms, so it adds no work the app wasn't doing. Absent a `timely` input the block is byte-identical to the date-free one.

**Slug rules.** Latin titles run through the search normalizer (`data/searchNormalize.ts`) so IAST diacritics fold (`Bhagavad Gītā` → `BhagavadGita`) and dandas/`·`/punctuation drop before the words join. Native-script titles keep `\p{L}`, `\p{N}` **and `\p{M}`** — matras are combining marks, and stripping them would shred the word — and drop everything else including spaces. `gu`/`kn` re-script the Devanagari title the same way every other content string does. Output is deduped case-insensitively, capped at `MAX_HASHTAGS = 30`, and drops anything over 40 characters or with no letter in it. Deterministic: the same verse + language always produces the same block, so a re-share reuses tags Instagram has already indexed the account under.

**One cap for both formats.** Post and story share the same five — a story's tags live in a text sticker, where five is if anything generous. `buildVerseHashtags` still takes a `limit`, but it is **clamped** to `MAX_HASHTAGS`: it can only shrink the block, never widen it past what the platform accepts.

**Caption.** `buildInstagramCaption` (`shareLinks.ts`) = the §39 verse caption, then `<Follow line> @vedansh.app`, then a **blank line**, then the tag line; `format: 'story'` trims the tag line to the story cap. The blank line is deliberate — Instagram collapses a caption after ~3 lines, so the preview shows the verse and not the tags. Guarded by `utils/__tests__/shareHashtags.test.ts`.

**Why the clipboard.** Instagram accepts no pre-filled caption from a share intent on either platform, and the Stories pasteboard route needs a native module (and a store rebuild). So the Instagram branch copies the caption to the clipboard via RN's deprecated-but-present `Clipboard` — the same API `NameDetailSheet` already uses, i.e. no new native dependency and the whole feature ships OTA — then opens the share sheet with the PNG. The sheet's sub-label tells the reader the caption is waiting to be pasted.

### §39.3 Story / Reel canvas (`ShareStoryCanvas.tsx`, `utils/shareStoryLayout.ts`)

**The failure it fixes.** The share card is 4:5 — the tallest aspect a feed post shows whole. Posted to a **Story** or a **Reel**, which are 9:16, Instagram scales the image up to fill the frame and crops the overflow off the top and bottom: exactly the header band and the branding footer. Reported from the field after §39.1 shipped.

**Two separate hazards.** *Crop* is solved by exporting a true 1080×1920 frame, so nothing is scaled to fill. *Chrome* is solved by keeping the card out of the strips Instagram paints over: the avatar/progress row at the top, the Reel caption + audio strip at the bottom. `storySafeInsets` is the **union** of Story and Reel vertical chrome — top 120, bottom 165 dp (×2 = 240 / 330 px) — so one exported image is safe posted either way.

**No horizontal inset, deliberately.** A Reel also paints a like/comment/share rail down the right edge (~100 px). An inset wide enough to clear it would force the card below its native 540 dp width — i.e. a scale transform on the very view handed to `captureRef`. The cheaper trade is to run the card full-bleed horizontally and let the rail sit over its 28 dp internal padding: the rail overlaps the card's margin, never its text.

**Geometry.** Canvas 540×960 dp, captured at 1080×1920. The insets are chosen so a native 540×675 card fits the band at **scale 1** — 120 + 675 + 165 = 960 — so `placeStoryCard()` returns scale 1 and the captured hierarchy is plain and unscaled. The scale is kept as a backstop for a card that outgrows the band, and `shareStoryLayout.test.ts` fails loudly if the shipped size ever stops fitting at 1:1. The card is centred **in the safe box, not the canvas** — canvas-centring would drop the branding footer under the Reel caption strip.

**Neither re-laid-out nor transformed.** Re-flowing the card at story width would re-wrap the verse lines and re-run `fitMeaningType` against different geometry, silently changing a composition §39's fit tests pin; scaling it would put a transform on the captured view. It gets neither. Behind it sits the same source sketch, full-bleed, so the frame reads as a designed story rather than a letterboxed screenshot.

> **August 2026 — the story row was reported crashing** and never reaching Instagram, while post and plain Share worked. The transform was the one construct the story path had that the working post path did not, so it was removed in favour of the scale-1 geometry above. Whether that was the cause is **unconfirmed** — it could not be reproduced without a device. If it recurs, the next suspects are memory (a 540×960 dp view at density 3 is a ~19 MB bitmap before the scale to 1080×1920, against ~13 MB for the post) and `captureRef` on a view positioned off-screen at −10000.

Guarded by `utils/__tests__/shareStoryLayout.test.ts` (9:16 export, card wholly inside the safe box, uniform scale, safe-box centring) and the capture-size assertions in `utils/__tests__/shareVerseTarget.test.tsx`.

### Share flow (`ShareProvider` / `useShare()`)

0. `share(verse, lang)` with no `opts.target` opens the target picker (§39.1) and returns; the picker calls back with `'system'` or `'instagram'`. A caller that already knows the destination passes `opts.target` and skips the sheet.
1. The chosen target mounts the card **off-screen** (absolute-positioned at −10000,−10000, `pointerEvents="none"`) inside the provider, waits one animation frame + 60 ms for layout/fonts, then captures it with `react-native-view-shot`'s `captureRef` (PNG, quality 1, tmpfile, scaled to 1080×1350).
2. A **text caption** is always built via `buildShareCaption` (`shareLinks.ts`): section · verse label header, the quoted first verse line, then a language-localised CTA ("Read on Vedansh:" / "Vedansh ऐप पर पढ़ें:" / gu / kn equivalents) followed by the public smart link (`SMART_LINK`, a GitHub Pages redirect page; `APP_STORE_URL` / `PLAY_STORE_URL` constants live alongside it). Bundle-only — no runtime fetch.
3. **Instagram target:** the off-screen mount is the plain card for `format: 'post'` and the §39.3 canvas for `format: 'story'`, captured at 1080×1350 or 1080×1920 accordingly. The caption is `buildInstagramCaption` (verse caption + `@handle` + the five-tag block, §39.2), copied to the clipboard, and the PNG always goes out through `expo-sharing` on **both** platforms — the RN Share `message` would ride along uselessly (Instagram drops it) and on some builds pushes Instagram out of the activity list in favour of text-capable targets. `dialogTitle: 'Share on Instagram'`.
4. **Platform split (system target):** iOS shares image + caption together through RN `Share.share({ message, url })` (UIActivityViewController fills WhatsApp's caption field automatically). Android's RN Share drops file URIs, so the image goes through `expo-sharing`'s `shareAsync` (mimeType `image/png`) and the caption is left to the user — the branding footer on the card itself carries the fallback.
5. **Fallbacks:** capture failure on an **Instagram** target → a localized "Couldn't share just now" alert, because Instagram accepts an image or nothing and a text-only sheet simply would not list it — which reads as the button doing nothing. Capture failure on the system target → text-only `Share.share(caption)`; `Sharing.isAvailableAsync()` false → the same text-only path; sheet dismissal / any error is swallowed. An in-flight ref guarantees one share at a time; `busy` drives the button's disabled state.

**Files:** `mobile/src/components/ShareButton.tsx`, `ShareCard.tsx`, `ShareStoryCanvas.tsx`, `ShareTargetSheet.tsx`, `mobile/src/utils/shareVerse.tsx`, `mobile/src/utils/shareCardType.ts`, `mobile/src/utils/shareStoryLayout.ts`, `mobile/src/data/shareLinks.ts`, `mobile/src/data/shareHashtags.ts`. `ShareProvider` mounts once in `App.tsx` and owns both the off-screen card and the target picker. Tests: `utils/__tests__/shareHashtags.test.ts`, `utils/__tests__/shareStoryLayout.test.ts`, `utils/__tests__/shareVerseTarget.test.tsx`, `components/__tests__/ShareTargetSheet.test.tsx`, e2e `mobile/.maestro/share-target-smoke.yaml`.

---

## 40. Reading Progress & Resume

**Purpose.** Remember where the reader stopped in every text — and every chapter of every text — so a returning reader lands back mid-verse instead of at page 1. Powers the thin progress bar in readers, the resume sheet on the listing screens, silent per-chapter auto-jump, and the routine engine's auto-completion (§31). `mobile/src/contexts/ReadingProgressContext.tsx`.

### What's persisted

One AsyncStorage blob at `@vedansh/reading-progress`: a map of entries `{ sourceId, chapter?, verseIndex, updatedAt }` keyed by `<sourceId>` for linear texts and `<sourceId>::<chapter>` for chaptered ones — **each chapter keeps its own resume position**. On hydrate, legacy stores are migrated in place: bare-`sourceId` keys are re-keyed to the composite form, `sourceId`s are canonicalised (§44 migration), and colliding entries keep the most recent `updatedAt`. Two read paths:

- `getProgress(sourceId)` — the **latest** position across all subsections (drives the book-level resume sheet).
- `getChapterProgress(sourceId, chapter)` — the saved position within one subsection (drives chapter auto-jump).

Readers write on every page change (`setProgress` from the pager's current index); writes are deduped when the verseIndex hasn't changed, and each write also logs a read into `UserActivityContext` (feeding streaks and routine auto-completion).

### Component: Reading Progress Bar (`ReadingProgressBar.tsx`)

The continuous form of the `n / total` page counter. A 3 px full-width track in `divider` with a `saffron` fill at `current/total` % (pill-radius fill). Sits directly under the reader top bar, above the toggle row, on every reader. Renders nothing when `total ≤ 0`.

### Component: Resume Reading Sheet (`ResumeReadingSheet.tsx`)

**When it appears.** On `CategoryListScreen` and `DeityListScreen`: tapping an entry whose saved book-level progress has `verseIndex > 0` opens this sheet instead of navigating. (Entries with no progress, progress at verse 1, or while storage is still hydrating navigate straight to the start.) The Chapters Index screens do **not** show it — tapping a chapter card silently resumes at `getChapterProgress(...).verseIndex` (subsection auto-jump).

**Spec.** A centred modal over `modalBackdrop` — max width 420, `radii.lg`, `cardActiveBorder` 1 px, `parchment` base under a `cardActiveFrom → cardActiveTo` gradient (the active-card treatment, §8):

1. Text title via `orderTitlesByLanguage` (dev primary 20 / secondary 13; lat primary 22 / secondary 12), then a 1 px `divider` rule.
2. Prompt: `जहाँ छोड़ा था, वहीं से जारी रखें?` (reader-title face, 17, `ink`) over `Resume where you left off?` (italic 13, `ink-soft`).
3. **Last-read card**: `parchment-soft`, `divider` border, `radii.md`; `अंतिम पठित` / `LAST READ` in the `sectionLabel` token over the pre-formatted location at 16 in the active script (via `formatLocation`, which speaks each source's vocabulary — `अध्याय N · श्लोक M` for Gita, `सर्ग` for Sundarkand, `स्तोत्र` for stotrams, `काण्ड … · पद` for Ramcharitmanas, `काण्ड … · श्लोक` for Valmiki Ramayan, plain `पद N` for chalisas/aartis).
4. Primary button: solid `saffron`, `radii.md`, `जारी रखें · Resume` in `onPrimary`.
5. Secondary button: outlined `cardActiveBorder`, `आरंभ से पढ़ें · Start Over` in `saffron-deep`.
6. `Cancel` — italic 13 `ink-muted`, 44 pt min-height text button.

**Behaviour.** Resume → navigate to the saved position (`navigateToProgress`). Start Over on a **chaptered** entry clears only the chapter being resumed (`clearChapterProgress`) and reopens that chapter at verse 1 — sibling chapters keep their positions; on a linear entry it clears the whole source and opens at the start. Every exit path also `markSeen`s the entry (clears its NEW badge, §44). Backdrop tap dismisses.

### Chapter auto-advance (transition cards)

Multi-chapter readers must let the reader swipe **across** chapter boundaries (the RULEBOOK §3 auto-advance contract). The pager data is `[PrevChapterCard?] + verses + [NextChapterCard?]` — the prev card omitted on the first chapter, the next card on the last. Each transition card (`NextChapterCard.tsx` / `PrevChapterCard.tsx`) is a full-width page, content centred with 12 gap: a language-aware `अगला / Next` (or `पिछला / Previous`) label at 14 `ink-muted`, the neighbouring chapter's title at 20 `saffron-deep` (italic when lang = en), and a 32 pt `›` / `‹` chevron in `saffron-deep`. When the transition page becomes ≥ 60 % visible, the reader fires a **Medium** haptic and, after a 400 ms beat, `navigation.replace`s itself with the neighbouring chapter — replace, not push, so back always returns to the chapter list. The prev path lands on the previous chapter's **last** verse (`initialIndex: prevVerseCount − 1`). A `hasNavigatedRef` latch prevents double-fire; the prepended prev card shifts all indices by one (`offset = isFirstChapter ? 0 : 1`).

### Component: Jump-to-Start (`JumpToStartButton.tsx`)

A floating pill anchored bottom-right of the verse pager (16/16 inset, clear of the centred pager dots) rendered only when the reader is past verse 1 — a one-tap return after a subsection auto-jump, without swiping back through every page. `parchment-soft` fill, `cardActiveBorder` 1 px, `pill` radius, **`elevation.lifted`** (§4 — was an inline `0.18/10` shadow); `⇤` glyph (15) + language-aware label `आरंभ` / `Start` (13, italic for en) in `saffron-deep`. Tap scrolls (animated) to index 0 of the current chapter.

**Files:** `mobile/src/contexts/ReadingProgressContext.tsx`, `mobile/src/components/ReadingProgressBar.tsx`, `ResumeReadingSheet.tsx`, `JumpToStartButton.tsx`, `NextChapterCard.tsx`, `PrevChapterCard.tsx`, `mobile/src/utils/formatLocation.ts`; consumers `GitaReaderScreen.tsx` (canonical), `CategoryListScreen.tsx`, `DeityListScreen.tsx`, `GitaChaptersIndexScreen.tsx`.

---

## 41. Content Module Catalog & Registry

**Purpose.** One data registry — the `library` array in `mobile/src/data/texts.ts` — is the single source of truth for everything the catalog surfaces show: Home's category tiles, `CategoryListScreen`, `DeityIndexScreen` / `DeityListScreen`, the routine Add-Content list, the Daily Bhakti verse pool, and NEW-badge tracking. Screens never hand-list content; they filter this array (RULEBOOK §2 rows 11–13: "no edit needed" — adding a section means appending one `LibraryEntry`).

> **Supersedes §10's two-module framing.** §10 documents the original Chalisa + Gita content shapes and remains authoritative for those shapes and for the per-module-type discipline ("shapes stay separate"). The catalog has since grown to ~40 entries across 7 categories; this section documents the registry and shape *families* that grew out of §10's pattern.

### `LibraryEntry` (the registry row)

```ts
type LibraryEntry = {
  id: string;                  // route slug + asset folder + progress/bookmark sourceId
  nameHi: string; nameEn: string;
  sub: string; subEn: string;  // listing subtitle per language ("40 चौपाई + 3 दोहा · अर्थ सहित")
  thumb: string;               // single Devanagari glyph for the card thumb
  status: 'active' | 'coming';
  category: ContentCategory;   // which Home tile it lives under
  deities: Deity[];            // cross-reference tags (≥ 1)
  verseCount?: number;         // imported from the module's data, never hand-typed
  hidden?: boolean;            // omit from all listings
  addedInVersion?: string;     // semver debut marker → seeds the NEW badge (§44)
};
```

`verseCount` and counted subtitles are computed from the module's own exported totals (`sundarkandTotal`, `shivChalisaCounts.totalVerses`, …) so the card can never drift from the data (RULEBOOK §11.10). Japam entries are spread into the array from `japamMantras`, so a new mantra automatically becomes a catalog row.

### Category set (`mobile/src/data/categories.ts`)

Ten categories, all `active`: `granth` (ग्रन्थ · Sacred Books) · `stotram` (स्तोत्रम् · Hymns & Praise) · `chalisa` (चालीसा) · `japam` (जप · Japa & Mantras) · `aarti` (आरती) · `theerth` (तीर्थ · Pilgrimage) · `sanskar` (संस्कार · Good Habits) · `ashtakam` (अष्टकम् · Ashtakam — standalone Ashtak/Ashtakam texts; PRD-A rows use multi-instance `AshtakamReader`, while the pre-existing Sankat Mochan Hanuman Ashtak keeps its dedicated chaptered reader) · `suktam` (सूक्तम् · Suktam — PRD-A; multi-instance `SuktamReader`) · `kavacham` (कवच · Kavacham — PRD-A; multi-instance `KavachamReader`). Each PRD-A form dispatches its texts through one reader on an `<form>Id` route param. **Stuti** (स्तुति · Krishna Stuti, Durga Stuti) is a fourth PRD-A form that is **not a category** — its texts are filed under `stotram` (folded July 2026: स्तुति ≈ स्तोत्रम्, and Ram Stuti already lived there) yet still render through the multi-instance `StutiReader` (routed by `stutiId`). `HomeScreen` renders all category tiles from data (`coming` ones, when present, render as disabled "SOON" launchers) and appends a **hand-wired देवता · By Deity tile** that opens `DeityIndexScreen` (§42) instead of a category list. (This supersedes §18's "6 tiles" list.) `japam` tiles route to the counter UI, `theerth` to the map (§26); everything else goes through `CategoryListScreen` → `entryRoutes.ts`.

### Deity set (`mobile/src/data/deities.ts`)

Twenty-one deities, each `{ id, nameHi, nameEn, iconKey }`: rama (bowArrow) · krishna (bansuriPeacockFeather) · vishnu (chakra) · shiva (trishul) · hanuman (gada) · durga (lotus) · ganesha (modak) · savitr / माँ गायत्री (surya) · saraswati (veena) · lakshmi / माँ लक्ष्मी (lakshmi 🪔) · surya / सूर्य देव (suryadev 🌞) · radha / राधा रानी (radha 🌸) · kartikeya / कार्तिकेय (kartikeya 🦚) · kubera / कुबेर (kubera 💎) · ganga / माँ गंगा (ganga 🌊) · parvati / माँ पार्वती (parvati 🌺) · narasimha / नरसिंह (narasimha 🦁) · dattatreya / दत्तात्रेय (dattatreya 🕉️) · shani / शनि देव (shani 🪐) · kali / माँ काली (kali 🌑) · navagraha / नवग्रह (navagraha 🌌). `getDeityMeta` / `deityIconKey` are the lookup helpers; the icon system is §42. (PRD-A deity expansion §A.4.2 complete July 2026: 9 → 21, each new deity shipped with ≥1 source-verified text; note the `surya` deity id is distinct from savitr's `surya` icon key.)

### Data-shape families (one directory per module under `mobile/src/data/`)

- **Linear `lines`/`linesEn` verses (swap-on-toggle, §3.1/§10)** — one JSON, one `Verse[]`, no chapters. Three registry-driven *multi-instance* readers dispatch on a route param instead of importing one section's data (RULEBOOK §3): **chalisas** (`chalisaRegistry.ts` → hanuman/shiv/durga/ganesh/gayatri/ram/krishna/vishnu/saraswati chalisa dirs — nine total), **aartis** (`aarti/index.ts` `aartiCollection`, 8 aartis, `refrain`/`stanza` verse types; the Aarti *category* also lists a 9th card, `ram-aarti`, which is an alias that opens the existing `ram-stuti` Stotram content rather than an `aartiCollection` entry), **sanskar** (8 practice modules — prabhati-shloka, surya-namaskar, tulsi-puja, bhojan-mantra, gau-seva, sandhya-deepam, ratri-shloka, vidyarambha-prarthana — whose `SanskarVerse` adds `vidhiHi/En` method prose and `intro`/`mantra`/`step`/`vidhi` types).
- **Chaptered `chapter-NN.json` + `chapters-manifest.json`** — the Gita pattern (§10, §15): `gita/` (18 chapters, sanskrit + transliteration + meaning + commentary), `sundarkand/` (16 sargas), `shiva-strotam/` (4), `durga-stotram/` (3), `ganesh-stotram/` (3), `saraswati-stotram/` (3), `vishnu-sahasranama/` (4), `krishna-stotram/` (2), `ramcharitmanas/` (1 — Mangalacharan only today), `valmiki-ramayan/` (7 kāṇḍas / 648 sargas / 23,289 verified verse records, §53), plus single-chapter `hanuman-ashtak/`, `bajrang-baan/`, `ram-stuti/`. Each `index.ts` is a typed loader with module-load invariants; the large Valmiki payload is the exception that validates lazily per loaded kāṇḍa.
- **Japam** (`japam/japam.json`) — mantras with round targets; routes to the counter, not a verse pager.
- **Theerth** (`theerth/temples.ts`) — the prose-per-temple shape of §26–27 / RULEBOOK §12; no verse pages. Temples carry their own `addedInVersion` for NEW tracking (§44).

**RULEBOOK §1 is the intake contract** for every row above: mandatory `id`/names/`sub`/`thumb`/`category`/`deities`, per-verse `lines` + `meaningHi` + `meaningEn` (both languages — the toggle must work on every page), optional commentary, background sketches per §6. Gujarati/Kannada are never authored — derived at runtime (§3.1).

### NEW badges

`addedInVersion` marks the semver in which an entry's content shipped. It is used **only to seed** the debut state for upgrading users (entries newer than the `1.2.0` feature baseline light up NEW); ongoing detection is content-ID-set based, so any id later added to the registry is automatically NEW for existing users. Full lifecycle in §44; badge visual in §19.

**Files:** `mobile/src/data/texts.ts`, `categories.ts`, `deities.ts`, `chalisaRegistry.ts`, per-module dirs under `mobile/src/data/`, `mobile/src/navigation/entryRoutes.ts`; contract in `RULEBOOK.md` §1–2.

---

## 42. Deity Index

**Purpose.** The "browse by deity" front door. Tapping the देवता · By Deity tile on Home (the eighth category tile, §41) pushes this screen: one card per deity, each opening the deity-filtered listing (§22). `mobile/src/screens/DeityIndexScreen.tsx`.

**Structure (top to bottom):**

1. Status bar (safe area).
2. **Top bar** (`spacing.xxl` gutter): 44 px circular back button (`parchment-soft` fill, `divider` border, `‹` in `ink-soft`) + title `देवता · By Deity` via `orderTitlesByLanguage` (primary 16 `ink`, secondary 13 `ink-muted`, dot-separated on one baseline).
3. **Deity card list** — vertical `ScrollView`, `spacing.xxl` side padding, `spacing.md` gap. All deities from `deities.ts` (twenty-one — PRD-A §A.4.2 complete; enumeration mirrored in §41), in registry order.

**Background.** A `BackgroundLayer` with a **random deity sketch** — the index isn't tied to one deity, so it draws from the deity background pool (`getRandomDeityBackground`), chosen once per visit (`useMemo([])`) so it's stable while open and fresh on the next visit. This is a sanctioned variation on §6's deterministic rule, matching the image backdrop every other listing screen carries.

**Per-card data.** Item count line = the number of active, non-hidden library entries tagged with the deity ("5 texts", English-only meta). `hasNew` = any of those entries is still NEW (§44) — the deity card inherits the badge until its texts are acknowledged, mirroring the per-text chips inside its list.

### Component: Deity Card (`DeityCard.tsx`)

Wears the active LibraryCard treatment (§8): `cardActiveFrom → cardActiveTo` gradient fill, 1 px `cardActiveBorder`, `radii.lg`, raised shadow, 14 padding, horizontal layout with 12 gap:

- **Avatar**: 44×44 circle in the `cardThumbActiveFrom → cardThumbActiveTo` gradient, containing a `DeityIcon` (below); falls back to the deity's first two Devanagari characters.
- **Names** via `orderTitlesByLanguage` (dev 16/12, lat 18/11): primary in `ink`, secondary italic `ink-muted`, then the count line at 10 `ink-muted`.
- Right `›` chevron in `saffron`.
- **NEW pill** top-right when `hasNew`: `newBadgeBg` fill, `newBadgeText` text, `pill` radius, **10 pt** uppercase (was 9, below the §3.0 floor) — same geometry as §19.
- Whole card is the press target; a11y label reads name + count + "New." when badged.

### Deity Icon system (`DeityIcon.tsx` + `deityGlyphs/`)

Each deity's avatar glyph is a compact **symbolic attribute**, not a portrait (design spec: `docs/superpowers/specs/2026-05-08-deity-icons-design.md`). All 21 icon keys render as **hand-built vector glyphs** — pure `View` compositions, no SVG per the §30 convention and no emoji per §5 — one file per key under `mobile/src/components/deityGlyphs/`, registered in a total `Record<DeityIconKey, ComponentType>` so a deity added without a drawn glyph fails typecheck.

- **Canvas + scaling:** every glyph draws inside a uniform 36×36 dp centered canvas (`DeityIcon` wraps it with a `deity-glyph-<key>` testID) and is transform-scaled for other sizes (`size` prop; MiniPlayer 26, cards 36, Now Playing 150). The layout box stays 36×36 at every size — consumers center it in fixed frames.
- **Baked illustration palette** (`deityGlyphs/palette.ts`): warm ink-brown `#733207` silhouettes/strokes (borderWidth ~1.3–2), gold `#D49A35` accent fills, plus goldSoft/cream and the peacock leafGreen/teal/deepBlue/featherYellow family (also used for Ganga's cool-water waves) and a flame orange. Deliberate illustration colors baked into the art, not theme tokens — the glyphs sit on the fixed `cardThumbActiveFrom → cardThumbActiveTo` medallion gradient. **The cool hues (leafGreen/teal/deepBlue) are the one sanctioned exception to the warm-only "never green/red" rule (§2), and are bounded to these glyph files** — painted attributes, never signals. Nothing here may be imported into UI chrome; chrome takes its colour from `theme/colors.ts` only.
- **The 21 attributes:** bow-and-arrow (rama), bansuri + peacock-feather plume (krishna), Sudarshana chakra (vishnu), trishul (shiva), gada (hanuman), open lotus (durga), modak (ganesha), eight-ray sun (savitr), veena (saraswati), coins-into-lotus (lakshmi), rising sun over horizon (suryadev), lotus bud on stem (radha), vel spear (kartikeya), treasure pot (kubera), descending waves (ganga), five-petal blossom (parvati), lion emblem in a mane ring (narasimha), hand-drawn ॐ (dattatreya), ringed graha (shani), khadga (kali), nine-dot yantra (navagraha).
- **Fallback:** an undefined `iconKey` renders the deity's first two Devanagari characters — never a blank avatar.

**Interactions.** Tap a card → push the Deity Detail page (§50) for that deity — essay plus grouped `LibraryCard` rows, resume-sheet behaviour (§40), and NEW clearing (§44). `DeityListScreen` remains a compatibility route for plain filtered lists.

**Files:** `mobile/src/screens/DeityIndexScreen.tsx`, `mobile/src/components/DeityCard.tsx`, `DeityIcon.tsx`, `mobile/src/data/deities.ts`; spec `docs/superpowers/specs/2026-05-08-deity-icons-design.md`.

---

## 43. Reading Size Setting

**Purpose.** A two-preset reading-text size control (PRD-04, slice 2) — comfort sizing for verse and meaning text without letting UI chrome reflow or clip. `mobile/src/theme/fontScale.ts` + `mobile/src/contexts/FontScaleContext.tsx` + `mobile/src/components/ReadingSizePickerSheet.tsx`.

### Presets

Exactly two (product decision), in `FONT_SCALES`:

| Preset | Label | Factor |
| --- | --- | --- |
| `M` (default) | मानक · Standard | 1.0 |
| `L` | बड़ा · Large | 1.15 |

### What scales

Only the reading-content tokens listed in `READING_STYLE_KEYS`: `verse`, `meaning`, `verseLatin`, `verseGujarati`, `verseKannada`, `meaningEnglish`, `meaningGujarati`, `meaningKannada` — i.e. verse + meaning across every script. `scaleTypography` multiplies each token's `fontSize` **and** `lineHeight` by the factor (rounded) so leading stays proportional; factor 1 returns the input untouched. Everything else — `screenTitle`, `readerTitle`, `pageCounter`, pills, labels, card titles — is chrome and **never scales**, so top bars, toggles, and cards cannot clip.

### Plumbing

`FontScaleProvider` mounts in `App.tsx` **above** `ThemeProvider`; `ThemeProvider` reads `useFontScale()` and serves `scaleTypography(typography, factor)` as `theme.typography`. Because every reader already pulls its type from the theme (§3 "no hardcoded fontSize on reading content"), the entire app scales with **zero per-screen work** — this is the payoff of the one-reading-type-scale rule. Persisted at `@vedansh/font-scale` (the raw `'M'`/`'L'` string); unknown/corrupt values fall back to `M`.

### Component: Reading Size Picker Sheet (`ReadingSizePickerSheet.tsx`)

Opened from the **पाठ का आकार** row on the More hub (§37; the row's state text shows the current preset). A bottom-sheet `Modal` (slide up, `modalBackdrop`, grabber, `parchmentHighlight`) — single-language chrome:

1. **Header**: title "पाठ का आकार / Reading size" over the sub "श्लोक व अर्थ के अक्षरों का आकार / Verse & meaning text size", both in the selected language only. All four reading languages have native copy.
2. **Preset pills** (`radiogroup`; each pill a `radio` with `selected` state): Standard / Large, labelled in the active language. Selected: `saffron` border + `saffron-tint` fill + `saffron` ✓ prefix, label in `saffron-deep`; unselected: `divider` border, `ink`. Pill labels are chrome — fixed size by design.
3. **Live sample line** — "श्री राम जय राम" (per-script variants incl. IAST for en) rendered with the *same* verse token the readers consume, so it grows/shrinks the instant a pill is tapped. This is the preview; there is no separate preview machinery.
4. **Done button** (`saffron`) closes the sheet. Picking a size does **not** auto-close, so the preview change stays visible for comparison. `readingSizeLabel(scale, lang)` is exported for the More row's state text, and `READING_SIZE_SAMPLE` for the first-run setup sheet (§47), which previews the same line with the same verse token. The read-aloud sheet (§56) **speaks** that same line as its voice preview, so all three surfaces preview with identical words.

**First run:** the same two presets are offered on the post-tour setup sheet (§47) alongside the language choice, so the preference is set once at install rather than discovered later on the More hub.

### Interplay with OS font scaling (§12)

The preset multiplies the app's own type tokens; it does not replace platform accessibility. No component sets `allowFontScaling={false}` (there are zero overrides in `src/`), so the OS-level font multiplier still applies on top of the preset per React Native's default — §12's "use the system's user-chosen font-scale" holds.

**Files:** `mobile/src/theme/fontScale.ts`, `mobile/src/contexts/FontScaleContext.tsx`, `mobile/src/theme/ThemeContext.tsx`, `mobile/src/components/ReadingSizePickerSheet.tsx`, `mobile/src/screens/MoreScreen.tsx`; design note `docs/superpowers/specs/2026-06-30-font-scale-ui-design.md`.

---

## 44. NEW-Content & Update Surfaces

**Purpose.** Two complementary "something new" mechanisms: the saffron **NEW badge** that marks content a user hasn't opened yet (`NewContentContext.tsx`), and the **OTA update-ready modal** that offers a one-tap reload when a fresh bundle has been downloaded in the background (`UpdateReadyModal.tsx`). Plus the `sourceId` migration layer that keeps a user's bookmarks and progress stable while content ids evolve.

### NEW badge lifecycle (`mobile/src/contexts/NewContentContext.tsx`)

**Model.** One AsyncStorage blob (`@vedansh/new-content-state`) holds `knownIds` — the set of acknowledged content. The *discoverable* universe is every active, non-hidden `LibraryEntry` **plus every theerth temple** (temple keys namespaced `theerth-temple:<id>` so they can never collide with a text id). An id is NEW iff it is discoverable and **not** in `knownIds` — so any content added to the registry after the user's state was written is automatically NEW, with no version bookkeeping at runtime.

**Debut seeding (first run of the feature).** With no stored state, the provider classifies the user:

- **Upgrader** — any of five deliberate-action keys exists in storage (bookmarks, reading progress, recent searches, japam counter, saved language). Seeded with everything known **except** entries whose `addedInVersion` compares above the `1.2.0` pre-feature baseline (`compareSemver`, `mobile/src/utils/semverCompare.ts` — a dependency-free numeric segment compare) — those debut as NEW.
- **Fresh install** — everything seeded as known; a brand-new user sees no badges (nothing is "new to them").
- Storage failure → treat everything as known; the safe fallback is *no* badges, never all badges.

**Clearing.** `markSeen(id)` persists the acknowledgment the moment the user **opens** the content — the category/deity list press handler and both resume-sheet exits call it (§40) — matching §19's "the chip clears once the user opens that content".

**Surfaces.** `isNew(id)` → the NEW pill on `LibraryCard` (§8) and `DeityCard` (§42), and temple pins/rows. `hasNewInCategory(categoryId)` → the badge on Home's category tiles (§19) and the FeatureCard eyebrow swap (§32); the DeityIndex derives a per-deity badge from its texts. Badge visual: `newBadgeBg` fill + `newBadgeText` text (saffron family = live & fresh, vs the muted gold `SOON`), always carrying the "NEW" text cue (§12). Dev-only `devSimulateUpgrade` / `devResetNewState` hooks exist for the Maestro badge flows.

### OTA update prompt (`mobile/src/components/UpdateReadyModal.tsx`)

`expo-updates` keeps its default flow: check + background-download on launch, apply on next cold start. The modal closes the "next cold start" gap without blocking startup: `Updates.useUpdates().isUpdatePending` flips true once a bundle is staged, and the modal appears — only when `Updates.isEnabled` (never in dev clients / Expo Go, where `reloadAsync` throws). Mounted once in `App.tsx` inside the provider stack.

**Spec.** Centred card over `modalBackdrop`: `parchment` fill, `radii.lg`, `spacing.xxl` padding, max width 360.

- Title "नया अपडेट तैयार है / A fresh update is ready" — 20, reader-title face (script serif for gu/kn), `ink`.
- Body — 15/23 `ink-soft`, meaning face: "New content and improvements have been downloaded. Apply them now, or they'll apply automatically next time you open the app." (all four languages authored).
- Primary: solid `saffron`, `radii.md`, "अभी अपडेट करें / Update now" in `onPrimary` → `Updates.reloadAsync()` (busy-guarded; on a native failure it dismisses and lets the default next-launch path apply the update).
- Secondary: "Later" — uppercase 13, `ink-muted` text button.

**Dismissal is per-staged-update:** "Later" latches for the session, but the latch resets when a *newer* update is staged, so a fresh download re-prompts.

### sourceId migration (`mobile/src/data/sourceIdMigration.ts`)

Content ids have changed shape over time (aartis were once addressed positionally as `aarti-N` / bookmark ids `aarti:N:M`; canonical form is the library id, e.g. `om-jai-jagdish`). `canonicalSourceId` and `canonicalBookmarkId` normalise legacy values, and are applied **on hydrate** by `BookmarksContext` and `ReadingProgressContext` (and defensively by Wishlist reads) — so an upgrade never strands a user's saved verses or resume positions. The reading-progress migration additionally re-keys legacy per-book entries to the per-chapter composite keys (§40). Unknown ids pass through unchanged.

**Files:** `mobile/src/contexts/NewContentContext.tsx`, `mobile/src/components/UpdateReadyModal.tsx`, `mobile/src/data/sourceIdMigration.ts`, `mobile/src/utils/semverCompare.ts`; registry field `addedInVersion` in §41.

---

## 45. Daily Routine Suite (beyond §30/§31)

**Purpose.** The management surfaces around नित्य साधना: browsing routines, creating one, filling it with content, and editing it — plus the in-reader affordance that adds the current text to a routine. Complements §30 (the Home banner + celebration) and §31 (the Today's Practice ledger those open into). Data model per PRD-07: routines of complete reciting units (whole section / one chapter / a japam round-target), scheduled `daily` or per-weekday.

### Component: RoutineShell (`mobile/src/components/RoutineShell.tsx`)

The shared chrome for the routine management screens: by default a full-screen `parchmentHighlight → parchmentGradientEnd` gradient (the §2 Home gradient tokens — flat, for the utility/ledger surfaces), safe-area top, and a top bar (`spacing.xxl` gutter): 44 px circular back button (`parchment-soft` / `divider`), a 16 pt title that **swaps** by reading language (RULEBOOK §3 — never stacked), and an optional right-slot action. It also accepts an optional `background` image source: passed one, it renders the shared `BackgroundLayer` (sepia sketch + §2 overlay) instead of the flat gradient, so **content** surfaces (the Sadhana catalog + detail, §46) sit on the same sketch backdrop as the rest of the catalog while management/ledger screens stay flat. `BackgroundLayer`'s no-source fallback is that exact parchment gradient, so unpassed callers are unchanged. The file also exports `RoutineButton` — the suite's standard button: solid `saffron` with `onPrimary` label, or `ghost` (transparent, 1 px `goldTint` border, `saffron` label); `radii.md`, `spacing.md` vertical padding, 16 pt script-aware label on a 24 line (≥1.5× — RN clips Devanagari top matras like ें below ~1.45×).

### Screen: My Routines (`RoutineListScreen.tsx`)

`RoutineShell` titled `मेरी साधनाएँ · My Routines`. Reached from Today's Practice (§31) — one routine card per `Routine`:

- Card: the warm **active Library Card** language (§8) — `cardActiveFrom → cardActiveTo` gradient fill, 1 px `cardActiveBorder`, `radii.lg`, `elevation.card`, `spacing.lg` padding, `spacing.md` gap between cards, saffron `›` chevron (26) at the tail. (Was a flat `parchment-soft`/`divider` box; July 2026 review aligned it with the catalog cards.)
- Row: routine name (card-title face at the `cardHindi` token size, script-aware via `scriptTitleFont`, `ink`) + a mode pill (`saffronTint` fill, `pill` radius, `versePill` type via `pillTextStyle` in `saffron-deep`, 8/3 padding): `दैनिक / DAILY` or `वार / WEEKDAY`.
- Meta line: "N items" — §46 meta convention (`scriptBodyFont` + `cardMeta`, `ink-muted`; never Cormorant on the Indic string).
- Tap → `RoutineDetail`. Below the list, two ghost `RoutineButton`s: "नई साधना बनाएँ / New routine" → `RoutineCreate`, then "तैयार संकल्प चुनें / Browse sankalps" → the §46 catalog. Empty state: a centred "No routines yet" line (14, `ink-muted`).

### Screen: Create Routine (`CreateRoutineScreen.tsx`)

A three-step wizard on the same gradient (its own top bar: the back button steps `mode → name → choose` before popping). Each step leads with a centred bilingual heading (screen-title face at 22 over a secondary in the *other* language — Cormorant italic when the secondary is English, the `meaning` face when it is Hindi; Cormorant has no Devanagari glyphs).

1. **Choose** — the §46 fork: `अपनी साधना बनाएँ / Build your own` (→ Name) vs `तैयार संकल्प चुनें / Choose a prebuilt sankalp` (→ the Sadhana catalog).
2. **Name** — two labelled `TextInput`s (Hindi name / English name; `sectionLabel` labels via `pillTextStyle`, `parchmentHighlight` fill, `divider` border, `radii.md`). Either language suffices — the blank one falls back to the filled one on create. Primary button "आगे / Next" (disabled until non-empty).
3. **Mode** — two selectable cards: `दैनिक — हर दिन एक जैसा / Daily — same every day` and `वार अनुसार / By weekday — changes per day` ("each day has its own deity and texts"). Primary "साधना बनाएँ / Create routine" → `createRoutine(...)` then **`navigation.replace`** into `RoutineAddItems` (back from add-items skips the wizard).

All wizard cards (`ModeCard`) carry the warm §8 gradient fill (`cardActiveFrom → cardActiveTo`); the border marks selection — 1.5 px `saffron` selected, 1 px `cardActiveBorder` unselected. Titles at the `cardHindi` token size (script-aware); descriptions in the `meaning` face at 13/20. The wizard's primary button label sits on a 24 line (≥1.5× of its 16 size — Devanagari matras clip below that).

### Screen: Add Content (`RoutineAddItemsScreen.tsx`)

`RoutineShell` titled `सामग्री जोड़ें · Add Content`. Lists every active, non-hidden library entry **except theerth** (a map tour can't be practised as a daily item). For **weekday** routines, a 7-day strip sits on top (Sun–Sat chips, defaulting to today; selected chip gets the 1.5 px `saffron` border) — every add below is tagged to the selected day.

- Row: 34 px thumb (`saffronTint`, `radii.sm`, the entry's Devanagari `thumb` glyph in `saffron-deep`) · name (14) with an optional `सुझाव / SUGGESTED` pill (`goldTint` fill, `versePill` in `saffron-deep`) · unit meta ("पूरा पाठ / Whole text", or "1 माला · 108" for japam) · a `＋` toggle in `saffron` that flips to a `gold` ✓ when added. Rows are separated by 1 px `divider` hairlines.
- **Vaar deity suggestions:** for weekday routines the list is *sorted* suggested-first — entries whose `deities` include `deityForWeekday(day)` (see scheduling below) float to the top and wear the SUGGESTED pill. Always a suggestion, never a constraint.
- Adds are whole-unit here: `section` items (or `japam` with `targetRounds: 1`); the footnote says chapter-level selection is "coming soon" **on this screen** — chapter granularity already exists via the reader sheet (below).
- "पूर्ण / Done" → `RoutineToday` (§31).

### Screen: Routine Detail (`RoutineDetailScreen.tsx`)

`RoutineShell` titled with the routine's name; right slot is a `saffron` `＋` → Add Content. For weekday routines, a read-only 7-column vaar grid tops the screen: each day chip shows its short label over the presiding-deity label (`deityLabelForWeekday`) in `saffron-deep`. Item rows: resolved title + sub (`resolveRoutineItem` — "अध्याय 1 / Chapter 1", "पूरा पाठ / Whole text", "N माला / N mala") plus the item's scheduled day shorts; tapping the row opens the item's reader (`navigateToRoutineItem`); a `×` removes it. Bottom: ghost "इस साधना को हटाएँ / Delete this routine" — deletion drops the routine from context and a focused-effect guard pops back exactly once (goBack in the handler double-popped; the comments document the bug).

### Component: Add-to-Routine button & sheet

- **`AddToRoutineButton.tsx`** — the `＋` (22 pt, `saffron`, 12 hitSlop) sitting beside the `LanguageToggle` in **every reader's toggle row** (chaptered readers pass the current `chapter`). Tap → `openAddToRoutine(sourceId, chapter)`.
- **`RoutineSheetProvider.tsx`** mounts a single app-level `AddToRoutineSheet` and exposes that opener via context — one sheet instance, any reader.
- **`AddToRoutineSheet.tsx`** — a bottom sheet (slide-up `Modal` over `modalBackdrop`): `parchmentHighlight` panel, 22 px top radii, `divider` grabber bar. Header: "Add ‹name›" (18, language-aware) over an italic secondary carrying the *other* language. For chaptered sources a **"क्या जोड़ें / What to add"** chip row offers `पूरा / Whole` plus one chip per chapter (from `chaptersForSource`), pre-selected to the chapter being read. Below, every routine as a checklist row — a 22 px `radii.sm` checkbox (`gold` outline → filled `saffron` with `onPrimary` ✓ when this unit is in the routine) + name + mode pill; tapping toggles add/remove. Adding to a weekday routine schedules the item for **today's** weekday. Footer: "＋ New routine" closes the sheet and deep-navigates to `RoutineCreate` via the navigation ref.

### Scheduling data (`mobile/src/data/routine/`)

- `types.ts` — `Routine { id, nameHi, nameEn, mode: 'daily' | 'weekday', items, createdAt }`; `RoutineItem { kind: 'section' | 'chapter' | 'japam' | 'vidhi', sourceId, chapter?, targetRounds?, weekdays? }` (weekdays 0 = Sun … 6 = Sat); `itemRunsOn` (daily = always); `routineItemKey` for completion tracking. Item granularity is a complete reciting unit, never a single verse — that's Daily Bhakti's job (§23). The `vidhi` kind (PRD-19 Phase 2B) carries a vidhi id as `sourceId`: it resolves to the vidhi title with a `पूजा विधि` sub-line, its row tap routes to `VidhiDetail` (§62), and completion is **manual-mark only** — conduct state lives in AsyncStorage outside the reading-progress contexts, so `isItemAutoComplete` never auto-completes it.
- `vaar.ts` — the weekday → deity maps. `VAAR_DEITY` is the **content-filter** tag and must exist in the catalog: Sun savitr (Surya) · Mon shiva · Tue hanuman · Wed ganesha · Thu vishnu · Fri durga · Sat hanuman. `WEEKDAY_DEITY_LABEL` is the **display** name and may honour tradition beyond the catalog — Saturday reads "शनि देव · हनुमान / Shani Dev · Hanuman" while surfacing Hanuman content.
- `units.ts` + `useRoutineToday.ts` — completion is **derived, not stored**: an item is auto-complete when persisted reading progress reached the unit's last verse-page *today* (last positions memoised from the verse pool) or japa rounds ≥ target from today's UserActivity totals; a manual mark (§31's offered-marks store) wins over auto. `useRoutineToday()` composes routines + progress + activity into `{ entries, doneCount, total, hasRoutine }` with per-entry `doneMode` and `doneAt` — the single view-model behind the banner (§30), Today's Practice (§31), and the celebration gate.

**Files:** `mobile/src/screens/RoutineListScreen.tsx`, `CreateRoutineScreen.tsx`, `RoutineAddItemsScreen.tsx`, `RoutineDetailScreen.tsx`; `mobile/src/components/RoutineShell.tsx`, `AddToRoutineButton.tsx`, `AddToRoutineSheet.tsx`; `mobile/src/contexts/RoutineContext.tsx`, `RoutineSheetProvider.tsx`; `mobile/src/data/routine/{types,vaar,units,useRoutineToday,chapters}.ts`. PRD: `docs/roadmap/prds/07-daily-routine-sadhana.md`.

---

## 46. Sadhana Programs (संकल्प)

**Purpose.** Prebuilt, multi-day devotional vows (a *sankalp*) — a 41-day Hanuman Chalisa anushthan, the Gītā in 18 days, Navratri's nine Durga nights, Shravan Somvar. Each program references EXISTING library content by id (no new content); a user's enrollment + per-day progress persist on-device (`SadhanaContext`, like `RoutineContext`). PRD-11.

**Entry points (three, all standing).** The catalog must never depend on the create-routine flow alone (July 2026 review: with a routine already added it was 5 taps deep behind "New routine"): (1) the `CreateRoutineScreen` **'choose'** step forks "Build your own" vs **"Choose a prebuilt sankalp"**; (2) ghost "तैयार संकल्प चुनें / Browse sankalps" buttons on Today's Practice (§31) and My Routines (§45); (3) the संकल्प Home spotlight card (§32). Pinned by `SankalpTouchpoints.test.tsx`.

### Screen: Sadhana catalog (`SadhanaProgramListScreen.tsx`)

`RoutineShell` titled `संकल्प · Sadhana Programs`, **on a sketch background** — a multi-deity index, so it passes `getRandomDeityBackground()` (memoised per mount, same convention as the By-Deity index §42), not the flat gradient. Intro line in `meaning` prose. Programs group under `sectionLabel` eyebrows — **In progress**, **Available**, **Completed sankalps** — rendered via `pillTextStyle` (Inter uppercase for `en`; script serif, no tracking, for hi/gu/kn).

Cards follow the **active Library Card** language (§8): every program is startable, so there is **no** dormant/"coming" (flat) variant — all cards carry the warm `cardActiveFrom → cardActiveTo` gradient, `cardActiveBorder`, and the raised shadow, with a `cardThumbActiveFrom → cardThumbActiveTo` gradient thumb bearing the program's Devanagari `thumb` glyph (`ह` / `भ` / `दु` / `शि`, reused from the underlying text). Titles show **both** reading languages ordered by the active one via `orderTitlesByLanguage()` (dev 17/13, lat 19/12); no subtitle line (kept terse — the pill carries the state). Tail: a status pill (`parchmentHighlight` fill, `goldTint` border, `cardMeta` type in `saffron-deep` via `pillTextStyle`) reading `Day n / N` (active), `N days` (available), or `✓ Complete` (done), then the saffron `›` chevron (26). Completed cards dim to 0.9 opacity. Each card is a `Pressable` with an explicit English a11y label `<titleEn>. <subtitleEn>. Tap to open.` → `SadhanaProgramDetail`.

### Screen: Sankalp detail (`SadhanaProgramDetailScreen.tsx`)

`RoutineShell` titled `संकल्प · Sankalp`, on the program's **deity** sketch background (`getDeityBackground(program.deity)`). Centred title (script-aware) — **no subtitle line**: `subtitleHi/En` restated the title's duration ("… — ४१ दिन" + "A 41-day sankalp") and padded the screen (July 2026 review; the fields still feed the catalog card's a11y label). Then an intro card (`parchment-soft`, `goldTint`, `elevation.card`) with the sankalp framing. Before enrolling: primary `RoutineButton` **"संकल्प लें / Begin this sankalp"** (or "फिर से संकल्प लें / Begin again" if completed) → `enroll()` then navigates straight to Today's Practice. While active: a "दैनिक स्मरण / Daily reminder" toggle row, "आज की साधना / Today's practice", and a ghost **"संकल्प स्थगित करें / Set this sankalp aside"** (`abandon()` → back). Footer note (the `meaning` face at 12/18): the grace rule ("miss a day and the sankalp pauses, it never breaks") — the footer is the rule's **only** home; program intros must not restate it (pinned in `progress.test.ts`; the hanuman-41 intro once duplicated it on-screen). All type is token-sourced; status/reminder lines use `scriptBodyFont` + `cardMeta` (never Cormorant on Devanagari).

### Component: SankalpTodayCard (`SankalpTodayCard.tsx`)

One enrolled sankalp's card on the Today's Practice ledger (§31) — flat `parchment-soft` + `elevation.card`, `saffron` border, matching the ledger aesthetic (not the catalog's gradient). The card is a **tap-to-expand accordion**: its header is always visible and its unit rows **collapse by default, dropping down only when the header is tapped** — so a sankalp with several units stays a compact ledger row until opened, and a card can grow (more content added later) without dominating the screen.

**Header (always visible, tappable when there are units to reveal):** Eyebrow (`sectionLabel` via `pillTextStyle`, `saffron-deep`): `Sankalp · n / N` in every non-terminal state (or `पूर्णाहुति / Sankalp complete`). **`n` is `completedDayCount(enrollment)` — days actually offered, not `status.dayIndex`** — so completing today's day ticks it `0/N → 1/N` and it agrees with the List/Detail status pills (which already read `completedDayCount`). Using `dayIndex` (the day you are *on* = done + 1) would show `1/N` on a fresh day 1 before anything is done and stay `1/N` after completing it — the counter would never move on completion. Then the program title (`cardHindi + 3`). On the title's right, a **dropdown caret** (a `›` rotated to point **down** when collapsed and **up** when open) appears whenever there is something to expand; the header carries `accessibilityRole="button"` + `accessibilityState.expanded` (absent on `done-today`/`completed`, which have no units to drop down, leaving the header a plain block). **Below the title, a multi-day progress bar** — the same gradient track as the §31 routine summary card (7 px, `radii.pill`, `parchment-deep` track, `gold→saffron` fill spanning `completedDayCount / totalDays`, `accessibilityRole="progressbar"`) — so an enrolled sankalp reads as an in-progress commitment at a glance, not only today's unit. It shows in every non-terminal state (`active` / `done-today` / `waiting`) and is **hidden once `completed`**, where the पूर्णाहुति seal is the terminal marker and a full bar would be redundant. All state prose (waiting / done-today / completed lines) sits at **caption scale (14/21)**, not the reading-body token — at 20/34 the card read as a prose block (July 2026 review: "too verbose").

**Units dropdown (hidden until the header is tapped).** The dropped-down rows **match the §31 daily-routine ledger row exactly** — 28 px offering ring (filled `saffron` ✓ when done, `marginTop: -2` to optically centre on the 24-line title), title `cardHindi` at **16/24**, a `cardMeta` sub-line, `›` at **18/24**, `flex-start` alignment (ring/chevron pin to the title's first line), gap 14, 14 px vertical padding, and **bottom** hairline dividers (last row borderless) — so a sankalp's practice reads identically to the everyday routine once opened. A top hairline (`itemsSheet`) sets the dropdown off from the header. Per-state row behaviour:

- **active** — each unit row is committable: the offering ring's a11y label **names its item** (`Mark offered — ‹titleEn›`) so it never collides with §31's generic routine circles; tapping it commits the day. Auto-commit still fires once every unit is genuinely done today (`isItemAutoComplete`), independent of whether the card is expanded (the root `SadhanaCompletionOverlay` owns commit). Completing the vow plays the §31 `PracticeSeal` (पूर्णाहुति) once.
- **done-today** — a calm "Today's reading is done. Come back tomorrow" line; no units, so no dropdown.
- **waiting** (calendar-gated: weekday off-day / festival window not open) — the resting copy ("Your sankalp begins 11 Oct." / "Resting today — …") **plus the next selected unit as a tap-to-read preview** inside the dropdown, so an upcoming sankalp never opens onto an empty dead end (the day is not committable until the gate opens). The preview row carries **no offering check circle** — that affordance belongs to `active` alone; a rest-day read cannot advance the vow, so the row reads as a preview ("झलक · पढ़ने के लिए टैप करें / Preview · Tap to read"), never a to-do whose empty circle would falsely promise the `n / N` counter will move.
- **completed** — the seal + a "Your N-day sankalp is complete 🙏" line; no units, so no dropdown.

### Data & resolver (`mobile/src/data/sadhana/`)

`types.ts` — `SadhanaProgram { id, titleHi/En, thumb, subtitleHi/En, deity?, introHi/En, cadence, day? | days? }` (uniform `day` vs per-day `days`); `SadhanaCadence` = `consecutive` | `weekday` | `festival-window`; `SadhanaEnrollment { programId, startedOn, status: 'active'|'completed'|'abandoned', completedDays, completedOn? }`. `progress.ts` `resolveSadhanaToday()` returns the `active | done-today | waiting | completed` view-status (grace-by-default: a day is "spent" only when completed; the `waiting` status carries `items` for the preview). `useSadhanaToday.ts` composes enrollment + program + panchang schedule + reading/japa progress into the per-card view-model, then orders the ledger via the pure `orderSadhanaCards` (in `progress.ts`): **the daily practice leads** — practicable-today `active` cards first, `consecutive` (daily) cadence ahead of a calendar-gated day that only happens to be eligible today — then `done-today`, then resting/upcoming `waiting` sankalps **by nearest date first** (`whenKey`; undated last), and `completed` sankalps last. Ties keep enrollment order (stable sort). Backing tests: `progress.test.ts` (resolver + catalog well-formedness incl. thumb + `orderSadhanaCards` ledger order), `SankalpTodayCard.test.tsx` (waiting-preview + the days-completed eyebrow + the multi-day progress bar), `SadhanaCompletion.integration.test.tsx` (mounts the real `SadhanaCompletionOverlay` over the real providers and asserts a day auto-commits when reading reaches the unit's last verse-page — consecutive **and** weekday-on-eligible-day — with a negative partway case; guards the "routine completes but sankalp doesn't" class of bug). e2e: `.maestro/sadhana-sankalp-smoke.yaml` (consecutive) + `sadhana-calendar-preview-smoke.yaml` (calendar-gated preview).

**Files:** `mobile/src/screens/SadhanaProgramListScreen.tsx`, `SadhanaProgramDetailScreen.tsx`; `mobile/src/components/SankalpTodayCard.tsx`; `mobile/src/contexts/SadhanaContext.tsx`; `mobile/src/data/sadhana/{types,programs,progress,useSadhanaToday}.ts`. PRD: `docs/roadmap/prds/11-sadhana-programs.md`.

---

## 47. Feature Tour & What's New

**Purpose.** Three onboarding surfaces that answer "what's in this app?" without a manual. The **first-launch feature tour** (`FeatureTour.tsx`) is an in-context, ~24-step guided walkthrough that navigates the user through the real app, **rings the element each step describes**, and anchors a compact tooltip to it. The **first-run setup sheet** (`OnboardingSetupSheet.tsx`) opens the moment the tour closes and asks the fresh installer to pick a **reading language** and a **reading size** — the two settings the walkthrough's last steps point at. The **What's New sheet** (`WhatsNewModal.tsx`) fires once after an update and lists only that release's new features. All three are gated by `TourContext.tsx` and mounted in `App.tsx` inside the provider stack; the tour renders as a **top-level in-tree overlay** (last child of the root view, above the navigator, mini-player and tab bar), the setup sheet is a transparent `Modal` beside it, and What's New stays a `Modal` inside `NavigationContainer`. Complements §44 (NEW badge / OTA prompt) — those mark *content*; this orients the *app*.

**First-run sequence:** tour (≈24 steps, non-interactive) → setup sheet (language + size, interactive) → app. A returning user gets neither: What's New instead.

### First-launch tour (`mobile/src/components/FeatureTour.tsx`)

**In-context, not a slideshow.** An **in-tree** translucent overlay (absolute-fill `View`, not a native `Modal`) sits above the whole app over a `rgba(15,10,5,0.55)` ink scrim — the real screen reads through behind it. It is deliberately *not* a `Modal` for two reasons: (1) it draws a highlight ring **over** the live UI, and (2) it stays in the accessibility tree so e2e/Maestro can drive it — a `Modal` presents in a separate window that `config.yaml`'s `snapshotKeyHonorModalViews:false` reads *through*, making the tour invisible to the harness. A `Pressable` scrim swallows touches, so only the tour's own controls advance it — it stays linear. On every step change the tour dispatches `navigationRef.dispatch(CommonActions.navigate(...))` (deferred through `InteractionManager.runAfterInteractions`), so the user actually lands on the surface the copy describes.

**Measured spotlight.** Each step names an on-screen element via `targetId`, registered with `useTourTarget(id, reveal?)` in the owning screen (`components/tour/tourTargets.ts` — a module-singleton ref registry). After navigating, the tour first calls the target's optional `reveal()` — a `scrollNodeIntoView(scrollRef, targetRef)` that scrolls a below-the-fold target (the Japa/Theerth tiles, the categories grid, the reminder "+ Add" row, the japam add-alarm button) on-screen — then measures the element (`measureInWindow`) and rings it with a `saffron` highlight (2px border + soft `saffron` glow, rect inflated ~6px). Measurement is **settle-aware**: the tour re-measures across frames and always keeps the latest rect, committing only once it holds still for `MEASURE_STABLE_FRAMES` past a `MEASURE_MIN_TRIES` warm-up (or hits the `MEASURE_MAX_TRIES` cap) — `measureSettled()` in `placement.ts`, pure + unit-tested. This stops a freshly-navigated screen (whose header/content shifts for several frames, and whose muhurat card mounts a few frames late) from ringing a stale, pre-layout spot. **After the frame loop settles, a low-frequency poll** (`REMEASURE_POLL_MS`) keeps re-revealing + re-measuring for as long as the step is shown: some screens hydrate their content **asynchronously** (e.g. Japam alarms load from AsyncStorage *after* the ~0.8s frame cap), and the empty-state layout looks "stable" to the frame loop — so the ring would otherwise freeze on the target's pre-hydration position (the "+ Add alarm" button ends up ringed over the alarm row that loaded in beneath it). The poll follows the target to its final spot no matter how late/slow the load is (device-agnostic — no fixed time window); a `sameRect` guard makes it a no-op (no re-render) once nothing moves, and it is torn down when the step changes. Steps with no stable element — the five bottom-tab overview steps, or a target that may be absent on first launch — omit `targetId` and ring the **destination tab** instead (computed from `TAB_ORDER` + default-tab-bar geometry). `placeTourCard` (`components/tour/placement.ts`, pure + unit-tested) sits the card in the band opposite the ring so it never covers it and points the arrow at it; if the element can't be measured it falls back to the step's declared `anchor`/`pointer`. This replaces the original anchor-only card, which covered ~half the screen and pointed at nothing specific. **The fit decision uses the card's real rendered height, not a fixed guess** — `FeatureTour` reports the card+arrow height via `onLayout` and feeds it back into `placeTourCard`, so a card that grows with the bilingual copy, the type scale, or a shorter device is never placed on a side too small to hold it (which previously let it cover the very element it rings). `CARD_HEIGHT_EST` only seeds the first frame before the measurement lands. When **neither** side can hold the whole card, the card pins flush to a safe-area edge with the arrow still leading back toward the target — top-pinned (arrow down) only when the whole card fits the safe viewport *and* there is more room above the target (clearing a low target), otherwise bottom-pinned (arrow up) so the card's Back/Next controls stay on-screen even for a card taller than the viewport (large type scale).

**Card spec.** `parchment-soft` fill, `divider` border, `radii.lg`, 18 padding, **`elevation.overlay`** (§4 — the tier for floating above a scrim; was an inline off-palette `#0a0604` shadow until July 2026). Header (pinned to the top of the overlay, not the card): step counter `n / N` (left) + `Skip` (right), `cardLatin`, `parchment`, tracked-uppercase. The card holds a `readerTitle`-face Hindi title (20, `ink`, centred) over an italic `subtitle`-face English title (13, `ink-muted`); a `divider` hairline; then a bilingual body (`meaning` face — Hindi 14/24 `ink`, English 12/20 `ink-soft` at 0.85). Footer: a `dotRest`/`saffron` progress-dot row, then **Back** (secondary outline, `divider` border, disabled + 0.3 opacity on step 1) and **Next · आगे** / on the last step **Done · पूर्ण** (primary solid `saffron`, `onPrimary`, `radii.md`). a11y labels are constant English — `Skip tour`, `Previous step`, `Next step`, `Done` — so e2e is language-independent.

**Bilingual, always.** The tour renders Hindi (primary) **and** English (secondary) on every card and never branches on `lang`. It is a first-run welcome shown before any reading language is chosen (default `hi`), and the app's identity is Hindi-led-bilingual (§1); showing both is the welcome, not a localization bug (contrast the What's New sheet below, which *does* honour the reading language because it fires for returning users). Because it never picks hi-or-en by `lang`, it doesn't trip the gu/kn ternary hazard (wiki `concepts/languages`).

**Steps (~24), in order** (`mobile/src/data/tour/steps.ts` — each: `id`, `navigateTo`, optional `targetId`, `anchor`/`pointer` fallback, bilingual title/body). The sequence is a guided walkthrough: **(1–5) the five bottom tabs** — Home, Daily Bhakti, Panchang, Bhajan, More — each a **tab-ring** (no element target); **(6–11) Home** — routine card (`routineCard`, the inline `RoutineBanner` under the Today strip), categories grid (`categoriesGrid`), Japa tile (`japaTile`) → Japa inside / mantra list (`HomeTab/CategoryList{japam}`, `japamInside`), Theerth tile (`theerthTile`) → Theerth inside / temple map (`HomeTab/TheerthMap`, `theerthInside`); **(12–13) Bhakti** — Daily Verse (`dailyVerse`), Share (`shareButton`); **(14–18) Panchang** — Daily Muhurat / Choghadiya card (`muhuratCard`), the Vrat & Parv segment (`panchangSegment`), the vrat list (`PanchangTab/ObservanceList{vrat}`, `vratList`), the ★ follow affordance (`vratFollow`), My Vrat & reminders (`PanchangTab/MyVrat`, `myVrat`); **(19) Bhajan** — the library (`AudioTab`, `bhajanInside`); **(20–24) More** — Daily Reminder toggle (`MoreTab/Reminders`, `reminderToggle`), reminder times (`reminderTimes`), Japam Alarm add button (`MoreTab/JapamAlarms`, `japamAdd`), then the two rows the setup sheet asks for next: **Language** (`MoreTab/MoreHome`, `languageRow`) and **Reading Size** (`readingSizeRow`) — so the user has seen where both live *before* being asked to choose, and knows where to change them later. Both wrap their `SettingsRow` in a measurable `View` in `MoreScreen` and declare a `scrollNodeIntoView` reveal (the App group sits below the fold on smaller devices). Because the overlay is non-interactive, the vrat drill (16–18) auto-navigates and *describes* the ★-follow / 🔔-reminder affordances rather than expecting a tap. A compile-time check pins every `navigateTo.name` to a real `TabParamList` tab; `TAB_ORDER` maps each to its bar index for the tab-ring fallback. `TourNavTarget` allows a nested `{ screen, params }` for `HomeTab`, `MoreTab`, and `PanchangTab` (the last widened to reach `ObservanceList`/`MyVrat`). Element targets register via `useTourTarget(id, reveal?)` in `HomeScreen`, `CategoryListScreen`, `TheerthMapScreen`, `DailyBhaktiScreen`, `PanchangScreen`, `ObservanceListScreen`, `MyVratScreen`, `AudioLibraryScreen`, and `ReminderSettingsScreen`/`JapamAlarmsScreen`.

### First-run setup sheet (`mobile/src/components/OnboardingSetupSheet.tsx`)

**Purpose.** The walkthrough *shows* where language and reading size live; this sheet is where the first-run user actually **sets** them. Before it existed, a fresh install silently defaulted to Hindi at Standard size and a Gujarati/Kannada/English reader had to go find the More hub to fix it.

**Structure.** A bottom-sheet transparent `Modal` (slide up, `modalBackdrop`, grabber, `parchmentHighlight`, `radii` 22 top corners, `elevation.overlay`, `maxHeight: 88%` with the body in a `ScrollView` so large type scales still reach the button):

1. **Eyebrow** — `स्वागत है · Welcome` (`readerTitle`, 13, `saffron-deep`, centred).
2. **Title** — `भाषा चुनें` (`readerTitle` 24, `ink`) over italic `Choose your reading language` (`subtitle` 14, `ink-muted`), then a two-line note — "बाद में कभी भी 'अधिक' से बदल सकते हैं। / You can change this any time from More." (`meaning` 12, `ink-soft`).
3. **Language list** (`radiogroup`, `parchment-soft` card, `divider` border, `radii.lg`) — one `radio` row per entry in `LANGUAGES`: the language's own name in its **own script face** (`fontFamilies.latin` / `gujaratiBold` / `kannadaBold` / `readerTitle`, 19), its English name (`inter` 12, `ink-muted`) as secondary, and a `saffron` ✓ when selected (selected row: `saffron-tint` fill, `saffron-deep` label). Tapping applies immediately via `setLang` — the same shared state as every Language Toggle (§37), so nothing is staged or "saved" later.
4. **Reading size** — `पाठ का आकार` / italic `Reading size` headings, then the §43 two-preset pill row (`radiogroup`; `मानक · Standard` / `बड़ा · Large`, selected = `saffron` border + `saffron-tint` + ✓). Applies live via `setScale`; picking one does **not** dismiss the sheet.
5. **Live preview** — `READING_SIZE_SAMPLE[lang]` (exported from `ReadingSizePickerSheet`, so both sheets preview the same words) rendered with the reader's own `verseToken(lang)`, so it re-scripts and re-sizes on every tap.
6. **Begin** — solid `saffron`, `onPrimary`, `आरंभ करें · Begin`; calls `markOnboardingSetupCompleted()`. **The backdrop is deliberately not dismissable** — a stray tap must not skip the language choice; `Begin` (accepting the defaults) is the only exit.

**Bilingual, always** — like the tour, it runs *before* a reading language exists, so every chrome string is Hindi over English and nothing branches on `lang` (the language options need no translation: each is written in its own script). a11y labels are constant English — `Hindi` / `English` / `Gujarati` / `Kannada` (matching the §37 picker, so `language-smoke` selectors are shared), `Standard reading size` / `Large reading size` (qualified, because `snapshotKeyHonorModalViews:false` lets Maestro read the More rows *behind* the sheet, whose size state text is the bare word), and `Begin`. Self-mounts on `useTour().shouldShowOnboardingSetup` behind the same rising-edge ref guard as the tour.

### What's New sheet (`mobile/src/components/WhatsNewModal.tsx`)

`pageSheet` Modal, `parchment` fill. Header: title (`pick`-localized "What's New / नई सुविधाएँ / …", `titleFontByLang`, 20, `ink`) over a `vX.Y.Z` version line (`cardLatin` italic, tracked-uppercase, `ink-muted`); a `saffron` ✕ close. Body: a scroll of items, each a `saffron` bullet dot + title (17) + body (14/24, `ink-soft`). Footer: a solid-`saffron` "Got it" (localized). **Language-correct for all four:** text routes through `contentByLang(lang, hi, en)` (gu/kn re-script the Hindi) and fonts through `titleFontByLang` / `meaningToken` so gu/kn never render as tofu in a Devanagari face — this sheet fires for returning users who already have a reading language set, so it must not use a bare hi/en ternary (wiki `concepts/languages` Gotchas).

### Gating & persistence (`mobile/src/contexts/TourContext.tsx`)

Three AsyncStorage keys hold the last-seen **version string**: `@vedansh/tour-completed-v`, `@vedansh/whats-new-seen-v`, and `@vedansh/onboarding-setup-v`. A further signal — whether any deliberate-action key from a prior session exists (`UPGRADER_SIGNAL_KEYS`, re-exported from `NewContentContext`, §44) — separates a genuine fresh install from a returning user on the debut release (both lack the tour keys). This realises "**install → full tour, update → new-features-only**".

- **Fresh install** (no prior-usage keys, tour key absent) → `shouldShowFirstLaunchTour`. Completing or skipping (`markTourCompleted`) writes **both** keys to `APP_TOUR_VERSION`, so a brand-new user is never then double-prompted with the What's New sheet.
- **Update launch** (returning user — a prior-usage key exists) → the tour is suppressed and `shouldShowWhatsNew` fires instead: a `whatsNew` entry exists for `APP_TOUR_VERSION` **and** the what's-new key ≠ `APP_TOUR_VERSION`. `markWhatsNewSeen` advances only the what's-new key (never retroactively completes the tour). This is what makes the debut version's own release notes reachable — without the install/upgrade split they never would be (a tour-completer has already "seen" this version).
- **Setup sheet** → `shouldShowOnboardingSetup` fires when the setup key is absent, the tour's own gate has **closed**, and the session is a fresh install or a replay. So it is suppressed while the tour is up, opens the instant the tour is completed *or skipped* (the language choice matters either way), and never appears for a returning user — they already have a language. `markTourCompleted` deliberately does **not** write the setup key; `markOnboardingSetupCompleted` writes it alone.
- **Replay** → `resetTour()` sets an in-memory replay flag **and** clears all three keys, forcing the first-launch tour regardless of install-vs-upgrade classification or a prior completion (More → "Show App Tour", §37) — and the setup sheet after it, so replay reproduces the real first-run sequence. The setup sheet's arming flag is **separate** from the tour's `replayRequested` (which `markTourCompleted` clears at exactly the moment the sheet is due to open); only `markOnboardingSetupCompleted` clears it.
- `markTourCompleted`/`markWhatsNewSeen`/`resetTour` flip in-memory state **before** the awaited AsyncStorage write (mirroring `NotificationPreferences.persistMeta`), so a self-mounting surface that hides on dismissal can't read a stale "should show" and bounce back open. The surfaces additionally edge-guard auto-open with a ref (open once per episode, keyed on the gate — never on local `visible`).
- Storage-read failure defaults to a fresh install (still orients the user); a `getAllKeys` failure defaults to "returning user" (show the lighter What's New, not the full tour, to someone who may already know the app). Write failures still flip in-memory state so the surface doesn't loop within a session.

**Content lives in `mobile/src/data/tour/whatsNew.ts`:** `APP_TOUR_VERSION` (must equal `app.json` `expo.version`), a per-version `whatsNew` map of bilingual `items`, and `getWhatsNewForVersion()` (returns null for unknown or empty entries → sheet suppressed).

**Files:** `mobile/src/components/FeatureTour.tsx`, `OnboardingSetupSheet.tsx`, `WhatsNewModal.tsx`; `mobile/src/components/tour/{tourTargets,placement}.ts` (spotlight registry + `reveal`/`scrollNodeIntoView` + pure card placement + `measureSettled`); `mobile/src/contexts/TourContext.tsx`; `mobile/src/data/tour/{steps,whatsNew}.ts`; the spotlight refs live in `HomeScreen`, `CategoryListScreen`, `TheerthMapScreen`, `DailyBhaktiScreen`, `PanchangScreen`, `ObservanceListScreen`, `MyVratScreen`, `AudioLibraryScreen`, `ReminderSettingsScreen`, `JapamAlarmsScreen`, `MoreScreen` (and `RoutineBanner` forwards a `bannerRef`); wired in `mobile/App.tsx` (top-level overlay + setup sheet), replay row in `MoreScreen.tsx` (§37). Tests: `src/contexts/__tests__/TourContext.test.tsx`, `src/components/__tests__/FeatureTour.test.tsx`, `src/components/__tests__/OnboardingSetupSheet.test.tsx`, `src/components/__tests__/tourPlacement.test.ts`, `src/data/__tests__/tourContent.jest.test.ts`; e2e `.maestro/feature-tour-e2e.yaml` (+ `_launch.yaml` dismisses the auto-tour **and** the setup sheet for every other flow).

---

## 48. Home Today Strip (आज का पंचांग)

**Purpose.** Make Home answer *"what matters today"*, not only *"what can I read"*. One glance-card between the wordmark hero and the CATEGORIES grid (§18) surfaces the day's panchang state; the full detail stays on the Panchang tab. This closed the daily-freshness gap identified in the July 2026 competitive review — the previous Home rendered identically on every visit.

**Structure (`TodayStrip.tsx`):**

1. **Eyebrow row** — `आज का पंचांग` / `Today's Panchang` via **`eyebrowTextStyle()`** (`utils/langType.ts`, 12, `saffron-deep`; italic Cormorant + tracking for en, script-bold serif with no tracking for hi/gu/kn — Cormorant has no Indic glyphs and Latin tracking splits the shirorekha, §3; the Muhurat glance card shares the same helper) with a `saffron-deep` `›` affordance right-aligned (`saffron` fails the 4.5:1 floor on the gradient).
2. **Headline** — hi/gu/kn `{vara} · {paksha} {tithi}` (e.g. `शनिवार · शुक्ल एकादशी`); en `{vara} · {tithi} ({paksha})` (e.g. `Saturday · Ekadashi (Shukla)`), one line: script-bold serif for hi/gu/kn (`scriptTitleFont`), `latinBold 17` (+0.3 tracking) for en; `ink`. Paksha display names come from `PAKSHA_NAMES_HI/EN` (`panchang/names.ts`). Shows `—` while the day is unresolved — but on a returning launch it should never be seen: the launch prefetch (§61) warms the day from disk at process start, so the seeded `useMuhurat` composes on the strip's first render and the headline paints with the rest of Home. The `—` is the genuine cold state (fresh install, city just changed, day not yet on disk), not a routine startup frame.
3. **Chip row** — **one fixed-height horizontal-scroll row** (`ScrollView horizontal`, no indicator, gap 6; full-bleed via −14 margin / +14 content padding so a clipped chip peeks at the card edge and signals the scroll). The July 2026 shipped version let the chips *wrap*, which on narrow devices stacked up to four pills into a tall block; the row now never wraps — overflow scrolls sideways instead, so the card height is the same on every device. Drags scroll; plain taps still bubble to the card `Pressable` (a ScrollView only claims the responder on move). **Overflow drifts ONCE, on a timer, after the launch has settled** (~24px/s, ~1.8s pause at each end; `AUTO_SCROLL_*` in `TodayStrip.tsx`): when the content is wider than the row, the row crawls to the end and back a single time so hidden chips surface without a drag, and then rests. It is **not** an `Animated.loop` — that is the whole history of this affordance, and the reason it is now a plain `setTimeout` stepping a number. The drift cannot use the native driver (it drives `scrollTo`), so as an `Animated` animation it cost a `requestAnimationFrame` tick **and** a `scrollTo` bridge call every frame, endlessly, on the one screen every launch lands on. Its first casualty was `isInteraction` — which defaults to `!useNativeDriver`, so every drift and pause claimed an `InteractionManager` handle and Home almost never reported an idle UI, starving the day's observance chips, the pitru match, the muhurat/festive schedulers, the widget writer and the strip's own midnight rollover (§61). Declaring `isInteraction: false` (Aug 2026) unblocked all of that — and by letting the observance chips finally arrive it *created* the overflow that starts the drift, so Home traded "never idle" for one endless JS-thread animation racing every deferred solve on the launch path, with taps landing late behind it. A decorative reveal cannot hold the JS thread at 60Hz, and no flag was going to fix that. Current shape: a self-scheduling `setTimeout` at **`AUTO_SCROLL_TICK_MS` 50** (≈1.2px a tick — imperceptible stepping at this speed, a third of the wake-ups), which ticks **only while actually drifting** (an end pause is one idle timer, not 108 no-op frames), pushes `scrollTo` **only when the rounded pixel changes**, waits **`AUTO_SCROLL_SETTLE_MS` 1200 after the last content change** so the launch's own churn keeps pushing it clear rather than racing it, and **stops for good after one out-and-back** — Home then goes fully idle. Lifecycle contract: the first user drag stops it **for good**; it **pauses while the Home tab is unfocused** (`useIsFocused` — bottom-tab screens stay mounted, so an ungated pass would burn JS-thread frames from other tabs); it never runs under reduce-motion (**`useReducedMotion`** — the shared subscribed hook, §11, so a mid-session preference flip stops/allows it live); it only starts once the row has a measured width and >8px of real overflow; and a **genuine content-width change** (the deferred chips landing, a language switch, the midnight rollover) is the one thing that re-arms exactly one fresh pass — re-serving the settle delay with it, so several changes in a row collapse into one drift after the last of them. Every timer it owns lives in the same ref and is cleared by `stopAutoScroll`, so nothing can tick after unmount. Pinned by `TodayStrip.test.tsx` → "chip-row auto-drift" (silent through the settle window; reaches the far offset and returns to 0; then silent for a further 60s). One normalized chip list so the pill spec exists once: up to **2 observance chips** for today (`saffronTint` fill, `saffron-deep` text), then an **Abhijit chip** (`goldChipBg` fill, `saffron-deep`) and a **Rahu Kaal chip** (`avoidChipBg` fill, **`avoidDeep`** text — the tint composites darker than the card, so raw `avoid` drops under AA there; terracotta, never red, PRD-14). The kaal chip's label comes from the `KaalWindow`'s own `nameHi/nameEn` (KAAL_NAMES, `muhurat.ts`) — no duplicated literals. Chip names render via `pillTextStyle()` (Inter for en; script serif, no tracking, for Indic); the **time ranges render in `latinSemiBold` 11** — never the thin italic (§3) — and use **`formatRangeCompact()`** (`muhuratFormat.ts`): the shared meridiem written once (`3:37 – 5:13 PM`), full form when the window crosses noon/midnight.

**Surface.** `cardActiveFrom → cardActiveTo` gradient, 1px `cardActiveBorder`, `radii.lg`, **`elevation.raised`** (theme token). Opaque `cardActiveFrom` base, no `overflow: 'hidden'` (it would clip the iOS shadow) — the gradient carries its own radius. The §19/§32 card family.

**Behaviour.**

- Whole card is one `Pressable` → parent-tab navigate to `PanchangTab` (same bubble-up pattern as `RoutineBanner`). It opens on the **first** tap: the card is wired to the shared Home first-tap controller (`onPressIn`/`onPressOut`/`onPress` → `TilePressContext`, §18), and the chip row's `onScrollBeginDrag` marks a horizontal chip swipe as a scroll so it never opens the tab.
- Data comes from **one solve**: `useMuhurat(today, calendarSystem, { live: false })` supplies both the muhurat windows **and** the day's `PanchangData` (cached, off the render path); observances ride the lighter `useObservancesForDate` (split out of `usePanchangForSelection` so the strip never pays for the upcoming-window resolution it doesn't render). `live: false` skips the per-minute tick — the strip shows only static day windows; the date instead rolls over via **`useTodayKey()`** (`utils/useTodayKey.ts`): a timer just past local midnight plus an AppState foreground re-check, so an overnight-backgrounded app never shows yesterday's panchang. A mid-session observance-store upgrade re-resolves the chips **without** clearing them first (no blink; `useObservancesForDate` resets only when the day/city/system changes). The calendar system itself is a **module-level store** (`usePanchangCalendarSystem`), so a purnimant/amanta change on the Panchang tab propagates to the mounted Home strip immediately.
- The public **पितृ पक्ष chip** takes the same three-rule cache path as every other panchang answer here (`usePitruSmaranSolves`, §63): seed synchronously from the in-memory window, hydrate from disk **immediately** (I/O, which also primes the engine's own window memo), and defer **only astronomy** behind `InteractionManager`. The split is exact: a known fortnight that today falls *outside* is a date comparison and answers for free (the ~350-day case), while anything inside it needs the day's two tithi reads and therefore waits like the fortnight scan does. It shipped as a bare `setTimeout(…, 0)` around the raw engine call, which put the fortnight's cold solve — a Bhadrapada-Purnima scan plus a 20-day amavasya walk, ~250ms on Hermes and unyielded — on the launch path of Home, on *every* launch, because it never went through the persisted `pitruSmaranSolves` layer that exists to make it a once-per-install cost. A solve that does run is persisted (`persistSmaranSolves`) so no later launch repeats it. Pinned by `TodayStrip.test.tsx` → "Pitru-Paksha chip".
- Accessibility: single button, label `"Today's Panchang. {vara}, {tithi}. {observances}. Tap to open."`.

**Files:** `mobile/src/components/TodayStrip.tsx`; consumed by `HomeScreen.tsx` (§18).

---

## 49. Continue-Reading Card (जारी रखें) — RETIRED (July 2026)

**What it was.** A single-row `parchmentSoft` card below the CATEGORIES grid (§18) that resumed the most recent reading position (thumb tile + `जारी रखें` eyebrow + title + `formatLocation()` position + `पढ़ें ›` pill), walking progress entries newest-first and routing through `navigateToProgress()`.

**Why it went.** Removed by product decision in the July 2026 Home-density pass — the card added a third always-on block between the grid and DISCOVER, and resume already lives where reading starts: the **`ResumeReadingSheet`** behind every category list (§21, e2e `resume-reading-smoke.yaml`).

**What survives it.**

- **`ReadingProgressContext` same-page guard** (restored to the pre-card behavior): a same-verse, same-day `setProgress` is a **hard no-op** — no persist, no `logRead`. A recency-refresh variant (bump `updatedAt` on re-open) shipped briefly alongside this card and was **reverted by review**: routine/sadhana completion and its `doneAt` timestamp are derived *live* from `getProgress()`'s max-`updatedAt` entry (`routine/units.ts`, `useSadhanaToday`), so bumping a sibling chapter's entry on a mere re-open flipped which entry was "latest" and un-completed items finished earlier that day. Cross-day same-page writes still persist + log (streak refresh). What DID stay from that work: `setProgress`/`clearProgress` are now **identity-stable** (a `progressRef` mirror, same pattern as `UserActivityContext`'s `activityRef`), so the 15+ reader persist-effects keyed on `setProgress` no longer re-run on every write from anywhere.
- `navigateToProgress()` (`entryRoutes.ts`) — still the shared resume-routing path for the sheets and notification deep links; it returns `false` for unroutable entries. (`canResumeProgress()`, the card's render gate, was deleted with the card — it had no other callers.)

**Deleted files:** `ContinueReadingCard.tsx` (+ test), `utils/latestProgress.ts` (+ test); the `HomeScreen` slot and the `home-today-smoke.yaml` continue-reading leg went with them. Re-introducing a Home resume surface should start from this section's history (`git log --follow -- mobile/src/components/ContinueReadingCard.tsx`).

---

## 50. Intent-Driven Discovery (उद्देश्य)

**Purpose.** PRD-B makes the expanded library findable by user need, day, festival, and deity hub. The feature is metadata-first: it never creates an astrological prescription engine and never generates devotional associations. Curated tags live in `mobile/src/data/discoveryMeta.ts`, purpose labels in `purposes.ts`, and tests pin source lines plus valid ids.

### Browse by Purpose

Entry point: the Home launcher grid's **उद्देश्य · By Purpose** tile (§18), placed next to By Deity. `BrowseByPurposeScreen.tsx` uses the same top bar/back-button treatment as Category and Deity screens, on a random deity background plate. The body is a 3-column launcher grid of purpose tiles from `purposes.ts`; each tile uses the compact `CategoryCard` launcher with an icon from the existing category icon set, plus a small English caption so the prototype's hi/en intent tiles remain visible even in Hindi mode. Tapping a purpose pushes `PurposeList`.

`PurposeListScreen.tsx` mirrors `CategoryListScreen`: title is ordered by `orderTitlesByLanguage()`, background is a faded hymn plate, rows are `LibraryCard`s from `textsForPurpose(purposeId)`, and all row navigation goes through `navigateToEntryStart()`. Existing resume behaviour is preserved with `ResumeReadingSheet`.

Search is a secondary entry point: `searchIndex.ts` folds each tagged text's purpose display names and ids into the section fields, so queries like `protection` or `सुरक्षा` find the associated texts.

### Reader Metadata Panel

`WhenToRecitePanel.tsx` renders the text-level ritual metadata from `discoveryMeta`: best days, festivals, best time, purpose chips, and optional Viniyog rows (rishi, chandas, devata). It uses the same parchment/card surface family as other reader metadata: `cardSurface`, `cardActiveBorder`, `radii.lg`, `sectionLabel`, `cardMeta`, and saffron-tint chips.

Placement is **first verse page only**: `VersePage` exposes a `belowContent` slot, and each flat reader passes the panel only when `index === 0`. The panel appears below the verse meaning inside that page's vertical scroll. Swiping to verse 2 and beyond gives plain verse pages. This avoids repeating whole-text metadata on every verse and matches the approved PRD-B prototype update.

### For Today

`TodayRecommendationsRow.tsx` sits below `TodayStrip` and above the Routine banner on Home. It calls `getTodayRecommendationDetails(new Date(useTodayKey()))`. The row is a horizontal scroll of `FeatureCard compact` strips (196px, the §32 shell); tapping opens the existing reader target via `navigateToEntryStart` and opens on the **first** tap — each card and the row are wired to the shared Home first-tap controller (`TilePressContext`, §18). It is intentionally a small row, not a second panchang card.

**Name-only strip (Aug 2026).** The row used to carry the full §32 spotlight card — 292px wide, ~130 tall, blurb and CTA pill and all — which made Home's today cluster (Panchang strip + FOR TODAY + routine banner) fill the first screenful before a single category tile showed. It now uses the §32 `compact` variant: icon, name, chevron, **56** tall. The `पढ़ें`/*Read* pill is gone (it was never a button — the whole card is the press target) and so is the blurb line — **on an ordinary day that line said `आज के लिए अनुशंसित` / *Recommended for today* underneath a section heading already reading आज के लिए / FOR TODAY**, so it spent a third of the card restating its own eyebrow. The heading carries the "for today" framing for the whole row; the card only has to name the reading. The eyebrow's own spacing tightened with it (`marginTop` 16 → 12, gap 8 → 6) and the width dropped 292 → 196, which together take the row's block from 170 to 90 — about one CATEGORIES row pulled above the fold, with more of the day's recommendations visible per scroll. The abujh card (§57) rides the same variant, so the row stays one visual family.

**Touch band (Aug 2026 follow-up).** Flattening the card to ~56pt made the horizontal swipe flaky: a swipe would randomly open a card or stall instead of scrolling. Cause — the cards are `Pressable`s inside the row's horizontal `ScrollView`, and the first-tap recovery (§ "First-tap recovery") only suppresses the tap when the ScrollView fires `onScrollBeginDrag`. In a band that thin, an arced horizontal flick starts near the band edge and the horizontal scroll loses the first-pixel gesture negotiation to the Pressable / outer vertical page-scroll, so `onScrollBeginDrag` never fires and the tap-fallback wins. Fix: the strip's `contentContainerStyle` carries `paddingVertical: 10` (and `decelerationRate="fast"`, matching the DISCOVER carousel), which enlarges the *scrollable frame* and the arc tolerance — the touch target, not the visible card (still ~56pt) — so the horizontal scroll reliably wins. The eyebrow `gap` dropped to 0 to absorb the band's own top padding. The DISCOVER carousel now carries the same touch-band padding (§32) — its taller cards made the failure rarer, not impossible, since the negotiation race is the same.

**Where the festival attribution went.** The dropped blurb was not inert: on a festival day it read `आज <festival> है` / *Today is `<festival>`*, honouring what the morning's festive reminder promised (§38). That attribution is **still computed and still handed to the card** — `getTodayRecommendationDetails` is unchanged, and `festiveReminders.test.ts` still fails if the row and the notification disagree — it simply is no longer *painted*. It reaches the user two other ways, both of which resolve the same festival off the same catalog: the card's **accessibility label** (`"{titleEn}. {descEn} Tap to open."`, so VoiceOver still says *Today is Diwali*), and the **festive toran** (§55), which hangs its garland and greeting directly above this row on every catalog festival. A festival outside the toran's catalog (tiers 2–3 of the ordering above) therefore names the occasion only in the accessibility label — accepted deliberately when the row was shortened; revisit by restoring the blurb on festival-attributed cards alone if that tier ever needs the visual cue.

**Title width.** With the blurb gone the name is the whole card, so 196 is load-bearing: it leaves ~108pt for the title after the icon, gaps and chevron. A typical name clears it (हनुमान चालीसा ≈ 80pt at 17); the longest shipped one (विष्णु सहस्रनाम अंश ≈ 105pt) sits at the edge and ellipsizes under a raised system font scale. Widen `cardWrap` in `TodayRecommendationsRow`, not `FeatureCard` — the strip sizes to whatever width the row hands it.

**Decision trail.** Four treatments were prototyped side by side at a shared 390×844 fold in `today-row-compact-preview.html` at the repo root: **A** the shipped 292×130 spotlight card, **B** a 248×68 strip keeping the blurb, **C** this 196×56 name-only strip, **D** the नित्य साधना launcher tile taken literally (110×97, caption below the box). D was rejected — its caption sits *outside* the 72pt tile so it saves the least, at 110pt wide it cannot hold a text title, and it reads as a second CATEGORIES grid a screen above the real one. C was chosen over B: it is 12pt shorter per card and shows appreciably more per viewport, and the blurb it costs is recoverable through the two surfaces above.

**Festival first (Aug 2026).** The recommendation order is four tiers, and the festival ones come before the weekday one: **(1)** the curated festival → reading mapping in `notifications/festiveReminders.ts`, **(2)** the observance rule's own `linkSectionId` (festivals outside that curated catalog), **(3)** texts whose `bestFestivals` metadata names one of today's observances, then **(4)** `deityForWeekday()`'s vaar deity, which is what an ordinary day is made of. An ordinary day is therefore unchanged; a festival day leads with the occasion. This is not cosmetic ordering: a festive reminder (§38) lands the user on **Home**, so the reading its message named has to be the first thing waiting — both surfaces read the same catalog, and `festiveReminders.test.ts` fails if they disagree. Entries returned with a festival attribution carry `आज <festival> है` / *Today is `<festival>`* in place of the generic `आज के लिए अनुशंसित` / *Recommended for today* line, so the card names the occasion the notification greeted the user with. Since the row went name-only, neither line is *painted* on the card any more — see "Where the festival attribution went" below for the two surfaces that still deliver it. `getTodayRecommendationsForDate()` remains as the entry-only view for callers that don't need the attribution. An observance lookup that throws degrades to the weekday tier rather than emptying the row.

### Deity Detail

`DeityIndexScreen` now opens `DeityDetailScreen`. The detail page keeps the existing deity background and top bar, then shows a source-cited essay from `deityEssays.ts` followed by that deity's texts grouped by content form (`categories.ts` order). Each group heading uses `sectionLabel`; entries remain `LibraryCard`s and route through `navigateToEntryStart()`. `DeityListScreen` remains a compatibility fallback for direct filtered-list navigation.

---

## 51. Kundali + Daily Rashifal (PRD-C)

**Discovery and landing state.** Kundali is a permanent `CategoryCard variant="launcher"` on Home (`कुंडली · Kundali`, insight glyph, NEW badge), not a shuffled Discover card. It deep-links to `PanchangHome({ initialTab: 'jyotish' })`. Panchang's top peer selector is `Panchang | Vrat & Parv | Jyotish`; it remains the fixed first control in every mode, while location/calendar-system/My Vrat controls appear beneath it only for the two Panchang-derived modes. A guest sees Create Kundali, Daily Rashifal, and one Navagraha practice card. Once a birth profile is saved, the landing becomes daily-first: the person switcher (§51a) leads, then the full Favour/Pause/Reflect Rashifal card, a compact Kundali reference, and the same single practice card closing the page. Returning from creation must refresh this saved state immediately. Birth city remains independent of the current Panchang location. Since PRD-20, the saved landing's guidance rows are computed by `computePersonalGuidance` from the ACTIVE person's FULL chart: the Favour/Pause/Reflect bodies stay byte-identical to the Moon-sign Rashifal (the superset lock), extended with dual चन्द्र-से/लग्न-से house context pills and a quiet gold `दशा संकेत · Dasha note` row that appears only when a focus transit belongs to a running Vimshottari lord. The eyebrow follows §51a's naming rule — `आपकी पूरी कुंडली से · From your full chart` with one person saved, `<name> की पूरी कुंडली से · From <name>'s full chart` once the roster holds more than one, because "your" would then be a guess. The compact Kundali card gains a `पूर्ण कुंडली विवेचन खोलें` link (§68) and, only while a Sade Sati phase is active, a gold-tint teaser row into Gochar (§67); a `गोचर · Gochar` tool card sits after the contractual trio, before Guna Milan/Namkaran. Guest and error landings carry none of these — every PRD-20 surface requires a saved chart.

**Birth input and state.** One card asks for optional name, birth date, birth time, and a bundled Indian city. Date and time are entered through pickers, not free text: the date field-button opens `CalendarDatePicker` (a parchment month-grid bottom sheet with a month/year overlay for jumping across decades, range `1900-01-01`…today-IST) and the time field-button reveals the inline reminder-style `ClockTimePicker` (12-hour AM/PM stepper). Both still emit the stored contract — `YYYY-MM-DD` and 24-hour `HH:mm` — so validation, IST→UTC conversion, and persistence are unchanged; the `kundali-date-input`/`kundali-time-input` testIDs move onto the field-buttons. Tapping the time field commits a 06:00 default so the shown value and stored value always agree, and an untouched time still validates as missing. No city or “Default profile” is silently supplied: the city field begins at “Choose an Indian city”, and nearby copy plainly explains that current calculation support covers Indian birth places and their local IST time. Profiles persist on-device in the birth-profile roster under `@vedansh:kundali-profiles:v1` (**§51a** — several people, one active selection; the PRD-C single-profile key migrates into it once); Edit opens the manage form for the active person, where removal is deliberately secondary to Save/Cancel. Copy explains that correct birth time matters for Lagna/houses. Loading, guest, saved, persistence-error, and corrupt-profile recovery are explicit states; a failed save/delete must never masquerade as success. Opening/closing the city picker dismisses its keyboard, and a successful calculation returns the result to its top.

**Novice-first result.** The default `Overview` tab precedes `Chart | Grahas | Dasha`. Its three cards are real buttons and route to their underlying detail tabs; each tab change resets the scroll position. Rashi names pair the traditional form with a plain-English equivalent (`Karka · Cancer`, never the same name twice). The Lagna card uses: “Lagna is the sign rising at birth and sets the first house. In traditional Jyotish it is the starting lens for reading the rest of the chart.” The Moon card uses: “The Moon sign is a traditional lens on inner rhythm, and the nakshatra refines its placement. A reflection aid, not a personality verdict.” A Navagraha practice card routes through the existing library/reader dispatcher. Never lead a novice with an unexplained chart.

**North Indian chart.** `NorthIndianChart` is a fixed-house North Indian diamond rendered with `react-native-svg`: first house at top, seventh at bottom, small numeric rashi labels, two-letter graha abbreviations. Its enclosing accessible image label narrates all twelve houses and occupants; chart geometry is never the only representation because the Grahas table carries the same values textually.

**Grahas and Dasha.** Graha rows show the traditional sign plus its plain-English equivalent, degree/minute, house, actual nakshatra/pada, and `℞` for retrograde. The Dasha view leads with the current Mahadasha/Antardasha; both nested periods are running at once, so the card gives **each window its own labelled row** — `महादशा` dates, progress bar and elapsed/left, then `अन्तर्दशा` dates, progress bar and elapsed/left (a single unlabelled range and bar under a two-lord headline read as the Antardasha lasting the whole Mahadasha). The Antardasha row is absent only when engine float accumulation leaves now outside all nine sub-periods at a boundary. Durations drop to day granularity under one month so a just-begun Antardasha never reads `0 m`. An inline `Now` Antardasha chip row follows under the caption “इस महादशा की नौ अन्तर्दशाएँ / The nine Antardashas within this Mahadasha”, and a connected vertical timeline under the “महादशा समयरेखा / MAHADASHA TIMELINE” eyebrow then shows all nine Mahadashas with dates. Both levels are legitimately `Now` at once (the running Antardasha chip and its enclosing Mahadasha row), so each level is explicitly named — two unlabelled `Now` tags on different lords read as a bug. Both views include a short explanation before raw data, and Dasha timing is included in the accessible summary.

**Rashifal.** Daily Rashifal selects the ACTIVE person's Kundali Moon sign when available, otherwise lets the user choose any of twelve signs; with more than one person saved it also carries the §51a switcher, and choosing a person adopts that person's natal sign. The source card says whether it came from the Kundali, and Change exposes a 12-sign grid pairing every traditional name with its plain-English equivalent. Guidance is consistently `Favour`, `Pause`, and `Reflect`; the full Rashifal page adds the supporting graha/bhava chip to each row, followed by the one existing Surya/Shani/Navagraha reader selected by the pure transit rules. The disclaimer is part of the surface, not fine print: “traditional transit-based guidance—not a certain prediction.” No luck score, guaranteed event, fear copy, random generation, AI call, or remote horoscope feed. **Personal layer (PRD-20):** when the active person has a chart AND the selected sign equals THAT person's natal Moon sign, the guidance head adds two quiet pills — `तारा बल · <name>` (tinted by its tone: gold favourable, saffron reflective, card-surface steady) and `व्यक्तिगत पाठ · Personal reading` — and the rows show the dual-house pills and dasha note; picking any other sign strips every personal extra. The share card and its no-birth-details privacy contract are unchanged in both cases.

**Sharing.** Both result surfaces use the same 4:5, 1080×1350 share-preview family and expose a single header Share action. Kundali sharing is opt-in and warns that chart name, birth date, time, and city are included. Rashifal sharing includes Moon-sign guidance and the suggested existing practice, but explicitly excludes name and birth details. There is no second or floating share button inside the Kundali tabs.

**Share-card fit (August 2026).** The card's height is *pinned* — `aspectRatio` 4:5 on a width of `min(334, screenWidth - 2 × spacing.xxl)`, with `overflow: 'hidden'` — while everything stacked inside it is type at fixed point sizes that does not scale with width. So the Kundali diagram takes **the height that is left** (`kundaliChartSize()`: content height minus a 196 dp chrome budget for the brand header, name lockup, chip row and two-line method footer, capped at the historic `min(208, width × 0.61)`), never a flat fraction of the width. Sizing it by width alone overran the box on every card below ~334 dp — a 360 dp phone gets 312 — and the `marginTop: 'auto'` method footer was the piece pushed out and clipped. The footer's own leading follows §3.0 (10/14, script-aware face). Both invariants are pinned by `components/__tests__/jyotishShareCardFit.test.tsx` and the footer line is asserted in `kundali-smoke.yaml`. **Known gap:** the Rashifal card's chrome is *entirely* fixed-height (three `minHeight` guidance rows + practice + disclaimer ≈ 375 dp), so it has no comparable slack on ≤ 360 dp phones; it fits at 334 and its disclaimer leading is fixed, but the row block wants the same treatment before that card is trusted on small screens.

**Surface family.** Continue the existing warm manuscript palette only: parchment gradients, `cardActiveBorder`, saffron/gold tints, `radii.lg`, theme elevation, existing script-aware type helpers, and controls that respect the §12 minimum — back buttons at 44 (both KundaliScreen and RashifalScreen drifted to 40 and were corrected in July 2026), the name field via the `TextField` `form` variant at 48 (§52), and the date/time via the shared `CalendarDatePicker` + `ClockTimePicker` controls (§52a) — all field-buttons at a 48 minimum. Do not introduce one-off colours for guidance rows, practice, or share cards; all variants must come from theme tokens already used by the app. English accessibility labels include both traditional and plain-English sign names and remain stable for Maestro even when Hindi is the visible reading language.

**Readability sizing (July 2026).** The §3.0 floor (10) is a *minimum*, not a target — Kundali and Rashifal carry unusually dense content (sign grids, graha tables, dasha timelines), so their read-tier text sits **above** the floor for comfort: the Rashi-picker grid uses traditional name **16** / plain-English **14** on taller (`minHeight 64`) tiles; its "choose your sign" **title** reads as a heading at **15** with a **14** description and a **13** disclaimer above; the guidance-row headers/body and their graha·bhava context chips, the Kundali overview eyebrow, and the result-screen labels (`lagnaLabel`/`lagnaTranslation`, grahas `tablePrimary` **14** / `tableTranslation` **12**, `eyebrowText`, `progressCaption`, `practiceLabel`) were raised to **12** (space-constrained dasha `antarChip`/`nowTag` to **11**). Micro-chrome shared with the Panchang tab (the `jyotishSectionLabel` kicker, tab-bar) stays at the floor.

**Files.** `mobile/src/panchang/kundali.ts`, `useKundali.ts`, `birthProfiles.ts`, `birthProfileStore.ts` (§51a), `gochar.ts`, `dashaReading.ts` (PRD-20); `NorthIndianChart.tsx`, `KundaliOverview.tsx`, `JyotishGuidanceRows.tsx`, `JyotishPracticeCard.tsx`, `JyotishShareCard.tsx`, `JyotishShareSheet.tsx`, `JyotishStateCard.tsx`, `PersonChips.tsx` (§51a), `CalendarDatePicker.tsx`, `ClockTimePicker.tsx`, `StepperColumn.tsx` (§52a); `KundaliScreen.tsx`, `RashifalScreen.tsx`; `PanchangScreen.tsx`, `HomeScreen.tsx`, Panchang navigation types/stack; `.maestro/kundali-smoke.yaml`.

**Dasha reading (PRD-20 Phase 4).** The Dasha tab inserts one `इस अवधि का पाठ · Reading this period` card between the current-period block and the `महादशा समयरेखा / MAHADASHA TIMELINE` eyebrow that heads the full timeline: title (`<lord> महादशा · <lord> अन्तर्दशा`), the lord's authored classical signification (every one opens `परम्परा में… / Tradition links…`), the lord's natal rashi/house placement line, and a muted Antardasha overlay line. Copy comes from `dashaReading.ts`'s typed tables — structural only, pinned by a banned-vocabulary engine test — and the card carries one complete accessibility label.

---

## 51a. Multi-person Jyotish — the birth-profile roster (August 2026)

**Purpose.** One phone, several people. PRD-C stored exactly ONE birth profile, so
a household could hold one person's Kundali at a time and a second person meant
overwriting the first. The profile is now a **roster** — every saved person plus
one **active** selection — and every personalised surface reads that selection:
the Kundali result, the Jyotish landing's Daily Rashifal card and chart glance,
the Rashifal screen, and the muhurat finder's आपके लिए Tarabala/Chandrabala strip.

**One selection, one store.** `panchang/birthProfiles.ts` is the pure model
(validate, parse, add/update/remove/select, `activePerson`) and
`panchang/birthProfileStore.ts` is its AsyncStorage half with one in-memory
snapshot, a subscriber list and a serialized write queue — the same
pure-store/RN-cache split as `panchangDayStore` ⇄ `panchangDayCache`. **No screen
may keep its own "current person":** switching anywhere is true everywhere on the
same render, which is the whole point of the feature.

**Storage.** `@vedansh:kundali-profiles:v1` = `{ activeId, people[] }`; a
`PersonProfile.id` is a persisted key, never a display string. `MAX_PEOPLE` is
**8** — a household ceiling, not a technical one: at the cap the `+ जोड़ें` chip
is replaced by a plain sentence instead of failing a save silently. The shipped
single-profile key `@vedansh:kundali-birth-profile:v1` migrates **once** into
person one and is then removed, because leaving it would keep a readable copy of
birth details after that person is removed. An *unreadable* legacy record is never
deleted and still lands in the shipped corrupt-profile recovery state.

**The switcher (`PersonChips.tsx`).** A horizontal chip row, never a dropdown:
who a chart belongs to is *visible state*, not a setting — on a shared phone the
wrong active person is a wrong Rashifal, and a collapsed picker hides that. Chips
are controls, so they carry the §12 44 pt floor, a `1.25` font-scale cap (dense
chrome, §61's rule), `radii.pill`, `saffronTint`/`saffronDeep` for the selected
one and `parchmentSoft`/`divider` otherwise; the trailing add chip is dashed. A
person is labelled by their **name**, or by their birth date when unnamed — never
an invented "Person 2" and never an id. Labels per surface: `किसकी कुंडली · Whose
chart` (Kundali), `किसका ज्योतिष · Whose Jyotish` (landing), `किसका राशिफल · Whose
Rashifal` (Rashifal). English accessibility labels stay stable in every reading
language: `Show Kundali for <label>`, `Show Jyotish for <label>`, `Show Rashifal
for <label>`, `Add another person`, and the row itself is `Person switcher`.

**Placement.** The switcher sits ABOVE what it changes: on the Kundali screen it
is the first thing under the top bar in every state (so adding a second person is
one tap from the first person's own chart), and on the Jyotish landing it sits
between the intro and the Rashifal card. It renders only when at least one person
is saved — a guest still gets the untouched creation landing.

**Adding is additive, never a rewrite.** `+ जोड़ें` opens a BLANK form
(`Kundali { newPerson: true }`, heading `नई कुंडली जोड़ें · Add another Kundali`)
with the saved people untouched and no chip selected; `बदलें · Edit` still edits
the active person. Removing one of several people lands on a **survivor's** chart,
not the blank form; removing the last one returns the guest state and the switcher
disappears with them.

**Whose is it?** With more than one person saved, copy that used to say "your"
names the person instead — `चन्द्र राशि · <नाम> की कुंडली से · Moon sign · From
<name>'s Kundali` on the landing and Rashifal, and the muhurat strip's label
becomes `<नाम> के लिए · For <name>`. With a single saved person every one of those
strings is unchanged, so the solo experience is exactly what shipped.

**Unchanged by design.** Birth city is still not the Panchang location; Rashifal
remains guidance, not prediction; the muhurat strip still only annotates (it never
re-grades a day, and no name reaches a share card or a notification); Guna Milan's
"use saved details" copies the active person, as it always copied the saved one;
Namkaran still never reads a birth profile at all.

**Files.** `mobile/src/panchang/birthProfiles.ts`, `birthProfileStore.ts`,
`useKundali.ts`, `useMuhuratBala.ts`; `components/PersonChips.tsx`,
`MuhuratBalaStrip.tsx`; `KundaliScreen.tsx`, `RashifalScreen.tsx`,
`PanchangScreen.tsx`; `navigation/types.ts`. Tests:
`panchang/__tests__/jest/birthProfiles.jest.test.ts`,
`screens/__tests__/MultiProfileJyotish.test.tsx`,
`screens/__tests__/MuhuratPersonalStrip.test.tsx`;
`.maestro/multi-profile-jyotish-smoke.yaml`.

---

## 52. Component: Text Field (`TextField.tsx`)

**Purpose.** The spec for every **standalone** text input — a field that owns its own height,
border, fill and face.

A July 2026 audit found three specs for one control class — content-search fields at 44 in
Cormorant 15, Kundali's form inputs at 48 in Inter 14, and Kundali's modal city search at 46 —
i.e. three heights, two typefaces and two padding values for the same job. The rule is now
typographic, matching how the system already splits its faces (§3):

| Variant | Height | Face | Padding | Use |
| --- | --- | --- | --- | --- |
| `search` (default) | 44 | `fontFamilies.latin` (Cormorant) 15 | 14 | Searching **content** — kathas, observances, the vrat catalog. The query is set in the same reading face as the results it returns. |
| `form` | 48 | `fontFamilies.inter` 14 | 13 | **Data entry** — birth date, birth time, name, and the city lookup inside that form. A value is data, not devotional text. Taller to sit comfortably in a stacked form. |

**Shared spec.** Full width, 1 px `divider` border, `parchmentSoft` fill, `radii.md`, `ink`
text, `inkMuted` placeholder. Both variants clear the §12 44 pt touch minimum. Callers pass
content and per-field overrides only (e.g. an error-state `borderColor`), never geometry.

**Not in scope: composite search bars.** The global Search top bar (§36) is a `searchPill`
*container* that owns the 44 height, border and fill, with a `⌕` glyph, a bare `flex: 1`
`TextInput`, and a `✕` clear button as siblings. `TextField` owns exactly the geometry that
container owns, so wrapping it there would mean two competing boxes; it deliberately stays a
composite. **Known divergence:** that inner input is Inter 15, where this section's `search`
variant says Cormorant 15 for content search. Aligning the app's primary search field is a
visible change to its most-used surface and is left as an explicit product decision rather
than folded into the July 2026 token pass — it is the one place the rule above is not applied.

**Files:** `mobile/src/components/TextField.tsx`. Consumers: `KathaLibraryScreen`,
`ObservanceListScreen`, `PanchangScreen` (catalog search), `KundaliScreen` (name field + city
picker).

---

## 52a. Components: Date & Time pickers (`CalendarDatePicker.tsx`, `ClockTimePicker.tsx`, `StepperColumn.tsx`)

**Purpose.** Birth date and birth time are picked, not typed. Two shared controls replace the
free-text `YYYY-MM-DD` / `HH:mm` fields at every Jyotish touch point (Kundali; Guna Milan groom
and bride). Both emit the same stored strings the text fields did — `YYYY-MM-DD` and 24-hour
`HH:mm` — so validation, IST→UTC conversion, persistence, and every engine test are untouched;
this is an input-control swap, not a data-model change.

**`CalendarDatePicker`.** A parchment bottom-sheet `Modal` (same family as the Kundali city
picker): a 7-column month grid with the selected day as a `saffronTint` pill and a Confirm/Cancel
footer. The grid is **six rows of seven `flex: 1` cells** (`calendarWeeks()`), never one wrapping
row of 42 percentage-width cells — see §41's calendar card for the float-rounding failure that
shape produces (this picker lost its seventh column on 375 dp phones). The header month-year is a
button that opens an overlay of month chips + a scrollable year list, so a birth date decades back is two taps (month, year) rather than dozens of month
pages. Range is `1900-01-01`…today (the **IST** civil day; range checks are lexicographic on the
`YYYY-MM-DD` strings, so they are timezone-proof); out-of-range days are muted and non-selectable.
Days carry English `"<d> <Month> <year>"` accessibility labels for stable Maestro/Jest targeting
regardless of reading language. Emits `YYYY-MM-DD` on Confirm.

**`ClockTimePicker`.** The reminder stepper (§ Japam/Reminders) in 12-hour form: HR and MIN
columns plus an AM/PM toggle. HR/MIN step the underlying 24-hour minute-of-day (so the hour
column crosses noon/midnight the way a clock does); AM/PM is derived from the current hour and the
toggle shifts ±12h. Emits zero-padded 24-hour `HH:mm`. In the screens it is revealed by a
field-button that commits a `06:00` default on first open, so the shown value and stored value
always agree while an untouched time still validates as missing.

**`StepperColumn`.** The single-column up/value/down control with the press-once-on-release +
hold-to-repeat chevrons, extracted verbatim from `TimeStepper` so the reminder stepper and
`ClockTimePicker` share one implementation. `TimeStepper`'s public API and behaviour are
unchanged (its test is the guard). Do not fork the chevron/hold logic.

**Files:** `mobile/src/components/CalendarDatePicker.tsx`, `ClockTimePicker.tsx`,
`StepperColumn.tsx`; consumers `KundaliScreen.tsx`, `BirthDetailsForm.tsx`. Tests:
`__tests__/CalendarDatePicker.test.tsx`, `ClockTimePicker.test.tsx`, `TimeStepper.test.tsx`.

---

## 53. Section: Vālmīki Rāmāyaṇa (वाल्मीकि रामायण) — complete digital corpus

**Purpose.** A Granth-category reader for Maharishi Vālmīki's Sanskrit Rāmāyaṇa. It ships the
complete 648-sarga Southern-recension digital corpus used by the National Sanskrit University /
IIT Kanpur edition: **23,289 verified verse records** across all 7 kāṇḍas. The traditional
"24,000 ślokas" is a conventional total; recension and verse-count conventions differ, so the
catalog says exactly what is bundled: `7 काण्ड · 648 सर्ग · 23289 श्लोक` / `7 kandas · 648 sargas
· 23289 shlokas`.

**Naming follows Vālmīki, not Tulsidas.** The sixth kāṇḍa is **युद्धकाण्ड / Yuddha Kanda** —
Vālmīki's own name for it. लंकाकाण्ड is Tulsidas's name for the same book in the Rāmcharitmānas;
the alias is recorded in `chapter-06.json`'s `source.notes` but is not the displayed title, because
this section is the Vālmīki text. Likewise chapter 5 is सुन्दरकाण्ड (Vālmīki's Sanskrit
Sundarakāṇḍa), distinct from the separate Tulsidas `sundarkand` section.

**Corpus repair and provenance.** The pinned structured export contains merged verse rows. The
reproducible `scripts/build-valmiki-ramayan.py` builder splits only on printed canonical citation
markers, replaces 18 malformed/duplicate rows from the independent verse-by-verse mirror,
corrects 28 corrupt or source-contaminated rows against a pinned Dravida-patha transcription and the Gita Press
scan, and drops two Uttarakāṇḍa export artefacts that repeat the preceding verse and citation. Hindi comes from
Gita Press prose published by RamCharit.in; combined prose ranges are repeated intact on their
constituent verse pages. The one truncated Hindi page (2.102 after verse 9) is filled from
independent Dharmasutra verse meanings. Source commits, hash, dates, and caveats live in every
chapter's `source` object.

**Structure.** Standard chaptered-Granth pipeline (§15 chapters index → §9 reader), one chapter
per kāṇḍa. The chapters index passes `chapterLabelHi/En="काण्ड"/"Kanda"` and
`unitLabelHi/En="श्लोक"/"shlokas"` (plus `unitLabelEnSingular="shloka"`) to `GitaChapterCard` — the
card's defaults are the Gita's अध्याय / verses, which would mislabel a kāṇḍa:

| # | `titleHi` | `titleEn` | Sargas | Verse records |
|---|---|---|---:|---:|
| 1 | बालकाण्ड | Bala Kanda | 77 | 2,217 |
| 2 | अयोध्याकाण्ड | Ayodhya Kanda | 119 | 4,262 |
| 3 | अरण्यकाण्ड | Aranya Kanda | 75 | 2,439 |
| 4 | किष्किन्धाकाण्ड | Kishkindha Kanda | 67 | 2,445 |
| 5 | सुन्दरकाण्ड | Sundara Kanda | 68 | 2,772 |
| 6 | युद्धकाण्ड | Yuddha Kanda | 131 | 5,693 |
| 7 | उत्तरकाण्ड | Uttara Kanda | 111 | 3,461 |

Source of truth for the table: `mobile/src/data/valmiki-ramayan/chapters-manifest.json` (the
loader's per-kāṇḍa invariants fail when a loaded payload drifts from the manifest).

**Numbering authority.** Citations follow the declared National Sanskrit University / IIT Kanpur
Southern-recension digital corpus. The complete searchable Gita Press Sanskrit-English scan was
opened as an independent structural and verse-by-verse reference; its dated verification state is
recorded in every chapter's `source.canonicalEditionStatus` rather than implying identical sarga
numbering between editions.

**Verse pill.** `श्लोक · <kāṇḍa>.<sarga>.<śloka>` / `Shloka · <kāṇḍa>.<sarga>.<śloka>` —
the Gita's `श्लोक · १.१` grammar (§3 pill vocabulary) extended to the epic's three-part citation,
with Devanagari numerals in `labelHi`. The decimal supplemental sarga `3.56.1` therefore renders a
four-part citation such as `३.५६.१.१`; no reference is silently renumbered to another edition.

**Background.** Per-kāṇḍa, deterministic per verse: `ValmikiRamayanVerse.stanza` carries the
kāṇḍa number, and `getReaderBackground('valmiki-ramayan', verse)` maps Kiṣkindhā → the
Rāma-Hanumān plate, Sundara → the Hanumān-crossing-the-ocean plate, and every other kāṇḍa →
the Rāma darbār plate (§6, RULEBOOK §3 "deterministic per verse id").

**Romanization.** Sanskrit, so IAST + Hunterian digraphs per §3.1 (`śh`, `ṣh`, `kṣh`, `chh`,
`ch`, epenthetic `ṛi`) — the same style as the Gita corpus, never the Awadhi ASCII used for
Tulsidas.

**Loading and cross-feature budget.** `texts.ts` reads the lightweight manifest total without
loading scripture. `getValmikiRamayanChapter()` requires and validates only the selected kāṇḍa,
then caches it. Daily Bhakti and global search deliberately retain the 28 established anchor
verses from `daily-selection.json`; indexing all 23,289 long-form verses would duplicate their
normalized text in memory and put every multi-megabyte kāṇḍa on a non-reader path. The complete
corpus remains continuously readable and directly addressable in the reader.

**Not a duplicate of Sundarkand.** Chapter 5 here is Vālmīki's **Sanskrit** Sundarakāṇḍa; the
separate `sundarkand` Granth section is Tulsidas's **Awadhi** Sundarkand. No line is shared
between the two (RULEBOOK §11.11).

**Files.** `mobile/src/data/valmiki-ramayan/` (`chapter-01..07.json`, `chapters-manifest.json`,
`daily-selection.json`, `index.ts`) plus `scripts/build-valmiki-ramayan.py`,
`mobile/src/components/ValmikiRamayanVersePage.tsx` (explicit re-export of
`SundarkandVersePage` — the `lines`/`linesEn` archetype), `mobile/src/screens/
ValmikiRamayanChaptersScreen.tsx`, `mobile/src/screens/ValmikiRamayanReaderScreen.tsx`.
Registered in `texts.ts`, `entryRoutes.ts` (chapters + reader + chapter count),
`HomeStackNavigator.tsx`, `backgrounds.ts`, `searchIndex.ts`, `versePool.ts`, `formatLocation.ts`.
Tests: `src/screens/__tests__/ValmikiRamayanReaderScreen.test.tsx` (per-kāṇḍa first-verse render),
`readerAutoAdvance.test.tsx` (kāṇḍa-boundary swipe contract), `chapteredTotals.test.ts`,
`readerTypeScale.test.tsx`. E2E: `.maestro/granth-smoke.yaml`.

---

## 54. App Rating Prompt (रेटिंग)

**Purpose.** Ask engaged users for a store rating, without ever becoming a nag. Two surfaces over
one piece of state: an **auto-opening card** that has to earn its way past a conservative gate, and
a **permanent More row** the user can reach whenever they feel like it (§37).

**Bundle-only, by constraint.** No `expo-store-review`, no `SKStoreReviewController`, no Play
In-App Review. Every one of those is a native module, so a rating nudge behind one could only ship
in a store build — and this repo's operating constraint (`docs/roadmap/2026-Q3-roadmap.md`) is that
features ship inside the bundle. The sheet is therefore ours, and the primary button hands off to
the store listing with `Linking.openURL` — the same reasoning that keeps the Instagram row on an
`https://` URL (§37). Cost of the choice: the user leaves the app instead of rating in place, and
the OS does not throttle us, so **we** own the throttling. Hence the gate below.

**Structure** (`components/RatingPromptSheet.tsx`) — a centered card on a `modalBackdrop`
(transparent `Modal`, `animationType="fade"`), matching `UpdateReadyModal` (§44) rather than the
pageSheet modals: this is a short interruption, not a screen to work in. Max width 360, `radii.lg`,
`parchment`, `spacing.xxl` padding, 12 gap, everything centered:

1. **Decorative star row** — `★★★★★` at 22 in `gold`, `letterSpacing: 3`. Says "rating" faster
   than a sentence can. `accessibilityElementsHidden` + `importantForAccessibility="no"` so it never
   reads as a control (§12) — it is not interactive; there is no in-app star capture.
2. **Title** 20, `accessibilityRole="header"`, script title face — `Vedansh आपको कैसा लगा?` /
   `Enjoying Vedansh?` / `Vedansh કેવું લાગ્યું?` / `Vedansh ಹೇಗಿದೆ?`
3. **Lede** 15/23 `ink-soft`, script body face — one sentence on why it helps, one on the cost
   ("एक मिनट लगेगा" / "It takes a minute").
4. **Primary** — `saffron` fill, `radii.md`, 44 min-height: `रेटिंग दें` / `Rate Vedansh` /
   `રેટિંગ આપો` / `ರೇಟಿಂಗ್ ನೀಡಿ`. A11y label is the constant `"Rate Vedansh on the store"`.
5. **`बाद में` / Maybe later** — 13 `ink-muted`, the tracked-uppercase secondary treatment. The
   card's last element, and the only exit besides rating.

**Two actions, no permanent opt-out** (product decision, Aug 2026: "only now and later"). The
earlier third button — `फिर न पूछें` / Don't ask again — is **removed**. Consequence, stated
plainly: with `MAX_ASKS` at `null` there is now no state a user can reach from this card that stops
the 5-day cadence except rating. `outcome: 'declined'` and `afterDeclined` survive in the model so
the gate still honours a state written by an earlier build, and so a Settings-side opt-out has a
home if one is added — see RULEBOOK §6.2 for the risk posture and the mitigations on the table.

All four languages are hand-authored via `pick` (this is UI chrome, not content, so nothing is
transliterated), and Indic labels drop Latin tracking/uppercase per §3.

**The gate** (`data/ratingPrompt.ts`, pure). The sheet may auto-open only when **all** hold:

| Condition | Threshold | Why |
|---|---|---|
| Outcome still `pending` | — | `rated` and `declined` are terminal. Only `rated` is reachable from the sheet; `declined` is honoured for back-compat (see below) |
| Auto-opens so far | `< MAX_ASKS` (**`null` — no ceiling**) | Uncapped by product decision: keep asking until the user rates or opts out |
| Cold starts | `≥ MIN_APP_OPENS` (5) | Earn the ask — a rating nudge waits for real return visits (the reminder opt-in no longer gates on this; see §38) |
| Distinct active days | `≥ MIN_ACTIVE_DAYS` (3) | A habit, not a visit |
| Lifetime verse reads | `≥ MIN_VERSE_READS` (20) | Filters users who opened but never read |
| Since the last ask | `≥ REASK_COOLDOWN_DAYS` (5) | The quiet period, and now the **only** thing spacing asks out — with no lifetime ceiling it is load-bearing, not a scheduling detail |
| No other surface asking | — | Tour, onboarding setup, What's New, reminder opt-in (§47/§38) |

Engagement numbers come from `UserActivityContext.lifetimeTotals()`; the cold-start count is read
from the **notification meta's** `appOpenCount` rather than a second counter — one "how many times
have they come back" number, already incremented once per cold start, serving both asks (the rating's earned 5-open gate and the opt-in's first-open gate).

**Persistence & lifecycle** (`contexts/RatingPromptContext.tsx`). One AsyncStorage blob,
`@vedansh/rating-prompt`: `{ askCount, lastAskedAt, outcome }`, defensively parsed (junk fields fall
back to defaults, never crash). Behaviour:

- Eligibility is evaluated once per app session; the sheet then opens after
  **`RATING_PROMPT_DELAY_MS` = 2500 ms**, so Home has settled first — a prompt on the launch frame
  reads as an ad. If eligibility lapses before the timer fires, the timer is cleared.
- **Opening consumes an ask slot and starts the cooldown** (`afterAsked`). A swipe-away still
  counts as "we asked" — the cooldown, not the outcome, is what silences the second ask.
- **Primary** → `afterRated` (terminal) + `Linking.openURL(storeReviewUrl(Platform.OS))`. iOS gets
  `…?action=write-review` (the App Store review composer); Play has no listing equivalent, so
  Android lands on the listing, whose rating stars are the first thing on the page. If the OS
  refuses the deep link, it falls back to the plain listing, then fails **silently** — a broken
  hand-off must not throw an error at a user who just tried to do us a favour. "Rated" records the
  *hand-off*, not a review the app cannot observe.
- **Maybe later** → close only; the same card returns after the 5-day cooldown, indefinitely. This
  is the sheet's only non-terminal exit, and the `Modal`'s `onRequestClose` (Android back) maps to
  it too — so a back press is a "later", never an opt-out.
- The **More row** calls `open()`, which bypasses the gate and spends **no** ask slot — a user who
  went looking has opted in. It keeps working after `declined`; opting out silences the auto-ask.

**Placement.** `<RatingPromptSheet />` mounts last in `App.tsx`, inside `RatingPromptProvider`
(itself inside `TourProvider` + `NotificationPreferencesProvider`, whose flags the gate reads).

**Files.** `mobile/src/data/ratingPrompt.ts` (state, gate, store URLs),
`mobile/src/contexts/RatingPromptContext.tsx`, `mobile/src/components/RatingPromptSheet.tsx`,
row in `mobile/src/screens/MoreScreen.tsx`, store URLs from `mobile/src/data/shareLinks.ts`.
Tests: `src/data/__tests__/ratingPrompt.jest.test.ts` (every gate clause, cooldown boundary,
defensive parse, URL shapes), `src/components/__tests__/RatingPromptSheet.test.tsx` (delay,
persisted outcomes, refusal to stack, the two-action shape, all four languages, a11y-hidden stars),
`src/screens/__tests__/MoreScreen.test.tsx` (the row opens the sheet instead of leaving the app).
E2E: `.maestro/rating-prompt-smoke.yaml` — the manual path only; the auto path's thresholds are
unreachable under `clearState`, so the gate is unit-tested instead.

---

## 55. Festive Toran (पर्व तोरण)

**Purpose.** On each of the **18 catalog festivals** (`mobile/src/notifications/festiveReminders.ts` — the same list that drives the §38 festive reminder), Home hangs a toran below the wordmark: a sagging garland string of marigolds and leaves with a chip underneath carrying the festival's greeting. The doorway is dressed for the day, all day, and interrupts nothing. Every other day of the year Home is untouched. Component: `mobile/src/components/FestiveToran.tsx`; mounted by `HomeScreen` between the hero lockup and the Today strip.

**Which festival.** `getTodayFestival(date)` (`mobile/src/data/discoveryMeta.ts`): the **first** of today's observances that is in the festive catalog, else null. It walks `getObservancesForDate` in the same order as the For-Today row's tier 1 (§50), so the garland, the leading FOR TODAY card, and the morning's notification always name the same festival — including on a day two catalog festivals share (all three consistently take the first-resolved one). An observance solve that throws simply hangs no garland. Resolution keys off `useTodayKey()` in HomeScreen, so the toran appears/vanishes on the day boundary without a relaunch.

**Structure.**
- **String**: one SVG path (`M-4 6 Q150 44 304 6`, `preserveAspectRatio="none"` so it stretches to any width), stroked `saffronDeep` at 0.55 opacity.
- **Ornaments**: 5 marigolds alternating with 4 leaves at fixed stations along the sag (`y = 6 + 19·sin(πx/300)`). Marigolds are **View compositions** — 8 rotated petals alternating `cardThumbActiveFrom`/`cardThumbActiveTo` around a `saffronDeep` core — the same drawn-blossom grammar as the §30 pushpa-varsha and the §42 deity glyphs. Leaves are asymmetric-radius `gold` views. **No emoji, no images** (§42's rule).
- **Greeting chip**: centered under the garland — `goldChipBg` fill, `cardActiveBorder` border, `saffronDeep` text at **12 pt** (§3.0 floor respected), face via `titleScriptFont` so hi renders in the Devanagari serif, gu/kn in their re-scripted SemiBold cuts, en in the card title face. Copy = the catalog's `greetingHi`/`greetingEn` through `contentByLang` — identical wording to the notification body's greeting.

**Motion (§11).** One sway: ±0.7° rotation about the string's tie-line (`transformOrigin: '50% 0%'`), 6 s per full alternate cycle, native driver. `useReducedMotion()` hangs the garland still — no other animation exists on the surface.

**Layout.** The component always occupies its fixed `TORAN_HEIGHT` (90 dp: 46 garland + ~26 chip + ~16 clearance so the greeting chip never touches the Today strip's Panchang banner below it), so once mounted it can never nudge the Today strip (the §48 reserved-height lesson). It scrolls away with the wordmark — deliberately not pinned.

**A11y (§12).** The garland is decorative: `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`. The chip's greeting text is the surface's one accessible element.

**Colours.** Theme tokens only — `saffronDeep`, `gold`, `cardThumbActiveFrom/To`, `goldChipBg`, `cardActiveBorder`. Nothing outside §2's warm palette; the baked deity-glyph palette is *not* used here.

**Decision trail.** Chosen as Option A of four prototyped treatments (`festive-theme-preview.html` at the repo root: toran / utsav banner / pushpa-varsha one-shot / full skin). The banner duplicated the FOR TODAY festival card; the one-shot shower and the full skin are parked. Scope locked: all 18 festivals (not just `star`-marker majors), not pinned, no shower.

**Tests.** `components/__tests__/FestiveToran.test.tsx` (ornament census, reserved height, per-language greeting + face, decorative-garland a11y, reduce-motion mount; fake timers because of the sway loop) and the `getTodayFestival` block in `notifications/__tests__/festiveReminders.test.ts` (every catalog festival's own date hangs a garland whose greeting matches the catalog and agrees with the FOR TODAY lead; ordinary day → null; Diwali → `diwali`). E2E deliberately none: festival dates make the surface non-deterministic under `clearState` — same rationale as the §54 auto path.

---

## 56. Read Aloud (पाठ सुनें) — on-device TTS

**Purpose.** Let the device speak the verse on screen. The app's answer to "I want to listen"
has been *recorded* recitation (§34), but only 5 real recordings exist for 13 catalog tracks, so
most texts have no audio at all and commissioning more costs money, licensing and binary size
(`docs/roadmap/prds/02-verse-audio.md`). On-device TTS closes that gap for zero bytes. It is
**assistive, never a substitute for human recitation** — see RULEBOOK §11.15.

**Scope (v1).** `GitaReaderScreen` and `ChalisaReaderScreen` (the latter is a registry reader, so
all 9 chalisas are covered). The remaining 18 readers are unchanged; the shared hook and adapter
already handle every verse shape, so fan-out is wiring only.

### 56.1 What is spoken, and in which voice

Verse lines first, then the भावार्थ (**on by default**), then Gita commentary (off by default).
One utterance **per verse line** — the gap between utterances then lands on the visual line
break, which for a chaupai or doha half-line is where a reciter breathes.

**Each reading language is spoken in its own voice, or not at all.** Read-aloud never substitutes
one language for another, so what is heard is exactly what is on screen:

| Reading language | Spoken source | Voice |
| --- | --- | --- |
| `hi` | Devanagari lines + `meaningHi` | `hi-IN` |
| `en` | `linesEn` / `transliteration` + `meaningEn` | `en-IN`, else `en-US` |
| `gu` | the on-screen Gujarati lines + `meaningGu` (or the re-scripted fallback) | `gu-IN` |
| `kn` | the on-screen Kannada lines + `meaningKn` (or the re-scripted fallback) | `kn-IN` |

The spoken text therefore comes straight from the same `verseLinesByLang` / `meaningByLang`
helpers the page renders with — including the authored native meanings, which a substitution
would have silently discarded.

**One accent per language — the Indian one.** The devotional content is Hindi/Sanskrit in
Devanagari, so the app deliberately offers only the **Indian** voice for each reading language
(`voicesForTarget` lists `-IN` voices only; the Voice picker never presents American/British/etc.).
English is the sole language with a fallback: a device without an `en-IN` voice is common, so rather
than go silent it falls back to **`en-US` only** — the near-universal default English voice — and to
no other accent (`FALLBACK_LOCALE` in `voices.ts`). That `en-US` voice is reachable only as this
invisible resolution fallback; it is never shown as a choice. Hindi/Gujarati/Kannada have no
non-Indian accent and therefore no fallback: their `-IN` voice or *unavailable* (§56.4). English is
still English either way, so "heard === seen" holds — this is an accent fallback within one
language, not the cross-language substitution the module forbids.

**A language whose voice the device lacks reports read-aloud unavailable for that language**
(§56.4), naming it in its own script and, on Android, offering a hop to TTS settings to install
it. The alternative — quietly speaking Hindi instead — would have the user reading one script
while hearing another language, and both platforms' silent-fallback behaviour makes that easy to
ship by accident: the guard is that `start()` refuses outright when availability is `unavailable`,
so the engine is never handed text it cannot voice.

**Cost to accept:** gu/kn coverage depends on that voice being installed, which is less common
than Hindi. That is a real limitation of the honest design, surfaced plainly rather than hidden.
Switching the app's reading language switches the whole voice section — voices are stored per
language (`voiceByTarget`), and a saved identifier is only honoured if it still speaks that
language, so a stale preference can never leak a voice across languages.

Dandas are normalized for the synthesizer (`।` → a sentence stop; engines otherwise read a bare
danda as nothing, or aloud as "vertical line"). **Only the string handed to the synthesizer is
touched** — displayed, shared and indexed text is never altered (RULEBOOK §11.15).

### 56.2 The reader control

Lives on the **language-toggle row**, pinned to the **right edge** while the हिन्दी/English
toggle + add-to-routine group stays centred (`readAloudSlot`: `position: absolute`, `right: 16`,
vertically centred within the row's content box). It sits directly below the reading-progress bar,
clear of it, and inline with the toggle — one always-visible, screen-level control per reader. It is
*not* in `ReaderHeader`'s `right` slot (which was cramped beside the counter + recorded `▶`, and
forced the centred title off-axis via a widened `sideWidth`), and *not* in the verse page's
`topActions`, which renders once per page and would put N copies of a screen-level control into
`listExtraData`.

It is a **labelled pill** (icon + text), not a bare glyph, so the affordance is legible — the
July-2026 first cut was a lone `♪` at 15 with no label, which read as decoration and was easy to
miss.

| State | Pill | Visible label | a11y label |
| --- | --- | --- | --- |
| Idle | `▶︎` + label, `saffron-deep` on a `saffron-tint` fill, `cardActiveBorder`, `radii.sm` | `सुनें` / `Listen` / `સાંભળો` / `ಕೇಳಿ` | `Read aloud` |
| Speaking | `❚❚` + label, same fill | `रोकें` / `Pause` / `થોભો` / `ವಿರಾಮ` | `Pause reading aloud` |
| No voice installed | `▶︎` + label, `ink-muted` on `parchment-soft`, `divider`, `accessibilityState.disabled` | `सुनें` / `Listen` … | `Read aloud unavailable` |

`▶︎`/`❚❚` carry the trailing U+FE0E text variation selector so they render monochrome, never as
colour emoji (§5 "no emoji", same treatment as the Panchang ☀/☽ glyphs in §33). The **visible
label is localized** to the reading language, but the **`accessibilityLabel` stays English and
un-localized**, the same rule and reason as `ReaderHeader`'s back label: Maestro taps it literally
and the default reading language is `hi`. The play `▶︎` is shared with the recorded-audio control
(which stays in the header); the "Listen" label is what distinguishes the two where both appear
(Chalisa). The More → Read Aloud *settings* row keeps the `♪` note (`READ_ALOUD_GLYPH`) — it is a
settings entry, not a play control.

With the pill off the header, `sideWidth` is back to the bare-counter size — Gita `60`; Chalisa
`60`, or `84` when a recorded `▶` shares the header. The pill always shows its full label now (no
`compact` on the reader screens) since the toggle row has the room.

**The muted state is deliberate.** Hiding the control when no voice exists would leave the user
with no way to learn why read-aloud never appears. Pressing it explains, and on Android offers
`com.android.settings.TTS_SETTINGS`; iOS gets the Settings path in words (no deep link exists to
Spoken Content).

**Suppressed entirely under a screen reader.** VoiceOver/TalkBack already read each page's
`accessibilityLabel`; two voices at once is a defect, not a feature.

### 56.3 Pause, auto-advance, and the swipe latch

**Pause is line-granular and identical on both platforms.** Android's native module has no
`pause`/`resume` at all, so the app never calls `Speech.pause` — pause stops the engine and
records the chunk; resume re-speaks that line from its start. That is also the honest human
behaviour, and lines run 1–2 s.

Finishing a page scrolls to the next and keeps speaking. A **manual swipe re-targets rather than
stops** — the user wants the page they just moved to. A pending-page latch distinguishes the
controller's own scroll (which fires the same viewability/scroll handlers) from a user swipe, with
a 250 ms trailing debounce so a multi-page flick starts one session. A page with no text is
skipped; a chapter-transition sentinel **stops** the session rather than reading across the
boundary (v1). If a scroll never lands within 600 ms the session ends, because
`onScrollToIndexFailed` is a no-op in every reader and the alternative is speaking an invisible page.

**Speech stops** on reader exit, on a `sourceId` change, and when the app backgrounds. There is
no mini-player and no lock-screen surface in v1: expo-speech exposes no media-session API, and
auto-advancing a screen the user cannot see is worse than silence.

### 56.4 Availability is a first-class state

Both platforms fall back to the device default voice for an unavailable language **silently** —
neither fires an error callback. So voices are probed at startup (`getAvailableVoicesAsync`, raced
against a 4 s timeout because Android's engine binds slowly), the control is gated on the result,
and a **3 s `onStart` watchdog** catches the OEM engine that reports a language then emits nothing.
Availability is resolved **for the active reading language**, so it changes when the language does.
The probe re-runs when the app foregrounds while unavailable, so installing voice data and coming
back just works.

### 56.5 Settings

**More → ऐप / App → Read Aloud**, below Reading Size. State text comes from
`readAloudRowLabel(prefs, lang, availability)` — exported from the sheet so row and sheet cannot
drift, exactly as `readingSizeLabel` does (§43). Reads `श्लोक व अर्थ · 1.0×`, or `उपलब्ध नहीं`.
Icon `♪︎` on `saffron-deep`. The row sits **after** the two feature-tour anchor rows: RULEBOOK
§6.1 pins the tour's final steps to Language + Reading Size and the tour resolves them by ref, so
a later row is safe **as long as no tour step is added for it** — v1 adds none.

**`ReadAloudSettingsSheet`** is a structural clone of `ReadingSizePickerSheet` (§43): transparent
slide `Modal`, backdrop `Pressable` → close, grabber, `parchment-highlight`, radio pills, a Done
button that does not auto-close on selection. Sub-header names it a device voice
("उपकरण की आवाज़ से — मानव पाठ नहीं"). Sections:

1. **आवाज़ / Voice** — `स्वतः / Automatic` plus up to 4 probed voices **for the active reading
   language**, Enhanced first, each showing the OS voice name, under a line naming that language.
   Replaced by the explainer + a TTS-settings hop + a "फिर देखें / Check again" re-probe when the
   device has no voice for it.
2. **गति / Speed** — the §57 `RateStepper`, 0.5–1.5 in 0.1 steps.
3. **क्या पढ़ें / What to read** — `अर्थ भी` (on) and `व्याख्या भी` (off), `accessibilityRole="switch"`.
4. **सुनकर देखें / Preview** — speaks `READING_SIZE_SAMPLE[lang]`, reused from §43. The only way
   a user can judge a voice.

Persisted at `@vedansh/read-aloud` (`rate`, `voiceByTarget` — one slot per reading language,
`readMeaning`, `readCommentary`), validated field by field on hydrate.

### 56.6 Mutual exclusion

Recorded audio (§34), the japam loop (§35) and read-aloud are **mutually exclusive**, arbitrated by
`src/audio/playbackArbiter.ts`. Each source registers a stopper and claims playback before
starting. This is a module singleton rather than a context field so no consumer's contract changes.
It is load-bearing on iOS, where the audio session is configured `mixWithOthers` — without it a
bhajan and a spoken verse literally play over each other.

iOS passes `useApplicationAudioSession: true`. Without it `AVSpeechSynthesizer` builds its own
session and **the hardware mute switch silences speech**. Trade-off: under `mixWithOthers`, TTS
does not duck other apps on iOS — the same behaviour recorded playback already has.

**Files:** `mobile/src/readAloud/` (`prefs.ts`, `verseAdapter.ts`, `verseScript.ts`,
`pronounce.ts`, `voices.ts`) · `mobile/src/contexts/ReadAloudContext.tsx`,
`ReadAloudPrefsContext.tsx` · `mobile/src/audio/playbackArbiter.ts` ·
`mobile/src/screens/_useReaderReadAloud.ts` ·
`mobile/src/components/readAloud/ReadAloudButton.tsx` · `ReadAloudSettingsSheet.tsx`.
Requires a **store release, not an OTA** — `expo-speech` is a native module.

---

## 57. Component: Rate Stepper (`RateStepper.tsx`)

**Purpose.** The `− 1.0× +` control for a playback or speech rate. Extracted from
`JapamAudioPlayer`'s tempo block when read-aloud needed the same control, on the same reasoning
that produced `ReaderHeader` (§7) and `TextField` (§52) — one spec, two callers.

**Spec.** Optional italic 11 pt caption (`ink-muted`) above a row of `32×32` `radii.md`
`divider`-bordered buttons with `−`/`+` at 18 in `ink-soft`, `hitSlop` 8, either side of the value
in the page-counter face at 14 with `minWidth: 38`. A button at its bound is `disabled` at 0.4
opacity and reports `accessibilityState.disabled`. Float comparisons use an epsilon, because 0.1
steps land on 1.4999999999999998. Button labels are the un-localized `Slower` / `Faster` so Maestro
can drive them in any reading language.

**Callers.** `JapamAudioPlayer` (tempo, 0.5–1.5, caption `गति / Tempo`) and
`ReadAloudSettingsSheet` (speech rate, same range, no caption — the sheet supplies its own section
label). Bounds and step are props; the japam player owns expo-audio's limits and read-aloud owns
`src/readAloud/prefs.ts`'s, which deliberately duplicate the numbers rather than share a constant,
because they are different concerns that happen to agree today.

**Files:** `mobile/src/components/RateStepper.tsx`.

---

## 58. Guna Milan (अष्टकूट मिलान) — PRD-16

**Purpose.** A traditional 36-guna Ashtakoota marriage-compatibility calculation with every step visible — a calm, private tool, not a verdict. No red-alarm treatment, fear copy, remedy upsell, or hidden noon assumption. PRD: `docs/roadmap/prds/16-guna-milan.md`.

**Placement.** A card below Kundali and Rashifal on the ज्योतिष landing (`PanchangScreen`'s `JyotishLanding`), with the standard versioned NEW badge. Tap pushes `GunaMilan` inside the **Panchang stack** (`PanchangStackParamList` — not a duplicate root route); back and screen tracking follow the §51 Jyotish screens.

**Input.** Two `BirthDetailsForm` cards keep the directional roles **वर · Groom** and **वधू · Bride** (never assuming the device owner is the groom). Each offers "मेरे विवरण यहाँ" to copy the saved Kundali's name/date/time into that role only. Name uses the §52 `TextField` `form` variant (48); date and time are entered through the shared §52a pickers — the date field-button opens `CalendarDatePicker` and, when the time is known, the inline reminder-style `ClockTimePicker` (12-hour AM/PM stepper) sits where the field was. Name is optional display-only; date (`YYYY-MM-DD`) and 24-hour `HH:mm` are IST calculation inputs — the pickers still emit exactly those strings, so validation/parsing is untouched. The **"ज्ञात नहीं · Unknown"** time control is preserved verbatim (it stores `null`); when the time is known but not yet set, a "समय चुनें · Select time" field-button reveals the stepper and commits a 06:00 default. No birthplace is requested in v1 (only Moon longitude is needed), and the flow **never** reuses `LocationPickerModal` — it must not mutate the global Panchang location.

**Unknown time is an interval, not noon.** "ज्ञात नहीं" never substitutes 12:00 and never persists a fabricated time. The engine enumerates every nakshatra/charana/rashi/Vashya-boundary classification the Moon can occupy across the full `00:00–23:59:59` IST civil day (Cartesian product when both times are unknown). If all possibilities agree, the exact result shows with an "all times checked" note; if any koota changes, a min–max **range** with the varying kootas shows instead — with no single dial fill and no exact-share action.

**Result.** An exact result shows a 36-point `react-native-svg` dial (the HTML prototype's conic gradient is illustrative only), the pinned band label, optional names/roles, and eight expandable koota rows (only one open at a time; rows expand/collapse instantly with no animation — matching the app, where no screen animates an expandable row — so there is no motion to gate on reduced-motion). Each row shows score/max, a `gold` bar, the inputs used, and a Hindi-first explanation. Nadi/Bhakoot findings use `avoidTint` background with `avoidDeep` text/border — never color-only; a zero stays understandable by text. A dosha/cancellation banner states which rule fired and whether a supported cancellation applies, without ever silently rewriting the base score. Standing disclaimer: **"यह पारम्परिक अष्टकूट गणना है — मार्गदर्शन हेतु, निर्णय हेतु नहीं।"**

**Share.** Reuses the §51 `JyotishShareSheet` (4:5, 1080×1350, `react-native-view-shot` → `expo-sharing`) with a `GunaMilanShareCard`. The card is a strict allow-list — optional names + वर/वधू roles, exact total, band, eight component scores, disclaimer, `ॐ वेदांश़` footer — and **never** contains birth date, time, location, saved-profile id, or hidden metadata (`buildGunaMilanShareModel` cannot serialize the input object). Share is unavailable for a time-uncertain range.

**Privacy & persistence.** Inputs are session-only by default. An explicit, initially-unchecked "मिलान विवरण याद रखें · Remember match details" toggle says only "अगली बार यह फ़ॉर्म पहले से भरा मिलेगा · Prefill this form next time", stores a versioned record under `@vedansh:guna-milan-draft:v1`, and has a visible clear action; a previous match is never restored implicitly. Local diagnostics (start/complete/preview/share-sheet-opened counts) live under `@vedansh:guna-milan-metrics:v1` and carry no PII. Per RULEBOOK §3, screen and share copy do not expose on-device/offline/internet/account/storage implementation details.

**A11y & i18n (§12).** Controls ≥ 44; expandable rows expose button role, accessible name, and expanded state; the dial and range carry screen-reader summaries; the primary **मिलान करें** action stays keyboard-safe. All visible copy and accessibility labels ship in hi/en/gu/kn — gu/kn re-script the Devanagari via `contentByLang`/`meaningByLang` per the language design, and faces use `scriptTitleFont`/`scriptBodyFont`. English accessibility labels stay stable for Maestro/Jest even when the visible reading language is not English.

**Colours.** Warm-manuscript tokens only — `parchment`/`parchmentSoft`, `ink`/`inkMuted`, `saffronDeep`/`saffronTint`, `gold`, `divider`, `avoidTint`/`avoidDeep`, `onPrimary`, `cardActiveFrom`. No raw red/green; no one-off colours.

**Convention.** The calculation is pinned in `docs/roadmap/conventions/guna-milan-v1.md` (`vedansh-ashtakoota-v1`): tables/matrices, वर→वधू direction, half-point scores, the exact 15° Vashya splits, band boundaries and DrikPanchang Bhakoot/Nadi modifiers, and the one auditable Bhakoot cancellation (same rashi-lord or Graha-Maitri 5). Convention lives as data in `gunaMilanConvention.ts`; a table change requires a new convention id and fixture review. Domain sign-off of the tables remains a human gate (PRD gate 1).

**Files.** `mobile/src/panchang/gunaMilan.ts`, `gunaMilanConvention.ts`, `gunaMilanDisplay.ts`, `gunaMilanShare.ts`, `gunaMilanState.ts`; `components/BirthDetailsForm.tsx`, `GunaMilanShareCard.tsx`; `screens/GunaMilanScreen.tsx`; `screens/PanchangScreen.tsx`, Panchang navigation types/stack; `components/JyotishShareSheet.tsx` (shared).

**Tests.** `panchang/__tests__/gunaMilan.engine.test.ts` (normalization, every pada/nakshatra/rashi boundary, the 15° Vashya splits, the full 108×108 sweep pinning each koota's complete reachable value set, directional rules, IST parsing, unknown-day enumeration, source purity), `gunaMilan.golden.test.ts` (independently published Mini/Jose 20/36 and Chitra/Uttara-Ashadha 19.5/36 fixtures plus every Bhakoot cancellation branch and the same-Nadi 28/36 band case), `screens/__tests__/GunaMilanExperience.test.tsx` (either-role autofill, expansion state, unknown-time range, share allow-list, opt-in persistence), and `.maestro/guna-milan-smoke.yaml` (Panchang-stack nav/back, autofill, exact result, expand, privacy-safe share preview, unknown-time range — run on iOS and Android).

---

## 59. Home-Screen Widgets (होम-स्क्रीन विजेट) — PRD-15

**Purpose.** Move Vedansh's three highest-frequency glances — today's verse, today's Panchang, and today's japa — off the app and onto the OS home/lock screen as quiet ambient surfaces, so the daily-return loop no longer depends on the user remembering to open the app or on an interruptive notification. The widgets are the parchment system rendered on the OS canvas: `parchment-hi → parchment`, ॐ brand mark, script-aware serif content, **no emoji** (§42's rule). JS precomputes a dated bundle; native code only validates, selects the correct dated entry, and renders — it performs no astronomy or network work at draw time.

**One content type per widget kind; the size is the user's choice (Aug 2026).** The launch build hard-coded the mapping inside a single "ambient" kind — `systemSmall` drew the verse, `systemMedium` drew the Panchang — which is exactly backwards for the content: a shloka truncated after four words in the small square (`ईशानः प्राणदः प्राणो ज्येष्ठः श्रेष्ठः प्रजापतिः। · हिरण्यग…`) while a one-word tithi headline floated in a field of empty parchment on the wide rectangle. Every content type is now its **own widget kind** — the OS gallery lists them separately, and the size is picked at add time and changed afterwards (iOS: swipe the size in the picker; Android: drag the widget's edges). Each kind renders **every size it advertises**, so no size is a truncated afterthought. The declaration lives once in `mobile/src/widgets/catalog.ts` (`WIDGET_CATALOG`: content → native kind, offered sizes, recommended size) and `catalog.test.ts` fails if the iOS `supportedFamilies`, the Android providers/`appwidget-provider` resources, or the in-app gallery drift from it.

**Surfaces.**
- **आज का श्लोक — `VedanshVerseWidget` / `VedanshVerseWidgetProvider` (wide · large · small; best at wide).** The deterministic Daily-Bhakti selection for the device-local day. **Wide** (iOS `systemMedium`, Android 4×2 default cell) gives the verse the line width it was written for — the **whole verse flowed** as one paragraph (`flowedVerse()`: padas joined with ` · `, mirrored by the Swift `flowedVerse` and the Kotlin `padas.joinToString(" · ")`) across the three lines the cell budgets, plus the source; **large** (iOS `systemLarge`, Android any tall cell) gives each pada its **own line from `lines`**; **small** (iOS `systemSmall`, Android any cell <180 dp wide) is the only cell that reads the planner's excerpt (`twoLineExcerpt`), and drops the source — all that fits. The full verse + source stay in the accessibility label. Tap → the exact Daily Bhakti entry.
  - **The excerpt is a small-cell string, and only the small cell may read it (Aug 2026 fix).** Wide drew it too, so `twoLineExcerpt`'s 88-character cap — a budget for the 13 pt square — ellipsized any verse past it on a card sized for three 16 pt lines: BG 5.12 (90 characters flowed) shipped as `…अयुक्तः कामकारेण फले सक्तो…` with its third line empty and its closing pada gone. Every cell wider than the square now reads the full `lines` the payload has always carried and lets the platform shrink (`minimumScaleFactor(0.8)`) or ellipsize (`android:ellipsize="end"` on `widget_title`) only when a verse genuinely overruns. `catalog.test.ts` fails if either native surface reads `excerpt` outside its small/narrow branch, or if the Android title view loses its ellipsize. Rule: **a cap tuned for one cell size must never be applied on the shared payload path.**
- **आज का पंचांग — `VedanshPanchangWidget` / `VedanshPanchangWidgetProvider` (small · wide · large · lock; best at small).** Represented **IST** date + tithi headline + vrat line, carrying the selected city and calendar system. **Small** is the glance (date, tithi, vrat, sunrise); **wide** adds Rahu Kaal on the timing line; **large** gives sunrise / Rahu Kaal / Abhijit a labelled row each from the PRD-14 (§48) engine. Tap → Panchang on the represented date.
- **जप-साधना — `VedanshJapamWidget` (small · wide · lock).** **Japam-only** (not the broader `UserActivityContext.currentStreak()`): beads toward the first 108 of the day, staying full after 108; caption shows actual beads/rounds and a separately computed japa-active-day streak. Payload carries `lastUsedMantraId?`; tap → that mantra's counter when present, else the Japam library — it never invents a default mantra. Read-only in v1. No Android provider yet (`androidProvider` is undefined in the catalog, and the gallery therefore offers no add button for it there).
- **iOS lock-screen accessory (Phase 2).** Inline (on the Panchang kind) = represented tithi / vrat name on observance days; circular (on the Japam kind) = japa-only progress/streak with a numeric/text cue that survives monochrome + tinted appearances. Advertised only on the supported OS family.
- **Android home.** Two receivers, each with its own `appwidget-provider` resource so the launcher's picker offers them separately with the right default cell — `vedansh_widget_panchang_info` targets 2×2, `vedansh_widget_verse_info` targets 4×2 — and both stay `resizeMode="horizontal|vertical"`. Rendering is width/height responsive within a kind (compact Panchang drops the city and Rahu Kaal; a verse cell ≥180 dp tall gives each pada its own line, a cell <180 dp wide drops to the excerpt, and everything between flows the full `lines` across three lines). Midnight refresh is **best-effort**, never exact — every layout exposes the represented date and rejects expired data.
- **Section eyebrows** (`आज का श्लोक`, `जप-साधना`) are the one piece of widget copy the payload does not carry, so both native surfaces localize them in all four reading languages — they used to fall back to Devanagari inside a Gujarati/Kannada widget.

**In-app surfaces.**
- **More row** — `होम-स्क्रीन विजेट` in the App group of `MoreScreen.tsx` (icon `▦`, `testID="more-home-widgets"`), with a one-release NEW label, → `WidgetGallery` on the More stack (`MoreStackNavigator.tsx`).
- **Widget Gallery** (`mobile/src/screens/WidgetGalleryScreen.tsx`) — one card per widget kind, each renders a live preview from the **same validated payload contract** the native consumers read (so a preview can never claim freshness the widget won't have) at that kind's **recommended** size — the verse facsimile therefore shows the wide cell's flowed full verse over three lines, not the small cell's excerpt — then a **size row** listing the sizes that kind can be placed at with its best size marked (`saffronTint` pill, `saffronDeep` text; labels from `widgetSizeLabel()` in all four languages), then — Android only, and only for a content type that has a provider — a **per-kind** `requestPinAppWidget()` button (`testID="widget-add-{content}"`) that pins *that* widget rather than one catch-all. The facsimile keeps its single `accessible` node; the size row is one combined a11y node so the pills are not read one-by-one, and the add button stays a real button outside both. Add instructions are platform-specific and now say how to choose/change the size (iOS: swipe sideways in the picker; Android: long-press and drag the edges). Recovery copy renders in the cards when the payload is missing/expired/corrupt. Refreshes on focus, on a 5 s poll while active, and on app foreground.
- **Home Discover card** (§18 / `HomeScreen.tsx` `spotlights`) — one launch-release `FeatureCard` spotlight (`key: 'home-widgets'`, `hasNew`, `वि` glyph in the `saffronDeep`/`typography.thumb` grammar of the §46 संकल्प card) whose CTA opens the Widget Gallery via `rootNav.navigate('MoreTab', { screen: 'WidgetGallery' })`. Order is shuffled per open like every other spotlight.

**Recovery / expired states.** The native reader validates schema, required fields, dates, and freshness before rendering, and fails **closed** — it never shows partially decoded values or an old entry labelled as today: first-run/missing → `विजेट तैयार करने हेतु वेदांश़ खोलें`; corrupt/incompatible → the same safe open-app card; Panchang expired → `पंचांग ताज़ा करने हेतु वेदांश़ खोलें` with no old tithi; verse expired → a neutral open-app card; Japam snapshot old → a refresh prompt (the in-app gallery drops to the recovery card), never an old count as today's. A successful in-app write requests an immediate native reload rather than waiting for the next timeline tick.

**Architecture.** A versioned, bundle-only document — `WidgetPayloadV1` (`mobile/src/widgets/contract.ts`: `schemaVersion`, provenance, `locale`, a ~14-day IST Panchang window, a device-local verse window, and a Japam snapshot). A **pure planner** (`planner.ts` — no React/storage/network/wall-clock/native) builds dated entries; a **deferred coordinator** (`WidgetCoordinator.tsx`, mounted in `App.tsx` outside `NavigationContainer`) runs *after* `InteractionManager` settles — it dynamically `import()`s the planner so the Panchang graph never loads on Home's first-frame path — dedupes by a stable key over day/location/calendar/language/japam revision, throttles writes, atomically persists, then requests a native reload. Transport is the App Group file on iOS (`group.com.prashantsharma.vedansh.widgets`, `mobile/modules/home-widgets-ios/`) and a dedicated SharedPreferences payload on Android. Deep links use the `vedansh://widget/{verse|panchang|japam}` scheme (`deepLink.ts`), dispatched on cold + warm start from `App.tsx`.

**Native targets.** A real WidgetKit **app extension** target (`VedanshWidgets`, bundle id `…vedansh.widgets`, iOS 16+) generated by the CNG config plugins (`mobile/plugins/withHomeWidgets.js`, `withHomeWidgetsIos.js`, sources under `mobile/plugins/home-widgets/`), with App Group entitlements on both app + extension and the four-language serif faces (Noto Serif Devanagari/Gujarati/Kannada + Inter, 500/600) copied into the extension. Android ships an AppWidget provider + RemoteViews under the same plugin. `mobile/ios/` is prebuild output (gitignored) — the plugin is the source of truth.

**Design compliance (§2/§3/§9).** The in-app gallery (`WidgetGalleryScreen`) draws colours from `useTheme()`, geometry from the shared `spacing`/`radii` scales (preview cards use the `radii.lg` card corner, the CTA is a `radii.pill`), and the preview eyebrow from the shared **`eyebrowTextStyle(lang)`** helper (§48) — italic Cormorant + tracking for en, script serif with **no** tracking for hi/gu/kn, so the Devanagari shirorekha is never split. The preview cards' facsimile body/headline sizes are layout-tuned to mirror the OS widget (like the §54 ShareCard) and stay ≥10 pt. On the native side, theme token values are mirrored into the extension through **one reviewed mapping** (`WidgetTheme` in `VedanshWidgets.swift` — `parchmentSoft`/`ink`/`inkMuted`/`saffronDeep`/`gold`, not scattered `Color(red:…)` literals; the Android RemoteViews layout mirrors the same hex). Because the widget forces a fixed light `parchmentSoft` container background, **every glyph is given an explicit token colour** — `ink` for titles/verse/numerals, `inkMuted` for source/metadata/round lines, `saffronDeep` for eyebrows, `gold` for the ॐ brand — and native text **never** falls back to SwiftUI's scheme-adaptive `.primary`/`.secondary`, which would invert to light shades in dark mode (invisible on the cream) and, even in light mode, render `.secondary` as a sub-AA washed-out gray. Section-label eyebrows render in the script serif for hi/gu/kn (Inter for en); text on terracotta-tinted surfaces uses `avoidDeep`. Meaningful widget text stays **≥10 pt** (labels that can't fit are removed, not shrunk); numerals/times/status labels use a non-italic **≥600** face — italic Cormorant is limited to short prose flourishes; state is never colour-only (the streak carries a number/label, avoid windows carry their names); the verse has a deterministic two-line fit with the full text in the accessibility label, and large-text snapshots must not clip Devanagari matras.

**Tests.** Pure/fixture suites under `mobile/src/widgets/__tests__/` — `contract` (schema round-trip; missing/corrupt/incompatible/expired rejection; all-four-languages required; dedup-key sensitivity), `catalog` (content↔size parity across the gallery, the Swift `supportedFamilies`, the Kotlin providers, the manifest receivers in `withHomeWidgets.js` and the `appwidget-provider`/layout resources they name — plus the verse-is-wide-first / Panchang-is-small-first rule this section exists for), `planner` (japa streak, >108, IST vs device-local boundaries, two-line determinism), `planPayload` (real 14-day payload, process-TZ isolation), `deepLink` (verse/Panchang/japam parse + routing + cold-start retry), `startup` (coordinator does no static Panchang import; one iOS kind per content type). A committed fixture (`fixtures/widget-payload-v1.json`) is decoded by TypeScript, Swift, and Kotlin to pin cross-language parity. Maestro `mobile/.maestro/home-widgets-smoke.yaml` covers the More-row → gallery path and the three deep links. **Device-only gates** (PRD-15 §5/§8, not automatable here): EAS multi-target sign + physical-device install, per-size render/VoiceOver/large-text screenshots — now **every kind × every advertised size**, since each is a real placement a user can choose — and the per-kind Android pin flow.

---

## 60. Event Muhurat Finder (शुभ मुहूर्त खोज, PRD-16)

**Purpose.** Answer *"which day should I do this on?"* from the shipped panchang/muhurat/jyotish primitives — ranked days with the auspicious windows inside each, fully offline. Answer-first: the recommendation leads; the panchang reasoning is inspected second.

**Structure.** Four screens in the Panchang stack (`MuhuratFinder` → `MuhuratResults` → `MuhuratDayDetail`; `AbujhDays` beside them):

1. **Occasion picker** (`MuhuratFinderScreen`) — the one decision. A 58pt-row list of the six occasions from `EVENT_RULES` (`panchang/eventMuhurat.ts`), each row Devanagari title + counterpart caption, then the **विशेष शुभ दिन / Special auspicious days** door (`AbujhDays`). The window is fixed at `FINDER_WINDOW_DAYS` (~3 months); no range chooser on the primary path.
2. **Ranked results** (`MuhuratResultsScreen`) — **सर्वोत्तम तिथियाँ** (rank 1 takes the `cardActive` treatment + `elevation.lifted`; the rank-1 tier line carries the provenance suffix **· दृक्पंचांग पद्धति**) then **अन्य उपयुक्त तिथियाँ**. Each card: short date + weekday → quiet tier text → **the best window as the dominant element** (`cardHindi` 17). Two tiers only — **श्रेष्ठ / मध्यम** — never a score (the §51 no-luck-score rule extends here). **Empty-with-reason**: a zero-result window renders the gold-॥ card naming the dominant doshas with their day-counts, then **इसके बाद पहली तिथियाँ** — the first qualifying days beyond the window (the hook keeps scanning to ~260 days).
3. **Day detail** (`MuhuratDayDetailScreen`) — **Answer → Action → Evidence.** The answer block reuses the `cardActive` gradient + ॥ mark: date, panchang line, tier pill on `goldChipBg` (or the terracotta *not-suitable* pill on `avoidChipBg`), and the best window at `cardHindi` 22. Below it the **दिन के सभी शुभ समय** pill links to the shipped `MuhuratDetail` (`{ dateMs }`), and a **ShareButton** in the top bar (shareable = non-excluded days only) captures `MuhuratFinderShareCard` off-screen — occasion, date, panchang line, tier + convention, best + next windows, purohit line, ॐ वेदांश़ brand — via the same `view-shot` → `expo-sharing` pipeline as `MuhuratDetailScreen`; the card carries no personal data by construction. Evidence renders under the actions: अनुकूल/सामान्य factor rows, the full per-occasion dosha checklist (**उपस्थित / नहीं** — words, never colour alone, §12), and up to three further windows on `goldTint` rows. Footer: *परम्पराएँ भिन्न हो सकती हैं। पुरोहित से पुष्टि करें।*
4. **Abujh calendar** (`AbujhDaysScreen`) — days needing no shuddhi, resolved by the **festival engine** (`ABUJH_RULE_IDS`, `panchang/abujhMuhurat.ts`) plus computed Guru/Ravi Pushya days. The festival resolve is bounded by its **date horizon only** — a count cap silently truncated the list to Dussehra plus the Pushya days for the whole of Phase 1 (RULEBOOK §17.8) — and an abujh day now lifts the **seasonal** bars in the finder (chaturmas, guru/shukra asta) so the two screens cannot contradict each other on those. Each row routes to that day's `MuhuratDetail`. It shares the finder's day cache and **paints progressively** — the cheap (precomputed) festival days appear first, then the Guru/Ravi Pushya days stream in — so the screen never sits on a bare spinner (the earlier "stuck on click" on a real device). Every day-solve is individually guarded, so a single malformed solve is skipped instead of stranding the spinner.

**Entries.** Home grid **मुहूर्त** tile after कुंडली (§18, NEW badge); the **MuhuratFinderDoor** row on the Panchang tab (between glance card and anga grid). Both are additive.

**Month-view overlay.** Results carry a **कैलेंडर में देखें** pill → `PanchangHome` with a `muhuratOverlay: { occasionId, days }` param. The existing month grid rings those days (`goldTint` fill + 1.5px `gold` border — selection still wins; cell a11y labels append "Muhurat day", never colour alone §12), auto-expands the calendar, and shows a dismissable `goldTint` chip naming the occasion ("… — शुभ दिन घेरे में", ✕ clears the param). One calendar vocabulary — the finder marks the shipped grid, it does not fork it.

**Engine (Phase 2 — TRD-16/P2).** `panchang/eventMuhurat.ts` is pure (same boundary as `kundali.ts`; guarded by a source-purity test) and grades in **two passes**: a DAY pass for doshas that hold sunrise-to-sunset (adhik · vyatipata · vaidhriti · **chaturmas** · **masa** · **guru/shukra asta**), then a **WINDOW pass** — bhadra-overlapped windows dropped, each survivor graded on the anga prevailing **at its start** (`angaAt`, kshaya-aware: the skipped anga comes first, then *its* successor) plus the anga doshas at that instant (rikta · amavasya · panchak). Every offered window carries its **own tier and factors**; the day's tier is the best window's, shreshtha windows lead. **भद्रा is an interval, not a whole-day flag**: `engine.ts` now solves `karana.endTime` (a 6°-elongation twin of the tithi bisection — `PANCHANG_DAY_CACHE_VERSION` bumped to 2), `bhadraInterval` spans sunrise → that end, and windows inside it are dropped, never clipped; a bhadra that outlasts every window still excludes the day and names बद्रा in the reasons. Chaturmas is derived from the sunrise anga (Devshayani → Dev Uthani, kshaya-safe, **purnimant-normalised** so the user's amanta setting cannot move the season); **masa shuddhi** is a lookup against the same normalised month (per-occasion `masa.barred`, DRAFT — only Upanayana's table is populated pending §10). Asta uses `getSiderealPlanetLongitude` at local noon (orbs 10°/11°; the 8° retrograde-Shukra variant is an open RULEBOOK §17 question). `useMuhuratFinder` scans one panchang solve per day, chunked behind `InteractionManager` + `setTimeout(0)` like `useMuhurat`.

**Thirteen occasions, grouped picker.** `EVENT_RULES` now carries भवन (Griha Pravesh, Bhumi Pujan) · संस्कार (Namkaran, Vidyarambh, **Mundan, Annaprashan, Karnavedha, Upanayana**) · क्रय व आरम्भ (Vahan, Vyapar, **Sampatti, Swarna**, and — Phase 3 — **यात्रा**, which joins this group rather than taking its own row); the picker renders three `sectionLabel` groups over the same `ListCard` rows — no new card grammar, अबूझ door still last. Annaprashan's 6th–8th-month guidance is caption copy (the same plain-occasion treatment Namkaran shipped with — a within-window mode remains future work). All thirteen tables are DRAFT (`verified: false`).

**Phase 3 — लग्न-grade windows (PRD-16/P3, Aug 2026).** `panchang/lagnaSweep.ts` (pure) tiles every civil day into its 12–13 ascendant-rashi spans: a closed-form `ascendantSiderealLongitude` in `kundali.ts` (mathematically identical to `computeLagna`'s bisected root — agreement < 1e-12° verified) is swept from sunrise to next sunrise and each 30° crossing is bisected **in time**. The spans live in **`DayInputs.lagnas`** (one store, every surface shares the solve — measured cost +3.6% on `computeDayInputs`, far inside the ≤ 25% gate, so the in-store default holds and **`PANCHANG_DAY_CACHE_VERSION` is 3**). The window pass now **splits first, grades second**: each surviving window splits at every lagna boundary AND every anga changeover inside it (kshaya-aware — the skipped anga inserts its own segment); split parts under **24 minutes (~1 ghatika)** are dropped, never clipped; each segment is graded at its own start, so nothing is "graded at start and flagged" any more — the segment IS the window. Lagna is a **factor, not a fourth chip**: a *preferred* lagna sets `factors.lagna` (tie-break + evidence word), a *barred* lagna demotes श्रेष्ठ → मध्यम and never excludes a day; **the per-occasion tables ship EMPTY DRAFT** (grading inert, pinned by test) pending the two-source review in `docs/roadmap/conventions/muhurat-lagna-v1.md`. **Hora** (`panchang/hora.ts`, pure, not persisted): 12 + 12 unequal planetary hours, weekday-lord first; **evidence and tie-break only** — segment ordering runs tier → preferred lagna → window priority (Amrit → Abhijit → Shubh → rest, unchanged since Phase 1) → benefic hora (गुरु/शुक्र/बुध) → time, so hora can never move a tier or leapfrog the priority order. **Late-onset Vishti is solved** (the §0.3 prerequisite): `engine.ts` fills `PanchangData.lateVishti` when the karana after the sunrise karana is Vishti, and `bhadraInterval` returns it, so an afternoon Bhadra drops windows exactly like a sunrise one (27 Aug 2026 — the eve-of-Raksha-Bandhan Bhadra — is the re-pinned example: Phase 2 offered its Purnima windows blindly; Phase 3 honestly excludes the day naming बद्रा). **यात्रा + दिशा शूल**: the results screen alone shows an 8-direction दिशा chip row above the list (persists through the re-scan a chosen direction starts); the chosen direction's shool days are excluded **with the reason naming the direction**; direction is scan-time input, never persisted (a followed यात्रा day re-grades direction-free). दिशा शूल rows are DRAFT in the same convention doc; intercardinal directions carry no shool in v1 (recorded variant choice).

**Phase 3 UI.** Result cards stay the identical `ListCard` — the best-window line gains a quiet **lagna chip** (`शुभ 8:05 – 9:31 AM · वृश्चिक लग्न`), and when the best window is a lagna-split part its contiguous sibling renders as a second line with an italic `लग्न सीमा पर विभाजित` note (anga-split siblings don't — their chips would be identical; the detail carries that story). Day detail: the best-window line in the answer block appends `· <rashi> लग्न`; the "यह तिथि क्यों?" evidence gains a **लग्न row** (span + अनुकूल/सामान्य — splitting guarantees the span covers the whole window, so the sub-line can say so truthfully) and a **होरा row** whose verdict word is **साक्ष्य** (evidence only — wording, not colour, keeps it visibly outside the tier contract); each windows-list row appends its segment's lagna beside the tier word. The share card gains the best window's lagna line only — general panchang data, still no personal data by construction (open question §14.7: drop without engine change if it clutters the 4:5 card).

**Phase 4 — personalised Tarabala/Chandrabala (PRD-16/P4, Aug 2026).** `panchang/taraChandraBala.ts` (pure integer arithmetic) + `useMuhuratBala`: with a **saved Kundali profile** — never re-asked, nothing derived ever persisted — every candidate day gains a quiet **आपके लिए** strip: the 9-tara word (inclusive janma→day count reduced mod 9; विपत्/प्रत्यरि/वध unfavourable, जन्म **contested** — the shown word मत भिन्न is an open review question) and the chandra position (4/8/12 unfavourable, the 8th rendering **चंद्राष्टम**, the strongest warm-avoid word the strip can show). Evaluation instant is the best window's nakshatra (`angaAtWindow ?? sunriseAnga`) and the day Moon's rashi at the window start, so the strip can never contradict the recommended window. **It annotates, never re-grades**: no tier change, no exclusion, no reordering — the general verdict stays identical across users and across every rider (share card, reminder scheduler, ★ chip, month overlay). Both class tables are **DRAFT** pending `docs/roadmap/conventions/muhurat-tarabala-v1.md`'s two-source review, and the convention **deliberately diverges from the Guna Milan Tara koota** (divergence test-pinned — never reuse that matrix). UI: one tint+word row (`MuhuratBalaStrip variant="row"`) under the result card's window lines; a full-width strip (`variant="card"`) between answer and actions on the day detail, with a one-line explainer naming the जन्म नक्षत्र/राशि it counted from (auditable against the Kundali screen) and stating "यह दिन की श्रेणी नहीं बदलता". **No-profile state: the strip simply isn't there** — no modal, no badge, no per-card CTA; the ONLY trace is one italic footer line on the results list (`कुंडली सहेजने पर हर दिन आपके तारा/चन्द्र बल के साथ दिखेगा`), styled as the disclaimer beside it, deep-linking to the shipped Kundali screen — struck at the first design review if it reads as a nag, never migrated onto cards or the detail. **Privacy:** the strip never reaches `MuhuratFinderShareCard` (which stays "no personal data by construction") or any notification copy — both absences test-pinned; no cache-version bump (nothing in `DayInputs` changes; the profile key is outside the derived-cache universe).

**शुभ योग annotation (PRD-27 — §69).** Result cards and the day detail carry the day's shubh yogas as an **annotation beside the verdict, never inside it**: `shubhYogasForDate` (`muhuratFinderScan.ts`) reads the same day store *beside* `verdictForDate`, and `eventMuhurat.ts` does not import `shubhYoga.ts` (source-guard test) — so tiers, ordering, sections, the empty state and every rider (share card, reminder scheduler, ★ chip, month overlay, abujh list) are byte-identical with and without it, and an offset can never creep in as a "small" edit. On a **result card** the yoga renders as chips between the tier line and the best-window line (one `MuhuratChip` per yoga key, yoga tone, full "… योग" names; computed deferred after the scan settles, so every store read is a cache hit; chronological/tier order untouched — क्रम तिथि से है, योग से नहीं). The **day detail** renders the shared `ShubhYogaCard` (chips + windows through `formatEndInstant`) between the answer block and the आपके लिए strip — including on an **excluded** day, because a dosha and a yoga coexist and the app refuses to net them; the excluded answer block also gains **dosha chips** naming the present doshas (`MuhuratChip`, dosha tone: `avoidChipBg` + `avoidDeep`) above the full उपस्थित/नहीं checklist. The share card deliberately does **not** gain a yoga line in v1 (PRD-27 §9). Tables are DRAFT in `docs/roadmap/conventions/shubh-yoga-v1.md` (release-gating, RULEBOOK §24).

**Day detail, Phase 2 additions.** The windows list gains the **भद्रा row struck through in place** (the Rahu Kaal treatment — the user sees it was considered) with a वर्ज्य word-tag, and every other-window row carries its **tier word**. The "यह तिथि क्यों?" factor rows state the anga **at the best window** as the verdict, with the sunrise (udaya) anga as a quiet second line when they differ — the Panchang tab shows the udaya anga and always will, so without that line our own two screens would look contradictory. **Blast radius (TRD §1.2):** solving `karana.endTime` also makes the Panchang tab's Karana tile and the daily Muhurat card's Karana row show their end instant, with no change in those surfaces — wanted, since Tithi/Nakshatra already do.

**Localisation & type.** Every string is authored Devanagari + English through `contentByLang` (gu/kn derive); verdict words are अनुकूल / सामान्य / उपस्थित / नहीं — never Latin chips. Devanagari text carries no letterSpacing; section labels drop their tracking outside `en`. Warm palette only; tier/dosha signalling is tint + word (§12).

**Shared components (no forks — §7/§9, RULEBOOK §9).** All four screens use the canonical **`ReaderHeader`** (`variant="index"`, like GunaMilan §58) — `[back] · centred title · right slot` — never a local top-bar/back copy; the day detail passes the shared **`ShareButton`** into its `right` slot. Secondary context that used to live as a header subtitle is a content line instead (the picker's "आप क्या करने जा रहे हैं?" prompt; the results' `city · दृक्पंचांग पद्धति` line, which also carries the on-surface provenance).

Every list item in the feature is the shared **`ListCard`** (`components/ListCard.tsx`) — the app's library list-card grammar extracted so muhurat doesn't fork its own look: a separate rounded card with the `cardActiveFrom→cardActiveTo` gradient + `cardActiveBorder` + `radii.lg` + `elevation.card`, a leading `CardThumb` (52pt gradient square), a title/subtitle column, and the standard 26pt saffron chevron. **No add-to-routine `+`** (that stays `LibraryCard`-specific). It is used by the **occasion picker** (thumb = Devanagari glyph, title = occasion, caption = counterpart), the **result cards** and **Abujh cards** (thumb = day number, title = month · weekday, then tier, then the best window), and the **`MuhuratFinderDoor`** (via the card's **`flat` variant** — `parchment-soft` on `divider`, no gradient, so it defers to the glance card above it, §33; thumb = a drawn sunrise glyph on a `saffron-tint` disc, title + नया/NEW badge, subtitle). **Every result card is identical — there is no "hero" first card and no ordinal digits**; rank is carried by list order + the सर्वोत्तम / अन्य उपयुक्त section labels, matching the app's uniform-list convention.

**Performance — one day-store for the whole subsystem.** The per-day inputs (panchang solve + asta flags) live in the framework-free **`panchang/panchangDayStore.ts`**, keyed by **absolute civil date** (`YYYY-MM-DD`) within a scope of **`locationKey` + calendar system** — the app's canonical location key (cityId, else `lat,lng@2dp`), the same one the observance cache and the engine's Observer cache use, so a GPS fix with no cityId can never alias another city's days. Absolute-date keying (rather than an index off a scan's start day) is what makes a solved day survive a **midnight rollover** and an entry that starts on a different day. The store is bounded to **`MAX_CITIES` = 5 scopes, LRU**: a 6th city evicts only the least-recently-used one and fires eviction listeners; touring cities never evicts the ones under the cap.

**Every** panchang surface reads that one store — the picker warmup (`useMuhuratFinderWarmup`), the occasion scan (`useMuhuratFinder`), the abujh scan (`scanAbujhDays`), the day detail (`MuhuratDayDetailScreen`), **and the daily surfaces**: Home's Today strip and the daily Muhurat card (`useMuhurat`) plus the Panchang tab's own day (`useTodayPanchang` / `usePanchangForSelection` / `usePanchangForDate`). So a day solved by any surface is free for all the others: the finder's ~90-day sweep also warms Home's today/tomorrow, and Home's solve warms the finder. None of these hooks keeps a private cache — `useMuhurat`'s old `SOLVE_CACHE` and the finder's old index-keyed `DAY_INPUT_CACHE` are both gone, and `MuhuratDay`/`nowPeriods` are re-derived per call because they are pure arithmetic over the cached days. Scans stay chunked behind `InteractionManager`, and yields are skipped for fully-cached chunks so a warm surface never flashes the spinner. Store and scan core live outside React precisely so they are unit-testable under the tsx engine suite (`panchangDayStore.test.ts`, `muhuratFinderScan.test.ts`).

**One deliberate exception: the widget writer.** `widgets/planPayload.ts` solves with `civilTimeZone: WIDGET_TIME_ZONE` (its 14-day snapshot is IST-anchored, not device-local), and the scope key models only (location, calendar system) — so routing it through this store would alias its days onto the app's and hand one of the two readers the wrong day. `ScanOptions` declares `civilTimeZone?: never`, making that a compile error rather than a silent correctness bug.

**Persistence.** Those solves are also written to disk, so re-entering any surface — or **cold-starting the app** — no longer re-solves. **`panchang/panchangDayCache.ts`** is the only module that touches AsyncStorage (the same `observanceStore` ⇄ `observanceCache` split, and the reason the store stays RN-free): one key per `(scope, civil day)` under `@vedansh:panchang-days:v<VERSION>:<scope>:<YYYY-MM-DD>`. Hooks `await hydratePanchangDays(...)` the range they need **before** solving and fire-and-forget `persistPanchangDays(...)` after; hydrate short-circuits with **no storage call at all** when the range is already warm, so a warm re-entry never waits on disk. Retention runs from **`RETAINED_PAST_DAYS` = 2** days back — one day is the hard requirement (`useMuhurat`'s pre-dawn correction reads yesterday's night choghadiya, so a today-onward cutoff left Home solving a day on every launch), the second is margin for the date picker's back-navigation; the same cutoff governs persist AND purge, so the sweep can never delete what persist just wrote. Older and stale-version keys are purged **once per session** (the sweep reads the whole AsyncStorage keyspace, and what it collects can only appear between launches or at midnight, so re-running it per cold range only put a full scan in front of the first hydrate of every day) and — since Aug 2026 — **after the read, unawaited**: it is pure housekeeping, because a stale-version key lives under a different key prefix and can never be returned by a current-prefix `multiGet`, while a still-readable day past the retention window is a *correct* solve for that day. Putting it in front of the `multiGet` meant the first cold surface of every launch waited on a whole-keyspace scan to learn nothing it needed. `panchangDayCacheSwept()` exists so the cache's own tests can await it; production code never may. An LRU eviction drops that city's disk keys too.

**Reading the cache is I/O; only solving is CPU (Aug 2026).** `useMuhurat` used to run its whole chain behind one `runAfterInteractions` + `setTimeout(0)`, so even a full cache hit could not reach the screen until the UI reported itself idle — Home's `आज का पंचांग` kept its `—` headline for the duration, which reads exactly like a cache that isn't there. Hydration is disk I/O the JS thread does not perform, so it now starts immediately and paints the moment disk answers; the interaction gate is reserved for what actually competes for the thread — astronomy for days disk did *not* have, and the roll-forward. Its sibling fix is in the Today strip itself (§48): the chip auto-scroll was holding an InteractionManager handle indefinitely, so on Home "idle" almost never arrived — and its follow-up is there too, because releasing the handle left the animation itself running forever at 60Hz on the launch path (§48 now drifts once, on a timer, after a settle delay), and the strip's पितृ पक्ष chip was solving its fortnight in a bare `setTimeout(0)` outside the persisted layer built for exactly that solve. **Neither runs until the scope key is real**: `usePanchangLocation` reports the default city and `usePanchangCalendarSystem` reports purnimant while both hydrate from AsyncStorage, so a user on any other city or on amanta was spending a hydrate, three solves and a seven-day roll-forward on a scope discarded a tick later — on the launch path, ahead of the real one. `useMuhurat` now gates on `isLoading` + `usePanchangCalendarHydrated()`, the same pair `WidgetCoordinator` has always gated on. Pinned by `panchangDayRouting.jest.test.ts` (a disk hit paints with the interaction queue held open; nothing runs on a placeholder location) and `panchangDayCache.jest.test.ts` (the read lands with the sweep stalled).

**The read starts at process launch, not after Home mounts (Aug 2026).** Third and last shape of the same report, and the one the two fixes above could not reach: not *what* stood in front of the read, but *when the read was allowed to begin*. The scope key needs BOTH panchang preferences, and they were read separately — the city from `PanchangLocationProvider`'s effect, the calendar system **lazily, by its first subscriber**, which is Home's Today strip, mounted only once `AppReadyGate` has opened the splash on the font-scale/language reads. So the `multiGet` that answers "what is today's panchang" was the launch's **third serial storage round trip**, behind a screen that had already painted everything else from bundled JS. A warm cache still read as a cold card, because the card is the one thing on Home that cannot render without disk.

**`panchang/panchangPrefs.ts`** now owns both preferences behind **one memoized `multiGet`** (they are read together because together they are the scope key), and **`panchang/panchangLaunchPrefetch.ts`** turns that straight into warm days. `App.tsx` calls `prefetchTodayPanchang()` at **module scope**, beside the derived-cache reset and for the same reason — it must be in flight before React renders anything that reads it — so the preference read and the day read run *concurrently with* the splash gate instead of after it. By the time `TodayStrip` renders, the three civil days it needs are already in `panchangDayStore`, `usePanchangCalendarHydrated()` is already true, and `PanchangLocationProvider`'s lazy initializer starts on the user's real city with `isLoading` already false — so `useMuhurat`'s cache-only `useState` seed composes on the **first render** and the headline arrives in the same frame as the rest of Home. Three constraints hold it honest: the prefetch is **hydrate-only and never solves** (moving I/O earlier must not move CPU onto the launch path — astronomy stays behind `InteractionManager`); it warms exactly `todayMuhuratDayKeys()`, the shared helper `useMuhurat` reads through, because a prefetch that warms a different three days is a prefetch that does nothing (`composeSolved` returns null on ANY miss); the provider now issues **no storage read of its own**, awaiting the shared one, so the launch spends a single panchang-preferences round trip rather than two; and only a **successful** read is memoized, because one shared read that caches its own failure would pin the session to the fallback city with no retry. Pinned by `panchangLaunchPrefetch.jest.test.ts` — including a deliberate non-vacuity case asserting that *without* the prefetch the first render is still blank.

**Roll-forward — the window must lead the surfaces, not end with them (Aug 2026).** Home's Today strip reads three civil days (yesterday's night window, today, tomorrow's sunrise) and used to persist exactly those three. So the persisted window always *ended* at tomorrow, and the first launch after every midnight found its own "tomorrow" missing — and `composeSolved` returns null on ANY miss, so the strip fell back to its `—` headline while the deferred path ran a purge sweep, a `multiGet`, and a fresh solve. Once per calendar day, for as long as the app was installed: a working persistent cache that still read to the user as "today's panchang is computed every day". **`panchang/panchangDayPrewarm.ts`** closes it — after the day's own solve lands, a today surface rolls the window **`PREWARM_DAYS` = 7** days past today (matching `FOLLOW_CHIP_HORIZON_DAYS`, so the strip's followed-muhurat chip lands warm too), then persists. A rollover then costs zero astronomy for anything on screen; the only solve left is the far edge of the window sliding one day out, in the background, for a day nothing reads. The warm is RN-free (the `InteractionManager` boundary belongs to `useMuhurat`), chunked with a yield every 2 real solves, cancelled on unmount, guarded so the two mounted today surfaces can't race the same cold days, and it never feeds React state — nothing re-renders because of it. Free when there is nothing to do: a warm range never reaches storage at all. Six extra keys per city. Storage is therefore bounded by 5 cities × one scan horizon (~231 KB per city at ~906 B/day for a 260-day sweep). `Date` fields are tagged generically by `panchangDaySerde.ts` (a plain `JSON.stringify` would flatten `sunrise`/`endTime` to strings that never revive, silently changing what the user sees). **Only a location or calendar-system change forces fresh solves** — a different scope.

**Build-change reset — the backstop under both cache versions (Aug 2026).** Hand-maintained cache versions only invalidate what someone remembered to invalidate, and a device that already scanned keeps serving the old engine's output forever, so a forgotten bump means the fix reaches only fresh installs. `utils/derivedCacheReset.ts` closes that class of bug: on every launch it compares a **build fingerprint** against the one the device last ran and, if it moved, clears the derived caches *before anything reads them*. The fingerprint (`utils/buildFingerprint.ts`) is `updateId | runtimeVersion | expoConfig.version | native build number` — the OTA id catches every OTA (and a rollback to the embedded bundle), `runtimeVersion` the store release (policy `appVersion`), the bundle's own version the same thing if that policy ever changes, and the build number a rebuild of the *same* version, which the other three share. Cost is asymmetric on purpose: a needless sweep costs one launch's re-solves, a stale cache costs the user the fix.

**Scope is engine-computed calendar output only, and that boundary is the whole safety story.** Swept: `@vedansh:panchang-days:` (the per-day panchang/muhurat solves, plus the legacy `muhurat-days:` root), `@vedansh:observances:` (the per-city festival/vrat date scans — same engine family, and where a wrong DATE would sit), and `@vedansh:pitru-solves:` (the solved पितृ स्मरण occurrences and Pitru Paksha windows, §63 — the answer a scan over hundreds of those days produced, keyed by tithi alone). **Never** swept: the chosen city and calendar system (`@vedansh:panchang-location` / `panchang-calendar-system` — panchang-shaped and the easiest mistake here; clearing them silently returns the user to Ujjain), notification bookkeeping that mirrors what is actually scheduled with the OS, and every piece of practice, history, follow, birth detail and Pitru Smaran entry, none of which any engine can recompute — note that `@vedansh/pitru-smaran` (the family ledger the user typed) and `@vedansh:pitru-solves:` (dates derived from it) differ by one character and sit on opposite sides of this line. Also deliberately out of scope: `@vedansh/widget:last-plan-key-v1` — derived, but not calendar output, and it needs no help since `WidgetCoordinator` re-plans every pass and rewrites whenever the payload actually changes. `derivedCacheReset.test.ts` enumerates the full non-swept key set — the out-of-scope derived key included — and fails if any allowlisted prefix ever starts matching one.

Two mechanics hold it together. `App.tsx` registers the reset at **module scope**, not in an effect, and both caches `await awaitDerivedCacheReset()` before touching storage — on hydrate so nothing reads days the sweep is about to delete, and on persist so nothing writes days it will wipe while the session's bookkeeping believes they are safe. And the reset module imports **AsyncStorage only**: `expo-updates`/`expo-constants` are untranspiled ESM Jest cannot parse, so the fingerprint read is isolated in its own module (the same reason `panchangDayStore` stays RN-free) — otherwise the gate would drag them into ~90 suites. A failed sweep leaves the fingerprint unwritten so the next launch retries, rather than recording a reset that never happened.

> **RULE — bump `PANCHANG_DAY_CACHE_VERSION` (`panchang/panchangDaySerde.ts`) whenever the panchang engine changes**, or whenever persisted days could otherwise serve stale results (a change to `DayInputs`' shape, to `computeDayInputs`, or to the asta flags). Devices that already scanned keep hydrating the OLD engine's days forever otherwise, and the fix ships only to fresh installs — the same trap as `observanceCache`'s `CACHE_VERSION` (§ the Panchang gotchas). Two further preconditions hold the shared store together: keys use `locationKey`, and **no consumer may mutate a returned `PanchangData`** — every reader gets the same instance, so an in-place write corrupts the other surfaces and the persisted copy. Correctness is pinned by `dayCacheParity.e2e.test.ts` (*fresh == cached == serialize→revive* over a full year × 3 locations × 2 calendar systems), `panchangDayImmutability.test.ts` (the no-mutation invariant, with a self-test proving the guard isn't vacuous), `__tests__/jest/panchangDayCache.jest.test.ts` (storage, including the once-per-session sweep), `__tests__/jest/panchangDayPrewarm.jest.test.ts` (the roll-forward window, its in-flight guard and cancellation), `__tests__/jest/panchangDayRouting.jest.test.ts` (the daily surfaces solve zero days when the store or disk is warm — **plus a real midnight rollover**, faking `Date` alone so the hooks' deferred chain still runs on real timers; a Maestro flow cannot move the device clock, so this is the only place that gate can live), and `.maestro/panchang-day-cache-smoke.yaml` (the cold-start journey).

**Follow & remind (PRD-16 §6.7).** The day detail's **action band** carries a single **☆ इस मुहूर्त का अनुसरण करें** pill above the shipped `दिन के सभी शुभ समय` link — so Answer → Action → Evidence still holds, and follow is offered *after* the day is read rather than while scanning (every result card stays identical, so there is no per-card ★). An **excluded day offers no follow affordance at all**. Following opens the **shared `VratReminderSheet`** (extended with optional `dayOfOptions`/`subtitle`/`dayOfLabel`/`footnote` — not forked, §7/§9) carrying one muhurat-only choice, **मुहूर्त से 30 मिनट पहले**, alongside 07:00/08:00. Saving with both notices off unfollows. The followed state replaces the CTA with a quiet `saffronTint` row that **states the resolved fire times** (`tabular-nums`, `numberOfLines={1}`) rather than "Reminder on" — the only way a user can see that changing city moved them — plus a **बदलें** re-entry.

Storage is `contexts/MuhuratFollowContext.tsx`, a sibling of the vrat store rather than a reuse: a muhurat follow keys **one civil day** (`{occasionId}:{YYYY-MM-DD}`), sorts soonest-first, and **prunes itself once past**. Notifications are the seventh family — pure planner `notifications/muhuratReminderPure.ts` (prefix `muhurat-reminder`, cap 8 soonest-first, `ADVANCE_HOUR` shared with the vrat planner) + `muhuratScheduler.ts` glue + headless `<MuhuratReminderScheduler>`. **`clampDayOf` pulls the day-of notice back to `windowStart − 30 min`** whatever the user picked, because a muhurat is a time: the 17 Aug 2026 Vahan window opens 6:07 AM and a literal 07:00 would arrive after it. Windows are **never persisted** — the scheduler re-derives each follow's window from `panchangDayStore` and re-arms on **location and calendar-system change**; a followed day that re-grades to `excluded` fires nothing and says so in words (§12). A tap deep-links to `MuhuratDayDetail {occasionId, dateMs}` with the date carried in the payload (an advance notice is read on a different day than it names).

**Three contextual surfaces, zero chrome when unused.** ① Home's **Today strip** gains a `saffronTint` ★ chip leading the row (`वाहन क्रय · सोम 6:07 AM` → that day's detail) only while a follow sits inside `FOLLOW_CHIP_HORIZON_DAYS` (7) and still grades. ② Home's **FOR TODAY** row gains an `cardActive` **अबूझ मुहूर्त** card on abujh days (`useTodayAbujh`) → `AbujhDays`; on a catalogued festival day it slots **second** so the festival card still leads (`festiveReminders.test.ts` pins that promise). ③ **`MyVratScreen`** grows an **अनुसरण किए मुहूर्त** section — one ★ inventory, not two — whose rows carry a date + countdown and re-solve to show drift in words. That screen's empty state now gates on both follow counts, since a user can follow a muhurat before any vrat.

**Known limits (post-Phase 3/4).** Rule tables are DRAFT pending §10 review (RULEBOOK §17 — release gate), now including the masa tables, the lagna-preference/hora/दिशा-शूल tables (`muhurat-lagna-v1.md` — the lagna tables ship EMPTY, so that factor is inert until review) and the Tarabala/Chandrabala classes (`muhurat-tarabala-v1.md`); both convention docs were authored **without content egress**, so their §10 sourcing is entirely outstanding. Two Phase-2 limits are CLOSED: windows straddling a changeover are now split, and late-onset Vishti is solved. Still open: yoga end-times stay unsolved by design (Vyatipata/Vaidhriti remain day-level); Abhijit-on-Wednesday (the minute-grade windows make the always-emit choice more visible); Chandra-vasa for यात्रा (out of v1); the जन्म-tara word and an opt-in "prefer my good days" sort (both carried to the tarabala review). **The abujh↔finder contradiction is only partly closed**: seasonal bars now yield, but an abujh day can still be excluded by a per-day dosha (Akshaya Navami on a rikta tithi) or by failing the occasion's nakshatra/tithi/vara match (Dhanteras, excluded on factors alone) — while the Abujh screen calls the same day auspicious in its entirety. §4.2's wording is stronger than what ships; RULEBOOK §17.8 carries the decision to §10. Following an **occasion** as a standing interest ("tell me when a श्रेष्ठ day appears") remains out of scope — this slice follows *days*. Maestro `muhurat-phase3-smoke.yaml` / `muhurat-phase4-smoke.yaml` are authored but still need their first device runs (iOS and Android reported separately, per the e2e policy).

---

## 61. Namkaran (नामकरण) — PRD-17

**Purpose and placement.** Namkaran supplies a traditional starting sound from the birth Moon and a shelf of reviewed names; it never ranks names, scores them, or makes claims about the child. It is the fourth shipped `JyotishToolCard`, immediately below Guna Milan in both guest and saved-profile Jyotish landings, and pushes `Namkaran` → `NamkaranResult` (and `Namkaran`/`NamkaranResult` → `NamkaranRashi`) inside the existing Panchang stack. Phase 1 deliberately has no Home tile and no vidhi module.

**Charana is primary; rashi is a peer entry, never a second answer.** The nakshatra charana is the finer calculation — one of 108 cells — and a rashi is exactly nine of those cells derived from the same table (convention §4), so the hero, the name index, the filters, the shortlist, the muhurat door, and the share model all stay charana-keyed. What rashi gets is *reachability*, because families are far more often told the Moon sign than the charana: a third browse door (`राशि से चुनें`) on the entry screen using the same 3-column launcher grid over twelve tiles, and the `NamkaranRashi` detail it lands on. Rashi is never rendered as a competing hero, a ranked alternative, or a second syllable table.

**Input and privacy.** The child mode of the shared `BirthDetailsForm` renders date + IST time only: no name, city, saved-Kundali autofill, or global Panchang-location mutation. Unknown time is stored as `null` and enumerates the whole IST civil day; noon is never fabricated. Birth input is session-only unless the initially-off `Remember birth details` switch is selected; its supporting copy says only that the form will be prefilled next time. The opt-out uses an invalidating mutation queue so clearing wins over an in-flight save. The shortlist is a separate id-only record and survives clearing birth input.

**Answer grammar.** An exact result leads with the one new answer component, `NamaksharCard`: `cardActiveFrom → cardActiveTo`, gold `॥`, lifted elevation, a generous line box for the syllable, pronunciation aid, then nakshatra/pada/rashi provenance. The 58 pt syllable (54 pt on the share card) pins **no `lineHeight`** — its box is the container's `minHeight` 96 instead. A fixed leading under the natural Devanagari line box sliced everything above the shirorekha (`के` shipped as `क` plus a stub, August 2026) and, being fixed, could not follow `maxFontSizeMultiplier` either, so it clipped again at the top type step. Every micro label across these surfaces — the `॥ नामाक्षर` eyebrow, `नाम देखें`, `कैसे निकला?`, `राशि अनुसार अक्षर`, `चुने नाम शेयर में जोड़ें`, `दिन की एक सम्भावना`, the rashi detail's `राशि के नौ चरण` and `इस दिन की सम्भावना`, and the share card's two eyebrows — routes through `pillTextStyle` (§3.0): they shipped as Inter + Latin tracking, which has no Indic glyphs and prises each cluster apart. Guarded by `components/__tests__/namkaranTypeFit.test.tsx` across all four languages. Unknown-time results have no hero and no share action; every candidate is a uniform shipped `ListCard` with an IST window. Each candidate **opens** that charana's full result — hero, context, names, shortlist — carrying `fromUnknownTime`, which keeps a `दिन की एक सम्भावना · One of the day's possibilities` notice above the hero and suppresses the exact-syllable share and its shortlist opt-in (§8.3 invariant 5). Uniform rows are the anti-ranking discipline; being navigable is not ranking. The flag is what suppresses the share, not the basis: the identical charana reached deliberately through a nakshatra or rashi browse still shares, because a browse is a table lookup rather than a claim about this child's birth. The flag also travels through the rashi detail — an uncertain result opens `NamkaranRashi` with `dayCharanas`, so those rows mark as that day's possibilities and re-flag on open. Without that the detail would be a side door back to the share the range path withholds (RULEBOOK §18.3/§18.8). The two path-B doors, four pada choices, name rows, and muhurat door are also `ListCard`. The 27-choice nakshatra selector is the deliberate compact exception: the shipped Home `CategoryCard variant="launcher"` in a 3-column × 9-row grid, with the current-language name fitted inside the tile over at most two lines and no ordinal-number title. This is an explicit index variant of §18's label-below launcher: the in-tile label holds **one fixed size** (13 pt Devanagari / 14 pt Latin, `lineHeight` 21, `numberOfLines={2}`, `maxFontSizeMultiplier` 1.25) across all 27 tiles — no platform auto-fit. It deliberately does **not** use `adjustsFontSizeToFit`: on iOS a multi-line label with a fixed `lineHeight` shrinks erratically and ignores `minimumFontScale`, so scattered tiles (हस्त · चित्रा · स्वाती) collapsed to a few points beside full-size neighbours (August 2026). Two lines at the fixed size clear every shipped name — the longest word in any of them is ~6 Devanagari clusters — so nothing needs to shrink. It replaces the former 27 full-width rows without creating a new card grammar. The name list is a `FlatList` with word+tint gender, length, and shortlist states; its header ends with `paddingBottom` 14 so the first name card clears the length-filter chips — a `gap` only spaces the header's own children, and with zero clearance the card's upward shadow bled onto the chips and the two read as one overlapping block.

**Rashi cross-check and detail.** The result's `RASHI SOUNDS` card derives its cells from `rashiCharanaEntries` — nine *charanas*, not a flattened syllable list, so the 3×3 shape survives charanas that carry alternates (Makara spans Shravana's dual ज/ख series: nine charanas, thirteen syllables). Each cell is a 44 pt control that opens that charana's names — except the cell(s) this result already shows, which render as a marked, non-interactive `यही · this one` state (word + tint, greyscale-legible per §12) because pushing a duplicate of the screen being read is not a destination. A `Rashi naming detail` row opens `NamkaranRashi`. The `NamaksharCard` hero itself is never tappable (`accessibilityRole="summary"`): it *is* the answer, with its names already listed below it. An unknown-time result renders **one card per distinct rashi the day touched** (`distinctRashiIndices`) with a line saying the Moon changed rashi, because roughly one day in two crosses a 30° boundary and naming only the first candidate's rashi would rank a candidate the range path refuses to rank. `NamkaranRashiScreen` is the detail: a summary card (rashi name, charana/sound counts, the nine glyphs), then the nine charanas grouped by nakshatra as `ListCard` rows carrying the pada, its sounds, a lazily-counted name total when the corpus has one, and a thin-charana note. Both surfaces state plainly that charana-naming and rashi-naming are both in use.

**Share boundary.** Exact results reuse `JyotishShareSheet` and a fixed 4:5 `NamkaranShareCard`. Its model allow-lists syllables, nakshatra, pada, rashi, disclaimer, and brand. Shortlisted names require a fresh per-share opt-in and are capped with an overflow line; birth date/time, location, basis, longitude, profile identifiers, and hidden metadata cannot enter the model. An unknown-time range has no exact share.

**Content and release state.** `namakshar-v1` remains `verified:false`; the convention and full name corpus are release blockers under RULEBOOK §18. The checked-in shards are an explicitly `releaseEligible:false` development sample used to exercise the UI/privacy flow without inventing editorial sign-off — 17 names over 9 of 108 charanas, so most charanas legitimately render the "not yet available" empty state on a dev build. The production corpus must meet the attestation and 12+12-per-charana/fallback contract before the card is exposed in a release.

**Corpus shape — 27 shards and a count index.** The corpus is **one file per nakshatra**, `data/namkaran/names.<NN>-<slug>.json` (`names.00-ashwini.json` … `names.26-revati.json`), behind a **static** require map in `data/namkaran/index.ts`; Metro cannot resolve a computed require path, and listing the 27 literally also keeps the shard set auditable. The split is keyed to nakshatra because `charana → nakshatra` is `floor(c/4)`, which makes both an exact result and a thin-charana fallback exactly one shard — the fallback needs a whole nakshatra, and a nakshatra *is* a file. Worst case is an unknown-time day straddling a nakshatra boundary: two shards, ~58 KB. A name whose charanas span two nakshatras lives in both shards, byte-identical, de-duplicated by id at load. Per-charana name counts for the rashi detail's nine count lines come from generated `counts.json` (`npx tsx scripts/namkaran-build-index.mts`), **not** from loading shards to tally them: a rashi's nine charanas span up to three nakshatras, so tallying would pull three files to print nine numbers and undo the sharding. No surface loads the whole corpus — there is deliberately no full-corpus loader to reach for. Budgets and the reviewed decision behind them: RULEBOOK §18.4a.

**Fallback notice tracks the fallback, not the wish for one.** The `प्रचलित नाम सीमित हैं` line renders only when the nakshatra-level broadening was actually **applied**, which means exact results only. A range deliberately does not broaden — widening to one candidate's nakshatra would privilege that candidate, the exact ranking the unknown-time path refuses to do — so on a range the notice stays away rather than describing a broadening that never happened. It shipped keyed to "fallback was wanted" and so claimed the whole nakshatra while still listing one charana's names (August 2026). Both directions are pinned in `screens/__tests__/NamkaranExperience.test.tsx`; the range case needs a fixture day whose charanas are all nameless (charanas 60–64 at present), since a span touching a charana that *has* a dev name passes vacuously.

**Customer-copy boundary.** Screens and share output describe the tradition, actions, and outcomes only. They never expose on-device/offline/internet/account/storage implementation details, convention or schema versions, DRAFT/review status, or corpus eligibility. Release gates remain enforced by metadata and tests rather than customer-facing warnings. The `कैसे निकला?` line may name the Lahiri method and explain Moon nakshatra + pada → starting sound.

**Design system.** Existing warm tokens only; no emoji or new colours. All controls are at least 44 pt and field buttons remain 48 pt. The nakshatra and rashi grids use the same 72 pt launcher tiles, gradient, border, elevation, and three-column spacing as Home. Visible strings route through `contentByLang`/`meaningByLang`, gu/kn re-script from Devanagari, and English accessibility labels stay stable for Maestro. Files: `panchang/namkaran*.ts`, `data/namkaran/`, `screens/Namkaran*` (including `NamkaranRashiScreen`), `components/NamaksharCard`, `NameDetailSheet`, `NamkaranShareCard`.

---

## 62. Puja Vidhi (पूजा विधि — guided step-by-step puja flows, PRD-19)

**Purpose.** Own the *performed* moment of a festival or personal remembrance day: samagri gathered beforehand, every step guided in hand, and applicable katha/aarti/prayer texts opened from readers the app already ships. The catalog ships seven Vidhis: the six festive household procedures plus **पितृ तिल-तर्पण स्मरण** (10 steps), a narrow, mantra-free household remembrance guide — 106 steps total. It explicitly is not complete Shraddha and carries no pinda/bhojana/homa sequence, fixed formula, direction or sacred-thread rule. Beyond the katha/aarti hand-offs, Phase 2B added liturgy hand-off steps into shipped verified sections; the personal guide adds optional Gita chapter 15/2 hand-offs without retyping either chapter.

**Entries — no new Home category** (the launcher grid stays closed): the day panel's `॥ पूजा विधि` ObservanceCard pill (§33.5, driven by `vidhiId` on the observance rule — the identical hook mechanism as `kathaId`), the **पूजा विधि** tile on the Vrat & Parv catalog's Browse-by-type grid (§33) — the always-available door, since the pill is date-dependent — and, since Phase 2B: **search rows** (one section-group row per vidhi, §36), the **Observance Detail "पूजा विधि · How to observe" card** (§33), and a **Home DISCOVER spotlight** (§32).

**Back always retraces the journey — the flow is registered on all three hosting stacks.** The routes are declared once in `VidhiStackParamList`, intersected into Home, Panchang and More, and registered by all three navigators. Home discovery/search/routine, Panchang observance/catalog, and More's Pitru Smaran doors therefore push in place. Conduct hand-offs use `navigateToHomeStackTarget`, which pushes locally when the enclosing stack owns the reader and otherwise falls back to `HomeTab`. `GitaReader` is also mounted on More so the personal-tithi guide's only two reader hand-offs return directly to the conduct step.

**Data.** `mobile/src/data/vidhi/` — `types.ts` adds optional `anchor:'personal-tithi'` and a `gita` ref alongside katha/section refs. Festival entries retain `festivalIds` and deity tags; the personal entry deliberately has neither. **Convention/source fields and `sourceUrl` are review-only and never render** — pinned across every page of all seven entries. Checklist + resume state remain under `@vedansh/vidhi-checklist`: samagri is keyed by vidhi + occurrence date and conduct progress by vidhi + civil day. Personal routes carry only `{vidhiId,dateMs}`; no remembered name, relation or entry id enters Vidhi state.

### 62.1 Vidhi Catalog (`VidhiCatalogScreen`)

`ReaderHeader variant="index"` ("पूजा विधियाँ"), then one card per published vidhi following the **§8 LibraryCard active-variant spec rebuilt from the same tokens** (`LibraryCard` itself is coupled to `LibraryEntry` + the routine sheet): `cardActiveFrom→cardActiveTo` gradient, `cardActiveBorder`, `radii.lg`, `elevation.raised`, 52pt first-letter thumb (`cardThumbActive*` gradient, `radii.md`, `typography.thumb`), `orderTitlesByLanguage` title pair (dev 17/lat 19 primary), and a localized `cardMeta` sub-line (`16 चरण · लगभग 60 मिनट · कथा सहित` / `16 steps · About 60 min · with katha`), saffron 26pt ›. No source-verification or tradition copy is published on the catalog surface.

### 62.2 Vidhi Detail (`VidhiDetailScreen` — `{ vidhiId, dateMs? }`)

`ReaderHeader variant="index"` with the vidhi title; under it a quiet duration-only line (`लगभग 60 मिनट` / `About 60 min`, `ink-muted` 12, italic for Latin). For **recurring** vidhis only (a `festivalIds` rule with `recurrence: 'monthly'` — today that is Satyanarayan on every purnima) the header's right slot carries the shared `AddToRoutineButton` (＋, `sourceId` = the vidhi id) feeding the §31 routine sheet; annual festival pujas do not offer it. Tradition and source attribution remain internal review metadata and are not published. Then a **two-segment control** `तैयारी · सामग्री / पूजा · N चरण` (13pt, the §33.1 segmented-pill pattern: `parchmentSoft` track, `divider` border, `radii.pill`, selected half `saffronTint` + `saffronDeep`).

- **तैयारी** — the samagri checklist reuses §31 Today's Practice's summary-accordion + ledger language: an always-visible progress summary (`n / m सामग्री तैयार`, remaining count, gold→saffron track, rotating caret) expands/collapses the rows below. Rows have `divider` hairlines and the **§31 routine check circle** (28pt, 2px `saffron` ring, fills `saffron` with an `onPrimary` ✓; `accessibilityRole="checkbox"`), bilingual item/meta copy (checked → `ink-muted`, **never struck through**), qty in the meta line, and a `divider`-outline `वैकल्पिक` chip on optional rows. State persists per the festival date passed in `dateMs` (falls back to today) — a fresh occurrence starts a fresh list. One action: **सूची साझा करें** (ghost `goldTint`-border button) → the OS share sheet with the plain-text list (RN `Share.share`, same mechanism as MoreScreen's share row) — the family shopping message, no image pipeline, nothing personal.
- **पूजा** — the phase-grouped step list (आरम्भ · मुख्य पूजा · समापन labels in `saffronDeep` 12), each step a `parchmentSoft` `radii.md` row: 30pt numbered circle, title, and a caption naming what the step carries (`॥ मन्त्र सहित` / `कथा पाठ` / `आरती` for aarti-section refs / `पाठ` for other section refs). Tapping a step or the filled-`saffron` **पूजा प्रारम्भ करें** button enters conduct mode (at that step / step 0). When today's saved conduct step exists a `goldTint` **जहाँ थे वहीं से · n/N** resume row leads the list (rehydrated on focus, so returning from conduct refreshes it).

### 62.3 Conduct mode (`VidhiConductScreen` — `{ vidhiId, dateMs?, initialStep? }`)

Full-screen, one step per page, a horizontal paged `FlatList` exactly like the readers (light haptic per page turn, §11). `ReaderHeader variant="reader"` carries the vidhi title and a step-scoped `n / m` counter (`pageCounter` italic). The only page-turn control is the familiar left/right swipe; there are no previous/next buttons and no swipe-instruction copy. One 6pt **progress dot per step** sits at the bottom (active dot `saffronDeep`, stretched to 18pt — the Hanuman Chalisa/current-reader pager treatment).

- **Step page** (each page a vertical ScrollView): a Daily Bhakti-style reading card (`parchmentSoft`, `divider` border, `radii.lg`, `elevation.raised`, 20 padding) containing a saffron-tint phase pill + `चरण n`, step title (21, script title face), and the authored instruction at the shared **`meaning` reading token** via `meaningToken(lang)` (reading-size setting respected for free).
- **Mantra section** (steps carrying a transcribed mantra): the shared reader `Ornament`, then a quiet `मन्त्र · Mantra` label, Devanagari at `footerMantra` size with 2× leading, and IAST beneath (`latinItalic` 12.5/21, `ink-muted`) inside the same reading card — no nested bespoke mantra card.
- **Read-aloud** renders **once at screen level** (a centred `ReadAloudButton` slot between the header and the dots — RULEBOOK §3: the shared `useReaderReadAloud` hook, never a raw `Speech.speak`, and never a per-page copy inside the pager). Conduct pages expose reader-shaped fields (`lines`/`linesEn` for mantra steps, `bodyHi`/`bodyEn` for instruction-only steps), so the shipped TTS adapter speaks every page — mantra plus instruction — with zero vidhi-specific speech code.
- **Hand-off card** (steps that ARE a shipped text): 1.4px `saffron` border (`gold` for personal remembrance), `radii.lg` — the target's title + a "returns here after" caption that is category-aware (कथा पढ़कर… for kathas, आरती पूर्ण कर… for aarti sections, पाठ पूर्ण कर… for stotram/sanskar/Gita sections); katha refs deep-link to `VratKathaReader {kathaId}`, section refs route through `buildEntryStartTarget`, and Gita refs route by chapter — the vidhi never re-types a shipped text (RULEBOOK §11.11). Every ref goes through `navigateToHomeStackTarget`; Home pushes its readers locally, and More locally owns `GitaReader`, so Back returns to the step in both live guide paths.
- **Completion** — quiet by design: a **static 84pt ॐ seal** (`gold` 2px ring on `goldTint`), `पूजा सम्पन्न` (20), and a `title · N चरण पूर्ण` caption. It does not repeat the katha/aarti actions already completed in the guided steps. The step dots disappear on this terminal page. **No celebration animation** — the routine pushpa-varsha mechanism is deliberately not wired; a puja ends in shanti, not confetti. Reaching completion clears the saved conduct step. Exit at any page saves the step index for today's civil day (the detail screen's resume row).
- **Keep-awake** (Phase 2B): the screen holds `useKeepAwake()` (`expo-keep-awake`) for the whole conduct session — wet hands cannot re-wake a locked phone mid-puja — and announces it to screen readers once on entry (`AccessibilityInfo.announceForAccessibility`, §12).

**Localisation.** Titles/instructions flow through `contentByLang`/`meaningByLang` (gu/kn derive); **mantras stay Devanagari + IAST in every language** (§3.1 — Sanskrit is not re-scripted or hidden behind the toggle here; the IAST line is the romanization). No emoji anywhere — ॥/ॐ glyphs (§5).

**Files.** `mobile/src/data/vidhi/{types,index,checklistStore,satyanarayan-puja,diwali-lakshmi-ganesh-puja,ganesh-chaturthi-sthapana,navratri-ghatasthapana,karwa-chauth-puja,maha-shivaratri-puja,shraddha-tarpan-vidhi}.ts` · `mobile/src/screens/Vidhi{Catalog,Detail,Conduct}Screen.tsx` · festival pill + tile in `mobile/src/screens/PanchangScreen.tsx` · personal doors in `mobile/src/screens/{PitruSmaranDetailScreen,PitruPakshaOverviewScreen}.tsx` and `mobile/src/components/PitruPakshaDayChip.tsx` · routes in `mobile/src/navigation/{types.ts,PanchangStackNavigator.tsx,HomeStackNavigator.tsx,MoreStackNavigator.tsx}` (one shared `VidhiStackParamList`, registered on all three stacks) · `vidhiId` hooks in `mobile/src/panchang/{types,festivals}.ts`. Phase 2B surfaces: search rows in `data/searchIndex.ts` + routing in `screens/SearchScreen.tsx` · the How-to-observe card in `screens/ObservanceDetailScreen.tsx` · the DISCOVER spotlight in `screens/HomeScreen.tsx` · keep-awake in `VidhiConductScreen.tsx` (`expo-keep-awake`) · the `vidhi` routine-item kind in `data/routine/{types,units}.ts`, `components/AddToRoutineSheet.tsx`, `navigation/entryRoutes.ts` and the detail-header `AddToRoutineButton`. Tests: `src/data/__tests__/vidhiContent.test.ts` (tsx — seven-entry registry, refs + Phase 2B liturgy hand-offs, source contract + Devanagari well-formedness), `src/data/__tests__/searchIndex.test.ts` (vidhi rows), `src/screens/__tests__/{VidhiScreens,PitruSmaranScreens}.test.tsx` and `src/components/__tests__/PitruPakshaDayChip.test.tsx` (Jest — all screens, personal occurrence doors, Gita hand-off and registry-wide source privacy), `src/navigation/__tests__/vidhiBackNavigation.test.ts` (Jest — the three registrations, the single shared param list, and that every door pushes in place), `src/navigation/entryRoutes.test.ts` (tsx — the routine-item route and both `navigateToHomeStackTarget` branches), `.maestro/{vidhi-smoke,pitru-smaran}.yaml` (e2e).

---

## 63. Pitru Smaran (पितृ स्मरण, PRD-17)

**Purpose.** Tithi-based family remembrance: record each departed family member once — by tithi (माघ कृष्ण अष्टमी) or by Gregorian death date — and the app answers **"इस वर्ष कब?"**, **"पितृ पक्ष में किस दिन?"**, and **"उस दिन क्या करें?"** (linked गीता पाठ) permanently. A quiet, private surface under the **More hub**; entries live only in AsyncStorage (`@vedansh/pitru-smaran`, versioned `{version:1, entries:[]}`) and every date is solved on-device by the festival engine's conventions.

**Tone (locked, PRD-17 §5).** No streaks, no celebration animation, no share surfaces, no NEW-badge styling *inside* the feature (the More row carries the standard hub NEW state for one release, like Widgets). Muted registers only — `goldTint` / `gold` / `parchmentSoft` / ink tones; `saffron` appears solely as interactive affordance (buttons, chevrons, the standard detail "अगला" pill) and the family marker dot, never as celebratory accent. The word everywhere is **स्मरण**.

**Engine (`mobile/src/panchang/pitruSmaran.ts` — pure, RN-free, `tsx --test`).** `deriveTithiRuleFromDate` (sunrise anga, purnimant), `solveNextOccurrence` (shares `matchesLunarTithiRuleOnDate` with the festival engine — kshaya fallback, vriddhi dedupe, adhik-maas nija guard, exported from `festivalEngine.ts` for exactly this reuse), `pitruPakshaWindow` (भाद्रपद पूर्णिमा · Pratipada Shraddha · सर्वपितृ अमावस्या — the closing amavasya is matched month-free so an adhik-Ashwin year can't orphan it), `pakshaShraddhaDay` (person's tithi mapped into the Mahalaya krishna paksha; पूर्णिमा tithi → Purnima Shraddha on the पूर्णिमा itself; unknown tithi → सर्वपितृ अमावस्या), `entryMatchesDate` (the day-chip predicate). Fixtures pinned against published DrikPanchang-convention dates in `src/panchang/__tests__/pitruSmaran.test.ts` (normal year, kshaya tithi, adhik-maas year, the 2025/2026 paksha windows). Display formatting is centralised in `pitruSmaranDisplay.ts` (the `gunaMilanDisplay` pattern).

**Structure — four routes in `MoreStackParamList` (`PitruSmaranList` / `PitruSmaranEdit` / `PitruSmaranDetail` / `PitruPakshaOverview`), all over the Home gradient with `ReaderHeader variant="index"` and `spacing.xxl` gutters. All engine solves run off the render path (`setTimeout(0)` effects), spinner in `saffron` while solving:**

1. **More hub row** (§37, साधना group after जप अलार्म): ॥ glyph on a `gold` icon tile, label पितृ स्मरण, state = `NEW` when empty (hub mechanism, one release), else `N · <soonest short date>`. → PitruSmaranList.
2. **List** (`PitruSmaranListScreen`) — the §33 ObservanceList row pattern: 34 px circular ॥ lead (1 px `goldTint` border on `parchmentHighlight`, `inkMuted` glyph), relation (+ optional `· name`) at 15, tithi-in-words caption at 13 `inkMuted` (unknown → "तिथि अज्ञात — सर्वपितृ अमावस्या"), right-aligned next date + relative `Nd` label (13, `inkSoft`, Latin semibold for en), sorted soonest-first. A seasonal **पितृ पक्ष banner** (1 px `gold` border, `parchmentSoft`, `radii.lg`) appears only within 30 days before / during the fortnight → PitruPakshaOverview. Below: the outline **+ स्मरण जोड़ें** button (1.5 px `gold`, `radii.md`, 48 min-height, `saffronDeep` text) and an italic privacy footer ("यह सूची केवल इसी फ़ोन पर रहती है…"). Empty state: dimmed ॥, "अपने पितरों की तिथियाँ जोड़ें" + one explanatory line — two reverent lines, no illustration.
3. **Add/Edit** (`PitruSmaranEditScreen`) — relation chips (पिताजी / माताजी / दादाजी / दादीजी / नानाजी / नानीजी / अन्य from `SMARAN_RELATIONS`), optional name (**`TextField variant="form"`**, placeholder "केवल आपके लिए — कहीं और नहीं दिखेगा"), then a true two-segment mode control (`तिथि ज्ञात है` / `केवल तारीख़ ज्ञात है`): 1 px `gold` outer boundary, 3 px internal gap, 44 px segments, and a separately bounded `saffronTint` + `gold` active segment with `saffronDeep` title text. Tithi mode: month/paksha/tithi picker chips built from the engine's own `names.ts` enumerations (selected chip `saffronTint` + `saffron` border), plus the **तिथि अज्ञात — सर्वपितृ अमावस्या** toggle row (`goldTint` when on). Date mode: DD/MM/YYYY `TextField variant="form"` → the computed tithi renders IN WORDS in a **confirmation card** (1 px `gold` border, `parchmentHighlight`, `radii.md` — "पंचांग से निकली तिथि — पुष्टि करें") that gates Save; a silent conversion is never persisted, and **तिथि स्वयं चुनें** (ghost button) flips to the manual pickers pre-filled. Save = filled `saffron`, `radii.md`, 48, disabled at 0.4 opacity.
4. **Detail** (`PitruSmaranDetailScreen`) — the §33 ObservanceDetail hero: ॥ ॐ ॥ ornament (`gold`, letter-spacing 6), name 24 pt centred, "श्राद्ध तिथि: <words>" caption, and the `saffronTint` **"अगला · <date> · in N days"** pill. Rows (`parchmentSoft`, `divider`, `radii.md`): अगले वर्ष, the person's Pitru Paksha mapping, the dedicated reminder switch, then a muted-gold **पितृ तिल-तर्पण स्मरण** door above the two Gita rows. The door passes whichever upcoming solved annual/Paksha date is sooner as `dateMs`; it passes no person id, name or relation. The guide is a limited household remembrance, not complete Shraddha. The two existing **गीता पाठ** rows still deep-link अध्याय 15 and 2. **The four solved dates arrive in two stages, in reading order:** the hero pill is published on its own solve, and अगले वर्ष + पितृ पक्ष follow; the guide door appears only once an occurrence exists, with no loading placeholder.
5. **Pitru Paksha overview** (`PitruPakshaOverviewScreen`) — title पितृ पक्ष `<year>`, date-range hero and the fortnight as §33.6 Upcoming rows. Beneath the calendar, one muted-gold **पितृ तिल-तर्पण स्मरण** door opens the guide for the first family-matched day, falling back to the fortnight start when the ledger is empty. Individual dates remain calendar rows rather than each growing a launcher.
6. **Panchang day chips** (`PitruSmaranDayChip` / `PitruPakshaDayChip` + `usePitruSmaranForDate`, §33 day panel) — personal annual/Paksha dates retain the muted **"॥ स्मरण — <relation>"** pill → person detail. During the public fortnight, the saffron-tint season chip → overview; on **सर्वपितृ अमावस्या only**, a second muted-gold **`॥ तिल-तर्पण विधि`** chip opens the registered guide directly with that civil date. The public door contains no private ledger data.
7. **Vrat & Parv catalog pinned row** — directly under My Vrat, the identical pinned-ledger treatment (`goldTint`, 1.5 px `gold`, `radii.lg`): ॥ + पितृ स्मरण, live entry count, and the soonest next date. Tap → the same More-stack remembrance list. The empty invitation is standing and cannot be dismissed, so the planning surface never loses its only zero-entry door.
8. **Home Today strip** — matching private Smaran chips lead the row on annual or mapped-family dates so a person's action stays visible and stationary before horizontal overflow; the public Pitru-Paksha daily label and ordinary observance/muhurat chips follow. Touching the row stops its idle auto-drift before dispatching a chip action. The Today card shell is a non-pressable container while its Panchang header and each nested chip are separate accessible buttons; otherwise iOS collapses or intercepts the children and the promised person-detail tap is unreachable to VoiceOver.
9. **Home DISCOVER** — a standing launch-release `FeatureCard` exists even with zero saved people: `॥` gold glyph, a one-line annual-answer explanation, and **स्मरण जोड़ें / Set up** → `MoreTab/PitruSmaranList`. This is awareness, not the personal ledger treatment; the actual list and Panchang row remain quiet/muted.

**Notifications — two defaults, two namespaces.** `FestiveReminderScheduler` arms the public, default-on Pitru-Paksha tier behind the existing festive preference: 18:00 on the eve of Bhadrapada Purnima and the eve of Sarvapitri Amavasya, fixed copy that never names a person, tap → `PitruPakshaOverview`. `PitruSmaranReminderScheduler` arms only entries whose per-person switch is ON: day-before + day-of, private copy naming the saved relation, tap → `PitruSmaranDetail`. Both use pure planners, separate identifier prefixes, bounded pending slices, foreground/language/data re-arm, and cancellation that never touches another notification family. Personal reminders own an Android channel; the public season intentionally shares `festive-reminders` because the same preference controls both.

**Performance — the answers are cached, not re-derived.** Every date on these surfaces is a tithi scan over hundreds of civil days (`scanForRule` → `computeTithiAndMonth`). Measured cold on a desktop JIT, the detail screen's four solves cost ~423 ms — next occurrence 117, the year after it 259, the fortnight window 43, the mapping 3 — which on Hermes is the multi-second stall reported in August 2026 on a screen whose content the user had already saved. The engine memos are per-process, so every cold launch paid it again, and the two doors that reach the detail WITHOUT the list (the Panchang/Home `॥ स्मरण` chip and the personal notification deep link) paid all of it with nothing warm. `panchang/pitruSmaranSolves.ts` now persists the answers — occurrences per tithi rule, windows per year — under `@vedansh:pitru-solves:`, versioned with `PANCHANG_DAY_CACHE_VERSION` and swept by the build-change reset (§60). Records are keyed by **tithi only** (`m11-krishna-8`), never by entry id, relation or name, so two people on one tithi share one record and the cache discloses nothing the ledger does not. The list solves through the same cache and then **prewarms** the detail's dates on its own idle time, one occurrence deeper than the screen shows, so the launch right after someone's shraddha is still a hit.

**Privacy & non-goals.** Nothing syncs, nothing shares, no export in v1 (PRD-06 is the future transfer path). Public season notification copy is identical on every device; personal notification copy exists only after the user deliberately saves that person's entry and the OS notification grant succeeds. No Gregorian-anniversary mode, no gotra/genealogy fields.

**Files.** `panchang/pitruSmaran.ts` · `panchang/pitruSmaranDisplay.ts` · `panchang/pitruSmaranSolves.ts` · `panchang/usePitruSmaranSolves.ts` · `panchang/usePitruSmaranForDate.ts` · `contexts/PitruSmaranContext.tsx` · `screens/PitruSmaranListScreen.tsx` / `PitruSmaranEditScreen.tsx` / `PitruSmaranDetailScreen.tsx` / `PitruPakshaOverviewScreen.tsx` · `components/PitruSmaranDayChip.tsx` / `PitruPakshaDayChip.tsx` / `PitruSmaranReminderScheduler.tsx` · `notifications/pitruSmaranReminderPure.ts` / `pitruSmaranScheduler.ts` / `pitruPakshaReminderPure.ts` / `pitruPakshaScheduler.ts` · catalog row in `PanchangScreen.tsx` · Home integration in `TodayStrip.tsx` · routes in `navigation/types.ts` + `MoreStackNavigator.tsx`. Tests: `panchang/__tests__/pitruSmaran.test.ts` (tsx), `panchang/__tests__/jest/pitruSmaranSolves.jest.test.ts`, `notifications/__tests__/pitruReminderPure.test.ts` / `pitruSchedulers.jest.test.ts`, component/context/screen suites, and `.maestro/pitru-smaran.yaml`. PRD: `docs/roadmap/prds/17-pitru-smaran.md`; prototype: `docs/pitru-smaran-prototype.html`.

---

## 64. App Launch & First Frame

**Purpose.** One place for the launch contract every other section assumes: **Home's first visible frame is already its final frame.** Nothing may reflow, insert, or shift after the native splash lifts — a launch-time layout jump reads as jank on every screen the app will ever show, and an immediate first press must land on the tile the user aimed at.

**The reveal pipeline (`mobile/App.tsx`).**
1. `SplashScreen.preventAutoHideAsync()` at module scope; the derived-cache reset and `prefetchTodayPanchang()` start beside it (§60) so storage is already in flight before React renders anything.
2. The five font families gate the provider tree (`fontsReady`) — an unloaded family silently falls back to the system font (§3), so no text renders before the real faces exist.
3. **`AppReadyGate`** holds the splash until the two **layout-critical** preferences have hydrated — font scale and reading language — because both change Home geometry. The splash hides via the gate's `useEffect` + a belt-and-braces `onLayout` on the mounted tree.
4. **Safe-area insets are seeded, not awaited**: the root `SafeAreaProvider` receives `initialMetrics={initialWindowMetrics}`. Without it the provider renders nothing until the first native inset event crosses the launch-busy JS thread, and the tree then mounts on whatever that event carried — on Android cold starts under `edgeToEdgeEnabled` that can be a pre-attach zero, so Home painted flush under the status bar, sat unresponsive behind the mount burst, and lurched down by the status-bar height when the corrected insets applied (the August 2026 "launch jerk" report). With the seed, the first committed frame carries its final insets and any later inset event is a no-op.

**Geometry that must stay reserved.** Surfaces that hydrate after the reveal must occupy their final space from the first frame — never insert or grow later: the Today strip reserves its 24 pt chip row before the deferred Panchang solve lands (§48); `RoutineBanner`'s three states share one height (`minHeight 57` = the progress variant's natural height) so the nudge → progress flip on routine hydration cannot move the CATEGORIES grid (§31); `FestiveToran` is a fixed `TORAN_HEIGHT` box resolved synchronously from the bundled catalog (§55). Anything new above the Home grid inherits this rule.

**CPU stays off the reveal.** Astronomy, the 7-day prewarm, widget payload planning, and every reminder scheduler run behind `InteractionManager` after the splash lifts (§59/§60) — the launch path spends I/O only. Moving work earlier must never move CPU onto it.

**Files.** `mobile/App.tsx` (`AppReadyGate`, `SafeAreaProvider` seeding) · `mobile/src/panchang/panchangLaunchPrefetch.ts` · reserved-geometry owners per their sections.

## 65. उपवास विधि — Structured Upvas/Fasting Content (PRD-09 Phase 4)

**Purpose.** The Observance Detail's last section answers the fasting devotee's actual question — *what kind of fast, from when to when, and when do I break it* — from verified bundled data plus one honest engine-derived time line. It completes PRD-09: the location half of the original Phase 4 shipped separately (§ location picker), and this is the content half.

**Data.** `mobile/src/panchang/upvasContent/` mirrors `kathaContent/`: one-default-export entry modules under `entries/`, an `index.ts` array, and the accessor `mobile/src/panchang/upvasContent.ts` whose module-scope IIFE asserts invariants (unique ids, non-empty bilingual pairs, ≥2 `referenceUrls`, `boundTithi` iff tithi-bound). `UpvasInfoEntry` (`panchang/types.ts`): `fastType` (`nirjala | phalahar | one-meal | night-vigil`), one-line `fastTypeNote*`, `window {kind, text*}`, optional `parana {kind, boundTithi?, text*}`, `strictness*`, optional `whoObserves*`, `status ('draft' | 'verified')`, review-only `source`. **`getUpvasInfo` exposes `verified` entries only** — a draft is indistinguishable from no entry at every call site, so the section is simply absent until the two-source review clears (RULEBOOK §20). Observance rules attach via the optional **`upvasId`** hook (`festivals.ts`), the identical mechanism as `kathaId`/`vidhiId`; many rules share one entry (all Ekadashis except निर्जला → `ekadashi-upvas`). The v1 starter set is 8 entries covering ~35 rules (Ekadashi family, निर्जला, Purnima/Satyanarayan, Pradosh, Sankashti, Karwa Chauth, Shivaratri, Janmashtami); **all eight were source-verified on 2026-08-19** and are exposed through the verified-only accessor.

**Structure (states 1/3 of §33's four-state home).** Inside the `उपवास विधि · How to observe` section (same `blockHeading` treatment as महत्व/कथा), one **non-interactive information panel** (`parchment-soft`, `divider` border, `radii.lg`, `elevation.card` — the Pitru detail's quiet fact-row language; no chevron, no navigation):
- **Fast-type chip row** — a filled `saffron` pill (`radii.pill`, text through `pillTextStyle`, 1.15 font-scale cap — §3.0 Devanagari micro-type discipline) with the chip label निर्जला / फलाहार / एक समय भोजन / रात्रि जागरण, then the one-line `fastTypeNote` beside it; `divider` rule beneath.
- **उपवास काल row** — 84 pt micro label (`pillTextStyle`, `saffron-deep`, 1.25 cap) + `window.text` (meaning body face, `ink-soft`, 13/20).
- **पारण row** — same label treatment + `parana.text` (always rendered — text is canonical). Beneath it, only when derivable, the **computed line** (`gold-tint` box, `radii.md`): `पारण · date · start – end` for `next-day-sunrise-tithi-bound` (parana-day sunrise → bound-tithi end via the pure `upvasParana.ts`; `formatRangeCompact`, or `formatEndInstant` when the end crosses midnight) or `चंद्रोदय · date · time` for `same-day-after-moonrise`; a 10 pt muted subline names the Panchang location it was computed for. Derivation nulls (tithi ended pre-sunrise, kshaya, null moonrise, `text-only` kind) render nothing — **never an invented time**. Solves go through the shared `panchangDayStore` (hydrate immediately, astronomy behind `InteractionManager` — `useUpvasParana.ts`), and nothing about the parana is persisted: it re-derives per render, so a city change can never serve a stale time.
- **Footnotes** — `strictness` then optional `whoObserves`, muted meaning face, 12/18.

All copy flows through `contentByLang`/`meaningByLang` (gu/kn derive from the Devanagari; English fields stay English). Fact text scales freely; chip and labels cap at 1.15/1.25 like other dense chrome.

**Files.** `mobile/src/panchang/upvasContent/{_helpers,index,entries/*}.ts` · `mobile/src/panchang/upvasContent.ts` · `mobile/src/panchang/upvasParana.ts` (pure) · `mobile/src/panchang/useUpvasParana.ts` (store bridge) · `upvasId` hooks in `mobile/src/panchang/{types,festivals}.ts` · the section in `mobile/src/screens/ObservanceDetailScreen.tsx`. Tests: `src/panchang/__tests__/upvasContent.test.ts` + `upvasParana.test.ts` (tsx), `src/screens/__tests__/ObservanceDetailScreen.test.tsx` (Jest — the §33 four-state rendering matrix, incl. no-placeholder and draft-invisibility pins). The vrat-catalog Maestro assertion on a verified detail page is deferred until the registry exposes its first verified entry (PRD-09/P4 §10).

### 65.1 भोग · नैवेद्य · व्रत भोजन (PRD-23)

**Purpose and placement.** Food/offerings are an independent answer after the existing About, Katha and How-to-observe material. A verified `bhogId` adds `भोग · नैवेद्य · भोजन / Offerings & food` as the final Observance Detail block; it does not create a fifth state in §33's upvas/vidhi composition. Vidhi preparation shows the same guidance above its samagri summary.

**Panel.** `BhogGuidancePanel` is a quiet, read-only `parchment-soft` card with `divider`, `radii.lg`, and `elevation.card`. Its sections appear only when populated: Offer; During the fast; Avoid during the fast; Do not offer; Parana meal; then a muted tradition/variant note. Micro labels use `pillTextStyle` at 11 pt with a 1.25 cap; meaning text is 13/20 and can scale normally. No chevron, source, status, recipe image, commerce action, or wellness language.

**Preparation shopping.** Additive kitchen items sit in their own `भोग और रसोई की खरीदारी / Bhog & kitchen shopping` ledger beneath the ritual samagri accordion. Rows reuse the 44 pt-plus samagri checkbox language and persist in the same vidhi/date record with namespaced keys. Kitchen checks do not change the samagri progress total. Share output appends a separately headed kitchen section.

**Content discipline.** Offerings, permitted fast food, abstained food, prohibited offerings, and abhisheka materials never collapse into one list. Common regional forms name their region; variant notes are plain customer guidance, while sources and verification metadata stay private. See RULEBOOK §21 and `docs/roadmap/prds/23-bhog-naivedya-vrat-food.md`.

**Files.** `mobile/src/panchang/bhogContent.ts` · `panchang/types.ts` / `festivals.ts` (`bhogId`) · `components/BhogGuidancePanel.tsx` · `screens/ObservanceDetailScreen.tsx` · `screens/VidhiDetailScreen.tsx`; tests in `panchang/__tests__/bhogContent.test.ts` and the two screen suites; device path in `.maestro/vidhi-smoke.yaml`.

## 66. वास्तु दिशा — Disha Chakra, Room Guidance & Ghar-ka-Mandir (PRD-24)

**Purpose.** The household direction questions — mandir facing, kitchen corner, sleeping head-direction, tulsi, main door, the home shrine's upkeep — answered as *classical convention with its reason*, anchored by a live compass that is honest about its own accuracy. Never a verdict on a home: no dosha language, no remedies, no fear copy (PRD-24 §2).

**दिशा चक्र (`components/DishaChakra.tsx`).** A 264 pt `react-native-svg` rose: `parchment-soft` ring with `divider` stroke, 45° ticks, the 8 dik labels (`DISHA_LABELS` — cardinal 15 pt `ink`, intercardinal 11.5 pt `ink-soft`, the faced dik `saffron-deep`), rotating under a **fixed** `saffron-deep` top needle so the label under the needle is the direction faced. Labels counter-rotate (each glyph stays upright). The open centre is a `background` circle labelled ब्रह्मस्थान (11 pt muted) with the faced dik + rounded degrees beneath in `saffron-deep` — the centre is the Brahmasthan itself, never a needle pivot. Pure presentation: heading and dik arrive as props.

**Honest accuracy (screen contract).** `useCompassHeading` (`vastu/useCompassHeading.ts`) wraps `expo-sensors` Magnetometer: wrap-aware smoothing and heading math live pure in `vastu/compass.ts`. Status vocabulary — `starting`, `ok`, `unreliable` (field magnitude has left Earth's 25–65 µT band for 5+ samples → the figure-8 calibration hint in `saffron-deep`, dial keeps moving), `unavailable` (no magnetometer → the screen opens in manual mode). Heading is corrected to TRUE north by the selected panchang city's bundled WMM declination (`data/vastu/declination.ts`, PRD-24 §3); the correction is silent. The 8-dik chip row (the §60 यात्रा chip idiom, `vastu-disha-*` testIDs) is always rendered — a chip tap enters manual mode (sensor subscription removed), tapping the active chip returns live; with no sensor there is no live to return to. **The sensor never gates the content.**

**Guidance surfaces (`screens/VastuDishaScreen.tsx`).** Below the chakra + status line: `इस दिशा में / In this direction` — the room entries whose `directions` include the faced dik, emphasised with `card-active-border`; then `कक्ष-दर-कक्ष / Room by room` — every verified `VastuRoomEntry` as a quiet `parchment-soft` card (title + dik line, convention 13/20 `ink-soft`, `कारण ·` reason 12/18 muted, `जहाँ संभव न हो ·` accommodation when stated); then `घर का मंदिर / The home mandir` — `MandirGuidanceEntry` cards with bulleted rows, a warning-toned `टालें / Avoid` block (the §65.1 split), and a muted family-tradition note. A closing muted line restates the stance: convention, not verdict. All copy flows `contentByLang`/`meaningByLang`/`pick` (gu/kn derive or are hand-authored per helper contract).

**Doors.** More hub → साधना group row `वास्तु दिशा / Vastu Disha` (`more-vastu-disha`, NEW state for one release — the §59 widget-row pattern). A गृह प्रवेश muhurat result renders the `muhurat-vastu-door` ListCard under the location line (PRD-24 §6); `VastuDisha` is registered on both the More and Panchang stacks (the PRD-19 multi-stack door pattern) so each door pushes in place and Back retraces the journey.

**Release.** `expo-sensors` is native — store release only, never OTA at the old runtime; ships with the 1.5.0 `whatsNew` entry and `APP_TOUR_VERSION` bump.

**Files.** `mobile/src/vastu/{compass,useCompassHeading}.ts` · `mobile/src/data/vastu/{types,roomGuidance,mandirGuidance,declination}.ts` · `components/DishaChakra.tsx` · `screens/VastuDishaScreen.tsx` · doors in `screens/MoreScreen.tsx` + `screens/MuhuratResultsScreen.tsx` · stack registrations in `navigation/{MoreStackNavigator,PanchangStackNavigator}.tsx` + `navigation/types.ts` · regen method `mobile/scripts/generate-declination.md`. Tests: `src/vastu/__tests__/compass.test.ts`, `src/data/vastu/__tests__/vastuContent.test.ts`, `src/screens/__tests__/VastuDishaScreen.test.tsx`; device path `.maestro/vastu-disha-smoke.yaml`. See RULEBOOK §22 and `docs/roadmap/prds/24-vastu-disha.md`.

---

## 67. Gochar (गोचर — transits vs the saved chart) + Weekly Outlook — PRD-20

**Purpose.** The daily "personal astrologer" surface: today's nine grahas read against the saved chart, the Sade Sati state, a seven-day outlook, and upcoming sign changes — all offline, deterministic, and guidance-framed (RULEBOOK §14.3/§14.5). Requires a saved chart; guests get an explanation plus Create Kundali, and the error state keeps the re-enter recovery.

**Structure (top → bottom).** RashifalScreen-family chrome: 44 pt back button, `गोचर · Gochar` title with an IST date caption; then the framing note (`पारम्परिक गोचर दृष्टि—निश्चित भविष्यवाणी नहीं` — same info-mark row as Rashifal); a two-fact reference card (janma rashi · Lagna, traditional + plain-English pairs); the **transit table** (`cardActiveFrom`/`cardActiveBorder`, one row per graha in `GRAHA_ORDER`: gold support dot when the transit sits in a `TRANSIT_SUPPORT_HOUSES` house from the Moon, graha name with `℞` where retrograde, transit rashi, house-from-Moon, house-from-Lagna; 44 pt rows; a legend row closes the table). The whole table carries ONE accessibility label narrating every transit (the §51 chart text-equivalence rule). Then **active house-theme chips** (`<n> भाव · <HOUSE_THEME>` pills for each supportive house — feature E's transit half; no standalone lens screen); the **weekly strip** (seven 44 pt rows: weekday+date, tone dot — gold favourable / saffron reflective / divider steady — Moon rashi · chandra-bala house · tara name, and the tone word; a muted basis footnote states `आधार: चन्द्र बल व तारा बल — पारम्परिक दृष्टि, अंक या निर्णय नहीं`; every row's accessibility label is its full basis line); the **Sade Sati card** (prominent `cardActiveFrom` + elevation only while a phase runs, quiet parchment otherwise; headline + guidance body from the engine's authored copy, the bisected `शनि का अगला राशि-प्रवेश` boundary date once the deferred solve lands, and a `शनि अष्टकम् पढ़ें` practice link — allow-listed id via `buildEntryStartTarget()` — only while active); finally **आगामी राशि-प्रवेश** rows (Jupiter/Saturn/Rahu ≤ 400 days, Sun/Mars/Mercury/Venus ≤ 45; `गणना हो रही है…` placeholder until the deferred solve lands).

**Solve discipline.** Snapshot + phase + weekly render synchronously (cheap fixed-anchor longitudes); the ingress day-walks and the Sade Sati boundary defer behind `InteractionManager` + `setTimeout(0)` — the `useMuhurat` pattern. Nothing is persisted and no panchang cache is touched: every quantity derives from the 06:00 IST anchor and is location-free.

**Sharing.** None, by decision (PRD-20 §4): the surface inherently exposes janma rashi and Sade Sati state. Any future card must use the Kundali-style birth-details warning, never the Rashifal share path.

**Entries.** `गोचर` tool card on the saved Jyotish landing (after the contractual trio) and the Sade Sati teaser on the compact Kundali card (§51). No Home tile in v1.

**Shared primitive.** The tara/chandra-bala arithmetic and classes come from `panchang/taraChandraBala.ts` (§60's personalised muhurat strip owns it); PRD-20 only maps its classes onto the three display tones. The Gochar header follows §51a's naming rule — `आपकी कुंडली` with one person saved, `<name> की कुंडली` once the roster holds more than one.

**Files.** `mobile/src/panchang/gochar.ts`, `weeklyOutlook.ts` (pure, both delegating to `taraChandraBala.ts`); `mobile/src/screens/GocharScreen.tsx`; route in `navigation/types.ts` + `PanchangStackNavigator.tsx`; entries in `PanchangScreen.tsx`. Tests: `src/panchang/__tests__/gochar.engine.test.ts`, `weeklyOutlook.engine.test.ts` (tsx), `src/screens/__tests__/GocharExperience.test.tsx` (Jest), `.maestro/gochar-smoke.yaml`.

---

## 68. Compiled Kundali Report (पूर्ण कुंडली विवेचन) — PRD-20 Phase 6

**Purpose.** The one-shot AstroTalk-class deliverable: a long scrollable reading compiled from the saved chart. Everything is composed from typed phrase tables in a pure engine into a **versioned, fully serializable `KundaliReportModel`** (plain JSON, no `Date` instances — pinned by a serde round-trip test; deliberately the grounding object a future AI phase would consume, PRD-20 §5).

**Structure.** Disclaimer band (gold tint) → North Indian chart card → eleven section cards in fixed order: `summary` (birth facts: name/date/time/city/Lagna/Moon/nakshatra as label:value rows capped at 1.25 font multiplier) · `lagna` (rising sign quality + Lagna-lord placement) · `moon` (Moon-sign quality + janma nakshatra) · six life areas (career 10th · relationships 7th · wealth 2/11 · self-and-routine 1/6 · home-and-learning 4/5 · dharma 9th — each house's sign, classical lord and its placement, occupants; an empty house is stated plainly; every area closes with the own-judgement line) · `observations` (Sade Sati always; **Mangal Dosha display-gated off** behind `includeMangalDosha` pending product/content review — when enabled its copy is prevalence-normalizing and never uses the dosha label; **Kaal Sarp excluded by decision** and pinned absent by test) · `vimshottari` (nine `आयु X–Y वर्ष` Mahadasha lines reusing §51's per-lord themes, current period flagged) → closing disclaimer band. Section cards carry one full accessibility label each; a practice link renders only from the section's allow-listed `practiceSourceId` through `buildEntryStartTarget()`.

**Sharing.** One header Share action → the existing warned Kundali 4:5 share (chart summary card; `इस कार्ड में नाम, जन्म तिथि, समय और नगर शामिल हैं`). Never the Rashifal no-birth-details path. Full-document PDF export is explicitly deferred (`expo-print` would be a new dependency needing its own review). **Full-text handoff:** the SAME share sheet carries a secondary `पूर्ण पाठ साझा करें · Share full text` action (an optional `JyotishShareSheet` extension — `detailTitle/Subtitle` + `onShareDetail`; omitting the props keeps every other Jyotish share byte-identical). It shares the COMPLETE export as plain text via the OS share sheet — birth details, the nine-graha table (degrees/nakshatra/pada/house/℞), the full Vimshottari date table, every report section's English prose with facts, both disclaimers, and the machine-readable `KundaliReportModel` JSON — so the user can hand the reading to notes or an AI assistant of their choice for a deeper conversation. It is engine-rendered by the pure `panchang/kundaliHandoff.ts` (`buildKundaliHandoffText`); the sheet's privacy line is the shared warning surface and must name the birth details BOTH actions carry ("कार्ड और पूर्ण पाठ — दोनों में…"). The app itself never contacts any service — the user carries the text. Framing inside the export states plainly that the interpretive sections are traditional guidance, not predictions.

**Entries.** `पूर्ण कुंडली विवेचन` CTA under the Kundali Overview tab and the link on the landing's compact Kundali card (§51). Guest/loading/error states mirror Gochar's (§67).

**Files.** `mobile/src/panchang/kundaliReportModel.ts` (types), `kundaliReport.ts` (pure engine, incl. `computeMangalDosha` + `RASHI_LORD`), `kundaliHandoff.ts` (full-text export); `mobile/src/screens/KundaliReportScreen.tsx`; route in `navigation/types.ts` + `PanchangStackNavigator.tsx`; CTA in `KundaliScreen.tsx`, link in `PanchangScreen.tsx`. Tests: `src/panchang/__tests__/kundaliReport.engine.test.ts` (tsx — serde round-trip, all-12-lagna sweep, Mangal truth table, no-Kaal-Sarp pin), `kundaliHandoff.engine.test.ts`, `src/screens/__tests__/KundaliReportExperience.test.tsx` (Jest), `.maestro/kundali-report-smoke.yaml`.

---

## 69. शुभ योग — the additive muhurat vocabulary (PRD-27)

**Purpose.** Name what is specially *right* about a day, in exactly the register the dosha vocabulary already uses: a shubh yoga is **present or absent, with its window stated** — never a score, a percentage, a "luckiest day", or an offset against a dosha. The engine had twelve `DoshaKey`s and zero yogas; this section is the other half of that axis, and deliberately nothing more (round 2 §3.3 rejected the standalone day-quality score; round 1 §3 rejected standalone dosha warnings — both stances hold here).

**The v1 set.** सर्वार्थ सिद्धि (vāra × nakshatra), अमृत सिद्धि (the stronger one-per-vāra pair — always also a सर्वार्थ row), रवि योग (inclusive Sun→Moon nakshatra count ∈ 4/6/9/10/13/20), and द्विपुष्कर / त्रिपुष्कर (भद्रा tithi × रवि/मंगल/शनि vāra × the rashi-spanning nakshatra sets). Guru/Ravi Pushya stay where they ship — the computed abujh days (§60) — one concept, one home; a Sunday-Pushya day may honestly carry both the abujh card and a सर्वार्थ सिद्धि chip.

**Engine (`panchang/shubhYoga.ts`).** Pure (kundali-style boundary; source-purity test): `computeShubhYogas(p, nextSunrise)` cuts the vedic vāra-day [sunrise, next sunrise) at every solved anga end (kshaya ends included — the shipped kshaya-aware `angaAt`, never `index + 1` across a kshaya), evaluates each segment at its start (रवि's Sun nakshatra too — recorded v1 variant), and merges adjacent matches into windows; a window never crosses the next sunrise, where the vāra factor changes. Tables are pinned **row-for-row** against `docs/roadmap/conventions/shubh-yoga-v1.md` and ship DRAFT (`SHUBH_YOGA_SOURCE.verified: false`, test-pinned, release-gating — RULEBOOK §24). React reaches it through `useShubhYoga` (a thin composition over `useMuhurat` — the shared day store, no private cache) and, on the finder, `shubhYogasForDate` (`muhuratFinderScan.ts`, the `verdictForDate` two-solve contract). Nothing in `DayInputs` changes, so **no `PANCHANG_DAY_CACHE_VERSION` bump** belongs to this feature.

**The naming collision (hard rule, RULEBOOK §24).** The day card's existing योग field is one of the 27 **nitya** yogas — an unrelated Sun+Moon calculation, one of which is literally named सिद्धि. So: that field is labelled **नित्य योग / Nitya Yoga** everywhere it renders (anga tile §33.4, Daily Muhurat card §33); a shubh yoga always renders under a **शुभ योग** group label with its full "… योग" name; neither may ever render in the other's slot.

**Surfaces.** ① Panchang day card — `ShubhYogaCard` under the anga grid (§33.4): zero chrome on absent days. ② Daily Muhurat (`MuhuratCardBody`, full variant) — a शुभ योग row per present yoga after नित्य योग/करण (§33); the share variant deliberately omits it, like those rows. ③ Event Muhurat Finder (§60) — chips on result cards, the shared card on the day detail (excluded days included — doshas and yogas coexist and are never netted), dosha chips on the excluded answer block through the same component. **`MuhuratChip`** is the one chip: `tone: 'yoga' | 'dosha'`, word + tint (§12), no filled/"strong" variant — a hierarchy between yogas would be a score wearing a costume.

**Time formatting (hard rule).** These windows run nakshatra-to-nakshatra and routinely end past midnight. Every end renders through the shipped `formatEndInstant` (via `formatRangeEndAware` where a range is shown) — 12-hour clock + short-date suffix on a different civil day. The printed-panchang extended-hour style (26:12) exists nowhere in the app and must not be introduced. End-only rendering is allowed solely where the window opens at sunrise (the anga-row convention on the Daily Muhurat card); a mid-day onset always shows its start.

**Files.** `panchang/shubhYoga.ts` · `panchang/useShubhYoga.ts` · `shubhYogasForDate` in `panchang/muhuratFinderScan.ts` · `formatRangeEndAware` in `panchang/muhuratFormat.ts` · `components/{MuhuratChip,ShubhYogaCard}.tsx` · surfaces in `screens/PanchangScreen.tsx`, `components/MuhuratCardBody.tsx`, `screens/{MuhuratResultsScreen,MuhuratDayDetailScreen}.tsx`. Tests: `panchang/__tests__/shubhYoga.test.ts` (tables vs doc, mechanics, 2026 sweep, purity, the eventMuhurat-must-not-import guard), `components/__tests__/ShubhYogaCard.test.tsx` (tones, absent-is-nothing, the past-midnight suffix); device path `.maestro/shubh-yoga-smoke.yaml` (the stable relabels + journeys; a specific chip is date-dependent, pinned in unit tests instead). See RULEBOOK §24 and `docs/roadmap/prds/27-shubh-yoga.md`.
