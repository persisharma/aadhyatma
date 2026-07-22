import data from './gayatri-chalisa.json';

export type GayatriChalisaVerse = {
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
  meaningGu?: string;
  meaningKn?: string;
};

export const gayatriChalisaVerses: readonly GayatriChalisaVerse[] =
  data.verses as GayatriChalisaVerse[];
export const gayatriChalisaTitleHi = data.titleHi;
export const gayatriChalisaTitleEn = data.titleEn;
export const gayatriChalisaSource = data.source;
export const gayatriChalisaCounts = data.counts;

(function assertGayatriChalisaInvariants() {
  if (gayatriChalisaVerses.length !== 43) {
    throw new Error(`gayatri-chalisa: expected 43 verses, got ${gayatriChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of gayatriChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`gayatri-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`gayatri-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`gayatri-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`gayatri-chalisa: ${v.id} has empty label`);
    }
  }
})();
