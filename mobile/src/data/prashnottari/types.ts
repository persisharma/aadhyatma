/**
 * बाल प्रश्नोत्तरी व गीता परीक्षा — the question book's content shapes (PRD-46).
 *
 * Every question is authored FROM content the app already ships and is
 * anchored to it: `ref` points at the exact Gita verse, comic panel or story
 * page the answer comes from, and `evidence` quotes that content verbatim in
 * both languages. `prashnottariContent.test.ts` opens the corpus at every ref
 * and fails if either quote is not a substring of the shipped text, so a
 * question can never drift from — or invent beyond — the text it cites.
 *
 * Scripture is pointed at, never re-typed: prompts, options and reveals carry
 * no Sanskrit verse text. A screen shows the verse itself by resolving `ref`
 * against the corpus at open time (the gita-saar precedent).
 */

export type PrashnaContentStatus = 'draft' | 'verified';

/** Authored question text. gu/kn readers get the hi line through the app's runtime Devanagari transliteration. */
export type Bilingual = { hi: string; en: string };

export type PrashnaRef =
  /** A whole Gita chapter — for its title. Evidence must quote `titleHi`/`titleEn`. */
  | { kind: 'gitaChapter'; chapter: number }
  /** A Gita verse as printed (1-based). Evidence: `meaningHi` (or the Sanskrit lines) / `meaningEn`. */
  | { kind: 'gitaVerse'; chapter: number; verse: number }
  /** A comic panel. Evidence: the panel's `narration` or `dialogue` in that language. */
  | { kind: 'comicPanel'; comicId: 'balakanda-v1'; episodeId: string; panelId: string }
  /** An illustrated kids-story page. Evidence: the page's `text` in that language. */
  | { kind: 'storyPage'; storyId: string; pageId: string };

/**
 * The exam tradition's paper sections. Practice packs over stories use `katha`.
 * - shlokarth: what a verse says
 * - prasang: context — who speaks, which chapter, what it is called
 * - siddhant: the teaching a verse carries
 */
export type PrashnaSection = 'shlokarth' | 'prasang' | 'siddhant' | 'katha';

/** A pack label, never a property of a child. */
export type PrashnaBand = '5-8' | '8-12';

export type Prashna = {
  /** Stable forever: answered-ids and paper draws key on it. */
  id: string;
  section: PrashnaSection;
  band: PrashnaBand;
  prompt: Bilingual;
  /** Exactly three options; exactly one is correct. */
  options: readonly [Bilingual, Bilingual, Bilingual];
  answer: 0 | 1 | 2;
  ref: PrashnaRef;
  /** Verbatim quotes of the shipped content at `ref` — shown on the reveal, checked in CI. */
  evidence: Bilingual;
  /** One or two plain lines: what the source says and why it matters. Never a verdict on the child. */
  reveal: Bilingual;
};

export type PrashnaPackKind = 'abhyas' | 'pariksha-bank';

export type PrashnaPack = {
  id: string;
  kind: PrashnaPackKind;
  title: Bilingual;
  /** One line for the §82 ListingCard. */
  description: Bilingual;
  band: PrashnaBand;
  /**
   * `verified` packs reach screens; `draft` packs stay dark. A draft carries a
   * `reviewNote` that begins `DRAFT — NOT VERIFIED`.
   */
  status: PrashnaContentStatus;
  reviewNote?: string;
  /** The reading unit this pack companions — drives the post-reader invite and the shelf cover. */
  tracks:
    | { kind: 'comic'; comicId: 'balakanda-v1'; episodeIds: readonly string[] }
    | { kind: 'story'; storyId: string }
    | { kind: 'gita'; chapters: readonly number[] };
  questions: readonly Prashna[];
};

/** One rung of the गीता परीक्षा ladder. Levels open in succession. */
export type GitaParikshaLevel = {
  level: number;
  title: Bilingual;
  /**
   * Declared before enrolling. Placeholder until the peeth's published
   * syllabus is transcribed (PRD-46 §10).
   */
  syllabusChapters: readonly number[];
  syllabusStatus: 'placeholder' | 'transcribed';
  paperSize: number;
  /** Shown as elapsed time only — never enforced. */
  durationMin: number;
  bankPackId: string;
};

export type ParikshaGrade = 'vishesh' | 'pratham' | 'uttirn' | 'prayas';
