# Vrat palette and card proportions QA

final result: passed

Scope: current illustrated Vrat landing/Upcoming/ledger, shared calendar surfaces and palette follow-up. This is iOS design verification, not cross-platform release acceptance.

## Comparison inputs and state

- Source visual truth: `../vrat-reference-rebuild-2026-10-26/references/landing.png` (852×1846) and `list.png` (853×1844), originally the user's two full mockups in Downloads. `references/prototype-upcoming.png` and `prototype-ledger.png` retain focused source regions.
- Rendered implementation: `native-first.png`, `native-middle.png`, `native-last.png`, `native-hindi-vrat-list.png`, `native-katha.png`, `native-english-my-vrat.png`, `native-english-empty-my-vrat.png`, English Standard and systemXXXL first/middle/last captures.
- Viewport: actual iOS26.5/iPhone17Pro,402×874pt at3×; native PNGs1206×2622. Full-view comparisons normalize both images to402px width with aspect preserved. Focused comparisons crop the original3× native pixels before downsampling, avoiding blurred upsampling. `layout-measurements.json` records reference→native content-width scaling (790px→374pt).
- State: same initial Karwa/Ganesh/Ahoi order and Hindi list. Prototype date26Oct/countdown3days differs from current27Oct/countdown2days. Quiet current date has no Today event. Prototype favorites/location differ from test state. Native safe areas, canonical ReaderHeader and global navigation remain app-owned.
- Combined full views: `comparison-full.png`, `comparison-list.png`, `comparison-native-before-after.png`. Focused side-by-side inputs: `comparison-upcoming.png`, `comparison-ledger.png`. All were opened and visually compared. Palette comparison: `palette-before-after.jpg`; all68 source paintings viewed on `palette-all-1.jpg` through `palette-all-3.jpg`.

## Iterations and resolved findings

1. [P2, fixed] Artwork identity/style was checked without catching saturation differences. Karwa puja/ritual, Ahoi, Bal Krishna, Jivitputrika and Dasha Mata were noticeably brighter/glossier than reused paintings. Built-in Image Gen color/rendering edits preserve subjects and composition with matte reds/greens/gold. Original inputs retained. Six before/after pairs and final all-art sheets show the correction; final native Karwa/Ahoi/Krishna rows and tiles show integration.
2. [P2, fixed] Upcoming's older full-width image/overlaid large star changed the source composition. Tiles now155pt, illustration110×72, visible star28pt beside the art inside an independent44pt target; rail gap6pt. Direct normalized comparison verifies those proportions.
3. [P2, fixed] Heavy gold/rounding and a clipped rectangular shadow differed from the paper prototype. Calendar tone now cream with14pt corners, shallow elevation and explicit rail shadow padding; default Kids Stories reading tone preserved. Focused comparison and all three rail positions show unclipped shadows.
4. [P1, fixed in the earlier consistency pass, rechecked] Fixed/zero-basis calendar copy clipped long titles and metadata. Intrinsic card height, flexible date/countdown rows and growing ledger retain all copy at Standard and systemXXXL. Janmashtami wraps naturally; dates/countdowns move to another line as needed. No forced one-line truncation was reintroduced.
5. [P2, capture issue, resolved] A separate checkout replaced preview port8084 mid-run, leaving blank image slots in an enlarged English capture. Those images were rejected and retaken from this checkout on dedicated8542. Final evidence contains resolved local paintings and parchment. One early Hindi list capture caught the push transition; it was replaced with a stable direct simulator capture.

## Required fidelity surfaces

- Fonts/typography: existing Noto Serif Devanagari titles/script metadata and Cormorant English captions retain the app's approved font language. Calendar titles now use maroon. Standard and enlarged glyphs, complete long titles, baseline spacing and metadata were read in native captures. Native font metrics add a little height beyond the raster mock; that is accepted to preserve readable Indic copy.
- Spacing/layout: measured155pt/110×72/6pt/14pt geometry, image/star alignment, shallow shadow clearance and roughly73pt Standard ledger checked directly. Cards/ledger grow under large text, while category doors reflow full width. Partial edge cards are the intentional horizontal-scroll affordance; each card becomes fully visible when scrolled.
- Colors/tokens: catalogSurface, catalogBorder, catalogAccent and native parchment are shared throughout calendar surfaces. Default reading cards keep their established theme. Six edited paintings join the muted family while distinct devotional colors remain. Saturation values are advisory, not a numerical acceptance rule.
- Image quality/fidelity: all68 paintings reviewed for subject, composition and consistent medium. Six shipped edits are241,854bytes total and preserve the named figures/ritual objects. Exact prompts/master/input/shipped hashes recorded. Native small paintings are sharp enough at their actual slots; no poster text, symbolic fallback or render-time wash appears.
- Copy/content: titles, bilingual row captions, real dates/countdowns and follows/reminders retained. No authored devotional narratives or calendar calculations changed. The tour's bilingual catalog release note now matches the inherited1.5.5 version contract.

## Interactions and remaining limits

Native follow→My Vrat, open reminders→save, unfollow→empty, return, Katha and Vrat list routes passed. All six Upcoming cards were reached in Hindi/English; enlarged English retains full content and persistent navigation. Test follow removed, Hindi/Standard and normal system text restored. TypeScript,3,781 full-suite tests,46 final focused tests and zero lint errors recorded in `validation.md`.

No actionable P0/P1/P2 issue remains in this scoped comparison. Minor source/native font metrics, the metadata separator treatment, canonical header/safe-area height and global selected-tab treatment remain accepted native-system differences. Android, physical-device/screen-reader and smallest-phone checks remain pending; no claim of cross-platform or pixel-identical release acceptance.


---

## Earlier consistency evaluation (historical)

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


---

# Prior evaluation record

# Vrat reference and shared-listing QA — 26 October 2026

final result: passed

Scope: the authorized Today, Upcoming, category-door and Vrat-list card composition/artwork correction, including reuse of the Kids Stories listing component. This is not a claim that the whole native screen is a pixel-for-pixel recreation of the mock.

## Visual truth and capture

