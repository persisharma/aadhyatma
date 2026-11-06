// Stuti (स्तुति) — multi-instance form registry, mirroring `suktam/index.ts`.
// One StutiReaderScreen dispatches on the `stutiId` route param through this
// registry (RULEBOOK §3). The same flat-reader contract also hosts the selected
// dohas under Granth, without classifying their poets as deities. Sanskrit uses
// IAST; Hindi dohas use pronunciation-based ASCII and bilingual meanings.
import krishnaStuti from './krishna-stuti.json';
import durgaStutiArjuna from './durga-stuti-arjuna.json';
import kuberaStotram from './kubera-stotram.json';
import navagrahaStotram from './navagraha-stotram.json';
import { dohaIds, getDoha, isDohaId, type DohaId } from '../doha';

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
  | DohaId
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

const registry: Record<Exclude<StutiId, DohaId>, StutiPayload> = {
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
  ...dohaIds,
];

export function getStuti(id: string | undefined): StutiPayload {
  if (isDohaId(id)) return getDoha(id);
  if (id && id in registry) return registry[id as Exclude<StutiId, DohaId>];
  return registry['krishna-stuti'];
}

export const krishnaStutiTitleHi = krishnaStuti.titleHi;
export const krishnaStutiTitleEn = krishnaStuti.titleEn;
export const krishnaStutiTotal = krishnaStuti.verses.length;
export const durgaStutiArjunaTotal = durgaStutiArjuna.verses.length;
export const kuberaStotramTotal = kuberaStotram.verses.length;
export const navagrahaStotramTotal = navagrahaStotram.verses.length;

