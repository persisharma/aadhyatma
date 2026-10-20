import type { Deity } from '../texts';
import type { JapamMantra } from './index';

/**
 * Stotra paath as japa (design.md §35.1): every text in the स्तोत्रम् category
 * can be counted on the mala, ONE BEAD PER COMPLETE RECITATION. A paath is
 * served as a `JapamMantra` carrying a `paath` block, so the counter, alarms,
 * widgets and activity log key it by id exactly like a mantra.
 *
 * Corpora load through `require()` thunks: `data/japam` sits on the launch
 * graph (texts.ts → japam) and the stotram payloads must not
 * (`launchGraph.test.ts`). Nothing here runs until a paath id is resolved.
 */

export type PaathVerse = { lines: readonly string[]; linesEn: readonly string[] };

export type PaathPart = { titleHi: string; titleEn: string; verses: readonly PaathVerse[] };

export type JapamPaath = {
  /** Library entry the text belongs to (the reader it was started from). */
  sourceId: string;
  /** Set when one chapter of a multi-hymn section is the stotra. */
  chapter?: number;
  verseCount: number;
  /** The full recitation, in order. More than one part only when a stotra spans chapters. */
  parts: readonly PaathPart[];
};

type CorpusVerse = {
  number: number;
  /** Chaptered stotram shape — verse 0 is the title card. */
  sanskrit?: readonly string[];
  /** Bajrang Baan / stuti shape — every verse is recited. */
  lines?: readonly string[];
  linesEn: readonly string[];
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

type PaathSource = {
  sourceId: string;
  deities: Deity[];
  /**
   * `each`: every chapter is a stotra of its own (Shiva Stotram's four hymns).
   * `whole`: the chapters are parts of ONE stotra, recited end to end.
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
 * (`stotramPaath.test.ts` keeps this list and the library in step).
 */
const SOURCES: readonly PaathSource[] = [
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

const PREFIX = 'paath.';

/** Source ids whose readers offer "start as japa". */
export const paathSourceIds: readonly string[] = SOURCES.map((s) => s.sourceId);

/**
 * The paath id a reader opens the counter with — `paath.<sourceId>.<chapter>`
 * for a hymn that is one chapter of its section, `paath.<sourceId>` when the
 * whole section is one stotra. Ids use only URL-safe characters because the
 * widget deep link carries them. Null when the source is not a stotram.
 */
export function stotramPaathId(sourceId: string, chapter?: number): string | null {
  const source = SOURCES.find((s) => s.sourceId === sourceId);
  if (!source) return null;
  if (source.unit === 'whole') return `${PREFIX}${sourceId}`;
  return chapter != null && Number.isInteger(chapter) && chapter >= 1 ? `${PREFIX}${sourceId}.${chapter}` : null;
}

/** Every paath id, in library order (one per hymn). Loads the stotram manifests. */
export function allStotramPaathIds(): string[] {
  return SOURCES.flatMap((s) =>
    s.unit === 'whole'
      ? [`${PREFIX}${s.sourceId}`]
      : s.corpus().chapters.map((c) => `${PREFIX}${s.sourceId}.${c.chapter}`)
  );
}

const isTitleCard = (v: CorpusVerse) => v.number === 0 && v.sanskrit !== undefined;

const cache = new Map<string, JapamMantra>();

function build(id: string, source: PaathSource, chapter: number | undefined): JapamMantra | null {
  const corpus = source.corpus();
  const chapterNos = chapter == null ? corpus.chapters.map((c) => c.chapter) : [chapter];
  if (chapter != null && !corpus.chapters.some((c) => c.chapter === chapter)) return null;
  const loaded = chapterNos.map((n) => corpus.chapter(n));
  const recited = loaded.map((ch) => ch.verses.filter((v) => !isTitleCard(v)));
  const first = recited.flat()[0];
  if (!first) return null;
  const parts: PaathPart[] = loaded.map((ch, i) => ({
    titleHi: ch.titleHi,
    titleEn: ch.titleEn,
    verses: recited[i].map((v) => ({ lines: v.sanskrit ?? v.lines ?? [], linesEn: v.linesEn })),
  }));
  const verseCount = recited.reduce((sum, verses) => sum + verses.length, 0);
  const nameHi = chapter == null ? corpus.titleHi : loaded[0].titleHi;
  const nameEn = chapter == null ? corpus.titleEn : loaded[0].titleEn;
  return {
    id,
    nameHi,
    nameEn,
    sub: `${verseCount} पद · हर मनका एक पाठ`,
    subEn: `${verseCount} verses · one bead per paath`,
    thumb: Array.from(nameHi)[0] ?? 'ॐ',
    deities: source.deities,
    lines: [...(first.sanskrit ?? first.lines ?? [])],
    linesEn: [...first.linesEn],
    meaningHi: first.meaningHi,
    meaningEn: first.meaningEn,
    paath: { sourceId: source.sourceId, ...(chapter == null ? {} : { chapter }), verseCount, parts },
  };
}

/** Resolves a paath id to its counter entry; null for anything else. Memoised, so the identity is stable. */
export function findStotramPaath(id: string): JapamMantra | null {
  if (!id.startsWith(PREFIX)) return null;
  const hit = cache.get(id);
  if (hit) return hit;
  const rest = id.slice(PREFIX.length);
  for (const source of SOURCES) {
    if (source.unit === 'whole' ? rest !== source.sourceId : !rest.startsWith(`${source.sourceId}.`)) continue;
    let chapter: number | undefined;
    if (source.unit === 'each') {
      const tail = rest.slice(source.sourceId.length + 1);
      if (!/^[1-9]\d*$/.test(tail)) return null;
      chapter = Number(tail);
    }
    const mantra = build(id, source, chapter);
    if (mantra) cache.set(id, mantra);
    return mantra;
  }
  return null;
}