- User-supplied truth: `docs/evaluations/vrat-reference-rebuild-2026-10-26/references/landing.png` and `references/list.png` (landing: 852×1846; list: 853×1844).
- Implementation: `native-standard-landing.png`, `native-standard-upcoming.png`, `native-standard-list.png`, `native-standard-list-lower.png` in that evaluation directory.
- Native device: dedicated iPhone 17 Pro simulator, iOS 26.5, 402×874pt, captured at 3× (1206×2622). Density-normalized comparison inputs use 402px wide copies; source heights are 871px / 869px after proportional normalization. Device chrome and safe-area differences are excluded from card measurements.
- State: 26 October 2026, Ujjain, Purnimant, Hindi, no Vrat followed; supplied mock uses Bengaluru and two selected stars. These location/follow-state differences are intentional; no calendar dates or engine logic were changed.
- Full-view combined evidence: `comparison-landing-final.png`, `comparison-list-final.png`. Focused combined evidence: `comparison-landing-detail.png`, `comparison-list-detail.png`. Source and implementation are placed together in these actual comparison inputs.

## Findings and fixes across iterations

1. [P1, fixed] Upcoming used 80pt square faces inside 184pt-wide tall cards. It now uses the shared `ListingCard` Upcoming variant: 158pt width, 144×72 painting, inline date/countdown and 44pt sibling save target. The supplied mock normalizes to approximately 154×128pt; the implementation is slightly larger because it retains native target sizes and the shared card treatment.
2. [P1, fixed] Event imagery was inferred only from the deity. Karwa Chauth now has separate puja and moon/sieve scenes; Janmashtami has Bal Krishna with makhan. Valmiki Today reuses the existing published scripture scene. Existing generic Gauri/Krishna art remains the fallback for other observances.
3. [P1, fixed] Vrat maintained a private card shell despite the Kids Stories listing contract. `ObservancePreviewCard` now renders `ListingCard` directly. `ListingCardFrame` is the shared surface for Today/category doors. Standard story/comic/reading layout, progress, 92pt / 4:5 thumb and title rules are preserved.
4. [P2, fixed] Tight face crops and a generalized scale calculation cut Ahoi's head. Reader artwork now shows full figures/context, and portrait zoom is applied to height before the cover minimum. Native list captures show Ganesha seated and Ahoi's complete head/subject. Known shared scenes such as Sita–Ram use one painting; unmatched composites use complete miniatures rather than face slices.
5. [P2, fixed] Today placed prose/actions under a small square. It now places a 126×154 painting beside the title/prose/actions. Expansion retains all description text; the reading action remains independent. Native taps verified expansion/collapse and row save/open behavior.
6. [P2, fixed] English category metadata broke “observances” into an orphan last letter. Counts now use concise units (vrats/festivals/fasts), and category doors become full width on narrow windows or fontScale > 1.2. Final `native-english-upcoming.png` and `native-system-xxxl-upcoming.png` show complete labels.

Initial comparisons live in `iterations/01/`; rejected pre-fix English/loading captures live in `iterations/02/`. Final artwork acceptance uses root-level settled Hindi/English captures. Zero-byte screenshot attempts were rejected and replaced. Development-server memory exhaustion caused some transient blank local-art captures; a fresh session supplied the accepted settled captures. No asset was accepted from a blank frame.

## Required fidelity surfaces

- Fonts/typography: existing Noto Serif Indic and Cormorant/Inter families. Calendar titles wrap without clamping; standard story title behavior stays intact. Hindi and English captions/metadata inspected. App Standard/Large and iOS XXXL layouts captured; category text has enough space at enlarged OS size.
- Spacing/layout: square list frames, wide Upcoming frames, smaller visible star circles with 44pt hit areas, inline date/countdown, Today split composition and category vignettes checked in focused comparisons. The ledger gap/line heights were tightened.
- Colors/tokens: shared Kids Stories active-card gradient, border, radius and shadow are intentional per the user's reuse instruction. PR #550's maroon selection and search treatment are retained. Native safe areas and the established navigation/header remain, so the entire mock's above-fold density is not claimed as reproduced.
- Image quality: three generated masters and the 320px square / 480×240 WebPs inspected. Source/shipped hashes, exact prompts and generation paths are retained. New assets total 120,082 bytes. Existing published reader/vidhi scenes and manifests are reused; no reader/story master or story frame was changed.
- Copy/content: no authored religious prose, calendar calculation, dates, rule membership or reading destinations changed. Only English category count units were shortened; full Today prose remains available through expansion.

## Validation and limits

- Complete combined tree: TypeScript and `npm test` pass, 3,778 tests (37 widgets, 2,853 reader/component, 621 engine, 218 data, 49 Ask). After the final category wrapping/copy correction, TypeScript and 28 focused shared-card/list tests pass again.
- Changed-source ESLint: zero errors; PanchangScreen retains existing deferred-import warnings. `git diff --check` passes.
- Native: Hindi Standard/Large, English, iOS XXXL text, Today expansion/collapse, independent save/unfollow and detail opening. Kids Stories' Krishna shelf was opened and captured after the shared-shell refactor (`native-kids-stories-shared-card.png`).
- Pending: Android, physical-device/touch/VoiceOver checks, the smallest phone viewport, and manual artwork review of every catalog entry/composite. No native release, OTA, R2 publication or PR merge is part of this correction.

## Follow-up polish

[P3] Further full-screen mock fidelity would require a separately scoped header/background/ornament density pass. Existing native controls/safe areas and the shared Kids Stories card surface intentionally take precedence in this change.


---

# Full Puja Vidhi image/text review and R2 integration — 21 October 2026

Result: saved-image correspondence review and local R2 integration passed. R2 publication/CDN delivery and a full new native walkthrough remain pending.

- All seven published guides / 106 complete Hindi and English instructions compared with their assigned saved paintings. All 63 selected final WebPs visually inspected in eight contact sheets; all 35 new originals were also inspected during generation/editing.
- Updated images or sequences for 52 steps. Fixed bath-versus-ingredients, durva/upachara, deity-specific and incidental flower reuse, Diwali kheel/batasha, sacred-thread materials, Navratri preparation/layering/installation, Karwa passing/donation, and Shiva personal preparation/offerings.
- Nine two-image sequences pair exact original bilingual clauses with their respective actions or alternatives, before language derivation. All 106 instruction texts and all 12 transcribed mantras remain unchanged.
- Full visual/text gallery: `docs/content-parity/puja-visual-guide/full-review.html`. Per-step observations and depiction limits: `semantic-audit.md` / `step-review.json`. New prompts, retained originals and edit references: `audit-art-prompts.json`. Flower comparison: `flower-review-preview.jpg`.
- Per user instruction, all 63 selected paintings use R2 descriptors and the existing persistent `CachedArtwork` cache; there are no bundled step-painting requires. Manifest-derived contain frames preserve complete canvases. Unavailable images leave neutral paper, full instructions, captions and hand-offs usable. Prepared upload sources total 20.32 MiB.
- Typecheck and focused ESLint passed. Five Jest suites / 72 tests passed, including shared reader artwork and no-bundled-art guards. Five reported pure checks passed, including all-step source/image hashes, deity-specific assignments, conditional caption preservation and existing ritual-content gates. The existing language-provider act warnings remain.
- Local R2 source/manifest verification and staging passed. Upload is intentionally pending for the user's later push. No public-CDN delivery, commit, git push, release, physical-device verification or complete new 106-page native/language walkthrough is claimed. Earlier native screenshots below predate this full audit and the R2 conversion; they are historical evidence, not proof of the new remote bytes.
- Some paintings illustrate named materials or the central act, not every prayer, spoken formula, conditional option or physical movement. Every such boundary is recorded per step. This review does not certify universal religious rules or replace human liturgical/editorial review.

