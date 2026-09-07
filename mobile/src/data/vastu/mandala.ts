/**
 * वास्तु पुरुष मंडल frame (PRD-24 Phase 2 §B3, first slice): the nine zones in
 * their fixed 3×3 layout with the classical dikpala of each. These are
 * structural labels (like DISHA_LABELS), not guidance content — the quality
 * phrases and pancha-bhuta rows stay content-gated for the B3 verification
 * pass and are NOT authored here.
 */
import { DISHA_LABELS } from '@/panchang/eventMuhurat';
import type { VastuZone } from './types';

/** North-up 3×3 layout — row 0 is the north edge, like a brochure plan. */
export const MANDALA_GRID: readonly (readonly VastuZone[])[] = [
  ['northwest', 'north', 'northeast'],
  ['west', 'center', 'east'],
  ['southwest', 'south', 'southeast'],
] as const;

export const MANDALA_ZONES: readonly VastuZone[] = MANDALA_GRID.flat();

/** The classical dikpala (guardian) of each zone, bilingual. */
export const DIKPALA_LABELS: Readonly<Record<VastuZone, { hi: string; en: string }>> = {
  east: { hi: 'इन्द्र', en: 'Indra' },
  southeast: { hi: 'अग्नि', en: 'Agni' },
  south: { hi: 'यम', en: 'Yama' },
  southwest: { hi: 'नैऋति', en: 'Nirriti' },
  west: { hi: 'वरुण', en: 'Varuna' },
  northwest: { hi: 'वायु', en: 'Vayu' },
  north: { hi: 'कुबेर', en: 'Kubera' },
  northeast: { hi: 'ईशान', en: 'Ishana' },
  center: { hi: 'ब्रह्मा', en: 'Brahma' },
};

/** Zone label in the shared direction vocabulary; the centre is ब्रह्मस्थान. */
export function zoneLabel(zone: VastuZone, lang: 'hi' | 'en'): string {
  if (zone === 'center') return lang === 'hi' ? 'ब्रह्मस्थान' : 'Centre';
  return DISHA_LABELS[zone][lang];
}
