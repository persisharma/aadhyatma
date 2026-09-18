/**
 * The क्षेत्रीय पंचांग display registry and seeding maps (PRD-42 §4.1–4.2).
 *
 * SPLIT OUT OF `lenses.ts` ON PURPOSE, and for the same reason `pincodes.ts`
 * keeps its 700 KB table behind a lazy `require`: `panchangPrefs.ts` reads the
 * stored lens set on the LAUNCH PATH, so whatever `lenses.ts` imports is
 * evaluated before the first frame. The launch path needs only the ids — it must
 * decide whether a stored string is still a lens this build ships. The bilingual
 * names, the examples, the group labels and the two seeding tables are needed
 * only when the sheet opens or when a city seeds, both of which happen after
 * interactions settle.
 *
 * So NOTHING on the launch path may import this module statically. Reach it
 * through `getLensDefinition` / `lensesForLocation` in `lenses.ts`, which require
 * it lazily; `launchGraph.test.ts` fails the build if that rule is broken.
 */
import type { ObservanceLens } from './lenses';

export type LensGroup = 'north' | 'east' | 'west' | 'south' | 'tradition';

export type LensDefinition = {
  id: ObservanceLens;
  nameHi: string;
  nameEn: string;
  group: LensGroup;
  /** Two or three observances this lens is recognisable by — the sheet's one-line subtitle. */
  exampleHi: string;
  exampleEn: string;
};

export const LENS_GROUP_LABELS: Record<LensGroup, { hi: string; en: string }> = {
  north: { hi: 'उत्तर', en: 'North' },
  east: { hi: 'पूर्व', en: 'East' },
  west: { hi: 'पश्चिम', en: 'West' },
  south: { hi: 'दक्षिण', en: 'South' },
  tradition: { hi: 'परंपरा', en: 'Tradition' },
};

/** Render order of the groups in the sheet. */
export const LENS_GROUP_ORDER: readonly LensGroup[] = ['north', 'east', 'west', 'south', 'tradition'];

/**
 * The registry. Order inside a group is the order the sheet renders.
 *
 * The examples are deliberately observances the lens would ADD, not ones that
 * already ship: a user scanning the sheet is deciding whether this calendar is
 * theirs, and naming Diwali under `bengal` would tell them nothing.
 */
