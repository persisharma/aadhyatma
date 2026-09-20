/**
 * पितृ पक्ष परिचय — the education layer's content shapes (PRD-44, RULEBOOK §28).
 *
 * Same registry discipline as vidhi (§19), bhog (§21) and daan (§27): bilingual
 * Hi/En parallel fields, a review-only `source` block that is never rendered,
 * and draft rows invisible behind verified-only accessors. What this layer
 * adds to the shipped Pitru Smaran ledger + tila-tarpana guide is the *why*
 * and the *what* — it never adds liturgy: no mantra, no formula, no
 * prescription. Scripture is deep-linked into the bundled readers, never
 * re-typed here (the PRD-26 `gitaRef` precedent).
 */

export type PitruContentStatus = 'draft' | 'verified';

export type PitruSource = {
  /**
   * ≥2 references for a verified row. Shipped in-repo verified content counts
   * as one (named by path); an external published domain counts as another.
   * Review-only — never rendered.
   */
  referenceUrls: readonly string[];
  /** Dated adjudication note (ISO date + what was checked). */
  verificationNote: string;
};

/**
 * Where a lesson sits on the परिचय screen. `parichay` = the concept lessons
 * (what / why / when); `tithi` = one row per day of the fortnight; `shabd` =
 * the glossary (one term per row).
 */
export type PitruLessonKind = 'parichay' | 'tithi' | 'shabd';

/**
 * The fortnight day a `tithi` lesson describes — 'purnima', 1–14 (the krishna
 * paksha tithi index the overview screen names its rows by), or 'amavasya'.
 * Absent on non-tithi lessons.
 */
export type PitruFortnightDay = 'purnima' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 'amavasya';

export type PitruLessonEntry = {
  id: string;
  kind: PitruLessonKind;
  fortnightDay?: PitruFortnightDay;
  titleHi: string;
  titleEn: string;
  /** Paragraphs (meaning-policy language selection). */
  bodyHi: readonly string[];
  bodyEn: readonly string[];
  status: PitruContentStatus;
  source: PitruSource;
};

/** Deep link into a bundled chaptered reader — never re-typed scripture. */
export type PitruReaderRef =
  | { kind: 'gita'; chapter: number; verseIndex: number }
  | { kind: 'valmiki'; chapter: number; verseIndex: number };

/**
 * The verse spine (शास्त्र-वचन). `verseLines`/`iastLines` are rendered only
 * when the verse is short and is ALSO reachable through `ref` for the full
 * context — the row exists to point, not to replace the reader.
 */
export type PitruPrincipleEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  verseLines?: readonly string[];
  iastLines?: readonly string[];
  citeHi: string;
  citeEn: string;
  meaningHi: string;
  meaningEn: string;
  ref?: PitruReaderRef;
  status: PitruContentStatus;
  source: PitruSource;
};

export type PitruKathaSection = {
  id: string;
  paragraphsHi: readonly string[];
  paragraphsEn: readonly string[];
};

export type PitruKathaEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  sections: readonly PitruKathaSection[];
  /** The one bhaav the katha carries — rendered in the शिक्षा panel. */
  teachingHi: string;
  teachingEn: string;
  /** Rendered source line (the canon the retelling follows). */
  canonHi: string;
  canonEn: string;
  /** Optional hand-off to the bundled text the katha is drawn from. */
  ref?: PitruReaderRef;
  status: PitruContentStatus;
  source: PitruSource;
};

/** प्रश्नोत्तर — one honest answer per common question. */
export type PitruPrashnaEntry = {
  id: string;
  questionHi: string;
  questionEn: string;
  answerHi: string;
  answerEn: string;
  status: PitruContentStatus;
  source: PitruSource;
};
