/**
 * The मेरा घर assessment engine (PRD-24 Phase 2 §C3) — pure, fully
 * serialisable, and the ONLY place a finding is ever computed. Screens render
 * this model; a language model may later PHRASE it (F2) but can never add,
 * remove or reweight a finding.
 *
 * Five finding classes and not a sixth (§0.2), grouped in the frozen order
 * forbidden → differs → preferred-unmet → alternate → in-keeping → unmeasured,
 * registry order within a group. No composite score, no percentage, ever.
 */
import type { VastuRoomEntry, VastuWeight, VastuZone } from '@/data/vastu/types';
import { getVastuRoomEntries } from '@/data/vastu/roomGuidance';
import type { HomePlacement, HomeRecord } from './homeRecord';

export type FindingClass =
  | 'forbidden'
  | 'differs'
  | 'preferred-unmet'
  | 'alternate'
  | 'in-keeping'
  | 'unmeasured';

/** The frozen display order (PRD-24 Phase 2 §C3) — pinned by test. */
export const FINDING_CLASS_ORDER: readonly FindingClass[] = [
  'forbidden',
  'differs',
  'preferred-unmet',
  'alternate',
  'in-keeping',
  'unmeasured',
];

export const FINDING_CLASS_LABELS: Readonly<Record<FindingClass, { hi: string; en: string }>> = {
  forbidden: { hi: 'निषिद्ध स्थान', en: 'Proscribed place' },
  differs: { hi: 'विधान से भिन्न', en: 'Differs from the prescription' },
  'preferred-unmet': { hi: 'श्रेयस् अनुपलब्ध', en: 'Preferred, not met' },
  alternate: { hi: 'परंपरागत विकल्प', en: 'Traditional alternate' },
  'in-keeping': { hi: 'मेल', en: 'In keeping' },
  unmeasured: { hi: 'अभी मापा नहीं', en: 'Not yet measured' },
};

export const WEIGHT_LABELS: Readonly<Record<VastuWeight, { hi: string; en: string }>> = {
  vidhana: { hi: 'विधान', en: 'Prescribed' },
  shreyas: { hi: 'श्रेयस्', en: 'Preferred' },
};

/** Classify one placement against its registry entry — §0.2, verbatim. */
export function classifyPlacement(entry: VastuRoomEntry, zone: VastuZone | null): FindingClass {
  if (zone === null) return 'unmeasured';
  if (entry.isCenter) return zone === 'center' ? 'in-keeping' : 'differs';
  const directions = entry.directions as readonly string[];
  const alternates = (entry.alternateDirections ?? []) as readonly string[];
  const avoids = (entry.avoidDirections ?? []) as readonly string[];
  if (directions.includes(zone)) return 'in-keeping';
  if (alternates.includes(zone)) return 'alternate';
  if (avoids.includes(zone)) return 'forbidden';
  return (entry.weight ?? 'vidhana') === 'vidhana' ? 'differs' : 'preferred-unmet';
}

export type HomeFinding = {
  roomId: string;
  ordinal: number;
  zone: VastuZone | null;
  via: HomePlacement['via'];
  at?: { fx: number; fy: number };
  cls: FindingClass;
  weight: VastuWeight;
  /** Denormalised registry snapshot the screens/handoff render from —
   * keeps the model self-contained and serialisable. */
  titleHi: string;
  titleEn: string;
  directions: readonly string[];
  alternateDirections: readonly string[];
  avoidDirections: readonly string[];
  accommodationHi?: string;
  accommodationEn?: string;
};

export type HomeAssessmentModel = {
  version: 1;
  homeId: string;
  label: string;
  template: string;
  facing: string | null;
  /** Every finding, grouped in FINDING_CLASS_ORDER, registry order within. */
  groups: readonly { cls: FindingClass; findings: readonly HomeFinding[] }[];
  /** All six class counts — a zero still renders (absence is information). */
  counts: Readonly<Record<FindingClass, number>>;
};

/**
 * Assess a home record against the VERIFIED registry. Placements whose room
 * flipped back to draft are held as unmeasured-invisible (skipped) rather than
 * judged from unverified content.
 */
export function assessHome(record: HomeRecord): HomeAssessmentModel {
  const entries = getVastuRoomEntries();
  const registryOrder = new Map(entries.map((entry, index) => [entry.id, index] as const));

  const findings: HomeFinding[] = [];
  for (const placement of record.rooms) {
    const entry = entries.find((e) => e.id === placement.roomId);
    if (!entry) continue; // draft/retired — never judged from unverified content
    findings.push({
      roomId: placement.roomId,
      ordinal: placement.ordinal,
      zone: placement.zone,
      via: placement.via,
      ...(placement.at ? { at: placement.at } : {}),
      cls: classifyPlacement(entry, placement.zone),
      weight: entry.weight ?? 'vidhana',
      titleHi: entry.titleHi,
      titleEn: entry.titleEn,
      directions: entry.directions,
      alternateDirections: entry.alternateDirections ?? [],
      avoidDirections: entry.avoidDirections ?? [],
      ...(entry.accommodationHi
        ? { accommodationHi: entry.accommodationHi, accommodationEn: entry.accommodationEn }
        : {}),
    });
  }

  findings.sort((a, b) => {
    const byRegistry = (registryOrder.get(a.roomId) ?? 0) - (registryOrder.get(b.roomId) ?? 0);
    return byRegistry !== 0 ? byRegistry : a.ordinal - b.ordinal;
  });

  const counts = Object.fromEntries(FINDING_CLASS_ORDER.map((cls) => [cls, 0])) as Record<
    FindingClass,
    number
  >;
  for (const finding of findings) counts[finding.cls] += 1;

  const groups = FINDING_CLASS_ORDER.map((cls) => ({
    cls,
    findings: findings.filter((f) => f.cls === cls),
  })).filter((group) => group.findings.length > 0);

  return {
    version: 1,
    homeId: record.id,
    label: record.label,
    template: record.template,
    facing: record.facing,
    groups,
    counts,
  };
}