export const LENS_REGISTRY: readonly LensDefinition[] = [
  // ── North ──
  { id: 'rajasthan', group: 'north', nameHi: 'राजस्थान', nameEn: 'Rajasthan', exampleHi: 'गोगा नवमी · गणगौर · खेतसीमावस', exampleEn: 'Goga Navami · Gangaur · Khetsimavas' },
  { id: 'braj-awadh-kashi', group: 'north', nameHi: 'ब्रज · अवध · काशी', nameEn: 'Braj · Awadh · Kashi', exampleHi: 'बरसाना लट्ठमार · रंगभरी एकादशी', exampleEn: 'Barsana Lathmar · Rangbhari Ekadashi' },
  { id: 'bundelkhand-malwa', group: 'north', nameHi: 'बुंदेलखंड · मालवा', nameEn: 'Bundelkhand · Malwa', exampleHi: 'कजलियाँ · अक्ति', exampleEn: 'Kajaliyan · Akti' },
  { id: 'punjab-haryana', group: 'north', nameHi: 'पंजाब · हरियाणा', nameEn: 'Punjab · Haryana', exampleHi: 'लोहड़ी · तीयाँ', exampleEn: 'Lohri · Teeyan' },
  { id: 'uttarakhand', group: 'north', nameHi: 'उत्तराखंड', nameEn: 'Uttarakhand', exampleHi: 'हरेला · इगास बग्वाल', exampleEn: 'Harela · Igas Bagwal' },
  { id: 'himachal', group: 'north', nameHi: 'हिमाचल', nameEn: 'Himachal', exampleHi: 'कुल्लू दशहरा · मिंजर', exampleEn: 'Kullu Dussehra · Minjar' },
  { id: 'kashmir', group: 'north', nameHi: 'कश्मीर', nameEn: 'Kashmir', exampleHi: 'हेरथ · नवरेह', exampleEn: 'Herath · Navreh' },
  // ── East ──
  { id: 'bihar-mithila', group: 'east', nameHi: 'बिहार · मिथिला', nameEn: 'Bihar · Mithila', exampleHi: 'सामा चकेवा · जुड़ शीतल', exampleEn: 'Sama Chakeva · Jur Sital' },
  { id: 'jharkhand', group: 'east', nameHi: 'झारखंड', nameEn: 'Jharkhand', exampleHi: 'सरहुल · करमा', exampleEn: 'Sarhul · Karma' },
  { id: 'chhattisgarh', group: 'east', nameHi: 'छत्तीसगढ़', nameEn: 'Chhattisgarh', exampleHi: 'हरेली · पोला · नवाखाई', exampleEn: 'Hareli · Pola · Nuakhai' },
  { id: 'bengal', group: 'east', nameHi: 'बंगाल', nameEn: 'Bengal', exampleHi: 'काली पूजा · जगद्धात्री पूजा', exampleEn: 'Kali Puja · Jagaddhatri Puja' },
  { id: 'odisha', group: 'east', nameHi: 'ओडिशा', nameEn: 'Odisha', exampleHi: 'रथ यात्रा · रज पर्व · नुआखाई', exampleEn: 'Rath Yatra · Raja Parba · Nuakhai' },
  { id: 'assam-northeast', group: 'east', nameHi: 'असम · पूर्वोत्तर', nameEn: 'Assam · Northeast', exampleHi: 'बिहू · अम्बुबाची', exampleEn: 'Bihu · Ambubachi' },
  // ── West ──
  { id: 'gujarat', group: 'west', nameHi: 'गुजरात', nameEn: 'Gujarat', exampleHi: 'शीतला सातम · जयापार्वती व्रत', exampleEn: 'Shitala Satam · Jayaparvati Vrat' },
  { id: 'maharashtra', group: 'west', nameHi: 'महाराष्ट्र', nameEn: 'Maharashtra', exampleHi: 'वट पूर्णिमा · आषाढी वारी', exampleEn: 'Vat Purnima · Ashadhi Wari' },
  { id: 'goa-konkan', group: 'west', nameHi: 'गोवा · कोंकण', nameEn: 'Goa · Konkan', exampleHi: 'धालो · दिवज', exampleEn: 'Dhalo · Divja' },
  // ── South ──
  { id: 'karnataka', group: 'south', nameHi: 'कर्नाटक', nameEn: 'Karnataka', exampleHi: 'उगादि · चम्पा षष्ठी', exampleEn: 'Ugadi · Champa Shashthi' },
  { id: 'telugu', group: 'south', nameHi: 'तेलुगु', nameEn: 'Telugu', exampleHi: 'बतुकम्मा · बोनालु · अट्ला तद्दे', exampleEn: 'Bathukamma · Bonalu · Atla Tadde' },
  { id: 'tamil', group: 'south', nameHi: 'तमिऴ', nameEn: 'Tamil', exampleHi: 'कार्तिगई दीपम · कार्तिगई व्रत', exampleEn: 'Karthigai Deepam · Karthigai Vrat' },
  { id: 'kerala', group: 'south', nameHi: 'केरल', nameEn: 'Kerala', exampleHi: 'ओणम · अट्टुकाल पोंगाल', exampleEn: 'Onam · Attukal Pongala' },
  // ── Tradition ──
  { id: 'jain', group: 'tradition', nameHi: 'जैन', nameEn: 'Jain', exampleHi: 'पर्युषण · संवत्सरी · ज्ञान पंचमी', exampleEn: 'Paryushana · Samvatsari · Gyan Panchami' },
  { id: 'sindhi', group: 'tradition', nameHi: 'सिंधी', nameEn: 'Sindhi', exampleHi: 'चेटी चंड · थदड़ी', exampleEn: 'Cheti Chand · Thadri' },
];