---

# Puja Vidhi — option 3 native implementation, 21 October 2026

final result: passed

Current scope: local native implementation and visual comparison. No release or physical-device certification is implied.

## Visual truth and captures

- Selected reference: `/Users/prashant/.codex/generated_images/01a15291-2167-7273-a723-7e43c8ea58a5/exec-dc90286d-b736-47fd-be6f-994722381880.png` (853 × 1844, app-only concept for 390 × 844).
- Native state: Diwali, step 13/20, Hindi, Standard; device `Vedansh-Puja-Visuals`, iPhone 17 Pro, iOS 26.4, 402 × 874 points. CUA window capture is 702 × 1675 pixels, including the 153-pixel Simulator toolbar.
- Main capture: `docs/evaluations/puja-visual-guide-2026-10-20/diwali-standard.png`.
- Content crop: `diwali-standard-content.png` in that folder: 702 × 1356 pixels; removes toolbar, OS status area and bottom safe inset. Native scale is approximately 1.746 captured pixels per point.
- Full-view comparison: `comparison-full.jpg`. Both content columns are normalized to 390-pixel width with aspect preserved. Reference height is approximately 843 pixels; native app-owned content is approximately 753 pixels because the reference omits OS insets. The shorter native column is padded, never stretched. Safe-inset differences were excluded from findings.
- Focused action/text comparison: `comparison-focus.jpg`, actual current-step regions from the reference and native screenshot, normalized to 325-pixel width with aspect preserved. Both inputs were opened together before judgment.
- Additional captures: `diwali-large.png`, `step-overview-large.png`, `remembrance-large.png`, `remembrance-english-large.png`, `mantra-english-large-top.png`, `mantra-english-large-bottom.png`, `completion.png`.

## Findings and resolution history

1. **P1, resolved — intrinsic image size overrode the intended scene frame.** `diwali-standard-before.png` showed a very large corner of the source painting and pushed the instruction beyond the viewport. Fixed `VidhiStepArtwork` to measure a width-derived wrapper and explicitly size its contained Image to 100% width and height. The square hero now preserves the full crown, lotus and offering hands. `diwali-standard.png` and `diwali-large.png` show the full action and instruction.
2. **P2, resolved — persistent tab navigation consumed conduct space.** Added `VidhiConduct` to the existing tab-level immersive routing on all hosting tab paths. Native Home-path captures show the full timeline and the tab bar restores on returning to the overview. Other hosting registrations are covered by the existing navigation suite; their full native journeys remain a coverage gap.
3. **P2, resolved — direct thumbnail entry did not save resume until a subsequent turn.** Opening a step directly now persists the initial position; direct completion clears old progress. A regression test and the native remembrance overview confirm resume is offered immediately after returning from direct entry.
4. **P2, resolved — accessibility exposed offscreen pager content.** Only the active step/completion page is now exposed. Native accessibility snapshots contain the active step and its two contextual neighbours, rather than later pages and completion.
5. **P3 — supporting paintings have opaque parchment canvas edges.** All frames preserve the complete reviewed paintings and use no clip/crop. The vignette backgrounds differ slightly from the shared textured app parchment. Optional future alpha refinements may improve blending; no text/action is obscured.

## Required fidelity surfaces

- **Typography:** shipped Noto Serif Devanagari and Cormorant faces retain the reference's serif hierarchy. Active title is 23; instructions use the existing meaning token, including Large size. The full existing guide title and step counter remain in the shared header. The app's reader typography is slightly larger than the generated mock; complete copy remains readable and scrollable. Native Hindi Standard/Large and English Large were inspected. Mantra Devanagari and IAST remain present and reachable.
- **Spacing/layout:** fine rail, 36-point filled active marker, outlined contextual markers, expanded current action and two compact neighbours match the selected hierarchy. Standard and Large selected-step captures show complete imagery/text. The reference's inline listen pill is intentionally implemented once in the screen-level phase row, preserving the existing single audio controller. The previous marker omits the mock's tick so a direct jump does not falsely mark earlier rites complete.
- **Colors/tokens:** existing parchment, brown ink, saffron and antique gold tokens are used. Remembrance uses the existing quiet brown active marker. No text overlays the busy artwork. Material contrast is sufficient in the observed states.
- **Image quality:** built-in imagegen produced real standalone action/material paintings matching the selected style. No SVG/CSS/emoji stand-ins. Full crowns, hands, containers and materials remain visible with `contain`. The source/implementation focused comparison verifies the active scene. All generated paintings were separately inspected and then reviewed in the full contact sheet. The selected square hero was generated by recomposition, not cropping/stretching the landscape image.
- **Copy/content:** all 106 published steps and 12 verified mantras pass existing content gates. Full authored instructions remain authoritative; source URLs and tradition metadata remain private. All 106 visual assignments are explicit. Satyanarayan food art shows its panjiri/semolina and panchamrit rather than the generic modak plate. The remembrance assignment set is flame-free and adds no fixed counts/directions/thread positions.

## Interactions and verification

