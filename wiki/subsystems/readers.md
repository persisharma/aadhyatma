---
title: Readers
type: subsystem
sources: [mobile/src/components/ReaderHeader.tsx, mobile/src/screens/_useReaderReadAloud.ts, mobile/src/components/readAloud/ReadAloudButton.tsx, mobile/src/screens/GitaReaderScreen.tsx, mobile/src/screens/ShivaStrotamReaderScreen.tsx, mobile/src/screens/SundarkandReaderScreen.tsx, mobile/src/screens/DurgaStotramReaderScreen.tsx, mobile/src/screens/_useSafeChapter.ts, mobile/src/components/NextChapterCard.tsx, mobile/src/components/PrevChapterCard.tsx, mobile/src/components/AddToRoutineButton.tsx, mobile/src/screens/__tests__/readerAutoAdvance.test.tsx, mobile/src/screens/__tests__/gitaAutoAdvance.test.tsx, RULEBOOK.md]
last_verified_date: 2026-07-31
confidence: high
status: current
---

## Summary

Each devotional text is read through its own `<Pascal>ReaderScreen.tsx` — a horizontally-paged
`FlatList` (`pagingEnabled`, one verse page per screen width) with a language-aware top bar,
bookmark/share buttons, and pager dots. The **top bar is shared** — `ReaderHeader.tsx`, since
July 2026 — but the rest of the shell is not: every reader is still a near-identical copy of the
same paging pattern, so that behavior is kept consistent by convention + tests, not by a base
component. Content is bundled JSON loaded per chapter via `get<Section>Chapter()`.

## Details

**Per-screen anatomy** (canonical: `GitaReaderScreen.tsx`, `ShivaStrotamReaderScreen.tsx`):
- `useSafeChapter(route.params.chapter, getXChapter, navigation, 'XChapters')` resolves the
  chapter; on an out-of-range chapter it returns `null` and redirects to the chapter list
  (`_useSafeChapter.ts`) instead of crashing in the data accessor.
