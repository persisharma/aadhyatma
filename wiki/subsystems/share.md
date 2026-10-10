---
title: Share Cards (verse, prose, series)
type: subsystem
sources: [mobile/src/utils/shareVerse.tsx, mobile/src/utils/shareContent.ts, mobile/src/utils/kidsStoryShare.ts, mobile/src/components/KidsStoryArt.tsx, mobile/src/utils/shareCardPages.ts, mobile/src/utils/shareCardType.ts, mobile/src/utils/multiShare.ts, mobile/src/utils/shareStoryLayout.ts, mobile/src/components/ShareCard.tsx, mobile/src/components/ProseShareCard.tsx, mobile/src/components/ShareTargetSheet.tsx, mobile/src/components/SharePagesStrip.tsx, mobile/src/components/SharePagePreview.tsx, mobile/src/components/ShareStoryFrame.tsx, mobile/src/components/ShareBrandFooter.tsx, mobile/src/data/shareLinks.ts, mobile/src/data/shareHashtags.ts, mobile/app.json, mobile/jest.setup.js, design.md, RULEBOOK.md, docs/roadmap/prds/45-universal-share-carousel.md]
last_verified_date: 2026-10-09
confidence: high
status: current
---

## Summary

One provider (`ShareProvider` / `useShare()` in `utils/shareVerse.tsx`, mounted once in
`App.tsx`) turns any content unit into a branded 540×675 dp parchment card, captures it
off-screen with `react-native-view-shot` at 1080×1350 (or a 1080×1920 story frame), and
hands it to WhatsApp / the OS sheet / Instagram. `share(content, lang)` takes a
`ShareableContent`: a `ShareableVerse` (the original verse card, design.md §39) or a
`ShareableProse` (PRD-45, §39.4) — long prose that a pure paginator cuts into a **series**
of cards. A series gets a pages strip, a preview, and two all-pages rows that hand every
page to one OS sheet (WhatsApp album; iOS "Save N Images"; Instagram → Select multiple).

## Details

- **Where the mapping lives.** Each surface's data → share shape is a pure builder in
  `utils/shareContent.ts` (`vratKathaShareable`, `theerthShareable`, `daanKathaShareable`,
  `daanPrincipleShareable`, `vidhiMantraShareable`, `observanceShareable`,
  `askAnswerShareable`), tested in `shareContent.test.ts`. Screens only call
  `share(builder(data), lang)` from a `ShareButton`.
- **Share placement.** Share icons sit at the right side of their content card/header. Kids Stories pins it right of the centred language toggle; Vrat Katha places it after the header counter and Daan Katha in the header right slot, keeping read-aloud in its own language-row slot.
- **Scopes.** A prose share carries ≥1 scope (katha: *this part* / *whole katha*; temple:
  *significance & story* / *full reading*). The sheet's segment switches scope and
  re-paginates; the first scope is the default.
- **Paginator** (`utils/shareCardPages.ts`): sentence-greedy packing into a fixed
  459 dp body box, words only for a sentence longer than a page, heading keep-with-next,
  3-line widow rule, one slack line per page. Chars-per-line comes from per-language glyph
  advances **fitted to the real TTFs** (see Gotchas). `MAX_SHARE_PAGES = 10`.
- **Capture.** Always one off-screen mount; a series is captured page by page (never N
  bitmaps at once). Single-page rows reuse the verse path's `deliver()` exactly.
- **Multi-file share** (`utils/multiShare.ts`): `react-native-share` `open({ urls })`,
  probed via `TurboModuleRegistry.get('RNShare')` then lazily required.

- **Illustrated kids stories** (`kidsStoryShareable`, exported by `shareContent.ts`): `layout: 'picture'` — every page on the 540×960 (9:16) picture card, captured at 1080×1920 for every target (`isPictureCapture` in the provider; no `ShareStoryFrame`). One card per scene: complete art at the body's full width when the caption allows (never under 400 dp), then the reader's caption box with title, narration and dialogue as a `quote` block in its tinted box. Closing card: cover art (≥260 dp), takeaway, source note and a `link` block printing `vedansh.app/get` (the share message carries the tappable URL). `paginateProse({ layout, firstPageReservedDp })` budgets the taller body, the caption-box padding and the 452 dp text column. Every published caption fits its scene card in all four languages. The sheet hides the 4:5 Instagram-post row for picture content. Numbered parts pack whole scene groups using the maximum count across all four locales, never silently truncating the story at ten cards.
- **Illustrated capture readiness.** Only illustrated exports load the cache module, resolve the existing hashed R2 request, then wait for native `Image.onLoad` on a fresh capture mount. Fetch/decode timeout or errors return failure: a series aborts before hand-off and a single scene refuses the text-only fallback. Preview may show loading UI, but exported files never deliberately contain a placeholder. The same provider, paginator, branded card, preview and native multi-share adapter remain in use.

