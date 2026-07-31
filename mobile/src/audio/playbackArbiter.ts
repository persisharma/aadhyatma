/**
 * One-speaker-at-a-time arbitration across the app's three independent audio sources:
 * the global recorded-audio player (`AudioPlayerContext`), the component-scoped japam
 * loop (`JapamAudioPlayer`), and read-aloud TTS (`ReadAloudContext`).
 *
 * This is a plain module singleton rather than a context field on purpose. Routing
 * exclusion through `AudioPlayerContext`'s value would force every screen test that
 * stubs `useAudioPlayerContext` to grow a new field; as a module, each source opts in
 * with one line and no consumer's contract changes.
 *
 * It matters because iOS runs `interruptionMode: 'mixWithOthers'` (see audioSession.ts)
 * — without arbitration a recorded bhajan and a spoken verse literally talk over
 * each other rather than one interrupting the other.
 */

export type PlaybackKind = 'recorded' | 'tts' | 'japam';

const stoppers = new Map<PlaybackKind, () => void>();

/**
 * Registers a source's stop function. Returns an unregister callback suitable for
 * returning straight from a `useEffect`.
 */
export function registerStopper(kind: PlaybackKind, stop: () => void): () => void {
  stoppers.set(kind, stop);
  return () => {
    // Only remove if this exact stopper is still the registered one, so a remount that
    // registers before the old effect cleans up does not erase the live entry.
    if (stoppers.get(kind) === stop) stoppers.delete(kind);
  };
}

/**
 * Silences every source other than `kind`. Call immediately before starting playback.
 * Stopping the claiming source itself is never correct — it is about to play.
 */
export function claimPlayback(kind: PlaybackKind): void {
  for (const [registered, stop] of stoppers) {
    if (registered === kind) continue;
    try {
      stop();
    } catch {
      /* a failing stopper must not prevent the claim or the other stoppers */
    }
  }
}

/** Test seam — drops every registration. Not used in app code. */
export function __resetPlaybackArbiter(): void {
  stoppers.clear();
}