- Native Home → catalog → Diwali overview → direct step 13.
- Native neighbour selection advances 13 → 14; overview shows resume at 14.
- Native last-step conclude opens quiet completion and clears the resume row.
- Native Hindi Standard/Large selected step; overview thumbnails are visible.
- Native remembrance offering at Large; optional Gita chapter 15 opens and Back returns to step 8. Switching the reader to English updates the guide.
- Native long Satyanarayan dhyana page: accessibility focus scrolled to the lower section; all Devanagari, IAST and upcoming row remain visible. Captures record top and lower states.
- TypeScript and focused ESLint passed. Three focused Jest suites passed 46 tests. Existing content, new visual-coverage/personal-boundary tests and entry-route checks passed. Existing async language hydration act warnings remain in Jest output.
- Development bundler initially exhausted its default 4 GiB heap during app-wide screen preload. Restarted on the bundled Node runtime with a 12 GiB heap. Transient edit/refresh errors were corrected before the final captures and successful typecheck; they are not open product findings.

## Remaining coverage

Physical Android/iOS devices, every one of 106 native pages in all four languages/sizes, audible TTS quality, and release delivery are not verified. Simulator mouse/scroll routing reported `noWindowsAvailable`; native accessibility scrolling and actual control presses were used for the observed journeys. These are evidence limits, not a claim of full-device certification.

## Implementation checklist

- [x] Selected option resolved from the third displayed generation.
- [x] All 106 published steps have explicit relevant artwork assignments.
- [x] Full paintings/instructions/mantras remain available; image errors do not block readers.
- [x] Native source/implementation full and focused comparisons inspected; P1/P2 findings corrected.
- [x] Focused checks passed and existing report history preserved below.

---

# Earlier visual reviews (retained history)

# Reader illustrations — 11 October 2026, approved integration

Integrated: all 43 detailed Style 3 banners cover 44 reading slots. The user accepted the set
and requested two Hanuman gada corrections, then authorized integration. Both corrected
paintings are selected. All 43 R2 responses return HTTP 200 with exact approved SHA-256 bytes;
the active app manifest matches. Current backgrounds and the persistent cache are unchanged.
Files are 960×480, total 4.45 MiB and range from 61–132 KiB. Eight focused suites/205 tests and
TypeScript pass. Production iOS/Android exports contain none of the new banner files;
the existing paper fallback is 3,102 bytes. The gallery provides before/after controls.
See `docs/evaluations/reading-visuals-2026-10-11/style3-full-set/review.md` for selected repair
notes, hash/dimension checks, browser captures and the remaining native/device gates.
Browser framing evidence is separate from native/device performance evidence.

Standalone Release QA verifies the compact full canvas in Durga and Daan Katha, scrolling
through the Katha teaching/source/actions, and persistence of all 43 controlled cached files
across relaunch. The native R2 request fails TLS certificate validation (-1200); immediate
fallback, text and navigation work. Native art captures use exact approved files seeded into
the QA cache. Successful native CDN delivery and physical-device performance remain open.
See the full-set `native-integration-checks.json` and review for evidence.

---

# Reader illustrations — 11 October 2026, historical sample review

final result: three detailed Style 3 revisions ready for visual choice

The user clarified that the Krishna rendering should retain the detailed scene information.
Revised the same three scenes using the detailed paintings as edit targets and kj-08/kj-11
as style-only references. Main characters, actions, setting, props and layered backgrounds
remain. These are generative redraws with fine-mark variation, not pixel-identical copies.

See `docs/evaluations/reading-visuals-2026-10-11/style3-detail/review.md` for scene checks,
prompts, hashes and a fresh nine-image browser capture. All 9 images loaded with contain,
no horizontal overflow or browser warnings/errors at 1280px. Three uncropped 960×480 WebPs
total 303,698 bytes (297 KiB), about 7% smaller than detailed sources at equal settings.
No performance claim follows from that size result. No app code or cache contract changed;
no replacements are approved, adopted or uploaded. Wider generation awaits visual choice.

---

# Krishna-style reader illustrations — 10 October 2026, historical comparison

final result: category implemented locally; three-scene, three-style comparison ready

The user specified the Krishna kids-story rendering and separate image purposes. Reading
backgrounds remain quiet surfaces behind text; Reader illustrations are thematic short 2:1
banners above text. The four earlier detailed paintings are superseded. Actual unchanged
kj-08/kj-11 style references guided three new 2:1 storybook drafts. all-image-fit.html compares
Daan, Hanuman–Sita and Vishvarupa in the existing muted, detailed painting and Krishna storybook
styles. The fresh browser capture is reader-illustrations/three-scenes-three-styles.png.
All 11 image elements loaded, all nine comparisons use contain, and no horizontal overflow or
browser warning/error was observed at the normal 847px viewport. This is an artwork gallery,
not a native app capture.

Implemented separate asset folder, typed descriptor, alias map, manifest and configured R2
prefix reader-illustrations. CachedArtwork shares the existing loader/cache with the background
wrapper, retaining interaction/focus deferral, native-decode fallback and one bounded queue.
ReaderBanner uses the complete dedicated illustration canvas with contain. All 44 legacy slots
map to 43 IDs; the empty new manifest preserves current app art pending publication. The
publisher verifies approved WebP hashes and exact 2:1 dimensions; dry staging leaves the app
manifest unchanged and publication updates it only after uploads succeed.

TypeScript, focused ESLint and eight focused suites/205 tests pass after updating the Theerth
loader assertion. Empty-category verification/staging pass. The two local style references
match their source SHA-256 bytes and all preview image/texture URLs return HTTP 200. No bitmap
was added to the app asset graph and the lifetime cache implementation/directory is unchanged.
These checks do not establish native or physical performance.

43 complete reference-based prompts are saved in reader-illustrations/prompts.json. Built-in
generation is working again. The three selected storybook drafts total 218,756 bytes (214 KiB),
versus 326,850 bytes (319 KiB) for the same three detailed drafts at identical 960×480 dimensions
and WebP settings: 33.1% smaller. This is file-size evidence, not device performance. The user
requested comparing these three scenes before deciding the wider direction; the remaining 40
briefs are held. Style 3 is recommended for app cohesion and clearer short-banner figures.
No replacement is approved, adopted or uploaded to R2. Native/device gates remain open.

---

# Superseded detailed-painting drafts — 10 October 2026, historical review

final result: incomplete — image generation blocked

The user rejected the focal crops below and requested new paintings composed for the short
rectangle. Three new full-canvas 2:1 drafts are ready for visual review: Daan/Annapurna,
Hanuman–Sita and Gita/Vishvarupa. The fourth Vishnu draft is held for an incorrect fifth arm;
39 further paintings await generation after built-in image generation returned 401
`token_revoked`. These are artwork drafts, not adopted app assets or native UI sign-off.

