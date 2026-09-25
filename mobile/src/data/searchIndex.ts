/**
 * On-device search index for the entire Vedansh library (PRD-03).
 *
 * Bundle-only: the index is built at runtime from the same bundled data the
 * readers already load. No network, no external service. Index construction
 * is lazy (first call to {@link getSearchIndex}) so it doesn't impact cold
 * boot.
 *
 * Adding a new section: see RULEBOOK §7. If the section uses the standard
 * `lines`/`linesEn` or `sanskrit`/`linesEn`/`transliteration` field shape it
 * is picked up automatically once added to `library` in `texts.ts`. A section
 * with a novel verse shape needs a new branch in {@link entryUnits}.
 */

import { library, type LibraryEntry } from './texts';
import { deities } from './deities';
import { getChalisa, type ChalisaId } from './chalisaRegistry';
import { getAshtakam, ashtakamIds, type AshtakamId } from './ashtakam';
import { getSuktam, suktamIds, type SuktamId } from './suktam';
import { getKavacham, kavachamIds, type KavachamId } from './kavacham';
import { getStuti, stutiIds, type StutiId } from './stuti';
import {
  aartiCollection,
  aartiIdByIndex,
  type AartiVerse,
} from './aarti';
import { japamMantras, type JapamMantra } from './japam';
import {
  templesWithDetails,
  type TempleEntry,
  type TheerthGroup,
} from './theerth/temples';
import {
  getGitaChapter,
  gitaChaptersManifest,
  type GitaVerse,
} from './gita';
import {
  getSundarkandChapter,
  sundarkandChaptersManifest,
  type SundarkandVerse,
} from './sundarkand';
import {
  getShivaStrotamChapter,
  shivaStrotamChaptersManifest,
  type ShivaStrotamVerse,
} from './shiva-strotam';
import {
  getDurgaStotramChapter,
  durgaStotramChaptersManifest,
} from './durga-stotram';
import {
  getSaraswatiStotramChapter,
  saraswatiStotramChaptersManifest,
} from './saraswati-stotram';
import {
  getGaneshStotramChapter,
  ganeshStotramChaptersManifest,
} from './ganesh-stotram';
import {
  getVishnuSahasranamaChapter,
  vishnuSahasranamaChaptersManifest,
} from './vishnu-sahasranama';
import {
  getHanumanAshtakChapter,
  hanumanAshtakChaptersManifest,
} from './hanuman-ashtak';
import {
  getBajrangBaanChapter,
  bajrangBaanChaptersManifest,
  type BajrangBaanVerse,
} from './bajrang-baan';
import {
  getRamStutiChapter,
  ramStutiChaptersManifest,
} from './ram-stuti';
import {
  getKrishnaStotramChapter,
  krishnaStotramChaptersManifest,
} from './krishna-stotram';
import {
  getRamcharitmanasChapter,
  ramcharitmanasChaptersManifest,
  type RamcharitmanasVerse,
} from './ramcharitmanas';
import {
  valmikiRamayanDailySelection,
  type ValmikiRamayanVerse,
} from './valmiki-ramayan';
import { getSanskar, sanskarIds } from './sanskar';
import { VIDHI_ENTRIES, type VidhiEntry } from './vidhi';
import { getPurposeMeta } from './purposes';
import { purposesForText } from './discoveryMeta';
import { MatchRank, normalize, rankAny } from './searchNormalize';

const CHALISA_IDS: readonly ChalisaId[] = [
  'hanuman-chalisa',
  'shiv-chalisa',
  'durga-chalisa',
  'ganesh-chalisa',
  'gayatri-chalisa',
  'ram-chalisa',
  'krishna-chalisa',
  'vishnu-chalisa',
  'saraswati-chalisa',
];

const ASHTAKAM_IDS: readonly AshtakamId[] = ashtakamIds;
const SUKTAM_IDS: readonly SuktamId[] = suktamIds;
const KAVACHAM_IDS: readonly KavachamId[] = kavachamIds;
const STUTI_IDS: readonly StutiId[] = stutiIds;

