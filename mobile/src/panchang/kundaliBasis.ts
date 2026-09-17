import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
} from './kundali';
import type { Graha, GrahaPosition, KundaliChart } from './kundali';
import { ageYears, bhavaLabelEn, bhavaLabelHi, formatIstDateEn, formatIstDateHi } from './reportFormat';

/**
 * The evidence primitive behind every interpretive sentence (RULEBOOK §14.3.1).
 *
 * A `BasisNode` names ONE chart fact a reading was derived from — a bhava, a
 * lord's placement, a graha with its dignity, a named yoga, a running dasha
 * lord, or a transit as of a date. Readings carry an ordered list of them in
 * the order a reader would follow; the UI renders that list as the आधार
 * chain and a test fails the build when a reading's list is empty. Plain
 * JSON only: this rides inside `KundaliReportModel` and the प्रश्न answer.
 *
 * The classical tables below (dignity, naisargika maitri, house classes) are
 * the shared vocabulary for `kundaliYoga.ts`, `dashaReading.ts` and
 * `prashna.ts`, so a placement is never graded two different ways.
 */

export type Dignity = 'exalted' | 'own' | 'debilitated' | 'neutral';

export type BasisNode =
  | { kind: 'bhava'; house: number; rashiIndex: number }
  | { kind: 'lord'; graha: Graha; ofHouse: number; inHouse: number }
  | { kind: 'graha'; graha: Graha; house: number; dignity: Dignity; retrograde?: boolean }
  | { kind: 'yoga'; yogaId: string }
  | { kind: 'dasha'; level: 'maha' | 'antar'; lord: Graha; startKey: string; endKey: string }
  | { kind: 'gochar'; graha: Graha; fromMoonHouse: number; asOfKey: string }
  | { kind: 'relation'; from: Graha; to: Graha; relation: Maitri };

export type Maitri = 'friend' | 'neutral' | 'enemy';

export const KENDRA_HOUSES: readonly number[] = [1, 4, 7, 10];
export const TRIKONA_HOUSES: readonly number[] = [1, 5, 9];
export const DUSTHANA_HOUSES: readonly number[] = [6, 8, 12];
export const UPACHAYA_HOUSES: readonly number[] = [3, 6, 10, 11];

/** Classical exaltation signs (rashi index). Rahu/Ketu omitted: conventions
 * differ (Vrishabha/Mithuna vs Vrischika/Dhanu) and neither is used to grade. */
const EXALTATION: Partial<Record<Graha, number>> = {
  sun: 0,
  moon: 1,
  mars: 9,
  mercury: 5,
  jupiter: 3,
  venus: 11,
  saturn: 6,
};

/** Own signs — the inverse of `RASHI_LORD` in `kundaliReport.ts`, kept here so
 * the dignity table has no import cycle with the report. */
const OWN_SIGNS: Partial<Record<Graha, readonly number[]>> = {
  sun: [4],
  moon: [3],
  mars: [0, 7],
  mercury: [2, 5],
  jupiter: [8, 11],
  venus: [1, 6],
  saturn: [9, 10],
};

export function dignityOf(graha: Graha, rashiIndex: number): Dignity {
  const exalted = EXALTATION[graha];
  if (exalted === undefined) return 'neutral';
  if (rashiIndex === exalted) return 'exalted';
  if (rashiIndex === (exalted + 6) % 12) return 'debilitated';
  if (OWN_SIGNS[graha]?.includes(rashiIndex)) return 'own';
  return 'neutral';
}

export function dignityOfPosition(position: GrahaPosition): Dignity {
  return dignityOf(position.graha, position.rashiIndex);
}

export const DIGNITY_LABEL_HI: Readonly<Record<Dignity, string>> = {
  exalted: 'उच्च',
  own: 'स्वराशि',
  debilitated: 'नीच',
  neutral: 'सम',
};

export const DIGNITY_LABEL_EN: Readonly<Record<Dignity, string>> = {
  exalted: 'exalted',
  own: 'own sign',
  debilitated: 'debilitated',
  neutral: 'neutral',
};

/**
 * Naisargika (natural) maitri, Brihat Parashara Hora Shastra — the row is the
 * viewing graha, the columns are whom it counts as friend / enemy; everyone
 * else is neutral. Rahu and Ketu have no BPHS row; the entries here are the
 * common modern convention and are marked DRAFT in
 * docs/roadmap/conventions/dasha-maitri-v1.md until two sources concur.
 */
const MAITRI: Readonly<Record<Graha, { friends: readonly Graha[]; enemies: readonly Graha[] }>> = {
  sun: { friends: ['moon', 'mars', 'jupiter'], enemies: ['venus', 'saturn'] },
  moon: { friends: ['sun', 'mercury'], enemies: [] },
  mars: { friends: ['sun', 'moon', 'jupiter'], enemies: ['mercury'] },
  mercury: { friends: ['sun', 'venus'], enemies: ['moon'] },
  jupiter: { friends: ['sun', 'moon', 'mars'], enemies: ['mercury', 'venus'] },
  venus: { friends: ['mercury', 'saturn'], enemies: ['sun', 'moon'] },
  saturn: { friends: ['mercury', 'venus'], enemies: ['sun', 'moon', 'mars'] },
  rahu: { friends: ['venus', 'saturn', 'mercury'], enemies: ['sun', 'moon', 'mars'] },
  ketu: { friends: ['mars', 'venus', 'saturn'], enemies: ['sun', 'moon'] },
};

