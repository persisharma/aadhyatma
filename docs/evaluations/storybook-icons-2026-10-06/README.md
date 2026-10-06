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

- Standalone iOS Release build: **zero errors / zero warnings**, installed on Vedansh-Upanishad-QA, iOS 26.5, UDID `5799D1D7-B645-4613-8058-822E63009C0F`. Bundle `com.prashantsharma.vedansh`, version 1.4.9, build 69.
- Full native walkthrough passed on the filled-pill, reduced-art build: Home → Chalisa → Hanuman reader, bookmark add/remove, More, By Deity, Panchang, Kundali, audio, Search → reader → Home. The final installed build separately passed the Home grid check, with all sixteen subjects visible together and the restored pills inside their tiles.
- Current correction UI run: **223 suites / 2,084 tests passed**. After the 39-asset registry and final badge changes, focused runs passed **18 tests**, followed by all **8 CategoryCard badge/label tests** after removing the remaining launcher offset.
- Typecheck passed after the asset registry changes. Focused lint has zero errors; the final CategoryCard/spacing lint is clean. `git diff --check` passed.
- Asset tests verify all 39 mappings, PNG dimensions/transparency, hashes and the 1.5MB artwork budget. Visible alpha bounds of every Home asset center within 0.5px of the 512px canvas center; native screenshots are the separate check for optical alignment and badge clearance.
- The earlier integration's full `npm test` passed 2,903 tests. That result predates these visual corrections; it is not presented as a new full-suite run.
- Android, tablet, physical devices, full VoiceOver navigation and enlarged-text visual sweeps were not exercised. No OTA or store publication occurred.

Logs: `/tmp/vedansh-icons-inside-final-release-build.log`, `/tmp/vedansh-icons-filled-final-maestro.log`, `/tmp/vedansh-icons-grid-final-maestro.log`, `/tmp/vedansh-icon-correction-ui-tests.log`, `/tmp/vedansh-icons-inside-final-tests.log`.

## Evidence

- `selected-storybook-reference.png`: exact selected source board.
- `original-{home,more}-window.png`: original native simulator window captures.
- `pre-correction-home{,-lower}-window.png`: earlier rejected integration.
- `screenshots/*-native.png`: actual app captures at 1206×2622px / 402×874dp, not browser prototypes.
- `reference-native-comparison.png`, `icon-fidelity-comparison.png`: combined source/native comparisons.
- `home-before-after.png`, `more-before-after.png`, `native-gallery.png`: current native composition and consumer evidence.
- `icon-contact-sheet.png`: all 39 bundled assets. `asset-corrections.md`: correction prompts and semantic constraints.
- Repository-root `design-qa.md`: final visual findings and verification limits.

Maestro debug output and generation masters remain outside the repository under `/Users/prashant/.codex/visualizations/2026/10/05/01a10cf8-763b-77d2-ad60-fdb256afb305/native-storybook-correction/`.
