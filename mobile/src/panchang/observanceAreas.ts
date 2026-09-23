/**
 * क्षेत्र — where an observance is chiefly kept (the area tag + list filter).
 *
 * This is DISPLAY metadata, and that is the whole contract. It never decides
 * whether a rule is shown: a universal rule tagged `rajasthan` is still on every
 * user's calendar, exactly as before. What hides a rule is a `lens`
 * (`panchang/lenses.ts`, RULEBOOK §23a.5), and a lensed rule's lens doubles as
 * its area here so the two can never disagree.
 *
 * A rule with no area is pan-India (सर्वत्र). Tag only what the rule's own
 * description already says — the state, the city, the community it names —
 * never a guess, and never every region at once (that is just "pan-India").
 *
 * The area ids ARE the lens ids, so names come from the same lazily-loaded
 * registry and a future lens for a region inherits its tagged rules' label.
 */
import { LENS_IDS, type ObservanceLens } from './lenses';
import type { ObservanceRule } from './types';

export const OBSERVANCE_AREAS: Readonly<Record<string, readonly ObservanceLens[]>> = {
  // Rajasthan — PRD-42 wave 1 and the Rajasthani Chauth / Shitala days
  gangaur: ['rajasthan'],
  'goga-navami': ['rajasthan', 'punjab-haryana'],
  'ramdev-jayanti': ['rajasthan'],
  'teja-dashami': ['rajasthan'],
  'bachh-baras': ['rajasthan'],
  'sakat-chauth': ['rajasthan'],
  'asha-dashami': ['rajasthan'],
  'bhadwa-chauth': ['rajasthan'],
  'shitala-saptami': ['rajasthan'],
  'shitala-ashtami': ['rajasthan', 'punjab-haryana', 'gujarat'],
  'dasha-mata-vrat': ['rajasthan', 'gujarat'],
  'bahula-chaturthi': ['gujarat'],
  // Bihar / Mithila / Jharkhand / Purvanchal
  'chhath-puja': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  'chaiti-chhath': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  'chitragupta-puja': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  'jivitputrika-vrat': ['bihar-mithila', 'jharkhand'],
  madhushravani: ['bihar-mithila'],
  'sama-chakeva': ['bihar-mithila'],
  'hal-shashthi': ['braj-awadh-kashi', 'bihar-mithila', 'bundelkhand-malwa'],
  'vishwakarma-puja': ['bengal', 'odisha', 'bihar-mithila', 'jharkhand'],
  // Braj · Awadh · Kashi · Prayag
  'radha-ashtami': ['braj-awadh-kashi'],
  gopashtami: ['braj-awadh-kashi'],
  'phulera-dooj': ['braj-awadh-kashi'],
  'surdas-jayanti': ['braj-awadh-kashi'],
  'varaha-jayanti': ['braj-awadh-kashi'],
  'tulsidas-jayanti': ['braj-awadh-kashi'],
  'kabir-jayanti': ['braj-awadh-kashi'],
  'annapurna-jayanti': ['braj-awadh-kashi'],
  'kaal-bhairav-jayanti': ['braj-awadh-kashi', 'bundelkhand-malwa'],
  'mauni-amavasya': ['braj-awadh-kashi'],
  'magha-purnima': ['braj-awadh-kashi'],
  'vallabhacharya-jayanti': ['rajasthan', 'gujarat', 'braj-awadh-kashi'],
  // Malwa / Madhya Pradesh
  'rang-panchami': ['bundelkhand-malwa', 'maharashtra'],
  'baglamukhi-jayanti': ['bundelkhand-malwa'],
  'narmada-jayanti': ['bundelkhand-malwa'],
  // Punjab · Haryana
  'valmiki-jayanti': ['punjab-haryana'],
  // West
  'ganesh-jayanti': ['maharashtra', 'goa-konkan'],
  'champa-shashthi': ['maharashtra', 'karnataka'],
  // South
  'ratha-saptami': ['tamil', 'karnataka', 'telugu'],
  'hanuman-jayanti-kartik': ['telugu', 'karnataka', 'tamil'],
  'hayagriva-jayanti': ['tamil', 'karnataka', 'telugu'],
  'vamana-jayanti': ['kerala'],
  'shankaracharya-jayanti': ['kerala', 'karnataka'],
  'avani-avittam': ['tamil', 'kerala', 'telugu'],
  'chitra-pournami': ['tamil', 'kerala'],
  'karthigai-deepam': ['tamil'],
  'thai-pusam': ['tamil'],
  'panguni-uthiram': ['tamil'],
  'vaikasi-visakam': ['tamil'],
  'karkidaka-vavu': ['kerala'],
  // Traditions
  'mahavir-jayanti': ['jain'],
};

const NO_AREAS: readonly ObservanceLens[] = [];

/** The areas a rule is tagged with, in registry order; empty ⇒ pan-India. */
export function getObservanceAreas(rule: Pick<ObservanceRule, 'id' | 'lens'>): readonly ObservanceLens[] {
  const tagged = rule.lens?.length ? rule.lens : OBSERVANCE_AREAS[rule.id];
  if (!tagged || tagged.length === 0) return NO_AREAS;
  return LENS_IDS.filter((id) => tagged.includes(id));
}

/** The filter value: every row, only pan-India rows, or one area. */
export type AreaFilter = 'all' | 'pan-india' | ObservanceLens;

export function matchesAreaFilter(rule: Pick<ObservanceRule, 'id' | 'lens'>, filter: AreaFilter): boolean {
  if (filter === 'all') return true;
  const areas = getObservanceAreas(rule);
  if (filter === 'pan-india') return areas.length === 0;
  return areas.includes(filter);
}

/** Areas present in `rules`, in registry order — the chips a list offers. */
export function areasPresent(rules: readonly Pick<ObservanceRule, 'id' | 'lens'>[]): ObservanceLens[] {
  const seen = new Set<ObservanceLens>();
  for (const rule of rules) for (const area of getObservanceAreas(rule)) seen.add(area);
  return LENS_IDS.filter((id) => seen.has(id));
}
