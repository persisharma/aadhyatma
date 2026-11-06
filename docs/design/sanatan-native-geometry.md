# Sanatan native presentation contract

Approved design reference: Site appgprj_6ae948c65bdc81918c94293b69719cba at e4a01fe0fac7b9637fa71e536d76612fa0c39c1c, Option B. Repository rules: RULEBOOK §§11.17–11.18 and design.md §87.

## Implemented correction

- FramedPainting owns a 3:2 landscape or 81×54 thumbnail View. Its absolute Image explicitly sets both dimensions to 100%; intrinsic source pixels cannot determine card height.
- Home is a compact horizontal text/painting entry. The existing tap/drag callbacks are preserved.
- CollectionCard reuses ListingCardFrame with the approved landscape artwork slots, rather than the story-specific portrait crop. Feature, paired discovery and grouped thumbnail rows share one painting family. Compact screens and large system-font settings stack the discovery pair; labels grow without truncation.
- The hub uses ListingSectionHeader, TextField, ReaderHeader, native typography and AppIcon controls. The reader retains ProseReadingCard, paragraph typography, language, audio, auto-slide and sharing infrastructure.
- Revised three-page lessons use subject-specific headings and separate paragraphs. IDs and saved/resume indexes remain stable. See the reading-readiness record for thirteen authored introductions versus the wider 201-topic research index.

Shared main-branch typography changes in #625 are retained; new Indic heading/button leading covers the bundled faces. Correcting code does not establish installed-device fidelity.

## Evidence and acceptance

AST and component/native Yoga regressions guard the known image sizing failure. A browser harness mounts actual native components for supplemental layout inspection; its platform adapters do not prove native image/font rendering, audio, sharing or lifecycle behaviour.

Before visual acceptance, open Home, hub, collection and every reading context on iOS and Android. Record actual image/frame bounds and screenshots for Hindi, English, Gujarati and Kannada, Standard/Large, compact screens and enlarged OS text. Confirm the complete composition, 3:2 landscape ratio, 81×54 thumbnails, reachable copy/actions, glyph marks, scrolling, saved/resume and Back behaviour. Run the Sanatan Maestro journeys against the exact branch bundle.

Native visual and independent editorial acceptance remain pending, keeping PR #624 draft. No merge, native build, OTA or release is performed. Tested source head, remote checkpoint and CI status are recorded in the review and PR.

Automatic approval review blocked whole-file rewriting of large design/history documents. This scoped companion records the correction; the Rulebook was updated against verified existing-file SHAs. Main's independent design/history changes remain preserved. Never clean the sole copy of unfinished work or evidence.