export const LENS_COUNT = LENS_REGISTRY.length;

const LENS_BY_ID = new Map<string, LensDefinition>(LENS_REGISTRY.map((l) => [l.id, l] as const));

export function isObservanceLens(value: unknown): value is ObservanceLens {
  return typeof value === 'string' && LENS_BY_ID.has(value);
}

export function getLensDefinition(id: ObservanceLens): LensDefinition | undefined {
  return LENS_BY_ID.get(id);
}

/** The lenses of one group, in registry order. */
export function lensesInGroup(group: LensGroup): LensDefinition[] {
  return LENS_REGISTRY.filter((l) => l.group === group);
}

// ──────────────────────────────────────────────────────────────────────────────
// Seeding — from the city the user already chose, never from a question
// ──────────────────────────────────────────────────────────────────────────────

/**
 * City id → the lenses that city seeds, for the bundled `MAJOR_CITIES` tier.
 *
 * THREE DELIBERATE HOLES, and they are the whole privacy story of this feature:
 *
 *   - **Ujjain seeds nothing.** It is `DEFAULT_LOCATION` — the city nobody chose.
 *     A default is not a signal, and seeding from it would hand a lens to every
 *     user who never opened the picker.
 *   - **Delhi and Chandigarh seed nothing.** They are the default calendar plus
 *     everyone else's; there is no "Delhi calendar" that differs from what ships.
 *   - **`jain` and `sindhi` appear nowhere in this map.** They are not places.
 *     Inferring either from a postcode is exactly the profiling PRD-42 refuses,
 *     so they are only ever reached by a deliberate tap in the sheet (or the
 *     जिज्ञासा answer). This is an invariant, not a gap — `lens.test.ts` fails
 *     the build if a tradition lens ever appears in any seeding path.
 *
 * A city may seed more than one lens where the calendar genuinely spans them:
 * Bengaluru is `karnataka` + `telugu` because its calendar carries both.
 */
export const CITY_LENS: Readonly<Record<string, readonly ObservanceLens[]>> = {
  // Ujjain, Delhi, Chandigarh: deliberately absent. See above.
  agra: ['braj-awadh-kashi'],
  ahmedabad: ['gujarat'],
  amritsar: ['punjab-haryana'],
  ayodhya: ['braj-awadh-kashi'],
  bengaluru: ['karnataka', 'telugu'],
  bhopal: ['bundelkhand-malwa'],
  bhubaneswar: ['odisha'],
  chennai: ['tamil'],
  coimbatore: ['tamil'],
  dehradun: ['uttarakhand'],
  dwarka: ['gujarat'],
  gaya: ['bihar-mithila'],
  guwahati: ['assam-northeast'],
  haridwar: ['uttarakhand'],
  hyderabad: ['telugu'],
  indore: ['bundelkhand-malwa'],
  jaipur: ['rajasthan'],
  jammu: ['kashmir'],
  kanpur: ['braj-awadh-kashi'],
  kochi: ['kerala'],
  kolkata: ['bengal'],
  lucknow: ['braj-awadh-kashi'],
  madurai: ['tamil'],
  mangaluru: ['karnataka'],
  mathura: ['braj-awadh-kashi'],
  mumbai: ['maharashtra'],
  nagpur: ['maharashtra'],
  nashik: ['maharashtra'],
  panaji: ['goa-konkan'],
  patna: ['bihar-mithila'],
  prayagraj: ['braj-awadh-kashi'],
  pune: ['maharashtra'],
  puri: ['odisha'],
  raipur: ['chhattisgarh'],
  rajkot: ['gujarat'],
  rameswaram: ['tamil'],
  ranchi: ['jharkhand'],
  rishikesh: ['uttarakhand'],
  shimla: ['himachal'],
  shirdi: ['maharashtra'],
  somnath: ['gujarat'],
  srinagar: ['kashmir'],
  surat: ['gujarat'],
  thiruvananthapuram: ['kerala'],
  tirupati: ['telugu'],
  vadodara: ['gujarat'],
  varanasi: ['braj-awadh-kashi'],
  vijayawada: ['telugu'],
  visakhapatnam: ['telugu'],
};

