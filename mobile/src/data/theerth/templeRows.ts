import type { Deity } from '@/data/texts';

/**
 * The 71 temple ROWS — id, names, location, deity, yatra groups — and nothing
 * else. Split out of `temples.ts` so the launch path can read the roster
 * without dragging the prose in behind it.
 *
 * WHY THIS FILE EXISTS. `NewContentContext` runs at `App.tsx` module scope and
 * needs only `{ id, addedInVersion }` per temple to seed its NEW badges.
 * Importing `temples.ts` for that pulled in its ~320 KB of detail prose — plus
 * every authored §12.6 reading under `details/` — as static launch-graph
 * members, which Hermes evaluates before the first frame (the rule, and the
 * budget, live in `src/data/__tests__/launchGraph.test.ts`). This module is the
 * manifest that importer reads instead; the prose now loads only when a screen,
 * the search index or a test actually imports `temples.ts`.
 *
 * `temples.ts` re-exports everything defined here, so the public API is
 * unchanged — keep importing `TheerthGroup`, `groupMeta`, `BaseTempleEntry` and
 * friends from `temples.ts`. Import from this module only on the launch path,
 * where rows are all you may take.
 */

export type TheerthGroup =
  | 'jyotirlinga'
  | 'char-dham'
  | 'chota-char-dham'
  | 'shakti-peeth';

export const groupMeta: Record<TheerthGroup, { nameHi: string; nameEn: string }> = {
  'jyotirlinga': { nameHi: 'द्वादश ज्योतिर्लिङ्ग', nameEn: 'Dvādaśa Jyotirlinga' },
  'char-dham': { nameHi: 'चार धाम', nameEn: 'Char Dham' },
  'chota-char-dham': { nameHi: 'छोटा चार धाम', nameEn: 'Chota Char Dham' },
  'shakti-peeth': { nameHi: 'शक्ति पीठ', nameEn: 'Shakti Peeth' },
};

export const groupOrder: readonly TheerthGroup[] = [
  'jyotirlinga',
  'char-dham',
  'chota-char-dham',
  'shakti-peeth',
];

export type BaseTempleEntry = {
  id: string;
  nameHi: string;
  nameEn: string;
  cityHi: string;
  cityEn: string;
  stateHi: string;
  stateEn: string;
  coordinates: { lat: number; lng: number };
  deity: Deity;
  groups: TheerthGroup[];
  /**
   * App version a temple first shipped in — mirrors LibraryEntry.addedInVersion
   * so temples flow through the same NEW-content tracking as texts (see
   * NewContentContext). Omit on existing temples to inherit THEERTH_LAUNCH_VERSION;
   * set explicitly (e.g. '1.5.0') on temples added in a later release so they flag
   * NEW for upgraders.
   */
  addedInVersion?: string;
};

/**
 * Version the whole pilgrimage map debuted in (commit #118, app 1.3.2). It is the
 * default `addedInVersion` for every temple that doesn't override it, so the
 * Theerth section behaves like any other content debut: NEW for users upgrading
 * from before the feature existed, silent for fresh installs.
 */
export const THEERTH_LAUNCH_VERSION = '1.3.2';

