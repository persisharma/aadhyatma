# Aadhyatma Section Rulebook

The contract for adding a new content section (Hanuman Chalisa, Bhagavad Gītā, Sundarkand are the three live examples). Read this **before** touching code. For visual/typographic decisions defer to [`design.md`](./design.md). If `design.md` is silent, ask before inventing.

The companion command `/add-section` (see [`.claude/commands/add-section.md`](./.claude/commands/add-section.md)) walks through this checklist interactively and scaffolds the files. Use it.

---

## 0. Every change ships with tests — unit **and** e2e

This is a hard, repo-wide gate that applies to **every** change, not just new sections — features, bug fixes, refactors, content edits, and data changes alike.

- **Unit tests (UT).** Every change adds or updates automated unit tests that pin the new or fixed behaviour. Run `npm test` from `mobile/` — it runs `typecheck`, the Jest suites (`test:readers`), the panchang engine tests (`test:engine`), and the data/content tests (`test:data`); all must pass. A bug fix must include a test that fails before the fix and passes after.
- **E2E verification.** Every change is exercised end-to-end via the Maestro flows in `mobile/.maestro/` (`npm run test:e2e`) on a simulator/emulator, and the flow covering the touched area must pass. If a change adds a user-facing surface no existing flow covers, extend or add the matching `<category>-smoke.yaml` (see §8). **How to author and verify a flow — including the isolated-simulator recipe for machines running several worktrees, and the selector/onboarding gotchas — is the `wiki/runbooks/e2e-verification.md` runbook.**
- **No exceptions.** A PR without both UT and e2e evidence is a hard reject — the same bar as a missing reader-screen test (§2 row 14) or a missing Maestro flow (§8).

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
| 5 | `thumb` | **yes** | `ह` / `भ` / `सु` / `ॐ` | single Devanagari glyph rendered inside `LibraryCard`. Exactly **one akshara** (one consonant cluster + optional matra/sign, an independent vowel, or ॐ) — never two syllables like `गण`/`जय`, which render wider than sibling thumbs in the same row. Enforced for library/japam/audio/sadhana thumbs by `contentCorrectness.test.ts` §20 |
| 6 | `category` | **yes** | `granth` | One of: `granth`, `stotram`, `chalisa`, `japam`, `aarti`, `theerth`, `sanskar`, `ashtakam`, `suktam`, `kavacham` (source of truth: `mobile/src/data/categories.ts`). Determines which grid tile this section appears under on Home. The `japam` tile routes to `JapamCounterScreen` (counter UI) instead of the standard verse pager. The `theerth` tile routes to the Theerth browse screen (state/category list; map in the drill-in view) — see §12. `ashtakam`, `suktam` and `kavacham` are PRD-A forms, each with a multi-instance reader (dispatching on `ashtakamId`/`suktamId`/`kavachamId`, like the chalisas). **Stuti** is a fourth PRD-A form but is **not** a category — its texts (Krishna Stuti, Durga Stuti) are filed under `stotram` (स्तुति ≈ स्तोत्रम्) yet still render via the multi-instance `StutiReader`, routed by `stutiId`. |
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

**Theerth carve-out.** Rows 10–14 (`lines`, `meaningHi`, `meaningEn`, `commentaryHi`, `commentaryEn`) describe the **verse archetype** and are mandatory for verse-based sections only. Sections with `category === 'theerth'` have a different shape — prose `significanceHi/En` + `originStoryHi/En` per temple, plus `coordinates` and `stateHi/En` — defined in §12. They do not produce a `*VersePage` component.

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

**Verse-based archetypes only.** Rows 1, 2, 4, 5, 6 of this table describe the verse-pager pipeline (Chalisa / Gita / Sundarkand / Stotram / Chalisa shapes). For `category === 'theerth'`, the file set is different — see §12.

**Row 2 is a LAZY loader: the manifest is eager, the payload never is.** `index.ts`
may statically import its `chapters-manifest.json` and nothing else. Every verse
payload must sit behind a `require()` thunk resolved by `get<Section>Chapter()`,
with that chapter's invariant check run on first load — the shape
`valmiki-ramayan/index.ts` and `gita/index.ts` both use. This is not a
micro-optimisation. Metro bundles every static import reachable from `index.ts`
and Hermes evaluates all of it before the first frame, so one eager
`import ch18 from './chapter-18.json'` in a module that anything on the launch
path happens to touch lands on **every cold start** — which is exactly how 6.5 MB
of Gītā (plus a module-scope walk of all 701 verses) came to be evaluated before
Home could paint, because `entryRoutes.ts` wanted a chapter *count* and is reached
from `notifications/deepLink.ts` at `App.tsx` module scope. Corollaries: the
module-scope invariant check may only read the manifest (a 3 KB file), and
anything that needs a title, a chapter count or a verse total reads the manifest,
never a payload. **Gate:** `src/data/__tests__/launchGraph.test.ts` walks the real
static import graph from `index.ts` and fails if a payload is reachable (it prints
the import chain) or if the graph exceeds its byte budget. Never raise the budget
to make it pass, and never add a payload to an allowlist — fix the importer.

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
- **Read-aloud is exposed only through the shared hook + button, never a raw `Speech.speak`.** A reader gains TTS by calling `useReaderReadAloud()` (`mobile/src/screens/_useReaderReadAloud.ts`) and rendering `ReadAloudButton` in `ReaderHeader`'s `right` slot — never by importing `expo-speech` in a screen, and never by putting the control in a verse page's `topActions` (which renders once per page). Widen `sideWidth` so both header side columns still match, or the centred title shifts. Add every newly-enabled reader to the table in `mobile/src/screens/__tests__/readerReadAloud.test.tsx`, the same way `readerAutoAdvance.test.tsx` tables the chaptered readers. (`design.md` §56)
- **Read-aloud speaks each reading language in its own voice, or reports unavailable.** Never substitute another language's voice for a missing one — the user would read one script and hear another, and for gu/kn it would silently discard authored `meaningGu`/`meaningKn`. `speechLangFor()` is identity by design, `resolveVoice()` returns `null` rather than falling back across languages (and only honours a saved identifier that still speaks the requested language), and the controller's `start()` refuses outright when availability is `unavailable` — because both platforms would otherwise hand the text to the device default voice with no error. Voices are stored per language in `voiceByTarget`. (`design.md` §56.1, §56.4)
- **Never pass a region-tagged locale as `expo-speech`'s `language` on Android.** Always build options with `speakOptionsFor()` (`mobile/src/readAloud/voices.ts`). Android's native module does `Locale(options.language)`, and Java's single-arg `Locale` constructor treats the whole string as the language — so `'hi-IN'` becomes `"hi-in"`, resolves to `LANG_NOT_SUPPORTED`, and **silently falls back to the device default voice**, i.e. Devanagari read in an American accent with no error. Equally, **never trust `onError` to report a missing voice**: both platforms fail silently, so availability must come from a `getAvailableVoicesAsync()` probe plus the `onStart` watchdog. (`design.md` §56.1, §56.4)
- **Text inputs are `TextField`, with one of two variants.** `mobile/src/components/TextField.tsx` — `variant="search"` (44, Cormorant 15) for searching **content**, `variant="form"` (48, Inter 14) for **data entry**. Do not hand-roll a `TextInput` height/face/padding: there were three specs for one control class until July 2026. (`design.md` §52)
- **Back buttons are 44 visually.** `hitSlop` counts toward the 44 *touch* minimum, but the back control is the one control on every screen, so a 40 among 44s reads as a defect regardless of its hit area. Smaller controls of other classes are allowed when `hitSlop` clears 44 **and** the size is deliberate and commented (today: the Panchang month stepper at 34 + `hitSlop={10}`). (`design.md` §12)
- **Chaptered readers auto-advance across subsection boundaries.** A reader whose text has more than one subsection (`<section>ChaptersManifest.length > 1`) must let the user cross chapter/kāṇḍa boundaries **by swiping** — it must never dead-end on the last page of a subsection. Match `GitaReaderScreen.tsx` / `ShivaStrotamReaderScreen.tsx`: inject a `NextChapterCard` after the last verse (unless it is the last chapter) and a `PrevChapterCard` before the first verse (unless it is the first chapter) into the `FlatList` `data`; detect those `__type: 'transition' | 'prev-transition'` items in `onViewableItemsChanged` and `navigation.replace(<thisRoute>, { chapter })` (the prev case lands on the previous chapter's last verse via `initialIndex`). The prepended prev card shifts indices by one, so carry an `offset` through `initialScrollIndex`, `handleScroll`, and the viewable-index math. `mobile/src/screens/__tests__/readerAutoAdvance.test.tsx` enforces this for every multi-chapter reader — add a new chaptered reader to its table when you create one. (Origin: Durga / Ganesh / Saraswati / Vishnu Sahasranama readers rendered only `chapter.verses`, so swiping past a chapter's last verse dead-ended instead of advancing to the next subsection.)
- **Top-bar title rule.** Reader screens, counter screens, and chapter index screens must **swap** the title to the active reading language — never render both stacked. Use `contentByLang(lang, titleHi, titleEn)` (gu/kn re-script `titleHi`); pick the font with `titleFontByLang(lang)`. Do **not** hand-write `lang === 'hi' ? titleHi : titleEn` — that silently shows English for gu/kn. Listing screens (Home, CategoryList, DeityList) still show **both** languages, but the active reading language now decides **order and focus**: the primary language leads in the prominent slot (top line on cards, first on the `·`-joined top bar) with the larger/heavier font, and the other language follows as a supporting line. This is computed by the shared `orderTitlesByLanguage()` helper (`mobile/src/utils/titleByLanguage.ts`) so category names and catalog/deity titles flip together everywhere; do not re-derive the order inline or hardcode Devanagari-first. Default `'hi'` preserves the historic Devanagari-first layout. (`design.md` §9, §15)
- **Romanization.** Per `design.md §3.1`, the romanization style is chosen by the source language of the verse, not by the module: Sanskrit verses (Gita, embedded shlokas) use IAST + Hunterian digraphs; Awadhi/Hindi verses (Tulsidas chaupais, dohas, sorthas, chhands) use hand-curated pronunciation-based ASCII. Do not impose IAST on Awadhi — the diacritics misrepresent recitation.
- **Language toggle.** Reuse the existing context: `import { useGitaLanguage } from 'mobile/src/data/gita/language.tsx'` (type `Lang = 'hi' | 'en' | 'gu' | 'kn'`). Default `'hi'`, persisted at `@vedansh/language`. The `LanguageToggle` is a **2-segment** pill — [the chosen regional language] · [English] — where the regional segment is `hi` by default and switches to `gu`/`kn` via the More-tab language setting (persisted at `@vedansh/regionalLanguage`, exposed as `regionalLang` on the context). Do not add per-section toggles or extra segments; the four-way choice lives in More. **Do not** create a parallel context per section. (design.md §16; renaming the hook to `useReadingLanguage` is a follow-up tracked outside this rulebook.)
  - Every reader screen renders the toggle once, in the persistent toggle row above the pager (beside `AddToRoutineButton`) — it governs all pages of that reader.
  - Sections with a subsection listing (Chapters Index, kāṇḍa list, etc.) ALSO surface the toggle on that listing.
  - State is shared across surfaces via the same hook — no per-screen forks.
