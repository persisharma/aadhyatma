# Home heading correction — 2 November 2026

## Scope and acceptance

User references: `IMG_9065.jpeg` (oversized copper heading without side ornaments) and `IMG_9032.jpeg` (previous compact dark-ink title with two Om circles and rules). Keep the new lettering style, restore the previous size/colour/ornaments, and retain the dot below श in वेदांश़.

Base: `41da46f826679ccf7846846e63efd77150c77f29` on current main, after merged PR #587. Follow-up is Home-only: no changes to the approved particle source, PNGs, export colour/size, native dependencies, app version or release configuration.

Home now owns its 42pt crest again: 30pt Om circles, saffron rules (omitted in compact mode), and the new lettering at a 28pt image height in `colors.ink`. The Hindi dot is a native 1.6pt circle below श, inside the unclipped row. The existing companion subtitle retains localization at 14/22 in `inkSoft` and can scale/wrap. Shared artwork decoding still uses `WordmarkArtwork`; only Home supplies its explicit tint. The settings gear's 44pt target is unchanged.

## Evidence

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| U1 source/scope | PASS | Current main, AGENTS, checklist, rules, design/RULEBOOK and wiki read; both supplied screenshots inspected; #587 confirmed merged. |
| U2 acceptance | PASS | Preserve previous size/colour/Om treatment, new letter geometry and Hindi dot; keep launch/share unchanged. |
| U3 native design fidelity | PENDING | Source geometry matches the requested compact treatment; installed iOS/Android comparison still required. |
| U4 languages/sizes | PENDING | Rendered with real language/theme/reading-size providers for hi/en/gu/kn × M/L. Geometry checked at 320, 360, 375, 390, 393.45, 414, 430 and 768dp against the 44pt Settings target. Native system-text/platform review pending. |
| U5 journey | PENDING | Home is the existing entry; no route/state changes. Installed Home → Settings → Back review pending. |
| U6 lifecycle | N/A | No persistence, subscriptions or async state introduced; existing image capture lifecycle regression passes. |
| U7 assets | PASS | Reuses the existing approved local crops. `prepare-approved-brand.mjs --check` passes; no new CDN objects. |
| U8 siblings | PASS | Home is explicitly separate from launch/share sizing; shared/export caller defaults remain unchanged. |
| U9 tests | PENDING | 27 Home/source tests, 2 capture tests and 3 Panchang share tests pass. New crest regression fails on the pre-fix source (missing crest) and passes after. Full package gate passes after correcting the pre-existing Panchang share harness to emit the actual wordmark onLoad; Maestro YAML parsed, not executed. |
| U10 compatibility | PENDING | Typecheck and scoped ESLint pass. No native/config/dependency changes; device performance/native scaling pending. |
| U11 integration/docs | PASS | Based on current main; design §§5/18, RULEBOOK §0.2 and wiki updated in the same change. |
| U12 preservation | PASS | PR #594 / `codex/home-wordmark-crest`; published implementation `afdddfdddb1daff3e78a864e4fcd1586123a5432` verified against the local tested tree `a39be4f250012eca329dbdcc8801b761d36bde47`. Final evidence/harness update recorded in the PR. No sole-copy cleanup. |

C3/C9 apply: existing artwork, native framing, shared caller defaults and settings clearance are covered in source/tests; native comparison remains pending. C4 output is unchanged; capture tests pass. C1/C2/C5–C8/C10 are outside this Home typography fix; no release requested.

Commands: `npm run typecheck`; scoped `eslint`; Jest `HomeWordmark.test.tsx ApprovedBrandSource.test.ts` (27/27), `WordmarkCapture.test.tsx` (2/2); `node scripts/prepare-approved-brand.mjs --check`; `node scripts/verify-agent-instructions.mjs`; `git diff --check`; `js-yaml.loadAll(brand-launch.yaml)`.

Full mobile gate PASS: typecheck; widgets 37/37; all three Jest reader shards (328 suites, 3,077 tests); engine 630/630; data 218/218; Ask 49/49. The initially failing Panchang share harness signalled only the icon decode, leaving the new wordmark pending; it now proves capture waits for the separate wordmark image before delivering on iOS/Android. No production capture code changed. The affected third shard was rerun in full (109 suites / 846 tests, exit 0); the unchanged first two shards passed earlier. The package-defined tsx suites use `node --import tsx` in place of the CLI's optional IPC listener. No suite or assertion is omitted. No Maestro, adb or xcrun is available here. Native visual/E2E remains pending, so the PR stays draft. No OTA/build/merge/release performed.
