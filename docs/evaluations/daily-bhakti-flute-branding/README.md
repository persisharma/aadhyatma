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

Regression test: `DevotionalBranding.test.tsx` failed on the base (7/7), then passes with the implementation. Focused frame/branding/export suites: 70/70 pass. Final TypeScript passes. All three configured Jest shards pass: **377 suites / 3,963 tests** (126/1,313; 126/1,410; 125/1,240). Widgets, engine (**830** tests), data (**223**) and Ask (**49**) gates pass. `npm test` initially stops because the `tsx` CLI cannot open its optional Unix IPC socket (`EPERM`); the same package-script test arguments, environment and file lists were run with `node --import tsx --test`. No test/timeout/assertion was skipped or weakened. The reader shards ran through their normal npm commands, independently so an earlier failure could not hide a later shard.

**50 browser component cells pass**, using every current delivery-manifest subject, all four scripts, M/L and 288/358dp reader widths, plus the fixed export. Actual component screenshots were visually inspected, including all subject header/footer crops and the complete Hanuman card. The English suffix’s negative margin compensates for the logo’s transparent feather extension, keeping `Vedansh.app` joined. Browser rasterization remains separate from native capture.

Policy verifier, YAML parsing and `git diff --check` pass. No master/manifest/font/lockfile changed.

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
| U9 tests | PENDING for native; PASS for all automated gates: 377/3,963 Jest, engine 830, data 223, Ask 49, widgets, typecheck, policy/YAML/diff |
| U10/U10.1 performance/ANR | PENDING: bounded two-event gates and static layers; no animation/network/CPU loop added; physical release comparison unavailable |
| U11 integration/docs | PASS: based on current main, design/RULEBOOK/wiki and flow updated; final CI pending |
| U12 preservation | PASS: implementation remotely preserved in draft [PR #661](https://github.com/persisharma/aadhyatma/pull/661); local/remote Git tree identity verified |

C1/C3/C4/C9 apply: existing scripture preserved, approved art identity, capture/error readiness, shared component layout. C2/C5–C8/C10 N/A: no story, solver, reminders, navigation/persistence, audio or release changes.

Implementation is for review. No merge, native binary build, version bump, OTA or store release.

## Remote checkpoint and handover

- [Draft PR #661](https://github.com/persisharma/aadhyatma/pull/661), branch `codex/daily-bhakti-flute-branding`.
- Tested source: local `fbcd7ef6aec0512a8bcbfaf9864f904450cbae1d`; remotely preserved implementation `6662488ec054a8771b03c0569f29c1f5d04306db`. Their exact Git tree is `7655c80ec219f0c1ddd33787a9f18e3ce2f32c9c`. The following checkpoint changes this verification document only; PR metadata records its final head.
- GitHub reports the source checkpoint mergeable with current main. Agent policy CI passed; full CI/brand browser workflow were in progress when inspected. Final CI must be checked on the final remote head.
- The only untracked local item is the development `mobile/node_modules` symlink, intentionally excluded. Reproducible intermediate browser bundles/screenshots live in ignored `tmp/`; no required app asset is outside Git. No worktree cleanup occurred.
- Remaining: execute the committed native flow on iOS/Android; review actual exported images and OS/WhatsApp handoff; verify Standard/Large, compact/enlarged-system text, offline/retry/language-switch/Back; compare lower-configuration Android release responsiveness and inspect ANR/logcat plus iOS hangs. Keep draft until required native acceptance passes.

## Follow-up: fitted header badge — 10 November 2026

Feedback (Sundarkand 11.4 on an iPhone): the box around the top Vedansh logo was too big. Final direction: the box should be the size of the painted plaque it hides, with the logo scaled to fit inside.

- 28 of the 30 masters carry the legacy painted plaque (outer gold edge ≈37–209 × 54–167; Mahakaal and prayer have none; Parshuram's blank plaque reaches ≈227). An overlay drawn at the badge footprint over each master, inspected at 3× zoom, leaves no legacy edge visible. A 176×116 box would leave Hanuman's lower gold bevel (y≈166–167) showing.
- Badge: 180×120 at (34,48) (Parshuram 198 wide), slim double frame and top ornament; wordmark Hindi 150px / English 152px. The badge was 244×132 at (32,44) with a 196px wordmark.
- Rejected iterations: keeping the 196px logo in a 224×120 box (still larger than the plaque); a shorter box with the exposed plaque strips covered by mirrored scenery (visible reflection seams in 1080px exports).
- Evidence: `DevotionalBranding.test.tsx` footprint cases fail on the old badge and pass now; Devotional suites pass; `tsc --noEmit` is clean. Browser component renders (this harness) of all 30 delivery subjects in Hindi, plus reader hi/en/gu/kn × M/L × 288/358dp, were visually inspected. `browser-matrix.json` was not regenerated.
- PENDING: native iOS/Android render and export, Standard/Large on device, enlarged system text.
