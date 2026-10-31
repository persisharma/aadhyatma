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
