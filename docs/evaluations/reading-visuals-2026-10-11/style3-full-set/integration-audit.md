# Final reader-art integration audit — 11 October 2026

The current checkout integrates all 43 approved Style 3 banners through 44 semantic aliases.
The final ocean-crossing Hanuman carries the gada in his right hand on his shoulder; the
Rama–Hanuman scene retains its approved gada. This audit found no missing mappings or
runtime regression requiring a code change. Integration is local; no OTA/store release
was performed in this audit.

## Scope and delivery

- Seven shared verse-page layouts cover 21 reader screens. Eleven additional Katha, Pitru,
  Daan, Daily Bhakti, Vidhi and Theerth screens use the shared banner/prose components.
  `integration-audit-screen-map.json` lists each screen. Kids-story content is unchanged.
- All 43 banner source/approval/active-manifest hashes and 45 existing background hashes
  match. All banners are 960×480. Background and illustration categories remain separate.
- Fresh host HTTPS GETs, with default certificate validation, verify all 88 public R2
  objects: HTTP 200, exact complete SHA-256, byte length and image content type. See
  `r2-publication.json` and `integration-audit-background-r2.json`.
- Every upload-package source file, copied image, ZIP entry, R2 key and both manifest copies
  matches the active app. The upload package remains `../r2-upload-ready/` and the sibling
  `../reading-art-r2-upload.zip`.

## Layout, loading and persistence

`ReadingBanner` shows the full canvas with `contain`, in a reserved 2:1 frame capped at
360×180 pt. It never waits for downloaded dimensions or moves text when the art arrives.
The neutral manuscript/paper fallback paints immediately. Text and controls remain independent
of network completion. Native checks below confirm the final image and fallback states.

The shared cache performs asynchronous disk operations after navigation focus/interactions.
Persisted hits resolve independently of the two-slot download queue; misses have an eight-second
timeout and cancel when their last viewer leaves. Only complete, nonempty HTTP 200 downloads
are atomically promoted from partial files. Native decode errors recover to the fallback.

Valid files persist in Documents by content hash and extension. There is no TTL, HEAD request,
network revalidation or automatic valid-file eviction. Changed content, deleted storage or
uninstall permits another download; interrupted/corrupt files can retry. Regression tests
exercise restart reuse, CDN-host changes, failed downloads, cancellation and disk failure.

## Fresh automated and build evidence

| Check | Result |
| --- | --- |
| Full UI/Jest suite | 238 suites, 2,192 tests passed; zero failures |
| TypeScript | Passed |
| Focused lint, 51 changed/new TypeScript files | Zero errors; five existing warnings |
| Diff whitespace check | Passed |
| iOS and Android production Hermes exports | Passed; latest Hanuman hash in both |
| New banner bitmaps bundled | Zero; the 3,102-byte paper fallback remains bundled |
| Standalone iOS Release build/install/launch | Succeeded in 82.9 seconds; zero build errors |

Exact records: `integration-audit-jest.json`, `integration-audit-jest.log`,
`integration-audit-lint.log`, `integration-audit-bundles.json`,
`integration-audit-export.log`, and `integration-audit-native-build.json`.
Lint warnings concern an existing unused theme binding and test import/array conventions.
Native build warnings concern existing Pods/script phases and Hermes global analysis.

## Native evidence and remaining checks

Used only the dedicated `Vedansh-Reading-Art-QA` iOS simulator
`BD91E840-482E-4816-838A-9C5247E401DA`. The rebuilt app contains the final Hanuman hash.
Navigated Hanuman Chalisa pages 1–20, including Rama–Hanuman and the ocean scene.

The fresh request for `reader-illustrations/47df1919b9ee3f38.webp` still fails native TLS
trust with `NSURLErrorDomain -1200`, underlying `-9802`. The final file was absent from
Documents after the failed request, with no partial files. The manuscript fallback, scripture,
scrolling and navigation remain usable. Expo service requests also fail trust; their logs show
a corporate certificate-inspection chain. This suggests an environment trust issue, but does
not establish the precise CDN certificate chain. No TLS or trust settings were changed.
See `integration-audit-native-r2.log` and `integration-audit-native-sea-fallback.jpg`.

To inspect final native framing independently, copied only the exact approved, publicly
hash-verified Hanuman file into the QA cache, then changed tabs and returned. The full
short canvas renders with the right hand gripping the shoulder-carried gada; head, tail,
feet and weapon are inside the image. `integration-audit-native-sea-cached.jpg` records it.
Rama–Hanuman also renders whole with its gada from the previously controlled cache.
These are local-fixture decode/framing checks, not successful native downloads.

All 44 controlled cached files, including the superseded valid ocean variant, retain their
SHA-256, size, mtime and inode after navigation and process stop/relaunch. No partial files
remain. See `integration-audit-native-fixture.json`. Historical native Katha endpoint and
Durga framing evidence remains in `native-integration-checks.json` and its screenshots.

Successful native R2 delivery still needs a trusted network/device check. The full native
screen/language/font-size matrix and physical-device launch/frame-time/memory performance
remain unverified. Automated checks, small assets and nonblocking code do not replace those
measurements. This audit changed evidence files only.