- **Categories & Deities.** Every `LibraryEntry` must have a valid `category` (one of the types in `categories.ts`) and at least one `deity` tag. The Home screen grid and deity section derive their content from these fields — no manual wiring required. **Adding a new `ContentCategory` or `Deity` also requires a tag entry in `mobile/src/data/shareHashtags.ts`** — `CATEGORY_TAGS` and `DEITY_TAGS` are exhaustive `Record<…>` maps that feed the Instagram share hashtags (design.md §39.2), so an unlisted member fails `tsc --noEmit`. Give it 1–3 tags people actually search, most canonical first.
- **Japam items appear under their deity.** Japam mantras are shown under their tagged deity's listing (e.g., Gayatri Mantra appears under Maa Gayatri deity card). The deity card shows all content tagged with that deity regardless of category. Tapping a japam item from a deity list navigates to the Japam Counter screen for that mantra.
- **Pill vocabulary.** Verse-type pill is always `<term> · <subtitle or N>`. The middle dot `·` separator is stored **in the data** (in `labelHi`/`labelEn` fields), not added at render time. Data format: `"labelHi": "चौपाई · १"`, `"labelEn": "Chaupai · 1"`. Use Devanagari numerals in `labelHi` and Arabic numerals in `labelEn`. Sub-numbering uses `·` without spaces: `"चौपाई · ५५·१"`. Single-word labels without numbers (e.g., "टेक", "दोहा", "समापन दोहा") do NOT get a dot. The **leading term matches the user's selected language** — Hindi mode shows `श्लोक · १.१` / `चौपाई · ९`; English mode shows `Shloka · 1.1` / `Chaupai · 9`. Never hardcode one language — branch on `lang`. Do not invent new vocabulary without updating `design.md` first.
- **Every user-facing string respects `lang` — across all four languages.** If a string is visible to the user (visible Text, pill/badge, button label, top-bar title, modal body, toast, confirmation copy) and it carries semantic content beyond a number/symbol, it must resolve through the `localize.ts` helpers, never a two-way `lang === 'hi' ? … : …` ternary (which silently falls to English for gu/kn). Use: `pick(lang, { hi, en, gu, kn })` for hand-authored UI prose; `contentByLang(lang, hi, en)` for content/titles/labels (gu/kn re-script the Hindi); `meaningByLang(lang, hi, en)` for meaning prose (gu → re-scripted Hindi, kn → English); `verseLinesByLang` for recitation lines. Pick fonts with `verseToken`/`meaningToken`/`titleFontByLang` (`langType.ts`) so gu/kn render in their Noto serif, not tofu. Lang-paired data fields (`labelHi`/`labelEn`, `nameHi`/`nameEn`, `meaningHi`/`meaningEn`, …) feed those helpers. Hardcoded Devanagari in an otherwise-English flow (or vice versa) is a hard reject. Exceptions, which must be intentional: (a) bilingual stacked labels by design — listing card titles (both `nameHi` and `nameEn` render simultaneously, ordered/emphasised by the active language via `orderTitlesByLanguage()`), Resume sheet's `जारी रखें · Resume` button — where both languages render simultaneously; (b) numeric/symbolic content (`॥`, `1.9`, `4`). When in doubt, branch on `lang`. (Origin: WishlistScreen verse pill rendered `श्लोक 1.9` in English mode; Gita / Shiva Strotam verse pills had the same bug.)
- **Customer copy describes the experience, never the implementation.** Do not put architecture or connectivity disclosures such as “on-device”, “computed locally”, “offline”, “no internet/network/account required”, “local notification”, storage/schema versions, or similar implementation-status language in visible text, accessibility labels, toasts, cards, loading states, empty states, or share output. Say what the action does instead: “Remember birth details”, “Details saved”, or “Remind me”. Internal documentation, comments, diagnostics, and privacy/security reviews may state the real implementation. A control may explain the user-visible consequence of persistence (“Prefill this form next time”), but not its storage mechanism. Actionable platform limitations are the narrow exception—for example, telling a user that a required speech voice is unavailable and how to install it. Review every new phase and every supported language for this rule; do not reintroduce technical reassurance as marketing copy.
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
7. If the section ships an English transliteration field (`transliteration[]` or `linesEn[]`), spot-check the romanization style matches the source language per `design.md §3.1`: Sanskrit verses use IAST diacritics; Awadhi/Hindi verses use pronunciation-based ASCII. Mismatched style (IAST on Awadhi or plain ASCII on a Sanskrit shloka) is a hard reject. **Also run the §11.12 greppable gate**: no raw ITRANS/encoder residue (mid-word capitals, `~n`, `RRi`, `chCh`), no leftover dandas/pipes (`।`, `॥`, `|`) or verse-number markers, and `linesEn.length` == the paired `sanskrit`/`lines` length for every verse.
8. If subsections exist: chapters list renders; tapping any chapter lands on verse 1 of that chapter; back button returns to chapters list, not Home.
9. Grep the new screen and component files for `as any`, `as unknown as`, `@ts-ignore`, and `@ts-expect-error`. Any hit on a `*VersePage` `verse=` prop or on a navigation `route.params` access is a hard reject — re-shape the data or add a section-specific component instead.
10. The new `<Pascal>ReaderScreen.test.tsx` exists and passes locally and in CI. Do not merge a green PR whose test file is missing.
11. **Per-section device check.** If the PR adds N sections, every one of them must be opened in the Expo dev client individually — Home tile → reader → toggle language → swipe to last verse → back. A single "tested locally" sign-off does not cover N sections; capture one screenshot per section and paste them in the PR description.
12. **Both listings reach the reader.** Open the section from Home → its category tile **and** from Home → By Deity → its deity card. Both paths must land on the same reader. If the section appears as a card but tapping is a no-op, the routing helper (`entryRoutes.ts`) is missing a case.
13. **Multi-instance readers serve the right content.** For sections that share a screen (chalisas, aartis, future N-of-a-kind), open at least two distinct entries and confirm titles, verses, and `sourceId` (visible via bookmarks) actually differ — a reader hardcoded to one variant will silently render the wrong content for the others.
14. **Section is reachable from search.** `mobile/src/data/__tests__/searchIndex.test.ts` already enforces that every active `library` entry produces verse entries in the search index — but verify manually: open the global search (top-right magnifier on Home), type a unique word from the section's first verse, confirm the result row tap lands on the correct reader page. See §7 for the per-shape integration paths.
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

### 6.0 Cross-tab hand-offs: build them with a `*TabTarget` helper

The bottom tab navigator is **lazy** (`TabNavigator.tsx`) — every tab except the first (`HomeTab`) mounts on its first `navigate`. React Navigation's nested `navigate` defaults to `initial: true`, which makes the named screen that stack's **initial route** instead of pushing it above the stack's own `initialRouteName`. The result is always the same: the target's back button has nothing to pop, and the stack's real root stays unreachable **for the rest of the session**.

So: never hand-roll `navigate('<X>Tab', { screen, params })`. Build it with `panchangTabTarget` / `moreTabTarget` (`navigation/entryRoutes.ts`), which pin `initial: false`. Add a helper for any new tab that gains a stack.

`HomeTab` is exempt only because it is the tab bar's **first** `Tab.Screen` and therefore mounted from launch. That exemption is asserted, not assumed — reordering the tab bar fails `navigation/__tests__/tabTargets.test.ts`, which also scans every source file for the hand-rolled form. (Origin: Home's DISCOVER widgets spotlight shipped `{ screen: 'WidgetGallery' }`; tapping it before ever opening More stranded the user with a dead back button and no route to the hub — Wishlist, Profile, Reminders, Japam Alarms and Pitru Smaran all gone until app restart. The Pitru Smaran day chip on Home's Today strip had the same defect.)

### 6.0.1 A flow with doors on multiple tabs is registered on every hosting stack

A screen belongs to one stack by default. But when a flow has entry points on **multiple tabs**, registering it on only one of them means every door elsewhere has to `navigate('<Other>Tab', …)` — and back then pops to that tab's root, stranding the user on a screen they never asked for. Puja Vidhi now has doors on Home, Panchang and More (the Pitru Smaran cross-link), so all three stacks host the shared flow.

The contract for such a flow:

1. **Declare its routes once**, in a shared param list (`VidhiStackParamList` in `navigation/types.ts`), and **intersect** it into each hosting stack's param list — `export type HomeStackParamList = VidhiStackParamList & { … }`. `tsc` then keeps the registrations from drifting; a param list that re-declares the routes inline does not.
2. **Register the same components in every hosting navigator**, and type the screens against the shared list (`NativeStackScreenProps<VidhiStackParamList, …>`), never against one stack — one component serves all mountings.
3. **Every door pushes in place.** No `navigate('<Other>Tab', …)` from a door on a tab that hosts the flow.
4. **A genuine cross-stack hop stays runtime-checked.** Where a flow hands off to a screen that may not live on its current stack (vidhi conduct → shipped readers), use `navigateToHomeStackTarget` (`navigation/entryRoutes.ts`): it pushes in place when the enclosing stack registers the target route and falls back to the Home tab when it does not. If the product copy promises return to the current step, mount that reader locally too — the personal-tithi guide therefore registers `GitaReader` on More, and its Back path is test-pinned.

Do **not** apply this to a flow with doors on one tab: a duplicate registration there is pure surface area. Guarded by `src/navigation/__tests__/vidhiBackNavigation.test.ts`.

### 6.1 Onboarding surfaces — feature tour, first-run setup & What's New (contract)

The first-launch **feature tour** (`FeatureTour.tsx`), the **first-run setup sheet** (`OnboardingSetupSheet.tsx` — language + reading size, shown once the tour closes), and the post-update **What's New sheet** (`WhatsNewModal.tsx`) are gated by `TourContext.tsx` and driven by data in `mobile/src/data/tour/{steps,whatsNew}.ts` (design.md §47). The first-run order is fixed: **tour → setup sheet → app**; a returning user gets What's New only. Three contract rules bind them to releases and navigation:

1. **Version bump discipline.** `APP_TOUR_VERSION` in `data/tour/whatsNew.ts` **must equal** `app.json` `expo.version` (enforced by `src/data/__tests__/tourContent.jest.test.ts`). On every version bump: update `APP_TOUR_VERSION` and add a `whatsNew[version]` entry listing **only** that release's new features (bilingual `titleHi/En` + `bodyHi/En`); omit the entry (or leave `items` empty) to intentionally skip the sheet. `getWhatsNewForVersion` returns null for unknown/empty versions → sheet suppressed. The same jest gate also fails a bump that forgets the entry.
   - **Install vs update.** `TourContext` shows the **full tour** only to a genuine fresh install (no prior-usage key from `UPGRADER_SIGNAL_KEYS`, §44) and shows the version's **What's New** to a returning user — so a release's own `whatsNew` entry is reachable by the users updating into it. Do not "simplify" this to `tourCompletedVersion === null` alone; that regresses every existing user into the full tour and makes the current version's release notes unreachable.
2. **New tab ⇒ consider a tour step.** The tour walks the real tabs; adding a tab to `TabParamList` (§6) should usually add a `tourSteps` entry with its `navigateTo`. A compile-time check pins every step's `navigateTo.name` to a real tab, so an invalid target fails `tsc`.
3. **The walkthrough ends on Language + Reading Size.** The last two steps ring the More hub's `languageRow` / `readingSizeRow` (§37) because the setup sheet asks for exactly those two next — showing them first is what makes the ask legible, and what teaches the user where to change them later. `tourContent.jest.test.ts` pins the tail order; keep any new step **above** them. A new spotlight target must be added to `TourTargetId` **and** the test's `VALID_TARGET_IDS` mirror.
   - **The setup sheet writes its own key.** `markTourCompleted` must never write `@vedansh/onboarding-setup-v` (that would swallow the language prompt), and the sheet's arming flag stays separate from the tour's replay flag — `resetTour()` clears all three keys so a replay reproduces the full first-run sequence.

