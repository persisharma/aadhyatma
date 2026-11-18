# Verification — 8 November 2026

Source base: `62d9b6d725e58b93c42cdb239468a647c155af1c`.
This is implementation and automated evidence, not native visual approval.

| Gate | Result | Evidence |
| --- | --- | --- |
| TypeScript | PASS | `tsc --noEmit`, zero diagnostics |
| Full reader suite | PASS | Three required Jest shards: 126/126/125 suites, 1321/1407/1249 tests; 377 suites / 3977 tests total |
| Focused final regressions | PASS | 3 suites / 67 tests; all 13 lessons, exact concept pages, full text/rosters, related destinations, four scripts × both reading sizes, repeated direction selection/unmount, unpublished art |
| Widgets / engine | PASS | Required package commands via `node --import tsx`; identical test files (tsx CLI IPC server unavailable in this environment) |
| Content / Ask | PASS | Complete package gates rerun after adding the artwork-only manifest classification; no scripture provenance rule relaxed |
| Asset staging | PASS | Both SHA-256 hashes, individual <250 KB and combined <500 KB, candidate upload keys generated; runtime manifest remains empty |
| Policy entry points | PASS | `node scripts/verify-agent-instructions.mjs` |
| Native flow shell syntax | PASS | `bash -n mobile/scripts/native-sanatan-matrix.sh`; this is not flow execution |
| Preview | PASS (component only) | All 13 lessons / both comparison states, all 10 direction controls, embedded prepared art, no unresolved asset paths; <1 MB. No native screenshot claim |
| iOS / Android visual, E2E, exports | PENDING | No installed native SDK/device in this environment; CI matrix carries the authored flow |
| R2 delivery / cold decode / cache offline | PENDING | User will upload. Runtime activation intentionally disabled |
| Android release performance / ANR and iOS hangs | PENDING | Requires representative device baseline, frame/memory measurements and native diagnostics |

C1/C2/C3/C4/C9 apply to authored explanations/illustration, upload gating, narration
and sharing, and accessible layouts. C5–C8/C10 are N/A: no widget, reminder,
calculation engine, onboarding, permission or deployment change. Existing shared
widget/calendar/engine tests are still run for integration regressions.

No native build, release or OTA was requested or performed. Keep the review draft
until required native/performance/export and publication checks are complete.

Remote implementation checkpoint: `38135b5ccff44c4594e3b152a7a0e9f2be70416b`,
PR https://github.com/persisharma/aadhyatma/pull/659 (draft; conflict-free when checked).
CI and native acceptance were queued/running when the comparison was prepared.
The prepared image upload package is `vedansh-sanatan-r2-artwork.zip`
(433,821 bytes), separately delivered to the user.

## Reproduce the component comparison

The harness keeps a marked baseline copy of the old exploration component. All
after content uses production teaching components. SSR-only bitmap and IO adapters
permit visual comparison without claiming native rendering or native actions.
Prepared art uses a preview-only candidate manifest; the app's manifest stays empty.

```
node scripts/prepare-sanatan-learning.mjs
node mobile/visual/sanatan/build.mjs
node mobile/visual/sanatan/comparison-build.mjs
python3 mobile/visual/sanatan/assemble-comparison.py /workspace/sanatan-before-after.html
```

The comparison allows lesson/Before/After selection. Its native content controls
are read-only; production selection/route behaviour is covered by regression tests.
Browser Chromium was unavailable, so DOM/control checks and actual-component SSR
are recorded separately from pending browser/native pixel review.
