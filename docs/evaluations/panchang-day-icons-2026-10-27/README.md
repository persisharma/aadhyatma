# Panchang day-panel icon rework

Six individually generated transparent Storybook miniatures: `chandra`, `karana`,
`nitya-yoga`, `agni-vaas`, `sunset`, and `moonrise`. Existing icons are reused; the Nakshatra legibility replacement is recorded in the follow-up below.

Generated with the built-in `image_gen` tool. Every call included the approved
Storybook style board; sunset and moonrise also included `surya.png` as the edit
target. `prompts.json` contains the final exact prompts. `sources.json` records
each selected master, original generated path, prompt, reference hashes, and master
hash. `selected-generations.json` records the selected call inputs.

The owner rejected the crescent-and-star treatment during this session. Chandra
and moonrise were regenerated as plain cratered lunar discs with no star. The
superseded crescent-and-star outputs are not exported or registered. Nitya Yoga
retains the joined sun and crescent, with no star.

`export.py` retains the existing pipeline: clear alpha below 8, fit the visible
bounds to 432 px, center on a 512 px canvas, and quantize to a 256-color alpha
palette. All six shipped icons total 205,445 bytes, under the separate 300 KB
budget. The earlier icon-family budgets remain unchanged.

`review.png` compares the six with shipped surya, nakshatra, and vrat at 30 and
72 logical pixels. The lunar subjects remain distinct: full disc, half-lit disc,
joined sun/moon, and disc at the horizon. The contact sheet was visually inspected.
## Implemented behavior

The selected day's observance stays in the top ribbon. The lower card lists only
observances of selected date + 1 and disappears on an empty following day. It says
Tomorrow only when browsing today; historical/future selections say Next day.
Published Sankashti Ganapati forms and Angarki suffixes remain intact. Each row
opens Observance Detail. Regional-calendar discovery and both Pitru chips are
retained because removal was not approved. Muhurat Detail remains outside scope.

The anga, vaas, yoga and timing grids retain their text, values and accessibility
semantics. Their shared warm surface is `PanchangDaySurface`; only Disha Shool gets
the avoid gradient. Topic artwork uses the bundled painted registries. The header's
saved star now uses the shared utility glyph, and regional entry points reuse
More's painted regional subject. The live Tithi/sky/ribbon phase marks now reuse the painted moon with an elliptical lit limb; they have no star.

## Icon consistency review

| Slot | Reviewed treatment |
| --- | --- |
| Tithi | 26dp painted phase in a 32dp dark-sepia disc, no star |
| Nakshatra / Nitya Yoga / Karana | 36dp registry paintings at top-right; label reserves space |
| Sun / Moon / Disha Shool / Agni Vaas | 30dp paintings before labels; chips wrap inside cards |
| Shubh Yoga | Existing More star at 22dp; plain Finder variant retained |
| Sunrise / Sunset / Moonrise / Brahma Muhurta | 40dp surya / sunset / moonrise / aarti paintings |
| Following-day observances | Shared Vrat `ObservancePreviewCard` with 78dp event artwork, bilingual title and independent save/reminder control |
| Regional calendar | Existing More regional painting on discovery and seeded feedback |
| Header actions | Existing small utility controls and live sky mark; saved star normalized |

The initial implementation reused the other paintings; a later Nakshatra legibility edit is recorded below. Reused paintings and all six new subjects
were compared at 30px and 72px. Native Hindi captures in `ios/` were visually
inspected at Standard and Large reading settings; no artwork/text collision was
observed. The time labels retain the brief's existing small typography. The Large
preset scales reading text, so day-tile fixed labels retain their established size.

## Verification and limits

- Typecheck passes after merging latest main.
- Five affected Jest suites pass: 16 tests, including empty next-day cards,
  multiple observances, correct navigation, browsed-day labels and Angarki names.
- Painted-icon and launch-graph checks pass: 4 tests.
- ESLint: no errors; 51 existing import-order warnings from the lazy-sheet declaration.
- Both modified/authored Maestro flows parse.
- iOS 26.5, dedicated iPhone 17 Pro simulator, this checkout's Metro on port 8106:
  the updated smoke reached calendar toggles, date selection and all four timing
  labels. A focused run reached the dated next-day card and opened Sankashti detail.
  Separate focused Large and anga checks exited 0; screenshots were inspected.
  The simulator's font-scale preference was verified as L for the Large captures.
- A complete fresh-launch `panchang-smoke.yaml` run remains inconclusive: the native
  driver hit `kAXErrorInvalidUIElement` on first-run setup, and an iOS URL
  confirmation outlived an app reset. A first Metro process also exhausted its
  default heap; the retry used Node 22 with a 12GB heap and one worker.
- For focused page review, only this dedicated simulator's first-run setup was
  seeded complete. This is not a first-run/onboarding acceptance result.
