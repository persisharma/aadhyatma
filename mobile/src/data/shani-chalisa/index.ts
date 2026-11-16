import data from './shani-chalisa.json';

export type ShaniChalisaVerse = {
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

export const shaniChalisaVerses: readonly ShaniChalisaVerse[] = data.verses as ShaniChalisaVerse[];
export const shaniChalisaTitleHi = data.titleHi;
export const shaniChalisaTitleEn = data.titleEn;
export const shaniChalisaSource = data.source;
export const shaniChalisaCounts = data.counts;

(function assertShaniChalisaInvariants() {
  if (shaniChalisaVerses.length !== 43 || shaniChalisaCounts.chaupais !== 40) {
    throw new Error('shani-chalisa: expected two opening dohas, 40 chaupais and closing doha');
  }
  const seenIds = new Set<string>();
  for (const v of shaniChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`shani-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length || !v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`shani-chalisa: incomplete verse '${v.id}'`);
    }
  }
})();
