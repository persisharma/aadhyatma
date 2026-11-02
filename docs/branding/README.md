# Approved Vedansh particle identity

On 2 November 2026 the owner approved the flute-and-peacock English/Hindi transparent master and requested exact app integration plus the same change in the opening animation. `flute/approved-master.png` is that unmodified file, SHA-256 `6c49799a3be827159046f82d0bfe0b401b00a677e4b43d5e9bebdf4004d805c6`. Its exact prompt, approval context, crops and frames are preserved in `flute/prompt.md` and `flute/source.json`.

The current authoritative fragment is `approved-particle-preview.html`, SHA-256 `437c1c12f44d42b61453ffbfd9c17fdf63254a4fd55ecc821c6fae93de443788`. Only its embedded composition changed: 4,012 sampled particles now form the same copper/vermilion icon, the approved flute/feather English and Hindi names, and the existing companion subtitles together. Formation still completes at 3,350ms. The original renderer is preserved in `particle-preview-v1.html`; a test proves the entire fragment is identical after normalizing only its image data. Original icon and subtitle pixel rows are preserved byte-for-byte.

## Reproduce and verify

- After `npm ci --prefix mobile`, run `node scripts/prepare-approved-brand.mjs --check` from the root. Without `--check`, it generates the native document, complete composition and two exact master crops. It refuses an unapproved source/master hash.
- `scripts/compose-flute-brand.mjs` rebuilds the animation composition from the pinned master and v1 renderer. It changes only the previous English/Hindi name area, fitting both inside the previous bounds, and records exact source/composition hashes and particle count. It uses the existing `pngjs` plus optional developer `@napi-rs/canvas`; no mobile dependency is added.
- `scripts/export-approved-particle-logo.mjs OUTPUT_DIRECTORY` executes the same authoritative JavaScript with Canvas2D to export MP4/GIF/replayable HTML. It needs ffmpeg and the same optional developer canvas module; use `BRAND_CANVAS_MODULE` to select its installed path. The resulting hashes are in `approved-export-verification.json`. The v1 download metadata is archived in `particle-export-v1.json`.
- `scripts/preview-flute-headers.mjs` makes `docs/reviews/flute/header-scale.png` from the actual shipped PNGs and source frame dimensions. This is source-asset geometry review, not a native screenshot. `docs/reviews/flute/final-frame.png` is rendered by the actual animation at 3,350ms.

Native hosting still adds only a viewport, fixed ivory centering, hidden replay controls, no-network CSP and ready/complete bridge. The approved fragment is embedded byte-for-byte and required lazily after accessibility preferences resolve. The OS splash waits for readiness; the navigator and launch asks wait for completion. Reduced Motion/screen readers and cancellation/error/timeout paths retain their existing behavior.

## App footprint and shared branding

Home retains its 42pt row, 30pt side Om circles/rules, 14/22 companion subtitle and Settings clearance. Visible dark lettering matches the Om circles at 30pt and shares their vertical center. Reviewed ink bounds in `scripts/brand-home-frame.mjs` set aspect-preserving scale and optical offsets inside English 124×36pt / Hindi 97×36pt frames. The complete flute and feather fit within the original 42pt row. Normal gaps are 10pt, compact gaps 6pt, preserving Settings clearance. No tint is passed: the master already contains the dark-ink lettering, copper flute, green/teal feather and Hindi dot below श. The user subsequently reported the Hindi dots were incorrect. `scripts/brand-wordmark-corrections.mjs` edits only the documented dot pixels: it erases the old upper mark, places a round bindu above the दा आ stroke at crop x=558 (not श), with a 36px diameter that renders just over 3pt high at the Home size, and separates the lower dot from the श tail. The original approved master is unchanged; tests preserve every pixel outside those regions and verify the gap/round shape. No separate native dot is added.

`VedanshWordmark` reuses the same master crops for Home, verse/prose footers, common share strip, Panchang and Jyotish share headers. Hindi is primary in Hindi mode; English is the fixed brand name in the other modes. Companion subtitles and accessible labels follow all four app languages, using the existing script fonts. Export images register with `ArtworkCaptureContext`; capture still waits for their native decode. Content IDs, user storage and download links are unchanged.

## Provenance and remaining verification

The transparent flute master was produced by built-in imagegen and explicitly approved in this conversation. It retains the calligraphic direction of the earlier Samarkan/Yatra One reference; the existing Samarkan registration question is not resolved by generating or rasterizing artwork. No new font binary is bundled. Native iOS/Android fidelity, larger system text, startup performance and actual share handoff remain required. Pixel identity and passing tests do not establish native device verification.

## Repeated opens and size correction — 2 November 2026

The original gate completed once per JS session and did not replay on foreground reopening. It could also start while iOS was still inactive when cached preferences loaded quickly. The gate now mounts a fresh reveal after background → active and keeps the navigator mounted beneath a full-screen Modal; cold startup waits for active. Inactive-only permission/Control Center transitions do not replay it. Warm notification/widget dispatch signals cancellation before navigation. Accessibility, cancellation and watchdog behavior remain tested.

The old complete-art footprint made visible letters smaller because flute/feather consumed that box. The follow-up alignment uses 124×36pt English and 97×36pt Hindi frames so the actual lettering, including Hindi dots, is exactly 30pt high and centered on the Om circles. The crest remains 42pt and companion text 14/22. Screenshots IMG_9069(1), IMG_9068(1), and the earlier IMG_9032(1) establish the reported mismatch. Browser verification renders the actual production HomeWordmark with real language/theme/size providers; it remains separate from native device verification.

While the reveal is visible, the launch host, Explore, update offer and rating-request eligibility pause without consuming their daily slots. Their existing selection and cadence resume after branding finishes. The brand visibility signal is transient and never persisted.

## Native handoff and immediate reopening (2 November 2026)

Native launch uses `splash-blank.png` on the same ivory as the canvas, replacing the static emblem before the particles. The old feathered splash export remains preserved. Changing this config requires a new native binary; an OTA cannot remove the static image from an existing binary.

`brand-particle-host.mjs` embeds the approved fragment unchanged, keeps the canvas hidden, cancels its initial autoplay at frame zero after decode, and reports readiness. The WebView awaits the native hide promise before injecting the explicit start command; the original replay action restarts the accepted clock. Completion is ignored before start. Unmount cancels a pending handoff; existing accessibility/error/watchdog and targeted-navigation exits remain.

Quick inactive → active returns replay, even without background. iOS AppState cannot distinguish a quick app-switcher visit from Control Center/notification interruptions, so both replay. Initial inactive cold startup still waits for active; duplicate active events do not replay. No minimum-away cooldown or persistence flag is used. Native visual/lifecycle checks remain required.
