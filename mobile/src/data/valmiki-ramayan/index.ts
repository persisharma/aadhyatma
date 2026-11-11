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
 * A kāṇḍa is LOADED, not required: asynchronously, a piece at a time, with the
 * thread handed back between pieces. The largest kāṇḍa used to be a single
 * 6.4 MB synchronous `require` in the reader's first render.
 *
 * Where its verses come from is decided when the app is BUNDLED, by the app
 * version it is bundled for (`mobile/corpusDelivery.js`):
 *
 *   - A runtime whose store binary embeds the corpus reads it from 73 bundled
 *     asset files (`assets/valmiki-ramayan/*.txt`, written from the
 *     `chapter-0N.json` masters by `scripts/build-valmiki-assets.mjs`). The
 *     27 MB corpus is then NOT in the JS bundle — it was more than half of it —
 *     and no OTA update re-sends it.
 *   - Every older runtime gets the masters compiled into the bundle, as before,
 *     so an OTA from the latest branch asks nothing of a build that predates
 *     the asset files.
 *
 * Both answer the same `./corpusSource` request (`corpusSource.ts`,
 * `corpusSource.inbundle.ts`); everything below is shared.
 *
 * The source is reached through a `require()` thunk on purpose. This module is
 * on the launch path (the manifest and the daily selection are); the asset
 * handles, `expo-asset` and the masters must not be.
 */
const chapterCache = new Map<number, ValmikiRamayanChapter>();
const chapterLoads = new Map<number, Promise<ValmikiRamayanChapter>>();

/** Lightweight anchors used by Daily Bhakti and on-device search. */
export const valmikiRamayanDailySelection =
  dailySelection as unknown as readonly ValmikiRamayanVerse[];

function isValidChapter(chapter: number): boolean {
  return Number.isInteger(chapter) && chapter >= 1 && chapter <= valmikiRamayanChaptersManifest.length;
}

/** The kāṇḍa if this process has already loaded it, else null. Never does any work. */
export function peekValmikiRamayanChapter(chapter: number): ValmikiRamayanChapter | null {
  return chapterCache.get(chapter) ?? null;
}

/**
 * Load a kāṇḍa. Concurrent callers share one load; a loaded kāṇḍa is kept for
 * the life of the process, as it always was. A failed load is forgotten, so the
 * next call tries again.
 */
export function loadValmikiRamayanChapter(chapter: number): Promise<ValmikiRamayanChapter> {
  if (!isValidChapter(chapter)) {
    return Promise.reject(
      new Error(
        `valmiki-ramayan: chapter ${chapter} out of range (1-${valmikiRamayanChaptersManifest.length})`
      )
    );
  }
  const cached = chapterCache.get(chapter);
  if (cached) return Promise.resolve(cached);
  let pending = chapterLoads.get(chapter);
  if (!pending) {
    pending = readChapter(chapter).then(
      (loaded) => {
        chapterCache.set(chapter, loaded);
        chapterLoads.delete(chapter);
        return loaded;
      },
      (error: unknown) => {
        chapterLoads.delete(chapter);
        throw error;
      }
    );
    chapterLoads.set(chapter, pending);
  }
  return pending;
}

/** One macrotask, so a touch or a frame can run between two parts. */
const yieldToEventLoop = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

async function readChapter(chapter: number): Promise<ValmikiRamayanChapter> {
  const summary = valmikiRamayanChaptersManifest[chapter - 1];
  const { readKandaParts } = require('./corpusSource') as typeof import('./corpusSource');
  const validator = createChapterValidator(summary);
  const verses: ValmikiRamayanVerse[] = [];

  await readKandaParts(chapter, async (parsed, part) => {
    if (!Array.isArray(parsed) || parsed.length !== part.verseCount || verses.length !== part.firstVerse) {
      throw new Error(`valmiki-ramayan: chapter ${chapter} part at verse ${part.firstVerse} is not the published part`);
    }
    for (const verse of parsed as ValmikiRamayanVerse[]) {
      validator.check(verse);
      verses.push(withMeaningFallback(verse));
    }
    await yieldToEventLoop();
  });
  validator.finish(verses.length);
  return { ...summary, verses };
}

/**
 * How many verses into kāṇḍa `kanda` its sarga `sarga` begins, or -1 when that
 * sarga has no verse. Answered from a small generated table, so following a
 * "kāṇḍa.sarga" reference does not load a kāṇḍa just to find where to open it.
 */
export function valmikiSargaStartIndex(kanda: number, sarga: number): number {
  const { valmikiSargaStarts } = require('./sargaStarts') as typeof import('./sargaStarts');
  return valmikiSargaStarts[kanda]?.[sarga - 1] ?? -1;
}

/**
 * A blank meaning means the pinned upstream had no usable text for that language
 * (site-navigation residue, a Sanskrit echo, or an English "Missing" placeholder —
 * see `scripts/build-valmiki-ramayan.py`). Show the verse's other sourced meaning
 * rather than nothing or the residue, so every consumer (reader, share, read-aloud,
 * bookmarks) still receives non-empty strings.
 */
export function withMeaningFallback(v: ValmikiRamayanVerse): ValmikiRamayanVerse {
  if (v.meaningHi.trim() && v.meaningEn.trim()) return v;
  return {
    ...v,
    meaningHi: v.meaningHi.trim() ? v.meaningHi : v.meaningEn,
    meaningEn: v.meaningEn.trim() ? v.meaningEn : v.meaningHi,
  };
}

const DEVANAGARI = /[ऀ-ॿ]/;

(function assertValmikiRamayanManifestInvariants() {
  for (let i = 0; i < valmikiRamayanChaptersManifest.length; i++) {
    const summary = valmikiRamayanChaptersManifest[i];
    if (summary.chapter !== i + 1 || summary.sargaCount < 1 || summary.verseCount < 1) {
      throw new Error(`valmiki-ramayan: invalid manifest entry ${i + 1}`);
    }
  }
})();

/**
 * The same per-kāṇḍa invariants as before, checked verse by verse as each part
 * arrives instead of in one pass over a whole kāṇḍa at the end.
 */
function createChapterValidator(summary: ValmikiRamayanChapterSummary) {
  const seenIds = new Set<string>();
  const seenSargas = new Set<string>();
  return {
    check(v: ValmikiRamayanVerse): void {
      if (seenIds.has(v.id)) throw new Error(`valmiki-ramayan: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.kanda !== summary.chapter) {
        throw new Error(`valmiki-ramayan: ${v.id} kanda ${v.kanda} != chapter ${summary.chapter}`);
      }
      if (v.stanza !== summary.chapter) {
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
      // One side may be blank (unusable upstream row, filled by `withMeaningFallback`);
      // a verse with no usable meaning in either language is a corpus defect.
      if (!v.meaningHi.trim() && !v.meaningEn.trim()) {
        throw new Error(`valmiki-ramayan: ${v.id} has no meaning in either language`);
      }
      if (!v.reference.trim()) throw new Error(`valmiki-ramayan: ${v.id} has no reference`);
      seenSargas.add(v.reference.split('.')[1] ?? '');
    },
    finish(verseCount: number): void {
      if (verseCount !== summary.verseCount) {
        throw new Error(
          `valmiki-ramayan: chapter ${summary.chapter} declares ${summary.verseCount} verses but has ${verseCount}`
        );
      }
      if (seenSargas.size !== summary.sargaCount) {
        throw new Error(
          `valmiki-ramayan: chapter ${summary.chapter} has ${seenSargas.size} sargas, expected ${summary.sargaCount}`
        );
      }
    },
  };
}
