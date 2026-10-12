import data from './lakshmi-chalisa.json';

// Ramdas recension, 39 chaupais — the verified text is not padded to 40
// (see `source.baseText`). Collated 2026-06-23 against four sources on the
// unmerged Phase-1 branch and recovered verbatim for the 1.5.0 release.

export type LakshmiChalisaVerse = {
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

export const lakshmiChalisaVerses: readonly LakshmiChalisaVerse[] = data.verses as LakshmiChalisaVerse[];
export const lakshmiChalisaTitleHi = data.titleHi;
export const lakshmiChalisaTitleEn = data.titleEn;
export const lakshmiChalisaSource = data.source;
export const lakshmiChalisaCounts = data.counts;

(function assertLakshmiChalisaInvariants() {
  if (lakshmiChalisaVerses.length !== 43) {
    throw new Error(`lakshmi-chalisa: expected 43 verses, got ${lakshmiChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of lakshmiChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`lakshmi-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`lakshmi-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`lakshmi-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`lakshmi-chalisa: ${v.id} has empty label`);
    }
  }
})();
