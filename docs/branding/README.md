# Approved Vedansh particle identity

The owner accepted the calligraphic preview in this conversation and explicitly requested app integration. Its authoritative fragment is `approved-particle-preview.html`, SHA-256 `af052692ac2477860ae6c0e69ed7ce6754ed5dcf1400f10bd7e78665c6ad69d5`. It contains the complete accepted 720×780 composition, 3,809 sampled particles, original icon colours, joined English name, Hindi name and two companion subtitles. Formation completes at 3,350ms; MP4/GIF exports add a final hold.

## Reproduce and verify

- From the repo root, after `npm ci --prefix mobile`: `node scripts/prepare-approved-brand.mjs --check`.
- Without `--check`, the same script generates the local native document, original complete image and lossless name crops. It refuses an unapproved source hash.
- `scripts/export-approved-particle-logo.mjs OUTPUT_DIRECTORY` runs the authoritative JavaScript with Canvas2D and exports MP4/GIF/replayable HTML. It needs ffmpeg and the optional developer module `@napi-rs/canvas`; set `BRAND_CANVAS_MODULE` to its installed module path if it is not installed at the repo root. It adds no mobile dependency.
- `approved-export-verification.json` records the exact accepted-download source and hashes. It describes source-based exports, not a native device capture.

The wrapper adds only a viewport, fixed ivory background/centering, hidden preview controls, a no-network CSP and a ready/complete bridge. The authoritative fragment is included byte for byte. The existing WebView and composed document are required lazily after accessibility preferences resolve. The OS splash waits for readiness; the app navigator and launch asks wait for completion. Reduced Motion/screen readers and cancellation/error/timeout paths bypass or dismiss it. Current-main Explore launch fixes are included.

## Shared branding

`VedanshWordmark` uses the original raster name crops, not substitute fonts. Hindi is primary in Hindi mode; the fixed English name is primary in other app languages. Native localized companion text still uses the existing script font tokens and scales/wraps. Export wordmarks register their mounted image decode with `ArtworkCaptureContext`; the actual capture waits for them. Existing reader content, source IDs, user storage and share download links are unchanged.

## Typography provenance and production check

The preview's English lettering is Samarkan by Titivillus Foundry/Ethel Enterprises, distributed at https://www.dafont.com/samarkan.font. Its archive readme asks users to register the font. Registration has not been verified in this session and must be confirmed before production use. No Samarkan font binary is bundled by this change. Rasterization is not recorded as a substitute for this check.

The Hindi artwork uses Yatra One and the preview subtitles use Hind, from the Google Fonts repository. The app receives only the accepted raster artwork and existing native type tokens; no new font binary or native dependency is introduced. Native visual/performance checks and actual share handoff remain required; successful unit tests and source hashes do not establish them.
