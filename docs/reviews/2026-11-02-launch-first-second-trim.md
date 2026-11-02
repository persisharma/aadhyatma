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
