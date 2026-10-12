# Native icon size review — current audit capture notes

Build: merged branch b8862fea, Release, version 1.4.9 (69), iOS 26.5. Captures below are from this audit run, not the old prototype. All accepted captures were inspected. This review does not claim full accessibility compliance.

## Step 1 — 402dp phone, Home upper grid — good artwork sizing; follow-ups

Accepted `01-phone-402-home-upper.png`: fully rendered Home with first three category rows. Art is clear, centered consistently and unstretched; Kundali and Muhurat filled NEW pills sit inside tiles. The 62.7dp square image has about 53dp visible subject height within 72dp tiles. Columns use `(width - 2*24 - 2*10)/3`, giving 111.33dp tiles at 402dp screen width. No horizontal clipping in the grid. Captions sit outside the image tile inside the same Pressable, so the icon canvas is not the touch target.

Readability: NEW and bottom-tab labels are 10pt in code, below Apple's generic 11pt advice. New remains included in the launcher accessibility label. Existing floating Search control overlaps part of the bottom-right Sanskar illustration at this scroll position; scrolling can reveal the item, but the visible overlay is a layout follow-up. Screenshots cannot establish VoiceOver usability or effective hitSlop extents.

## Step 2 — Reader controls — visually good; touch-target risk

Accepted `02-phone-402-reader.png`: stable Hanuman verse 1, bookmark and share visible, utility ink consistent, back arrow clear. Bookmark add/remove passed and restored its original state. The 20–22dp utility symbols are appropriate inside circular controls; they do not need to grow to the category illustration size. Bookmark/share visible circles remain 34dp with 8dp between them. The parent clipping rule makes their 12dp hitSlop an unreliable way to meet a minimum 44pt target. Recommend a real 48×48dp Pressable wrapper while keeping the 34dp visible circle and 20/21dp artwork.

## Step 3 — More utility rows — good

Accepted `03-phone-402-more.png`: current main's Home relocation is preserved; no old Kids Stories row is reintroduced. Utility symbols have consistent ink and center within their compact backgrounds, with row labels and chevrons aligned. Large enclosing rows provide generous targets. The same 10pt tab label risk applies here. Profile totals are existing simulator data and are not part of the icon audit.

## Steps 4–6 — Home lower, deity list, kids-story shelves — good

Accepted `04-phone-402-home-lower.png`: remaining grid subjects are centered, Daan retains its full-width tile and centered illustration; the new Stories for Kids Home section is intact. The Search overlay covers a corner of the card at this position, but not its title or primary CTA.

Accepted `05-phone-402-deities.png`: compact deity attributes remain centered in the original thumbnail circles. Rama/Krishna/Vishnu are distinct and readable. Their enclosing card rows provide the target; these attributes need not use the larger Home scale.

Accepted `06-phone-402-kids-shelves.png`: all three upstream shelves render with the shared deity art, title, subtitle, count/coming state and trailing arrow aligned. Empty Ganesha/Hanuman shelf states are upstream content, not an icon regression. These captures verify visible rendering and navigation, not complete screen-reader behavior.

## Steps 7–8 — Panchang and Bhajan — good visible icon consumers

Accepted `07-phone-402-panchang.png`: back/forward date controls, location and Muhurat symbols remain distinct and aligned, and the new Panchang tab silhouette uses the active tint. Content has existing horizontal chip scrolling; clipped date/time copy is outside this icon review.

Accepted `08-phone-402-bhajan.png`: deity attributes and track thumbnails share the registry. The filter rail is deliberately horizontally scrollable, with the next Shiva filter partially visible as a scroll cue. Painted attributes keep their own pigments while utility play controls use the common utility ink. The new active music tab retains the original filled note. Tab target dimensions were checked in the native hierarchy separately.

Merged-main native smoke completed successfully after removing the redundant center step: Home → Chalisa → Hanuman reader, bookmark add/remove, More, By Deity, current Home Kids Stories → three deity shelves, Panchang, Bhajan, Search → reader → Home. Log: `/tmp/vedansh-icons-pr-native-retry.log`.

