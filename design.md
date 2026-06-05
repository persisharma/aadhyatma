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
| `parchment-soft` | `#F8EFD6` | Lighter parchment for inner cards |
| `parchment-deep` | `#E9D9B1` | Bottom-edge gradient, elevated surfaces |
| `ink` | `#2F1E10` | Primary Devanagari body text |
| `ink-soft` | `#5A3A1E` | Secondary text / meaning body |
| `ink-muted` | `#8A6A47` | Tertiary / metadata / placeholders |
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

These remain in everyday English. A handful of common Sanskrit terms keep their conventional spelling outside verse-lines (`Gītā`, `kāṇḍa`) — the diacritic-or-not call belongs to the editorial team, not this rule.

**Rendering layout** is module-specific:

- **Gita pattern (always-show-both):** Devanagari and IAST render side-by-side on every reader page; the language toggle only flips meaning/commentary. See §9.
- **Sundarkand / Hanuman Chalisa pattern (swap-on-toggle):** the toggle swaps Devanagari ↔ romanization in place, so only one script is visible at a time. See §9 / §10. Sanskrit shlokas inside these texts swap to IAST; Awadhi chaupais swap to pronunciation-based ASCII.

### Type scale

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
| Card name (Hindi) | Noto Serif Devanagari | 17 | 600 | |
| Card name (Latin) | Cormorant Garamond | 13 | 400 italic | `ink-muted` |
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

---

## 5. Iconography & Ornaments

- **Crest on Home.** Thin horizontal rule · circular outline with `ॐ` · thin horizontal rule. Lines 40px, circle 28px, saffron stroke at `1.5px`.
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

---

## 12. Accessibility

- Minimum tap target: 44×44 for back button, card tap, and pager dots.
- Ensure contrast on text over the parchment overlay. The overlay specified in Section 2 keeps `ink` at > 7:1 on the lightest area of every supplied background.
- Support Dynamic Type: scale verse body from 23 up to ~30 while keeping line-height 1.7. Meaning scales accordingly.
- Devanagari must use the system's user-chosen font-scale, not a fixed point size.
- All accent-only information (saffron pill, saffron chevron) must also carry a text or shape cue — never color alone.

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
2. Hero block (same as original Section 7): Crest + "वेदांश़" title + "Sacred Texts · Daily Reading" subtitle
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
  - Name Hindi: Noto Serif Devanagari 15 600, `ink`, 6px below glyph
  - Name English: Cormorant Garamond 12 400 italic, `ink-muted`, 2px below Hindi
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
