import data from './ganesh-chalisa.json';

export type GaneshChalisaVerse = {
  id: string;
  type: 'doha' | 'chaupai';
  section: 'opening' | 'body' | 'closing';
  number?: number;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export const ganeshChalisaVerses: readonly GaneshChalisaVerse[] = data.verses as GaneshChalisaVerse[];
export const ganeshChalisaTitleHi = data.titleHi;
export const ganeshChalisaTitleEn = data.titleEn;
export const ganeshChalisaSource = data.source;
export const ganeshChalisaCounts = data.counts;

(function assertGaneshChalisaInvariants() {
  if (ganeshChalisaVerses.length !== 43) {
    throw new Error(`ganesh-chalisa: expected 43 verses, got ${ganeshChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of ganeshChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`ganesh-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`ganesh-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`ganesh-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`ganesh-chalisa: ${v.id} has empty label`);
    }
  }
})();
