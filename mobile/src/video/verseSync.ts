/**
 * Picks which verse page should be showing for a given video playback position,
 * so a docked video can auto-advance the reader in time with the recitation.
 *
 * Three modes, most accurate first — all driven by the CURRENT TIME (seconds), not
 * a raw fraction, so the mapping can account for the video's own pacing:
 *
 *  - `cues` — per-verse start seconds (`cues[i]` = when verse i begins). Exact: the
 *    active verse is the last cue at or before `currentSec`. Only this mode tracks
 *    uneven pacing (held lines, instrumental breaks). Editorial supplies these.
 *  - anchored proportional (`startSec` / `endSec`) — linear within the recitation
 *    window, trimming the intro/outro music that otherwise pushes the text ahead of
 *    the chant. Two numbers, big accuracy win over raw proportional.
 *  - plain proportional — `currentSec / durationSec` across the whole video. The
 *    zero-config fallback; drifts around intros and uneven pacing.
 */

export type VerseSyncHints = {
  /** Per-verse start times in seconds; index aligns with the reader's verse index. */
  cues?: readonly number[];
  /** Second at which the recitation actually begins (skips the intro). */
  startSec?: number;
  /** Second at which the recitation ends (skips the outro). */
  endSec?: number;
};

/** Returns the 0-based verse index to show at `currentSec`. Always in [0, verseCount-1]. */
export function verseIndexForTime(
  currentSec: number,
  durationSec: number,
  verseCount: number,
  hints: VerseSyncHints = {}
): number {
  if (verseCount <= 0) return 0;
  const last = verseCount - 1;
  const t = Number.isFinite(currentSec) ? Math.max(0, currentSec) : 0;
  const clamp = (i: number) => Math.min(last, Math.max(0, i));

  const { cues, startSec, endSec } = hints;

  if (cues && cues.length > 0) {
    let idx = 0;
    for (let i = 0; i < cues.length && i <= last; i++) {
      if (cues[i] <= t) idx = i;
      else break;
    }
    return clamp(idx);
  }

  const start = startSec != null && startSec >= 0 ? startSec : 0;
  const duration = Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 0;
  const end = endSec != null && endSec > start ? endSec : duration;
  if (end <= start) return 0;
  const frac = Math.min(1, Math.max(0, (t - start) / (end - start)));
  return clamp(Math.round(frac * last));
}
