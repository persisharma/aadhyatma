/**
 * Per-mantra japam audio recordings.
 *
 * Drop an mp3/m4a/wav file next to this file named `<mantra-id>.mp3`
 * (matching the `id` in `mobile/src/data/japam/japam.json`), then register
 * it below with `require('./<mantra-id>.mp3')`.
 *
 * A recording may also be shared with the Audio ("Bhajan") library rather than
 * duplicated: when the same take already ships in `assets/audio-library/`,
 * point the japam id at that file with a relative `require('../audio-library/…')`
 * so the mp3 is bundled once. The mahamantra take (`hare-rama.mp3`) covers the
 * full Hare Krishna / Hare Rama mahamantra, so it backs `hare-krishna-mahamantra`.
 *
 * ── Bead counting ────────────────────────────────────────────────────────
 * The JapamCounter loops the file and advances the bead count as it plays. A
 * plain single-recitation clip chants the mantra ONCE per playback, so one full
 * loop = one bead (the default when `repetitions` is omitted). A musical
 * rendition chants the mantra MANY times within one file, so it must declare
 * how many repetitions the recording contains — the player then advances one
 * bead per repetition (spread evenly across the clip) instead of a single bead
 * per multi-minute loop.
 *
 * `repetitions` is an estimate derived from the recording's length and chant
 * cadence; tune it against the actual audio if a round drifts from 108 beads.
 */
export type JapamAudioClip = {
  /** Bundled asset handle (`require(...)`) for the recording. */
  source: number;
  /**
   * How many times the mantra is chanted in one full playback of the file.
   * Omit (or `1`) for a single-recitation clip. Musical renditions that repeat
   * the mantra set this so the bead counter tracks the chanting, not the file.
   */
  repetitions?: number;
};

const japamAudio: Record<string, JapamAudioClip> = {
  // Single recitation — one loop is one bead.
  'om-namah-shivaya': { source: require('./om-namah-shivaya.mp3') },
  // Musical mahamantra kirtan (~8 min): chants the mahamantra continuously.
  'hare-krishna-mahamantra': {
    source: require('../audio-library/hare-rama.mp3'),
    repetitions: 16,
  },
  // Melodic Gayatri rendition (~3 min): repeats the mantra several times.
  'gayatri-mantra': {
    source: require('../audio-library/gayatri-mantra.mp3'),
    repetitions: 6,
  },
  // 'om-namo-bhagavate-vasudevaya': { source: require('./om-namo-bhagavate-vasudevaya.mp3') },
};

export function getJapamAudioSource(mantraId: string): number | null {
  return japamAudio[mantraId]?.source ?? null;
}

/**
 * Mantra repetitions contained in one full playback of the recording — the
 * number of beads a single loop should register. Defaults to 1 (single
 * recitation) for clips without an explicit count.
 */
export function getJapamAudioRepetitions(mantraId: string): number {
  const reps = japamAudio[mantraId]?.repetitions;
  return reps != null && reps > 0 ? reps : 1;
}
