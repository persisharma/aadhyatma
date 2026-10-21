import type { Deity } from '../texts';
import raw from './japam.json';
import { findSlokaJapa, type JapamSloka } from './sloka';

export type JapamMantra = {
  id: string;
  nameHi: string;
  nameEn: string;
  sub: string;
  subEn: string;
  thumb: string;
  deities: Deity[];
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  source?: { baseText: string; referenceUrls: string[]; retrievedOn: string };
  /** Naam japa: the line is a single divine name, chanted and counted one name per bead. */
  naam?: boolean;
  /** Sloka japa (`./sloka.ts`): one shloka of a stotram, chanted like a mantra. */
  sloka?: JapamSloka;
};

const validDeities: ReadonlySet<Deity> = new Set([
  'rama',
  'krishna',
  'vishnu',
  'shiva',
  'hanuman',
  'durga',
  'ganesha',
  'savitr',
  'radha',
  'saraswati',
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
    'subEn',
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
  if (obj.naam !== undefined && typeof obj.naam !== 'boolean') {
    throw new Error(`japam[${i}].naam: must be a boolean when present`);
  }
  if (obj.source !== undefined) {
    const source = obj.source as Record<string, unknown>;
    if (!source || typeof source.baseText !== 'string' || !source.baseText.trim() ||
        typeof source.retrievedOn !== 'string' ||
        !Array.isArray(source.referenceUrls) || source.referenceUrls.length < 2 ||
        !source.referenceUrls.every((url) => typeof url === 'string' && url.startsWith('https://'))) {
      throw new Error(`japam[${i}].source: requires description, date and two URLs`);
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
  const found = findJapamMantra(id);
  if (!found) {
    throw new Error(`Unknown japam mantra: ${id}`);
  }
  return found;
}

/**
 * Like `getJapamMantra` but returns null for unknown ids instead of throwing.
 * Resolves sloka-japa ids too, so every id-keyed consumer (counter, alarms,
 * widgets, deep links) accepts them; lists of mantras stay `japamMantras`.
 */
export function findJapamMantra(id: string): JapamMantra | null {
  return japamMantras.find((m) => m.id === id) ?? findSlokaJapa(id);
}

export { allSlokaJapaIds, isSlokaJapaSource, slokaJapaId, slokaJapaSourceIds, type JapamSloka } from './sloka';

/** Beads per round in a traditional japa mala. */
export const JAPAM_BEADS_PER_ROUND = 108;
