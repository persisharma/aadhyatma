import data from './hanuman-chalisa.json';

export type HanumanChalisaVerseType = 'doha' | 'chaupai';
export type HanumanChalisaPlacement = 'opening' | 'body' | 'closing';

export type HanumanChalisaVerse = {
  id: string;
  type: HanumanChalisaVerseType;
  section: HanumanChalisaPlacement;
  number?: number;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type HanumanChalisaSource = {
  baseText: string;
  devanagariReference: string;
  meaningsAttribution: string;
  retrievedOn: string;
};

export type HanumanChalisaCounts = {
  openingDohas: number;
  chaupais: number;
  closingDohas: number;
  totalVerses: number;
};

type RawPayload = {
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  language: string;
  script: string;
  source: HanumanChalisaSource;
  counts: HanumanChalisaCounts;
  verses: HanumanChalisaVerse[];
};

const payload = data as RawPayload;

export const hanumanChalisaTitleHi = payload.titleHi;
export const hanumanChalisaTitleEn = payload.titleEn;
export const hanumanChalisaSubtitleHi = payload.subtitleHi;
export const hanumanChalisaSubtitleEn = payload.subtitleEn;
export const hanumanChalisaSource = payload.source;
export const hanumanChalisaCounts = payload.counts;
export const hanumanChalisaVerses: readonly HanumanChalisaVerse[] = payload.verses;
export const hanumanChalisaTotal = hanumanChalisaVerses.length;

(function assertHanumanChalisaInvariants() {
  if (hanumanChalisaVerses.length !== hanumanChalisaCounts.totalVerses) {
    throw new Error(
      `hanuman-chalisa: verses array (${hanumanChalisaVerses.length}) does not match counts.totalVerses (${hanumanChalisaCounts.totalVerses})`
    );
  }
  const seen = new Set<string>();
  for (const v of hanumanChalisaVerses) {
    if (seen.has(v.id)) {
      throw new Error(`hanuman-chalisa: duplicate verse id '${v.id}'`);
    }
    seen.add(v.id);
    if (v.lines.length === 0) {
      throw new Error(`hanuman-chalisa: verse '${v.id}' has no Devanagari lines`);
    }
    if (v.linesEn.length !== v.lines.length) {
      throw new Error(
        `hanuman-chalisa: verse '${v.id}' has ${v.lines.length} Devanagari lines but ${v.linesEn.length} romanized lines`
      );
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`hanuman-chalisa: verse '${v.id}' has empty meaning (hi or en)`);
    }
    if (!v.labelHi.trim() || !v.labelEn.trim()) {
      throw new Error(`hanuman-chalisa: verse '${v.id}' has empty label (hi or en)`);
    }
  }
})();
