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

export type TempleDetail = {
  significanceHi: string;
  significanceEn: string;
  originStoryHi: string;
  originStoryEn: string;
  sources: readonly TheerthSource[];
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
    significanceHi: 'सीकर ज़िले के खाटू में स्थित खाटू श्याम जी राजस्थान का अत्यंत लोकप्रिय लोकदेव तीर्थ है, जहाँ श्याम बाबा को कलियुग में कृष्ण-स्वरूप माना जाता है।',
    significanceEn: 'At Khatu in Sikar district, Khatu Shyam Ji is one of Rajasthan’s most beloved lokdevta shrines, where Shyam Baba is revered as Krishna himself in the Kali Yuga.',
    originStoryHi: 'कथा में भीम के पौत्र बर्बरीक ने महाभारत-युद्ध से पूर्व अपना शीश दान किया; प्रसन्न होकर कृष्ण ने वर दिया कि वे कलियुग में “श्याम” रूप में पूजे जाएँगे।',
    originStoryEn: 'In the legend, Barbarika — grandson of Bhima — offered his head before the Mahabharata war; pleased, Krishna blessed him to be worshipped as “Shyam” in the Kali Yuga.',
    sources: [source('Rajasthan Devasthan - Khatushyamji', 'https://devasthan.rajasthan.gov.in/images/Sikar/khatushyamji.htm')],
  },
  'salasar-balaji': {
    significanceHi: 'चूरू ज़िले के सालासर धाम में बालाजी को हनुमान-भक्ति के सिद्धपीठ रूप में पूजा जाता है; यहाँ दाढ़ी-मूँछ वाले बालाजी की विशिष्ट प्रतिमा भक्तों को आकर्षित करती है।',
    significanceEn: 'At Salasar Dham in Churu district, Balaji is worshipped as a powerful Hanuman shrine; its distinctive bearded and moustached form of Balaji draws devotees through the year.',
    originStoryHi: 'लोककथा में आसोटा गाँव के खेत में हल चलाते समय बालाजी की प्रतिमा प्रकट हुई; बालाजी ने स्वप्न में उसे सालासर ले जाने का आदेश दिया और वहाँ मंदिर प्रतिष्ठित हुआ।',
    originStoryEn: 'The local legend says a Balaji idol emerged while a farmer was ploughing at Asota; Balaji then appeared in dreams directing that the idol be brought to Salasar and enshrined there.',
    sources: [
      source('Shree Salasar Balaji Mandir', 'https://shreesalasarbalajimandir.com/'),
      source('Rajasthan Tourism - Salasar Balaji Temple', 'https://www.tourism.rajasthan.gov.in/salasar-balaji-temple.html'),
    ],
  },
  'karni-mata': {
    significanceHi: 'बीकानेर के पास देशनोक का करणी माता मंदिर देवी-उपासना और काबा कहलाने वाले पवित्र चूहों की अनोखी परंपरा के कारण प्रसिद्ध है।',
    significanceEn: 'Karni Mata Temple at Deshnoke near Bikaner is known for Devi worship and the unusual tradition of sacred kabbas, the rats that live freely in the temple complex.',
    originStoryHi: 'कथा में करणी माता ने यम से अपने पुत्र लक्ष्मण को लौटाने की प्रार्थना की; अंततः उनके कुल के बालक काबा रूप में पुनर्जन्म लेकर देवी की छाया में रहने लगे।',
    originStoryEn: 'In the temple legend, Karni Mata pleaded with Yama after her son Laxman died; her lineage’s children came to be reborn as kabbas and to live under the goddess’s protection.',
    sources: [source('Rajasthan Tourism - Karni Mata Temple', 'https://www.tourism.rajasthan.gov.in/karni-mata-temple.html')],
  },
  'jeen-mata': {
    significanceHi: 'सीकर की अरावली पहाड़ियों में स्थित जीण माता धाम सिद्ध शक्ति पीठ माना जाता है, जहाँ माँ जीण/जयन्ती को दुर्गा-शक्ति के रूप में पूजा जाता है।',
    significanceEn: 'Jeen Mata Dham in the Aravalli hills of Sikar is revered as a Siddh Shakti Peeth, where Maa Jeen or Jayanti is worshipped as a form of Durga Shakti.',
    originStoryHi: 'स्थानीय परंपरा में जीण माता ने काजल शिखर क्षेत्र में तप किया और देवी-शक्ति रूप में प्रतिष्ठित हुईं; नवरात्रि में यहाँ विशेष मेला और कुलदेवी-दर्शन होते हैं।',
    originStoryEn: 'Local tradition remembers Jeen Mata’s austerity at Kajal Shikhar and her manifestation as Devi Shakti; Navratri brings major worship and kuldevi darshan to the shrine.',
    sources: [source('Shree Jeen Mata Mandir', 'https://shrijeenmata.org/')],
  },
  'khandoba-jejuri': {
    significanceHi: 'पुणे के पास जेजुरी का खंडोबा मंदिर महाराष्ट्र का प्रमुख लोकदेव तीर्थ है; खंडोबा शिव के अवतार माने जाते हैं और गर्भगृह में शिवलिङ्ग भी विराजित है।',
    significanceEn: 'The Khandoba Temple at Jejuri near Pune is a major Maharashtra lokdevta pilgrimage; Khandoba is revered as an avatar of Shiva, and the sanctum also enshrines a Shiva linga.',
    originStoryHi: 'लोक-परंपरा में खंडोबा (मल्हारी मार्तण्ड) ने मणि-मल्ल असुरों का संहार किया; भक्त उन्हें भण्डार (हल्दी) चढ़ाकर “येळकोट” जयघोष से पूजते हैं।',
    originStoryEn: 'In folk tradition Khandoba (Malhari Martand) slew the demons Mani and Malla; devotees worship him by showering bhandar (turmeric) with the cry of “Yelkot.”',
    sources: [source('Khandoba Temple, Jejuri - Reference', 'https://en.wikipedia.org/wiki/Khandoba_Temple,_Jejuri')],
  },
  'gogaji-gogamedi': {
    significanceHi: 'हनुमानगढ़ के गोगामेड़ी में स्थित गोगाजी राजस्थान के सर्प-रक्षक वीर लोकदेव हैं, जिन्हें हिन्दू और मुस्लिम दोनों समान श्रद्धा से पूजते हैं।',
    significanceEn: 'At Gogamedi in Hanumangarh, Gogaji is Rajasthan’s revered serpent-protector and warrior lokdevta, venerated alike by Hindus and Muslims.',
    originStoryHi: 'लोक-परंपरा में गोगाजी सर्पदंश से रक्षा करने वाले देव माने जाते हैं और नाथ-परंपरा से जुड़े हैं; उनकी स्मृति में गोगामेड़ी का विशाल मेला लगता है।',
    originStoryEn: 'Folk tradition reveres Gogaji as a protector against snakebite, linked to the Nath order; the great Gogamedi fair is held in his memory.',
    sources: [source('Rajasthan Devasthan - Gogaji', 'https://devasthan.rajasthan.gov.in/images/hanumangarh/gogaji.htm')],
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
    significanceHi: 'नागौर के खरनाल में स्थित वीर तेजाजी मंदिर राजस्थान के लोकदेव तेजाजी को समर्पित है, जिन्हें सर्पदंश-निवारक और शिव का अवतार माना जाता है।',
    significanceEn: 'At Kharnal in Nagaur, the Veer Tejaji Temple honours the Rajasthani lokdevta Tejaji, revered as a healer of snakebite and an incarnation of Shiva.',
    originStoryHi: 'कथा में तेजाजी ने वचन-पालन करते हुए घायल अवस्था में भी सर्प के पास लौटकर अपना वचन निभाया; उनकी वीरता और सत्यनिष्ठा से वे लोकदेव रूप में पूजित हुए।',
    originStoryEn: 'In the legend, the wounded Tejaji kept his promise by returning to a serpent he had vowed to meet; his valour and truth made him a venerated lokdevta.',
    sources: [source('Veer Teja - Reference', 'https://en.wikipedia.org/wiki/Veer_Teja')],
  },
  ramdevra: {
    significanceHi: 'जैसलमेर के पोखरण के पास रामदेवरा का बाबा रामदेव मंदिर राजस्थान का बड़ा लोकदेव तीर्थ है; रामदेव जी को कृष्ण का अवतार माना जाता है।',
    significanceEn: 'Near Pokhran in Jaisalmer, the Baba Ramdev Temple at Ramdevra is a major Rajasthani lokdevta pilgrimage; Ramdev ji is revered as an avatar of Krishna.',
    originStoryHi: 'परंपरा में रामदेव जी ने रामदेवरा में समाधि ली; 1931 में बीकानेर के महाराजा गंगासिंह ने उनकी समाधि पर मंदिर बनवाया, जहाँ हिन्दू-मुस्लिम दोनों आते हैं।',
    originStoryEn: 'Tradition holds that Ramdev ji took samadhi at Ramdevra; in 1931 Maharaja Ganga Singh of Bikaner built the temple over his grave, drawing both Hindus and Muslims.',
    sources: [source('Rajasthan Devasthan - Ramdevji', 'https://devasthan.rajasthan.gov.in/images/Jaisalmer/ramdevji.htm')],
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
