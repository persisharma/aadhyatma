# Japam Infinity — fast cadence, shared karaoke and performance review

## Scope

Infinity now uses the shared whole-word karaoke renderer on the same phase as
the jyoti. Configurable speed, pause and loop reset remain owned by the counter.
Other readers’ स्वतः wiring is deferred by the user; the shared model and
integration contract are prepared without changing those readers.

Approved Option 1: the Infinity visualization sits directly on parchment with
no dark enclosing card or border. Both Mala and Infinity now show only current
beads and completed malas; the separate daily tally and vertical stats divider
are removed. Reset remains at the right of the completed-malas row. The screen
no longer subscribes directly to the activity ledger to display that tally.
Provider activity recording and persisted counts remain in place.

The prior temporary checkout was reset between turns. The approved changes
were reconstructed on the same main baseline, together with this performance
review. Prior local commit identifiers no longer identify this checkout.

## Performance findings and changes

- Native transforms already drive every frame. The callback into JavaScript
  occurs on a completed mantra-specific cycle, not on every display frame.
- **Confirmed allocation churn:** 108 count updates created 872 interpolation
  objects in the original component (8 initially plus 8 on each update).
  Reuse the original 8 nodes for those same updates; rebuild only when geometry
  changes. This is a JS allocation assertion, not a native heap measurement.
- Reuse decorative side-ring elements across count updates, avoiding repeated
  shaped-word render work. Text/font, size, focus, theme and Reduced Motion
  changes still update the rings.
- Mark Infinity marker/ring and Mala audio-pulse `Animated.timing` configurations as
  `useNativeDriver: true, isInteraction: false`. Continuous decoration should
  not reserve interaction priority for the whole practice session.
- The loop remains one active native cycle. Pause, cancellation, background,
  blur, unmount and duplicate/late callbacks retain their existing guards.
- The static 216-sample path, one phase, three trail dots, and at most four
  rotating ring containers stay bounded. No per-frame JS listener, interval,
  image decoding or animated SVG path rebuilding is introduced.
- The approved transparent design removes the dark rectangle and side glow
  layers. The copper path, ivory marker rim and sepia counts retain the light
  design contrast guards.

React Native documents the native driver and the non-interaction setting:
https://reactnative.dev/docs/animated

## Evidence

- New performance assertions first reproduced three failures on the original
  code: interpolation churn, re-rendered ring word elements, and default
  interaction priority. They pass after the change.
- Final focused run: **152/152 tests across 15 suites PASS**. Covers component
  allocation reuse, ring reuse, geometry, loop cancellation and ownership,
  actual counter provider, hydration/style persistence, font scaling, colour
  contrast, all 22 canonical mantra cadences, audio cadence/rate handoff and
  stale previous-recording rejection. The screen checks both styles in Hindi, English, Gujarati and
  Kannada at M/L (16 cases), including absence of the daily tally and presence
  of current beads, completed rounds and Reset.
- Two new duration/resume regressions also FAIL against the original fixed-880ms
  component/driver and PASS after the cadence change. The original files were
  restored temporarily for that check and the new implementation restored in
  a `finally` block.
- A **10,000-cycle synthetic driver stress test PASS** verifies one active
  animation, exactly-once increments and no restart/count from duplicate or
  stopped callbacks. This is not a physical-device endurance or memory test.
- TypeScript PASS. Maestro YAML parses; native execution PENDING.
- The repository `npm test` entry point encounters the environment's `tsx`
  CLI Unix IPC restriction (`listen EPERM`). Wider Jest results are recorded
  below; they are distinct from the focused Japa evidence.

## Remaining device evidence

A guarantee of smooth operation on lower-end hardware is **not established**.
There is no attached native phone/emulator, adb, Maestro or xcrun in this
execution environment. Browser screenshots and synthetic tests cannot supply
Android frame time, GPU cost, native memory, thermal or battery measurements.