The localhost preview server was stopped. It has been restarted as a detached process on
127.0.0.1:8095. `all-image-fit.html` now shows new before/after pairs using only local images,
with the rejected gallery preserved as `clipped-banners-rejected.html`. Browser verification
shows 6/6 comparison images loaded and all three after images displayed at exactly 360×180px
from 960×480px files, preserving the whole canvas without cropping or stretching. The new
review WebPs are 103, 113 and 103 KiB (326,850 bytes combined); dimensions, byte counts and
SHA-256 values are recorded in `new-banners/status.json`. The browser capture is
`docs/evaluations/reading-visuals-2026-10-10/new-banner-before-after.png`.

Existing app sources, R2 object mappings and lifetime-cache behavior were not changed by this
drafting pass. Visual approval, completion of the remaining art, R2 publication, manifest
adoption and native/device visual/performance verification remain open. No extra native test
run is claimed for this preview-only pass. The earlier crop geometry/test evidence below is
historical and does not establish visual acceptance.

---

# Rejected compact focal-crop proposal — 10 October 2026, historical review

final result: blocked

Asset-layout review passes for all 44 paintings. Fresh native banner capture, scrolling and
transport/performance verification remain pending. The source correction is implemented locally;
this is not release or all-screen native sign-off. The user explicitly rejected the natural-height
proposal below because it creates excess scrolling.

**Findings and comparison history**

- [P2, implementation fixed; native recheck pending] Natural-height portraits add roughly a
  full portrait image to every section. `ReadingBanner` now reserves a 2:1 landscape rectangle,
  up to 360pt wide and 180pt tall, including later prose sections and Theerth content art.
- [P2, fixed in gallery; native recheck pending] Default centre crops cut several faces. Reviewed
  per-image focal positions preserve key subjects; Gita Vishvarupa, Ram/Hanuman and Navagraha
  stay complete with `contain` on neutral paper inside the same compact rectangle.
- Geometry is static before loading. No layout callback, size probe, new bitmap, R2 hash change
  or cache-key change. Bundled manuscript/paper fallback and deferred async loading remain.

**Target, normalization and evidence**

The latest explicit user instruction requests a rectangle banner to avoid tall scrolling and
supersedes the inferred natural-height interpretation of the supplied Vishnu card crop. Same
Daan bitmap and equal card widths are shown before/after in the live browser comparison.
`docs/evaluations/reading-visuals-2026-10-10/compact-banner-before-after.png` is a 1280×890 crop
of the browser's full-page capture, retaining the heading and complete first comparison. It is
an asset-layout preview, not native app UI. Normal browser viewport is 1280×720, without an override.

`compact-banner-gallery.png` (1280×4246) and its three detail crops record all 44 paintings;
44/44 image elements loaded, with 41 focal crops and three contained compositions. At the gallery
card width, every frame is 312.66×156.33px. Both previews use the same native frame registry.
Original muted paintings and paper borders remain visible. The complete Gita/other exceptions
are intentionally smaller inside the short rectangle; no essential figure is cropped there.

**Five fidelity surfaces**

- Fonts/typography: native reading tokens and text strings are unchanged; new native check pending.
- Spacing/layout: common compact frame reduces art height and leaves text unrestricted. Wider
  screens retain the same 2:1 composition by limiting banner width to 360pt. Native endpoints pending.
- Colors/tokens: existing Option 2 paper, gold divider and original asset colors remain.
- Image quality: all 44 assets load; focal crops preserve faces and source proportions. Three
  compositions remain complete on paper. No new compression or religious artwork was adopted.
- Copy/content: source/teaching/control strings are unchanged. Evaluation labels are not app copy.

**Checks and remaining work**

TypeScript, focused ESLint, six suites/183 tests and source verification of all 45 manifest
hashes/dimensions pass. Geometry tests verify no stretching/uncovered crop edges across all
manifest paintings and stable compact bounds across phone/tablet available widths. Current
production Hermes exports succeed for iOS and Android in `/tmp/vedansh-reading-compact-banner`;
only the same 3,102-byte paper is bundled from the 45-image set on each platform. The preceding
full Jest run (236 suites/2,183 tests) predates this banner correction; current focused checks
include its four new regressions.

An isolated simulator check exposed the old Daily Gita 5.26 layout; menu/key actions did not
produce a verified current bundle reload. No fresh native banner capture is claimed. Finish
same-state native comparisons, long-reading endpoints, remaining sizes/languages, successful
in-app R2 download/reuse and physical performance/touch checks before broad sign-off. Prior
host/CDN success and seeded native cache decoding are separate evidence layers.

---

# Rejected natural-height proposal — 10 October 2026, historical review

final result: blocked

The code correction and asset-gallery checks are complete; the latest native app capture and
scroll verification are blocked because the Mac is locked. The unlock request is pending.
The earlier scoped native passes below apply to the previous 220pt frames, not this correction.

**Findings and comparison history**

- [P2, implementation fixed; native recheck pending] Fixed 220pt frames make square/portrait
  paintings narrow beside the user's full-width Vishnu reference. Later Katha parts also shrink
  art to 80pt. ReadingArtwork now uses full available width and source-verified manifest aspect
  ratio; the compact prop is removed. Theerth preserves the complete painting instead of its
  prior top-anchored 5:4 window.
- Layout is reserved before fetching. Image content, R2 object hashes, cache keys and fallback
  assets are unchanged. Taller portrait paintings are intentional to preserve complete figures;
  existing reader ScrollViews must receive a fresh native endpoint check before visual sign-off.

**Target, state and evidence**

Source visual: docs/evaluations/reading-visuals-2026-10-10/user-wide-artwork-reference.png
(710×606 crop: Vishnu painting, source/action row and divider). The source is a card-region
reference, not a whole-device screenshot. The exact same Gita bitmap is compared before/after
at equal 353.5px card-content width in the browser gallery. Its own 1054×1492 aspect ratio
produces a 500.4px after image, instead of the prior 220px frame. Vishnu remains 3:2. This is
an intentional proportional adaptation to a different painting, not identical-state fidelity.

Browser-rendered comparison: docs/evaluations/reading-visuals-2026-10-10/natural-fit-before-after.png
(847×926, full-page, normal browser viewport/density; no override). All-image gallery loaded
89 image elements (reference plus two copies of 44 paintings), with zero failed or pending
images and zero console errors/warnings. All 45 manifest dimensions match local source bytes.
The gallery shows asset fitting, not native typography, touch, R2 transport or performance.

