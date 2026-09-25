/* JSON chapters are produced by scripts/build-upanishad.mjs from the authored
   content in that script. Do not hand-edit the .json files. */

import manifest from './chapters-manifest.json';

export type UpanishadVerse = {
  id: string;
  /** 1-based Upanishad number, mirrors the owning chapter. */
  upanishad: number;
  /** `shanti` is the opening śānti-pāṭha page; every other page is a `mantra`. */
  section: 'shanti' | 'mantra';
  /**
   * Background-rotation key. Equals `upanishad` so the plate stays deterministic
   * per verse (`getReaderBackground`, RULEBOOK §3).
   */
  stanza: number;
  numInSection: number;
  /** Canonical citation — `mantra` (Īśa, Māṇḍūkya) or `khaṇḍa.mantra` (Kena); `shanti` for the opening. */
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

export type UpanishadChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  /** The Veda this Upanishad belongs to (shown on the chapter card). */
  vedaHi: string;
  vedaEn: string;
  /** Mantras proper — excludes the śānti-pāṭha page. */
  mantraCount: number;
  /** Reader pages — mantras plus the śānti-pāṭha. */
  verseCount: number;
};

export type UpanishadChapter = UpanishadChapterSummary & {
  verses: UpanishadVerse[];
};

export const upanishadTitleHi = 'उपनिषद्';
export const upanishadTitleEn = 'Upanishads';

export const upanishadChaptersManifest: readonly UpanishadChapterSummary[] =
  manifest as UpanishadChapterSummary[];

export const upanishadTotal = upanishadChaptersManifest.reduce((sum, ch) => sum + ch.verseCount, 0);

export const upanishadMantraTotal = upanishadChaptersManifest.reduce(
  (sum, ch) => sum + ch.mantraCount,
  0
);

// Payloads sit behind require() thunks so only the manifest is on the launch
// path (RULEBOOK §2 row 2 — `texts.ts` needs the totals, never the verses).
const chapterLoaders: readonly (() => UpanishadChapter)[] = [
  () => require('./chapter-01.json') as UpanishadChapter,
  () => require('./chapter-02.json') as UpanishadChapter,
  () => require('./chapter-03.json') as UpanishadChapter,
];

const chapterCache = new Map<number, UpanishadChapter>();

export function getUpanishadChapter(chapter: number): UpanishadChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= chapterLoaders.length) {
    throw new Error(`upanishad: chapter ${chapter} out of range (1-${chapterLoaders.length})`);
  }
  const cached = chapterCache.get(chapter);
  if (cached) return cached;
  const loaded = chapterLoaders[idx]();
  assertChapterInvariants(loaded, upanishadChaptersManifest[idx]);
  chapterCache.set(chapter, loaded);
  return loaded;
}

const DEVANAGARI = /[ऀ-ॿ]/;

(function assertUpanishadManifestInvariants() {
  if (chapterLoaders.length !== upanishadChaptersManifest.length) {
    throw new Error('upanishad: chapter count mismatch with manifest');
  }
  for (let i = 0; i < upanishadChaptersManifest.length; i++) {
    const summary = upanishadChaptersManifest[i];
    if (
      summary.chapter !== i + 1 ||
      summary.mantraCount < 1 ||
      summary.verseCount !== summary.mantraCount + 1
    ) {
      throw new Error(`upanishad: invalid manifest entry ${i + 1}`);
    }
  }
})();

function assertChapterInvariants(c: UpanishadChapter, manifestEntry: UpanishadChapterSummary) {
  if (c.verses.length !== c.verseCount) {
    throw new Error(
      `upanishad: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`
    );
  }
  if (
    manifestEntry.chapter !== c.chapter ||
    manifestEntry.mantraCount !== c.mantraCount ||
    manifestEntry.verseCount !== c.verseCount ||
    manifestEntry.titleHi !== c.titleHi ||
    manifestEntry.titleEn !== c.titleEn
  ) {
    throw new Error(`upanishad: manifest entry ${c.chapter} drifts from chapter payload`);
  }
  const seenIds = new Set<string>();
  let mantras = 0;
  c.verses.forEach((v, i) => {
    if (seenIds.has(v.id)) throw new Error(`upanishad: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (v.upanishad !== c.chapter || v.stanza !== c.chapter) {
      throw new Error(`upanishad: ${v.id} must carry its chapter as upanishad and stanza`);
    }
    if (v.numInSection !== i + 1) {
      throw new Error(`upanishad: ${v.id} numInSection ${v.numInSection} != page ${i + 1}`);
    }
    if (i === 0 ? v.section !== 'shanti' : v.section !== 'mantra') {
      throw new Error(`upanishad: ${v.id} — page 1 is the śānti-pāṭha, every later page a mantra`);
    }
    if (v.section === 'mantra') mantras++;
    if (v.lines.length < 1) throw new Error(`upanishad: ${v.id} has no lines`);
    // The reader renders `linesEn` index-paired with `lines` (RULEBOOK §11.12).
    if (v.lines.length !== v.linesEn.length) {
      throw new Error(`upanishad: ${v.id} has ${v.lines.length} lines but ${v.linesEn.length} linesEn`);
    }
    for (const line of v.linesEn) {
      if (!line.trim()) throw new Error(`upanishad: ${v.id} has an empty linesEn entry`);
      if (DEVANAGARI.test(line)) throw new Error(`upanishad: ${v.id} has Devanagari in linesEn`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`upanishad: ${v.id} has empty meaning`);
    }
    if (!v.reference.trim()) throw new Error(`upanishad: ${v.id} has no reference`);
  });
  if (mantras !== c.mantraCount) {
    throw new Error(`upanishad: chapter ${c.chapter} has ${mantras} mantras, expected ${c.mantraCount}`);
  }
}