/** Cap how many verses can come back from a single query (UX + perf). */
export const VERSE_RESULT_CAP = 50;

export type SearchSectionEntry = {
  type: 'section';
  id: string;
  /** The library `sourceId` — used by `entryRoutes.ts` to navigate. */
  sourceId: string;
  displayHi: string;
  displayEn: string;
  /** Optional small subtitle e.g. "40 चौपाई · अर्थ सहित". */
  subtitleHi: string;
  /** Single-glyph Devanagari thumbnail. */
  thumb: string;
  /** Normalized blob of every searchable field for this section. */
  norm: string;
  /** Per-field normalized values, used by ranking. */
  fieldsNorm: readonly string[];
};

export type SearchDeityEntry = {
  type: 'deity';
  id: string;
  deityId: string;
  displayHi: string;
  displayEn: string;
  norm: string;
  fieldsNorm: readonly string[];
};

export type SearchVerseEntry = {
  type: 'verse';
  id: string;
  sourceId: string;
  chapter?: number;
  verseIndex: number;
  /** A short label like "श्लोक 2.47" / "चौपाई 9". Used in the result row. */
  labelHi: string;
  labelEn: string;
  /** The first line of the verse text — the snippet shown in the result row. */
  firstLineHi: string;
  firstLineEn: string;
  /** Section title for the result row's secondary text. */
  sectionNameHi: string;
  sectionNameEn: string;
  norm: string;
  fieldsNorm: readonly string[];
};

export type SearchEntry =
  | SearchSectionEntry
  | SearchDeityEntry
  | SearchVerseEntry;

export type SearchIndex = {
  sections: readonly SearchSectionEntry[];
  deities: readonly SearchDeityEntry[];
  verses: readonly SearchVerseEntry[];
};

export type SearchHit<E extends SearchEntry = SearchEntry> = {
  entry: E;
  rank: MatchRank;
};

export type SearchResults = {
  query: string;
  sections: SearchHit<SearchSectionEntry>[];
  deities: SearchHit<SearchDeityEntry>[];
  verses: SearchHit<SearchVerseEntry>[];
  /** True if the verse list was capped (i.e. more potential hits exist). */
  versesCapped: boolean;
};

let cached: SearchIndex | null = null;

/**
 * The index is built by ONE resumable job, shared by every caller.
 *
 * The background warm-up advances it a few milliseconds at a time; a caller
 * that needs the index right now (`getSearchIndex`) simply runs the same job to
 * the end. Nothing is ever built twice and no progress is ever thrown away —
 * a tap that beats the warm-up finishes what the warm-up already started.
 */
type PendingBuild = { verses: SearchVerseEntry[]; units: Generator<void, void, void> };
let pending: PendingBuild | null = null;

function* verseUnits(verses: SearchVerseEntry[]): Generator<void, void, void> {
  for (const entry of indexableEntries()) {
    yield* entryUnits(verses, entry);
    yield;
  }
}

/**
 * Run build units until `budgetMs` has been spent or the index is complete.
 * Returns true once the index exists.
 */
function advance(budgetMs: number): boolean {
  if (cached) return true;
  if (!pending) {
    const verses: SearchVerseEntry[] = [];
    pending = { verses, units: verseUnits(verses) };
  }
  const started = Date.now();
  try {
    for (;;) {
      if (pending.units.next().done) {
        cached = { sections: buildSectionEntries(), deities: buildDeityEntries(), verses: pending.verses };
        pending = null;
        return true;
      }
      if (Date.now() - started >= budgetMs) return false;
    }
  } catch (error) {
    // A generator that has thrown reports `done` on every later call. Without
    // this reset the next caller would "finish" it and cache a half-built index
    // with no error at all. Starting over means a broken corpus fails loudly
    // every time, exactly as the old single-pass build did.
    pending = null;
    throw error;
  }
}

/**
 * The index, now — building synchronously whatever is left. Prefer
 * `peekSearchIndex` + `warmSearchIndex` on any path the user is waiting on.
 */