- A horizontal `FlatList` renders one `<Section>VersePage` per verse. Several stotram readers
  reuse `ShivaStrotamVersePage` (Durga/Ganesh/Saraswati/Vishnu) — allowed only because their
  verse shapes match (see RULEBOOK §3 *Type safety on verse pages*; PR #31 Balkand crash origin).
- Current page tracked via `onViewableItemsChanged` (60% threshold) + `handleScroll`.
- The toggle row hosts `LanguageToggle` **and** (since #87) an `AddToRoutineButton` — every
  reader has one; chaptered readers pass the current `chapter` (see [[routine]]).
- The top bar is `ReaderHeader` (`variant="reader"`; chapters/index screens pass
  `variant="index"` for the larger 22/20 title). Screens pass `title` / `onBack` / `right` and
  never geometry — RULEBOOK §3 makes a hand-rolled `topBar` block a hard reject.
- **Read aloud** (July 2026, `GitaReaderScreen` + `ChalisaReaderScreen` only): the screen calls
  `useReaderReadAloud({sourceId, data, offset, verseCount, currentIndex, listRef})` — every
  argument already exists in every reader — and renders `ReadAloudButton` in the `right` slot after
  the page counter. The hook builds the controller session (`chunksFor` returns `null` for a
  transition sentinel, so speech stops at a chapter boundary rather than crossing it), owns the
  swipe-vs-auto-advance latch, and stops on unmount. See [[audio]].

**Chapter auto-advance (the cross-subsection navigation contract).** A reader whose text has
> 1 subsection must let the user swipe across chapter/kāṇḍa boundaries. The mechanism:
1. Build the `FlatList` `data` as `[prevCard?] + chapter.verses + [nextCard?]` — a
   `PrevChapterCard` (`__type: 'prev-transition'`) prepended unless first chapter, a
   `NextChapterCard` (`__type: 'transition'`) appended unless last chapter. Titles come from
   `<section>ChaptersManifest`.
2. `onViewableItemsChanged` detects a transition item and, guarded by `hasNavigatedRef`, fires
   `navigation.replace(<thisRoute>, { chapter })` after a 400ms haptic-tapped delay. The prev
   case lands on the previous chapter's last verse via `initialIndex: prevVerseCount - 1`.
3. The prepended prev card shifts indices by one → an `offset = isFirstChapter ? 0 : 1` is
   carried through `initialScrollIndex`, `handleScroll`, and the viewable-index math.

**Who has it:** Gita (18), Sundarkand (16), Shiva Strotam (4), and — as of 2026-06-09 — Durga
(3), Ganesh (3), Saraswati (3), Vishnu Sahasranama (4). Single-chapter texts (Hanuman Ashtak,
Krishna Stotram, Ram Stuti, Ramcharitmanas — 1 chapter file each today) render verses only;
they need no transition because there is no next subsection yet.

**Multi-instance readers** (`ChalisaReaderScreen`, `AartiReaderScreen`, `SanskarReaderScreen`)
dispatch on a `route.params` discriminator through a registry — they do not import one section's
data at the top of the file (RULEBOOK §3).

**Tests:** `readerAutoAdvance.test.tsx` enforces the auto-advance contract for every
multi-chapter reader (transition injected at chapter 1's tail, prev-transition at chapter 2's
head, no trailing transition on the final chapter, and `navigation.replace` fires on the
transition page). `gitaAutoAdvance.test.tsx` covers the Gita swipe path Maestro can't drive
(velocity-scrolled, ~47 swipes). Each reader also has a chapter-1 smoke test (RULEBOOK §3
*Reader smoke test*).

## Dependencies

- [[overview]] — app stack and module map.
- `RULEBOOK.md` §3 — the reader design contract (shell, type safety, smoke test, **auto-advance**).
- `design.md` — reader shell visuals (paged FlatList, ornament divider, pager dots).
- Shared components: `ReaderHeader.tsx`, `NextChapterCard.tsx`, `PrevChapterCard.tsx`,
  `JumpToStartButton.tsx`, `LanguageToggle.tsx`, `BookmarkButton.tsx`, `ShareButton.tsx`.

## Gotchas

- **The reader *body* still has no shared shell** — each reader's paging logic is copy-pasted, so
  a new feature (like auto-advance) must be hand-applied to every multi-chapter reader. This is
  exactly how the 4 stotram readers drifted: they were scaffolded without the transition logic and
  silently dead-ended at the last page of each chapter. `readerAutoAdvance.test.tsx` is the guard;
  add new chaptered readers to its table. The **top bar** is no longer in this category — it was
  extracted to `ReaderHeader.tsx` in July 2026 after the ~32 copies had drifted into two gutters,
  three bottom paddings, two back-button sizes and an off-token title size.
- **`ReaderHeader`'s back label is deliberately English and un-localized** (`"Back"`). The Maestro
  flows tap that string literally (`deity-browse-smoke`, `vrat-catalog-smoke`) and the default
  reading language is `hi`, so localizing it breaks e2e. Override it only to name a destination
  ("Back to chapters").
- **`onViewableItemsChanged` is `useRef(fn).current`** — it captures `offset`/`navigation` from
  the first render. Safe here because `chapter` (hence `offset`) is fixed per screen instance.
- **Latent gap in single-chapter readers** — Ramcharitmanas loads only `chapter-01` today
  (conceptually 7 kāṇḍas); the moment a 2nd chapter file is added it needs the auto-advance
  pattern or it will dead-end. The test auto-covers it once its manifest length exceeds 1.
- **`navigation.replace`, not `push`** — chapters swap in place; the back button returns to the
  chapter list, not the previous chapter.
- **Read-aloud is deliberately absent from 18 readers, and that is invisible.** `useReadAloud()` is
  a lenient hook whose default renders no control, which is what keeps every untouched reader suite
  green without a provider. So "the button isn't showing" is indistinguishable from "the provider
  isn't wired" — `src/screens/__tests__/readerReadAloud.test.tsx` exists precisely to catch the
  latter, and a reader gaining read-aloud must be added to its table (same rule as
  `readerAutoAdvance.test.tsx`). See [[audio]] for the platform traps.