**Five fidelity surfaces**

- Fonts/typography: app tokens unchanged; fresh native wrapping/truncation check pending.
- Spacing/layout rhythm: full available width and proportional height match the reference's
  edge-to-edge painting treatment; native text endpoints and persistent controls pending.
- Colors/tokens: original artwork and theme tokens retained. Muted legacy paintings remain
  muted; no new image generation, recoloring or religious-content changes were adopted.
- Image quality: complete Gita frame/figures visible in the browser comparison; all original
  assets load. No crop, stretch, substitution or new compressed bitmap is introduced.
- Copy/content: original scripture/teaching/control strings untouched. Gallery labels describe
  evaluation only and do not enter product flows.

**Checks**

Full Jest: 236 suites/2,183 tests. TypeScript and focused ESLint pass. Both final Hermes exports
succeed in /tmp/vedansh-reading-natural-fit. Only the existing 3,102-byte paper from these 45
assets is bundled on each platform. Tests and exports do not close native visual checks.

**Implementation checklist**

- Completed: common full-width geometry, later-section parity, Theerth uncropped content plate,
  generated/verified dimensions, unchanged R2/cache hashes, browser comparison and build checks.
- Pending: unlock Mac; reload isolated QA app; compare same native states and text endpoints;
  continue the separately recorded physical-device/native-CDN/performance checks.

---

# Reading artwork rollout — scoped native design QA, 10 October 2026

previous scoped result: passed

This pass covers the inspected native layouts and the image-size correction. Release/device
and remaining size/language checks stay open; it is not an all-screen visual sign-off.

**Findings and comparison history**

- [P2, fixed] Opening paintings appeared as tiny stamps. The initial rollout reused the 80pt
  continuation frame. Gita 1.42 English/Standard before/after, compared together in
  `docs/evaluations/reading-visuals-2026-10-10/artwork-size-before-after.png`, shows the complete
  portrait in the restored responsive opening frame (maximum 220pt/28% window). The same
  correction is verified in native Daily, Puja, Daan and Pitru education captures 13–16.
- [P2, fixed] Pitru overview/education exposed a white root beneath the paper. Added the theme
  parchment base; current captures 09 and 16 show the continuous ivory surface.
- No remaining actionable P0/P1/P2 finding in these inspected Standard states. Legacy portrait
  art remains muted and visibly framed; this is preserved asset content, not a new edge-blending
  claim. Further artwork replacement requires a separate concrete visual iteration.

**Target, normalization and evidence**

Source: `docs/evaluations/reading-visuals-2026-10-09/proposals/option-2.png` (853×1844).
Implementation: actual iOS 26.5 Expo Go native captures in the October 10 directory. Native
window raster: 782×1732; device content rectangle x47/y203, 688×1498, approximately 1.71px/pt
for the 402×874pt device. The HTML board declaratively frames the original capture; no bitmap
art or text is recreated. This is not a raw 3x device capture.

Full-view combined inputs opened and reviewed:
`artwork-size-before-after.png` (847×937), equal-scale Gita 1.42 English/Standard at 42/47;
`reference-native-comparison.png` (847×911), selected Option 2 and actual native Puja step 1.
The latter compares visual direction across different content and controls, not exact-state
Katha fidelity. The original exact Katha source/native comparison is retained below.
Preview anchors were exercised in the in-app browser, all image/file references resolve, and
console inspection returned no warnings or errors. The preview remains open.
Complete subjects, typography and divider were readable in these two-column inputs; separate
focused crops were unnecessary. Original native images were also inspected at full size.

**Required fidelity surfaces**

| Surface | Assessment |
| --- | --- |
| Fonts/typography | Existing native script-aware tokens retained; same Gita lines wrap identically before/after. Puja heading/body and Daily source remain readable. Generated reference typography is not shipped. |
| Spacing/layout | Art reserves a stable responsive opening frame, gold divider follows it, text scrolls vertically and persistent tabs remain visible. Later Puja steps keep a quieter divider. Small-stamp regression fixed. |
| Colours/tokens | Approved quiet ivory paper and gold/ink tokens remain; Pitru uncovered white root fixed. Semantic control colours retained. |
| Image fidelity | Complete subjects preserved with `contain`; approved Vishnu/Narayana appears in Daily/Puja. Existing Gita/Daan portrait borders and muted rendering are accepted legacy asset differences. No new drawing or placeholder replaces the approved painting. |
| Copy/content | Same Gita 1.42 text before/after; Daily source, Puja instructions, Daan shastra and Pitru education retain existing content. No religious narrative or kids art changes. |

**Implementation checklist and limits**

Corrected opening frame and Pitru base, captured revised native states, reviewed equal-scale
combined comparisons, verified final builds/assets, and preserved the live preview. Full Jest
passed 2,181 tests before the final frame-only correction; final proportional rechecks passed
86 tests, TypeScript, focused lint and both Hermes exports. Public R2 verified 45/45 byte hashes.
Native cached screenshots use explicitly recorded fixtures; successful native R2 downloading,
physical performance/touch, Android runtime and remaining Large/language combinations remain
unverified. Details: `docs/evaluations/reading-visuals-2026-10-10/review.md`.

---

## Cache verification follow-up

The loader now lets persistent cache hits bypass the bounded network queue. This changes no
artwork or layout. Fresh native captures 17–19 verify process-restart decoding, genuine R2
TLS-failure fallback and restored cache decoding. The same step-1 layout reserves unchanged
space in fallback and painted states. Full Jest now passes 236 suites / 2,183 tests; final
TypeScript, focused lint and both Hermes exports pass. Native CDN success and physical-device
performance remain open. Evidence: October 10 `cache-follow-up.md`.

## Previous scoped QA records

# Option 2 reading visuals — design QA

**Final result: passed for the scoped visual implementation.** Release/device checks below remain open.

## Reference and evidence

The user selected `proposals/option-2.png` with "ok option 2" on 9 October 2026.
Compared the selected reference and actual native English Standard implementation together in
`docs/evaluations/reading-visuals-2026-10-09/design-comparison.html`; the complete paired screenshot
is `option2-reference-native-comparison.jpg`. The native before/after board is
`approval-preview.html`, captured in `option2-native-before-after.jpg`.

Native evidence comes from the isolated iOS 26.5 Expo Go simulator, not HTML UI replicas.
Original PNGs preserve simulator context; the board uses declarative framing only.

## Matching and intentional differences

