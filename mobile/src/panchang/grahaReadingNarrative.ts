/**
 * Graha-by-graha reading — the NARRATIVE voice (design.md §78).
 *
 * The legacy card (`grahaReading.ts` + `grahaReadingContent.ts`) assembles a
 * card from fixed (graha × house) bullet cells, so the body barely changes with
 * the chart. This is the replacement: a hand-written lead narrative keyed on
 * BOTH the house AND the graha's dignity bucket — so a strong and a weak
 * placement genuinely read differently — plus a deterministic modifier layer
 * that weaves in the chart-specific facts the core cannot know (lordship,
 * combustion, retrograde). Pure: factors in, prose out.
 *
 * One module per graha under `narrative/` (so each can be reviewed and signed
 * off on its own, RULEBOOK §14.7.10); this file assembles them. Generic graha
 * facts (nature, maitri, karaka) live on the "Know the nine grahas" reference
 * (`grahaReference.ts`, §79), NOT here — this card is the reading for THIS chart.
 */

import type { Graha } from './kundali';
import type { Dignity, Maitri } from './kundaliBasis';
import { KETU_MODIFIERS, KETU_NARRATIVE } from './narrative/ketu';
import { JUPITER_MODIFIERS, JUPITER_NARRATIVE } from './narrative/jupiter';
import { MARS_MODIFIERS, MARS_NARRATIVE } from './narrative/mars';
import { MERCURY_MODIFIERS, MERCURY_NARRATIVE } from './narrative/mercury';
import { MOON_MODIFIERS, MOON_NARRATIVE } from './narrative/moon';
import { RAHU_MODIFIERS, RAHU_NARRATIVE } from './narrative/rahu';
import { SATURN_MODIFIERS, SATURN_NARRATIVE } from './narrative/saturn';
import { SUN_MODIFIERS, SUN_NARRATIVE } from './narrative/sun';
import { VENUS_MODIFIERS, VENUS_NARRATIVE } from './narrative/venus';
import { dignityBucket, type DignityBucket, type GrahaModifiers, type GrahaNarrativeTable, type NarrativeCell } from './narrative/types';
import { BHAVA_ORDINAL_HI, ordinalEn } from './reportFormat';

export { dignityBucket };
export type { DignityBucket, NarrativeCell };

export type NarrativeInput = {
  graha: Graha;
  /** 1..12 */
  house: number;
  dignity: Dignity;
  relation: Maitri | null;
  /** Houses this graha rules for the Lagna, ascending. */
  ruledHouses: readonly number[];
  /** Within the combustion orb of the Sun. */
  combust: boolean;
  retrograde: boolean;
};

export type GrahaNarrative = {
  leadHi: string;
  leadEn: string;
  tendHi: string;
  tendEn: string;
};

const NARRATIVE_TABLES: Partial<Record<Graha, GrahaNarrativeTable>> = {
  sun: SUN_NARRATIVE,
  moon: MOON_NARRATIVE,
  mars: MARS_NARRATIVE,
  mercury: MERCURY_NARRATIVE,
  jupiter: JUPITER_NARRATIVE,
  venus: VENUS_NARRATIVE,
  saturn: SATURN_NARRATIVE,
  rahu: RAHU_NARRATIVE,
  ketu: KETU_NARRATIVE,
};

const MODIFIER_TABLES: Partial<Record<Graha, GrahaModifiers>> = {
  sun: SUN_MODIFIERS,
  moon: MOON_MODIFIERS,
  mars: MARS_MODIFIERS,
  mercury: MERCURY_MODIFIERS,
  jupiter: JUPITER_MODIFIERS,
  venus: VENUS_MODIFIERS,
  saturn: SATURN_MODIFIERS,
  rahu: RAHU_MODIFIERS,
  ketu: KETU_MODIFIERS,
};

/** The grahas whose cards use the narrative voice — every graha with a table. */
export const NARRATIVE_GRAHAS: ReadonlySet<Graha> = new Set(Object.keys(NARRATIVE_TABLES) as Graha[]);

/** The ruled houses as one label: `10th house` / `1st and 2nd houses`, `दशम भाव` / `प्रथम और द्वितीय भाव`. */
function ruledHousesLabel(houses: readonly number[], hi: boolean): string {
  if (hi) return `${houses.map((house) => BHAVA_ORDINAL_HI[house - 1]).join(' और ')} भाव`;
  const ordinals = houses.map((house) => ordinalEn(house));
  return ordinals.length === 1 ? `${ordinals[0]} house` : `${ordinals.join(' and ')} houses`;
}

/**
 * Compose the narrative reading for a placement: the hand-written core cell for
 * (house × dignity bucket), then the deterministic modifier sentences for the
 * chart-specific facts the core cannot know. Returns null for grahas with no
 * narrative table or an out-of-range house.
 */
export function composeNarrative(input: NarrativeInput): GrahaNarrative | null {
  const table = NARRATIVE_TABLES[input.graha];
  const modifiers = MODIFIER_TABLES[input.graha];
  if (!table || !modifiers) return null;
  if (input.house < 1 || input.house > 12) return null;

  const bucket = dignityBucket(input.dignity, input.relation);
  const cell = table[input.house - 1][bucket];

  const leadHi: string[] = [cell.leadHi];
  const leadEn: string[] = [cell.leadEn];

  if (modifiers.lordship && input.ruledHouses.length >= 1) {
    leadHi.push(modifiers.lordship.hi(ruledHousesLabel(input.ruledHouses, true)));
    leadEn.push(modifiers.lordship.en(ruledHousesLabel(input.ruledHouses, false)));
  }
  if (input.combust && modifiers.combust) {
    leadHi.push(modifiers.combust.hi);
    leadEn.push(modifiers.combust.en);
  }
  if (input.retrograde && modifiers.retrograde) {
    leadHi.push(modifiers.retrograde.hi);
    leadEn.push(modifiers.retrograde.en);
  }

  return {
    leadHi: leadHi.join(' '),
    leadEn: leadEn.join(' '),
    tendHi: cell.tendHi,
    tendEn: cell.tendEn,
  };
}
