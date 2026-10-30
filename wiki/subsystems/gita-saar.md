---
title: Gita Saar (गीता सार)
type: subsystem
sources: [mobile/src/data/gita-saar/types.ts, mobile/src/data/gita-saar/index.ts, mobile/src/data/gita-saar/themes/index.ts, mobile/src/data/gita-saar/themes/true-prema.ts, mobile/src/data/gita-saar/experience.ts, mobile/src/data/gita-saar/stories.ts, mobile/src/data/gita-saar/learningStore.ts, mobile/src/navigation/lazyScreen.tsx, mobile/src/navigation/__tests__/screenPrefetch.test.tsx, mobile/src/components/GitaSaarStory.tsx, mobile/src/components/GitaSaarVersePage.tsx, mobile/src/screens/GitaSaarReaderScreen.tsx, mobile/src/screens/GitaSaarThemesScreen.tsx, mobile/src/navigation/entryRoutes.ts, mobile/src/data/searchIndex.ts, mobile/src/data/texts.ts, mobile/src/data/gita-saar/__tests__/gitaSaarContent.test.ts, mobile/src/screens/__tests__/GitaSaarReaderScreen.test.tsx, mobile/.maestro/granth-smoke.yaml, design.md, RULEBOOK.md]
last_verified_date: 2026-10-28
confidence: high
status: current
---

## Summary

गीता सार is the **themed-readings** section: one question, the Gita's own verses that answer it
in a considered order, each with its sense in plain words. It is a `granth` catalog row
(`gita-saar`, deity `krishna`) that behaves like every chaptered text — a **chapter is a theme**,
a **page is one shloka inside the theme** — and it exists so more readings can keep being added
without touching code. **Sixteen themes ship (170 pages)**, in the order of
`docs/roadmap/gita-saar-themes.md`: सच्चा प्रेम · भय और चिंता · शोक · क्रोध · कर्म · गुण · मन · संशय ·
श्रद्धा और शरणागति · स्थितप्रज्ञ · कामना और संतोष · सफलता-असफलता · मृत्यु और आत्मा · क्या मैं अकेला हूँ ·
दैवी सम्पदा · ध्यान और दिनचर्या. Moods name the state → what the text calls it → what steadies it →
the reply; topics put the question → the answer in order → one line to carry.
Design: design.md §77; contract: RULEBOOK §30.

## Shape

- **Data** — `mobile/src/data/gita-saar/`: `types.ts` (`GitaSaarTheme` → `groups[]` →
  `verses[] { ref: {chapter, verse}, themeHi/En, saarHi/En }`, `status`, review-only `source`),
  `themes/<id>.ts` + `themes/index.ts` (the registry in reading order), `index.ts` (eager
  hand-mirrored `gitaSaarChaptersManifest`; lazy `getGitaSaarChapter(n)` behind a `require()`
  thunk; `resolveGitaSaarRef`; verified-only `getGitaSaarThemes()`).
- **The page shape the loader builds** — `GitaSaarVerse { id: 'saar-<theme>-<c>-<v>', chapter
  (= theme number), number (= page), gitaChapter, gitaVerse, sanskrit, transliteration (both
  from the corpus), meaningHi/En (= the saar), themeHi/En, groupIndex, groupTitle*, groupIntro*,
  isGroupStart }`. Progress and bookmarks key on `gita-saar:<theme>:<pageIndex>`.
- **Illustrated lessons** — `experience.ts` keeps bilingual questions, categories, takeaways and
  reflection prompts. `stories.ts` gives each stable theme a distinct sourced story or scriptural
  example: three bilingual beats, one captioned painting, source citations, a separate Gita bridge and
  one everyday application. The sixteen original Hindi/English adaptations are editorial prose;
  they do not alter the corpus, Saar, theme order or the 170 page IDs. Research and scene review:
  `docs/evaluations/gita-saar-stories-2026-10-26/research/README.md`.
- **Screens** — `GitaSaarThemesScreen` (route `GitaSaarChapters`) is a question-led hub with
  the source-specific Krishna artwork, a direct Gita 2.47 entry (`chapter: 5, initialIndex: 0`),
  resume, optional category filters, all sixteen individually illustrated theme cards and My learning on the same screen.
  `GitaSaarReaderScreen` retains native measured horizontal paging, theme transitions,
  progress, bookmarks, routine, share, narration and auto-scroll. Direct previous/next controls
  also cross theme boundaries. `GitaSaarVersePage` is one vertically scrolling lesson. Its first page opens with that theme's
  painting and title, then the complete existing Saar, three visible story beats, Gita connection,
  everyday example and source citations. Gita connection references and Gita story-source citations open exact bundled verses in `GitaReader`. Valmiki Ramayan source rows resolve their cited kāṇḍa and sarga to the first matching verse in `ValmikiRamayanReader`. Sources without a bundled reader appear as plain citations, with no external link or browser action; their URLs remain in source metadata for editorial verification. Other verses offer a direct illustrated door back to this
  story, then the usual takeaway, optional reflection and one save action. Group context, optional
  original verse/corpus meaning and full-Gita handoff remain available. Opening the
  original scripture disclosure scrolls its newly laid out panel into view so a reader
  sees the text immediately, even deep in a long story. Disclosure and writing are
  optional, never required stages. The full-Gita handoff
  opens `GitaReader {chapter: gitaChapter, initialIndex: gitaVerse - 1}`.
