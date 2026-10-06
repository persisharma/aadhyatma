# Native Storybook icon and sizing QA

**Findings**

No remaining actionable P0/P1/P2 finding in the implemented sizing recommendations on the tested native states. The approved Home artwork remains centered at 62.7dp; normal phone tiles remain 72dp. Filled NEW states clear Kundali/Muhurat at enlarged text. Search no longer covers categories. Reader targets are actual 48dp controls. Defined tablet tracks and full-width Daan respond to rotation. More's later style/alignment correction is recorded separately below.

[P3] The reconstructed source artwork still has slightly sharper contours and different tiny grain/manuscript marks than the small selected board. This is the previously accepted residual illustration difference; the sixteen deity subjects absent from the board are semantic additions, not literal reproductions. The sizing follow-up retained all 39 Home/deity assets. The later More correction adds a matching utility family rather than replacing those assets.

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
- Reader/earlier More: `reader-and-more.png`; exact PNGs `03-reader.png` and `04-more.png`. These More captures precede the painted settings correction; current More evidence is under `../more-alignment/`.
- Existing source/asset comparison sheets remain in the parent directory. The original 39 asset files and pigments are unchanged by both follow-ups.

**Required fidelity surfaces**

| Surface | Observed result |
| --- | --- |
| Fonts and typography | Native font families/script roles retained. NEW/tab text starts at 11pt. Tab labels grow uniformly up to 1.4x and retain full English names using the whole slot. Enlarged recommendations, Today headline/chips and inline Routine copy show their full text. Decorative brand geometry stays fixed; tagline scales. |
| Spacing and layout | All art remains centered. Normal phones retain three columns/72dp tiles. Enlarged text reserves badge space in every tile and uses wider tracks. Tablet content is centered/capped at 800dp, with five normal tracks; portrait/landscape/portrait update correctly. Daan spans the actual grid. Reader visible circles retain their size inside real 48dp targets; verse pill aligns vertically. |
| Colors and tokens | Original parchment gradients and painted pigments retained. Navigation/control ink stays `#6F3F1D`; selected icons stay `#AD571F`. More's new paintings retain their warm ochre/brass/brown pigments without runtime tint. Active text uses `#8A3E0B` for calculated 6.60:1 on `#F8EFD6`. NEW uses its original filled saffron tint/deep text. |
| Image quality and asset fidelity | 512px transparent PNGs retain square aspect ratio with contain rendering. Home's 62.7dp at 3x needs about 188px, below source resolution; its assets and crops remain unchanged. More's 30dp canvases use matching centered bounds. New More drawings are documented reconstructions/extensions, not literal board crops. |
| Copy/content | Category names, semantic deity mappings, content order, routes and kids-story shelves retained. Search has a localized prompt and the original accessible action label. Tab titles keep full localized accessibility names. No placeholder/prototype content. |

**Comparison history**

1. Original artwork refinement: exact selected-source subjects, consistent centers, 5% size reduction and the filled inset badge resolved the earlier default-size findings. The separate sizing audit then exposed enlarged text, tablet width and touch-target gaps.
2. First sizing implementation: subscribed grid, 48dp wrappers, inline Search, 11pt text and expanded badge clearance were captured. A native reader check exposed the verse pill's old top alignment; centering it resolved the row. Enlarged English still truncated recommendation/Today/Routine titles and tab names (`iterations/english-before-wrapping.png`).
3. Natural title wrapping and a 1.4x tab scaling cap resolved body titles, but UIKit's 5dp side padding still shortened Panchang (`iterations/english-before-full-tab-width.png`). Captions now use the full slot and drop English tracking at enlarged text. Fresh English captures show full Panchang/Bhajan names, full recommendation copy and clear NEW artwork.
4. Capture-only fixes: an initial grid frame cut Daan; the accepted final `02-phone-grid.png` shows all sixteen subjects. The first iPad flow stopped on a tour introduced after Begin; another Skip check resolved onboarding. The rerun verifies portrait → landscape → portrait. Failed captures are not counted as passes.

**Validation and limits**

At sizing commit `65bbfa72`, full local checks passed: typecheck and 2,941 tests (226 UI suites/2,100 UI tests), plus zero observance failures/divergences/drift. After the final caption-width polish, typecheck, lint and the actual Release build passed; Release had zero errors/warnings. Native smoke covered content readers, bookmark add/remove, More, By Deity, current Home kids shelves, Panchang, Bhajan and inline Search. Focused captures covered three phone widths, enlarged Hindi/English and iPad rotation.

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

