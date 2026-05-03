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

### Type scale

| Role | Typeface | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Screen title (`सनातन`) | Noto Serif Devanagari | 34 | 600 | Letter-spacing `0.01em` |
| Reader top-bar title | Noto Serif Devanagari | 16 | 600 | |
| Verse body (Devanagari) | Noto Serif Devanagari | 23 | 500 | Line-height 1.7 |
| Transliteration (Latin IAST) | Cormorant Garamond | 17 | 600 non-italic | `ink`, line-height 26. Always visible under Sanskrit lines regardless of the reader's language toggle — roman (not italic) because it reads as primary text, not a flourish. |
| Meaning body (Hindi) | Noto Serif Devanagari | 15 | 400 | `ink-soft`, line-height 1.7 |
| Meaning body (English) | Cormorant Garamond | 18 | 500 medium non-italic | `ink`, line-height 30. Italic 400 was previously used and rejected as too thin over the parchment bg; medium-weight roman at 18/30 is the shipping spec. |
| Commentary body (Hindi) | Noto Serif Devanagari | 15 | 400 | `ink-soft`, line-height 1.7. Paragraph gap `14`. |
| Commentary body (English) | Cormorant Garamond | 18 | 500 medium non-italic | `ink`, line-height 30. Paragraph gap `14`. |
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
   - Transliteration block (Gita only): Latin IAST lines in Cormorant Garamond 17 / 26, **600 non-italic**, `ink`. Always rendered regardless of the language toggle — transliteration is a phonetic bridge, not a translation.
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
- Language toggle: set on the Chapters Index (Section 15). Reader respects the current selection; there is no inline toggle in the Reader top bar in v1.
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

The Gita section carries a single in-memory language preference (`'hi' | 'en'`) exposed via a React context (`useGitaLanguage()`). Default `'hi'`. The toggle lives on the Chapters Index (Section 15); the Reader (Section 9) only reads the current value. Preference is **session-only** in v1 — no `AsyncStorage` persistence. Sanskrit and transliteration always render regardless of the current language; only meaning + commentary honour the toggle.

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
4. Add a `<Module>LanguageContext` if the text is bilingual (Section 15). Wrap the app in `App.tsx` inside `ThemeProvider`.
5. Add a Chapters Index screen (Section 15) with a Language Toggle (Section 16) and a list of chapter cards.
6. Build a Reader screen that scopes the pager to a single chapter (one verse per page, chapter-scoped counter).
7. Add 1–3 faded sketches to `mobile/assets/<module>/` — for v1 a single image covering all verses is acceptable if sourcing more is a separate ticket.
8. Flip the Home card from `coming` to `active`. Active modules sort above `coming` ones in the library list.

**Shared rules for any module:**

- Keep the pill vocabulary consistent: `दोहा`, `चौपाई`, `श्लोक`, `मंत्र`, etc., always paired with a Latin subtitle or chapter.verse number.
- Never hard-code colours, spacings, or font names in a component — always pull from the theme.
- If a token is missing, add it to `colors.ts` / `typography.ts` / `spacing.ts` first, then update this doc, then use it.
- For bilingual prose (meaning, commentary): Cormorant Garamond 18 / 30 500 medium **non-italic** `ink` is the English body standard. Italic is reserved for labels, fallback notes, and short flourishes.

---

## 14. File Map

**Documentation / reference:**
- `design-preview.html` — live visual reference at repo root. Open in any browser.
- `design.md` — this document.

**Source content:**
- `HanumanChalisa/hanuman-chalisa.hi.json` — curated source for the Chalisa module.
- `BhagwadGita/chapters/chapter-NN-*.md` — 18 published-translation Markdown files for the Gita module.
- `scripts/parse-gita.mjs` — one-shot Node parser (`node scripts/parse-gita.mjs` from repo root) that reads the Gita Markdown, normalises it, and writes the per-chapter JSON + manifest. Idempotent.

**Generated / committed data consumed by Metro:**
- `mobile/src/data/gita/chapter-NN.json` — one per chapter, imported statically.
- `mobile/src/data/gita/chapters-manifest.json` — lightweight list of `{ chapter, titleHi, titleEn, verseCount }` used by the Chapters Index.

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
- `mobile/src/components/VersePage.tsx` / `GitaVersePage.tsx` — Reader page body for each module.
- `mobile/src/components/Ornament.tsx` — the `॥` verse divider (Section 5).

**Screens:**
- `mobile/src/screens/HomeScreen.tsx` — Home (Section 7).
- `mobile/src/screens/ChalisaReaderScreen.tsx` — Chalisa Reader.
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
