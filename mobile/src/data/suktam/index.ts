// Suktam (सूक्तम्) — multi-instance form registry, mirroring `ashtakam/index.ts`.
// One SuktamReaderScreen dispatches on the `suktamId` route param through this
// registry (RULEBOOK §3). Each text is source-verified verses (Devanagari
// `lines` + IAST `linesEn` + bilingual meanings).
//
// NOTE: The Vedic Suktams (Purusha Suktam, Narayana Suktam) are recension- and
// svara-accent-divergent across sources and are NOT yet included — see
// .context/prd-a-progress.md (items 12–13 BLOCKED pending clean human sourcing).
import deviSuktam from './devi-suktam.json';
import purushaSuktam from './purusha-suktam.json';
import narayanaSuktam from './narayana-suktam.json';

export type SuktamVerse = {
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

export type SuktamId = 'devi-suktam' | 'purusha-suktam' | 'narayana-suktam';

export type SuktamPayload = {
  id: SuktamId;
  titleHi: string;
  titleEn: string;
  deity: string;
  verses: readonly SuktamVerse[];
};

const registry: Record<SuktamId, SuktamPayload> = {
  'devi-suktam': {
    id: 'devi-suktam',
    titleHi: deviSuktam.titleHi,
    titleEn: deviSuktam.titleEn,
    deity: deviSuktam.deity,
    verses: deviSuktam.verses,
  },
  'purusha-suktam': {
    id: 'purusha-suktam',
    titleHi: purushaSuktam.titleHi,
    titleEn: purushaSuktam.titleEn,
    deity: purushaSuktam.deity,
    verses: purushaSuktam.verses,
  },
  'narayana-suktam': {
    id: 'narayana-suktam',
    titleHi: narayanaSuktam.titleHi,
    titleEn: narayanaSuktam.titleEn,
    deity: narayanaSuktam.deity,
    verses: narayanaSuktam.verses,
  },
};

export const suktamIds: readonly SuktamId[] = ['devi-suktam', 'purusha-suktam', 'narayana-suktam'];

export function getSuktam(id: string | undefined): SuktamPayload {
  if (id && id in registry) return registry[id as SuktamId];
  return registry['devi-suktam'];
}

export const deviSuktamTitleHi = deviSuktam.titleHi;
export const deviSuktamTitleEn = deviSuktam.titleEn;
export const deviSuktamTotal = deviSuktam.verses.length;
export const purushaSuktamTotal = purushaSuktam.verses.length;
export const narayanaSuktamTotal = narayanaSuktam.verses.length;
