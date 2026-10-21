# Daily Bhakti subject coverage — PR #508

The 59 added sources contribute 1,014 verses to the 2,381-verse pool. All 330 previously
neutral additions now select one of eighteen distinct subject paintings; the other 684
retain their existing deity plates. Exact counts and source mappings are in `coverage.json`.
General prayers and unknown sources retain the neutral fallback.

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

- `npm test`: passed (typecheck, 37 widget tests, 2,639 Jest tests across 273 suites,
  617 engine tests, 178 data tests, 49 Ask tests). A subsequent decode-readiness regression
  also passed its focused frame/card/screen suites; final reconciliation validation is recorded below.
- Exhaustive mapping checks cover all 330 former fallbacks, all 1,014 additions and all
  2,381 verses in four scripts. Asset checks pin original masters, new bytes/hashes,
  approved source identity, prompt provenance and growth budgets.
- Typecheck, changed-file lint, Maestro YAML parsing and whitespace checks passed.
- Native verification uses isolated iOS 26.5 simulator `BD91E840-482E-4816-838A-9C5247E401DA`,
  an existing development shell and this checkout’s Metro on port 8093. The branch bundle
  contains `hero-gayatri.webp` and the native decode-readiness selectors. No cloud build or OTA was used.
- The initial visual review rejected blank-header captures after Metro exhausted its default
  4 GiB heap. They are superseded by a rerun with a 12 GiB local server heap and assertions
  that wait for every image to decode. Final native review/export evidence is still being collected.

Reproduce native checks from `mobile/` with a dedicated simulator and this checkout’s Metro:

```sh
NODE_OPTIONS=--max-old-space-size=12288 npx expo start --port 8093
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-art-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-art-share-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-smoke.yaml
```

Android, physical devices and WhatsApp delivery are separate checks and are not established
by these local tests or simulator captures.
