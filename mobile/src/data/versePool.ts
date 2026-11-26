import { library } from './texts';
import { getGitaChapter, gitaChaptersManifest } from './gita';
import { BHAGAVATAM_ID, bhagavatamChaptersManifest, getBhagavatamChapter } from './bhagavatam';
import { getSundarkandChapter, sundarkandChaptersManifest } from './sundarkand';
import { getShivaStrotamChapter, shivaStrotamChaptersManifest } from './shiva-strotam';
import { getDurgaStotramChapter, durgaStotramChaptersManifest } from './durga-stotram';
import { getSaraswatiStotramChapter, saraswatiStotramChaptersManifest } from './saraswati-stotram';
import { getGaneshStotramChapter, ganeshStotramChaptersManifest } from './ganesh-stotram';
import { getVishnuSahasranamaChapter, vishnuSahasranamaChaptersManifest } from './vishnu-sahasranama';
import { getKrishnaStotramChapter, krishnaStotramChaptersManifest } from './krishna-stotram';
import { getHanumanAshtakChapter, hanumanAshtakChaptersManifest } from './hanuman-ashtak';
import { getRamStutiChapter, ramStutiChaptersManifest } from './ram-stuti';
import { getBajrangBaanChapter, bajrangBaanChaptersManifest } from './bajrang-baan';
import { getRamcharitmanasChapter, ramcharitmanasChaptersManifest } from './ramcharitmanas';
import { valmikiRamayanDailySelection } from './valmiki-ramayan';
import { sanskarIds, getSanskar } from './sanskar';

export type UniformVerse = {
  sourceId: string;
  sourceNameHi: string;
  sourceNameEn: string;
  chapter?: number;
  verseIndex: number;
  textHi: string[];
  textEn: string[];
  meaningHi: string;
  meaningEn: string;
  labelHi?: string;
  labelEn?: string;
};

/**
 * The Daily Bhakti pool is assembled from a few content shapes:
 *
 * - **Shloka** sources: chaptered, verses carry `sanskrit` / `linesEn` and a
 *   numbered label (e.g. `श्लोक 1.5`). Most stotrams plus the Gita.
 * - **Pada** sources: chaptered, verses carry `lines` / `linesEn` and their own
 *   `labelHi` / `labelEn` (Sundarkand, Bajrang Baan, Ramcharitmanas, Valmiki Ramayan).
 * - **Sanskar**: a flat verse list per ritual, no chapter; the first `intro`
 *   verse is a section descriptor and is excluded from the random pool.
 * - **Flat** sources: one verse list per text, no chapter (ashtakams, suktams,
 *   kavachs, stutis), registered in `versePoolFlat.ts`.
 *
 * Each new section must be registered below — membership is explicit rather
 * than inferred from a category, so the pool only surfaces content with a
 * mapping that produces a well-formed verse + meaning.
 */
type ChapterSummary = { chapter: number; verseCount: number };

type ShlokaVerse = {
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};
type ShlokaChapter = { chapter: number; verses: ShlokaVerse[] };
type ShlokaSource = {
  id: string;
  manifest: readonly ChapterSummary[];
  getChapter: (chapter: number) => ShlokaChapter;
};

type PadaVerse = {
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};
type PadaChapter = { chapter: number; verses: PadaVerse[] };
type PadaSource = {
  id: string;
  manifest: readonly ChapterSummary[];
  getChapter: (chapter: number) => PadaChapter;
};

// Gita transliteration lives on a different field, so it gets its own pass.
const GITA_ID = 'bhagavad-gita';

