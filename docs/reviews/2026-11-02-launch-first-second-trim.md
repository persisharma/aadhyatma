# Launch first-second trim — 2 November 2026

Base: `9a131208590858e96ac28e18cb59d2075d9c834e` (includes merged #601).
Request: cut the first second before animation elements become visible; subsequent correction: play only after a full kill/reopen, never on background returns.

Native playback now starts at 1,000ms of the approved 3,350ms timeline and ends at its exact final frame. The remaining motion plays at its original speed for 2,350ms. The native canvas still waits for splash dismissal; it paints the first trimmed frame before becoming visible. The source fragment, composition, lettering, Hindi dots, icon, subtitles and download timeline are unchanged. Existing target, accessibility, lifecycle and watchdog exits remain. The host cancels its own requestAnimationFrame on pagehide.

PASS: regenerated native wrapper reproduces the prior document hash exactly before the change; the new document embeds the unchanged approved fragment and has matching byte count/SHA-256 in its manifest. Direct execution of the generated bridge passes 11 deterministic checks: decode/readiness wait, hidden pre-start state, first frame at 1,000ms, duplicate-start guard, 3,349ms pre-completion state, final 3,350ms frame after exactly 2,350ms, completion and cancellation. The same regression fails on the previous bridge at the first visible timestamp.

Updated the Jest handoff test to cover that clock and cancellation, and tightened the existing healthy-launch Maestro completion waits to four seconds. The seven-second failure watchdog is intentionally unchanged. Updated design §2.1, RULEBOOK §0.2, branding provenance and wiki.

PENDING: full Jest/package/typecheck/CI and actual native Maestro/visual timing. The shell executor became unavailable in this follow-up session; direct JavaScript bridge checks are separate from Jest/native verification. Keep draft until required gates are complete. All hi/en/gu/kn × Standard/Large, compact and enlarged-text native cells remain pending; no layout or artwork changes. Generated source and deterministic runtime checks are not device evidence.

U1/U2/U7/U8 PASS; U3/U4/U5/U9/U10/U11 PENDING; U6 deterministic clock/cancel PASS, device PENDING. U12: source/tests/docs preserved on the PR branch and checked after publication. C3/C6/C9 apply. C1/C2/C4/C5/C7/C8 N/A: unchanged content/export/navigation/audio contracts. C10 N/A: no release/build/version bump/OTA performed.

This trims animation playback only. Native/JS startup before the canvas is ready is a separate interval, not claimed eliminated.

## Cold-process-only correction

The owner explicitly ruled out warm replay. Removed the gate's AppState listener, generation counter and resume Modal. Its single entered state stays true after completion/cancellation for the lifetime of the process. A new killed/reopened process starts a new gate, so no persistent already-seen flag is used. Cold notification/widget and accessibility/error exits remain. Backgrounding an unfinished cold reveal cancels it and does not restart it on resume. The reveal's initial-active wait is retained independently of gate replay.

Updated lifecycle regressions to assert no canvas/modal on background, quick inactive/system and duplicate-active returns, preserved navigator mount, no restart after cancellation, and another reveal on simulated new-process remount. Updated the native flow to expect replay after stopApp/launchApp but none after Home/launchApp stopApp:false. Jest/CI/device execution of these new lifecycle assertions is PENDING because the shell executor is unavailable. Direct timing checks above still cover the unchanged trimmed bridge, not React lifecycle/native evidence.

## Verification and CI repair follow-up

The latest requested verification uses head a125dce1d03e8a2beb1d32abb53d2e472ee43f24 as its starting point. GitHub job 125364632269 fails solely in `tourContent.jest.test.ts`: app version is 1.5.6 but APP_TOUR_VERSION remains 1.5.5. Browser and instruction-policy checks pass. Repair aligns the existing release-note version to 1.5.6 and adds an accurate bilingual welcome entry; no app/native version number is bumped and no assertions are weakened.

A dedicated macOS workflow builds an unsigned Release Simulator app from the exact PR branch, completes the existing consent/setup flow, and executes a focused lifecycle journey with two killed-process reveals and three warm returns without branding. It retains a video, screenshots, tested head, build/toolchain logs and JUnit results. Source syntax and YAML parsing are separate from native execution. Actual workflow results are recorded after completion; physical-device/Android and broader locale/size/targeted-entry checks remain pending.

## Executed results and native-driver repair

Implementation head 06c6374f95bc5b679ce0fb25f3b7f274f1078e46: GitHub full CI, browser and instruction checks pass. Full CI executes 329 Jest suites / 3,095 tests, 630 engine tests, observance verification, 218 data tests, both production exports and 144 CDN asset checks. Local focused tests pass 45/45; seven cold-only assertions fail with the previous replay gate and pass with the corrected gate. Actual accepted renderer/native-host execution starts with 35,839 colored pixels at source timeline 1,000ms, reaches the unchanged 3,350ms frame after 2,350ms and cleans up its animation frame.

Native workflow 41472432327 successfully compiled the Release app and installed it on an iPhone SE (3rd generation), iOS 18.5 simulator. It failed before any setup/lifecycle assertion: Maestro 2.12.1's XCTest driver did not become ready within its default 120-second limit. Artifact 13158132124 contains BUILD SUCCEEDED, driver timeout logs and a simulator Home Screen with both Vedansh and Maestro driver installed. This is compile/install PASS; native lifecycle remains PENDING, not a product-test pass.

The follow-up raises only driver initialization to 300 seconds, opens Simulator explicitly and checks XCTest through Settings before the expensive app build. Motion/cold/warm assertions remain unchanged. The simulator build now targets only the actual runner architecture, avoiding the prior dual-architecture compile. Successful app bundles are retained before UI tests to preserve that checkpoint. Runner-only checkout limits source preparation to mobile/. Bash/YAML validation passes; actual rerun evidence remains pending.

## Explicit iOS snapshot configuration

Run 41479223853 passes driver preflight, Release compilation/install and consent/setup. The recording shows the cold particles followed by Home; the failing assertion's accessibility dump still contains only the old brand-launch-reveal root. The explicit-file Maestro invocation did not load .maestro/config.yaml (snapshotKeyHonorModalViews was null). Load the existing iOS snapshot configuration explicitly for all three flows. Assertions and app source remain unchanged. Native warm-return coverage remains pending until this retry passes.

The retry may reuse artifact 13162410761 only when the complete production mobile Git fingerprint, arm64 architecture, Xcode 16.4/16F6 and immutable inner archive SHA-256 match. Test-driver/Maestro files are excluded from the production fingerprint; all other mobile source/config/assets/dependencies are included. Any source/toolchain mismatch or unavailable archive falls back to a fresh Release build. The retained origin and tested head distinguish reused binary provenance from harness changes.
