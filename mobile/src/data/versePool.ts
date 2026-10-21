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
import { valmikiRamayanDailySelection } from './valmiki-ramayan';
import { japamMantras } from './japam';
import { GRAHA_BEEJ_JAPA_ID } from './japam/grahaBeej';
import { sanskarIds, getSanskar } from './sanskar';
import { aartiIdByIndex } from './aarti/ids';
import * as verseCounts from './verseCounts';

const grahaBeejJapaIds: ReadonlySet<string> = new Set(Object.values(GRAHA_BEEJ_JAPA_ID));

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
 * - **Japam**: one mantra per entry, no chapter.
 * - **Sanskar**: a flat verse list per ritual, no chapter; the first `intro`
 *   verse is a section descriptor and is excluded from the random pool.
 * - **Flat** sources: one verse list per text, no chapter (chalisas, aartis,
 *   ashtakams, suktams, kavachs, stutis). Counts come from `verseCounts.ts`
 *   and the payload loads through a `require()` thunk on first pick, so none
 *   of these corpora sit on the launch path.
 *
 * Deliberately left out: Garud Puran (rites after death — not a morning
 * devotional card), Gita Saar (re-presents Gita verses already pooled) and
 * `ram-aarti` (reuses the Ram Stuti content already pooled).
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

type FlatVerse = {
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};
type FlatSource = {
  id: string;
  length: number;
  load: () => readonly FlatVerse[];
};

const chalisa = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./chalisaRegistry') as typeof import('./chalisaRegistry')).getChalisa(id).verses,
});
const ashtakam = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./ashtakam') as typeof import('./ashtakam')).getAshtakam(id).verses,
});
const suktam = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./suktam') as typeof import('./suktam')).getSuktam(id).verses,
});
const kavacham = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./kavacham') as typeof import('./kavacham')).getKavacham(id).verses,
});
const stuti = (id: string, length: number): FlatSource => ({
  id,
  length,
  load: () => (require('./stuti') as typeof import('./stuti')).getStuti(id).verses,
});

const FLAT_SOURCES: readonly FlatSource[] = [
  chalisa('hanuman-chalisa', verseCounts.hanumanChalisaTotal),
  chalisa('shiv-chalisa', verseCounts.shivChalisaCounts.totalVerses),
  chalisa('durga-chalisa', verseCounts.durgaChalisaCounts.totalVerses),
  chalisa('ganesh-chalisa', verseCounts.ganeshChalisaCounts.totalVerses),
  chalisa('gayatri-chalisa', verseCounts.gayatriChalisaCounts.totalVerses),
  chalisa('ram-chalisa', verseCounts.ramChalisaCounts.totalVerses),
  chalisa('krishna-chalisa', verseCounts.krishnaChalisaCounts.totalVerses),
  chalisa('vishnu-chalisa', verseCounts.vishnuChalisaCounts.totalVerses),
  chalisa('saraswati-chalisa', verseCounts.saraswatiChalisaCounts.totalVerses),
  chalisa('khatu-shyam-chalisa', verseCounts.khatuShyamChalisaCounts.totalVerses),
  chalisa('lakshmi-chalisa', verseCounts.lakshmiChalisaCounts.totalVerses),
  chalisa('surya-chalisa', verseCounts.suryaChalisaCounts.totalVerses),
  ...aartiIdByIndex.map((id, index): FlatSource => ({
    id,
    length: verseCounts.aartiVerseCounts[id],
    load: () => (require('./aarti') as typeof import('./aarti')).getAarti(index).verses,
  })),
  ashtakam('lingashtakam', verseCounts.lingashtakamTotal),
  ashtakam('madhurashtakam', verseCounts.madhurashtakamTotal),
  ashtakam('achyutashtakam', verseCounts.achyutashtakamTotal),
  ashtakam('mahalakshmi-ashtakam', verseCounts.mahalakshmiAshtakamTotal),
  ashtakam('surya-ashtakam', verseCounts.suryaAshtakamTotal),
  ashtakam('radhashtakam', verseCounts.radhashtakamTotal),
  ashtakam('subrahmanya-ashtakam', verseCounts.subrahmanyaAshtakamTotal),
  ashtakam('gangashtakam', verseCounts.gangashtakamTotal),
  ashtakam('bhavani-ashtakam', verseCounts.bhavaniAshtakamTotal),
  ashtakam('narasimha-ashtakam', verseCounts.narasimhaAshtakamTotal),
  ashtakam('datta-ashtakam', verseCounts.dattaAshtakamTotal),
  ashtakam('shani-ashtakam', verseCounts.shaniAshtakamTotal),
  ashtakam('kalika-ashtakam', verseCounts.kalikaAshtakamTotal),
  ashtakam('rudrashtakam', verseCounts.rudrashtakamTotal),
  suktam('devi-suktam', verseCounts.deviSuktamTotal),
  suktam('purusha-suktam', verseCounts.purushaSuktamTotal),
  suktam('narayana-suktam', verseCounts.narayanaSuktamTotal),
  kavacham('rama-raksha-stotra', verseCounts.ramaRakshaStotraTotal),
  kavacham('ganesha-kavacham', verseCounts.ganeshaKavachamTotal),
  kavacham('shiva-kavacham', verseCounts.shivaKavachamTotal),
  kavacham('durga-kavach', verseCounts.durgaKavachTotal),
  stuti('krishna-stuti', verseCounts.krishnaStutiTotal),
  stuti('durga-stuti-arjuna', verseCounts.durgaStutiArjunaTotal),
  stuti('kubera-stotram', verseCounts.kuberaStotramTotal),
  stuti('navagraha-stotram', verseCounts.navagrahaStotramTotal),
];

