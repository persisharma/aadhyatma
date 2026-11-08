/** Beginner-facing educational facts, reusing the reviewed report vocabulary. */
import type { GrahaPosition, KundaliChart } from './kundali';
import { ageBandAt, dignityOfPosition, signLordOf, signRelationOf, type BasisNode } from './kundaliBasis';
import { BHAVA_PLAIN, grahaReadingsApproved, narrativeReadingsApproved } from './grahaReadingContent';
import { buildGrahaReadings } from './grahaReading';
import type { KundaliGrahaCard } from './kundaliReportModel';

export type PlacementKind = 'exalted' | 'own' | 'debilitated' | 'friend' | 'neutral' | 'enemy' | 'node';

/** A sign relationship is separate from the report's counted overall tone. */
export function placementKind(position: GrahaPosition): PlacementKind {
  if (position.graha === 'rahu' || position.graha === 'ketu') return 'node';
  const dignity = dignityOfPosition(position);
  return dignity === 'neutral' ? signRelationOf(position.graha, position.rashiIndex) ?? 'neutral' : dignity;
}

export function houseLesson(chart: KundaliChart, house: number) {
  if (!Number.isInteger(house) || house < 1 || house > 12) throw new RangeError('House must be 1–12');
  const rashiIndex = chart.houses[house - 1];
  const lord = signLordOf(rashiIndex);
  const lordPosition = chart.grahas.find(position => position.graha === lord);
  const basis: BasisNode[] = [{ kind: 'bhava', house, rashiIndex }];
  if (lordPosition) basis.push({ kind: 'lord', graha: lord, ofHouse: house, inHouse: lordPosition.house });
  return { house, rashiIndex, lord, lordPosition, basis, meaning: BHAVA_PLAIN[house - 1], occupants: chart.grahas.filter(position => position.house === house) };
}

/** Same production review and age gates as the compiled report. */
export function learningReadings(chart: KundaliChart, at: Date): readonly KundaliGrahaCard[] {
  if (ageBandAt(chart, at) !== 'adult' || !grahaReadingsApproved()) return [];
  return buildGrahaReadings(chart);
}

export function readingParagraph(card: KundaliGrahaCard) {
  if (card.narrative && narrativeReadingsApproved()) {
    return { hi: card.narrative.leadHi, en: card.narrative.leadEn, careHi: card.narrative.tendHi, careEn: card.narrative.tendEn };
  }
  return { hi: card.givesHi.join(' · '), en: card.givesEn.join(' · '), careHi: card.careHi.join(' · '), careEn: card.careEn.join(' · ') };
}

export const PLACEMENT_LABELS: Record<PlacementKind, { hi: string; en: string }> = {
  exalted: { hi: 'उच्च राशि में', en: 'In its exaltation sign' },
  own: { hi: 'अपनी राशि में', en: 'In its own sign' },
  debilitated: { hi: 'नीच राशि में', en: 'In its debilitation sign' },
  friend: { hi: 'मित्र की राशि में', en: 'In a friend’s sign' },
  neutral: { hi: 'सम संबंध की राशि में', en: 'In a neutral sign relationship' },
  enemy: { hi: 'शत्रु संबंध की राशि में', en: 'In an adversary’s sign' },
  node: { hi: 'छाया ग्रह', en: 'Lunar node' },
};
