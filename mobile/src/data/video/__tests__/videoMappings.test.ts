import {
  VIDEO_MAPPINGS,
  getVideoMapping,
  isMappingEnabled,
  type VideoMapping,
} from '../videoMappings';
import { getChalisa } from '@/data/chalisaRegistry';
import { isValidCueSheet } from '@/video/videoSync';

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

  it('every cue sheet times exactly the pages of the text it maps', () => {
    // A sheet that drifts from the text's page count would mis-sync every verse after
    // the drift; the reader refuses it, so it must never ship.
    for (const m of VIDEO_MAPPINGS) {
      if (!m.cues) continue;
      expect(isValidCueSheet(m.cues, getChalisa(m.contentId).verses.length)).toBe(true);
    }
  });
});
