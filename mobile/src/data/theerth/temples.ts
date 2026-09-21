import type { Deity } from '@/data/texts';

/**
 * Theerth (तीर्थ) — curated list of famous Hindu pilgrimage temples across India.
 *
 * Each temple carries an array of group tags so it can appear under multiple
 * yatras (e.g., Rameshwaram is both a Jyotirlinga and a Char Dham; Kedarnath
 * is both a Jyotirlinga and a Chota Char Dham). Temples not in any structured
 * yatra carry an empty `groups: []` and appear under "Other Famous Temples".
 *
 * Coordinates are approximate (~10 m precision) and used only for pin
 * placement on the stylised India map.
 *
 * Detail prose is concise, paraphrased, and source-linked. It is not meant to
 * replace local temple-trust material or a qualified guide, but it gives every
 * detail screen useful location, significance, and origin-story context.
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

export type TheerthSource = {
  label: string;
  url: string;
};

/**
 * One optional extended-detail section on a temple (सालासर बालाजी shipped the
 * first set). Each is a single prose block per language — the same contract as
 * significance/origin — under its own bilingual heading. Sections render after
 * the Origin Story in the order given, so author them as a reading sequence:
 * founding story → form of the deity → traditions → festivals → journey.
 */
export type TempleSection = {
  id: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export type TempleDetail = {
  significanceHi: string;
  significanceEn: string;
  originStoryHi: string;
  originStoryEn: string;
  sources: readonly TheerthSource[];
  /** Deeper per-temple reading (sthapana katha, traditions, melas, yatra). Omit when unauthored. */
  sections?: readonly TempleSection[];
};

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

export type TempleEntry = BaseTempleEntry & TempleDetail & { addedInVersion: string };

/**
 * Version the whole pilgrimage map debuted in (commit #118, app 1.3.2). It is the
 * default `addedInVersion` for every temple that doesn't override it, so the
 * Theerth section behaves like any other content debut: NEW for users upgrading
 * from before the feature existed, silent for fresh installs.
 */
export const THEERTH_LAUNCH_VERSION = '1.3.2';

const baseTemples = [
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

type TempleId = (typeof baseTemples)[number]['id'];

const source = (label: string, url: string): TheerthSource => ({ label, url });

const templeDetails: Record<TempleId, TempleDetail> = {
  somnath: {
    significanceHi: 'अरब सागर के किनारे स्थित सोमनाथ को द्वादश ज्योतिर्लिङ्गों में प्रथम माना जाता है और यह शिव-भक्ति की पुनर्निर्माण परंपरा का बड़ा प्रतीक है।',
    significanceEn: 'Somnath stands on the Arabian Sea coast and is traditionally revered as the first of the twelve Jyotirlingas, a symbol of Shiva devotion and renewal.',
    originStoryHi: 'कथा में सोमराज/चन्द्र ने दक्ष के श्राप से क्षीण होने पर प्रभास क्षेत्र में शिव की आराधना की; शिव-कृपा से उनका तेज लौटा और सोमनाथ प्रतिष्ठित हुआ।',
    originStoryEn: 'In the popular legend, Somraj, the Moon, worshipped Shiva at Prabhas after Daksha cursed him to wane; Shiva restored his radiance and the shrine became Somnath.',
    sources: [source('Gujarat Tourism - Somnath Temple', 'https://gujarattourism.com/saurashtra/gir-somnath/somnath-temple.html')],
  },
  mallikarjuna: {
    significanceHi: 'श्रीशैलम का मल्लिकार्जुन शिव और भ्रमराम्बा देवी दोनों की उपासना का केन्द्र है, इसलिए यह शैव और शक्ति परंपराओं में साथ-साथ पूजित है।',
    significanceEn: 'Mallikarjuna at Srisailam is revered for Shiva as Mallikarjuna and Devi as Bhramaramba, joining Shaiva and Shakta worship in one major pilgrimage complex.',
    originStoryHi: 'स्थल-कथा के अनुसार कार्तिकेय के क्रौंच पर्वत जाने पर शिव-पार्वती उन्हें मनाने आए और वहीं मल्लिका-अर्जुन रूप में भक्तों के लिए ठहर गए।',
    originStoryEn: 'The temple legend says Shiva and Parvati came to the mountain to console Kartikeya and remained there as Mallikarjuna for devotees.',
    sources: [source('Srisailam Devasthanam', 'https://www.srisailadevasthanam.org/')],
  },
  mahakaleshwar: {
    significanceHi: 'उज्जैन का महाकालेश्वर दक्षिणमुखी ज्योतिर्लिङ्ग के रूप में विशिष्ट है; महाकाल समय, मृत्यु और भय से रक्षा करने वाले शिव के रूप में पूजित हैं।',
    significanceEn: 'Mahakaleshwar in Ujjain is distinctive for its south-facing Jyotirlinga, worshipped as Shiva who stands beyond time, death, and fear.',
    originStoryHi: 'पुराण-कथा में भक्तों की रक्षा के लिए शिव महाकाल रूप में प्रकट हुए और उज्जयिनी में स्वयंभू लिङ्ग के रूप में प्रतिष्ठित हुए।',
    originStoryEn: 'In the local Puranic legend, Shiva appeared as Mahakala to protect devotees in ancient Ujjain and remained as the self-manifest linga.',
    sources: [source('Shri Mahakaleshwar Official Portal', 'https://shrimahakaleshwar.com/')],
  },
  omkareshwar: {
    significanceHi: 'नर्मदा के मंधाता द्वीप पर स्थित ओंकारेश्वर का द्वीप ओम्-आकृति से जुड़ा माना जाता है, इसलिए यह नाम, भूगोल और साधना को जोड़ता है।',
    significanceEn: 'Omkareshwar sits on Mandhata island in the Narmada, traditionally associated with the shape of Om and counted among the twelve Jyotirlingas.',
    originStoryHi: 'कथा में विन्ध्य पर्वत ने शिव की घोर तपस्या की; प्रसन्न होकर शिव ओंकारेश्वर-अमलेश्वर रूप में प्रकट हुए।',
    originStoryEn: 'A common legend says the Vindhya mountain worshipped Shiva, who appeared there as Omkareshwar and Amaleshwar.',
    sources: [source('Madhya Pradesh Tourism - Omkareshwar', 'https://www.mptourism.com/destination-omkareshwar.php')],
  },
  kedarnath: {
    significanceHi: 'हिमालय में मंदाकिनी के पास केदारनाथ ज्योतिर्लिङ्ग और छोटा चार धाम दोनों का प्रमुख तीर्थ है, कठिन यात्रा के कारण इसकी तप-भावना गहरी है।',
    significanceEn: 'Kedarnath, high in the Himalaya near the Mandakini, is both a Jyotirlinga and a Chota Char Dham shrine, carrying a strong atmosphere of austerity.',
    originStoryHi: 'कथा में महाभारत के बाद पाण्डव पाप-प्रायश्चित्त के लिए शिव को खोजते हैं; शिव बैल रूप में छिपते हैं और केदार में उनका पृष्ठभाग प्रकट होता है।',
    originStoryEn: 'The Pandava legend says Shiva avoided them in the form of a bull; when discovered, part of that form appeared at Kedarnath and became the sacred linga.',
    sources: [source('Badrinath-Kedarnath Temple Committee - Kedarnath', 'https://badrinath-kedarnath.gov.in/AboutUs/shri-kedarnath.aspx')],
  },
  bhimashankar: {
    significanceHi: 'सह्याद्री की हरित पर्वतमाला में भीमाशंकर ज्योतिर्लिङ्ग शिव-भक्ति, वन-तीर्थ और भीमा नदी के उद्गम से जुड़ा है।',
    significanceEn: 'Bhimashankar in the Sahyadri range is a Jyotirlinga associated with forest pilgrimage, Shiva devotion, and the source region of the Bhima river.',
    originStoryHi: 'लोककथा में शिव ने त्रिपुरासुर या भीम नामक असुर का संहार किया; युद्ध की उष्णता से निकली धारा को भीमा नदी से जोड़ा जाता है।',
    originStoryEn: 'The local legend links the shrine to Shiva defeating a demon, with the heat and energy of that battle associated with the Bhima river tradition.',
    sources: [source('Bhimashankar Mandir', 'https://bhimashankar.in/')],
  },
  'kashi-vishwanath': {
    significanceHi: 'गंगा तट की काशी में विश्वनाथ को मुक्ति और ज्ञान देने वाले ज्योतिर्लिङ्ग के रूप में पूजते हैं; काशी शिव की अविमुक्त नगरी मानी जाती है।',
    significanceEn: 'Kashi Vishwanath in Varanasi is revered as the Jyotirlinga of Shiva as Lord of the Universe, closely tied to Kashi, liberation, and sacred learning.',
    originStoryHi: 'काशी-परंपरा में शिव ने इस नगरी को अपना प्रिय निवास बनाया और विश्वेश्वर रूप में भक्तों को माया-बन्धन से पार कराने का आश्रय दिया।',
    originStoryEn: 'Kashi tradition holds that Shiva made this city his beloved abode and grants devotees the path of knowledge, bhakti, and liberation as Vishweshwara.',
    sources: [source('Shri Kashi Vishwanath Official Portal', 'https://shrikashivishwanath.org/mythology')],
  },
  trimbakeshwar: {
    significanceHi: 'ब्रह्मगिरि के पास त्र्यंबकेश्वर ज्योतिर्लिङ्ग गोदावरी के उद्गम और त्रिमूर्ति-स्मरण से जुड़ा प्रमुख नाशिक तीर्थ है।',
    significanceEn: 'Trimbakeshwar near Brahmagiri is a Jyotirlinga associated with the origin of the Godavari and the threefold presence of divinity.',
    originStoryHi: 'कथा में गौतम ऋषि की तपस्या से गंगा गोदावरी रूप में उतरीं और शिव त्र्यंबक रूप में वहाँ प्रतिष्ठित हुए।',
    originStoryEn: 'The legend centers on sage Gautama, whose penance brought the sacred river as Godavari and led to Shiva’s manifestation as Tryambaka.',
    sources: [source('Maharashtra Tourism - Trimbakeshwar', 'https://maharashtratourism.gov.in/temple/trimbakeshwar/')],
  },
  vaidyanath: {
    significanceHi: 'देवघर का वैद्यनाथ धाम शिव के कामना-लिङ्ग और श्रावणी कांवड़ परंपरा के कारण पूर्वी भारत का अत्यंत जीवंत तीर्थ है।',
    significanceEn: 'Vaidyanath at Deoghar is a major eastern Indian Shiva shrine, revered as a Jyotirlinga and as the Kamana Linga that draws large Shravan pilgrimages.',
    originStoryHi: 'कथा में रावण शिवलिङ्ग को लंका ले जा रहा था; देवों की युक्ति से वह देवघर में रख दिया गया और वहीं अचल हो गया।',
    originStoryEn: 'The well-known legend says Ravana was carrying Shiva’s linga to Lanka, but it was set down at Deoghar and became fixed there forever.',
    sources: [source('Jharkhand Tourism - Baidyanath Dham', 'https://tourism.jharkhand.gov.in/how-to-reach/53/1')],
  },
  nageshwar: {
    significanceHi: 'द्वारका क्षेत्र का नागेश्वर ज्योतिर्लिङ्ग शिव को भक्तों के रक्षक रूप में स्मरण कराता है, विशेषकर नाग और दारुकावन कथा से।',
    significanceEn: 'Nageshwar near Dwarka remembers Shiva as protector of devotees and is linked with the Darukavana and serpent imagery of the tradition.',
    originStoryHi: 'कथा में दारुका नामक दैत्य ने भक्त सुप्रिय को बंदी बनाया; सुप्रिय के “ॐ नमः शिवाय” जप से शिव प्रकट हुए और दैत्य का नाश किया।',
    originStoryEn: 'In the legend, the demon Daruka imprisoned the devotee Supriya; Supriya’s chanting invoked Shiva, who appeared and defeated the demon.',
    sources: [source('Gujarat Tourism - Nageshwar Jyotirlinga', 'https://gujarattourism.com/saurashtra/devbhoomi-dwarka/nageshwar-jyotirlinga.html')],
  },
  rameshwaram: {
    significanceHi: 'रामेश्वरम् द्वादश ज्योतिर्लिङ्ग और चार धाम दोनों में आता है, इसलिए राम-कथा, शिव-पूजा और समुद्र-तीर्थ का संगम है।',
    significanceEn: 'Rameshwaram is both a Jyotirlinga and one of the Char Dham, joining Rama devotion, Shiva worship, and the sacred seashore pilgrimage.',
    originStoryHi: 'रामायण-परंपरा में श्रीराम ने लंका विजय से पहले शिव की पूजा के लिए लिङ्ग स्थापित किया; सीता द्वारा बनाए रामलिङ्ग की कथा आज भी प्रमुख है।',
    originStoryEn: 'The Ramayana tradition says Rama worshipped Shiva here before the bridge to Lanka; Sita formed the Ramalingam when Hanuman’s linga was delayed.',
    sources: [source('Tamil Nadu Tourism - Rameswaram Temple', 'https://www.tamilnadutourism.tn.gov.in/destinations/rameswaram-temple')],
  },
  grishneshwar: {
    significanceHi: 'एलोरा के निकट घृष्णेश्वर को द्वादश ज्योतिर्लिङ्गों की पूर्णता का अंतिम तीर्थ माना जाता है, जहाँ भक्ति और क्षमा की कथा केन्द्र में है।',
    significanceEn: 'Grishneshwar near Ellora is traditionally counted as the final Jyotirlinga, with a story focused on devotion, loss, and Shiva’s grace.',
    originStoryHi: 'घुश्मा/कुसुमा की कथा में वह प्रतिदिन शिवलिङ्गों की पूजा करती थीं; पुत्र-वियोग में भी अटूट श्रद्धा देखकर शिव ने पुत्र को लौटाया और वहीं प्रकट हुए।',
    originStoryEn: 'The Ghushma or Kusuma legend tells of a devotee whose unwavering worship continued even after tragedy; Shiva restored her son and manifested there.',
    sources: [source('Art of Living - Grishneshwar Jyotirlinga', 'https://www.artofliving.org/in-en/mahashivratri/grishneshwar-jyotirlinga')],
  },
  badrinath: {
    significanceHi: 'अलकनन्दा तट का बद्रीनाथ विष्णु के नर-नारायण तप, वैष्णव परंपरा और चार धाम-छोटा चार धाम दोनों की उत्तर दिशा का प्रमुख तीर्थ है।',
    significanceEn: 'Badrinath on the Alaknanda is a major Vishnu shrine, linked with Nara-Narayana austerity and counted in both Char Dham and Chota Char Dham circuits.',
    originStoryHi: 'कथा में विष्णु बदरिकाश्रम में ध्यानस्थ हुए और लक्ष्मी ने बदरी वृक्ष बनकर उन्हें हिम से ढका; इसलिए वे बदरीनाथ कहलाए।',
    originStoryEn: 'The legend says Vishnu meditated at Badrikashram while Lakshmi sheltered him as a badri tree, giving the Lord the name Badrinath.',
    sources: [source('Badrinath-Kedarnath Temple Committee - Badrinath', 'https://badrinath-kedarnath.gov.in/AboutUs/shri-badrinath.aspx')],
  },
  dwarkadhish: {
    significanceHi: 'द्वारकाधीश कृष्ण की समुद्र-नगरी द्वारका का मुख्य मंदिर है और पश्चिम दिशा के चार धाम का वैष्णव तीर्थ है।',
    significanceEn: 'Dwarkadhish is the principal Krishna shrine of Dwarka and the western seat of the Char Dham pilgrimage.',
    originStoryHi: 'परंपरा में मंदिर को श्रीकृष्ण के पौत्र वज्रनाभ द्वारा समुद्र से प्राप्त द्वारका-भूमि पर निर्मित आराधना से जोड़ा जाता है।',
    originStoryEn: 'The tradition connects the shrine with Vajranabha, Krishna’s grandson, who is believed to have built worship over Krishna’s reclaimed Dwarka kingdom.',
    sources: [source('Devbhumi Dwarka District - Places of Interest', 'https://devbhumidwarka.nic.in/places-of-interest/')],
  },
  'jagannath-puri': {
    significanceHi: 'पुरी का जगन्नाथ मंदिर पूर्व दिशा का चार धाम है, जहाँ जगन्नाथ, बलभद्र और सुभद्रा की रथयात्रा विश्वप्रसिद्ध है।',
    significanceEn: 'Jagannath Puri is the eastern Char Dham shrine, renowned for Jagannath, Balabhadra, Subhadra, and the annual Rath Yatra.',
    originStoryHi: 'कथा में राजा इन्द्रद्युम्न को दिव्य दारु मिला; विश्वकर्मा ने देवमूर्तियाँ बनाईं, पर द्वार जल्दी खुलने से वे अधूरे रूप में ही प्रतिष्ठित हुईं।',
    originStoryEn: 'The temple legend tells of King Indradyumna finding divine wood; Vishwakarma began carving the deities but left them in their distinctive unfinished form.',
    sources: [source('Shree Jagannatha Temple, Puri', 'https://www.shreejagannatha.in/')],
  },
  yamunotri: {
    significanceHi: 'यमुनोत्री यमुना माता का हिमालयी धाम है और छोटा चार धाम यात्रा का आरम्भ-बिन्दु माना जाता है।',
    significanceEn: 'Yamunotri is the Himalayan shrine of Goddess Yamuna and is commonly treated as the starting point of the Chota Char Dham yatra.',
    originStoryHi: 'मंदिर यमुना के उद्गम क्षेत्र से जुड़ा है; यमुना को सूर्य की पुत्री और यम की बहन मानकर आयु, पवित्रता और रक्षा की कामना की जाती है।',
    originStoryEn: 'The shrine is tied to the source region of the Yamuna, worshipped as Surya’s daughter and Yama’s sister, invoked for purity and protection.',
    sources: [source('Uttarakhand Tourism - Yamunotri', 'https://uttarakhandtourism.gov.in/destination/yamunotri')],
  },
  gangotri: {
    significanceHi: 'गंगोत्री गंगा माता का धाम है; हिमालय से उतरती गंगा को भारत की सबसे पवित्र नदी के रूप में यहाँ स्मरण किया जाता है।',
    significanceEn: 'Gangotri is the shrine of Goddess Ganga, remembering the descent of India’s most sacred river from the Himalaya.',
    originStoryHi: 'कथा में भगीरथ की तपस्या से गंगा पृथ्वी पर उतरीं और शिव ने उनकी वेगवती धारा को जटाओं में धारण कर संसार के लिए सौम्य किया।',
    originStoryEn: 'The legend says Bhagiratha’s penance brought Ganga to earth, and Shiva received the powerful river in his locks to gentle her descent.',
    sources: [source('Uttarakhand Tourism - Gangotri', 'https://uttarakhandtourism.gov.in/destination/gangotri')],
  },
  kamakhya: {
    significanceHi: 'नीलाचल पहाड़ी की कामाख्या तांत्रिक शक्ति-उपासना का प्रमुख केन्द्र है और आदि शक्ति पीठों में अत्यंत पूजित मानी जाती है।',
    significanceEn: 'Kamakhya on Nilachal Hill is one of the most important centers of Tantric Shakta worship and among the oldest revered Shakti Peeth traditions.',
    originStoryHi: 'शक्ति-पीठ कथा में सती की योनि यहाँ गिरी; इसलिए गर्भ, सृजन और आदिशक्ति का प्रतीक प्राकृतिक योनिमण्डल रूप में पूजित है।',
    originStoryEn: 'In the Shakti Peeth legend, Sati’s yoni fell here; the shrine worships the creative power of Devi through the natural yonimandala.',
    sources: [source('Assam Tourism - Kamakhya Temple', 'https://assamtourism.gov.in/Kamakhya-Temple1.php')],
  },
  'vaishno-devi': {
    significanceHi: 'त्रिकूट पर्वत की वैष्णो देवी यात्रा उत्तर भारत की सबसे प्रसिद्ध देवी यात्राओं में है, जहाँ महाकाली, महालक्ष्मी और महासरस्वती तीन पिण्डियों में पूजित हैं।',
    significanceEn: 'Vaishno Devi on Trikuta is one of North India’s most visited Devi pilgrimages, worshipped through the three pindis of Mahakali, Mahalakshmi, and Mahasaraswati.',
    originStoryHi: 'कथा में वैष्णवी ने तपस्या करते हुए भैरवनाथ से बचकर गुफा में प्रवेश किया; अंततः उन्होंने भैरव को मोक्ष दिया और यात्रा भैरव-दर्शन से पूर्ण मानी गई।',
    originStoryEn: 'The shrine story follows Vaishnavi’s penance and her encounter with Bhairon Nath; after granting him liberation, the pilgrimage came to include Bhairon darshan.',
    sources: [source('Shri Mata Vaishno Devi Shrine Board', 'https://www.maavaishnodevi.org/')],
  },
  kalighat: {
    significanceHi: 'कोलकाता का कालीघाट काली-उपासना और बंगाल की शक्ति परंपरा का प्रमुख केन्द्र है, जिसे 51 शक्ति पीठों में गिना जाता है।',
    significanceEn: 'Kalighat in Kolkata is a major center of Kali worship and Bengal’s Shakta tradition, counted among the 51 Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ कथा में सती के दाहिने पैर की उंगलियाँ यहाँ गिरीं; आदिगंगा तट का यह स्थान कालीक्षेत्र कहलाया।',
    originStoryEn: 'The Shakti Peeth legend says toes of Sati’s right foot fell here, sanctifying the old Adi Ganga bank as Kalikshetra.',
    sources: [source('Kalighat Kali Temple', 'https://www.kalighatkalitemple.com/article/id/228/kalighat-kali-temple')],
  },
  'naina-devi': {
    significanceHi: 'बिलासपुर की नैना देवी हिमाचल की प्रमुख शक्ति-परंपरा का तीर्थ है, जहाँ देवी को दृष्टि और करुणा की शक्ति के रूप में याद किया जाता है।',
    significanceEn: 'Naina Devi in Bilaspur is a major Himachal Shakti shrine, invoking Devi as the power of vision, protection, and grace.',
    originStoryHi: 'कथा में दक्ष-यज्ञ के बाद विष्णु के चक्र से सती के नेत्र यहाँ गिरे; इसी से देवी नैना नाम से पूजित हुईं।',
    originStoryEn: 'The temple legend says Sati’s eyes fell here after the Daksha Yajna, giving the goddess the name Naina Devi.',
    sources: [source('Shri Naina Devi Ji - Mythology', 'https://srinainadevi.com/mythology-legends/')],
  },
  'jwala-devi': {
    significanceHi: 'ज्वाला देवी में देवी की पूजा ज्योति-रूप में होती है; यहाँ बिना प्रतिमा के प्राकृतिक अग्नि-ज्वालाएँ ही मुख्य आराध्य हैं।',
    significanceEn: 'At Jwala Devi, the goddess is worshipped as living flame rather than as a conventional image, making it one of the most distinctive Devi shrines.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती की जिह्वा यहाँ गिरी मानी जाती है; इसलिए अखण्ड ज्वालाएँ देवी की जीवित उपस्थिति का संकेत हैं।',
    originStoryEn: 'In Shakti Peeth tradition, Sati’s tongue fell here; the eternal flames are revered as the goddess’s living presence.',
    sources: [source('Jwala Devi - Reference', 'https://en.wikipedia.org/wiki/Jwala_(goddess)')],
  },
  'chamunda-devi': {
    significanceHi: 'कांगड़ा क्षेत्र की चामुंडा देवी, नन्दिकेश्वर शिव के साथ शक्ति-शिव एकता का तीर्थ है और चण्ड-मुण्ड-विजय की स्मृति रखता है।',
    significanceEn: 'Chamunda Devi near Dharamshala is a major Kangra Devi shrine paired with Nandikeshwar Shiva, remembering Shakti’s fierce protective form.',
    originStoryHi: 'देवी-माहात्म्य की कथा में काली ने चण्ड और मुण्ड असुरों का वध किया; उसी विजय से देवी चामुंडा नाम से पूजित हुईं।',
    originStoryEn: 'The legend recalls Kali defeating the demons Chanda and Munda, after which the goddess came to be worshipped as Chamunda.',
    sources: [source('District Kangra - Chamunda Nandikeshwar Dham', 'https://hpkangra.nic.in/tourist-place/shri-chamunda-nandikeshwar-dham/')],
  },
  'tirupati-balaji': {
    significanceHi: 'तिरुमला के वेंकटेश्वर को कलियुग वैकुण्ठ का प्रत्यक्ष देव कहा जाता है; यह वैष्णव भक्ति और सेवा-व्यवस्था का विशाल केन्द्र है।',
    significanceEn: 'Venkateswara of Tirumala is revered as the visible deity of Kali Yuga and one of the largest living centers of Vaishnava worship.',
    originStoryHi: 'वेंकटाचल माहात्म्य में श्रीनिवास पद्मावती से विवाह कर भक्तों के कलियुग-कल्याण के लिए सप्तगिरि पर स्थायी रूप से निवास करते हैं।',
    originStoryEn: 'The Tirumala legend tells of Srinivasa marrying Padmavati and remaining on the Seven Hills for the protection and uplift of devotees in Kali Yuga.',
    sources: [source('Tirumala Tirupati Devasthanams - Temple Legend', 'https://www.tirumala.org/TempleLegend.aspx')],
  },
  meenakshi: {
    significanceHi: 'मदुरै की मीनाक्षी अम्मन परंपरा में देवी स्वयं नगर की अधिष्ठात्री रानी हैं और सुन्दरेश्वर शिव के साथ दिव्य विवाह का केन्द्र हैं।',
    significanceEn: 'Meenakshi Amman of Madurai presents Devi as the city’s sovereign goddess, paired with Sundareswarar in the celebrated divine wedding tradition.',
    originStoryHi: 'कथा में पाण्ड्य राजा को मीनाक्षी कन्या रूप में मिलीं; शिव सुन्दरेश्वर बनकर आए और उनके विवाह से मदुरै का दिव्य राज्य प्रतिष्ठित हुआ।',
    originStoryEn: 'The legend says Meenakshi was born to the Pandya king and later recognized Shiva as Sundareswarar, culminating in the sacred wedding of Madurai.',
    sources: [source('Meenakshi Temple - Reference', 'https://en.wikipedia.org/wiki/Meenakshi_Temple')],
  },
  'konark-sun': {
    significanceHi: 'कोणार्क सूर्य मंदिर 13वीं शताब्दी का विश्व-धरोहर स्मारक है, जिसे सूर्यदेव के विशाल रथ के रूप में रचा गया है।',
    significanceEn: 'Konark Sun Temple is a 13th-century World Heritage monument designed as Surya’s colossal stone chariot.',
    originStoryHi: 'गंग वंश के नरसिंहदेव प्रथम ने इसे सूर्य के रथ रूप में बनवाया; 24 पहिए और अश्व समय, दिशा और प्रकाश की प्रतीक रचना बनाते हैं।',
    originStoryEn: 'Built under Narasimhadeva I, its 24 wheels and horses express the chariot of the sun, linking architecture with time, light, and cosmic movement.',
    sources: [source('UNESCO - Sun Temple, Konarak', 'https://whc.unesco.org/en/list/246/')],
  },
  brihadeeswarar: {
    significanceHi: 'तंजावुर का बृहदीश्वर चोल स्थापत्य का महान शिव-मंदिर है, जिसे ग्रेट लिविंग चोल टेम्पल्स विश्व-धरोहर में गिना जाता है।',
    significanceEn: 'Brihadeeswarar at Thanjavur is a monumental Chola Shiva temple and part of the Great Living Chola Temples World Heritage site.',
    originStoryHi: 'राजराज चोल प्रथम ने 11वीं शताब्दी में राजराजेश्वरम् के रूप में इसका निर्माण कराया, जहाँ राजसत्ता और शिव-भक्ति का भव्य संगम दिखाई देता है।',
    originStoryEn: 'Rajaraja Chola I built the temple in the 11th century as Rajarajeshwaram, joining imperial Chola vision with devotion to Shiva.',
    sources: [source('UNESCO - Great Living Chola Temples', 'https://whc.unesco.org/en/list/250/')],
  },
  padmanabhaswamy: {
    significanceHi: 'तिरुवनंतपुरम का पद्मनाभस्वामी विष्णु को अनन्त शेष पर योगनिद्रा में दिखाता है और त्रावणकोर की राज-भक्ति से जुड़ा है।',
    significanceEn: 'Padmanabhaswamy in Thiruvananthapuram worships Vishnu reclining on Ananta Shesha and is deeply tied to the Travancore royal tradition.',
    originStoryHi: 'स्थल-परंपरा में भगवान अनन्त पद्मनाभ ने भक्तों को शयन-मूर्ति में दर्शन दिया; नगर का नाम भी अनन्त के पवित्र निवास से जुड़ता है।',
    originStoryEn: 'The local tradition centers on Anantha Padmanabha revealing the reclining Vishnu form, giving sacred identity to Thiruvananthapuram.',
    sources: [source('Sree Padmanabhaswamy Temple', 'https://spstt.org/')],
  },
  'banke-bihari': {
    significanceHi: 'वृंदावन के बांके बिहारी राधा-कृष्ण की माधुर्य-भक्ति का प्रिय मंदिर है, जहाँ झलक-दर्शन की लय भक्तिभाव को गहन बनाती है।',
    significanceEn: 'Banke Bihari in Vrindavan is a beloved Radha-Krishna shrine of madhurya bhakti, famous for intimate darshan rhythms.',
    originStoryHi: 'कथा में स्वामी हरिदास की संगीत-भक्ति से निधिवन में श्याम-श्यामा संयुक्त विग्रह प्रकट हुआ और बांके बिहारी नाम से पूजित हुआ।',
    originStoryEn: 'The temple story says Swami Haridas’s devotional music in Nidhivan revealed the united Radha-Krishna form now worshipped as Banke Bihari.',
    sources: [source('Shri Banke Bihari Mandir - History', 'https://www.bihariji.org/public/MandirHistory.aspx')],
  },
  srinathji: {
    significanceHi: 'नाथद्वारा का श्रीनाथजी पुष्टिमार्ग का प्रमुख कृष्ण-स्वरूप है, जहाँ ठाकुरजी को बाल-कृष्ण और गोवर्धनधारी रूप में सेवा दी जाती है।',
    significanceEn: 'Srinathji at Nathdwara is the central Krishna form of Pushtimarg, served as the child Krishna who lifts Govardhan.',
    originStoryHi: 'परंपरा में श्रीनाथजी गोवर्धन पर्वत से प्रकट हुए; बाद में विग्रह को सुरक्षित लाते समय रथ नाथद्वारा में रुक गया और वहीं सेवा स्थापित हुई।',
    originStoryEn: 'The tradition says Srinathji manifested from Govardhan Hill; while the image was being moved for safety, the cart stopped at Nathdwara and worship settled there.',
    sources: [source('Nathdwara Temple', 'https://www.nathdwaratemple.org/')],
  },
  'udupi-krishna': {
    significanceHi: 'उडुपी श्रीकृष्ण मठ माध्व परंपरा का प्रमुख वैष्णव केन्द्र है, जहाँ दर्शन कनकन-किंडी से होता है।',
    significanceEn: 'Udupi Sri Krishna is a major Madhva Vaishnava center, famous for darshan through the Kanakana Kindi window.',
    originStoryHi: 'कथा में भक्त कनकदास को प्रवेश न मिला तो उन्होंने पीछे से प्रार्थना की; कृष्ण-विग्रह उनकी ओर मुड़ गया और दर्शन-खिड़की बनी।',
    originStoryEn: 'The Kanakadasa legend says Krishna turned west to give darshan to the excluded devotee, leading to the sacred viewing window.',
    sources: [source('Karnataka Tourism - Udupi Sri Krishna Temple', 'https://karnatakatourism.org/attractions/udupi-sri-krishna-temple/')],
  },
  'vishnupad-gaya': {
    significanceHi: 'गया का विष्णुपद मंदिर भगवान विष्णु के पदचिह्न और पिंडदान परंपरा के कारण पितृ-श्राद्ध का महातीर्थ है।',
    significanceEn: 'Vishnupad in Gaya is a major ancestral-rite pilgrimage, centered on the sacred footprint of Vishnu.',
    originStoryHi: 'कथा में विष्णु ने गयासुर को अपने चरण से स्थिर किया; उसी शिला पर चरणचिह्न प्रतिष्ठित हुआ और गया पितृ-मोक्ष से जुड़ा।',
    originStoryEn: 'The legend says Vishnu subdued Gayasura with his foot, leaving the footprint that made Gaya a sacred place for ancestral offerings.',
    sources: [source('Bihar Tourism - Vishnupad Temple', 'https://tourism.bihar.gov.in/en/destinations/gaya/vishnupad-temple')],
  },
  bhadrachalam: {
    significanceHi: 'गोदावरी तट का भद्राचलम दक्षिण अयोध्या कहा जाता है और सीता-रामचन्द्र स्वामी की भक्ति, संगीत और रामदासु परंपरा से प्रसिद्ध है।',
    significanceEn: 'Bhadrachalam on the Godavari is called Dakshina Ayodhya and is known for Sita Ramachandra worship and the bhakti of Ramadasu.',
    originStoryHi: 'कथा में भक्त भद्र ने राम-तारक मंत्र का जप किया; विष्णु राम रूप में प्रकट हुए और भद्र पर्वत पर सीता-लक्ष्मण सहित विराजे।',
    originStoryEn: 'The legend tells of the devotee Bhadra’s penance; Vishnu appeared as Rama with Sita and Lakshmana and blessed the hill that became Bhadrachalam.',
    sources: [source('Bhadrachalam Temple', 'https://bhadradritemple.telangana.gov.in/')],
  },
  danteshwari: {
    significanceHi: 'दंतेवाड़ा की दंतेश्वरी बस्तर की कुलदेवी और शक्ति-पीठ परंपरा का केन्द्र है, जहाँ बस्तर दशहरा विशेष रूप से प्रसिद्ध है।',
    significanceEn: 'Danteshwari of Dantewada is the kuldevi of Bastar and a Shakti Peeth tradition, central to the region’s famous Bastar Dussehra.',
    originStoryHi: 'कथा में सती का दांत यहाँ गिरा, इसलिए देवी दंतेश्वरी नाम से पूजित हुईं और स्थान दंतेवाड़ा कहलाया।',
    originStoryEn: 'The Shakti Peeth legend says a tooth of Sati fell here, giving the goddess the name Danteshwari and the place its sacred identity.',
    sources: [source('Danteshwari Temple - Reference', 'https://en.wikipedia.org/wiki/Danteshwari_Temple')],
  },
  mangueshi: {
    significanceHi: 'गोवा का मंगेशी मंदिर शिव के मंगेश रूप का प्रमुख सारस्वत तीर्थ है, जो पोंडा क्षेत्र की मंदिर-परंपरा का जीवंत केन्द्र है।',
    significanceEn: 'Mangueshi in Goa is a major Saraswat Shiva shrine and one of the living centers of the Ponda temple tradition.',
    originStoryHi: 'लोककथा में शिव ने पार्वती को परखने के लिए व्याघ्र रूप लिया; भयभीत पार्वती ने “मां गिरीश” पुकारा, जिससे मंगेश नाम जुड़ा।',
    originStoryEn: 'In the local legend, Shiva appeared as a tiger to test Parvati; her cry “Mam Girisha” became associated with the name Manguesh.',
    sources: [source('Goa Tourism - Manguesh Temple', 'https://goa-tourism.com/temple/manguesh-temple/')],
  },
  'lakshmi-narayan': {
    significanceHi: 'दिल्ली का लक्ष्मीनारायण या बिरला मंदिर आधुनिक भारत का प्रमुख वैष्णव मंदिर है, जहाँ प्रवेश-समानता को आरम्भ से महत्व दिया गया।',
    significanceEn: 'Delhi’s Lakshmi Narayan or Birla Mandir is a major modern Vishnu-Lakshmi shrine, notable for its early public emphasis on equal entry.',
    originStoryHi: '1939 में जे.के. बिरला द्वारा निर्मित मंदिर का उद्घाटन महात्मा गांधी ने इस शर्त पर किया कि सभी जातियों के लोग प्रवेश कर सकें।',
    originStoryEn: 'Built by J. K. Birla and inaugurated by Mahatma Gandhi in 1939, the temple opened with the condition that people of all castes could enter.',
    sources: [source('Delhi Tourism - Birla Mandir', 'https://delhitourism.gov.in/tourist_place/birla_mandir.html')],
  },
  durgiana: {
    significanceHi: 'अमृतसर का दुर्गियाना मंदिर देवी दुर्गा, लक्ष्मी-नारायण और शीतला उपासना का प्रमुख हिन्दू तीर्थ है, जिसकी रचना सरोवर-मध्य मंदिर रूप में है।',
    significanceEn: 'Durgiana Temple in Amritsar is a major Hindu shrine for Durga, Lakshmi-Narayan, and Sitla worship, built in a sarovar-centered form.',
    originStoryHi: 'इस स्थल की पुरानी दुर्गा-आराधना को 20वीं शताब्दी में पुनर्निर्मित भव्य मंदिर रूप मिला, इसलिए यह अमृतसर की साझा धार्मिक धरोहर में गिना जाता है।',
    originStoryEn: 'An older Durga worship site was rebuilt in the early twentieth century, giving Amritsar a prominent Hindu temple within its sacred urban landscape.',
    sources: [source('Incredible India - Durgiana Temple', 'https://www.incredibleindia.gov.in/en/punjab/amritsar/durgiana-temple')],
  },
  'mansa-devi': {
    significanceHi: 'पंचकूला की मनसा देवी शिवालिक पादभूमि में उत्तर भारत की शक्ति-उपासना का बड़ा केन्द्र है, विशेषकर नवरात्र मेलों में।',
    significanceEn: 'Mansa Devi at Panchkula is a major North Indian Shakti shrine in the Shivalik foothills, especially active during Navratri fairs.',
    originStoryHi: 'स्थानीय परंपरा में मनसा देवी को इच्छा-पूर्ति और संरक्षण देने वाली शक्ति माना जाता है; शिवालिक क्षेत्र के अनेक देवी-स्थान इसी शक्ति-मंडल से जुड़े हैं।',
    originStoryEn: 'Local tradition worships Mansa Devi as wish-fulfilling Shakti, part of a wider Shivalik belt of Devi shrines.',
    sources: [source('Haryana Tourism - Mata Mansa Devi Temple', 'https://haryanatourism.gov.in/places_of_interest/mata-mansa-devi-temple/')],
  },
  'govindajee-imphal': {
    significanceHi: 'इम्फाल का श्री गोविंदजी मंदिर मणिपुर की वैष्णव संस्कृति, रासलीला और राज-परंपरा का मुख्य कृष्ण-राधा केन्द्र है।',
    significanceEn: 'Shree Govindajee in Imphal is Manipur’s principal Radha-Krishna shrine, tied to Vaishnava culture, Ras Lila, and the old royal court.',
    originStoryHi: 'परंपरा में महाराजा जय सिंह को स्वप्नादेश मिला और काइना के कटहल वृक्ष से गोविंदजी की प्रतिमा बनाकर प्रतिष्ठित की गई।',
    originStoryEn: 'The tradition says a royal dream instructed the making of Govindaji’s image from a jackfruit tree at Kaina and its enshrinement in Manipur.',
    sources: [source('Manipur Tourism - Culture and Heritage', 'https://manipurtourism.gov.in/culture-and-heritage/')],
  },
  'tripura-sundari': {
    significanceHi: 'उदयपुर की त्रिपुर सुंदरी या माताबाड़ी 51 शक्ति पीठों में पूजित है और त्रिपुरा राज्य की देवी-परंपरा का केन्द्र है।',
    significanceEn: 'Tripura Sundari, or Matabari, at Udaipur is revered among the 51 Shakti Peethas and anchors Tripura’s Devi tradition.',
    originStoryHi: 'कथा में सती का दक्षिण चरण यहाँ गिरा; कूर्म-आकृति पहाड़ी पर देवी त्रिपुरसुंदरी और भैरव त्रिपुरेश की उपासना होती है।',
    originStoryEn: 'The Shakti Peeth legend says Sati’s right foot fell here; the tortoise-shaped hill is worshipped as Tripurasundari’s seat with Bhairava Tripuresh.',
    sources: [source('Tripura Sundari Temple', 'https://tripurasundari.tripura.gov.in/')],
  },
  'manakula-vinayagar': {
    significanceHi: 'पुडुचेरी का मनाकुला विनायगर समुद्र-तट के निकट प्राचीन गणेश मंदिर है, जो नगर की तमिल भक्ति परंपरा में गहराई से बसा है।',
    significanceEn: 'Manakula Vinayagar is an old Ganesha shrine near Puducherry’s coast, deeply rooted in the city’s Tamil devotional life.',
    originStoryHi: 'नाम को “मनल” यानी रेत और “कुलम” यानी सरोवर से जोड़ा जाता है; मान्यता है कि फ्रांसीसी काल से पहले भी यहाँ गणपति पूजा सतत रही।',
    originStoryEn: 'Its name is linked to sand and a pond near the sea; tradition holds that Ganesha worship here predates French rule in Puducherry.',
    sources: [source('Manakula Vinayagar Temple - Reference', 'https://en.wikipedia.org/wiki/Manakula_Vinayagar_Temple')],
  },
  'parashuram-kund': {
    significanceHi: 'लोहित नदी का परशुराम कुंड उत्तर-पूर्व भारत का प्रमुख स्नान-तीर्थ है, विशेषकर मकर संक्रांति पर हजारों यात्री आते हैं।',
    significanceEn: 'Parashuram Kund on the Lohit River is a major northeast Indian pilgrimage bath, especially during Makar Sankranti.',
    originStoryHi: 'कथा में परशुराम ने मातृहत्यादोष से मुक्ति के लिए लोहित जल में स्नान किया; तब उनके हाथ से फरसा छूटा और कुंड पाप-क्षालन से जुड़ा।',
    originStoryEn: 'The legend says Parashurama bathed in the Lohit to cleanse the sin of killing his mother; his axe fell away, sanctifying the kund.',
    sources: [source('Lohit District - Parshuram Kund', 'https://lohit.nic.in/tourist-place/parshuram-kund/')],
  },
  'nartiang-durga': {
    significanceHi: 'नारतियांग दुर्गा, जयन्ती शक्ति पीठ के रूप में, मेघालय के जयन्तिया क्षेत्र की शक्ति-साधना और स्थानीय राज-इतिहास से जुड़ी है।',
    significanceEn: 'Nartiang Durga, revered as Jayanti Shakti Peeth, links Shakta worship with the Jaintia Hills’ local royal and ritual history.',
    originStoryHi: 'शक्ति-पीठ कथा में सती की बाईं जांघ यहाँ गिरी; देवी जयन्ती और भैरव कामदीश्वर के रूप में इस स्थान की पूजा होती है।',
    originStoryEn: 'The Shakti Peeth legend says Sati’s left thigh fell at Nartiang; Devi is worshipped as Jayanti with Bhairava Kamadishwar.',
    sources: [source('Nartiang Durga Temple - Reference', 'https://en.wikipedia.org/wiki/Nartiang_Durga_Temple')],
  },
  kirateshwar: {
    significanceHi: 'लेगशिप का किरातेश्वर महादेव रंगीत नदी तट पर स्थित सिक्किम का प्रमुख शिव तीर्थ है, जो महाभारत की अर्जुन-तपस्या से जुड़ा है।',
    significanceEn: 'Kirateshwar Mahadev at Legship is a Sikkim Shiva shrine on the Rangeet River, associated with Arjuna’s Mahabharata penance.',
    originStoryHi: 'कथा में शिव किरात शिकारी रूप में अर्जुन के सामने प्रकट हुए और उसकी तपस्या से प्रसन्न होकर उसे विजय का वरदान दिया।',
    originStoryEn: 'The legend says Shiva appeared before Arjuna as the hunter Kirata and blessed him after testing his devotion and martial resolve.',
    sources: [source('Kirateshwar Mahadev Temple - Reference', 'https://en.wikipedia.org/wiki/Kirateshwar_Mahadev_Temple')],
  },
  'vetrimalai-murugan': {
    significanceHi: 'पोर्ट ब्लेयर का वेत्रिमलै मुरुगन मंदिर अंडमान का सबसे प्रमुख हिन्दू तीर्थ है, जहाँ शिव-पुत्र मुरुगन (कार्तिकेय) की उपासना होती है।',
    significanceEn: 'In Port Blair, the Vetrimalai Murugan Temple is the islands’ foremost Hindu pilgrimage site, dedicated to Murugan (Kartikeya), the son of Shiva.',
    originStoryHi: 'मूलतः यहाँ विनायक की छोटी पूजा-स्थली थी; 1926 के आसपास मुरुगन मंदिर की स्थापना हुई और यह द्वीपवासियों की आस्था का बड़ा केन्द्र बन गया।',
    originStoryEn: 'Originally a small Vinayaka shrine, the Murugan temple was established around 1926 and grew into the main centre of devotion for the islanders.',
    sources: [source('Sri Vetrimalai Murugan Temple - Reference', 'https://en.wikipedia.org/wiki/Sri_Vetrimalai_Murugan_Temple')],
  },
  'iskcon-chandigarh': {
    significanceHi: 'सेक्टर-36 का इस्कॉन मंदिर (हरे कृष्ण धाम) चंडीगढ़ का प्रमुख सक्रिय कृष्ण मंदिर है, जहाँ नित्य आरती, दर्शन और भागवत-सत्संग होते हैं।',
    significanceEn: 'The ISKCON temple (Hare Krishna Dham) in Sector 36 is Chandigarh’s leading active Krishna temple, with daily aarti, darshan, and Bhagavata satsang.',
    originStoryHi: 'यह मंदिर अंतरराष्ट्रीय कृष्णभावनामृत संघ (इस्कॉन) की परंपरा में राधा-कृष्ण की सेवा-पूजा के लिए स्थापित है और नगर का बड़ा भक्ति-केन्द्र बन गया है।',
    originStoryEn: 'Established in the ISKCON tradition for the worship of Radha and Krishna, it has become a major devotional centre for the city.',
    sources: [source('ISKCON Chandigarh - Official', 'https://iskconchandigarh.com/')],
  },
  'dimapur-kalibari': {
    significanceHi: 'दीमापुर कालीबाड़ी नागालैंड का प्रमुख हिन्दू मंदिर है, जो माँ काली को समर्पित है और दुर्गा पूजा तथा काली पूजा का बड़ा केन्द्र है।',
    significanceEn: 'Dimapur Kalibari is Nagaland’s principal Hindu temple, dedicated to Goddess Kali and a major centre for Durga Puja and Kali Puja.',
    originStoryHi: '1956 में स्थापित यह मंदिर पूर्वोत्तर भारत के प्रसिद्ध देवी-स्थलों में गिना जाता है और क्षेत्र के अनेक भक्तों की आस्था का केन्द्र है।',
    originStoryEn: 'Built in 1956, it is counted among the well-known Devi shrines of Northeast India and anchors the faith of many devotees in the region.',
    sources: [source('Dimapur Kalibari - Reference', 'https://en.wikipedia.org/wiki/Dimapur_Kalibari')],
  },
  'khatu-shyam': {
    significanceHi: 'सीकर ज़िले के खाटू में स्थित खाटू श्याम जी राजस्थान का सबसे व्यस्त लोकदेव तीर्थ है, जहाँ श्याम बाबा को कलियुग में कृष्ण का ही स्वरूप और “हारे का सहारा” माना जाता है। लोक-परम्परा में पहला मंदिर खाटू के शासक रूपसिंह चौहान ने विक्रम संवत् 1084 (सन् 1027) में बनवाया और वर्तमान मंदिर सन् 1720 (विक्रम संवत् 1777) में बना; फाल्गुन शुक्ल एकादशी को यहाँ लाखों श्रद्धालु निशान लेकर पहुँचते हैं।',
    significanceEn: 'At Khatu in Sikar district, Khatu Shyam Ji is Rajasthan’s busiest lokdevta shrine, where Shyam Baba is revered as Krishna himself in the Kali Yuga and called “haare ka sahara”, refuge of the defeated. Tradition holds that the first temple was raised by Roop Singh Chauhan, ruler of Khatu, in Vikram Samvat 1084 (1027 CE), and the present temple dates from 1720 CE (Vikram Samvat 1777); on Phalgun Shukla Ekadashi lakhs of devotees arrive carrying nishan flags.',
    originStoryHi: 'कथा में भीम के पौत्र और घटोत्कच के पुत्र बर्बरीक ने महाभारत-युद्ध से पूर्व फाल्गुन शुक्ल एकादशी को कृष्ण को अपना शीश दान किया; प्रसन्न होकर कृष्ण ने वर दिया कि वे कलियुग में उन्हीं के नाम “श्याम” से पूजे जाएँगे। युद्ध के बाद शीश खाटू की भूमि में समाहित हुआ और कलियुग में एक गाय के थन से स्वतः दूध बहने पर वहीं से प्रकट हुआ।',
    originStoryEn: 'In the legend, Barbarika, son of Ghatotkacha and grandson of Bhima, offered his head to Krishna on Phalgun Shukla Ekadashi before the Mahabharata war; pleased, Krishna blessed him to be worshipped in the Kali Yuga by Krishna’s own name, “Shyam”. After the war the head was laid to rest in the soil of Khatu, and in the Kali Yuga it surfaced at the spot where milk began to flow of its own accord from a cow’s udder.',
    sources: [
      source('Rajasthan Devasthan - Khatushyamji', 'https://devasthan.rajasthan.gov.in/images/Sikar/khatushyamji.htm'),
      source('Rajasthan Tourism - Khatu Shyamji Temple', 'https://www.tourism.rajasthan.gov.in/khatu-shyamji-temple.html'),
      source('Khatu Shyam Temple - Reference', 'https://en.wikipedia.org/wiki/Khatu_Shyam_Temple'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'कहते हैं कि खाटू गाँव की एक गाय प्रतिदिन एक ही स्थान पर जाकर स्वतः दूध बहा देती थी; ग्रामीणों ने वह भूमि खोदी तो बर्बरीक का शीश प्रकट हुआ, जिसे एक ब्राह्मण ने संभालकर पूजा। उसी काल में खाटू के शासक रूपसिंह चौहान को स्वप्न में मंदिर बनवाकर शीश प्रतिष्ठित करने का आदेश मिला — एक अन्य परम्परा यह स्वप्न उनकी रानी नर्मदा कँवर को हुआ बताती है। जहाँ शीश निकला वह स्थान आज श्याम कुंड कहलाता है। परम्परा के अनुसार पहला मंदिर विक्रम संवत् 1084 (सन् 1027) में बना और प्रतिष्ठा उसी फाल्गुन शुक्ल एकादशी को हुई जिस तिथि को बर्बरीक ने कृष्ण को शीश दान किया था। सन् 1720 (विक्रम संवत् 1777) में मारवाड़ के शासन-काल में दीवान अभयसिंह ने पुराने मंदिर का जीर्णोद्धार कराकर उसे वर्तमान रूप दिया और शीश को गर्भगृह में पुनः प्रतिष्ठित किया। आज मंदिर की सेवा-व्यवस्था श्री श्याम मंदिर कमेटी, खाटू के हाथ में है; मंदिर के पास श्याम बगीची है, जहाँ से बाबा को अर्पित फूल चुने जाते हैं और जहाँ परम भक्त आलू सिंह की समाधि बताई जाती है।',
        bodyEn: 'It is told that a cow of Khatu village went daily to one spot where milk streamed from her udder of its own accord; when the villagers dug there, the head of Barbarika emerged and a Brahmin kept and worshipped it. Around the same time Roop Singh Chauhan, ruler of Khatu, was commanded in a dream to build a temple and enshrine the head — another telling gives the dream to his queen, Narmada Kanwar. The place where the head surfaced is known today as Shyam Kund. By tradition the first temple was raised in Vikram Samvat 1084 (1027 CE) and consecrated on Phalgun Shukla Ekadashi, the very tithi on which Barbarika had offered his head to Krishna. In 1720 CE (Vikram Samvat 1777), under Marwar’s rule, Diwan Abhay Singh rebuilt the old shrine into its present form and re-enshrined the head in the sanctum. The temple is today administered by the Shree Shyam Mandir Committee, Khatu; beside it lies the Shyam Bagichi, the garden from which the flowers offered to Baba are picked and where the samadhi of the devotee Aloo Singh is said to rest.',
      },
      {
        id: 'svarup',
        titleHi: 'श्याम बाबा का स्वरूप',
        titleEn: 'The Form of Shyam Baba',
        bodyHi: 'खाटू में पूरी प्रतिमा नहीं, केवल बर्बरीक का शीश पूजा जाता है — इसीलिए बाबा को “शीश के दानी” कहा जाता है। श्याम वर्ण का यह शीश गर्भगृह में मुकुट, फूल-मालाओं और नित्य बदलते श्रृंगार से सजा रहता है, और भक्तों को सामने से खुले दर्शन मिलते हैं; बाबा का श्रृंगार प्रतिदिन नया होता है और सुबह की श्रृंगार आरती में उसे देखने की विशेष भीड़ रहती है। मंदिर संगमरमर और चूने से बना है और गर्भगृह के द्वार चाँदी की नक़्क़ाशी से सुसज्जित हैं। परिसर के पास श्याम कुंड है, जहाँ से शीश प्रकट हुआ था और जिसमें स्नान को पुण्यदायी माना जाता है।',
        bodyEn: 'At Khatu no full image is worshipped — only the head of Barbarika, which is why Baba is called “Sheesh ke Daani”, the giver of his head. Dark-hued, the head sits in the sanctum crowned and garlanded, its shringar changed every day, and devotees have open darshan from the front; the morning Shringar aarti, when the new adornment is first seen, draws a special crowd. The temple is built of marble and lime, with the sanctum doors worked in silver. Close by is Shyam Kund, the tank from which the head emerged, where a dip is held to be purifying.',
      },
      {
        id: 'parampara',
        titleHi: 'निशान यात्रा और एकादशी',
        titleEn: 'Nishan Yatra and Ekadashi',
        bodyHi: 'खाटू की सबसे पहचानी परम्परा निशान है — मनौती पूरी होने या माँगने पर भक्त बाबा का ध्वज (निशान) कंधे पर उठाकर रींगस से खाटू तक लगभग 17 किमी पैदल चलते हैं और उसे मंदिर के शिखर पर चढ़ाते हैं। बाबा को इत्र और गुलाब के फूल अर्पित करने की परम्परा है, और खीर-चूरमा व मावे के पेड़े प्रचलित भोग हैं; और रात-भर के भजन-जागरण खाटू की पहचान हैं। हर मास की एकादशी और द्वादशी को विशेष भीड़ रहती है, क्योंकि एकादशी बर्बरीक के शीश-दान की तिथि है। दर्शन प्रातः मंगला आरती से आरम्भ होकर श्रृंगार, भोग, संध्या और शयन आरती तक चलते हैं; समय ग्रीष्म और शीत ऋतु में थोड़ा बदलता है।',
        bodyEn: 'Khatu’s most recognisable tradition is the nishan — a devotee who has asked for or received a boon carries Baba’s flag on the shoulder and walks roughly 17 km from Ringas to Khatu to raise it on the temple shikhara. Perfume and rose petals are traditionally offered to Baba, and kheer-churma and mawa pedas are the popular bhog; and night-long bhajan jagrans are Khatu’s signature. Every month’s Ekadashi and Dwadashi bring the largest crowds, since Ekadashi is the tithi of Barbarika’s gift of his head. Darshan opens with the Mangala aarti and runs through the Shringar, Bhog, Sandhya and Shayan aartis; the hours shift a little between summer and winter.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'वर्ष का सबसे बड़ा उत्सव फाल्गुन मेला है, जो फाल्गुन शुक्ल षष्ठी से द्वादशी तक चलता है और जिसका चरम एकादशी-द्वादशी (फरवरी–मार्च) को होता है — इन दिनों 25 से 35 लाख तक श्रद्धालु खाटू पहुँचते हैं और जयपुर, दिल्ली, हरियाणा तथा पंजाब से पदयात्री संघ निशान लेकर चलते हैं। कार्तिक शुक्ल एकादशी (देवउठनी) का मेला दूसरा बड़ा अवसर है, और हर एकादशी को छोटा मेला-सा लगता है। जन्माष्टमी, होली और बाबा के श्रृंगार-उत्सव भी विशेष धूम से मनाए जाते हैं, और भजन-संध्याएँ पूरे फाल्गुन मास चलती हैं।',
        bodyEn: 'The year’s greatest event is the Phalgun Mela, running from Phalgun Shukla Shashthi to Dwadashi with its peak on Ekadashi and Dwadashi (February–March) — in these days 25 to 35 lakh devotees reach Khatu, and padyatri groups from Jaipur, Delhi, Haryana and Punjab walk in carrying nishans. The Kartik Shukla Ekadashi (Devuthani) fair is the second great occasion, and every Ekadashi feels like a small mela of its own. Janmashtami, Holi and Baba’s shringar festivals are also kept with fervour, and bhajan evenings fill the whole month of Phalgun.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'खाटू सीकर ज़िले में जयपुर–सीकर मार्ग (राष्ट्रीय राजमार्ग 52) से थोड़ा हटकर है — रींगस से लगभग 17 किमी, सीकर से लगभग 45 किमी और जयपुर से लगभग 80 किमी। निकटतम रेलवे स्टेशन रींगस जंक्शन है और आगे सीकर व जयपुर; निकटतम हवाई अड्डा जयपुर है। अधिकांश तीर्थयात्री खाटू को सालासर बालाजी (लगभग 100 किमी) और जीण माता (लगभग 30 किमी) के साथ एक ही यात्रा में जोड़ते हैं — शेखावाटी का यह त्रिकोण लोक-आस्था का प्रसिद्ध मार्ग है। परिसर के पास श्याम कुंड और श्याम बगीची दर्शनीय हैं, और रींगस से खाटू तक का पैदल मार्ग निशान-यात्रियों से भरा रहता है।',
        bodyEn: 'Khatu lies in Sikar district just off the Jaipur–Sikar road (National Highway 52) — roughly 17 km from Ringas, 45 km from Sikar and 80 km from Jaipur. The nearest railhead is Ringas Junction, with Sikar and Jaipur beyond; the nearest airport is Jaipur. Most pilgrims pair Khatu with Salasar Balaji (about 100 km) and Jeen Mata (about 30 km) in a single yatra — this Shekhawati triangle is a well-worn route of folk devotion. Near the complex, Shyam Kund and the Shyam Bagichi are visited, and the walking road from Ringas to Khatu stays busy with nishan-bearers.',
      },
    ],
  },
  'salasar-balaji': {
    significanceHi: 'चूरू ज़िले का सालासर धाम हनुमान-भक्ति का सिद्धपीठ माना जाता है। श्रावण शुक्ल नवमी, विक्रम संवत् 1811 (सन् 1754) को स्थापित यह मंदिर दाढ़ी-मूँछ वाले बालाजी की विश्व में एकमात्र ऐसी प्रतिमा के लिए प्रसिद्ध है; संत मोहनदास जी की अखंड धूणी, सवामणी और नारियल-मनौती की परम्पराएँ इसे राजस्थान के सबसे व्यस्त तीर्थों में रखती हैं।',
    significanceEn: 'Salasar Dham in Churu district is revered as a siddha-peeth of Hanuman devotion. Consecrated on Shravan Shukla Navami, Vikram Samvat 1811 (1754 CE), the temple is famed for the only Balaji murti worshipped with a beard and moustache; Sant Mohandas Ji’s unbroken dhuni, the Savamani offering and the coconut vow keep it among Rajasthan’s busiest pilgrimages.',
    originStoryHi: 'लोककथा में आसोटा गाँव (नागौर) के खेत में हल चलाते समय बालाजी की प्रतिमा प्रकट हुई; बालाजी ने आसोटा के ठाकुर और सालासर के संत मोहनदास जी दोनों को स्वप्न में आदेश दिया कि प्रतिमा सालासर लाकर प्रतिष्ठित की जाए। बैलगाड़ी जहाँ स्वयं रुकी, वहीं आज का मंदिर है।',
    originStoryEn: 'Local tradition says the Balaji murti surfaced while a farmer ploughed his field at Asota village (Nagaur). Balaji then appeared in dreams to both the Thakur of Asota and Sant Mohandas Ji of Salasar, directing that the image be brought to Salasar and enshrined; the temple stands where the bullock cart carrying it halted on its own.',
    sources: [
      source('Shree Salasar Balaji Mandir', 'https://shreesalasarbalajimandir.com/'),
      source('Rajasthan Tourism - Salasar Balaji Temple', 'https://www.tourism.rajasthan.gov.in/salasar-balaji-temple.html'),
      source('Salasar Balaji - Reference', 'https://en.wikipedia.org/wiki/Salasar_Balaji'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'संत मोहनदास जी दाधीच ब्राह्मण कुल में जन्मे बालब्रह्मचारी थे और अपनी बहन कान्ही बाई तथा भांजे उदयराम के साथ सालासर में रहते थे। कहते हैं कि हनुमान जी ने उन्हें एक दाढ़ी-मूँछ वाले साधु के रूप में दर्शन दिए और वचन दिया कि वे मूर्ति-रूप में सालासर आएँगे। उसी काल में आसोटा के एक जाट किसान के हल से खेत में एक प्रतिमा निकली; उसकी पत्नी ने उसे साड़ी के पल्लू से पोंछा तो दाढ़ी-मूँछ वाले बालाजी का स्वरूप प्रकट हुआ। आसोटा के ठाकुर को उसी रात स्वप्न में आदेश हुआ कि प्रतिमा सालासर भेजी जाए, और मोहनदास जी को स्वप्न में सूचना मिली कि बालाजी पधार रहे हैं। बैलगाड़ी सालासर पहुँचकर एक स्थान पर स्वयं रुक गई; उसी भूमि पर श्रावण शुक्ल नवमी, शनिवार, विक्रम संवत् 1811 (सन् 1754) को प्रतिमा प्रतिष्ठित हुई। मंदिर का प्रारम्भिक निर्माण फतेहपुर के मुसलमान कारीगर नूरा और दाऊ ने किया — यह साझी भक्ति की कथा आज भी सुनाई जाती है। मोहनदास जी ने बालाजी की सेवा में जीवन समर्पित किया; उनके देह-त्याग के बाद उनकी समाधि मंदिर परिसर में ही बनी, और कान्ही बाई के पुत्र उदयराम के वंशज आज तक पुजारी रूप में सेवा करते हैं।',
        bodyEn: 'Sant Mohandas Ji, a celibate ascetic born into a Dadhich Brahmin family, lived at Salasar with his sister Kanhi Bai and her son Udayram. Hanuman is said to have appeared to him as a sadhu with a beard and moustache and promised to come to Salasar in the form of a murti. Around that time, at Asota, a Jat farmer’s plough struck an image in his field; when his wife wiped it clean with the edge of her sari, the bearded, moustached form of Balaji emerged. That night the Thakur of Asota was told in a dream to send the murti to Salasar, while Mohandas Ji was told in his own dream that Balaji was on his way. At Salasar the bullock cart stopped of its own accord, and on that ground the murti was consecrated on Shravan Shukla Navami, a Saturday, in Vikram Samvat 1811 (1754 CE). The first shrine was built by Noora and Dau, Muslim masons from Fatehpur, a story of shared devotion still told at the Dham. Mohandas Ji gave the rest of his life to Balaji’s service; his samadhi stands within the temple complex, and the descendants of Kanhi Bai’s son Udayram serve as the temple’s pujaris to this day.',
      },
      {
        id: 'svarup',
        titleHi: 'बालाजी का स्वरूप',
        titleEn: 'The Form of Balaji',
        bodyHi: 'सालासर के बालाजी विश्व में हनुमान जी की एकमात्र दाढ़ी-मूँछ वाली प्रतिमा माने जाते हैं — वही साधु-रूप जिसमें उन्होंने मोहनदास जी को दर्शन दिए थे। प्रतिमा गर्भगृह में सोने-चाँदी के सिंहासन पर विराजित है और उसके ऊपर स्वर्ण-छत्र है; मुख्य द्वार और गर्भगृह की दीवारें चाँदी की नक़्क़ाशी और रंगीन दर्पण-कला से सजी हैं। गर्भगृह के पास ही मोहनदास जी की अखंड धूणी है, जो उनके समय से निरन्तर प्रज्वलित बताई जाती है; भक्त इसकी भभूत प्रसाद-रूप में ले जाते हैं।',
        bodyEn: 'Salasar’s Balaji is held to be the only Hanuman murti in the world with a beard and moustache — the sadhu form in which he appeared to Mohandas Ji. The image sits on a gold-and-silver throne in the sanctum under a golden canopy; the main gate and sanctum walls carry silver repoussé work and coloured mirror inlay. Beside the sanctum burns Mohandas Ji’s akhand dhuni, a sacred fire said to have been kept alight since his time; devotees carry its ash home as prasad.',
      },
      {
        id: 'parampara',
        titleHi: 'सवामणी और मनौती',
        titleEn: 'Savamani and Vows',
        bodyHi: 'सालासर की सबसे प्रसिद्ध परम्परा सवामणी है — मनोकामना पूर्ण होने पर सवा मन (लगभग 50 किलो) भोग का अर्पण, जो प्रायः चूरमा, लड्डू, पूड़ी-सब्ज़ी या हलवे के रूप में चढ़ाकर भक्तों में बाँटा जाता है। चूरमा — गेहूँ, घी और गुड़ का देशी प्रसाद — बालाजी का प्रिय भोग माना जाता है। मनौती के लिए भक्त मंदिर परिसर में मौली बाँधकर नारियल अर्पित करते हैं और कामना पूरी होने पर उसे खोलने आते हैं; इसी कारण परिसर में हज़ारों नारियल बँधे दिखते हैं। मंगला आरती से शयन आरती तक दिन भर दर्शन चलते हैं, और मंगलवार व शनिवार को विशेष भीड़ रहती है।',
        bodyEn: 'Salasar’s best-known tradition is the Savamani — an offering of a sawa man (about 50 kg) of food made when a wish is fulfilled, usually churma, laddoo, puri-sabzi or halwa, offered to Balaji and then shared among devotees. Churma, the desi prasad of wheat, ghee and jaggery, is regarded as Balaji’s favourite bhog. For a vow, devotees tie a coconut with mauli thread within the temple precinct and return to untie it once the wish is granted, which is why thousands of coconuts hang there. Darshan runs through the day from the Mangala aarti to the Shayan aarti, with the largest crowds on Tuesdays and Saturdays.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'वर्ष के दो बड़े मेले चैत्र पूर्णिमा (हनुमान जयंती) और आश्विन पूर्णिमा (शरद पूर्णिमा) पर लगते हैं, जब लाखों श्रद्धालु सालासर पहुँचते हैं; अनेक पदयात्री संघ जयपुर, सीकर और दूर-दूर से पैदल आते हैं। श्रावण शुक्ल नवमी को स्थापना-दिवस मनाया जाता है और इस मास में विशेष श्रृंगार व भजन-संध्याएँ होती हैं। हर पूर्णिमा को भी भारी भीड़ रहती है, और भक्त बालाजी के भजन-कीर्तन व रात्रि-जागरण के लिए धर्मशालाओं में ठहरते हैं।',
        bodyEn: 'Two great fairs fill the year — Chaitra Purnima (Hanuman Jayanti) and Ashwin Purnima (Sharad Purnima), when lakhs of devotees converge on Salasar and many padyatri groups walk in from Jaipur, Sikar and far beyond. Shravan Shukla Navami is kept as the sthapana day, with special shringar and evening bhajan gatherings through the month. Every Purnima draws heavy crowds, and pilgrims stay in the dharamshalas for kirtan and night-long jagrans in Balaji’s honour.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'सालासर जयपुर–बीकानेर मार्ग पर चूरू ज़िले में स्थित है — सुजानगढ़ से लगभग 25 किमी, सीकर से लगभग 57 किमी और जयपुर से लगभग 170 किमी। निकटतम रेलवे स्टेशन सुजानगढ़, रतनगढ़ और सीकर हैं; निकटतम हवाई अड्डा जयपुर है। अधिकांश तीर्थयात्री सालासर को खाटूश्यामजी (लगभग 100 किमी) के साथ एक ही यात्रा में जोड़ते हैं। धाम से लगभग 2 किमी दूर हनुमान जी की माता का अंजनी माता मंदिर है — कहा जाता है कि बालाजी के दर्शन के बाद अंजनी माता के दर्शन से यात्रा पूर्ण होती है। परिसर में मोहनदास जी और कान्ही बाई की समाधियाँ भी दर्शनीय हैं।',
        bodyEn: 'Salasar lies in Churu district on the Jaipur–Bikaner road — roughly 25 km from Sujangarh, 57 km from Sikar and 170 km from Jaipur. The nearest railheads are Sujangarh, Ratangarh and Sikar; the nearest airport is Jaipur. Most pilgrims pair Salasar with Khatushyamji (about 100 km) in a single yatra. About 2 km from the Dham stands the Anjani Mata temple, dedicated to Hanuman’s mother — the yatra is said to be complete only when her darshan follows Balaji’s. Within the complex, the samadhis of Mohandas Ji and Kanhi Bai are also visited.',
      },
    ],
  },
  'karni-mata': {
    significanceHi: 'बीकानेर के पास देशनोक का करणी माता मंदिर बीकानेर और जोधपुर के राजघरानों की कुलदेवी का धाम है और काबा कहलाने वाले हज़ारों पवित्र चूहों की अनोखी परम्परा के लिए विश्वभर में जाना जाता है। करणी माता का जन्म आश्विन शुक्ल सप्तमी, विक्रम संवत् 1444 (सन् 1387) को हुआ; उन्होंने वैशाख शुक्ल द्वितीया, विक्रम संवत् 1476 (सन् 1419) को देशनोक बसाया, और वर्तमान संगमरमर का मंदिर बीसवीं सदी के आरम्भ में बीकानेर के महाराजा गंगा सिंह ने बनवाया।',
    significanceEn: 'Karni Mata Temple at Deshnoke near Bikaner is the seat of the kuldevi of the royal houses of Bikaner and Jodhpur, and is known across the world for the thousands of sacred rats, the kabas, that live freely in its precinct. Karni Mata was born on Ashwin Shukla Saptami, Vikram Samvat 1444 (1387 CE); she founded Deshnoke on Vaisakh Shukla Dwitiya, Vikram Samvat 1476 (1419 CE), and the present marble temple was raised in the early 20th century by Maharaja Ganga Singh of Bikaner.',
    originStoryHi: 'कथा में करणी माता के कुल के बालक लक्ष्मण कपिल सरोवर में डूब गए; माता ने यम से उन्हें लौटाने की प्रार्थना की। यम ने वचन दिया कि लक्ष्मण और माता के कुल के सभी बालक मृत्यु के बाद काबा (चूहे) रूप में देशनोक में जन्म लेंगे और फिर काबा से मनुष्य बनेंगे — इसी से मंदिर में काबाओं की सेवा होती है।',
    originStoryEn: 'In the legend, Laxman, a child of Karni Mata’s clan, drowned in Kapil Sarovar and the goddess pleaded with Yama to return him. Yama granted that Laxman and all the children of her lineage would, after death, be born at Deshnoke as kabas (rats) and from kabas be born again as humans — which is why the rats are served in the temple.',
    sources: [
      source('Rajasthan Tourism - Karni Mata Temple', 'https://www.tourism.rajasthan.gov.in/karni-mata-temple.html'),
      source('Karni Mata Fair, Deshnok - Utsav (Ministry of Tourism)', 'https://utsav.gov.in/view-event/karni-mata-fair-deshnok-1'),
      source('Karni Mata Temple - Reference', 'https://en.wikipedia.org/wiki/Karni_Mata_Temple'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'करणी माता का जन्म आश्विन शुक्ल सप्तमी, विक्रम संवत् 1444 (2 अक्टूबर 1387) को फलोदी के पास सुवाप गाँव में चारण जाति के किनिया कुल में हुआ; उनका बचपन का नाम रिधु बाई था और उन्हें दुर्गा का अवतार माना गया। विवाह के बाद उन्होंने गृहस्थ जीवन त्यागकर परिक्रमा और जन-सेवा का मार्ग लिया। परम्परा कहती है कि राव जोधा को जोधपुर और राव बीका को बीकानेर बसाने का आशीर्वाद उन्हीं से मिला — इसीलिए वे दोनों राजघरानों की कुलदेवी हैं। वैशाख शुक्ल द्वितीया, विक्रम संवत् 1476 (सन् 1419) को उन्होंने देशनोक गाँव बसाया और यहीं एक गुफा में साधना की, जो आज मंदिर के भीतर “निज मंदिर” रूप में पूजी जाती है। सन् 1538 (विक्रम संवत् 1595) में धीनेरू के पास वे अंतर्धान हो गईं। उनकी साधना-स्थली पर पहला मंदिर पन्द्रहवीं सदी में बना; वर्तमान भव्य संगमरमर मंदिर बीसवीं सदी के आरम्भ में बीकानेर के महाराजा गंगा सिंह ने बनवाया, जिन्होंने चाँदी के द्वार भी भेंट किए। मंदिर की सेवा-पूजा करणी माता के कुल के दैपावत चारण परिवार करते हैं, जो स्वयं को माता के वंश का उत्तराधिकारी मानते हैं।',
        bodyEn: 'Karni Mata was born on Ashwin Shukla Saptami, Vikram Samvat 1444 (2 October 1387), at Suwap village near Phalodi, in the Kiniya lineage of the Charan community; her childhood name was Ridhu Bai and she came to be revered as an incarnation of Durga. After marriage she renounced household life for wandering and service. Tradition holds that Rao Jodha received her blessing to found Jodhpur and Rao Bika to found Bikaner — which is why she is kuldevi to both royal houses. On Vaisakh Shukla Dwitiya, Vikram Samvat 1476 (1419 CE), she settled the village of Deshnoke and performed her sadhana in a cave there, worshipped today within the temple as the “Nij Mandir”. In 1538 CE (Vikram Samvat 1595) she vanished near Dhinerau. The first shrine at her place of sadhana was built in the fifteenth century; the present grand marble temple was raised in the early twentieth century by Maharaja Ganga Singh of Bikaner, who also gifted its silver doors. The temple’s worship is in the hands of the Depawat Charan families of Karni Mata’s clan, who hold themselves to be her lineage’s heirs.',
      },
      {
        id: 'svarup',
        titleHi: 'करणी माता का स्वरूप',
        titleEn: 'The Form of Karni Mata',
        bodyHi: 'गर्भगृह में करणी माता की प्रतिमा हाथ में त्रिशूल लिए विराजित है, जिसके दोनों ओर उनकी बहनों की प्रतिमाएँ बताई जाती हैं। मंदिर की सबसे विशिष्ट पहचान उसके बीस हज़ार से अधिक काबा हैं, जो परिसर में स्वतंत्र विचरते हैं और जिनका माता के कुल से जन्म-सम्बन्ध माना जाता है; उनके बीच सफेद काबा के दर्शन को अत्यंत शुभ माना जाता है। मुख्य द्वार चाँदी का है, जिस पर माता की कथाओं के दृश्य उकेरे हैं, और आगे का संगमरमर का मुख-मंडप बारीक जालियों और नक़्क़ाशी से सजा है — यह सब महाराजा गंगा सिंह की भेंट है। भीतर की गुफा (निज मंदिर) माता की साधना-स्थली है, जहाँ भक्त शीश झुकाते हैं।',
        bodyEn: 'In the sanctum Karni Mata’s image sits holding a trishul, flanked, it is said, by images of her sisters. The temple’s most distinctive mark is its twenty thousand and more kabas, the rats that roam the precinct freely and are held to be born of the goddess’s own clan; a sighting of a white kaba among them is counted especially auspicious. The main gate is of silver, chased with scenes from the goddess’s life, and the marble front hall carries delicate jali screens and carving — all gifts of Maharaja Ganga Singh. The cave within, the Nij Mandir, is her place of sadhana, where devotees bow.',
      },
      {
        id: 'parampara',
        titleHi: 'काबा और कुलदेवी परम्परा',
        titleEn: 'The Kabas and the Kuldevi',
        bodyHi: 'देशनोक की परम्परा में काबाओं को माता के कुल के सदस्य मानकर उनकी सेवा की जाती है — भक्त उन्हें दूध, लड्डू और अनाज खिलाते हैं, और जिस प्रसाद को काबा चख लें उसे विशेष पवित्र मानकर ग्रहण करते हैं। किसी काबा को अनजाने में भी हानि पहुँचे तो प्रायश्चित्त में चाँदी या सोने का काबा अर्पित करने का नियम है, इसीलिए परिसर में पैर घसीटकर चला जाता है। माता चारण, राठौड़ और अनेक कुलों की कुलदेवी हैं; विवाह के बाद नवदम्पती और नवजात शिशुओं को धोक दिलाने लाया जाता है। दर्शन प्रातः मंगला आरती से रात्रि की आरती तक चलते हैं, और नवरात्रि में मंदिर लगभग निरन्तर खुला रहता है।',
        bodyEn: 'At Deshnoke the kabas are served as members of the goddess’s own clan — devotees feed them milk, laddoos and grain, and prasad that a kaba has nibbled is taken as especially blessed. Should a kaba be harmed even by accident, custom asks for a silver or gold rat in atonement, which is why people shuffle rather than step within the precinct. The goddess is kuldevi to the Charans, the Rathores and many other clans; newly married couples and newborn children are brought to bow before her. Darshan runs from the Mangala aarti at dawn to the night aarti, and during Navratri the temple stays open almost continuously.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'देशनोक में वर्ष में दो बड़े मेले लगते हैं, दोनों नवरात्रि पर — चैत्र शुक्ल प्रतिपदा से दशमी (मार्च–अप्रैल) का चैत्र मेला सबसे बड़ा है, और आश्विन शुक्ल प्रतिपदा से दशमी (सितम्बर–अक्टूबर) का दूसरा मेला भी लाखों श्रद्धालु खींचता है। आश्विन शुक्ल सप्तमी को करणी माता जयंती मनाई जाती है, जो शारदीय मेले के बीच पड़ती है। नवरात्रि में बीकानेर, जोधपुर और राजस्थान-भर से पदयात्री संघ पैदल देशनोक पहुँचते हैं, और रात्रि-जागरण व भजन-कीर्तन चलते रहते हैं।',
        bodyEn: 'Deshnoke holds two great fairs a year, both during Navratri — the Chaitra fair from Chaitra Shukla Pratipada to Dashami (March–April) is the larger, and the second from Ashwin Shukla Pratipada to Dashami (September–October) also draws lakhs of devotees. Karni Mata Jayanti is kept on Ashwin Shukla Saptami, which falls within the autumn fair. In Navratri padyatri groups walk to Deshnoke from Bikaner, Jodhpur and across Rajasthan, and night vigils and bhajan-kirtan continue through the fair.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'देशनोक बीकानेर ज़िले में बीकानेर–जोधपुर मार्ग (राष्ट्रीय राजमार्ग 62) पर है — बीकानेर से लगभग 30 किमी दक्षिण, नोखा से लगभग 30 किमी और जोधपुर से लगभग 220 किमी। देशनोक का अपना रेलवे स्टेशन मंदिर से लगभग 1 किमी दूर है और बीकानेर जंक्शन बड़ा रेलवे केन्द्र है; निकटतम हवाई अड्डा बीकानेर (नाल) है, और आगे जोधपुर। तीर्थयात्री प्रायः देशनोक को बीकानेर के जूनागढ़ किले और लक्ष्मीनाथ मंदिर के साथ, या जोधपुर–बीकानेर मार्ग पर मुकाम जैसे धामों के साथ जोड़ते हैं। देशनोक में ही नेहड़ी जी — जिसे परम्परा में माता की आरम्भिक साधना-स्थली माना जाता है — और परिसर का निज मंदिर भी दर्शनीय हैं।',
        bodyEn: 'Deshnoke lies in Bikaner district on the Bikaner–Jodhpur road (National Highway 62) — roughly 30 km south of Bikaner, 30 km from Nokha and 220 km from Jodhpur. Deshnoke has its own railway station about 1 km from the temple, with Bikaner Junction the major railhead; the nearest airport is Bikaner (Nal), with Jodhpur beyond. Pilgrims usually pair Deshnoke with Bikaner’s Junagarh fort and Laxminath temple, or with shrines such as Mukam on the Jodhpur–Bikaner road. Within Deshnoke, Nehri Ji, traditionally regarded as an early sadhana site of the goddess, and the Nij Mandir inside the complex are also visited.',
      },
    ],
  },
  'jeen-mata': {
    significanceHi: 'सीकर की अरावली पहाड़ियों में स्थित जीण माता धाम शेखावाटी का सिद्ध शक्तिपीठ है, जहाँ माँ जीण (जयन्ती) को अष्टभुजा महिषासुरमर्दिनी के रूप में पूजा जाता है और वे अनेक कुलों की कुलदेवी हैं। मंदिर सहस्र वर्ष से अधिक प्राचीन माना जाता है — यहाँ का सबसे पुराना ज्ञात शिलालेख विक्रम संवत् 1029 (लगभग सन् 972) का है — और लोक-मान्यता के अनुसार गर्भगृह की अखंड ज्योत औरंगज़ेब के काल से जल रही है।',
    significanceEn: 'Jeen Mata Dham in the Aravalli hills of Sikar is the siddha Shakti Peeth of Shekhawati, where Maa Jeen (Jayanti) is worshipped as the eight-armed Mahishasuramardini and is kuldevi to many clans. The temple is held to be more than a thousand years old — its oldest known inscription is dated Vikram Samvat 1029 (about 972 CE) — and by local tradition the unbroken jyot in the sanctum has burned since Aurangzeb’s time.',
    originStoryHi: 'कथा में चूरू के घांघू के राजा घंघ और एक अप्सरा की सन्तान हर्ष और जीण थे; भाभी से मनमुटाव के बाद जीण अरावली के काजल शिखर पर तप करने चली गईं और भाई हर्ष उन्हें मनाने आया, पर लौटा नहीं। जीण देवी-शक्ति रूप में प्रतिष्ठित हुईं और हर्ष सामने के हर्ष पर्वत पर भैरव रूप में — दोनों भाई-बहन आज भी आमने-सामने पूजे जाते हैं।',
    originStoryEn: 'In the legend, Harsh and Jeen were the children of Raja Ghangh of Ghanghu in Churu and an apsara; after a quarrel with her sister-in-law, Jeen went to perform tapas on Kajal Shikhar in the Aravallis and her brother Harsh followed to bring her back, but never returned. Jeen was enshrined as a form of Devi Shakti and Harsh as Bhairav on the facing Harsh hill — brother and sister are worshipped facing each other to this day.',
    sources: [
      source('Rajasthan Tourism - Jeen Mata Temple', 'https://www.tourism.rajasthan.gov.in/jeen-mata-temple.html'),
      source('Sikar District Portal - Jeen Mata', 'https://sikar.rajasthan.gov.in/'),
      source('Jeenmata - Reference', 'https://en.wikipedia.org/wiki/Jeenmata'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'लोककथा के अनुसार चूरू ज़िले के घांघू के राजा घंघ ने एक अप्सरा से विवाह किया, जिससे पुत्र हर्ष और पुत्री जीण हुए। हर्ष के विवाह के बाद जीण और उनकी भाभी में यह विवाद हुआ कि हर्ष पहले किसका सिर से उतारा गया पानी का घड़ा लेते हैं; आहत जीण घर छोड़कर अरावली के काजल शिखर पर तप करने चली गईं। हर्ष उन्हें मनाने पहुँचे, पर जीण के संकल्प के आगे वे भी सामने की पहाड़ी पर तप में लीन हो गए — जीण देवी-शक्ति (जयन्ती माता) के रूप में और हर्ष भैरव के रूप में प्रतिष्ठित हुए। मंदिर की स्थापना की कोई निश्चित तिथि अभिलेखों में नहीं मिलती; इसे सहस्र वर्ष से अधिक पुराना माना जाता है, यहाँ का सबसे प्राचीन ज्ञात शिलालेख विक्रम संवत् 1029 (लगभग सन् 972) का है, और सामने हर्ष पर्वत का हर्षनाथ मंदिर 973 ई. के शिलालेख के अनुसार चौहान राजा विग्रहराज प्रथम के काल में शैव तपस्वी भावरक्त ने बनवाया। सदियों में शेखावाटी के शासकों और भक्तों ने मंदिर का जीर्णोद्धार और विस्तार कराया। लोक-मान्यता के अनुसार औरंगज़ेब की सेना ने मंदिर तोड़ने का प्रयास किया तो माता की भ्रमर-सेना (मधुमक्खियों) ने उसे खदेड़ दिया; क्षमा माँगते हुए बादशाह ने दिल्ली से तेल भेजकर अखंड ज्योत का वचन दिया, जो परम्परा के अनुसार आज भी जलती है। आज मंदिर की व्यवस्था स्थानीय मंदिर समिति और पुजारी-परिवार देखते हैं।',
        bodyEn: 'According to the folk katha, Raja Ghangh of Ghanghu in Churu district married an apsara, and their children were a son, Harsh, and a daughter, Jeen. After Harsh’s marriage, Jeen and her sister-in-law quarrelled over whose water pot Harsh would lift from the head first; wounded, Jeen left home to perform tapas on Kajal Shikhar in the Aravallis. Harsh came to bring her back, but before her resolve he too sank into tapas on the facing hill — Jeen was enshrined as Devi Shakti (Jayanti Mata) and Harsh as Bhairav. No fixed date of the temple’s founding survives in the records; it is held to be more than a thousand years old, its oldest known inscription is dated Vikram Samvat 1029 (about 972 CE), and the Harshnath temple on the facing Harsh hill was, by an inscription of 973 CE, built by the Shaiva ascetic Bhavarakta in the reign of the Chauhan king Vigraharaja I. Over the centuries Shekhawati’s rulers and devotees rebuilt and enlarged the shrine. Local tradition tells how Aurangzeb’s army tried to break the temple and was driven off by the goddess’s army of bees; seeking pardon, the emperor sent oil from Delhi and pledged an unbroken lamp, which by tradition burns to this day. The temple is now cared for by the local temple committee and its pujari families.',
      },
      {
        id: 'svarup',
        titleHi: 'जीण माता का स्वरूप',
        titleEn: 'The Form of Jeen Mata',
        bodyHi: 'गर्भगृह में जीण माता अष्टभुजा महिषासुरमर्दिनी दुर्गा के रूप में विराजित हैं — आठ भुजाओं में आयुध लिए, महिषासुर का वध करती हुई। मंदिर पहाड़ी की तलहटी में संगमरमर और पत्थर से बना है, जिसके स्तम्भों और दीवारों पर पुराने शिलालेख और नक़्क़ाशी हैं; प्रवेश पर बड़ा सभा-मंडप और परिक्रमा-मार्ग है। गर्भगृह की सबसे विशिष्ट पहचान वह अखंड ज्योत है, जो कथा के अनुसार औरंगज़ेब के काल से निरन्तर जल रही है। पहाड़ी की चोटी पर काजल शिखर की वह गुफा है जहाँ माता ने तप किया, और सामने हर्ष पर्वत पर भाई हर्ष भैरव का शिखर — दोनों धाम एक-दूसरे की ओर मुख किए हैं।',
        bodyEn: 'In the sanctum Jeen Mata sits as the eight-armed Mahishasuramardini Durga — weapons in her eight hands, slaying the buffalo demon. The temple stands at the foot of the hill, built of marble and stone, its pillars and walls bearing old inscriptions and carving, with a large assembly hall and a circumambulation path at the entrance. The sanctum’s most distinctive mark is its akhand jyot, the lamp said to have burned without a break since Aurangzeb’s time. On the hilltop is the Kajal Shikhar cave where the goddess performed her tapas, and across the valley on Harsh hill stands the shrine of her brother Harsh Bhairav — the two dhams face each other.',
      },
      {
        id: 'parampara',
        titleHi: 'कुलदेवी की धोक और झडूला',
        titleEn: 'Kuldevi Dhok and Jadula',
        bodyHi: 'जीण माता शेखावाटी और आसपास के अनेक राजपूत, जाट, ब्राह्मण और वैश्य कुलों की कुलदेवी हैं; विवाह के बाद नवदम्पती धोक देने आते हैं और शिशु के जन्म पर परिवार झडूला (मुंडन) — पहले केश माता के चरणों में उतारने — की परम्परा निभाता है। भक्त प्रायः नारियल और चूरमा-लापसी जैसा देशी भोग अर्पित करते हैं, और मनौती पूरी होने पर परिवार सामूहिक भोज व भजन-संध्या करते हैं। दर्शन प्रातः मंगला आरती से रात्रि शयन आरती तक चलते हैं; नवरात्रि की अष्टमी-नवमी को विशेष हवन और भीड़ रहती है। जीण माता के दर्शन के बाद हर्ष पर्वत पर भाई हर्ष भैरव के दर्शन से यात्रा पूर्ण मानी जाती है।',
        bodyEn: 'Jeen Mata is kuldevi to many Rajput, Jat, Brahmin and Vaishya clans of Shekhawati and beyond; newly married couples come to offer dhok, and at the birth of a child the family keeps the jadula (mundan) tradition, the child’s first cutting of the hair, at her feet. Devotees commonly offer coconut and desi sweets such as churma and lapsi as bhog, and when a vow is fulfilled families host a shared meal and a bhajan evening. Darshan runs from the Mangala aarti at dawn to the Shayan aarti at night; the Ashtami and Navami of Navratri bring special havans and the heaviest crowds. After Jeen Mata’s darshan, the yatra is held complete only with her brother Harsh Bhairav’s darshan on Harsh hill.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'वर्ष में दो बड़े मेले नवरात्रि पर लगते हैं — चैत्र शुक्ल प्रतिपदा से नवमी (मार्च–अप्रैल) और आश्विन शुक्ल प्रतिपदा से नवमी (सितम्बर–अक्टूबर) — जब लाखों श्रद्धालु धाम पहुँचते हैं और जयपुर, सीकर, झुंझुनूँ व हरियाणा से पदयात्री संघ पैदल आते हैं। अष्टमी की रात्रि जागरण और नवमी का हवन मेले का चरम हैं। इनके अतिरिक्त हर पूर्णिमा और शुक्ल पक्ष की अष्टमी को भीड़ रहती है, और शेखावाटी के परिवार मेले के दिनों में झडूला व धोक के लिए सामूहिक रूप से आते हैं।',
        bodyEn: 'Two great fairs fall at Navratri — Chaitra Shukla Pratipada to Navami (March–April) and Ashwin Shukla Pratipada to Navami (September–October) — when lakhs of devotees reach the dham and padyatri groups walk in from Jaipur, Sikar, Jhunjhunu and Haryana. The night vigil of Ashtami and the havan of Navami are the fair’s climax. Beyond these, every Purnima and every bright-fortnight Ashtami draws crowds, and Shekhawati families come together in the fair days for jadula and dhok.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'जीण माता सीकर ज़िले में रेवासा के पास अरावली की तलहटी में है — सीकर से लगभग 29 किमी, रींगस से लगभग 35 किमी और जयपुर से लगभग 108 किमी; जयपुर–सीकर मार्ग (राष्ट्रीय राजमार्ग 52) से गोरियाँ होकर पहुँचा जाता है। निकटतम रेलवे स्टेशन सीकर और रींगस हैं; निकटतम हवाई अड्डा जयपुर (लगभग 100 किमी) है। तीर्थयात्री प्रायः जीण माता को खाटू श्याम जी (लगभग 30 किमी) और सालासर बालाजी के साथ एक ही यात्रा में जोड़ते हैं। धाम के सामने हर्ष पर्वत पर दसवीं सदी का हर्षनाथ मंदिर और हर्ष भैरव का शिखर है, और पहाड़ी पर काजल शिखर की तप-गुफा दर्शनीय है।',
        bodyEn: 'Jeen Mata lies in Sikar district near Rewasa at the foot of the Aravallis — roughly 29 km from Sikar, 35 km from Ringas and 108 km from Jaipur, reached from the Jaipur–Sikar road (National Highway 52) via Goriyan. The nearest railheads are Sikar and Ringas; the nearest airport is Jaipur (about 100 km). Pilgrims usually pair Jeen Mata with Khatu Shyam Ji (about 30 km) and Salasar Balaji in a single yatra. Facing the dham on Harsh hill stand the tenth-century Harshnath temple and the shrine of Harsh Bhairav, and on the hill above is the tapas cave of Kajal Shikhar.',
      },
    ],
  },
  'khandoba-jejuri': {
    significanceHi: 'पुणे ज़िले के पुरंदर तालुका में कऱ्हा नदी के ऊपर पहाड़ी पर बसा जेजुरी का खंडोबा मंदिर महाराष्ट्र का सबसे बड़ा लोकदेव तीर्थ है — खंडोबा (मल्हारी मार्तण्ड, म्हाळसाकांत) शिव के मार्तण्ड भैरव अवतार माने जाते हैं और धनगर सहित अनेक कृषक, पशुपालक, व्यापारी और योद्धा समाजों तथा इंदौर के होळकर राजवंश के कुलदैवत हैं। यहाँ खंडोबा-पूजा का आरम्भ बारहवीं–तेरहवीं सदी में माना जाता है; कडेपठार की प्राचीन स्वयंभू पिंडी के बाद वर्तमान गडकोट मंदिर लगभग सन् 1608 (विक्रम संवत् 1665) में बना और मराठा सरदार राघो मंबाजी ने सन् 1637 (विक्रम संवत् 1694) में इसका सभामंडप पूरा किया। हल्दी के भंडारे से सुनहरी “सोन्याची जेजुरी” और “येळकोट येळकोट जय मल्हार” का जयघोष इस तीर्थ की पहचान हैं।',
    significanceEn: 'Set on a hill above the Karha river in Purandar taluka of Pune district, the Khandoba temple of Jejuri is the foremost lokdevta shrine of Maharashtra. Khandoba — Malhari Martand, Mhalsakant — is worshipped as Shiva’s Martanda Bhairava avatar and is the kuldaivat of the Dhangars and of many farming, herding, trading and warrior communities, as well as of the Holkar dynasty of Indore. Worship here is traced to the twelfth–thirteenth century; after the ancient self-manifest linga of Kadepathar, the present Gadkot temple rose around 1608 CE (Vikram Samvat 1665), and the Maratha chief Ragho Mambaji completed its assembly hall in 1637 CE (Vikram Samvat 1694). Turmeric bhandara that turns the hill gold — “Sonyachi Jejuri” — and the cry “Yelkot Yelkot Jai Malhar” are the marks of this tirtha.',
    originStoryHi: 'मल्हारी माहात्म्य की कथा में मणि और मल्ल नामक दैत्य-भाइयों के अत्याचार से पीड़ित सप्तर्षि शिव की शरण में गए; परम्परा के अनुसार शिव ने सूर्य का तेज धारण कर मार्तण्ड भैरव रूप लिया, पार्वती म्हाळसा बनकर साथ आईं, नंदी श्वेत अश्व बने और त्रिशूल खंडा (खड्ग) बना। कार्तिक अमावस्या से छह दिन चले युद्ध के अंत में मार्गशीर्ष शुक्ल षष्ठी को मल्ल का वध हुआ — इसीलिए देव “मल्हारी” कहलाए — और पश्चात्ताप करते मणि ने अपना श्वेत अश्व अर्पित कर हर खंडोबा-स्थान में रहने का वर पाया। लोक-मान्यता में यह युद्ध जेजुरी की इसी पहाड़ी पर हुआ, और भक्त तब से भंडारा (हल्दी) उड़ाकर “येळकोट” के जयघोष से उन्हें पूजते हैं।',
    originStoryEn: 'In the katha of the Malhari Mahatmya, the seven sages, tormented by the demon brothers Mani and Malla, sought refuge in Shiva; by tradition Shiva drew the Sun’s radiance into himself and took the form of Martanda Bhairava, Parvati came as Mhalsa, Nandi became a white horse and the trident became a khanda, a broadsword. After six days of battle from Kartik Amavasya, Malla fell on Margashirsha Shukla Shashthi — hence the name “Malhari”, slayer of Malla — and the repentant Mani offered his white horse and won the boon of a place in every Khandoba shrine. Local belief holds that this battle was fought on the very hill of Jejuri, and devotees have showered bhandar, turmeric, with the cry of “Yelkot” ever since.',
    sources: [
      source('Maharashtra Tourism - Jejuri', 'https://maharashtratourism.gov.in/temple/jejuri/'),
      source('Jejuri Khandoba Temple - Official Portal', 'https://www.khandoba.com/'),
      source('Utsav (Ministry of Tourism) - Jejuri Temple', 'https://utsav.gov.in/view-darshan/jejuri-temple-1'),
      source('Khandoba Temple, Jejuri - Reference', 'https://en.wikipedia.org/wiki/Khandoba_Temple,_Jejuri'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'जेजुरी में खंडोबा की कोई एक अभिलिखित प्रतिष्ठा-तिथि — संवत्, तिथि या प्रतिष्ठापक — उपलब्ध नहीं है; पर्यटन और सन्दर्भ विवरण यहाँ खंडोबा-पूजा का आरम्भ बारहवीं–तेरहवीं सदी में रखते हैं। परम्परा के अनुसार यही वह पहाड़ी है जहाँ मार्तण्ड भैरव ने मणि-मल्ल का संहार किया, और युद्ध के बाद देव म्हाळसा के साथ यहीं विराजे। ऊँची पहाड़ी पर कडेपठार का प्राचीन मंदिर है, जहाँ खंडोबा और म्हाळसा की स्वयंभू पिंडी पूजी जाती है — इसे ही मूल स्थान माना जाता है। नीचे की छोटी पहाड़ी पर किले जैसा वर्तमान गडकोट मंदिर लगभग सन् 1608 (विक्रम संवत् 1665) में बना, और मराठा सरदार राघो मंबाजी ने सन् 1637 (विक्रम संवत् 1694) में सभामंडप और अन्य भाग पूरे किए। अठारहवीं सदी में इंदौर के होळकर, जिनके कुलदैवत खंडोबा हैं और जिनके संस्थापक मल्हारराव का नाम ही मल्हारी से है, मुख्य संरक्षक बने — तुकोजी होळकर ने सन् 1742 (विक्रम संवत् 1799) में स्तम्भ जोड़े और लगभग सन् 1770 (विक्रम संवत् 1827) तक कोट, दीपमालाएँ और तालाब पूरे हुए; कई लोक-विवरण मंदिर के विस्तार को अहिल्याबाई होळकर से भी जोड़ते हैं। मराठा इतिहास में जेजुरी का विशेष स्थान है — परम्परा के अनुसार यहीं शिवाजी महाराज और उनके पिता शाहाजी की वर्षों के अन्तराल के बाद भेंट हुई। आज मंदिर की व्यवस्था स्थानीय देवस्थान देखता है और पूजा वंशानुगत पुजारी परिवारों के हाथ में है।',
        bodyEn: 'No single recorded consecration date — a samvat, a tithi or a consecrator — survives for Khandoba at Jejuri; tourism and reference sources place the beginning of his worship here in the twelfth to thirteenth century. By tradition this is the hill on which Martanda Bhairava destroyed Mani and Malla, and after the battle the god settled here with Mhalsa. On the higher hill stands the ancient Kadepathar temple, where a self-manifest linga of Khandoba and Mhalsa is worshipped and which is held to be the original seat. On the lower hill the fort-like present Gadkot temple was built around 1608 CE (Vikram Samvat 1665), and the Maratha chief Ragho Mambaji completed the assembly hall and other parts in 1637 CE (Vikram Samvat 1694). In the eighteenth century the Holkars of Indore, whose kuldaivat Khandoba is and whose founder Malhar Rao carries the god’s own name, became the chief patrons: Tukoji Holkar added pillars in 1742 CE (Vikram Samvat 1799), and by about 1770 CE (Vikram Samvat 1827) the ramparts, lamp-towers and tank were complete; many popular accounts also credit Ahilyabai Holkar with enlarging the temple. Jejuri holds a special place in Maratha history — by tradition it was here that Shivaji Maharaj met his father Shahaji after years apart. Today the temple is run by the local devasthan, and worship rests with hereditary priestly families.',
      },
      {
        id: 'svarup',
        titleHi: 'खंडोबा का स्वरूप',
        titleEn: 'The Form of Khandoba',
        bodyHi: 'गडकोट मंदिर एक छोटे किले की तरह परकोटे से घिरा है — उत्तर द्वार पर नगारखाना, ऊपर तक जाती कुछ सौ सीढ़ियाँ (गिनती विवरणों में लगभग 200 से 450 तक अलग-अलग मिलती है), 18 कमानें और लगभग 350 दीपमालाएँ, जो उत्सवों में जलती हैं। प्रांगण में लगभग 20 फुट व्यास का पीतल-मढ़ा विशाल कासव (कूर्म) है, जिस पर भक्त भंडारा उड़ाते और गोंधळ-नृत्य करते हैं। गर्भगृह में शिवलिंग (पिंडी) है और उसके साथ खंडोबा-म्हाळसा की तीन जोड़ी मूर्तियाँ; उत्सव-मूर्ति में खंडोबा घोड़े पर सवार योद्धा रूप में हैं — हाथ में खंडा (खड्ग), जिससे “खंडोबा” नाम जुड़ा है, साथ में उनका कुत्ता और मणि दैत्य से मिला श्वेत अश्व। लोकचित्रों में वे भंडारे से पीले, चतुर्भुज मार्तण्ड भैरव के रूप में दिखाए जाते हैं — खंडा, डमरू, त्रिशूल और पात्र लिए। चढ़ाई के मार्ग पर खंडोबा के प्रधान हेगडी प्रधान का मंदिर और उतराई के मार्ग पर उनकी दूसरी पत्नी बाणाई का मंदिर है। मंदिर में लगभग 42 किलो का प्राचीन खंडा रखा है, जिस पर अंकित लेख के अनुसार यह मराठा सरदारों (पानसे) की भेंट है। ऊँची पहाड़ी पर कडेपठार का पुराना मंदिर लगभग 750 सीढ़ियों की चढ़ाई पर है, जहाँ खंडोबा-म्हाळसा की स्वयंभू पिंडी है।',
        bodyEn: 'The Gadkot temple is walled like a small fort — a nagarkhana, the drum gallery, over the north gate, a few hundred steps climbing to the top (sources count anywhere from about 200 to 450), eighteen arches and some 350 deepmalas, lamp-towers that are lit on festival nights. In the courtyard lies a huge brass-clad tortoise about twenty feet across, on which devotees shower bhandara and perform the gondhal dance. The sanctum holds a Shiva linga together with three pairs of images of Khandoba and Mhalsa; the festival image shows Khandoba as a warrior on horseback, sword in hand — the khanda, the broadsword from which his name is taken — with his dog beside him and the white horse won from the demon Mani. Folk paintings show him yellow with bhandara as the four-armed Martanda Bhairava, holding sword, damaru, trident and bowl. On the path up stands the shrine of Hegadi Pradhan, Khandoba’s minister, and on the path down that of Banai, his second wife. The temple keeps an old khanda weighing about 42 kg, whose engraving records it as the gift of Maratha sardars of the Panse family. On the higher hill, the older Kadepathar temple is reached by a climb of roughly 750 steps to the self-manifest linga of Khandoba and Mhalsa.',
      },
      {
        id: 'parampara',
        titleHi: 'भंडारा और येळकोट',
        titleEn: 'Bhandara and Yelkot',
        bodyHi: 'जेजुरी की पहचान भंडारा है — हल्दी का पीला चूर्ण, जिसे भक्त मुट्ठियों में भरकर “येळकोट येळकोट जय मल्हार” और “सदानंदाचा येळकोट” के जयघोष के साथ आकाश में उड़ाते हैं; सीढ़ियाँ, कमानें और भक्त सब सुनहरे हो जाते हैं, इसीलिए इसे “सोन्याची जेजुरी” कहते हैं। खंडोबा अनेक महाराष्ट्रीय परिवारों के कुलदैवत हैं, इसलिए विवाह के बाद नवदम्पति यहाँ दर्शन को आते हैं और रात-भर जागरण-गोंधळ कराते हैं, जिसमें वाघ्या (पुरुष) और मुरळी (स्त्री) — खंडोबा को समर्पित पारम्परिक गायक — देवता की कथाएँ और भक्ति-गीत गाते हैं। “तळी भरण” में थाली में भंडारा और खोबरा (सूखा नारियल) रखकर उसे तीन बार उठाकर जयघोष किया जाता है। परम्परा में खंडोबा को पुरण पोळी, भरीत-रोडगा (बैंगन का भर्ता और बाजरे की मोटी रोटी) और थोंबरा (बहुधान्य आटे का नैवेद्य) प्रिय हैं; मंदिर में केवल शाकाहारी नैवेद्य चढ़ता है। रविवार खंडोबा का वार माना जाता है और उस दिन भीड़ अधिक रहती है। एक अनोखी मनौती में पति पत्नी को कंधे पर उठाकर सीढ़ियाँ चढ़ता है। दर्शन प्रातः लगभग 5 बजे से रात्रि शेज-आरती (लगभग 9 बजे) तक चलते हैं।',
        bodyEn: 'Jejuri is known by its bhandara — turmeric powder that devotees throw by the fistful into the air with the cries “Yelkot Yelkot Jai Malhar” and “Sadanandacha Yelkot”, until steps, arches and pilgrims alike turn gold, which is why the town is called “Sonyachi Jejuri”, golden Jejuri. Because Khandoba is the kuldaivat of so many Maharashtrian families, newly married couples come for darshan and hold an all-night jagran-gondhal, in which the Waghya (men) and Murali (women), the traditional singers dedicated to Khandoba, sing the god’s stories and devotional songs. In the “tali bharan” rite a plate of bhandara and khobra, dried coconut, is raised three times to the cry of Yelkot. By tradition Khandoba loves puran poli, bharit-rodga (roasted aubergine mash with thick millet bread) and thombara, an offering of mixed-grain flour; only vegetarian naivedya is offered inside the temple. Sunday is held to be Khandoba’s day and draws the largest crowds. In one striking vow, a husband carries his wife on his shoulders up the steps. Darshan runs from about 5 in the morning to the Shej aarti at about 9 at night.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'जेजुरी का सबसे बड़ा उत्सव चंपाषष्ठी है — मार्गशीर्ष शुक्ल षष्ठी (नवम्बर–दिसम्बर), जो परम्परा में मणि-मल्ल-वध और खंडोबा की विजय का दिन है; मार्गशीर्ष शुक्ल प्रतिपदा से षष्ठी तक छह दिन का षड्रात्र (खंडोबा नवरात्र) चलता है, जिसमें घटस्थापना, तेल-अभिषेक और भंडारा-वृष्टि होती है और अंतिम दिन थोंबरा-रोडगा का नैवेद्य लगता है। सोमवती अमावस्या (सोमवार को पड़ने वाली अमावस्या, वर्ष में दो-तीन बार) को खंडोबा की पालकी लाखों भक्तों के साथ कऱ्हा नदी तक जाती है, जहाँ देव-स्नान होता है — इस भंडारा-यात्रा में लगभग पाँच लाख श्रद्धालु जुटते हैं। आश्विन में दशहरा “मर्दानी दसरा” के रूप में मनाया जाता है — पालकी, सीमोल्लंघन और अगले दिन लगभग 42 किलो का खंडा दाँतों या हाथों से सबसे अधिक समय तक उठाने की स्पर्धा, जो पेशवा-काल से चली आ रही मानी जाती है। पौष पूर्णिमा पर परम्परा में खंडोबा-म्हाळसा का देवविवाह होता है, तथा माघ पूर्णिमा और चैत्र पूर्णिमा की यात्राएँ भी बड़ी भीड़ जुटाती हैं।',
        bodyEn: 'Jejuri’s greatest festival is Champa Shashthi — Margashirsha Shukla Shashthi (November–December), by tradition the day of Khandoba’s victory over Mani and Malla; from Margashirsha Shukla Pratipada to Shashthi runs the six-day Shadratra, the Khandoba Navratra, with ghatasthapana, an oil abhishek and showers of bhandara, and on the last day an offering of thombara and rodga. On Somvati Amavasya — a new moon falling on a Monday, two or three times a year — Khandoba’s palanquin goes down to the Karha river with lakhs of devotees for the god’s ceremonial bath; this bhandara yatra gathers about five lakh pilgrims. In Ashwin, Dussehra is kept as “Mardani Dasara” — palanquin, the seemollanghan crossing of the boundary, and on the following day the contest of holding the 42-kg khanda aloft by teeth or hand for the longest time, held to date from the Peshwa period. On Paush Purnima tradition celebrates the divine wedding of Khandoba and Mhalsa, and the yatras of Magh Purnima and Chaitra Purnima also draw great crowds.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'जेजुरी पुणे ज़िले के पुरंदर तालुका में, पुणे से दक्षिण-पूर्व लगभग 48–50 किमी, हडपसर–सासवड़–जेजुरी मार्ग पर है; मंदिर की पहाड़ी कऱ्हा नदी के किनारे बसे नगर के ऊपर उठती है। पुणे–मिरज रेलमार्ग पर जेजुरी का अपना स्टेशन है, मंदिर से लगभग 2–4 किमी; पुणे से राज्य परिवहन की बसें नियमित चलती हैं और निकटतम हवाई अड्डा पुणे है। यात्री प्रायः जेजुरी को सासवड़, नारायणपुर के एकमुखी दत्त मंदिर, पुरंदर किले (लगभग 25 किमी) और मोरगाँव के अष्टविनायक मयूरेश्वर के साथ जोड़ते हैं। नगर के ऊपर की ऊँची पहाड़ी पर कडेपठार का प्राचीन मंदिर है, जहाँ लगभग 750 सीढ़ियों की चढ़ाई है, और गडकोट के मार्ग में बाणाई और हेगडी प्रधान के मंदिर पड़ते हैं। खंडोबा के अन्य प्रमुख स्थान — पाली (सातारा), नळदुर्ग, माळेगाँव (नांदेड़) और कर्नाटक का मैलार — जेजुरी को इस विस्तृत क्षेत्र का मुख्य पीठ बनाते हैं।',
        bodyEn: 'Jejuri lies in Purandar taluka of Pune district, roughly 48–50 km south-east of Pune on the Hadapsar–Saswad–Jejuri road; the temple hill rises above a town on the bank of the Karha river. Jejuri has its own station on the Pune–Miraj railway line, about 2–4 km from the temple; state transport buses run regularly from Pune, and the nearest airport is Pune. Pilgrims usually pair Jejuri with Saswad, the one-faced Datta temple at Narayanpur, Purandar fort (about 25 km) and the Ashtavinayak Mayureshwar at Morgaon. On the higher hill above the town stands the ancient Kadepathar temple, reached by roughly 750 steps, while the shrines of Banai and Hegadi Pradhan lie on the paths of the Gadkot itself. Khandoba’s other great seats — Pali in Satara, Naldurg, Malegaon in Nanded and Mailar in Karnataka — make Jejuri the head of a wide sacred region.',
      },
    ],
  },
  'gogaji-gogamedi': {
    significanceHi: 'हनुमानगढ़ ज़िले के गोगामेड़ी में स्थित गोगाजी का धाम राजस्थान के सर्प-रक्षक वीर लोकदेव जाहरवीर गोगाजी की समाधि-स्थली है, जहाँ हिन्दू और मुसलमान दोनों समान श्रद्धा से आते हैं। गोगाजी लगभग दसवीं–ग्यारहवीं सदी के ददरेवा (चूरू) के चौहान वीर माने जाते हैं और भाद्रपद कृष्ण नवमी (गोगा नवमी) उनकी जन्म-तिथि के रूप में पूजी जाती है; परम्परा के अनुसार समाधि-स्थल पर पहली इमारत फ़िरोज़शाह तुग़लक़ ने बनवाई, और सन् 1911 (विक्रम संवत् 1968) में बीकानेर के महाराजा गंगा सिंह ने इसका जीर्णोद्धार कराया। गोगा नवमी का मेला यहाँ लाखों श्रद्धालु जुटाता है।',
    significanceEn: 'At Gogamedi in Hanumangarh district, Gogaji’s dham is the samadhi of Jahar Veer Gogaji, Rajasthan’s serpent-protecting warrior lokdevta, visited with equal devotion by Hindus and Muslims. Gogaji is regarded as a Chauhan hero of Dadrewa (Churu) of roughly the tenth to eleventh century, and Bhadrapada Krishna Navami (Goga Navami) is kept as his birth tithi; by tradition the first building over his samadhi was raised by Firoz Shah Tughlaq, and in 1911 CE (Vikram Samvat 1968) Maharaja Ganga Singh of Bikaner restored it. The Goga Navami fair draws lakhs of devotees here.',
    originStoryHi: 'कथा में ददरेवा के चौहान राजा जेवर सिंह और रानी बाछल को गुरु गोरखनाथ के आशीर्वाद से गोगाजी पुत्र रूप में मिले; गोरखनाथ के दिए गुग्गल से उनका नाम गूगा या गोगा पड़ा। वे नागों के स्वामी और गौरक्षक वीर बने, अपने भाइयों से भूमि-विवाद में युद्ध लड़ा, और अंत में गोगामेड़ी की भूमि में घोड़े सहित जीवित समाधि ले ली — तभी से यह स्थान उनका धाम है।',
    originStoryEn: 'In the legend, Raja Jewar Singh Chauhan of Dadrewa and Rani Bachhal received Gogaji as a son through the blessing of Guru Gorakhnath; the guggal the guru gave them named him Gugga or Goga. He grew into a lord of serpents and a protector of cattle, fought his cousins in a dispute over land, and at last took living samadhi, horse and all, in the earth at Gogamedi — which has been his dham ever since.',
    sources: [
      source('Rajasthan Devasthan - Gogaji', 'https://devasthan.rajasthan.gov.in/images/hanumangarh/gogaji.htm'),
      source('Rajasthan Tourism - Gogaji Fair', 'https://www.tourism.rajasthan.gov.in/gogaji-fair.html'),
      source('Gogaji Temple - Reference', 'https://en.wikipedia.org/wiki/Gogaji_Temple'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'गोगाजी चूरू ज़िले के ददरेवा के चौहान राजा जेवर सिंह और रानी बाछल के पुत्र थे; लोक-परम्परा भाद्रपद कृष्ण नवमी को उनकी जन्म-तिथि मानती है; इतिहासकार उन्हें लगभग दसवीं–ग्यारहवीं सदी का, महमूद ग़ज़नवी के समकालीन जांगलदेश का चौहान शासक मानते हैं, यद्यपि वर्ष के विषय में विवरण भिन्न हैं। निःसन्तान रानी बाछल ने गुरु गोरखनाथ की सेवा की और उनके दिए गुग्गल से गोगा का जन्म हुआ — इसी से वे नाथ-परम्परा से जुड़े। गोगाजी ने अपनी मौसी के पुत्रों अर्जन-सर्जन से भूमि-विवाद में युद्ध किया और विदेशी आक्रमण के विरुद्ध लड़े; कथा कहती है कि अंत में उन्होंने नीले घोड़े सहित गोगामेड़ी की भूमि में जीवित समाधि ली। लोक-मान्यता के अनुसार उनकी समाधि पर पहली इमारत — गुम्बद वाली मेड़ी — दिल्ली के सुल्तान फ़िरोज़शाह तुग़लक़ ने बनवाई, यद्यपि इसका काल इतिहास में निश्चित नहीं है; इसीलिए यह धाम मंदिर और मज़ार दोनों का रूप लिए है। सन् 1911 (विक्रम संवत् 1968) में बीकानेर के महाराजा गंगा सिंह ने संगमरमर से इसका जीर्णोद्धार कराया। आज इसकी व्यवस्था राजस्थान सरकार का देवस्थान विभाग देखता है, और गर्भगृह में हिन्दू पुजारी और मुसलमान सेवक दोनों सेवा करते हैं — यही गोगामेड़ी की साझी विरासत है।',
        bodyEn: 'Gogaji was the son of Raja Jewar Singh Chauhan of Dadrewa in Churu district and his queen Bachhal; folk tradition keeps Bhadrapada Krishna Navami as his birth tithi, and historians regard him as a Chauhan chief of Jangaldesh of roughly the tenth to eleventh century, a contemporary of Mahmud of Ghazni, though accounts of the year differ. The childless Rani Bachhal served Guru Gorakhnath, and from the guggal he gave her Goga was born — which is how he came to belong to the Nath lineage. Gogaji fought his cousins Arjan and Sarjan in a dispute over land and stood against foreign invasion; the katha tells that at the end he took living samadhi, with his blue horse, in the earth at Gogamedi. By local tradition the first building over his samadhi — the domed medi — was raised by Firoz Shah Tughlaq, Sultan of Delhi, though its date is not settled by history; this is why the dham carries the form of both temple and mazar. In 1911 CE (Vikram Samvat 1968) Maharaja Ganga Singh of Bikaner restored it in marble. It is now administered by the Devasthan Department of the Government of Rajasthan, and in the sanctum both Hindu pujaris and Muslim attendants serve — the shared heritage of Gogamedi.',
      },
      {
        id: 'svarup',
        titleHi: 'गोगाजी का स्वरूप',
        titleEn: 'The Form of Gogaji',
        bodyHi: 'गोगामेड़ी में मूर्ति नहीं, गोगाजी की समाधि पूजी जाती है — गुम्बद वाली मेड़ी के भीतर संगमरमर से जड़ी समाधि, जिस पर चादर और फूल चढ़ाए जाते हैं और अखंड दीप जलता है। मेड़ी की बनावट में मंदिर और मज़ार दोनों का स्थापत्य मिला है: बाहर गुम्बद और मीनार-सी बुर्जियाँ, भीतर हिन्दू रीति की पूजा। लोकचित्रों में गोगाजी नीले घोड़े पर सवार, हाथ में भाला और सर्प-फन की छाया में दिखाए जाते हैं — यही “जाहरवीर” रूप गाँव-गाँव के गोगा-थानों में पूजा जाता है। धाम के पास गोरख टीला है, जहाँ गुरु गोरखनाथ का धूणा और तप-स्थल माना जाता है।',
        bodyEn: 'At Gogamedi no image is worshipped but Gogaji’s samadhi itself — inlaid in marble within the domed medi, draped with cloth and flowers, with a lamp kept burning. The medi’s architecture blends temple and mazar: a dome and minaret-like turrets without, Hindu worship within. In folk paintings Gogaji rides a blue horse, spear in hand, under the hood of a serpent — this “Jahar Veer” form is worshipped at Goga shrines in village after village. Near the dham is Gorakh Tila, held to be Guru Gorakhnath’s dhuni and place of tapas.',
      },
      {
        id: 'parampara',
        titleHi: 'छड़ी और सर्प-रक्षा',
        titleEn: 'The Chhadi and Serpent Protection',
        bodyHi: 'गोगाजी को सर्पदंश से रक्षा करने वाला देव माना जाता है; भक्त उनकी समाधि पर धागा बाँधकर मनौती माँगते हैं और सर्प-भय से मुक्ति के लिए धोक देते हैं। गोगा नवमी को घरों में गोगाजी की पूजा होती है और नागों को दूध, खीर, सेवइयाँ व चूरमा अर्पित किए जाते हैं — यही भोग गोगामेड़ी में भी चढ़ता है। सबसे विशिष्ट परम्परा छड़ी है: मोरपंखों से सजी गोगाजी की छड़ी लेकर भक्त-मंडलियाँ ढोल-डेरू के साथ पैदल धाम पहुँचती हैं, और गोगाजी के भोपे उनकी गाथा गाते हैं। हिन्दू यहाँ पूजा करते हैं, मुसलमान पीर मानकर चादर चढ़ाते हैं। दर्शन प्रातः से रात्रि तक चलते हैं, और भाद्रपद मास में सबसे अधिक भीड़ रहती है।',
        bodyEn: 'Gogaji is held to protect against snakebite; devotees tie a thread at his samadhi to ask a boon and bow there for freedom from fear of serpents. On Goga Navami he is worshipped at home and milk, kheer, sevaiyan and churma are offered to the nagas — the same bhog is offered at Gogamedi. The most distinctive tradition is the chhadi: devotee bands walk to the dham carrying Gogaji’s peacock-feathered staff to the beat of dhol and deru, while his bhopas sing his epic. Hindus worship him here, and Muslims revere him as a pir and offer a chadar. Darshan runs from morning to night, with the heaviest crowds in the month of Bhadrapada.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'गोगामेड़ी का मुख्य मेला भाद्रपद कृष्ण नवमी (गोगा नवमी, अगस्त–सितम्बर) को लगता है और कृष्ण एकादशी तक चलता है; यह राजस्थान देवस्थान विभाग का आधिकारिक मेला है, जो पूरे श्रावण-भाद्रपद में लगभग एक मास चलता है और जिसमें राजस्थान, पंजाब, हरियाणा, उत्तर प्रदेश और दिल्ली से लाखों श्रद्धालु आते हैं। गोगा नवमी गोगाजी की जन्म-तिथि है, और उसी दिन गाँव-गाँव में गोगा-थानों पर पूजा होती है। मेले में छड़ी-यात्राएँ, भोपों के गायन और रात्रि-जागरण चलते हैं, और ऊँट-घोड़ों का पशु-बाज़ार भी लगता है।',
        bodyEn: 'Gogamedi’s main fair falls on Bhadrapada Krishna Navami (Goga Navami, August–September) and runs to Krishna Ekadashi; it is an official fair of the Rajasthan Devasthan Department, stretching over roughly a month through Shravan and Bhadrapada and drawing lakhs of devotees from Rajasthan, Punjab, Haryana, Uttar Pradesh and Delhi. Goga Navami is Gogaji’s birth tithi, and on that day Goga shrines in every village hold worship. The fair fills with chhadi processions, the bhopas’ singing and night vigils, and a livestock market of camels and horses gathers alongside.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'गोगामेड़ी हनुमानगढ़ ज़िले की नोहर तहसील में है — नोहर से लगभग 25–30 किमी, हनुमानगढ़ से लगभग 105 किमी और बीकानेर से लगभग 200 किमी; सादुलपुर–हनुमानगढ़ मार्ग से पहुँचा जाता है। गोगामेड़ी का अपना रेलवे स्टेशन धाम से लगभग 3 किमी दूर है और नोहर व हनुमानगढ़ जंक्शन बड़े स्टेशन हैं; निकटतम हवाई अड्डे बीकानेर और चंडीगढ़ हैं। श्रद्धालु प्रायः गोगामेड़ी को गोगाजी की जन्मभूमि ददरेवा (चूरू, लगभग 80 किमी) के साथ जोड़ते हैं, जहाँ उनका जन्मस्थान-मंदिर है; धाम के पास गोरख टीला गुरु गोरखनाथ का तप-स्थल है।',
        bodyEn: 'Gogamedi lies in Nohar tehsil of Hanumangarh district — roughly 25–30 km from Nohar, 105 km from Hanumangarh and 200 km from Bikaner, reached from the Sadulpur–Hanumangarh road. Gogamedi has its own railway station about 3 km from the dham, with Nohar and Hanumangarh Junction the larger stations; the nearest airports are Bikaner and Chandigarh. Pilgrims usually pair Gogamedi with Gogaji’s birthplace Dadrewa (Churu, about 80 km), which has his janmasthan temple; near the dham, Gorakh Tila is Guru Gorakhnath’s place of tapas.',
      },
    ],
  },
  sabarimala: {
    significanceHi: 'पथनमथिट्टा की पहाड़ियों पर स्थित सबरीमला भगवान अय्यप्पन का विश्वप्रसिद्ध तीर्थ है, जहाँ हर वर्ष करोड़ों श्रद्धालु कठोर व्रत के साथ दर्शन को आते हैं।',
    significanceEn: 'High in the hills of Pathanamthitta, Sabarimala is the world-renowned shrine of Lord Ayyappan, drawing millions of devotees each year after a strict vratam.',
    originStoryHi: 'अय्यप्पन हरि-हर-पुत्र अर्थात शिव और मोहिनी (विष्णु) के पुत्र रूप में पूजे जाते हैं; मण्डल–मकरविलक्कु काल में ही मुख्य दर्शन होता है।',
    originStoryEn: 'Ayyappan is worshipped as Hariharaputra, the son of Shiva and Mohini (Vishnu); the main darshan falls in the Mandala–Makaravilakku season.',
    sources: [source('Sabarimala Temple - Reference', 'https://en.wikipedia.org/wiki/Sabarimala_Temple')],
  },
  'mahasu-devta-hanol': {
    significanceHi: 'टौंस नदी तट पर जौनसार क्षेत्र के हणोल में स्थित महासू देवता मंदिर शिव को समर्पित है, जिन्हें स्थानीय रूप से “महासू” कहा जाता है।',
    significanceEn: 'On the banks of the Tons in the Jaunsar region at Hanol, the Mahasu Devta Temple is dedicated to Shiva, known locally as “Mahasu.”',
    originStoryHi: 'मंदिर का मूल गर्भगृह 9वीं–10वीं शताब्दी का माना जाता है और काठ-कुनी शैली में बना है; महासू देवता क्षेत्र के न्याय-देवता रूप में पूजे जाते हैं।',
    originStoryEn: 'The original sanctum is dated to the 9th–10th century and built in the Kath-Kuni style; Mahasu Devta is revered as the region’s presiding deity of justice.',
    sources: [source('Mahasu Devta Temple - Reference', 'https://en.wikipedia.org/wiki/Mahasu_Devta_Temple')],
  },
  'tejaji-kharnal': {
    significanceHi: 'नागौर ज़िले के खरनाल में स्थित वीर तेजाजी मंदिर लोकदेव तेजाजी की जन्मभूमि का धाम है, जहाँ उन्हें सत्यवचनी वीर, गौरक्षक और सर्पदंश से रक्षा करने वाले शिव-अवतार के रूप में पूजा जाता है। तेजाजी का जन्म माघ शुक्ल चतुर्दशी, गुरुवार, विक्रम संवत् 1130 (29 जनवरी 1074) को यहीं हुआ और भाद्रपद शुक्ल दशमी, विक्रम संवत् 1160 (28 अगस्त 1103) को सुरसुरा में उनका बलिदान हुआ; तेजा दशमी को खरनाल में लाखों श्रद्धालु जुटते हैं।',
    significanceEn: 'At Kharnal in Nagaur district, the Veer Tejaji Temple is the dham of the lokdevta’s birthplace, where Tejaji is worshipped as a hero of his word, a protector of cattle and an incarnation of Shiva who guards against snakebite. Tejaji was born here on Magh Shukla Chaturdashi, a Thursday, in Vikram Samvat 1130 (29 January 1074), and gave his life at Sursura on Bhadrapada Shukla Dashami, Vikram Samvat 1160 (28 August 1103); on Teja Dashami lakhs of devotees gather at Kharnal.',
    originStoryHi: 'कथा में तेजाजी अपनी पत्नी पेमल को लाने पनेर जा रहे थे कि मार्ग में आग में घिरे एक सर्प को बचाया; क्रुद्ध सर्प ने डसने की ठानी तो तेजाजी ने वचन दिया कि काम पूरा कर लौटेंगे। लाछा गूजरी की चुराई गई गायें छुड़ाने में वे घायल हो गए, पर वचन निभाने सर्प के पास लौटे; शरीर पर घाव देख सर्प ने जीभ पर डसा, और सत्यवचन की यह गाथा उन्हें लोकदेव बना गई।',
    originStoryEn: 'In the legend, Tejaji was riding to Paner to bring home his wife Pemal when he saved a serpent trapped in a fire; the angry serpent resolved to bite him, and Tejaji gave his word to return once his errand was done. Rescuing the stolen cows of Lachha Gujari he was badly wounded, yet he came back to the serpent to keep his promise; finding no unwounded skin, the serpent bit his tongue, and this tale of a word kept made him a lokdevta.',
    sources: [
      source('Rajasthan Tourism - Veer Tejaji Temple, Kharnal', 'https://www.tourism.rajasthan.gov.in/veer-tejaji-temple.html'),
      source('Rajasthan Heritage Authority - Veer Tejaji Panorama, Kharnal', 'https://jkk.artandculture.rajasthan.gov.in/content/ArtandCulture/en/rajasthan-heritage-protection-promotion-authority/heritage-projects/completed-projects/tejaji-panorama.html'),
      source('Veer Teja - Reference', 'https://en.wikipedia.org/wiki/Veer_Teja'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'तेजाजी का जन्म माघ शुक्ल चतुर्दशी, गुरुवार, विक्रम संवत् 1130 (29 जनवरी 1074) को खरनाल गाँव में नागवंशी धौल्या गोत्र के जाट परिवार में हुआ; पिता ताहड़ देव खरनाल के मुखिया थे और माता का नाम परम्परा में रामकुँवरी मिलता है। बाल्यावस्था में ही पनेर के रायमल जी की पुत्री पेमल से उनका विवाह हुआ। लोकगाथा के अनुसार युवावस्था में पेमल को लाने पनेर जाते समय उन्होंने आग में घिरे सर्प को बचाया और उसे वचन दिया; पनेर में मीणा लुटेरों द्वारा हाँकी गई लाछा गूजरी की गायें छुड़ाने में घायल होकर भी वे सर्प के पास लौटे। भाद्रपद शुक्ल दशमी, विक्रम संवत् 1160 (28 अगस्त 1103) को अजमेर ज़िले के सुरसुरा में उनका बलिदान हुआ, और पेमल सती हुईं। जन्मभूमि खरनाल में उनके स्मरण का पहला “थान” कब बना, इसका अभिलेख नहीं मिलता; गाँव के बाहर लगभग 1.5 किमी पर पुराना छोटा मंदिर है और गाँव में उत्तरमुखी बड़ा मंदिर, जिसे तेजाजी के वंशज और खरनाल के ग्रामवासी स्थानीय मंदिर समिति के माध्यम से संभालते हैं। राजस्थान सरकार ने यहाँ वीर तेजाजी पैनोरमा बनवाया है।',
        bodyEn: 'Tejaji was born on Magh Shukla Chaturdashi, a Thursday, in Vikram Samvat 1130 (29 January 1074) at Kharnal village, in a Jat family of the Nagavanshi Dhaulya gotra; his father Tahar Dev was headman of Kharnal and tradition names his mother Ramkunwari. In childhood he was married to Pemal, daughter of Raimal Ji of Paner. The folk epic tells that as a young man, riding to Paner to bring Pemal home, he saved a serpent trapped in a fire and gave it his word; at Paner he was wounded rescuing the cows of Lachha Gujari driven off by Meena raiders, yet returned to the serpent. On Bhadrapada Shukla Dashami, Vikram Samvat 1160 (28 August 1103), he gave his life at Sursura in Ajmer district, and Pemal became sati. No record survives of when the first “thaan” of his memory was raised at his birthplace; an old small temple stands about 1.5 km outside the village, and in the village the large north-facing temple, kept by Tejaji’s descendants and the villagers of Kharnal through the local temple committee. The Government of Rajasthan has built the Veer Tejaji Panorama here.',
      },
      {
        id: 'svarup',
        titleHi: 'तेजाजी का स्वरूप',
        titleEn: 'The Form of Tejaji',
        bodyHi: 'खरनाल के बड़े मंदिर में तेजाजी की पीतल की प्रतिमा है — सिर पर मुकुट और कलगी, हाथ में भाला, अश्वारूढ़ वीर का रूप; लोकचित्रों में उनकी लीलण घोड़ी और जीभ डसता सर्प साथ दिखाए जाते हैं। मंदिर उत्तरमुखी है और गर्भगृह के सामने विशाल प्रांगण है, जहाँ मेले के समय रात-भर गाथा-गायन होता है। गाँव के बाहर का पुराना थान सादा और खुला है, जैसा राजस्थान के लोकदेवताओं के प्राचीन स्थानों में मिलता है। पास ही राजस्थान सरकार का वीर तेजाजी पैनोरमा है, जिसमें उनके जीवन के प्रसंग मूर्तियों और चित्रों में अंकित हैं।',
        bodyEn: 'The great temple at Kharnal holds a brass image of Tejaji — crowned with a mukut and kalgi, spear in hand, in the form of a mounted hero; folk paintings show him with his mare Lilan and the serpent biting his tongue. The temple faces north, with a broad courtyard before the sanctum where the epic is sung through the night at fair time. The old thaan outside the village is plain and open, as the ancient seats of Rajasthan’s folk deities usually are. Close by stands the Government of Rajasthan’s Veer Tejaji Panorama, where the episodes of his life are set out in sculpture and painting.',
      },
      {
        id: 'parampara',
        titleHi: 'तांती और गौ-रक्षा',
        titleEn: 'The Tanti and Cattle Protection',
        bodyHi: 'तेजाजी को सर्पदंश के देवता माना जाता है — विश्वास है कि सर्पदंश पर तेजाजी के नाम की तांती (धागा) बाँधने और उनके थान पर धोक देने से विष उतर जाता है, और ठीक होने पर भक्त थान पर आकर तांती खोलते हैं। किसान बुआई से पहले तेजाजी का स्मरण करते हैं और गौ-रक्षक के रूप में उन्हें दूध, खीर-चूरमा और लापसी का भोग लगाते हैं; उनकी गाथा “तेजा टेर” भोपे रात्रि-जागरण में गाते हैं। दर्शन प्रातः मंगला आरती से संध्या आरती तक चलते हैं, और भाद्रपद शुक्ल पक्ष में भीड़ चरम पर रहती है। नवविवाहित जोड़े और नए जन्मे बच्चों को धोक दिलाने लाने की परम्परा भी है।',
        bodyEn: 'Tejaji is revered as the deity of snakebite — it is believed that tying a tanti (thread) in his name on a bitten limb and bowing at his thaan draws out the venom, and on recovery the devotee returns to the thaan to untie it. Farmers remember Tejaji before sowing and, as protector of cattle, offer him milk, kheer-churma and lapsi; his epic, the “Teja Ter”, is sung by bhopas at night vigils. Darshan runs from the Mangala aarti to the evening aarti, with crowds at their peak in the bright fortnight of Bhadrapada. Newly married couples and newborn children are also brought to bow before him.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'खरनाल का मुख्य मेला तेजा दशमी — भाद्रपद शुक्ल दशमी (अगस्त–सितम्बर), तेजाजी के बलिदान की तिथि — को लगता है, जब नागौर, जोधपुर और मारवाड़-भर से लाखों श्रद्धालु और पदयात्री संघ जन्मभूमि पहुँचते हैं; इसी दिन राजस्थान व मध्य प्रदेश के हर तेजाजी-थान पर मेला होता है। माघ शुक्ल चतुर्दशी को तेजाजी जयंती मनाई जाती है। तेजा दशमी पर नागौर ज़िले के परबतसर का प्रसिद्ध पशु-मेला और सुरसुरा (अजमेर) की बलिदान-स्थली का मेला भी लगता है, और भोपे रात-भर तेजाजी की गाथा गाते हैं।',
        bodyEn: 'Kharnal’s main fair is Teja Dashami — Bhadrapada Shukla Dashami (August–September), the tithi of Tejaji’s sacrifice — when lakhs of devotees and padyatri groups from Nagaur, Jodhpur and all of Marwar reach his birthplace; on the same day every Tejaji shrine in Rajasthan and Madhya Pradesh holds its fair. Tejaji Jayanti is kept on Magh Shukla Chaturdashi. Teja Dashami also brings the famous cattle fair at Parbatsar in Nagaur district and the fair at Sursura (Ajmer), the place of his sacrifice, while the bhopas sing his epic through the night.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'खरनाल नागौर ज़िले में नागौर–जोधपुर मार्ग पर है — नागौर से लगभग 15–20 किमी, जोधपुर से लगभग 120 किमी और अजमेर से लगभग 170 किमी। निकटतम रेलवे स्टेशन नागौर है और आगे जोधपुर जंक्शन; निकटतम हवाई अड्डा जोधपुर है। श्रद्धालु प्रायः खरनाल को तेजाजी की बलिदान-स्थली सुरसुरा (अजमेर) और ससुराल पनेर के साथ जोड़ते हैं, और तेजा दशमी पर परबतसर का पशु-मेला भी देखते हैं। खरनाल में ही वीर तेजाजी पैनोरमा और गाँव के बाहर का पुराना थान दर्शनीय हैं, और नागौर का किला यात्रा में जुड़ता है।',
        bodyEn: 'Kharnal lies in Nagaur district on the Nagaur–Jodhpur road — roughly 15–20 km from Nagaur, 120 km from Jodhpur and 170 km from Ajmer. The nearest railhead is Nagaur, with Jodhpur Junction beyond; the nearest airport is Jodhpur. Pilgrims usually pair Kharnal with Sursura in Ajmer, the place of Tejaji’s sacrifice, and with Paner, his in-laws’ village, and on Teja Dashami take in the Parbatsar cattle fair. In Kharnal itself the Veer Tejaji Panorama and the old thaan outside the village are visited, and Nagaur fort is added to the yatra.',
      },
    ],
  },
  ramdevra: {
    significanceHi: 'जैसलमेर ज़िले में पोकरण के पास रामदेवरा (रुणिचा) बाबा रामदेव पीर की समाधि-स्थली है — राजस्थान का वह लोकदेव धाम जहाँ हिन्दू उन्हें कृष्ण का अवतार और मुसलमान “रामसा पीर” मानकर आते हैं। बाबा का जन्म भाद्रपद शुक्ल द्वितीया, विक्रम संवत् 1409 (सन् 1352) को हुआ और उन्होंने भाद्रपद शुक्ल एकादशी को यहीं जीवित समाधि ली — प्रचलित ऐतिहासिक विवरण इसे सन् 1459 (विक्रम संवत् 1516) में रखते हैं, जबकि लोक-परम्परा विक्रम संवत् 1442 (सन् 1385) बताती है; समाधि पर वर्तमान मंदिर सन् 1931 (विक्रम संवत् 1988) में बीकानेर के महाराजा गंगा सिंह ने बनवाया। भादवा मेले में यहाँ लाखों पदयात्री पहुँचते हैं।',
    significanceEn: 'Near Pokaran in Jaisalmer district, Ramdevra (Runicha) is the samadhi of Baba Ramdev Pir — the lokdevta dham of Rajasthan where Hindus come to him as an avatar of Krishna and Muslims as “Ramsa Pir”. Baba was born on Bhadrapada Shukla Dwitiya, Vikram Samvat 1409 (1352 CE), and took living samadhi here on Bhadrapada Shukla Ekadashi — the prevailing historical accounts place it in 1459 CE (Vikram Samvat 1516), while folk tradition gives Vikram Samvat 1442 (1385 CE); the present temple over the samadhi was built in 1931 CE (Vikram Samvat 1988) by Maharaja Ganga Singh of Bikaner. The Bhadwa fair brings lakhs of foot-pilgrims here.',
    originStoryHi: 'कथा में पोकरण के तंवर शासक अजमल जी और मैणादे को द्वारकाधीश की आराधना से पुत्र रामदेव मिले, जिन्हें कृष्ण का अवतार माना गया। बाबा ने रुणिचा बसाकर दलितों और पीड़ितों की सेवा की, मक्का से आए पाँच पीरों को चमत्कार दिखाकर “रामसा पीर” कहलाए, और भाद्रपद शुक्ल एकादशी को समाधि ले ली — उसी समाधि पर आज का मंदिर है।',
    originStoryEn: 'In the legend, Ajmal Ji, the Tanwar ruler of Pokaran, and his wife Mainade received a son, Ramdev, through their worship of Dwarkadhish, and he was held to be an avatar of Krishna. Baba settled Runicha, served the downtrodden and the oppressed, earned the name “Ramsa Pir” when he showed his miracles to five pirs come from Mecca, and took samadhi on Bhadrapada Shukla Ekadashi — today’s temple stands over that samadhi.',
    sources: [
      source('Rajasthan Tourism - Ramdevra Temple', 'https://www.tourism.rajasthan.gov.in/ramdevra-temple.html'),
      source('Incredible India - Ramdevra Temple, Jaisalmer', 'https://www.incredibleindia.gov.in/en/rajasthan/jaisalmer/ramdevra-temple'),
      source('Ramdev Pir - Reference', 'https://en.wikipedia.org/wiki/Ramdev_Pir'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'बाबा रामदेव का जन्म भाद्रपद शुक्ल द्वितीया, विक्रम संवत् 1409 (सन् 1352) को परम्परा के अनुसार बाड़मेर ज़िले के उंडू-काश्मीर (कासमेर) गाँव में पोकरण के तंवर शासक अजमल जी और मैणादे के घर हुआ; कथा कहती है कि द्वारका में अजमल जी की प्रार्थना सुनकर स्वयं कृष्ण ने उनके घर अवतार लिया, और बड़े भाई वीरमदेव के साथ बाबा का पालन हुआ। युवावस्था में उन्होंने भैरव राक्षस से पोकरण की रक्षा की और रुणिचा गाँव बसाया, जो आज रामदेवरा है। उन्होंने जाति-भेद के विरुद्ध खड़े होकर मेघवाल कन्या डाली बाई को धर्म-बहन बनाया और चौबीस परचे (चमत्कार) दिखाए; मक्का से आए पाँच पीरों को उनके कटोरे मक्का से मँगाकर भोजन कराया, जिससे वे “रामसा पीर” कहलाए। भाद्रपद शुक्ल एकादशी को उन्होंने रुणिचा में जीवित समाधि ली — प्रचलित ऐतिहासिक विवरण इसे सन् 1459 (विक्रम संवत् 1516) में रखते हैं, जबकि लोक-परम्परा विक्रम संवत् 1442 (सन् 1385), तैंतीस वर्ष की आयु, बताती है; डाली बाई ने उनसे पहले समाधि ली थी। समाधि पर पहले सादा स्थान था; सन् 1931 (विक्रम संवत् 1988) में बीकानेर के महाराजा गंगा सिंह ने वर्तमान मंदिर बनवाया। मंदिर की सेवा-पूजा बाबा के तंवर वंशज करते आए हैं, और व्यवस्था स्थानीय मंदिर समिति देखती है।',
        bodyEn: 'Baba Ramdev was born on Bhadrapada Shukla Dwitiya, Vikram Samvat 1409 (1352 CE), by tradition at Undu-Kashmir (Kasamer) village in Barmer district, to Ajmal Ji, the Tanwar ruler of Pokaran, and his wife Mainade; the katha tells that Krishna himself, hearing Ajmal Ji’s prayer at Dwarka, took birth in his house, and Baba was raised with his elder brother Viramdev. As a young man he defended Pokaran from the demon Bhairav and settled the village of Runicha, today’s Ramdevra. He stood against caste discrimination, taking the Meghwal girl Dali Bai as his sister in dharma, and showed twenty-four parchas (miracles); when five pirs came from Mecca he fed them from their own bowls summoned from Mecca, earning the name “Ramsa Pir”. On Bhadrapada Shukla Ekadashi he took living samadhi at Runicha — the prevailing historical accounts place it in 1459 CE (Vikram Samvat 1516), while folk tradition gives Vikram Samvat 1442 (1385 CE), at the age of thirty-three; Dali Bai had taken samadhi before him. A plain shrine first marked the samadhi; in 1931 CE (Vikram Samvat 1988) Maharaja Ganga Singh of Bikaner built the present temple. Worship at the temple has passed down through Baba’s Tanwar descendants, and its affairs are managed by the local temple committee.',
      },
      {
        id: 'svarup',
        titleHi: 'बाबा रामदेव का स्वरूप',
        titleEn: 'The Form of Baba Ramdev',
        bodyHi: 'रामदेवरा में मूर्ति नहीं, बाबा की समाधि पूजी जाती है — गर्भगृह में संगमरमर की समाधि, जिस पर चादर और फूल चढ़ते हैं और जिसके पास बाबा के पगलिये (चरण-चिह्न) अंकित हैं। लोकचित्रों में बाबा घोड़े पर सवार, हाथ में भाला और भगवा ध्वज लिए दिखाए जाते हैं, और उनका प्रतीक पगलिया राजस्थान-गुजरात के घर-घर में पूजा जाता है। समाधि के पास डाली बाई और बाबा के अन्य शिष्यों की समाधियाँ हैं। परिसर से लगा राम सरोवर है, जिसे बाबा ने स्वयं खुदवाया माना जाता है और जिसमें स्नान को पुण्यदायी मानते हैं; पास ही परचा बावड़ी है, जो उनके चमत्कारों से जुड़ी है, और पत्थर का “डाली बाई का कंगन”, जिससे निकलना पाप-मुक्ति का प्रतीक माना जाता है।',
        bodyEn: 'At Ramdevra no image is worshipped but Baba’s samadhi itself — a marble tomb in the sanctum, draped with cloth and flowers, with Baba’s pagliya (footprints) carved beside it. In folk paintings Baba rides a horse with a spear and a saffron banner, and his emblem, the pagliya, is worshipped in homes across Rajasthan and Gujarat. Near the samadhi lie the samadhis of Dali Bai and Baba’s other disciples. Adjoining the complex is Ram Sarovar, the tank Baba is believed to have dug himself, where a dip is held to be purifying; close by are the Parcha Bawdi, the stepwell linked to his miracles, and the stone “Dali Bai ka Kangan”, passing through which is taken as a sign of release from sin.',
      },
      {
        id: 'parampara',
        titleHi: 'कपड़े का घोड़ा और बाबा री बीज',
        titleEn: 'The Cloth Horse and Baba ri Beej',
        bodyHi: 'रामदेवरा की सबसे पहचानी मनौती कपड़े का घोड़ा है — कथा है कि बाबा को बचपन में एक दर्ज़ी का बनाया कपड़े का घोड़ा उड़ाकर ले गया था, इसलिए भक्त मनोकामना पूरी होने पर रंग-बिरंगे कपड़े के घोड़े अर्पित करते हैं। बाबा को नारियल, लापसी और चूरमा का भोग लगता है, और उनके नाम पर “बाबा री बीज” — हर मास की शुक्ल द्वितीया — का व्रत रखा जाता है, जब रात्रि-जागरण में बाबा के भजन (“ब्यावला”) गाए जाते हैं। भक्त बाबा के पगलिये और भगवा ध्वज लेकर पैदल चलते हैं; हिन्दू, मुसलमान और सिख सब समान श्रद्धा से आते हैं। दर्शन प्रातः मंगला आरती से रात्रि शयन आरती तक चलते हैं, और भाद्रपद में मंदिर लगभग दिन-रात खुला रहता है।',
        bodyEn: 'Ramdevra’s most recognisable vow is the cloth horse — the katha tells that as a child Baba was carried off flying on a cloth horse made by a tailor, so devotees offer bright cloth horses when a wish is fulfilled. Coconut, lapsi and churma are offered as bhog, and “Baba ri Beej”, the Shukla Dwitiya of every month, is kept as a fast in his name, with his bhajans (the “Byavla”) sung at night vigils. Devotees walk carrying Baba’s pagliya and saffron banners, and Hindus, Muslims and Sikhs come with the same devotion. Darshan runs from the Mangala aarti at dawn to the Shayan aarti at night, and in Bhadrapada the temple stays open almost round the clock.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'रामदेवरा का भादवा मेला भाद्रपद शुक्ल द्वितीया (बाबा री बीज, उनकी जन्म-तिथि) से एकादशी (समाधि-तिथि) तक (अगस्त–सितम्बर) चलता है — यह राजस्थान के सबसे बड़े लोकदेव मेलों में है, जिसमें राजस्थान, गुजरात, मध्य प्रदेश, हरियाणा और पंजाब से लाखों श्रद्धालु आते हैं और असंख्य पदयात्री संघ जोधपुर, बीकानेर और गुजरात से सैकड़ों किलोमीटर पैदल चलकर ध्वज चढ़ाते हैं। हर मास की शुक्ल द्वितीया को भी भीड़ रहती है, और मेले की रातें ब्यावला-गायन व जागरण से गूँजती हैं।',
        bodyEn: 'The Bhadwa fair of Ramdevra runs from Bhadrapada Shukla Dwitiya (Baba ri Beej, his birth tithi) to Ekadashi (the tithi of his samadhi) in August–September — among the largest folk-deity fairs of Rajasthan, drawing lakhs of devotees from Rajasthan, Gujarat, Madhya Pradesh, Haryana and Punjab, with countless padyatri groups walking hundreds of kilometres from Jodhpur, Bikaner and Gujarat to raise their banners. Every month’s Shukla Dwitiya also draws crowds, and the fair’s nights ring with Byavla singing and vigils.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'रामदेवरा जैसलमेर ज़िले में जोधपुर–जैसलमेर मार्ग (राष्ट्रीय राजमार्ग 125) पर पोकरण से लगभग 12 किमी है — जैसलमेर से लगभग 120 किमी और जोधपुर से लगभग 190 किमी। जोधपुर–जैसलमेर रेल-मार्ग पर रामदेवरा का अपना रेलवे स्टेशन है, और पोकरण दूसरा निकट स्टेशन; निकटतम हवाई अड्डे जोधपुर और जैसलमेर हैं। श्रद्धालु प्रायः रामदेवरा को पोकरण के किले, बाबा की जन्मभूमि उंडू-काश्मीर (बाड़मेर) और पाँच पीपली — जहाँ बाबा ने मक्का के पीरों को परचा दिया — के साथ जोड़ते हैं। परिसर में राम सरोवर, परचा बावड़ी, डाली बाई की समाधि व कंगन दर्शनीय हैं, और भादवे में पदयात्री-मार्ग जोधपुर से रामदेवरा तक ध्वजों से भरा रहता है।',
        bodyEn: 'Ramdevra lies in Jaisalmer district on the Jodhpur–Jaisalmer road (National Highway 125), roughly 12 km from Pokaran — about 120 km from Jaisalmer and 190 km from Jodhpur. Ramdevra has its own railway station on the Jodhpur–Jaisalmer line, with Pokaran the next nearest; the nearest airports are Jodhpur and Jaisalmer. Pilgrims usually pair Ramdevra with Pokaran fort, Baba’s birthplace Undu-Kashmir in Barmer, and Panch Pipli, where Baba gave his parcha to the pirs from Mecca. Within the complex, Ram Sarovar, the Parcha Bawdi and Dali Bai’s samadhi and kangan are visited, and in Bhadrapada the foot-pilgrims’ road from Jodhpur to Ramdevra stays lined with banners.',
      },
    ],
  },
  kamakshi: {
    significanceHi: 'कांचीपुरम की कामाक्षी अम्मन देवी पार्वती के सौम्य स्वरूप की उपासना का प्रमुख केन्द्र है और अष्टादश महाशक्ति पीठों में गिनी जाती है।',
    significanceEn: 'Kamakshi Amman of Kanchipuram is a major centre of worship for Devi as a gentle form of Parvati, counted among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती के मध्यभाग (नाभि-क्षेत्र) का अंश यहाँ गिरा माना जाता है; देवी कामाक्षी श्रीचक्र-उपासना की अधिष्ठात्री के रूप में पूजित हैं।',
    originStoryEn: 'In the Shakti Peeth tradition a part of Sati’s midriff is held to have fallen here; Devi Kamakshi is revered as the presiding goddess of Srichakra worship.',
    sources: [source('Kamakshi Amman Temple - Reference', 'https://en.wikipedia.org/wiki/Kamakshi_Amman_Temple')],
  },
  shrinkhala: {
    significanceHi: 'हुगली के पांडुआ की श्रृंखला देवी अष्टादश महाशक्ति पीठों में पूजित बंगाल का प्राचीन शक्ति-तीर्थ है।',
    significanceEn: 'Shrinkhala Devi at Pandua in Hooghly is an ancient Bengal Shakti shrine, revered among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ कथा में सती के उदर का अंश यहाँ गिरा माना जाता है; देवी को “भवतारिणी” रूप में स्मरण किया जाता है।',
    originStoryEn: 'The Shakti Peeth legend holds that part of Sati’s stomach fell here; the goddess is remembered in her form as Bhavatarini.',
    sources: [
      source('Shakta Pithas - Reference', 'https://en.wikipedia.org/wiki/Shakta_pithas'),
      source('Pandua, Hooghly - Reference', 'https://en.wikipedia.org/wiki/Pandua,_Hooghly'),
    ],
  },
  chamundeshwari: {
    significanceHi: 'मैसूरु की चामुंडी पहाड़ी पर स्थित चामुंडेश्वरी देवी के उग्र स्वरूप की उपासना का केन्द्र है और अष्टादश महाशक्ति पीठों में गिनी जाती है।',
    significanceEn: 'Chamundeshwari on Chamundi Hill in Mysuru is a centre of worship for the fierce form of Devi, counted among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती के केश यहाँ गिरे माने जाते हैं; देवी ने महिषासुर का संहार कर चामुंडेश्वरी (महिषासुरमर्दिनी) रूप पाया।',
    originStoryEn: 'In the Shakti Peeth tradition Sati’s hair is held to have fallen here; the goddess slew Mahishasura and is revered as Chamundeshwari, the demon-slayer.',
    sources: [source('Chamundeshwari Temple - Reference', 'https://en.wikipedia.org/wiki/Chamundeshwari_Temple')],
  },
  jogulamba: {
    significanceHi: 'तुंगभद्रा तट पर आलमपुर की जोगुलांबा देवी शक्ति के योगिनी स्वरूप की उपासना का केन्द्र है और अष्टादश महाशक्ति पीठों में आती है।',
    significanceEn: 'Jogulamba at Alampur on the Tungabhadra is a centre of worship for the Yogini form of Shakti and is one of the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती के दाँत यहाँ गिरे माने जाते हैं; देवी जोगुलांबा उग्र-योगिनी रूप में पूजित हैं।',
    originStoryEn: 'The Shakti Peeth tradition holds that Sati’s teeth fell here; Devi Jogulamba is worshipped in her fierce Yogini form.',
    sources: [source('Jogulamba Temple, Alampur - Reference', 'https://en.wikipedia.org/wiki/Jogulamba_Temple,_Alampur')],
  },
  bhramaramba: {
    significanceHi: 'श्रीशैलम में मल्लिकार्जुन के साथ विराजित भ्रमरांबा देवी शैव और शाक्त उपासना का संगम है और अष्टादश महाशक्ति पीठों में गिनी जाती है।',
    significanceEn: 'Bhramaramba at Srisailam, enshrined with Mallikarjuna, joins Shaiva and Shakta worship and is counted among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती के ऊर्ध्व-दन्त यहाँ गिरे माने जाते हैं; देवी भ्रमरांबा (भ्रमर-रूपा) के रूप में पूजित हैं।',
    originStoryEn: 'In the Shakti Peeth tradition Sati’s upper teeth are held to have fallen here; the goddess is worshipped as Bhramaramba, she of the bees.',
    sources: [source('Mallikarjuna Temple, Srisailam - Reference', 'https://en.wikipedia.org/wiki/Mallikarjuna_Temple,_Srisailam')],
  },
  'mahalakshmi-kolhapur': {
    significanceHi: 'कोल्हापुर की महालक्ष्मी (अंबाबाई) महाराष्ट्र की प्रमुख देवी हैं; यह अष्टादश महाशक्ति पीठों और क्षेत्र के साढ़े-तीन शक्ति-स्थलों में पूजित है।',
    significanceEn: 'Mahalakshmi (Ambabai) of Kolhapur is a principal goddess of Maharashtra, revered among the eighteen Maha Shakti Peethas and the region’s “three and a half” Shakti seats.',
    originStoryHi: 'करवीर-क्षेत्र की परंपरा में महालक्ष्मी को स्वयंभू और निवास-रूप शक्ति माना जाता है, जहाँ देवी सदैव वास करती हैं।',
    originStoryEn: 'In the Karvir tradition Mahalakshmi is revered as a self-manifest, ever-resident form of Shakti who never leaves the shrine.',
    sources: [source('Mahalakshmi Temple, Kolhapur - Reference', 'https://en.wikipedia.org/wiki/Mahalakshmi_Temple,_Kolhapur')],
  },
  'ekaveerika-mahur': {
    significanceHi: 'माहूरगड की रेणुका देवी (एकवीरा) महाराष्ट्र के साढ़े-तीन शक्ति-स्थलों में से एक हैं और अष्टादश महाशक्ति पीठों में “पद्माक्षी रेणुका” रूप में गिनी जाती हैं।',
    significanceEn: 'Renuka Devi (Ekvira) of Mahurgad is one of Maharashtra’s “three and a half” Shakti seats and is counted in the eighteen Maha Shakti Peethas as Padmakshi Renuka.',
    originStoryHi: 'परंपरा में रेणुका को परशुराम की माता और मातृ-शक्ति का स्वरूप माना जाता है; माहूर की पहाड़ी उनका प्रमुख निवास-तीर्थ है।',
    originStoryEn: 'Tradition reveres Renuka as the mother of Parashurama and a form of the Mother Goddess; the Mahur hill is her principal shrine.',
    sources: [source('Renuka - Reference', 'https://en.wikipedia.org/wiki/Renuka')],
  },
  'harsiddhi-ujjain': {
    significanceHi: 'उज्जैन की हरसिद्धि देवी (महाकाली) अवंतिका की प्रमुख शक्ति हैं और अष्टादश महाशक्ति पीठों में गिनी जाती हैं।',
    significanceEn: 'Harsiddhi (Mahakali) of Ujjain is the principal Shakti of Avantika and is counted among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शिव पुराण की कथा में सती के शव को ले जाते समय उनकी कुहनी यहाँ गिरी; देवी चण्डी ने “हरसिद्धि” नाम पाया।',
    originStoryEn: 'In the Shiva Purana legend, Sati’s elbow fell here as Shiva carried her body, and the goddess Chandi came to be known as Harsiddhi.',
    sources: [source('Ujjain District - Harsiddhi Temple', 'https://ujjain.nic.in/en/tourist-place/harsiddhi/')],
  },
  puruhutika: {
    significanceHi: 'पिठापुरम के कुक्कुटेश्वर मंदिर परिसर में विराजित पुरुहूतिका देवी अष्टादश महाशक्ति पीठों में पूजित आंध्र का प्रमुख शक्ति-तीर्थ है।',
    significanceEn: 'Puruhutika Devi, enshrined within the Kukkuteswara temple complex at Pithapuram, is a major Andhra Shakti shrine among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती के वक्ष का अंश यहाँ गिरा माना जाता है; देवी पुरुहूतिका रूप में पूजित हैं।',
    originStoryEn: 'The Shakti Peeth tradition holds that part of Sati’s breast fell here; the goddess is worshipped as Puruhutika.',
    sources: [source('Kukkuteswara Temple - Reference', 'https://en.wikipedia.org/wiki/Kukkuteswara_Temple')],
  },
  biraja: {
    significanceHi: 'जाजपुर की बिरजा (गिरिजा) देवी दुर्गा के महिषमर्दिनी स्वरूप में पूजित हैं और अष्टादश महाशक्ति पीठों में गिनी जाती हैं।',
    significanceEn: 'Biraja (Girija) of Jajpur is worshipped as Durga slaying Mahishasura and is counted among the eighteen Maha Shakti Peethas.',
    originStoryHi: 'तंत्र-चूड़ामणि की कथा में सती की नाभि यहाँ गिरी, इसलिए यह क्षेत्र “विरजा क्षेत्र” कहलाया; देवी द्विभुजा महिषमर्दिनी रूप में विराजित हैं।',
    originStoryEn: 'In the Tantra Chudamani, Sati’s navel fell here, giving the region the name Viraja Kshetra; the goddess stands as the two-armed slayer of Mahishasura.',
    sources: [source('Biraja Temple - Reference', 'https://en.wikipedia.org/wiki/Biraja_Temple')],
  },
  manikyamba: {
    significanceHi: 'द्राक्षारामम के भीमेश्वर मंदिर परिसर में विराजित माणिक्यांबा देवी अष्टादश महाशक्ति पीठों में बारहवीं मानी जाती हैं।',
    significanceEn: 'Manikyamba, enshrined within the Bhimeswara temple complex at Draksharama, is regarded as the twelfth of the eighteen Maha Shakti Peethas.',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती का एक अंग यहाँ गिरा माना जाता है; देवी माणिक्यांबा आत्मलिङ्ग धारण किए आसन-मुद्रा में पूजित हैं।',
    originStoryEn: 'The Shakti Peeth tradition holds that a part of Sati fell here; Devi Manikyamba is worshipped seated, holding the atma-linga.',
    sources: [source('Daksharamam - Reference', 'https://en.wikipedia.org/wiki/Daksharamam')],
  },
  madhaveswari: {
    significanceHi: 'प्रयागराज की माधवेश्वरी (अलोपी देवी) अष्टादश महाशक्ति पीठों में पूजित हैं, जहाँ प्रतिमा के स्थान पर काष्ठ-डोली की उपासना होती है।',
    significanceEn: 'Madhaveswari (Alopi Devi) of Prayagraj is revered among the eighteen Maha Shakti Peethas, where a wooden doli rather than an image is worshipped.',
    originStoryHi: 'संगम-नगरी की परंपरा में देवी “अलोपी” अर्थात अंतर्धान होने वाली शक्ति के रूप में पूजित हैं; यह स्थान त्रिवेणी की शक्ति-साधना से जुड़ा है।',
    originStoryEn: 'In the Sangam city’s tradition the goddess is worshipped as Alopi, the Shakti who vanished from sight; the shrine is tied to the Shakta devotion of the Triveni confluence.',
    sources: [source('Alopi Devi Mandir - Reference', 'https://en.wikipedia.org/wiki/Alopi_Devi_Mandir')],
  },
  'mangala-gauri': {
    significanceHi: 'गया की मंगला गौरी देवी अष्टादश महाशक्ति पीठों में पूजित हैं और मातृ-शक्ति “सर्वमंगला” रूप में स्मरण की जाती हैं।',
    significanceEn: 'Mangala Gauri of Gaya is revered among the eighteen Maha Shakti Peethas and remembered as the Mother Goddess in her “Sarvamangala” form.',
    originStoryHi: 'परंपरा में सती के वक्ष का अंश यहाँ गिरा माना जाता है; देवी मंगला गौरी मंगल-दायिनी शक्ति के रूप में पूजित हैं।',
    originStoryEn: 'Tradition holds that part of Sati’s breast fell here; Devi Mangala Gauri is worshipped as the auspicious, boon-granting Shakti.',
    sources: [
      source('Mangla Gauri Temple - Reference', 'https://en.wikipedia.org/wiki/Mangla_Gauri_Temple'),
      source('Bihar Tourism - Mangala Gauri', 'https://tourism.bihar.gov.in/en/destinations/gaya/mangala-gauri'),
    ],
  },
  vishalakshi: {
    significanceHi: 'काशी की विशालाक्षी देवी गंगा तट की प्रमुख शक्ति हैं और अष्टादश महाशक्ति पीठों में पूजित हैं; नाम का अर्थ है “विशाल नेत्रों वाली”।',
    significanceEn: 'Vishalakshi of Kashi is a principal Shakti of the Ganga ghats, revered among the eighteen Maha Shakti Peethas; her name means “she of the large eyes.”',
    originStoryHi: 'शक्ति-पीठ परंपरा में सती का कुण्डल (कर्ण-आभूषण) यहाँ गिरा माना जाता है; देवी विशालाक्षी पार्वती के स्वरूप में पूजित हैं।',
    originStoryEn: 'In the Shakti Peeth tradition Sati’s earring is held to have fallen here; Devi Vishalakshi is worshipped as a form of Parvati.',
    sources: [source('Vishalakshi Temple - Reference', 'https://en.wikipedia.org/wiki/Vishalakshi_Temple')],
  },
};

export const temples: readonly TempleEntry[] = baseTemples.map((temple) => ({
  addedInVersion: THEERTH_LAUNCH_VERSION,
  ...temple,
  ...templeDetails[temple.id],
}));

export function getTempleById(id: string): TempleEntry | undefined {
  return temples.find((t) => t.id === id);
}

export function templesInGroup(group: TheerthGroup): TempleEntry[] {
  return temples.filter((t) => t.groups.includes(group));
}

export function otherFamous(): TempleEntry[] {
  return temples.filter((t) => t.groups.length === 0);
}
