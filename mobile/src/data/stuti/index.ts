// Stuti (स्तुति) — multi-instance form registry, mirroring `suktam/index.ts`.
// One StutiReaderScreen dispatches on the `stutiId` route param through this
// registry (RULEBOOK §3). Each text is source-verified verses (Devanagari
// `lines` + IAST `linesEn` + bilingual meanings).
import krishnaStuti from './krishna-stuti.json';
import durgaStutiArjuna from './durga-stuti-arjuna.json';

export type StutiVerse = {
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

export type StutiId = 'krishna-stuti' | 'durga-stuti-arjuna';

export type StutiPayload = {
  id: StutiId;
  titleHi: string;
  titleEn: string;
  deity: string;
  verses: readonly StutiVerse[];
};

const registry: Record<StutiId, StutiPayload> = {
  'krishna-stuti': {
    id: 'krishna-stuti',
    titleHi: krishnaStuti.titleHi,
    titleEn: krishnaStuti.titleEn,
    deity: krishnaStuti.deity,
    verses: krishnaStuti.verses,
  },
  'durga-stuti-arjuna': {
    id: 'durga-stuti-arjuna',
    titleHi: durgaStutiArjuna.titleHi,
    titleEn: durgaStutiArjuna.titleEn,
    deity: durgaStutiArjuna.deity,
    verses: durgaStutiArjuna.verses,
  },
};

export const stutiIds: readonly StutiId[] = ['krishna-stuti', 'durga-stuti-arjuna'];

export function getStuti(id: string | undefined): StutiPayload {
  if (id && id in registry) return registry[id as StutiId];
  return registry['krishna-stuti'];
}

export const krishnaStutiTitleHi = krishnaStuti.titleHi;
export const krishnaStutiTitleEn = krishnaStuti.titleEn;
export const krishnaStutiTotal = krishnaStuti.verses.length;
export const durgaStutiArjunaTotal = durgaStutiArjuna.verses.length;