export const baseTemples = [
  // ---------- 12 Jyotirlingas ----------
  { id: 'somnath',          nameHi: 'सोमनाथ',           nameEn: 'Somnath',           cityHi: 'वेरावल',     cityEn: 'Veraval',     stateHi: 'गुजरात',         stateEn: 'Gujarat',         coordinates: { lat: 20.888, lng: 70.402 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'mallikarjuna',     nameHi: 'मल्लिकार्जुन',      nameEn: 'Mallikarjuna',      cityHi: 'श्रीशैलम',   cityEn: 'Srisailam',   stateHi: 'आंध्र प्रदेश',   stateEn: 'Andhra Pradesh',  coordinates: { lat: 16.074, lng: 78.869 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'mahakaleshwar',    nameHi: 'महाकालेश्वर',      nameEn: 'Mahakaleshwar',     cityHi: 'उज्जैन',     cityEn: 'Ujjain',      stateHi: 'मध्य प्रदेश',    stateEn: 'Madhya Pradesh',  coordinates: { lat: 23.183, lng: 75.768 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'omkareshwar',      nameHi: 'ओंकारेश्वर',        nameEn: 'Omkareshwar',       cityHi: 'खंडवा',      cityEn: 'Khandwa',     stateHi: 'मध्य प्रदेश',    stateEn: 'Madhya Pradesh',  coordinates: { lat: 22.243, lng: 76.150 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'kedarnath',        nameHi: 'केदारनाथ',          nameEn: 'Kedarnath',         cityHi: 'रुद्रप्रयाग', cityEn: 'Rudraprayag', stateHi: 'उत्तराखंड',      stateEn: 'Uttarakhand',     coordinates: { lat: 30.735, lng: 79.067 }, deity: 'shiva',   groups: ['jyotirlinga', 'chota-char-dham'] },
  { id: 'bhimashankar',     nameHi: 'भीमाशंकर',          nameEn: 'Bhimashankar',      cityHi: 'पुणे',       cityEn: 'Pune',        stateHi: 'महाराष्ट्र',     stateEn: 'Maharashtra',     coordinates: { lat: 19.072, lng: 73.536 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'kashi-vishwanath', nameHi: 'काशी विश्वनाथ',     nameEn: 'Kashi Vishwanath',  cityHi: 'वाराणसी',    cityEn: 'Varanasi',    stateHi: 'उत्तर प्रदेश',   stateEn: 'Uttar Pradesh',   coordinates: { lat: 25.311, lng: 83.011 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'trimbakeshwar',    nameHi: 'त्र्यंबकेश्वर',     nameEn: 'Trimbakeshwar',     cityHi: 'नाशिक',      cityEn: 'Nashik',      stateHi: 'महाराष्ट्र',     stateEn: 'Maharashtra',     coordinates: { lat: 19.933, lng: 73.531 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'vaidyanath',       nameHi: 'वैद्यनाथ',          nameEn: 'Vaidyanath',        cityHi: 'देवघर',      cityEn: 'Deoghar',     stateHi: 'झारखंड',         stateEn: 'Jharkhand',       coordinates: { lat: 24.492, lng: 86.700 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'nageshwar',        nameHi: 'नागेश्वर',          nameEn: 'Nageshwar',         cityHi: 'द्वारका',    cityEn: 'Dwarka',      stateHi: 'गुजरात',         stateEn: 'Gujarat',         coordinates: { lat: 22.337, lng: 69.081 }, deity: 'shiva',   groups: ['jyotirlinga'] },
  { id: 'rameshwaram',      nameHi: 'रामेश्वरम्',        nameEn: 'Rameshwaram',       cityHi: 'रामेश्वरम्', cityEn: 'Rameshwaram', stateHi: 'तमिलनाडु',       stateEn: 'Tamil Nadu',      coordinates: { lat:  9.288, lng: 79.317 }, deity: 'shiva',   groups: ['jyotirlinga', 'char-dham'] },
  { id: 'grishneshwar',     nameHi: 'घृष्णेश्वर',        nameEn: 'Grishneshwar',      cityHi: 'औरंगाबाद',   cityEn: 'Aurangabad',  stateHi: 'महाराष्ट्र',     stateEn: 'Maharashtra',     coordinates: { lat: 20.027, lng: 75.180 }, deity: 'shiva',   groups: ['jyotirlinga'] },

  // ---------- Char Dham (Adi Shankaracharya's four-corner circuit) ----------
  { id: 'badrinath',        nameHi: 'बद्रीनाथ',          nameEn: 'Badrinath',         cityHi: 'चमोली',      cityEn: 'Chamoli',     stateHi: 'उत्तराखंड',      stateEn: 'Uttarakhand',     coordinates: { lat: 30.743, lng: 79.493 }, deity: 'vishnu',  groups: ['char-dham', 'chota-char-dham'] },
  { id: 'dwarkadhish',      nameHi: 'द्वारकाधीश',        nameEn: 'Dwarkadhish',       cityHi: 'द्वारका',    cityEn: 'Dwarka',      stateHi: 'गुजरात',         stateEn: 'Gujarat',         coordinates: { lat: 22.240, lng: 68.968 }, deity: 'krishna', groups: ['char-dham'] },
  { id: 'jagannath-puri',   nameHi: 'जगन्नाथ पुरी',      nameEn: 'Jagannath Puri',    cityHi: 'पुरी',       cityEn: 'Puri',        stateHi: 'ओडिशा',          stateEn: 'Odisha',          coordinates: { lat: 19.805, lng: 85.818 }, deity: 'krishna', groups: ['char-dham'] },

  // ---------- Chota Char Dham (Uttarakhand sub-circuit) ----------
  { id: 'yamunotri',        nameHi: 'यमुनोत्री',         nameEn: 'Yamunotri',         cityHi: 'उत्तरकाशी',  cityEn: 'Uttarkashi',  stateHi: 'उत्तराखंड',      stateEn: 'Uttarakhand',     coordinates: { lat: 31.017, lng: 78.452 }, deity: 'durga',   groups: ['chota-char-dham'] },
  { id: 'gangotri',         nameHi: 'गंगोत्री',          nameEn: 'Gangotri',          cityHi: 'उत्तरकाशी',  cityEn: 'Uttarkashi',  stateHi: 'उत्तराखंड',      stateEn: 'Uttarakhand',     coordinates: { lat: 30.995, lng: 78.940 }, deity: 'durga',   groups: ['chota-char-dham'] },

  // ---------- Shakti Peeths present in this curated map ----------
  { id: 'kamakhya',         nameHi: 'कामाख्या',          nameEn: 'Kamakhya',          cityHi: 'गुवाहाटी',   cityEn: 'Guwahati',    stateHi: 'असम',            stateEn: 'Assam',           coordinates: { lat: 26.166, lng: 91.705 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'vaishno-devi',     nameHi: 'वैष्णो देवी',        nameEn: 'Vaishno Devi',      cityHi: 'कटरा',       cityEn: 'Katra',       stateHi: 'जम्मू-कश्मीर',   stateEn: 'Jammu & Kashmir', coordinates: { lat: 33.031, lng: 74.950 }, deity: 'durga',   groups: [] },
  { id: 'kalighat',         nameHi: 'कालीघाट',           nameEn: 'Kalighat',          cityHi: 'कोलकाता',    cityEn: 'Kolkata',     stateHi: 'पश्चिम बंगाल',   stateEn: 'West Bengal',     coordinates: { lat: 22.518, lng: 88.343 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'naina-devi',       nameHi: 'नैना देवी',          nameEn: 'Naina Devi',        cityHi: 'बिलासपुर',   cityEn: 'Bilaspur',    stateHi: 'हिमाचल प्रदेश',  stateEn: 'Himachal Pradesh', coordinates: { lat: 31.325, lng: 76.536 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'jwala-devi',       nameHi: 'ज्वाला देवी',        nameEn: 'Jwala Devi',        cityHi: 'कांगड़ा',    cityEn: 'Kangra',      stateHi: 'हिमाचल प्रदेश',  stateEn: 'Himachal Pradesh', coordinates: { lat: 31.878, lng: 76.322 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'chamunda-devi',    nameHi: 'चामुंडा देवी',       nameEn: 'Chamunda Devi',     cityHi: 'धर्मशाला',   cityEn: 'Dharamshala', stateHi: 'हिमाचल प्रदेश',  stateEn: 'Himachal Pradesh', coordinates: { lat: 32.212, lng: 76.335 }, deity: 'durga',   groups: [] },

  // ---------- Other Famous (no structured-yatra membership) ----------
  { id: 'tirupati-balaji',  nameHi: 'तिरुपति बालाजी',     nameEn: 'Tirupati Balaji',   cityHi: 'तिरुमाला',   cityEn: 'Tirumala',    stateHi: 'आंध्र प्रदेश',   stateEn: 'Andhra Pradesh',  coordinates: { lat: 13.683, lng: 79.348 }, deity: 'vishnu',  groups: [] },
  { id: 'meenakshi',        nameHi: 'मीनाक्षी',           nameEn: 'Meenakshi',         cityHi: 'मदुरै',      cityEn: 'Madurai',     stateHi: 'तमिलनाडु',       stateEn: 'Tamil Nadu',      coordinates: { lat:  9.920, lng: 78.119 }, deity: 'durga',   groups: [] },
  { id: 'konark-sun',       nameHi: 'कोणार्क सूर्य',      nameEn: 'Konark Sun',        cityHi: 'कोणार्क',    cityEn: 'Konark',      stateHi: 'ओडिशा',          stateEn: 'Odisha',          coordinates: { lat: 19.888, lng: 86.094 }, deity: 'surya',   groups: [] },
  { id: 'brihadeeswarar',   nameHi: 'बृहदीश्वर',          nameEn: 'Brihadeeswarar',    cityHi: 'तंजावुर',    cityEn: 'Thanjavur',   stateHi: 'तमिलनाडु',       stateEn: 'Tamil Nadu',      coordinates: { lat: 10.783, lng: 79.132 }, deity: 'shiva',   groups: [] },
  { id: 'padmanabhaswamy',  nameHi: 'पद्मनाभस्वामी',      nameEn: 'Padmanabhaswamy',   cityHi: 'तिरुवनंतपुरम', cityEn: 'Thiruvananthapuram', stateHi: 'केरल',     stateEn: 'Kerala',          coordinates: { lat:  8.483, lng: 76.941 }, deity: 'vishnu',  groups: [] },
  { id: 'banke-bihari',     nameHi: 'बांके बिहारी',       nameEn: 'Banke Bihari',      cityHi: 'वृंदावन',    cityEn: 'Vrindavan',   stateHi: 'उत्तर प्रदेश',   stateEn: 'Uttar Pradesh',   coordinates: { lat: 27.582, lng: 77.705 }, deity: 'krishna', groups: [] },

  // ---------- Statewise marquee temples (one per otherwise-uncovered state/UT) ----------
  // A few states/UTs stay intentionally uncovered rather than inventing a shrine:
  // Mizoram and Lakshadweep have no marquee Hindu temple, and Ladakh is
  // Buddhist/Muslim with no Hindu marquee shrine. Diu's famous Gangeshwar
  // Mahadev exists but sits on Diu island, which the current map outline omits,
  // so it cannot be pinned (documented in the per-state catalog instead).
  { id: 'srinathji',          nameHi: 'श्रीनाथजी',          nameEn: 'Srinathji',          cityHi: 'नाथद्वारा',  cityEn: 'Nathdwara',   stateHi: 'राजस्थान',       stateEn: 'Rajasthan',         coordinates: { lat: 24.937, lng: 73.823 }, deity: 'krishna', groups: [] },
  { id: 'udupi-krishna',      nameHi: 'उडुपी श्रीकृष्ण',     nameEn: 'Udupi Sri Krishna',  cityHi: 'उडुपी',      cityEn: 'Udupi',       stateHi: 'कर्नाटक',        stateEn: 'Karnataka',         coordinates: { lat: 13.341, lng: 74.752 }, deity: 'krishna', groups: [] },
  { id: 'vishnupad-gaya',     nameHi: 'विष्णुपद',           nameEn: 'Vishnupad',          cityHi: 'गया',        cityEn: 'Gaya',        stateHi: 'बिहार',          stateEn: 'Bihar',             coordinates: { lat: 24.747, lng: 85.010 }, deity: 'vishnu',  groups: [] },
  { id: 'bhadrachalam',       nameHi: 'भद्राचलम',           nameEn: 'Bhadrachalam',       cityHi: 'भद्राचलम',   cityEn: 'Bhadrachalam', stateHi: 'तेलंगाना',      stateEn: 'Telangana',         coordinates: { lat: 17.668, lng: 80.888 }, deity: 'rama',    groups: [] },
  { id: 'danteshwari',        nameHi: 'दंतेश्वरी',          nameEn: 'Danteshwari',        cityHi: 'दंतेवाड़ा',  cityEn: 'Dantewada',   stateHi: 'छत्तीसगढ़',      stateEn: 'Chhattisgarh',      coordinates: { lat: 18.898, lng: 81.355 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'mangueshi',          nameHi: 'मंगेशी',             nameEn: 'Mangueshi',          cityHi: 'पोंडा',      cityEn: 'Ponda',       stateHi: 'गोवा',           stateEn: 'Goa',               coordinates: { lat: 15.456, lng: 73.964 }, deity: 'shiva',   groups: [] },
  { id: 'lakshmi-narayan',    nameHi: 'लक्ष्मीनारायण',       nameEn: 'Lakshmi Narayan',    cityHi: 'नई दिल्ली',  cityEn: 'New Delhi',   stateHi: 'दिल्ली',         stateEn: 'Delhi',             coordinates: { lat: 28.633, lng: 77.197 }, deity: 'vishnu',  groups: [] },
  { id: 'durgiana',           nameHi: 'दुर्गियाना',         nameEn: 'Durgiana',           cityHi: 'अमृतसर',     cityEn: 'Amritsar',    stateHi: 'पंजाब',          stateEn: 'Punjab',            coordinates: { lat: 31.620, lng: 74.864 }, deity: 'durga',   groups: [] },
  { id: 'mansa-devi',         nameHi: 'मनसा देवी',          nameEn: 'Mansa Devi',         cityHi: 'पंचकूला',    cityEn: 'Panchkula',   stateHi: 'हरियाणा',        stateEn: 'Haryana',           coordinates: { lat: 30.726, lng: 76.851 }, deity: 'durga',   groups: [] },
  { id: 'govindajee-imphal',  nameHi: 'श्री गोविंदजी',       nameEn: 'Shree Govindajee',   cityHi: 'इम्फाल',     cityEn: 'Imphal',      stateHi: 'मणिपुर',         stateEn: 'Manipur',           coordinates: { lat: 24.803, lng: 93.952 }, deity: 'krishna', groups: [] },
  { id: 'tripura-sundari',    nameHi: 'त्रिपुर सुंदरी',      nameEn: 'Tripura Sundari',    cityHi: 'उदयपुर',     cityEn: 'Udaipur',     stateHi: 'त्रिपुरा',       stateEn: 'Tripura',           coordinates: { lat: 23.531, lng: 91.481 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'manakula-vinayagar', nameHi: 'मनाकुला विनायगर',     nameEn: 'Manakula Vinayagar', cityHi: 'पुडुचेरी',   cityEn: 'Puducherry',  stateHi: 'पुडुचेरी',       stateEn: 'Puducherry',        coordinates: { lat: 11.933, lng: 79.832 }, deity: 'ganesha', groups: [] },
  { id: 'parashuram-kund',    nameHi: 'परशुराम कुंड',       nameEn: 'Parashuram Kund',    cityHi: 'तेजू',       cityEn: 'Tezu',        stateHi: 'अरुणाचल प्रदेश', stateEn: 'Arunachal Pradesh', coordinates: { lat: 27.885, lng: 96.288 }, deity: 'vishnu',  groups: [] },
  { id: 'nartiang-durga',     nameHi: 'नारतियांग दुर्गा',    nameEn: 'Nartiang Durga',     cityHi: 'नारतियांग',  cityEn: 'Nartiang',    stateHi: 'मेघालय',         stateEn: 'Meghalaya',         coordinates: { lat: 25.580, lng: 92.210 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'kirateshwar',        nameHi: 'किरातेश्वर महादेव',   nameEn: 'Kirateshwar Mahadev', cityHi: 'लेगशिप',    cityEn: 'Legship',     stateHi: 'सिक्किम',        stateEn: 'Sikkim',            coordinates: { lat: 27.299, lng: 88.460 }, deity: 'shiva',   groups: [] },

  // ---------- Statewise gap-fill: marquee shrines for newly-covered states/UTs ----------
  { id: 'vetrimalai-murugan', nameHi: 'वेत्रिमलै मुरुगन',     nameEn: 'Vetrimalai Murugan', cityHi: 'पोर्ट ब्लेयर', cityEn: 'Port Blair',  stateHi: 'अंडमान और निकोबार', stateEn: 'Andaman and Nicobar Islands', coordinates: { lat: 11.663, lng: 92.746 }, deity: 'shiva',   groups: [] },
  { id: 'iskcon-chandigarh',  nameHi: 'इस्कॉन चंडीगढ़',      nameEn: 'ISKCON Chandigarh',  cityHi: 'चंडीगढ़',    cityEn: 'Chandigarh',  stateHi: 'चंडीगढ़',          stateEn: 'Chandigarh',                  coordinates: { lat: 30.734, lng: 76.761 }, deity: 'krishna', groups: [] },
  { id: 'dimapur-kalibari',   nameHi: 'दीमापुर कालीबाड़ी',    nameEn: 'Dimapur Kalibari',   cityHi: 'दीमापुर',    cityEn: 'Dimapur',     stateHi: 'नागालैंड',         stateEn: 'Nagaland',                    coordinates: { lat: 25.904, lng: 93.725 }, deity: 'durga',   groups: [] },

  // ---------- Lokdevta (folk deities), tagged with the nearest of the 8 deities ----------
  { id: 'khatu-shyam',        nameHi: 'खाटू श्याम जी',        nameEn: 'Khatu Shyam Ji',     cityHi: 'खाटू',       cityEn: 'Khatu',       stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 27.365, lng: 75.403 }, deity: 'krishna', groups: [] },
  { id: 'salasar-balaji',     nameHi: 'सालासर बालाजी',       nameEn: 'Salasar Balaji',     cityHi: 'सालासर',     cityEn: 'Salasar',     stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 27.721, lng: 74.727 }, deity: 'hanuman', groups: [] },
  { id: 'karni-mata',         nameHi: 'करणी माता, देशनोक',    nameEn: 'Karni Mata, Deshnoke', cityHi: 'देशनोक',   cityEn: 'Deshnoke',    stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 27.790, lng: 73.342 }, deity: 'durga',   groups: [] },
  { id: 'jeen-mata',          nameHi: 'जीण माता',             nameEn: 'Jeen Mata',          cityHi: 'सीकर',       cityEn: 'Sikar',       stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 27.224, lng: 75.189 }, deity: 'durga',   groups: [] },
  { id: 'khandoba-jejuri',    nameHi: 'खंडोबा, जेजुरी',       nameEn: 'Khandoba, Jejuri',   cityHi: 'जेजुरी',     cityEn: 'Jejuri',      stateHi: 'महाराष्ट्र',       stateEn: 'Maharashtra',                 coordinates: { lat: 18.272, lng: 74.160 }, deity: 'shiva',   groups: [] },
  { id: 'gogaji-gogamedi',    nameHi: 'गोगाजी, गोगामेड़ी',     nameEn: 'Gogaji, Gogamedi',   cityHi: 'गोगामेड़ी',   cityEn: 'Gogamedi',    stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 29.160, lng: 75.023 }, deity: 'shiva',   groups: [] },
  { id: 'sabarimala',         nameHi: 'सबरीमला अय्यप्पन',     nameEn: 'Sabarimala Ayyappan', cityHi: 'पथनमथिट्टा', cityEn: 'Pathanamthitta', stateHi: 'केरल',           stateEn: 'Kerala',                      coordinates: { lat:  9.435, lng: 77.081 }, deity: 'shiva',   groups: [] },
  { id: 'mahasu-devta-hanol', nameHi: 'महासू देवता, हणोल',    nameEn: 'Mahasu Devta, Hanol', cityHi: 'हणोल',       cityEn: 'Hanol',       stateHi: 'उत्तराखंड',        stateEn: 'Uttarakhand',                 coordinates: { lat: 30.971, lng: 77.928 }, deity: 'shiva',   groups: [] },
  { id: 'tejaji-kharnal',     nameHi: 'वीर तेजाजी, खरनाल',     nameEn: 'Veer Tejaji, Kharnal', cityHi: 'खरनाल',     cityEn: 'Kharnal',     stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 27.086, lng: 73.645 }, deity: 'shiva',   groups: [] },
  { id: 'ramdevra',           nameHi: 'बाबा रामदेव, रामदेवरा', nameEn: 'Baba Ramdev, Ramdevra', cityHi: 'रामदेवरा',  cityEn: 'Ramdevra',    stateHi: 'राजस्थान',         stateEn: 'Rajasthan',                   coordinates: { lat: 27.010, lng: 71.920 }, deity: 'krishna', groups: [] },

  // ---------- Ashtadasha Maha Shakti Peeth additions (Adi Shankara's stotram) ----------
  // The 18 Maha Shakti Peeths; the 16 in modern India are plotted (these 14 plus
  // Kamakhya and Jwala/Jwalamukhi above). The 2 abroad — Shankari (Trincomalee,
  // Sri Lanka) and Sharada/Saraswati (Sharada Peeth, PoK) — fall outside the India
  // map outline and are documented in the per-state catalog rather than pinned.
  { id: 'kamakshi',           nameHi: 'कामाक्षी अम्मन',       nameEn: 'Kamakshi Amman',      cityHi: 'कांचीपुरम',  cityEn: 'Kanchipuram', stateHi: 'तमिलनाडु',       stateEn: 'Tamil Nadu',      coordinates: { lat: 12.841, lng: 79.703 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'shrinkhala',         nameHi: 'श्रृंखला देवी',         nameEn: 'Shrinkhala Devi',     cityHi: 'पांडुआ',     cityEn: 'Pandua',      stateHi: 'पश्चिम बंगाल',   stateEn: 'West Bengal',     coordinates: { lat: 23.070, lng: 88.290 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'chamundeshwari',     nameHi: 'चामुंडेश्वरी',         nameEn: 'Chamundeshwari',      cityHi: 'मैसूरु',     cityEn: 'Mysuru',      stateHi: 'कर्नाटक',        stateEn: 'Karnataka',       coordinates: { lat: 12.272, lng: 76.671 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'jogulamba',          nameHi: 'जोगुलांबा',            nameEn: 'Jogulamba',           cityHi: 'आलमपुर',     cityEn: 'Alampur',     stateHi: 'तेलंगाना',       stateEn: 'Telangana',       coordinates: { lat: 15.877, lng: 78.132 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'bhramaramba',        nameHi: 'भ्रमरांबा',            nameEn: 'Bhramaramba',         cityHi: 'श्रीशैलम',   cityEn: 'Srisailam',   stateHi: 'आंध्र प्रदेश',   stateEn: 'Andhra Pradesh',  coordinates: { lat: 16.074, lng: 78.868 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'mahalakshmi-kolhapur', nameHi: 'महालक्ष्मी (अंबाबाई)', nameEn: 'Mahalakshmi Kolhapur', cityHi: 'कोल्हापुर', cityEn: 'Kolhapur', stateHi: 'महाराष्ट्र',  stateEn: 'Maharashtra',     coordinates: { lat: 16.700, lng: 74.233 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'ekaveerika-mahur',   nameHi: 'रेणुका (एकवीरा)',       nameEn: 'Renuka Mahur',        cityHi: 'माहूर',      cityEn: 'Mahur',       stateHi: 'महाराष्ट्र',     stateEn: 'Maharashtra',     coordinates: { lat: 19.848, lng: 77.924 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'harsiddhi-ujjain',   nameHi: 'हरसिद्धि (महाकाली)',    nameEn: 'Harsiddhi',           cityHi: 'उज्जैन',     cityEn: 'Ujjain',      stateHi: 'मध्य प्रदेश',    stateEn: 'Madhya Pradesh',  coordinates: { lat: 23.182, lng: 75.767 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'puruhutika',         nameHi: 'पुरुहूतिका देवी',       nameEn: 'Puruhutika Devi',     cityHi: 'पिठापुरम',   cityEn: 'Pithapuram',  stateHi: 'आंध्र प्रदेश',   stateEn: 'Andhra Pradesh',  coordinates: { lat: 17.107, lng: 82.243 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'biraja',             nameHi: 'बिरजा (गिरिजा)',        nameEn: 'Biraja',              cityHi: 'जाजपुर',     cityEn: 'Jajpur',      stateHi: 'ओडिशा',          stateEn: 'Odisha',          coordinates: { lat: 20.834, lng: 86.338 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'manikyamba',         nameHi: 'माणिक्यांबा',           nameEn: 'Manikyamba',          cityHi: 'द्राक्षारामम', cityEn: 'Draksharama', stateHi: 'आंध्र प्रदेश',  stateEn: 'Andhra Pradesh',  coordinates: { lat: 16.792, lng: 82.063 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'madhaveswari',       nameHi: 'माधवेश्वरी (अलोपी)',    nameEn: 'Madhaveswari',        cityHi: 'प्रयागराज',  cityEn: 'Prayagraj',   stateHi: 'उत्तर प्रदेश',   stateEn: 'Uttar Pradesh',   coordinates: { lat: 25.444, lng: 81.871 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'mangala-gauri',      nameHi: 'मंगला गौरी',           nameEn: 'Mangala Gauri',       cityHi: 'गया',        cityEn: 'Gaya',        stateHi: 'बिहार',          stateEn: 'Bihar',           coordinates: { lat: 24.775, lng: 85.002 }, deity: 'durga', groups: ['shakti-peeth'] },
  { id: 'vishalakshi',        nameHi: 'विशालाक्षी',            nameEn: 'Vishalakshi',         cityHi: 'वाराणसी',    cityEn: 'Varanasi',    stateHi: 'उत्तर प्रदेश',   stateEn: 'Uttar Pradesh',   coordinates: { lat: 25.309, lng: 83.011 }, deity: 'durga', groups: ['shakti-peeth'] },
] as const satisfies readonly BaseTempleEntry[];
