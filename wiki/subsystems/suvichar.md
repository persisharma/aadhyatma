---
title: Suvichar personalized cards
type: subsystem
sources: [mobile/src/screens/SuvicharScreen.tsx, mobile/src/components/SuvicharCard.tsx, mobile/src/components/SuvicharEntryCard.tsx, mobile/src/components/SuvicharFramePicker.tsx, mobile/src/data/suvichar.ts, scripts/prepare-suvichar.mjs]
last_verified_date: 2026-10-24
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

Footer text must sit inside the painted footer strip: before the three-slice layout the whole lower panel stretched, so the divider rule landed through the VEDANSH line and the top-overlaid वेदांश crossed the भक्ति पत्र frame rule. `suvicharFooterBand` and `suvicharBrandSlot` hold per-frame fractions measured on all 42 masters (footer divider ≈ .90/.91, bottom border ≈ .97–.98; blank top space: jharokha cartouche .008–.076, floral band .004–.054, letter-frame margin .004–.064 with its rule at ≈ .03); re-measure if a master is regenerated. Every frame uses the same app-icon + वेदांश pill; anything taller than ~21 dp would cover the crowns painted at the top centre of most masters. The वेदांश text keeps the full 1.65 leading (a 16 dp line box clipped the matras on iOS, shipping as "वदाश") and negative vertical margins keep the pill at 19 dp. The bundled brand mark is part of capture readiness. Daily Bhakti's entry is `SuvicharEntryCard` (miniature card + title + caret), not a bordered text box.

Salasar identity requires a shrine photo reference: the broad orange monolithic form, round eyes, triangular red nose and flat painted moustache/beard are essential. A naturalistic bearded human head was rejected despite matching the descriptive keywords. All three masters were corrected on 23 October; original frames and reviewed paper boundaries remain.

The composer has explicit control tiers (mode segment, underline filter tabs, painted deity/frame tiles, eyebrow labels) and a sticky heart + Share bar; the message is editable in both modes and the sender collapses to a `सप्रेम — name ✎` row once saved (design.md §82 composer layout). Ready-made mode is the default: `suvicharTemplatesFor(day)` in data/suvicharTemplates.ts composes one card per deity and seven wishes from existing authored content; the 21 thoughts rotate across deity cards by local day (stride = rail length, kept coprime), and an unedited authored thought is dropped on load so each visit opens on today's thought. SuvicharPresetPicker virtualizes thumbnail subscriptions to the shared R2 cache. A selection updates deity/frame/message while preserving the sender, and the full native SuvicharCard remains the single capture surface. All three frames remain available; custom mode preserves existing editing tools and switching modes does not reset preferences.
