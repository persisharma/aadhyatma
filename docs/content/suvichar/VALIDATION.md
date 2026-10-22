# Validation — 22 October 2026

## Executed

- TypeScript typecheck passed.
- Full reader/component Jest gate: 280 suites, 2,735 tests passed across three shards in Asia/Kolkata.
- Widget, Panchang engine, data integrity and Ask suites passed.
- Final focused geometry/personalization/source checks: 21 tests passed after the reviewed painting boundaries were applied.
- All 42 full-resolution WebP files decoded completely with Pillow. Five contact sheets were visually reviewed for subject identity, figure counts, text-free body space, consistent frame directions and complete painting boundaries. All source backgrounds and exact hashes are committed; contact-sheet inspection was performed locally.
- prepare-suvichar.mjs syntax check passed. Publication was attempted and refused because required R2 credentials are absent; the runtime manifest remained unchanged and empty.
- git diff --check passed.

The host rejects the tsx CLI IPC socket (`listen EPERM /tmp/tsx-0/...pipe`), so direct `npm test` stopped at that environment boundary. The complete constituent gate was run with the equivalent `node --import tsx --test ...` entry points for its tsx suites. Reader/component scripts explicitly pin Asia/Kolkata, matching the engine gate and India-local date fixtures; unpinned UTC runs had calendar-fixture failures. No production calendar code was changed.

```text
CHECK typecheck
CHECK_EXIT=0
CHECK test:widgets
ℹ tests 37
ℹ pass 37
ℹ fail 0
CHECK_EXIT=0
CHECK test:readers:1
Test Suites: 94 passed, 94 total
Tests:       914 passed, 914 total
CHECK_EXIT=0
CHECK test:readers:2
Test Suites: 93 passed, 93 total
Tests:       1059 passed, 1059 total
CHECK_EXIT=0
CHECK test:readers:3
Test Suites: 93 passed, 93 total
Tests:       762 passed, 762 total
CHECK_EXIT=0
CHECK test:engine
ℹ tests 617
ℹ pass 617
ℹ fail 0
CHECK_EXIT=0
CHECK test:data
ℹ tests 207
ℹ pass 207
ℹ fail 0
CHECK_EXIT=0
CHECK test:ask
ℹ tests 49
ℹ pass 49
ℹ fail 0
CHECK_EXIT=0
```

## Outstanding before merge

1. Publish all 42 assets with authorized R2 credentials, run public byte verification and commit the resulting runtime manifest. Until then image sharing is intentionally disabled.
2. Run mobile/.maestro/suvichar-personalization.yaml on installed iOS and Android apps. This environment has no Maestro, adb, xcrun or native simulator.
3. Inspect actual native cards/PNGs and WhatsApp handoff in all four scripts at Standard/Large, with empty/long names, the complete 280-unit message, every deity/frame, cold cache, decode failure/retry and restart persistence. Source-art review and unit tests do not establish native export fidelity.

No app release, EAS build, deployment, recipient message or automatic festival notification was performed.

## Follow-up export verification

Inspection of react-native-view-shot's installed native implementation found that Android only resizes when both width and height are supplied, and UIKit uses point dimensions at the screen pixel ratio. The composer now supplies both dimensions from its measured card height, using the same platform scaling policy as ShareProvider. It rechecks the active card identity, native measurement and image readiness after waiting for the capture frames, and refuses a stale layout.

TypeScript passed and all 32 focused Suvichar tests passed after this fix, covering Android pixels, iOS pixel ratios 2/3, tall cards, invalid geometry, stale measurements and loss of image readiness. GitHub CI on the prior PR head passed typecheck, reader/component and engine gates; subsequent steps were still running when this update was prepared. Native image inspection remains pending.

Access was checked again: no R2 credentials, Wrangler login, Android SDK, adb, Maestro, xcrun or emulator is available in this workspace. Publishing and actual native WhatsApp verification therefore remain blocked; no hashes were activated.

Production Expo/Hermes exports subsequently passed for both iOS and Android on the capture-fix code commit. Both asset maps were inspected against all 42 source master IDs and the Suvichar source directory; neither bundle contains any Suvichar background. Exact export/asset-map hashes are recorded in export-verification.json. These are JavaScript compilation and asset-graph checks, not installed-native or WhatsApp verification.