export function getSearchIndex(): SearchIndex {
  advance(Infinity);
  return cached!;
}

/** Searched while the real index is still being built: yields no hits, costs nothing. */
export const EMPTY_SEARCH_INDEX: SearchIndex = { sections: [], deities: [], verses: [] };

/** The index if it is already built, else null. Never does any work. */
export function peekSearchIndex(): SearchIndex | null {
  return cached;
}

/** Default slice: half a frame, so a slice can never cost the one after it. */
export const SEARCH_SLICE_BUDGET_MS = 8;

/**
 * Build the index in the background: `budgetMs` of work, then hand the thread
 * back through `yieldToUI`, repeat.
 *
 * WHY. The build is ~0.7 s of CPU on a desktop — seconds on a phone — and it
 * runs while the user is looking at Home, so it must never hold the thread for
 * a frame. A time budget with small units underneath (one chapter, one temple)
 * keeps every slice short no matter which source it lands in.
 *
 * Safe to call more than once, even concurrently — the background walk and the
 * Search screen both do. Every caller advances the SAME job, so concurrent
 * callers simply share the work between them and all resolve to one index.
 */
export async function warmSearchIndex(
  yieldToUI: () => Promise<void> = () => Promise.resolve(),
  budgetMs: number = SEARCH_SLICE_BUDGET_MS
): Promise<SearchIndex> {
  while (!cached) {
    await yieldToUI();
    advance(budgetMs);
  }
  return cached;
}

/**
 * Reset the cache. Exposed for tests; production code should not call this.
 * Index construction is deterministic from bundled data, so there is no
 * correctness reason to invalidate at runtime.
 */
export function _resetSearchIndexForTest(): void {
  cached = null;
  pending = null;
}

function buildSectionEntries(): readonly SearchSectionEntry[] {
  // Vidhi rows ride the section group (PRD-19 Phase 2B): a vidhi is a
  // procedure, not a text, so it contributes a single openable row (no verse
  // entries). SearchScreen routes vidhi sourceIds to VidhiDetail.
  return [...library.map((entry) => sectionEntry(entry)), ...VIDHI_ENTRIES.map(vidhiSectionEntry)];
}

function vidhiSectionEntry(vidhi: VidhiEntry): SearchSectionEntry {
  const personal = vidhi.anchor === 'personal-tithi';
  const subtitleHi = `${personal ? 'स्मरण विधि' : 'पूजा विधि'} · ${vidhi.steps.length} चरण`;
  const fields = [
    vidhi.titleHi,
    vidhi.titleEn,
    subtitleHi,
    personal ? 'तर्पण विधि पितृ स्मरण श्राद्ध मार्गदर्शिका' : 'पूजा विधि',
    personal ? 'Tarpana Shraddha Pitru remembrance guide' : 'Puja Vidhi',
    'vidhi',
  ];
  const fieldsNorm = fields.map(normalize);
  return {
    type: 'section',
    id: `section:${vidhi.id}`,
    sourceId: vidhi.id,
    displayHi: vidhi.titleHi,
    displayEn: vidhi.titleEn,
    subtitleHi,
    thumb: '॥',
    norm: fieldsNorm.join(' '),
    fieldsNorm,
  };
}

function sectionEntry(entry: LibraryEntry): SearchSectionEntry {
  const purposeFields = purposesForText(entry.id).flatMap((purposeId) => {
    const purpose = getPurposeMeta(purposeId);
    return [purpose.nameHi, purpose.nameEn, purpose.id];
  });
  const fields = [
    entry.nameHi,
    entry.nameEn,
    entry.sub,
    entry.thumb,
    ...purposeFields,
  ];
  const fieldsNorm = fields.map(normalize);
  return {
    type: 'section',
    id: `section:${entry.id}`,
    sourceId: entry.id,
    displayHi: entry.nameHi,
    displayEn: entry.nameEn,
    subtitleHi: entry.sub,
    thumb: entry.thumb,
    norm: fieldsNorm.join(' '),
    fieldsNorm,
  };
}

