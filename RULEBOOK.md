# Aadhyatma Section Rulebook

The contract for adding a new content section (Hanuman Chalisa, Bhagavad Gītā, Sundarkand are the three live examples). Read this **before** touching code. For visual/typographic decisions defer to [`design.md`](./design.md). If `design.md` is silent, ask before inventing.

The companion command `/add-section` (see [`.claude/commands/add-section.md`](./.claude/commands/add-section.md)) walks through this checklist interactively and scaffolds the files. Use it.

---

## 1. The questions every new section must answer

Every section, regardless of size, must supply these inputs. The slash command will refuse to scaffold until the mandatory ones are present.

| # | Field | Required | Example | Notes |
|---|-------|----------|---------|-------|
| 1 | `id` | **yes** | `hanuman-chalisa` | lowercase-hyphen, unique across the `library` array, becomes the asset folder name and route slug |
| 2 | `nameHi` | **yes** | `हनुमान चालीसा` | Devanagari, listing card title (top row) |
| 3 | `nameEn` | **yes** | `Hanuman Chalisa` | listing card title (italic English row) |
| 4 | `sub` | **yes** | `40 चौपाई · अर्थ सहित` | listing subtitle. Devanagari, follows the `<count> <unit> · अर्थ सहित` pattern of existing sections |
| 5 | `thumb` | **yes** | `ह` / `भ` / `सु` / `ॐ` | single Devanagari glyph rendered inside `LibraryCard` |
| 6 | Subsection structure | optional | 18 chapters / 7 kāṇḍas / none | if present, supply count + per-subsection `titleHi`/`titleEn` (mirrors Gita's `chapters-manifest.json`) |
| 7 | **Background image(s)** for content page | **yes** | `mobile/assets/<id>/*.png` | at least one bundled local PNG/WebP. Faded vintage sketch per `design.md` §6 (≈50 % opacity after sepia, subject top-anchored, bottom third clean) |
| 8 | Per-verse `lines` (Devanagari) | **yes** | `["जय हनुमान ज्ञान गुण सागर", …]` | array of strings; preserve original line breaks |
| 9 | Per-verse `meaningHi` | **yes** | non-empty string | Hindi prose |
| 10 | Per-verse `meaningEn` | **yes** | non-empty string | English prose |
| 11 | Per-verse `commentaryHi` | optional | `string[]` | array of paragraphs; may be `[]` |
| 12 | Per-verse `commentaryEn` | optional | `string[]` | array of paragraphs; may be `[]` |

**Both languages required.** Even sections without commentary must ship `meaningHi` and `meaningEn` so the Hindi/English toggle (§3 below) works on every page.

**Coming-soon entries** are fine: set `status: 'coming'` and `hidden: true` in the `library` entry; you may skip 7–12 until the section is ready to flip live. The rulebook still applies the day the section flips to `active`.

---

## 2. Files a new section must produce

Exact paths, in build order. Each row maps to a Phase-C step in `/add-section`.

| # | Path | Action | Template |
|---|------|--------|----------|
| 1 | `mobile/src/data/<id>/<id>.json` | create | `mobile/src/data/sundarkand/sundarkand.json` (no commentary) or per-chapter Gita JSON (with commentary) |
| 2 | `mobile/src/data/<id>/index.ts` | create | `mobile/src/data/gita/index.ts` (typed loader + invariant checks) |
| 3 | `mobile/assets/<id>/` + `index.ts` | create | `mobile/assets/gita/index.ts` |
| 4 | `mobile/src/components/<Pascal>VersePage.tsx` | create | `GitaVersePage.tsx` (with commentary) or `SundarkandVersePage.tsx` (without) |
| 5 | `mobile/src/screens/<Pascal>ReaderScreen.tsx` | create | `GitaReaderScreen.tsx` or `SundarkandReaderScreen.tsx` |
| 6 | `mobile/src/screens/<Pascal>ChaptersScreen.tsx` | create *if subsections* | `GitaChaptersIndexScreen.tsx` |
| 7 | `mobile/src/navigation/types.ts` | edit | add route param types for the new screen(s) |
| 8 | `mobile/src/navigation/RootNavigator.tsx` | edit | register the new screen(s) |
| 9 | `mobile/src/data/texts.ts` | edit | append `LibraryEntry` to the `library` array |
| 10 | `mobile/src/screens/HomeScreen.tsx` | edit | add `id` branch in the routing if/else (≈ lines 81–87) |

`<Pascal>` = the `id` converted to PascalCase (e.g. `hanuman-chalisa` → `HanumanChalisa`).

---

## 3. Design contract

These are **non-negotiable** rules. The rulebook exists to keep them honest.

- **Tokens, not literals.** Every colour, spacing, radius, font family must come from `mobile/src/theme/{colors,spacing,typography}.ts` via the `useTheme()` hook. No hex codes in component files. No hardcoded `fontFamily`. (`design.md` §13)
- **Typography.** Devanagari → `NotoSerifDevanagari_500Medium` / `_600SemiBold`. English → `CormorantGaramond_500Medium` / `_400Regular_Italic` / `_600SemiBold_Italic`. (`design.md` §3) The full type scale is in `mobile/src/theme/typography.ts`; copy it via the role names (e.g. `theme.type.verseBody`), don't re-derive.
- **Background image.** Render with `<ImageBackground source={…} resizeMode="cover">` then layer the parchment `<LinearGradient>` overlay on top per `design.md` §6. Selection must be **deterministic per verse id** (e.g. `images[hash(verse.id) % images.length]`) — not random per render.
- **Reader shell.** Horizontal paginated `FlatList`, ornament divider (`Ornament.tsx`), pager dots, bilingual top-bar title. Match the layouts of `GitaReaderScreen.tsx` and `SundarkandReaderScreen.tsx` — do not invent a third shell.
- **Romanization.** Any Latin-script verse line — `transliteration[]` for Gita-style modules, `linesEn[]` for swap-on-toggle modules (Sundarkand, Hanuman Chalisa) — MUST follow `design.md §3.1`: IAST diacritics with Hunterian-style digraphs (`śh`, `kṣh`, `ch`, `chh`, epenthetic `i` after `ṛ`). Plain ASCII romanization (no diacritics) is rejected at review.
- **Language toggle.** Reuse the existing context: `import { useGitaLanguage } from 'mobile/src/data/gita/language.tsx'`. Default `'hi'`. **Do not** create a parallel context per section. (Renaming the hook to `useReadingLanguage` is a follow-up tracked outside this rulebook.)
  - The toggle is rendered on **every reader page** for all bilingual sections.
  - Sections with a subsection listing (Chapters Index, kāṇḍa list, etc.) ALSO surface the toggle on that listing.
  - State is shared across surfaces via the same hook — no per-screen forks.
- **Pill vocabulary.** Verse-type pill is always `<Devanagari term> · <Latin subtitle or N>` (`दोहा · Opening`, `चौपाई · 9`, `श्लोक · 1.1`, …). Do not invent new vocabulary without updating `design.md` first.
- **No emoji, no photos.** Backgrounds are always faded hand-drawn sketches per the Section 6 treatment.

---

## 4. Verification before merging a new section

The slash command runs the first three; the human PR author runs the rest.

1. `cd mobile && npx tsc --noEmit` passes.
2. `mobile/assets/<id>/` contains ≥ 1 image and `mobile/src/data/<id>/index.ts` invariant checks pass at app boot (no thrown errors).
3. PR diff contains zero new hex literals or hardcoded font names — search the diff for `#[0-9A-Fa-f]{3,6}` and `fontFamily:` to confirm.
4. App boots in Expo dev client; the new card is visible on Home below the existing active sections; tapping navigates to a working reader; every page shows a background image; every verse has `meaningHi` and `meaningEn` populated.
5. Hindi/English toggle flips meaning text on **every** page (sample at least page 1, middle, and last). Toggle is visible on every reader page; if a subsection listing exists, also visible there.
6. If the section ships an English transliteration field (`transliteration[]` or `linesEn[]`), spot-check at least 3 verses for IAST diacritics. Plain ASCII (no `ā`, `ṛ`, `ḥ`, `ṁ`, `ñ`, `ṣ`, `ś`, `ṭ`, `ḍ`, `ṇ` anywhere) is a hard reject — see `design.md §3.1`.
7. If subsections exist: chapters list renders; tapping any chapter lands on verse 1 of that chapter; back button returns to chapters list, not Home.

---

## 5. What this rulebook is **not**

- Not a substitute for `design.md`. This rulebook governs the **integration shape**; `design.md` governs the **visual language**. Read both.
- Not a substitute for testing on a device. `tsc` does not catch broken `require('./missing.png')`.
- Not a license to skip review. A scaffolded section still needs human eyes on the content data and the chosen background image.
