---
title: Sanatan Parichay
type: subsystem
sources: [mobile/src/data/sanatan-parichay/index.ts, mobile/src/data/sanatan-parichay/store.ts, mobile/src/data/sanatan-parichay/knowledge.ts, mobile/src/data/sanatan-parichay/content.json, mobile/src/screens/SanatanParichayScreen.tsx, mobile/src/screens/SanatanReaderScreen.tsx, mobile/src/components/sanatan/LessonPanels.tsx, mobile/src/components/PagerNavBar.tsx, mobile/src/components/ImageZoomViewer.tsx, mobile/src/components/ReaderPageCounter.tsx]
last_verified_date: 2026-11-19
confidence: high
status: current
---

## Summary

> **Gotcha / update (18 Nov 2026):** the figure page's visual is a **painted teaching
> plate** (R2, prefix `sanatan-learning`), not an SVG schematic. 13 concepts × {hi,en}
> = 26 webp; `lessonArtLang` maps hi+gu→hi plate, en+kn→en plate. `ExploreDiagram`
> now renders `LessonArt` (CachedArtwork) + one caption line; `TenDirectionsDiagram`
> and `ConceptFigures` were removed. Manifest `lessonArtManifest.json` is the R2
> upload allowlist (`.github/workflows/r2-upload.yml`, dry-run on PRs).

Thirteen approved editorial introductions form a question-led learning journey.
Each has three Hindi/English paragraphs, a topic-specific visual explanation,
one approved painted scene and internal review provenance. This is a native
subset of research PR #605, not the full 201-topic catalogue.

## Details

Home lazily mounts `SanatanHomeCard`; `SanatanParichay` is the hub only (the
collection overview and its `topicId` param were removed on 19 Nov 2026 — see the
last section). A card opens `SanatanReader` directly; Back returns to the hub with
its query and filter intact. `SanatanReader` validates IDs and page bounds. Global Search lazily adds
up to three deterministic matching lessons. All routes live in the Home stack.

The reader uses the shared header, progress, prose, read-aloud, auto-slide and
share components. Diagrams keep selected-source variants separate. Share uses
complete authored pages plus the lesson definitions, takeaway and visual rosters,
without bibliography or saved state.
The language helper derives Gujarati/Kannada script from Hindi prose.

`@vedansh/sanatan-learning-v1` is independent of existing bookmarks/progress.
The store validates IDs/pages, deduplicates records, hydrates before mutation,
serializes writes and preserves the last durable snapshot on failure. Opening
records resume only; forward turns record the previous page; Finish records the
final page and clears resume. Existing stores are not migrated or cleared.

`artwork.ts` maps thirteen 960×640 WebP exports. The same 3:2 scene serves every
collection thumbnail and banner. Home references only one image. Research references stay internal; there is no source action, modal or share appendix.

## Dependencies

[[subsystems/readers]], [[concepts/languages]], [[integrations/reading-artwork]]. See RULEBOOK §§11.16/32,
design.md §87 and `docs/content-parity/sanatan-parichay/native-verification.md`.

## Gotchas

Do not expose unfinished research seeds, turn bibliography into external links,
merge Dashavatara source variants, count opening as completion, or replace a
missing topic with another deity. Bundled painted gallery assets do not establish
device rendering or native share success. The PR remains draft until those gates
are executed. Detailed image-generation prompt files are excluded from GitHub;
the approved Site retains the masters.


## Native image sizing regression — 6 November 2026

Bare Image aspectRatio retained the bundled 640pt intrinsic height. Home and all
Sanatan painting callers now use `FramedPainting`, following the existing Jyotish
frame pattern. Its View owns 3:2/81×54 layout; the absolute Image overrides both
dimensions to 100%. The production AST guard also found CatalogBackground's
absoluteFill-only Image; both percentages are now explicit there too.

RULEBOOK §11.17 requires geometry regression tests and actual device screenshots.
The native Yoga harness reproduces the old sizing error and verifies corrected
constraints across fractional widths/densities. This is layout-engine evidence,
not installed-screen visual QA. Do not mark device acceptance passed from it.


