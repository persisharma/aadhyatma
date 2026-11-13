import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, indiaDateKey } from './kundali';
import type { DashaLord, DashaPeriod, KundaliChart } from './kundali';
import { GRAHA_UPAY, MANTRA_COUNT } from './grahaReadingContent';
import { ageBandAt, type BasisNode } from './kundaliBasis';
import type { KundaliGrahaUpay } from './kundaliReportModel';
import { formatIstDateEn, formatIstDateHi } from './reportFormat';

/**
 * What to do in a Mahadasha — the period lord's upay (RULEBOOK §14.3.5).
 *
 * Pure composition: the lord's own `GRAHA_UPAY` row — day, daan, seva, beej
 * mantra, one paath — framed for the period it belongs to. Nothing is authored
 * beside the table (upaya comes from ONE table), and nothing here is a
 * forecast: the dates are the calculated period, never an event.
 *
 * It lives apart from `dashaReading.ts` on purpose: प्रश्न and Ask import that
 * module for its keyword tables, and must not pull the graha content with it.
 */

/** A `GRAHA_UPAY` row as a surface prints it; the caller supplies its own heading. */
export type DashaUpay = Omit<KundaliGrahaUpay, 'introHi' | 'introEn'>;

export type DashaPractice = {
  lord: DashaLord;
  titleHi: string;
  titleEn: string;
  /** Why this graha's practice: it is the period's lord, between these dates. */
  introHi: string;
  introEn: string;
  upay: DashaUpay;
  /** The one framing line: a practice, never a remedy. */
  noteHi: string;
  noteEn: string;
  basis: readonly BasisNode[];
};

export const DASHA_PRACTICE_NOTE = {
  hi: 'ये उपाय मन को स्थिर रखने का अभ्यास हैं — कोई इलाज या गारंटी नहीं।',
  en: 'An upay is a practice for steadiness and good conduct — not a fix or a guarantee.',
} as const;

/**
 * Adults only: a minor's surfaces describe what to observe and never instruct
 * (§14.3.5), so a subject under 18 at `at` gets null and the surface keeps
 * what it showed before.
 */
export function buildDashaPractice(
  chart: KundaliChart,
  period: Pick<DashaPeriod, 'lord' | 'start' | 'end'>,
  at: Date
): DashaPractice | null {
  if (ageBandAt(chart, at) !== 'adult') return null;
  const lord = period.lord;
  const row = GRAHA_UPAY[lord];
  const lordHi = GRAHA_NAMES_HI[lord];
  const lordEn = GRAHA_NAMES_EN[lord];
  return {
    lord,
    titleHi: `${lordHi} महादशा · उपाय`,
    titleEn: `${lordEn} Mahadasha · Upay`,
    introHi: `${formatIstDateHi(period.start)} से ${formatIstDateHi(period.end)} तक ${lordHi} इस अवधि का स्वामी है — परम्परा में इस काल में उसी का वार, दान, सेवा और मंत्र रखा जाता है।`,
    introEn: `From ${formatIstDateEn(period.start)} to ${formatIstDateEn(period.end)}, ${lordEn} is the lord of this period — tradition keeps its day, daan, seva and mantra through these years.`,
    upay: {
      vaarHi: row.vaarHi,
      vaarEn: row.vaarEn,
      daanHi: row.daanHi,
      daanEn: row.daanEn,
      sevaHi: row.sevaHi,
      sevaEn: row.sevaEn,
      mantraHi: row.mantraHi,
      mantraEn: row.mantraEn,
      mantraCountHi: MANTRA_COUNT.hi,
      mantraCountEn: MANTRA_COUNT.en,
      practiceSourceId: row.practiceSourceId,
    },
    noteHi: DASHA_PRACTICE_NOTE.hi,
    noteEn: DASHA_PRACTICE_NOTE.en,
    basis: [
      { kind: 'dasha', level: 'maha', lord, startKey: indiaDateKey(period.start), endKey: indiaDateKey(period.end) },
    ],
  };
}