| Dimension | Result |
| --- | --- |
| Surface | Continuous ivory parchment, faint botanical corners, dark prose; provisional card border/elevation removed. One paper layer per screen. |
| Hierarchy | Chapter pill, full heading, complete thematic painting, gold divider, prose, separate bottom pager. |
| Artwork | Separate optimized painting and paper assets. No generated full-screen mockup is shipped. `contain` preserves all figures. |
| Density | The opening plate is capped at 220pt/28% of window height; later parts use 80pt, following the recommendation the user approved. Existing native typography, status/header/control rows are retained rather than scaling a screenshot. |
| Loading | Stable reserved image area. Existing neutral manuscript icon and paper remain while remote art loads/fails. Text/controls are independently available. |
| Native states | English Standard Katha; Hindi Standard/Large Katha; compact section 2; section 1 prose endpoint; Hindi Large Daan and both Pitru readers with prose/teaching/source endpoints. Follow-up Gujarati Standard/Large opening and Large endpoint; Kannada Standard complete endpoint and Large opening/prose; Daan Kannada Large teaching/source. |
| Navigation | Native accessibility targeting reaches later sections and long prose/source lines. Physical touch gestures are not established by these checks. |
| Accessibility | Real script-aware text, adjustable reading size, individually accessible paragraphs, decorative art hidden from accessibility/touch, existing controls preserved. |

The concept image excludes status-bar/device framing and uses generated typography. Those are
accounted for in the comparison; they are not replaced in the real app. Existing portrait
Daan/Pitru paintings retain their full frame and thematic identity. Follow-up Kannada QA found
clipped last lines in prose and a teaching panel. The shared `ProseParagraph` guard gives iOS
one point of drawing room after its first natural measurement, without changing source text,
font or line spacing. Captures 31→33 and 37→38 show the resolved clipping. Android retains its
natural layout without the additional callback. No remaining actionable P0/P1/P2 mismatch was
found in these inspected states. This is not a claim that all 113 screens or every
language/device received a native visual walkthrough.

## Checks and remaining limits

Initial approved-direction reader checks passed 185 tests; cache/image/share passed 22. The supplied
fallback's decode recovery passed six image tests. After removing duplicate paper views,
three Vrat and 17 Pitru reader tests and focused lint passed again. TypeScript passed, and both final
production Hermes exports succeeded. Both graphs contain only the 3,102-byte paper out of the
45 reading assets; the new painting is 94,904 bytes on R2. Final follow-up passed 74 tests in six
prose/cache/image/reader suites, including cache failure paths and paragraph remeasurement.
TypeScript and focused lint passed after the teaching/source changes; both final Hermes exports
and their asset membership were verified again.

The simulator's proxy rejects CDN TLS (`NSURLErrorDomain -1200`); certificate validation remains
enabled. Genuine fallback is captured. Native cached decoding uses explicitly recorded,
hash-identical fixtures, so it does not prove a successful native R2 download. The registered
iPhone is currently unavailable. Physical frame/memory measurements, physical touch gestures,
Android runtime, the complete Kannada Large endpoint, remaining language/family combinations
and a full native screen walkthrough remain open.
A development launch trace includes existing JS stalls; no zero-thread-work or measured device
performance claim is made. App code remains local and unreleased.

Full source inventory, check records, generation prompts and publication/fixture evidence:
`docs/evaluations/reading-visuals-2026-10-09/review.md`.

---

## Prior Storybook icon and sizing QA record

The earlier record is preserved below; it concerns the separate Storybook icon/sizing work.

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

## Home gutter and Discover follow-up — 6 October 2026

**Result: passed for the requested layout/icon changes on the tested native states.** The reviewed baseline was the installed 24dp Home gutter and the old Discover glyphs. Home now uses a shared 16dp gutter; all nine Discover subjects use centered 32dp paintings in the 36dp tile. Pitru, Widgets and Daan reuse More's exact sources. Source files and the actual installed captures were inspected together; no actionable P0/P1/P2 visual difference remains for these changes. The Home header's circled Om remains a font mark; other painted Om placements reuse `stotram.png` at different sizes.

**Evidence.** [Home before/after](docs/evaluations/home-gutter-2026-10-06/home-before-after.png), [old versus shared Discover subjects](docs/evaluations/home-gutter-2026-10-06/discover-before-after.png), [all nine native card crops](docs/evaluations/home-gutter-2026-10-06/discover-preview.png), and [enlarged English states](docs/evaluations/home-gutter-2026-10-06/enlarged-preview.png). Default Hindi and enlarged English were captured on 402×874pt iOS 26.5 at 3x, version 1.4.9 (69). Art does not grow with typography; the grid reflows to two columns and the filled badges remain inside. Metadata records before-build distinctions, source/crop hashes and exact density. System size and language were restored after verification.

**Validation.** The combined Release builds/installs with zero errors/warnings. Complete `npm test` passes all 2,950 tests and typecheck under existing Node 25.9.0. Changed-source lint has zero errors and three existing test warnings. Native Home checks pass Search, Kundali and Kids Stories. The final Discover flow captures every subject and passes Widgets/Pitru cross-tab navigation and return to the hub, plus Ask → Today's Vidhan → below-fold Ask CTA → Back. Earlier capture attempts used an unsuitable swipe band or assumed the Ask CTA was above the fold; they are not counted as passes. The final 14-frame carousel walk covers all nine subjects despite some non-advancing swipes.

**Limits and size.** The visible enlarged Discover card and next-card peek fit; other enlarged subjects were not individually reviewed. Existing one-line descriptions/deity summaries ellipsize. Android, physical devices, full screen-reader traversal and a fresh tablet/rotation matrix remain unverified. This follow-up adds 43,453 bundled bytes (~43KB), including the 41,602-byte question PNG. The whole PR's updated bundled-content delta is 2,615,500 bytes (~2.62MB); compressed store download size is unmeasured. Full logs, exact provenance and measurements: [evaluation report](docs/evaluations/home-gutter-2026-10-06/README.md).

- [x] Implement all three exact selected placement roles using local raster assets.
- [x] Preserve native screen structure, live copy, controls and theme.
- [x] Keep art contained, centered, non-interactive and accessibility-hidden.
- [x] Fix the first visibility finding; capture and inspect combined comparisons again.
- [x] Record provenance, installed hashes, passing unit/native gates and measured size.

final result: passed


## 10 October enlarged-reading evidence addendum

