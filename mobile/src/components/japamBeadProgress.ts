/**
 * Pure bead-counting reducer for the japam auto-chant.
 *
 * The player loops a recording; one full loop should register `repetitions`
 * beads — a single-recitation clip has `repetitions = 1` (one bead per loop),
 * a musical rendition that chants the mantra many times declares that count and
 * the clip is split into that many equal-time segments. This reducer turns each
 * reported playback position into a *cumulative* bead target and returns how
 * many new beads to register this tick (`delta`), so the caller applies them in
 * a single counter update rather than one call per bead.
 *
 * It is deliberately UI-free (no expo-audio / react-native imports) so the
 * arithmetic can be unit-tested in isolation — see `__tests__/japamBeadProgress.test.ts`.
 */
export type BeadProgress = {
  /** Completed loops of the recording so far. */
  loops: number;
  /** Total beads registered so far (monotonic non-decreasing). */
  emitted: number;
  /** Last observed playback position, in seconds. */
  prevTime: number;
};

export const INITIAL_BEAD_PROGRESS: BeadProgress = {
  loops: 0,
  emitted: 0,
  prevTime: 0,
};

export type BeadTick = {
  /** Current playback position, in seconds. */
  currentTime: number;
  /** Clip duration, in seconds. */
  duration: number;
  /** Recitations contained in one full playback (coerced to >= 1). */
  repetitions: number;
  /** Whether the clip is actively playing. */
  playing: boolean;
};

/**
 * Advance the counter by one status tick. Returns the next state and the number
 * of beads (`delta`, always >= 0) to register now.
 *
 * A loop boundary is detected as a large backward jump in position (the clip
 * restarted from the top). Detection degrades gracefully: because the target is
 * cumulative and monotonic, a missed wrap loses at most one loop's beads and
 * self-heals on the next detected wrap — it never permanently stalls counting.
 */
export function advanceBeadProgress(
  state: BeadProgress,
  tick: BeadTick
): { state: BeadProgress; delta: number } {
  const { currentTime, duration, playing } = tick;
  const reps = tick.repetitions > 0 ? Math.floor(tick.repetitions) : 1;

  // Position isn't meaningful yet, or playback is paused: only record the
  // position so the next tick can measure movement from here.
  if (duration <= 0 || !playing) {
    return { state: { ...state, prevTime: currentTime }, delta: 0 };
  }

  // A large backward jump means the clip looped back to the start. The
  // half-duration threshold ignores minor position jitter between ticks.
  let loops = state.loops;
  if (state.prevTime - currentTime > duration * 0.5) {
    loops += 1;
  }

  // Beads elapsed within the current loop (0 .. reps), split evenly by time.
  const withinLoop = Math.min(reps, Math.floor((currentTime / duration) * reps));
  const target = loops * reps + withinLoop;
  const delta = Math.max(0, target - state.emitted);
  const emitted = delta > 0 ? target : state.emitted;

  return { state: { loops, emitted, prevTime: currentTime }, delta };
}
