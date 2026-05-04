import data from './sundarkand.json';

export type SundarkandSection = 'shloka' | 'chaupai' | 'doha' | 'sortha' | 'chhand';

export type SundarkandVerse = {
  id: string;
  section: SundarkandSection;
  stanza: number;
  numInSection: number;
  subSuffix: string | null;
  labelHi: string;
  labelEn: string;
  lines: string[];
  /**
   * Romanized transliteration of each Devanagari line, lined up 1:1 with `lines`.
   * Sourced from the Sundarkand reference at
   * conductor/workspaces/Aadhyatma/delhi/mobile/src/data/sundarkand/sundarkand.hi-en.json.
   * For lines whose Tulsidas wording differs between editions and no transliteration
   * pair can be resolved, the Devanagari source line is kept as-is so the reader
   * never shows an empty verse.
   */
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type SundarkandSource = {
  baseText: string;
  devanagariReference: string;
  meaningsAttribution: string;
  retrievedOn: string;
};

export type SundarkandCounts = {
  shlokas: number;
  chaupais: number;
  dohas: number;
  sorthas: number;
  chhands: number;
  totalVerses: number;
};

type RawPayload = {
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  language: string;
  source: SundarkandSource;
  counts: SundarkandCounts;
  verses: SundarkandVerse[];
};

const payload = data as RawPayload;

export const sundarkandTitleHi = payload.titleHi;
export const sundarkandTitleEn = payload.titleEn;
export const sundarkandSubtitleHi = payload.subtitleHi;
export const sundarkandSubtitleEn = payload.subtitleEn;
export const sundarkandSource = payload.source;
export const sundarkandCounts = payload.counts;
export const sundarkandVerses: readonly SundarkandVerse[] = payload.verses;
export const sundarkandTotal = sundarkandVerses.length;

(function assertSundarkandInvariants() {
  if (sundarkandVerses.length !== sundarkandCounts.totalVerses) {
    throw new Error(
      `sundarkand: verses array (${sundarkandVerses.length}) does not match counts.totalVerses (${sundarkandCounts.totalVerses})`
    );
  }
  const seen = new Set<string>();
  for (const v of sundarkandVerses) {
    if (seen.has(v.id)) {
      throw new Error(`sundarkand: duplicate verse id '${v.id}'`);
    }
    seen.add(v.id);
    if (v.lines.length === 0) {
      throw new Error(`sundarkand: verse '${v.id}' has no Devanagari lines`);
    }
    if (!v.meaningHi.trim() && !v.meaningEn.trim()) {
      throw new Error(`sundarkand: verse '${v.id}' has empty meaning in both languages`);
    }
  }
})();
