import data from './kali-chalisa.json';

export type KaliChalisaVerse = {
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

export const kaliChalisaVerses: readonly KaliChalisaVerse[] = data.verses as KaliChalisaVerse[];
export const kaliChalisaTitleHi = data.titleHi;
export const kaliChalisaTitleEn = data.titleEn;
export const kaliChalisaSource = data.source;
export const kaliChalisaCounts = data.counts;

(function assertKaliChalisaInvariants() {
  if (kaliChalisaVerses.length !== 57 || kaliChalisaCounts.chaupais !== 54) {
    throw new Error('kali-chalisa: expected two opening dohas, 54 chaupais and closing doha');
  }
  const seenIds = new Set<string>();
  for (const v of kaliChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`kali-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length || !v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`kali-chalisa: incomplete verse '${v.id}'`);
    }
  }
})();
