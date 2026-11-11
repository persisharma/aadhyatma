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
 * The corpus is NOT in the JS bundle.
 *
 * It is 27 MB. While this module `require()`d the seven kāṇḍa JSONs they were
 * compiled into the Hermes bundle — more than half of it — and every OTA update
 * re-downloaded all of it for a text most sessions never open. The verses now
 * ship as bundled asset files (`assets/valmiki-ramayan/*.txt`, written from the
 * `chapter-0N.json` masters by `scripts/build-valmiki-assets.mjs`): stored once
 * in the store binary, addressed by content hash, and never re-sent by an
 * update unless their own bytes change.
 *
 * So a kāṇḍa is LOADED, not required: asynchronously, a part at a time, with
 * the thread handed back between parts. The largest kāṇḍa used to be a single
 * 6.4 MB synchronous `require` that froze the reader while it opened.
 *
 * `parts.ts` and `partReader.ts` are reached through `require()` thunks on
 * purpose. This module is on the launch path (the manifest and the daily
 * selection are); the asset handles and `expo-asset` must not be.
 */
const chapterCache = new Map<number, ValmikiRamayanChapter>();
const chapterLoads = new Map<number, Promise<ValmikiRamayanChapter>>();

/** How many part files are read from disk at once. Parsing is still one at a time. */
const READ_CONCURRENCY = 4;

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
  const { valmikiParts } = require('./parts') as typeof import('./parts');
  const { readValmikiPart } = require('./partReader') as typeof import('./partReader');
  const parts = valmikiParts[chapter - 1];
  const validator = createChapterValidator(summary);
  const verses: ValmikiRamayanVerse[] = [];

  for (let at = 0; at < parts.length; at += READ_CONCURRENCY) {
    const batch = parts.slice(at, at + READ_CONCURRENCY);
    const texts = await Promise.all(batch.map((part) => readValmikiPart(part.source)));
    for (let i = 0; i < texts.length; i += 1) {
      const part = batch[i];
      const parsed = JSON.parse(texts[i]) as ValmikiRamayanVerse[];
      if (!Array.isArray(parsed) || parsed.length !== part.verseCount || verses.length !== part.firstVerse) {
        throw new Error(`valmiki-ramayan: chapter ${chapter} part at verse ${part.firstVerse} is not the published part`);
      }
      for (const verse of parsed) {
        validator.check(verse);
        verses.push(withMeaningFallback(verse));
      }
      await yieldToEventLoop();
    }
  }
  validator.finish(verses.length);
  return { ...summary, verses };
}

/**
 * How many verses into kāṇḍa `kanda` its sarga `sarga` begins, or -1 when that
 * sarga has no verse. Answered from a small generated table, so following a
 * "kāṇḍa.sarga" reference does not load a kāṇḍa just to find where to open it.
 */
export function valmikiSargaStartIndex(kanda: number, sarga: number): number {
  const starts = (require('./sarga-starts.json') as Record<string, number[]>)[String(kanda)];
  return starts?.[sarga - 1] ?? -1;
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
