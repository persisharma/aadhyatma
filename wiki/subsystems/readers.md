---
title: Readers
type: subsystem
sources: [mobile/src/components/ReaderHeader.tsx, mobile/src/screens/_useReaderReadAloud.ts, mobile/src/components/readAloud/ReadAloudButton.tsx, mobile/src/data/valmiki-ramayan/index.ts, mobile/src/screens/GitaReaderScreen.tsx, mobile/src/screens/ValmikiRamayanReaderScreen.tsx, mobile/src/screens/ShivaStrotamReaderScreen.tsx, mobile/src/screens/SundarkandReaderScreen.tsx, mobile/src/screens/DurgaStotramReaderScreen.tsx, mobile/src/screens/AshtakamReaderScreen.tsx, mobile/src/data/ashtakam/index.ts, mobile/src/data/texts.ts, mobile/src/screens/_useSafeChapter.ts, mobile/src/components/NextChapterCard.tsx, mobile/src/components/PrevChapterCard.tsx, mobile/src/components/AddToRoutineButton.tsx, mobile/src/screens/__tests__/readerAutoAdvance.test.tsx, mobile/src/screens/__tests__/gitaAutoAdvance.test.tsx, mobile/src/screens/__tests__/AshtakamReaderScreen.test.tsx, scripts/build-valmiki-ramayan.py, RULEBOOK.md]
last_verified_date: 2026-09-04
confidence: high
status: current
---

## Summary

Each devotional text is read through its own `<Pascal>ReaderScreen.tsx` — a horizontally-paged
`FlatList` (`pagingEnabled`, one verse page per screen width) with a language-aware top bar,
bookmark/share buttons, and pager dots. The **top bar is shared** — `ReaderHeader.tsx`, since
July 2026 — but the rest of the shell is not: every reader is still a near-identical copy of the
same paging pattern, so that behavior is kept consistent by convention + tests, not by a base
component. Content is bundled JSON loaded per chapter via `get<Section>Chapter()`. Valmiki
Ramayan is the large-corpus case: its 23,289 verified verse records stay split across seven
kāṇḍa JSON modules, and the accessor requires/caches only the kāṇḍa the reader opens. The Home,
Daily Bhakti, and search paths use the 28-row `daily-selection.json` projection so they do not
parse the complete epic during startup; the platform bundle still carries every kāṇḍa offline.

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
- **Read aloud** (every reader since 2026-09-04; July 2026 v1 was Gita + Chalisa only): the
  screen calls `useReaderReadAloud({sourceId, data, offset, verseCount, currentIndex, listRef})` —
  every argument already exists in every reader — **before** any null-chapter early return, and
  renders `ReadAloudButton` inside `styles.readAloudSlot` on the toggle row (absolute, right 16),
  not in the header. The hook builds the controller session (`chunksFor` returns `null` for a
  transition sentinel, so speech stops at a chapter boundary rather than crossing it), owns the
  swipe-vs-auto-advance latch, and stops on unmount. Japam is the only text surface without it.
  See [[audio]].

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

**Who has it:** Gita (18), Sundarkand (16), Shiva Strotam (4), Durga (3), Ganesh (3),
Saraswati (3), Vishnu Sahasranama (4) — the last four added 2026-06-09 — and, as of 2026-07-31,
Valmiki Ramayan (7 kāṇḍas). Single-chapter texts (Hanuman Ashtak, Krishna Stotram, Ram Stuti,
Ramcharitmanas — 1 chapter file each today) render verses only; they need no transition because
there is no next subsection yet.

**Multi-instance readers** (`ChalisaReaderScreen`, `AartiReaderScreen`, `AshtakamReaderScreen`,
`SanskarReaderScreen`) dispatch on a `route.params` discriminator through a registry — they do
not import one section's data at the top of the file (RULEBOOK §3). For Ashtakam, the total
registry in `data/ashtakam/index.ts` is the source of truth; the matching `data/texts.ts` row
makes an active entry discoverable through category, deity, search, routine, progress, and
purpose surfaces. Rudrashtakam is the current reference addition: 8 hymn verses plus its
phalashruti, represented as 9 reader pages without creating a new deity or category.

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
- **`ValmikiRamayanVersePage.tsx` is a one-line re-export of `SundarkandVersePage`** — its verse
  type is a superset of the `lines`/`linesEn` archetype. RULEBOOK §2 row 4 requires the explicit
  re-export file rather than the reader importing another section's page, so the coupling is
  visible and a future shape change breaks at the re-export instead of on first paint (the PR #31
  Balkand crash). The reader also carries `stanza = kāṇḍa`, which is what `getReaderBackground`
  keys the per-kāṇḍa sketch off.
- **Latent gap in single-chapter readers** — Ramcharitmanas loads only `chapter-01` today
  (conceptually 7 kāṇḍas); the moment a 2nd chapter file is added it needs the auto-advance
  pattern or it will dead-end. The test auto-covers it once its manifest length exceeds 1.
- **`navigation.replace`, not `push`** — chapters swap in place; the back button returns to the
  chapter list, not the previous chapter.
- **A reader missing read-aloud is invisible at runtime.** `useReadAloud()` is a lenient hook whose
  default renders no control, which is what keeps every reader's own smoke suite green without a
  provider. So "the pill isn't showing" is indistinguishable from "the provider isn't wired" or
  "this reader was scaffolded without the hook" (exactly how 19 readers sat without TTS for two
  months after v1). `src/screens/__tests__/readerReadAloud.test.tsx` tables all 21 readers and
  presses the pill on each; a new reader must be added to it (same rule as
  `readerAutoAdvance.test.tsx`). See [[audio]] for the platform traps.
