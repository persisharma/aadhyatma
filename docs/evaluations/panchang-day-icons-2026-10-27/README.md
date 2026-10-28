# Panchang day-panel icon rework

Six individually generated transparent Storybook miniatures: `chandra`, `karana`,
`nitya-yoga`, `agni-vaas`, `sunset`, and `moonrise`. Existing icons are reused.

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
More's painted regional subject. The live Tithi/sky/ribbon phase marks remain
calculated; they have no star.

## Icon consistency review

| Slot | Reviewed treatment |
| --- | --- |
| Tithi | Live phase in a 32dp dark-sepia disc, no star |
| Nakshatra / Nitya Yoga / Karana | 36dp registry paintings at top-right; label reserves space |
| Sun / Moon / Disha Shool / Agni Vaas | 30dp paintings before labels; chips wrap inside cards |
| Shubh Yoga | Existing More star at 22dp; plain Finder variant retained |
| Sunrise / Sunset / Moonrise / Brahma Muhurta | 40dp surya / sunset / moonrise / aarti paintings |
| Following-day observances | Existing 42dp vrat painting; same shared utility chevron |
| Regional calendar | Existing More regional painting on discovery and seeded feedback |
| Header actions | Existing small utility controls and live sky mark; saved star normalized |

No further generated artwork was needed. Reused paintings and all six new subjects
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
- Android verification is pending. GitHub reports no CI checks on this draft head.
- PR remains a draft; no merge, OTA, store release or external asset publication.
