# Approved particle integration — 1 November 2026

PR: https://github.com/persisharma/aadhyatma/pull/587
Branch: codex/brand-launch-reveal
Current-main integration base: caa457921a39202a83dc34e5b345a4e1f54cde28
Previous draft checkpoint: c62ada2e1ceee1c442a5167c09f90d3c55ca5dd3

## Final scope

The owner rejected the earlier generic type / 148-particle reconstruction. That renderer and its approximate export scripts are removed. The owner then accepted the calligraphic 3,809-particle preview and requested integration. `docs/branding/approved-particle-preview.html` (SHA-256 af052692ac2477860ae6c0e69ed7ce6754ed5dcf1400f10bd7e78665c6ad69d5) is now the source of truth for the app and downloads. The native wrapper retains it verbatim, with no changes to any particle, trajectory, colour, lettering or timing expression. Production hosts hide only the review replay button and add the native completion bridge.

The native OS splash waits until the canvas is ready. Navigation and all automatic launch surfaces wait until the 3,350ms reveal completes. Targeted launches bypass it. Current-main notification consumption / Explore replay fixes are merged; early incoming targets still prepare their destination before the navigator mounts. Backgrounding, incoming links, native process/render failures, accessibility preferences and a 7,000ms watchdog cannot trap startup.

Home, verse/prose footers and common/Panchang/Jyotish share headers use the approved name crops. Mark images use explicit aspect framing and register their decode with the existing share-paint barrier. Companion subtitles and accessibility labels remain localized for hi/en/gu/kn; native text grows/wraps. Exact launch composition is intentionally bilingual brand artwork, independent of reading size. No native dependency, font binary, version bump, build, OTA or release is added.

## Acceptance evidence

Applicable: U1–U12; C3, C4, C6, C9. C1/C2/C5/C7/C8/C10 are N/A: no scripture, story/calendar rules, saved-data schema, playback or release work.

| Check | Result | Evidence / remaining work |
| --- | --- | --- |
| U1 Source/scope | PASS | Current instructions/wiki/design/RULEBOOK read; main caa4579 and old draft merged; accepted source hash preserved. |
| U2 Acceptance | PASS | Same renderer, pixel source and timing; native readiness/completion gate; targeted/cancel/error routes; shared wordmark decode. |
| U3 Native design fidelity | PENDING | Source identity is checked. No native device/simulator exists here to compare actual WKWebView/Android rendering. |
| U4 Language/size/layout | PENDING | Automated four-language M/L shared-mark matrix included; native compact/system-text/platform cells remain unexecuted. Launch artwork is the fixed accepted bilingual identity. |
| U5 Reachable journeys | PENDING | Gate/provider and cross-launch regression coverage included; actual ordinary/notification/widget cold starts require both native platforms. |
| U6 Lifecycle/failure | PASS automated / PENDING native | Reduced motion, screen reader, cancelled/unmounted renderer, malformed bridge, process errors and watchdog covered. |
| U7 Assets/content | PASS source integration | Approved composition/name crops/native document have hashes and a reproducible verifier; all assets are bundled and no CDN/font publication is required. Samarkan registration confirmation remains a production check. |
| U8 Sibling surfaces | PASS audit | Shared Wordmark callers updated; capture barrier covers their decoded marks. Baked devotional lettering/native widget branding are separate contracts, not silently repainted. |
| U9 Verification | PENDING | Focused tests/typecheck/scoped lint, full mobile gates and CI results will be recorded below; native Maestro is authored, not executed here. |
| U10 Startup/data compatibility | PASS source / PENDING device | Existing WebView is required lazily, no native dependency or saved-data migration; launch graph budget checked separately; device performance unmeasured. |
| U11 Current-main integration | PASS | Latest checked main launch fixes merged; canonical design/RULEBOOK/wiki updated with the actual source/bridge/paint contract. |
| U12 Preservation | PENDING until final remote verification | Source, assets, tests, reproducers and handover must all be committed and verified at the PR head before cleanup. |

Native C3/C4/C6/C9, actual WhatsApp/system exports, iOS/Android launch timing, compact/enlarged text visual checks and Samarkan registration confirmation remain PENDING. Keep the PR draft until required evidence is supplied. Unit tests and source exports are not native visual proof.

## Executed checks

Results are recorded after the final source and test tree is validated. The host's optional tsx CLI IPC listener is restricted, so Node test groups can use the same installed loader via `node --import tsx --test`, without changing package scripts, tests, assertions, coverage or timeouts. `brand-launch.yaml` and `_launch.yaml` are parsed separately from executed device flows.

No cleanup of required task work before the remote branch and all generated assets are verified.
