import {
  VIDEO_MAPPINGS,
  getVideoMapping,
  isMappingEnabled,
  type VideoMapping,
} from '../videoMappings';
import { getChalisa } from '@/data/chalisaRegistry';
import { verseIndexForTime } from '@/video/verseSync';

const base: VideoMapping = {
  contentId: 'test-text',
  videoId: 'AETFvQonfV8',
  titleHi: 'परीक्षण',
  titleEn: 'Test',
  channel: 'Test Channel',
  sourceUrl: 'https://www.youtube.com/watch?v=AETFvQonfV8',
  spokenLang: 'hi',
  reviewedOn: '2026-10-10',
  status: 'verified',
};

describe('isMappingEnabled', () => {
  it('enables a verified mapping in both dev and prod', () => {
    expect(isMappingEnabled({ ...base, status: 'verified' }, true)).toBe(true);
    expect(isMappingEnabled({ ...base, status: 'verified' }, false)).toBe(true);
  });

  it('never enables a pending mapping', () => {
    expect(isMappingEnabled({ ...base, status: 'pending' }, true)).toBe(false);
    expect(isMappingEnabled({ ...base, status: 'pending' }, false)).toBe(false);
  });

  it('enables a dev-demo mapping ONLY in dev', () => {
    expect(isMappingEnabled({ ...base, status: 'dev-demo' }, true)).toBe(true);
    expect(isMappingEnabled({ ...base, status: 'dev-demo' }, false)).toBe(false);
  });

  it('rejects a mapping with a malformed video id regardless of status', () => {
    expect(isMappingEnabled({ ...base, videoId: 'bad', status: 'verified' }, true)).toBe(false);
  });
});

describe('getVideoMapping', () => {
  it('returns undefined for a text with no mapping', () => {
    expect(getVideoMapping('no-such-text', true)).toBeUndefined();
  });

  it('applies the status gate (pending text stays hidden)', () => {
    // The registry is independent of the audio catalog, so a text id that has no
    // enabled row simply returns undefined — the reader then shows its unavailable
    // state, never a disabled video button.
    expect(getVideoMapping('definitely-not-mapped', false)).toBeUndefined();
  });
});

describe('registry integrity', () => {
  it('every mapping has a valid 11-char id and provenance url', () => {
    for (const m of VIDEO_MAPPINGS) {
      expect(m.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(m.sourceUrl).toContain(m.videoId);
    }
  });

  it('no pending/unreviewed row is ever marked verified without a review date', () => {
    for (const m of VIDEO_MAPPINGS) {
      if (m.status === 'verified') expect(m.reviewedOn).toBeTruthy();
    }
  });

  it('has at most one mapping per content id', () => {
    const ids = VIDEO_MAPPINGS.map((m) => m.contentId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('any cues[] is one start-time per verse, in range, and non-decreasing', () => {
    // cues[] drives exact auto-scroll (verseSync.ts). If its length drifts from the
    // reader's verse count, or a cue is out of order, the wrong verse scrolls in.
    for (const m of VIDEO_MAPPINGS) {
      if (!m.cues) continue;
      const verses = getChalisa(m.contentId).verses;
      expect(m.cues.length).toBe(verses.length);
      for (let i = 0; i < m.cues.length; i++) {
        expect(m.cues[i]).toBeGreaterThanOrEqual(0);
        if (i > 0) expect(m.cues[i]).toBeGreaterThanOrEqual(m.cues[i - 1]);
      }
    }
  });
});

describe('hanuman-chalisa verse sync', () => {
  const m = getVideoMapping('hanuman-chalisa', false)!;
  const total = getChalisa('hanuman-chalisa').verses.length;
  const DUR = 582; // the T-Series recitation is 9:42

  it('ships 43 cues within the video duration', () => {
    expect(m.cues).toBeDefined();
    expect(m.cues!.length).toBe(total);
    expect(Math.max(...m.cues!)).toBeLessThan(DUR);
  });

  it('maps playback time to the expected verse via the cues', () => {
    const idx = (t: number) => verseIndexForTime(t, DUR, total, { cues: m.cues });
    expect(idx(0)).toBe(0); // before the first cue → verse 0
    expect(idx(2)).toBe(0); // doha 1 begins
    expect(idx(56)).toBe(2); // chaupai 1 (cues[2] = 56)
    expect(idx(66)).toBe(2); // still chaupai 1, just before chaupai 2 (67)
    expect(idx(67)).toBe(3); // chaupai 2 begins
    expect(idx(540)).toBe(total - 1); // closing doha (last cue)
    expect(idx(DUR)).toBe(total - 1); // outro clamps to the last verse
  });
});