/**
 * Daily Bhakti curation (Nov 2026). The verse of the day is a full verse with a
 * teaching, so a handful of registered sources are held out of the daily
 * rotation because their verses do not read as a standalone verse of the day.
 * They remain fully available in their own readers — this only narrows the
 * random daily pool. Rationale per group:
 *  - Durga Saptashati's ten battle-narrative chapters. Only the three canonical
 *    stutis stay pooled: chapter 4 (Śakrādi Stuti), 5 ("Ya Devi Sarvabhuteshu…"
 *    Aparājitā Stuti) and 11 (Nārāyaṇī Stuti).
 *  - Argalā and Kīlaka stotras (short repeating refrains) and the Devī Kavacham
 *    (a limb-by-limb nyāsa litany).
 *  - Gaṇeśa and Śiva Kavacham — "may X protect my head / eyes / …" litanies.
 *  - Sūrya Namaskār's twelve salutation mantras (a sanskar).
 * Vishnu Sahasranama keeps its invocation / dhyānam / phalaśruti but drops the
 * thousand-name recitation chapter (a chapter-level hold-out, below).
 */
export const DAILY_POOL_EXCLUDED_SOURCES: ReadonlySet<string> = new Set<string>([
  'ganesha-kavacham',
  'shiva-kavacham',
  'durga-devi-kavacham',
  'durga-argala-stotram',
  'durga-kilak-stotram',
  'durga-saptashati-chapter-1',
  'durga-saptashati-chapter-2',
  'durga-saptashati-chapter-3',
  'durga-saptashati-chapter-6',
  'durga-saptashati-chapter-7',
  'durga-saptashati-chapter-8',
  'durga-saptashati-chapter-9',
  'durga-saptashati-chapter-10',
  'durga-saptashati-chapter-12',
  'durga-saptashati-chapter-13',
  'surya-namaskar',
]);

// Chapters of an otherwise-pooled source to hold out of the daily rotation.
// Vishnu Sahasranama chapter 3 is the 1000-name recitation (a name list); its
// invocation (1), dhyānam (2) and phalaśruti (4) stay pooled.
const DAILY_POOL_EXCLUDED_CHAPTERS: ReadonlyMap<string, ReadonlySet<number>> = new Map([
  ['vishnu-sahasranama', new Set<number>([3])],
]);

/** A registered source that is also eligible for the random verse of the day. */
export function isDailyPoolSource(id: string): boolean {
  return !DAILY_POOL_EXCLUDED_SOURCES.has(id);
}

const SHLOKA_SOURCES: readonly ShlokaSource[] = [
  { id: 'shiva-strotam', manifest: shivaStrotamChaptersManifest, getChapter: getShivaStrotamChapter },
  { id: 'durga-stotram', manifest: durgaStotramChaptersManifest, getChapter: getDurgaStotramChapter },
  { id: 'saraswati-stotram', manifest: saraswatiStotramChaptersManifest, getChapter: getSaraswatiStotramChapter },
  { id: 'ganesh-stotram', manifest: ganeshStotramChaptersManifest, getChapter: getGaneshStotramChapter },
  { id: 'vishnu-sahasranama', manifest: vishnuSahasranamaChaptersManifest, getChapter: getVishnuSahasranamaChapter },
  { id: 'krishna-stotram', manifest: krishnaStotramChaptersManifest, getChapter: getKrishnaStotramChapter },
  { id: 'hanuman-ashtak', manifest: hanumanAshtakChaptersManifest, getChapter: getHanumanAshtakChapter },
  { id: 'ram-stuti', manifest: ramStutiChaptersManifest, getChapter: getRamStutiChapter },
];

const PADA_SOURCES: readonly PadaSource[] = [
  { id: 'sundarkand', manifest: sundarkandChaptersManifest, getChapter: getSundarkandChapter },
  { id: 'bajrang-baan', manifest: bajrangBaanChaptersManifest, getChapter: getBajrangBaanChapter },
  { id: 'ramcharitmanas', manifest: ramcharitmanasChaptersManifest, getChapter: getRamcharitmanasChapter },
];

export type PoolSegment = {
  sourceId: string;
  length: number;
  lastPositions: readonly { chapter: number; verseIndex: number }[];
  getAt: (offset: number) => UniformVerse | null;
  find: (verseIndex: number, chapter?: number) => UniformVerse | null;
};

