# Shared karaoke reading model

## Implemented now

`KaraokeText.tsx` and `karaokeTiming.ts` are shared reading primitives. Infinity
is their first production-code caller. The counter creates one `Animated.Value`
and passes it to both the Infinity visual and the word renderer. Whole words
gradually change from theme ink to saffronDeep in reading order; the last word
finishes at phase 1, the host counts one japa and resets phase to 0. Pause holds
the existing phase/colour; tempo changes resume the remaining fraction. A style
or mantra change resets before paint. Reduced Motion keeps readable static text
while the existing host retains counting ownership.

The user-approved 1× silent pacing remains 880–1000ms for up to three words and
4000ms for Gayatri. Longer chants scale with canonical phonetic length. Tempo
is configurable with the existing stepper; active recordings supply their own
average cadence. The colour model follows that host clock, not microphone input
or verified word-by-word audio cues.

## Shared contract

- `buildKaraokeTimeline(lines, {referenceLines?, wordWeight?})` returns complete
  whole-word runs with normalised start/end intervals for one passage. Whitespace,
  punctuation and stored line boundaries are preserved. Matching canonical and
  displayed words retain reference weights even if line breaks differ. A
  different word count falls back to proportional reference-line timing where
  possible, or proportional display timing when line counts also differ. No scripture, phonetic rule, Japam counter, audio or navigation is imported.
- `KaraokeText` accepts those complete lines, optional reference/weight function,
  one host-owned 0–1 progress value (or a read-only derived phase), theme colours
  and existing font/size/leading tokens. Derived phases let differently styled
  verse/meaning blocks share sequential ranges of a single page clock. It creates native colour interpolations once per changed passage/theme;
  no per-frame JS listener or independent timer is added. It does not count or
  turn pages. Whole words are native Text runs so Indic shaping stays intact.
- `karaokeDurationMs(baseMs, rate)` supplies reusable configurable-speed math.
  The host validates its own speed bounds and owns start/pause/reset/lifecycle.
  Empty/invalid base duration returns 0: do not start an empty passage.
- Keep source arrays and weighting callbacks stable. The renderer is memoized;
  live count/provider changes must not rebuild its word graph. The current 22-item
  mantra catalogue's maximum is 16 word runs (full Hare Krishna), not the entire
  library rendered at once.
- Each text run grows/wraps instead of truncating or shrinking. The complete
  passage is one accessible text group; words do not create separate focus stops.
  Native word nodes are bounded by the host's current passage. Large prose needs
  its own page/layout/performance review; never discard text to meet a budget.

## Other sections — integration deferred by request

Other readers keep their current स्वतः behaviour. No reader, chapter, prose,
story, sharing or read-aloud surface was switched to karaoke in this change.

When a section is explicitly selected for integration:

1. Add a **whole-passage/page phase** to its existing playback owner and feed it
   to the renderer. `_useAutoSlide.ts` currently exposes per-scroll-step countdowns,
   not a whole-page phase. Binding each scroll countdown directly would restart
   the highlight at the first word after every scroll; do not do that.
2. Start it from the existing स्वतः control and retain that control's configurable
   speed. Keep user holds, resume, manual swipes, chapter handoff, keep-awake,
   read-aloud exclusivity, screen-reader guard and page-completion ownership.
   There must be one completion owner and one clock, not a new timer per word.
3. Feed the complete visible passage and correct script typography. Mixed verse,
   meaning and commentary blocks need one overall page schedule before styling
   individual blocks; never start them all at phase 0 independently.
4. Reset for a new content identity, freeze on pause/hold, cancel on Back/unmount
   and background according to the host's rules, and preserve saved reader state.
5. Verify all four scripts, M/L, compact/system text, long words/prose, automatic
   scroll and actual native screenshots before enabling the section. Exact audio
   synchronisation requires verified cues/boundary events; estimated colour timing
   must not be presented as actual speech detection.

## Evidence and pending work

Focused tests cover ordered colouring/reset, pause by holding the host phase,
108 parent updates without new word interpolation nodes, Reduced Motion,
complete accessibility text, script/line-boundary preservation, mismatched
translations and configurable speed. Screen/provider tests cover the shared
Infinity/highlight phase in all four languages at M/L, with Mala unchanged.

The installed React Native 0.81.5 native animation allowlist includes `color`.
That establishes API support, not device fidelity or frame performance. Native
iOS/Android appearance, word wrapping/centering and physical low-end profiling
remain pending. The broader CI issues in the Japam review record remain pending;
unit tests do not establish a ready-for-merge state.
