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
| 6 | `category` | **yes** | `granth` | One of: `granth`, `stotram`, `chalisa`, `japam`, `aarti`, `bhajan`, `veda`. Determines which grid tile this section appears under on Home. The `japam` tile routes to `JapamCounterScreen` (counter UI) instead of the standard verse pager. |
| 7 | `deities` | **yes** | `['hanuman', 'rama']` | Array of deity tags from: `rama`, `krishna`, `shiva`, `hanuman`, `durga`, `ganesha`. The section appears under each tagged deity's cross-reference on Home. At least one required. |
| 8 | Subsection structure | optional | 18 chapters / 7 kāṇḍas / none | if present, supply count + per-subsection `titleHi`/`titleEn` (mirrors Gita's `chapters-manifest.json`) |
| 9 | **Background image(s)** for content page | **yes** | `mobile/assets/<id>/*.png` | at least one bundled local PNG/WebP. Faded vintage sketch per `design.md` §6 (≈50 % opacity after sepia, subject top-anchored, bottom third clean) |
| 10 | Per-verse `lines` (Devanagari) | **yes** | `["जय हनुमान ज्ञान गुण सागर", …]` | array of strings; preserve original line breaks |
| 11 | Per-verse `meaningHi` | **yes** | non-empty string | Hindi prose |
| 12 | Per-verse `meaningEn` | **yes** | non-empty string | English prose |
| 13 | Per-verse `commentaryHi` | optional | `string[]` | array of paragraphs; may be `[]` |
| 14 | Per-verse `commentaryEn` | optional | `string[]` | array of paragraphs; may be `[]` |

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
| 8 | `mobile/src/navigation/HomeStackNavigator.tsx` | edit | register the new screen(s) in the Home stack |
| 9 | `mobile/src/data/texts.ts` | edit | append `LibraryEntry` (with `category` and `deities` fields) to the `library` array |
| 10 | `mobile/src/navigation/entryRoutes.ts` | edit | register the new section's `entryId` in both `navigateToEntryStart` and `navigateToProgress`. Both `CategoryListScreen` and `DeityListScreen` use this single helper, so missing it here means the section's card will appear in the lists but tapping it will be a no-op (silent dead end) on at least one path. |
| 11 | `mobile/src/screens/HomeScreen.tsx` | no edit needed | categories and deities are rendered dynamically from data |
| 12 | `mobile/src/screens/CategoryListScreen.tsx` | no edit needed | items auto-filter by `category` field; routing is delegated to `entryRoutes.ts` (row 10) |
| 13 | `mobile/src/screens/DeityListScreen.tsx` | no edit needed | items auto-filter by `deities` field; routing is delegated to `entryRoutes.ts` (row 10) |

`<Pascal>` = the `id` converted to PascalCase (e.g. `hanuman-chalisa` → `HanumanChalisa`).

**Row 4 is mandatory even when an existing `*VersePage.tsx` *appears* to fit.** If the shapes are genuinely identical and you want to share rendering, the new file must re-export the existing component (`export { default } from './SundarkandVersePage';`) so the dependency is explicit and survives future shape changes. A reader screen must import only its own section's verse page — never another section's directly. (See §3 *Type safety on verse pages*.)

---

## 3. Design contract

These are **non-negotiable** rules. The rulebook exists to keep them honest.

- **Tokens, not literals.** Every colour, spacing, radius, font family must come from `mobile/src/theme/{colors,spacing,typography}.ts` via the `useTheme()` hook. No hex codes in component files. No hardcoded `fontFamily`. (`design.md` §13)
- **Typography.** Devanagari → `NotoSerifDevanagari_500Medium` / `_600SemiBold`. English → `CormorantGaramond_500Medium` / `_400Regular_Italic` / `_600SemiBold_Italic`. (`design.md` §3) The full type scale is in `mobile/src/theme/typography.ts`; copy it via the role names (e.g. `theme.type.verseBody`), don't re-derive.
- **Background image.** Render with `<ImageBackground source={…} resizeMode="cover">` then layer the parchment `<LinearGradient>` overlay on top per `design.md` §6. Selection must be **deterministic per verse id** (e.g. `images[hash(verse.id) % images.length]`) — not random per render.
- **Reader shell.** Horizontal paginated `FlatList`, ornament divider (`Ornament.tsx`), pager dots, language-aware top-bar title. Match the layouts of `GitaReaderScreen.tsx` and `SundarkandReaderScreen.tsx` — do not invent a third shell.
- **Top-bar title rule.** Reader screens, counter screens, and chapter index screens must **swap** the title between Hindi and English based on the language toggle — never render both stacked. Use `{lang === 'hi' ? titleHi : titleEn}`. Listing screens (Home, CategoryList, DeityList) intentionally show both (`nameHi · nameEn`) as a static bilingual label — the toggle does not apply there. (`design.md` §9, §15)
- **Romanization.** Per `design.md §3.1`, the romanization style is chosen by the source language of the verse, not by the module: Sanskrit verses (Gita, embedded shlokas) use IAST + Hunterian digraphs; Awadhi/Hindi verses (Tulsidas chaupais, dohas, sorthas, chhands) use hand-curated pronunciation-based ASCII. Do not impose IAST on Awadhi — the diacritics misrepresent recitation.
- **Language toggle.** Reuse the existing context: `import { useGitaLanguage } from 'mobile/src/data/gita/language.tsx'`. Default `'hi'`. **Do not** create a parallel context per section. (Renaming the hook to `useReadingLanguage` is a follow-up tracked outside this rulebook.)
  - The toggle is rendered on **every reader page** for all bilingual sections.
  - Sections with a subsection listing (Chapters Index, kāṇḍa list, etc.) ALSO surface the toggle on that listing.
  - State is shared across surfaces via the same hook — no per-screen forks.
- **Categories & Deities.** Every `LibraryEntry` must have a valid `category` (one of the six defined types) and at least one `deity` tag. The Home screen grid and deity section derive their content from these fields — no manual wiring required.
- **Japam is excluded from deity listings.** Japam mantras live behind their own Home tile (`Japam`) and are intentionally filtered out of `DeityListScreen` and the `DeityIndex` count. Reasons: (a) japam mantras are typically a single line that's already embedded as the opening verse of the matching stotram (e.g. `om-namah-shivaya` is also chapter 1 of `shiva-strotam`), so re-listing them under the deity is redundant; (b) the deity card is a reading-list surface, the Japam tile is a counting-mode surface — different intents. Keep the `'japam'` deity-list filter in place when adding new mantras.
- **Pill vocabulary.** Verse-type pill is always `<term> · <subtitle or N>`. The **leading term matches the user's selected language** — Hindi mode shows `श्लोक · 1.1` / `चौपाई · 9` / `परिचय · Introduction`; English mode shows `Shloka · 1.1` / `Chaupai · 9` / `Introduction · परिचय`. Never hardcode one language — branch on `lang` (or use lang-paired `labelHi`/`labelEn` from the data, as Sundarkand does). Do not invent new vocabulary without updating `design.md` first.
- **Every user-facing string respects `lang`.** If a string is visible to the user (visible Text, pill/badge, button label, top-bar title, modal body, toast, confirmation copy) and it carries semantic content beyond a number/symbol, it must branch on `lang` or come from a lang-paired field (`labelHi`/`labelEn`, `nameHi`/`nameEn`, `meaningHi`/`meaningEn`, …). Hardcoded Devanagari in an otherwise-English flow (or vice versa) is a hard reject. Exceptions, which must be intentional: (a) bilingual stacked labels by design — listing card subtitles (`nameHi · nameEn`), Resume sheet's `जारी रखें · Resume` button — where both languages render simultaneously; (b) numeric/symbolic content (`॥`, `1.9`, `4`). When in doubt, branch on `lang`. (Origin: WishlistScreen verse pill rendered `श्लोक 1.9` in English mode; Gita / Shiva Strotam verse pills had the same bug.)
- **No emoji, no photos.** Backgrounds are always faded hand-drawn sketches per the Section 6 treatment.
- **Type safety on verse pages.** A reader screen renders only its own section's `<Pascal>VersePage.tsx`. Cross-section reuse via direct import is forbidden — it silently couples two sections to the same field shape and any drift becomes a runtime crash. The `verse` prop must type-check without escape hatches: `as any`, `as unknown as`, and `// @ts-ignore`/`// @ts-expect-error` on a `*VersePage` prop are a hard reject in review. If `tsc --noEmit` complains when wiring up a reader, the fix is the data shape or a section-specific page, **not** a cast. (Origin: PR #31 Balkand crash — `RamcharitmanasReaderScreen` cast `RamcharitmanasVerse` into `ShivaStrotamVersePage`, whose `verse.sanskrit` access threw on first paint because Ramcharitmanas uses `verse.lines`.)
- **Reader smoke test.** Every new `<Pascal>ReaderScreen.tsx` ships with `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx` that mounts the screen with the chapter-1 fixture and asserts the first verse renders without throwing. The test runs in CI and gates the merge — `tsc` alone does not catch field-shape mismatches that have been cast away.
- **Routing is centralised.** All section-from-listing navigation goes through `mobile/src/navigation/entryRoutes.ts` (`navigateToEntryStart` and `navigateToProgress`). Listing screens (`CategoryList`, `DeityList`) must not contain inline `if (entryId === 'foo') navigation.navigate(...)` ladders — those drift independently and a section appears in one listing but is a dead tile in another. (Origin: PR #31 — `DeityListScreen` only routed the original four sections, so all 14 new sections were silent no-ops under every deity until this rule.) When adding a section, register it in `entryRoutes.ts`; both listing screens then route it for free.
- **Multi-instance reader screens dispatch on a route param, not a hardcoded module.** A single screen that serves N entries (today: `ChalisaReaderScreen` for the four chalisas, `AartiReaderScreen` for the seven aartis) must read its `route.params` discriminator (`chalisaId`, `aartiIndex`, etc.) and pick its data through a registry — never import a single section's data at the top of the file. Bookmark ids and `setProgress({ sourceId })` must use the discriminator, not a constant. (Origin: PR #31 — `ChalisaReaderScreen` accepted `chalisaId` in route params but ignored it; tapping Shiv/Durga/Ganesh Chalisa rendered Hanuman Chalisa content with `sourceId: 'hanuman-chalisa'` in progress.)

---

## 4. Verification before merging a new section

The slash command runs the first three; the human PR author runs the rest.

1. `cd mobile && npx tsc --noEmit` passes.
2. `mobile/assets/<id>/` contains ≥ 1 image and `mobile/src/data/<id>/index.ts` invariant checks pass at app boot (no thrown errors).
3. PR diff contains zero new hex literals or hardcoded font names — search the diff for `#[0-9A-Fa-f]{3,6}` and `fontFamily:` to confirm.
4. App boots in Expo dev client; the new card is visible on Home below the existing active sections; tapping navigates to a working reader; every page shows a background image; every verse has `meaningHi` and `meaningEn` populated.
5. The new section appears correctly under its category tile (tap the tile on Home → item is listed). If deity tags are set, also verify the item shows under those deity chips.
6. Hindi/English toggle flips meaning text on **every** page (sample at least page 1, middle, and last). Toggle is visible on every reader page; if a subsection listing exists, also visible there. While toggled to English, confirm **no Devanagari leaks into the verse pill, top-bar title, modals, or any other user-facing string** outside intentional bilingual labels — and the same check in reverse for Hindi. (Origin: Wishlist pill, Gita & Shiva Strotam verse pills shipped Hindi-only `श्लोक · 1.1` in English mode.)
7. If the section ships an English transliteration field (`transliteration[]` or `linesEn[]`), spot-check the romanization style matches the source language per `design.md §3.1`: Sanskrit verses use IAST diacritics; Awadhi/Hindi verses use pronunciation-based ASCII. Mismatched style (IAST on Awadhi or plain ASCII on a Sanskrit shloka) is a hard reject.
8. If subsections exist: chapters list renders; tapping any chapter lands on verse 1 of that chapter; back button returns to chapters list, not Home.
9. Grep the new screen and component files for `as any`, `as unknown as`, `@ts-ignore`, and `@ts-expect-error`. Any hit on a `*VersePage` `verse=` prop or on a navigation `route.params` access is a hard reject — re-shape the data or add a section-specific component instead.
10. The new `<Pascal>ReaderScreen.test.tsx` exists and passes locally and in CI. Do not merge a green PR whose test file is missing.
11. **Per-section device check.** If the PR adds N sections, every one of them must be opened in the Expo dev client individually — Home tile → reader → toggle language → swipe to last verse → back. A single "tested locally" sign-off does not cover N sections; capture one screenshot per section and paste them in the PR description.
12. **Both listings reach the reader.** Open the section from Home → its category tile **and** from Home → By Deity → its deity card. Both paths must land on the same reader. If the section appears as a card but tapping is a no-op, the routing helper (`entryRoutes.ts`) is missing a case.
13. **Multi-instance readers serve the right content.** For sections that share a screen (chalisas, aartis, future N-of-a-kind), open at least two distinct entries and confirm titles, verses, and `sourceId` (visible via bookmarks) actually differ — a reader hardcoded to one variant will silently render the wrong content for the others.

---

## 5. What this rulebook is **not**

- Not a substitute for `design.md`. This rulebook governs the **integration shape**; `design.md` governs the **visual language**. Read both.
- Not a substitute for testing on a device. `tsc` does not catch broken `require('./missing.png')`.
- Not a license to skip review. A scaffolded section still needs human eyes on the content data and the chosen background image.

---

## 6. Navigation architecture

The app uses a bottom tab bar with three tabs: Home (गृह), Daily Bhakti (भक्ति), and Bookmarks (संग्रह). Reader screens hide the tab bar for immersive reading.

New sections are registered in `mobile/src/navigation/HomeStackNavigator.tsx` (not the old `RootNavigator.tsx`). The Home screen dynamically renders categories from `mobile/src/data/categories.ts` and deities from `mobile/src/data/deities.ts` — adding a new section only requires:
1. Adding the `LibraryEntry` to `texts.ts` (with `category` and `deities` fields)
2. Registering reader route(s) in `HomeStackNavigator.tsx`

No manual routing in HomeScreen is needed — `CategoryListScreen` filters items by their `category` field automatically.

---

## 7. Pull-request hygiene for new sections

These rules exist because PR #31 (the Balkand crash) demonstrated that bulk multi-section PRs invite pattern-match review, and that `tsc` escape hatches will be approved if the commit message frames them as "compatibility casts." Both failure modes are now closed.

- **One section per PR by default.** Up to three only when they share a parent (e.g., three kāṇḍas of the same granth) and only with a per-section checklist in the description. A PR adding 14 sections is a hard reject regardless of how clean each diff looks.
- **PR description template (mandatory for any PR adding a new section):**
  - Section `id`, category, deities — one row per section.
  - Screenshot of the loaded reader for each section (page 1, language toggle visible).
  - Confirmation that `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx` exists and passes.
  - Explicit line: "No `as any` / `@ts-ignore` introduced on verse-page props or route params."
- **Self-flagged casts are flags, not justifications.** Commit messages that contain "cast", "compatible interface", "type compatibility", or "as any" against a verse-page prop must be challenged in review. The fix is upstream (data shape or new component), not the cast.
- **Reviewer responsibility.** Approving a new-section PR requires confirming items 1, 9, 10, and 11 of §4 yourself — not trusting the author's checklist. Sign off only after opening the dev client (or the included screenshots) and seeing the reader render.
