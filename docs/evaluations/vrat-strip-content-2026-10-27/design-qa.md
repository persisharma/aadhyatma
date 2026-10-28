# Content clipping and middle-strip QA

final result: passed

Source truth: the user's supplied Vrat landing mockup and follow-up about clipped content and the middle strip. Original image852×1846 is retained at `docs/evaluations/vrat-reference-rebuild-2026-10-26/references/landing.png`; focused original strip790×154 is in the prior palette evaluation. The latest full-width-banner direction remains in effect.

Implementation: `docs/evaluations/vrat-strip-content-2026-10-27/native-{first,middle,last}.png`, English equivalents and `native-large-{first,middle,last}.png`. Viewport402×874pt, iPhone17Pro/iOS26.5,3× PNG1206×2622, Hindi/English on27October. Source date/location differ intentionally; native safe areas/navigation remain app-owned.

Combined full-view evidence: `comparison-full.png`, prior/current native screenshots downsampled to402×874 each. Focused combined inputs, opened and visually reviewed: `comparison-strip.png` (source/current normal strip), `comparison-strip-large.png` (prior/current EnglishXXXL) and `comparison-card-stop.png` (same native horizontal swipe before/after). Native crops are taken from original3× images before resizing; no UI is composited into the screenshots.

Resolved findings:

- [P1, fixed] Free scrolling could stop between cards, cutting the leading title/date at the left edge. The rail now snaps to a shared card-width-plus-gap interval, with responsive trailing padding that permits a complete final group too. First, middle and last native states show complete leading cards, including the long Janmashtami title and both final cards.
- [P2, fixed] The strip's icons/status rows drifted when the middle label wrapped, and Hindi14/20 typography had too little vertical room. The strip now uses the shared cream frame, top-aligned icons, centered14/22 labels, bottom-aligned status rows and intrinsic height. Normal Hindi follows the compact reference; enlarged English has a clear two-line middle label without clipping.

Required fidelity surfaces:

- Fonts/typography: existing script/English fonts retained. Hindi labels and complete long titles/dates read in the native captures. EnglishXXXL wraps labels, titles and countdowns without line clamps.
- Spacing/layout:155pt cards and6pt gaps retained; card-aligned stopping and final padding checked. The strip keeps three equal columns/dividers, aligned icons/status and content-driven height. Independent touch targets retained.
- Colors/tokens: shared cream catalog frame, faint gold border and shallow shadow now also paint the strip. Existing maroon titles and muted artwork remain.
- Images: all six displayed paintings keep the full-width banner treatment; no asset or focal-point changes. The overlay star remains separate from the open target.
- Copy/content: all labels, live counts, next dates and calendar rules preserved. Three strip destinations opened natively; settings-backed regional return was verified via the Vrat tab.

No actionable P0/P1/P2 remains in these checked states. A partial next-card hint at the right edge is still the horizontal browsing affordance shown by the prototype; on release, the leading card is fully aligned.30 focused tests, TypeScript and zero lint errors passed. Hindi/Standard/normal system text restored. Android/physical-device/screen-reader/smallest-phone checks remain pending; this is not cross-platform release acceptance.
