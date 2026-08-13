import type { Deity } from '../texts';

export type NameGender = 'boy' | 'girl' | 'any';

export type NameRecord = {
  id: string;
  hi: string;
  latin: string;
  gender: NameGender;
  charanas: readonly number[];
  meaningHi: string;
  meaningEn: string;
  root?: string;
  deityId?: Deity;
  syllableCount: 2 | 3 | 4;
};

export type NamkaranCorpusManifest = {
  verified: false;
  releaseEligible: false;
  notes: string;
};
