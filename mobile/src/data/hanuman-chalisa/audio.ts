import type { SectionAudio } from '@/data/audio/types';

/**
 * Hanuman Chalisa recitation manifest (PRD-02, v1.5.0 pilot).
 *
 * ───────────────────────────────────────────────────────────────────────────
 * AUDIO ASSET PENDING (Content & licensing track, PRD-02 §8).
 *
 * This ships with `asset: null` so the build is green and the reader simply
 * shows no audio control yet. To go live:
 *
 *   1. Drop the commissioned recitation at
 *        mobile/assets/audio/hanuman-chalisa/recitation.m4a   (AAC mono 64 kbps)
 *   2. Replace the `asset` line with:
 *        asset: require('@assets/audio/hanuman-chalisa/recitation.m4a'),
 *   3. Fill `durationMs` and one `{ verseIndex, startMs, endMs }` per verse,
 *      contiguous and covering [0, durationMs] (validated by
 *      `audioManifest.invariants.test.ts`). There are 43 verses
 *      (`hanuman-chalisa.json` verse order = verseIndex order).
 *
 * Do NOT auto-generate timings from an arbitrary recording (PRD-02 §11 risk);
 * annotate the commissioned file (Audacity / Whisper + manual cleanup).
 * ───────────────────────────────────────────────────────────────────────────
 */
export const hanumanChalisaAudio: SectionAudio = {
  asset: null,
  durationMs: 0,
  segments: [],
  artistHi: '',
  artistEn: '',
};
