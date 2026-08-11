import manifest from './chapters-manifest.json';
import dailySelection from './daily-selection.json';

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
  sargaCount: number;
  verseCount: number;
  verses: ValmikiRamayanVerse[];
};

export type ValmikiRamayanChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  sargaCount: number;
  verseCount: number;
};

export const valmikiRamayanTitleHi = 'वाल्मीकि रामायण';
export const valmikiRamayanTitleEn = 'Valmiki Ramayan';

export const valmikiRamayanChaptersManifest: readonly ValmikiRamayanChapterSummary[] =
  manifest as ValmikiRamayanChapterSummary[];

export const valmikiRamayanTotal = valmikiRamayanChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

/**
 * The full corpus is intentionally loaded one kāṇḍa at a time. Importing all
 * seven 2.5–6 MB payloads here would put the entire epic on the Home startup
 * path through `texts.ts`.
 */
const chapterLoaders: readonly (() => ValmikiRamayanChapter)[] = [
  () => require('./chapter-01.json') as ValmikiRamayanChapter,
  () => require('./chapter-02.json') as ValmikiRamayanChapter,
  () => require('./chapter-03.json') as ValmikiRamayanChapter,
  () => require('./chapter-04.json') as ValmikiRamayanChapter,
  () => require('./chapter-05.json') as ValmikiRamayanChapter,
  () => require('./chapter-06.json') as ValmikiRamayanChapter,
  () => require('./chapter-07.json') as ValmikiRamayanChapter,
];

const chapterCache = new Map<number, ValmikiRamayanChapter>();

/** Lightweight anchors used by Daily Bhakti and on-device search. */
export const valmikiRamayanDailySelection =
  dailySelection as unknown as readonly ValmikiRamayanVerse[];

export function getValmikiRamayanChapter(chapter: number): ValmikiRamayanChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= chapterLoaders.length) {
    throw new Error(
      `valmiki-ramayan: chapter ${chapter} out of range (1-${chapterLoaders.length})`
    );
  }
  const cached = chapterCache.get(chapter);
  if (cached) return cached;
  const loaded = chapterLoaders[idx]();
  assertChapterInvariants(loaded, valmikiRamayanChaptersManifest[idx]);
  chapterCache.set(chapter, loaded);
  return loaded;
}

const DEVANAGARI = /[ऀ-ॿ]/;

(function assertValmikiRamayanManifestInvariants() {
  if (chapterLoaders.length !== valmikiRamayanChaptersManifest.length) {
    throw new Error('valmiki-ramayan: chapter count mismatch with manifest');
  }
  for (let i = 0; i < valmikiRamayanChaptersManifest.length; i++) {
    const summary = valmikiRamayanChaptersManifest[i];
    if (summary.chapter !== i + 1 || summary.sargaCount < 1 || summary.verseCount < 1) {
      throw new Error(`valmiki-ramayan: invalid manifest entry ${i + 1}`);
    }
  }
})();

function assertChapterInvariants(
  c: ValmikiRamayanChapter,
  manifestEntry: ValmikiRamayanChapterSummary
) {
  const seenIds = new Set<string>();
  if (c.verses.length !== c.verseCount) {
    throw new Error(
      `valmiki-ramayan: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`
    );
  }
  if (
    manifestEntry.chapter !== c.chapter ||
    manifestEntry.sargaCount !== c.sargaCount ||
    manifestEntry.verseCount !== c.verseCount ||
    manifestEntry.titleHi !== c.titleHi ||
    manifestEntry.titleEn !== c.titleEn
  ) {
    throw new Error(`valmiki-ramayan: manifest entry ${c.chapter} drifts from chapter payload`);
  }
  const seenSargas = new Set<string>();
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
    // The reader renders `linesEn` index-paired with `lines` (RULEBOOK §11.12).
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
    seenSargas.add(v.reference.split('.')[1] ?? '');
  }
  if (seenSargas.size !== c.sargaCount) {
    throw new Error(
      `valmiki-ramayan: chapter ${c.chapter} has ${seenSargas.size} sargas, expected ${c.sargaCount}`
    );
  }
}
