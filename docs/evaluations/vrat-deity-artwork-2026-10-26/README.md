# Vrat & Parv subject portraits

The first PR #542 implementation mapped deity names to symbolic `StoryIcon`
attributes: Gauri was a flower, Ganesh a modak, and Shiva a trident. The user
requested actual subject artwork, reusing existing art before creating more.
The original approved prototype was not available in the PR; this change does
not claim an exact reconstruction of that reference.

## Asset decisions

- Reuse 25 distinct published painting sources: 22 reader illustrations, Ahoi
  and Tulsi's devotional-share masters, and the existing Siddhidatri story cover.
  Sita and Rama have separate reviewed focal points in the same Ram Darbar
  painting. No source reader/story image or story frame was changed.
- Add 35 new 256×256 WebP miniatures, 952,574 bytes total, scoped to observance
  cards. The full masters remain at their original Image Gen paths. The app
  uses the optimized files in `mobile/assets/icons/observance-portraits/`.
- `generation.json` retains all 36 exact generation prompts and master paths.
  The Sita candidate was not integrated after identifying a suitable Sita
  portrait in the existing Ram Darbar painting. Its master remains preserved.
- `manifest.json` beside the icons records the selected files, dimensions,
  byte sizes and SHA-256 hashes. Generation used built-in `image_gen` with the
  existing Parvati reader painting as a rendering-style reference.
- Inspect every new result at 256px: named subject/form, face, identifying
  attributes, connected arms/hands, complete square composition, no text or
  logos. All 35 selected thumbnails received this review. These are artistic
  devotional depictions; historical portrait authenticity is not claimed.
- Composite names show every named person, through dedicated shared scenes
  (Gangaur, Madhushravani, Chauth Mata/Vinayak) or adjacent portrait slices.
  Dasha Mata, Vat Savitri and Jivitputrika use the shipped ritual/story context
  rather than inventing an authoritative goddess portrait. Non-personified
  traditions and practices retain neutral scripture/ritual symbols.

## Rendering and delivery

`observancePortraits.ts` makes an explicit decision for every default-visible
calendar subject. A coverage test rejects unclassified names and missing named
assets. `ObservanceArtwork` consumes the same mapping on Today, Upcoming,
search and category-list cards. Upcoming portraits are 80dp, Today 76dp, list
rows 64dp and search 48dp. Portrait focal points are independent of text length.

Existing published paintings use the shared bounded cache. Their original
masters remain outside the native bundle. Loading/offline misses show the
existing semantic symbol until the real cached portrait has loaded. New
miniatures are bundled and available offline. No R2 upload or publication was
performed. Category symbols, Home art and navigation art were not replaced.

## Verification

- TypeScript passed.
- Five focused Jest suites passed, 25 tests, covering explicit identity and
  composite coverage, published requests, existing cache behavior, card/save
  separation, filters and sharing. The native asset-transformer mock is treated
  as an opaque bundled asset, rather than a published manifest descriptor.
- Launch-graph budget: both checks passed. Source artwork remains unbundled.
- Changed-source ESLint has no errors; the artwork-request dispatch contains
  three intentional lazy-require warnings, including its existing Vidhi thunk.
- iOS 26.5 preview uses a separate simulator and this worktree's Metro. The
  Standard list was visually inspected with real Gauri, Ganesh and Ahoi art.
  The focused category navigation/capture flow passed after waiting for the
  initial Home render. An earlier attempt tapped during a reload and stayed
  on Home. An earlier preview-server attempt ran out of memory on Node 26;
  the preview was restarted with Node 22 and a larger heap.
- Standard/Large flow passed on iOS 26.5 using
  `mobile/.maestro/vrat-portraits-smoke.yaml`; both landing and category-list
  compositions were inspected. These are the app reading-size presets, not
  a complete system Dynamic Type audit. The preference was restored to Standard.
  Cold development bundle compilation exceeded an initial 30-second category
  wait; the flow now allows 90 seconds. Capture waits were added to avoid
  taking an image during sheet dismissal or before image decoding settled.
  Root-only ad hoc recaptures from a preserved category stack failed; the
  recorded size flow includes a Back step and passed both sizes.
- All 25 reused CDN sources returned 200 with complete GET/SHA-256 prefix
  matches (`cdn-verification.json`). Python's default urllib client was denied
  by the CDN; repeating with curl succeeded. All 35 selected local files match
  their 256px dimension and SHA-256 manifest entries.
- Android, physical-device, full catalog/follow/reminder journeys and original
  prototype/editorial acceptance remain pending. No native rebuild, OTA or
  release was performed. The user subsequently requested committing these
  artifacts and updating PR #542 after reconciling current main.
