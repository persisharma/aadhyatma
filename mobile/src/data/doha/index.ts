import type { StutiPayload, StutiVerse } from '../stuti';
import type { DohaTheme } from './curation';

// Only these identities sit on the navigation/launch graph. Text loads on demand.
export const dohaIds = ['kabir-bhakti-dohe', 'rahim-bhakti-dohe'] as const;
export type DohaId = typeof dohaIds[number];
export type DohaVerse = StutiVerse & {
  themes: readonly DohaTheme[];
  themeReasonHi: string;
  source: { baseText: string; referenceUrls: readonly string[]; retrievedOn: string };
};
export type DohaPayload = Omit<StutiPayload, 'id' | 'verses'> & {
  id: DohaId;
  verses: readonly DohaVerse[];
};

export function isDohaId(id: string | undefined): id is DohaId {
  return id === 'kabir-bhakti-dohe' || id === 'rahim-bhakti-dohe';
}

export function getDoha(id: DohaId): DohaPayload {
  return id === 'kabir-bhakti-dohe'
    ? require('./kabir-bhakti-dohe.json')
    : require('./rahim-bhakti-dohe.json');
}