## Steps 9–11 — Compact phone 375×667dp — good normal-size artwork; overlap follow-up

Accepted `09-compact-home-top.png` and `10-compact-home-upper.png`: raw 750×1334px at 2×, aspect ratio 1.779:1 (16:9). The latter repeats the first viewport because Chalisa was already visible; it is retained as the exact captured state, not represented as a different scroll position. Category columns fit without horizontal overflow and the first two rows' artwork retains the same size/proportions as the 402dp phone. The next row naturally requires scrolling on this shorter screen. The Search FAB overlaps Vrat's top-right illustration at this position.

Accepted `11-compact-home-lower.png`: normal caption sizes, last category row, full-width Daan and current Home Kids Stories are readable and within horizontal screen bounds. The top of a preceding row is cut by the viewport because it is being scrolled; this is expected, not asset clipping. The Search FAB overlays the Discover card at the bottom. This run did not yet capture the compact Kundali/Muhurat pills; a focused middle-row capture follows.

## Step 12 — Compact phone NEW middle row — good normal-size clearance

Accepted `12-compact-home-new.png`: at 375dp width, Kundali/Muhurat remain centered in 102.33dp wide tiles; both filled pills are wholly inside and clear of the subject. The pill text is readable at normal scaling but remains 10pt, so the standards finding stands. A baseline pill screenshot is now captured before changing the temporary device's Dynamic Type setting.

## Steps 13–16 — Large phone 440×956dp — good artwork scale

Accepted `13-large-home-top.png`: raw 1320×2868px at 3×, aspect ratio 2.173:1. `14-large-home-upper.png` was checked pixel-identical to the inspected top image. Artwork remains at the same logical size, while the tile expands to 124dp wide. The NEW pills are fully inside Kundali/Muhurat and captions fit. More rows fit vertically than on the compact phone; there is no reason to scale the illustration with screen height.

Accepted `15-large-home-lower.png` and `16-large-grid-overview.png`: full-width Daan stays centered, newer Kids Stories card is preserved, and lower category art has balanced padding. The overview intentionally retains the real scrolled viewport with part of the first row above the safe-area boundary; it is not presented as an all-sixteen-in-one-view proof. Search overlaps content at the bottom in both states, consistent with the existing floating-control issue.

## Steps 17–19 — iPad mini portrait 744×1133dp — readable art, inefficient spacing

Accepted `17-tablet-home-top.png`: raw 1488×2266px at 2×. `18-tablet-home-upper.png` is pixel-identical to the inspected top image. The same 53dp subject is readable without distortion, but three 225.33dp-wide tiles leave excessive horizontal empty space. `19-tablet-home-lower.png` is also the same viewport because Daan was already visible. The artwork does not need proportional enlargement; the grid needs a deliberate tablet width/column policy. The closing Daan caption sits beyond this viewport, so scrolling remains necessary.

## Steps 20–21 — iPad mini landscape 1133×744dp — layout issue

Accepted `20-tablet-landscape-upper.png` and `21-tablet-landscape-lower.png`, viewed with PNG EXIF orientation applied (raw stored pixels 1488×2266, EXIF=8, displayed 2266×1488 at 2×). The device actually rotated; these are not stretched portrait shots. Native flex wrapping now places four portrait-sized tiles per row, leaving a large empty area on the right. Daan retains its old approximately 696dp span and no longer fills the wide grid. This follows `Dimensions.get('window').width` in HomeScreen, which does not itself subscribe the component to orientation changes. Recommend `useWindowDimensions()` plus a defined tablet grid/maximum content width and a full-width span based on that grid, rather than increasing icon size to fill empty tiles.

The retry completed all portrait/landscape captures and restored portrait. Only temporary devices created for this audit were shut down and removed; the original QA simulator was retained.

## Steps 22–23 — Compact phone at accessibility-medium Dynamic Type — needs improvement

