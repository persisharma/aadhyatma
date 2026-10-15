import data from './surya-chalisa.json';

export type SuryaChalisaVerse = {
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

export const suryaChalisaVerses: readonly SuryaChalisaVerse[] = data.verses as SuryaChalisaVerse[];
export const suryaChalisaTitleHi = data.titleHi;
export const suryaChalisaTitleEn = data.titleEn;
export const suryaChalisaSource = data.source;
export const suryaChalisaCounts = data.counts;

(function assertSuryaChalisaInvariants() {
  if (suryaChalisaVerses.length !== 42 || suryaChalisaCounts.chaupais !== 40) {
    throw new Error('surya-chalisa: expected opening doha, 40 chaupais and closing doha');
  }
  const seenIds = new Set<string>();
  for (const v of suryaChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`surya-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length || !v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`surya-chalisa: incomplete verse '${v.id}'`);
    }
  }
})();
