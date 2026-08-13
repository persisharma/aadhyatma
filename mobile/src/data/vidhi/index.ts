import type { VidhiEntry } from './types';
import { diwaliLakshmiGaneshPuja } from './diwali-lakshmi-ganesh-puja';
import { ganeshChaturthiSthapana } from './ganesh-chaturthi-sthapana';
import { karwaChauthPuja } from './karwa-chauth-puja';
import { mahaShivaratriPuja } from './maha-shivaratri-puja';
import { navratriGhatasthapana } from './navratri-ghatasthapana';
import { satyanarayanPuja } from './satyanarayan-puja';

export type {
  VidhiEntry,
  VidhiMantra,
  VidhiPhase,
  VidhiRef,
  VidhiSamagriItem,
  VidhiSource,
  VidhiStep,
} from './types';

/**
 * The complete v1 vidhi registry (PRD-19). Order is the product's curated
 * catalog order, not festival-calendar order.
 */
export const VIDHI_ENTRIES: readonly VidhiEntry[] = [
  satyanarayanPuja,
  diwaliLakshmiGaneshPuja,
  ganeshChaturthiSthapana,
  navratriGhatasthapana,
  karwaChauthPuja,
  mahaShivaratriPuja,
];

export const VIDHI_BY_ID: ReadonlyMap<string, VidhiEntry> = new Map(
  VIDHI_ENTRIES.map((entry) => [entry.id, entry] as const)
);

export function getVidhiById(id: string): VidhiEntry | null {
  return VIDHI_BY_ID.get(id) ?? null;
}

/** The vidhi offered on an observance rule's day panel, if published. */
export function getVidhiForFestival(ruleId: string): VidhiEntry | null {
  return VIDHI_ENTRIES.find((entry) => entry.festivalIds.includes(ruleId)) ?? null;
}

(function assertVidhiInvariants() {
  const seen = new Set<string>();
  for (const entry of VIDHI_ENTRIES) {
    if (seen.has(entry.id)) throw new Error(`vidhi: duplicate id '${entry.id}'`);
    seen.add(entry.id);
    if (entry.samagri.length === 0) throw new Error(`vidhi '${entry.id}': empty samagri`);
    if (entry.steps.length === 0) throw new Error(`vidhi '${entry.id}': empty steps`);
    const stepIds = new Set<string>();
    for (const step of entry.steps) {
      if (stepIds.has(step.id)) throw new Error(`vidhi '${entry.id}': duplicate step '${step.id}'`);
      stepIds.add(step.id);
    }
  }
})();
