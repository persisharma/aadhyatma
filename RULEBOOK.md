# Aadhyatma Section Rulebook

The contract for adding a new content section (Hanuman Chalisa, Bhagavad Gītā, Sundarkand are the three live examples). Read this **before** touching code. For visual/typographic decisions defer to [`design.md`](./design.md). If `design.md` is silent, ask before inventing.

The companion command `/add-section` (see [`.claude/commands/add-section.md`](./.claude/commands/add-section.md)) walks through this checklist interactively and scaffolds the files. Use it.

---

## 0. Every change ships with tests — unit **and** e2e

This is a hard, repo-wide gate that applies to **every** change, not just new sections — features, bug fixes, refactors, content edits, and data changes alike.

- **Unit tests (UT).** Every change adds or updates automated unit tests that pin the new or fixed behaviour. Run `npm test` from `mobile/` — it runs `typecheck`, the Jest suites (`test:readers`), the panchang engine tests (`test:engine`), and the data/content tests (`test:data`); all must pass. A bug fix must include a test that fails before the fix and passes after.
- **E2E verification.** Every change is exercised end-to-end via the Maestro flows in `mobile/.maestro/` (`npm run test:e2e`) on a simulator/emulator, and the flow covering the touched area must pass. If a change adds a user-facing surface no existing flow covers, extend or add the matching `<category>-smoke.yaml` (see §9). **How to author and verify a flow — including the isolated-simulator recipe for machines running several worktrees, and the selector/onboarding gotchas — is the `wiki/runbooks/e2e-verification.md` runbook.**
- **No exceptions.** A PR without both UT and e2e evidence is a hard reject — the same bar as a missing reader-screen test (§2 row 14) or a missing Maestro flow (§9).

## 0.1 Docs ship in the same PR — design.md / RULEBOOK sync is a merge gate

Code is canonical, but the docs may never lag it by more than the PR that changed it:

