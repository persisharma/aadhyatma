import type { NameRecord } from '@/data/namkaran/types';
import { RASHI_NAMES_HI } from './kundali';
import { NAKSHATRA_NAMES_HI } from './names';
import type { CharanaCandidate } from './namkaran';
import type { Syllable } from './namkaranConvention';

export type NamkaranShareModel = {
  syllables: readonly Syllable[];
  nakshatraHi: string;
  pada: number;
  rashiHi: string;
  shortlistNames?: readonly { hi: string; latin: string }[];
  conventionNote: string;
  brand: 'ॐ वेदांश';
};

export function buildNamkaranShareModel(
  candidate: CharanaCandidate,
  shortlist: readonly NameRecord[] = []
): NamkaranShareModel {
  return {
    syllables: candidate.entry.syllables,
    nakshatraHi: NAKSHATRA_NAMES_HI[candidate.entry.nakshatraIndex],
    pada: candidate.entry.pada,
    rashiHi: RASHI_NAMES_HI[candidate.rashiIndex],
    ...(shortlist.length ? {
      shortlistNames: shortlist.map(({ hi, latin }) => ({ hi, latin })),
    } : {}),
    conventionNote: 'लाहिरी पद्धति · पारम्परिक मार्गदर्शन',
    brand: 'ॐ वेदांश',
  };
}
