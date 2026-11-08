---
title: Sanatan Parichay
type: subsystem
sources: [mobile/src/data/sanatan-parichay/index.ts, mobile/src/data/sanatan-parichay/store.ts, mobile/src/screens/SanatanParichayScreen.tsx, mobile/src/screens/SanatanReaderScreen.tsx]
last_verified_date: 2026-11-08
confidence: high
status: current
---

## Summary

Thirteen approved editorial introductions form a question-led learning journey.
Each has three Hindi/English paragraphs, a topic-specific visual explanation,
one approved painted scene and internal review provenance. This is a native
subset of research PR #605, not the full 201-topic catalogue.

## Details

Home lazily mounts `SanatanHomeCard`; `SanatanParichay` is the hub or a collection
overview depending on `topicId`. Push a collection to preserve hub query/filter
on Back. `SanatanReader` validates IDs and page bounds. Global Search lazily adds
up to three deterministic matching lessons. All routes live in the Home stack.

The reader uses the shared header, progress, prose, read-aloud, auto-slide and
share components. Diagrams keep selected-source variants separate. Share uses
authored introductory paragraphs without bibliography or saved state.
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


## Customs learning integration — 8 November 2026

The hub now owns the Pratha/ऐसा क्यों? collection and searches its verified
questions alongside introductions. Tulasi overview and final page link to K6;
longer narratives retain one owner. Pratha has no separate Home/More door.
Its routes also mount locally on Panchang for contextual Vrat/month entry.
All existing Sanatan IDs, saved filters and progress storage remain unchanged.
See [[subsystems/pratha]], RULEBOOK §34 and design.md §87.
