/**
 * क्षेत्रीय पंचांग region tags — WHOSE a universal observance is (PRD-42 §4.1
 * follow-up, RULEBOOK §23a.5, design.md §73).
 *
 * `ObservanceRule.lens` decides WHO SEES a rule (additive; gates visibility).
 * This table says WHOSE a rule is: the calendars that keep it in a distinctive
 * way. Gangaur stays universal and is tagged `rajasthan` + `bundelkhand-malwa`,
 * so a user who turned राजस्थान on finds it listed under their calendar, marked
 * on the day view and counted in "what this calendar brings" — while everyone
 * else sees exactly what they saw before. **Nothing reads this table on any
 * visibility, notification or search path**; `lens.test.ts` pins that every
 * tagged rule is still in the unlensed catalog.
 *
 * WHY A SEPARATE FILE, keyed by rule id, rather than a field beside each rule in
 * `festivals.ts`: that file is on the static launch graph (`launchGraph.test.ts`)
 * and the budget is tight; the tags are needed only when a lens surface renders.
 * `vratCatalog.ts` reaches this module through a `require()` thunk — the same
 * treatment `lensRegistry.ts` gets. The test also checks every key here names a
 * real `default` rule, so a typo cannot silently drop a calendar's row.
 *
 * TAG ONLY WHERE THE RULE'S OWN DESCRIPTION OR A PUBLISHED ALIAS NAMES THE
 * REGION — never a guess. Sources are the rule's `shortDescription*`, its
 * `searchTerms` aliases (`SANKRANTI_ALIASES`, `EKADASHI_EXTRA_SEARCH_TERMS`) and
 * PRD-42 Appendix A's *alias only* rows (docs/roadmap/prds/42-regional-parv.md).
 * A region whose DISTINCT observance merely shares the tithi (Kali Puja beside
 * Diwali, Igas Bagwal beside Dev Uthani) is a sibling rule under §23.9, not a
 * tag here. A rule that carries a `lens` needs no tag: the lens already names
 * its calendar.
 */
import type { ObservanceLens } from './lenses';

