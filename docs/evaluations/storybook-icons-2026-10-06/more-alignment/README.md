# More: painted icon family and shared alignment

User review identified both positioning and style/size drift in More after the native sizing follow-up. The previous More rows mixed 23dp Phosphor outlines with 36dp painted category subjects. The profile used a 52dp-wide column beside the rows' 38dp column, putting its icon center 7dp to the right and its label start 14dp to the right.

## Implementation

- Every settings row uses `MoreIcon`: a 30dp transparent image in the existing non-shrinking, centered 38dp tile. At 432/512 visible bounds, subjects occupy about 25dp; different aspect ratios retain their proportions.
- The profile keeps its 52dp decorative disc inside a 38dp column. Its Om is 32dp. Its center and text start now match the list rows while its hero row retains its height at normal text.
- The bell, antique alarm clock and heart-bearing saved ribbon follow the painted settings subjects in the selected Option 1 board. Thirteen other utility subjects extend that warm ochre/brass/brown family. Remembrance reuses the painted lotus, Vastu the existing compass, and Daan the existing offering bowl.
- Row copy is constrained between the fixed icon and chevron columns. At normal text, long values have a 60% width ceiling. Above system fontScale 1.2, labels wrap and values sit below them at full column width; the profile summary also wraps. This prevents long English settings values from hiding labels or pushing the chevron outside the list.
- Route names, row order, accessible labels, callbacks and settings sheets remain unchanged. Chevrons retain the shared navigation glyph and `iconInk`.

## Artwork provenance

The **built-in image_gen** tool generated each of the 16 new assets separately on a transparent background, using the approved `selected-storybook-reference.png` as the style reference. Bell/alarm/saved are reference-subject reconstructions; the remaining thirteen are new semantic drawings in that family. They are not literal crops or claimed pixel-identical copies.

Shipped PNGs and the exact prompt set are under [`mobile/assets/icons/more-storybook`](../../../../mobile/assets/icons/more-storybook/). Its `manifest.json` records the source-reference hash, generated-master hashes, shipped-file hashes, dimensions, visible bounds and each final prompt. Packaging matches the Home assets: 512px square, 256-color alpha palette, longest visible dimension 432px, centered transparent margins, alpha below 8 cleared. Pigments are not tinted in the app.

The sixteen new PNGs total **648,489 bytes**. The unchanged 39 Home/deity PNGs total 1,467,840 bytes; all 55 shipped PNGs total 2,116,329 bytes. The asset contract checks the More registry, manifest/file hashes, square dimensions, alpha, centered bounds and a separate 750,000-byte budget.

## Native evidence

Before captures are from the installed Release build at `65bbfa72`, 402×874pt / 1206×2622px, Hindi/light, normal system text size. The capture flow covers the top, middle and bottom of the same More scroll. Final native captures use the same device and include Hindi/English at normal and accessibility-medium text. The older enlarged English attempt is retained under `iterations/`: its long read-aloud value displaced the chevron, prompting the final copy reflow.

- [All three More groups after the correction](more-preview.png), [normal before/after](before-after.png), and [enlarged English before/after the copy reflow](enlarged-before-after.png).
- Raw final PNGs: `after-top.png`, `after-middle.png`, `after-bottom.png`, `after-info.png`, `after-english-top.png`; enlarged captures: `after-enlarged-top.png`, `after-enlarged-practice.png`, `after-enlarged-english-app.png`, `after-enlarged-english-top.png`, `after-enlarged-english-info.png`.
- [The sixteen new subjects](asset-sheet.png) and [capture hashes, source hashes and density metadata](capture-metadata.json).

Every settings-row illustration is visible across the normal captures. The profile/row icon centers and label starts align, and chevrons retain their fixed column. Enlarged English shows the full Read Aloud label/value, full profile summary, and wrapped Instagram/About labels without displacing icons or arrows. Increased row heights change scroll offsets; before/after sheets preserve each full native frame at logical-point density rather than repositioning rows or repainting the UI.

## Validation and limits

- The final full `npm test` gate passed: **2,942 tests**, including **226 UI suites / 2,101 UI tests**, plus typecheck. The two focused More/asset suites (**14 tests**) and changed-source lint also passed after the final copy reflow.
- The final iOS Release build/install passed with **zero errors and warnings**, version 1.4.9 (69). Earlier build warnings were pre-existing; the latest build is the one used for final captures.
- Both final Maestro flows passed on that installed build. Normal text checks profile navigation, the language picker and the About sheet, plus the three More groups. Enlarged text checks Hindi/English copy and restores Hindi and normal text afterward. Share, rating, Instagram and report actions were not triggered.
- The initial existing `more-smoke.yaml` attempt failed because it awaited the off-screen Language row before scrolling. Its entry wait now targets the visible profile, followed by the existing Language scroll. The final rerun passed, including the profile's Lifetime/Monthly/Daily controls and disclaimer content/close. Failed attempts are not counted as passing native evidence.
- The normal layout retains one-line settings labels/values, including the existing Instagram ellipsis; full accessible labels remain unchanged. Enlarged text wraps the full copy.

This More follow-up was inspected on the 402×874pt iOS simulator. The prior multi-phone/iPad evidence covers the earlier Home/reader sizing implementation, not a new More matrix. Android, physical-device ergonomics, full screen-reader navigation, Gujarati/Kannada widths and the largest Dynamic Type setting remain unverified. No merge, OTA or store publication.
