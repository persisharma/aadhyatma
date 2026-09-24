---
title: Share Cards (verse, prose, series)
type: subsystem
sources: [mobile/src/utils/shareVerse.tsx, mobile/src/utils/shareContent.ts, mobile/src/utils/shareCardPages.ts, mobile/src/utils/shareCardType.ts, mobile/src/utils/multiShare.ts, mobile/src/utils/shareStoryLayout.ts, mobile/src/components/ShareCard.tsx, mobile/src/components/ProseShareCard.tsx, mobile/src/components/ShareTargetSheet.tsx, mobile/src/components/SharePagesStrip.tsx, mobile/src/components/SharePagePreview.tsx, mobile/src/components/ShareStoryFrame.tsx, mobile/src/components/ShareBrandFooter.tsx, mobile/src/data/shareLinks.ts, mobile/src/data/shareHashtags.ts, mobile/app.json, mobile/jest.setup.js, design.md, RULEBOOK.md, docs/roadmap/prds/45-universal-share-carousel.md]
last_verified_date: 2026-09-23
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
