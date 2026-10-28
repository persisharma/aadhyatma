# Vrat content clipping and middle strip

The full-banner change did not address the carousel's arbitrary resting offsets or the middle strip's alignment under enlarged text. This follow-up handles both on the real native screen.

- Upcoming snaps to155pt card plus6pt gap boundaries. The measured rail width determines the number of complete visible cards and the trailing padding, so the final stop also starts with a complete card. Titles, dates and countdowns retain intrinsic height and wrap. A glimpse of the next card remains at the right edge in earlier positions, as in the supplied prototype.
- The middle strip now uses the same cream `ListingCardFrame` as the calendar cards. Its three outline icons align at the top; labels are centered with14/22 Hindi-safe line height, and state lines align at the bottom. The strip grows with wrapping labels rather than fixing its height or truncating text. All three independent destinations and live counts remain.

## Visual evidence

Dedicated iPhone17Pro/iOS26.5,402×874pt at3×, PNG1206×2622. `native-first/middle/last.png` show all six Upcoming entries in Hindi; English and systemXXXL equivalents show full long titles, date/countdown wrapping and strip growth. `preview.png` is a direct crop containing both the strip and Upcoming.

`comparison-full.png` combines the preceding published native capture and the revised native page, both normalized to402×874px. `comparison-strip.png` normalizes the original mockup's790px strip and the new1122px native crop to the same width. `comparison-strip-large.png` compares the prior and current enlarged-English strip. `comparison-card-stop.png` shows the same swipe before and after card snapping: the first visible title is now complete. The source mockup remains `../vrat-reference-rebuild-2026-10-26/references/landing.png`; the previous full-banner evaluation is historical.

## Validation

TypeScript passed after the final source changes.30 existing focused tests across4 suites passed. Changed-file lint has zero errors and52 existing deferred-import warnings. Diff whitespace checks passed.

Native Hindi/English normal and English systemXXXL sequences passed and were visually inspected. All three strip destinations opened. The regional sheet closes to its existing settings surface; returning through the Vrat tab was verified. The initial automation wrongly assumed that closing this sheet would itself reveal `catalog-search`; no application/navigation change was needed for that test assumption. No family dates or regional preferences were changed. Hindi, app Standard and normal system text were restored.

Android, physical-device/screen-reader and smallest-phone checks remain outside this run. No artwork, devotional copy or calendar calculations changed; no release/OTA/CDN publication or merge performed.
