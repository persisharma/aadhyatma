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

**Home gradient** (top → bottom): `#F6ECD0` → `#F1E3BF` (`parchmentHighlight` → `parchmentGradientEnd` in `colors.ts`).

**Reader overlay** (on top of background image): vertical gradient
`rgba(243,231,201,0.85)` → `rgba(243,231,201,0.55)` → `rgba(243,231,201,0.75)` → `rgba(233,217,177,0.95)`.

**Background image filters:** the CSS filter stack (`opacity: 0.52`, `sepia(0.35) saturate(0.85) brightness(1.02)`) applies only to `design-preview.html`. In React Native the sketch renders unfiltered — `BackgroundLayer.tsx` sets no `imageStyle` opacity or tint — and the fade comes solely from the parchment overlay gradient stacked above it.

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
| Section label (`LIBRARY`) | Inter | 11 | 600 | `0.22em` tracking, uppercase |
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

### Elevation

| Level | Shadow |
| --- | --- |
| `sm` | `0 1px 2px rgba(60, 30, 10, 0.06)` — default card |
| `md` | `0 8px 24px rgba(60, 30, 10, 0.14)` — active card |
| `lg` | `0 30px 60px rgba(60, 30, 10, 0.22)` — phone frame in preview only |

> **Runtime tokens (source of truth: `mobile/src/theme/elevation.ts`).** React Native exposes two named card elevations rather than the `sm/md/lg` scale above: `elevation.card` (shadow `#3C1E0A`, offset `0,2`, opacity `0.10`, radius `6`, Android `elevation: 2`) for default cards, and `elevation.raised` (offset `0,6`, opacity `0.16`, radius `14`, Android `5`) for the one focal element on a screen. The cream palette has very low figure-ground contrast, so card surfaces must be opaque for the Android shadow to render. New cards (e.g. the Today's Practice summary card, §30) consume `elevation.card`.

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
- Shadow: `md`
- Thumb: gradient `#F8D291 → #E0A255` with the text's first Devanagari letter (`ह`, `रा`, `भ`, `सु`) in white, Noto Serif Devanagari 22.
- Right side: saffron `›` chevron.

### Coming

- Background: `rgba(255, 250, 235, 0.72)`
- Border: `divider`
- Shadow: `sm`
- Thumb: flat `#F1E0B3` with `saffron-deep` letter.
- Content (thumb + names) at 55% opacity so it looks dormant but still legible.
- Top-right pill badge: `SOON` (Inter 9, uppercase, 0.18em tracking, `rgba(166,124,52,0.14)` fill).

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
2. **Top bar** (14/22 padding):
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
- Further content-module dirs under `mobile/src/data/` follow the same committed-JSON pattern: `aarti/`, `sanskar/`, `japam/`, `ramcharitmanas/`, the chalisa dirs (`shiv-chalisa`, `durga-chalisa`, `ganesh-chalisa`, `bajrang-baan`, `hanuman-ashtak`), and the stotram dirs (`shiva-strotam`, `durga-stotram`, `ganesh-stotram`, `saraswati-stotram`, `krishna-stotram`, `vishnu-sahasranama`, `ram-stuti`), plus `theerth/temples.ts`.

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

**Purpose.** Let the reader pick a chapter and set their reading language before entering the Reader. Used by modules whose natural unit is a chapter (Gita; future Ramcharitmanas kāṇḍas).

**Layer stack:** same as Reader (Section 9, parchment + background sketch + gradient overlay + content column).

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** (14/22 padding):
   - Back button (returns to Home).
   - Title centred: `भगवद् गीता` (Hindi mode) / `Bhagavad Gītā` (English mode) in the reader-title style.
   - Right-side spacer matching the back-button footprint so the title stays visually centred.
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
- Tab labels: English, Inter_500Medium 10 @ `0.02` tracking
- Each tab carries a custom stroke-style icon in the tint colour (hand-built `View` strokes for Home/Bhakti/Panchang/More, an SVG note glyph for Bhajan)
- Active tint: `saffron`; inactive: `ink-muted`. No active dot indicator — the tinted icon+label is the cue
- Tap targets: full tab width × full bar height (well above 44×44 minimum)
- The tab bar **stays visible inside readers**. The only exception is the immersive Vrat Katha reader (`IMMERSIVE_HOME_ROUTES = ['VratKathaReader']`), which hides the bar while focused

---

## 18. Screen: Home (Revised)

**Purpose.** Surface available content organized by category type and deity. Replaces the flat LIBRARY list from Section 7.

**Structure (top to bottom):**

1. Status bar area (safe region)
2. Hero block: the **Home wordmark lockup** (Section 5) — `ॐ वेदांश़ ॐ` on one row over the "Sacred Texts · Daily Reading" tagline. (Earlier revisions stacked a crest above a 34px title; the lockup is the compact replacement.)
2a. Section label "DISCOVER" + **Feature Spotlight carousel** (§32) — a full-bleed horizontal row of `FeatureCard`s surfacing the app's cross-cutting sections (Daily Practice, Daily Verse, Panchang, Pilgrimage).
3. Section label "CATEGORIES" (Inter 11, uppercase, ink-muted, 0.22em tracking)
4. **Category grid** (2-column wrap layout):
   - **8 active tiles**: the 7 registry categories from `categories.ts` — ग्रन्थ, स्तोत्रम्, चालीसा, जप, आरती, तीर्थ, संस्कार — plus an appended **देवता · By Deity** tile that opens `DeityIndexScreen`
   - Gap: **10px** between tiles, 28px side padding; tile width = half the remaining row
   - Tap → CategoryList for that category (तीर्थ opens the Theerth browse surface, §26; देवता opens the Deity Index)
   - Tile spec: see Section 19
5. Footer mantra (Section 7 — token `footerMantra`, 18 @ 55% opacity) at the end of the scroll
6. **Floating search button** (`SearchFloatingButton`) docked bottom-right, lifted above the routine banner → opens the Search screen. (The old Help floating button/modal never shipped.)
7. **Routine banner** (§30) docked above the tab bar

There is **no deity chip row on Home** — deity browsing lives in the Deity Index screen (§20).

**Gradient background:** same as Section 2 Home gradient.

---

## 19. Component: Category Card

**Purpose.** Grid tile representing a content category on the Home screen.

Two variants: `active` (has content) and `coming` (placeholder).

**Active:**

- Background: linear-gradient `cardActiveFrom → cardActiveTo` (`#FFF5E0 → #F5DEAC`, same gradient as library card)
- Border: 1px `cardActiveBorder` (`rgba(184, 98, 27, 0.4)`)
- Shadow: lifted (offset `0,4`, opacity `0.12`, radius 12; Android elevation 3)
- Radius: **16**
- Layout (vertical, centered):
  - Icon: a `CategoryIcon` stroke vector (saffron-deep), centered above the name
  - **One name line only** — the active reading language's primary via `orderTitlesByLanguage()` (`devPrimary 16` / `latPrimary 17`, `ink`), 6px below the icon. The demoted second-language line is **deliberately dropped** on Home tiles to tighten the grid (see the comment in `CategoryCard.tsx`); catalog/detail screens keep the bilingual pairing. The English `accessibilityLabel` stays intact so screen readers still announce the English name.
- Padding: 12px vertical, 10px horizontal
- Tap → pushes CategoryList screen

**Coming:**

- Background: `cardSurface` flat
- Border: 1px `divider`
- Shadow: `sm`
- Card at 55% opacity
- "SOON" pill badge: top-right corner, 8px inset. 9px, 600, uppercase, 0.18em tracking, `goldTint` fill, `ink-muted` text
- Tap disabled (no navigation)

**New content (active tiles & library cards):**

- Recently-added content (new since the user's last update) shows a `NEW` pill badge: top-right corner, same geometry as `SOON`. `newBadgeBg` fill (saffron tint) + `newBadgeText` (saffron-deep). Saffron — the primary/active accent — marks it as live & fresh, distinct from the muted gold `SOON`. The chip clears once the user opens that content. Carries the "NEW" text cue (never color-only, per §10 accessibility).

---

## 20. Component: Deity Chip

> **Superseded.** The circular deity chip row never survived past the Home redesign. Deity browsing now lives in the **Deity Index screen** (`DeityIndexScreen.tsx`, reached from the देवता tile in the Home grid): all 9 deities from `deities.ts` render as full-width `DeityCard` rows, each carrying a `DeityIcon` attribute vector (bow-and-arrow for Rama, bansuri for Krishna, trishul for Shiva, …), over a randomly-picked deity background plate (`getRandomDeityBackground`, stable per mount). Tapping a row pushes the DeityList (§22). See the Deity Index section for the full spec.

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

Same as Section 21, but filtered by deity tag instead of category. Title shows deity name: "श्री राम · Shri Rama".

---

## 23. Screen: Daily Bhakti

**Purpose.** A devotional "verse of the day" experience. Shows a random verse each time the user opens the tab.

**Structure:**

1. Status bar
2. Title area (centered): "दैनिक भक्ति" (Noto Serif 20 600, ink) + "Daily Verse" (Cormorant 14 400 italic, ink-muted, 4px below)
3. **Verse card** (centered, 28px side margins):
   - Background: `parchment-soft`
   - Border: 1px `divider`
   - Shadow: `md`
   - Radius: 18
   - Padding: 24px
   - Content (top to bottom):
     - **Header row**: source pill on the left (Inter 10 600, 0.3em tracking, saffron-deep on saffron-tint bg, radius 999 — "भगवद् गीता · श्लोक 2.47" format, language-aware) · **BookmarkButton + ShareButton** on the right, matching the reader's in-page actions (§25)
     - Verse text: verse token for the reading language, `ink`. 16px below the header row
     - Ornament divider (Section 5 `॥` style). 16px vertical margin
     - Meaning label: single-language `भावार्थ` / `Meaning` (same treatment as Section 9)
     - Meaning body: meaning token for the reading language, `ink-soft`
     - **Card footer row**: source name on the left (Cormorant 12 400 italic / script serif, `ink-muted` — no "From" prefix) · an inline **`↻ next`** text pressable on the right (14px, `saffron`) that picks a new random verse. There is no separate 40px refresh circle or attribution line below the card
4. **Routine banner** (§30) docked above the tab bar, same as Home

**Gradient background:** same as Home.

**Verse pool:** an explicit registry — `mobile/src/data/versePool.ts` — mapping each participating section (Gita, Sundarkand, the stotrams, chalisas, Ramcharitmanas, japam mantras, sanskar verses, …) into a `UniformVerse` shape. Membership is **registered per section**, not inferred from categories, so the pool only surfaces content with a well-formed verse + meaning mapping. Selection: `Math.random()` over the flat pool on each visit / `↻ next` tap.

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

**Purpose.** A docked banner pinned just above the tab bar on Home and Daily Bhakti, surfacing today's नित्य साधना (daily routine). `RoutineBanner.tsx` + `routineBannerView.ts` (pure state logic).

**Docking.** `position: absolute; bottom: spacing.sm` — the tab bar already owns the bottom safe-area inset (`height: 60 + insets.bottom`), so the banner must **not** add `insets.bottom` again (doing so left an ~inset-sized dead gap below it).

**One line, language-aware.** A single line chosen by the active reading language (`useGitaLanguage`), never a stacked Hindi+English pair. 30px disc + tight `spacing.sm` vertical padding keep it compact.

**Three states** (`bannerStatus`):
- `nudge` (no routine) — dashed `gold` border, `नि` disc, "अपनी नित्य साधना बनाएँ" / "Set your daily practice" → opens RoutineCreate.
- `progress` (partial, or nothing scheduled today) — `goldTint` border, `doneCount/total` disc, "नित्य साधना · आज" / "Daily Routine · Today", + a saffron progress track → opens RoutineToday.
- `complete` (all done) — a bloomed **lotus** mark (`LotusMark.tsx`) + "साधना पूर्ण · आज" / "Complete for today". The prominent progress chip is replaced by this compact achievement badge → opens RoutineToday.

**Completion celebration (pushpa-varsha).** The moment today's routine becomes complete, a gentle one-shot flower shower of saffron/gold petals drifts down (`RoutineCelebration.tsx`), with a `Haptics.NotificationFeedbackType.Success` tap. Reverent, not confetti (Section 11): a soft fall + fade, no scale pops. The shower does **not** render from the banner — it fires app-wide from `RoutineCelebrationOverlay`, mounted once at the navigation root, so it plays on whatever screen completion happens (reading to the last page, finishing japa, or a manual mark). The once-per-day gate is `celebratedSignatureToday` persisted in `RoutineContext`: a record of today's **date + an order-independent signature of the scheduled item set** — so completing the same set celebrates once, while adding an item and completing again can celebrate anew; the gate is held until the context finishes loading to avoid a replay on launch. Vector art is built from `View` + `expo-linear-gradient` (no SVG — same convention as `CategoryIcon`). This pushpa-varsha is the **only** sanctioned exception to §11's no-animation stance; the Today's Practice seal (§31) reuses its fade, not a new effect.

---

## 31. Screen: Today's Practice (आज की साधना)

**Purpose.** The daily-driver screen the routine banner (§30) opens — today's scheduled items across all routines, presented as a devotional ledger rather than a utility checklist (PRD-10). `RoutineTodayScreen.tsx`, inside the parchment `RoutineShell`.

**Components & where they live** (all pull tokens from the theme; no hard-coded hexes):
- `mobile/src/components/MalaStreak.tsx` — the streak drawn as a bead string.
- `mobile/src/components/PracticeSeal.tsx` — the completion seal (wraps `LotusMark`).
- `mobile/src/data/routine/practiceView.ts` — pure view-model (summary lines, offered-time formatting, mala math), unit-tested like `routineBannerView.ts`.
- `mobile/src/utils/useReducedMotion.ts` — shared reduce-motion hook (§12).

**Completion summary card.** One centered `parchment-soft` card (`goldTint` border, `radii.lg`, `elevation.card`, `spacing.lg` padding) at the top:
- Headline: partial → `{done} of {total}`; complete → `{total} of {total} offered`. Latin headline uses Cormorant 600 upright; Hindi uses the Devanagari screen-title face.
- Italic sub-line (Cormorant italic / Devanagari `meaning` in Hindi): partial → `{n} reading(s) remaining`; complete → `Today's practice is complete` / `आज की साधना पूर्ण`.
- Progress strip: a gold→saffron `expo-linear-gradient` fill on a `parchment-deep` track. **Hidden when complete.**
- `MalaStreak` row + label.
- `PracticeSeal` — **absent while partial; fades in (opacity only, no scale pop) when complete**, riding the §30 completion-fade exception; instant under reduce-motion.

**Mala bead semantics (`MalaStreak`).** A horizontal string of beads filling toward a larger gold **meru** bead — the product's streak metaphor, never a fitness flame. `lit = min(streak, capacity)` (default capacity 7; the numeric label stays authoritative for longer streaks). Lit beads use a saffron gradient; unlit beads are `parchment-deep` with a `gold` hairline. The most-recent lit ("today") bead carries a **static** saffron ring — no pulse (§11). Streak 0 → all beads unlit with a "Start your mala today" / "आज से माला आरम्भ करें" label, never a hidden component. Built from `View` + gradient (no SVG, per §30).

**Devotional language — "offered" (अर्पित).** On this screen, completing an item is framed as *offering* it, not ticking a box. An offered row reads `offered {time}` / `{time} · अर्पित`; a pending row reads `Tap to read` / `पढ़ने के लिए टैप करें`. Completion **semantics** are unchanged from §30/PRD-07 (auto on reaching the last verse-page or target japa rounds; manual mark as fallback). (The banner and Profile keep their existing "पूर्ण / complete" copy for now; the "offered" register is scoped to this screen.)

**Offered-at timestamp format.** 12-hour clock with meridiem — `7:12 AM` / `7:12 पूर्वाह्न` (पूर्वाह्न before noon, अपराह्न after), via `formatOfferedTime`. A missing/sentinel time (auto-japam, which carries no per-round timestamp, or a migrated legacy mark) shows a plain `offered` / `अर्पित` with no time.

**No strikethrough.** A completed item's title is **muted (`ink-muted`), never struck through** — striking a sacred text reads as "cancelled," the opposite of "offered." The completion mark is a `saffron` ring that fills with a `✓` when offered; tapping it toggles the manual mark.

**Item rows.** Title in the card-title face (16 over a 24 line — ≥1.5× so Devanagari matras never clip); sub-line (`{alt title} · {tail}`) follows §46's meta convention (`scriptBodyFont` + `cardMeta` — never Cormorant on the mixed-script line). Rows align `flex-start` with a small optical offset on the ring and chevron so both pin to the title's **first** line instead of drifting to the middle of a wrapped two-line block. The help caption under the ledger uses the `meaning` face at 12/18.

**Browse sankalps.** A ghost `RoutineButton` "तैयार संकल्प चुनें / Browse sankalps" closes the ledger and opens the §46 catalog — one of the catalog's three standing entry points (the create-flow chooser and the §32 Home spotlight are the others), so sankalps stay discoverable after a routine exists.

**Data (PRD-10, additive).** Manual completion now stores a timestamp: `@vedansh/routine-done` persists `{ date, marks: Record<key, epochMs> }` (was `{ date, keys: string[] }`; legacy values migrate to `marks` with timestamp `0` = "offered, time unknown"). `RoutineContext` exposes `manualDoneAt(key)`; `useRoutineToday` surfaces `doneAt` per item (manual mark time, or the reader's last-progress `updatedAt` for an auto-complete). Still date-scoped and reset at the day boundary.

---

## 32. Home Feature Spotlight (DISCOVER carousel)

**Purpose.** Raise awareness of the app's distinct sections — not just the catalog categories, but the *cross-cutting surfaces* a first-time user easily misses (Daily Practice, the Daily Verse tab, the Panchang tab, the Pilgrimage map). A single horizontal carousel of feature cards sits **between the wordmark hero and the CATEGORIES grid** (§18). One flexible card shell carries every section so any content fits.

**Placement & label.** A `DISCOVER` section label (Inter 11 600 `0.22em` uppercase `ink-muted`, same token as `CATEGORIES`) precedes the carousel; the `CATEGORIES` grid follows with `marginTop: 24`. The carousel is a horizontal `ScrollView` that **full-bleeds** to the screen edges — it cancels the page gutter with `marginHorizontal: -screenGutter` and re-pads its content (`paddingHorizontal: screenGutter`) so the first card aligns with the page while the next card peeks. `snapToInterval = cardWidth + gap`, `decelerationRate="fast"`, `snapToAlignment="start"`.

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
│  Two-line description that     │  blurb — ink-soft, numberOfLines 2 (truncates any length)
│  explains the section …        │
│      (flex spacer)             │  pushes the CTA to the bottom so cards align
│  [ खोलें  › ]                 │  CTA pill (saffron-tint fill, saffron-deep text)
└──────────────────────────────┘
```

- **Surface.** `cardActiveFrom → cardActiveTo` gradient, `cardActiveBorder` 1px, `radii.lg`, `elevation.raised` (this is a focal hero element). `minHeight: 112` + the flex spacer keep the CTA pinned to a common baseline across cards of differing copy length.
- **Icon tile.** 46×46, `saffronTint` fill, `radii.md`. Wraps any glyph: a `CategoryIcon` vector, the `LotusMark`, or a plain Devanagari `Text` glyph (e.g. `पं` for Panchang) — the tile makes them all read as one family. Saffron-tint (light) keeps the `saffronDeep` vectors high-contrast.
- **Eyebrow.** Short uppercase context tag (`versePill` tokens, `saffronDeep`). When `hasNew`, the eyebrow slot is **replaced** by the saffron `NEW` badge (same geometry/colour as §19) — carries the text cue, never colour-only (§12).
- **Title.** `orderTitlesByLanguage`, primary `numberOfLines 1`, secondary demoted to `ink-muted`.
- **Description.** Hindi → Devanagari 13 `ink-soft`; English → Cormorant italic 14 `ink-soft`. `numberOfLines 2`.
- **CTA pill.** `saffronTint` fill, `pill` radius, label (language-aware: `पढ़ें`/`Read`, `देखें`/`View`, …) + `›` chevron in `saffronDeep`. The whole card is the press target; the pill is a visual affordance, not a nested button.
- **Accessibility.** Whole-card `Pressable`, `accessibilityRole="button"`, label = `"{titleEn}.{ New.?} {descEn} Tap to open."`.

**Props.** `{ item: FeatureSpotlight; width: number; onPress: () => void }`. `width` is owned by the screen (viewport-sized). `FeatureSpotlight` is `{ key, eyebrowHi/En, titleHi/En, descHi/En, ctaHi/En, icon, hasNew? }`.

**Spotlight set (current).** Defined in `HomeScreen.tsx` with navigation wired per item: नित्य साधना → `RoutineToday`; दैनिक भक्ति → `DailyBhaktiTab`; आज का पंचांग → `PanchangTab`; संकल्प → `SadhanaPrograms` (a direct door into the §46 catalog — glyph tile `सं`, same pattern as Panchang's `पं`); तीर्थ यात्रा → `TheerthMap`. Sibling-tab targets navigate via the **parent** (`useNavigation()` → bubble up), not the Home stack — same pattern as `RoutineBanner`/`PanchangScreen`.

**Adding a spotlight.** Append a `FeatureSpotlight` to the `spotlights` array in `HomeScreen.tsx` with both-language copy, an icon node, and an `onPress`. No new tokens are needed — the shell reuses existing card/elevation/typography tokens.

---

## 33. Panchang Tab (पंचांग)

**Purpose.** A daily Hindu almanac plus a vrat/festival companion, living in its own bottom tab (`PanchangTab` → `PanchangStackNavigator`: `PanchangHome` → `ObservanceList` / `ObservanceDetail` / `KathaLibrary` / `MyVrat`). Everything is computed **on-device and offline**: the engine (`mobile/src/panchang/engine.ts`) derives tithi / nakshatra / yoga / karana / vara / lunar month from `astronomy-engine` sun–moon ephemerides with a linear Lahiri-style ayanamsa, so no network, no API, no panchang service. Observance dates come from bundled rules (`festivals.ts` / `festivalEngine.ts`) with a persisted per-city cache warmed off the interaction path.

**Layer stack.** Parchment base · faded sketch background (`panchang_celestial_almanac` via `BackgroundLayer` — the §6 exception pattern: this surface pins its own celestial sketch) · content ScrollView at `spacing.xxl` gutters.

**Structure (top to bottom):**

1. **System header** — one compact row, equal-width flex sides so the centre toggle stays screen-centred:
   - *Location chip* (left): a drawn teardrop pin (11 px, `saffron`, counter-rotated `parchment-soft` hole — no emoji per §5) + city name at 12 pt, in a `parchment-soft` pill with `divider` border. Tap → Location Picker (below).
   - *Calendar-system toggle* (centre): segmented pill `पूर्णिमांत / अमान्त` (Purnimant default), active half `saffron-tint` + `saffron-deep`, inactive `ink-muted`. Persisted at `@vedansh:panchang-calendar-system`.
   - *My Vrat button* (right): 34 px circle, `gold` ★, with a `saffron` count badge when the user follows any vrat. → MyVrat.
2. **Surface tabs** — segmented pill `पंचांग · Calendar` / `व्रत-पर्व · Vrat & Parv` (13 pt, active `saffron-tint`/`saffron-deep`).
3. **Calendar card** (`parchment-soft`, `divider` border, `radii.lg`, `elevation.card`): `‹ [full date + "Month view" affordance] ›` day stepper; the date expands an inline month grid — weekday row (Inter 9), 7-column cells (min-height 38, radius 8), selected day `saffron-tint` + `saffron` border, today `gold` border, and tiny 7 pt Inter observance tags per day (`पर्व` on `saffron-tint`, `व्रत` on `gold-tint`, `व्रत+` when mixed). A horizontal swipe anywhere on the card (dx > 54, mostly-horizontal) steps one day. An `आज · Today` pill resets.
4. **Day panel** (the panchang proper, once computed — an `ActivityIndicator` in `saffron` while the day is derived off the render path):
   - *Date header*: vara name (reader-title face 15, `saffron-deep`) · full date · `विक्रम संवत् N`, then lunar month (+ अधिक flag) · shukla/krishna paksha (11 pt `ink-muted`), over a hairline `divider`.
   - *Muhurat glance card* (`MuhuratGlanceCard`, PRD-14): the `cardActiveFrom → cardActiveTo` gradient hero, promoted to lead the day panel (directly under the date header, **above** the anga grid) — "is now auspicious?" is the live, time-sensitive answer users open Panchang for. Kicker `आज का मुहूर्त`, a hero "now" row (current choghadiya + quality tag when `isToday`, else the day's Abhijit), a two-up `राहु काल` / `अभिजीत` tile pair, and a `सभी मुहूर्त व चौघड़िया →` footer → `MuhuratDetail`. Renders nothing until its own `useMuhurat` solve lands. **Times, ranges, and the quality chip use the non-italic semibold/bold Cormorant face, never the thin italic `cardLatin` (§3), and the chip sits on `avoidChipBg`/`goldChipBg` so it reads as a solid pill on the gradient (§12).**
   - *Anga grid, uniform 2×2*: Tithi · Nakshatra · Yoga · Karana each render on identical elevated tiles (`parchment-soft`, `radii.md`, `elevation.card`) — one size, no prominent/secondary split. Each tile: a 9 pt `saffron-deep` type label (tracked uppercase Cormorant in English; plain script serif otherwise), the value in the active reading language only at 18 pt `ink` (single-line, `adjustsFontSizeToFit` down to a 0.8 scale so the longest name — "Uttara Bhadrapada" — fits without truncation), and `till H:MM AM/PM` when the anga ends that day. No second cross-script line.
   - *Times card*: 2×2 grid — Sunrise, Sunset, Moonrise, Brahma Muhurta — each a `gold` ☀/☽ text-presentation glyph (variation selector forces monochrome; "no emoji") + 10 pt label + Cormorant SemiBold 13 value.
5. **व्रत और पर्व** for the selected date: `ObservanceCard`s (`parchment-soft`, `radii.md`, `elevation.card`) with a category pill (`व्रत` on `gold-tint` / `पर्व` on `saffron-tint`), deity, name, short description, and action pills — `कथा पढ़ें · Read Katha` (gold-tint pill → katha reader) and `पढ़ें: <section>` (outline pill → the linked text via `buildEntryStartTarget`, §38).
6. **आगामी · Upcoming** rows: coloured marker dot (`saffron` star-tier / `ink` halfmoon / `gold` default), short date, name.

**Muhurat Detail** (`MuhuratDetailScreen` → shared `MuhuratCardBody`, reached from the glance-card footer) — the gold-॥-framed `आज का पंचांग` card (§5): panchang + sun rows, then the full 8+8 day/night choghadiya table and अभिजीत/राहु/गुलिक/यमगण्ड rows. Each is a quality-tinted `Muh` row (`goldTint` auspicious / `avoidTint` avoid) with the currently-running period ring-bordered in `saffron` + an `अभी` badge. **Name and time render in dark `ink`/`ink-soft` on both qualities** — the tint plus a small signal-coloured `· शुभ/त्याज्य` text tag carry the quality (§12, never colour alone); the text is never itself tinted-down (terracotta-on-`avoidTint` was muddy ~4.8:1). The quality tag, time range, and now-badge use the **non-italic semibold Cormorant face, never the thin italic `cardLatin`** (§3) — the same readability fix as the glance card. The same body renders the shareable PNG (`variant="share"`, captured off-screen).

**Catalog view** (`व्रत-पर्व` tab): a search field (44 high, `radii.md`) over `searchObservances`; a pinned **My Vrat** row (`gold-tint` fill, 1.5 px `gold` border); an **Upcoming** horizontal card rail (150 pt cards, category glyph ॐ/☾/✺ + uppercase date tag); and a 2-up **Browse by type** tile grid (व्रत / पर्व / उपवास, live counts) plus a **कथा · Katha** tile (॥ glyph, `getKathaCount()` stories) → Katha Library.

**Observance List** (`ObservanceListScreen`) — category drill-in over the Home gradient, sorted soonest-first by next occurrence. Each row: a leading follow star (`gold` ★ filled / `ink-muted` ☆ outline, toggles without opening the detail), name + other-language caption, and right-aligned next date + relative label (`today` / `1d` / `Nd`). In-list search field on top.

**Observance Detail** (`ObservanceDetailScreen`) — hero (category pill + deity, name at 24 pt centred, other-language caption, and a `saffron-tint` "अगला · Next · date · in N days" pill), then an action row: **Follow** (outline `saffron` pill; fills `saffron` with `parchment` text when following — following also feeds vrat reminders, §38) and **॥ Read Katha** (filled `saffron`). Following shows a transient (3.5 s) `gold-tint` "Added to My Vrat — View →" bar. Below: **महत्व · About** prose and a katha card. [A "How to observe / vidhi" section is deliberately omitted until real vidhi content exists.]

**My Vrat** (`MyVratScreen`) — the personal ledger: a three-cell metric band (`Following · Reminders on · This month`, Inter 22 `saffron-deep` values), a "🔔 Reminder defaults" row, the **My priority** list (rows in follow order with next date and a bell button per vrat), and an **Upcoming** timeline among followed vrats. Empty state: large `gold` ★, "अभी कोई व्रत नहीं / No vrats yet", and a filled `saffron` "Browse व्रत-पर्व →" pill.

**Vrat Reminder Sheet** (`VratReminderSheet.tsx`) — bottom sheet for per-vrat or global-default reminder prefs. Implemented as an **in-tree absolute overlay** (not a transparent RN `Modal`) over `modal-backdrop`, so VoiceOver and the Maestro e2e snapshot can read it. Grab handle (40×5, `divider`), then three option rows: *Advance notice* pills (`Off / 1 / 2 / 3 days` — evening before), *On the day* Switch (`saffron` track), *Day-of time* pills (`07:00 / 08:00 / Sunrise` — Sunrise is a labelled 06:00 proxy in v1). Selected pills fill `saffron` with `parchment` text; a filled `saffron` **Save reminders** pill commits. State lives in `VratFollowContext` (`@vedansh/vrat-follows` + `@vedansh/vrat-reminder-default`; built-in default = 1-day advance + 07:00 day-of).

**Katha Library** (`KathaLibraryScreen`) — searchable list of every bundled bilingual katha: ॥ glyph, title, `<n> sections` caption, `पढ़ें · Read` affordance.

**Vrat Katha Reader** (`VratKathaReaderScreen` + `KathaSectionPage`) — lives in the **Home stack** (`VratKathaReader` route; Panchang surfaces navigate cross-tab to it) and is currently the **only route in `IMMERSIVE_HOME_ROUTES`** (`TabNavigator.tsx`), so the bottom tab bar hides for immersive reading. Plain `parchment` (no sketch). Top bar: 40 px back circle · katha title · `n / m` counter; then `ReadingProgressBar` and the Language Toggle (§16). Body: a horizontal paged `FlatList` of section cards — each page carries a `प्रसंग · n/m` / `Part · n/m` pill (`versePill` tokens on `saffron-tint`), section title at 20 pt, a vertically-compressed `॥` Ornament, and body paragraphs at the shared `meaning` token (14 pt paragraph gap); long sections scroll vertically inside the page. §5 pager dots overlay the bottom; light haptic per page.

**Location Picker** (`LocationPickerModal.tsx`) — a `pageSheet` modal on plain `parchment`: title `स्थान चुनें · Choose location` + ✕; a "📍 Use my location" row (GPS fixes **snap to the nearest bundled city** — offline labels, finite cache keys — with denied/error fallback copy); a city search field; and the full 51-city list with a `saffron-deep` ✓ on the selection. Location state (`PanchangLocationContext`, `@vedansh:panchang-location`, default **Ujjain**) is the single reference for every location-sensitive computation; changing city warms that city's observance cache after interactions settle.

---

## 34. Audio Tab (भजन) & Now Playing

**Purpose.** A small devotional audio library — recitations of existing texts plus standalone bhajans/aartis — with playback that persists across the whole app. The tab (`AudioTab` → `AudioStackNavigator`) holds a single `AudioLibrary` screen; the mini-player and the full Now Playing surface are **root overlays** mounted once in `App.tsx`, driven by `AudioPlayerContext`, not navigation screens.

**Data.** `data/audio/tracks.ts` is a pure catalog (`AudioTrack`: bilingual title, thumb grapheme, deity, `kind: 'recitation' | 'standalone'`, `linkedTextId`, nominal duration). Audio bytes resolve separately via `assets/audio-library/index.ts` — a track surfaces **only** when `hasRealAudio(id)` is true, so nothing appears without a recording behind it. [The catalog is a labelled prototype: 10 tracks defined, 2 bundled recordings today (`gayatri-mantra`, `hare-rama`); Phase 2 curates the real set.]

**Library screen** (`screens/audio/AudioLibraryScreen.tsx`), over the Home gradient:

1. Centred screen title `भजन` (reader-title face at 22, language-aware).
2. **Deity filter rail** — horizontal row of circular chips (§20 family): 54 px disc on the `cardThumbActiveFrom → cardThumbActiveTo` gradient with a `parchment-soft` Devanagari glyph, 11 pt label below; the selected chip gains a 2 px `saffron` ring on a `saffron-tint` pad. A leading `ॐ · सभी/All` chip clears the filter. Only deities that actually have an available track appear.
3. Sections with bilingual headings (`जारी रखें · Continue listening` when a track is loaded, `पाठ · Recitations`, `भजन व आरती · Bhajans & Aartis`), each a stack of `TrackCard`s.

**Track card** (`components/audio/TrackCard.tsx`) — the §8 catalog-card language on an audio row: `cardActiveFrom → cardActiveTo` gradient, `cardActiveBorder`, `radii.lg`, 18 padding; a 52 px deity-icon thumb on the thumb gradient; bilingual title via `orderTitlesByLanguage` (dev 17 / lat 19 primary); sub meta `पाठ · 8:14`-style (`cardMeta` size). The tail swaps the navigate chevron for a 38 px **play disc**: `saffron-tint` + `saffron-deep` ▶ at rest, filled `saffron` + `on-primary` ❚❚ for the currently playing track. Tapping a card plays the track and opens Now Playing.

**Playback state** (`AudioPlayerContext`) — one imperative `expo-audio` player for the whole session (unlike the component-scoped `JapamAudioPlayer`), so playback survives navigation. The session is configured for background audio (`playsInSilentMode`, mix-with-others / duck on Android via `audio/audioSession.ts`). Exposes position/duration, ±15 s skip (`SKIP_SECONDS`), next/previous across the playable set, loop, rate 0.5–1.5×, and `nowPlayingOpen`.

**MiniPlayer** (`components/audio/MiniPlayer.tsx`) — rendered once at the app root; appears whenever a track is loaded and floats over every tab/stack. Docks just above the tab bar (bottom = 60 + safe-area inset + `spacing.xs`; inset `spacing.lg` each side) — mirroring the RoutineBanner's docking (§30). Card: `parchment-soft`, `divider` border, `radii.lg`, upward shadow; 40 px deity thumb on the thumb gradient; title (reader-title face at 15) over a 3 px progress strip (`saffron` fill on `divider` track); then ▶/❚❚ (`saffron-deep`) and ✕ (stop & dismiss) buttons at 36 px. Tapping the body expands Now Playing.

**Now Playing** (`screens/audio/NowPlayingScreen.tsx`) — a full-screen `parchment` overlay (absolute-fill, mounted app-wide in `App.tsx`; no navigation plumbing), shown when `nowPlayingOpen`:

- Header: ⌄ minimise circle · uppercase `Now Playing` label (swipe-hint face) · spacer.
- Artwork: a 220 px `parchment-soft` framed square with the deity vector at 150 (or a 96 pt `saffron` ॐ fallback).
- Title at 26 centred (reader-title face), subtitle `<artist/kind> · <deity>` in Cormorant italic `ink-muted`.
- Seek bar: 4 px `saffron` fill on `divider` track, tap-to-seek; lining time labels either side (Cormorant SemiBold 15).
- Transport row: `−15 · ◀◀ · [▶/❚❚] · ▶▶ · +15`; the play button is a 72 px `saffron` disc with `saffron-deep` rim and `on-primary` glyph.
- Secondary row: a 44 px ⟳ loop toggle (kept for mantra japa) — outline at rest, filled `saffron` when looping.

**Reader entry point.** Readers whose text has a linked recitation with real audio (via `getTrackForText` + `hasRealAudio`) show a small `saffron-deep` **▶** in the top bar after the page counter (`ChalisaReaderScreen.tsx`); tapping plays the recitation and opens Now Playing — the structural "audio hook" §9 reserved.

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
4. **Audio row** (`components/JapamAudioPlayer.tsx`, above a `divider` hairline): an auto-chant loop of the mantra recording (`assets/japam-audio`). A `▶ चलाएँ / Play` pill (fills `saffron` while playing) and a **Tempo** stepper (− / 1.0× / +, range 0.5–1.5× in 0.1 steps, pitch-corrected). The clip loops natively and the bead count advances with the chanting: a single-recitation clip registers **one bead per completed loop** (loop-wrap detection on the reported position — reliable where `didJustFinish` isn't), while a musical rendition declares how many times it chants the mantra (`repetitions` in `assets/japam-audio`) and registers **one bead per repetition segment**, so a multi-minute kirtan doesn't count as a single bead. `autoPlay` starts the loop immediately when arriving from an alarm tap (§38) and **auto-stops after 30 s** (`ALARM_AUTO_STOP_MS`) so the alarm rings the mantra from the shared recording then falls silent rather than looping forever — reusing the same bundled mp3, with no separate size-adding alarm clip; any manual play/pause cancels the cap so a real chanting session isn't cut off. Mantras without a bundled clip show an italic "Audio not available" notice instead. Bundled today: `om-namah-shivaya` (own single-recitation clip, 1 bead/loop) plus `hare-krishna-mahamantra` and `gayatri-mantra`, which reuse the Audio-library kirtan/rendition takes (`assets/audio-library/hare-rama.mp3` ≈16 reps, `gayatri-mantra.mp3` ≈6 reps) via a relative `require` so the mp3 is bundled once rather than duplicated. The per-file `repetitions` counts are cadence estimates — tune them if a round drifts from 108 beads.
5. **Actions row**: two outline buttons — `बीज पुनः ० · Reset Beads` (`cardActiveBorder`, `saffron-deep` text; zeroes the current round, keeps completed rounds) and `सब साफ़ · Clear All` (`divider`, `ink-muted`). Both confirm via a centred modal card over `modal-backdrop` (title + italic body + filled `saffron` confirm + cancel). Disabled at 0.4 opacity when there is nothing to reset.

**Mantra selection.** There is no dedicated picker screen — the japam category tile / deity lists / search / routine items open the counter for a specific mantra; the alarm editor's mantra picker (below) is the one in-flow chooser.

**Alarms** (`JapamAlarmsScreen.tsx` in the More stack, `JapamAlarmsContext`, cap `MAX_JAPAM_ALARMS = 8`, persisted at `@vedansh/japam-alarms`):

- List screen over the Home gradient: intro line ("Wake to the mantra you chose, at the time you chose."), a permission banner when notifications are denied (tap → system settings), alarm rows (`parchment-soft`, `radii.lg`: the time in the reader-title face — 12 h or 24 h per the device locale via `prefers12HourClock()`; a11y labels stay 24 h — mantra name, a repeat line "`Daily / Once / Weekdays / Weekends / day list` · `in 7 hr 25 min`" (live 30 s tick) plus "skips ‹date›" while a skip is pending, optional uppercase label, and a `saffron` Switch), and an outline `+ Add alarm` button. (No privacy footnote — implementation-detail messaging like "nothing goes to the server" is deliberately not shown anywhere in the app.)
- **AlarmEditorSheet** (exported and reused by the counter's ⏰) in a fade modal, internally scrollable (`maxHeight` 88 %): `TimeStepper` at **1-minute** steps (a chevron steps once per tap on press-release; the auto-repeat starts from **long-press** — 350 ms, then every 90 ms — so a scroll drag that begins on a chevron never mutates the time), a **Repeat** row of seven 38 px circular day chips (S M T W T F S; all on = Daily, none = Once — the summary line then warns "turns off after ringing"), the mantra picker (locked when opened from a counter), a **Label** `TextInput` (40 chars, optional), an edit-mode-only **Skip next** toggle chip showing the date it would skip, and a live "Rings in …" preview line above the filled confirm button (a11y label `Confirm alarm`).
- **Model** (`notifications/japamAlarms.ts`): `repeatDays?: number[]` (getDay() indices; absent = daily, `[]` = one-time, subset = weekly) and `skipNextDate?: 'YYYY-MM-DD'`. Pure helpers: `nextAlarmFireTimestamp(s)` (honours days + skip), the shared skip plan (`isSkipPending` / `skipOneshotPlan` — one pendency predicate and `:occN` id scheme for every tier), `repeatSummary`, `describeUntilFire`, `formatTimeLabel`, `prefers12HourClock`. The context clears `skipNextDate` whenever time/repeat change, prunes past skip dates on load/foreground, and **auto-disables fired one-time alarms** via the scheduler's once-armed bookkeeping (`firedOnceAlarmIds`; merge semantics — a past armed timestamp is evidence the alarm rang and is never overwritten, and a fired one-time alarm is never re-armed).
- Scheduling (`notifications/japamAlarmScheduler.ts`) is tiered: Android uses the native module (`AlarmManager.setAlarmClock` + lock-screen notification with the looping mantra sound and **Stop / Snooze 5 m** actions — survives Doze and reboot; the Kotlin receiver re-arms the next *repeat day* after each fire, never for one-shots, dismisses by the exact posted notification key, and suppresses a snooze fire whose base alarm is no longer armed); iOS 26+ uses AlarmKit (weekly recurrence on the selected days, `.fixed` one-shots for Once, native **Snooze** countdown button; reconcile leaves a mid-countdown alarm untouched so opening the app never swallows a snoozed re-ring; a bare `repeatDays: []` means one-shot on both platforms); older iOS / Expo Go falls back to `expo-notifications` — DAILY trigger for daily, one WEEKLY trigger per selected day, DATE one-shots for Once, all under a `JAPAM_EXPO_SLOT_CAP = 24` pending-slot budget (whole-alarm granularity, soonest-first) so japam can't crowd the daily-verse window out of iOS's 64-pending cap, plus a `japam-alarm` notification category carrying a **Snooze 5 min** action (`maybeHandleJapamSnoozeResponse`, wired in App.tsx on the **live listener only** — the cold-start "last response" is ignored so a stale snooze tap can't schedule a phantom ring). A pending skip-next on recurrence-owning tiers is armed as discrete one-shots — `ALARMKIT_SKIP_ONESHOT_COUNT = 7` / `EXPO_SKIP_ONESHOT_COUNT = 4` — and reverts to plain recurrence on the next foreground reconcile. `scheduleJapamAlarms` is idempotent and **serialized** (concurrent reconciles chain, last caller wins) — cancel-then-reschedule on any change; in-flight `:snooze` one-shots for live alarms are spared while orphaned ones (alarm deleted/disabled) are cancelled. Tapping the alarm deep-links into the counter with `autoPlay` (§38).

---

## 36. Search

**Purpose.** On-device search across the entire library — sections, deities, and every verse — built from the same bundled data the readers load. No network, no service, no query logging; the index builds lazily on first open (`data/searchIndex.ts`).

**Entry point — floating button** (`components/SearchFloatingButton.tsx`). A 48 px circle, `parchment-soft` fill, 1 px `divider` border, holding a `saffron` ⌕ glyph at 26 (reader-title face). Anchored absolute at `right: spacing.xl`; default `bottom: spacing.xl`, but Home passes `spacing.sm + 60 + spacing.md` so it clears the docked RoutineBanner (§30) — and it z-indexes above the banner so taps land. Currently rendered on Home only; tap → `Search` (Home stack).

**Search screen** (`SearchScreen.tsx`), over the Home gradient:

1. **Top bar**: 44 px back circle + a pill-shaped input row (`parchment-soft`, `divider`, `radii.md`, 44 high): `saffron` ⌕, the `TextInput` (Inter 500 at 15, language-aware placeholder "श्लोक, पाठ, मंत्र खोजें…"), and a ✕ clear button while typing. The input auto-focuses ~200 ms after mount.
2. **Empty state** (no query): *Recent* chips (last 6 queries, `@vedansh/search-recent`; pill chips with per-chip ✕ and a `Clear All` action) and a *Popular* 2-up grid of four fallback sections (Hanuman Chalisa, Gita, Sundarkand, Shiva Stotram) as thumb-glyph cells.
3. **Results** — grouped rows under `sectionLabel`-style headers with counts (`पाठ · Sections`, `देवता · Deities`, `श्लोक · Verses`):
   - *Section row*: Devanagari thumb glyph (`saffron-deep`), name in the active language, Hindi subtitle, `saffron` ›. Tap → the section's start via `navigateToEntryStart` (§38) — chalisa readers, chapters indexes, aarti/sanskar readers, the japam counter, or the Theerth map as appropriate.
   - *Deity row*: `gold` ॐ thumb; tap → `DeityList` filtered by that deity.
   - *Verse row*: the matched verse's first line in the verse face at 17, source · label meta in Cormorant italic; tap → **that verse in its reader** via `buildProgressTarget` (chapter + verse index), falling back to the section start.
   - Verse hits are capped at `VERSE_RESULT_CAP = 50`, with an italic "More results — type a more specific query" note when clipped.
4. **Zero state**: dimmed `॥`, "कोई परिणाम नहीं / No matches found", and a hint to try a Devanagari word or section name.

**Index coverage.** Sections (every active library entry), deities, and verses from every text module — the four chalisas, aartis, japam mantras, Gita, Sundarkand, all stotram modules, Ramcharitmanas, sanskar items, and the Theerth temples. Standard `lines`/`linesEn` shapes are picked up automatically when a section is added (RULEBOOK §8).

**Normalization** (`data/searchNormalize.ts`) — one pure fold applied to both index and query, so Devanagari and Latin queries meet in the middle: Unicode NFD with the combining nukta stripped (क़ ⇄ क), lowercase, IAST diacritics folded to ASCII (`kṛṣṇa` → `krsna`, so a plain-ASCII query matches the romanized corpus), punctuation dropped **including daṇḍa `।`/`॥`**, whitespace collapsed. Ranking is exact > prefix > substring per field (`MatchRank`), idempotent and unit-tested.

---

## 37. More Hub & Profile

**Purpose.** The settings-and-self tab (`MoreTab` → `MoreStackNavigator`: `MoreHome` → `Profile` / `Wishlist` / `Reminders` / `JapamAlarms`). One scroll over the Home gradient, **16 px gutters**, three grouped sections ~22 apart. **All hub chrome is single-language** (the selected reading language only) — bilingual pairing is reserved for actual reading content, never navigation/settings (V4 redesign).

**Hub** (`MoreScreen.tsx`), top to bottom:

1. **Title** — one left-aligned line, selected language only (`अन्य` / `More` / `અન્ય` / `ಇನ್ನಷ್ಟು`), 30 pt in the script's title face (`latinBold` for en, `scriptTitleFont` for hi/gu/kn). No `More` subtitle.
2. **Three grouped inset lists** — each is an uppercase **group label** (`saffron-deep`, 13; Latin gets tracking + uppercase via the chrome font, Indic drops both) above one **list container** (`parchment-soft`, radius 20, 1 px `divider`, `overflow:hidden`, soft shadow) whose rows are split by hairline `divider` top-borders. Standard row anatomy: `[38 px icon tile, radius 11] [label 18]  …  [state 15 ink-muted] [chevron › 19 gold]`, padding 15×16, pressed → `saffron-tint` wash.
   - **साधना / Practice** — a compact **profile hero row** (tinted `cardActiveFrom → cardActiveTo` gradient, 52 px circular `saffron` ॐ badge, `साधक प्रोफ़ाइल` title, sub-line "**`N`** श्लोक · **`N`** श्रृंखला" = lifetime verses + streak in `saffron`; the old `rounds` count is dropped; a11y "Open Sadhak profile" → Profile), then **संग्रह** (♥ `saffron`, state = saved count; label matches the WishlistScreen title → Wishlist §24), **स्मरण** (ॐ `gold`, state = reminder time(s) or Off → Reminder Settings §38), **जप अलार्म** (⏰ `saffron-deep`, state = active count → §35).
   - **ऐप / App** — **भाषा** (अ `gold`, state = current language's native name; opens the **Language picker sheet**, not an inline grid), **पाठ का आकार** (Aa `saffron`, state = मानक/बड़ा; opens the **Reading-size picker sheet**, §43), **ऐप साझा करें** (↗ `saffron`; OS share sheet via `buildAppShareMessage(lang)`, `data/shareLinks.ts` — the localized `APP_SHARE_INVITE` + `SMART_LINK`).
   - **जानकारी / Info** — **परिचय व अस्वीकरण** (ⓘ `ink-muted`; opens the pageSheet disclaimer modal with the bilingual disclaimer + "Report an Error" CTA), **त्रुटि सूचित करें** (⚑ `ink-muted`; `mailto` via `buildDiscrepancyMailto`), and **ऐप भ्रमण फिर देखें / Show App Tour** (↻ `gold`; a11y label constant "Show App Tour") which calls `resetTour()` to replay the first-launch feature tour on demand (§47).

**Picker sheets** — `LanguagePickerSheet.tsx` and `ReadingSizePickerSheet.tsx` are bottom-sheet `Modal`s (slide up, `modalBackdrop`, grabber, `parchmentHighlight`) following the `AddToRoutineSheet` pattern. Language lists the four `LANGUAGES` as radios each in its own script; picking one applies it (`useGitaLanguage`, §16) and closes. Reading-size shows the M/L pills + the live "श्री राम जय राम" sample (§43) + a Done button; picking a size keeps the sheet open so the preview updates.

*Removed in V4:* the tall bilingual header + `More` subtitle, the big 3-stat profile card (→ compact hero row), the inline 2×2 language grid and inline reading-size card (→ rows opening sheets), and the Panchang methodology card (it duplicated the Panchang tab, §33).

**Profile** (`ProfileScreen.tsx`) — the साधक insights surface, fed by `UserActivityContext` (reads, japam beads/rounds, per-source and per-mantra tallies, all local):

1. **Identity card** (gradient, `radii.lg`): `saffron` ॐ crest, `साधक · Sadhak` name pair, hairline, and a three-cell footer — **day streak · active days · saved verses**.
2. **Range tabs** — a segmented pill `Lifetime / Monthly / Daily`; the active tab fills solid `saffron` with `on-primary` text. An italic range caption below.
3. **Stat tile grid** — four tiles: Verses Read, Beads Chanted, Rounds (Mala), Days Active.
4. **7-day trend** — a mini bar chart (`saffron` bars on `parchment-deep`-style tracks) of daily activity (reads + beads + rounds×108), weekday labels localized.
5. Per-source and per-mantra breakdown lists for the selected range, sorted by volume, with an empty state when the range has no activity.

---

## 38. Notifications & Deep Links

**Purpose.** All notifications are **local and on-device** — scheduled with `expo-notifications` (plus the native alarm tiers of §35); no server push. Three families, each owning an identifier prefix so cancel/re-arm cycles never touch each other's slots: daily verse (`daily-verse`), vrat reminders (`vrat-…`, PRD-09), and japam alarms.

**Daily verse** (`notifications/scheduler.ts` + pure helpers in `pure.ts` / `seed.ts`; state in `NotificationPreferencesContext`, `@…/prefs` + meta in AsyncStorage):

- **Default on at 07:00.** Up to `MAX_REMINDER_TIMES = 4` times per day, edited in Reminder Settings (`ReminderSettingsScreen`: master Switch, per-time `TimeStepper` rows, add/remove up to the cap).
- A rolling **30-day window** (`ROLLING_WINDOW_DAYS`) is scheduled ahead, hard-capped at iOS's 64 pending-notification budget (`IOS_PENDING_CAP`, shared fairly across configured times). Idempotent cancel-then-reschedule on every relevant change and app foreground.
- **Deterministic verse per slot**: the local `YYYY-MM-DD` key is FNV-1a-hashed into the verse pool (`seed.ts`), so rescheduling never changes today's verse; multiple same-day times get distinct verses.
- **Localized by reading language** (§10): title `दैनिक भक्ति` / `Daily Verse`, body = first verse line + `source · label`, all rendered through the same language helpers the readers use — gu/kn arrive re-scripted, en romanized.
- **Opt-in modal** (`ReminderOptInModal.tsx`, mounted app-wide): a `pageSheet` shown once, gated on the **third app open** with the reminder off and the prompt not yet shown ("earn the ask, never ambush") — lede, a `TimeStepper`, a filled `saffron` **Enable**, and a quiet uppercase *Not now*. Because the toggle defaults on, the provider also requests OS permission once per cold start while still undetermined.

**Vrat reminders** (`vratScheduler.ts` / `vratReminderPure.ts`, armed by the headless `<VratReminderScheduler>` in `App.tsx`): derived from the user's **followed vrats** (§33) and their per-vrat / global reminder prefs. Each upcoming occurrence can produce an *advance* notice (evening before at `ADVANCE_HOUR = 18:00` local, 1–3 days ahead) and/or a *day-of* notice at the chosen morning time. Planned under a dedicated `VRAT_REMINDER_CAP = 24` pending budget — when over, **follow order is the priority tiebreak**. Re-arms on follow/pref/permission changes and on every app foreground; never prompts for permission itself (shares the daily-verse grant).

**Japam alarms** — see §35 for the scheduling tiers; they participate in deep-linking below.

**Notification tap → deep link** (`notifications/deepLink.ts`). A module-level `navigationRef` (attached to the `NavigationContainer` in `App.tsx`) lets `handleNotificationResponse` dispatch from outside the React tree; `App.tsx` wires both the cold-start response and the live `addNotificationResponseReceivedListener`. Routing by payload type:

- `daily-verse` → the **Daily Bhakti tab** carrying the exact verse identity (`sourceId`/`chapter`/`verseIndex`) baked into the notification — deliberately *not* a reader, because opening a reader would run its `setProgress` effect and clobber the user's resume position; the baked identity also survives OTA pool changes.
- `vrat-reminder` → `PanchangTab → ObservanceDetail` for that rule.
- japam alarm → `HomeTab → JapamCounter` with `autoPlay: true`, so a lock-screen tap drops straight into chanting (mantra id validated against the catalog first; a stale alarm falls back to Home rather than crashing).

**Route mapping — `navigation/entryRoutes.ts`.** The single source of truth for "open this content": `buildEntryStartTarget(entry)` maps any library entry to its start route (japam → `JapamCounter`; theerth entries → `TheerthMap` with a group filter; the four chalisas → `ChalisaReader`; sanskar → `SanskarReader`; aartis → `AartiReader`; every chaptered text → its Chapters screen), with `navigateToRoutineItem`, `buildProgressTarget` (resume / search verse hits), and `buildBookmarkTarget` (Wishlist rows, §24) layered on top. Panchang's "Read: <section>" links, search results, routine items, wishlist, and the Home spotlight all route through this one module, so adding a section's route once wires every surface.

---

## 39. Share Verse Cards

**Purpose.** Let a reader send any verse out of the app as a branded parchment image — composed off-screen, captured as a PNG, and handed to the native share sheet with a caption + install link (PRD-05). `ShareProvider` / `useShare()` in `mobile/src/utils/shareVerse.tsx`; card in `ShareCard.tsx`; links in `mobile/src/data/shareLinks.ts`. For a verse-less invite (just the download link), the More hub's **Share the App** card (§37) calls `buildAppShareMessage(lang)` from the same `shareLinks.ts` and opens the native share sheet directly.

### Component: Share Button (`ShareButton.tsx`)

- Same family as the Bookmark button (§25): 34×34 circle, `parchment-soft` fill, 1 px `divider` border, `↗` glyph in `saffron` (18, weight 600). 12 px `hitSlop`.
- Placement: in the verse page's **header row**, right of the verse-type pill, alongside the Bookmark button (readers pass both via the verse page's `topActions` slot). Every reader carries one — all 15 reader screens plus Daily Bhakti and the Japam counter. It is also the **only** share affordance elsewhere in the app: the **Today's Panchang** (Muhurat detail) header uses this same circle rather than a bespoke button, so the share glyph reads identically everywhere.
- While a capture/share is in flight (`busy`), the button disables and drops to 50 % opacity — this debounces double-taps. On the Muhurat detail screen `busy` also covers the pre-ready window before the panchang is computed.
- Accessibility: `accessibilityRole="button"`; label defaults to "Share verse" and hint to "Long-press to share a screenshot of this reader instead", but both are **optional props** — non-verse surfaces override them (the Panchang header passes a localized "Share panchang" label and no hint, since it has no long-press path). [The verse provider supports a `mode: 'screenshot'` capture of a caller-supplied ref, and the button accepts `onLongPress` — but no shipping reader currently wires `onLongPress`, so only the card path is live today.]

### Component: Share Card (`ShareCard.tsx`)

A fixed-size 540×675 dp card (4:5 portrait), rendered **off-screen** and captured at 1080×1350 px PNG — the WhatsApp-friendly output size. Surface: `parchment` fill, 1 px `divider` border, padding 28 top / 28 horizontal / 22 bottom.

**Structure (top to bottom):**

1. **Header band** (centred, 18 below): `<SECTION NAME> · <VERSE LABEL>` uppercased — `cardLatin` face at 13, `saffron-deep`, 2.4 letter-spacing. Both parts are content, so they follow the active reading language (`contentByLang`): Devanagari for `hi`, English for `en`, re-scripted for `gu`/`kn`.
2. **Verse block** (flex-grow, centred): the verse lines at 24/40, centred, `ink`. Line source follows the language: `linesHi` for `hi`, `linesEn` (romanization) for `en`, re-scripted Devanagari for `gu`/`kn` (`verseLinesByLang`). Font family follows the script — Gujarati/Kannada serif cuts for `gu`/`kn`, otherwise the `verse` token's Devanagari face (which also carries the Latin romanization glyphs). This card is a §13-sanctioned constrained surface: it keeps its own tuned sizes rather than the reader type scale.
3. **`॥` Ornament divider** (§5).
4. **Meaning** (optional): italic 14/24, centred, `ink-soft`, `numberOfLines={5}` with `adjustsFontSizeToFit` down to 50 % so long meanings shrink instead of clipping. Language-selected via `meaningByLang`, honouring verified native `meaningGu`/`meaningKn` overrides when the verse carries them.
5. **Branding footer** (1 px `divider` top rule, 14 above): `वेदांश़` wordmark (reader-title face, 18, `ink`) · `Vedansh — Sacred Texts, Daily Reading` (italic 12, `saffron-deep`) · `NOW AVAILABLE ON IOS & ANDROID` (uppercase 10, `ink-muted`, 2.0 tracking).

### Share flow (`ShareProvider` / `useShare()`)

1. `share(verse, lang)` mounts the card **off-screen** (absolute-positioned at −10000,−10000, `pointerEvents="none"`) inside the provider, waits one animation frame + 60 ms for layout/fonts, then captures it with `react-native-view-shot`'s `captureRef` (PNG, quality 1, tmpfile, scaled to 1080×1350).
2. A **text caption** is always built via `buildShareCaption` (`shareLinks.ts`): section · verse label header, the quoted first verse line, then a language-localised CTA ("Read on Vedansh:" / "Vedansh ऐप पर पढ़ें:" / gu / kn equivalents) followed by the public smart link (`SMART_LINK`, a GitHub Pages redirect page; `APP_STORE_URL` / `PLAY_STORE_URL` constants live alongside it). Bundle-only — no runtime fetch.
3. **Platform split:** iOS shares image + caption together through RN `Share.share({ message, url })` (UIActivityViewController fills WhatsApp's caption field automatically). Android's RN Share drops file URIs, so the image goes through `expo-sharing`'s `shareAsync` (mimeType `image/png`) and the caption is left to the user — the branding footer on the card itself carries the fallback.
4. **Fallbacks:** capture failure → text-only `Share.share(caption)`; sheet dismissal / any error is swallowed. An in-flight ref guarantees one share at a time; `busy` drives the button's disabled state.

**Files:** `mobile/src/components/ShareButton.tsx`, `ShareCard.tsx`, `mobile/src/utils/shareVerse.tsx`, `mobile/src/data/shareLinks.ts`. `ShareProvider` mounts once in `App.tsx`.

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
3. **Last-read card**: `parchment-soft`, `divider` border, `radii.md`; `अंतिम पठित` / `LAST READ` in the `sectionLabel` token over the pre-formatted location at 16 in the active script (via `formatLocation`, which speaks each source's vocabulary — `अध्याय N · श्लोक M` for Gita, `सर्ग` for Sundarkand, `स्तोत्र` for stotrams, `काण्ड` for Ramcharitmanas, plain `पद N` for chalisas/aartis).
4. Primary button: solid `saffron`, `radii.md`, `जारी रखें · Resume` in `onPrimary`.
5. Secondary button: outlined `cardActiveBorder`, `आरंभ से पढ़ें · Start Over` in `saffron-deep`.
6. `Cancel` — italic 13 `ink-muted`, 44 pt min-height text button.

**Behaviour.** Resume → navigate to the saved position (`navigateToProgress`). Start Over on a **chaptered** entry clears only the chapter being resumed (`clearChapterProgress`) and reopens that chapter at verse 1 — sibling chapters keep their positions; on a linear entry it clears the whole source and opens at the start. Every exit path also `markSeen`s the entry (clears its NEW badge, §44). Backdrop tap dismisses.

### Chapter auto-advance (transition cards)

Multi-chapter readers must let the reader swipe **across** chapter boundaries (the RULEBOOK §3 auto-advance contract). The pager data is `[PrevChapterCard?] + verses + [NextChapterCard?]` — the prev card omitted on the first chapter, the next card on the last. Each transition card (`NextChapterCard.tsx` / `PrevChapterCard.tsx`) is a full-width page, content centred with 12 gap: a language-aware `अगला / Next` (or `पिछला / Previous`) label at 14 `ink-muted`, the neighbouring chapter's title at 20 `saffron-deep` (italic when lang = en), and a 32 pt `›` / `‹` chevron in `saffron-deep`. When the transition page becomes ≥ 60 % visible, the reader fires a **Medium** haptic and, after a 400 ms beat, `navigation.replace`s itself with the neighbouring chapter — replace, not push, so back always returns to the chapter list. The prev path lands on the previous chapter's **last** verse (`initialIndex: prevVerseCount − 1`). A `hasNavigatedRef` latch prevents double-fire; the prepended prev card shifts all indices by one (`offset = isFirstChapter ? 0 : 1`).

### Component: Jump-to-Start (`JumpToStartButton.tsx`)

A floating pill anchored bottom-right of the verse pager (16/16 inset, clear of the centred pager dots) rendered only when the reader is past verse 1 — a one-tap return after a subsection auto-jump, without swiping back through every page. `parchment-soft` fill, `cardActiveBorder` 1 px, `pill` radius, raised shadow; `⇤` glyph (15) + language-aware label `आरंभ` / `Start` (13, italic for en) in `saffron-deep`. Tap scrolls (animated) to index 0 of the current chapter.

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

`verseCount` and counted subtitles are computed from the module's own exported totals (`sundarkandTotal`, `shivChalisaCounts.totalVerses`, …) so the card can never drift from the data (RULEBOOK §10.10). Japam entries are spread into the array from `japamMantras`, so a new mantra automatically becomes a catalog row.

### Category set (`mobile/src/data/categories.ts`)

Seven categories, all `active`: `granth` (ग्रन्थ · Sacred Books) · `stotram` (स्तोत्रम् · Hymns & Praise) · `chalisa` (चालीसा) · `japam` (जप · Japa & Mantras) · `aarti` (आरती) · `theerth` (तीर्थ · Pilgrimage) · `sanskar` (संस्कार · Good Habits). `HomeScreen` renders these seven tiles from data and appends an **eighth, hand-wired देवता · By Deity tile** that opens `DeityIndexScreen` (§42) instead of a category list. (This supersedes §18's "6 tiles" list.) `japam` tiles route to the counter UI, `theerth` to the map (§26); everything else goes through `CategoryListScreen` → `entryRoutes.ts`.

### Deity set (`mobile/src/data/deities.ts`)

Nine deities, each `{ id, nameHi, nameEn, iconKey }`: rama (bowArrow) · krishna (bansuriPeacockFeather) · vishnu (chakra) · shiva (trishul) · hanuman (gada) · durga (lotus) · ganesha (modak) · savitr / माँ गायत्री (surya) · saraswati (veena). `getDeityMeta` / `deityIconKey` are the lookup helpers; the icon system is §42.

### Data-shape families (one directory per module under `mobile/src/data/`)

- **Linear `lines`/`linesEn` verses (swap-on-toggle, §3.1/§10)** — one JSON, one `Verse[]`, no chapters. Three registry-driven *multi-instance* readers dispatch on a route param instead of importing one section's data (RULEBOOK §3): **chalisas** (`chalisaRegistry.ts` → hanuman/shiv/durga/ganesh chalisa dirs), **aartis** (`aarti/index.ts` `aartiCollection`, 7 aartis, `refrain`/`stanza` verse types), **sanskar** (8 practice modules — prabhati-shloka, surya-namaskar, tulsi-puja, bhojan-mantra, gau-seva, sandhya-deepam, ratri-shloka, vidyarambha-prarthana — whose `SanskarVerse` adds `vidhiHi/En` method prose and `intro`/`mantra`/`step`/`vidhi` types).
- **Chaptered `chapter-NN.json` + `chapters-manifest.json`** — the Gita pattern (§10, §15): `gita/` (18 chapters, sanskrit + transliteration + meaning + commentary), `sundarkand/` (16 sargas), `shiva-strotam/` (4), `durga-stotram/` (3), `ganesh-stotram/` (3), `saraswati-stotram/` (3), `vishnu-sahasranama/` (4), `krishna-stotram/` (2), `ramcharitmanas/` (1 — Mangalacharan only today), plus single-chapter `hanuman-ashtak/`, `bajrang-baan/`, `ram-stuti/`. Each `index.ts` is a typed loader with module-load invariants.
- **Japam** (`japam/japam.json`) — mantras with round targets; routes to the counter, not a verse pager.
- **Theerth** (`theerth/temples.ts`) — the prose-per-temple shape of §26–27 / RULEBOOK §11; no verse pages. Temples carry their own `addedInVersion` for NEW tracking (§44).

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
3. **Deity card list** — vertical `ScrollView`, `spacing.xxl` side padding, `spacing.md` gap. All nine deities from `deities.ts`, in registry order.

**Background.** A `BackgroundLayer` with a **random deity sketch** — the index isn't tied to one deity, so it draws from the deity background pool (`getRandomDeityBackground`), chosen once per visit (`useMemo([])`) so it's stable while open and fresh on the next visit. This is a sanctioned variation on §6's deterministic rule, matching the image backdrop every other listing screen carries.

**Per-card data.** Item count line = the number of active, non-hidden library entries tagged with the deity ("5 texts", English-only meta). `hasNew` = any of those entries is still NEW (§44) — the deity card inherits the badge until its texts are acknowledged, mirroring the per-text chips inside its list.

### Component: Deity Card (`DeityCard.tsx`)

Wears the active LibraryCard treatment (§8): `cardActiveFrom → cardActiveTo` gradient fill, 1 px `cardActiveBorder`, `radii.lg`, raised shadow, 14 padding, horizontal layout with 12 gap:

- **Avatar**: 44×44 circle in the `cardThumbActiveFrom → cardThumbActiveTo` gradient, containing a `DeityIcon` (below); falls back to the deity's first two Devanagari characters.
- **Names** via `orderTitlesByLanguage` (dev 16/12, lat 18/11): primary in `ink`, secondary italic `ink-muted`, then the count line at 10 `ink-muted`.
- Right `›` chevron in `saffron`.
- **NEW pill** top-right when `hasNew`: `newBadgeBg` fill, `newBadgeText` text, `pill` radius, 9 pt uppercase — same geometry as §19.
- Whole card is the press target; a11y label reads name + count + "New." when badged.

### Deity Icon system (`DeityIcon.tsx`)

Each deity's avatar glyph is a compact **symbolic attribute**, not a portrait (design spec: `docs/superpowers/specs/2026-05-08-deity-icons-design.md`). Two render paths:

- **Hand-built vector glyphs** (pure `View` compositions — no SVG, per the §30 convention): Krishna's bansuri + peacock-feather plume, Hanuman's gada, Ganesha's modak, Saraswati's veena. Drawn at a 36 dp base size and transform-scaled for other sizes. These carry their own small fixed palette (a warm ink-brown + gold, plus peacock green/teal/yellow for the feather eye) — deliberate illustration colors baked into the art, not theme tokens.
- **Emoji glyphs** for the remaining keys: bow-and-arrow (rama), chakra (vishnu), trishul (shiva), lotus (durga), sun (savitr). [A pragmatic, spec-approved exception to §5's "no emoji" rule — scoped to these avatar glyphs only; the fallback for any missing/poor glyph is the deity's Devanagari initials, never a blank avatar.]

**Interactions.** Tap a card → push `DeityListScreen` for that deity (§22) — same `LibraryCard` rows, resume-sheet behaviour (§40), and NEW clearing (§44) as a category list.

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
4. **Done button** (`saffron`) closes the sheet. Picking a size does **not** auto-close, so the preview change stays visible for comparison. `readingSizeLabel(scale, lang)` is exported for the More row's state text.

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

- `types.ts` — `Routine { id, nameHi, nameEn, mode: 'daily' | 'weekday', items, createdAt }`; `RoutineItem { kind: 'section' | 'chapter' | 'japam', sourceId, chapter?, targetRounds?, weekdays? }` (weekdays 0 = Sun … 6 = Sat); `itemRunsOn` (daily = always); `routineItemKey` for completion tracking. Item granularity is a complete reciting unit, never a single verse — that's Daily Bhakti's job (§23).
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

One enrolled sankalp's card on the Today's Practice ledger (§31) — flat `parchment-soft` + `elevation.card`, `saffron` border, matching the ledger aesthetic (not the catalog's gradient). Eyebrow (`sectionLabel` via `pillTextStyle`, `saffron-deep`): `Sankalp · n / N` in every non-terminal state (or `पूर्णाहुति / Sankalp complete`). **`n` is `completedDayCount(enrollment)` — days actually offered, not `status.dayIndex`** — so completing today's day ticks it `0/N → 1/N` and it agrees with the List/Detail status pills (which already read `completedDayCount`). Using `dayIndex` (the day you are *on* = done + 1) would show `1/N` on a fresh day 1 before anything is done and stay `1/N` after completing it — the counter would never move on completion. Then the program title (`cardHindi + 3`). All state prose (waiting / done-today / completed lines) sits at **caption scale (14/21)**, not the reading-body token — at 20/34 the card read as a prose block (July 2026 review: "too verbose"). States:

- **active** — one tappable unit row per item (26 px check circle → filled `saffron` ✓ when done today; resolved title `cardHindi` on a 26 line + a `cardMeta` sub "Whole text · Tap to read"; `›` 26; rows align `flex-start` so circle and chevron pin to the title's first line). The circle's a11y label **names its item** (`Mark offered — ‹titleEn›`) so it never collides with §31's generic routine circles; tapping it commits the day. Auto-commit still fires once every unit is genuinely done today (`isItemAutoComplete`). Completing the vow plays the §31 `PracticeSeal` (पूर्णाहुति) once.
- **done-today** — a calm "Today's reading is done. Come back tomorrow" line.
- **waiting** (calendar-gated: weekday off-day / festival window not open) — the resting copy ("Your sankalp begins 11 Oct." / "Resting today — …") **plus the next selected unit as a tap-to-read preview**, so an upcoming sankalp never opens onto an empty dead end (the day is not committable until the gate opens). The preview row carries **no offering check circle** — that affordance belongs to `active` alone; a rest-day read cannot advance the vow, so the row reads as a preview ("झलक · पढ़ने के लिए टैप करें / Preview · Tap to read"), never a to-do whose empty circle would falsely promise the `n / N` counter will move.
- **completed** — the seal + a "Your N-day sankalp is complete 🙏" line.

### Data & resolver (`mobile/src/data/sadhana/`)

`types.ts` — `SadhanaProgram { id, titleHi/En, thumb, subtitleHi/En, deity?, introHi/En, cadence, day? | days? }` (uniform `day` vs per-day `days`); `SadhanaCadence` = `consecutive` | `weekday` | `festival-window`; `SadhanaEnrollment { programId, startedOn, status: 'active'|'completed'|'abandoned', completedDays, completedOn? }`. `progress.ts` `resolveSadhanaToday()` returns the `active | done-today | waiting | completed` view-status (grace-by-default: a day is "spent" only when completed; the `waiting` status carries `items` for the preview). `useSadhanaToday.ts` composes enrollment + program + panchang schedule + reading/japa progress into the per-card view-model. Backing tests: `progress.test.ts` (resolver + catalog well-formedness incl. thumb), `SankalpTodayCard.test.tsx` (waiting-preview + the days-completed eyebrow), `SadhanaCompletion.integration.test.tsx` (mounts the real `SadhanaCompletionOverlay` over the real providers and asserts a day auto-commits when reading reaches the unit's last verse-page — consecutive **and** weekday-on-eligible-day — with a negative partway case; guards the "routine completes but sankalp doesn't" class of bug). e2e: `.maestro/sadhana-sankalp-smoke.yaml` (consecutive) + `sadhana-calendar-preview-smoke.yaml` (calendar-gated preview).

**Files:** `mobile/src/screens/SadhanaProgramListScreen.tsx`, `SadhanaProgramDetailScreen.tsx`; `mobile/src/components/SankalpTodayCard.tsx`; `mobile/src/contexts/SadhanaContext.tsx`; `mobile/src/data/sadhana/{types,programs,progress,useSadhanaToday}.ts`. PRD: `docs/roadmap/prds/11-sadhana-programs.md`.

---

## 47. Feature Tour & What's New

**Purpose.** Two onboarding surfaces that answer "what's in this app?" without a manual. The **first-launch feature tour** (`FeatureTour.tsx`) is an in-context, ~22-step guided walkthrough that navigates the user through the real app, **rings the element each step describes**, and anchors a compact tooltip to it. The **What's New sheet** (`WhatsNewModal.tsx`) fires once after an update and lists only that release's new features. Both are gated by `TourContext.tsx` and mounted in `App.tsx` inside the provider stack; the tour renders as a **top-level in-tree overlay** (last child of the root view, above the navigator, mini-player and tab bar), while What's New stays a `Modal` inside `NavigationContainer`. Complements §44 (NEW badge / OTA prompt) — those mark *content*; this orients the *app*.

### First-launch tour (`mobile/src/components/FeatureTour.tsx`)

**In-context, not a slideshow.** An **in-tree** translucent overlay (absolute-fill `View`, not a native `Modal`) sits above the whole app over a `rgba(15,10,5,0.55)` ink scrim — the real screen reads through behind it. It is deliberately *not* a `Modal` for two reasons: (1) it draws a highlight ring **over** the live UI, and (2) it stays in the accessibility tree so e2e/Maestro can drive it — a `Modal` presents in a separate window that `config.yaml`'s `snapshotKeyHonorModalViews:false` reads *through*, making the tour invisible to the harness. A `Pressable` scrim swallows touches, so only the tour's own controls advance it — it stays linear. On every step change the tour dispatches `navigationRef.dispatch(CommonActions.navigate(...))` (deferred through `InteractionManager.runAfterInteractions`), so the user actually lands on the surface the copy describes.

**Measured spotlight.** Each step names an on-screen element via `targetId`, registered with `useTourTarget(id, reveal?)` in the owning screen (`components/tour/tourTargets.ts` — a module-singleton ref registry). After navigating, the tour first calls the target's optional `reveal()` — a `scrollNodeIntoView(scrollRef, targetRef)` that scrolls a below-the-fold target (the Japa/Theerth tiles, the categories grid, the reminder "+ Add" row, the japam add-alarm button) on-screen — then measures the element (`measureInWindow`) and rings it with a `saffron` highlight (2px border + soft `saffron` glow, rect inflated ~6px). Measurement is **settle-aware**: the tour re-measures across frames and always keeps the latest rect, committing only once it holds still for `MEASURE_STABLE_FRAMES` past a `MEASURE_MIN_TRIES` warm-up (or hits the `MEASURE_MAX_TRIES` cap) — `measureSettled()` in `placement.ts`, pure + unit-tested. This stops a freshly-navigated screen (whose header/content shifts for several frames, and whose muhurat card mounts a few frames late) from ringing a stale, pre-layout spot. **After the frame loop settles, a bounded low-frequency poll** (`REMEASURE_POLL_MS` × `REMEASURE_POLL_TRIES`, ~4.8s) keeps re-revealing + re-measuring: some screens hydrate their content **asynchronously** (e.g. Japam alarms load from AsyncStorage *after* the ~0.8s frame cap), and the empty-state layout looks "stable" to the frame loop — so the ring would otherwise freeze on the target's pre-hydration position (the "+ Add alarm" button ends up ringed over the alarm row that loaded in beneath it). The poll follows the target to its final spot; a `sameRect` guard makes it a no-op once nothing moves, and it is bounded because async loads resolve quickly. Steps with no stable element — the five bottom-tab overview steps, or a target that may be absent on first launch — omit `targetId` and ring the **destination tab** instead (computed from `TAB_ORDER` + default-tab-bar geometry). `placeTourCard` (`components/tour/placement.ts`, pure + unit-tested) sits the card in the band opposite the ring so it never covers it and points the arrow at it; if the element can't be measured it falls back to the step's declared `anchor`/`pointer`. This replaces the original anchor-only card, which covered ~half the screen and pointed at nothing specific. **The fit decision uses the card's real rendered height, not a fixed guess** — `FeatureTour` reports the card+arrow height via `onLayout` and feeds it back into `placeTourCard`, so a card that grows with the bilingual copy, the type scale, or a shorter device is never placed on a side too small to hold it (which previously let it cover the very element it rings). `CARD_HEIGHT_EST` only seeds the first frame before the measurement lands. When **neither** side can hold the whole card, the card pins flush to a safe-area edge with the arrow still leading back toward the target — top-pinned (arrow down) only when the whole card fits the safe viewport *and* there is more room above the target (clearing a low target), otherwise bottom-pinned (arrow up) so the card's Back/Next controls stay on-screen even for a card taller than the viewport (large type scale).

**Card spec.** `parchment-soft` fill, `divider` border, `radii.lg`, 18 padding, elevated shadow. Header (pinned to the top of the overlay, not the card): step counter `n / N` (left) + `Skip` (right), `cardLatin`, `parchment`, tracked-uppercase. The card holds a `readerTitle`-face Hindi title (20, `ink`, centred) over an italic `subtitle`-face English title (13, `ink-muted`); a `divider` hairline; then a bilingual body (`meaning` face — Hindi 14/24 `ink`, English 12/20 `ink-soft` at 0.85). Footer: a `dotRest`/`saffron` progress-dot row, then **Back** (secondary outline, `divider` border, disabled + 0.3 opacity on step 1) and **Next · आगे** / on the last step **Done · पूर्ण** (primary solid `saffron`, `onPrimary`, `radii.md`). a11y labels are constant English — `Skip tour`, `Previous step`, `Next step`, `Done` — so e2e is language-independent.

**Bilingual, always.** The tour renders Hindi (primary) **and** English (secondary) on every card and never branches on `lang`. It is a first-run welcome shown before any reading language is chosen (default `hi`), and the app's identity is Hindi-led-bilingual (§1); showing both is the welcome, not a localization bug (contrast the What's New sheet below, which *does* honour the reading language because it fires for returning users). Because it never picks hi-or-en by `lang`, it doesn't trip the gu/kn ternary hazard (wiki `concepts/languages`).

**Steps (~22), in order** (`mobile/src/data/tour/steps.ts` — each: `id`, `navigateTo`, optional `targetId`, `anchor`/`pointer` fallback, bilingual title/body). The sequence is a guided walkthrough: **(1–5) the five bottom tabs** — Home, Daily Bhakti, Panchang, Bhajan, More — each a **tab-ring** (no element target); **(6–11) Home** — routine card (`routineCard`, the docked `RoutineBanner`), categories grid (`categoriesGrid`), Japa tile (`japaTile`) → Japa inside / mantra list (`HomeTab/CategoryList{japam}`, `japamInside`), Theerth tile (`theerthTile`) → Theerth inside / temple map (`HomeTab/TheerthMap`, `theerthInside`); **(12–13) Bhakti** — Daily Verse (`dailyVerse`), Share (`shareButton`); **(14–18) Panchang** — Daily Muhurat / Choghadiya card (`muhuratCard`), the Vrat & Parv segment (`panchangSegment`), the vrat list (`PanchangTab/ObservanceList{vrat}`, `vratList`), the ★ follow affordance (`vratFollow`), My Vrat & reminders (`PanchangTab/MyVrat`, `myVrat`); **(19) Bhajan** — the library (`AudioTab`, `bhajanInside`); **(20–22) More** — Daily Reminder toggle (`MoreTab/Reminders`, `reminderToggle`), reminder times (`reminderTimes`), Japam Alarm add button (`MoreTab/JapamAlarms`, `japamAdd`). Because the overlay is non-interactive, the vrat drill (16–18) auto-navigates and *describes* the ★-follow / 🔔-reminder affordances rather than expecting a tap. A compile-time check pins every `navigateTo.name` to a real `TabParamList` tab; `TAB_ORDER` maps each to its bar index for the tab-ring fallback. `TourNavTarget` allows a nested `{ screen, params }` for `HomeTab`, `MoreTab`, and `PanchangTab` (the last widened to reach `ObservanceList`/`MyVrat`). Element targets register via `useTourTarget(id, reveal?)` in `HomeScreen`, `CategoryListScreen`, `TheerthMapScreen`, `DailyBhaktiScreen`, `PanchangScreen`, `ObservanceListScreen`, `MyVratScreen`, `AudioLibraryScreen`, and `ReminderSettingsScreen`/`JapamAlarmsScreen`.

### What's New sheet (`mobile/src/components/WhatsNewModal.tsx`)

`pageSheet` Modal, `parchment` fill. Header: title (`pick`-localized "What's New / नई सुविधाएँ / …", `titleFontByLang`, 20, `ink`) over a `vX.Y.Z` version line (`cardLatin` italic, tracked-uppercase, `ink-muted`); a `saffron` ✕ close. Body: a scroll of items, each a `saffron` bullet dot + title (17) + body (14/24, `ink-soft`). Footer: a solid-`saffron` "Got it" (localized). **Language-correct for all four:** text routes through `contentByLang(lang, hi, en)` (gu/kn re-script the Hindi) and fonts through `titleFontByLang` / `meaningToken` so gu/kn never render as tofu in a Devanagari face — this sheet fires for returning users who already have a reading language set, so it must not use a bare hi/en ternary (wiki `concepts/languages` Gotchas).

### Gating & persistence (`mobile/src/contexts/TourContext.tsx`)

Two AsyncStorage keys hold the last-seen **version string**: `@vedansh/tour-completed-v` and `@vedansh/whats-new-seen-v`. A third signal — whether any deliberate-action key from a prior session exists (`UPGRADER_SIGNAL_KEYS`, re-exported from `NewContentContext`, §44) — separates a genuine fresh install from a returning user on the debut release (both lack the tour keys). This realises "**install → full tour, update → new-features-only**".

- **Fresh install** (no prior-usage keys, tour key absent) → `shouldShowFirstLaunchTour`. Completing or skipping (`markTourCompleted`) writes **both** keys to `APP_TOUR_VERSION`, so a brand-new user is never then double-prompted with the What's New sheet.
- **Update launch** (returning user — a prior-usage key exists) → the tour is suppressed and `shouldShowWhatsNew` fires instead: a `whatsNew` entry exists for `APP_TOUR_VERSION` **and** the what's-new key ≠ `APP_TOUR_VERSION`. `markWhatsNewSeen` advances only the what's-new key (never retroactively completes the tour). This is what makes the debut version's own release notes reachable — without the install/upgrade split they never would be (a tour-completer has already "seen" this version).
- **Replay** → `resetTour()` sets an in-memory replay flag **and** clears both keys, forcing the first-launch tour regardless of install-vs-upgrade classification or a prior completion (More → "Show App Tour", §37).
- `markTourCompleted`/`markWhatsNewSeen`/`resetTour` flip in-memory state **before** the awaited AsyncStorage write (mirroring `NotificationPreferences.persistMeta`), so a self-mounting surface that hides on dismissal can't read a stale "should show" and bounce back open. The surfaces additionally edge-guard auto-open with a ref (open once per episode, keyed on the gate — never on local `visible`).
- Storage-read failure defaults to a fresh install (still orients the user); a `getAllKeys` failure defaults to "returning user" (show the lighter What's New, not the full tour, to someone who may already know the app). Write failures still flip in-memory state so the surface doesn't loop within a session.

**Content lives in `mobile/src/data/tour/whatsNew.ts`:** `APP_TOUR_VERSION` (must equal `app.json` `expo.version`), a per-version `whatsNew` map of bilingual `items`, and `getWhatsNewForVersion()` (returns null for unknown or empty entries → sheet suppressed).

**Files:** `mobile/src/components/FeatureTour.tsx`, `WhatsNewModal.tsx`; `mobile/src/components/tour/{tourTargets,placement}.ts` (spotlight registry + `reveal`/`scrollNodeIntoView` + pure card placement + `measureSettled`); `mobile/src/contexts/TourContext.tsx`; `mobile/src/data/tour/{steps,whatsNew}.ts`; the spotlight refs live in `HomeScreen`, `CategoryListScreen`, `TheerthMapScreen`, `DailyBhaktiScreen`, `PanchangScreen`, `ObservanceListScreen`, `MyVratScreen`, `AudioLibraryScreen`, `ReminderSettingsScreen`, `JapamAlarmsScreen` (and `RoutineBanner` forwards a `bannerRef`); wired in `mobile/App.tsx` (top-level overlay), replay row in `MoreScreen.tsx` (§37). Tests: `src/contexts/__tests__/TourContext.test.tsx`, `src/components/__tests__/FeatureTour.test.tsx`, `src/components/__tests__/tourPlacement.test.ts`, `src/data/__tests__/tourContent.jest.test.ts`; e2e `.maestro/feature-tour-e2e.yaml` (+ `_launch.yaml` dismisses the auto-tour for every other flow).
