import data from './santoshi-mata-chalisa.json';

export type SantoshiMataChalisaVerse = {
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

export const santoshiMataChalisaVerses: readonly SantoshiMataChalisaVerse[] = data.verses as SantoshiMataChalisaVerse[];
export const santoshiMataChalisaTitleHi = data.titleHi;
export const santoshiMataChalisaTitleEn = data.titleEn;
export const santoshiMataChalisaSource = data.source;
export const santoshiMataChalisaCounts = data.counts;

(function assertSantoshiMataChalisaInvariants() {
  if (santoshiMataChalisaVerses.length !== 42 || santoshiMataChalisaCounts.chaupais !== 40) {
    throw new Error('santoshi-mata-chalisa: expected opening doha, 40 chaupais and closing doha');
  }
  const seenIds = new Set<string>();
  for (const v of santoshiMataChalisaVerses) {
    if (seenIds.has(v.id)) throw new Error(`santoshi-mata-chalisa: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.lines.length !== v.linesEn.length || !v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`santoshi-mata-chalisa: incomplete verse '${v.id}'`);
    }
  }
})();
