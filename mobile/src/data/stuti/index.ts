// Stuti (स्तुति) — multi-instance form registry, mirroring `suktam/index.ts`.
// One StutiReaderScreen dispatches on the `stutiId` route param through this
// registry (RULEBOOK §3). The same flat-reader contract also hosts the selected
// dohas under Granth, without classifying their poets as deities. Sanskrit uses
// IAST; Hindi dohas use pronunciation-based ASCII and bilingual meanings.
import krishnaStuti from './krishna-stuti.json';
import durgaStutiArjuna from './durga-stuti-arjuna.json';
import kuberaStotram from './kubera-stotram.json';
import navagrahaStotram from './navagraha-stotram.json';
import parshuramStotram from './parshuram-stotram.json';
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
  | 'navagraha-stotram'
  | 'parshuram-stotram'
  | 'hanuman-bahuk'
  | 'durga-argala-stotram'
  | 'durga-kilak-stotram'
  | 'durga-saptashati-chapter-1'
  | 'durga-saptashati-chapter-2'
  | 'durga-saptashati-chapter-3'
  | 'durga-saptashati-chapter-4'
  | 'durga-saptashati-chapter-5'
  | 'durga-saptashati-chapter-6'
  | 'durga-saptashati-chapter-7'
  | 'durga-saptashati-chapter-8'
  | 'durga-saptashati-chapter-9'
  | 'durga-saptashati-chapter-10'
  | 'durga-saptashati-chapter-11'
  | 'durga-saptashati-chapter-12'
  | 'durga-saptashati-chapter-13'
  | 'kanakadhara-stotram'
  | 'aditya-hridayam';

export type StutiPayload = {
  id: StutiId;
  titleHi: string;
  titleEn: string;
  deity: string;
  verses: readonly StutiVerse[];
};

const registry: Record<Exclude<StutiId, DohaId | 'durga-saptashati-chapter-1' | 'durga-saptashati-chapter-2' | 'durga-saptashati-chapter-3' | 'durga-saptashati-chapter-4' | 'durga-saptashati-chapter-5' | 'durga-saptashati-chapter-6' | 'durga-saptashati-chapter-7' | 'durga-saptashati-chapter-8' | 'durga-saptashati-chapter-9' | 'durga-saptashati-chapter-10' | 'durga-saptashati-chapter-11' | 'durga-saptashati-chapter-12' | 'durga-saptashati-chapter-13' | 'hanuman-bahuk' | 'durga-argala-stotram' | 'durga-kilak-stotram' | 'kanakadhara-stotram' | 'aditya-hridayam'>, StutiPayload> = {
  'parshuram-stotram': { id: 'parshuram-stotram', titleHi: parshuramStotram.titleHi, titleEn: parshuramStotram.titleEn, deity: parshuramStotram.deity, verses: parshuramStotram.verses },
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
  'parshuram-stotram',
  ...dohaIds,
  'hanuman-bahuk',
  'durga-argala-stotram',
  'durga-kilak-stotram',
  'kanakadhara-stotram',
  'aditya-hridayam',
  'durga-saptashati-chapter-1',
  'durga-saptashati-chapter-2',
  'durga-saptashati-chapter-3',
  'durga-saptashati-chapter-4',
  'durga-saptashati-chapter-5',
  'durga-saptashati-chapter-6',
  'durga-saptashati-chapter-7',
  'durga-saptashati-chapter-8',
  'durga-saptashati-chapter-9',
  'durga-saptashati-chapter-10',
  'durga-saptashati-chapter-11',
  'durga-saptashati-chapter-12',
  'durga-saptashati-chapter-13',
];

export function getStuti(id: string | undefined): StutiPayload {
  if (id === 'durga-saptashati-chapter-1') return require('./durga-saptashati-chapter-1.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-2') return require('./durga-saptashati-chapter-2.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-3') return require('./durga-saptashati-chapter-3.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-4') return require('./durga-saptashati-chapter-4.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-5') return require('./durga-saptashati-chapter-5.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-6') return require('./durga-saptashati-chapter-6.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-7') return require('./durga-saptashati-chapter-7.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-8') return require('./durga-saptashati-chapter-8.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-9') return require('./durga-saptashati-chapter-9.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-10') return require('./durga-saptashati-chapter-10.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-11') return require('./durga-saptashati-chapter-11.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-12') return require('./durga-saptashati-chapter-12.json') as StutiPayload;
  if (id === 'durga-saptashati-chapter-13') return require('./durga-saptashati-chapter-13.json') as StutiPayload;
  if (id === 'hanuman-bahuk') return require('./hanuman-bahuk.json') as StutiPayload;
  if (id === 'durga-argala-stotram') return require('./durga-argala-stotram.json') as StutiPayload;
  if (id === 'durga-kilak-stotram') return require('./durga-kilak-stotram.json') as StutiPayload;
  if (id === 'kanakadhara-stotram') return require('./kanakadhara-stotram.json') as StutiPayload;
  if (id === 'aditya-hridayam') return require('./aditya-hridayam.json') as StutiPayload;
  if (isDohaId(id)) return getDoha(id);
  if (id && id in registry) return registry[id as Exclude<StutiId, DohaId | 'durga-saptashati-chapter-1' | 'durga-saptashati-chapter-2' | 'durga-saptashati-chapter-3' | 'durga-saptashati-chapter-4' | 'durga-saptashati-chapter-5' | 'durga-saptashati-chapter-6' | 'durga-saptashati-chapter-7' | 'durga-saptashati-chapter-8' | 'durga-saptashati-chapter-9' | 'durga-saptashati-chapter-10' | 'durga-saptashati-chapter-11' | 'durga-saptashati-chapter-12' | 'durga-saptashati-chapter-13' | 'hanuman-bahuk' | 'durga-argala-stotram' | 'durga-kilak-stotram' | 'kanakadhara-stotram' | 'aditya-hridayam'>];
  return registry['krishna-stuti'];
}

export const krishnaStutiTitleHi = krishnaStuti.titleHi;
export const krishnaStutiTitleEn = krishnaStuti.titleEn;
export const krishnaStutiTotal = krishnaStuti.verses.length;
export const durgaStutiArjunaTotal = durgaStutiArjuna.verses.length;
export const kuberaStotramTotal = kuberaStotram.verses.length;
export const navagrahaStotramTotal = navagrahaStotram.verses.length;

export const parshuramStotramTotal = parshuramStotram.verses.length;
