// Kavacham (कवच) — multi-instance form registry, mirroring `ashtakam/index.ts`.
// One KavachamReaderScreen dispatches on the `kavachamId` route param through
// this registry (RULEBOOK §3). Each text is source-verified verses (Devanagari
// `lines` + IAST `linesEn` + bilingual meanings). Rama Raksha Stotra is grouped
// here as the archetypal protective (raksha = kavach) hymn.
import ramaRakshaStotra from './rama-raksha-stotra.json';
import ganeshaKavacham from './ganesha-kavacham.json';
import shivaKavacham from './shiva-kavacham.json';
import durgaKavach from './durga-kavach.json';

export type KavachamVerse = {
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

export type KavachamId =
  | 'rama-raksha-stotra'
  | 'ganesha-kavacham'
  | 'shiva-kavacham'
  | 'durga-kavach';

export type KavachamPayload = {
  id: KavachamId;
  titleHi: string;
  titleEn: string;
  deity: string;
  verses: readonly KavachamVerse[];
};

const registry: Record<KavachamId, KavachamPayload> = {
  'rama-raksha-stotra': {
    id: 'rama-raksha-stotra',
    titleHi: ramaRakshaStotra.titleHi,
    titleEn: ramaRakshaStotra.titleEn,
    deity: ramaRakshaStotra.deity,
    verses: ramaRakshaStotra.verses,
  },
  'ganesha-kavacham': {
    id: 'ganesha-kavacham',
    titleHi: ganeshaKavacham.titleHi,
    titleEn: ganeshaKavacham.titleEn,
    deity: ganeshaKavacham.deity,
    verses: ganeshaKavacham.verses,
  },
  'shiva-kavacham': {
    id: 'shiva-kavacham',
    titleHi: shivaKavacham.titleHi,
    titleEn: shivaKavacham.titleEn,
    deity: shivaKavacham.deity,
    verses: shivaKavacham.verses,
  },
  'durga-kavach': {
    id: 'durga-kavach',
    titleHi: durgaKavach.titleHi,
    titleEn: durgaKavach.titleEn,
    deity: durgaKavach.deity,
    verses: durgaKavach.verses,
  },
};

export const kavachamIds: readonly KavachamId[] = [
  'rama-raksha-stotra',
  'ganesha-kavacham',
  'shiva-kavacham',
  'durga-kavach',
];

export function getKavacham(id: string | undefined): KavachamPayload {
  if (id && id in registry) return registry[id as KavachamId];
  return registry['rama-raksha-stotra'];
}

export const ramaRakshaStotraTitleHi = ramaRakshaStotra.titleHi;
export const ramaRakshaStotraTitleEn = ramaRakshaStotra.titleEn;
export const ramaRakshaStotraTotal = ramaRakshaStotra.verses.length;
export const ganeshaKavachamTotal = ganeshaKavacham.verses.length;
export const shivaKavachamTotal = shivaKavacham.verses.length;
export const durgaKavachTotal = durgaKavach.verses.length;
