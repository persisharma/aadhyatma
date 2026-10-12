---
title: Readers
type: subsystem
sources: [mobile/src/screens/DailyBhaktiScreen.tsx, mobile/src/components/ReadingArtwork.tsx, mobile/src/components/ProseReadingCard.tsx, mobile/src/components/ProseParagraph.tsx, mobile/src/components/ReaderHeader.tsx, mobile/src/screens/_useReaderReadAloud.ts, mobile/src/components/readAloud/ReadAloudButton.tsx, mobile/src/data/valmiki-ramayan/index.ts, mobile/src/screens/GitaReaderScreen.tsx, mobile/src/screens/ValmikiRamayanReaderScreen.tsx, mobile/src/screens/ShivaStrotamReaderScreen.tsx, mobile/src/screens/SundarkandReaderScreen.tsx, mobile/src/screens/DurgaStotramReaderScreen.tsx, mobile/src/screens/AshtakamReaderScreen.tsx, mobile/src/data/ashtakam/index.ts, mobile/src/data/texts.ts, mobile/src/screens/_useSafeChapter.ts, mobile/src/components/NextChapterCard.tsx, mobile/src/components/PrevChapterCard.tsx, mobile/src/components/AddToRoutineButton.tsx, mobile/src/screens/__tests__/readerAutoAdvance.test.tsx, mobile/src/screens/__tests__/gitaAutoAdvance.test.tsx, mobile/src/screens/__tests__/AshtakamReaderScreen.test.tsx, scripts/build-valmiki-ramayan.py, RULEBOOK.md]
last_verified_date: 2026-10-12
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

**Prose readers on the katha shell.** `VratKathaReaderScreen` + `KathaSectionPage` is the house
shape for long prose; `PitruParichayReaderScreen` (Sept 2026) reuses it component for component
for the पितृ पक्ष परिचय lessons — `KathaSectionPage` gained `pillHi`/`pillEn` so its pill can read
`परिचय · n/m` instead of `प्रसंग`. Its closing `NextChapterCard` leaves for another screen
(`popTo('PitruPakshaOverview')`), so it is in the read-aloud table but not the auto-advance one.
See [[pitru-shiksha]].

**Prose artwork and delivery (Oct 2026).** The user approved Option 2 on 9 October:
`KathaSectionPage` uses `ProseReadingCard` as a continuous parchment folio with headings above
themed art, a gold divider and unrestricted prose. All sections now use a compact 2:1 banner
up to 360pt wide and 180pt tall. Daan/Pitru teaching-kathas share the folio while retaining
teaching, sources and reader hand-offs. Katha/Pitru introduction dots sit below the prose viewport;
the tab-hosted introduction no longer duplicates its bottom safe-area inset.
`kathaBackgrounds.ts` selects thematic deity art. The shared loader immediately paints 3 KB
bundled paper; prose plates use an existing neutral manuscript icon until remote art decodes.
R2 artwork persists by content hash without expiry or revalidation. See [[integrations/reading-artwork]].
The Oct 10 rollout extracts `ReadingArtwork` for the same painting/divider across seven canonical
verse layouts (21 reader screens), Daily Verse, Daan landing/journey, Pitru education and Vidhi
preparation/first conduct step. Verse paintings move above the text onto neutral paper while their
curated source/verse/kāṇḍa mappings stay intact. `ReadingBanner` replaced the rejected tall
natural-height proposal with a short rectangle. The user also rejected its focal-crop proposal
because paintings are clipped. Newly composed complete 2:1 paintings now replace those crops.
The user specified the Krishna kids-story rendering and separate Reader
illustrations category; the four detailed painting drafts are superseded. New descriptors,
aliases, manifest and R2 prefix distinguish standalone 2:1 banners from reading backgrounds.
`CachedArtwork` shares the existing deferred loader/lifetime cache with the background wrapper.
Only approved published manifest entries activate banner replacements; background selections
are independent. The user accepted all 43 detailed Style 3 illustrations for 44 slots, requested
gadas in the ocean-crossing and Rama–Hanuman scenes, and authorized integration. Both
corrections are selected. The complete gallery, approval and public hash verification are in
`docs/evaluations/reading-visuals-2026-10-11/style3-full-set/`. All files are 960×480 and total
4.45 MiB (61–132 KiB each). All 43 are published to R2 and active in the illustration manifest.
Background sources, manifest and the shared cache are unchanged. Eight focused suites/205
tests and TypeScript pass; production iOS/Android exports include none of the new banners.
These checks do not establish native transport or physical-device performance.
Dedicated illustrations use `contain` throughout the mapped slots. Manifest dimensions reserve
geometry without a size probe or layout callback. The frame never waits for downloads or
changes height on decode. Theerth shares it. Standalone Durga/Daan Katha framing, Katha
endpoints and controlled-cache relaunch are verified. The October 11 isolated-simulator
follow-up also verifies native CDN delivery, download-once/restart/offline reuse after repairing
missing corporate CA trust; see [[integrations/reading-artwork]]. The full reader matrix and
physical performance remain open. Later Vidhi
steps show the divider without repeating art. Semantic guide art follows declared deities and
personal-tithi guides remain neutral. Individual reader paging/scroll logic is still separate.
Daily Bhakti's rotating verse card omits the banner after the October 12 reading-space
correction. Its bundled parchment needs no remote lookup, and `Ornament compact` replaces
the nested 80pt vertical margins with 12pt total. Shared reading-size tokens and full text stay
intact; long verses/meanings still scroll. Source-specific share backgrounds are unchanged.
`ProseParagraph` preserves complete source strings while giving iOS Fabric one extra point of
drawing height after natural layout, avoiding observed Kannada final-line clipping. Measurement
resets on source/font/window changes; Android uses natural layout without the extra callback.
It also protects verse meanings, Gita commentary and Sanskar instruction prose.

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