type PoolSegment = {
  sourceId: string;
  length: number;
  lastPositions: readonly { chapter: number; verseIndex: number }[];
  getAt: (offset: number) => UniformVerse | null;
  find: (verseIndex: number, chapter?: number) => UniformVerse | null;
};

const entryById = new Map(library.map((entry) => [entry.id, entry]));
const isActive = (id: string) => entryById.get(id)?.status === 'active';
const nameHi = (id: string, fallback?: string) => entryById.get(id)?.nameHi ?? fallback ?? id;
const nameEn = (id: string, fallback?: string) => entryById.get(id)?.nameEn ?? fallback ?? id;

function gitaVerse(chapterNumber: number, verseIndex: number): UniformVerse | null {
  const verse = getGitaChapter(chapterNumber).verses[verseIndex];
  if (!verse) return null;
  return {
    sourceId: GITA_ID,
    sourceNameHi: nameHi(GITA_ID),
    sourceNameEn: nameEn(GITA_ID),
    chapter: chapterNumber,
    verseIndex,
    textHi: verse.sanskrit,
    textEn: verse.transliteration,
    meaningHi: verse.meaningHi,
    meaningEn: verse.meaningEn,
    labelHi: `श्लोक ${chapterNumber}.${verse.number}`,
    labelEn: `Shloka ${chapterNumber}.${verse.number}`,
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
        getAt: (offset) => gitaVerse(chapter.chapter, offset),
        find: (verseIndex, requestedChapter) =>
          requestedChapter === chapter.chapter ? gitaVerse(chapter.chapter, verseIndex) : null,
      });
    }
  }

  for (const src of SHLOKA_SOURCES) {
    if (!isActive(src.id)) continue;
    for (const chapter of src.manifest) {
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

  // Japam entries and Sanskar projections are already small launch-path data.
  for (const mantra of japamMantras) {
    if (!isActive(mantra.id)) continue;
    // A naam-japa line is a single name, not a verse to surface on its own.
    if (mantra.naam) continue;
    // A graha beej mantra is Kundali upaya (RULEBOOK §14.3.5): it stays on the
    // surfaces the person opened, never pushed as a verse of the day.
    if (grahaBeejJapaIds.has(mantra.id)) continue;
    const getAt = (offset: number): UniformVerse | null =>
      offset === 0
        ? {
            sourceId: mantra.id,
            sourceNameHi: mantra.nameHi,
            sourceNameEn: mantra.nameEn,
            verseIndex: 0,
            textHi: mantra.lines,
            textEn: mantra.linesEn,
            meaningHi: mantra.meaningHi,
            meaningEn: mantra.meaningEn,
            labelHi: 'मंत्र',
            labelEn: 'Mantra',
          }
        : null;
    segments.push({
      sourceId: mantra.id,
      length: 1,
      lastPositions: [{ chapter: 1, verseIndex: 0 }],
      getAt,
      find: (verseIndex, chapter) => chapter == null && verseIndex === 0 ? getAt(0) : null,
    });
  }

  for (const id of sanskarIds) {
    if (!isActive(id)) continue;
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
  for (const src of FLAT_SOURCES) {
    if (!isActive(src.id)) continue;
    const getAt = (offset: number): UniformVerse | null => {
      const verse = src.load()[offset];
      if (!verse) return null;
      return {
        sourceId: src.id,
        sourceNameHi: nameHi(src.id),
        sourceNameEn: nameEn(src.id),
        verseIndex: offset,
        textHi: verse.lines,
        textEn: verse.linesEn,
        meaningHi: verse.meaningHi,
        meaningEn: verse.meaningEn,
        labelHi: verse.labelHi,
        labelEn: verse.labelEn,
      };
    };
    segments.push({
      sourceId: src.id,
      length: src.length,
      lastPositions: [{ chapter: 1, verseIndex: src.length - 1 }],
      getAt,
      find: (verseIndex, chapter) => (chapter == null ? getAt(verseIndex) : null),
    });
  }

  return segments;
}

const poolSegments = buildPoolSegments();
const poolSize = poolSegments.reduce((total, segment) => total + segment.length, 0);

export type VersePoolLastPositions = {
  chapters: Record<number, number>;
  lastChapter: number;
};

/** Completion boundaries derived from manifests, without loading verse data. */
export function getVersePoolLastPositions(): Record<string, VersePoolLastPositions> {
  const positions: Record<string, VersePoolLastPositions> = {};
  for (const segment of poolSegments) {
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
  return poolSize;
}

export function getVerseAtPoolIndex(index: number): UniformVerse | null {
  if (!Number.isInteger(index) || index < 0 || index >= poolSize) return null;
  let offset = index;
  for (const segment of poolSegments) {
    if (offset < segment.length) return segment.getAt(offset);
    offset -= segment.length;
  }
  return null;
}

function buildPool(): UniformVerse[] {
  const pool: UniformVerse[] = [];
  for (let index = 0; index < poolSize; index += 1) {
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
  if (poolSize === 0) return null;
  return getVerseAtPoolIndex(Math.floor(Math.random() * poolSize));
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
  for (const segment of poolSegments) {
    if (segment.sourceId !== sourceId) continue;
    const verse = segment.find(verseIndex, chapter);
    if (verse) return verse;
  }
  return null;
}