**Language.** The tour **and** the setup sheet are intentionally bilingual (hi+en) on every card/label — both run before a reading language exists, so neither may branch on `lang` (the setup sheet's language options need no translation: each is written in its own script). The What's New sheet **does** honour the reading language (fires for returning users) and must route text through `contentByLang` + fonts through `titleFontByLang`/`meaningToken` — never a bare hi/en ternary (§3, wiki `concepts/languages`).

**Tests.** UT: `src/contexts/__tests__/TourContext.test.tsx`, `src/components/__tests__/FeatureTour.test.tsx`, `src/components/__tests__/OnboardingSetupSheet.test.tsx`, `src/data/__tests__/tourContent.jest.test.ts`. E2E: `.maestro/feature-tour-e2e.yaml` (replay → full step walk → setup sheet → `Begin`); `_launch.yaml` dismisses **both** first-run surfaces (optional `Skip tour`, then optional `Begin`) so neither blocks other flows on a fresh simulator.

### 6.2 Auto-opening surfaces — the no-stacking contract

Anything that opens itself over the app (the §6.1 trio, the reminder opt-in, the OTA update modal, the **rating prompt** of design.md §54) competes for the same moment. Two rules keep that from turning into a pile-up:

1. **Every new auto-opening surface must be added to the rating gate's stand-down set.** `RatingPromptContext`'s `blockedBySurface` ORs the "this surface wants the screen" flags (`shouldShowOptIn`, `shouldShowFirstLaunchTour`, `shouldShowOnboardingSetup`, `shouldShowWhatsNew`). A new surface that skips this can land on top of the rating card, or under it. If the new surface's provider sits **below** `RatingPromptProvider` in `App.tsx`, hoist the flag rather than reaching down for it.
2. **Every new auto-opening surface that CAN fire on a clean install must be dismissible from `_launch.yaml`.** Add an `optional: true` tap for its dismiss control, matching that control's **full** a11y label (Maestro matches whole strings). Skipping this makes the surface block every downstream flow the first time it fires on a clean simulator — and because it only fires under its own gate, the breakage shows up as unrelated flows going red. The rating prompt is the one surface exempt today: `_launch.yaml` runs `clearState: true` and the gate needs 5 cold starts, so it provably cannot appear. A surface whose gate a fresh launch **could** satisfy is not exempt.

**No native store-review module.** The rating hand-off uses `Linking.openURL` to the store listing, not `expo-store-review` / `SKStoreReviewController` / Play In-App Review. Those are native modules: adding one moves the feature out of the bundle and behind a store rebuild, which the roadmap's bundle-only constraint forbids. The same reasoning governs the Instagram row's `https://` URL (design.md §37). Since the OS is not throttling us, the throttling in `data/ratingPrompt.ts` (5-day cooldown, engagement floor, **no lifetime ceiling** — `MAX_ASKS` is `null`) **is** the user protection — do not loosen a threshold without an explicit product decision.

**The ask currently has no user-reachable off switch. Know this before you ship it.** Two product decisions compose into one consequence: `MAX_ASKS` is `null` (ask every 5 days until rated) and the sheet carries two actions only — "now" and "later" (Aug 2026). So a user who never rates is asked every 5 days for as long as they keep the app, and nothing in the UI stops it. "Maybe later" defers; Android back maps to the same thing; the More row is an entry point, not an exit.

That is a deliberate product position, not an oversight — but it is **the** thing to re-examine before a store submission, for three reasons:

1. **Store policy.** Apple's guidelines direct developers to the native rating API and say custom review prompts will be disallowed; an uncapped custom prompt is the most exposed version of that. Google's policies likewise cover disruptive/repetitive interruptions. This repo has been through review rejections before (`docs/releases/1.4.2-app-review.md`).
2. **It can invert its own goal.** Users who feel nagged rate 1 star. An uncapped ask optimises for volume of prompts, not for rating average.
3. **`declined` is now unreachable.** `afterDeclined` and `outcome: 'declined'` remain in `data/ratingPrompt.ts` and the gate still honours them, so a stored opt-out from an earlier build is respected — but nothing writes one.

**Mitigations, any one of which restores an exit** (none currently applied): restore a finite `MAX_ASKS`; add a Settings-side "don't ask for ratings" row that calls `afterDeclined`; or move to the native in-app review sheet, which is OS-throttled and needs no opt-out of ours. If you re-add a third button, put it back on the sheet as a visible first-class control — never a long-press, swipe, or overflow.

**Tests.** UT: `src/data/__tests__/ratingPrompt.jest.test.ts`, `src/components/__tests__/RatingPromptSheet.test.tsx`, `src/screens/__tests__/MoreScreen.test.tsx`. E2E: `.maestro/rating-prompt-smoke.yaml` (manual More entry point; the auto path's thresholds are unreachable under `clearState`).

---

## 7. Search index integration for new sections

Every new section must also be reachable from global search (`SearchScreen`). The on-device index is built by `mobile/src/data/searchIndex.ts` from the same data the readers consume — there is no parallel content source. New sections must satisfy one of two integration paths:

**Path A — standard verse shapes (no code change required).** The index already handles three verse shapes:

| Verse shape | Devanagari source | Latin source | Used by |
|---|---|---|---|
| `lines` + `linesEn` | `lines` | `linesEn` | chalisas, aartis, sundarkand, ramcharitmanas, valmiki-ramayan |
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

## 8. Cross-platform verification (iOS + Android)

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

## 9. Explanation and importance of every sloka and ritual

Every content section — especially the `sanskar` category — must include **explanation (अर्थ) and importance/significance (महत्त्व)** for each sloka, mantra, or ritual. This mirrors the depth provided in stotram sections.

- **`meaningHi` and `meaningEn` are never just translations.** They must explain: (a) the literal meaning of the verse, (b) the context/occasion when it is recited, and (c) the spiritual or practical significance. A bare word-for-word translation is insufficient.
- **`vidhiHi` / `vidhiEn` for instructional content.** Sections that teach practices (Surya Namaskar, Tulsi Puja, etc.) must include step-by-step instructions in the vidhi fields. Instructions should be clear enough for a child (8-14 years) to follow independently.
- **Benefits/significance.** Each ritual or sloka must explain WHY it is practiced — the scriptural basis, the spiritual benefit, and (where applicable) the health/wellbeing benefit per Ayurvedic or Yogic tradition.
- **Scriptural reference.** Where a sloka originates from a specific text (e.g., Gita 4.24 for Brahmarpanam), cite the source in the meaning field.

---

## 10. Pull-request hygiene for new sections

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

## 11. Content integrity & verification

These rules govern the correctness of religious/devotional content data. They exist because fabricated, incomplete, and misattributed text was shipped and caught only after user reports. Every rule below is a hard gate — violations block merge.

### 11.1 Internet verification is mandatory
Every religious text (aarti, chalisa, stotram, granth verse) must be verified against **at least 2 independent authoritative internet sources** before shipping. Acceptable sources: Gita Press editions, Gita Supersite (gitasupersite.iitk.ac.in), sanskritdocuments.org, hindunidhi.com, drikpanchang.com, Arya Samaj publications, university repositories, and well-established devotional sites with cross-referencing. News/SEO sites (NDTV, Times Now) are acceptable only as a second confirmation, never as sole source. When sources disagree on a word, use the majority reading and note the variant in a comment in the JSON `source` field.

### 11.2 Source citation in data
Every content JSON file must have a `source.baseText` field naming the edition or website(s) verified against, and `source.retrievedOn` with the ISO date of verification. Example: `{"baseText": "brandbharat.com, vignanam.org", "retrievedOn": "2026-05-23"}`. A file without source citation is unverified and must not ship as `active`.

**Cite what you actually read; record what you couldn't.** `baseText` and `referenceUrls` mean "this text was checked against these". Never list a print edition, scan, or PDF you did not open — including one named for you — as though it had been consulted. When a named authority is unreachable from the authoring environment (blocked host, paywall, offline volume), record it separately as pending and say why: `source.canonicalEdition` (the edition), `source.canonicalEditionUrls`, and `source.canonicalEditionStatus` (what is outstanding and how to clear it). `valmiki-ramayan/chapter-0*.json` is the worked example for clearing that state honestly: its earlier Gita Press check was marked outstanding, then replaced with a dated verified status only after the complete searchable scan was opened and checked. **Do not delete a pending block to make a file look clean** — clear it by doing the check and dating it. Pinned by `contentCorrectness.test.ts`.

### 11.3 No AI-generated liturgical text
Religious text must come from published traditional sources. Never generate, paraphrase, or "reconstruct" verse text using an LLM. Meanings/commentary may be editorial (clearly labeled), but the prayer text itself (`lines`, `sanskrit`, `linesEn`) must be verbatim from a verified source. Origin: Durga Chalisa was partially AI-generated.

### 11.4 Deity metadata accuracy
The `deity` field (and `deities` array in `texts.ts`) must match the actual deity addressed in the text, not a loose theological category. Verify by reading the text's opening invocation. Origin: Gayatri Mantra was tagged "durga" (it invokes Savitr/the Sun), Om Jai Jagdish was tagged "krishna" (it's a Vishnu aarti).

### 11.5 Complete texts only — never fabricate
Ship the full canonical version (all verses) only after internet verification. Missing stanzas are worse than a "coming soon" label. Never add wrong, pre-generated, or unverified text to fill gaps. If the complete verified text isn't available, don't ship the section at all — mark it `status: 'coming'` until verified. Origin: Hanuman Aarti had 6 of 13 verses with a fabricated closing, Jai Ambe Gauri had 5 of 12.

**Declared selections are the one exception, and they must declare themselves.** A text too large to ship whole (for example Durgā Saptashatī) may ship as a *curated selection* of verified verses — but only when: (a) the `sub`/`subEn` name it as one, using the `चयनित` / `selected` wording (following `durga-stotram`'s `3 चयनित स्तोत्र`); (b) each JSON's `source.notes` says explicitly that the file is a selection and not the complete kāṇḍa/adhyāya; and (c) every shipped verse still clears §11.1–§11.4 individually. What stays banned is the thing this rule was written for: a text the UI *implies* is complete but isn't. Uneven depth between subsections is correct behaviour when that is what verification supported — say so in `source.notes` and in the section's `design.md` entry; padding a subsection with unverified text to even the counts out is a hard reject. Omitting a subsection entirely is also acceptable, under the same disclosure rule.

### 11.6 No fabricated content
Every line in a content file must exist in at least one published source. Fake closing verses, paraphrased refrains, composite mashups from different texts = hard reject. If a line appears in zero internet sources, it is fabricated and must be removed. Origin: "हनुमत बीर सकल दुख भावे" (Hanuman Aarti closing) appeared in zero published sources.

### 11.7 Both platforms per change
Every content/data change must be verified on both iOS and Android before OTA push. Bundle and test on both platforms — a rendering issue on one platform (especially with Devanagari fonts) may not appear on the other.

### 11.8 Background image per deity
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

### 11.9 Deity display names must be recognizable
Deity `nameHi`/`nameEn` must use the popularly recognized devotional name that users will identify. Use the name devotees actually use in prayer/temple context (e.g., "माँ गायत्री" not "सवितृ देव", "श्री विष्णु" not "नारायण"). When in doubt, use the name that appears on temple signage. Origin: Users couldn't identify "Savitr Deva" as Gayatri.

### 11.10 Verse count sync is atomic
`texts.ts` `verseCount` must always equal the JSON `verses.length`. The `sub` field count must match. After any content change that alters verse count, grep for the old count in: (a) `chapters-manifest.json`, (b) `index.ts` invariant assertions, (c) `chapteredTotals.test.ts`. Update all three atomically in the same commit. Origin: Every content fix in this audit caused cascading test failures from stale counts.

### 11.11 No duplicate content across sections
A text must exist in exactly one location/category. Standalone Ashtak/Ashtakam texts (like Sankat Mochan Hanumanashtak) belong in the Ashtakam category — not duplicated in aarti or stotram. Before adding content, grep the repo for the text's first line to confirm it doesn't already exist elsewhere. Origin: Sankat Mochan existed in both aarti/ and hanuman-ashtak/ with different (both wrong) versions.

### 11.12 Transliteration integrity
This section gates the **romanization** only. The Devanagari side has its own contract in **§11.14** — do not treat a green §11.12 as script validation, since every check here is a character-range test that cannot see a malformed cluster.

No Devanagari characters (U+0900–U+097F) in `linesEn`/`transliteration` fields. No empty strings (use "(transliteration pending)" if unavailable). Correct romanization scheme per `design.md §3.1`: Sanskrit texts use IAST with Hunterian digraphs; Awadhi/Hindi uses pronunciation-based ASCII. Run `grep -rP '[ऀ-ॿ]'` on transliteration fields before shipping. Check IAST character-by-character against the Devanagari — common slips: anusvara (ṃ vs n/m), visarga (ḥ), retroflex consonants (ṭ/ḍ/ṇ vs t/d/n), and long vowels (ā/ī/ū). Origin: 23 Sundarkand lines had raw Devanagari, 19 Gita verses had transliteration spillover between adjacent verses.

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
Origin: the same raw-ITRANS paste recurred across Krishna Stotram, Ramcharitmanas ch1 (all 19 verses), Shiva Tandava, Vishnu Sahasranama, Ganesh Atharvashirsha, and 23 garbled Sundarkand chaupai lines — because §11.12 named the *scheme* but never banned the encoder residue, the leftover dandas, or gave a runnable check.

### 11.13 Meaning faithfulness
Hindi and English meanings must faithfully convey the verse's meaning without adding theological interpretation beyond what the verse states. Simplification for readability is fine; invention is not.

### 11.14 Devanagari well-formedness — every combining mark needs a legal base
Every Devanagari string that reaches a reader must be a valid sequence, not merely valid characters. A combining mark (matra, virama, nukta, anusvara/visarga) attached to a base that cannot carry it is rendered by HarfBuzz — on both iOS and Android — as **U+25CC DOTTED CIRCLE**, the stray `◌` a reader sees mid-word. Because gu/kn are derived at runtime by transliterating this same Devanagari (§3, `utils/transliterate.ts`), **one malformed cluster mis-renders in three of the four reading languages.**

**Why the existing checks cannot catch it.** §11.12's gate, contentCorrectness §5's `DEVANAGARI_RANGE`, and the Valmiki builder's "non-Sanskrit export artifact" guard are all *character-set membership* tests — they ask whether a codepoint sits inside U+0900–U+097F. An orphaned matra passes every one of them: it is a perfectly legal codepoint in an illegal position. **There is no U+25CC in the data to grep for.** The defect is the sequence, so only a cluster-grammar check finds it. Never add a membership test and call the script validated.

**The rules.** Rejected outright:

| Sequence | Example shipped | Correct | Origin |
|---|---|---|---|
| matra after virama | `भक्ितयोगेन`, `निश्िचतं` | `भक्तियोगेन`, `निश्चितं` | legacy visual-order encoding converted without reordering the i-matra past the conjunct |
| nukta after matra | `पितृ़न्`, `जो़ड़ना` | `पितॄन्`, `जोड़ना` | legacy fonts faked `ॄ` as `ृ`+nukta glyph pair; stray nukta in Hindi prose |
| matra after matra | `मूिर्च्छत`, `धिार्मकं` | `मूर्च्छित`, `धार्मिकं` | OCR transposition |
| mark after anusvara/visarga, on an independent vowel, on a danda/digit/avagraha, at string start, or after ZWJ/ZWNJ | `्वं`, `कोऽंशुमान्`, `महाबल ः` | — | truncated/garbled scrape rows |

**Normalizing a defect away is a §11.3 violation.** Substituting a plausible character to silence the dotted circle turns visibly-broken scripture into invisibly-wrong scripture, which is worse. The Valmiki builder's `ऺ→र` map is the cautionary case: applied to the romanization it produced `linesEn: "kṣhatritrayān"` beside `lines: "क्षत्ऺित्रयान्"` — roman side clean, Devanagari side still dotted — and applying it to the Devanagari too would only yield `क्षत्रित्रयान्` when the verse means `क्षत्रियान्`. Malformed Devanagari **fails the build** and is fixed against the source recension.

**Automated gates (all three, and they run in `npm test`).**
1. `src/data/devanagariWellFormed.ts` — the one canonical rule. Generators, tests and scripts import it; do not reimplement it, partially or otherwise.
2. `src/data/__tests__/devanagariWellFormed.test.ts` — sweeps every string in every shipped content JSON, unit-tests the validator, and reports the exact field path (`gita/chapter-14.json → verses[0].sanskrit[0]`). Wired into `npm run test:data`.
3. `npm run verify:devanagari` (`mobile/scripts/verify-devanagari.mts`) — scans the **generator inputs** (`BhagwadGita/chapters/*.md`, the raw scrape, `mobile/src/data`). `scripts/parse-gita.mjs` calls it and refuses to regenerate while the source is dirty; `scripts/build-valmiki-ramayan.py`'s `assert_devanagari_well_formed()` raises per verse.

**Fix the source, never the generated file.** `mobile/src/data/gita/*.json` is generated from `BhagwadGita/chapters/*.md` by `scripts/parse-gita.mjs` (a whitespace-only pass-through). A hand-patched JSON is erased by the next regeneration — that is why the earlier round of Gita corruption fixes (`scripts/fix-gita-*corruption.mjs`, which handled `?`-as-comma, Bengali danda `৷` and missing spaces) never touched this class and the count never moved.

**`devanagariWellFormed.baseline.json` is a debt ledger, not a config knob.** It quarantines the 107 instances present when the gate was written so the gate can block *new* ones today. Every entry is a real reader-visible defect. It may only shrink; the test also fails when an entry is stale, so it cannot rot. **Adding an entry to turn a red build green is a rulebook violation** — fix the text.

Origin: the reader reported a stray `◌` in BG 14.26 (`भक्ितयोगेन`). It was not a regression — `git log` over every commit that touched content shows the count strictly monotonic (98 from the first Gita import, 155 after the Valmiki corpus landed); **no commit ever reduced it.** 205 instances across the pipeline had been invisible to CI since the corpus was imported, because every check pointed at the romanization and none at the Devanagari. The July gu/kn spec surfaced the nukta subset, estimated it at "~6 Gita source strings", marked it out of scope, and never ticketed it — the real count was 47 shipped.

### 11.15 Synthetic recitation is assistive, never authoritative
§11.3 forbids AI-**generated** liturgical text. A synthetic **voice** reading authored text is a
different thing, but close enough to need its own rule, because a `hi-IN` voice applies Hindi
phonology to Sanskrit: word-final schwa deletion (`रामः` → "raam"), mishandled visarga and
anusvāra, no vedic accent, `ॐ` frequently clipped, and anuṣṭubh metre flattened to prose. On a
devotional reader that can read as disrespectful rather than merely imperfect. So:

- **TTS may read authored verse; it must never alter it.** The pronunciation normalizer
  (`mobile/src/readAloud/pronounce.ts`) affects **only** the string handed to the synthesizer.
  Displayed text, share cards, and the search index are never touched.
- **Never present it as human recitation.** The settings sheet names it a device voice
  ("उपकरण की आवाज़ से — मानव पाठ नहीं"). Where a real recording exists (`hasRealAudio`), the
  recorded `▶` stays **first** in the reader top bar and read-aloud second.
- **Never record, cache, or ship TTS output as an audio asset.** Pre-rendering synthetic
  recitation into bundled files would make it indistinguishable from a commissioned recording —
  that is squarely inside §11.3.
- **Always opt-in per press.** Read-aloud never autoplays on opening a reader.

---

## 12. Theerth archetype (तीर्थ — map-driven pilgrimage tours)

Theerth is a fundamentally different content shape from the verse archetypes in §§1–2. The unit is a **temple**, the entry surface is a **map of India** (stylised SVG, not a tile provider), and the destination is a **vertical-scroll detail screen** with prose narrative — no swipe-paginated verse reader.

Full proposal lives in [`docs/roadmap/prds/07-temple-tour.md`](./docs/roadmap/prds/07-temple-tour.md). This section captures the contract; the PRD captures the rationale.

### 12.1 Section data shape

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
  deity: Deity;                   // existing union — MUST match invocation per §11.4
  groups: TheerthGroup[];         // pilgrimage-tradition tags; may be [] for "other famous"
  addedInVersion?: string;        // NEW-badge tracking, mirrors LibraryEntry
};

type TempleDetail = {
  significanceHi: string;         // single prose block (NOT a paragraph array)
  significanceEn: string;
  originStoryHi: string;          // Sthala Purāṇa narrative — single prose block
  originStoryEn: string;
  sources: readonly { label: string; url: string }[];  // ≥ 2 per §11.1
};

type TempleEntry = BaseTempleEntry & TempleDetail & { addedInVersion: string };
```

There is no per-temple `background` field — the detail screen resolves its sketch by presiding deity (with per-temple id overrides) via `getTheerthBackground()` in `mobile/src/data/backgrounds.ts` (§12.4). There are no `introHi/introEn` fields — the browse surface has no intro prose, only the tap-a-pin hint line on the map view.

`coordinates` and `stateHi/En` are mandatory: the map can't pin without lat/lng, the state-list view can't group without state labels. Do not derive state from lat/lng via polygon lookup — store it explicitly.

`groups[]` tags each temple with the pilgrimage traditions it belongs to. A temple may belong to multiple groups (e.g., Rameshwaram is `['jyotirlinga', 'char-dham']`; Kedarnath is `['jyotirlinga', 'chota-char-dham']`); a temple with no traditional-yatra membership uses `groups: []` and appears under "Other Famous Temples" in the By-Yatra view. The four group tags are fixed; do not invent new ones without amending this section. New traditional circuits (e.g., Divya Desam, Pancha Bhoota Sthalam) require adding a new tag to the `TheerthGroup` union AND a `groupMeta` entry in the data module before they can be used.

### 12.2 File set (replaces §2 rows 1–6 for theerth)

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

### 12.3 Map technology

Stylised SVG India outline rendered via `react-native-svg`. **Do not** install `react-native-maps` or any tile-provider SDK. No API keys, no billing, no network. The map is a fixed-aspect static rendering with pins overlaid via lat/lng → x/y linear projection within India's bounding box (lat 6–38, lng 68–98).

### 12.4 Content integrity (theerth-specific)

All of §11 applies. The high-risk ones for theerth:

- **§11.3 No AI-generated liturgical text.** Origin-story prose (Sthala Purāṇa narratives) must come verbatim from published authoritative sources — Shiva Purāṇa (Gita Press), temple trust publications, ASI listings. Never paraphrase or "reconstruct" via LLM.
- **§11.1 Internet verification.** Each temple's origin story must cite ≥ 2 independent authoritative sources in its `sources[]` array.
- **§11.4 Deity accuracy.** Each temple's `deity` field must match the invocation in the source narrative — do not guess from the temple name.
- **§11.8 Background per temple.** The detail screen renders the temple's presiding **deity** background (every deity ships a verified, thematically-correct sketch per §11.8) via `BackgroundLayer` — this is the shipped default. A bespoke per-temple sketch may be added later to override it, but never fall back to an *unrelated* deity's image.
- **Coordinate sanity.** Coordinates outside India's bounding box (lat 6–38, lng 68–98) fail the `index.ts` invariant. This catches lat/lng swaps (common copy-paste error from sources that write `lng, lat`).

### 12.5 Verification for theerth (replaces §4 steps 4–8)

1. App boots; the Theerth tile is visible on Home under Categories.
2. Tapping the Theerth tile lands on the Theerth **browse listing** (no map on the landing surface): a two-way segmented toggle `राज्य · By State` / `श्रेणी · By Category` (By Category is the default) over grouped cards with counts. (design.md §26)
3. Drilling into a state or category re-pushes the screen with `stateEn`/`group` params and shows the `<IndiaMap>` for that subset, with every temple pinned at the right location (eyeball-check against a known map — e.g., Kashi Vishwanath is in UP, not Tamil Nadu).
4. Multi-group temples (Rameshwaram, Kedarnath, Badrinath) appear under every category they belong to in the By-Category view.
5. Language toggle swaps title, view-toggle labels, group/state labels, pin tooltips, and the tap-a-pin hint. No Devanagari leaks in English mode; no English leaks in Hindi mode.
6. Tapping a pin lands on `TheerthDetailScreen` for that temple; same for tapping a list row.
7. Detail screen shows, over the temple's presiding-deity background (§12.4): hero (temple name + city + state + deity badge), `महिमा · Significance` block, `उद्भव कथा · Origin Story` block, sources footer. Both languages populated (verified in §11).
8. Back from detail returns to the browse/drill-in screen preserving its view-mode state.
9. Per-temple device check on iOS AND Android — Devanagari rendering in pin tooltips can differ between platforms.

---

## 13. Intent discovery metadata (PRD-B)

Intent-driven discovery is metadata over bundled content, not new scripture text and not an astrological prescription engine.

### 13.1 File set

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

### 13.2 Curation rules

- Purpose tags are curated associations. Do not generate or infer new devotional claims from an LLM. Each `discoveryMeta` row must carry a non-empty `source` explaining the association/provenance.
- `bestDays` values are JavaScript weekdays (`0` Sunday … `6` Saturday), matching `data/routine/vaar.ts`.
- `bestFestivals` values are observance rule ids resolvable by `getRuleById()`.
- `bestTime` is a small closed set (`brahma-muhurta`, `sunrise`, `sunset`, `any`). Add a new value only with a label helper update and tests.
- Viniyog fields are whole-text metadata. They must not be rendered per verse or stored on verse rows.
- Purpose search must not create standalone “purpose result” rows unless a new UX explicitly calls for them; the current contract is section-level matching.

### 13.3 Verification

- `contentCorrectness.test.ts` verifies every purpose has at least one active text, every metadata key/id/day/festival is valid, every metadata row has a source, Tuesday recommendations include Hanuman content through the vaar map, and deity essays are source-cited.
- `searchIndex.test.ts` verifies English and Hindi purpose names find tagged sections.
- Jest screen tests verify Browse by Purpose, Purpose List, Deity Detail, and the first-page-only reader panel.
- A Maestro flow should cover Home → By Purpose → purpose list → text → reader before merge; if it is not run, the PR must state that explicitly.

---

## 14. Kundali and Rashifal engine (PRD-C)

### 14.1 One pure astronomy foundation

- Extend the existing `mobile/src/panchang/` astronomy stack. Do not add a second astrology SDK, network ephemeris, or screen-local calculation.
- `kundali.ts` stays pure: explicit `Date` + coordinates in, typed data out. No React, AsyncStorage, wall-clock reads, randomness, fetch, or platform APIs. UI/hook code supplies “now” explicitly.
- v1 accepts `timezone: 'Asia/Kolkata'` only and bundled Indian cities. Birth profile location is separate from `PanchangLocationContext`; changing one must not mutate the other.
- Sidereal positions use the same Lahiri ayanamsa primitive as Panchang. Classical grahas come from `astronomy-engine`; Rahu is the mean ascending node and Ketu is exactly opposite. Houses are whole-sign from the sidereal Lagna.

### 14.2 Golden accuracy contract

- The three hand-picked goldens live in `panchang/__tests__/fixtures/kundali-swiss-ephemeris.json`. Broad coverage lives in `kundali-swiss-ephemeris-150.json`: a reproducible 15-city × 10-instant matrix generated only by `scripts/generate-kundali-swiss-corpus.py` from pinned official Swiss Ephemeris 2.10.03 files, `SIDM_LAHIRI`, and `calc_ut`.
- The 150-case corpus holds angular error to ≤0.012° for grahas and Lagna and ≤0.005° for ayanamsa; rashi, nakshatra, pada, whole-sign house, retrograde state, first Mahadasha lord, and birth Antardasha lord require exact equality. The independently derived first-Mahadasha boundary may differ by ≤5 days because a sub-0.01° Moon delta is amplified across a multi-year balance; the test must prove that delta is explained by the Moon delta to within one minute.
- Vimshottari uses the Moon's 27-nakshatra position, the canonical `Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury` order, a 120-year cycle, proportional balance at birth, and contiguous Mahadasha/Antardasha intervals.
- Full method and measured maxima are recorded in `panchang/KUNDALI_VERIFICATION.md`. Any deliberate ephemeris/ayanamsa/Dasha-policy change requires regenerating the independent corpus and calling out the change in release notes; never silently update expected numbers or widen tolerances to match implementation.

### 14.3 Interpretation and safety

- Kundali insight copy explains what a placement means structurally (what Lagna/Moon/Dasha is). It must not turn generic positions into fixed personality diagnoses or guaranteed life events.
- Rashifal is deterministic from explicit India civil day + Moon-sign index + pure transit rules. Never use `Math.random`, AI generation, a remote horoscope feed, luck/compatibility scores, fear copy, or deterministic predictions.
- Every Rashifal surface must visibly frame output as traditional guidance/reflection, not certainty. Avoid “will happen”, “guaranteed”, “certain”, medical/legal/financial directives, and remedial claims.
- Practice links may target only active, existing library ids and route through `buildEntryStartTarget()`. PRD-C v1 is allow-listed to `navagraha-stotram`, `surya-ashtakam`, and `shani-ashtakam`; it does not invent new devotional prescriptions.

### 14.4 Product and verification contract

- Home keeps a permanent Kundali launcher; Panchang keeps Jyotish as a peer of Panchang and Vrat–Parv. Do not bury Kundali only in a carousel, More, or a second-level catalog.
- Do not create a “Default profile” or silently preselect a birth city. Profile hydration has explicit loading/guest/saved/error states, and failed persistence must remain visible and recoverable.
- Before a profile is saved, the Jyotish landing leads to creation. After saving, it leads with all three Daily Rashifal guidance rows, then a compact Kundali reference, then one shared practice treatment.
- Results lead with Overview before Chart/Grahas/Dasha. Lagna, Moon, and Dasha insight cards are actionable; the chart must have an equivalent text representation and a full accessibility summary. Every traditional rashi name shown in English UI is paired with its plain-English equivalent.
- The Dasha surface exposes the current Mahadasha/Antardasha, dates, elapsed and remaining time, and a full nine-period timeline. Those timing values must also be accessible to assistive technology.
- Kundali and Rashifal share cards use the app theme and a 4:5 preview. Kundali must warn that personal birth details are included; Rashifal must state that name and birth details are excluded. Do not place duplicate share controls inside Kundali tabs.
- Required checks: `npm run typecheck`, `npm run test:engine`, targeted Jest for new UI, and `.maestro/kundali-smoke.yaml` plus `.maestro/multi-profile-jyotish-smoke.yaml` (§14.5) on an isolated simulator/worktree Metro port. If Maestro is not run, state that explicitly before merge.

### 14.5 Multi-person profiles — one roster, one active selection

- Birth details live in the **roster** (`panchang/birthProfiles.ts` pure model + `birthProfileStore.ts` persistence, `@vedansh:kundali-profiles:v1` = `{ activeId, people[] }`, cap `MAX_PEOPLE = 8`). Never add a second store, and never keep a screen-local “current person”: the Kundali result, the Jyotish landing, Daily Rashifal and the muhurat आपके लिए strip all read the one active selection, so a switch on any surface is true on all of them.
- `birthProfiles.ts` stays pure (roster in, roster out; ids supplied by the caller). AsyncStorage, the subscriber list and the serialized write queue live in `birthProfileStore.ts`. A mutation publishes only AFTER its write lands, and only a SUCCESSFUL read is memoized — one transient storage failure must not pin a session to an empty roster.
- A `PersonProfile.id` is a persisted key, never a display string. Renaming or regenerating ids silently unselects the user's person.
- The PRD-C single-profile key `@vedansh:kundali-birth-profile:v1` migrates ONCE into person one and is then removed, so removing that person really removes their birth details. An unreadable legacy record is never deleted and must still reach the shipped corrupt-profile recovery state. Both keys stay OUT of the derived-cache sweep (`derivedCacheReset`), enumerated by its test.
- Adding a person is additive: the add form starts blank (`Kundali { newPerson: true }`), never pre-filled from the active person, and Edit still edits the active person. Removing one of several people lands on a survivor; removing the last returns the guest state.
- With more than one person saved, every surface that would say “your” names the person instead (landing/Rashifal source line, muhurat strip label). With exactly one, the shipped wording is unchanged — the solo experience must not regress.
- The strip's annotate-only and privacy lines (§17.12) still hold per person: no name or bala word may reach a share card, a notification, or any analytics counter.
- Required checks for a roster change: `npm run typecheck`, `panchang/__tests__/jest/birthProfiles.jest.test.ts`, `screens/__tests__/MultiProfileJyotish.test.tsx`, `screens/__tests__/MuhuratPersonalStrip.test.tsx`, and `.maestro/multi-profile-jyotish-smoke.yaml` on iOS and Android (§8).

## 15. Guna Milan engine (PRD-16)

### 15.1 One pure engine on a pinned convention

- Add `gunaMilan.ts` to the existing `mobile/src/panchang/` stack and reuse `getSiderealPlanetLongitude('moon', date)`. Do not add a second astrology SDK, network ephemeris, or screen-local calculation.
- `gunaMilan.ts` and `gunaMilanConvention.ts` stay pure: explicit longitudes/dates in, typed data out. No React, AsyncStorage, wall-clock reads, randomness, fetch, or platform APIs (pinned by the engine source-purity test).
- The calculation is pinned in `docs/roadmap/conventions/guna-milan-v1.md` (`vedansh-ashtakoota-v1`): all classification tables/matrices, the वर→वधू direction of directional kootas, every half-point score, the exact 15° Vashya splits, the band boundaries plus DrikPanchang Bhakoot/Nadi display modifiers, and the single auditable Bhakoot cancellation (same rashi-lord or Graha-Maitri 5). A table or rule change requires a **new convention id** and fixture review; it must never silently change old results. The base score is always the arithmetic sum of the eight kootas — a cancellation changes only the explanatory flag.
- v1 uses India/IST civil time only and needs no birthplace. It must not mutate `PanchangLocationContext` or the Kundali birth profile.

### 15.2 Independent fixture contract

- `gunaMilan.golden.test.ts` holds expected row scores transcribed from independently published compatibility reports (Mini/Jose 20/36; Chitra/Uttara-Ashadha 19.5/36), never captured from Vedansh output, plus every supported Bhakoot cancellation branch and the same-Nadi 28/36 display-band case.
- The 108×108 engine sweep pins the complete set of reachable score values for every koota, and boundary tests exercise below/at/above each pada, rashi, and 15° Vashya boundary. Domain sign-off of the tables (direction, fractions, cancellations) remains a human gate before merge (PRD-16 gate 1).

### 15.3 Privacy and safety

- Inputs are session-only by default. Persistence is opt-in under a versioned key with a visible clear action and is never implicitly restored. The share card is a strict allow-list — optional names, वर/वधू roles, total, band, eight component scores, disclaimer, brand footer — and never embeds birth date, time, location, or profile id.
- Output frames a traditional calculation, not a verdict: no fear copy, remedy/gemstone/consultation upsell, lead capture, Mangal-dosha or full-chart claims, or any cancellation not backed by a pinned, tested rule. Unknown birth time is a checked interval across the full IST civil day, never a substituted noon and never a persisted fabricated time.

### 15.4 Product and verification contract

- Guna Milan is a card below Kundali and Rashifal on the Jyotish landing and lives inside the Panchang stack (not a duplicate root route). Saved-Kundali autofill must work for either directional role.
- Required checks: `npm run typecheck`, `npm run test:engine`, targeted Jest (`GunaMilanExperience.test.tsx`), and `.maestro/guna-milan-smoke.yaml` on iOS and Android with an isolated simulator/worktree Metro port. If Maestro is not run, state that explicitly before merge.

## 16. Home-screen widgets (PRD-15)

### 15.1 One versioned, bundle-only payload

- Widgets read a single pre-computed document, never live app state. The schema is `WidgetPayloadV1` in `mobile/src/widgets/contract.ts`: `schemaVersion`, provenance (`generatedAt`, `writerAppVersion`), `locale`, a ~14-day **IST** Panchang window, a device-local verse window, and a Japam snapshot. Add fields additively; bump `schemaVersion` for any breaking change and keep native readers rejecting unsupported versions.
- The planner (`planner.ts`) stays pure: explicit inputs in, typed payload out. No React, AsyncStorage, wall-clock reads, randomness, `fetch`, or platform APIs. There is no background/headless JS runner at widget-draw time.
- The deferred coordinator (`WidgetCoordinator.tsx`) must dynamically `import()` the planner after `InteractionManager` settles, never statically import the Panchang graph — Home's first-frame/first-tap path must not pull the astronomy stack. It dedupes by a stable key over day/location/calendar/language/japam revision, throttles writes, persists atomically, then requests a native reload. Do not regress the `startup` test that pins this.

### 15.2 Cross-language parity, fail-closed

- A committed fixture — `mobile/src/widgets/fixtures/widget-payload-v1.json` — is decoded by TypeScript (`contract.ts`), Swift (`plugins/home-widgets/ios/WidgetPayloadContract.swift`), and Kotlin (`plugins/home-widgets/android/WidgetPayloadContract.kt`). All three must stay in parity; a schema change updates the fixture and all three decoders in the same PR.
- Native readers validate schema, required fields, dates, and freshness and **fail closed** — never a partially decoded value, never an old entry labelled as today. Every missing/corrupt/incompatible/expired state resolves to a safe "open वेदांश़" recovery card (per design.md §59). No wrong-date Panchang is a hard release gate.
- All four languages (`hi`/`en`/`gu`/`kn`) are required in the payload and their serif faces (Noto Serif Devanagari/Gujarati/Kannada + Inter) must be bundled into the native targets. A Hindi-only native surface would be a separate product decision, not a silent omission.

### 15.3 Native delivery and OTA safety

- Initial delivery is **store-binary-only**. No OTA may add or change native target code, entitlements, SwiftUI/RemoteViews layout, or fonts. A JS planner/copy change may ship OTA only to a runtime whose native reader already supports that schema — mind the store runtime version ([[ota-runtime-version-mismatch]] gotcha).
- The iOS surface is a real WidgetKit **app extension** target (`VedanshWidgets`), not a main-app-linked Swift module, generated reproducibly from the CNG config plugins (`mobile/plugins/withHomeWidgets.js`, `withHomeWidgetsIos.js`, sources under `mobile/plugins/home-widgets/`). App Group entitlement (`group.com.prashantsharma.vedansh.widgets`) must be present on both app and extension; Android uses a dedicated SharedPreferences payload + AppWidget provider. `mobile/ios/` is prebuild output (gitignored) — the plugin is canonical.
- Deep links use the `vedansh://widget/{verse|panchang|japam}` scheme only, parsed/dispatched by `mobile/src/widgets/deepLink.ts` on cold and warm start. Widget taps route through existing entry targets — they never invent a default mantra or a fabricated destination.

### 15.4 Product and verification contract

- Discovery surfaces: the `होम-स्क्रीन विजेट` More row (one-release NEW), the in-app **Widget Gallery** (`WidgetGalleryScreen.tsx`, previews from the same validated payload the native consumers read + accurate platform add-instructions — no promise of a system widget-picker jump), and one launch-release Home Discover spotlight. No new permission prompt is introduced.
- Required automatable checks: `npm run typecheck`, the `src/widgets/__tests__/` suites (contract round-trip incl. missing/corrupt/expired/newer-schema; planner streak/>108/TZ-boundary/two-line; deep-link parse+route; coordinator no-static-import), targeted Jest for touched UI, and `.maestro/home-widgets-smoke.yaml`. If Maestro is not run, say so before merge.
- **Device-only gates** (cannot be closed in CI/worktree; state their status explicitly before shipping): a clean CNG prebuild that reproducibly creates/entitles/signs the extension with no Xcode drift, an EAS build installing every signed target on a physical device, an app-write → widget-reload check, and per-size render / VoiceOver-TalkBack / large-text / Devanagari-matra screenshots. A local Swift module is not accepted as proof of extension-target feasibility.

## 17. Event Muhurat Finder (PRD-16) — rule-table contract

The finder (`mobile/src/panchang/eventMuhurat.ts`, `abujhMuhurat.ts`, screens in the Panchang stack; design.md §60) grades civil days for an occasion from the shipped panchang/muhurat primitives. Its **rule tables are religious content** and carry the same obligations as any text in the app.

1. **§10 applies to every `EVENT_RULES` entry.** Each occasion's nakshatra/tithi/vara lists must be verified against **≥2 independent authoritative concordant sources** (its `source.referenceUrls`), with recension/regional variance recorded in `source.notes`. Until an entry passes, its `source.verified` stays `false` — and **`verified: false` tables are a release blocker for any store build that exposes the finder**. The engine test pins that no entry claims verification prematurely.
2. **Convention is declared, not implied.** The finder follows **DrikPanchang** (like the rest of the Panchang subsystem): factor model = nakshatra + vara + tithi + masa shuddhi; asta bar per Muhurta Chintamani/Dharmasindhu. **Phase 2 (TRD-16/P2): angas are evaluated at the WINDOW, per window** — the day pass carries only doshas that hold sunrise-to-sunset; tithi/nakshatra factors AND their doshas (rikta, amavasya, panchak) are graded on the anga prevailing at each window's start, kshaya-aware. भद्रा is an interval (`karana.endTime`, solved) that drops overlapping windows — never clips them — and a bhadra outlasting every window still excludes the day; **Phase 3: a late-onset Vishti (`PanchangData.lateVishti` — the karana after the sunrise karana) is the same interval starting mid-day**. Masa shuddhi is a lookup against the purnimant-normalised month; `masa` counts as a §10 table like the anga lists, and it is SEASONAL (an abujh day lifts it, §17.8). **Phase 3 (PRD-16/P3): windows are SPLIT first, graded second** — at every lagna boundary (`DayInputs.lagnas`, swept by `lagnaSweep.ts` from the closed-form kundali ascendant) and every anga changeover inside them; split parts under 24 minutes are dropped, never clipped; each segment grades at its own start and carries `lagnaRashiIndex`/`horaRuler`/`splitFrom`. The lagna factor: preferred = tie-break + evidence word; **barred = demote श्रेष्ठ → मध्यम, never exclude** (recorded variant choice, `docs/roadmap/conventions/muhurat-lagna-v1.md`); the per-occasion lagna tables ship EMPTY DRAFT (grading inert, test-pinned) until that doc clears two-source review. **Hora is evidence and tie-break ONLY**: ordering runs tier → preferred lagna → window priority (Amrit → Abhijit → Shubh → rest) → benefic hora → time; hora can never move a tier or leapfrog the priority order (the साक्ष्य word on-surface states it). यात्रा's **दिशा शूल** is a vara-keyed barred-direction table (DRAFT, same doc; intercardinals carry no shool in v1); the chosen direction is scan-time input — **never persisted**, so a followed यात्रा day re-grades direction-free — and its exclusion reason must name the direction on-surface. The results/day-detail UI names the convention on the surface (`· दृक्पंचांग पद्धति`). Changing convention is a product decision, not a table edit.
3. **Consume the engines; never re-match.** Chaturmas derives from the sunrise anga (kshaya-safe, purnimant-normalised); abujh days resolve through `festivalEngine` (`ABUJH_RULE_IDS`) — re-implementing tithi matching re-introduces the kshaya/vriddhi bugs the engine already fixed. Window-time angas come from the SOLVED end instants (`tithi.endTime`/`nakshatra.endTime`/`karana.endTime`) via `angaAt` — never from a fresh ephemeris read, and never by assuming `index + 1` across a kshaya boundary. Asta uses `getSiderealPlanetLongitude`; orbs are 10° (Shukra) / 11° (Guru), flat.
4. **Two tiers, never a score.** श्रेष्ठ / मध्यम — the §14 no-luck-score rule extends to muhurat verdicts. Empty windows must render *empty-with-reason* (dominant doshas + first dates after), never a bare empty list.
5. **Purity.** `eventMuhurat.ts`/`abujhMuhurat.ts` stay free of wall-clock reads, randomness, network, storage, and React (source-guard test). All clock/scan behaviour lives in `useMuhuratFinder`. The shared day store (`panchangDayStore.ts`), its serde (`panchangDaySerde.ts`) and the scan core (`muhuratFinderScan.ts`) stay RN-free for the same reason — AsyncStorage lives only in `panchangDayCache.ts`, so the tsx engine suite can import the rest.
6. **One shared, versioned day-store — no per-surface panchang caches.** The per-day solve is cached in `panchangDayStore` per (`locationKey`, calendar system), keyed by absolute civil date, persisted by `panchangDayCache`, and read by EVERY panchang surface: the finder scans, the abujh calendar, the day detail, Home's Today strip, the daily Muhurat card, and the Panchang tab (design.md §60). Five obligations follow, and all of them are release-blocking:
   - **Version it.** Any change to the panchang engine, to `DayInputs`, or to the asta flags MUST bump `PANCHANG_DAY_CACHE_VERSION` in `panchangDaySerde.ts` — otherwise already-scanned devices keep serving the old engine's days and the fix reaches only fresh installs (the same failure mode as `observanceCache`'s `CACHE_VERSION`). Adding a city needs no bump. The build-change reset (§17.11) is a backstop for a forgotten bump, **not a replacement** for one: it only fires when the build moves, so within a release the version number is still the only thing that invalidates anything.
   - **Keep the persisted window AHEAD of what any surface renders.** A cache whose window ends exactly at the last day a surface reads is cold again the moment the civil date changes. Home read yesterday/today/tomorrow and persisted precisely those three, so the first launch after every midnight re-solved its own "tomorrow" before the Today strip could paint — a persistent cache that still felt like a daily recompute. `panchangDayPrewarm.ts` rolls the window `PREWARM_DAYS` (7) past today after the day's own solve lands; any new daily surface must either read inside that window or extend it, never sit on its edge.
   - **Never mutate a `PanchangData`.** Every reader gets the SAME instance, so one in-place write corrupts the other surfaces and the persisted copy. Clone before mutating, or keep the consumer read-only; `panchangDayImmutability.test.ts` holds the line.
   - **Do not add a private cache to a hook or screen.** A second cache re-introduces the divergence this store exists to remove. `useMuhurat`'s `SOLVE_CACHE` and the finder's index-keyed `DAY_INPUT_CACHE` were both deleted for this reason.
   - **A daily surface's read must not wait on the launch to finish.** Home's panchang card is the only thing on that screen which cannot render from bundled JS, so anything serial in front of its `multiGet` is visible as "the panchang loads slower than the homepage" — reported three times before it was fully closed (window too short, work queued in front of the read, then the read itself starting too late). `panchangLaunchPrefetch.ts` runs at `App.tsx` **module scope** and warms today's days concurrently with the splash gate. Three rules bind anything that touches it: both panchang preferences come from the single memoized `panchangPrefs` read (never a second `getItem` — they are one scope key and belong in one round trip); the prefetch **hydrates and never solves**, because astronomy on the launch path is the problem `InteractionManager` gating exists to prevent; and it must warm exactly the keys the surface reads, via the shared `todayMuhuratDayKeys()` — `composeSolved` returns null on ANY miss, so a prefetch that warms a different set silently does nothing at all.
   The one legitimate exception is the widget writer, which solves with `civilTimeZone: WIDGET_TIME_ZONE` and therefore describes different civil days than the device-local store; `ScanOptions.civilTimeZone?: never` makes routing it through the store a compile error.

   **A cache of ANSWERS follows the same obligations, one layer up.** `pitruSmaranSolves.ts` (design.md §63) persists what a tithi scan over hundreds of days produced — a person's next occurrences, a year's Pitru Paksha window — because those scans cost ~423 ms cold and the engine memos die with the process. It shares `PANCHANG_DAY_CACHE_VERSION` deliberately: an engine change that moves a day's tithi moves the answer derived from it, so one bump invalidates both and there is no second version number to forget. Three rules bind it. Its keys carry **no location/system scope**, because Pitru Smaran deliberately solves at the engine default (a family's shraddha tithi does not move when the user changes city) — thread a location through those screens and this cache must gain a scope segment first. Its records are keyed by **tithi only**, never by entry id, relation or name: the ledger is private, and a derived cache must not become the thing that names who is remembered. And an on-demand solve asks for exactly what the screen renders — the rollover margin is bought by the list's prewarm on idle time, never by putting another year-long scan on the path being shortened.
