import data from './durga-chalisa.json';

export type DurgaChalisaVerse = {
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

export const durgaChalisaVerses: readonly DurgaChalisaVerse[] = data.verses as DurgaChalisaVerse[];
export const durgaChalisaTitleHi = data.titleHi;
export const durgaChalisaTitleEn = data.titleEn;
export const durgaChalisaSource = data.source;
export const durgaChalisaCounts = data.counts;

(function assertDurgaChalisaInvariants() {
  if (durgaChalisaVerses.length !== 43) {
    throw new Error(`durga-chalisa: expected 43 verses, got ${durgaChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of durgaChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`durga-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`durga-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`durga-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`durga-chalisa: ${v.id} has empty label`);
    }
  }
})();
