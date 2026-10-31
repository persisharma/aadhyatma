# Quiet companion implementation review — 31 October 2026

Selected direction: Quiet companion for all first-launch and later ask surfaces. This is a native React Native implementation on top of PR #576, not the earlier HTML prototype.

## Implemented

Shared compact sheet with 80pt rounded cached painting, semantic icons, native-script language choices, Standard/Large layout, keyboard avoidance, scrollable body and pinned safe-area actions. Language → staged city/GPS → explained reminders → iOS ATT after Modal dismissal → existing tour. Phase and step survive restarts. Later asks share a local-day/session latch; hard-denied permission stays passive, old on-but-ungranted preferences get an explanation, existing snoozes migrate, and manual off ends launch re-asks. Android's pin queue survives sheet unmounts and allows the no-pause launcher follow-up. Widget snapshots have no fabricated dates or tithi.

Artwork reuses published `reader-illustrations` descriptors for scripture, Ganga and diya, with the existing persistent cache and offline parchment fallback. No new artwork was generated or published; no image enters the native bundle.

## Automated validation

Focused provider, onboarding, launch arbitration, nudge, pin queue, rating/update arbitration and Meta-controller Jest tests. TypeScript and lint. All 37 widget contract/planner/startup tests, plus both static startup graph/budget checks. `tsx` CLI's IPC socket is unavailable in this executor; equivalent suites run through `node --import tsx --test`.

## Pending native review before merge

- Physical iPhone/iPad: notification/ATT order, one-Modal dismissal sequencing, relaunch during every setup step, Settings round-trip and notification/widget cold starts.
- Android launchers: both pin dialogs, cancellation, launcher without AppState pause, unavailable pin API and navigation away mid-flow.
- Native UI, all hi/en/gu/kn × Standard/Large combinations: 320pt and larger phones, keyboard/search, rotation, footer reachability, long city names, VoiceOver/TalkBack, cold cache and offline recovery.
- Confirm painted thumbnails and full widget preview geometry against the selected design. Automated layout tests and the earlier browser prototype do not establish native visual acceptance.

Keep the PR draft until this device and visual review is recorded. No store build, OTA update, R2 publication or merge was performed.
