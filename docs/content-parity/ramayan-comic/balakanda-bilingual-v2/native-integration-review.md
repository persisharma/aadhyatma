# Native comic reader integration — 2026-10-13

The user requested the corrected 140-panel edition in the app's ordinary reader, removing website/source/review controls. The old mobile entry opened `comics/balakanda-v1/index.html` (137 panels), which was a different artifact from the reviewed bilingual-v2 preview. This integration removes that URL/WebView entirely.

## Behavior and fidelity

- Native 29-episode shelf, shared header/progress/language controls, horizontal swipe paging and vertical overflow. Text size comes from the global Theme/FontScale context. The current panel survives locale/size changes and viewport resizing.
- All 140 panels, source references, Hindi/English narratives, frame geometry, 31 speaker anchors and the approved close-up overlay flag are copied from the reviewed edition. No narrative is added, translated or shortened here. Provenance/pacing reviews remain in the authoring files and are not reader controls.
- `ComicPanel` uses app typography, left-aligned narration above the art and centered natural-height speech. The single SVG outline points to the reviewed horizontal speaker location. The approved side balloon uses a measured clear-area limit, with the reviewed flowing fallback for longer copy.
- The 35 full original PNGs are preserved byte-for-byte at content-hash CDN keys. Native clipping uses the same reviewed sheet rectangles; caption length never controls crop. No new illustrations or altered pixels. `comicAssetManifest.json` and each native panel's SHA-256/frame provide the equivalent geometry/provenance registry required by RULEBOOK §29.1.
- Gujarati/Kannada narratives are still unavailable. The app shows a localized English-fallback notice and preserves the global selected language. No invented translation or transliteration is substituted.

## Automated evidence

- `sync-comic-book.mjs --check`: 29 episodes/140 panels match the review artifact.
- Focused Jest: 35 tests across reader/shelf, catalog, full panel rendering, artwork geometry/retry, data parity, shared cache and lazy registration. Every panel's full text and frames are exercised in Hindi/English at both app reading sizes (560 component states); these are not 560 device screenshots.
- TypeScript and focused ESLint pass. Route/entry/launch-graph tests: 7 pass.
- Production iOS and Android exports pass. `verify-comic-assets.mjs --assetmap` checks the combined export map by source paths and SHA-256; zero comic images are bundled.
- 35 full public CDN GETs returned HTTP 200, `image/png`, and exact reviewed SHA-256 equality. PNG is intentionally retained instead of recompressing the approved image bytes. Evidence is `native-cdn-verification.json`.

## Native evidence and limits

Isolated iPhone 17 Pro simulator `Vedansh-Helsinki-Comic-QA` on iOS 26.5. The first network run exercised native shelf/reader, paging, language stability, and the retry/error geometry. Native downloads failed with `A TLS error caused the secure connection to fail`; host CDN success is not first-download proof. No TLS/security exception was introduced.

For visual layout QA only, the device cache was seeded with the same 35 reviewed, hash-verified PNGs. The production iOS JS export was served to the installed native shell through a local test server after repeated development-server heap failures. This proves native rendering with cached art; it is neither a store build nor a successful fresh CDN download. `.context/native-comic-cache-fixture.json` records the fixture; screenshots and Maestro command reports are under `.context/native-comic-*`.

Executed native flows: the shelf opens the selected episode; bk-06 paging reaches the corrected Vashishtha scene; language changes preserve it; the global settings screen changes Standard/Large; the Dasharatha close-up and its full artwork remain reachable; the final scene shows 140 / 140 in both languages. The native close-up review caught an empty narration strip and a clipped side-tail viewport, both corrected with regression coverage. Final screenshots use the final production JS export and seeded image cache.

Complete all-panel native visual/editorial sign-off, physical-device/Android walkthrough, regional translations, fresh native download on a working trusted network, and OTA/store deployment remain pending. Browser/source review and exhaustive component tests do not replace these checks.
