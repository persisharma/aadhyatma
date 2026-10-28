import * as verseCounts from './verseCounts';
import type { PoolSegment, UniformVerse } from './versePool';

/**
 * Daily Bhakti's single-list sources: one verse list per text, no chapter
 * (ashtakams, suktams, kavachs, stutis). `versePool.ts` `require()`s this module
 * the first time the pool is used, so neither this registry nor `verseCounts.ts`
 * sits on the launch path, and each corpus loads through its own thunk only when
 * one of its verses is picked.
 *
 * Deliberately left out: chalisas and aartis (they keep their own readers but no
 * longer surface in the daily rotation), Garud Puran (rites after death — not a
 * morning devotional card), Gita Saar (re-presents Gita verses already pooled)
 * and `ram-aarti` (reuses the Ram Stuti content already pooled).
 */
type FlatVerse = {
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};
type FlatSource = {
  id: string;
  length: number;
  load: () => readonly FlatVerse[];
};

const ashtakam = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./ashtakam') as typeof import('./ashtakam')).getAshtakam(id).verses,
});
const suktam = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./suktam') as typeof import('./suktam')).getSuktam(id).verses,
});
const kavacham = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./kavacham') as typeof import('./kavacham')).getKavacham(id).verses,
});
const stuti = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./stuti') as typeof import('./stuti')).getStuti(id).verses,
});

const FLAT_SOURCES: readonly FlatSource[] = [
  ashtakam('lingashtakam', verseCounts.lingashtakamTotal),
  ashtakam('madhurashtakam', verseCounts.madhurashtakamTotal),
  ashtakam('achyutashtakam', verseCounts.achyutashtakamTotal),
  ashtakam('mahalakshmi-ashtakam', verseCounts.mahalakshmiAshtakamTotal),
  ashtakam('surya-ashtakam', verseCounts.suryaAshtakamTotal),
  ashtakam('radhashtakam', verseCounts.radhashtakamTotal),
  ashtakam('subrahmanya-ashtakam', verseCounts.subrahmanyaAshtakamTotal),
  ashtakam('gangashtakam', verseCounts.gangashtakamTotal),
  ashtakam('bhavani-ashtakam', verseCounts.bhavaniAshtakamTotal),
  ashtakam('narasimha-ashtakam', verseCounts.narasimhaAshtakamTotal),
  ashtakam('datta-ashtakam', verseCounts.dattaAshtakamTotal),
  ashtakam('shani-ashtakam', verseCounts.shaniAshtakamTotal),
  ashtakam('kalika-ashtakam', verseCounts.kalikaAshtakamTotal),
  ashtakam('rudrashtakam', verseCounts.rudrashtakamTotal),
  suktam('devi-suktam', verseCounts.deviSuktamTotal),
  suktam('purusha-suktam', verseCounts.purushaSuktamTotal),
  suktam('narayana-suktam', verseCounts.narayanaSuktamTotal),
  kavacham('rama-raksha-stotra', verseCounts.ramaRakshaStotraTotal),
  kavacham('ganesha-kavacham', verseCounts.ganeshaKavachamTotal),
  kavacham('shiva-kavacham', verseCounts.shivaKavachamTotal),
  kavacham('durga-kavach', verseCounts.durgaKavachTotal),
  stuti('krishna-stuti', verseCounts.krishnaStutiTotal),
  stuti('durga-stuti-arjuna', verseCounts.durgaStutiArjunaTotal),
  stuti('kubera-stotram', verseCounts.kuberaStotramTotal),
  stuti('navagraha-stotram', verseCounts.navagrahaStotramTotal),
];

type LibraryLookup = {
  isActive: (id: string) => boolean;
  nameHi: (id: string) => string;
  nameEn: (id: string) => string;
};

export function flatPoolSegments({ isActive, nameHi, nameEn }: LibraryLookup): PoolSegment[] {
  const segments: PoolSegment[] = [];
  for (const src of FLAT_SOURCES) {
    if (!isActive(src.id)) continue;
    const getAt = (offset: number): UniformVerse | null => {
      const verse = src.load()[offset];
      if (!verse) return null;
      return {
        sourceId: src.id,
        sourceNameHi: nameHi(src.id),
        sourceNameEn: nameEn(src.id),
        verseIndex: offset,
        textHi: verse.lines,
        textEn: verse.linesEn,
        meaningHi: verse.meaningHi,
        meaningEn: verse.meaningEn,
        labelHi: verse.labelHi,
        labelEn: verse.labelEn,
      };
    };
    segments.push({
      sourceId: src.id,
      length: src.length,
      lastPositions: [{ chapter: 1, verseIndex: src.length - 1 }],
      getAt,
      find: (verseIndex, chapter) => (chapter == null ? getAt(verseIndex) : null),
    });
  }
  return segments;
}
