import { library } from './texts';
import { getGitaChapter, gitaChaptersManifest } from './gita';
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
import { japamMantras } from './japam';
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
 *   `labelHi` / `labelEn` (Sundarkand, Bajrang Baan, Ramcharitmanas).
 * - **Japam**: one mantra per entry, no chapter.
 * - **Sanskar**: a flat verse list per ritual, no chapter; the first `intro`
 *   verse is a section descriptor and is excluded from the random pool.
 *
 * Each new section must be registered below — membership is explicit rather
 * than inferred from a category, so the pool only surfaces content with a
 * mapping that produces a well-formed verse + meaning.
 */
type ChapterSummary = { chapter: number };

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

function buildPool(): UniformVerse[] {
  const pool: UniformVerse[] = [];
  const entryById = new Map(library.map((e) => [e.id, e]));
  const isActive = (id: string) => entryById.get(id)?.status === 'active';
  const nameHi = (id: string, fallback?: string) => entryById.get(id)?.nameHi ?? fallback ?? id;
  const nameEn = (id: string, fallback?: string) => entryById.get(id)?.nameEn ?? fallback ?? id;

  // Bhagavad Gita — Sanskrit + transliteration.
  if (isActive(GITA_ID)) {
    for (const ch of gitaChaptersManifest) {
      const chapter = getGitaChapter(ch.chapter);
      chapter.verses.forEach((v, idx) => {
        pool.push({
          sourceId: GITA_ID,
          sourceNameHi: nameHi(GITA_ID),
          sourceNameEn: nameEn(GITA_ID),
          chapter: ch.chapter,
          verseIndex: idx,
          textHi: v.sanskrit,
          textEn: v.transliteration,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
          labelHi: `श्लोक ${ch.chapter}.${v.number}`,
          labelEn: `Shloka ${ch.chapter}.${v.number}`,
        });
      });
    }
  }

  // Chaptered shloka stotrams.
  for (const src of SHLOKA_SOURCES) {
    if (!isActive(src.id)) continue;
    for (const ch of src.manifest) {
      const chapter = src.getChapter(ch.chapter);
      chapter.verses.forEach((v, idx) => {
        pool.push({
          sourceId: src.id,
          sourceNameHi: nameHi(src.id),
          sourceNameEn: nameEn(src.id),
          chapter: ch.chapter,
          verseIndex: idx,
          textHi: v.sanskrit,
          textEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
          labelHi: `श्लोक ${ch.chapter}.${v.number}`,
          labelEn: `Shloka ${ch.chapter}.${v.number}`,
        });
      });
    }
  }

  // Chaptered pada sources (own labels).
  for (const src of PADA_SOURCES) {
    if (!isActive(src.id)) continue;
    for (const ch of src.manifest) {
      const chapter = src.getChapter(ch.chapter);
      chapter.verses.forEach((v, idx) => {
        pool.push({
          sourceId: src.id,
          sourceNameHi: nameHi(src.id),
          sourceNameEn: nameEn(src.id),
          chapter: ch.chapter,
          verseIndex: idx,
          textHi: v.lines,
          textEn: v.linesEn,
          meaningHi: v.meaningHi,
          meaningEn: v.meaningEn,
          labelHi: v.labelHi,
          labelEn: v.labelEn,
        });
      });
    }
  }

  // Japam — one mantra per entry, no chapter.
  for (const m of japamMantras) {
    if (!isActive(m.id)) continue;
    pool.push({
      sourceId: m.id,
      sourceNameHi: m.nameHi,
      sourceNameEn: m.nameEn,
      verseIndex: 0,
      textHi: m.lines,
      textEn: m.linesEn,
      meaningHi: m.meaningHi,
      meaningEn: m.meaningEn,
      labelHi: 'मंत्र',
      labelEn: 'Mantra',
    });
  }

  // Sanskar — flat verse list, no chapter. `verseIndex` is the index into the
  // full verses array so it matches the reader's bookmark/progress identity;
  // the leading `intro` descriptor is skipped.
  for (const id of sanskarIds) {
    if (!isActive(id)) continue;
    const data = getSanskar(id);
    data.verses.forEach((v, idx) => {
      if (v.type === 'intro') return;
      pool.push({
        sourceId: id,
        sourceNameHi: nameHi(id, data.titleHi),
        sourceNameEn: nameEn(id, data.titleEn),
        verseIndex: idx,
        textHi: v.lines,
        textEn: v.linesEn,
        meaningHi: v.meaningHi,
        meaningEn: v.meaningEn,
        labelHi: v.labelHi,
        labelEn: v.labelEn,
      });
    });
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
  const pool = getVersePool();
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? null;
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
  const pool = getVersePool();
  return (
    pool.find(
      (v) =>
        v.sourceId === sourceId &&
        v.verseIndex === verseIndex &&
        (v.chapter ?? null) === (chapter ?? null)
    ) ?? null
  );
}
