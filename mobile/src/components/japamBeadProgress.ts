/**
 * Pure bead-counting reducer for the japam auto-chant.
 *
 * The player loops a recording; one full loop should register `repetitions`
 * beads — a single-recitation clip has `repetitions = 1` (one bead per loop),
 * a musical rendition that chants the mantra many times declares that count and
 * the clip is split into that many equal-time segments.
 *
 * Counting is driven by **elapsed play time on a wall clock**, not by the
 * reported playback position. Native looping does not reliably emit a backward
 * jump in `currentTime` when the clip restarts (and on some devices the
 * position climbs past the duration, or stalls), which left position-based
 * counting frozen after the first loop. Wall-clock timing is immune to those
 * quirks: as long as the clip reports `playing`, each real second (scaled by
 * the playback tempo) advances the count, so beads keep moving for the whole
 * session.
 *
 * It is deliberately UI-free (no expo-audio / react-native imports) so the
 * arithmetic can be unit-tested in isolation — see `__tests__/japamBeadProgress.test.ts`.
 */
export type BeadProgress = {
  /** Audio time played so far, in milliseconds (monotonic, tempo-adjusted). */
  playedMs: number;
  /** Total beads registered so far (monotonic non-decreasing). */
  emitted: number;
  /** Wall-clock timestamp of the previous tick, in ms (0 = no prior tick). */
  prevNowMs: number;
};

export const INITIAL_BEAD_PROGRESS: BeadProgress = {
  playedMs: 0,
  emitted: 0,
  prevNowMs: 0,
};

export type BeadTick = {
  /** Current wall-clock timestamp, in ms (e.g. `Date.now()`). */
  nowMs: number;
  /** Clip duration at natural tempo, in seconds. */
  duration: number;
  /** Recitations contained in one full playback (coerced to >= 1). */
  repetitions: number;
  /** Playback tempo multiplier (1.0 = natural speed; coerced to > 0). */
  rate: number;
  /** Whether the clip is actively playing. */
  playing: boolean;
};

/**
 * Wall-clock gaps longer than this (ms) are treated as a pause/background gap,
 * not play time — so returning to a backgrounded session (or the first tick
 * after a long pause) doesn't dump a burst of beads for time the audio wasn't
 * actually advancing. The counting interval ticks far more often than this.
 */
const MAX_TICK_GAP_MS = 2_000;

/**
 * Advance the counter by one status tick. Returns the next state and the number
 * of beads (`delta`, always >= 0) to register now.
 *
 * Each playing tick credits the real time elapsed since the previous tick,
 * scaled by the playback tempo, as audio time. One bead is `duration / reps`
 * seconds of audio, so the cumulative bead target is `floor(playedMs / beadMs)`
 * — monotonic, so a coarse or dropped tick never loses or double-counts beads.
 */
export function advanceBeadProgress(
  state: BeadProgress,
  tick: BeadTick
): { state: BeadProgress; delta: number } {
  const { nowMs, duration, playing } = tick;
  const reps = tick.repetitions > 0 ? Math.floor(tick.repetitions) : 1;
  const rate = tick.rate > 0 ? tick.rate : 1;

  // Not playing, or no known duration yet: hold the count and just mark the
  // clock, so the next playing tick measures elapsed time from here (not across
  // the pause).
  if (duration <= 0 || !playing) {
    return { state: { ...state, prevNowMs: nowMs }, delta: 0 };
  }

  // Real time since the last tick, scaled by tempo into audio time. The first
  // tick (no prior clock) and any over-long gap (backgrounded/paused) contribute
  // nothing — only steady play accrues beads.
  const gap = state.prevNowMs > 0 ? nowMs - state.prevNowMs : 0;
  const elapsed = gap > 0 && gap <= MAX_TICK_GAP_MS ? gap * rate : 0;
  const playedMs = state.playedMs + elapsed;

  const beadMs = (duration / reps) * 1000;
  const target = beadMs > 0 ? Math.floor(playedMs / beadMs) : state.emitted;
  const delta = Math.max(0, target - state.emitted);
  const emitted = delta > 0 ? target : state.emitted;

  return { state: { playedMs, emitted, prevNowMs: nowMs }, delta };
}
