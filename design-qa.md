# Native Storybook icon and sizing QA

**Findings**

No remaining actionable P0/P1/P2 finding in the implemented sizing recommendations on the tested native states. The approved artwork remains centered at 62.7dp; normal phone tiles remain 72dp. Filled NEW states clear Kundali/Muhurat at enlarged text. Search no longer covers categories. Reader targets are actual 48dp controls. Defined tablet tracks and full-width Daan respond to rotation.

[P3] The reconstructed source artwork still has slightly sharper contours and different tiny grain/manuscript marks than the small selected board. This is the previously accepted residual illustration difference; the sixteen deity subjects absent from the board are semantic additions, not literal reproductions. No artwork was regenerated for this follow-up.

**Comparison target, state and density**

- Selected artwork truth: `docs/evaluations/storybook-icons-2026-10-06/selected-storybook-reference.png`, Option 1, 1448×1086px; original native structure: `original-home-window.png` / `original-more-window.png` in that directory. Exact reference hash/crops remain in the bundled manifest.
- Sizing truth: approved default art plus the six recommendations in `docs/evaluations/storybook-icons-2026-10-06/size-audit/README.md`. Before PNGs 23, 24 and 21 show the actual enlarged-badge, default-grid and rotated-tablet states. Requested adaptive layout changes are intentional differences from those before captures.
- Implementation: exact Release captures under `docs/evaluations/storybook-icons-2026-10-06/post-change/`, version 1.4.9 (69), iOS 26.5. Hindi/light at normal text, Hindi/English at compact accessibility-medium. Reader verse 1; bookmark add/remove restores state.
- Native 402×874pt phone = 1206×2622px at 3x; compact 375×667pt = 750×1334px at 2x; large 440×956pt = 1320×2868px at 3x; iPad portrait 744×1133pt = 1488×2266px at 2x. Landscape files store portrait pixels with EXIF orientation 8; displayed size is 2266×1488px = 1133×744pt.
- Comparison sheets normalize to logical-point density. The enlarged grid intentionally changes from three to two columns and therefore needs a different scroll position to show Kundali/Muhurat. The same device, system text setting, language and feature state are compared; focused tiles remain at the original 2x density. The default grid offsets differ slightly, with all sixteen subjects visible in the accepted final image. Dynamic dates/timings, status clocks and carousel scroll offsets are not artwork-fidelity differences.

**Combined evidence**

All paths below are relative to `docs/evaluations/storybook-icons-2026-10-06/post-change/`:

- Full default comparison: `default-grid-before-after.png`; handoff: `main-preview.png`.
- Full enlarged comparison: `large-text-before-after.png`; focused actual tile crops: `badge-clearance-detail.png`.
- Full tablet comparison: `tablet-before-after.png`; raw return state: `tablet-portrait-return.png`.
- Full enlarged English title/tab state: `compact-enlarged-english-recommendations.png` and `compact-enlarged-english-new.png`.
- Reader/More: `reader-and-more.png`; exact PNGs `03-reader.png` and `04-more.png`.
- Existing source/asset comparison sheets remain in the parent directory. The original 39 asset files and pigments are unchanged by this follow-up.

**Required fidelity surfaces**

| Surface | Observed result |
| --- | --- |
| Fonts and typography | Native font families/script roles retained. NEW/tab text starts at 11pt. Tab labels grow uniformly up to 1.4x and retain full English names using the whole slot. Enlarged recommendations, Today headline/chips and inline Routine copy show their full text. Decorative brand geometry stays fixed; tagline scales. |
| Spacing and layout | All art remains centered. Normal phones retain three columns/72dp tiles. Enlarged text reserves badge space in every tile and uses wider tracks. Tablet content is centered/capped at 800dp, with five normal tracks; portrait/landscape/portrait update correctly. Daan spans the actual grid. Reader visible circles retain their size inside real 48dp targets; verse pill aligns vertically. |
| Colors and tokens | Original parchment gradients and painted pigments retained. Utility ink stays `#6F3F1D`; selected icons stay `#AD571F`. Active text uses `#8A3E0B` for calculated 6.60:1 on `#F8EFD6`. NEW uses its original filled saffron tint/deep text. |
| Image quality and asset fidelity | 512px transparent PNGs retain square aspect ratio with contain rendering and the existing art registry. 62.7dp at 3x needs about 188px, below source resolution. No stretched raster, crop change, new texture or replacement graphic. |
| Copy/content | Category names, semantic deity mappings, content order, routes and kids-story shelves retained. Search has a localized prompt and the original accessible action label. Tab titles keep full localized accessibility names. No placeholder/prototype content. |

**Comparison history**

1. Original artwork refinement: exact selected-source subjects, consistent centers, 5% size reduction and the filled inset badge resolved the earlier default-size findings. The separate sizing audit then exposed enlarged text, tablet width and touch-target gaps.
2. First sizing implementation: subscribed grid, 48dp wrappers, inline Search, 11pt text and expanded badge clearance were captured. A native reader check exposed the verse pill's old top alignment; centering it resolved the row. Enlarged English still truncated recommendation/Today/Routine titles and tab names (`iterations/english-before-wrapping.png`).
3. Natural title wrapping and a 1.4x tab scaling cap resolved body titles, but UIKit's 5dp side padding still shortened Panchang (`iterations/english-before-full-tab-width.png`). Captions now use the full slot and drop English tracking at enlarged text. Fresh English captures show full Panchang/Bhajan names, full recommendation copy and clear NEW artwork.
4. Capture-only fixes: an initial grid frame cut Daan; the accepted final `02-phone-grid.png` shows all sixteen subjects. The first iPad flow stopped on a tour introduced after Begin; another Skip check resolved onboarding. The rerun verifies portrait → landscape → portrait. Failed captures are not counted as passes.

**Validation and limits**

Full local checks pass: typecheck and 2,941 tests (226 UI suites/2,100 UI tests), plus zero observance failures/divergences/drift. After the final caption-width polish, typecheck, lint and the actual Release build pass; Release has zero errors/warnings. Native smoke covers content readers, bookmark add/remove, More, By Deity, current Home kids shelves, Panchang, Bhajan and inline Search. Focused captures cover three phone widths, enlarged Hindi/English and iPad rotation.

Android, physical-device ergonomics, full screen-reader navigation, Gujarati/Kannada widths and the largest Dynamic Type setting remain unverified. This is a pass for the implemented recommendations on the tested states, not a general accessibility certification. No merge/OTA/store publication.

**Implementation checklist**

- [x] Retain approved artwork size/pigments and the filled inset NEW cue.
- [x] Reserve large-text clearance and support caption/title wrapping.
- [x] React to width/rotation and derive Daan's span from the current grid.
- [x] Give reader actions real 48dp targets and center their row.
- [x] Improve small-label size/contrast while preserving icon accent.
- [x] Move Search into the page and preserve first-tap/routing behavior.
- [x] Inspect combined full-view and focused native comparisons.
- [x] Record tested states, failed attempts and remaining platform limits.

final result: passed
