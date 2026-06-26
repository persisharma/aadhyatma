import data from './shiv-chalisa.json';

export type ShivChalisaVerse = {
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

export const shivChalisaVerses: readonly ShivChalisaVerse[] = data.verses as ShivChalisaVerse[];
export const shivChalisaTitleHi = data.titleHi;
export const shivChalisaTitleEn = data.titleEn;
export const shivChalisaSource = data.source;
export const shivChalisaCounts = data.counts;

(function assertShivChalisaInvariants() {
  if (shivChalisaVerses.length !== 43) {
    throw new Error(`shiv-chalisa: expected 43 verses, got ${shivChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of shivChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`shiv-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`shiv-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`shiv-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`shiv-chalisa: ${v.id} has empty label`);
    }
  }
})();