const entryById = new Map(library.map((entry) => [entry.id, entry]));
const isActive = (id: string) => entryById.get(id)?.status === 'active' && !entryById.get(id)?.hidden;
const nameHi = (id: string, fallback?: string) => entryById.get(id)?.nameHi ?? fallback ?? id;
const nameEn = (id: string, fallback?: string) => entryById.get(id)?.nameEn ?? fallback ?? id;

function commentaryVerse(chapterNumber: number, verseIndex: number, sourceId: string = GITA_ID): UniformVerse | null {
  const getChapter = sourceId === BHAGAVATAM_ID ? getBhagavatamChapter : getGitaChapter;
  const verse = getChapter(chapterNumber).verses[verseIndex];
  if (!verse) return null;
  const reference = verse.scriptureRef ?? `${chapterNumber}.${verse.number}`;
  return {
    sourceId,
    sourceNameHi: nameHi(sourceId),
    sourceNameEn: nameEn(sourceId),
    chapter: chapterNumber,
    verseIndex,
    textHi: verse.sanskrit,
    textEn: verse.transliteration,
    meaningHi: verse.meaningHi,
    meaningEn: verse.meaningEn,
    labelHi: `श्लोक ${reference}`,
    labelEn: `Shloka ${reference}`,
  };
}

function shlokaVerse(src: ShlokaSource, chapterNumber: number, verseIndex: number): UniformVerse | null {
  const verse = src.getChapter(chapterNumber).verses[verseIndex];
  if (!verse) return null;
  return {
    sourceId: src.id,
    sourceNameHi: nameHi(src.id),
    sourceNameEn: nameEn(src.id),
    chapter: chapterNumber,
    verseIndex,
    textHi: verse.sanskrit,
    textEn: verse.linesEn,
    meaningHi: verse.meaningHi,
    meaningEn: verse.meaningEn,
    labelHi: `श्लोक ${chapterNumber}.${verse.number}`,
    labelEn: `Shloka ${chapterNumber}.${verse.number}`,
  };
}

function padaVerse(src: PadaSource, chapterNumber: number, verseIndex: number): UniformVerse | null {
  const verse = src.getChapter(chapterNumber).verses[verseIndex];
  if (!verse) return null;
  return {
    sourceId: src.id,
    sourceNameHi: nameHi(src.id),
    sourceNameEn: nameEn(src.id),
    chapter: chapterNumber,
    verseIndex,
    textHi: verse.lines,
    textEn: verse.linesEn,
    meaningHi: verse.meaningHi,
    meaningEn: verse.meaningEn,
    labelHi: verse.labelHi,
    labelEn: verse.labelEn,
  };
}

/**
 * A precomputed index of pool ranges, built entirely from tiny manifests. It
 * preserves the old pool order without materialising any chapter payload. A
 * caller selects one global index first, then only that verse's chapter is
 * required and cached by its source accessor.
 */
