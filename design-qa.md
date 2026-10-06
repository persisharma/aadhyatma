# Native Storybook icon design QA

**Findings**

No remaining actionable P0/P1/P2 issue in the requested icon integration and refinement scope. The final native grid was compared with the selected source and the original native screens. Earlier source drift, inconsistent centering and floating/text-only NEW treatments are resolved.

[P3] Generated isolation retains slightly sharper contours and different grain/tiny manuscript marks from the small source board. This is an illustration reconstruction, not a pixel-identical extraction. The focused comparison makes this residual difference visible; no literal reproduction claim is made for the sixteen deity subjects absent from the board.

**Comparison target and state**

- Source: `docs/evaluations/storybook-icons-2026-10-06/selected-storybook-reference.png`, selected Option 1, 1448×1086px. The larger labeled category grid is the subject reference; its Sanskar pose differs from the smaller phone vignette. Exact crop coordinates and source hash are in the asset manifest.
- Original structure: `original-home-window.png` and `original-more-window.png`, 784×1736px simulator window captures. Layout follows the existing app; the board supplies artwork and color direction.
- Current implementation: `screenshots/home-native.png`, `screenshots/home-grid-native.png`, and the other native route captures under the same evidence directory. Actual native captures are 1206×2622px = 402×874dp at 3× density.
- Simulator: Vedansh-Upanishad-QA, iOS 26.5; standalone Release app `com.prashantsharma.vedansh`, version 1.4.9 / build 69. Hindi, light theme, visible NEW states, reader verse 1, bookmark state restored. App is left on the category grid so the refinement is visible.
- Original window content is cropped at `(47,205,739,1705)` and downsampled to 402px width. Before/after comparisons use body rows 52–750dp to exclude simulator cutout/bezel differences. Native status-bar color, device mask and dynamic date/recommendation/profile data are not judged as icon fidelity differences.
- Full board/native comparison keeps the source board intact beside native Home. Focused source crops are enlarged to comparable visible subject size beside actual rendered artwork. Native icon crops use the bundled asset's alpha bounds and the actual 62.7dp rendering scale; no replacement artwork is painted into screenshots.

**Combined visual evidence**

- `reference-native-comparison.png`: complete selected board beside actual native Home.
- `icon-fidelity-comparison.png`: selected and rendered Chalisa, Om, Japa and Kundali together at comparable subject scale.
- `home-before-after.png` / `more-before-after.png`: original/current native body composition at equal scale.
- `native-gallery.png`: all sixteen category subjects, More and deity browsing together.
- `screenshots/home-grid-native.png`: final installed build, all sixteen icons and the restored filled NEW pills in one viewport.
- `icon-contact-sheet.png`: all 39 bundled assets. `asset-corrections.md`: prompt invariants and semantic exceptions.

**Required fidelity surfaces**

| Surface | Observed result |
| --- | --- |
| Fonts and typography | Existing Noto Serif Devanagari, Cormorant Garamond and Inter roles remain. Hindi captions, headings, labels and bilingual detail hierarchy retain native conventions. Decorative icon rendering no longer relies on font glyphs. |
| Spacing and layout | Original three-column Home layout, full-width Daan closing tile, 72dp tile height, captions, More row geometry and navigation remain. All Home artwork uses 62.7dp, exactly 5% below 66dp; its visible bounds are about 53dp. NEW state no longer moves any launcher icon. The final full-grid capture shows consistent centers. |
| Badge clearance | Original filled saffron-tint NEW pill restored. It is inside Home tiles at top 2dp / right 6dp, with 2dp horizontal padding, 12dp line height and 0.5dp tracking. Kundali's frame and Muhurat's pointer remain clear. Pill text remains 10pt, with the existing full accessibility label announcing New. |
| Colors and tokens | Om has flat burnt ochre and a diamond dot. Painted subjects retain reference pigments. Ordinary utility controls share `iconInk #6F3F1D`; active accents use `iconAccent #AD571F`. The original parchment/card/theme surfaces remain. |
| Imagery and semantics | Japa has smooth oval beads and the large lower-left pendant; Chalisa has the source loop/tassel; Kundali uses dark doubled lines, sun and small house marks. Books, coconut/pot, shrine, temple, compass, shield and lotus use distinct source subjects. Practice uses two leaves, with separate broad Bhakti/Panchang navigation silhouettes. Daan retains three offerings; Suktam uses abstract marks rather than fabricated scripture. |
| Copy and behavior | Existing app copy, verses, meanings, routes, accessible control labels and hit areas remain. Reader bookmark toggle restores its starting state; search and navigation continue to open the existing screens. |

