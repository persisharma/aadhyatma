---
title: Explore launch sheet
type: subsystem
sources: [mobile/src/components/explore, mobile/src/data/discovery, design.md, RULEBOOK.md]
last_verified_date: 2026-10-31
confidence: medium
status: current
---

The approved Immersive Story sheet previews sixteen sections over Home.
`sections.ts` owns typed destinations and visit routes; `policy.ts` handles cadence;
`store.ts` serializes writes and fails closed. `ExploreLaunch` observes route visits,
launch intents, onboarding and higher-priority surfaces. The first collection
session and first 24 hours do not show sheets. Known saved routines, Sankalp and
Pitru records seed the ledger; older unrecorded route visits cannot be reconstructed.
The first collection process remains silent until a subsequent cold launch.

The surface honors all four languages, both reading sizes, Reduce Motion, safe
areas and the keyboard. The footer remains outside the scrolling body. Only the
handle captures dismissal drags. The Suvichar sender is a preview until the CTA
hands a draft to the real composer; reopening applies a draft once.

The separate 1.5MB hero budget and manifest pin crops and shipped hashes. Gita Saar shows Krishna–Arjuna, Sankalp shows Hanuman,
and Suvichar composes a Ram Darbar greeting. No Home/More icon registry is altered.
Native visual, keyboard, gesture and screen-reader QA remain required before merge.

Explore waits for the Quiet companion host to finish selection and claims the same persisted one-per-local-day prompt opportunity. Legacy reminder eligibility no longer blocks a stopped reminder user. Reminder rests use their own date, so showing discovery cannot postpone them. Combined regression coverage is in `LaunchSurfaces.integration.test.tsx`; native ATT/modal and launcher QA remain pending.

A newly staged background update cannot preempt an Explore sheet that already owns the shared opportunity; existing pending updates still block its initial claim.

Settings offers Explore sections as an immediate replay action, with no on/off toggle. The sheet has no permanent disable action; legacy enabled=false is ignored. Replay cycles all cards without automatic ledger/budget writes. Notification launch responses are consumed and cleared once; Explore uses App’s resolved targeted flag rather than rereading cached responses.

Settings replay includes a confirmed Reset visit history sub-option in the scrolling content, absent from automatic sheets. `resetExploreHistory` awaits hydration and serializes a valid empty ledger with `createdAt` aged by 24 hours; visits, shown history, declines, streak, sleep deadline and last suggestion clear together. The key is retained so first-load saved-record seeding does not undo a reset. Other feature data and the shared daily prompt slot are untouched. Success follows persistence only and explains reopening from the icon on Home; a used daily slot or higher-priority surface still delays automatic discovery. Cancellation, duplicate confirmations and confirmations after replay unmount cannot clear history. Native visual/device verification remains pending.

