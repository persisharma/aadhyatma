import data from './saraswati-chalisa.json';

export type SaraswatiChalisaVerse = {
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

export const saraswatiChalisaVerses: readonly SaraswatiChalisaVerse[] = data.verses as SaraswatiChalisaVerse[];
export const saraswatiChalisaTitleHi = data.titleHi;
export const saraswatiChalisaTitleEn = data.titleEn;
export const saraswatiChalisaSource = data.source;
export const saraswatiChalisaCounts = data.counts;

(function assertSaraswatiChalisaInvariants() {
  if (saraswatiChalisaVerses.length !== 43) {
    throw new Error(`saraswati-chalisa: expected 43 verses, got ${saraswatiChalisaVerses.length}`);
  }
  const seenIds = new Set<string>();
  for (const v of saraswatiChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`saraswati-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`saraswati-chalisa: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`saraswati-chalisa: ${v.id} has empty meaning`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`saraswati-chalisa: ${v.id} has empty label`);
    }
  }
})();