Accepted `22-compact-accessibility-upper.png`: iOS setting confirmed `accessibility-medium`. The painted category artwork stays at the same logical size. The original text-based Om brand marks visibly crowd/clip their fixed circle boxes, and FOR TODAY's one-line recommendation titles ellipsize heavily. These are existing fixed-layout/scalable-text interactions, rather than a reason to shrink every illustration.

Accepted `23-compact-accessibility-new.png`: the category captions are visibly larger and fit the displayed Hindi names at this level, but the NEW text/pill grows over the upper-right Kundali frame and Muhurat pointer. It remains inside the tile, so normal-size containment alone is insufficient. Recommend giving larger-text layouts a separate status/caption line or reserved badge area, without shifting the illustration center. Test label wrapping in the other supported languages before declaring large-text support complete. Bottom-tab text stays small at the enlarged system setting.

## Guidance and code measurements

Apple's UI Design Dos and Don'ts recommends a minimum 44×44pt hit target, text of at least 11pt, high-resolution imagery and preserving image aspect ratio: https://developer.apple.com/design/tips/ . Android recommends 48×48dp interactive targets: https://developer.android.com/guide/topics/ui/accessibility/apps . These targets apply to the enclosing interactive control, not the painted subject. No platform-wide maximum category-illustration size or fixed screen-height percentage is specified in these sources.

The artwork uses square 512px assets and `resizeMode="contain"`, preserving proportions. At 3× density the 62.7dp image requests about 188px, below the supplied 512px resolution. At 375/402/440dp phone widths, source-derived tile widths are 102.33/111.33/124dp, all at 72dp tile height plus the caption area. This is a width-responsive, vertically scrolling three-column grid. App configuration is portrait and supports tablets.

The current capture run's native hierarchy at the Chalisa index reports tab targets about 80×53pt at 402dp width, above both numeric benchmarks. Home Search is a 48×48dp Pressable in code. Reader Back is 44×44dp in code (meets Apple, falls below Android's 48dp benchmark). Bookmark/Share circles are 34×34dp with hitSlop 12, but their shared immediate parent is only the circles' height, so nominal 58×58dp cannot be assumed to be the effective touch region. Actual reader frames and enlarged text still need inspection.

Automation note: the first native smoke attempt failed during redundant centering of an already visible Hanuman row; its failure screenshot/hierarchy show that row on screen at [24,138][378,242]. The centerElement step is removed. This attempt is not recorded as a passing walkthrough.

## Color measurements

Calculated from the current theme tokens using sRGB relative luminance: utility ink #6F3F1D on #F8EFD6 is 7.61:1; active icon/label accent #AD571F on that background is 4.40:1. That is sufficient for a non-text icon's 3:1 benchmark, but below the Android guidance of 4.5:1 for small text. Keep the icon accent if desired and use a darker text token for active tab labels. NEW text #8A3E0B against its 16% saffron fill composited over the tile gradient ranges from 4.84:1 to 5.76:1, so its main concern is text size rather than contrast. Source calculations do not certify every rendered theme or state.

## Tablet retry and evidence limitation

The initial tablet flow failed because the app exited to the iPad Home screen; that screenshot is rejected as product audit evidence. Diagnostic report `Vedansh-2026-10-06-130811.ips` records SIGABRT in Expo's `PersistentFileLog.appendTextToFile` / NSFileHandle write. The host had only 244MiB available after creating temporary devices. Relaunch displayed the real app/tour again; completed temporary phone devices were removed before retrying. This is an observed test-environment/app logging failure, not a proven icon-code cause or a repaired native crash.

## Step 24 — 402dp phone full grid — good default-size illustration treatment

Accepted `24-phone-402-grid-overview.png`: all sixteen category illustrations are visible together with consistent centers, original 72dp tiles, 62.7dp image canvases and filled NEW pills inside. The Search FAB overlays the empty right edge of Daan at this position, without obscuring its centered subject or caption. The primary QA simulator is left on this actual native grid. No product code was changed as a consequence of the broader size audit; the review findings are follow-ups, not falsely recorded as fixes.
