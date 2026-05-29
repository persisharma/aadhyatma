export type SanskarVerseType = 'intro' | 'mantra' | 'step' | 'vidhi';

export type SanskarVerse = {
  id: string;
  number: number;
  type: SanskarVerseType;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  vidhiHi?: string;
  vidhiEn?: string;
};

export type SanskarData = {
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  deity: string;
  language: string;
  source: { baseText: string; retrievedOn: string };
  counts: { totalVerses: number };
  verses: SanskarVerse[];
};
