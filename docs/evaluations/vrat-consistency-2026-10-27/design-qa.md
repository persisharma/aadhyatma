# Vrat reference and consistency QA

final result: passed

Scope: illustrated Vrat browsing, shared cards, Katha integration, My Vrat, clipping and complete rule artwork assignments on the checked iOS viewport. Platform gaps are listed below; this is not cross-platform release acceptance.

## Source and normalization

- Source: `/Users/prashant/Downloads/Vedansh Vrat & Parv Landing Page.png` (852×1846) and `/Users/prashant/Downloads/Illustrated Vrat Calendar with Starred Favorites.png` (853×1844).
- Implementation: native screenshots in this folder, 1206×2622 at 3×, 402×874pt. Reference and native images are normalized to 402px width without changing aspect ratio.
- State: Hindi catalog/list with matching initial Karwa/Ganesh/Ahoi sequence; real date is 27 October, while the mock is dated 26 October. Today is therefore absent in the current date's landing. Saved states and current countdowns differ intentionally.
- Combined inputs: `comparison-landing.png` (Upcoming/category regions) and `comparison-list.png` (full views). `preview.png` shows landing, My Vrat and Katha together.

## Resolved findings

- P1: Katha's missing artwork mapping. Replaced untyped `sanskar` with typed `granth`, a bundled scripture painting, and corrected detail reading/vidhi doors.
- P1: My Vrat/Katha/search retained another design. They now use the actual shared Kids Stories listing shell and reference-derived paper; reminder/open/unfollow remain separate controls.
- P1: Fixed/zero-basis calendar copy clipped long or enlarged content. Calendar open targets and Upcoming bodies now grow intrinsically. Search fields and the empty state grow/scroll.
- P2: Upcoming art/action arrangement differed from the mock. The reviewed 112×74 image sits beside the save star inside a 158pt tile. All unique crops were inspected.
- P2: Poster crops, neutral symbols and split subject strips drifted from the illustration style. Eight scenes plus 26 bundled small copies give all 200 assignments actual painted art; the UI paper restores the supplied edge treatment.
- P2: List selected chips differed from the supplied maroon state. They now use the landing's catalogAccent token.

## Five fidelity surfaces

- Typography: existing script-aware Hindi/Latin faces retained. Titles, captions, dates, countdowns and notices wrap. System XXXL Katha includes a long two-line title; My Vrat and reminders were inspected enlarged. Normal and two-action rows keep separate minimum heights.
- Spacing/layout: measured image/action arrangement, consistent listing surfaces, dynamic row height, 44pt sibling targets, full-width categories at enlarged system text. Partial edge cards in horizontal rails are intentional scroll affordances.
- Color: pale parchment and faint ornaments follow the supplied visual source; maroon active filters match the landing. The existing Kids Stories gold card surface is deliberately reused, per the user's instruction.
- Images: all 200 assignments and all unique Upcoming crops inspected, plus representative native routes. Complete new Ahoi/Tulsi/Siddhidatri paintings and coherent composite scenes replace unsuitable crops. No calendar card resolves through the old symbolic system.
- Copy/content: complete authored names and descriptions retained. Calendar dates/counts remain engine-derived. No new ritual prose or scripture quotation was introduced.

## Accepted differences and limits

Native safe-area/status-bar geometry and 44pt touch minimums are preserved, so full-view header density and visible row count differ from the illustration. Art reuses approved paintings rather than duplicating every prototype painting. The shared Kids Stories card color remains. Minor ornamental header/lotus refinements are P3 follow-up polish.

No open P0/P1/P2 issues were observed in the scoped comparisons. Android, physical-device/VoiceOver, smallest-phone and followed-muhurat native verification remain pending. The current native report does not claim a manual tap-through of all 200 rules.
