import type { Deity } from '../texts';
import raw from './japam.json';

export type JapamMantra = {
  id: string;
  nameHi: string;
  nameEn: string;
  sub: string;
  thumb: string;
  deities: Deity[];
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

const validDeities: ReadonlySet<Deity> = new Set([
  'rama',
  'krishna',
  'shiva',
  'hanuman',
  'durga',
  'ganesha',
]);

function assertMantra(m: unknown, i: number): asserts m is JapamMantra {
  if (!m || typeof m !== 'object') {
    throw new Error(`japam[${i}]: not an object`);
  }
  const obj = m as Record<string, unknown>;
  for (const key of [
    'id',
    'nameHi',
    'nameEn',
    'sub',
    'thumb',
    'meaningHi',
    'meaningEn',
  ] as const) {
    const val = obj[key];
    if (typeof val !== 'string' || val.trim() === '') {
      throw new Error(`japam[${i}].${key}: empty or non-string`);
    }
  }
  for (const key of ['lines', 'linesEn'] as const) {
    const val = obj[key];
    if (!Array.isArray(val) || val.length === 0) {
      throw new Error(`japam[${i}].${key}: must be a non-empty array`);
    }
    if (!val.every((line) => typeof line === 'string' && line.trim() !== '')) {
      throw new Error(`japam[${i}].${key}: contains empty or non-string entries`);
    }
  }
  const deities = obj.deities;
  if (!Array.isArray(deities) || deities.length === 0) {
    throw new Error(`japam[${i}].deities: must be a non-empty array`);
  }
  for (const d of deities) {
    if (typeof d !== 'string' || !validDeities.has(d as Deity)) {
      throw new Error(`japam[${i}].deities: invalid deity "${String(d)}"`);
    }
  }
}

const list = (raw as { mantras: unknown[] }).mantras;
list.forEach((m, i) => assertMantra(m, i));

export const japamMantras: readonly JapamMantra[] = list as JapamMantra[];

export const japamTitleHi = 'जप';
export const japamTitleEn = 'Japa & Mantras';

export function getJapamMantra(id: string): JapamMantra {
  const found = japamMantras.find((m) => m.id === id);
  if (!found) {
    throw new Error(`Unknown japam mantra: ${id}`);
  }
  return found;
}

/** Beads per round in a traditional japa mala. */
export const JAPAM_BEADS_PER_ROUND = 108;
