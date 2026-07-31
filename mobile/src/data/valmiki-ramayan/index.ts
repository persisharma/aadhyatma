import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';
import ch04 from './chapter-04.json';
import ch05 from './chapter-05.json';
import ch06 from './chapter-06.json';

export type ValmikiRamayanVerse = {
  id: string;
  /** 1-based kāṇḍa number, mirrors the owning chapter. Drives the reader background. */
  kanda: number;
  section: 'shloka';
  /**
   * Background-rotation key. Equals `kanda` so the sketch changes per kāṇḍa and
   * stays deterministic per verse (`getReaderBackground`, RULEBOOK §3).
   */
  stanza: number;
  numInSection: number;
  /** Canonical citation `kāṇḍa.sarga.śloka` (a sarga-only citation where editions differ). */
  reference: string;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type ValmikiRamayanChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: ValmikiRamayanVerse[];
};

export type ValmikiRamayanChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const valmikiRamayanTitleHi = 'वाल्मीकि रामायण';
export const valmikiRamayanTitleEn = 'Valmiki Ramayan';

export const valmikiRamayanChaptersManifest: readonly ValmikiRamayanChapterSummary[] =
  manifest as ValmikiRamayanChapterSummary[];

export const valmikiRamayanChapters: readonly ValmikiRamayanChapter[] = [
  ch01 as ValmikiRamayanChapter,
  ch02 as ValmikiRamayanChapter,
  ch03 as ValmikiRamayanChapter,
  ch04 as ValmikiRamayanChapter,
  ch05 as ValmikiRamayanChapter,
  ch06 as ValmikiRamayanChapter,
];

export const valmikiRamayanTotal = valmikiRamayanChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getValmikiRamayanChapter(chapter: number): ValmikiRamayanChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= valmikiRamayanChapters.length) {
    throw new Error(
      `valmiki-ramayan: chapter ${chapter} out of range (1-${valmikiRamayanChapters.length})`
    );
  }
  return valmikiRamayanChapters[idx];
}

const DEVANAGARI = /[ऀ-ॿ]/;

(function assertValmikiRamayanInvariants() {
  if (valmikiRamayanChapters.length !== valmikiRamayanChaptersManifest.length) {
    throw new Error('valmiki-ramayan: chapter count mismatch with manifest');
  }
  const seenIds = new Set<string>();
  for (let i = 0; i < valmikiRamayanChapters.length; i++) {
    const c = valmikiRamayanChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(
        `valmiki-ramayan: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`
      );
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `valmiki-ramayan: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`
      );
    }
    const manifestEntry = valmikiRamayanChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`valmiki-ramayan: manifest entry ${i + 1} drifts from chapter payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`valmiki-ramayan: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.kanda !== c.chapter) {
        throw new Error(`valmiki-ramayan: ${v.id} kanda ${v.kanda} != chapter ${c.chapter}`);
      }
      if (v.stanza !== c.chapter) {
        throw new Error(`valmiki-ramayan: ${v.id} stanza must equal its kāṇḍa number`);
      }
      if (v.lines.length < 1) throw new Error(`valmiki-ramayan: ${v.id} has no lines`);
      // The reader renders `linesEn` index-paired with `lines` (RULEBOOK §10.12).
      if (v.lines.length !== v.linesEn.length) {
        throw new Error(
          `valmiki-ramayan: ${v.id} has ${v.lines.length} lines but ${v.linesEn.length} linesEn`
        );
      }
      for (const line of v.linesEn) {
        if (!line.trim()) throw new Error(`valmiki-ramayan: ${v.id} has an empty linesEn entry`);
        if (DEVANAGARI.test(line)) {
          throw new Error(`valmiki-ramayan: ${v.id} has Devanagari in linesEn`);
        }
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`valmiki-ramayan: ${v.id} has empty meaning`);
      }
      if (!v.reference.trim()) throw new Error(`valmiki-ramayan: ${v.id} has no reference`);
    }
  }
})();
