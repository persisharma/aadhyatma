# Particle logo recovery — 1 November 2026

## Scope and recovery

The previous chat reported a saved implementation, but `codex/brand-launch-reveal` still pointed at unchanged main `3a6e4c6ee6fe8aeee453448a2937f72c92b594e8` and no PR existed for it. This reconstruction starts at current main `bd6e239f09ca558991485507085c72b4bbda14d0`. It preserves the current icon's exact copper/vermilion composition and introduces the companion subtitle, simultaneous reveal and shared live wordmark.

**Draft design gap:** neither the approved custom English/Hindi lettering asset nor the animation prototype was recoverable. Existing Cormorant/Noto faces are provisional. Do not present this as an exact implementation of the approved reference or merge until custom-lettering fidelity is resolved. No Samarkan font or unverified licence is introduced.

## Implemented

- Bounded 1,500ms native-driver particle introduction after font/preference hydration; full current splash image and bilingual names/subtitle resolve together.
- Up to 192 deterministic samples from the actual icon, with source SHA-256 and reproducible script; no new bitmap asset or native dependency.
- Ordinary launch introduction precedes navigation and automatic asks. Notification/widget targets bypass it; early target events update initial navigation rather than losing the tap.
- Reduce Motion, screen-reader use, backgrounding, incoming link, image error and native-query errors finish early; 2,000ms watchdog; timers/listeners/animation cancel on unmount.
- Shared localized wordmark: Home, verse/prose footer, common card strip, Panchang share header and Jyotish share header. Existing download links/content/capture readiness are retained. Current icon replaces the stale simplified mark on common-card, Panchang and Suvichar exports.
- Hindi, English, Gujarati, Kannada subtitles; script-safe type and wrapping. App text uses accessibility scaling, export wordmarks use fixed scaling.

## Sibling audit

Baked Suvichar/DevotionalFrame artwork lettering and native WidgetKit/Android widget snapshot branding are separate asset/platform contracts. They are not silently repainted. Guna Milan's older Om footer remains outside the shared-header conversion. Inspect these against the final lettering before broad brand rollout. Existing native widget views and app-store icon exports are unchanged.

## Acceptance evidence

Applicable: U1–U12; C3, C4, C6, C9. C1/C2/C5/C7/C8/C10 are N/A: no scripture, stories, calendar logic, saved-data schema, playback, or release work.

- U1/U2 PASS: current main, root/Claude instructions, shared checklist, design, RULEBOOK, wiki and E2E runbook inspected; reconstruction and design gap recorded.
- U3 PENDING: original custom lettering/reference absent; native visual fidelity not established.
- U4 PENDING: component matrix is automated; compact/enlarged system-text/native four-language Standard/Large checks remain.
- U5/U6 PENDING: gate and lifecycle unit coverage included; actual early notification/widget route delivery and complete fresh/returning launch journeys require device verification.
- U7 PASS for source integration: same bundled approved icon, source-hashed deterministic particles; no CDN or new font publication. Native visibility/export quality remains pending.
- U8 PASS for audit: shared rendered surfaces and baked/native exceptions explicitly recorded.
- U9 PENDING: focused tests/typecheck and full suite results will be recorded after execution; updated shared Maestro launch flow must run on both platforms.
- U10 PENDING: bounded 148 native particles, one non-interaction animation clock, no per-frame JS state. Actual startup/device performance still unmeasured.
- U11 PASS for current-main integration/docs at the recorded base; recheck latest main before merge.
- U12 PASS: draft PR https://github.com/persisharma/aadhyatma/pull/587 and initial remote checkpoint e0fd74c93fdd6bdcb93ccaf69252453f26094e75 verified. No cleanup of task work is allowed before that point.

C3/C4/C6/C9 remain PENDING for native/actual-export evidence. This change is integrated source, not native-verified, merge-ready or released.

## Executed checks and downloadable export

- Focused Jest PASS: 5 suites / 45 tests across BrandLaunchGate, HomeWordmark, ShareCardMount, shareCardFit and SuvicharCard. The launch suite exercises cancellation, reduced motion, screen-reader bypass, watchdog, query failure, and cleanup; typography tests use real language/font-scale/theme providers and cover all four languages at M/L.
- Typecheck PASS at initial remote e0fd74c; final startup-preload follow-up is being rechecked. Changed-source ESLint PASS; particle regeneration/hash check PASS (148 samples); shared Maestro two-document YAML parses with loadAll; git diff --check PASS.
- Initial npm test ran during a partial checkout and stopped on missing existing docs/evaluations/mahakaal/sources.json. That file is present after checkout completes; no application fix or test weakening was made. Full npm test has been restarted against the complete checkout.
- New scripts/export-particle-logo.py reproduces the downloadable review exports. Requires npm ci in mobile, Python Pillow with RAQM, and ffmpeg. Run python scripts/export-particle-logo.py --output /absolute/output/path. No app/native dependency changes.
- MP4: H.264, 720×900, 3 seconds (1.5-second reveal plus final hold), 111,794 bytes. GIF: 480×600, looping, 326,098 bytes. Source colours/hash validated, poster visually inspected for intact icon, Hindi shaping and uncropped labels; ffprobe confirms codec/size/duration. These are source-based review exports, not native-screen evidence.
- Native iOS/Android, Maestro execution, exported-card handoff, compact/enlarged system-text visual checks, performance and original custom-lettering fidelity remain PENDING. No simulator/emulator/Maestro runner is available here.

Remaining: final full-suite/CI result; native launch and early notification/widget event journeys; replace provisional custom-lettering fallback with the recovered/approved assets before merge.
