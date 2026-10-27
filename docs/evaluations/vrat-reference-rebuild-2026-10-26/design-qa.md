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
