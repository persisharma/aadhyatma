/**
 * दान-पुण्य registry accessors (PRD-26, RULEBOOK §27). Verified-only across
 * the board (the §20/§21/§22 draft-invisibility pattern), plus the one piece
 * of matching logic the touchpoints share: rule-id → occasion row, where
 * exact ids always beat suffix families (shattila-ekadashi wins over
 * '-ekadashi'; makar-sankranti wins over '-sankranti').
 *
 * LAUNCH-GRAPH RULE (launchGraph.test.ts): the More stack imports
 * DaanPunyaScreen eagerly, so anything statically re-exported here sits on
 * every cold start. The content-bearing registries (principles, occasions,
 * kathas, directory — the feature's bulk) therefore load through `require()`
 * thunks, the valmiki-ramayan/pincodes pattern. Only the small runtime pieces
 * (vaar table, ledger core, types) may be re-exported statically.
 */
import type { DaanKathaEntry, DaanOccasionEntry, DaanOrgEntry, DaanPrincipleEntry } from './types';

export { DAAN_VAAR_ENTRIES, DAAN_VAAR_SOURCE, getDaanVaarEntry } from './vaar';
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

export function getDaanPrinciples(): readonly DaanPrincipleEntry[] {
  return (require('./principles') as typeof import('./principles')).getDaanPrinciples();
}

export function getDaanOccasions(): readonly DaanOccasionEntry[] {
  return (require('./occasions') as typeof import('./occasions')).getDaanOccasions();
}

export function getDaanKathas(): readonly DaanKathaEntry[] {
  return (require('./kathas') as typeof import('./kathas')).getDaanKathas();
}

export function getDaanKatha(id: string): DaanKathaEntry | null {
  return (require('./kathas') as typeof import('./kathas')).getDaanKatha(id);
}

export function getDaanOrgs(now?: Date): readonly DaanOrgEntry[] {
  return (require('./directory') as typeof import('./directory')).getDaanOrgs(now);
}

export function getDaanOrg(id: string, now?: Date): DaanOrgEntry | null {
  return (require('./directory') as typeof import('./directory')).getDaanOrg(id, now);
}

export function isOrgRowStale(entry: DaanOrgEntry, now?: Date): boolean {
  return (require('./directory') as typeof import('./directory')).isOrgRowStale(entry, now);
}

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
