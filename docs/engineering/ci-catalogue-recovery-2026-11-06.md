# CI catalogue and compact-resume recovery — 6 November 2026

Base: `7d057e95cb3cf0a39aa6d090d7d9a00cc1972755` (merged banner PR #631).
This follow-up changes tests, CI and verification policy; it does not alter
product content, artwork, publication gates, progress or native dependencies.

## Observed causes

1. The prepared Parshuram addition grew the deity/artwork catalogues, but three
   older Jest assertions still expected previous totals or compared a complete
   mapping to the filtered public list. Exact key-set coverage now uses the full
   owning catalogue. Published R2 requests are still required for every enabled
   routine subject; every prepared icon is rendered and checked against its named
   bundled painting.
2. Doha tests assumed 84 originals and 18 prepared Suvichar subjects. There are
   newer originals and a prepared but unpublished subject. The tests preserve the
   first 84 stable original IDs, exercise doha eligibility for the full catalogue,
   and require daily templates only for enabled subjects. Disabled subjects must
   have no public daily card. The eight-poem canonical count remains fixed.
3. Android's native failure capture shows the restored Continue reading panel,
   with its action below the compact viewport. Persistence was not lost. The
   cold-restart smoke now scrolls to the action before tapping and still asserts
   the exact second page.
4. CI stopped at the first failing reader shard and skipped later independent
   checks. It now executes all three shards and all logic gates, retaining a
   failing result for any failure. Widget and Ask suites join the CI gate as
   already required by `npm test`. Both asset exports run independently; CDN
   verification still requires both successful asset maps.

## Evidence and limits

- Before: all three targeted Jest suites failed; the Doha suite had three
  failures, including an undefined card for an unpublished subject.
- After: all 20 targeted Jest tests and all five Doha integration tests pass.
- Full local reader/component run: 354 suites / 3,489 tests pass. Widgets 46,
  engine 772, data 223 and Ask 49 pass. TypeScript and instruction policy pass.
- Literal local `npm test` reaches TypeScript, then the tsx CLI fails opening an
  IPC socket (`EPERM`). The same Node-suite file lists pass through
  `node --import tsx --test`; this is not a claim that the literal command passed.
- Workflow/flow YAML parsing is syntax evidence only. Required CI for the new
  remote head and native reruns remain pending until their actual results exist.
- The previous iOS artifact reports XCTest driver startup timeout before the
  app flow. Its app build passed. That is infrastructure failure, not successful
  Sanatan native verification or evidence that the Android flow fix works on iOS.

No rendering or authored content changed, so visual-design and editorial changes
are N/A for this follow-up. Native journey execution remains a separate gate.
Keep the follow-up draft until required gates pass; no release is included.