**Comparison history and resolved findings**

1. [P2] User review rejected generic-family assets: glossy orange Om, rudraksha/tiny-charm Japa, pale/simplified Kundali and other silhouette/pigment drift. Twenty-three assets were regenerated from enlarged exact source crops; the four critical subjects are compared with native rendering in `icon-fidelity-comparison.png`.
2. [P2] Artwork was undersized and NEW state shifted some icons lower. Home initially moved to 66dp artwork, then the user requested a 5% reduction to 62.7dp. Every launcher now retains its original center; final evidence is `home-grid-native.png`.
3. [P2] A floating NEW pill escaped the tile. Transparent text then looked loose; the user explicitly requested the original chip, just inside. Filled pills are restored with compact insets, without any icon offset. The final installed build and full-grid capture verify this state.
4. [P2] The source's practice leaves and navigation silhouettes were initially substituted with other subjects. Dedicated local assets now reproduce those source directions; native Home/navigation are visible in the gallery.
5. Earlier reader/search thumbnail inconsistencies were resolved through the shared registry. Current reader, search, audio, More and deity screenshots verify the consumers.

**Technical and interaction evidence**

- Final iOS Release build/install succeeded: zero errors / zero warnings. Build log `/tmp/vedansh-icons-inside-final-release-build.log`; embedded JS and local images are installed, independent of Metro.
- Full native walkthrough passed on the filled-pill/reduced-art build: Home → Chalisa → Hanuman reader, bookmark add/remove, More, By Deity, Panchang, Kundali, audio, Search → reader → Home. Log `/tmp/vedansh-icons-filled-final-maestro.log`.
- After final compact-launcher alignment and pill inset changes, the final installed build passed the focused Home grid run: Chalisa, Kundali, Muhurat and Daan visible together; captures include all sixteen subjects. Logs `/tmp/vedansh-icons-grid-final-maestro.log` and `/tmp/vedansh-icons-grid-final-frame.log`.
- A prior capture attempt returned to Home during the reader assertion. A clean app launch and waiting for the build/launch process to finish produced the passing walkthrough. Its failed debug output remains outside the repository; it is not counted as a pass.
- Current correction UI suite: 223 suites / 2,084 tests passed. Later focused runs passed 18 tests after the 39-asset registry/badge changes; all 8 CategoryCard tests passed after the final offset removal. Typecheck passed after registry changes. Final CategoryCard/spacing lint is clean and whitespace check passes.
- Asset tests verify 39 local mappings, 512px dimensions, transparency, SHA/byte counts and a total of 1,467,840 bytes below the 1.5MB artwork budget. All sixteen visible alpha bounding-box centers are within 0.5px of their 512px canvas center; rendered optical alignment is checked separately above.
- The previous integration's full 2,903-test run predates these corrections. It is not claimed as a fresh full-suite run. The earlier debug Metro heap failure was not repaired by this visual work.
- Android/tablet builds, physical-device performance, full VoiceOver navigation and enlarged-text visual sweeps remain unverified. No OTA or store publication occurred.

**Implementation Checklist**

- [x] Correct source-based subjects and preserve semantic exceptions.
- [x] Integrate bundled category/deity/navigation/utility consumers.
- [x] Keep native content, typography, routes and hit areas.
- [x] Center every launcher icon; reduce Home art by 5%.
- [x] Restore the original filled NEW pill entirely inside Home tiles.
- [x] Build/install and verify native navigation plus final full-grid state.
- [x] Inspect combined full-view and focused source/native comparisons.
- [x] Refresh evidence, design contract and wiki.

**Open Questions**

None required for the authorized local integration.

**Follow-up Polish**

Minor source texture differences and the untested platform/accessibility sweeps above are residual limits.

final result: passed