Before merge, run a release-mode build on a representative 2–3GB Android phone
for at least 20–30 minutes, using long mantras and enlarged text, then repeat
start/pause, navigate Back/reopen, and background/foreground. Compare frame
stability, pause responsiveness and native memory after warm-up; inspect heat
and battery use. Repeat with audio and Reduced Motion. Verify stopped/background
sessions have no counting or stray work and no native memory trend.

Per-bead persistence, activity-history serialization and haptics still happen
through the existing providers (about 1.14 cycles/sec while silently running).
Large historical activity stores and physical-device I/O are residual profiling
items. They were not redesigned or silently dropped to make a synthetic result
look faster.

## Acceptance and handover

- U1/U2: PASS — current repository policy, wiki, source and user reference.
- U3/U4/U5/U6: component/provider evidence PASS; native fidelity, the complete
  entry/Back journey, four-language M/L, compact/system-text and lifecycle
  matrix PENDING on iOS and Android.
- U7: N/A — no artwork, content, manifest, publication or dependency change.
- U8: PASS — the shared ring component is only used by Infinity. The same
  interaction-priority issue was found and fixed in the Mala audio pulse; a
  new test fails before the fix and passes after, including stop-on-pause.
  Other intentional dark surfaces are unchanged.
- U9/U10: focused tests/typecheck PASS; native E2E and real low-end profiling
  PENDING. No FPS, battery, heat or native memory claim is made.
- U11: source, design §35, wiki and smoke capture updated together; remote CI
  PENDING.
- U12: local branch `codex/japam-seamless-parchment`; remote preservation and PR
  remain PENDING explicit push authorization after the previous automatic
  approval rejection. No workaround push, merge, build, store or OTA was run.
- Conditional groups C7/C8/C9 apply: automated checks PASS, native matrix
  PENDING. C1–C6 have no changed content/asset/export/calendar/consent flow;
  C10 release is outside scope.

Keep a future PR in draft until required native checks and the full CI gates
are satisfied. No worktree cleanup has been performed.

## Wider gate status

The attempted full Jest run (before the final Mala pulse sibling fix) passed
346/357 suites and 3373 tests, with 11 failed suites. Eight failures were
missing files in this sparse checkout; fixture restoration and targeted reruns
are recorded separately. Three reader suites fail while loading
`react-native-webview/index.js` ESM through the YouTube player. The isolated
`readerReadAloud` rerun reproduces that parse failure; these reader/player
sources are not changed by this branch. Full-suite/CI acceptance remains
PENDING, not green. The final 138 focused tests include the sibling pulse and subsequent full-mantra cadence changes. The whole suite was not rerun after those changes; CI remains pending.

Physical-device native E2E and performance acceptance remain PENDING regardless
of these automated results. Only local commits exist; publication still needs
the user's explicit authorization following the prior automatic-review block.

## Revision and final status

Base: `a264b1af40cca0622ec588c8efcecc3cd779e837`.
Tested implementation/review head: `2d04da3ffc4e1858e50d28d02cc4bbde88f19f4c`.
Source checkpoints: `f9d98c1`, `1c6d940`, `e4f35fd`; design/contract head `16ffcf1`.
Remote head / PR / native verification / release: PENDING or not performed.
Only source, regression tests, design/wiki, smoke guidance and this report are
required deliverables; restored upstream test fixtures are not task changes.

## Current default — user-approved fast recitation preset

This supersedes the earlier slower estimates. At 1×, chants with up to three
spoken words use 880–1000ms and full Gayatri uses 4000ms. Other long mantras
scale with canonical phonetic length at 125ms per weighted unit. The existing
speed control remains configurable; playing audio retains its decoded average
recitation cadence. These are requested pacing defaults, not measured speech.

