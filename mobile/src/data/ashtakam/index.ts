import { readContent } from '../../storage/content';
// Ashtakam (अष्टकम्) — multi-instance form registry, mirroring `chalisaRegistry.ts`.
// One AshtakamReaderScreen dispatches on the `ashtakamId` route param through
// this registry (RULEBOOK §3 multi-instance rule). Each text is a self-contained
// JSON of source-verified verses (Sanskrit `sanskrit[]` + IAST `linesEn[]` +
// bilingual meanings), so adding an ashtakam is: drop a JSON + one registry row.
const lingashtakam = readContent<typeof import('./lingashtakam.json')>('ashtakam/lingashtakam.json');
const madhurashtakam = readContent<typeof import('./madhurashtakam.json')>('ashtakam/madhurashtakam.json');
const achyutashtakam = readContent<typeof import('./achyutashtakam.json')>('ashtakam/achyutashtakam.json');
const mahalakshmiAshtakam = readContent<typeof import('./mahalakshmi-ashtakam.json')>('ashtakam/mahalakshmi-ashtakam.json');
const suryaAshtakam = readContent<typeof import('./surya-ashtakam.json')>('ashtakam/surya-ashtakam.json');
const radhashtakam = readContent<typeof import('./radhashtakam.json')>('ashtakam/radhashtakam.json');
const subrahmanyaAshtakam = readContent<typeof import('./subrahmanya-ashtakam.json')>('ashtakam/subrahmanya-ashtakam.json');
const gangashtakam = readContent<typeof import('./gangashtakam.json')>('ashtakam/gangashtakam.json');
const bhavaniAshtakam = readContent<typeof import('./bhavani-ashtakam.json')>('ashtakam/bhavani-ashtakam.json');
const narasimhaAshtakam = readContent<typeof import('./narasimha-ashtakam.json')>('ashtakam/narasimha-ashtakam.json');
const dattaAshtakam = readContent<typeof import('./datta-ashtakam.json')>('ashtakam/datta-ashtakam.json');
const shaniAshtakam = readContent<typeof import('./shani-ashtakam.json')>('ashtakam/shani-ashtakam.json');
const kalikaAshtakam = readContent<typeof import('./kalika-ashtakam.json')>('ashtakam/kalika-ashtakam.json');
const rudrashtakam = readContent<typeof import('./rudrashtakam.json')>('ashtakam/rudrashtakam.json');

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
  | 'subrahmanya-ashtakam'
  | 'gangashtakam'
  | 'bhavani-ashtakam'
  | 'narasimha-ashtakam'
  | 'datta-ashtakam'
  | 'shani-ashtakam'
  | 'kalika-ashtakam'
  | 'rudrashtakam';

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
  gangashtakam: {
    id: 'gangashtakam',
    titleHi: gangashtakam.titleHi,
    titleEn: gangashtakam.titleEn,
    deity: gangashtakam.deity,
    verses: gangashtakam.verses,
  },
  'bhavani-ashtakam': {
    id: 'bhavani-ashtakam',
    titleHi: bhavaniAshtakam.titleHi,
    titleEn: bhavaniAshtakam.titleEn,
    deity: bhavaniAshtakam.deity,
    verses: bhavaniAshtakam.verses,
  },
  'narasimha-ashtakam': {
    id: 'narasimha-ashtakam',
    titleHi: narasimhaAshtakam.titleHi,
    titleEn: narasimhaAshtakam.titleEn,
    deity: narasimhaAshtakam.deity,
    verses: narasimhaAshtakam.verses,
  },
  'datta-ashtakam': {
    id: 'datta-ashtakam',
    titleHi: dattaAshtakam.titleHi,
    titleEn: dattaAshtakam.titleEn,
    deity: dattaAshtakam.deity,
    verses: dattaAshtakam.verses,
  },
  'shani-ashtakam': {
    id: 'shani-ashtakam',
    titleHi: shaniAshtakam.titleHi,
    titleEn: shaniAshtakam.titleEn,
    deity: shaniAshtakam.deity,
    verses: shaniAshtakam.verses,
  },
  'kalika-ashtakam': {
    id: 'kalika-ashtakam',
    titleHi: kalikaAshtakam.titleHi,
    titleEn: kalikaAshtakam.titleEn,
    deity: kalikaAshtakam.deity,
    verses: kalikaAshtakam.verses,
  },
  rudrashtakam: {
    id: 'rudrashtakam',
    titleHi: rudrashtakam.titleHi,
    titleEn: rudrashtakam.titleEn,
    deity: rudrashtakam.deity,
    verses: rudrashtakam.verses,
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
  'gangashtakam',
  'bhavani-ashtakam',
  'narasimha-ashtakam',
  'datta-ashtakam',
  'shani-ashtakam',
  'kalika-ashtakam',
  'rudrashtakam',
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
export const gangashtakamTotal = gangashtakam.verses.length;
export const bhavaniAshtakamTotal = bhavaniAshtakam.verses.length;
export const narasimhaAshtakamTotal = narasimhaAshtakam.verses.length;
export const dattaAshtakamTotal = dattaAshtakam.verses.length;
export const shaniAshtakamTotal = shaniAshtakam.verses.length;
export const kalikaAshtakamTotal = kalikaAshtakam.verses.length;
export const rudrashtakamTotal = rudrashtakam.verses.length;