- `panchang-day-painted-visual.yaml` is the reproducible review recipe; individual
  page/detail/Large checkpoints were verified, but the entire recipe did not finish
  in one green run due startup/navigation harness issues. The iOS smoke now taps
  the real Back control instead of relying on the platform back action.
- Android verification is pending. GitHub reported no CI checks on the initial draft head.
- PR remains open; no merge, OTA, store release or external asset publication.

## Painted celestial phase follow-up

The owner required a full Moon on Purnima and progression through the other Tithis,
and asked for the header Sun/Moon to match. `CelestialGlyph` now reuses the original
full `chandra` and eight-ray `gayatri` paintings. An elliptical terminator reveals
the right-lit waxing or left-lit waning part of the moon; Purnima has no shade and
Amavasya has no bright limb. The unlit side retains faint painted texture.

This is an illustration of the named Tithi, not continuous lunar illumination.
The Tithi tile follows its sunrise Tithi; the live night sky follows the running
Tithi, including a post-sunrise transition or kshaya link, on its existing minute
updates. Day/night selection, the arc and reduced-motion behavior are preserved.
The ribbon reuses the shared renderer at 24dp, and the tile at 26dp in its 32dp disc.
No source PNGs, registry names or asset hashes were changed.

Validation for this follow-up:
- Typecheck and focused ESLint pass.
- Seven affected Jest suites: 25 tests pass, including all 30 phase steps, full/dark
  endpoints, opposite waxing/waning limbs, painted assets and the night header's
  running-Tithi handover.
- Prevailing-Tithi and widget payload checks: 16 tests pass.
- Painted-art and launch-graph checks: 4 tests pass.
- `panchang-celestial-phase-smoke.yaml` passes end to end on the dedicated iOS 26.5
  simulator with completed setup: 26 October 2026 Purnima, 3 October waning Saptami,
  10 October Amavasya and 19 October waxing Ashtami. The dates/indices were checked
  against the bundled engine before the run. Its captures in `celestial-phase/`
  were visually inspected, including the painted daytime header sun.
- Native nighttime header visually inspected on the same simulator at a temporary
  simulated 28 October 2026, 10 PM IST. `celestial-phase/panchang-painted-moon-night-header.png`
  shows the dark sepia sky, cream controls, sunset-to-sunrise arc and painted waning
  Krishna Tritiya moon. Only the app runtime's `Date.now` was temporarily overridden
  through its local debug inspector; it was restored immediately after capture.
  The iOS status-bar clock retains the real capture time. No clock override was
  added to source or committed. The development warning was dismissed for capture.
- Reconciled main at `78d34ea6` (Vrat strip/reminder work); retained both wiki log
  histories. Typecheck and all 25 focused Jest tests pass on merge `f8bb89a9`.
  The celestial implementation is unchanged by this merge.
- Android and VoiceOver verification remain pending.

## Listing consistency and Nakshatra follow-up

The lower following-day cards now render the same `ObservancePreviewCard` and
`ListingCard variant="observance"` as the Vrat listing, rather than custom kalash
rows. This brings the existing event artwork, 78dp square scene, bilingual title,
cream catalog frame, shared chevron and independent 44dp bell target. The day
label uses the countdown slot. Sankashti occurrence names are display overrides;
artwork, save/reminder state and detail navigation keep the original rule identity.
First-use reminders and saved-preference reuse use the existing shared hook.

Nakshatra retains its six-star arrangement and 36dp layout slot, with stronger
sepia outlines and thicker painted connectors. Built-in Image Gen edited the
existing icon; `nakshatra-rework/prompt.json` retains the exact prompt, reference
and master hashes, `export.py` reproduces normalization, and `comparison.png`
compares 30/36/72px exports on cream. The replacement is 21,798 bytes, 5,009 bytes
above the old export; the existing Nakshatra/Rashi budget and total icon counts
are unchanged. The old October 16 master is retained.

Local verification: typecheck and focused ESLint pass; listing/preview/next-day
card suites pass (23 tests), reminder-action and painted asset suites pass
(10 tests). The focused `panchang-next-day-listing-smoke.yaml` passes end to
end on the dedicated iOS 26.5 simulator with completed setup at Standard and Large
reading sizes. All four screenshots in `listing-consistency/` were visually
inspected: stronger constellation lines, complete scene, full bilingual occurrence
title, Next day badge and separate bell/chevron are clear with no collision.

The first native route tap opened Sankashti Detail (confirmed visually), then the
Maestro driver returned `kAXErrorInvalidUIElement` while querying the transition.
The green focused flow covers visual/layout states and the accessible detail/bell
targets; correct navigation and independent reminder actions are also pinned by
Jest. This is not an Android or VoiceOver acceptance result.
