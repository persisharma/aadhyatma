/**
 * प्रथा और मान्यता — "ऐसा क्यों करते हैं?" content shapes (PRD-46, RULEBOOK §32).
 *
 * Same registry discipline as पितृ पक्ष परिचय (§28): bilingual Hi/En parallel
 * fields, a review-only `source` block that is never rendered, and draft rows
 * invisible behind verified-only accessors. A row answers one question about a
 * custom or belief: what is done, the story (or several regional stories)
 * told about it, what it means, and — always rendered — where that story comes
 * from (`tier` + `canon*`). It never prescribes and never supplies liturgy.
 */

export type PrathaContentStatus = 'draft' | 'verified';

/**
 * Where a story comes from, rendered as a label on every katha (PRD-46 §4).
 * `shastra` = Veda/Upanishad/Itihasa/Gita/Smriti/Grihya-sutra with the verse
 * named; `purana` = a named Purana or Mahatmya with its adhyaya named;
 * `lok` = folk telling, names no text; `itihas` = a dated historical origin.
 */
export type PrathaTier = 'shastra' | 'purana' | 'lok' | 'itihas' | 'kavya' | 'agama';

/** The hub tab a row belongs to. Festival customs live under `masa`. */
export type PrathaAxis = 'masa' | 'vaar' | 'nitya' | 'puja-niyam' | 'prakriti' | 'sanskar' | 'tirth' | 'bodh';

/** `bodh` = a gentle popular-vs-text correction (PRD-46 §3). */
export type PrathaKind = 'pratha' | 'manyata' | 'bodh';

/** The research tag the catalogue gave the row's main story — review-only. */
export type PrathaConfidence = 'Certain' | 'Likely' | 'Guessing';

export type PrathaSource = {
  /**
   * ≥2 references for a verified row, ≥1 of them `https://`. Bundled corpora
   * count as one, named by `repo:` path. Review-only — never rendered.
   */
  referenceUrls: readonly string[];
  /** Dated adjudication note; a draft's note says `DRAFT — NOT VERIFIED`. */
  verificationNote: string;
  confidence: PrathaConfidence;
};

/** Deep link into a bundled chaptered reader — never re-typed scripture. */
export type PrathaReaderRef =
  | { kind: 'gita'; chapter: number; verseIndex: number }
  | { kind: 'valmiki'; chapter: number; verseIndex: number };

export type PrathaKatha = {
  tier: PrathaTier;
  regionHi?: string;
  regionEn?: string;
  titleHi: string;
  titleEn: string;
  /** Paragraphs; Hi and En have the same count. */
  bodyHi: readonly string[];
  bodyEn: readonly string[];
  /** Rendered source line. A `lok` canon says लोक-परम्परा and names no text. */
  canonHi: string;
  canonEn: string;
  /** Two independently published sources actually read for THIS story; required when its row is verified. */
  referenceUrls?: readonly string[];
  ref?: PrathaReaderRef;
};

/**
 * Links into what the app already ships, so a row points instead of
 * re-telling. Every id is checked against its registry by test.
 * `masa` uses the engine's lunar-month numbering (Chaitra = 1 … Phalgun = 12);
 * `vaar` is the JS weekday (Sunday = 0).
 */
export type PrathaAnchors = {
  masa?: readonly number[];
  adhikMasa?: boolean;
  vaar?: readonly number[];
  ruleIds?: readonly string[];
  kathaIds?: readonly string[];
  bhogIds?: readonly string[];
  vidhiIds?: readonly string[];
  daanOccasionIds?: readonly string[];
  theerthIds?: readonly string[];
  libraryIds?: readonly string[];
  prathaIds?: readonly string[];
  /** Pitru Paksha customs are owned by PRD-44; the row links there. */
  pitru?: boolean;
};

export type PrathaEntry = {
  /** The PRD-46 Appendix A catalogue id (K1, MG6, PN2, BD4 …). */
  id: string;
  axis: PrathaAxis;
  kind: PrathaKind;
  /** The PRD-46 rollout phase the row ships in. */
  phase: 1 | 2 | 3 | 4;
  /** The title is the question a person asks. */
  questionHi: string;
  questionEn: string;
  /** What is done or avoided — descriptive, never an instruction. */
  practiceHi: string;
  practiceEn: string;
  kathas: readonly PrathaKatha[];
  bhavHi: string;
  bhavEn: string;
  bodhHi?: string;
  bodhEn?: string;
  anchors: PrathaAnchors;
  status: PrathaContentStatus;
  source: PrathaSource;
};
