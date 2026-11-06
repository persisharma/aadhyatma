# Sanatan Parichay native integration

Approved reference: Site `appgprj_6ae948c65bdc81918c94293b69719cba`, source
`e4a01fe0fac7b9637fa71e536d76612fa0c39c1c`. The maintainer approved the consistent
Kundli-style painted scene family and asked to build it on 5 November 2026.
Research background is draft PR #605. Native implementation is draft PR #622.

## Delivered scope

One Home door opens a question-led hub with search, saved lessons, exact-page
resume, a Swastika feature, “Ever wondered?” directions/33-devata cards, collection
filters and 13 introductions. A collection opens a three-part reader: introduction,
visual explanation, context and variations. Back preserves the hub query/filter.
Global Search can open an exact lesson. Unknown IDs show an unavailable state.

The 13 collections cover foundations; Ganesha as a divine form; thirty-three
devata; Dikpals; Navagraha; Swastika; Dashavatara; Tulasi; elements; time/Panchang;
text classes; temple spaces; and Gargi's dialogue. These are the approved short
editorial introductions: 39 bilingual paragraphs, not 201 finished research articles.
Unfinished research seeds, follow-up questions, new ritual instructions and new
liturgical text are outside this implementation.

Diagrams keep distinctions visible: eight compass directions plus above/below in
the selected Kamika Agama source, the 8+11+12+1+1 grouping of Brihadaranyaka 3.9,
separate Drik Panchang/Jayadeva Dashavatara selections, and Rahu/Ketu as orbital
nodes with a distinct devotional identity. Diagrams are educational schematics.

## Shared app behaviour

Uses lazy Home stack routes, the existing first-tap/drag helpers, ReaderHeader,
LanguageToggle, ReadingProgressBar, ProseReadingCard, ProseParagraph, parchment,
script/font tokens, read-aloud/auto-slide controller and branded prose share flow.
There is no additional bottom tab. All four reading scripts use the established
language conversion; Gujarati/Kannada are script renderings of the Hindi prose,
not newly authored translations. Actual glyph/layout QA remains a native gate.

Learning has a separate versioned AsyncStorage key. Hydration precedes mutations,
writes serialize, invalid IDs/pages are dropped, and failed writes preserve prior
state. Opening only records a resume position. Forward turns record the page left;
explicit Finish records the final page and clears resume. Saving uses stable IDs.

Sources are text/edition/location credits with no links or browser actions. Research
URLs remain in `source-provenance.json`, outside the mobile module graph. The
shared content gate validates this original prose's authorship and source graph;
it does not falsely classify it as collated scripture.

## Artwork

Thirteen approved 960×640 WebP scenes, 3,043,518 bytes total, are bundled following
the current Jyotish landing gallery pattern. Each collection uses the same 3:2 crop
for its thumbnail and banner. The Home card references one painting; the full
registry is loaded with learning/Search. No new generated artwork, mixed icon
fallbacks, arbitrary remote URLs or fictional CDN publication are introduced.
`artwork.json` records dimensions, paths and hashes; the approved Site retains
the source masters. Exported native images are the approved paintings.

The detailed generation prompt documents were excluded from GitHub after automatic
approval review rejected publishing prompts and local workspace paths. They are
not runtime dependencies. This does not block the approved artwork integration.

## Verification and delivery

See `native-verification.md`. Device rendering, cold-start journeys, live playback,
actual native share exports and the complete language/size/platform matrix must
pass before marking #622 ready. This work does not merge, release, bump versions,
publish an OTA or submit a store build.