## Public research boundary — 6 November 2026

RULEBOOK §11.16 supersedes prior public-source-display descriptions above.
Research bibliographies, publisher/verification notes and source actions stay
internal; meaningful scripture identities, poet attribution and real related
in-app reading links remain. See `docs/reviews/2026-11-06-content-source-ui.md`
for the audited callers, preserved provenance and separate native acceptance.


## Swastika lesson expansion — 8 November 2026

`symbols` retains three pages and existing save/resume IDs. The authored lesson
now explains auspicious use, each purushartha, other interpretations and a
clockwise drawing exercise. `SwastikaGuide` supplies the second-page meaning
schematic and third-page cross → four bends → optional dots sequence. Captions
use shared script/reading tokens; narration and prose shares retain equivalent
full drawing instructions. No universal stroke/finger/dot requirement is claimed.
See `docs/content-parity/sanatan-parichay/swastika-guide.md` for source scope and
pending native/editorial acceptance. This expansion is not a catalogue expansion.


## Visual teaching — 8 November 2026

All 13 introductions now have answers, terms, takeaways and real onward reading
links. Search indexes taught terms/page headings and selects the matching page.
The ten-direction schematic includes the vertical axis, with all ten readable
native controls. Other diagrams distinguish temple spaces, literary forms,
dialogue turns, elements and an illustrative Panchang row. New Ganesha/Tulasi
teaching art is prepared but disabled until user upload and hash verification;
`lessonArtManifest.json` is intentionally empty. Existing collection art remains.
The publication script, source/export ledger and acceptance are in
`docs/content-parity/sanatan-parichay/visual-learning/`. No catalogue expansion or
full native Gujarati/Kannada translation is implied by this UI revision.


## Shared-component rebuild — 19 November 2026

The section no longer has a look of its own (RULEBOOK §32 "Shared-component
contract", design.md §87/§93/§94).

- **Hub.** `ListingCard` rows on the shared listing frame: eyebrow `परिचय N`
  (sequence only), title = lesson title, description = collection name (the
  32-character line cannot hold most questions), meta = page count, progress from
  `learning.read`, a 4:5 `ListingThumbImage` with a per-collection `focusX`
  (`sanatanThumbFocus`). Search uses `searchSanatanMatches`, so a hit opens the
  matched page. The header bookmark is the saved-only filter.
- **Reader.** `PagerNavBar` is fixed under the pages (previous / dots / next; the
  last page's next is the Finish tick). The shared `BookmarkButton` and
  `ShareButton` sit at the top of every page. The counter is the shared
  `ReaderPageCounter` with the lesson's page names, so the picker lists
  "1 · <page title>" rows ([[subsystems/readers]]).
- **Pictures.** `ZoomableArtwork` wraps the opening painting and the teaching
  plate; both open `ImageZoomViewer` (RN `Modal` + `PanResponder` + `Animated`, no
  gesture-handler; pinch, drag, double-tap, +/− buttons; geometry is pure in
  `utils/imageZoom.ts`). The plate runs edge to edge. `getSanatanLegend(id)`
  repeats a plate's painted names as native text for the five lessons with an
  authored roster (dikpal, thirty, graha, forms, elements); the other eight have
  zoom only.
- **33-devata lesson.** Page 1 now opens with koti = kind/class, not crore, then
  the Upanishad's count; the owner asked that this not wait for page 3. `refs`
  gained `KOTI-APTE` (Apte senses 6 and 9), which the provenance file already held.
  Page 3 still says the passage itself does not use the word.

Gotchas: the question lives in the page-1 "सरल उत्तर" card, not on the hub card.
`sanatan-page-N` and `sanatan-start` test IDs are gone; flows use the card, the
fixed `sanatan-next`, and `sanatan-page-counter`. The viewer's zoom readout is
labelled "Zoom 1×" for accessibility, so flows assert that string, not "1×".

