import raw from './hanuman-chalisa.hi.json';

export type VerseType = 'doha' | 'chaupai';
export type VerseSection = 'opening' | 'body' | 'closing';

export type Verse = {
  id: string;
  type: VerseType;
  section: VerseSection;
  label: string;
  number?: number;
  lines: string[];
  meaning: string;
};

type RawVerse = {
  id: string;
  type: VerseType;
  number?: number;
  label: string;
  lines: string[];
  meaning: string;
};

type RawChalisa = {
  title: string;
  opening_dohas: RawVerse[];
  chaupais: RawVerse[];
  closing_doha: RawVerse;
  counts: { opening_dohas: number; chaupais: number; closing_dohas: number };
};

const data = raw as RawChalisa;

const openingVerses: Verse[] = data.opening_dohas.map((v) => ({
  ...v,
  section: 'opening',
}));

const chaupaiVerses: Verse[] = data.chaupais.map((v) => ({
  ...v,
  section: 'body',
}));

const closingVerse: Verse = {
  ...data.closing_doha,
  section: 'closing',
};

export const hanumanChalisaTitle = data.title;
export const hanumanChalisaVerses: readonly Verse[] = [
  ...openingVerses,
  ...chaupaiVerses,
  closingVerse,
];

export const hanumanChalisaTotal = hanumanChalisaVerses.length;
