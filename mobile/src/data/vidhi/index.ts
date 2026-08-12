import type { VidhiEntry } from './types';
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
 * The vidhi registry (PRD-19). One entry in Phase 1 (Satyanarayan); the
 * remaining five v1 vidhis land one PR each (RULEBOOK §10).
 */
export const VIDHI_ENTRIES: readonly VidhiEntry[] = [satyanarayanPuja];

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