| Mantra | Default complete-loop time |
| --- | --- |
| ॐ नमः शिवाय | 1 s |
| हरे कृष्ण महामंत्र | 4.4 s |
| गायत्री मंत्र | 4 s |
| ॐ नमो भगवते वासुदेवाय | 1.9 s |
| राधा नाम जप | 0.88 s |
| जय श्री राम जप | 0.88 s |
| सरस्वती मूल मंत्र | 1.3 s |
| महामृत्युंजय मंत्र | 4.6 s |
| ॐ गं गणपतये नमः | 1.4 s |
| ॐ नमो नारायणाय | 1 s |
| हनुमान मूल मंत्र | 1.3 s |
| श्री राम जय राम | 1.8 s |
| दुर्गा बीज मंत्र | 1.2 s |
| सूर्य बीज मंत्र | 1.6 s |
| चन्द्र बीज मंत्र | 1.7 s |
| मंगल बीज मंत्र | 1.6 s |
| बुध बीज मंत्र | 1.6 s |
| गुरु बीज मंत्र | 1.6 s |
| शुक्र बीज मंत्र | 1.6 s |
| शनि बीज मंत्र | 1.9 s |
| राहु बीज मंत्र | 1.6 s |
| केतु बीज मंत्र | 1.6 s |

Gayatri at 0.5× / 1× / 1.5× is 8s / 4s / 2.667s. Short-word limits describe
the default 1×; changing Tempo scales the full loop. Thirteen updated assertions
failed with the preceding slow preset, then all 138 focused tests and TypeScript
passed with the requested timings. No native verification or remote publication
is implied. Other performance, identity, audio-ownership and persistence guards
remain as described above.

## Shared karaoke delivery

- Runtime integration: `JapamCounterScreen` owns one phase passed to
  `JapamInfinity` and `KaraokeText`. Whole words progress from `ink` to
  `saffronDeep`, hold with the paused marker and reset on each loop/new content.
  The renderer does not count or navigate. Reduced Motion renders static ink.
- Shared code: `karaokeTiming.ts` builds normalised word intervals and applies
  caller-configured speed without importing Japam, audio or navigation.
  `KaraokeText` accepts host typography, full lines and a host phase, including
  read-only derived phases for sequential verse/meaning blocks on one clock.
- Reference weights preserve canonical timing across scripts and changed line
  breaks when words align. Mismatched translations preserve all text with a
  proportional fallback. Native Text runs preserve complete shaped words;
  accessible output is one full passage rather than one focus stop per word.
- Performance: colour nodes are memoized; 108 host updates do not recreate the
  word graph. No per-frame JS listener or independent timer is added. The
  current 22-mantra catalogue peaks at 16 word runs. These structural checks are
  not physical low-end device FPS, heat, memory or battery measurements.
- Final focused run: **152 tests in 15 suites PASS**, including native-phase
  colour values/order/reset, derived passage blocks, pause, speed, long/short
  cadence, 10,000 simulated driver cycles, complete script/whitespace retention,
  translation mismatches, no new graph nodes across count updates, actual
  counter/provider state, and all four languages at M/L. TypeScript and diff
  whitespace checks PASS. Highlight contrast clears 4.5:1 on all tested paper
  surfaces. Maestro YAML parses; actual native execution remains PENDING.
- Reuse guidance: `docs/engineering/karaoke-integration.md`, design.md §90 and
  `wiki/concepts/karaoke.md`. Other sections are **not integrated yet**. Their
  future स्वतः adapter must expose whole-passage phase, retain selected speed,
  holds/scrolling, completion ownership and existing playback/accessibility
  priorities. The current scroll-step countdown is not that passage clock.
- Current silent defaults remain the user-approved fast preset above (short
  chants 880–1000ms at 1×, full Gayatri 4000ms); audio playback owns its average
  cadence. Highlight timing is visual pacing, not measured spoken word cues.

Native word wrapping/centering, compact/system-text layout, actual entry/Back
flows and physical-device performance are still required before merge. Full CI
is pending for the reasons already recorded. Source, tests and documentation are
committed locally on `codex/japam-seamless-parchment`; the prior automatic-review
block on remote publication remains unresolved until explicit push approval.
No other-reader rollout, remote push, PR, merge, native build or OTA was run.
