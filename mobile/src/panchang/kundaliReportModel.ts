/**
 * Compiled Kundali report model — PRD-20 Phase 6.
 *
 * A versioned, FULLY SERIALIZABLE plain-JSON document: string/number/boolean
 * fields only — no Date, function, or class instances (dates travel as
 * pre-formatted labels or ISO-style keys). The serde round-trip test pins
 * this. The same object is the render source for `KundaliReportScreen`, the
 * share source, and — deliberately — the grounding context a future AI phase
 * would consume (PRD-20 §5), so it must survive `JSON.parse(JSON.stringify())`
 * unchanged.
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
};

export type KundaliReportModel = {
  reportVersion: 1;
  /** India civil date the report was generated for (YYYY-MM-DD). */
  generatedDateKey: string;
  name: string | null;
  birthDateLabelHi: string;
  birthDateLabelEn: string;
  birthTimeLabel: string | null;
  cityNameHi: string;
  cityNameEn: string;
  lagnaRashiIndex: number;
  moonRashiIndex: number;
  moonNakshatraIndex: number;
  moonPada: number;
  sections: readonly KundaliReportSection[];
  disclaimerHi: string;
  disclaimerEn: string;
};
