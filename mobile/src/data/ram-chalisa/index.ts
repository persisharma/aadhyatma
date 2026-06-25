import data from './ram-chalisa.json';

export type RamChalisaVerse = {
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

export const ramChalisaVerses: readonly RamChalisaVerse[] = data.verses as RamChalisaVerse[];
export const ramChalisaTitleHi = data.titleHi;
export const ramChalisaTitleEn = data.titleEn;
export const ramChalisaSource = data.source;
export const ramChalisaCounts = data.counts;

(function assertRamChalisaInvariants() {
  if (ramChalisaVerses.length !== 49) {
    throw new Error(`ram-chalisa: expected 49 verses, got ${ramChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of ramChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`ram-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`ram-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`ram-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`ram-chalisa: ${v.id} has empty label`);
    }
  }
})();