- **Private reflections** — `learningStore.ts`, AsyncStorage key
  `@vedansh/gita-saar-reflections-v1`, stores version 1 rows keyed by theme chapter + page index,
  with text (max 1000 characters) and timestamp. Lazy hydration and serialized durable writes
  prevent concurrent saves from dropping notes; failed reads do not overwrite existing storage.
  Save combines the reflection and the existing bookmark action. My learning combines old
  bookmarks with notes, and retains notes when the bookmark is removed. Notes are not included
  in share payloads. Editing stops narration and auto-scroll; Done and save dismiss the keyboard.
- **Artwork** — `readerIllustrationAsset('gita-saar-story-<id>')` selects a distinct 960×480
  approved WebP per theme. All sixteen immutable CDN objects were byte-verified; images use
  `contain` geometry and are never required into the app bundle. The earlier garden prototype
  object remains published, but Bhagiratha's scene now leads karma.
- **Wiring** — `texts.ts` row (sub/verseCount from the manifest); `entryRoutes.ts` rows in
  `stotramChaptersRouteById` / `chapterCountBySourceId` / `stotramReaderRouteBySourceId`;
  `searchIndex.ts` `pushChapteredGitaSaar` (corpus lines + `theme — saar` as the meaning);
  `backgrounds.ts` (`gita-saar` → the Gita plate); `routine/chapters.ts` REGISTRY (the routine
  picker offers themes as chapters); `discoveryMeta.ts` (knowledge · devotion · peace).

## Working Rules

- **Scripture is pointed at, never re-typed.** Theme files carry refs and saar only. The loader
  attaches the corpus Sanskrit/IAST at open time, so a page can never drift from the Gita
  reader's text; a bad ref throws (loader) and fails `gitaSaarContent.test.ts`, which opens the
  corpus JSON for every ref. The test also rejects any danda in an authored line.
- **Adding a theme touches five data files plus an approved painting:** `themes/<id>.ts`, the array in `themes/index.ts`, the
  manifest row in `index.ts` (id · titles · verse count — the test pins the mirror), its editorial frame in `experience.ts`, and a researched lesson in `stories.ts`. Routing,
  search, bookmarks, resume, the routine picker and the index all read the manifest. **Append
  only** — the registry position is the chapter number and therefore the key of every saved
  bookmark/progress row.
- **The themes index leads.** With sixteen themes the catalog row opens `GitaSaarChapters`
  (pinned in `entryRoutes.test.ts`) and the reader crosses themes through the transition cards
  (a row in `readerAutoAdvance.test.tsx`). If the manifest ever dropped to one theme, the §38
  one-row-index rule would open the reader directly again with no code change.
- **The saar is a sense line, not a claim** — no fruit-promise, verdict or prescription; the
  editorial framing lives in the group intros as reading, not as scripture (RULEBOOK §30.3).
- **Pill vocabulary is the Gita's:** `श्लोक · c.v` / `Shloka · c.v` names the shloka as printed,
  never the page number; the meaning label is `सार` / `Essence` (design.md §77).
- **Verified-only, drafts dark.** `getGitaSaarThemes()` filters `status === 'verified'`;
  `getGitaSaarChapter()` refuses to build a draft. A draft note begins `DRAFT — NOT VERIFIED`.

## Gotchas

- **The share card must carry the theme line.** It once shared verse + saar only (reported as
  "not capturing full content"); it now passes `meaningTitleHi/En = themeHi/En` and appends the
  closing line on a theme's last page (design.md §77, [[share]]).
- **Manifest `verseCount` is hand-typed and test-pinned.** It has been wrong twice: 16 for
  true-prema (the share card merged three pairs; the registry has 19 pages) and 11 for daivi
  (three lists of 3 + 4 + 3 = 10). Both times the loader threw at first open and
  `searchIndex.test.ts` went red before anything shipped. Count the flattened refs.
- **Corpus defects travel.** The page reads the corpus at open time, so it shows exactly what the
  Gita reader shows, defects included. The `भक्ित` misspelling in 7.17, 12.17, 12.19 and 13.11 was
  repaired in the corpus by the dotted-circle fix on main (#399, 2026-09-27). Fix any future defect
  in the corpus (`scripts/parse-gita.mjs` + `BhagwadGita/chapters/`), never in a theme file; a
  theme never carries Sanskrit.
- **Launch graph and cold routes.** Screens use the registered `lazyScreen` boundary, while
  theme files and corpus stay behind `require()` thunks. The Android native walkthrough
  exposed an SVG-path re-parenting crash during cold navigation with the old Suspense
  hide/reveal path. `lazyScreen.tsx` now resolves cold modules through a cancellable effect,
  keeps warm modules synchronous and preserves mounted screen state across updates.
  `screenPrefetch.test.tsx` covers warm/cold loads, failures, retries and state preservation;
  the native Gita Saar journey exercises the route boundary with real SVG icons.
- **`require()` in `index.ts` lints as a warning** (`no-require-imports`) — the same warning
  `pitru/index.ts` and `daan/index.ts` carry; it is the sanctioned lazy-load shape, not a
  defect.