function buildPoolSegments(): PoolSegment[] {
  const segments: PoolSegment[] = [];

  if (isActive(GITA_ID)) {
    for (const chapter of gitaChaptersManifest) {
      segments.push({
        sourceId: GITA_ID,
        length: chapter.verseCount,
        lastPositions: [{ chapter: chapter.chapter, verseIndex: chapter.verseCount - 1 }],
        getAt: (offset) => commentaryVerse(chapter.chapter, offset),
        find: (verseIndex, requestedChapter) =>
          requestedChapter === chapter.chapter ? commentaryVerse(chapter.chapter, verseIndex) : null,
      });
    }
  }

  for (const src of SHLOKA_SOURCES) {
    if (!isActive(src.id) || !isDailyPoolSource(src.id)) continue;
    const excludedChapters = DAILY_POOL_EXCLUDED_CHAPTERS.get(src.id);
    for (const chapter of src.manifest) {
      if (excludedChapters?.has(chapter.chapter)) continue;
      segments.push({
        sourceId: src.id,
        length: chapter.verseCount,
        lastPositions: [{ chapter: chapter.chapter, verseIndex: chapter.verseCount - 1 }],
        getAt: (offset) => shlokaVerse(src, chapter.chapter, offset),
        find: (verseIndex, requestedChapter) =>
          requestedChapter === chapter.chapter ? shlokaVerse(src, chapter.chapter, verseIndex) : null,
      });
    }
  }

  for (const src of PADA_SOURCES) {
    if (!isActive(src.id)) continue;
    for (const chapter of src.manifest) {
      segments.push({
        sourceId: src.id,
        length: chapter.verseCount,
        lastPositions: [{ chapter: chapter.chapter, verseIndex: chapter.verseCount - 1 }],
        getAt: (offset) => padaVerse(src, chapter.chapter, offset),
        find: (verseIndex, requestedChapter) =>
          requestedChapter === chapter.chapter ? padaVerse(src, chapter.chapter, verseIndex) : null,
      });
    }
  }

  // The complete Valmiki corpus is 23k verses. Daily Bhakti uses only this
  // small build-time projection, never the seven multi-megabyte kāṇḍas.
  if (isActive('valmiki-ramayan')) {
    const getAt = (offset: number): UniformVerse | null => {
      const verse = valmikiRamayanDailySelection[offset];
      if (!verse) return null;
      return {
        sourceId: 'valmiki-ramayan',
        sourceNameHi: nameHi('valmiki-ramayan'),
        sourceNameEn: nameEn('valmiki-ramayan'),
        chapter: verse.kanda,
        verseIndex: verse.numInSection - 1,
        textHi: verse.lines,
        textEn: verse.linesEn,
        meaningHi: verse.meaningHi,
        meaningEn: verse.meaningEn,
        labelHi: verse.labelHi,
        labelEn: verse.labelEn,
      };
    };
    segments.push({
      sourceId: 'valmiki-ramayan',
      length: valmikiRamayanDailySelection.length,
      lastPositions: Object.values(
        valmikiRamayanDailySelection.reduce<Record<number, { chapter: number; verseIndex: number }>>(
          (positions, verse) => {
            const verseIndex = verse.numInSection - 1;
            const current = positions[verse.kanda];
            if (!current || verseIndex > current.verseIndex) {
              positions[verse.kanda] = { chapter: verse.kanda, verseIndex };
            }
            return positions;
          },
          {}
        )
      ),
      getAt,
      find: (verseIndex, chapter) => {
        const offset = valmikiRamayanDailySelection.findIndex(
          (verse) => verse.kanda === chapter && verse.numInSection - 1 === verseIndex
        );
        return offset < 0 ? null : getAt(offset);
      },
    });
  }

  // Japam mantras (single-line japa) no longer join the verse of the day — a one
  // line mantra does not read as a standalone daily verse, and every mantra lives
  // in the Japam feature. Sanskar projections are small launch-path data.
  for (const id of sanskarIds) {
    if (!isActive(id) || !isDailyPoolSource(id)) continue;
    const data = getSanskar(id);
    const verseIndices = data.verses.flatMap((verse, index) => verse.type === 'intro' ? [] : [index]);
    const getAt = (offset: number): UniformVerse | null => {
      const verseIndex = verseIndices[offset];
      const verse = verseIndex == null ? undefined : data.verses[verseIndex];
      if (!verse) return null;
      return {
        sourceId: id,
        sourceNameHi: nameHi(id, data.titleHi),
        sourceNameEn: nameEn(id, data.titleEn),
        verseIndex,
        textHi: verse.lines,
        textEn: verse.linesEn,
        meaningHi: verse.meaningHi,
        meaningEn: verse.meaningEn,
        labelHi: verse.labelHi,
        labelEn: verse.labelEn,
      };
    };
    segments.push({
      sourceId: id,
      length: verseIndices.length,
      lastPositions: [{ chapter: 1, verseIndex: Math.max(...verseIndices) }],
      getAt,
      find: (verseIndex, chapter) => {
        if (chapter != null) return null;
        const offset = verseIndices.indexOf(verseIndex);
        return offset < 0 ? null : getAt(offset);
      },
    });
  }

  // Appended after the existing sources so earlier pool indices keep their verse.
  // Required, not imported: the registry and its counts stay off the launch path.
  // The flat registry lists every single-list source; the daily-pool curation
  // (`DAILY_POOL_EXCLUDED_SOURCES`) holds a few of them out here.
  segments.push(
    ...(require('./versePoolFlat') as typeof import('./versePoolFlat'))
      .flatPoolSegments({ isActive, nameHi, nameEn })
      .filter((segment) => isDailyPoolSource(segment.sourceId))
  );

  if (isActive(BHAGAVATAM_ID)) {
    for (const reading of bhagavatamChaptersManifest) {
      const getAt = (index: number) => commentaryVerse(reading.chapter, index, BHAGAVATAM_ID);
      segments.push({
        sourceId: BHAGAVATAM_ID,
        length: reading.verseCount,
        lastPositions: [{ chapter: reading.chapter, verseIndex: reading.verseCount - 1 }],
        getAt,
        find: (verseIndex, chapter) => chapter === reading.chapter ? getAt(verseIndex) : null,
      });
    }
  }

  return segments;
}