**More style/alignment correction**

User review identified two remaining differences in More: rows mixed 23dp utility outlines with 36dp painted subjects, and the profile used a 52dp-wide icon column instead of the rows' 38dp column. This shifted the profile center by 7dp and its label start by 14dp.

`MoreIcon` now supplies all nineteen settings subjects through sixteen new transparent paintings plus the existing lotus, compass and offering bowl. Bell/alarm/saved reconstruct subjects from the selected board; thirteen new drawings extend its warm palette. Every row uses a centered 30dp canvas in the fixed 38dp tile. The profile's 52dp disc and 32dp Om share that column and text start. The original 39 assets are unchanged. The More manifest records exact generation prompts and source/master/shipped hashes; the new assets total 648,489 bytes.

An initial enlarged English capture exposed another layout failure: the long read-aloud value hid its label and pushed the chevron off-screen. The rejected frame is retained in `more-alignment/iterations/`. Copy is now bounded between fixed icon/17dp arrow columns, with a 60% normal-value ceiling. Above system fontScale 1.2, full labels wrap and values stack beneath them; the profile summary wraps. Normal settings retain their existing one-line ellipsis behavior and full accessible labels.

Fresh final Release captures at 402×874pt / 1206×2622px show every More illustration, shared icon/text alignment, and intact arrow columns. Enlarged Hindi/English shows full Read Aloud copy and the profile summary; Instagram/About wrap without shifting icons or arrows. [All More groups](docs/evaluations/storybook-icons-2026-10-06/more-alignment/more-preview.png), [normal comparison](docs/evaluations/storybook-icons-2026-10-06/more-alignment/before-after.png), [enlarged comparison](docs/evaluations/storybook-icons-2026-10-06/more-alignment/enlarged-before-after.png), and [provenance/limits](docs/evaluations/storybook-icons-2026-10-06/more-alignment/README.md) contain the accepted evidence. Scroll offsets differ where copy reflow increases row height; comparison sheets resize complete native frames to point density without repainting UI.

Validation: the final full `npm test` gate passed with 2,942 tests (226 UI suites / 2,101 UI tests) plus typecheck. The 14 focused More/asset tests and changed-source lint also passed after the final copy reflow. The final Release build/install has zero errors/warnings. Both final native capture flows passed, including profile navigation, language changes and the About sheet. The existing More smoke also passed after its premature off-screen Language wait was replaced by a profile wait followed by scrolling; that failed attempt is recorded in the report. This More correction was tested on the 402pt iOS simulator at normal and accessibility-medium text; the earlier Home device matrix and the platform/accessibility limits above remain distinct. No actionable icon-style/alignment finding remains in the tested More states.

final result: passed

## Three approved celestial chakra placements — 6 October 2026

The user selected all three separate-screen concepts. Final result for these placements: **passed** after one visual correction. No actionable P0/P1/P2 difference remains in the chakra integration on the tested states.

**Resolved finding [P2], Home decoration visibility.** The first installed Home ornament at opacity 0.22 was too pale against the existing gradient. `CelestialChakra.tsx` now uses 0.32. A fresh Release build/capture and combined [final Home comparison](docs/evaluations/celestial-chakra-2026-10-06/home-comparison.png) / [focused comparison](docs/evaluations/celestial-chakra-2026-10-06/focused-comparison.png) show the rays/rings without hiding the header or chips. The rejected first combined capture is retained in `iterations/home-first-comparison.png`. Panchang's upper-left crop retains 0.18; its cards remain legible. Jyotish's simplified seal stays within its native 58dp tile and retains the actual Kundali tool icon below.

**Expected/P3 differences.** The new drawings reconstruct the selected motif; exact tiny star positions, ray strokes and grain differ from the mockups. The seal has slightly more edge clearance. These are custom raster illustrations, not screenshot crops. Existing live Choghadiya data changed from the mock's early-evening avoid window to the night’s auspicious window, removing the old next-up line and moving subsequent cards. Actual native status-bar glyphs remain; the generated sources omit those glyphs. At accessibility-medium English, the unchanged dense Panchang mode label wraps across lines and the city label shortens; the full accessible label remains. This is a scoped decoration pass, not a certification of all existing large-text navigation layouts.

