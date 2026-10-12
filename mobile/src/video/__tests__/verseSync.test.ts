import { verseIndexForTime } from '../verseSync';

describe('verseIndexForTime', () => {
  it('returns 0 for an empty text', () => {
    expect(verseIndexForTime(50, 100, 0)).toBe(0);
  });

  describe('plain proportional (no hints)', () => {
    it('maps the midpoint to the middle verse', () => {
      expect(verseIndexForTime(50, 100, 43)).toBe(21); // round(0.5 * 42)
    });
    it('clamps the ends', () => {
      expect(verseIndexForTime(0, 100, 43)).toBe(0);
      expect(verseIndexForTime(100, 100, 43)).toBe(42);
      expect(verseIndexForTime(999, 100, 43)).toBe(42);
    });
    it('is 0 when duration is unknown', () => {
      expect(verseIndexForTime(10, 0, 43)).toBe(0);
    });
  });

  describe('anchored proportional (startSec/endSec)', () => {
    it('trims the intro/outro window', () => {
      // 10s intro, 10s outro on a 120s video; midpoint of the 100s window → middle.
      expect(verseIndexForTime(60, 120, 43, { startSec: 10, endSec: 110 })).toBe(21);
      expect(verseIndexForTime(10, 120, 43, { startSec: 10, endSec: 110 })).toBe(0);
      expect(verseIndexForTime(110, 120, 43, { startSec: 10, endSec: 110 })).toBe(42);
    });
    it('clamps before the window starts', () => {
      expect(verseIndexForTime(3, 120, 43, { startSec: 10, endSec: 110 })).toBe(0);
    });
  });

  describe('cue-based (exact)', () => {
    const cues = [0, 10, 25, 40, 60];
    it('selects the last cue at or before the current time', () => {
      expect(verseIndexForTime(0, 70, 5, { cues })).toBe(0);
      expect(verseIndexForTime(5, 70, 5, { cues })).toBe(0);
      expect(verseIndexForTime(10, 70, 5, { cues })).toBe(1);
      expect(verseIndexForTime(39, 70, 5, { cues })).toBe(2);
      expect(verseIndexForTime(40, 70, 5, { cues })).toBe(3);
      expect(verseIndexForTime(1000, 70, 5, { cues })).toBe(4);
    });
    it('never exceeds the verse count even if cues are longer', () => {
      expect(verseIndexForTime(1000, 70, 3, { cues })).toBe(2);
    });
    it('takes precedence over anchors', () => {
      expect(verseIndexForTime(10, 70, 5, { cues, startSec: 0, endSec: 70 })).toBe(1);
    });
  });
});
