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
 */

export type KundaliReportPracticeId =
  | 'navagraha-stotram'
  | 'surya-ashtakam'
  | 'shani-ashtakam';

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
};

export type KundaliReportAgeBand = 'child' | 'adolescent' | 'adult';

export type KundaliReportModel = {
  reportVersion: 2;
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
