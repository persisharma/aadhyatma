# Panchang share: clipped wordmark at the sky border

Base: `2e9fcc67a833c7b11c2b940f56edea2f57d69960` (main).

## Exact cause

The dark fragments and green feather in the supplied 3 November share are from
the approved Hindi wordmark, not separate decorative icons. `WordmarkArtwork`
specified `width`, `maxWidth` and `aspectRatio`, but no `height`.

React Native 0.81.5 `Libraries/Image/Image.ios.js` and `Image.android.js` prepend
`{width, height}` from the resolved bundled source before applying caller styles.
The source is 1104×391 for Hindi and 1565×419 for English. The caller overrode
width but left the intrinsic height. In the Panchang header's intrinsic-width
column, Yoga's percentage max-width/centering resolves the Hindi image to a
552×391dp box, expanding the brand row to 405dp. The image uses `contain`, so
the visible bitmap is vertically centered inside that oversized box. The
144dp sky clips everything below its edge: only the top of the Hindi lettering
and the peacock feather survive. The app icon and city chip are centered below
the visible sky; the city chip also collapses to zero width.

## Fix

Override height explicitly as `width * metrics.height / metrics.width` in the
shared `WordmarkArtwork`, retaining the original source, `contain`, aspect ratio,
width cap, paint barrier, onLoad/onError and accessibility semantics. Hindi's
compact image is now 58×20.54dp and English's 86×23.02dp. No Panchang calculation,
language selection, exported dimensions, footer, or sharing behavior changes.

The common component also serves the generic share strip and other branded
footers. Home's specialized frame was inspected via `HomeWordmark.test.tsx`;
this fix is in its shared image child and preserves its width-derived geometry.

## Executed evidence

- Yoga 3.2.1 reproduction with the real Panchang nested row styles and native
  source dimensions: before, brand row 405dp / image 552×391dp / place width 0;
  after, row 35dp / image 58×21dp (pixel-rounded) / place width 100dp in the
  fixed-size sample. This is layout-engine evidence, not a native screenshot.
- Focused real React Native Jest harness: `WordmarkCapture.test.tsx`.
  Six dimension regressions fail on the old implementation, while the two
  existing paint-barrier tests pass. With the fix, **8/8 pass**. Harness uses
  React 19.1.0, React Native 0.81.5, react-test-renderer 19.1.0 and Jest 29.7.0;
  only the theme hook is replaced with static colors in this partial checkout.
- Existing `panchang-smoke.yaml` extended to open the real share preview,
  check English content, capture English/Hindi previews, cancel and return.
  Execution still requires the native application and a simulator.

## Acceptance status

| Check | Status and evidence |
| --- | --- |
| U1/U2 | PASS: pinned main, repository policy/wiki/design/share flow inspected; acceptance is a bounded, readable header with full branding and place. |
| U3/U4 | PENDING native fidelity and hi/en/gu/kn × Standard/Large, compact/system-text matrix. Fixed image typography policy is unchanged. |
| U5/U6 | PENDING native picker, cancellation, lifecycle and platform handoff. Existing paint barrier tests pass; no state or persistence changes. |
| U7 | PASS source integration: same approved bundled PNGs, manifest and capture barrier; no new production asset. Actual native visibility pending. |
| U8 | PASS shared fix in WordmarkArtwork covers common branding consumers rather than hiding the Panchang symptom. |
| U9 | PASS focused regression; PENDING full `mobile/npm test` and executed Maestro. No native toolchain exists in this environment. |
| U10 | PASS source review: no dependency, import, asset-byte or saved-ID changes; explicit geometry only. Platform visual confirmation pending. |
| U11 | PASS base main and open Panchang PRs inspected; matching design/wiki and smoke updated. Final CI/integration remains pending. |
| U12 | Preserve the implementation, tests, smoke and this report on a remote branch; never clean the only copy. |
| C3/C4/C9 | Source/layout and focused tests pass; native exports, long-location layout, other sharing surfaces and platform handoff remain PENDING. |
| C5 | N/A calendar logic: no engine, location, timezone, model or date change. |
| C1/C2/C6/C7/C8/C10 | N/A: no scripture/story, reminder, navigation/persistence, media or release change. |

No merge, native build, OTA or release is part of this change. The review remains
draft until required full-suite/native checks pass.
