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

/** Whom a planet counts as friend, enemy and neutral (naisargika maitri), as name lists. */
export type KundaliGrahaMaitri = {
  friendsHi: string;
  friendsEn: string;
  enemiesHi: string;
  enemiesEn: string;
  neutralHi: string;
  neutralEn: string;
};

/**
 * One graha read the way a family pandit would — meaning first, term second.
 * Every list is short bullets, one idea each, index-aligned across languages.
 */
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
  /** The sign, whose sign it is, and how strong the graha is in it. */
  strengthHi: string;
  strengthEn: string;
  /** Facts that cast no vote (retrograde motion); empty when there are none. */
  notesHi: readonly string[];
  notesEn: readonly string[];
  /** The occupied house's karaka — its natural guardian graha(s). */
  karakaHi: string;
  karakaEn: string;
  /** Null for the nodes, which have no classical maitri row. */
  maitri: KundaliGrahaMaitri | null;
  tone: KundaliGrahaTone;
  toneLabelHi: string;
  toneLabelEn: string;
  /** The label's meaning — shown in place of the reasons when none voted. */
  toneLineHi: string;
  toneLineEn: string;
  givesHi: readonly string[];
  givesEn: readonly string[];
  careHi: readonly string[];
  careEn: readonly string[];
  /** The houses it rules for this Lagna, one bullet each; empty for the nodes. */
  rulesHi: readonly string[];
  rulesEn: readonly string[];
  reasons: readonly KundaliGrahaReason[];
  upay: KundaliGrahaUpay;
  basis: readonly BasisNode[];
};

/** A house no graha occupies, read through its lord (RULEBOOK §14.7.9). */
export type KundaliEmptyHouse = {
  house: number;
  rashiIndex: number;
  lord: Graha;
  /** The house the lord sits in. */
  lordHouse: number;
  /** One bullet: the house, its lord, and where the lord sits. */
  lineHi: string;
  lineEn: string;
  basis: readonly BasisNode[];
};

/** The empty-houses block after the nine graha cards; never empty in practice (≥ 3 houses). */
export type KundaliEmptyHouses = {
  titleHi: string;
  titleEn: string;
  introHi: readonly string[];
  introEn: readonly string[];
  houses: readonly KundaliEmptyHouse[];
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
  /** The houses no graha occupies, each read through its lord — with the cards only. */
  emptyHouses?: KundaliEmptyHouses;
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