- **Any change to a user-facing surface** (screen structure, component spec, navigation, tokens, type scale, labels, interaction/motion/a11y behaviour) **must update the matching `design.md` section in the same PR.** If no section covers the surface, add one (continue the § numbering). Deleting a behaviour deletes/updates its spec.
- **Any change to the integration contract** (content shapes, file sets, category/deity/registry sets, verification steps, test gates) **must update the matching RULEBOOK section in the same PR.**
- **Enumerations live in code; docs point at the source.** Where a list is bound to drift (categories, deities, theerth groups), the doc states the source-of-truth file (`categories.ts`, `deities.ts`, `theerth/temples.ts`) and mirrors the current values — update the mirror when the source changes.
- **Reviewer gate.** A PR that changes UI or contract with an untouched `design.md`/`RULEBOOK.md` is a hard reject, same bar as missing tests. Ask "which doc section describes what this PR just changed?" — if the answer is "none", the PR isn't done.
- (Origin: a full design↔code audit in July 2026 found ~35 drifted sections — 3-tab bar vs shipped 5, phantom Bookmarks tab, 4-segment toggle vs shipped 2, Theerth map-first vs shipped list-first — because nothing forced doc updates alongside code.)

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
| 6 | `category` | **yes** | `granth` | One of: `granth`, `stotram`, `chalisa`, `japam`, `aarti`, `theerth`, `sanskar`, `ashtakam`, `suktam`, `kavacham` (source of truth: `mobile/src/data/categories.ts`). Determines which grid tile this section appears under on Home. The `japam` tile routes to `JapamCounterScreen` (counter UI) instead of the standard verse pager. The `theerth` tile routes to the Theerth browse screen (state/category list; map in the drill-in view) — see §11. `ashtakam`, `suktam` and `kavacham` are PRD-A forms, each with a multi-instance reader (dispatching on `ashtakamId`/`suktamId`/`kavachamId`, like the chalisas). **Stuti** is a fourth PRD-A form but is **not** a category — its texts (Krishna Stuti, Durga Stuti) are filed under `stotram` (स्तुति ≈ स्तोत्रम्) yet still render via the multi-instance `StutiReader`, routed by `stutiId`. |
| 7 | `deities` | **yes** | `['hanuman', 'rama']` | Array of deity tags from the `Deity` union in `mobile/src/data/texts.ts` and display metadata in `deities.ts`: `rama`, `krishna`, `vishnu`, `shiva`, `hanuman`, `durga`, `ganesha`, `savitr` (Maa Gayatri), `saraswati`, `lakshmi` (Maa Lakshmi), `surya` (Surya Dev), `radha` (Radha Rani), `kartikeya` (Kartikeya), `kubera` (Kubera), `ganga` (Maa Ganga), `parvati` (Maa Parvati), `narasimha` (Narasimha), `dattatreya` (Dattatreya), `shani` (Shani Dev), `kali` (Maa Kali), `navagraha` (Navagraha) — PRD-A deity expansion §A.4.2 complete, 9 → 21 (source of truth: `mobile/src/data/deities.ts`). The section appears under each tagged deity in the Deity Index/Detail surfaces. At least one required. |
| 8 | Subsection structure | optional | 18 chapters / 7 kāṇḍas / none | if present, supply count + per-subsection `titleHi`/`titleEn` (mirrors Gita's `chapters-manifest.json`) |
| 9 | **Background image(s)** for content page | **yes** | `mobile/assets/<id>/*.png` | at least one bundled local PNG/WebP. Faded vintage sketch per `design.md` §6 (≈50 % opacity after sepia, subject top-anchored, bottom third clean) |
| 10 | Per-verse `lines` (Devanagari) | **yes** | `["जय हनुमान ज्ञान गुण सागर", …]` | array of strings; preserve original line breaks |
| 11 | Per-verse `meaningHi` | **yes** | non-empty string | Hindi prose |
| 12 | Per-verse `meaningEn` | **yes** | non-empty string | English prose |
| 13 | Per-verse `commentaryHi` | optional | `string[]` | array of paragraphs; may be `[]` |
| 14 | Per-verse `commentaryEn` | optional | `string[]` | array of paragraphs; may be `[]` |

**Both languages required.** Even sections without commentary must ship `meaningHi` and `meaningEn` so the language toggle (§3 below) works on every page.

**Author Hindi + English only — Gujarati and Kannada are derived at runtime.** The app supports four reading languages (`hi` · `en` · `gu` · `kn`). You do **not** author `*Gu`/`*Kn` content fields: Gujarati and Kannada renderings are produced from the Devanagari (`lines`/`sanskrit`/`titleHi`/`labelHi`/`meaningHi`) by `mobile/src/utils/transliterate.ts` (sister-script conversion) via the selection helpers in `mobile/src/utils/localize.ts`. Meaning policy: **everything renders in the selected script** — Gujarati and Kannada both show the Hindi meaning/commentary re-scripted into their script (Hindi wording in the regional script, since no native gu/kn translations are authored yet); English shows English. The verse text itself is always the Devanagari re-scripted. A new section that supplies correct `…Hi`/`…En` fields gets gu/kn for free. (When native `meaningGu`/`meaningKn` are authored later, `meaningByLang`/`commentaryByLang` in `localize.ts` is the single place to prefer them.)

**Theerth carve-out.** Rows 10–14 (`lines`, `meaningHi`, `meaningEn`, `commentaryHi`, `commentaryEn`) describe the **verse archetype** and are mandatory for verse-based sections only. Sections with `category === 'theerth'` have a different shape — prose `significanceHi/En` + `originStoryHi/En` per temple, plus `coordinates` and `stateHi/En` — defined in §11. They do not produce a `*VersePage` component.

**Coming-soon entries** are fine: set `status: 'coming'` and `hidden: true` in the `library` entry; you may skip 7–12 until the section is ready to flip live. The rulebook still applies the day the section flips to `active`.

---

## 2. Files a new section must produce

Exact paths, in build order. Each row maps to a Phase-C step in `/add-section`.

| # | Path | Action | Template |
|---|------|--------|----------|
| 1 | `mobile/src/data/<id>/<id>.json` | create | `mobile/src/data/sundarkand/chapter-01.json` (chaptered, no commentary) or per-chapter Gita JSON (with commentary) |
| 2 | `mobile/src/data/<id>/index.ts` | create | `mobile/src/data/gita/index.ts` (typed loader + invariant checks) |
| 3 | `mobile/assets/<id>/` + `index.ts` | create | `mobile/assets/gita/index.ts` |
| 4 | `mobile/src/components/<Pascal>VersePage.tsx` | create | `GitaVersePage.tsx` (with commentary) or `SundarkandVersePage.tsx` (without) |
| 5 | `mobile/src/screens/<Pascal>ReaderScreen.tsx` | create | `GitaReaderScreen.tsx` or `SundarkandReaderScreen.tsx` |
| 6 | `mobile/src/screens/<Pascal>ChaptersScreen.tsx` | create *if subsections* | `GitaChaptersIndexScreen.tsx` |
| 7 | `mobile/src/navigation/types.ts` | edit | add route param types for the new screen(s) |
| 8 | `mobile/src/navigation/HomeStackNavigator.tsx` | edit | register the new screen(s) in the Home stack |
| 9 | `mobile/src/data/texts.ts` | edit | append `LibraryEntry` (with `category` and `deities` fields) to the `library` array |
| 10 | `mobile/src/navigation/entryRoutes.ts` | edit | register the new section's `entryId` in both `navigateToEntryStart` and `navigateToProgress`. Both `CategoryListScreen` and `DeityListScreen` use this single helper, so missing it here means the section's card will appear in the lists but tapping it will be a no-op (silent dead end) on at least one path. **If the section is chaptered**, also register its manifest length in `chapterCountBySourceId` — a single-chapter text must open its reader directly, not a one-row chapters index (two taps to read; design.md §38). |
| 11 | `mobile/src/screens/HomeScreen.tsx` | no edit needed | categories and deities are rendered dynamically from data |
| 12 | `mobile/src/screens/CategoryListScreen.tsx` | no edit needed | items auto-filter by `category` field; routing is delegated to `entryRoutes.ts` (row 10) |
| 13 | `mobile/src/screens/DeityListScreen.tsx` | no edit needed | items auto-filter by `deities` field; routing is delegated to `entryRoutes.ts` (row 10) |
| 14 | `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx` | create | Mirrors `BajrangBaanReaderScreen.test.tsx` — mounts the new reader with chapter-1 fixture and asserts first verse renders. Required gate in CI. |
| 15 | `mobile/.maestro/<category>-smoke.yaml` | **edit** (existing category) **or create** (new category) | For an existing category, add a new `- assertVisible: "<NameEn>"` line to the `CategoryList block` of `mobile/.maestro/<category>-smoke.yaml` so the new section appears in the E2E flow. For a new category, create a new `<category>-smoke.yaml` based on `mobile/.maestro/sanskar-smoke.yaml` as the template. Both forms must `runFlow: _launch.yaml` and live in `mobile/.maestro/`. |

`<Pascal>` = the `id` converted to PascalCase (e.g. `hanuman-chalisa` → `HanumanChalisa`).

**Verse-based archetypes only.** Rows 1, 2, 4, 5, 6 of this table describe the verse-pager pipeline (Chalisa / Gita / Sundarkand / Stotram / Chalisa shapes). For `category === 'theerth'`, the file set is different — see §11.

**Row 4 is mandatory even when an existing `*VersePage.tsx` *appears* to fit.** If the shapes are genuinely identical and you want to share rendering, the new file must re-export the existing component (`export { default } from './SundarkandVersePage';`) so the dependency is explicit and survives future shape changes. A reader screen must import only its own section's verse page — never another section's directly. (See §3 *Type safety on verse pages*.)

---

## 3. Design contract

These are **non-negotiable** rules. The rulebook exists to keep them honest.

- **Tokens, not literals.** Every colour, spacing, radius, font family, shadow, **and font size** must come from `mobile/src/theme/{colors,spacing,typography,elevation}.ts` via the `useTheme()` hook or a direct token import. No hex codes in component files. No hardcoded `fontFamily`. No hardcoded `fontSize`/`lineHeight` on reading-content text. (`design.md` §13)
  - **Three of these are now machine-enforced** by `no-restricted-syntax` in `mobile/eslint.config.js`, so `npm run lint` fails the build rather than a reviewer catching them: a **font-family string literal**, a **hex literal on `shadowColor`**, and a **`fontSize` below 10**. `src/theme/` is exempt — that is where the tokens are defined. All three fail *silently* in React Native, which is why they kept landing: an unloaded family renders in the system font with no warning (a shipped bug — four call sites named `NotoSansDevanagari_600SemiBold`, a family the app never installed), a hand-typed shadow drifts a shade per file, and sub-10 chrome can never be enlarged because the font-scale system never scales chrome.
  - **Radii** come from the 4-step `radii` scale (10/14/18/22) + `pill`. A radius that is exactly half its box is a *circle*, not a card corner, and stays a literal (`design.md` §4).
  - **Shadows** spread an `elevation` tier (`subtle`/`card`/`lifted`/`raised`/`overlay`) — never per-file offsets and opacities, which make cards float at different heights (`design.md` §4).
- **The 10 pt chrome floor.** No UI chrome renders below 10 pt. The reading-size presets scale reading tokens only, so an undersized label can never be enlarged by any accessibility setting. If a chip is too small at 10, grow the chip or drop the label — do not shrink the type. The one sanctioned exception is `NorthIndianChart`, whose sizes are **viewBox units** that scale with the chart. (`design.md` §3.0, §12)
- **Typography.** Devanagari → `NotoSerifDevanagari_500Medium` / `_600SemiBold`. English → `CormorantGaramond_500Medium` / `_400Regular_Italic` / `_600SemiBold_Italic`. (`design.md` §3) The full type scale is in `mobile/src/theme/typography.ts`; copy it via the role names (e.g. `theme.type.verseBody`), don't re-derive.
- **One reading type scale, controlled from one place.** All scripture *reading content* — Devanagari verse lines, Latin transliteration, meaning, and commentary — sizes **only** from the shared `typography` tokens (`verse`, `verseLatin`, `meaning`, `meaningEnglish`), never a hardcoded `fontSize`/`lineHeight`. The scale is **identical across every reader section** and every surface that shows reading content; a size change happens in `typography.ts` alone, never per section. Invariants baked into the tokens: both languages render the meaning at the **same** size, and the verse sits a step **above** the meaning. `mobile/src/components/__tests__/readerTypeScale.test.tsx` renders all reader components and fails if any section drifts — extend it when adding a reader. **Constrained surfaces** — the fixed-canvas `ShareCard` promo image and the screen-size-responsive `JapamCounterScreen` — are the **only** sanctioned exceptions: they may carry their own layout-tuned sizes, but must **shrink-to-fit, never truncate** the content (e.g. `adjustsFontSizeToFit`). Adding a third exception requires updating this rule first. (Origin: English meaning shipped at a hardcoded `18` on most readers while the token said `20`, and the English verse↔meaning hierarchy was flat/inverted, because each `*VersePage` hardcoded its own sizes.)
- **Secondary & signal text stays legible on its real surface.** Every text element — including secondary/metadata text, quality chips, and the signal colors (`avoid`, `saffronDeep`) — must clear **WCAG AA 4.5:1 against the surface it actually renders on**, not just base `parchment`. Cards sit on lighter surfaces (`parchmentSoft` tiles, tint pills, the `cardActive` gradient), so check the worst case — the lightest gradient stop, `cardActiveFrom`. Two forces cause the recurring "faint secondary text" defect and both are rejects: (a) a color chosen against `parchment` that washes out on a lighter card surface, and (b) the **thin italic Cormorant face (`latinItalic`)** used for numerals/times/ranges/chips/status labels — those use the **non-italic ≥600 face** (`latinSemiBold`/`latinBold`); italic strokes undercut the measured ratio (design.md §3, §12). `mobile/src/theme/__tests__/colors.contrast.test.ts` pins the signal colors against the card surfaces — extend it when adding a token used as text on a non-parchment surface. (Origin: the Muhurat glance-card times and auspicious/avoid chip shipped in thin italic on the gradient and read half-visible; this exact fix has been made several times across the app.)
- **Background image.** Render with `<ImageBackground source={…} resizeMode="cover">` then layer the parchment `<LinearGradient>` overlay on top per `design.md` §6. Selection must be **deterministic per verse id** (e.g. `images[hash(verse.id) % images.length]`) — not random per render.
- **Reader shell.** Horizontal paginated `FlatList`, ornament divider (`Ornament.tsx`), pager dots, language-aware top-bar title. Match the layouts of `GitaReaderScreen.tsx` and `SundarkandReaderScreen.tsx` — do not invent a third shell.
- **The top bar is `ReaderHeader`, never a local copy.** Every reader and chapters/index screen renders `mobile/src/components/ReaderHeader.tsx` — `variant="reader"` (16 pt title) for readers, `variant="index"` (22/20) for chapters and index landing screens. Screens pass content (`title`, `right`, `onBack`) and never geometry. Hand-rolling a `topBar` + `back` + `title` style block is a hard reject: ~32 screens each carried their own copy until July 2026 and they had drifted to two gutters, three bottom paddings, two button sizes and an off-token title size. The back control's `accessibilityLabel` defaults to the **English, un-localized** `"Back"` because the Maestro flows tap that string and the default reading language is `hi`; override it only to name a destination. (`design.md` §9)
- **Text inputs are `TextField`, with one of two variants.** `mobile/src/components/TextField.tsx` — `variant="search"` (44, Cormorant 15) for searching **content**, `variant="form"` (48, Inter 14) for **data entry**. Do not hand-roll a `TextInput` height/face/padding: there were three specs for one control class until July 2026. (`design.md` §52)
- **Back buttons are 44 visually.** `hitSlop` counts toward the 44 *touch* minimum, but the back control is the one control on every screen, so a 40 among 44s reads as a defect regardless of its hit area. Smaller controls of other classes are allowed when `hitSlop` clears 44 **and** the size is deliberate and commented (today: the Panchang month stepper at 34 + `hitSlop={10}`). (`design.md` §12)
- **Chaptered readers auto-advance across subsection boundaries.** A reader whose text has more than one subsection (`<section>ChaptersManifest.length > 1`) must let the user cross chapter/kāṇḍa boundaries **by swiping** — it must never dead-end on the last page of a subsection. Match `GitaReaderScreen.tsx` / `ShivaStrotamReaderScreen.tsx`: inject a `NextChapterCard` after the last verse (unless it is the last chapter) and a `PrevChapterCard` before the first verse (unless it is the first chapter) into the `FlatList` `data`; detect those `__type: 'transition' | 'prev-transition'` items in `onViewableItemsChanged` and `navigation.replace(<thisRoute>, { chapter })` (the prev case lands on the previous chapter's last verse via `initialIndex`). The prepended prev card shifts indices by one, so carry an `offset` through `initialScrollIndex`, `handleScroll`, and the viewable-index math. `mobile/src/screens/__tests__/readerAutoAdvance.test.tsx` enforces this for every multi-chapter reader — add a new chaptered reader to its table when you create one. (Origin: Durga / Ganesh / Saraswati / Vishnu Sahasranama readers rendered only `chapter.verses`, so swiping past a chapter's last verse dead-ended instead of advancing to the next subsection.)
- **Top-bar title rule.** Reader screens, counter screens, and chapter index screens must **swap** the title to the active reading language — never render both stacked. Use `contentByLang(lang, titleHi, titleEn)` (gu/kn re-script `titleHi`); pick the font with `titleFontByLang(lang)`. Do **not** hand-write `lang === 'hi' ? titleHi : titleEn` — that silently shows English for gu/kn. Listing screens (Home, CategoryList, DeityList) still show **both** languages, but the active reading language now decides **order and focus**: the primary language leads in the prominent slot (top line on cards, first on the `·`-joined top bar) with the larger/heavier font, and the other language follows as a supporting line. This is computed by the shared `orderTitlesByLanguage()` helper (`mobile/src/utils/titleByLanguage.ts`) so category names and catalog/deity titles flip together everywhere; do not re-derive the order inline or hardcode Devanagari-first. Default `'hi'` preserves the historic Devanagari-first layout. (`design.md` §9, §15)
- **Romanization.** Per `design.md §3.1`, the romanization style is chosen by the source language of the verse, not by the module: Sanskrit verses (Gita, embedded shlokas) use IAST + Hunterian digraphs; Awadhi/Hindi verses (Tulsidas chaupais, dohas, sorthas, chhands) use hand-curated pronunciation-based ASCII. Do not impose IAST on Awadhi — the diacritics misrepresent recitation.
- **Language toggle.** Reuse the existing context: `import { useGitaLanguage } from 'mobile/src/data/gita/language.tsx'` (type `Lang = 'hi' | 'en' | 'gu' | 'kn'`). Default `'hi'`, persisted at `@vedansh/language`. The `LanguageToggle` is a **2-segment** pill — [the chosen regional language] · [English] — where the regional segment is `hi` by default and switches to `gu`/`kn` via the More-tab language setting (persisted at `@vedansh/regionalLanguage`, exposed as `regionalLang` on the context). Do not add per-section toggles or extra segments; the four-way choice lives in More. **Do not** create a parallel context per section. (design.md §16; renaming the hook to `useReadingLanguage` is a follow-up tracked outside this rulebook.)
  - Every reader screen renders the toggle once, in the persistent toggle row above the pager (beside `AddToRoutineButton`) — it governs all pages of that reader.
  - Sections with a subsection listing (Chapters Index, kāṇḍa list, etc.) ALSO surface the toggle on that listing.
  - State is shared across surfaces via the same hook — no per-screen forks.
- **Categories & Deities.** Every `LibraryEntry` must have a valid `category` (one of the types in `categories.ts`) and at least one `deity` tag. The Home screen grid and deity section derive their content from these fields — no manual wiring required.
- **Japam items appear under their deity.** Japam mantras are shown under their tagged deity's listing (e.g., Gayatri Mantra appears under Maa Gayatri deity card). The deity card shows all content tagged with that deity regardless of category. Tapping a japam item from a deity list navigates to the Japam Counter screen for that mantra.
- **Pill vocabulary.** Verse-type pill is always `<term> · <subtitle or N>`. The middle dot `·` separator is stored **in the data** (in `labelHi`/`labelEn` fields), not added at render time. Data format: `"labelHi": "चौपाई · १"`, `"labelEn": "Chaupai · 1"`. Use Devanagari numerals in `labelHi` and Arabic numerals in `labelEn`. Sub-numbering uses `·` without spaces: `"चौपाई · ५५·१"`. Single-word labels without numbers (e.g., "टेक", "दोहा", "समापन दोहा") do NOT get a dot. The **leading term matches the user's selected language** — Hindi mode shows `श्लोक · १.१` / `चौपाई · ९`; English mode shows `Shloka · 1.1` / `Chaupai · 9`. Never hardcode one language — branch on `lang`. Do not invent new vocabulary without updating `design.md` first.
- **Every user-facing string respects `lang` — across all four languages.** If a string is visible to the user (visible Text, pill/badge, button label, top-bar title, modal body, toast, confirmation copy) and it carries semantic content beyond a number/symbol, it must resolve through the `localize.ts` helpers, never a two-way `lang === 'hi' ? … : …` ternary (which silently falls to English for gu/kn). Use: `pick(lang, { hi, en, gu, kn })` for hand-authored UI prose; `contentByLang(lang, hi, en)` for content/titles/labels (gu/kn re-script the Hindi); `meaningByLang(lang, hi, en)` for meaning prose (gu → re-scripted Hindi, kn → English); `verseLinesByLang` for recitation lines. Pick fonts with `verseToken`/`meaningToken`/`titleFontByLang` (`langType.ts`) so gu/kn render in their Noto serif, not tofu. Lang-paired data fields (`labelHi`/`labelEn`, `nameHi`/`nameEn`, `meaningHi`/`meaningEn`, …) feed those helpers. Hardcoded Devanagari in an otherwise-English flow (or vice versa) is a hard reject. Exceptions, which must be intentional: (a) bilingual stacked labels by design — listing card titles (both `nameHi` and `nameEn` render simultaneously, ordered/emphasised by the active language via `orderTitlesByLanguage()`), Resume sheet's `जारी रखें · Resume` button — where both languages render simultaneously; (b) numeric/symbolic content (`॥`, `1.9`, `4`). When in doubt, branch on `lang`. (Origin: WishlistScreen verse pill rendered `श्लोक 1.9` in English mode; Gita / Shiva Strotam verse pills had the same bug.)
- **No emoji, no photos.** Backgrounds are always faded hand-drawn sketches per the Section 6 treatment.
- **Type safety on detail screens (theerth).** `TheerthDetailScreen` is the theerth equivalent of a `*VersePage`. The `temple: TheerthTemple` prop and `route.params.templeId` must type-check without `as any`, `as unknown as`, `@ts-ignore`, or `@ts-expect-error`. Same hard-reject rule as the verse-page clause below applies.
- **Type safety on verse pages.** A reader screen renders only its own section's `<Pascal>VersePage.tsx`. Cross-section reuse via direct import is forbidden — it silently couples two sections to the same field shape and any drift becomes a runtime crash. The `verse` prop must type-check without escape hatches: `as any`, `as unknown as`, and `// @ts-ignore`/`// @ts-expect-error` on a `*VersePage` prop are a hard reject in review. If `tsc --noEmit` complains when wiring up a reader, the fix is the data shape or a section-specific page, **not** a cast. (Origin: PR #31 Balkand crash — `RamcharitmanasReaderScreen` cast `RamcharitmanasVerse` into `ShivaStrotamVersePage`, whose `verse.sanskrit` access threw on first paint because Ramcharitmanas uses `verse.lines`.)
- **Reader smoke test.** Every new `<Pascal>ReaderScreen.tsx` ships with `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx` that mounts the screen with the chapter-1 fixture and asserts the first verse renders without throwing. The test runs in CI and gates the merge — `tsc` alone does not catch field-shape mismatches that have been cast away.
- **Routing is centralised.** All section-from-listing navigation goes through `mobile/src/navigation/entryRoutes.ts` (`navigateToEntryStart` and `navigateToProgress`). Listing screens (`CategoryList`, `DeityList`) must not contain inline `if (entryId === 'foo') navigation.navigate(...)` ladders — those drift independently and a section appears in one listing but is a dead tile in another. (Origin: PR #31 — `DeityListScreen` only routed the original four sections, so all 14 new sections were silent no-ops under every deity until this rule.) When adding a section, register it in `entryRoutes.ts`; both listing screens then route it for free.
- **Multi-instance reader screens dispatch on a route param, not a hardcoded module.** A single screen that serves N entries (today: `ChalisaReaderScreen` for the nine chalisas, `AartiReaderScreen` for the eight aartis) must read its `route.params` discriminator (`chalisaId`, `aartiIndex`, etc.) and pick its data through a registry — never import a single section's data at the top of the file. Bookmark ids and `setProgress({ sourceId })` must use the discriminator, not a constant. (Origin: PR #31 — `ChalisaReaderScreen` accepted `chalisaId` in route params but ignored it; tapping Shiv/Durga/Ganesh Chalisa rendered Hanuman Chalisa content with `sourceId: 'hanuman-chalisa'` in progress.)

---

## 4. Verification before merging a new section

The slash command runs the first three; the human PR author runs the rest.

1. `cd mobile && npx tsc --noEmit` passes.
2. `mobile/assets/<id>/` contains ≥ 1 image and `mobile/src/data/<id>/index.ts` invariant checks pass at app boot (no thrown errors).
3. `cd mobile && npm run lint` reports **zero errors** — this is now the gate for font-family literals, `shadowColor` hex, and sub-10 `fontSize` (§3). Then also eyeball the diff for hex literals and hardcoded sizes on reading content, which the rule does not cover — search for `#[0-9A-Fa-f]{3,6}`, `fontFamily:`, and `fontSize:` to confirm. Any `fontSize:`/`lineHeight:` literal on verse / transliteration / meaning / commentary text is a hard reject; it must reference a `typography` token (see §3 "One reading type scale") — except the two sanctioned constrained surfaces (`ShareCard`, `JapamCounterScreen`), which may carry layout-tuned sizes but must shrink-to-fit, not truncate.
4. App boots in Expo dev client; the new card is visible on Home below the existing active sections; tapping navigates to a working reader; every page shows a background image; every verse has `meaningHi` and `meaningEn` populated.
5. The new section appears correctly under its category tile (tap the tile on Home → item is listed). If deity tags are set, also verify the item shows under those deity chips.
6. Hindi/English toggle flips meaning text on **every** page (sample at least page 1, middle, and last). Toggle is visible on every reader page; if a subsection listing exists, also visible there. While toggled to English, confirm **no Devanagari leaks into the verse pill, top-bar title, modals, or any other user-facing string** outside intentional bilingual labels — and the same check in reverse for Hindi. (Origin: Wishlist pill, Gita & Shiva Strotam verse pills shipped Hindi-only `श्लोक · 1.1` in English mode.)
7. If the section ships an English transliteration field (`transliteration[]` or `linesEn[]`), spot-check the romanization style matches the source language per `design.md §3.1`: Sanskrit verses use IAST diacritics; Awadhi/Hindi verses use pronunciation-based ASCII. Mismatched style (IAST on Awadhi or plain ASCII on a Sanskrit shloka) is a hard reject. **Also run the §10.12 greppable gate**: no raw ITRANS/encoder residue (mid-word capitals, `~n`, `RRi`, `chCh`), no leftover dandas/pipes (`।`, `॥`, `|`) or verse-number markers, and `linesEn.length` == the paired `sanskrit`/`lines` length for every verse.
8. If subsections exist: chapters list renders; tapping any chapter lands on verse 1 of that chapter; back button returns to chapters list, not Home.
9. Grep the new screen and component files for `as any`, `as unknown as`, `@ts-ignore`, and `@ts-expect-error`. Any hit on a `*VersePage` `verse=` prop or on a navigation `route.params` access is a hard reject — re-shape the data or add a section-specific component instead.
10. The new `<Pascal>ReaderScreen.test.tsx` exists and passes locally and in CI. Do not merge a green PR whose test file is missing.
11. **Per-section device check.** If the PR adds N sections, every one of them must be opened in the Expo dev client individually — Home tile → reader → toggle language → swipe to last verse → back. A single "tested locally" sign-off does not cover N sections; capture one screenshot per section and paste them in the PR description.
12. **Both listings reach the reader.** Open the section from Home → its category tile **and** from Home → By Deity → its deity card. Both paths must land on the same reader. If the section appears as a card but tapping is a no-op, the routing helper (`entryRoutes.ts`) is missing a case.
13. **Multi-instance readers serve the right content.** For sections that share a screen (chalisas, aartis, future N-of-a-kind), open at least two distinct entries and confirm titles, verses, and `sourceId` (visible via bookmarks) actually differ — a reader hardcoded to one variant will silently render the wrong content for the others.
14. **Section is reachable from search.** `mobile/src/data/__tests__/searchIndex.test.ts` already enforces that every active `library` entry produces verse entries in the search index — but verify manually: open the global search (top-right magnifier on Home), type a unique word from the section's first verse, confirm the result row tap lands on the correct reader page. See §8 for the per-shape integration paths.
15. **Maestro E2E flow updated.** `mobile/.maestro/<category>-smoke.yaml` includes the new section's `nameEn` in its `assertVisible` list (for an existing category) or a new flow file exists (for a new category). Run `npm run test:e2e` locally and confirm the flow passes on both iOS Simulator and Android Emulator before merge. See `mobile/.maestro/README.md` for the per-category template.
16. **Token tables in `design.md` still match the code.** `mobile/src/theme/__tests__/docTokenSync.test.ts` asserts the §2 colour table, the §4 radii/gutter/elevation values, and the 10 pt floor against `theme/`. It runs in `npm run test:readers`. Prose still needs a human, but a tuned token can no longer leave a stale number in the doc.
17. **Docs updated in the same PR (§0.1).** If the change touched any user-facing surface, the matching `design.md` section is updated (or added); if it changed the integration contract, the matching RULEBOOK section is updated. Name the touched doc sections in the PR description. An untouched doc alongside a UI/contract diff is a hard reject.

---

## 5. What this rulebook is **not**

- Not a substitute for `design.md`. This rulebook governs the **integration shape**; `design.md` governs the **visual language**. Read both.
- Not a substitute for testing on a device. `tsc` does not catch broken `require('./missing.png')`.
- Not a license to skip review. A scaffolded section still needs human eyes on the content data and the chosen background image.

---

## 6. Navigation architecture

The app uses a bottom tab bar with **five tabs** (`mobile/src/navigation/TabNavigator.tsx`): Home, Bhakti (Daily Bhakti), Panchang, Bhajan (Audio), and More. There is no Bookmarks tab — saved verses live at More → Wishlist (design.md §24). The tab bar **stays visible inside readers**; only the routes listed in `IMMERSIVE_HOME_ROUTES` (currently `VratKathaReader`) hide it. See design.md §17 for the full bar spec.

New sections are registered in `mobile/src/navigation/HomeStackNavigator.tsx` (not the old `RootNavigator.tsx`). The Home screen dynamically renders categories from `mobile/src/data/categories.ts` and deities from `mobile/src/data/deities.ts` — adding a new section only requires:
1. Adding the `LibraryEntry` to `texts.ts` (with `category` and `deities` fields)
2. Registering reader route(s) in `HomeStackNavigator.tsx`

No manual routing in HomeScreen is needed — `CategoryListScreen` filters items by their `category` field automatically.

### 6.1 Onboarding surfaces — feature tour & What's New (contract)

The first-launch **feature tour** (`FeatureTour.tsx`) and post-update **What's New sheet** (`WhatsNewModal.tsx`) are gated by `TourContext.tsx` and driven by data in `mobile/src/data/tour/{steps,whatsNew}.ts` (design.md §47). Two contract rules bind them to releases and navigation:

1. **Version bump discipline.** `APP_TOUR_VERSION` in `data/tour/whatsNew.ts` **must equal** `app.json` `expo.version` (enforced by `src/data/__tests__/tourContent.jest.test.ts`). On every version bump: update `APP_TOUR_VERSION` and add a `whatsNew[version]` entry listing **only** that release's new features (bilingual `titleHi/En` + `bodyHi/En`); omit the entry (or leave `items` empty) to intentionally skip the sheet. `getWhatsNewForVersion` returns null for unknown/empty versions → sheet suppressed. The same jest gate also fails a bump that forgets the entry.
   - **Install vs update.** `TourContext` shows the **full tour** only to a genuine fresh install (no prior-usage key from `UPGRADER_SIGNAL_KEYS`, §44) and shows the version's **What's New** to a returning user — so a release's own `whatsNew` entry is reachable by the users updating into it. Do not "simplify" this to `tourCompletedVersion === null` alone; that regresses every existing user into the full tour and makes the current version's release notes unreachable.
2. **New tab ⇒ consider a tour step.** The tour walks the real tabs; adding a tab to `TabParamList` (§6) should usually add a `tourSteps` entry with its `navigateTo`. A compile-time check pins every step's `navigateTo.name` to a real tab, so an invalid target fails `tsc`.

**Language.** The tour is intentionally bilingual (hi+en) on every card — a pre-language-pick welcome, never a hi/en `lang` branch. The What's New sheet **does** honour the reading language (fires for returning users) and must route text through `contentByLang` + fonts through `titleFontByLang`/`meaningToken` — never a bare hi/en ternary (§3, wiki `concepts/languages`).

**Tests.** UT: `src/contexts/__tests__/TourContext.test.tsx`, `src/components/__tests__/FeatureTour.test.tsx`, `src/data/__tests__/tourContent.jest.test.ts`. E2E: `.maestro/feature-tour-e2e.yaml`; `_launch.yaml` dismisses the auto-tour (optional `Skip`) so it never blocks other flows on a fresh simulator.

---

## 8. Search index integration for new sections

Every new section must also be reachable from global search (`SearchScreen`). The on-device index is built by `mobile/src/data/searchIndex.ts` from the same data the readers consume — there is no parallel content source. New sections must satisfy one of two integration paths:

**Path A — standard verse shapes (no code change required).** The index already handles three verse shapes:

| Verse shape | Devanagari source | Latin source | Used by |
|---|---|---|---|
| `lines` + `linesEn` | `lines` | `linesEn` | chalisas, aartis, sundarkand, ramcharitmanas |
| `sanskrit` + `linesEn` | `sanskrit` | `linesEn` | shiva-strotam, durga-stotram, ganesh-stotram, vishnu-sahasranama, hanuman-ashtak, ram-stuti |
| `sanskrit` + `transliteration` | `sanskrit` | `transliteration` | bhagavad-gita |

If a new section uses one of the above shapes **and** its data accessor follows the established pattern (`get<Section>Chapter(chapter)` returning `{ verses: V[], titleHi, titleEn }`, plus a `<section>ChaptersManifest` array), it is integrated by adding one branch to `buildVerseEntries()` in `searchIndex.ts` that selects the right accessor. No new normalization, no new ranking. The accessor branch is ~10 lines.

**Path C — theerth (no verses).** Sections with `category === 'theerth'` have no verses; they have temples. The integration:
1. Add a branch to `buildSearchEntries()` (rename of `buildVerseEntries()` once theerth lands) that produces one search entry per `TheerthTemple`, with `nameHi/En`, `cityHi/En`, `stateHi/En`, `significanceHi/En`, and `originStoryHi/En` appended to the searchable `fields` array.
2. The search-result row carries `templeId`; tap routes via `entryRoutes.ts` → `navigateToTheerthDetail(templeId)`.
3. Add a test case in `searchIndex.test.ts` asserting a temple-name query returns the right detail target.

**Path B — novel verse shape.** If the section invents a new field shape (e.g. multi-script transliteration, multiple-language meanings beyond Hi/En), the integration is bigger:
1. Extend the `makeVerseEntry` call site in `searchIndex.ts` with the new fields appended to the searchable `fields` array.
2. Update `SearchVerseEntry` if a new field needs to be rendered in the result row.
3. Add a test case in `mobile/src/data/__tests__/searchIndex.test.ts` that queries against the new field and asserts hits.

**Hard CI gate.** `searchIndex.test.ts` contains a coverage assertion: every active, non-hidden entry in `library` must produce at least one verse entry in the index. A new section that adds `LibraryEntry` to `texts.ts` without wiring `buildVerseEntries()` will fail this test before merge. There is no way to silently ship an un-searchable section.

**Section-name + deity-name fields are free.** `nameHi`, `nameEn`, and `sub` from the `LibraryEntry` itself are indexed for the "Sections" result group with zero extra code. Same for deity tags. Adding a section to `library` and `entryRoutes.ts` is enough to make the section name itself searchable; only verse-level search needs the per-shape branch.

**Routing.** Search result taps route through `buildProgressTarget` (verses) or `navigateToEntryStart` (sections) in `entryRoutes.ts`. Both already use the same registries that bookmarks and resume use, so a section already registered in `entryRoutes.ts` is reachable from search results without extra work.

---

## 9. Cross-platform verification (iOS + Android)

Every implementation must work on **both iOS and Android**. This is non-negotiable.

- **Simulator + Emulator.** Before any section ships, it must be tested on both an iOS Simulator (via Xcode) and an Android Emulator (via Android Studio / `emulator` CLI). A single-platform test does not constitute a passing verification.
- **Automated verification via Maestro — one flow per category, every section covered.** `mobile/.maestro/` holds YAML flow files that drive the simulator/emulator without manual taps. **Every active category has its own smoke flow** that opens the category tile, lists every section that lives under it, opens a representative reader, verifies the language toggle, and returns home:
  - `granth-smoke.yaml` · `stotram-smoke.yaml` · `chalisa-smoke.yaml` · `japam-smoke.yaml` · `aarti-smoke.yaml` · `sanskar-smoke.yaml`
  - All flows share `_launch.yaml` (boot + project select) via `runFlow:` so a change to the launch path ripples to all flows.
  - `config.yaml` sets `snapshotKeyHonorModalViews: false` so Maestro reads past iOS modal sheets (notably Expo Go's first-launch dev menu).
  - Run all flows: `npm run test:e2e` (alias for `maestro test .maestro/`). Run a single flow: `maestro test --config .maestro/config.yaml .maestro/<category>-smoke.yaml`.
- **The Maestro flow is part of the section contract, not an optional follow-up.** When adding a section to an existing category, append an `- assertVisible: "<NameEn>"` to that category's smoke flow's CategoryList block (Section 2 of `mobile/.maestro/README.md` documents this). When adding a brand-new category, copy `sanskar-smoke.yaml` as the template, swap section names, and add a row to `mobile/.maestro/README.md`'s flow table. A PR that adds a section but does not update the matching `<category>-smoke.yaml` is a hard reject — same bar as a missing reader-screen test.
- **Element selection in Maestro flows.** Prefer visible text (`tapOn: text: "..."`) and `accessibilityLabel` matching. `LibraryCard` uses `${nameEn}. ${sub}. Tap to open.` — match on just the `nameEn` substring. `CategoryCard` uses the shorter `${nameEn}. Tap to open.` — same substring matches both. NEVER use `point: x%, y%` coordinates — they break across device sizes and were the cause of past flaky test runs.
- **Platform-specific rendering.** Check for platform divergence in: safe area insets, font rendering (Devanagari kerning differences), background image scaling, navigation gestures (swipe-back on iOS vs hardware back on Android), status bar behaviour.
- **PR screenshots.** PR descriptions for new sections must include screenshots from **both platforms** — not just one. At minimum: reader page 1 on iOS, reader page 1 on Android.
- **No platform-only code without justification.** `Platform.select()` or `Platform.OS` branching is acceptable only when addressing a verified rendering difference. Do not pre-emptively add platform branches "just in case."

---

## 10. Content accuracy and verification

All content (slokas, mantras, verses, meanings, instructions) must be **verified against authoritative internet sources** before shipping. No discrepancy is acceptable.

- **Authoritative sources.** Use Gitapress (gitapress.org), Gita Supersite (gitasupersite.iitk.ac.in), Sanskrit Documents (sanskritdocuments.org), Arya Samaj publications, or university-hosted Sanskrit databases. YouTube transcriptions and random blogs are NOT authoritative.
- **Cross-verification.** Each sloka must be verified against at least 2 independent authoritative sources. If sources disagree on a word, use the majority reading and note the variant in a comment in the JSON `source` field.
- **No AI-generated Sanskrit.** Slokas must be copied from verified sources, never composed or "completed" by an LLM. If a verse is incomplete in one source, find the full text in another — do not guess missing words.
- **Transliteration accuracy.** IAST transliterations must be checked character-by-character against the Devanagari. Common errors to watch: anusvara (ṃ vs. n/m), visarga (ḥ), retroflex consonants (ṭ/ḍ/ṇ vs t/d/n), long vowels (ā/ī/ū).
- **Meaning faithfulness.** Hindi and English meanings must faithfully convey the verse's meaning without adding theological interpretation beyond what the verse states. Simplification for readability is fine; invention is not.
- **Source attribution.** Every JSON data file must include a `source` object with `baseText` (authoritative source name) and `retrievedOn` (ISO date). If multiple sources were used, list them.

---

## 11. Explanation and importance of every sloka and ritual

Every content section — especially the `sanskar` category — must include **explanation (अर्थ) and importance/significance (महत्त्व)** for each sloka, mantra, or ritual. This mirrors the depth provided in stotram sections.

- **`meaningHi` and `meaningEn` are never just translations.** They must explain: (a) the literal meaning of the verse, (b) the context/occasion when it is recited, and (c) the spiritual or practical significance. A bare word-for-word translation is insufficient.
- **`vidhiHi` / `vidhiEn` for instructional content.** Sections that teach practices (Surya Namaskar, Tulsi Puja, etc.) must include step-by-step instructions in the vidhi fields. Instructions should be clear enough for a child (8-14 years) to follow independently.
- **Benefits/significance.** Each ritual or sloka must explain WHY it is practiced — the scriptural basis, the spiritual benefit, and (where applicable) the health/wellbeing benefit per Ayurvedic or Yogic tradition.
- **Scriptural reference.** Where a sloka originates from a specific text (e.g., Gita 4.24 for Brahmarpanam), cite the source in the meaning field.

---

## 12. Pull-request hygiene for new sections

These rules exist because PR #31 (the Balkand crash) demonstrated that bulk multi-section PRs invite pattern-match review, and that `tsc` escape hatches will be approved if the commit message frames them as "compatibility casts." Both failure modes are now closed.

- **One section per PR by default.** Up to three only when they share a parent (e.g., three kāṇḍas of the same granth) and only with a per-section checklist in the description. A PR adding 14 sections is a hard reject regardless of how clean each diff looks.
- **PR description template (mandatory for any PR adding a new section):**
  - Section `id`, category, deities — one row per section.
  - Screenshot of the loaded reader for each section (page 1, language toggle visible).
  - Confirmation that `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx` exists and passes.
  - Explicit line: "No `as any` / `@ts-ignore` introduced on verse-page props or route params."
- **Self-flagged casts are flags, not justifications.** Commit messages that contain "cast", "compatible interface", "type compatibility", or "as any" against a verse-page prop must be challenged in review. The fix is upstream (data shape or new component), not the cast.
- **Reviewer responsibility.** Approving a new-section PR requires confirming items 1, 9, 10, and 11 of §4 yourself — not trusting the author's checklist. Sign off only after opening the dev client (or the included screenshots) and seeing the reader render.

---

## 10. Content integrity & verification

These rules govern the correctness of religious/devotional content data. They exist because fabricated, incomplete, and misattributed text was shipped and caught only after user reports. Every rule below is a hard gate — violations block merge.

### 10.1 Internet verification is mandatory
Every religious text (aarti, chalisa, stotram, granth verse) must be verified against **at least 2 independent authoritative internet sources** before shipping. Acceptable sources: Gita Press editions, sanskritdocuments.org, hindunidhi.com, drikpanchang.com, university repositories, and well-established devotional sites with cross-referencing. News/SEO sites (NDTV, Times Now) are acceptable only as a second confirmation, never as sole source.

### 10.2 Source citation in data
Every content JSON file must have a `source.baseText` field naming the edition or website(s) verified against, and `source.retrievedOn` with the ISO date of verification. Example: `{"baseText": "brandbharat.com, vignanam.org", "retrievedOn": "2026-05-23"}`. A file without source citation is unverified and must not ship as `active`.

### 10.3 No AI-generated liturgical text
Religious text must come from published traditional sources. Never generate, paraphrase, or "reconstruct" verse text using an LLM. Meanings/commentary may be editorial (clearly labeled), but the prayer text itself (`lines`, `sanskrit`, `linesEn`) must be verbatim from a verified source. Origin: Durga Chalisa was partially AI-generated.

### 10.4 Deity metadata accuracy
The `deity` field (and `deities` array in `texts.ts`) must match the actual deity addressed in the text, not a loose theological category. Verify by reading the text's opening invocation. Origin: Gayatri Mantra was tagged "durga" (it invokes Savitr/the Sun), Om Jai Jagdish was tagged "krishna" (it's a Vishnu aarti).

### 10.5 Complete texts only — never fabricate
Ship the full canonical version (all verses) only after internet verification. Missing stanzas are worse than a "coming soon" label. Never add wrong, pre-generated, or unverified text to fill gaps. If the complete verified text isn't available, don't ship the section at all — mark it `status: 'coming'` until verified. Origin: Hanuman Aarti had 6 of 13 verses with a fabricated closing, Jai Ambe Gauri had 5 of 12.

### 10.6 No fabricated content
Every line in a content file must exist in at least one published source. Fake closing verses, paraphrased refrains, composite mashups from different texts = hard reject. If a line appears in zero internet sources, it is fabricated and must be removed. Origin: "हनुमत बीर सकल दुख भावे" (Hanuman Aarti closing) appeared in zero published sources.

### 10.7 Both platforms per change
Every content/data change must be verified on both iOS and Android before OTA push. Bundle and test on both platforms — a rendering issue on one platform (especially with Devanagari fonts) may not appear on the other.

### 10.8 Background image per deity
Every deity in the `Deity` type must have a distinct, thematically correct background image in `backgrounds.ts`. Never use another deity's image as a placeholder (e.g., Krishna's image for Vishnu, or Shiva's image for Gayatri). If no appropriate image exists yet, commission/source one before adding the deity. Origin: Vishnu was using Krishna's bansuri image, Gayatri was using Shiva's trishul image.

When generating a new deity background, use this prompt template and replace the bracketed fields:

```text
Create a faded, vintage hand-drawn devotional illustration of Hindu deity [DEITY_NAME], in the style of an aged sepia ink-and-pencil sketch on old parchment, like a soft antique lithograph. Understated, low-contrast, not vivid, not saturated, not photorealistic.

Subject: [DEITY_NAME], serene and devotional, shown with the deity's recognizable traditional attributes: [KEY_SYMBOLS_OR_OBJECTS]. Use a graceful sacred pose and culturally appropriate attire. Add a soft halo only if appropriate. Supporting elements may include [SUPPORTING_ELEMENTS], but keep them faint and uncluttered.

Palette: warm monochrome sepia, muted cream and brown tones only. No bright yellows, no strong colors. Soft faded pencil linework, gently fading toward the edges.

Composition: square 1:1 frame. Anchor the deity in the upper-center / top half of the image. The bottom third must remain mostly empty plain parchment negative space for app text overlay. Keep the illustration calm, devotional, readable, and not busy.

Background: plain aged parchment with subtle paper grain and very soft edge wear. No hard border, no decorative frame, no readable text, no lettering, no captions, no watermark, no logo, no UI elements.

Format: 1024 x 1024 PNG.
```

### 10.9 Deity display names must be recognizable
Deity `nameHi`/`nameEn` must use the popularly recognized devotional name that users will identify. Use the name devotees actually use in prayer/temple context (e.g., "माँ गायत्री" not "सवितृ देव", "श्री विष्णु" not "नारायण"). When in doubt, use the name that appears on temple signage. Origin: Users couldn't identify "Savitr Deva" as Gayatri.

### 10.10 Verse count sync is atomic
`texts.ts` `verseCount` must always equal the JSON `verses.length`. The `sub` field count must match. After any content change that alters verse count, grep for the old count in: (a) `chapters-manifest.json`, (b) `index.ts` invariant assertions, (c) `chapteredTotals.test.ts`. Update all three atomically in the same commit. Origin: Every content fix in this audit caused cascading test failures from stale counts.

### 10.11 No duplicate content across sections
A text must exist in exactly one location/category. Standalone Ashtak/Ashtakam texts (like Sankat Mochan Hanumanashtak) belong in the Ashtakam category — not duplicated in aarti or stotram. Before adding content, grep the repo for the text's first line to confirm it doesn't already exist elsewhere. Origin: Sankat Mochan existed in both aarti/ and hanuman-ashtak/ with different (both wrong) versions.

### 10.12 Transliteration integrity
No Devanagari characters (U+0900–U+097F) in `linesEn`/`transliteration` fields. No empty strings (use "(transliteration pending)" if unavailable). Correct romanization scheme per `design.md §3.1`: Sanskrit texts use IAST with Hunterian digraphs; Awadhi/Hindi uses pronunciation-based ASCII. Run `grep -rP '[ऀ-ॿ]'` on transliteration fields before shipping. Origin: 23 Sundarkand lines had raw Devanagari, 19 Gita verses had transliteration spillover between adjacent verses.

**No raw ITRANS / scheme-encoder residue.** `linesEn`/`transliteration` is the *reader-facing* romanization, never the raw encoder source it was derived from. The following are a hard reject anywhere in these fields — they mean an ITRANS/Harvard-Kyoto string was pasted in unconverted (the bug behind Krishna Stotram, Ramcharitmanas Mangalacharan, and three stotrams in the OTA audit):
- Tilde nasals: `~n`, `~N`, `~m`, or a bare `.N`/`.n`/`.h` anusvara/visarga dot.
- Vocalic-R as `RR`/`RRi` (use IAST `ṛi`), or any retroflex/sibilant written with a trailing capital (`Sh`, `ShT`, `chCh`, `Ch` mid-word).
- **Mid-word capital letters** (e.g. `maNDanaM`, `kRRiShNa`). A capital is only ever valid as the *first* letter of a line or a proper noun in the Awadhi ASCII style — never inside a word. This is the single most reliable ITRANS tell.

**No leftover dandas or verse numbers.** Strip `।`, `॥`, the ASCII pipe `|`/`||`, and trailing verse-number markers (`॥1॥`, `||1||`) from the romanization. Sanskrit IAST drops them entirely; Awadhi ASCII joins a couplet's two halves with `. ` (period-space) per the Hanuman Chalisa / Sundarkand convention. A stray `|` in an otherwise-clean ASCII line is the tell (origin: Shiv Chalisa closing doha).

**Line-count parity.** `linesEn.length` must equal the paired `sanskrit.length` / `lines.length` for every verse — the reader renders `linesEn` index-paired, so a mismatch silently drops or misaligns a line. (The Gita's `transliteration[]` is **exempt**: it is intentionally split per pada — e.g. 2 `sanskrit` lines → 4 `transliteration` lines — for the side-by-side layout, so it is *not* index-paired.)

**Automated gate (run before shipping any content).** A plain grep can't isolate field *values* (the literal `linesEn` key trips a mid-word-capital check), so scan the parsed JSON. This is the exact check used in the audit that closed these gaps:
```python
python3 - <<'PY'
import json, glob, re, sys
TF={"linesEn","transliteration"}
res=re.compile(r'~[nNm]|RRi?|\.[Nnh]\b|[a-zāīūṛṅñṭḍṇśṣḥṁ][A-Z]|chCh')  # ITRANS residue
danda=re.compile(r'[।॥|]')                                            # leftover dandas/pipes
bad=0
for f in sorted(glob.glob("src/data/**/*.json", recursive=True)):
    d=json.load(open(f, encoding="utf-8"))
    def walk(n):
        global bad
        if isinstance(n, dict):
            for k,v in n.items():
                if k in TF and isinstance(v, list):
                    for l in v:
                        if isinstance(l, str) and (res.search(l) or danda.search(l)):
                            print(f"RESIDUE {f}: {l[:60]}"); bad+=1
                    if k=="linesEn":                       # transliteration[] (Gita) exempt
                        p=n.get("sanskrit") or n.get("lines")
                        if isinstance(p, list) and len(p)!=len(v):
                            print(f"PARITY {f}: {n.get('id')} {len(p)}!={len(v)}"); bad+=1
                else: walk(v)
        elif isinstance(n, list):
            for v in n: walk(v)
    walk(d)
sys.exit(1 if bad else 0)
PY
```
Origin: the same raw-ITRANS paste recurred across Krishna Stotram, Ramcharitmanas ch1 (all 19 verses), Shiva Tandava, Vishnu Sahasranama, Ganesh Atharvashirsha, and 23 garbled Sundarkand chaupai lines — because §10.12 named the *scheme* but never banned the encoder residue, the leftover dandas, or gave a runnable check.

---

## 11. Theerth archetype (तीर्थ — map-driven pilgrimage tours)

Theerth is a fundamentally different content shape from the verse archetypes in §§1–2. The unit is a **temple**, the entry surface is a **map of India** (stylised SVG, not a tile provider), and the destination is a **vertical-scroll detail screen** with prose narrative — no swipe-paginated verse reader.

Full proposal lives in [`docs/roadmap/prds/07-temple-tour.md`](./docs/roadmap/prds/07-temple-tour.md). This section captures the contract; the PRD captures the rationale.

### 11.1 Section data shape

Source of truth: `mobile/src/data/theerth/temples.ts`. The shipped shape (71 temples):

```ts
type TheerthGroup =
  | 'jyotirlinga'
  | 'char-dham'
  | 'chota-char-dham'
  | 'shakti-peeth';               // fixed set + groupMeta/groupOrder in temples.ts

type BaseTempleEntry = {
  id: string;                     // e.g. "somnath"
  nameHi: string;                 // "सोमनाथ"
  nameEn: string;                 // "Somnath"
  cityHi: string;
  cityEn: string;
  stateHi: string;                // "गुजरात"   ← mandatory for grouping
  stateEn: string;                // "Gujarat"
  coordinates: { lat: number; lng: number };  // mandatory — pin position on map
  deity: Deity;                   // existing union — MUST match invocation per §10.4
  groups: TheerthGroup[];         // pilgrimage-tradition tags; may be [] for "other famous"
  addedInVersion?: string;        // NEW-badge tracking, mirrors LibraryEntry
};

type TempleDetail = {
  significanceHi: string;         // single prose block (NOT a paragraph array)
  significanceEn: string;
  originStoryHi: string;          // Sthala Purāṇa narrative — single prose block
  originStoryEn: string;
  sources: readonly { label: string; url: string }[];  // ≥ 2 per §10.1
};

type TempleEntry = BaseTempleEntry & TempleDetail & { addedInVersion: string };
```

There is no per-temple `background` field — the detail screen resolves its sketch by presiding deity (with per-temple id overrides) via `getTheerthBackground()` in `mobile/src/data/backgrounds.ts` (§11.4). There are no `introHi/introEn` fields — the browse surface has no intro prose, only the tap-a-pin hint line on the map view.

`coordinates` and `stateHi/En` are mandatory: the map can't pin without lat/lng, the state-list view can't group without state labels. Do not derive state from lat/lng via polygon lookup — store it explicitly.

`groups[]` tags each temple with the pilgrimage traditions it belongs to. A temple may belong to multiple groups (e.g., Rameshwaram is `['jyotirlinga', 'char-dham']`; Kedarnath is `['jyotirlinga', 'chota-char-dham']`); a temple with no traditional-yatra membership uses `groups: []` and appears under "Other Famous Temples" in the By-Yatra view. The four group tags are fixed; do not invent new ones without amending this section. New traditional circuits (e.g., Divya Desam, Pancha Bhoota Sthalam) require adding a new tag to the `TheerthGroup` union AND a `groupMeta` entry in the data module before they can be used.

### 11.2 File set (replaces §2 rows 1–6 for theerth)

| # | Path | Action | Template |
|---|------|--------|----------|
| 1 | `mobile/src/data/<id>/<id>.json` | create | follow `TheerthTemple[]` shape above |
| 2 | `mobile/src/data/<id>/index.ts` | create | typed loader + invariant checks (every temple has lat in [6, 38], lng in [68, 98], non-empty significance + origin arrays, ≥2 sources) |
| 3 | `mobile/assets/<id>/` + `index.ts` | create | one sketch per temple — same parchment treatment per design.md §6 |
| 4 | `mobile/src/components/IndiaMap.tsx` | reuse | shared SVG component — do not fork per section |
| 5 | `mobile/src/screens/TheerthMapScreen.tsx` | reuse | shared screen — accepts `theerthId` in route params, looks up data via a registry |
| 6 | `mobile/src/screens/TheerthDetailScreen.tsx` | reuse | shared screen — accepts `templeId` in route params |
| 7 | `mobile/src/navigation/types.ts` | edit | add `TheerthMap: { theerthId: string }` + `TheerthDetail: { templeId: string }` route params (one-time, not per-section) |
| 8 | `mobile/src/navigation/HomeStackNavigator.tsx` | edit | register `TheerthMap` + `TheerthDetail` (one-time, not per-section) |
| 9 | `mobile/src/data/texts.ts` | edit | append `LibraryEntry` with `category: 'theerth'`, deities derived from the temples' deity field |
| 10 | `mobile/src/navigation/entryRoutes.ts` | edit | route theerth entries to `TheerthMapScreen` |

Note rows 4–6 are **shared infrastructure** — built once when the first theerth section ships, reused for every subsequent theerth section (Char Dham, Shakti Peetha, etc.). Adding a second theerth tour is just rows 1–3 + 9–10.

### 11.3 Map technology

Stylised SVG India outline rendered via `react-native-svg`. **Do not** install `react-native-maps` or any tile-provider SDK. No API keys, no billing, no network. The map is a fixed-aspect static rendering with pins overlaid via lat/lng → x/y linear projection within India's bounding box (lat 6–38, lng 68–98).

### 11.4 Content integrity (theerth-specific)

All of §10 applies. The high-risk ones for theerth:

- **§10.3 No AI-generated liturgical text.** Origin-story prose (Sthala Purāṇa narratives) must come verbatim from published authoritative sources — Shiva Purāṇa (Gita Press), temple trust publications, ASI listings. Never paraphrase or "reconstruct" via LLM.
- **§10.1 Internet verification.** Each temple's origin story must cite ≥ 2 independent authoritative sources in its `sources[]` array.
- **§10.4 Deity accuracy.** Each temple's `deity` field must match the invocation in the source narrative — do not guess from the temple name.
- **§10.8 Background per temple.** The detail screen renders the temple's presiding **deity** background (every deity ships a verified, thematically-correct sketch per §10.8) via `BackgroundLayer` — this is the shipped default. A bespoke per-temple sketch may be added later to override it, but never fall back to an *unrelated* deity's image.
- **Coordinate sanity.** Coordinates outside India's bounding box (lat 6–38, lng 68–98) fail the `index.ts` invariant. This catches lat/lng swaps (common copy-paste error from sources that write `lng, lat`).

### 11.5 Verification for theerth (replaces §4 steps 4–8)

1. App boots; the Theerth tile is visible on Home under Categories.
2. Tapping the Theerth tile lands on the Theerth **browse listing** (no map on the landing surface): a two-way segmented toggle `राज्य · By State` / `श्रेणी · By Category` (By Category is the default) over grouped cards with counts. (design.md §26)
3. Drilling into a state or category re-pushes the screen with `stateEn`/`group` params and shows the `<IndiaMap>` for that subset, with every temple pinned at the right location (eyeball-check against a known map — e.g., Kashi Vishwanath is in UP, not Tamil Nadu).
4. Multi-group temples (Rameshwaram, Kedarnath, Badrinath) appear under every category they belong to in the By-Category view.
5. Language toggle swaps title, view-toggle labels, group/state labels, pin tooltips, and the tap-a-pin hint. No Devanagari leaks in English mode; no English leaks in Hindi mode.
6. Tapping a pin lands on `TheerthDetailScreen` for that temple; same for tapping a list row.
7. Detail screen shows, over the temple's presiding-deity background (§11.4): hero (temple name + city + state + deity badge), `महिमा · Significance` block, `उद्भव कथा · Origin Story` block, sources footer. Both languages populated (verified in §10).
8. Back from detail returns to the browse/drill-in screen preserving its view-mode state.
9. Per-temple device check on iOS AND Android — Devanagari rendering in pin tooltips can differ between platforms.

---

## 12. Intent discovery metadata (PRD-B)

Intent-driven discovery is metadata over bundled content, not new scripture text and not an astrological prescription engine.

### 12.1 File set

| # | Path | Contract |
|---|------|----------|
| 1 | `mobile/src/data/purposes.ts` | Source of truth for shipped purpose ids, Hindi/English labels, and icon keys. Every purpose must have at least one active tagged text. |
| 2 | `mobile/src/data/discoveryMeta.ts` | Source of truth for per-text purpose tags, best days, best festivals, best time, optional Viniyog, and source line. Keys must be active `library` ids. |
| 3 | `mobile/src/data/deityEssays.ts` | Source-cited deity page essay copy. Keys must be valid `Deity` ids. |
| 4 | `mobile/src/data/searchIndex.ts` | Purpose display names and ids must be indexed as section fields so search can find texts by user intent. |
| 5 | `mobile/src/screens/BrowseByPurposeScreen.tsx` / `PurposeListScreen.tsx` | Purpose grid and filtered list. Rows route through `navigateToEntryStart()` and preserve resume-sheet behaviour. |
| 6 | `mobile/src/components/WhenToRecitePanel.tsx` | Reader metadata panel. Render on verse page 1 only (`index === 0`), below the meaning inside that page scroll; never repeat on pages 2…N. |
| 7 | `mobile/src/components/TodayRecommendationsRow.tsx` | Home By-Day/By-Festival recommendation row. Must reuse `deityForWeekday()` and `getObservancesForDate()` rather than adding date logic. |
| 8 | `mobile/src/screens/DeityDetailScreen.tsx` | Deity essay plus texts grouped by category. Rows route through `navigateToEntryStart()`. |

### 12.2 Curation rules

- Purpose tags are curated associations. Do not generate or infer new devotional claims from an LLM. Each `discoveryMeta` row must carry a non-empty `source` explaining the association/provenance.
- `bestDays` values are JavaScript weekdays (`0` Sunday … `6` Saturday), matching `data/routine/vaar.ts`.
- `bestFestivals` values are observance rule ids resolvable by `getRuleById()`.
- `bestTime` is a small closed set (`brahma-muhurta`, `sunrise`, `sunset`, `any`). Add a new value only with a label helper update and tests.
- Viniyog fields are whole-text metadata. They must not be rendered per verse or stored on verse rows.
- Purpose search must not create standalone “purpose result” rows unless a new UX explicitly calls for them; the current contract is section-level matching.

### 12.3 Verification

- `contentCorrectness.test.ts` verifies every purpose has at least one active text, every metadata key/id/day/festival is valid, every metadata row has a source, Tuesday recommendations include Hanuman content through the vaar map, and deity essays are source-cited.
- `searchIndex.test.ts` verifies English and Hindi purpose names find tagged sections.
- Jest screen tests verify Browse by Purpose, Purpose List, Deity Detail, and the first-page-only reader panel.
- A Maestro flow should cover Home → By Purpose → purpose list → text → reader before merge; if it is not run, the PR must state that explicitly.

---

## 13. Kundali and Rashifal engine (PRD-C)

### 13.1 One pure astronomy foundation

- Extend the existing `mobile/src/panchang/` astronomy stack. Do not add a second astrology SDK, network ephemeris, or screen-local calculation.
- `kundali.ts` stays pure: explicit `Date` + coordinates in, typed data out. No React, AsyncStorage, wall-clock reads, randomness, fetch, or platform APIs. UI/hook code supplies “now” explicitly.
- v1 accepts `timezone: 'Asia/Kolkata'` only and bundled Indian cities. Birth profile location is separate from `PanchangLocationContext`; changing one must not mutate the other.
- Sidereal positions use the same Lahiri ayanamsa primitive as Panchang. Classical grahas come from `astronomy-engine`; Rahu is the mean ascending node and Ketu is exactly opposite. Houses are whole-sign from the sidereal Lagna.

### 13.2 Golden accuracy contract

- The three hand-picked goldens live in `panchang/__tests__/fixtures/kundali-swiss-ephemeris.json`. Broad coverage lives in `kundali-swiss-ephemeris-150.json`: a reproducible 15-city × 10-instant matrix generated only by `scripts/generate-kundali-swiss-corpus.py` from pinned official Swiss Ephemeris 2.10.03 files, `SIDM_LAHIRI`, and `calc_ut`.
- The 150-case corpus holds angular error to ≤0.012° for grahas and Lagna and ≤0.005° for ayanamsa; rashi, nakshatra, pada, whole-sign house, retrograde state, first Mahadasha lord, and birth Antardasha lord require exact equality. The independently derived first-Mahadasha boundary may differ by ≤5 days because a sub-0.01° Moon delta is amplified across a multi-year balance; the test must prove that delta is explained by the Moon delta to within one minute.
- Vimshottari uses the Moon's 27-nakshatra position, the canonical `Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury` order, a 120-year cycle, proportional balance at birth, and contiguous Mahadasha/Antardasha intervals.
- Full method and measured maxima are recorded in `panchang/KUNDALI_VERIFICATION.md`. Any deliberate ephemeris/ayanamsa/Dasha-policy change requires regenerating the independent corpus and calling out the change in release notes; never silently update expected numbers or widen tolerances to match implementation.

### 13.3 Interpretation and safety

- Kundali insight copy explains what a placement means structurally (what Lagna/Moon/Dasha is). It must not turn generic positions into fixed personality diagnoses or guaranteed life events.
- Rashifal is deterministic from explicit India civil day + Moon-sign index + pure transit rules. Never use `Math.random`, AI generation, a remote horoscope feed, luck/compatibility scores, fear copy, or deterministic predictions.
- Every Rashifal surface must visibly frame output as traditional guidance/reflection, not certainty. Avoid “will happen”, “guaranteed”, “certain”, medical/legal/financial directives, and remedial claims.
- Practice links may target only active, existing library ids and route through `buildEntryStartTarget()`. PRD-C v1 is allow-listed to `navagraha-stotram`, `surya-ashtakam`, and `shani-ashtakam`; it does not invent new devotional prescriptions.

### 13.4 Product and verification contract

- Home keeps a permanent Kundali launcher; Panchang keeps Jyotish as a peer of Panchang and Vrat–Parv. Do not bury Kundali only in a carousel, More, or a second-level catalog.
- Do not create a “Default profile” or silently preselect a birth city. Profile hydration has explicit loading/guest/saved/error states, and failed persistence must remain visible and recoverable.
- Before a profile is saved, the Jyotish landing leads to creation. After saving, it leads with all three Daily Rashifal guidance rows, then a compact Kundali reference, then one shared practice treatment.
- Results lead with Overview before Chart/Grahas/Dasha. Lagna, Moon, and Dasha insight cards are actionable; the chart must have an equivalent text representation and a full accessibility summary. Every traditional rashi name shown in English UI is paired with its plain-English equivalent.
- The Dasha surface exposes the current Mahadasha/Antardasha, dates, elapsed and remaining time, and a full nine-period timeline. Those timing values must also be accessible to assistive technology.
- Kundali and Rashifal share cards use the app theme and a 4:5 preview. Kundali must warn that personal birth details are included; Rashifal must state that name and birth details are excluded. Do not place duplicate share controls inside Kundali tabs.
- Required checks: `npm run typecheck`, `npm run test:engine`, targeted Jest for new UI, and `.maestro/kundali-smoke.yaml` on an isolated simulator/worktree Metro port. If Maestro is not run, state that explicitly before merge.
