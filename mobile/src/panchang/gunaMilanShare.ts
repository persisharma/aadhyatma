import type { ExactGunaMilanResult, GunaMilanBandId, GunaMilanRole, KootaId } from './gunaMilan';

export type GunaMilanSharePerson = {
  role: GunaMilanRole;
  name?: string;
};

export type GunaMilanShareModel = {
  kind: 'guna-milan-share-v1';
  groom: GunaMilanSharePerson;
  bride: GunaMilanSharePerson;
  total: number;
  baseBand: GunaMilanBandId;
  band: GunaMilanBandId;
  scores: readonly { id: KootaId; score: number; max: number }[];
  disclaimer: 'traditional-guidance-not-decision';
};

/** Privacy allow-list: birth inputs are intentionally not accepted. */
export function buildGunaMilanShareModel(
  result: ExactGunaMilanResult,
  names?: { groom?: string; bride?: string }
): GunaMilanShareModel {
  return {
    kind: 'guna-milan-share-v1',
    groom: { role: 'groom', ...(names?.groom?.trim() ? { name: names.groom.trim() } : {}) },
    bride: { role: 'bride', ...(names?.bride?.trim() ? { name: names.bride.trim() } : {}) },
    total: result.total,
    baseBand: result.baseBand,
    band: result.band,
    scores: result.kootas.map(({ id, score, max }) => ({ id, score, max })),
    disclaimer: 'traditional-guidance-not-decision',
  };
}
