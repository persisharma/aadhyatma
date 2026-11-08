---
title: Shared karaoke reading model
type: concept
sources: [mobile/src/components/KaraokeText.tsx, mobile/src/components/karaokeTiming.ts, mobile/src/components/JapamInfinity.tsx, mobile/src/screens/JapamCounterScreen.tsx, mobile/src/screens/_useAutoSlide.ts, docs/engineering/karaoke-integration.md, design.md]
last_verified_date: 2026-11-07
confidence: high
status: current
---

## Summary

Whole-word reading colour is shared; playback remains owned by each feature.
Infinity is wired now. Other sections' स्वतः integration is deferred by the user.

## Details

- `buildKaraokeTimeline` preserves complete lines/whitespace and returns 0–1 word
  intervals. Reference weighting survives script and line-break changes when
  word counts match; mismatches use proportional reference-line allocation where possible, or display-passage allocation when line counts also differ.
- `KaraokeText` accepts progress, complete lines, optional reference/weights,
  theme colours and existing typography. Each word is a base `Text` plus an identical absolutely-filled highlight copy whose native opacity fades in; memoized text
  avoid per-frame JS updates. Reduced Motion is static; the full passage remains
  one accessible group. Font sizing/wrapping grows rather than clipping text.
- `karaokeDurationMs` applies a caller-selected speed without importing Japam,
  audio or page navigation. Empty/invalid duration means no passage.
- Infinity supplies one phase to both words and marker. Its own loop still
  counts, pauses and handles background/blur; the renderer never increments. Japa adds a fixed 500ms after tempo scaling in its host timing adapter, shared with recorded playback and bead timing; the generic karaoke renderer/timeline is unchanged.

## Gotchas

- **Never native-drive Text `color`.** RN allows it on the native driver, but text colour is part of the shadow-tree text layout, so it never repaints mid-animation. On loop end JS syncs phase 1 (whole passage turns highlighted at once) and the following native `setValue(0)` does not flush, so it never resets. Shipped that way in #638; fixed with the opacity overlay (Nov 2026).

- `_useAutoSlide` currently exposes scroll-step countdowns, not a whole-page
  phase. Reusing that countdown directly would restart words after each scroll.
  Add a proper passage-phase adapter when that section is approved for wiring.
- Preserve auto-slide holds, speed, manual swipes, chapter handoff, read-aloud
  exclusivity, keep-awake and screen-reader guards. Do not add a second clock or
  completion owner. Mixed verse/meaning blocks need one overall page schedule.
- Full word shaping and source text are invariants. Do not split Indic glyphs,
  ellipsize long words, or drop content to reduce native node count.
- Current 31-mantra catalogue peaks at 16 word runs. Long prose and all native
  script/size/layout/performance checks remain per-integration requirements.
- Recording-derived average cadence is not verified word-level audio cues or
  speech recognition. Native colour support does not prove device fidelity.

## Dependencies

[[subsystems/japam]] · [[readers]] · [[languages]]