**Target/state/density.** Exact source truth is `docs/evaluations/celestial-chakra-2026-10-06/targets/`: option 1 Panchang, option 2 Home, option 3 guest Jyotish. Each is 851×1848px. Final actual Release PNGs under `native/` are 1206×2622px (402×874pt at 3x), iOS 26.5, version 1.4.9 (69), Hindi/default system text. Source/native comparison sheets normalize both complete screens to 402×874 logical pixels. Enlarged English captures use the same simulator at `accessibility-medium`; they check containment/reflow, because the mockups have no enlarged-text counterpart. The device/content/installed bundle metadata and raw captures are retained.

| Required fidelity surface | Observed result |
| --- | --- |
| Fonts and typography | Native font/script roles, sizes, headers and copy remain. Hindi and enlarged English copy stays legible above the faint ornament; no image-generated text/UI is used. |
| Spacing and layout rhythm | Existing screen/card/selector positions stay native. Home clips only its absolute art layer, retaining the shadow. Panchang has the approved upper-left crop. The 54dp seal is centered in the original 58dp tile. Enlarged text grows cards while the decoration stays anchored/contained. |
| Colors and tokens | Existing parchment/card surfaces, ink and saffron controls remain. Transparent warm gold/brown art uses no runtime tint. Home opacity 0.32 resolves the first visibility finding; calendar art uses 0.18. |
| Image quality and fidelity | The wheel is a 1024px transparent PNG reused at 360/160dp; the seal is 512px at 54dp. Both use square contain rendering, centered visible bounds and alpha. Indexed packaging retains crisp native details, and installed hashes match shipped hashes. Minor reconstructed engraving details are the P3 differences above. |
| Copy and content | Existing date/astronomy engine, actions, accessible labels and guest/saved-profile content remain. Only the guest introduction illustration changes; actual Kundali retains its house-chart image. Calendar-only backdrop switching preserves the original other-mode background. |

**Combined evidence.** [Panchang](docs/evaluations/celestial-chakra-2026-10-06/panchang-comparison.png), [Home](docs/evaluations/celestial-chakra-2026-10-06/home-comparison.png), [Jyotish](docs/evaluations/celestial-chakra-2026-10-06/jyotish-comparison.png), and [focused regions](docs/evaluations/celestial-chakra-2026-10-06/focused-comparison.png) were inspected with source and actual rendering together. [Default native gallery](docs/evaluations/celestial-chakra-2026-10-06/native-preview.png) and [enlarged English](docs/evaluations/celestial-chakra-2026-10-06/enlarged-english-preview.png) show the integrated states. A SpringBoard frame captured while a reinstall was occurring was discarded; it was not used as evidence.

**Checks and limits.** Final complete `npm test` passes with 2,946 tests, 227 UI suites / 2,105 UI tests, and typecheck. Node24 hit two V8 GC crashes; the same complete gate passed with existing Node25.9.0, without dependency changes. Changed-source lint has zero errors and 49 existing warnings (baseline Panchang: 50). The final Release build/install has zero errors/warnings. Native smoke and enlarged English flows both pass: the decorated Home header opens Panchang, all modes switch, Create Kundali opens the original birth form, and Back returns. The first smoke's wrong Rashifal selector was corrected and rerun; it is not counted as a pass. Asset hash/dimension/transparency/bounds/budget checks and touch/accessibility isolation pass.

The two PNGs total 274,392 bytes; a controlled final iOS Hermes export adds 274,975 bytes (~0.275 decimal MB) over the prior icon branch. Whole PR increase: 2,572,047 bytes (~2.57 MB) over the recorded main baseline. These are bundled-content deltas; compressed App Store/IPA/APK download delta remains unmeasured. Details and prompts: [evaluation report](docs/evaluations/celestial-chakra-2026-10-06/README.md). Android, tablets/rotation for these new placements, other languages, largest text, physical-device ergonomics and full screen-reader traversal remain unverified. Earlier icon-device evidence stays separate. No merge/OTA/store publication.

- [x] Implement all three exact selected placement roles using local raster assets.
- [x] Preserve native screen structure, live copy, controls and theme.
- [x] Keep art contained, centered, non-interactive and accessibility-hidden.
- [x] Fix the first visibility finding; capture and inspect combined comparisons again.
- [x] Record provenance, installed hashes, passing unit/native gates and measured size.

final result: passed
