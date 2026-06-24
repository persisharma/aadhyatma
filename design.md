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

**Home gradient** (top → bottom): `#F6ECD0` → `#F1E3BF`, with a soft radial saffron glow (`rgba(184, 98, 27, 0.14)`) behind the crest.

**Reader overlay** (on top of background image): vertical gradient
`rgba(243,231,201,0.85)` → `rgba(243,231,201,0.55)` → `rgba(243,231,201,0.75)` → `rgba(233,217,177,0.95)`.

**Background image filters:** `opacity: 0.52`, `sepia(0.35) saturate(0.85) brightness(1.02)`.

---

## 3. Typography

Two typefaces, four roles.

| Typeface | Usage |
| --- | --- |
| **Noto Serif Devanagari** | All Devanagari: titles, verses, meaning body, card names. Weights 400/500/600/700. |
| **Cormorant Garamond** | Latin subtitles, page counters, swipe hints, italic labels. Weights 400/500 for body prose, **600 non-italic** for transliteration and Latin chapter numbers, 600 italic for section labels. Italic is reserved for labels and short flourishes; long prose is always roman (non-italic) to keep English paragraphs readable over the faded parchment bg. |
| **Inter** | Only for tiny UI chrome (uppercase section labels, status bar) where Devanagari is not used. 500/600. |

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

**This whole section does NOT apply to:**