function buildDeityEntries(): readonly SearchDeityEntry[] {
  return deities.map((d) => {
    const fields = [d.nameHi, d.nameEn, d.id];
    const fieldsNorm = fields.map(normalize);
    return {
      type: 'deity',
      id: `deity:${d.id}`,
      deityId: d.id,
      displayHi: d.nameHi,
      displayEn: d.nameEn,
      norm: fieldsNorm.join(' '),
      fieldsNorm,
    };
  });
}

/**
 * Index ONE library entry, as a sequence of small units of work. Each `yield`
 * is a point where the build may pause and hand the thread back. The heavy
 * sources yield inside themselves — once per chapter (the Gītā, Sundarkand and
 * the stotram corpora) or per temple (Theerth) — because an entry-sized unit
 * was far too coarse: the Gītā alone measured ~225 ms, over a dozen frames.
 */
function* entryUnits(verses: SearchVerseEntry[], entry: LibraryEntry): Generator<void, void, void> {
  if (CHALISA_IDS.includes(entry.id as ChalisaId)) {
    pushChalisaVerses(verses, entry);
    return;
  }

  if (ASHTAKAM_IDS.includes(entry.id as AshtakamId)) {
    pushAshtakamVerses(verses, entry);
    return;
  }

  if (SUKTAM_IDS.includes(entry.id as SuktamId)) {
    pushSuktamVerses(verses, entry);
    return;
  }

  if (KAVACHAM_IDS.includes(entry.id as KavachamId)) {
    pushKavachamVerses(verses, entry);
    return;
  }

  if (STUTI_IDS.includes(entry.id as StutiId)) {
    pushStutiVerses(verses, entry);
    return;
  }

  if (entry.id === 'bhagavad-gita') {
    yield* pushChapteredGita(verses, entry);
    return;
  }

  if (entry.id === 'sundarkand') {
    yield* pushChapteredSundarkand(verses, entry);
    return;
  }

  if (entry.id === 'shiva-strotam') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      shivaStrotamChaptersManifest,
      getShivaStrotamChapter
    );
    return;
  }

  if (entry.id === 'durga-stotram') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      durgaStotramChaptersManifest,
      getDurgaStotramChapter
    );
    return;
  }

  if (entry.id === 'saraswati-stotram') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      saraswatiStotramChaptersManifest,
      getSaraswatiStotramChapter
    );
    return;
  }

  if (entry.id === 'ganesh-stotram') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      ganeshStotramChaptersManifest,
      getGaneshStotramChapter
    );
    return;
  }

  if (entry.id === 'vishnu-sahasranama') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      vishnuSahasranamaChaptersManifest,
      getVishnuSahasranamaChapter
    );
    return;
  }

  if (entry.id === 'hanuman-ashtak') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      hanumanAshtakChaptersManifest,
      getHanumanAshtakChapter
    );
    return;
  }

  if (entry.id === 'bajrang-baan') {
    yield* pushChapteredBajrangBaan(verses, entry);
    return;
  }

  if (entry.id === 'ram-stuti' || entry.id === 'ram-aarti') {
    // 'ram-aarti' is the Aarti-list alias for the Ram Stuti content, so it
    // indexes the same verses under its own sourceId (see texts.ts / entryRoutes.ts).
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      ramStutiChaptersManifest,
      getRamStutiChapter
    );
    return;
  }

  if (entry.id === 'krishna-stotram') {
    yield* pushChapteredShivaStrotamShape(
      verses,
      entry,
      krishnaStotramChaptersManifest,
      getKrishnaStotramChapter
    );
    return;
  }

  if (entry.id === 'ramcharitmanas') {
    yield* pushChapteredRamcharitmanas(verses, entry);
    return;
  }

  if (entry.id === 'valmiki-ramayan') {
    pushChapteredValmikiRamayan(verses, entry);
    return;
  }

  if (entry.category === 'aarti') {
    pushAarti(verses, entry);
    return;
  }

  if (entry.category === 'sanskar') {
    pushSanskar(verses, entry);
    return;
  }

  if (entry.category === 'japam') {
    pushJapam(verses, entry);
    return;
  }

  if (entry.category === 'theerth') {
    yield* pushTheerth(verses, entry);
    return;
  }

  // Unknown section shape — silently skip rather than crash. Caught by the
  // section-coverage test in __tests__/searchIndex.test.ts.
}

