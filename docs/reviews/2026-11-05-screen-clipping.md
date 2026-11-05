# Screen-clipping corrections — 5 November 2026

Base: e759b98122fd3cc6e863e7df4f879f2b2cf74d08.

## Scope and acceptance

Complete localized reader titles retain readable type and Back/action access. Kundali city search stays inside its clipped sheet while filtering, selecting and dismissing as before. Now Playing preserves playback/seek/repeat/minimize callbacks and makes all body content scrollable on short screens. No saved IDs, data, engines, assets, release versions or OTA configuration change.

Universal U1–U12 apply; C1/C7 protect readers and Back, C8 audio, C9 shared UI/accessibility. No new authored content/artwork or calendar computation; other conditional groups are N/A.

## Verification status

Implementation and focused regression verification are in progress. The PR remains draft until required checks are complete. Browser screenshots are component renders with native adapters, not installed iOS/Android screenshots.

Pending: final full mobile test suite, before/after browser layout matrix, final CI, and actual iOS/Android Maestro/visual/playback/keyboard flows. No simulator/emulator is available in this environment.
