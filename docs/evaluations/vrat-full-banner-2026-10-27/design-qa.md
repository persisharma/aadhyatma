# Upcoming banner width correction

final result: passed

Source truth: the user's latest full-width-banner clarification, with the original landing/list mockups retained for painting/theme/text hierarchy. The explicit requested width and overlaid star supersede the prior110pt image beside the star. Original mockups: `../vrat-reference-rebuild-2026-10-26/references/{landing,list}.png`. Before implementation: `../vrat-palette-layout-2026-10-27/native-first.png`.

Rendered implementation: `native-first.png`, `native-middle.png`, `native-last.png` and `native-large-{first,middle,last}.png` in `docs/evaluations/vrat-full-banner-2026-10-27/`. Actual iOS26.5/iPhone17Pro,402×874pt,3× PNG1206×2622. Hindi/27October/initial Karwa–Ganesh sequence is identical before and after. Normalization crops the same native region(42,1074,990,1491) from original3× files and downsamples to632px width without changing aspect ratio.

Combined full-view evidence is `comparison-full.png`, with both native screens normalized to402×874; focused comparison is `comparison-banner.png`, opened and visually inspected. All three normal/enlarged rail positions were also opened. `preview.png` is a direct native crop, with no composited UI.

[P1, fixed] Banner occupied only110/155≈71% of the card and left an unwanted blank star column. It now spans the complete141pt inner width. The star visibly overlays the banner's upper-right corner. Shared constants keep both the frame and actual artwork the same width; save remains an independent44pt target.

Required fidelity surfaces:

- Fonts/typography: existing maroon Devanagari hierarchy and native text metrics retained; long Janmashtami title and date/countdown remain complete at normal/XXXL sizes.
- Spacing/layout: full inner-width banner, equal6pt insets,72pt height and overlaid star checked in the focused comparison; no blank side column remains. Intrinsic text height and shallow shadow clearance retained.
- Colors/tokens: existing cream frame and softer painted palette unchanged. Opaque star circle remains readable over the artwork.
- Images: current paintings fill their banner masks without stretching; all six Upcoming crops retain recognizable subjects/crowns. Wide Karwa/Ganesh/Vishnu paintings now show more of the original scene. Existing square paintings use the same reviewed upper focal point. No new art or runtime filters introduced.
- Copy/content: titles, dates, countdowns and follow labels unchanged; independent save/detail behavior passed natively.

No actionable P0/P1/P2 issue remains for this correction. TypeScript,33 focused tests, clean changed-file lint and native interaction/enlarged checks passed. Default reading cards are unchanged. Android/physical-device/screen-reader verification remains outside this run. Prior wider-page/palette findings and their evidence remain historical.
