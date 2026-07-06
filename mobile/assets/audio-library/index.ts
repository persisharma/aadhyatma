import type { AudioSource } from 'expo-audio';

/**
 * Audio-library track sources.
 *
 * Mirrors `assets/japam-audio/index.ts`: a track id maps to a bundled
 * `require()` (a number) or — later — a remote `{ uri }` for streaming, so the
 * player layer never has to know where a track lives.
 *
 * Only tracks listed here have audio. The library and the reader play button
 * show a track ONLY when `hasRealAudio` is true, so nothing surfaces without a
 * recording behind it. Add a track by dropping its file alongside this one and
 * adding a `'<track-id>': require('./<file>.mp3')` line.
 */
const audioLibrary: Record<string, AudioSource> = {
  'gayatri-mantra': require('./gayatri-mantra.mp3'),
  'hare-rama': require('./hare-rama.mp3'),
};

/** True when a real recording is bundled for this track id. */
export function hasRealAudio(trackId: string): boolean {
  return Object.prototype.hasOwnProperty.call(audioLibrary, trackId);
}

export function getAudioSource(trackId: string): AudioSource | null {
  return audioLibrary[trackId] ?? null;
}
