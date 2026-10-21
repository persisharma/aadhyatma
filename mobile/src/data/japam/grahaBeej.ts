import type { Graha } from '@/panchang/kundali';

/**
 * Each graha's beej mantra as a japam entry (`japam.json`). The Kundali upay
 * panel and the Dasha tab open these counters; `grahaBeejJapa.test.ts` pins
 * each entry's line to the jyotishi-approved `GRAHA_UPAY` row, so the counter
 * never chants a different text from the one the upay names.
 */
export const GRAHA_BEEJ_JAPA_ID: Readonly<Record<Graha, string>> = {
  sun: 'surya-beej-mantra',
  moon: 'chandra-beej-mantra',
  mars: 'mangal-beej-mantra',
  mercury: 'budh-beej-mantra',
  jupiter: 'guru-beej-mantra',
  venus: 'shukra-beej-mantra',
  saturn: 'shani-beej-mantra',
  rahu: 'rahu-beej-mantra',
  ketu: 'ketu-beej-mantra',
};
