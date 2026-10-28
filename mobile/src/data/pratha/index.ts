/**
 * प्रथा और मान्यता registry accessors (PRD-46, RULEBOOK §32). Verified-only
 * across the board — a draft row is indistinguishable from absence on every
 * surface, so flipping a status lights the surface up with zero code change
 * (the §19/§26/§27/§28 pattern).
 *
 * LAUNCH-GRAPH RULE (launchGraph.test.ts): hosts such as the Panchang masa card
 * and Observance Detail will call `hasPratha()` / `getPrathaForRule()` on
 * eagerly-loaded screens, so the bilingual corpus loads through a `require()`
 * thunk. Only types are re-exported statically.
 */
import type { PrathaAxis, PrathaEntry } from './types';

export type {
  PrathaAnchors,
  PrathaAxis,
  PrathaConfidence,
  PrathaContentStatus,
  PrathaEntry,
  PrathaKatha,
  PrathaKind,
  PrathaReaderRef,
  PrathaSource,
  PrathaTier,
} from './types';

function registry(): typeof import('./registry') {
  return require('./registry') as typeof import('./registry');
}

export function getAllPratha(): readonly PrathaEntry[] {
  return registry().getVerifiedPratha();
}

export function getPratha(id: string): PrathaEntry | null {
  return registry().selectById(getAllPratha(), id);
}

export function getPrathaByAxis(axis: PrathaAxis): readonly PrathaEntry[] {
  return registry().selectByAxis(getAllPratha(), axis);
}

export function getPrathaForRule(ruleId: string): readonly PrathaEntry[] {
  return registry().selectForRule(getAllPratha(), ruleId);
}

export function getPrathaForMasa(lunarMonth: number, isAdhik = false): readonly PrathaEntry[] {
  return registry().selectForMasa(getAllPratha(), lunarMonth, isAdhik);
}

export function getPrathaForVaar(weekday: number): readonly PrathaEntry[] {
  return registry().selectForVaar(getAllPratha(), weekday);
}

/**
 * The one door predicate every host uses: true only when at least one
 * verified row exists. An all-draft registry renders NO door anywhere —
 * absent, never a teaser.
 */
export function hasPratha(): boolean {
  return getAllPratha().length > 0;
}
