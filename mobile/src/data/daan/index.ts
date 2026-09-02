/**
 * दान-पुण्य registry accessors (PRD-26, RULEBOOK §25). Verified-only across
 * the board (the §20/§21/§22 draft-invisibility pattern), plus the one piece
 * of matching logic the touchpoints share: rule-id → occasion row, where
 * exact ids always beat suffix families (shattila-ekadashi wins over
 * '-ekadashi'; makar-sankranti wins over '-sankranti').
 */
import { getDaanOccasions } from './occasions';
import type { DaanOccasionEntry } from './types';

export { getDaanPrinciples } from './principles';
export { getDaanOccasions } from './occasions';
export { DAAN_VAAR_ENTRIES, DAAN_VAAR_SOURCE, getDaanVaarEntry } from './vaar';
export { getDaanKathas, getDaanKatha } from './kathas';
export { getDaanOrgs, getDaanOrg, isOrgRowStale } from './directory';
export {
  DAAN_CATEGORIES,
  DAAN_CATEGORY_LABELS,
  DAAN_LEDGER_STORAGE_KEY,
  buildLedgerCsv,
  makeTithiStamp,
} from './ledger';
export type { DaanLedgerEntry } from './ledger';
export type {
  DaanCategory,
  DaanKathaEntry,
  DaanOccasionEntry,
  DaanOrgEntry,
  DaanPrincipleEntry,
  DaanVaarEntry,
} from './types';

export function getDaanOccasion(occasionId: string): DaanOccasionEntry | null {
  return getDaanOccasions().find((entry) => entry.id === occasionId) ?? null;
}

/**
 * The Observance-Detail door's predicate (PRD-26 §4b U1/U4): returns the
 * occasion row for a solver rule id, or null — in which case the host renders
 * NO daan section (absent, never a placeholder).
 */
export function getDaanOccasionForRule(ruleId: string): DaanOccasionEntry | null {
  const occasions = getDaanOccasions();
  const exact = occasions.find((entry) => entry.ruleIds.includes(ruleId));
  if (exact) return exact;
  return (
    occasions.find((entry) =>
      (entry.ruleIdSuffixes ?? []).some((suffix) => ruleId.endsWith(suffix))
    ) ?? null
  );
}
