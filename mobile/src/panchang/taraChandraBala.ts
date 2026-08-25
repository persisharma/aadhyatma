/**
 * Tarabala / Chandrabala — personalised muhurat annotation (PRD-16 Phase 4).
 *
 * PURE integer arithmetic over two indices each; no astronomy, no storage, no
 * React (source-purity test). The saved-Kundali derivation and the evaluation
 * instant live in `useMuhuratBala` — this module never sees a profile.
 *
 * ⚠ CONTENT GATE: every class row below is DRAFT until pinned row-for-row in
 * docs/roadmap/conventions/muhurat-tarabala-v1.md with two dated sources
 * (RULEBOOK §14/§17 — a release gate exactly like the masa tables).
 *
 * ⚠ RELATED ARITHMETIC, DIFFERENT CONVENTION: `gunaMilanConvention.ts` ships a
 * *Tara koota* (bidirectional, half-scores, per the modern Ashtakoota) —
 * NEVER reuse its matrix here. The two deliberately diverge (e.g. the जन्म
 * tara is contested for muhurat but scores favourably in the koota); the
 * divergence is asserted by test and named in the convention doc.
 *
 * ANNOTATES, NEVER RE-GRADES (§8.3): nothing in this module or its callers
 * may change a day's tier, exclude a day, or reorder results.
 */
import { NAKSHATRA_SPAN } from './kundali';

export type Tara = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type TaraClass = 'favourable' | 'unfavourable' | 'contested';

export const TARA_NAMES_HI: readonly string[] = [
  'जन्म',
  'सम्पत्',
  'विपत्',
  'क्षेम',
  'प्रत्यरि',
  'साधक',
  'वध',
  'मित्र',
  'परम मित्र',
];

export const TARA_NAMES_EN: readonly string[] = [
  'Janma',
  'Sampat',
  'Vipat',
  'Kshema',
  'Pratyari',
  'Sadhaka',
  'Vadha',
  'Mitra',
  'Parama Mitra',
];

/**
 * Draft tara classes (index = tara − 1): विपत् (3), प्रत्यरि (5), वध (7)
 * unfavourable; जन्म (1) CONTESTED — schools split, some bar it outright, some
 * admit it for specific activities (open question §14.3); the rest favourable.
 */
const TARA_CLASSES: readonly TaraClass[] = [
  'contested',
  'favourable',
  'unfavourable',
  'favourable',
  'unfavourable',
  'favourable',
  'unfavourable',
  'favourable',
  'favourable',
];

/**
 * Draft chandra classes (index = position − 1): 1·3·6·7·10·11 favourable,
 * 4·8·12 unfavourable (the 8th — चंद्राष्टम — is the strongest bar the strip
 * can word), 2·5·9 contested-middling.
 */
const CHANDRA_CLASSES: readonly TaraClass[] = [
  'favourable',
  'contested',
  'favourable',
  'unfavourable',
  'contested',
  'favourable',
  'favourable',
  'unfavourable',
  'contested',
  'favourable',
  'favourable',
  'unfavourable',
];

/** चंद्राष्टम — the 8th position from the janma rashi. */
export const CHANDRASHTAMA_POSITION = 8;

/**
 * Tarabala: count INCLUSIVELY from the janma nakshatra to the day's nakshatra
 * in the 27-cycle, reduce through the 9-fold tara cycle
 * (`tara = ((count − 1) mod 9) + 1`).
 */
export function tarabala(
  janmaNakshatraIndex: number,
  dayNakshatraIndex: number
): { tara: Tara; cls: TaraClass } {
  const count = ((dayNakshatraIndex - janmaNakshatraIndex + 27) % 27) + 1;
  const tara = ((((count - 1) % 9) + 1) as Tara);
  return { tara, cls: TARA_CLASSES[tara - 1] };
}

/**
 * Chandrabala: the day Moon's rashi counted inclusively from the janma rashi
 * (1…12).
 */
export function chandrabala(
  janmaRashiIndex: number,
  dayMoonRashiIndex: number
): { position: number; cls: TaraClass } {
  const position = ((dayMoonRashiIndex - janmaRashiIndex + 12) % 12) + 1;
  return { position, cls: CHANDRA_CLASSES[position - 1] };
}

/**
 * Janma nakshatra + rashi from a sidereal Moon longitude — the same flooring
 * `gunaMilan`'s moonPosition applies (13°20′ nakshatras, 30° rashis).
 */
export function janmaFromMoonLongitude(moonLongitude: number): {
  nakshatraIndex: number;
  rashiIndex: number;
} {
  return {
    nakshatraIndex: Math.floor(moonLongitude / NAKSHATRA_SPAN) % 27,
    rashiIndex: Math.floor(moonLongitude / 30) % 12,
  };
}
