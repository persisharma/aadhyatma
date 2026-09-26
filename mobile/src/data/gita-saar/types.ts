/**
 * गीता सार — the content shapes of the themed Gita compilations (RULEBOOK §29).
 *
 * A saar theme is a READING ORDER over the bundled Bhagavad Gītā plus a
 * plain-language sense line per verse. It never re-types scripture: every
 * verse is a `GitaSaarRef` into `data/gita/`, and the loader (`index.ts`)
 * pulls the Sanskrit and transliteration from the corpus at open time (the
 * §28.2 / PRD-26 `gitaRef` precedent). What this layer authors is the
 * *selection*, the *grouping* and the *saar* — the one-line essence in simple
 * words — which is why it can carry a meaning of its own beside the corpus
 * meaning: the Gita reader keeps the full bhāvārtha and commentary; this
 * reader keeps the thread.
 */

export type GitaSaarContentStatus = 'draft' | 'verified';

export type GitaSaarSource = {
  /**
   * ≥2 references for a verified theme. The bundled corpus counts as one
   * (named by path); a published external source counts as another.
   * Review-only — never rendered.
   */
  referenceUrls: readonly string[];
  /** Dated adjudication note (ISO date + what was checked). */
  verificationNote: string;
};

/** A pointer into the bundled Gita — `chapter` and `verse` as printed (1-based). */
export type GitaSaarRef = { chapter: number; verse: number };

export type GitaSaarVerseEntry = {
  ref: GitaSaarRef;
  /** The one idea this verse carries in the theme — rendered as a tag line. */
  themeHi: string;
  themeEn: string;
  /** The saar: the verse's sense in simple language, one or two sentences. */
  saarHi: string;
  saarEn: string;
};

/** A titled run of verses inside a theme — the reading order's sections. */
export type GitaSaarGroup = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** One line under the group title saying why these verses sit together. */
  introHi: string;
  introEn: string;
  verses: readonly GitaSaarVerseEntry[];
};

export type GitaSaarTheme = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** The theme's opening line — what the reader is about to trace. */
  ledeHi: string;
  ledeEn: string;
  groups: readonly GitaSaarGroup[];
  /** The one-line essence rendered on the theme's last page. */
  closingHi: string;
  closingEn: string;
  status: GitaSaarContentStatus;
  source: GitaSaarSource;
};
