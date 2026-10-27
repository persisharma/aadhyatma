# Validation

- TypeScript: passed after final registry changes.
- Full automated suite: 3,781 passed (Jest readers/components 2,856 across 296 suites, widgets37, Panchang engine621, data/notifications218, ask49). The inherited main-branch tour-version mismatch was repaired and its full Jest shards rerun successfully.
- After final six registry substitutions: 46 focused tests across seven suites passed (`ListingCard`, `ObservancePreviewCard`, `ObservanceArtwork`, `CatalogLandingPanels`, `ObservanceListScreen`, `ObservanceDetailScreen`, `artworkDelivery`).
- Changed-file lint: zero errors; 52 existing Panchang deferred-import warnings. Diff whitespace check passed.
- Every generated master/shipped hash verified against its individual provenance record. Registry coverage: 200 rules, 68 unique paintings, no unknown named identities, neutral symbolic fallbacks or split composite strips.

Native iOS26.5, iPhone17Pro 402×874pt at3×:

- Hindi Standard: first/middle/last Upcoming positions, complete long Janmashtami title/date/countdown, compact ledger, category grid and Vrat list.
- English Standard: same complete Upcoming sequence, saved My Vrat row, reminders sheet/save, unfollow/empty state, Katha and Vrat list. The initial automation omitted closing the reminders sheet; rerun saved the sheet and completed the remaining actions successfully. No application fix was needed for that automation assumption.
- English systemXXXL: first/middle/last Upcoming sequence, wrapping mode/ledger/title/date/countdown and full-width category reflow. Persistent navigation remains visible. Hindi enlarged geometry was also checked before the palette edits.
- Rejected blank-image captures from a preview-port collision were replaced using dedicated port8542. Final native captures show actual resolved paintings and parchment.
- Test follow removed; Hindi, app Standard and system normal `large` restored. Existing 44pt independent save/reminder/open targets preserved.

Android, a physical device, screen reader behavior and the smallest-phone viewport remain outside this run's native evidence. The previous consistency evaluation records the broader Parv/Upvas/detail/Kids Stories routes. No release, OTA/CDN upload or merge performed.
