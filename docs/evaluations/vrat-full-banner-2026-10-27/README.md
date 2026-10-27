# Upcoming full-width banners

The previous layout explicitly fixed the painting at110pt inside a155pt card, leaving a blank column under the save star. The user's latest clarification requests a banner spanning the card's inner width with the star over it. This supersedes the earlier image-beside-star interpretation of the original mockup.

The banner is now141×72pt:155pt minus two1pt borders and two6pt inner paddings. `ListingCard` and `ObservancePreviewCard` share those dimensions through constants, so the painting and mask cannot drift. The existing28pt visible star stays inside an independent44pt sibling touch target over the top-right of the image. Titles and date/countdown rows still grow intrinsically. Other card styles and artwork files are unchanged.

`comparison-banner.png` combines the previous published native capture with the revised capture in the same Hindi/date/viewport/scroll state. `preview.png` is a direct crop of the revised native screenshot. First/middle/last screenshots show all six Upcoming cards at normal and systemXXXL sizes. These are actual iOS26.5 captures on iPhone17Pro,402×874pt at3× (1206×2622px), from the dedicated checkout on port8542.

Native save→stay on catalog, open→detail, back→unfollow passed. One initial attempt assumed the carousel had returned to its first card after coordinate swipes; restarting from its known initial state fixed the automation, and the complete interaction path passed. No application change was needed for that test setup. Test follow removed; normal system text restored.

TypeScript passed,33 existing focused tests across four suites passed, changed-file lint had no errors or warnings, and diff whitespace checks passed. The prior complete suite/CI at b71ff09c passed before this small geometry change. Android remains unverified.

Artwork/palette provenance remains in `../vrat-palette-layout-2026-10-27/`. No new images were generated and no release/OTA/CDN publication was performed.