7. **Follow & remind is a DATED ONE-SHOT store, not the vrat store.** A vrat follow keys a recurring `ObservanceRule` whose next occurrence the festival engine recomputes; a muhurat follow keys **one civil day** (`MuhuratFollowContext`, `{occasionId}:{YYYY-MM-DD}`). Four obligations follow:
   - **Prune.** A follow whose day is past must be dropped on load and on day rollover, or the ★ count grows without bound and counts notices that can never fire.
   - **Never persist a window.** Every window is sunrise-derived, so a stored time lies the moment the user changes city. `MuhuratReminderScheduler` re-derives each follow's window from `panchangDayStore` on every pass and **re-arms on location and calendar-system change**, not only when follows change.
   - **Excluded days fire nothing.** A followed day that re-grades to `excluded` (usually a location change) keeps its follow, says so **in words** on-surface (§12 — never colour alone), and schedules no notice. The finder must never remind a user about a day the engine now rejects.
   - **The day-of notice lands before the window.** `clampDayOf` pulls it back to `windowStart − 30 min` whatever the user chose — a muhurat is a time, not a day, and the shipped 07:00 vrat default arrives after an early-Amrit window has opened. Notification copy, cap (`MUHURAT_REMINDER_CAP = 8`, soonest-first) and prefix (`muhurat-reminder`) follow the six shipped families; the reminder sheet is the **shared** `VratReminderSheet` with extra `dayOfOptions`, never a fork (§9).
