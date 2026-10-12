# Detailed Style 3 approved integration — 11 October 2026

The user accepted the three detailed Style 3 samples, then accepted the remaining set with
gadas requested in the ocean-crossing and Rama–Hanuman scenes, and explicitly authorized
integration. Both corrections were generated and visually checked. All 43 unique banners
are published on R2 and active for 44 semantic slots; both Vishnu background versions map
to the same illustration. Existing reading backgrounds are preserved.

Open [the full gallery](index.html). **Before + after** compares every selected painting with
its composition reference. The earlier three-scene comparison remains in
[style3-detail](../style3-detail/index.html). This is an artwork review, not a native app capture.

## Assets and composition

- All selected WebPs are exactly 960×480, shown whole with `contain` in a fixed 2:1 frame,
  up to 360×180 pt. Masters are retained separately.
- Selected files total 4,670,792 bytes (4.45 MiB); individual files are 62,452–135,112 bytes
  (61–132 KiB), averaging 108,623 bytes. These are file sizes, not device performance evidence.
- Built-in image generation used each scene reference plus unchanged Krishna story artwork
  `kj-08.webp`/`kj-11.webp` for rendering guidance. No kids-story file, narrative, caption or
  framing metadata changed. Scene-specific prompts preserve subject roles, attributes and
  details while allowing new horizontal arrangements and generative fine-mark variation.
- `selected-records.json` identifies every exact selected variant, source/master, prompt,
  references, full SHA-256 and legacy aliases. `actual-prompts.json` retains the 40-scene
  generation and repair jobs; the three pilot prompts remain in the sibling sample records.
- Original and repaired variants were visually inspected during generation. Repairs addressed
  clipped crowns, finials, weapons, vahanas and tassels, plus connected arm counts. This review
  does not substitute for human iconography acceptance or native reader/device verification.

## Selected repairs

| Subject | Selected correction |
| --- | --- |
| Chalisa | Complete mala loop and tassel |
| Durga | Eight connected arms; held bow connected to its hand |
| Narasimha | Crown and complete figure inside the frame |
| Surya | Complete halo, four arms, charioteer and seven horses |
| Shani | Four connected arms |
| Rama Darbar | Complete parasol finial and figures |
| Gayatri | Complete outer sun mandala and altar objects |
| Jeen Mata | Shrine finial and three bee carvings retained |
| Karni Mata | Complete façade finials and six mice |
| Gogaji | Complete spear, flag and horse hooves |
| Khandoba | Complete sword tip and horse hoof |
| Khatu Shyam | Complete principal arch/parasol; extra peacocks removed |
| Salasar Balaji | Shrine framing, icon and offerings contained |
| Vetrimalai Murugan | Complete arch, spear, peacock tail and feet |
| Hanuman crossing the ocean | Requested gold gada in right hand resting on shoulder; complete figure and weapon |
| Rama and Hanuman | Requested gold gada beside kneeling Hanuman; namaste and blessing retained |

## Verification and integration boundary

`build-gallery.py` verifies selected hashes/dimensions, 43 distinct IDs, all 44 aliases and
unchanged background manifest/source/cache hashes. `approval-decision.json` records user
acceptance, the two requested corrections and integration authorization. `approved.json`
contains exact full SHA-256 values under `krishna-storybook-detail-v2`.

`node scripts/prepare-reader-illustrations.mjs --upload --wrangler` uploaded all 43 objects
before writing the app manifest. `--verify` passes for all 43 approved files. The independent
`verify-r2-publication.mjs` performs bounded HTTPS GETs with default certificate validation;
every response is HTTP 200, image/webp and matches the complete approved SHA-256/byte length.
See `r2-publication.json`. `manifest-candidate.json` now records active/published state.

Eight focused suites/205 tests and TypeScript pass. Focused lint has zero errors and four
existing test warnings. Production Hermes exports for iOS and Android succeed and contain
zero of the new banner files; only the existing 3,102-byte paper from the reading-art set is
bundled. See `jest-results.json`, `test-results.json` and `bundle-assets.json`. These checks
do not establish physical performance.

Fresh final-gallery review confirms all 86 comparison images load with no horizontal overflow;
new image URLs include their selected content hash to avoid stale preview images. Earlier
responsive review confirmed every new frame uses `contain` within 360×180 px; at 390 px,
the 43 new frames are 328×164 px with no overflow. `browser-integration-checks.json` records
the current loaded sources. The two requested corrections are shown in
`hanuman-gada-corrections.html` and `hanuman-gada-integrated.jpg`. Earlier gallery screenshots
remain historical framing evidence.

Both categories share the existing async Documents cache, content-hash identity, bounded
two-download queue, focus/interaction deferral and immediate bundled fallback. Valid files
have no TTL, HEAD request, revalidation or automatic eviction. A new content hash, deleted
storage/uninstall or corruption recovery permits a new download. Background layers retain
their current sources. No runtime or asset-cache change was needed to activate this set.

Historical publisher fixture evidence (`publisher-readiness.json` and
`publisher-stage-candidate.json`) predates the final gada edits and acceptance. Current
publication evidence above supersedes its empty-manifest state; the fixture still records
stale-approval rejection behavior.

## Current native verification

Generated the ignored iOS project and installed Pods for standalone Release QA. The
`build_run_sim` call timed out at 300 seconds, but its signed app artifact was built, installed
and running; subsequent stop/launch tools succeeded. Reader taps and scroll gestures work.
The current Durga banner request fails certificate validation with `NSURLErrorDomain -1200`
(`-9802`). Native text, controls, navigation and the immediate manuscript fallback remain
usable. See `native-r2-transport.log` and `native-durga-fallback.jpg`.

To inspect approved-art framing separately, copied all 43 exact approved/public-hash-matched
files into the dedicated QA app's Documents cache. These are controlled local fixtures, not
successful native downloads. Durga and Daan Katha show the complete short 2:1 canvas; Katha
scrolls through the final paragraph, teaching, source and onward actions. After process stop
and relaunch, all 43 files retain identical SHA-256, byte length, timestamp and inode, with
zero partial files; Durga decodes from cache. See `native-integration-checks.json`,
`native-fixture-{before-relaunch,relaunch}.json`, `native-durga-cached-relaunch.jpg`,
`native-katha-cached.jpg` and `native-katha-endpoint.jpg`.

Successful native CDN delivery, the full reader/language/size walkthrough and physical-device
performance remain unverified. Earlier Expo Go navigation failure was isolated to that QA
attempt; standalone navigation succeeds. Store-listing simulators were untouched. No commit,
OTA or store release was performed.

Latest ocean-crossing refinement: see `sea-shoulder-revision.md`. The current selected image
uses the requested right-hand shoulder carry; earlier native captures predate this refinement.

## Final integration audit

The later [integration audit](integration-audit.md) supersedes the older build/test counts
above: 238 suites/2,192 tests and TypeScript pass; fresh iOS/Android exports contain the final
Hanuman hash and zero banner bitmaps; a new standalone iOS Release build/install/launch
succeeds. All 88 public R2 objects and manual-package assets match their active manifests.
Source inventory covers 21 verse readers and 11 additional reading screens. The corrected
ocean banner now has native cached-fixture framing evidence, and all 44 controlled files
remain unchanged after restart. Native R2 still fails simulator TLS trust (-1200/-9802)
with a working fallback. Trusted native delivery and physical-device performance remain open.
