> **Superseded after user visual rejection.** The rectangular header treatment below looked
> pasted onto the card. Its green tests did not establish an accepted design.
> Current full portrait masters and new verification are documented in
> [daily-bhakti-full-masters](../daily-bhakti-full-masters/README.md).
> Historical captures/logs below describe the earlier implementation.

# Superseded: Daily Bhakti rectangular subject headers

Follow-up to merged PR #508, on the requested `claude/daily-bhakti-more-sources` branch.

The 59 added sources contribute 1,014 verses to the 2,387-verse pool. All 330 previously
neutral additions now select one of eighteen distinct subject paintings; the other 684
retain their existing deity plates. Exact counts and source mappings are in `coverage.json`.
General prayers and unknown sources retain the neutral fallback.

## How the paintings fit

The painting occupies a wide header above the existing parchment source/verse/meaning frame.
Its full 2:1 canvas is contained inside the header; no deity face, hand, mount or shrine is
cropped. At a 370pt card width, the scene is 185pt tall inside a roughly 192pt parchment slot.
The artwork never stretches with the reading: native text expands the body and the footer
moves down. Share uses this same layout at 1080px output width.

Examples from the installed iOS app: [Lakshmi](native/lakshmi.jpg), [Gayatri](native/gayatri.jpg),
[Khatu Shyam](native/khatu-shyam.jpg), [Kali](native/kali.jpg).

## Artwork and integration

- Eleven subject paintings reuse the exact approved Style 3 reader-illustration bytes,
  copied into the separate offline Daily Bhakti category. Reader CDN descriptors are untouched.
- Seven new paintings were generated with built-in `image_gen`: Gayatri, Santoshi, Ahoi,
  Vaishno, Ekadashi, Tulsi and Shakambhari. The full prompt set is in `prompts.json`.
  The style reference was the existing approved Lakshmi painting. New masters were visually
  reviewed, then encoded to 960×480 WebP, quality 84. The built-in tool exposes no explicit
  model/quality/pixel-size settings; final shipped dimensions and compression were applied locally.
- `mobile/assets/devotional-share/hero-*.webp` are the final app assets. The manifest pins
  each shipped hash, master/source hash, prompt key and cleared body plate.
- `DevotionalHero` contains the complete 2:1 scene. The new headers reuse only Ganesha’s
  text-cleared parchment body and scenic footer, excluding its deity hero. All original
  full masters remain byte-identical. Both Daily Bhakti and share export use this frame.
- Added artwork: **2,454,670 bytes (2.34 MiB)**. Complete artwork set: **20,733,526 bytes
  (19.77 MiB)**. Tests retain the existing 22 MiB combined ceiling and add a 3 MiB header ceiling.
- Native subject selectors appear only after image `onLoad`, so an empty image container
  cannot pass the artwork walkthrough. Switching subject remounts the native image.

## Verification

- Final `npm test`: passed after reconciling the updated source branch and current `main` (typecheck, 37 widget tests,
  2,655 Jest tests across 273 suites, 617 engine tests, 194 data tests, 49 Ask tests;
  3,552 tests total). Final typecheck, changed-file lint, launch-graph checks and whitespace checks passed.
- Exhaustive mapping checks cover all 330 former fallbacks, all 1,014 additions and all
  2,387 verses in four scripts. Asset checks pin original masters, new bytes/hashes,
  approved source identity, prompt provenance and growth budgets.
- The complete `daily-bhakti-art-smoke.yaml` passed on isolated iOS 26.5 simulator
  `BD91E840-482E-4816-838A-9C5247E401DA`. All eighteen subject assertions waited for
  successful native image decode. Every native subject capture in `native/` was visually
  reviewed for matching identity, complete faces/hands/mounts, legible text and frame integration.
- Both iOS and Android production exports passed. All 28 Daily Bhakti artwork files in
  both asset maps match their manifest SHA-256; see `export-verification.json` and `export.log`.
  This proves packaging, not Android device rendering.
- Verification used an existing development shell and this checkout’s Metro on port 8093.
  The branch bundle contains `hero-gayatri.webp` and the native decode-readiness selectors.
  The Bhakti route is now loaded on demand to keep the combined launch graph below the
  existing 4,090,000-byte ceiling. No budget was raised.
- The initial visual review rejected blank headers after Metro exhausted its default
  4 GiB heap. Those captures were replaced by the successful decoded-artwork run with a
  12 GiB local server heap. A later XCTest hierarchy query on a modal returned
  `kAXErrorInvalidUIElement`; subject coverage and share-modal verification were split.
- **Pending:** the final four-script share-preview/real PNG export run stalled at app
  launch during severe host load (load average above 250), and was stopped. The subsequent
  existing Standard/Large Daily Bhakti smoke did not start. These are not claimed as passes.
  The dedicated share flow remains authored and YAML-parsed for rerun. Android device QA,
  physical devices and WhatsApp delivery are also unverified. The follow-up PR remains draft.

Reproduce native checks from `mobile/` with a dedicated simulator and this checkout’s Metro:

```sh
NODE_OPTIONS=--max-old-space-size=12288 npx expo start --port 8093
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-art-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-art-share-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-smoke.yaml
```

Android, physical devices and WhatsApp delivery are separate checks and are not established
by these local tests or simulator captures.
