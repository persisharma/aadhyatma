/**
 * On-device search index for the entire Vedansh library (PRD-03).
 *
 * Bundle-only: the index is built at runtime from the same bundled data the
 * readers already load. No network, no external service. Index construction
 * is lazy (first call to {@link getSearchIndex}) so it doesn't impact cold
 * boot.
 *
 * Adding a new section: see RULEBOOK §8. If the section uses the standard
 * `lines`/`linesEn` or `sanskrit`/`linesEn`/`transliteration` field shape it
 * is picked up automatically once added to `library` in `texts.ts`. A section
 * with a novel verse shape needs a new branch in {@link buildVerseEntries}.
 */

import { library, type LibraryEntry } from './texts';
import { deities } from './deities';
import { getChalisa, type ChalisaId } from './chalisaRegistry';
import {
  aartiCollection,
  aartiIdByIndex,
  type AartiVerse,
} from './aarti';
import { japamMantras, type JapamMantra } from './japam';
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
import { getSanskar, sanskarIds } from './sanskar';
import { MatchRank, normalize, rankAny } from './searchNormalize';

const CHALISA_IDS: readonly ChalisaId[] = [
  'hanuman-chalisa',
  'shiv-chalisa',
  'durga-chalisa',
  'ganesh-chalisa',
];

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
 * Build the index lazily on first call; subsequent calls reuse the cached
 * instance. The build is synchronous so callers don't have to thread async
 * through the search screen.
 */
export function getSearchIndex(): SearchIndex {
  if (cached) return cached;
  cached = build();
  return cached;
}

/**
 * Reset the cache. Exposed for tests; production code should not call this.
 * Index construction is deterministic from bundled data, so there is no
 * correctness reason to invalidate at runtime.
 */
export function _resetSearchIndexForTest(): void {
  cached = null;
}

function build(): SearchIndex {
  return {
    sections: buildSectionEntries(),
    deities: buildDeityEntries(),
    verses: buildVerseEntries(),
  };
}

function buildSectionEntries(): readonly SearchSectionEntry[] {
  return library.map((entry) => sectionEntry(entry));
}

function sectionEntry(entry: LibraryEntry): SearchSectionEntry {
  const fields = [
    entry.nameHi,
    entry.nameEn,
    entry.sub,
    entry.thumb,
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

function buildVerseEntries(): readonly SearchVerseEntry[] {
  const verses: SearchVerseEntry[] = [];

  for (const entry of library) {
    if (entry.hidden) continue;
    if (entry.status !== 'active') continue;

    if (CHALISA_IDS.includes(entry.id as ChalisaId)) {
      pushChalisaVerses(verses, entry);
      continue;
    }

    if (entry.id === 'bhagavad-gita') {
      pushChapteredGita(verses, entry);
      continue;
    }

    if (entry.id === 'sundarkand') {
      pushChapteredSundarkand(verses, entry);
      continue;
    }

    if (entry.id === 'shiva-strotam') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        shivaStrotamChaptersManifest,
        getShivaStrotamChapter
      );
      continue;
    }

    if (entry.id === 'durga-stotram') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        durgaStotramChaptersManifest,
        getDurgaStotramChapter
      );
      continue;
    }

    if (entry.id === 'saraswati-stotram') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        saraswatiStotramChaptersManifest,
        getSaraswatiStotramChapter
      );
      continue;
    }

    if (entry.id === 'ganesh-stotram') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        ganeshStotramChaptersManifest,
        getGaneshStotramChapter
      );
      continue;
    }

    if (entry.id === 'vishnu-sahasranama') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        vishnuSahasranamaChaptersManifest,
        getVishnuSahasranamaChapter
      );
      continue;
    }

    if (entry.id === 'hanuman-ashtak') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        hanumanAshtakChaptersManifest,
        getHanumanAshtakChapter
      );
      continue;
    }

    if (entry.id === 'bajrang-baan') {
      pushChapteredBajrangBaan(verses, entry);
      continue;
    }

    if (entry.id === 'ram-stuti') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        ramStutiChaptersManifest,
        getRamStutiChapter
      );
      continue;
    }

    if (entry.id === 'krishna-stotram') {
      pushChapteredShivaStrotamShape(
        verses,
        entry,
        krishnaStotramChaptersManifest,
        getKrishnaStotramChapter
      );
      continue;
    }

    if (entry.id === 'ramcharitmanas') {
      pushChapteredRamcharitmanas(verses, entry);
      continue;
    }

    if (entry.category === 'aarti') {
      pushAarti(verses, entry);
      continue;
    }

    if (entry.category === 'sanskar') {
      pushSanskar(verses, entry);
      continue;
    }

    if (entry.category === 'japam') {
      pushJapam(verses, entry);
      continue;
    }

    // Unknown section shape — silently skip rather than crash. Caught by the
    // section-coverage test in __tests__/searchIndex.test.ts.
  }

  return verses;
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

function pushChapteredGita(out: SearchVerseEntry[], entry: LibraryEntry) {
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
  }
}

function pushChapteredSundarkand(out: SearchVerseEntry[], entry: LibraryEntry) {
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
  }
}

type ChapterSummaryLike = { chapter: number };
type ChapteredShivaStrotamLike = {
  verses: readonly ShivaStrotamVerse[];
};

function pushChapteredShivaStrotamShape(
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
  }
}

function pushChapteredBajrangBaan(out: SearchVerseEntry[], entry: LibraryEntry) {
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
  }
}

function pushChapteredRamcharitmanas(
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
  }
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
