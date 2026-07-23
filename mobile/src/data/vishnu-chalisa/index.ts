import data from './vishnu-chalisa.json';

export type VishnuChalisaVerse = {
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

export const vishnuChalisaVerses: readonly VishnuChalisaVerse[] =
  data.verses as VishnuChalisaVerse[];
export const vishnuChalisaTitleHi = data.titleHi;
export const vishnuChalisaTitleEn = data.titleEn;
export const vishnuChalisaSource = data.source;
export const vishnuChalisaCounts = data.counts;

(function assertVishnuChalisaInvariants() {
  if (vishnuChalisaVerses.length !== 41) {
    throw new Error(`vishnu-chalisa: expected 41 verses, got ${vishnuChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of vishnuChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`vishnu-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`vishnu-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`vishnu-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`vishnu-chalisa: ${v.id} has empty label`);
    }
  }
})();
