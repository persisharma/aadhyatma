import type { Deity } from '../texts';
import type { JapamMantra } from './index';

/**
 * Sloka japa (design.md §35.1): any shloka of a स्तोत्रम्-category text can be
 * chanted on the mala exactly like a mantra — the reader's जप pill hands the
 * shloka on screen to the counter, one bead per recitation of that shloka.
 * A sloka is served as a `JapamMantra` carrying a `sloka` block, so the
 * counter, alarms, widgets and activity log key it by id like any mantra.
 *
 * Corpora load through `require()` thunks: `data/japam` sits on the launch
 * graph (texts.ts → japam) and the stotram payloads must not
 * (`launchGraph.test.ts`). Nothing here runs until a sloka id is resolved.
 */

export type JapamSloka = {
  /** Library entry the shloka belongs to (the reader it was started from). */
  sourceId: string;
  chapter: number;
  /** The verse's own `number` in its chapter — stable across content edits, unlike its index. */
  number: number;
};

type CorpusVerse = {
  number: number;
  /** Chaptered stotram shape — verse 0 is the title card. */
  sanskrit?: readonly string[];
  /** Bajrang Baan / stuti shape — every verse is recited. */
  lines?: readonly string[];
  linesEn: readonly string[];
  labelHi?: string;
  labelEn?: string;
  meaningHi: string;
  meaningEn: string;
};

type CorpusChapter = { titleHi: string; titleEn: string; verses: readonly CorpusVerse[] };

type Corpus = {
  titleHi: string;
  titleEn: string;
  chapters: readonly { chapter: number }[];
  chapter: (n: number) => CorpusChapter;
};

type SlokaSource = {
  sourceId: string;
  deities: Deity[];
  /**
   * Names the hymn a shloka belongs to. `each`: every chapter is a stotra of
   * its own (Shiva Stotram's four hymns) — the chapter title. `whole`: the
   * section is one stotra — its title (plus the part, when it spans chapters).
   */
  unit: 'each' | 'whole';
  corpus: () => Corpus;
};

/* eslint-disable @typescript-eslint/no-require-imports */
function stuti(id: string): () => Corpus {
  return () => {
    const s = (require('../stuti') as typeof import('../stuti')).getStuti(id);
    return { titleHi: s.titleHi, titleEn: s.titleEn, chapters: [{ chapter: 1 }], chapter: () => s };
  };
}

/**
 * Every `category: 'stotram'` library entry, in library order
 * (`slokaJapa.test.ts` keeps this list and the library in step).
 */
const SOURCES: readonly SlokaSource[] = [
  {
    sourceId: 'shiva-strotam',
    deities: ['shiva'],
    unit: 'each',
    corpus: () => {
      const m = require('../shiva-strotam') as typeof import('../shiva-strotam');
      return { titleHi: m.shivaStrotamTitleHi, titleEn: m.shivaStrotamTitleEn, chapters: m.shivaStrotamChaptersManifest, chapter: m.getShivaStrotamChapter };
    },
  },
  {
    sourceId: 'durga-stotram',
    deities: ['durga'],
    unit: 'each',
    corpus: () => {
      const m = require('../durga-stotram') as typeof import('../durga-stotram');
      return { titleHi: m.durgaStotramTitleHi, titleEn: m.durgaStotramTitleEn, chapters: m.durgaStotramChaptersManifest, chapter: m.getDurgaStotramChapter };
    },
  },
  {
    sourceId: 'saraswati-stotram',
    deities: ['saraswati'],
    unit: 'each',
    corpus: () => {
      const m = require('../saraswati-stotram') as typeof import('../saraswati-stotram');
      return { titleHi: m.saraswatiStotramTitleHi, titleEn: m.saraswatiStotramTitleEn, chapters: m.saraswatiStotramChaptersManifest, chapter: m.getSaraswatiStotramChapter };
    },
  },
  {
    sourceId: 'ganesh-stotram',
    deities: ['ganesha'],
    unit: 'each',
    corpus: () => {
      const m = require('../ganesh-stotram') as typeof import('../ganesh-stotram');
      return { titleHi: m.ganeshStotramTitleHi, titleEn: m.ganeshStotramTitleEn, chapters: m.ganeshStotramChaptersManifest, chapter: m.getGaneshStotramChapter };
    },
  },
  {
    sourceId: 'vishnu-sahasranama',
    deities: ['vishnu'],
    unit: 'whole',
    corpus: () => {
      const m = require('../vishnu-sahasranama') as typeof import('../vishnu-sahasranama');
      return { titleHi: m.vishnuSahasranamaTitleHi, titleEn: m.vishnuSahasranamaTitleEn, chapters: m.vishnuSahasranamaChaptersManifest, chapter: m.getVishnuSahasranamaChapter };
    },
  },
  {
    sourceId: 'krishna-stotram',
    deities: ['krishna'],
    unit: 'each',
    corpus: () => {
      const m = require('../krishna-stotram') as typeof import('../krishna-stotram');
      return { titleHi: m.krishnaStotramTitleHi, titleEn: m.krishnaStotramTitleEn, chapters: m.krishnaStotramChaptersManifest, chapter: m.getKrishnaStotramChapter };
    },
  },
  {
    sourceId: 'bajrang-baan',
    deities: ['hanuman'],
    unit: 'whole',
    corpus: () => {
      const m = require('../bajrang-baan') as typeof import('../bajrang-baan');
      return { titleHi: m.bajrangBaanTitleHi, titleEn: m.bajrangBaanTitleEn, chapters: m.bajrangBaanChaptersManifest, chapter: m.getBajrangBaanChapter };
    },
  },
  {
    sourceId: 'ram-stuti',
    deities: ['rama'],
    unit: 'whole',
    corpus: () => {
      const m = require('../ram-stuti') as typeof import('../ram-stuti');
      return { titleHi: m.ramStutiTitleHi, titleEn: m.ramStutiTitleEn, chapters: m.ramStutiChaptersManifest, chapter: m.getRamStutiChapter };
    },
  },
  { sourceId: 'krishna-stuti', deities: ['krishna'], unit: 'whole', corpus: stuti('krishna-stuti') },
  { sourceId: 'durga-stuti-arjuna', deities: ['durga'], unit: 'whole', corpus: stuti('durga-stuti-arjuna') },
  { sourceId: 'kubera-stotram', deities: ['kubera'], unit: 'whole', corpus: stuti('kubera-stotram') },
  { sourceId: 'navagraha-stotram', deities: ['navagraha'], unit: 'whole', corpus: stuti('navagraha-stotram') },
];
/* eslint-enable @typescript-eslint/no-require-imports */