/** How `from` regards `to` — asymmetric, as the classical table is. */
export function maitriOf(from: Graha, to: Graha): Maitri {
  if (from === to) return 'friend';
  const row = MAITRI[from];
  if (row.friends.includes(to)) return 'friend';
  if (row.enemies.includes(to)) return 'enemy';
  return 'neutral';
}

export const MAITRI_LABEL_HI: Readonly<Record<Maitri, string>> = {
  friend: 'मित्र',
  neutral: 'सम',
  enemy: 'शत्रु',
};

export const MAITRI_LABEL_EN: Readonly<Record<Maitri, string>> = {
  friend: 'friend',
  neutral: 'neutral',
  enemy: 'adversary',
};

export type AgeBand = 'child' | 'adolescent' | 'adult';

/** Derived at read time from the chart's birth instant — never stored. */
export function ageBandAt(chart: KundaliChart, at: Date): AgeBand {
  const years = ageYears(chart.input.date, at);
  if (years < 13) return 'child';
  if (years < 18) return 'adolescent';
  return 'adult';
}

export function houseClassHi(house: number): string {
  if (house === 1) return 'लग्न';
  if (KENDRA_HOUSES.includes(house)) return 'केन्द्र';
  if (TRIKONA_HOUSES.includes(house)) return 'त्रिकोण';
  if (DUSTHANA_HOUSES.includes(house)) return 'दुःस्थान';
  return 'अन्य भाव';
}

export function houseClassEn(house: number): string {
  if (house === 1) return 'the Lagna';
  if (KENDRA_HOUSES.includes(house)) return 'a kendra';
  if (TRIKONA_HOUSES.includes(house)) return 'a trikona';
  if (DUSTHANA_HOUSES.includes(house)) return 'a dusthana';
  return 'a neutral house';
}

/** One short label per node — the chip text of the आधार chain. */
export function basisLabelHi(node: BasisNode): string {
  switch (node.kind) {
    case 'bhava':
      return `${bhavaLabelHi(node.house)} = ${RASHI_NAMES_HI[node.rashiIndex]}`;
    case 'lord':
      return `${bhavaLabelHi(node.ofHouse)} का स्वामी ${GRAHA_NAMES_HI[node.graha]} · ${bhavaLabelHi(node.inHouse)} में`;
    case 'graha':
      return `${GRAHA_NAMES_HI[node.graha]} · ${bhavaLabelHi(node.house)}${node.dignity !== 'neutral' ? ` · ${DIGNITY_LABEL_HI[node.dignity]}` : ''}${node.retrograde ? ' · वक्री' : ''}`;
    case 'yoga':
      return `योग · ${node.yogaId}`;
    case 'dasha':
      return `${GRAHA_NAMES_HI[node.lord]} ${node.level === 'maha' ? 'महादशा' : 'अन्तर्दशा'} · ${formatIstDateHi(new Date(node.startKey))} → ${formatIstDateHi(new Date(node.endKey))}`;
    case 'gochar':
      return `गोचर ${GRAHA_NAMES_HI[node.graha]} · चन्द्र से ${bhavaLabelHi(node.fromMoonHouse)} · ${formatIstDateHi(new Date(node.asOfKey))}`;
    case 'relation':
      return `${GRAHA_NAMES_HI[node.from]} के लिए ${GRAHA_NAMES_HI[node.to]} ${MAITRI_LABEL_HI[node.relation]}`;
  }
}

export function basisLabelEn(node: BasisNode): string {
  switch (node.kind) {
    case 'bhava':
      return `${bhavaLabelEn(node.house)} = ${RASHI_NAMES_EN[node.rashiIndex]}`;
    case 'lord':
      return `lord of ${bhavaLabelEn(node.ofHouse)} ${GRAHA_NAMES_EN[node.graha]} · in ${bhavaLabelEn(node.inHouse)}`;
    case 'graha':
      return `${GRAHA_NAMES_EN[node.graha]} · ${bhavaLabelEn(node.house)}${node.dignity !== 'neutral' ? ` · ${DIGNITY_LABEL_EN[node.dignity]}` : ''}${node.retrograde ? ' · retrograde' : ''}`;
    case 'yoga':
      return `yoga · ${node.yogaId}`;
    case 'dasha':
      return `${GRAHA_NAMES_EN[node.lord]} ${node.level === 'maha' ? 'Mahadasha' : 'Antardasha'} · ${formatIstDateEn(new Date(node.startKey))} → ${formatIstDateEn(new Date(node.endKey))}`;
    case 'gochar':
      return `transit ${GRAHA_NAMES_EN[node.graha]} · ${bhavaLabelEn(node.fromMoonHouse)} from Moon · ${formatIstDateEn(new Date(node.asOfKey))}`;
    case 'relation':
      return `${GRAHA_NAMES_EN[node.to]} is a ${MAITRI_LABEL_EN[node.relation]} to ${GRAHA_NAMES_EN[node.from]}`;
  }
}

/** Convenience: the house theme pair, used by every composer. */
export function houseTheme(house: number): { hi: string; en: string } {
  return { hi: HOUSE_THEME_HI[house - 1], en: HOUSE_THEME_EN[house - 1] };
}
