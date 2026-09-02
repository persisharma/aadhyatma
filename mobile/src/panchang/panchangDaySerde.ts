/**
 * Pure (RN-free) serialization for a persisted muhurat day-input. Kept separate
 * from the AsyncStorage layer so it is unit-testable under `tsx --test` and so
 * the round-trip fidelity is guaranteed independently of storage.
 *
 * `PanchangData` carries several `Date` fields (date, sunrise, sunset, moonrise,
 * brahmaMuhurta.start/end) and Date-bearing angas (`PanchangElement.endTime`).
 * `JSON.stringify` would flatten those to ISO strings that never revive back to
 * Dates, so a rehydrated day would silently differ from a computed one. We tag
 * every Date generically (by path, not field name) on the way out and restore
 * it on the way in — robust to schema changes.
 */
import type { PanchangData } from './types';
import type { LagnaSpan } from './lagnaSweep';

export type DayInputs = {
  p: PanchangData;
  asta: { shukraAsta: boolean; guruAsta: boolean };
  /** The day's lagna spans, [sunrise, nextSunrise) (PRD-16/P3 §4.2). */
  lagnas: LagnaSpan[];
};

/** Bump when the panchang engine changes so persisted days from an older engine are purged. */
export const PANCHANG_DAY_CACHE_VERSION = 3; // v3: DayInputs.lagnas + lateVishti solved (PRD-16 Phase 3)

const DATE_TAG = '__d';
type TaggedDate = { [DATE_TAG]: number };

const isTaggedDate = (v: unknown): v is TaggedDate =>
  typeof v === 'object' && v !== null && typeof (v as TaggedDate)[DATE_TAG] === 'number';

export function serializeDayInputs(di: DayInputs): string {
  return JSON.stringify(di, function (this: Record<string, unknown>, key, value) {
    // `this[key]` is the pre-`toJSON` value, so a Date is still a Date here
    // (by the time `value` is passed, Date#toJSON has already made it a string).
    const raw = this[key];
    if (raw instanceof Date) return { [DATE_TAG]: raw.getTime() };
    return value;
  });
}

export function reviveDayInputs(raw: string): DayInputs | null {
  try {
    const parsed = JSON.parse(raw, (_key, value) => (isTaggedDate(value) ? new Date(value[DATE_TAG]) : value));
    if (!parsed || typeof parsed !== 'object' || !parsed.p) return null;
    return parsed as DayInputs;
  } catch {
    return null;
  }
}
