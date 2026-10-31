# Quiet companion implementation review — 31 October 2026

Selected direction: Quiet companion for all first-launch and later ask surfaces. This is a native React Native implementation on top of PR #576, not the earlier HTML prototype.

## Implemented

Shared compact sheet with 80pt rounded cached painting, semantic icons, native-script language choices, Standard/Large layout, keyboard avoidance, scrollable body and pinned safe-area actions. Language → staged city/GPS → explained reminders → iOS ATT after Modal dismissal → existing tour. Phase and step survive restarts. Later asks share a local-day/session latch; hard-denied permission stays passive, old on-but-ungranted preferences get an explanation, existing snoozes migrate, and manual off ends launch re-asks. Android's pin queue survives sheet unmounts and allows the no-pause launcher follow-up. Widget snapshots have no fabricated dates or tithi.

Artwork reuses published `reader-illustrations` descriptors for scripture, Ganga and diya, with the existing persistent cache and offline parchment fallback. No new artwork was generated or published; no image enters the native bundle.

## Automated validation

Focused provider, onboarding, launch arbitration, nudge, pin queue, rating/update arbitration and Meta-controller Jest tests. TypeScript and lint. All 37 widget contract/planner/startup tests, plus both static startup graph/budget checks. `tsx` CLI's IPC socket is unavailable in this executor; equivalent suites run through `node --import tsx --test`.

### Cross-component integration coverage

`mobile/src/components/__tests__/QuietCompanion.integration.test.tsx` adds 12 scenarios using the real launch host, rendered setup/reminder/widget sheets, six providers (language, reading size, theme, location, notification preferences and tour), launch/nudge stores, permission mapping and daily scheduler. Cold boots reset application modules while preserving in-memory AsyncStorage contents and native permission state; reopening a sheet alone would not exercise persisted launch arbitration.

- Fresh setup stages the city until Continue, persists choices, requests notification permission once, enables both reminder families and hands off to the tour without another launch ask.
- Interrupted language/city and reminder steps resume; saved language does not misclassify an unfinished setup as an upgrade. An unfinished tour resumes independently.
- Not now remains off after an unrelated feature gains OS permission. Same-day launches, reminder rest days, third-decline stop, hard denial and a manual Settings opt-out preserve the intended invitation behaviour.
- iOS setup waits for the native Modal dismissal callback before exposing the tour. Targeted cold starts suppress launch surfaces without consuming an ordinary launch opportunity.
- Later-day widget offers share persisted records. Android requests verse then Panchang across background/foreground even after host unmount; unsupported pinning navigates to the gallery without recording an add. An existing verse flow produces a Panchang-only offer, and dismissing that offer survives another cold boot.

Run from `mobile`: `npx jest --runInBand src/components/__tests__/QuietCompanion.integration.test.tsx`. The related regression run passes **137 tests across 16 suites**, including these 12 integration scenarios. `npx tsc --noEmit` and scoped ESLint with `--max-warnings 0` pass.

Native notification/location/widget APIs, navigation and safe-area input are mocked, as are decorative icon/artwork leaves. InteractionManager cache warming is deferred. The Meta native module is unavailable in this harness: this suite checks the iOS Modal hand-off, while existing Meta-controller tests check ATT logic. These are component integration tests, not installed-app or OS-dialog end-to-end tests; festive delivery and actual widget placement still require native validation.

## Pending native review before merge

- Physical iPhone/iPad: notification/ATT order, one-Modal dismissal sequencing, relaunch during every setup step, Settings round-trip and notification/widget cold starts.
- Android launchers: both pin dialogs, cancellation, launcher without AppState pause, unavailable pin API and navigation away mid-flow.
- Native UI, all hi/en/gu/kn × Standard/Large combinations: 320pt and larger phones, keyboard/search, rotation, footer reachability, long city names, VoiceOver/TalkBack, cold cache and offline recovery.
- Confirm painted thumbnails and full widget preview geometry against the selected design. Automated layout tests and the earlier browser prototype do not establish native visual acceptance.

Keep the PR draft until this device and visual review is recorded. No store build, OTA update, R2 publication or merge was performed.