8. **Abujh days: never cap the festival resolve by COUNT, and they lift the seasonal bars.** Two Phase-1 defects, both pinned by `abujhCoverage.test.ts`:
   - `getUpcomingObservances` applies `.slice(0, count)` **after** its date filter, so a count cap truncates by observance count, not by date. `scanAbujhDays` passed 60, which from mid-August 2026 ran out in late October — a 260-day scan stopped ~73 days in and **five of the six `ABUJH_RULE_IDS` never reached the screen** (Akshaya Tritiya, Vasant Panchami, Dhanteras, Akshaya Navami, Dev Uthani Ekadashi). `withinDays` is the only bound that belongs there; pass an unbounded count.
   - अबूझ means *no panchang shuddhi required*, so the finder must not grade an abujh day by rules the Abujh screen says do not apply. `evaluateDay(..., { abujh: true })` drops the **seasonal** doshas (`chaturmas`, `guru-asta`, `shukra-asta`); per-day doshas (rikta, panchak, bhadra, amavasya, adhik, vyatipata, vaidhriti) still apply. **This line is an interpolation, not a sourced rule** — §4.2's wording ("need **no** panchang shuddhi at all") is stronger than what is implemented, and the narrow reading leaves most abujh×occasion pairs still excluded, several of them on FACTOR match rather than any dosha. Resolve at §10; whichever way it goes, the Abujh screen's copy and the finder's verdicts must agree.
