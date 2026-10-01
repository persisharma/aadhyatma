---
title: Gita Saar (गीता सार)
type: subsystem
sources: [mobile/src/data/gita-saar/types.ts, mobile/src/data/gita-saar/index.ts, mobile/src/data/gita-saar/themes/index.ts, mobile/src/data/gita-saar/themes/true-prema.ts, mobile/src/components/GitaSaarVersePage.tsx, mobile/src/screens/GitaSaarReaderScreen.tsx, mobile/src/screens/GitaSaarThemesScreen.tsx, mobile/src/navigation/entryRoutes.ts, mobile/src/data/searchIndex.ts, mobile/src/data/texts.ts, mobile/src/data/gita-saar/__tests__/gitaSaarContent.test.ts, mobile/src/screens/__tests__/GitaSaarReaderScreen.test.tsx, mobile/.maestro/granth-smoke.yaml, design.md, RULEBOOK.md]
last_verified_date: 2026-09-27
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
Design: design.md §75; contract: RULEBOOK §29.

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
- **Screens** — `GitaSaarThemesScreen` (route `GitaSaarChapters`; the §15 chapters index with
  `विषय N` cards + a one-line lede) and `GitaSaarReaderScreen` (route `GitaSaarReader
  {chapter, initialIndex?}`; the Gita reader shell verbatim, with next/prev theme transition
  cards). `GitaSaarVersePage` renders pill · group eyebrow (+ intro on a group's first page) ·
  corpus verse · `सार` label + theme line + saar body · the **hand-off pill** into
  `GitaReader {chapter, initialIndex: verse − 1}` · the closing line on the last page.
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
- **Adding a theme touches three files:** `themes/<id>.ts`, the array in `themes/index.ts`, the
  manifest row in `index.ts` (id · titles · verse count — the test pins the mirror). Routing,
  search, bookmarks, resume, the routine picker and the index all read the manifest. **Append
  only** — the registry position is the chapter number and therefore the key of every saved
  bookmark/progress row.
- **The themes index leads.** With sixteen themes the catalog row opens `GitaSaarChapters`
  (pinned in `entryRoutes.test.ts`) and the reader crosses themes through the transition cards
  (a row in `readerAutoAdvance.test.tsx`). If the manifest ever dropped to one theme, the §38
  one-row-index rule would open the reader directly again with no code change.
- **The saar is a sense line, not a claim** — no fruit-promise, verdict or prescription; the
  editorial framing lives in the group intros as reading, not as scripture (RULEBOOK §29.3).
- **Pill vocabulary is the Gita's:** `श्लोक · c.v` / `Shloka · c.v` names the shloka as printed,
  never the page number; the meaning label is `सार` / `Essence` (design.md §75).
- **Verified-only, drafts dark.** `getGitaSaarThemes()` filters `status === 'verified'`;
  `getGitaSaarChapter()` refuses to build a draft. A draft note begins `DRAFT — NOT VERIFIED`.

## Gotchas

- **Manifest `verseCount` is hand-typed and test-pinned.** It has been wrong twice: 16 for
  true-prema (the share card merged three pairs; the registry has 19 pages) and 11 for daivi
  (three lists of 3 + 4 + 3 = 10). Both times the loader threw at first open and
  `searchIndex.test.ts` went red before anything shipped. Count the flattened refs.
- **Corpus defects travel.** The page reads the corpus at open time, so it shows exactly what the
  Gita reader shows, defects included. The `भक्ित` misspelling in 7.17, 12.17, 12.19 and 13.11 was
  repaired in the corpus by the dotted-circle fix on main (#399, 2026-09-27). Fix any future defect
  in the corpus (`scripts/parse-gita.mjs` + `BhagwadGita/chapters/`), never in a theme file; a
  theme never carries Sanskrit.
- **Launch-graph cost.** The two screens and the page are imported eagerly by the Home stack like
  every reader (about 39 KB); theme files and the corpus stay behind `require()` thunks. After main
  deferred the temple corpus (2026-09-25) `launchGraph.test.ts` passes with Gita Saar merged in.
- **`require()` in `index.ts` lints as a warning** (`no-require-imports`) — the same warning
  `pitru/index.ts` and `daan/index.ts` carry; it is the sanctioned lazy-load shape, not a
  defect.
