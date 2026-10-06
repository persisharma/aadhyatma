# Native Storybook icon integration and corrections

2026-10-06 · workspace `/Users/prashant/.codex/worktrees/ca4c/Aadhyatma` · branch `codex/storybook-native-icons` · initial base `8905bb39`. The PR branch incorporates the current `main` before publication.

The selected Option 1 artwork is integrated into the React Native app, with the existing Home structure, typography, routes and controls. Following user review, 23 assets were corrected using exact enlarged reference crops rather than a generic family prompt.

## Final visual contract

- 39 offline, transparent 512px PNGs, totaling **1,467,840 bytes**. Static mappings, export/master hashes, source-board hash and crop coordinates are recorded in `mobile/assets/icons/storybook/manifest.json`.
- Sixteen Home category illustrations share one center. Artwork is **62.7dp**, a **5% reduction from 66dp**, in the original **72dp** tile. Visible subject bounds are about 53dp. NEW state never offsets the icon.
- Home's NEW pill keeps its original saffron-tint fill and deep-saffron text, entirely inside the tile at top 2dp / right 6dp. Compact 2dp horizontal padding, 12dp line height and 0.5dp tracking keep it clear of chart and sundial artwork. Floating, transparent-text and outlined variants were rejected by the user.
- Corrected Om is matte burnt ochre with a diamond dot; Japa has smooth oval beads and the large lower-left pendant; Kundali has dark doubled chart lines and small house marks. Chalisa, books, pot, temple, shrine, shield, lotus, compass, scroll and Daan subjects retain the selected reference direction.
- Practice uses the source's two olive leaves; Bhakti/Panchang use separate source navigation silhouettes. Ordinary utilities share `iconInk` (`#6F3F1D`); active accents use `iconAccent` (`#AD571F`). Painted illustrations retain their own pigments.
- All 21 deity attributes remain individually mapped. Sixteen subjects absent from the selected board retain semantic illustrations; they are not claimed as literal source copies. Daan retains three seed-shaped offerings; Suktam contains abstract marks rather than invented scripture.
- Accessibility names, roles, hit areas and actions stay with the enclosing controls. Artwork is decorative and bundled locally.

## Validation

- Merged current `origin/main` (`cb38ba61`), preserving Home's new kids-story catalog and all append-only wiki entries. Removed the retired More kids-story row during conflict resolution.
- Fresh full `npm test` on the merged branch passed **2,928 tests**: 37 widget tests, 2,087 UI tests across 224 suites, 589 engine tests, 166 data tests and 49 Ask tests. Typecheck also passed.
- Fresh `npm run verify:observances` passed, with zero failures, known divergences or anchor/rule-table drift.
- Fresh standalone iOS Release build: **zero errors / zero warnings**, installed on Vedansh-Upanishad-QA, iOS 26.5, UDID `5799D1D7-B645-4613-8058-822E63009C0F`. Bundle `com.prashantsharma.vedansh`, version 1.4.9, build 69.
- Merged-main native walkthrough passed: Home → Chalisa → Hanuman reader, bookmark add/remove, More, By Deity, Home Kids Stories → three deity shelves, Panchang, Bhajan, Search → reader → Home. A redundant centering step failed despite the Hanuman row being visible; removing it produced the passing run.
- Asset tests verify all 39 mappings, 512px dimensions/transparency, hashes and the 1.5MB artwork budget. Every Home asset's visible alpha bounds center within 0.5px of the canvas center. Optical alignment is checked separately in native captures.
- See [the icon-size review](size-audit/README.md) for fresh device captures, dimensions, standards and remaining usability gaps. Icon source fidelity and an accessibility audit are separate acceptance claims.
- Android, physical devices and full VoiceOver navigation remain unverified. No OTA or store publication occurred.

Logs: `/tmp/vedansh-icons-pr-test.log`, `/tmp/vedansh-icons-pr-observances.log`, `/tmp/vedansh-icons-pr-release-build.log`, `/tmp/vedansh-icons-pr-native-retry.log`.

## Evidence

- `selected-storybook-reference.png`: exact selected source board.
- `original-{home,more}-window.png`: original native simulator window captures.
- `pre-correction-home{,-lower}-window.png`: earlier rejected integration.
- `screenshots/*-native.png`: native captures from the implementation/refinement stages. Fresh merged-main captures for this review are numbered under `size-audit/`; that review uses only its own captures.
- `reference-native-comparison.png`, `icon-fidelity-comparison.png`: combined source/native comparisons.
- `home-before-after.png`, `more-before-after.png`, `native-gallery.png`: native composition and consumer comparisons; original screens are retained as the before state.
- `icon-contact-sheet.png`: all 39 bundled assets. `asset-corrections.md`: correction prompts and semantic constraints.
- Repository-root `design-qa.md`: final visual findings and verification limits.

Maestro debug output and generation masters remain outside the repository under `/Users/prashant/.codex/visualizations/2026/10/05/01a10cf8-763b-77d2-ad60-fdb256afb305/native-storybook-correction/`.

## Implemented sizing recommendations

The follow-up is integrated in the native app. [Post-change evidence](post-change/README.md) covers filled NEW clearance, subscribed phone/tablet grids, real 48dp reader targets, readable tab labels, inline Search and enlarged-text reflow. The original size audit remains historical before evidence.

## More icon follow-up

User review identified both icon placement and style drift in More. [The More correction](more-alignment/README.md) adds a complete painted settings family and aligns its profile with the shared row columns. The earlier More captures remain pre-correction evidence.
