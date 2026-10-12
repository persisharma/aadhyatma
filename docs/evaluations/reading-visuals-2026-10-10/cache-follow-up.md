# Cache loading follow-up — 10 October 2026

A cached painting previously waited behind two unrelated slow downloads because disk lookup
was inside the bounded network queue. The new regression test failed with zero callbacks for
the warm image until a network slot became available.

The cache now performs asynchronous, deduplicated disk lookup before the download queue.
Only misses enter the two-slot queue. A queued miss rechecks storage before downloading, so
a completed overlapping attempt can still be reused. Cancellation during lookup never queues
work or calls a departed viewer. No render-time filesystem calls, new bitmap, expiry,
revalidation or content-key change was introduced.

Validation: the regression failed before the fix; all 236 Jest suites / 2,183 tests pass after
the cache change. The cache suite passes 23 tests, including the new warm-cache and lookup
cancellation cases. Final TypeScript and focused lint pass. Both production Hermes exports
pass; refreshed bundle-assets.json still contains only 3,102-byte paper from the 45-art set.
Existing React act/deprecation warnings are unrelated to these two regressions.

## Current native evidence

- Terminated the isolated Expo Go process (96618), verified it was absent, then relaunched
  (20162). All 44 stored fixtures retained their bytes, full SHA-256, modification times and
  inodes. Screenshot 17 shows the painting decoded after relaunch. See
  native-cache-before-restart.json and native-cache-restart-verification.json.
- Preserved only the explicitly seeded Vishnu QA fixture outside the app cache while the
  process was stopped. Relaunched (24007) and opened Satyanarayan preparation/conduct. Two real
  URLSession requests to the R2 asset still fail with NSURLErrorDomain -1200. The relevant
  native log is native-r2-retry.log; certificate validation remains enabled.
- Screenshot 18 shows the bundled manuscript fallback, full instructions and controls.
  Switching mode and beginning the puja remained possible. Failed attempts left no promoted
  file or partial image.
- Restored the original fixture without changing its bytes, revisited the opening, and
  screenshot 19 shows the cached painting again. The provenance/restoration record is
  native-r2-retry-fixture.json. This is seeded cache recovery, not a successful native R2 fetch.
- Current device discovery reports the registered iPhone 14 unavailable; adb is absent.
  Simulator behavior and Jest do not establish physical frame time, memory or Android runtime.

The preceding goal turn was progress (expanded visuals, image correction and verification).
This continuation also made progress by fixing a demonstrated loading defect and adding
fresh native persistence/failure/recovery evidence. The goal remains active: successful
native CDN transport, physical performance and remaining native review coverage are still
unproven. No commit, push, PR or app release occurred.


## Enlarged reading follow-up

With Large selected, the complete Puja opening remains visible and its instruction scrolls to
the full ending above the pager (captures 20 and 21). Kannada Large Katha opens with the full
painting (22); the final paragraph is reachable, but its full final lines remain unverified.
A rightward scroll did not change the Puja's 1/16 state, so horizontal gesture coverage is
still open. These are scoped native observations, not physical touch evidence. English and
Standard settings were restored afterwards; see native-large-follow-up.json.
