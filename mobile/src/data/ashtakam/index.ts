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
import gangashtakam from './gangashtakam.json';
import bhavaniAshtakam from './bhavani-ashtakam.json';
import narasimhaAshtakam from './narasimha-ashtakam.json';
import dattaAshtakam from './datta-ashtakam.json';
import shaniAshtakam from './shani-ashtakam.json';
import kalikaAshtakam from './kalika-ashtakam.json';
import rudrashtakam from './rudrashtakam.json';

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