9. **Documented open questions** (resolve before or at §10 review): the 8° retrograde-Shukra orb; whether asta gates occasions beyond Griha Pravesh/Bhumi Pujan; Abhijit-on-Wednesday (sharper now that windows are minute-grade); which lagna school per occasion (empty rows are a legitimate outcome — the factor stays inert); the जन्म-tara word (`contested` in v1 copy); Chandra-vasa for यात्रा (out of v1); an opt-in "prefer my good days" sort (annotate-only stays the default). CLOSED by Phase 2/3: Bhadra as a window (incl. late-onset Vishti), window-time anga evaluation (per-segment since Phase 3). **Vivah is permanently out of scope** — it needs both charts and guna milan.
10. **Tests.** `eventMuhurat.engine.test.ts` (tsx) pins the Chaturmas boundaries (incl. the 2026 kshaya Dev Uthani), amanta invariance, the validated asta windows, the 26 Nov 2026 Griha Pravesh golden, the zero-result 90-day scan, and the draft flag. Cache correctness is pinned by `dayCacheParity.e2e.test.ts` (fresh == cached == serialize→revive over a year × 3 locations × 2 systems) and `panchangDayStore.test.ts`; storage by `__tests__/jest/panchangDayCache.jest.test.ts`; the no-mutation invariant by `panchangDayImmutability.test.ts`; the roll-forward window by `__tests__/jest/panchangDayPrewarm.jest.test.ts`; the launch-order contract by `__tests__/jest/panchangLaunchPrefetch.jest.test.ts` (one shared preferences round trip; the stored — not default — scope warmed; first-render composition, with a non-vacuity case proving the assertion fails without the prefetch; hydrate-only, never a solve); and the daily surfaces' zero-solve routing by `__tests__/jest/panchangDayRouting.jest.test.ts` — whose rollover case fakes `Date` only (real timers) to cross a midnight and assert Home solves none of the days it renders, the one gate Maestro cannot express since a flow cannot move the device clock. Abujh coverage + the abujh↔finder contract: `abujhCoverage.test.ts`. Phase 2: `eventMuhuratPhase2.test.ts` (the karana solver's 6°-boundary invariant and its coincidence with tithi ends when Vishti is a second half; kshaya-aware `angaAt`; the 20 Aug/3 Sep 2026 bhadra windows; whole-day bhadra; per-window tiers; masa mechanism + calendar-system invariance; the twelve-occasion roster). `.maestro/muhurat-phase2-smoke.yaml` drives the grouped picker → a Phase-2 occasion → the windows section, and spot-checks the Karana end-time on the daily card. Follow & remind: `muhuratReminderPure.test.ts` (fire times, the clamp, cap ordering, excluded-day silence, copy) and `MuhuratFollowContext.test.tsx` (normalize, de-dup, prune). Screen smokes in `MuhuratFinderScreens.test.tsx` and `MuhuratFollow.test.tsx`; notification routing in `deepLink.jest.test.tsx`; e2e in `.maestro/muhurat-finder-smoke.yaml`, `.maestro/muhurat-follow-smoke.yaml` and `.maestro/panchang-day-cache-smoke.yaml`. Phase 3: `lagnaSweep.test.ts` (span tiling/monotonicity, boundary crossings, agreement with the Swiss Ephemeris corpus rashi for all 150 charts, closed-form == `computeLagna`, purity — a published per-city daily lagna table is additionally owed at §10), `hora.engine.test.ts` (12+12 tiling, weekday-lord sequence via the 25th-hora property, purity), `eventMuhuratPhase3.test.ts` (split-at-lagna/anga incl. the kshaya day, sub-24-min drop, empty-tables back-compat, synthetic barred-demotion/preferred-tie-break, hora-is-tie-break-only, late-onset Vishti, दिशा शूल incl. the intercardinal variant), and `eventMuhurat.drikfixture.test.ts` — the Phase-1 golden debt, landed: rows from DrikPanchang's PUBLISHED Nov-2026 Griha Pravesh list as recorded in-repo, with the Chaturmas-reading divergence asserted AS a divergence naming its dosha (never "fix" a failure by copying engine output — extend only from published lists). Phase 4: `taraChandraBala.test.ts` (full 27×27/12×12 matrices row-for-row against `muhurat-tarabala-v1.md`, चंद्राष्टम, जन्म-contested, the Guna-Milan-divergence guard, purity) and `MuhuratPersonalStrip.test.tsx` (strip only with a profile, removal clears, corrupt profile = guest, share-card and reminder-copy absence). E2e: `.maestro/muhurat-phase3-smoke.yaml`, `.maestro/muhurat-phase4-smoke.yaml`.
11. **A build change clears the COMPUTED-CALENDAR caches — and only those.** `utils/derivedCacheReset.ts` compares a build fingerprint (`utils/buildFingerprint.ts`: OTA `updateId` · `runtimeVersion` · the bundle's version · the native build number) against the last one this device ran, and on any change clears those caches before anything reads them, so a bug baked into cached panchang/muhurat output cannot outlive the release that fixes it (design.md §60). Four obligations:
   - **Allowlist, never denylist.** Only prefixes holding engine-computed calendar output belong there: `@vedansh:panchang-days:`, the legacy `@vedansh:muhurat-days:`, and `@vedansh:observances:`. Derived-but-not-calendar state stays out — `@vedansh/widget:last-plan-key-v1` is a write-dedupe key, and `WidgetCoordinator` already re-plans every pass and rewrites when the payload changes.
   - **Never sweep user data.** The chosen city and calendar system (clearing them silently resets the user to Ujjain), OS-notification bookkeeping, and every follow, count, bookmark, reading position, birth detail and Pitru Smaran entry are excluded. `derivedCacheReset.test.ts` enumerates the full non-swept key set and fails if any allowlisted prefix starts matching one — keep that list current when you add a key.
   - **Register at module scope and gate every cache.** `App.tsx` starts the reset at module scope (not in an effect), and each cache `await`s `awaitDerivedCacheReset()` before storage — on hydrate so nothing reads what the sweep will delete, on persist so nothing writes what it will wipe while the session believes those days are safe.
   - **Keep the fingerprint read out of the cache graph.** `expo-updates`/`expo-constants` are untranspiled ESM Jest cannot parse, so `derivedCacheReset.ts` imports AsyncStorage only and takes the fingerprint as a string. Importing them into a cache module breaks every suite that reaches it — the same trap as `expo-location` reaching Home.
12. **Personalised Tarabala/Chandrabala (Phase 4) — annotate-only, private by construction.** The strip's source of truth is the ACTIVE person in the birth-profile roster (`@vedansh:kundali-profiles:v1`, §14.5 — it follows a person switch and names whose bala it is once more than one person is saved) and nothing else: never re-asked anywhere in the finder, nothing derived from it persisted (one per-session memo keyed on the profile record; a corrupt profile is a guest state, never a rendered guess). Five hard lines, all test-pinned:
   - **It annotates, never re-grades**: no tier change, no exclusion, no reordering, no empty-state change — `verdictForDate` and every rider (share card, reminder scheduler, ★ chip, month overlay) know nothing of a profile. चंद्राष्टम is the strongest *word* the strip can show; the card still does not move.
   - **The share card carries no tara/chandra/janma anything, ever** (`MuhuratFinderShareCard` stays "no personal data by construction"); the Phase-3 lagna line is general panchang data and is the only Phase-3/4 addition allowed there.
   - **Notification copy stays generic** — a day-of notice never carries bala words (it lands on a lock screen).
   - **No-profile state renders NOTHING** except the one italic results-footer line (results list only, styled as the disclaimer, deep-linking to the Kundali screen); it never migrates onto cards or the detail, and no analytics counter may key on profile-derived values.
   - **The counting convention is `muhurat-tarabala-v1.md`'s and deliberately diverges from the Guna Milan Tara koota** — never reuse that matrix; the divergence has its own guard test. The class tables are DRAFT and gate release like the masa tables. No cache-version bump belongs to this feature: nothing in `DayInputs` changes.

## 18. Namkaran convention, corpus, and newborn-privacy contract (PRD-17)

1. **The convention is release-gated religious content.** `docs/roadmap/conventions/namkaran-namakshar-v1.md` owns the 108 charana cells and 27 display attributes. Every row group needs two concordant authoritative sources with edition/page or stable URL, retrieval date, and a named reviewer. Until the Shravana dual series and all thin consonant rows are explicitly resolved, `NAMAKSHAR_SOURCE.verified` stays the literal `false`; any release exposing the feature is blocked.
2. **One astronomy and flooring convention.** `namkaran.ts` reuses `getSiderealPlanetLongitude('moon', …)` plus the exported Kundali `PADA_SPAN`. Exact rational boundaries belong to the higher half-open cell, and boundary tests cover below/at/above all 108 values plus agreement with `computeGrahaPositions`. Never copy a second 3°20′ constant or infer from rounded display degrees.
3. **Unknown time is the whole IST day.** Enumerate every charana touched during `00:00:00–23:59:59` IST by boundary bisection, including the 107→0 wrap. No midpoint/noon, likelihood rank, single hero, or exact-syllable share is allowed. Candidate windows are equal `ListCard` rows.
4. **Corpus gate.** Every production record has a stable unique id, Devanagari name, pronunciation aid, gender class, charana ids, attested Hindi and English meaning, syllable count, and only resolving deity ids. Its Devanagari initial must mechanically match a primary or explicitly accepted alternate syllable. Every non-thin charana requires **at least twelve boy and twelve girl names** (a record classed `any` counts toward both, matching the runtime filter); a thin charana uses a declared nakshatra-level fallback whose pool must itself clear 12 + 12, and never an invented filler. `namkaranCorpus.test.ts` enforces the floor whenever `releaseEligible` is `true`, and asserts the inverse while it is `false`, so neither a short corpus nor a stale flag can pass unnoticed. Generated indexes must be reproducible from the shards by a committed script, and a test must re-derive them independently rather than call that script.
4a. **Sharding decision (reviewed, August 2026 — supersedes the single 512 KB cap).** The 12 + 12 depth puts the corpus near 750 KB, so the budget moves only together with this recorded split: **one shard per nakshatra**, `src/data/namkaran/names.<NN>-<slug>.json`, 27 files, resolved through a **static** require map because Metro cannot resolve a computed require path. A record whose charanas span two nakshatras is stored in **both** shards, byte-identical, and de-duplicated by id at load; a test pins that agreement. Two budgets replace the one: **≤ 64 KB per shard**, which is the budget that protects the user because a screen reads at most two shards, and **≤ 1,024 KB total**, which is only a bundle ceiling. Nakshatra was chosen over the originally-suggested syllable grouping because `charana → nakshatra` is `floor(c/4)`, making both an exact result and a thin-charana fallback exactly one shard. No surface may load the whole corpus: per-charana counts come from the generated `counts.json`, never from tallying shards. **Provenance travels per file, not centrally** — every shard and the generated index carry their own `source` block with ≥2 `referenceUrls` (§14 of `contentCorrectness.test.ts` applies to all content JSON), because a shard must be reviewable on its own; the generated index cites the generator and this contract rather than editorial sources, since it attests nothing about the names. Raising either budget again requires the same kind of recorded decision, not a silent edit.
5. **Development data cannot masquerade as release content.** A partial corpus may exist only with `verified:false` and `releaseEligible:false`, tests pinning those flags, and a release gate that prevents the feature from being exposed in a production build. Do not turn internal states such as DRAFT, review pending, `namakshar-v1`, or corpus eligibility into customer copy; RULEBOOK §3 still applies. Passing engine/UI tests does not close the editorial gates or authorize release exposure.
6. **Lazy boundary.** Corpus loading originates inside the already-lazy Panchang stack. `App`, Home, `TabNavigator`, the global text registry, and global search may not import `data/namkaran`; ESLint enforces those startup boundaries. Names never enter global search.
7. **Newborn privacy.** Birth input is session-only by default and persists only through an explicit unchecked opt-in with an invalidating write queue. The shortlist is a separate versioned record containing name ids only. Path B writes no birth key. Namkaran never reads or autofills the saved Kundali profile, never requests a city, and never mutates Panchang location.
8. **Allow-list sharing and diagnostics.** Exact share may contain syllables, nakshatra, pada, rashi, disclaimer, brand, and per-share-opted-in display names only. It never receives or serializes a basis, date, time, city, longitude, charana-plus-date pair, or profile. Unknown-time results do not share. Local counters, if added, contain event names/counts only and no name, syllable, or birth field.
9. **Verification.** Required before implementation closeout: `test:engine`, `test:data`, focused Jest state/screen/share suites, lint with zero errors, typecheck, and `.maestro/namkaran-smoke.yaml` run and reported separately on iOS and Android. Required before release: both human content gates above, not merely green automation.

## 19. Puja Vidhi (PRD-19) — guided-puja content contract

A vidhi (`mobile/src/data/vidhi/`) is a **procedure**, not a text: its unit is a step, and its liturgical payload is transcribed mantra text plus references into texts the app already ships. The family carries the same obligations as any religious content in the app (§11 applies in full), with these vidhi-specific rules:

1. **Data shape.** `VidhiEntry` (`data/vidhi/types.ts`): `id`, bilingual title, optional `anchor: 'personal-tithi'` (omitted = festival), `festivalIds[]`, `deities[]`, bilingual `conventionLine*`, `durationHintMin`, `samagri[{itemHi/En, qty?, optional?}]`, `steps[{id, phase 'prep'|'main'|'closing', titleHi/En, instructionHi/En, mantra?, ref?}]`, `source`. Registry: `VIDHI_ENTRIES` / `VIDHI_BY_ID` / `getVidhiForFestival` in `data/vidhi/index.ts`. Festival entries use observance ids and shared `Deity` tags; the personal-tithi remembrance has neither a fake festival nor a fake deity. Each Vidhi remains independently sourced and reviewable.
2. **Mantras are transcribed, never composed (§11.3, full force).** A step ships a `mantra {devanagari, iast, sourceUrl}` only when its exact text was verified verbatim against the declared sources; a mantra that cannot be verbatim-verified is **omitted** and the step ships instruction-only — never an approximation (the Satyanarayan sankalp step is the worked example). Every mantra carries a per-mantra `sourceUrl` citation, and its Devanagari must pass the §11.14 well-formedness validator — vidhi data is a `.ts` module the JSON sweep cannot see, so `vidhiContent.test.ts` runs the SAME canonical validator over every string in every entry.
3. **Reuse by reference, never by duplication (§11.11).** Steps that are a shipped text carry `ref {kind: 'katha'|'section', id}` or `ref {kind:'gita', chapter}` and render a hand-off card into the existing reader — the text is never re-typed into the vidhi. Katha/section ids must resolve and Gita chapters must be 1–18.
4. **Convention is declared in review data, not implied.** Every Vidhi carries a `conventionLine*` naming the tradition it follows. It remains internal review metadata and does not render on catalog, detail, conduct, or completion surfaces (design.md §62.2). Instructions are authored fresh in both languages, 1–2 lines, *what + why* (§9).
5. **The `source` block is review-only and complete (§11.2).** Same shape as the Valmiki Ramayana content: `canonicalEdition`, `canonicalEditionUrls`, `canonicalEditionStatus` (what was checked and when — or what is outstanding and why), `referenceUrls` (≥2 independent published references, §11.1), `retrievedOn`, `notes`. **Neither the source block nor any `sourceUrl` may ever render in the app UI** — `VidhiScreens.test.tsx` pins that no vidhi screen's output contains a citation URL, and the conduct pager strips `sourceUrl` before steps enter its FlatList data.
6. **Occurrence hooks.** Festival vidhis use optional `vidhiId` on observance rules and round-trip through `festivalIds`. The personal-tithi entry instead receives a solved `{vidhiId, dateMs}` from Pitru Smaran; no name, relation or entry id enters vidhi routes/state. Its Sarvapitri public door is owned by `PitruPakshaDayChip`, not a fabricated festival rule.
7. **Completion is quiet.** The conduct screen's completion page is a static ॐ seal — the routine celebration animation is deliberately not wired (design.md §62.3), and wiring it is a product decision, not a polish task.
8. **Tests.** `src/data/__tests__/vidhiContent.test.ts` (tsx, wired into `test:data`) gates every rule above; `src/screens/__tests__/VidhiScreens.test.tsx` (Jest) covers the three screens + the source-privacy boundary; `.maestro/vidhi-smoke.yaml` is the e2e journey (catalog tile → detail → conduct — the day-panel pill is date-dependent, so the flow uses the always-available door).
9. **Published registry.** Seven entries are required: the six festive vidhis plus `shraddha-tarpan-vidhi`, a narrow, mantra-free household tila-tarpana remembrance guide. It must never claim to be complete Shraddha or absorb pinda/bhojana/homa and branch-specific formulas. `vidhiContent.test.ts` pins the exact registry, hooks, no-mantra boundary and Gita chapters 15/2.
10. **Phase 2B surfaces (shipped Aug 2026).** Each published vidhi contributes one **search section row** (`searchIndex.buildSectionEntries` appends them after the library rows — a Vidhi is not a `LibraryEntry`, contributes no verse rows, and `SearchScreen.openSection` routes its sourceId to `VidhiDetail`; `searchIndex.test.ts` pins count `library.length + VIDHI_ENTRIES.length` and coverage). The ObservanceDetail **"How to observe"** card renders only for rules whose `vidhiId` resolves. Conduct mode holds **keep-awake** (`expo-keep-awake`, announced for a11y). The Home **DISCOVER card** opens the catalog. **Routine integration:** `RoutineItemKind` gains `'vidhi'` (sourceId = vidhi id, manual-mark completion only — conduct state lives outside the reading-progress contexts) and `AddToRoutineButton` is offered on `VidhiDetail` for vidhis whose festival rule recurs `'monthly'` only.

## 20. Upvas/fasting content (PRD-09 Phase 4) — the उपवास विधि contract

An upvas entry (`mobile/src/panchang/upvasContent/`) is **fasting facts**, not a procedure (that is a vidhi, §19) and not a story (that is a katha): fast type, window, parana rule, strictness/variants, who observes. It is dharmic guidance and carries §11 in full, with these family-specific rules:

1. **Data shape.** `UpvasInfoEntry` (`panchang/types.ts`): `id`, `fastType ('nirjala'|'phalahar'|'one-meal'|'night-vigil')`, bilingual `fastTypeNote*`, `window {kind, textHi/En}`, optional `parana {kind, boundTithi?, textHi/En}`, bilingual `strictness*`, optional bilingual `whoObserves*`, `status ('draft'|'verified')`, review-only `source {referenceUrls (≥2), verificationNote}`. Registry: `UPVAS_CONTENT` / `getUpvasInfo` in `panchang/upvasContent.ts`, invariants asserted by a module-scope IIFE exactly like `kathaContent.ts`.
2. **The registry serves verified entries only.** `getUpvasInfo` returns null for drafts AND unknown ids, so no screen carries status logic and no draft can leak. Entries enter the repo as `status: 'draft'` with a **dated** `verificationNote`; flipping to `'verified'` is a reviewed content change requiring **two concordant independent published sources per entry** (DrikPanchang as the common procedural reference + a Gita Press reference preferred), never authorized by green automation (the Namkaran release-gate convention, §18.5). Discordant sources ⇒ the entry stays draft with the discord recorded. Where verification could not even be attempted (no content egress), the note records the dated failure — the `canonicalEditionStatus` precedent.
3. **No composed religious guidance (§11.3, full force).** Fasting conventions are transcribed, never composed by analogy or averaged into a "reasonable middle". A regional/sampradaya split (smarta vs vaishnava Ekadashi day, post-midnight vs next-morning Janmashtami parana) is either transcribed explicitly in the strictness/parana text or keeps the entry draft.
4. **Parana is hybrid, text-canonical.** The verified rule TEXT always renders. A derived date/time line may accompany it only for the two machine-checkable kinds — `next-day-sunrise-tithi-bound` (parana-day sunrise → `boundTithi` end; the pure `upvasParana.ts`) and `same-day-after-moonrise` (the occurrence day's `PanchangData.moonrise`) — and the derivation returns null on every dishonest branch (bound tithi absent at sunrise, missing/inverted end, null moonrise): null ⇒ text-only, **never an invented time**. `text-only` kinds never compute. Solves go through the shared `panchangDayStore` (never a private cache) and the derived line is never persisted.
5. **Occurrence dates come from the festival engine.** The derivation takes the RESOLVED occurrence from `getNextOccurrence` (kshaya/vriddhi already normalized) and looks at resolved-date + 1 for tithi-bound kinds; it never re-matches tithis itself.
6. **Observance hook.** Rules attach via the optional `upvasId` (`panchang/types.ts`, `festivals.ts` `createRule`) — the identical mechanism as `kathaId`/`vidhiId`; many rules may share one entry. `upvasContent.test.ts` pins the round-trip in both directions and the §6.1 attached-rule sets literally.
7. **One "How to observe" home, four states, never a placeholder.** Verified upvas only → `उपवास विधि` heading + facts panel; vidhi only → the §19 block byte-for-byte; both → facts first, the vidhi card beneath them inside the same section with a `पूजा विधि · ` meta prefix; neither → no section. No "coming soon", no draft/review/status language in customer copy anywhere (§3).
8. **Localization.** hi/en authored and mandatory on every rendered field; gu/kn derive at runtime from the Devanagari via `contentByLang`/`meaningByLang`; English fields stay English in every language. All Hindi fields pass the §11.14 Devanagari well-formedness validator — upvas data is a `.ts` module the JSON sweep cannot see, so `upvasContent.test.ts` runs the canonical validator itself.
9. **Tests.** `src/panchang/__tests__/upvasContent.test.ts` (tsx — shape, hooks, literal content pins, the draft filter proven non-vacuously against a fixture draft, Devanagari gate, no status language) and `upvasParana.test.ts` (tsx — the pure helper incl. the Yogini Ekadashi 2026 kshaya reference and every null branch) run in `test:engine`; `src/screens/__tests__/ObservanceDetailScreen.test.tsx` (Jest) pins the four-state rendering matrix. The vrat-catalog Maestro assertion on a verified detail page is added with the first verified entry, not before.

## 21. Bhog, naivedya and vrat food (PRD-23) — the household-food contract

A bhog entry is **source-reviewed food and offering guidance**, not a recipe, nutrition plan, fast-timing rule (§20), or puja procedure (§19). Section §11 applies in full.

1. **Keep domains separate.** `BhogContentEntry` has distinct `offerings`, `permittedDuringFast`, `abstainedDuringFast`, `doNotOffer`, and `paranaMeal*` fields. Food allowed to an observer is not automatically naivedya; an abhisheka material is not automatically food. Never merge those lists for convenience.
2. **Verified-only accessors.** Rules attach through `bhogId`; vidhis attach through `vidhiIds`. `getBhogContent` and `getBhogForVidhi` return null for drafts and unknown ids. Screens render no draft/status/review placeholder.
3. **Source threshold.** A verified profile requires at least two concordant independent published domains, a dated `verificationNote`, and an explicit `variantNote` where sources or regions differ. General festival pages authorize only the claims they state. Green tests do not authorize a status flip.
4. **No universal rule by aggregation.** Regional and sampradaya forms are named. Discordant claims are either shown together with their scope (the ordinary Ganesha Tulsi rule and festival exception) or omitted (the unproven universal Tulsi-plucking and durva prohibitions recorded in PRD-23).
5. **No health or commerce register.** No detox, cure, weight, nutrition, fear, premium ingredient, shopping affiliate, or required-large-thali claim. Traditional leniency may be transcribed as tradition; it is not medical advice.
6. **Surfaces.** Observance Detail gets an independent final `भोग · नैवेद्य · भोजन` block; it does not disturb §20's four-state How-to-observe block. Vidhi preparation reuses the same guidance and renders additive groceries in a separate ledger from ritual samagri.
7. **Checklist integrity.** Grocery keys are namespaced `bhog:<profile>:<item>` in the existing vidhi/date record. They persist and share, but never count toward samagri completion or duplicate the base samagri list.
8. **Provenance is private.** `source`, URLs, verification notes, variant-review notes, and `status` never reach renderable props or shared customer text.
9. **Tests and device gate.** `bhogContent.test.ts` pins registry shape, independent sources, hooks, draft invisibility, domain separation, copy and Devanagari; Observance/Vidhi Jest suites pin surfaces and checklist math. Typecheck, engine/data/Jest/lint and iOS + Android Maestro runs are required before release.
10. **All-phases coverage invariant (PRD-23).** Every `ObservanceRule` genuinely categorized as `vrat` or `upavas` carries a `bhogId` that resolves through `getBhogContent`; the test pins the eligible count and fails on any uncovered addition. A catalogue label is not enough to infer food guidance: Chandra Darshan and Ishti/Anvadhan are ritual-calendar records, while Shraddha uses a separate ancestor-offering profile rather than a fabricated fast menu.
11. **Long-tail profiles stay narrow.** A shared profile may contain only claims that are safe for every attached rule. Observance-specific timing, recipes or prohibitions remain in separate profiles or are named as regional/sampradaya variants. In particular, weekday fasts have no universal planet-food matrix, and Chaturmasa exclusions must name the lineage that publishes them.
12. **Coverage is not homogenization.** “Available for every vrat” means each eligible detail page has a verified answer, including an explicit family/region selection rule where published practices diverge. It never authorizes copying Navratri fruit-fare into every Devi vrat, Ekadashi food into every Dwadashi, or temple abhisheka materials into household food.

## 22. Vastu disha (PRD-24) — the direction-guidance contract

A vastu entry is **source-reviewed classical convention with its stated reason** — not a dosha diagnosis, a remedy, or an instruction to alter a home. Section §11 applies in full.

1. **One direction vocabulary.** The 8 dik come from `eventMuhurat.ts` (`DishaDirection`, `DISHA_ORDER`, `DISHA_LABELS`) — vastu never declares a second enum or re-labels a dik. The Brahmasthan is the single `isCenter` entry and carries no dik.
2. **Verified-only accessors.** `getVastuRoomEntries`, `getVastuRoomEntry` and `getMandirGuidance` expose `status: 'verified'` entries only; drafts and unknown ids are indistinguishable from absence at every call site, and no screen renders a draft/status/review placeholder.
3. **Source threshold.** A verified entry requires at least two concordant independent published domains, a dated `verificationNote`, and an explicit `variantNote` where sources or traditions split. Term-presence is not concordance — the note must record the claim-level agreement checked.
4. **No universal rule by aggregation.** Where published practice splits (murti counts, Nataraja at home, door padas by house facing), the entry states the variance or the family-tradition authority — it never averages sources into an invented universal.
5. **Stance guard (hard).** No "dosha detected", no fear copy, no remedy or product register, no pseudo-scientific rationale (magnetic-field sleep claims are the recorded example — the reason field carries the classical register only). Every convention that has a stated traditional accommodation carries it (`accommodation*` fields) — the register is understanding, not compliance.
6. **The sensor never gates content.** `useCompassHeading`'s `unavailable`/`unreliable` states must leave every guidance surface fully usable (manual dik chips). The honest degraded state — visible status line, calibration hint, manual override — is part of the feature contract, not an optional polish.
7. **True north stays honest.** Headings are corrected by the selected panchang city's bundled WMM declination (`data/vastu/declination.ts`, regenerated per WMM epoch via `mobile/scripts/generate-declination.md`); an unknown city silently stays magnetic. The UI never claims per-degree precision — the classical unit is the 45° sector.
8. **Provenance is private.** `source`, URLs, verification notes and `status` never reach renderable props or shared customer text.
9. **Store-release gate.** `expo-sensors` is a native dependency: the feature ships only in a store build whose release bumps `app.json` version + `APP_TOUR_VERSION` together and adds the `whatsNew` entry. No OTA publish may carry it to an older runtime.
10. **Tests and device gate.** `compass.test.ts` pins the heading math (wrap smoothing, sector mapping, declination); `vastuContent.test.ts` pins registry shape, bilingual fields, the two-domain threshold, draft invisibility, the copy guard, and full declination coverage of the bundled city list; `VastuDishaScreen.test.tsx` pins the sensor-unavailable manual path. Typecheck, Jest/lint and the Maestro flow are required before release.

## 23. जिज्ञासा intent registration (PRD-25) — the ask contract

The ask engine (`mobile/src/ask/`) is a **deterministic grammar over engines that already ship**. It adds no domain logic and answers nothing it cannot ground. From this section on, a user-facing capability is not finished until it is *askable*.

1. **Register an intent with the feature.** A new capability that answers a household question (a date, a rule, a procedure, a food, a direction, a practice) ships with an `AskIntent` in `mobile/src/ask/intents/index.ts`: `id` (`family.verb`), `triggers` in **hi, en and Hinglish**, `slots` (entity types it needs; `optional` where it can answer without), at least one `examples` question in Devanagari + English, and a `resolve` that calls the feature's **existing** pure engine or verified-only accessor. `blockers` name lexemes that hand the question to a sibling intent.
2. **Entities come from registries, never from hand lists.** The lexicon (`lexicon.ts`) derives every surface form from `deities.ts`, `festivals.ts` (`OBSERVANCE_RULES`), `eventMuhurat.ts` (`EVENT_RULES`, `DISHA_LABELS`/`DISHA_ORDER`), `data/vastu/roomGuidance.ts`, `data/japam`, `data/vidhi`. A new registry that intents need is added to `lexicon.ts` *and* to `lexicon.test.ts`'s coverage sweep. `aliases.ts` is the only hand-maintained vocabulary; every alias must point at an id that exists (test-enforced) and is grown from the unanswered log, one release at a time.
3. **Recurring families are classes.** An observance family (ekadashi, pradosh, purnima, amavasya, chaturthi, shivaratri, navratri) is an `isClass` entry whose members are selected from the registry by id pattern; a bare family word resolves to *the next of any name*, a qualifier picks the instance. A new family joins `OBSERVANCE_CLASSES`; it is never special-cased in an intent.
4. **Answer-or-abstain is hard.** A required slot that is not filled makes the intent **ineligible** — there is no low-confidence answer. `resolve` returns `null` for anything it cannot ground: a `draft` entry, a rule without the needed profile, a missing occurrence. No intent may invent a value, guess a date, or fall back to prose.
5. **Verified-only, like every registry.** Content-backed intents read through the same accessors the screens use (`getUpvasInfo`, `getBhogContent`, `getVastuRoomEntry`, `getKathaContent`, `getVidhiById`) so a draft is indistinguishable from absence. `source`, URLs and `status` never reach an `AskAnswer` — `provenance` is a one-line human statement.
6. **Every answer shows its working.** `AskAnswer.working` names the engine call and its inputs; the card renders it under *गणना देखें*. An answer with an empty trail fails review.
7. **Stance guard.** Predictive and personal framing is **declined** (`DECLINE_LEXEMES` in `resolve.ts`), never answered and never routed to search as if it were content. §11's prohibitions — no luck score, no dosha alarm, no remedy or product — bind every intent's copy.
8. **The specificity floor.** Generic devotional tokens (`GENERIC_TOKENS` in `fold.ts`) may narrow a match but never establish an entity; deity stem-matching applies to words ≥ 5 characters only. A new false tag found in the wild is fixed here, not by a per-intent hack.
9. **Launch cost is zero, by test.** Nothing under `src/ask/` except `types.ts`, `useAsk.ts` and `actions.ts` may be reachable through static value imports from `index.ts`; `launchPath.test.ts` walks the graph and fails the PR. UI surfaces load the engine (and `briefing.ts`) through a dynamic `import()` and compute after interactions.
10. **Corpus gate.** Every new intent adds cases to `src/ask/__tests__/corpus.ts` — its examples plus the phrasings that motivated it, in all three scripts — and at least one negative. `corpus.test.ts` must hold **≥ 85% top-1 and zero wrong answers**; a wrong answer (a different intent or entity than expected) blocks merge regardless of the rate. Grow the corpus from the on-device unanswered log, never by writing questions the resolver already passes.
11. **Verification.** `npm run test:ask` (tsx) + `components/__tests__/AskAnswerCard.test.tsx` (Jest) + the three `.maestro/ask-*-smoke.yaml` flows; typecheck and `npm run lint` at 0 errors; design.md §67 updated in the same PR.