The final loader/layout was also inspected with Large text: Puja opening and complete
instruction endpoint are captured in October 10 images 20–21. Kannada Large Katha opening
(image 22) retains the full painting. The complete Kannada endpoint and horizontal gesture
coverage remain unverified. This extends scoped evidence without changing the Standard
visual pass above. English/Standard QA preferences were restored.

---

# Gita Saar visual refresh — 2026-10-20

## Target and accepted corrections

- Index: selected editorial option 2; reader: selected inner option 1.
- Retain the existing regional-language/English toggle, audio, routine, bookmark/share controls, progress, and native navigation.
- User correction supersedes the mockup's etched artwork: reuse the app's approved rich `krishna-arjuna-vishvarupa.webp` reader banner on both screens.
- Render the full 2:1 composition with explicit numeric dimensions and `contain`; do not crop subjects or inherit the asset's intrinsic height.

## Evidence

- Native iOS index and first reader page inspected: existing rich artwork, both figures, masthead, language toggle, reader controls, and source verse are visible.
- TypeScript: passed.
- Focused reader and shared reading-scale tests: 18 passed. Regression checks cover explicit 2:1 image dimensions and measured pager-height propagation.
- Full prose is retained. Multiline verse, introduction, Saar, and conclusion use the existing `ProseParagraph` wrapper to avoid Fabric final-line clipping. Theme titles have no line limit.
- Vertical readers receive the measured pager viewport; clipped-subview removal is disabled, axis locking is enabled, and bottom padding clears the pager indicators.
- User confirmed on 2026-10-21 that vertical scrolling reaches the complete content and full-Gita handoff.
- Restored the existing source-specific Krishna–Arjuna content background through `getReaderBackground` and the shared `BackgroundLayer` readability overlay; native appearance of this restoration remains pending.

## Initial result

The first iteration was blocked on native background and Large/regional review. The 21 October correction review below supersedes that status.

## Correction review — 21 October 2026

- P2: clipped index title at the artwork boundary. Fixed with a padded 64 dp title line box and `ProseParagraph`; native Hindi and regional index captures show the complete title below the image.
- P2: plain numerals in the listing. Replaced by topic-specific Phosphor icons keyed to all 16 stable IDs. Native Hindi captures cover the listing from start through final theme; Gujarati/Kannada captures retain their existing language toggle.
- P2: some headings/labels still used raw Text. All Saar page and index prose now use the existing Fabric-safe paragraph wrapper without line limits. The verse reference/actions row can wrap.
- P2: artwork bypassed the delivery contract. Both surfaces now use `ReadingBanner`, approved remote aliases and a full-width parchment fallback. Existing banner placement and artwork delivery checks pass.
- Post-fix comparison: reopened the selected index/reader designs and native captures together. The rich full-color painting, existing two-segment language toggle/control row, native navigation chrome, background and scrollable page are accepted user constraints that supersede the generated mockup. Matched the title → context → painting → reference → shloka → lotus → Saar → handoff hierarchy. Full text extends below the native viewport and remains scrollable; it is not compressed to fit the tall generated image.
- Fidelity surfaces inspected: parchment/gold palette; script/Latin font families; title and row wrapping; complete 2:1 subjects; lotus/icon language; existing controls and their positions; paragraph endings and handoff reachability. Screenshots and precise scope: [21 October review](docs/evaluations/gita-saar-2026-10-21/review.md).
- Automated: TypeScript and all 3,512 tests pass via `npm test`. New listing regression covers Hindi, English, Gujarati and Kannada, all icons, unrestricted title wrapping and final-theme navigation.
- Native iOS: Hindi Standard opening/full first Saar, complete listing, English Standard full first Saar and long theme-10 heading, correct handoff to Gita 6.32; Large first Saar in English/Gujarati/Kannada. The existing devotional content background and approved rich banner render together.

### Coverage limits

No exhaustive 170-page visual audit, Android/physical-device review, or OS accessibility enlargement beyond the app's Large preset was performed. These are open coverage items, not claimed by this scoped iOS correction pass. The dedicated 27-step Maestro flow passes (exit 0) on the existing isolated iOS profile after restarting unresponsive Metro and handling the debug overlay. It verifies physical scrolling and the full-Gita handoff. Fresh-install setup is not covered. The final automated run was repeated after merging current main. Evidence and earlier failed attempts are recorded in the linked review.

final result: passed


## Latest correction — illustrated icons and background-only Saar reader

The user rejected the outline theme icons and the banner inserted into the reader. The latest implementation replaces them with the app's bundled StoryIcon artwork and removes every in-content reader banner, keeping the devotional background. The index cover banner is retained. Earlier screenshots and banner-placement approval describe the superseded iteration; they do not verify this latest change. Updated reader/banner-policy and four-language icon regressions cover the new contract. Latest native iOS review confirms the illustrated listing icons and reader without an inserted banner. TypeScript and 29 focused tests pass; the 27-step native smoke passes, including scrolling to the full Saar and the Gita 6.32 handoff. Current screenshots and logs are in `docs/evaluations/gita-saar-2026-10-21/background-only/`. The earlier full-suite and Large/regional screenshots apply to the previous iteration.

latest correction result: passed for the scoped iOS review; Android, physical-device and exhaustive page review remain unverified

---

# Ganesh snana illustration correction — 2026-10-21

Follow-up: the combined Diwali step now pairs its two unchanged instruction clauses with ordered snana and durva/flower/akshat offering paintings. The overview thumbnail also shows durva offerings. Native review includes both the upper snana clause and lower durva clause after scrolling (`ganesha-upachara-snana-top.png`, `ganesha-upachara-durva.png` in the same evidence folder). This supersedes the single-image Diwali correction described below. All remaining listed offerings remain in the original text; the second image illustrates durva/flowers/akshat specifically. No automated tests run for this follow-up.

User-reported mismatch confirmed: the Diwali Ganesh snana illustration showed panchamrit ingredients. Replaced that assignment and Ganesh Chaturthi snana's generic water illustration with `ganesha-snana.webp`, depicting the existing symbolic water-with-flower instruction. Full bilingual text unchanged. Original and final art visually reviewed. Native Diwali step 8 shows the complete painting, complete Hindi instruction and adjacent timeline rows; evidence: `docs/evaluations/puja-visual-guide-2026-10-20/ganesha-snana-corrected.png`. Ganesh Chaturthi uses the same asset but was not separately walked through. No automated tests run for this correction; prior results below predate it. Local only, not released.