/** Entries that contribute verses: active and not hidden. */
function indexableEntries(): readonly LibraryEntry[] {
  return library.filter((entry) => !entry.hidden && entry.status === 'active');
}


function pushChalisaVerses(out: SearchVerseEntry[], entry: LibraryEntry) {
  const chalisa = getChalisa(entry.id);
  chalisa.verses.forEach((v, idx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: idx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function pushAshtakamVerses(out: SearchVerseEntry[], entry: LibraryEntry) {
  const ashtakam = getAshtakam(entry.id);
  ashtakam.verses.forEach((v, idx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: idx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function pushStutiVerses(out: SearchVerseEntry[], entry: LibraryEntry) {
  const stuti = getStuti(entry.id);
  stuti.verses.forEach((v, idx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: idx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function pushKavachamVerses(out: SearchVerseEntry[], entry: LibraryEntry) {
  const kavacham = getKavacham(entry.id);
  kavacham.verses.forEach((v, idx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: idx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function pushSuktamVerses(out: SearchVerseEntry[], entry: LibraryEntry) {
  const suktam = getSuktam(entry.id);
  suktam.verses.forEach((v, idx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: idx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function* pushChapteredGita(out: SearchVerseEntry[], entry: LibraryEntry) {
  for (const ch of gitaChaptersManifest) {
    const chapter = getGitaChapter(ch.chapter);
    chapter.verses.forEach((v: GitaVerse, idx) => {
      out.push(
        makeVerseEntry({
          sourceId: entry.id,
          sectionNameHi: entry.nameHi,
          sectionNameEn: entry.nameEn,
          chapter: ch.chapter,
          verseIndex: idx,
          labelHi: `श्लोक ${ch.chapter}.${v.number}`,
          labelEn: `Verse ${ch.chapter}.${v.number}`,
          linesHi: v.sanskrit,
          linesEn: v.transliteration,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
        })
      );
    });
    // One chapter per unit: a whole corpus in one go is a dropped frame.
    yield;
  }
}

function* pushChapteredSundarkand(out: SearchVerseEntry[], entry: LibraryEntry) {
  for (const ch of sundarkandChaptersManifest) {
    const chapter = getSundarkandChapter(ch.chapter);
    chapter.verses.forEach((v: SundarkandVerse, idx) => {
      out.push(
        makeVerseEntry({
          sourceId: entry.id,
          sectionNameHi: entry.nameHi,
          sectionNameEn: entry.nameEn,
          chapter: ch.chapter,
          verseIndex: idx,
          labelHi: v.labelHi,
          labelEn: v.labelEn,
          linesHi: v.lines,
          linesEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
        })
      );
    });
    // One chapter per unit: a whole corpus in one go is a dropped frame.
    yield;
  }
}

type ChapterSummaryLike = { chapter: number };
type ChapteredShivaStrotamLike = {
  verses: readonly ShivaStrotamVerse[];
};

function* pushChapteredShivaStrotamShape(
  out: SearchVerseEntry[],
  entry: LibraryEntry,
  manifest: readonly ChapterSummaryLike[],
  getChapter: (chapter: number) => ChapteredShivaStrotamLike
) {
  for (const ch of manifest) {
    const chapter = getChapter(ch.chapter);
    chapter.verses.forEach((v, idx) => {
      out.push(
        makeVerseEntry({
          sourceId: entry.id,
          sectionNameHi: entry.nameHi,
          sectionNameEn: entry.nameEn,
          chapter: ch.chapter,
          verseIndex: idx,
          labelHi: `श्लोक ${ch.chapter}.${v.number}`,
          labelEn: `Verse ${ch.chapter}.${v.number}`,
          linesHi: v.sanskrit,
          linesEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
        })
      );
    });
    // One chapter per unit: a whole corpus in one go is a dropped frame.
    yield;
  }
}

function* pushChapteredBajrangBaan(out: SearchVerseEntry[], entry: LibraryEntry) {
  for (const ch of bajrangBaanChaptersManifest) {
    const chapter = getBajrangBaanChapter(ch.chapter);
    chapter.verses.forEach((v: BajrangBaanVerse, idx) => {
      out.push(
        makeVerseEntry({
          sourceId: entry.id,
          sectionNameHi: entry.nameHi,
          sectionNameEn: entry.nameEn,
          chapter: ch.chapter,
          verseIndex: idx,
          labelHi: v.labelHi,
          labelEn: v.labelEn,
          linesHi: v.lines,
          linesEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
        })
      );
    });
    // One chapter per unit: a whole corpus in one go is a dropped frame.
    yield;
  }
}

function* pushChapteredRamcharitmanas(
  out: SearchVerseEntry[],
  entry: LibraryEntry
) {
  for (const ch of ramcharitmanasChaptersManifest) {
    const chapter = getRamcharitmanasChapter(ch.chapter);
    chapter.verses.forEach((v: RamcharitmanasVerse, idx) => {
      out.push(
        makeVerseEntry({
          sourceId: entry.id,
          sectionNameHi: entry.nameHi,
          sectionNameEn: entry.nameEn,
          chapter: ch.chapter,
          verseIndex: idx,
          labelHi: v.labelHi,
          labelEn: v.labelEn,
          linesHi: v.lines,
          linesEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
        })
      );
    });
    // One chapter per unit: a whole corpus in one go is a dropped frame.
    yield;
  }
}

function pushChapteredValmikiRamayan(out: SearchVerseEntry[], entry: LibraryEntry) {
  // Index the established anchor selection, not all 23k verses. The global
  // index duplicates normalized text in memory; indexing the complete epic
  // would make opening Search load every kāṇḍa and materially regress startup.
  valmikiRamayanDailySelection.forEach((v: ValmikiRamayanVerse) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        chapter: v.kanda,
        verseIndex: v.numInSection - 1,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function pushAarti(out: SearchVerseEntry[], entry: LibraryEntry) {
  const idx = (aartiIdByIndex as readonly string[]).indexOf(entry.id);
  if (idx < 0) return;
  const aarti = aartiCollection[idx];
  if (!aarti) return;
  aarti.verses.forEach((v: AartiVerse, verseIdx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: verseIdx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

const THEERTH_ENTRY_TO_GROUP: Record<string, TheerthGroup | 'all'> = {
  'dvadasha-jyotirlinga': 'jyotirlinga',
  'char-dham': 'char-dham',
  'chota-char-dham': 'chota-char-dham',
  'shakti-peeth': 'shakti-peeth',
  'famous-theerth': 'all',
};

function* pushTheerth(out: SearchVerseEntry[], entry: LibraryEntry) {
  const filter = THEERTH_ENTRY_TO_GROUP[entry.id];
  if (!filter) return;
  // Search is built on demand, so this is a legitimate place to pay for the
  // readings; the browse screens must keep using the row-only `temples`.
  const withDetails = templesWithDetails();
  const list: readonly TempleEntry[] =
    filter === 'all' ? withDetails : withDetails.filter((t) => t.groups.includes(filter));
  // Loading the readings is its own unit; after that, one temple per unit —
  // normalising a full bilingual §12.6 reading is ~1.5 ms a temple, and the
  // full list is 71 of them.
  yield;
  for (const [idx, t] of list.entries()) {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: idx,
        labelHi: t.nameHi,
        labelEn: t.nameEn,
        linesHi: [t.nameHi, `${t.cityHi}, ${t.stateHi}`],
        linesEn: [t.nameEn, `${t.cityEn}, ${t.stateEn}`],
        meaningHi: [t.significanceHi, t.originStoryHi, ...(t.sections ?? []).map((s) => s.bodyHi)].join('\n'),
        meaningEn: [t.significanceEn, t.originStoryEn, ...(t.sections ?? []).map((s) => s.bodyEn)].join('\n'),
      })
    );
    yield;
  }
}

function pushSanskar(out: SearchVerseEntry[], entry: LibraryEntry) {
  if (!(sanskarIds as readonly string[]).includes(entry.id)) return;
  const sanskar = getSanskar(entry.id);
  sanskar.verses.forEach((v, verseIdx) => {
    out.push(
      makeVerseEntry({
        sourceId: entry.id,
        sectionNameHi: entry.nameHi,
        sectionNameEn: entry.nameEn,
        verseIndex: verseIdx,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
        linesHi: v.lines,
        linesEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
      })
    );
  });
}

function pushJapam(out: SearchVerseEntry[], entry: LibraryEntry) {
  const mantra: JapamMantra | undefined = japamMantras.find(
    (m) => m.id === entry.id
  );
  if (!mantra) return;
  out.push(
    makeVerseEntry({
      sourceId: entry.id,
      sectionNameHi: entry.nameHi,
      sectionNameEn: entry.nameEn,
      verseIndex: 0,
      labelHi: 'मंत्र',
      labelEn: 'Mantra',
      linesHi: mantra.lines,
      linesEn: mantra.linesEn,
      meaningHi: mantra.meaningHi,
      meaningEn: mantra.meaningEn,
    })
  );
}

function makeVerseEntry(p: {
  sourceId: string;
  sectionNameHi: string;
  sectionNameEn: string;
  chapter?: number;
  verseIndex: number;
  labelHi: string;
  labelEn: string;
  linesHi: readonly string[];
  linesEn: readonly string[];
  meaningHi: string;
  meaningEn: string;
}): SearchVerseEntry {
  const linesHi = [...p.linesHi];
  const linesEn = [...p.linesEn];
  const fields = [
    p.sectionNameHi,
    p.sectionNameEn,
    p.labelHi,
    p.labelEn,
    ...linesHi,
    ...linesEn,
    p.meaningHi,
    p.meaningEn,
  ];
  const fieldsNorm = fields.map(normalize);
  const id = `verse:${p.sourceId}:${p.chapter ?? '_'}:${p.verseIndex}`;
  return {
    type: 'verse',
    id,
    sourceId: p.sourceId,
    chapter: p.chapter,
    verseIndex: p.verseIndex,
    labelHi: p.labelHi,
    labelEn: p.labelEn,
    firstLineHi: linesHi[0] ?? '',
    firstLineEn: linesEn[0] ?? '',
    sectionNameHi: p.sectionNameHi,
    sectionNameEn: p.sectionNameEn,
    norm: fieldsNorm.join(' '),
    fieldsNorm,
  };
}

/**
 * Run a search against the lazily-built index.
 *
 * Returns hits grouped by type. Verse hits are capped at {@link VERSE_RESULT_CAP}
 * so a long-tail query doesn't render thousands of rows.
 *
 * Pure function — does not touch storage, does not log queries.
 */
export function runSearch(rawQuery: string, index = getSearchIndex()): SearchResults {
  const q = normalize(rawQuery);
  if (!q) {
    return {
      query: '',
      sections: [],
      deities: [],
      verses: [],
      versesCapped: false,
    };
  }

  const sections = scoreList(index.sections, q);
  const deities = scoreList(index.deities, q);
  const versesAll = scoreList(index.verses, q);
  const versesCapped = versesAll.length > VERSE_RESULT_CAP;
  const verses = versesAll.slice(0, VERSE_RESULT_CAP);

  return {
    query: rawQuery,
    sections,
    deities,
    verses,
    versesCapped,
  };
}

function scoreList<E extends SearchEntry>(
  entries: readonly E[],
  q: string
): SearchHit<E>[] {
  const out: SearchHit<E>[] = [];
  for (const entry of entries) {
    const r = rankAny(entry.fieldsNorm, q);
    if (r !== MatchRank.NONE) {
      out.push({ entry, rank: r });
    }
  }
  out.sort((a, b) => a.rank - b.rank);
  return out;
}