## Gotchas

- **Store build vs OTA.** Everything is OTA except the all-pages rows, which need the
  `react-native-share` native module and the `NSPhotoLibraryAddUsageDescription` plist key.
  On an older binary the rows render **disabled** ("Needs the latest app update") — never
  import `react-native-share` at module top level: its codegen spec calls
  `TurboModuleRegistry.getEnforcing` and throws on a binary without it.
- **Why not `expo-media-library`.** Its Android 13+ save path needs `READ_MEDIA_IMAGES`,
  which Google Play has required a core-use justification for since May 2025.
- **Instagram carousels.** No share intent creates one; whether Instagram's share target
  accepts several images is unverified, so the carousel row pauses on hand-off steps
  (save images → Instagram → + → Select multiple) before opening the OS sheet.
- **Paginator constants are measured.** Advances hi 0.41 · gu 0.43 · kn 0.56 · en 0.44 =
  the minimum that never under-counted any of 500 katha paragraphs per language laid out
  in Chromium at 484 dp with the app's TTFs, + 0.02. The verse meaning ladder's
  `AVG_ADVANCE` (0.52/0.46) over-counts prose by ~38 %. If a device clips a page, widen
  the advance — never add `adjustsFontSizeToFit` (design.md §39's 7 pt failure).
- **Verse budget counts logical lines, not wrapped ones.** `fitMeaningType` charges 42 dp per
  `lines[]` entry, but at 24 pt over 468 dp most Gita lines (40–63 chars) wrap to two. Measured in
  Chromium with the app TTFs (Oct 2026): 164 of 340 Gita Saar cards wrap, the worst lands at
  677/675 dp (2 dp into bottom padding — invisible). Any verse share whose meaning uses its full
  cap *and* wraps its verse would clip the footer; count wrapped verse lines before widening.
- **Optional title line.** `meaningTitleHi/En` sets a line above the meaning at the fitted size
  (Gita Saar's theme line); it spends the same budget via `fitMeaningType({ title })`.
- **No-share surfaces.** Pitru Smaran, the पितृ पक्ष परिचय layer and the personal-tithi
  Vidhi carry no share button — design.md §63/§74 lock it.
- **Tests that mount a share surface** must wrap it in `ShareProvider` (`useShare()`
  throws outside it). `jest.setup.js` stubs `react-native-view-shot`, `expo-sharing` and
  `expo-linear-gradient` globally for this reason; suites asserting on capture override.
- **Stable mock references.** A test that mocks `useObservancesForDate` must return the
  *same* array each call — the timely-tags resolver's effect depends on it, and a fresh
  `[]` per render loops forever (the suite hangs rather than fails).
- **iOS Save Image needed a plist key all along.** The pre-PRD-45 single-card share
  exposed "Save Image" with no `NSPhotoLibraryAddUsageDescription` in `app.json`.

## Dependencies

- [[readers]] — every verse reader and the katha reader shell carry the share circle.
- [[panchang]] — timely hashtags come from today's observances; Observance detail shares.
- [[daan-punya]], [[puja-vidhi]], [[ask]] — surfaces with share builders.
- [[pitru-shiksha]] — deliberately excluded.
- `design.md` §39 (verse card, sheet, hashtags, story) and §39.4–§39.6 (prose, series,
  all-pages); `RULEBOOK.md` §3 (share contract, constrained surfaces).

Illustrated story cards do not measure the title at render: the paginator fixes the art box (`illustration.heightDp`) from the estimated title + caption height, and `ProseShareCard` renders art → caption box (title → narration → quote/link blocks) inside that geometry. Export still waits for decoded art and layout. Prose type stays at the existing fixed readable size; only the art box varies. `ScaledShareCard` takes `metrics` so previews and thumbnails scale the 9:16 card correctly.

The shared capture pipeline compensates for UIKit point dimensions using `PixelRatio.get()`; Android options remain physical pixels. Native iOS verification caught the old 3x multiplier (3240×4050) and the corrected output is checked at 1080×1350. Story-frame options receive the same correction for 1080×1920.
