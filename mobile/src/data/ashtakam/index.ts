// Ashtakam (अष्टकम्) — multi-instance form registry, mirroring `chalisaRegistry.ts`.
// One AshtakamReaderScreen dispatches on the `ashtakamId` route param through
// this registry (RULEBOOK §3 multi-instance rule). Each text is a self-contained
// JSON of source-verified verses (Sanskrit `sanskrit[]` + IAST `linesEn[]` +
// bilingual meanings), so adding an ashtakam is: drop a JSON + one registry row.
import lingashtakam from './lingashtakam.json';
import madhurashtakam from './madhurashtakam.json';
import achyutashtakam from './achyutashtakam.json';
import mahalakshmiAshtakam from './mahalakshmi-ashtakam.json';
import suryaAshtakam from './surya-ashtakam.json';
import radhashtakam from './radhashtakam.json';
import subrahmanyaAshtakam from './subrahmanya-ashtakam.json';

export type AshtakamVerse = {
  id: string;
  number: number;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type AshtakamId =
  | 'lingashtakam'
  | 'madhurashtakam'
  | 'achyutashtakam'
  | 'mahalakshmi-ashtakam'
  | 'surya-ashtakam'
  | 'radhashtakam'
  | 'subrahmanya-ashtakam';

export type AshtakamPayload = {
  id: AshtakamId;
  titleHi: string;
  titleEn: string;
  deity: string;
  verses: readonly AshtakamVerse[];
};

const registry: Record<AshtakamId, AshtakamPayload> = {
  lingashtakam: {
    id: 'lingashtakam',
    titleHi: lingashtakam.titleHi,
    titleEn: lingashtakam.titleEn,
    deity: lingashtakam.deity,
    verses: lingashtakam.verses,
  },
  madhurashtakam: {
    id: 'madhurashtakam',
    titleHi: madhurashtakam.titleHi,
    titleEn: madhurashtakam.titleEn,
    deity: madhurashtakam.deity,
    verses: madhurashtakam.verses,
  },
  achyutashtakam: {
    id: 'achyutashtakam',
    titleHi: achyutashtakam.titleHi,
    titleEn: achyutashtakam.titleEn,
    deity: achyutashtakam.deity,
    verses: achyutashtakam.verses,
  },
  'mahalakshmi-ashtakam': {
    id: 'mahalakshmi-ashtakam',
    titleHi: mahalakshmiAshtakam.titleHi,
    titleEn: mahalakshmiAshtakam.titleEn,
    deity: mahalakshmiAshtakam.deity,
    verses: mahalakshmiAshtakam.verses,
  },
  'surya-ashtakam': {
    id: 'surya-ashtakam',
    titleHi: suryaAshtakam.titleHi,
    titleEn: suryaAshtakam.titleEn,
    deity: suryaAshtakam.deity,
    verses: suryaAshtakam.verses,
  },
  radhashtakam: {
    id: 'radhashtakam',
    titleHi: radhashtakam.titleHi,
    titleEn: radhashtakam.titleEn,
    deity: radhashtakam.deity,
    verses: radhashtakam.verses,
  },
  'subrahmanya-ashtakam': {
    id: 'subrahmanya-ashtakam',
    titleHi: subrahmanyaAshtakam.titleHi,
    titleEn: subrahmanyaAshtakam.titleEn,
    deity: subrahmanyaAshtakam.deity,
    verses: subrahmanyaAshtakam.verses,
  },
};

export const ashtakamIds: readonly AshtakamId[] = [
  'lingashtakam',
  'madhurashtakam',
  'achyutashtakam',
  'mahalakshmi-ashtakam',
  'surya-ashtakam',
  'radhashtakam',
  'subrahmanya-ashtakam',
];

export function getAshtakam(id: string | undefined): AshtakamPayload {
  if (id && id in registry) return registry[id as AshtakamId];
  return registry.lingashtakam;
}

export const lingashtakamTitleHi = lingashtakam.titleHi;
export const lingashtakamTitleEn = lingashtakam.titleEn;
export const lingashtakamTotal = lingashtakam.verses.length;
export const madhurashtakamTotal = madhurashtakam.verses.length;
export const achyutashtakamTotal = achyutashtakam.verses.length;
export const mahalakshmiAshtakamTotal = mahalakshmiAshtakam.verses.length;
export const suryaAshtakamTotal = suryaAshtakam.verses.length;
export const radhashtakamTotal = radhashtakam.verses.length;
export const subrahmanyaAshtakamTotal = subrahmanyaAshtakam.verses.length;
