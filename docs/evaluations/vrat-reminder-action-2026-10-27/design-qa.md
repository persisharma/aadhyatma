# Vrat reminder action QA

final result: passed

Scope: reminder bell, first-use setup, saved timing reuse and My Vrat. Source truth is the user's explicit bell/reminder/favourites request; the original landing/list mockups remain the source for painted cards, cream frames and text hierarchy. This is scoped iOS acceptance; Android and physical-device notification delivery remain pending.

Evidence: iPhone17Pro/iOS26.5, 402×874pt, 3× PNG1206×2622. Hindi Standard and English system XXXL were exercised on the dedicated test simulator. `native-bells.png` shows unsaved bells; `native-first-setup.png` shows the first-use sheet; `native-reuse-no-popup.png` shows two saves after choosing timing once. `native-list-save.png`, `native-detail-save.png` and `native-final-my-vrat.png` cover additional list/detail routes and four saved favourites. `native-reused-preference.png` shows the inherited 2-day/08:00 setting. English enlarged states are `native-large-*.png`.

`comparison-full.png` normalizes the prior star screen and current bell screen to 402×874 each. `preview.png` combines direct downsampled native screenshots of the bell landing, first setup and final My Vrat. No UI has been composited into these captures. Landing and initial two-save captures precede the final opaque selected-bell background and Saved vrats label; the four-item My Vrat capture records those final treatments. A redundant last landing capture with the development download overlay was rejected; it is not included as evidence.

Resolved findings:

- [P1, fixed] The star silently added a follow with factory timings. The bell now asks for Vrat timings once, saves the Vrat only on Save, and directly reuses an explicit saved Vrat preference on later additions. Cancel leaves both favourite and preference unchanged.
- [P1, fixed] Setting a reminder for an unsaved rule now also creates its My Vrat entry. Existing custom preferences can be reused even after removing that old favourite. The built-in default and Daily Bhakti preferences do not count as a configured Vrat preference.
- [P2, fixed] My Vrat no longer has two visually similar reminder actions: the bell removes a saved favourite and cancels reminders, while the gear edits that Vrat's timing. Bell-off distinguishes a saved favourite whose timing is explicitly Off.
- [P2, fixed] The shared native-modal sheet has a 44pt Close target and a scrollable body capped at 90% height; Save and Cancel remain reachable at English XXXL. Search dismisses the keyboard before first setup.

Fidelity checks:

- Fonts/typography: existing Indic and English fonts retained; native Hindi title/copy and English enlarged sheet wrap without clipping. The underlying search placeholder remains intentionally single-line.
- Spacing/layout: independent 44pt bell/open/settings targets, full banner, card snap interval and intrinsic text heights retained. The middle strip retains its aligned three-column design.
- Colors/tokens: existing parchment, cream, gold and saffron tokens; opaque parchment bell discs remain legible over painted artwork.
- Images: no new raster artwork or runtime color filters. My Vrat's empty state now uses the existing muted Karwa scene.
- Copy/content: first-use text states Save adds My Vrat and reuses the timing; the footnote explicitly separates Daily Bhakti. Saved counts match four real records. Tour copy now explains the bell and gear.

Native fixture proof: `native-preference-proof.json` records 2-day advance +08:00 day-of, two saved Vrats and an unchanged Daily Bhakti fixture (disabled,05:45). Further list/detail saves reused the same timing without setup. Original Vrat/Daily preference values and Hindi/Standard/system normal text were restored after QA. These are controlled simulator fixtures, not production user data.

Verification before main synchronization: 3797 tests passed in aggregate (2872 current Jest tests +925 unchanged widget/engine/data/ask tests from the full run), final 52 focused tests, TypeScript, zero changed-source lint errors (52 existing deferred-import warnings), and clean diff checks. Reproducible Maestro flow copies are included. Android, physical-device delivery, OS permission-dialog interaction and screen-reader traversal remain pending; tests do not establish those results.


Post-merge validation (28 October): synchronized with main at `176a201c`, preserving both append-only wiki histories. Full `npm test` passed **3824 tests**: widgets37, Jest2899 across303 suites, engine621, data218, ask49; TypeScript passed as the first step. Changed-source lint passed with zero errors and52 existing deferred-import warnings. Relevant Vrat source merged without textual conflicts; native captures predate the synchronization and do not establish Android/physical-device delivery.
