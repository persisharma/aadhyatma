# Approved Vedansh particle identity

On 2 November 2026 the owner approved the flute-and-peacock English/Hindi transparent master and requested exact app integration plus the same change in the opening animation. `flute/approved-master.png` is that unmodified file, SHA-256 `6c49799a3be827159046f82d0bfe0b401b00a677e4b43d5e9bebdf4004d805c6`. Its exact prompt, approval context, crops and frames are preserved in `flute/prompt.md` and `flute/source.json`.

The current authoritative fragment is `approved-particle-preview.html`, SHA-256 `0c1fb6d3b102d25a00fc304d918aafb67ff0efef5b70e6437fb02dadcb66d1ed`. Only its embedded composition changed: 4,011 sampled particles now form the same copper/vermilion icon, the approved flute/feather English and Hindi names, and the existing companion subtitles together. Formation still completes at 3,350ms. The original renderer is preserved in `particle-preview-v1.html`; a test proves the entire fragment is identical after normalizing only its image data. Original icon and subtitle pixel rows are preserved byte-for-byte.

## Reproduce and verify

- After `npm ci --prefix mobile`, run `node scripts/prepare-approved-brand.mjs --check` from the root. Without `--check`, it generates the native document, complete composition and two exact master crops. It refuses an unapproved source/master hash.
- `scripts/compose-flute-brand.mjs` rebuilds the animation composition from the pinned master and v1 renderer. It changes only the previous English/Hindi name area, fitting both inside the previous bounds, and records exact source/composition hashes and particle count. It uses the existing `pngjs` plus optional developer `@napi-rs/canvas`; no mobile dependency is added.
- `scripts/export-approved-particle-logo.mjs OUTPUT_DIRECTORY` executes the same authoritative JavaScript with Canvas2D to export MP4/GIF/replayable HTML. It needs ffmpeg and the same optional developer canvas module; use `BRAND_CANVAS_MODULE` to select its installed path. The resulting hashes are in `approved-export-verification.json`. The v1 download metadata is archived in `particle-export-v1.json`.
- `scripts/preview-flute-headers.mjs` makes `docs/reviews/flute/header-scale.png` from the actual shipped PNGs and source frame dimensions. This is source-asset geometry review, not a native screenshot. `docs/reviews/flute/final-frame.png` is rendered by the actual animation at 3,350ms.

Native hosting still adds only a viewport, fixed ivory centering, hidden replay controls, no-network CSP and ready/complete bridge. The approved fragment is embedded byte-for-byte and required lazily after accessibility preferences resolve. The OS splash waits for readiness; the navigator and launch asks wait for completion. Reduced Motion/screen readers and cancellation/error/timeout paths retain their existing behavior.

## App footprint and shared branding

Home retains its 42pt row, 30pt side Om circles/rules, 14/22 companion subtitle and Settings clearance. The COMPLETE artwork, including flute and feather, is contained inside the name frames enlarged to restore the previous visible lettering scale: English 112×32pt, Hindi 86×32pt. A wider source aspect ratio reduces the drawn height rather than growing the frame. No tint is passed: the master already contains the dark-ink lettering, copper flute, green/teal feather and Hindi dot below श. The user subsequently reported the Hindi dots were incorrect. `scripts/brand-wordmark-corrections.mjs` changes only two pinned crop regions: the upper diamond becomes a round bindu, and the lower dot is separated from the श tail. The original approved master is unchanged; tests preserve every pixel outside those regions and verify the gap/round shape. No separate native dot is added.

`VedanshWordmark` reuses the same master crops for Home, verse/prose footers, common share strip, Panchang and Jyotish share headers. Hindi is primary in Hindi mode; English is the fixed brand name in the other modes. Companion subtitles and accessible labels follow all four app languages, using the existing script fonts. Export images register with `ArtworkCaptureContext`; capture still waits for their native decode. Content IDs, user storage and download links are unchanged.

## Provenance and remaining verification

The transparent flute master was produced by built-in imagegen and explicitly approved in this conversation. It retains the calligraphic direction of the earlier Samarkan/Yatra One reference; the existing Samarkan registration question is not resolved by generating or rasterizing artwork. No new font binary is bundled. Native iOS/Android fidelity, larger system text, startup performance and actual share handoff remain required. Pixel identity and passing tests do not establish native device verification.

## Repeated opens and size correction — 2 November 2026

The original gate completed once per JS session and did not replay on foreground reopening. It could also start while iOS was still inactive when cached preferences loaded quickly. The gate now mounts a fresh reveal after background → active and keeps the navigator mounted beneath a full-screen Modal; cold startup waits for active. Inactive-only permission/Control Center transitions do not replay it. Warm notification/widget dispatch signals cancellation before navigation. Accessibility, cancellation and watchdog behavior remain tested.

The old complete-art footprint made visible letters smaller because flute/feather consumed that box. English now uses a 112×32pt frame and Hindi 86×32pt, while the crest remains 42pt, Om circles 30pt and companion text 14/22. Screenshots IMG_9069(1), IMG_9068(1), and the earlier IMG_9032(1) establish the reported mismatch. Browser verification renders the actual production HomeWordmark with real language/theme/size providers; it remains separate from native device verification.

While the reveal is visible, the launch host, Explore, update offer and rating-request eligibility pause without consuming their daily slots. Their existing selection and cadence resume after branding finishes. The brand visibility signal is transient and never persisted.
