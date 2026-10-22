---
title: Suvichar personalized cards
type: subsystem
sources: [mobile/src/screens/SuvicharScreen.tsx, mobile/src/components/SuvicharCard.tsx, mobile/src/data/suvichar.ts, scripts/prepare-suvichar.mjs]
last_verified_date: 2026-10-22
confidence: high
status: current
---

## Summary
Daily Bhakti opens a separate Home-stack composer for reusable devotional wishes with editable messages and optional names. Fourteen deities and three frame directions map to 42 text-free R2 masters.

## Details
Preferences and up to 50 complete favorites use the versioned `@vedansh/suvichar/v1` AsyncStorage key. Hydration finishes before inputs appear; writes are serialized. Artwork, message, name, language and preview width identify a capture generation. Only its own decode/layout callbacks may enable sharing. The root must match the measured growing body before capture; the PNG is 1080 pixels wide and retains full height.

`SuvicharCard` uses the shared persistent background cache, two clipped sections of the same subject master (reviewed .60/.64/.62 painting boundaries), script-safe native text and a Vedansh footer. `shareFiles` lazily loads RNShare; expo-sharing handles older binaries. Capture supplies both dimensions: Android pixels and UIKit points adjusted by PixelRatio; after the animation frames it rechecks current identity, measured height and image readiness. Temporary captures are released after handoff. Festival wishes are explicitly selected; calendar automation is not implemented. The thousand draft messages and occasion plans stay in docs/content/suvichar.

## Dependencies
[[share]]

## Gotchas
The runtime manifest is empty until all source artwork is published and byte-verified by prepare-suvichar.mjs. This blocks image sharing and is a merge blocker, not a successful publication. All 42 source backgrounds were decoded and inspected in five contact sheets; native WhatsApp/device checks remain required. No new master belongs in the bundled asset graph.
