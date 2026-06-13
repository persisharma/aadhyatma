import { allSectionAudio } from '@/data/audio/registry';
import { validateSegments } from '@/audio/segments';

/**
 * Guards every registered section recitation (PRD-02 §7). A manifest is either:
 *   - a clean stub (asset not yet bundled → no segments), or
 *   - fully populated (asset bundled → dense, gapless segments covering the
 *     whole file, with attribution).
 * Half-populated manifests (e.g. an asset with no/!matching segments) fail.
 */
describe('section audio manifests', () => {
  it.each(allSectionAudio.map(([id]) => id))('%s is a clean stub or fully valid', (id) => {
    const audio = allSectionAudio.find(([k]) => k === id)![1];

    if (audio.asset == null) {
      // Not yet recorded — must be an inert stub so nothing half-wires.
      expect(audio.segments).toHaveLength(0);
      expect(audio.durationMs).toBe(0);
      return;
    }

    // Bundled — must be fully, correctly segmented.
    expect(audio.durationMs).toBeGreaterThan(0);
    expect(() => validateSegments(audio.segments, audio.durationMs)).not.toThrow();
    expect(audio.artistEn.trim().length).toBeGreaterThan(0);
    expect(audio.artistHi.trim().length).toBeGreaterThan(0);
  });
});
