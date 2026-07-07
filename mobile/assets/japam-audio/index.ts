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
 * One full playback of the file represents one bead; the JapamCounter
 * loops the file and increments on each iteration.
 */
export const japamAudio: Record<string, number> = {
  'om-namah-shivaya': require('./om-namah-shivaya.mp3'),
  'hare-krishna-mahamantra': require('../audio-library/hare-rama.mp3'),
  'gayatri-mantra': require('../audio-library/gayatri-mantra.mp3'),
  // 'om-namo-bhagavate-vasudevaya': require('./om-namo-bhagavate-vasudevaya.mp3'),
};

export function getJapamAudioSource(mantraId: string): number | null {
  return japamAudio[mantraId] ?? null;
}
