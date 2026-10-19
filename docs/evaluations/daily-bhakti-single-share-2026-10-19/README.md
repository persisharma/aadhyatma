# Daily Bhakti complete single-image share

Hanuman Ashtak 1.5 previously started its meaning on page 1 and continued it on page 2, with a blank corner and grey strip in the header. The fix keeps the full stored verse and meaning in one native-measured image. The artwork spans the full width; the brand has no solid rectangle and gradient alpha stops use the parchment RGB.

## Reviewed previews

These are actual DevotionalShareCard renders through React Native Web, with the app fonts and a CSS-only LinearGradient shim. They are browser review images, not installed-device PNG captures.

- [Reported Hanuman verse, Hindi](reported-hanuman-hi.jpg) — 540×821 review image, complete meaning.
- [The same Hanuman verse, English](reported-hanuman-en.jpg) — 540×967, complete meaning.
- [Short Gita 2.47, Hindi](short-gita-hi.jpg) — 540×675.
- [Long Ganesh verse and meaning, Kannada script](long-kn.jpg) — 540×1531.

The wide header shows the upper 75% of each approved 3:2 plate, removing its lower parchment band. All ten painted headers were visually reviewed during implementation. No source artwork was regenerated or changed.

## Implementation and evidence

The builder emits one complete page per language. Fixed readable verse/meaning type is preserved; long cards grow after actual body/root layout, with 67dp reserved below the full text for the footer. Capture waits for both decoded art and settled native height. Story retains its 120/165dp insets around the complete card and grows when needed. The picker preview scales the whole measured image and uses the existing full-image wording about Instagram framing adjustments.

`dailyBhaktiShare.test.ts` checks all 1,367 candidates × four languages (5,468 complete readings), exact source preservation, one-page output and the exact reported Hanuman verse (chapter 1, verseIndex 5). Component tests cover final-height/decode readiness and invalid measurement. `dailyBhaktiSingleShareFlow.test.tsx` verifies post and Story capture dimensions and waits for both readiness signals. The prior full-corpus browser audit recorded 5,468 single images, zero text/footer overlap, missing art or JavaScript errors, and a maximum 1,617dp height. Its recorded summary is retained in verification.json; the representative previews above were re-rendered after workspace maintenance.

The final code commit 0c9c208ddca3407488261591b08759be7a83e26c passed [GitHub CI run 802](https://github.com/persisharma/aadhyatma/actions/runs/39235260389), including TypeScript, all reader/component shards, engine, observance/date and data checks, production iOS/Android exports and the Kids Stories asset gate. Touched-source ESLint passed locally. These checks are not native visual evidence.

## Pending before merge

No installed iOS/Android app, simulator, emulator or Maestro executable is available in this environment. Native Standard/Large visual review, actual exported dimensions, native alpha-gradient appearance, full picker preview, offline decode and WhatsApp hand-off remain required. The smoke flow is extended to reject an unexpected Share all pages action for this one-image reading; its YAML parses, but it has not been run on devices.

No production OTA, store release, native dependency or artwork generation is included. PR #495 separately addresses reading-page artwork.