- Chapter titles' English subtitles (e.g., `Bhagavad Gītā`, `Arjuna's Dilemma`)
- Verse-pill subtitles (e.g., `Chapter 1`, `Opening`, `Closing`)
- Library-card English names (e.g., `Hanuman Chalisa`, `Sundarkand`)
- UI chrome — counts (`47 verses`), hints (`← swipe →`), labels (`Meaning`, `Commentary`)
- **Theerth prose.** `significanceHi/En` and `originStoryHi/En` on each `TheerthTemple` are independent prose translations, not romanizations of the same verse line. Temple names (`Somnath`, `Kashi Vishwanath`) use popular English spellings, not IAST.

These remain in everyday English. A handful of common Sanskrit terms keep their conventional spelling outside verse-lines (`Gītā`, `kāṇḍa`) — the diacritic-or-not call belongs to the editorial team, not this rule.

**Rendering layout** is module-specific:

- **Gita pattern (always-show-both):** Devanagari and IAST render side-by-side on every reader page; the language toggle only flips meaning/commentary. See §9.
- **Sundarkand / Hanuman Chalisa pattern (swap-on-toggle):** the toggle swaps Devanagari ↔ romanization in place, so only one script is visible at a time. See §9 / §10. Sanskrit shlokas inside these texts swap to IAST; Awadhi chaupais swap to pronunciation-based ASCII.

### Type scale

This table is the **single source of truth** for reading-content sizing, implemented in `mobile/src/theme/typography.ts`. Every reader section and every surface that shows verse / transliteration / meaning / commentary consumes these tokens — **no hardcoded `fontSize`/`lineHeight` on reading content**, no per-section scale. Both languages render the meaning at the same size, and the verse sits above the meaning. See `RULEBOOK.md` §3 ("One reading type scale") and `readerTypeScale.test.tsx`.

| Role | Typeface | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Screen title (`सनातन`) | Noto Serif Devanagari | 34 | 600 | Letter-spacing `0.01em` |
| Reader top-bar title | Noto Serif Devanagari | 16 | 600 | |
| Verse body (Devanagari) | Noto Serif Devanagari | 23 | 500 | Line-height 1.7 |
| Transliteration (Latin IAST) | Cormorant Garamond | 24 | 600 | `ink`, line-height 35. Sits one step above the meaning (20) so the verse stays dominant — mirrors the Devanagari verse↔meaning hierarchy. Cormorant's small x-height reads smaller than Devanagari, so it takes a few extra points; bumped 17 → 20 → 24. |
| Meaning body (Hindi) | Noto Serif Devanagari | 20 | 500 | `ink-soft`, line-height 34 (≈1.7). Bumped 15 → 20 to match the English meaning size, so both languages read at one meaning scale. |
| Meaning body (English) | Cormorant Garamond | 20 | 500 medium non-italic | `ink`, line-height 33. Italic 400 was previously used and rejected as too thin over the parchment bg; medium-weight roman is the shipping spec. Bumped from 18 → 20: Cormorant's small x-height read too small against the Devanagari meaning body. |
| Commentary body (Hindi) | Noto Serif Devanagari | 15 | 400 | `ink-soft`, line-height 1.7. Paragraph gap `14`. |
| Commentary body (English) | Cormorant Garamond | 20 | 500 medium non-italic | `ink`, line-height 33. Paragraph gap `14`. Bumped from 18 → 20 alongside the English meaning body. |
| Commentary fallback note | Cormorant Garamond | 14 | 400 italic | `ink-muted`, centred. Shown when the selected language has no commentary for this verse but the other language does (e.g., Gita Chapter 1 has only ~20 % English commentary coverage in the published source). |
| Card name (primary language) | Noto Serif Devanagari (hi) / Cormorant Garamond (en) | 14–22 | 600 semibold upright (hi) / **700 bold** upright + `0.3` tracking (en) | Prominent top line on catalog, category, deity, and resume-sheet titles. The **active reading language** takes this slot — Devanagari-first by default (`'hi'`), English-first when the toggle is `'en'`. **Weight follows the slot, not the script.** The two scripts carry different *optical* weight at the same point size (Devanagari reads dark/dense, Cormorant reads light), so the English primary uses the heavier Bold face **and** is sized a step larger than the Devanagari primary at each call site (e.g. CategoryCard `latPrimary 17` vs `devPrimary 15`; LibraryCard `19` vs `17`) — otherwise an English-primary title reads as a peer of its demoted Hindi line. Ordering/weight/tracking is centralised in `orderTitlesByLanguage()`; per-script optical sizes are passed by each caller. |
| Card name (secondary language) | Cormorant Garamond italic (en) / Noto Serif Devanagari (hi) | 11–13 | 400 italic (en) / 500 medium (hi) | `ink-muted` lighter supporting line below the primary title — the language *not* selected. Sized ~2–5 pt below the primary and demoted to `ink-muted` (not `ink-soft`) across **all** call sites so it reads as a caption, not a peer. |
| Chapter card title (Hindi) | Noto Serif Devanagari | 17 | 600 | Gita Chapters Index. |
| Chapter card title (English) | Cormorant Garamond | 16 | 400 italic | Gita Chapters Index when language toggle = English. |
| Chapter tag (`अध्याय N` / `CHAPTER N`) | Inter | 10 | 600 | `0.3em` tracking, uppercase, `saffron-deep`. |
| Language toggle (Hindi half) | Noto Serif Devanagari | 15 | 600 | Active: `saffron-deep`; inactive: `ink-muted`. |
| Language toggle (English half) | Cormorant Garamond | 14 | 400 italic | Active: `saffron-deep`; inactive: `ink-muted`. |
| Page counter (e.g., `1 / 47`) | Cormorant Garamond | 14 | 400 italic | Lining figures |
| Section label (`LIBRARY`) | Inter | 11 | 600 | `0.22em` tracking, uppercase |
| Verse-type pill (`दोहा`, `चौपाई · 9`, `श्लोक · 1.1`) | Inter | 10 | 600 | `0.3em` tracking, uppercase, saffron on tinted bg. |
| Meaning / Commentary label (`अर्थ · Meaning`, `व्याख्या · Commentary`) | Cormorant Garamond | 13 | 600 italic | `0.14em` tracking, uppercase, `saffron-deep`. The two tokens flip order with the language toggle: `अर्थ · Meaning` when lang = hi, `Meaning · अर्थ` when lang = en. |
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
- **Back chevron.** `‹` inside a 34px circle with `parchment-soft` fill and `divider` border.
- **Forward chevron.** Single `›` in saffron on active cards.
- **Pager dots.** 6px circles, `rgba(138,62,11,0.25)` resting. Current page dot: saffron-deep, width 18, radius 999 (pill).
- **No emoji. No photos.** Only hand-drawn faded sketches as backgrounds.

---

## 6. Background Image System

Three faded vintage sketches live in `/images/`:

1. `Hanuman_sita.png`
2. `Ram_hanuman.png`
3. `hanuman_lankadahan.png`

### Rotation rule

- Each reader page picks **one** of the three backgrounds.
- Selection is **deterministic per verse id**, not re-rolled on every render. Use a simple hash (e.g., `verse.number % 3`) so a given verse always shows the same image — this keeps the feeling stable as the user swipes back and forth.
- Apply the image as a `cover`-sized background. Then stack the parchment overlay (Section 2) on top. Then the content.

**Exception — Theerth.** Theerth detail screens **pin one background per temple** (see §26). The temple's identity is the image; backgrounds are not interchangeable across temples. The map screen itself uses no background image — only the parchment base with the stylised India SVG outline.

### Adding more modules

When Ramcharitmanas / Gita modules are added, new faded sketches should follow the same treatment: warm parchment tone, ~50% opacity after sepia, subject centered or top-anchored so the bottom third of the image stays clean for the meaning block.

---

## 7. Screen: Home / Index

**Purpose.** Surface the available sacred texts. One scroll, no tabs.

**Structure (top to bottom):**

1. Status bar area (44px safe region).
2. Hero block (28px top padding):
   - Crest (Section 5)
   - Title `सनातन` (34 / Noto Serif Devanagari 600)
   - Subtitle `Sacred Texts · Daily Reading` (Cormorant Garamond italic 15, `ink-muted`)
3. Section label `LIBRARY` (Inter 11, uppercase, `ink-muted`, 0.22em tracking).
4. Library list of **cards**. See Section 8 for card spec. **Active modules come before `coming` modules** so the reader sees what they can read right now first; within each group the order is curated (currently Hanuman Chalisa → Bhagavad Gītā → Ramcharitmanas → Sundarkand).
5. Footer mantra, absolute-positioned 28px from bottom: `॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥` — Noto Serif Devanagari 28, 55% opacity.

**Gradient background.** See Section 2.

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
4. Content column (scrollable for Gita — verses may exceed screen height — fixed for Chalisa).

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** (14/22 padding):
   - Back button — returns to the previous surface (Home for Chalisa; Chapters Index for Gita — one level up in the stack, not always Home).
   - Title. Chalisa: `हनुमान चालीसा`. Gita: `अध्याय N · <titleHi>` (Hindi mode) or `Chapter N · <titleEn>` (English mode).
   - Progress counter (`1 / 47`, Cormorant Garamond italic). Counter is **chapter-scoped** for Gita (resets per chapter), **document-scoped** for Chalisa.
3. **Verse area** (flex-1, 28px horizontal padding):
   - Verse-type pill — vocabulary is consistent across modules: `दोहा · Opening` / `चौपाई · N` / `समापन दोहा · Closing` / `श्लोक · N.M` / future `मंत्र` etc. Always uppercase Inter 10 @ 0.3em, saffron-deep on saffron-tint.
   - Verse lines in Devanagari (23 / 1.7, Noto Serif Devanagari 500). Each line on its own row; preserve the original line breaks from the JSON.
   - Transliteration block (Gita only): Latin IAST lines in Cormorant Garamond 24 / 35, **600**, `ink`. Always rendered regardless of the language toggle — transliteration is a phonetic bridge, not a translation.
   - Ornament divider (Section 5).
   - **Meaning** section:
     - Label `अर्थ · Meaning` (Cormorant Garamond 13 600 italic, `saffron-deep`, `0.14em` tracking, centred). Token order flips by selected language: `Meaning · अर्थ` when lang = en.
     - Body: Hindi at 15 / 1.7 Noto Serif Devanagari 400 `ink-soft`; English at 18 / 30 Cormorant Garamond 500 medium non-italic `ink`. Only one language renders at a time based on the Gita language toggle (Section 16); Chalisa renders Hindi only.
   - Ornament divider (Gita only — separates Meaning from Commentary).
   - **Commentary** section (Gita only):
     - Label `व्याख्या · Commentary` (same style as Meaning label).
     - Body: array of paragraphs, 14 px gap between paragraphs. Typography matches Meaning body for the selected language.
     - **Empty-commentary fallback.** If the selected language has no commentary for this verse but the other language does, hide the paragraph body and render a single italic line instead: `Extended commentary is available in Hindi only for this verse.` (or Hindi analogue) — Cormorant Garamond 14 italic, `ink-muted`, centred. This is how the reader handles the sparse English-commentary coverage in Chapter 1 of the Gita source.
     - If **both** languages are empty the whole Commentary block (including ornament + label) is hidden entirely.
4. **Bottom bar** (16/28 padding): pager dots on the left · swipe hint (`← swipe →`, italic 12, `ink-muted`) on the right. Dots bucket the chapter into 5 segments for Gita (so a 78-verse chapter still fits one dot track); Chalisa uses its document-scoped bucketing.

**Interaction.**

- Horizontal swipe (pager). Left-edge swipe from first page or right-edge from last page should bounce, not dismiss.
- Language toggle: rendered on **every reader page** (Section 16) for all bilingual modules — Gita, Sundarkand, Hanuman Chalisa. Sections that have a subsection listing (e.g., Gita's Chapters Index, Section 15) ALSO surface the toggle there. Both surfaces share state via `useGitaLanguage()` — same control, two screens, one source of truth.
- Tap-hold on the verse (future): audio playback hook — leave structural space now, don't ship until audio lands.
- Back button or gesture returns one level up.

**Progress counter.**

- Chalisa: total = opening dohas + chaupais + closing dohas (`2 + 40 + 1 = 43`). Counter shows `currentIndex + 1 / total`.
- Gita: total = chapter verse count (e.g., `47` for Chapter 1). Counter shows `currentIndex + 1 / chapterVerseCount`. Switching chapters resets the counter.

---

## 10. Content Model

Each module normalises its source into a typed, module-specific shape. Shapes stay separate so one module's reader never has to know another module's vocabulary (Chalisa doesn't know `'shloka'`; Gita doesn't know `'chaupai'`). A shared reader may be introduced later via a broader union — until then, keep types module-local.

### Chalisa (linear, single-text)

Source: `HanumanChalisa/hanuman-chalisa.hi.json`. Hand-curated.

```ts
type Verse = {
  id: string;              // e.g. "opening-doha-1", "chaupai-09", "closing-doha"
  type: 'doha' | 'chaupai';
  label: string;           // e.g. "दोहा 1", "चौपाई 9", "समापन दोहा"
  section: 'opening' | 'body' | 'closing';
  number?: number;         // present for numbered verses
  lines: string[];         // raw Devanagari lines, in order
  meaning: string;         // Hindi prose
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

The Gita section carries a single in-memory language preference (`'hi' | 'en'`) exposed via a React context (`useGitaLanguage()`). Default `'hi'`. The same hook is also reused by Sundarkand and Hanuman Chalisa — there is no per-section context — so the language preference is shared across modules within a session. The toggle is rendered both on subsection listings (Chapters Index, Section 15) and on every reader page (Section 9). Preference is **session-only** in v1 — no `AsyncStorage` persistence. For Gita, Sanskrit and transliteration always render regardless of the current language; only meaning + commentary honour the toggle. For Sundarkand and Hanuman Chalisa, the toggle swaps the verse lines between Devanagari (`lines[]`) and IAST (`linesEn[]`).

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
- Support Dynamic Type: scale verse body from 23 up to ~30 while keeping line-height 1.7. Meaning scales accordingly.
- Devanagari must use the system's user-chosen font-scale, not a fixed point size.
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
5. Add a Chapters Index screen (Section 15) with a Language Toggle (Section 16) and a list of chapter cards. Render the same Language Toggle on every reader page too — same control, two surfaces, shared state.
6. Build a Reader screen that scopes the pager to a single chapter (one verse per page, chapter-scoped counter).
7. Add 1–3 faded sketches to `mobile/assets/<module>/` — for v1 a single image covering all verses is acceptable if sourcing more is a separate ticket.
8. Flip the Home card from `coming` to `active`. Active modules sort above `coming` ones in the library list.

**Shared rules for any module:**

- Keep the pill vocabulary consistent: `दोहा`, `चौपाई`, `श्लोक`, `मंत्र`, etc., always paired with a Latin subtitle or chapter.verse number.
- Never hard-code colours, spacings, or font names in a component — always pull from the theme.
- If a token is missing, add it to `colors.ts` / `typography.ts` / `spacing.ts` first, then update this doc, then use it.
- For bilingual prose (meaning, commentary): Cormorant Garamond 18 / 30 500 medium **non-italic** `ink` is the English body standard. Italic is reserved for labels, fallback notes, and short flourishes.
- **Romanization.** Pick the style that matches the source language per §3.1: IAST + Hunterian digraphs for Sanskrit verses (Gita, embedded shlokas); pronunciation-based ASCII for Awadhi/Hindi verses (Tulsidas chaupais and dohas). Don't impose IAST on Awadhi — the diacritics misrepresent recitation.
- **Language toggle.** Reuse `useGitaLanguage()`. Render the toggle on every reader page; for sections with a subsection listing (e.g., Gita's Chapters Index), render it there too. State is shared.

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
- `mobile/src/data/sundarkand/sundarkand.json` — 343 verses across 5 verse types (shloka, doha, chaupai, sortha, chhand).
- `mobile/src/data/hanuman-chalisa/hanuman-chalisa.json` — 43 verses (2 opening dohas + 40 chaupais + 1 closing doha).

**Assets:**
- `images/*.png` — Hanuman parchment sketches (consumed in `mobile/assets/chalisa/`).
- `mobile/assets/chalisa/*` — Chalisa backgrounds + typed `index.ts` export.
- `mobile/assets/gita/*` — Gita backgrounds (v1: `krishna_arjuna_vishvarupa.png` is the single sketch covering all verses) + typed `index.ts` export.

**Theme + state:**
- `mobile/src/theme/colors.ts` / `typography.ts` / `spacing.ts` — source of tokens in Section 2–4.
- `mobile/src/theme/ThemeContext.tsx` — single source of runtime tokens.
- `mobile/src/data/gita/language.tsx` — Gita language context + `useGitaLanguage()` hook.

**Components:**
- `mobile/src/components/LibraryCard.tsx` — Home library entry (Section 8).
- `mobile/src/components/GitaChapterCard.tsx` — Chapters Index entry (Section 15).
- `mobile/src/components/LanguageToggle.tsx` — the hi/en segmented pill (Section 16).
- `mobile/src/components/VersePage.tsx` — Hanuman Chalisa reader page body.
- `mobile/src/components/GitaVersePage.tsx` — Gita reader page body (always-show-both layout).
- `mobile/src/components/SundarkandVersePage.tsx` — Sundarkand reader page body.
- `mobile/src/components/Ornament.tsx` — the `॥` verse divider (Section 5).

**Screens:**
- `mobile/src/screens/HomeScreen.tsx` — Home (Section 7).
- `mobile/src/screens/ChalisaReaderScreen.tsx` — Chalisa Reader.
- `mobile/src/screens/SundarkandReaderScreen.tsx` — Sundarkand Reader.
- `mobile/src/screens/GitaChaptersIndexScreen.tsx` — Gita Chapters Index (Section 15).
- `mobile/src/screens/GitaReaderScreen.tsx` — Gita Reader (chapter-scoped pager).

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
- Tap → Reader at verse 1 of that chapter.

**Ordering.** Chapters appear in numerical order 1–18. No sorting.

---

## 16. Component: Language Toggle

**Purpose.** Single source of truth for the Gita module's bilingual read mode. Used on the Chapters Index (Section 15). Reader (Section 9) consumes its value but does not render the control inline in v1.

**Shape.** Segmented pill with two halves. The active half tinted with `saffron-tint` and typed in `saffron-deep`; the inactive half transparent and typed in `ink-muted`. Pressed (inactive side) drops opacity to 0.7.

```
┌─────────────── pill radius ───────────────┐
│ [ हिन्दी ]  │  [ English ]                │
└──────────────────────────────────────────┘
```

- Container: `parchment-soft` background, `divider` border 1 px, `pill` radius, 3 px inner padding.
- Each half: `minWidth 96`, `paddingVertical 7`, `paddingHorizontal 22`, centered.
- Hindi half label: Noto Serif Devanagari 15 600.
- English half label: Cormorant Garamond 14 400 italic.

**Behaviour.**

- Tapping either half sets `lang` to that value via the `useGitaLanguage()` hook.
- Accessibility: `accessibilityRole="radiogroup"` on the container, `accessibilityRole="radio"` + `accessibilityState={{ selected }}` on each half.
- 8 px `hitSlop` on each half so the tap target meets the 44×44 minimum even though the visual hits ~36 px.

**State scope.** In-memory, per-session. No persistence in v1 — document on-boarding flows may re-nudge the user's language on first launch in a later iteration.

---

## 17. Bottom Tab Bar

**Purpose.** Persistent navigation chrome providing access to Home (catalog), Daily Bhakti (random verse), and Bookmarks (saved verses). Replaces the previous one-scroll-no-tabs Home.

**Spec:**

- Position: fixed bottom, above safe area inset
- Background: `parchment-soft` with 1px `divider` border on top edge
- Height: 56px (content) + safe area bottom inset
- 3 tabs, equally distributed:
  - गृह (Home) — active: `saffron` text + 4px dot above label; inactive: `ink-muted`
  - भक्ति (Daily Bhakti) — same active/inactive pattern
  - संग्रह (Bookmarks) — same active/inactive pattern
- Tab labels: Noto Serif Devanagari 11 500
- Active indicator: 4px circle, `saffron`, centered 4px above label
- No icons — Devanagari labels only (consistent with the app's glyph-based aesthetic)
- Tap targets: full tab width × full bar height (well above 44×44 minimum)
- The tab bar is hidden when inside reader screens (full-screen immersive reading)

---

## 18. Screen: Home (Revised)

**Purpose.** Surface available content organized by category type and deity. Replaces the flat LIBRARY list from Section 7.

**Structure (top to bottom):**

1. Status bar area (safe region)
2. Hero block: the **Home wordmark lockup** (Section 5) — `ॐ वेदांश़ ॐ` on one row over the "Sacred Texts · Daily Reading" tagline. (Earlier revisions stacked a crest above a 34px title; the lockup is the compact replacement.)
2a. Section label "DISCOVER" + **Feature Spotlight carousel** (§32) — a full-bleed horizontal row of `FeatureCard`s surfacing the app's cross-cutting sections (Daily Practice, Daily Verse, Panchang, Pilgrimage).
3. Section label "CATEGORIES" (Inter 11, uppercase, ink-muted, 0.22em tracking)
4. **Category grid** (2-column FlatList, numColumns=2):
   - 6 tiles: ग्रन्थ, स्तोत्रम्, चालीसा, आरती, भजन, वेद
   - Gap: 12px between tiles, 28px side padding
   - Active tiles: gradient `#FFF5E0 → #F5DEAC`, saffron border (0.4 opacity), shadow md, radius 18
   - Coming-soon tiles: flat `rgba(255, 250, 235, 0.72)`, divider border, shadow sm, 55% opacity, "SOON" badge
   - Tile content: large centered Devanagari glyph (Noto Serif 28 600, saffron-deep), Hindi name below (Noto Serif 15 600, ink), English name (Cormorant 12 400 italic, ink-muted)
   - Tile height: auto-sized to content, minimum 110px
5. Section heading "देवता · By Deity" (Noto Serif 14 600 `ink` + Cormorant 13 400 italic `ink-muted`, left-aligned with side padding)
6. **Deity scroll row** (horizontal ScrollView, 12px gap, 28px side padding):
   - 6 deity chips: श्री राम, श्री कृष्ण, श्री शिव, श्री हनुमान, माँ दुर्गा, श्री गणेश
   - Each chip: 48px circle (gradient `#F8D291 → #E0A255`) with white Devanagari glyph (Noto Serif 18 600), deity name below (Noto Serif 11 500, ink-soft), 8px gap between circle and label
   - Tapping → pushes DeityList screen (filtered items)
7. Footer mantra (same as Section 7)

**Gradient background:** same as Section 2 Home gradient.

Note: The Help floating button and modal remain as before.

---

## 19. Component: Category Card

**Purpose.** Grid tile representing a content category on the Home screen.

Two variants: `active` (has content) and `coming` (placeholder).

**Active:**

- Background: linear-gradient `#FFF5E0 → #F5DEAC` (same gradient as library card)
- Border: 1px `rgba(184, 98, 27, 0.4)`
- Shadow: `md`
- Radius: 18
- Layout (vertical, centered):
  - Glyph: Noto Serif Devanagari 28 600, `saffron-deep`, centered. Represents the category (ग्र, स्तो, चा)
  - Primary / secondary names follow the active reading language via `orderTitlesByLanguage()` (see §3 "Card name"). Defaults shown below are the Hindi-primary case; English-primary swaps the slots and applies the optical compensation (Cormorant 700 @ 17 + tracking on top, demoted Hindi 12 `ink-muted` below).
  - Name (primary, hi default): Noto Serif Devanagari 15 600, `ink`, 6px below glyph
  - Name (secondary, en default): Cormorant Garamond 12 400 italic, `ink-muted`, 2px below the primary
- Padding: 20px vertical, 12px horizontal
- Tap → pushes CategoryList screen

**Coming:**

- Background: `rgba(255, 250, 235, 0.72)` flat
- Border: 1px `divider`
- Shadow: `sm`
- Content at 55% opacity
- "SOON" pill badge: top-right corner, 4px inset. Inter 9, uppercase, 0.18em tracking, `rgba(166,124,52,0.14)` fill, `gold` text
- Tap disabled (no navigation)

**New content (active tiles & library cards):**

- Recently-added content (new since the user's last update) shows a `NEW` pill badge: top-right corner, same geometry as `SOON`. `newBadgeBg` fill (saffron tint) + `newBadgeText` (saffron-deep). Saffron — the primary/active accent — marks it as live & fresh, distinct from the muted gold `SOON`. The chip clears once the user opens that content. Carries the "NEW" text cue (never color-only, per §10 accessibility).

---

## 20. Component: Deity Chip

**Purpose.** Circular avatar + label representing a deity for cross-reference navigation.

- Circle: 48×48, gradient `#F8D291 → #E0A255`
- Glyph inside circle: Noto Serif Devanagari 18 600, `parchment-soft` (white-ish)
- Label below: Noto Serif Devanagari 11 500, `ink-soft`, centered, max 2 lines, 8px below circle
- Tap → pushes DeityList screen filtered by this deity
- Hit slop: 8px all sides

---

## 21. Screen: Category List

**Purpose.** Shows all items belonging to a specific category type. Reached by tapping a category tile on Home.

**Structure:**

1. Status bar
2. Top bar: back button (‹ in 34px circle) + title "ग्रन्थ · Sacred Books" (Noto Serif 16 600 for Hindi + Cormorant 14 400 italic for English, separated by `·`)
3. Item list: renders `LibraryCard` (Section 8) for each item in the category, 12px gap, 28px side padding
4. Items sorted: active first, then coming-soon

Same parchment gradient background as Home.

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
     - Source pill: Inter 10 600, 0.3em tracking, saffron-deep on `rgba(184, 98, 27, 0.08)` bg, radius 999. Shows "भगवद् गीता · 2.47" format.
     - Verse text: Noto Serif 21 500, `ink`, line-height 1.7. 16px below pill.
     - Ornament divider (Section 5 `॥` style). 16px vertical margin.
     - Meaning label: "अर्थ · Meaning" (same style as Section 9)
     - Meaning body: Noto Serif 14 400, `ink-soft`, line-height 1.7
4. Refresh button (centered, 20px below card):
   - Circle: 40px, `saffron` background, `parchment-soft` "↻" glyph (16px)
   - Shadow: sm
   - Tap picks a new random verse
5. Source attribution (centered, 8px below button): Cormorant 12 400 italic, ink-muted. "From भगवद् गीता"

**Gradient background:** same as Home.

**Verse pool:** configurable source categories (default: `['granth', 'stotram']`). Pool is a flat index of all verses from active items in those categories. Selection: `Math.random()` on each tab visit.

---

## 24. Screen: Bookmarks

**Purpose.** Displays user-saved verses for quick re-access. Persisted locally via AsyncStorage.

**Structure:**

1. Status bar
2. Title area (centered): "संग्रह" (Noto Serif 20 600, ink) + "Saved Verses" (Cormorant 14 400 italic, ink-muted)
3. **Bookmark list** (28px side padding, 12px gap):
   - Each card:
     - Background: `parchment-soft`
     - Border: 1px `divider`
     - Shadow: sm
     - Radius: 14
     - Padding: 16px
     - Layout (horizontal): verse info (flex-1) + bookmark icon + chevron
     - Verse-type pill (same style as reader pills): e.g. "चौपाई · 9"
     - Preview text: first line of verse, Noto Serif 15 500, `ink`, numberOfLines=1
     - Source: Cormorant 12 400 italic, `ink-muted`, e.g. "हनुमान चालीसा"
     - Bookmark icon: filled, `saffron`, 16px
     - Chevron: `›`, `saffron`, right-aligned
   - Tap → navigates to that verse in its reader
4. **Empty state** (when no bookmarks):
   - Centered vertically
   - `॥` ornament (32px, ink-muted, 40% opacity)
   - Text: "अभी तक कोई श्लोक सहेजा नहीं" (Noto Serif 15 500, ink-muted, centered)
   - Subtext: "No verses saved yet" (Cormorant 14 400 italic, ink-muted)
   - Hint: "Tap the bookmark icon while reading" (Cormorant 12 400 italic, ink-muted, 40% opacity)

**Gradient background:** same as Home.

---

## 25. Component: Bookmark Button

**Purpose.** Toggle button on reader screens allowing users to save/unsave the current verse.

- Position: top bar area of reader screens, right-aligned (after the page counter)
- Shape: 34×34 circle, `parchment-soft` fill, `divider` border
- Icon: bookmark outline (unfilled) when not saved; filled `saffron` when saved
- Icon rendered as text: "◇" (outline) / "◆" (filled) in saffron, 16px. Or use a simple flag/ribbon shape via SVG path.
- Tap: toggles bookmark state via BookmarksContext
- Animation: light scale pulse (1.0 → 1.15 → 1.0, 200ms) on save
- Haptic: `Haptics.ImpactFeedbackStyle.Light` on toggle
- Hit slop: 12px all sides

---

## 26. Screen: Theerth Map (तीर्थ)

**Purpose.** Map-driven entry surface for the Theerth (pilgrimage) category. Tapping the Theerth category tile on Home pushes this screen. Full proposal in `docs/roadmap/prds/07-temple-tour.md`.

**Layer stack:**

1. Parchment base colour (no faded sketch background — the map IS the visual).
2. `<IndiaMap>` SVG (Section 28) occupying the upper ~60 % of the screen.
3. Temple pins (Section 29) overlaid on the map, positioned by lat/lng → x/y projection.
4. Below the map: segmented toggle (`मानचित्र · Map` / `राज्य · By State`), then either the intro paragraph (map view) or the grouped state list (state view).

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** (14/22 padding):
   - Back button (returns to Home).
   - Title centred: `तीर्थ` (Hindi mode) / `Theerth` (English mode), reader-title style. Title swaps on language — never stacks per RULEBOOK §3.
   - Right-side spacer to keep title centred.
3. **Language toggle row** (8 top / 16 bottom padding, centred). Same `LanguageToggle` component as §16. State shared via `useGitaLanguage()` — do not fork.
4. **View toggle** (segmented control, parchment-soft fill, divider border, pill radius):
   - Two halves: `मानचित्र · Map` (active by default) and `राज्य · By State`.
   - Hindi half: Noto Serif Devanagari 13 600. English half: Cormorant Garamond 13 400 italic.
   - Active half tinted `saffron-tint` with `saffron-deep` text; inactive transparent with `ink-muted`.
5. **Map view** (when toggle = Map):
   - `<IndiaMap>` SVG, fixed aspect ratio ~1:1.2 (India is roughly square-ish with a tail), centred horizontally.
   - Pins overlaid via the `pins` prop.
   - Below the map: `Theerth.introHi/En` prose (Noto Serif 15 400 `ink-soft` for Hindi; Cormorant Garamond 18 500 `ink` for English), 24 px side padding, 12 px paragraph gap.
   - Below the intro: a single italic line — `Tap a pin to read the temple's story` / `पिन छूकर मंदिर की कथा पढ़ें` — Cormorant Garamond 12 italic, `ink-muted`, centred.
6. **State view** (when toggle = By State):
   - Vertical scroll list grouped by state.
   - State header: `गुजरात · Gujarat` — Inter 11 600 `0.22em` uppercase, `ink-muted`, 16 px top padding, 8 px bottom.
   - Temple card under each header: `[ thumb (deity glyph) ]  [ temple-name (lang-swapped) · city ]  [ › ]`. Same dimensions as `LibraryCard` (§8) but the meta line is `city, state` instead of `verse count`.
   - State ordering: alphabetic by Devanagari sort key. Within a state, temples alphabetic by `nameHi`.

**Interactions:**

- Tap pin → push `TheerthDetail` for that temple.
- Long-press pin → small label tooltip with temple name (Devanagari/English by language toggle). Auto-dismisses on release.
- Tap state-list row → push `TheerthDetail` for that temple.
- View toggle persists in component state (NOT navigation state) so back from detail returns to the same view.

**Gradient background:** same as Home (§2 Home gradient).

---

## 27. Screen: Theerth Detail

**Purpose.** Per-temple narrative screen. Reached by tapping a pin on the Map view (§26) or a row in the State list view.

**Layer stack:**

1. Parchment base.
2. Per-temple faded sketch background (`TheerthTemple.background`), pinned 1:1 to this temple — not interchangeable per §6 exception.
3. Parchment gradient overlay (§2).
4. Vertical-scroll content column.

**Structure (top to bottom):**

1. Status bar.
2. **Top bar** (14/22 padding):
   - Back button — returns to `TheerthMapScreen` preserving its toggle state.
   - Title centred: temple name, lang-swapped (`सोमनाथ` / `Somnath`).
   - Spacer.
3. **Hero block** (28 px side padding, 24 px top, 16 px bottom):
   - Temple name in large title type: Noto Serif Devanagari 28 600 `ink` (Hindi) / Cormorant Garamond 24 600 italic `ink` (English). Centred.
   - Subtitle line: `<city>, <state>` (lang-swapped), Cormorant Garamond 14 400 italic `ink-muted`, centred, 4 px below name.
   - Deity badge: a small pill (`saffron-tint` fill, `pill` radius, `saffron-deep` text, Inter 10 600 uppercase `0.3em`) reading e.g. `शिव · SHIVA` or the form name from `deityFormHi/En` if present.
4. Ornament divider (`॥`, §5).
5. **Significance section:**
   - Label: `महिमा · Significance` (`Significance · महिमा` when lang = en) — Cormorant Garamond 13 600 italic, `saffron-deep`, `0.14em` tracking, uppercase, centred. Same treatment as the `अर्थ · Meaning` label.
   - Body: array of paragraphs from `significanceHi[]` or `significanceEn[]`, 14 px paragraph gap. Hindi 15/26 Noto Serif `ink-soft`; English 18/30 Cormorant Garamond 500 medium non-italic `ink`.
6. Ornament divider.
7. **Origin Story section:**
   - Label: `उद्भव कथा · Origin Story` (`Origin Story · उद्भव कथा` when lang = en). Same style as Significance label.
   - Body: array of paragraphs from `originStoryHi[]` or `originStoryEn[]`, same typography rules.
8. **Sources footer** (24 px top padding):
   - One-line attribution: `Sources: <title 1>; <title 2>` — Cormorant Garamond 12 400 italic, `ink-muted`, centred.
   - URLs are NOT links in v1 (rendered as plain text). v2 may make them tappable.
9. **Bottom bar:** language toggle (per RULEBOOK §3 — every reader/detail page renders it).

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

**Performance:** paths are static committed constants (~35 KB total). No runtime simplification, no GeoJSON parsing, no map provider, no API key. Render cost is dominated by the pin count (~44 today, scales to ~50 before considering canvas).

---

## 29. Component: Theerth Pin

**Purpose.** The individual pin glyph rendered on `<IndiaMap>`.

**Visual:**

- Glyph: `॥` in `saffron-deep`, Noto Serif Devanagari, 18 px (slightly larger than ornament dividers to read as an interactive element).
- No background circle / no shape underlay — the glyph itself is the pin. This keeps the map quiet.
- Tap-hold tooltip: small parchment-soft rectangle, `divider` border, 8 px padding, label in Noto Serif Devanagari 13 600 / Cormorant Garamond 13 400 italic (lang-swapped). Tooltip appears above the pin (or below if too close to top edge).

**Interaction:**

- Tap target: 44×44 invisible hit area via `hitSlop`, even though the visible glyph is ~18 px.
- Tap → calls `onPress(id)`.
- Long-press (300 ms threshold) → shows tooltip; tooltip auto-dismisses on release.
- Haptic on tap: `Haptics.ImpactFeedbackStyle.Light`.

## 30. Component: Routine Banner & Completion Celebration

**Purpose.** A docked banner pinned just above the tab bar on Home and Daily Bhakti, surfacing today's नित्य साधना (daily routine). `RoutineBanner.tsx` + `routineBannerView.ts` (pure state logic).

**Docking.** `position: absolute; bottom: spacing.sm` — the tab bar already owns the bottom safe-area inset (`height: 60 + insets.bottom`), so the banner must **not** add `insets.bottom` again (doing so left an ~inset-sized dead gap below it).

**One line, language-aware.** A single line chosen by the active reading language (`useGitaLanguage`), never a stacked Hindi+English pair. 30px disc + tight `spacing.sm` vertical padding keep it compact.

**Three states** (`bannerStatus`):
- `nudge` (no routine) — dashed `gold` border, `नि` disc, "अपनी नित्य साधना बनाएँ" / "Set your daily practice" → opens RoutineCreate.
- `progress` (partial, or nothing scheduled today) — `goldTint` border, `doneCount/total` disc, "नित्य साधना · आज" / "Daily Routine · Today", + a saffron progress track → opens RoutineToday.
- `complete` (all done) — a bloomed **lotus** mark (`LotusMark.tsx`) + "साधना पूर्ण · आज" / "Complete for today". The prominent progress chip is replaced by this compact achievement badge → opens RoutineToday.

**Completion celebration (pushpa-varsha).** The first time the completed banner is seen each day (`shouldCelebrate`: complete + focused + not-yet-celebrated), a gentle one-shot flower shower of saffron/gold petals drifts down over the chip (`RoutineCelebration.tsx`), with a `Haptics.NotificationFeedbackType.Success` tap. Reverent, not confetti (Section 11): a soft fall + fade, no scale pops. Plays once per day, gated by `celebratedToday` persisted in `RoutineContext` (date-keyed, like the done-marks — see §31). Vector art is built from `View` + `expo-linear-gradient` (no SVG — same convention as `CategoryIcon`). This pushpa-varsha is the **only** sanctioned exception to §11's no-animation stance; the Today's Practice seal (§31) reuses its fade, not a new effect.

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

- **Surface.** `cardActiveFrom → cardActiveTo` gradient, `cardActiveBorder` 1px, `radii.lg`, `elevation.raised` (this is a focal hero element). `minHeight: 186` + the flex spacer keep the CTA pinned to a common baseline across cards of differing copy length.
- **Icon tile.** 46×46, `saffronTint` fill, `radii.md`. Wraps any glyph: a `CategoryIcon` vector, the `LotusMark`, or a plain Devanagari `Text` glyph (e.g. `पं` for Panchang) — the tile makes them all read as one family. Saffron-tint (light) keeps the `saffronDeep` vectors high-contrast.
- **Eyebrow.** Short uppercase context tag (`versePill` tokens, `saffronDeep`). When `hasNew`, the eyebrow slot is **replaced** by the saffron `NEW` badge (same geometry/colour as §19) — carries the text cue, never colour-only (§12).
- **Title.** `orderTitlesByLanguage`, primary `numberOfLines 1`, secondary demoted to `ink-muted`.
- **Description.** Hindi → Devanagari 13 `ink-soft`; English → Cormorant italic 14 `ink-soft`. `numberOfLines 2`.
- **CTA pill.** `saffronTint` fill, `pill` radius, label (language-aware: `पढ़ें`/`Read`, `देखें`/`View`, …) + `›` chevron in `saffronDeep`. The whole card is the press target; the pill is a visual affordance, not a nested button.
- **Accessibility.** Whole-card `Pressable`, `accessibilityRole="button"`, label = `"{titleEn}.{ New.?} {descEn} Tap to open."`.

**Props.** `{ item: FeatureSpotlight; width: number; onPress: () => void }`. `width` is owned by the screen (viewport-sized). `FeatureSpotlight` is `{ key, eyebrowHi/En, titleHi/En, descHi/En, ctaHi/En, icon, hasNew? }`.

**Spotlight set (current).** Defined in `HomeScreen.tsx` with navigation wired per item: नित्य साधना → `RoutineToday`; दैनिक भक्ति → `DailyBhaktiTab`; आज का पंचांग → `PanchangTab`; तीर्थ यात्रा → `TheerthMap`. Sibling-tab targets navigate via the **parent** (`useNavigation()` → bubble up), not the Home stack — same pattern as `RoutineBanner`/`PanchangScreen`.

**Adding a spotlight.** Append a `FeatureSpotlight` to the `spotlights` array in `HomeScreen.tsx` with both-language copy, an icon node, and an `onPress`. No new tokens are needed — the shell reuses existing card/elevation/typography tokens.