export const REGION_TAGS: Readonly<Record<string, readonly ObservanceLens[]>> = {
  // ── Sankrantis — one tag per alias: Satuani → Bihar, Baisakhi → Punjab, Bohag
  // Bihu → Assam, Pohela Boishakh → Bengal, Puthandu → Tamil, Vishu → Kerala,
  // Bikhauti → Uttarakhand (A.16); Pongal → Tamil, Uttarayan → Gujarat, Maghi →
  // Punjab, Til/Khichdi → Bihar and Kashi, Sankranti → Telugu, Ellu Birodu →
  // Karnataka (A.8), Magh Bihu → Assam, Ghughutiya → Uttarakhand, Tusu → Jharkhand.
  'mesha-sankranti': ['bihar-mithila', 'punjab-haryana', 'assam-northeast', 'bengal', 'tamil', 'kerala', 'uttarakhand'],
  'makar-sankranti': ['tamil', 'gujarat', 'punjab-haryana', 'bihar-mithila', 'braj-awadh-kashi', 'telugu', 'karnataka', 'assam-northeast', 'uttarakhand', 'jharkhand'],

  // ── Ekadashis — जलझूलनी across Rajasthan and Malwa; आषाढी / कार्तिकी एकादशी, the
  // Pandharpur wari (A.2); मौन एकादशी (A.1) and वैकुण्ठ एकादशी (A.6) on Mokshada;
  // रंगभरी एकादशी in Kashi on Amalaki (A.7).
  'parivartini-ekadashi': ['rajasthan', 'bundelkhand-malwa'],
  'devshayani-ekadashi': ['maharashtra'],
  'dev-uthani-ekadashi': ['maharashtra'],
  'mokshada-ekadashi': ['jain', 'telugu'],
  'amalaki-ekadashi': ['braj-awadh-kashi'],

  // ── Festival rules, in catalog order. Each region is named in the rule's own
  // description unless a PRD-42 appendix row is cited.
  'vishwakarma-puja': ['bengal', 'odisha', 'bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  // Saraswati Puja is the day's own name across the east (A.4 alias; Bihar, Odisha, Assam keep it the same way).
  'vasant-panchami': ['bengal', 'bihar-mithila', 'odisha', 'assam-northeast'],
  'ratha-saptami': ['telugu', 'karnataka', 'tamil'],
  // Mandi's week-long Shivratri fair opens on this day (A.17: "anchor already ships").
  'maha-shivaratri': ['himachal'],
  holi: ['braj-awadh-kashi'],
  'rang-panchami': ['bundelkhand-malwa', 'maharashtra'],
  'shitala-saptami': ['rajasthan'],
  'shitala-ashtami': ['rajasthan', 'punjab-haryana', 'gujarat'],
  'dasha-mata-vrat': ['rajasthan', 'gujarat'],
  // Gudi Padwa, Ugadi, Cheti Chand are in the description; Navreh (Kashmir) is A.18.
  'chaitra-navratri-start': ['maharashtra', 'telugu', 'karnataka', 'sindhi', 'kashmir'],
  // गनगौर is an A.9 alias for Malwa.
  gangaur: ['rajasthan', 'bundelkhand-malwa'],
  'chaiti-chhath': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  'ram-navami': ['braj-awadh-kashi'],
  'mahavir-jayanti': ['jain'],
  'chitra-pournami': ['tamil', 'kerala'],
  // अक्ति — the sowing-day name in Malwa/Bundelkhand and Chhattisgarh (A.9, A.11).
  'akshaya-tritiya': ['bundelkhand-malwa', 'chhattisgarh'],
  'ganga-dussehra': ['braj-awadh-kashi', 'uttarakhand'],
  // Jaipur's Teej procession; Teeyan is the Punjab name (A.12); Sindhara Teej in Braj.
  'hariyali-teej': ['rajasthan', 'punjab-haryana', 'braj-awadh-kashi'],
  madhushravani: ['bihar-mithila'],
  'avani-avittam': ['tamil', 'kerala', 'telugu', 'maharashtra'],
  // Satudi Teej is Rajasthan's name (the Bundi fair); Kajli is the Mirzapur–Kashi tradition.
  'kajari-teej': ['rajasthan', 'braj-awadh-kashi'],
  'bahula-chaturthi': ['gujarat'],
  'bhadwa-chauth': ['rajasthan'],
  janmashtami: ['braj-awadh-kashi'],
  'goga-navami': ['rajasthan', 'punjab-haryana', 'braj-awadh-kashi'],
  'bachh-baras': ['rajasthan'],
  'ramdev-jayanti': ['rajasthan'],
  // Hartalika in Maharashtra and the Hindi belt; Swarna Gowri Habba (A.8) and तीजा (A.11) are the same day's names.
  'hartalika-teej': ['maharashtra', 'karnataka', 'chhattisgarh', 'bihar-mithila', 'braj-awadh-kashi', 'bundelkhand-malwa'],
  // Ganeshotsav is Maharashtra's signature festival; Goa keeps it as Chavath (A.19).
  'ganesh-chaturthi': ['maharashtra', 'goa-konkan'],
  'radha-ashtami': ['braj-awadh-kashi'],
  'teja-dashami': ['rajasthan'],
  'anant-chaturdashi': ['maharashtra'],
  // Bijoya Dashami (Bengal), Mysuru Dasara (Karnataka), the anchor of the Kullu (A.17) and Bastar (A.11) arcs.
  dussehra: ['bengal', 'karnataka', 'himachal', 'chhattisgarh'],
  // Kojagari Lakshmi Puja in Bengal and Mithila; Kojagiri in Maharashtra (A.2 alias).
  'kojagara-puja': ['bengal', 'bihar-mithila', 'maharashtra'],
  'karwa-chauth': ['punjab-haryana', 'rajasthan', 'braj-awadh-kashi'],
  'ahoi-ashtami': ['braj-awadh-kashi', 'punjab-haryana', 'rajasthan'],
  'hanuman-jayanti-kartik': ['telugu', 'karnataka', 'tamil'],
  'chitragupta-puja': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  'chhath-puja': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
  'sama-chakeva': ['bihar-mithila'],
  // ಉತ್ಥಾನ ದ್ವಾದಶಿ is Karnataka's name for this day (A.8 alias).
  'tulasi-vivah': ['karnataka', 'maharashtra'],
  gopashtami: ['braj-awadh-kashi'],
  // Dev Deepawali is Kashi's; the Pushkar and Sonepur fairs and the Sama Chakeva immersion are in the description.
  'kartik-purnima': ['braj-awadh-kashi', 'rajasthan', 'bihar-mithila'],
  // Janakpur–Mithila and Ayodhya keep the wedding day as their own.
  'vivah-panchami': ['bihar-mithila', 'braj-awadh-kashi'],
  'champa-shashthi': ['maharashtra', 'karnataka', 'goa-konkan'],
  'karthigai-deepam': ['tamil'],
  'thai-pusam': ['tamil'],
  'panguni-uthiram': ['tamil'],
  'vaikasi-visakam': ['tamil'],
  'karkidaka-vavu': ['kerala'],

  // ── Monthly / seasonal vrats.
  // The monthly Sankashti — and its Tuesday अंगारकी — is kept most widely in Maharashtra.
  'sankashti-chaturthi-vrat': ['maharashtra'],
  // The monthly Kanda Sashti of the Murugan shrines.
  'skanda-sashti': ['tamil'],
  // The Friday-before-Shravana-Purnima vrat of the South.
  'varalakshmi-vrat': ['telugu', 'karnataka', 'tamil'],
  // Jitiya — the mothers' nirjala vrat of Bihar, Jharkhand and eastern UP.
  'jivitputrika-vrat': ['bihar-mithila', 'jharkhand', 'braj-awadh-kashi'],
};

/** The tag for one rule, or the empty list. */
export function regionTagsFor(ruleId: string): readonly ObservanceLens[] {
  return REGION_TAGS[ruleId] ?? EMPTY;
}

const EMPTY: readonly ObservanceLens[] = [];
