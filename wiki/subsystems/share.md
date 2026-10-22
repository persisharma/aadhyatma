---
title: Share Cards (verse, prose, series)
type: subsystem
sources: [mobile/src/utils/shareVerse.tsx, mobile/src/utils/shareText.ts, mobile/src/utils/shareContent.ts, mobile/src/utils/listingShare.ts, mobile/src/utils/kidsStoryShare.ts, mobile/src/components/KidsStoryArt.tsx, mobile/src/utils/shareCardPages.ts, mobile/src/utils/shareCardType.ts, mobile/src/utils/multiShare.ts, mobile/src/utils/shareStoryLayout.ts, mobile/src/components/ShareCard.tsx, mobile/src/components/ProseShareCard.tsx, mobile/src/components/ShareTargetSheet.tsx, mobile/src/components/SharePagesStrip.tsx, mobile/src/components/SharePagePreview.tsx, mobile/src/components/ShareStoryFrame.tsx, mobile/src/components/ShareBrandFooter.tsx, mobile/src/data/shareLinks.ts, mobile/src/data/shareHashtags.ts, mobile/app.json, mobile/jest.setup.js, design.md, RULEBOOK.md, docs/roadmap/prds/45-universal-share-carousel.md]
last_verified_date: 2026-10-22
confidence: high
status: current
---

## Summary

For scripture and prose, one provider (`ShareProvider` / `useShare()` in `utils/shareVerse.tsx`, mounted once in
`App.tsx`) turns content into branded parchment images, captures them
off-screen with `react-native-view-shot`, and
hands it to WhatsApp / the OS sheet / Instagram. `share(content, lang)` takes a
`ShareableContent`: a `ShareableVerse` (the original verse card, design.md §39) or a
`ShareableProse` (PRD-45, §39.4) — long prose that a pure paginator cuts into a **series**
of cards. Verse images retain a 540×675dp minimum and grow from actual native text layout; they export
at 1080px width with proportional height. Short story shares retain 1080×1920; longer
ones grow with the card plus the frame's 120/165dp insets. A series gets a pages strip, a preview, and two all-pages rows that hand every
page to one OS sheet (WhatsApp album; iOS "Save N Images"; Instagram → Select multiple).

## Details

- **Where the mapping lives.** Each surface's data → share shape is a pure builder in
  `utils/shareContent.ts` (`vratKathaShareable`, `theerthShareable`, `daanKathaShareable`,
  `daanPrincipleShareable`, `vidhiMantraShareable`, `observanceShareable`,
  `askAnswerShareable`), tested in `shareContent.test.ts`. Screens only call
  `share(builder(data), lang)` from a `ShareButton`.
- **Share placement.** Share icons sit at the right side of their content card/header. Kids Stories pins it right of the centred language toggle; Vrat Katha places it after the header counter and Daan Katha in the header right slot, keeping read-aloud in its own language-row slot.
- **Listing indexes.** `listingShare.ts` maps visible catalog entries into the existing `ShareableProse` card and picker. Category, deity, purpose, katha, observance and vidhi lists and chapter/theme/episode indexes carry the header share circle. Each row retains its title and detail; up to three complete rows fit a card, with the prose type budget checked in hi/en/gu/kn. A long index is split into labelled scopes of at most ten cards. Search-filtered katha and observance lists share the current results. Story/Reel output is a static 9:16 image; the app does not create a video.
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

- **Send as text + card language** (design.md §39.8, `utils/shareText.ts`): a `Send as text` row hands the verse (lines + meaning) or the *selected* prose pages to `Share.share({ message })` with the caption's link lines — no capture, so no native gate and no 10-page cap. Card-language chips let the card, caption, hashtags and text go out in hi/en/gu/kn while the sheet chrome and alerts stay in the reader's language (`chooser.cardLang`; prose keeps `lang` = card, `uiLang` = chrome). Switching on a series re-paginates and resets selection.

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
- **Long listing parts.** A 90-entry katha library takes several scope selections; the
  all-pages row exports one selected part at a time. The builder never drops entries
  just to fit the ten-card native share cap.
