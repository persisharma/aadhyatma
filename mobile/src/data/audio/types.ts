import type { AudioSegment } from '@/audio/segments';

/**
 * Bundled recitation for one section.
 *
 * Per PRD-02 the audio is shipped inside the app binary (no streaming, no CDN).
 * `asset` is a `require()`'d module reference to a single `.m4a` file under
 * `mobile/assets/audio/<section>/`; `segments` maps each verse to its slice of
 * that file. While a section's recitation is still being commissioned, leave
 * `asset: null` — the reader then shows no audio control for that section.
 */
export type SectionAudio = {
  /** `require('@assets/audio/<id>/recitation.m4a')`, or null until recorded. */
  asset: number | null;
  /** Total length of the recitation in milliseconds. */
  durationMs: number;
  /** Per-verse `[startMs, endMs)` segments, dense and 0-based by verse index. */
  segments: AudioSegment[];
  /** Voice-artist attribution shown under the player ("About this recitation"). */
  artistHi: string;
  artistEn: string;
};
