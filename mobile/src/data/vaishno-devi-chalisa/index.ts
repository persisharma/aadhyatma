import data from './vaishno-devi-chalisa.json';

export type VaishnoDeviChalisaVerse = {
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

export const vaishnoDeviChalisaVerses: readonly VaishnoDeviChalisaVerse[] = data.verses as VaishnoDeviChalisaVerse[];
export const vaishnoDeviChalisaTitleHi = data.titleHi;
export const vaishnoDeviChalisaTitleEn = data.titleEn;
export const vaishnoDeviChalisaSource = data.source;
export const vaishnoDeviChalisaCounts = data.counts;

(function assertVaishnoDeviChalisaInvariants() {
  if (vaishnoDeviChalisaVerses.length !== 42 || vaishnoDeviChalisaCounts.chaupais !== 40) {
    throw new Error('vaishno-devi-chalisa: expected opening doha, 40 chaupais and closing doha');
  }
  const seenIds = new Set<string>();
  for (const v of vaishnoDeviChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`vaishno-devi-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length || !v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`vaishno-devi-chalisa: incomplete verse '${v.id}'`);
    }
  }
})();
