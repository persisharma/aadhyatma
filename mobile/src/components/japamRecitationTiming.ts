import { karaokeDurationMs } from './karaokeTiming';

/** User-approved fast silent-japa preset, scaled from canonical Devanagari.
 * This is a pacing aid, not speech recognition or a measured pronunciation.
 * Count vowel-bearing syllables, not Unicode length or translated UI text.
 */
export const MIN_SILENT_JAPA_MS = 880;
export const MIN_JAPA_RATE = 0.5;
export const MAX_JAPA_RATE = 1.5;
/** Extra wall-clock time per automatic jap, after the selected tempo. */
export const EXTRA_JAPA_MS = 500;
const MIN_NATIVE_PLAYBACK_RATE = 0.1;
// Calibrated to the requested full Gayatri loop of 4 seconds at 1×.
const MS_PER_UNIT = 125;
const LONG_VOWELS = new Set('आ ई ऊ ॠ ए ऐ ओ औ'.split(' '));
const LONG_MARKS = new Set('ा ी ू ॄ े ै ो ौ'.split(' '));

export function recitationUnits(lines: readonly string[]): number {
  const chars = Array.from(lines.join(' ').normalize('NFC'));
  let units = 0;
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === 'ॐ') { units += 2.5; continue; }
    if (/[\u0904-\u0914]/u.test(char)) {
      units += LONG_VOWELS.has(char) ? 1.25 : 1;
    } else if (/[\u0915-\u0939\u0958-\u095F]/u.test(char)) {
      let next = i + 1;
      if (chars[next] === '़') next++;
      // A half-consonant joins the next syllable; it has no vowel of its own.
      if (chars[next] === '्') continue;
      units += LONG_MARKS.has(chars[next]) ? 1.25 : 1;
    }
  }
  return units;
}

export function normalizeJapaRate(rate: number): number {
  return Number.isFinite(rate) && rate > 0
    ? Math.max(MIN_JAPA_RATE, Math.min(MAX_JAPA_RATE, rate)) : 1;
}

export function estimateRecitationMs(lines: readonly string[]): number {
  const duration = Math.max(MIN_SILENT_JAPA_MS, Math.ceil(recitationUnits(lines) * MS_PER_UNIT / 100) * 100);
  const words = lines.join(' ').split(/\s+/).filter(word => /[ॐ\u0904-\u0939\u0958-\u095F]/u.test(word));
  // Short chants of up to three words use 880–1000ms at the default tempo.
  return words.length <= 3 ? Math.min(1000, duration) : duration;
}

/** Native audio and its bead counter use this same effective rate. Stretch the
 * recorded utterance instead of adding a second pause/count timer. Pitch
 * correction stays enabled by the player. Invalid/loading metadata keeps the
 * user's rate; very short malformed clips respect Android's native lower bound.
 */
export function japaAudioPlaybackRate(recitationMs: number, rate = 1): number {
  const requested = normalizeJapaRate(rate);
  if (!Number.isFinite(recitationMs) || recitationMs <= 0) return requested;
  return Math.max(MIN_NATIVE_PLAYBACK_RATE, recitationMs / (karaokeDurationMs(recitationMs, requested) + EXTRA_JAPA_MS));
}

/** Every automatic jap takes 500ms longer at the currently selected tempo.
 * Recorded playback, wall-clock beads and the visual loop share that cadence.
 */
export function infinityRecitationMs(lines: readonly string[], rate = 1, audioRecitationMs?: number | null): number {
  const audio = typeof audioRecitationMs === 'number' && Number.isFinite(audioRecitationMs) && audioRecitationMs > 0;
  const base = audio ? audioRecitationMs : estimateRecitationMs(lines);
  return audio ? Math.max(1, Math.round(base / japaAudioPlaybackRate(base, rate)))
    : karaokeDurationMs(base, normalizeJapaRate(rate)) + EXTRA_JAPA_MS;
}
