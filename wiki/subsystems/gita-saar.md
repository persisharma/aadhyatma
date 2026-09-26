---
title: Gita Saar (गीता सार)
type: subsystem
sources: [mobile/src/data/gita-saar/types.ts, mobile/src/data/gita-saar/index.ts, mobile/src/data/gita-saar/themes/index.ts, mobile/src/data/gita-saar/themes/true-prema.ts, mobile/src/components/GitaSaarVersePage.tsx, mobile/src/screens/GitaSaarReaderScreen.tsx, mobile/src/screens/GitaSaarThemesScreen.tsx, mobile/src/navigation/entryRoutes.ts, mobile/src/data/searchIndex.ts, mobile/src/data/texts.ts, mobile/src/data/gita-saar/__tests__/gitaSaarContent.test.ts, mobile/src/screens/__tests__/GitaSaarReaderScreen.test.tsx, mobile/.maestro/granth-smoke.yaml, design.md, RULEBOOK.md]
last_verified_date: 2026-09-26
confidence: high
status: current
---

## Summary

गीता सार is the **themed-readings** section: one question, the Gita's own verses that answer it
in a considered order, each with its sense in plain words. It is a `granth` catalog row
(`gita-saar`, deity `krishna`) that behaves like every chaptered text — a **chapter is a theme**,
a **page is one shloka inside the theme** — and it exists so more readings can keep being added
without touching code. First theme: **सच्चा प्रेम · True Prema** (19 shlokas, six groups: the
root 6.32 → the devotee dear to Him 12.13–20 → the jñānī devotee 7.17 → living in love
10.9–10 → love in action 3.30 / 9.26 / 17.20 → the reply and the promise 9.29 / 18.64–66).
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
- **Single-theme routing.** With one theme in the manifest, `entryRoutes` opens the reader
  directly (the §38 one-row-index rule); the themes index takes over automatically at two. When
  a second theme lands: move `gita-saar` from the "opens its reader directly" list to the "index
  leads" list in `entryRoutes.test.ts`, and add `GitaSaarReaderScreen` to the
  `readerAutoAdvance.test.tsx` table (that table renders chapter 2, so it cannot hold a
  one-theme reader today — the transition logic is already in the screen).
- **The saar is a sense line, not a claim** — no fruit-promise, verdict or prescription; the
  editorial framing lives in the group intros as reading, not as scripture (RULEBOOK §29.3).
- **Pill vocabulary is the Gita's:** `श्लोक · c.v` / `Shloka · c.v` names the shloka as printed,
  never the page number; the meaning label is `सार` / `Essence` (design.md §75).
- **Verified-only, drafts dark.** `getGitaSaarThemes()` filters `status === 'verified'`;
  `getGitaSaarChapter()` refuses to build a draft. A draft note begins `DRAFT — NOT VERIFIED`.

## Gotchas

- **Manifest `verseCount` is hand-typed and test-pinned.** The first cut said 16 (the share card
  merged 12.13–14, 12.18–19 and 18.64–65 into three cards) while the registry has 19 separate
  pages; the loader threw at first open and `searchIndex.test.ts` went red. Count the flattened
  refs, not the cards.
- **Corpus defects travel.** The bundled Gita writes `भक्ित` (misplaced ि) in 7.17, 12.17 and
  12.19; because the page reads the corpus at open time it shows exactly what the Gita reader
  shows. Fix the corpus (`scripts/parse-gita.mjs` + `BhagwadGita/chapters/`), never a theme
  file — the theme never carries Sanskrit.
- **`launchGraph.test.ts` byte budget was already over on this branch** (8,130,261 > 7,300,000
  before this section; +39 KB after — the two screens and the page, imported eagerly by the Home
  stack like every reader). Not raised here per the test's own rule; the corpus stays lazy.
- **`require()` in `index.ts` lints as a warning** (`no-require-imports`) — the same warning
  `pitru/index.ts` and `daan/index.ts` carry; it is the sanctioned lazy-load shape, not a
  defect.
