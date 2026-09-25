/* Per-text JSON under ./texts/ and the manifest are produced by
   scripts/build-upanishad.mjs from scripts/upanishad-content/<slug>.mjs.
   Do not hand-edit the .json files. The 108-text catalogue is ./registry.ts. */

import manifest from './chapters-manifest.json';
import { upanishadTextLoaders } from './textLoaders';
import {
  getUpanishadMeta,
  upanishadRegistry,
  upanishadTitleEnOf,
  upanishadTitleHiOf,
  type UpanishadMeta,
} from './registry';

export * from './registry';

export type UpanishadVerse = {
  id: string;
  /** Muktikā number of the owning Upanishad — mirrors the chapter id. */
  upanishad: number;
  /** `shanti` is the opening śānti-pāṭha page; every other page is a `mantra`. */
  section: 'shanti' | 'mantra';
  /**
   * Background-rotation key. Equals `upanishad` so the plate stays deterministic
   * per verse (`getReaderBackground`, RULEBOOK §3).
   */
  stanza: number;
  numInSection: number;
  /** Canonical citation — `mantra`, `khaṇḍa.mantra` or `adhyāya.vallī.mantra`; `shanti` for the opening. */
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
  /** The Muktikā number (1–108) — fixed forever, so progress survives new texts. */
  chapter: number;
  slug: string;
  titleHi: string;
  titleEn: string;
  /** The Veda this Upanishad belongs to. */
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

/**
 * The READABLE Upanishads, in Muktikā order. `chapter` values are sparse (1, 2,
 * 6, …): readers must step between them with `nextUpanishadChapter` /
 * `prevUpanishadChapter`, never `chapter ± 1`.
 */
export const upanishadChaptersManifest: readonly UpanishadChapterSummary[] =
  manifest as UpanishadChapterSummary[];

export const upanishadTotal = upanishadChaptersManifest.reduce((sum, ch) => sum + ch.verseCount, 0);

export const upanishadMantraTotal = upanishadChaptersManifest.reduce(
  (sum, ch) => sum + ch.mantraCount,
  0
);

const summaryByChapter: ReadonlyMap<number, UpanishadChapterSummary> = new Map(
  upanishadChaptersManifest.map((c) => [c.chapter, c])
);

export function isUpanishadAvailable(chapter: number): boolean {
  return summaryByChapter.has(chapter);
}

export function getUpanishadSummary(chapter: number): UpanishadChapterSummary | undefined {
  return summaryByChapter.get(chapter);
}

/** The next readable Upanishad after `chapter` in Muktikā order, or null at the end. */
export function nextUpanishadChapter(chapter: number): UpanishadChapterSummary | null {
  return upanishadChaptersManifest.find((c) => c.chapter > chapter) ?? null;
}

/** The previous readable Upanishad before `chapter` in Muktikā order, or null at the start. */
export function prevUpanishadChapter(chapter: number): UpanishadChapterSummary | null {
  for (let i = upanishadChaptersManifest.length - 1; i >= 0; i--) {
    if (upanishadChaptersManifest[i].chapter < chapter) return upanishadChaptersManifest[i];
  }
  return null;
}

/** Every catalogue row, with its readable summary attached when the text has shipped. */
export type UpanishadCatalogueRow = UpanishadMeta & { summary: UpanishadChapterSummary | null };

export function upanishadCatalogue(): UpanishadCatalogueRow[] {
  return upanishadRegistry.map((meta) => ({ meta, summary: summaryByChapter.get(meta.muktika) ?? null }))
    .map(({ meta, summary }) => ({ ...meta, summary }));
}

const chapterCache = new Map<number, UpanishadChapter>();

export function getUpanishadChapter(chapter: number): UpanishadChapter {
  const summary = summaryByChapter.get(chapter);
  if (!summary) {
    throw new Error(`upanishad: chapter ${chapter} is not a readable Upanishad yet`);
  }
  const cached = chapterCache.get(chapter);
  if (cached) return cached;
  const loader = upanishadTextLoaders[summary.slug];
  if (!loader) throw new Error(`upanishad: no loader for '${summary.slug}'`);
  const loaded = loader();
  assertChapterInvariants(loaded, summary);
  chapterCache.set(chapter, loaded);
  return loaded;
}

const DEVANAGARI = /[ऀ-ॿ]/;

(function assertUpanishadManifestInvariants() {
  const loaderSlugs = Object.keys(upanishadTextLoaders).sort();
  const manifestSlugs = upanishadChaptersManifest.map((c) => c.slug).sort();
  if (loaderSlugs.join(',') !== manifestSlugs.join(',')) {
    throw new Error('upanishad: textLoaders.ts drifts from chapters-manifest.json — rerun the builder');
  }
  let last = 0;
  for (const summary of upanishadChaptersManifest) {
    const meta = getUpanishadMeta(summary.chapter);
    if (!meta || meta.slug !== summary.slug) {
      throw new Error(`upanishad: manifest chapter ${summary.chapter} is not registry '${summary.slug}'`);
    }
    if (summary.chapter <= last) throw new Error('upanishad: manifest must be in ascending Muktikā order');
    last = summary.chapter;
    if (
      summary.titleHi !== upanishadTitleHiOf(meta) ||
      summary.titleEn !== upanishadTitleEnOf(meta) ||
      summary.mantraCount < 1 ||
      summary.verseCount !== summary.mantraCount + 1
    ) {
      throw new Error(`upanishad: invalid manifest entry ${summary.chapter}`);
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
    manifestEntry.slug !== c.slug ||
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
