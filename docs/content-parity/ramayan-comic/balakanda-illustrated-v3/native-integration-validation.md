# Native integration validation

This record covers the reviewed four-language Bālakāṇḍa edition integrated into the existing `balakanda-v1` native route. Artwork remains remote and is cached under the content-hashed `comics/balakanda-illustrated-v3` keyspace; the reader contains 62 grouped pages, 29 episode anchors and 199 framed shots.

## Verified

- `npm run typecheck` passes. The four focused Jest suites also passed during integration: comic reader, comic book data, panel layout and artwork geometry/cache behavior (15 tests).
- iOS Simulator 26.4 Standard smoke passed from the Kids library through episode 6, pages 11–12, Hindi/English switching, and return to the episode shelf. Captured page 12 with its illustration loaded and cached.
- iOS Simulator Large flow passed for page 10 and the final pages 60–62, including Hindi/English switching and the natural vertical scroll that exposes the final panel.
- The production iOS and Android Expo exports contain no comic illustration bytes. Their asset maps are checked in as `ios-assetmap.json` and `android-assetmap.json`, with hashes and checks recorded in `bundle-evidence.json`.
- Every one of the 62 CDN objects returned HTTP 200 with the expected full SHA-256 and PNG content type; see `cdn-evidence.json`.
- The app manifest matches the approved source art and the book data. `sync-comic-book.mjs --check` and the local source/frame/hash verifier pass.

The test network performs TLS inspection with its Netskope root. For visual validation, that root was trusted only in the dedicated simulator; no certificate exception or trust change is included in the app. The simulator test certificate was removed after the walkthrough.

## Remaining review

The previous full-book browser review covers all 62 pages in Hindi, English, Gujarati and Kannada at Standard and Large. The native device pass here samples the key layouts and book endpoints; it is not a manual review of all 62 native pages at both sizes. Human editorial approval of all four full narratives and complete independent source collation also remain open, as recorded in the preview review. These checks should be completed before merging or publishing the comic.

## Follow-up narrative continuity correction — 2026-10-19

Page 17 now answers Rama's hermitage question in Vishwamitra's voice before the Vamana–Bali panels, and the last panel explicitly returns to their present-day arrival at Siddhashrama. Hindi, English, Gujarati and Kannada copy is updated in the source book and native data. The existing artwork, 62-page count and 1–3-row layout are unchanged. A focused regression test verifies the answer → flashback → present order. Native visual review of the added caption and human editorial approval remain pending; do not treat the copy update as final publication approval.
