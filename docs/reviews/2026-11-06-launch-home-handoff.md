# Launch animation → Home handoff

PR: https://github.com/persisharma/aadhyatma/pull/621
Base: 38d70305a46f32648440f9d3b132acc2d48aedb5
Tested implementation: ca46cc6a498e86f426ea99b1a45ffb6007308328
Branch: codex/smooth-launch-home-handoff

## Behavior

The old gate removed the canvas before mounting the app, exposing Home's first render/layout burst. The fix retains the exact final canvas as an absolute cover while Home mounts once. Native content layout and two animation frames precede a 180ms native-driver cover fade. Interaction/accessibility and automatic launch asks remain blocked through the fade. A separate 1,200ms deadline starts at formation and is not reset by late layout. Targets, accessibility, interruptions, renderer errors and watchdogs fail open. Cleanup cancels frame requests, animation, timers and listeners. Warm returns never replay.

## Evidence

PASS: 39 focused Jest assertions in the current session (React Native preset 0.81.5, React/test-renderer 19.1, Jest 29). Command: node node_modules/jest/bin/jest.js --config jest.focused.cjs --runInBand. Uses real launch components, language/theme and visibility store, an inert AsyncStorage package boundary, and the suite's WebView mock. Native completion is controlled explicitly where elapsed playback matters. This temporary source harness is not a full native checkout.

PASS: the initial session substituted all three original launch components; the new retained-canvas regression failed because the original removes the WebView immediately. Fixed sources restored before the passing suite. This negative-control run predates the latest main base; current component base hashes remain unchanged.

Coverage: retained final canvas, mount/layout/paint ordering, touch/accessibility suppression, shared-store automatic asks, native-driver config, one mount, targets, cold/warm returns, accessibility/interruption/error exits, watchdog deadlines, stale callbacks and cleanup.

Native lifecycle Maestro adds cover removal/content visibility and immediate Home → Search → Back, then retains warm/next-cold assertions. Native execution and actual visual smoothness are pending.

## Acceptance

| Checks | Status and limit |
| --- | --- |
| U1/U2 | PASS current main/instructions/source and defined covered-handoff acceptance. |
| U3/U4 | PENDING installed iOS/Android comparison; Hindi/English/Gujarati/Kannada × Standard/Large, compact/enlarged system text. No changed artwork, text or Home geometry. |
| U5/U6 | Automated PASS; native cold/warm/notification/widget and first-tap journeys pending. |
| U7 | N/A new content/assets. Approved source, artwork, fonts and manifests unchanged. |
| U8 | PASS scoped review of AppReadyGate preferences/seeded safe areas and shared brand-visible launch surfaces. |
| U9/U10 | Focused PASS; full mobile npm test, lint/typecheck/exports, final CI and native startup/performance pending. Source tests cannot prove smoothness. |
| U11 | Current-main base; matching design/RULEBOOK/wiki updated; final CI pending. |
| U12 | Implementation remotely preserved and PR raised; matching documentation in the follow-up commit. No sole-copy cleanup. |
| C6/C9 | Applicable launch/lifecycle/target/accessibility/gesture checks. Automated coverage above; native acceptance pending. |
| C1/C2/C3/C4/C5/C7/C8/C10 | N/A new content/artwork/share/calendar/saved-data/playback/release contracts. Navigator mount retention covered by U5/U6. |

Keep draft until full CI and required installed acceptance pass. No merge, signed build, version bump, store upload or OTA performed.