## Garud Puran source research (not integrated)

As of 2026-10-01, `docs/content/garud-puran/README.md` inventories the separate
research collection under Git-ignored `tmp/garud-puran/`.
`scripts/gather-garud-puran.py` fetches and extracts it without touching the app.
SanskritDocuments/GRETIL share a source lineage, and both omit Achara 62; a
Wikisource candidate is kept separately. Hindi scans, a distinctly labelled
Hindi abridgement, and English OCR/scans are collected but not aligned to verses.
All research records remain ineligible for release. Read the inventory's edition,
OCR, numbering and rights gaps before implementing a reader; these files do not
mean Garud Puran is registered in the library or its bilingual content is verified.

Selection update verified 2026-10-12: the user requested a smaller collection of
important sections and stories. `docs/content/garud-puran/curated-selection.json`
now describes 12 Hindi research extracts (four stories) built by
`scripts/select-garud-puran.py` from the cached abridgement. Heading boundaries,
not contents-list page numbers, select the passages; those numbering systems
disagree. `tmp/garud-puran/garud-puran-selected-sources.zip` is the separate local
handoff. The proposed 3–5-minute bilingual readings are not authored yet. English
Saroddhara links are related-topic pointers, not aligned translations; there is no
measured popularity ranking, and every item remains ineligible for release.

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

### Garud Puran selected readings (2026-10-12)

The user subsequently authorised bilingual preparation, source verification, integration and artwork preview. `mobile/src/data/garud-puran/` now holds twelve editorial selections / 28 prose pages, using a manifest plus per-reading lazy loaders. It is a selected explanation format (RULEBOOK §31, design §81), not the complete acquired corpus or an invented Sanskrit translation. SanskritDocuments/GRETIL form one source family; the Gita Press Hindi abridgement forms the second. Detailed references, hashes and edition notes are in `docs/content/garud-puran/selected-readings-review.json`.

`GarudPuranChapters` groups teachings/stories/traditions using the existing chapter cards with optional art thumbnails. `GarudPuranReader` reuses the Gita navigation/progress/bookmark/share/routine/narration shell with `GarudPuranPage` for prose and source disclosure. Compatibility fields `verses`/`verseIndex` identify prose pages; labels are readings/pages. Search and routine manifests route through the ordinary chaptered-source maps. Nine static bundled 2:1 WebP paintings add about 1.30 MB plus 3 KB of paper texture; no R2 dependency. `scripts/preview-garud-puran.py` regenerates the bilingual HTML content/art gallery. The earlier research collection's release-ineligible status is unchanged.

User review corrected the initial portrait layout against current-main PR #449 (after the older checkout base). Garud uses its landscape paintings at max 360×180pt, approved screen-level paper, a Phosphor leaf divider and separate page dots; continuation pages have no image slot. `ProseParagraph` and Phosphor typings were copied from current main. Current preview evidence is `docs/content/garud-puran/design-review/`; earlier portrait screenshots are historical.

### Garud Puran final Style 3 integration (2026-10-12)

After user approval, nine exact Style 3 WebPs (1,433,814 bytes total) were bundled locally; the approval and hashes are pinned in `docs/content/garud-puran/artwork/manifest.json`. Current-main `ReadingArtwork` and `BackgroundLayer(readingParchment)` provide the common banner/divider/paper treatment. `HomeStackNavigator` registers both routes lazily, the generated route graph warms the reader from the index, and search yields per reading. Prose sharing carries source context without truncating the explanation; saved progress is labelled Reading / Page. See `docs/content/garud-puran/INTEGRATION.md` for final verification. No R2 or OTA publication.
