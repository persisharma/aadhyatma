# Launch handoff and immediate reopen

Base: `5cac85facf425dae0f18f5244af059b0a03ca284` (merged #599).
Branch: `codex/launch-handoff-quick-reopen`.

## Acceptance and implementation

- A plain brand-ivory native launch frame precedes the approved particles, without the old static emblem. Both legacy config and the splash plugin use an explicit transparent 64×64 PNG, generated and hashed by the existing icon exporter. Launcher/adaptive artwork and the old feathered emblem export stay unchanged.
- The accepted HTML fragment and its composition remain byte-for-byte unchanged. The native wrapper hides the initial canvas, stops it at frame zero after decode, and reports readiness. The WebView waits for the `SplashScreen.hideAsync()` promise, then explicitly invokes the original replay action. Completion cannot skip the reveal before that start. Pending handoffs cannot start an unmounted renderer.
- Quick active → inactive → active returns replay without a cooldown, as do full background returns. iOS AppState cannot distinguish quick app-switcher visits from Control Center/notification interruptions: those returns replay too. Initial inactive cold startup waits for the first active event. Duplicate active events do not restart playback.
- Existing navigator state is retained beneath the warm full-screen modal. Target notifications/widget links still take priority, including a target signaled during inactive before background. Reduced Motion, screen readers, errors, cancellation and the seven-second watchdog retain their exits. No data, routes, wordmark geometry or approved Hindi dots change.
- The native placeholder requires a new binary. An OTA can deliver JS lifecycle/handoff fixes to compatible binaries, but cannot replace the old compiled launch image. No version bump, native build, merge, store upload or OTA is included.

## Verification

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| U1 scope/source | PASS | Current main/#599, root and scoped instructions, build checklist, RULEBOOK, design, wiki and existing launch tests reviewed. |
| U2 acceptance | PASS | Plain native frame → visible full particle sequence; no minimum away time; target/accessibility/error priority and navigator preservation. |
| U3 native fidelity | PENDING | No installed iOS/Android visual runner available in this Linux session. |
| U4 locale/size | PENDING | Fixed artwork and layout unchanged; hi/en/gu/kn × M/L, compact and enlarged system text still require native review. |
| U5 journeys | PENDING | Existing provider-based lifecycle/target/mount-preservation tests pass; cold/second/immediate-third-open Maestro assertions extended but not device-executed. |
| U6 lifecycle/failure | PASS / PENDING | Automated immediate returns, duplicate events/readiness, cancellation during hide, reduced motion, target ordering, native render errors and timeout covered; actual device transitions pending. |
| U7 assets | PASS | Approved source/derivatives regeneration passes; all original icon outputs unchanged; transparent placeholder has a reproducible manifest entry. No CDN changes. |
| U8 sibling surfaces | PASS | Legacy and plugin splash config, cold and warm reveal, target channel and automatic launch visibility gate reviewed together. |
| U9 tests | PASS / PENDING | Typecheck and 3 focused suites / 33 tests pass. Running these new regressions against old implementation yields 6 failures across both affected suites. Full gate/final CI/native E2E recorded below. |
| U10 compatibility | PENDING | Lazy import path, network-free renderer and watchdog retained; native generation/device performance checks remain. |
| U11 docs/integration | PASS / PENDING | Design §2.1, RULEBOOK §0.2, branding README, wiki, exporter and generated hashes updated; final-head CI pending. |
| U12 preservation | PENDING | Record remote checkpoint/PR after publication. No cleanup performed. |

C3/C6/C9 apply: native asset, launch arbitration and accessibility checks remain explicit. C10 is limited to explaining native compatibility; no release is performed. C1/C2/C4/C5/C7/C8 are N/A: no reader/story/share/calendar/navigation-state/audio contract changes.

Executed: `npm run typecheck --prefix mobile`; focused Jest suites `BrandLaunchGate`, `ApprovedBrandSource`, `BrandNativeHandoff`; `node scripts/prepare-approved-brand.mjs --check`; `node scripts/verify-agent-instructions.mjs`; `git diff --check`. These checks are source/automated evidence, not native screenshots.

Full `npm test`, scoped ESLint, generated native project inspection and final-head GitHub CI are in progress at this checkpoint. Native iOS/Android full launch recordings and Maestro remain required before ready-for-merge. The known base version mismatch (`APP_TOUR_VERSION` 1.5.5 versus app.json 1.5.6) may fail the existing tour contract independently of this fix.

Untracked unrelated checkout/download temporary files are excluded from this task checkpoint and left untouched.
