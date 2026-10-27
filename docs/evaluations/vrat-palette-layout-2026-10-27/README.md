# Vrat palette and prototype proportions — 27 October 2026

The earlier semantic/artwork pass missed the uneven saturation. The older Upcoming implementation also filled its image row, overlaid a large star, used stronger gold/rounding, and clipped its shadow. This follow-up addresses the user's supplied prototype and clipping feedback in the real native app.

## Changes

- Upcoming uses the existing Kids Stories `ListingCard` with a calendar tone: 155pt tile, 110×72 painting beside the small visible save circle, 6pt rail gaps, 14pt corners, cream surface and shallow shadow. Save controls retain independent 44pt hit areas. Native dates, countdowns and long titles grow/wrap; the rail reserves shadow space and exposes the next card as a scroll affordance.
- The three-column ledger uses 18pt outline icons, cream surface and matching corners. Its height grows with system text. Today/category/My Vrat surfaces share the calendar tone; default Kids Stories/reading cards retain their existing tone and geometry.
- Calendar titles use the maroon catalog token. The existing typed Katha scripture painting remains shared across the category door and Katha rows.
- Six brighter paintings were edited using built-in Image Gen: Karwa puja, Karwa ritual, Ahoi, Bal Krishna, Jivitputrika and Dasha Mata. Original assets remain intact; the explicit registry now selects the new variants. No render-time color filter is used.
- The merged main branch carried app version 1.5.5 while the tour version remained 1.5.4. The existing release-note contract failed locally and in CI. The tour version and a brief bilingual catalog entry now match app.json; the release version itself is unchanged.

## Artwork evidence

All 200 rules were resolved again, yielding 68 unique paintings, no missing identities and no symbolic fallbacks. `artwork-coverage.json` records the final paths, frames and SHA256 values. `palette-all-1.jpg` through `palette-all-3.jpg` show every unique painting, ordered by saturation, and were visually reviewed. Subject colors vary intentionally; the goal is a coherent painted medium, not numerically identical palettes.

`palette-before-after.jpg` shows the six edits. The maximum measured mean saturation drops from 0.789 to 0.595; the median is 0.421. These HSV measurements are advisory, using 128×128 RGB copies and excluding near-black/white pixels (V≤35 or V≥245); visual review owns acceptance. `generated-artwork-manifest.json` records exact prompts, original input hashes, generator paths, masters and shipped hashes. Six shipped variants total 241,854 bytes. Whole-canvas Lanczos resize and WebP encoding are the only mechanical postprocessing.

## Reference and native comparison

Authoritative references are preserved in `../vrat-reference-rebuild-2026-10-26/references/landing.png` and `list.png`. The focused crops here are `references/prototype-upcoming.png` and `prototype-ledger.png`. Current temporary screenshot attachments are also visible in the conversation; their OS temporary files were no longer present when copying evidence.

Measured reference content width 790px normalizes to 374pt inside the 402pt iPhone viewport. The source tile 327px →154.8pt, image 232×150px →109.8×71pt, gap12px →5.7pt and ledger154px →72.9pt. `layout-measurements.json` records the adopted values.

Dedicated simulator: B70539B2-7F7C-43A2-AA75-20DC7E05E85C, iPhone17Pro/iOS26.5, 402×874pt, screenshots1206×2622px. Compare content at the same scale; native safe areas/status/tab navigation remain platform-owned. Prototype dates are 26Oct with three days remaining; current engine dates are 27Oct with two days remaining. Today is absent on the current quiet date, so the Upcoming/ledger comparisons use focused regions rather than treating that state difference as missing UI.

The initial enlarged English attempt lost image delivery when an unrelated preview replaced port8084. Those blank-image captures were rejected. Final captures use this checkout's dedicated Metro port8542; the other preview was left untouched.

## Verification boundary

See `design-qa.md` and `validation.md` for final native routes, interaction checks and automated results. Artwork coverage is complete across the registry; native route/state checks are representative and do not claim 200 separate device walkthroughs. Android native verification remains outstanding. No release, OTA or CDN publication was performed.
