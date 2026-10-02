import type { Graha } from './kundali';
import type { BasisNode } from './kundaliBasis';

/**
 * Compiled Kundali report model — PRD-20 Phase 6, extended by PRD-43 (v2).
 *
 * A versioned, FULLY SERIALIZABLE plain-JSON document: string/number/boolean
 * fields only — no Date, function, or class instances (dates travel as
 * pre-formatted labels or ISO-style keys). The serde round-trip test pins
 * this. The same object is the render source for `KundaliReportScreen`, the
 * share source, and — deliberately — the grounding context a future AI phase
 * would consume (PRD-20 §5), so it must survive `JSON.parse(JSON.stringify())`
 * unchanged.
 *
 * v2 (PRD-43): `snapshot` and `combinations` sections, an `asOf` stamp, the
 * subject's age band, optional per-section `basis` chains (RULEBOOK §14.3.1),
 * and dated Vimshottari lines. Additive — every v1 field is still present.
 *
 * v3 (RULEBOOK §14.7): an optional `grahas` section whose `grahaCards` read
 * each graha with a counted label and one upaya, and the widened practice
 * allow-list below. Additive — a v2 consumer that ignores `grahaCards` still
 * reads every other section unchanged.
 */

/** The upaya paath allow-list (RULEBOOK §14.3.5) — every id an active library entry. */
export type KundaliReportPracticeId =
  | 'navagraha-stotram'
  | 'surya-ashtakam'
  | 'shiv-chalisa'
  | 'hanuman-chalisa'
  | 'ganesh-chalisa'
  | 'vishnu-sahasranama'
  | 'mahalakshmi-ashtakam'
  | 'shani-ashtakam'
  | 'durga-chalisa'
  | 'ganesha-kavacham';

export type KundaliGrahaTone = 'supportive' | 'mixed' | 'care';

/** One counted vote behind a card's label, in plain words. */
export type KundaliGrahaReason = {
  id: string;
  vote: 'supports' | 'cautions';
  textHi: string;
  textEn: string;
};

export type KundaliGrahaUpay = {
  introHi: string;
  introEn: string;
  vaarHi: string;
  vaarEn: string;
  daanHi: string;
  daanEn: string;
  sevaHi: string;
  sevaEn: string;
  mantraHi: string;
  mantraEn: string;
  mantraCountHi: string;
  mantraCountEn: string;
  practiceSourceId: KundaliReportPracticeId;
};

/** One graha read the way a family pandit would — meaning first, term second. */
export type KundaliGrahaCard = {
  id: string;
  graha: Graha;
  house: number;
  rashiIndex: number;
  nameHi: string;
  nameEn: string;
  /** What the graha stands for. */
  meaningHi: string;
  meaningEn: string;
  /** The house and its life areas. */
  placeHi: string;
  placeEn: string;
  /** The sign and how strong the graha is in it. */
  strengthHi: string;
  strengthEn: string;
  tone: KundaliGrahaTone;
  toneLabelHi: string;
  toneLabelEn: string;
  toneLineHi: string;
  toneLineEn: string;
  givesHi: string;
  givesEn: string;
  careHi: string;
  careEn: string;
  /** The houses it rules for this Lagna; null for the nodes. */
  rulesHi: string | null;
  rulesEn: string | null;
  reasons: readonly KundaliGrahaReason[];
  upay: KundaliGrahaUpay;
  basis: readonly BasisNode[];
};

export type KundaliReportFact = {
  id: string;
  labelHi: string;
  labelEn: string;
  valueHi: string;
  valueEn: string;
};

export type KundaliReportSection = {
  id: string;
  eyebrowHi: string;
  eyebrowEn: string;
  titleHi: string;
  titleEn: string;
  /** Paragraphs, index-aligned across languages. */
  bodyHi: readonly string[];
  bodyEn: readonly string[];
  facts: readonly KundaliReportFact[];
  practiceSourceId?: KundaliReportPracticeId;
  /** The chart facts this section's reading was derived from — the आधार chain.
   * Present on every interpretive section; absent on pure fact sections. */
  basis?: readonly BasisNode[];
  /** The `grahas` section only: nine cards, each with its own basis. */
  grahaCards?: readonly KundaliGrahaCard[];
};

export type KundaliReportAgeBand = 'child' | 'adolescent' | 'adult';

export type KundaliReportModel = {
  reportVersion: 3;
  /** India civil date the report was generated for (YYYY-MM-DD). */
  generatedDateKey: string;
  /** The same date as a display label — every transit statement is stamped with it. */
  asOfLabelHi: string;
  asOfLabelEn: string;
  name: string | null;
  birthDateLabelHi: string;
  birthDateLabelEn: string;
  birthTimeLabel: string | null;
  cityNameHi: string;
  cityNameEn: string;
  /** Derived at build time from the birth instant and `generatedDateKey`; never stored. */
  ageBand: KundaliReportAgeBand;
  ageLabelHi: string;
  ageLabelEn: string;
  lagnaRashiIndex: number;
  moonRashiIndex: number;
  moonNakshatraIndex: number;
  moonPada: number;
  sections: readonly KundaliReportSection[];
  disclaimerHi: string;
  disclaimerEn: string;
};