- **Paginator constants are measured.** Advances hi 0.41 · gu 0.43 · kn 0.56 · en 0.44 =
  the minimum that never under-counted any of 500 katha paragraphs per language laid out
  in Chromium at 484 dp with the app's TTFs, + 0.02. If a device clips a prose page, widen
  the advance — never add `adjustsFontSizeToFit` (design.md §39's 7 pt failure).
- **Verse height is native, not estimated.** `ShareCard` uses `minHeight`, uncapped text,
  24/40 verse and 18/27 meaning. The provider waits up to five seconds for a capture-specific
  native height callback, then resizes the capture container and PNG height. A late callback
  from an older capture is ignored; missing layout takes the existing failure path instead
  of capturing a guessed short frame. This work runs only on share.
- **First-line marks clip natively, not on web.** A `lineHeight` below ~1.53× font size (Noto Devanagari/Kannada, VedanshDevotionalText) makes iOS and Android trim the first line's box from the top; the Text then clips matras, reph and anusvara (हे→ह, चौपाई→चापाइ, अर्थ→अथ). React Native Web shows nothing wrong. `withMarkHeadroom` in `DevotionalFrame.tsx` adds padding plus an equal negative margin; reuse it for any tight Indic leading.
- **Optional title line.** `meaningTitleHi/En` renders the complete theme title above the
  meaning at 18/27; actual wrapping contributes naturally to the measured image height.
- **Tall images and Instagram.** The verse picker explains one taller image for long text
  and possible framing adjustments in Instagram. It does not promise fixed aspect chips or
  third-party crop behavior. Prose/picture picker geometry is unchanged.
- **No-share surfaces.** Pitru Smaran, the पितृ पक्ष परिचय layer and the personal-tithi
  Vidhi carry no share button — design.md §63/§74 lock it.
- **Text share must wait out the sheet dismissal.** Image paths spend capture time after closing the modal; the text path has none, so `sendText` waits `SHEET_DISMISS_MS` (350 ms) before `Share.share`, or iOS refuses to present over the dismissing modal.
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

The shared capture pipeline compensates for UIKit point dimensions using `PixelRatio.get()`; Android options remain physical pixels. Native iOS verification caught the old 3x multiplier (3240×4050) and the corrected output is checked at 1080×1350. Short story-frame options receive the same correction for 1080×1920; taller verse exports retain 1080px width and scale height proportionally.

## Daily Bhakti complete devotional image

`dailyBhaktiShareable` prepares one complete verse/meaning page per language. `DevotionalShareCard` grows from actual native body/root layout and reports height after every image slice decodes. The provider, full-height preview and Story frame preserve that measurement. All 27 deity/subject masters plus neutral prayer ship from the separate `devotional-share` R2 category through the shared persistent cache; none are bundled. The eighteen new subjects are complete portrait compositions with their own scene-to-parchment transition, brand plaque, reading frame and footer, replacing the rejected rectangular header reuse. Every section slices its own subject master using manifest-fitted coordinates. The explanation renders in a twin महत्त्व box (meaning-box caps, mirror-tiled clean middle) behind a second lotus divider; a label-only first paragraph (`महत्त्व:`) stays with its paragraph inside the अर्थ box. Short cards restore the remaining master band above the footer, cropped as text grows; preview and capture readiness include its paint. Text remains readable on paper while a first download is pending or fails; capture refuses incomplete art, while previously cached masters work offline. `scripts/prepare-devotional-share.mjs --verify --cdn` verifies all 28 public source hashes. Native/device/WhatsApp evidence is tracked separately in `docs/evaluations/daily-bhakti-full-masters/README.md`. See design.md §39.9 and [[integrations/reading-artwork]].

The 22 Oct delivery optimization reduces the complete Daily Bhakti set from 21.52MiB to 8.54MiB by re-encoding only the nine older lossless portraits at WebP q94/m6/sharp YUV. All dimensions, slice coordinates and capture logic stay unchanged. The lossless authoring hashes/revision remain in provenance; the delivered pixels are perceptually compressed. See `docs/evaluations/daily-bhakti-compression/` and [[integrations/reading-artwork]].


### Personalized Suvichar

[[suvichar]] is a separate composer: it captures the exact editable native preview, reusing the persistent artwork cache and `multiShare.shareFiles` delivery adapter, with an expo-sharing fallback. It does not pass personal names through scripture/prose content types. Its artwork subscription survives text edits; a measured child resets paint/layout readiness per content generation. New R2 master hashes remain inactive until public-byte verification.
