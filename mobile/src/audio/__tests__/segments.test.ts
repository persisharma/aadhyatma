import {
  clampVerseIndex,
  findVerseIndexAtMs,
  isValidSegments,
  segmentStartMs,
  validateSegments,
  type AudioSegment,
} from '../segments';

const segs: AudioSegment[] = [
  { verseIndex: 0, startMs: 0, endMs: 1000 },
  { verseIndex: 1, startMs: 1000, endMs: 2500 },
  { verseIndex: 2, startMs: 2500, endMs: 4000 },
];

describe('findVerseIndexAtMs', () => {
  it('maps a time inside a segment to its verse', () => {
    expect(findVerseIndexAtMs(segs, 0)).toBe(0);
    expect(findVerseIndexAtMs(segs, 999)).toBe(0);
    expect(findVerseIndexAtMs(segs, 1000)).toBe(1); // boundary belongs to next verse
    expect(findVerseIndexAtMs(segs, 2499)).toBe(1);
    expect(findVerseIndexAtMs(segs, 2500)).toBe(2);
    expect(findVerseIndexAtMs(segs, 3999)).toBe(2);
  });

  it('clamps times outside the covered range', () => {
    expect(findVerseIndexAtMs(segs, -50)).toBe(0);
    expect(findVerseIndexAtMs(segs, 4000)).toBe(2);
    expect(findVerseIndexAtMs(segs, 99999)).toBe(2);
  });

  it('is safe on an empty manifest', () => {
    expect(findVerseIndexAtMs([], 1234)).toBe(0);
  });
});

describe('segmentStartMs', () => {
  it('returns the start offset for a verse', () => {
    expect(segmentStartMs(segs, 0)).toBe(0);
    expect(segmentStartMs(segs, 2)).toBe(2500);
  });
  it('falls back to 0 for an unknown verse', () => {
    expect(segmentStartMs(segs, 99)).toBe(0);
  });
});

describe('clampVerseIndex', () => {
  it('keeps in-range indices', () => {
    expect(clampVerseIndex(1, 3)).toBe(1);
  });
  it('clamps out-of-range indices', () => {
    expect(clampVerseIndex(-1, 3)).toBe(0);
    expect(clampVerseIndex(5, 3)).toBe(2);
    expect(clampVerseIndex(0, 0)).toBe(0);
  });
});

describe('validateSegments', () => {
  it('accepts a dense, contiguous manifest', () => {
    expect(() => validateSegments(segs, 4000)).not.toThrow();
    expect(isValidSegments(segs, 4000)).toBe(true);
  });

  it('rejects an empty manifest', () => {
    expect(() => validateSegments([])).toThrow(/empty/);
  });

  it('rejects a manifest that does not start at 0', () => {
    expect(() =>
      validateSegments([{ verseIndex: 0, startMs: 200, endMs: 1000 }])
    ).toThrow(/start at 0/);
  });

  it('rejects non-dense / misordered verse indices', () => {
    expect(() =>
      validateSegments([
        { verseIndex: 0, startMs: 0, endMs: 1000 },
        { verseIndex: 2, startMs: 1000, endMs: 2000 },
      ])
    ).toThrow(/dense/);
  });

  it('rejects gaps and overlaps', () => {
    expect(() =>
      validateSegments([
        { verseIndex: 0, startMs: 0, endMs: 1000 },
        { verseIndex: 1, startMs: 1100, endMs: 2000 }, // gap
      ])
    ).toThrow(/gap\/overlap/);
    expect(() =>
      validateSegments([
        { verseIndex: 0, startMs: 0, endMs: 1000 },
        { verseIndex: 1, startMs: 900, endMs: 2000 }, // overlap
      ])
    ).toThrow(/gap\/overlap/);
  });

  it('rejects non-positive durations', () => {
    expect(() =>
      validateSegments([{ verseIndex: 0, startMs: 0, endMs: 0 }])
    ).toThrow(/non-positive/);
  });

  it('rejects a manifest that does not cover the full duration', () => {
    expect(() => validateSegments(segs, 5000)).toThrow(/expected 5000/);
  });
});
