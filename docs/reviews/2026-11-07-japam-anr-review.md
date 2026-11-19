# Japam performance and ANR follow-up

Reviewed baseline: `3f84859a980eadf03731e865d50b8ae6b891ac00` (main after merged PR #638).
Scope: review the introduced seamless Infinity/karaoke/cadence changes, add an
explicit ANR rule to the shared checklist, and strengthen lifecycle coverage.
This follow-up does not change runtime code or the approved design.

## Findings

- No new blocking loop or per-frame JS state/timer was identified in the
  reviewed Infinity/karaoke changes. One host-owned native phase drives marker
  transforms and word colours; installed RN 0.81.5 allows native `color`.
  Whole-word timelines are memoized; current catalogue has at most 16 word runs.
- Eight motion interpolation nodes and decorative ring elements are reused
  across count updates. Four slow ring rotations use the native driver and
  `isInteraction: false`; layout generation is capped at 160 tokens per ring.
  Measurements run on first layout, not on each frame or bead.
- Infinity/ring animations stop on background/blur/unmount and ignore stale
  completions. Reduced Motion removes moving decoration/word-colour animation;
  the single recitation/count clock continues by design. Audio alone owns
  automatic counts while playing. The existing audio 250ms polling interval
  remains bounded and is cleared on unmount; this PR introduced no extra audio
  interval or per-word timer.
- Existing persistence remains a profiling risk: `JapamCounterContext.persist`
  serializes counter entries, and `UserActivityContext.persist` serializes the
  complete saved daily history on bead updates. AsyncStorage is asynchronous,
  but JSON serialization precedes it on the JS thread. This predates #638;
  no regression or ANR is established here. Large real histories and I/O must
  be included in device comparisons before asserting acceptable responsiveness.
- No newly introduced ANR-causing path was established by source review and
  automated checks. This is not evidence that the native app is ANR-free.

## Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Focused Japa/karaoke suite | PASS | `npx jest --config jest.config.js --runInBand --testPathPattern='(Japam\|japam\|Karaoke\|karaoke\|colors.contrast)'`: 199 tests, 21 suites |
| Repeated ring lifecycle cleanup | PASS | New component regression: 25 background/foreground transitions stop four rings, reject stale completions, resume four rings, and reject callbacks after unmount |
| Continuous-cycle structure | PASS | Existing 10,000-cycle test: one active motion, exactly-once counts, no stale restart |
| Allocation reuse and ownership | PASS | Existing 108-count interpolation reuse, memoized ring reuse, karaoke reuse, audio ownership and pause/resume tests |
| TypeScript / whitespace | PASS | Local `tsc --noEmit`; `git diff --check`. Initial typecheck needed the unchanged tracked Mahakaal source fixture restored from sparse checkout |
| Agent instruction verification | PASS | `node scripts/verify-agent-instructions.mjs`: entry points, policy groups, links and evidence template PASS after restoring unchanged tracked files omitted by sparse checkout |
| Full repository CI | PENDING | Focused suite is not the full mobile gate; check CI on the published PR head |
| Native Android/iOS responsiveness, ANR/hang logs, memory | PENDING | No attached native device, adb or xcrun; no telemetry inspected |
| Language/layout visual changes | N/A for this follow-up | Runtime/UI code unchanged; prior #638 native visual acceptance remains separate and unresolved by this review |

The new universal checklist U10.1 requires bounded thread work, lifecycle cleanup,
lazy assets, release-mode baseline comparison on a lower-configuration Android
phone, at least 20 minutes for continuous features, realistic saved histories,
ANR/log review and explicit PENDING when device evidence is unavailable. It
forbids treating synthetic tests or no reported crashes as an ANR-free guarantee.

Before accepting the runtime performance claim, profile the merged feature on
Android (and iOS hangs separately), exercise longest chants/large text, maximum
speed, audio, navigation and background transitions, and inspect frame time,
responsiveness, memory trend and ANR logs against the preceding release.
Record the tested build/device and evidence. No build, release or OTA was made.

Acceptance: U1/U2/U8/U11 scope and current-main review PASS; U9 automated checks
PASS with full CI/native evidence PENDING; U10 source review PASS with device
performance PENDING; U12 remote preservation is recorded in the follow-up PR.
C8/C9 lifecycle checks apply. Other content, artwork, calendar, export and
release conditional checks are N/A to this test/documentation-only change.
