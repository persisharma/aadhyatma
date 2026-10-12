# Option 2 completion audit — 9 October 2026

The approved design is implemented locally. The goal is blocked on the native/device checks
below. No commit, PR or app release was requested or performed.

| Requirement | Evidence and status |
| --- | --- |
| Review inconsistent reading surfaces | Source inventory covers all 113 screen files. Shared prose treatment corrects Vrat, Pitru introduction/story and Daan; verse/task-specific structures and kids content are preserved. Native walkthrough is representative, not exhaustive. |
| Before/after and visual approval | User selected Option 2. `approval-preview.html` shows actual English Standard before/after; `design-comparison.html` pairs the approved concept with native output. |
| Improve existing visuals/background | New paper and Vishnu/Narayana artwork adopted; existing semantic mapping reuses the improved Vishnu painting. Complete opening paintings and compact later-section art retain reading space. |
| R2 and small offline fallback | All 45 manifest assets published and host HTTP/hash verified. Both final exports bundle only the 3,102-byte neutral paper from this set. Prose uses an existing manuscript icon during download/failure. |
| Download once per content version | Persistent hash/extension keys, no TTL/HEAD/revalidation/automatic valid-file eviction; restart/host-change/deletion tests pass. Changed hashes fetch separately. Interrupted or damaged files retry for recovery. |
| Immediate reading and navigation | Async disk/native download APIs; work deferred until focus/interactions; bounded concurrency, timeout, cancellation, deduplication and atomic promotion. Reserved art frames avoid image arrival layout shifts. This establishes implementation behavior, not physical frame/memory performance. |
| Failure and content integrity | 74 final focused tests pass, including 21 cache and four paragraph regressions. Indic QA found and fixed native last-line clipping without changing source text. TypeScript, focused lint and both production Hermes exports pass. |
| Native online download | Open: simulator proxy rejects TLS with -1200. Genuine fallback captured; cache/decode screenshots use recorded hash-identical fixtures. No certificate validation bypass. |
| Native gestures and full matrix | Open: coordinate drag/wheel input is inconclusive. Accessibility targeting reaches sections and scoped endpoints. Full Kannada Large endpoint, remaining language/family combinations and complete screen walkthrough remain. |
| Physical performance / Android | Open: registered iPhone unavailable and Android runtime absent. No physical frame, memory or touch performance conclusion. Development trace includes pre-existing JS stalls. |

The preceding follow-up made concrete progress by correcting observed native clipping and
extending failure-path coverage. This continuation re-read the cache, loader, approved folio
and recorded evidence. `xcrun devicectl list devices --timeout 5` still reports the registered
iPhone 14 unavailable; `adb` is absent. Metro remains live on port 8092 (PID 37876), so the
development server is not the blocker. The native CDN certificate failure and lack of a usable
physical test device have persisted across three consecutive approved-direction goal turns.

The required physical-device measurements cannot be established with more mocked tests, host
downloads or production exports. No further code defect was established by this audit. The
goal is blocked until a physical device is available and the native app can reach the CDN
through a network trusted by iOS. Certificate validation remains enabled. The remaining
language/gesture/native review checks are retained above for the resumed verification run.

See `review.md`, `checks.json` and `approved-assets/bundle-assets.json` for detailed evidence.