const PREFIX = 'sloka.';

/** Source ids whose readers offer "start as japa". */
export const slokaJapaSourceIds: readonly string[] = SOURCES.map((s) => s.sourceId);

export function isSlokaJapaSource(sourceId: string): boolean {
  return SOURCES.some((s) => s.sourceId === sourceId);
}

const isTitleCard = (v: CorpusVerse) => v.number === 0 && v.sanskrit !== undefined;

/**
 * The sloka id for the reader page at `verseIndex` of `chapter` —
 * `sloka.<sourceId>.<chapter>.<number>`. A chapter's title card is not a
 * shloka, so it resolves to the chapter's first recited one. URL-safe because
 * the widget deep link carries it. Null when the source is not a stotram.
 */
export function slokaJapaId(sourceId: string, chapter: number, verseIndex: number): string | null {
  const source = SOURCES.find((s) => s.sourceId === sourceId);
  if (!source) return null;
  const verses = source.corpus().chapter(chapter).verses;
  const at = verses[Math.max(0, Math.min(verses.length - 1, verseIndex))];
  const verse = at && !isTitleCard(at) ? at : verses.find((v) => !isTitleCard(v));
  return verse ? `${PREFIX}${sourceId}.${chapter}.${verse.number}` : null;
}

/** Every sloka id, in library order. Loads every stotram chapter — tests only. */
export function allSlokaJapaIds(): string[] {
  return SOURCES.flatMap((s) => {
    const corpus = s.corpus();
    return corpus.chapters.flatMap((c) =>
      corpus
        .chapter(c.chapter)
        .verses.filter((v) => !isTitleCard(v))
        .map((v) => `${PREFIX}${s.sourceId}.${c.chapter}.${v.number}`)
    );
  });
}

const cache = new Map<string, JapamMantra>();

function build(id: string, source: SlokaSource, chapterNo: number, number: number): JapamMantra | null {
  const corpus = source.corpus();
  if (!corpus.chapters.some((c) => c.chapter === chapterNo)) return null;
  const chapter = corpus.chapter(chapterNo);
  const verse = chapter.verses.find((v) => v.number === number && !isTitleCard(v));
  if (!verse) return null;
  const spansChapters = corpus.chapters.length > 1;
  const hymnHi = source.unit === 'each' ? chapter.titleHi : spansChapters ? `${corpus.titleHi} · ${chapter.titleHi}` : corpus.titleHi;
  const hymnEn = source.unit === 'each' ? chapter.titleEn : spansChapters ? `${corpus.titleEn} · ${chapter.titleEn}` : corpus.titleEn;
  const nameHi = `${hymnHi} · ${verse.labelHi ?? `श्लोक ${number}`}`;
  const nameEn = `${hymnEn} · ${verse.labelEn ?? `Shloka ${number}`}`;
  return {
    id,
    nameHi,
    nameEn,
    sub: 'श्लोक जप',
    subEn: 'Shloka japa',
    thumb: Array.from(hymnHi)[0] ?? 'ॐ',
    deities: source.deities,
    lines: [...(verse.sanskrit ?? verse.lines ?? [])],
    linesEn: [...verse.linesEn],
    meaningHi: verse.meaningHi,
    meaningEn: verse.meaningEn,
    sloka: { sourceId: source.sourceId, chapter: chapterNo, number },
  };
}

/** Resolves a sloka id to its counter entry; null for anything else. Memoised, so the identity is stable. */
export function findSlokaJapa(id: string): JapamMantra | null {
  if (!id.startsWith(PREFIX)) return null;
  const hit = cache.get(id);
  if (hit) return hit;
  const rest = id.slice(PREFIX.length);
  for (const source of SOURCES) {
    if (!rest.startsWith(`${source.sourceId}.`)) continue;
    const match = /^([1-9]\d*)\.(0|[1-9]\d*)$/.exec(rest.slice(source.sourceId.length + 1));
    if (!match) return null;
    const mantra = build(id, source, Number(match[1]), Number(match[2]));
    if (mantra) cache.set(id, mantra);
    return mantra;
  }
  return null;
}
