import data from './radha-chalisa.json';

export type RadhaChalisaVerse = {
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

export const radhaChalisaVerses: readonly RadhaChalisaVerse[] = data.verses as RadhaChalisaVerse[];
export const radhaChalisaTitleHi = data.titleHi;
export const radhaChalisaTitleEn = data.titleEn;
export const radhaChalisaSource = data.source;
export const radhaChalisaCounts = data.counts;

(function assertRadhaChalisaInvariants() {
  if (radhaChalisaVerses.length !== 43 || radhaChalisaCounts.chaupais !== 40) {
    throw new Error('radha-chalisa: expected two opening dohas, 40 chaupais and closing doha');
  }
  const seenIds = new Set<string>();
  for (const v of radhaChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`radha-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length || !v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`radha-chalisa: incomplete verse '${v.id}'`);
    }
  }
})();
