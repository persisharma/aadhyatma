# Daily Bhakti complete portrait masters — PR #509

All eighteen replacements are complete 1080×1456 paintings composed from the original
Ganesha card reference: deity scene, Vedansh plaque, organic parchment transition, gold
frame, reading bands, meaning frame and scenic footer. They replace the rectangular
headers rejected by the user. Every new subject uses its own master throughout.
Manifest-fitted coordinates and generated/shipped hashes are in
`mobile/assets/devotional-share/manifest.json.subjects`; exact prompts are in `prompts.json`.
Built-in generation exposes no model, quality or pixel-size controls. Final WebPs were
resized to 1080×1456 and encoded at quality 78.

Short share cards restore the previously omitted master band above the footer. As text
grows, crop this band from its top; flowers and borders keep their scale. Preview/capture
readiness includes every painted section and final native measurement. Complete scripture,
meaning and commentary remain native text.

## R2 delivery

All 28 backgrounds use the existing `devotional-share` R2 category and persistent cache.
The eighteen new objects were uploaded with immutable cache headers.
`prepare-devotional-share.mjs` now includes both original masters and new subjects.

- `--verify --cdn` passed: all 28 public SHA-256 values match reviewed sources.
- Both final iOS and Android exports contain **zero** Daily Bhakti painting files.
  `export-r2-verification.json` records the excluded hashes and public URLs.
- The first native R2 walkthrough began with no devotional cache files, loaded all
  eighteen new subjects and produced eighteen matching persistent files. See
  `native-cache-before.json` and `native-cache-first-walkthrough.json`.
- A normal app restart reused the same downloaded Lakshmi file without rewriting it;
  `native-cache-reuse.json` records its hash/mtime and successful decoded second view.
- Text stays readable on paper during first fetch/failure. Capture refuses missing or
  undecoded paintings; an already cached master remains available offline.

The 330 former neutral additions now have their named subjects; the other 684 additions
keep their existing deity mapping. General prayers and unknown sources remain neutral.
All original ten source files remain byte-identical. The eighteen new WebPs total
4,288,786 bytes; all 28 publishing sources total 22,567,642 bytes (21.52MiB), below the
unchanged 22MiB source ceiling. None enter the app bundle.

## Verification

- Final `npm test`: **3,564 passed** — 2,667 Jest tests/273 suites, 37 widget, 617 engine,
  194 data and 49 Ask tests, plus typecheck.
- Changed-file lint, whitespace, four-script mappings, no-bundle artwork guards,
  publication provenance and both production exports passed.
- `daily-bhakti-art-smoke.yaml`: all eighteen decoded R2 subjects passed on isolated
  iOS 26.5 simulator `BD91E840-482E-4816-838A-9C5247E401DA`. Every subject capture in
  `native/` was visually reviewed against its identity and the original card treatment.
- `daily-bhakti-art-share-smoke.yaml`: complete painted previews in Hindi, English,
  Gujarati and Kannada passed, followed by a real PNG handed to the iOS system sheet.
- `daily-bhakti-full-master-smoke.yaml`: original Ganesha/new Lakshmi comparison,
  normal-restart cache reuse and actual Hindi PNG export passed.
- `daily-bhakti-smoke.yaml`: Standard/Large, complete meaning access, languages,
  sharing picker, next verse and preference restoration passed.
- Actual native captures: [Hindi 1080×1456](native/lakshmi-hi-export.png) and
  [Kannada 1080×1702](native/lakshmi-kn-export.png). Both were visually inspected;
  `native-export.json` records hashes. Nothing was sent to another person.
- Used the existing Debug shell and this checkout’s Metro on port 8093. Reconciled main
  through `23b99e0c`, retaining its R2 migration and readable verse-wrapping fix.
  No native build, OTA, version bump, PR merge or release was performed.

Android-device rendering, physical-device QA and WhatsApp delivery remain unverified.
Production exports establish packaging only.

Earlier attempts exposed Metro heap exhaustion, an XCTest transition error, premature
preview capture and the missing short-card paper band. Final runs used Node 22 with a
12GiB Metro heap and explicit transition/paint readiness. Historical rectangular-header
evidence under `../daily-bhakti-art-508/` is explicitly superseded.

Reproduce from `mobile/` with an isolated simulator and Metro on port 8093:

```sh
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-art-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-art-share-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-full-master-smoke.yaml
maestro --device <UDID> test -e METRO_PORT=8093 .maestro/daily-bhakti-smoke.yaml
```
