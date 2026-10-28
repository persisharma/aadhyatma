/**
 * The whole प्रथा registry and its pure selectors (PRD-46 §5).
 *
 * Every row is authored in its axis file; this module joins them. Selectors
 * take the rows they search, so the verified-only gate is applied once, in
 * `getVerifiedPratha()`, and tests can exercise the selectors on a flipped
 * fixture. Load this module only through the `require()` thunks in
 * `index.ts` — it holds the full bilingual corpus.
 */
import { PRATHA_BODH_ENTRIES } from './bodh';
import { PRATHA_MASA_ENTRIES } from './masa';
import { PRATHA_NITYA_ENTRIES } from './nitya';
import { PRATHA_PRAKRITI_ENTRIES } from './prakriti';
import { PRATHA_PUJA_NIYAM_ENTRIES } from './pujaNiyam';
import { PRATHA_SANSKAR_ENTRIES } from './sanskar';
import { PRATHA_TIRTH_ENTRIES } from './tirth';
import { PRATHA_VAAR_ENTRIES } from './vaar';
import type { PrathaAxis, PrathaEntry } from './types';

export const PRATHA_ENTRIES: readonly PrathaEntry[] = [
  ...PRATHA_MASA_ENTRIES,
  ...PRATHA_VAAR_ENTRIES,
  ...PRATHA_NITYA_ENTRIES,
  ...PRATHA_PUJA_NIYAM_ENTRIES,
  ...PRATHA_PRAKRITI_ENTRIES,
  ...PRATHA_SANSKAR_ENTRIES,
  ...PRATHA_TIRTH_ENTRIES,
  ...PRATHA_BODH_ENTRIES,
];

export function verifiedOnly(entries: readonly PrathaEntry[]): readonly PrathaEntry[] {
  return entries.filter((entry) => entry.status === 'verified');
}

export function getVerifiedPratha(): readonly PrathaEntry[] {
  return verifiedOnly(PRATHA_ENTRIES);
}

export function selectById(entries: readonly PrathaEntry[], id: string): PrathaEntry | null {
  return entries.find((entry) => entry.id === id) ?? null;
}

export function selectByAxis(entries: readonly PrathaEntry[], axis: PrathaAxis): readonly PrathaEntry[] {
  return entries.filter((entry) => entry.axis === axis);
}

export function selectForRule(entries: readonly PrathaEntry[], ruleId: string): readonly PrathaEntry[] {
  return entries.filter((entry) => entry.anchors.ruleIds?.includes(ruleId));
}

/** `lunarMonth` uses the engine's numbering (Chaitra = 1 … Phalgun = 12). */
export function selectForMasa(
  entries: readonly PrathaEntry[],
  lunarMonth: number,
  isAdhik = false
): readonly PrathaEntry[] {
  return entries.filter((entry) =>
    isAdhik ? entry.anchors.adhikMasa === true : entry.anchors.masa?.includes(lunarMonth)
  );
}

/** `weekday` is the JS weekday (Sunday = 0). */
export function selectForVaar(entries: readonly PrathaEntry[], weekday: number): readonly PrathaEntry[] {
  return entries.filter((entry) => entry.anchors.vaar?.includes(weekday));
}
