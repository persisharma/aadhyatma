# Daily Bhakti flute branding — 8 November 2026

Approved reference: [single Hindi-logo card](https://chatgpt.com/library?file_id=libfile_4e24675eff208191ae7f522231733d1a&account_id=ef1b37df-162b-473f-a1be-d4cacda8dcce). User approved this layout and requested app integration.

## Implementation and acceptance

- Base `57f80588fe33257c39e8176fedb85c0daf99e9ba`; branch `codex/daily-bhakti-flute-branding`.
- Bhakti tab and exact widget/notification verse entry → shared `DevotionalFrame`; reader share and any verse’s Daily Bhakti card-style selection → the same frame.
- One approved Hindi flute/peacock name above in Hindi; one English name above in en/gu/kn per the existing brand-language policy. Never stack two top logos. English flute name followed by unchanged live serif `.app` below in every mode. Preserve complete scripture/meaning, sender/data state, source mapping, scenic art, measured long-card geometry and share captions.
- `DevotionalBranding` uses bounded native SVG/text/image layers over the old painted name areas. Existing wordmark PNGs remain untinted and proportionally sized; no new image, font, dependency, master edit, CDN request or publication is needed. The badge’s native vector edge is a deliberate implementation approximation of the painted reference; exact native fidelity remains pending.
- Hero/footer each require both logo and master painting. Failure refuses export; changing art/language remounts the gate and discards removed-card callbacks. Shared wordmark callbacks retain the existing capture barrier for sibling surfaces.
- Source paintings and manifests are byte-unchanged; all current published subjects, including neutral prayer and text-free Mahakaal/Parshuram, use the same branding treatment.

## Verification and reproducibility

Regression test: `DevotionalBranding.test.tsx` failed on the base (7/7), then passes with the implementation. Focused frame/branding/export suites: 70/70 pass. TypeScript passes. Full-suite and browser evidence will be recorded after final validation.

The browser harness renders production `DevotionalShareCard`, `DevotionalFrame`, `DevotionalBranding`, `WordmarkArtwork`, actual master files, actual approved logo PNGs, actual fonts and the stored Hanuman chaupai 2. Only native host/cache adapters are replaced. It checks all delivery-manifest subjects, four scripts, reader M/L and 288/358dp layouts; fixed exports retain their own 540dp sizing.

```sh
BHAKTI_PREVIEW_DEPS=/path/to/preview/node_modules node docs/evaluations/daily-bhakti-flute-branding/preview.mjs
BHAKTI_PREVIEW_DEPS=/path/to/preview/node_modules node docs/evaluations/daily-bhakti-flute-branding/verify-preview.mjs
```

Preview dependencies: esbuild, react-dom 19.1, react-native-web 0.21, Playwright plus Chromium. They are tooling only, outside the mobile dependency graph. Results: `browser-matrix.json`; reproducible screenshots: ignored `tmp/bhakti-flute-preview/`. These are browser component images, **not native `captureRef` exports**.

Native flow: `mobile/.maestro/daily-bhakti-flute-branding-smoke.yaml`. Maestro, adb and xcrun are absent here (each command returns 127), so installed iOS/Android visual checks, actual exported files and OS/WhatsApp handoff remain PENDING. Native font/gradient rasterization, compact/enlarged-system-text behaviour and release-device responsiveness/ANR/logcat/iOS hang checks also remain PENDING. Do not report an ANR-free app from unit/browser tests.

## Acceptance status

| Checks | Status / evidence |
| --- | --- |
| U1/U2 scope/criteria | PASS: current main, open PRs, repository policy, approved image and affected shared routes inspected |
| U3/U4 fidelity/languages | PENDING: component matrix available; native device and enlarged system text pending |
| U5/U6 journeys/failure | PENDING: source integration and decode/language/error regressions pass; native journey/cancellation/offline/export pending |
| U7/U8 assets/siblings | PASS: existing shipped logo PNGs reused, paintings/manifests unchanged; shared Wordmark/Frame callers inspected |
| U9 tests | PENDING: focused suites and typecheck pass; full suite and native execution pending |
| U10/U10.1 performance/ANR | PENDING: bounded two-event gates and static layers; no animation/network/CPU loop added; physical release comparison unavailable |
| U11 integration/docs | PASS: based on current main, design/RULEBOOK/wiki and flow updated; final CI pending |
| U12 preservation | PENDING: remote checkpoint to be recorded |

C1/C3/C4/C9 apply: existing scripture preserved, approved art identity, capture/error readiness, shared component layout. C2/C5–C8/C10 N/A: no story, solver, reminders, navigation/persistence, audio or release changes.

Implementation is for review. No merge, native binary build, version bump, OTA or store release.