/**
 * English state name (as the pincode table spells it) → lenses.
 *
 * Used for `pin-` locations, whose stored `labelEn` ends in `, <State>` — see
 * `lensesForStoredLabel`. Delhi and Chandigarh are absent here for the same
 * reason they are absent above.
 */
export const STATE_LENS: Readonly<Record<string, readonly ObservanceLens[]>> = {
  'andhra pradesh': ['telugu'],
  'arunachal pradesh': ['assam-northeast'],
  assam: ['assam-northeast'],
  bihar: ['bihar-mithila'],
  chhattisgarh: ['chhattisgarh'],
  goa: ['goa-konkan'],
  gujarat: ['gujarat'],
  haryana: ['punjab-haryana'],
  'himachal pradesh': ['himachal'],
  'jammu and kashmir': ['kashmir'],
  jharkhand: ['jharkhand'],
  karnataka: ['karnataka'],
  kerala: ['kerala'],
  ladakh: ['kashmir'],
  'madhya pradesh': ['bundelkhand-malwa'],
  maharashtra: ['maharashtra'],
  manipur: ['assam-northeast'],
  meghalaya: ['assam-northeast'],
  mizoram: ['assam-northeast'],
  nagaland: ['assam-northeast'],
  odisha: ['odisha'],
  punjab: ['punjab-haryana'],
  rajasthan: ['rajasthan'],
  sikkim: ['assam-northeast'],
  'tamil nadu': ['tamil'],
  telangana: ['telugu'],
  tripura: ['assam-northeast'],
  'uttar pradesh': ['braj-awadh-kashi'],
  uttarakhand: ['uttarakhand'],
  'west bengal': ['bengal'],
};

/** Every Rajasthan tehsil is, by construction, Rajasthan. */
const RAJASTHAN_SEED: readonly ObservanceLens[] = ['rajasthan'];

/**
 * What a chosen location seeds, or `[]` for the three holes and anything unknown.
 *
 * `isTehsil` distinguishes the Rajasthan tehsil tier (any `City` carrying a
 * district — see `locations.ts`) without importing the 342-row table here.
 * `labelEn` is the stored pincode label, whose tail after the last comma is the
 * state; a bundled city has no label to parse and is answered by `CITY_LENS`.
 */
export function lensesForLocation(input: {
  cityId: string;
  isTehsil?: boolean;
  labelEn?: string;
}): readonly ObservanceLens[] {
  const direct = CITY_LENS[input.cityId];
  if (direct) return direct;
  if (input.isTehsil) return RAJASTHAN_SEED;
  if (input.labelEn) return lensesForStoredLabel(input.labelEn);
  return [];
}

/**
 * Seed from a pincode location's own label — `416001 · Kolhapur, Maharashtra`.
 *
 * The pincode table carries `stateEn` but lives behind a lazy 700 KB require that
 * must never reach the launch path, and the stored record is self-describing by
 * the same rule (`panchangPrefs.parseStoredPincodeLocation`). So the state is read
 * back off the label the record already carries. An unrecognised tail seeds
 * nothing, which is the correct failure: a wrong lens is worse than no lens.
 */
export function lensesForStoredLabel(labelEn: string): readonly ObservanceLens[] {
  const tail = labelEn.split(',').pop();
  if (!tail) return [];
  return STATE_LENS[tail.trim().toLowerCase()] ?? [];
}
