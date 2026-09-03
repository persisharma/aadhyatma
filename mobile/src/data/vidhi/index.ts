import type { VidhiEntry } from './types';
import { diwaliLakshmiGaneshPuja } from './diwali-lakshmi-ganesh-puja';
import { ganeshChaturthiSthapana } from './ganesh-chaturthi-sthapana';
import { karwaChauthPuja } from './karwa-chauth-puja';
import { mahaShivaratriPuja } from './maha-shivaratri-puja';
import { navratriGhatasthapana } from './navratri-ghatasthapana';
import { satyanarayanPuja } from './satyanarayan-puja';
import { shraddhaTarpanVidhi } from './shraddha-tarpan-vidhi';
import { ganeshVisarjanUttarPuja } from './ganesh-visarjan-uttar-puja';
import { durgaVisarjan } from './durga-visarjan';

export type {
  VidhiContentStatus,
  VidhiEntry,
  VidhiMantra,
  VidhiPhase,
  VidhiRef,
  VidhiSamagriItem,
  VidhiSource,
  VidhiStep,
} from './types';

/**
 * Every authored vidhi, drafts included — review/test surface ONLY. Order is
 * the product's curated catalog order, not festival-calendar order. The
 * visarjan family (PRD-28 Phase B) sits last: the arc's concluding rite
 * follows its installation in the catalog once verified.
 */
export const ALL_VIDHI_ENTRIES: readonly VidhiEntry[] = [
  satyanarayanPuja,
  diwaliLakshmiGaneshPuja,
  ganeshChaturthiSthapana,
  navratriGhatasthapana,
  karwaChauthPuja,
  mahaShivaratriPuja,
  shraddhaTarpanVidhi,
  ganeshVisarjanUttarPuja,
  durgaVisarjan,
];

export function isVidhiPublished(entry: VidhiEntry): boolean {
  return (entry.status ?? 'verified') === 'verified';
}

/**
 * The PUBLISHED registry (PRD-19 v1 + anything since that cleared review).
 * Drafts are filtered out here, so the catalog, search rows, day-panel pills,
 * Observance Detail cards and the arc strip never see them (RULEBOOK §26).
 */
export const VIDHI_ENTRIES: readonly VidhiEntry[] = ALL_VIDHI_ENTRIES.filter(isVidhiPublished);

/** Draft entries awaiting the two-source review — never rendered. */
export const VIDHI_DRAFTS: readonly VidhiEntry[] = ALL_VIDHI_ENTRIES.filter((entry) => !isVidhiPublished(entry));

export const VIDHI_BY_ID: ReadonlyMap<string, VidhiEntry> = new Map(
  VIDHI_ENTRIES.map((entry) => [entry.id, entry] as const)
);

/** Published entries only — a draft id resolves to null, exactly like an unknown id. */
export function getVidhiById(id: string): VidhiEntry | null {
  return VIDHI_BY_ID.get(id) ?? null;
}

/** The vidhi offered on an observance rule's day panel, if published. */
export function getVidhiForFestival(ruleId: string): VidhiEntry | null {
  return VIDHI_ENTRIES.find((entry) => entry.festivalIds.includes(ruleId)) ?? null;
}

(function assertVidhiInvariants() {
  const seen = new Set<string>();
  for (const entry of ALL_VIDHI_ENTRIES) {
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
