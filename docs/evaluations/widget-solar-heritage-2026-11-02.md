# Solar Heritage / Midnight Temple widget implementation

Base: `41da46f826679ccf7846846e63efd77150c77f29` (main). Branch: `codex/widget-solar-heritage`.

Approved behaviour: Illustrated Heritage between selected-city sunrise and sunset; Midnight Temple otherwise. Both verse and Panchang use the same city window. Device-local devotional verse rollover and IST Panchang dates retain their existing meanings.

## Executed evidence

- PASS: 27 focused Node tests in `contract.test.ts`, `catalog.test.ts`, and `appearance.test.ts`; no failures/skips. Executed with Node 24's TypeScript stripping and a local resolve hook, without mocking payload/selector/asset logic. The normal full-repository runner is `npm run test:widgets` and now includes the new appearance suite.
- PASS: TypeScript/TSX syntax transpilation of changed UI/planner/contract/appearance sources with TypeScript 5.9.2. This is syntax checking, not the full semantic typecheck.
- PASS: Android resource XML parsing; `git diff --check`.
- PASS: 66 generated day/night plates, matching source/derivative hashes and native family budgets in the committed manifest; review of Vishnu wide day/night plates and the compact almanac plate. Reproduction: `node mobile/scripts/build-widget-heritage.mjs` with ImageMagick 6.
- PASS: palette AA contrast on opaque text surfaces; old payload compatibility; malformed/partial/wrong-date solar-window rejection; sunrise inclusive / sunset exclusive selection; all four locale values; safe source-aware artwork selection.

## Required pending evidence

- PENDING: full `npm test`, full semantic typecheck, Jest/provider integration and real engine planner suites. The focused checkout has no installed Expo/mobile dependency graph; the attempted full suite stops at `tsc: not found`. Syntax-only verification is not a substitute. Existing GitHub CI must run on the final remote head.
- PENDING: Swift/Kotlin compilation and fixture execution; clean reproducible CNG prebuild; signed extension/provider installation.
- PENDING: actual WidgetKit/launcher refresh at sunrise/sunset, tithi and midnight, offline continuation, fallback/recovery after a prior night render, cold/warm exact-link journeys and OS refresh deferral.
- PENDING: Hindi/English/Gujarati/Kannada × Standard/Large, compact devices, enlarged system text, VoiceOver/TalkBack and iOS tinted/monochrome screenshots. None of those native layout cells was executed here.

## Acceptance checklist

| Checks | Status | Evidence / remaining gate |
|---|---|---|
| U1–U2 | PASS | Current main policy/wiki/native sources read; approved two-theme solar selection and unchanged identities/links specified. |
| U3–U6 | PENDING | Native design, script/size, journey and lifecycle evidence listed above. Payload failure states pass source tests only. |
| U7 | PASS / PENDING | Generated, hashed, referenced native/gallery plates committed; final installed visibility pending. Existing reviewed reader paintings are used instead of the concept boards' newly painted portraits. |
| U8 | PASS | iOS, Android and the in-app gallery updated; Japam retains its existing art. |
| U9–U11 | PENDING | Focused tests pass; full/mobile/native/performance/final-head CI remain required. No conflicting open widget implementation PR found during initial search. |
| U12 | PENDING until remote verification | Preserve all source, tests, generator, generated files and this report in the draft PR; verify branch head and file tree before handover. |
| C1, C3, C5, C6, C9 | PASS / PENDING | No scripture/calendar calculation changes; payload/appearance/asset checks pass. Native content fit, timelines, accessibility and offline device checks remain pending. |
| C2, C4, C7, C8 | N/A | No story authoring, sharing, saved-state workflow or playback change. Existing tap targets are preserved. |
| C10 | N/A | No binary build, version bump, merge, store submission or OTA publication requested/executed. This change needs a new native binary. |

## Recovery / continuation

The repository's config plugins remain canonical; generated `ios/`/`android/` projects are not edited. All solar additions are optional in schema v1, with explicit plan-cache invalidation. New resources are retained for Android release shrinking. Native painting decode failure falls back to readable native text. Keep the PR draft until the pending native/device gates have evidence.