// Built on first use, not at import: the flat registry it requires stays off
// the launch path until something asks for a verse.
let poolSegments: PoolSegment[] | null = null;
let poolSize = 0;

function segments(): PoolSegment[] {
  if (!poolSegments) {
    poolSegments = buildPoolSegments();
    poolSize = poolSegments.reduce((total, segment) => total + segment.length, 0);
  }
  return poolSegments;
}

export type VersePoolLastPositions = {
  chapters: Record<number, number>;
  lastChapter: number;
};

/** Completion boundaries derived from manifests, without loading verse data. */
export function getVersePoolLastPositions(): Record<string, VersePoolLastPositions> {
  const positions: Record<string, VersePoolLastPositions> = {};
  for (const segment of segments()) {
    for (const last of segment.lastPositions) {
      const source = positions[segment.sourceId] ?? { chapters: {}, lastChapter: last.chapter };
      const current = source.chapters[last.chapter];
      if (current == null || last.verseIndex > current) source.chapters[last.chapter] = last.verseIndex;
      if (last.chapter > source.lastChapter) source.lastChapter = last.chapter;
      positions[segment.sourceId] = source;
    }
  }
  return positions;
}

export function getVersePoolSize(): number {
  segments();
  return poolSize;
}

export function getVerseAtPoolIndex(index: number): UniformVerse | null {
  if (!Number.isInteger(index) || index < 0 || index >= getVersePoolSize()) return null;
  let offset = index;
  for (const segment of segments()) {
    if (offset < segment.length) return segment.getAt(offset);
    offset -= segment.length;
  }
  return null;
}

function buildPool(): UniformVerse[] {
  const pool: UniformVerse[] = [];
  for (let index = 0; index < getVersePoolSize(); index += 1) {
    const verse = getVerseAtPoolIndex(index);
    if (verse) pool.push(verse);
  }
  return pool;
}

let cachedPool: UniformVerse[] | null = null;

export function getVersePool(): UniformVerse[] {
  if (!cachedPool) {
    cachedPool = buildPool();
  }
  return cachedPool;
}

export function getRandomVerse(): UniformVerse | null {
  const size = getVersePoolSize();
  if (size === 0) return null;
  return getVerseAtPoolIndex(Math.floor(Math.random() * size));
}

/**
 * Look up a verse by its stable identity — source + chapter + index within the
 * chapter. Returns null when no active section contains it (e.g. the section
 * was deactivated, or the pool changed via an OTA update since the id was
 * captured). Unlike a date-hash lookup, this resolves the exact verse a daily
 * reminder advertised regardless of pool-size drift.
 */
export function findVerse(
  sourceId: string,
  verseIndex: number,
  chapter?: number
): UniformVerse | null {
  for (const segment of segments()) {
    if (segment.sourceId !== sourceId) continue;
    const verse = segment.find(verseIndex, chapter);
    if (verse) return verse;
  }
  return null;
}
