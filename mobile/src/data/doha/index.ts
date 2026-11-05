import type { StutiPayload } from '../stuti';

// Only these identities sit on the navigation/launch graph. Text loads on demand.
export const dohaIds = ['kabir-bhakti-dohe', 'rahim-bhakti-dohe'] as const;
export type DohaId = typeof dohaIds[number];

export function isDohaId(id: string | undefined): id is DohaId {
  return id === 'kabir-bhakti-dohe' || id === 'rahim-bhakti-dohe';
}

export function getDoha(id: DohaId): StutiPayload {
  return id === 'kabir-bhakti-dohe'
    ? require('./kabir-bhakti-dohe.json')
    : require('./rahim-bhakti-dohe.json');
}
