/**
 * Pure parana derivation (PRD-09 Phase 4 §5.2) — the "computed line" beneath
 * the verified parana rule text on the Observance Detail's उपवास विधि panel.
 *
 * Text is canonical; this module only ANNOTATES it with a date/time for the
 * two machine-checkable kinds, and returns null everywhere the derivation
 * would be dishonest — the caller then renders the rule text alone. Never an
 * invented time.
 *
 * RN-free and clock-free (same boundary as `muhurat.ts`): callers hand in the
 * already-solved `PanchangData` days — sourced from the shared
 * `panchangDayStore`, never a private cache — and the resolved occurrence
 * date from `getNextOccurrence` (already kshaya/vriddhi-normalized by the
 * festival engine; this module never re-matches tithis).
 */
import type { PanchangData, UpvasParanaRule } from './types';

export type UpvasParanaDisplay =
  /** Tithi-bound morning window: parana-day sunrise → bound tithi's end. */
  | { kind: 'window'; date: Date; start: Date; end: Date }
  /** Moonrise-bound instant: the occurrence night's moonrise. */
  | { kind: 'instant'; date: Date; at: Date };

/**
 * The bound tithi (1–15 within its paksha) against the engine's 0–29 tithi
 * index. `% 15` folds both pakshas: adjacent civil days can only carry the
 * SAME paksha's bound tithi (a wrong-paksha match is ~a fortnight away), and
 * folding keeps the entry's authored 1–15 value paksha-free, matching how
 * rules share one entry across shukla and krishna families.
 */
function matchesBoundTithi(tithiIndex: number, boundTithi: number): boolean {
  return (tithiIndex % 15) + 1 === boundTithi;
}

/**
 * Derive the display for a parana rule, or null when it cannot be computed
 * honestly:
 * - `text-only` → always null (no computed line, ever).
 * - `next-day-sunrise-tithi-bound` → needs `paranaDay` (the resolved
 *   occurrence date + 1). Null when the bound tithi does not prevail at that
 *   morning's sunrise (the Hari-Vasara / pratah-kala edge: it already ended,
 *   or a kshaya skipped it), or when the engine has no end instant for it.
 * - `same-day-after-moonrise` → needs `occurrenceDay`; null when the engine
 *   reports no moonrise for that day.
 */
export function deriveUpvasParana(
  parana: UpvasParanaRule,
  occurrenceDay: PanchangData | null,
  paranaDay: PanchangData | null
): UpvasParanaDisplay | null {
  if (parana.kind === 'text-only') return null;

  if (parana.kind === 'same-day-after-moonrise') {
    if (!occurrenceDay || !occurrenceDay.moonrise) return null;
    return { kind: 'instant', date: occurrenceDay.date, at: occurrenceDay.moonrise };
  }

  // next-day-sunrise-tithi-bound
  const bound = parana.boundTithi;
  if (!paranaDay || bound === undefined) return null;
  if (!matchesBoundTithi(paranaDay.tithi.index, bound)) return null;
  const end = paranaDay.tithi.endTime;
  if (!end || end.getTime() <= paranaDay.sunrise.getTime()) return null;
  return { kind: 'window', date: paranaDay.date, start: paranaDay.sunrise, end };
}
