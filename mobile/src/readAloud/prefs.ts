/**
 * Read-aloud preference shape and its constants.
 *
 * The rate bounds deliberately duplicate `AudioPlayerContext`'s MIN_RATE/MAX_RATE
 * numbers rather than importing them: that context owns expo-audio's playback-rate
 * limits, which is a different concern that merely happens to share a range today.
 */

import type { Lang } from '@/data/gita/language';

export const MIN_SPEECH_RATE = 0.5;
export const MAX_SPEECH_RATE = 1.5;
export const SPEECH_RATE_STEP = 0.1;
export const DEFAULT_SPEECH_RATE = 1.0;

/**
 * Read-aloud speaks each reading language in its OWN voice — there is no
 * substitution. A language whose voice the device lacks reports unavailable
 * instead. See `voices.ts`.
 */
export type SpeechTarget = Lang;

/** Every target a voice can be chosen for, in `LANGUAGES` order. */
export const SPEECH_TARGETS: readonly SpeechTarget[] = ['hi', 'en', 'gu', 'kn'];

export type ReadAloudPrefs = {
  /** Speech rate, clamped to [MIN_SPEECH_RATE, MAX_SPEECH_RATE]. */
  rate: number;
  /** Probed voice identifiers, per reading language. Absent = automatic selection. */
  voiceByTarget: Partial<Record<SpeechTarget, string>>;
  /** Speak the भावार्थ after the verse lines. */
  readMeaning: boolean;
  /** Speak the Gita commentary after the meaning. */
  readCommentary: boolean;
};

export const DEFAULT_READ_ALOUD_PREFS: ReadAloudPrefs = {
  rate: DEFAULT_SPEECH_RATE,
  voiceByTarget: {},
  readMeaning: true,
  readCommentary: false,
};

/** Clamp to the supported range and quantise to one decimal (avoids 0.7000000000000001). */
export function clampRate(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SPEECH_RATE;
  const clamped = Math.min(MAX_SPEECH_RATE, Math.max(MIN_SPEECH_RATE, value));
  return Math.round(clamped * 10) / 10;
}
