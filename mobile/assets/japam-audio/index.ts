/**
 * Per-mantra japam audio recordings.
 *
 * Drop an mp3/m4a/wav file next to this file named `<mantra-id>.mp3`
 * (matching the `id` in `mobile/src/data/japam/japam.json`), then register
 * it below with `require('./<mantra-id>.mp3')`.
 *
 * One full playback of the file represents one bead; the JapamCounter
 * loops the file and increments on each iteration.
 */
export const japamAudio: Record<string, number> = {
  'om-namah-shivaya': require('./om-namah-shivaya.mp3'),
  // 'hare-krishna-mahamantra': require('./hare-krishna-mahamantra.mp3'),
  // 'gayatri-mantra': require('./gayatri-mantra.mp3'),
  // 'om-namo-bhagavate-vasudevaya': require('./om-namo-bhagavate-vasudevaya.mp3'),
};

export function getJapamAudioSource(mantraId: string): number | null {
  return japamAudio[mantraId] ?? null;
}
