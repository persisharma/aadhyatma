// Stuti (स्तुति) — multi-instance form registry, mirroring `suktam/index.ts`.
// One StutiReaderScreen dispatches on the `stutiId` route param through this
// registry (RULEBOOK §3). Each text is source-verified verses (Devanagari
// `lines` + IAST `linesEn` + bilingual meanings).
import krishnaStuti from './krishna-stuti.json';
import durgaStutiArjuna from './durga-stuti-arjuna.json';
import kuberaStotram from './kubera-stotram.json';
import navagrahaStotram from './navagraha-stotram.json';

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

export type StutiId =
  | 'krishna-stuti'
  | 'durga-stuti-arjuna'
  | 'kubera-stotram'
  | 'navagraha-stotram';

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
  'kubera-stotram': {
    id: 'kubera-stotram',
    titleHi: kuberaStotram.titleHi,
    titleEn: kuberaStotram.titleEn,
    deity: kuberaStotram.deity,
    verses: kuberaStotram.verses,
  },
  'navagraha-stotram': {
    id: 'navagraha-stotram',
    titleHi: navagrahaStotram.titleHi,
    titleEn: navagrahaStotram.titleEn,
    deity: navagrahaStotram.deity,
    verses: navagrahaStotram.verses,
  },
};

export const stutiIds: readonly StutiId[] = [
  'krishna-stuti',
  'durga-stuti-arjuna',
  'kubera-stotram',
  'navagraha-stotram',
];

export function getStuti(id: string | undefined): StutiPayload {
  if (id && id in registry) return registry[id as StutiId];
  return registry['krishna-stuti'];
}

export const krishnaStutiTitleHi = krishnaStuti.titleHi;
export const krishnaStutiTitleEn = krishnaStuti.titleEn;
export const krishnaStutiTotal = krishnaStuti.verses.length;
export const durgaStutiArjunaTotal = durgaStutiArjuna.verses.length;
export const kuberaStotramTotal = kuberaStotram.verses.length;
export const navagrahaStotramTotal = navagrahaStotram.verses.length;
