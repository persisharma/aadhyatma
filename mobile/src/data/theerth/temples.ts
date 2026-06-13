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
 * Per RULEBOOK §10.3, origin-story / significance prose is intentionally
 * absent here — that content must be sourced verbatim from authoritative
 * published editions (Shiva Purāṇa, Devi Bhagavata, temple-trust sites,
 * ASI listings) and cited per §10.1 / §10.2 before each temple flips to
 * shippable. The detail screen renders a "pending verification" placeholder
 * until then.
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

export type TempleEntry = {
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
};

export const temples: readonly TempleEntry[] = [
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

  // ---------- Shakti Peeth (six widely-recognized devi sites) ----------
  { id: 'kamakhya',         nameHi: 'कामाख्या',          nameEn: 'Kamakhya',          cityHi: 'गुवाहाटी',   cityEn: 'Guwahati',    stateHi: 'असम',            stateEn: 'Assam',           coordinates: { lat: 26.166, lng: 91.705 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'vaishno-devi',     nameHi: 'वैष्णो देवी',        nameEn: 'Vaishno Devi',      cityHi: 'कटरा',       cityEn: 'Katra',       stateHi: 'जम्मू-कश्मीर',   stateEn: 'Jammu & Kashmir', coordinates: { lat: 33.031, lng: 74.950 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'kalighat',         nameHi: 'कालीघाट',           nameEn: 'Kalighat',          cityHi: 'कोलकाता',    cityEn: 'Kolkata',     stateHi: 'पश्चिम बंगाल',   stateEn: 'West Bengal',     coordinates: { lat: 22.518, lng: 88.343 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'naina-devi',       nameHi: 'नैना देवी',          nameEn: 'Naina Devi',        cityHi: 'बिलासपुर',   cityEn: 'Bilaspur',    stateHi: 'हिमाचल प्रदेश',  stateEn: 'Himachal Pradesh', coordinates: { lat: 31.325, lng: 76.536 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'jwala-devi',       nameHi: 'ज्वाला देवी',        nameEn: 'Jwala Devi',        cityHi: 'कांगड़ा',    cityEn: 'Kangra',      stateHi: 'हिमाचल प्रदेश',  stateEn: 'Himachal Pradesh', coordinates: { lat: 31.878, lng: 76.322 }, deity: 'durga',   groups: ['shakti-peeth'] },
  { id: 'chamunda-devi',    nameHi: 'चामुंडा देवी',       nameEn: 'Chamunda Devi',     cityHi: 'धर्मशाला',   cityEn: 'Dharamshala', stateHi: 'हिमाचल प्रदेश',  stateEn: 'Himachal Pradesh', coordinates: { lat: 32.212, lng: 76.335 }, deity: 'durga',   groups: ['shakti-peeth'] },

  // ---------- Other Famous (no structured-yatra membership) ----------
  { id: 'tirupati-balaji',  nameHi: 'तिरुपति बालाजी',     nameEn: 'Tirupati Balaji',   cityHi: 'तिरुमाला',   cityEn: 'Tirumala',    stateHi: 'आंध्र प्रदेश',   stateEn: 'Andhra Pradesh',  coordinates: { lat: 13.683, lng: 79.348 }, deity: 'vishnu',  groups: [] },
  { id: 'meenakshi',        nameHi: 'मीनाक्षी',           nameEn: 'Meenakshi',         cityHi: 'मदुरै',      cityEn: 'Madurai',     stateHi: 'तमिलनाडु',       stateEn: 'Tamil Nadu',      coordinates: { lat:  9.920, lng: 78.119 }, deity: 'durga',   groups: [] },
  { id: 'konark-sun',       nameHi: 'कोणार्क सूर्य',      nameEn: 'Konark Sun',        cityHi: 'कोणार्क',    cityEn: 'Konark',      stateHi: 'ओडिशा',          stateEn: 'Odisha',          coordinates: { lat: 19.888, lng: 86.094 }, deity: 'savitr',  groups: [] },
  { id: 'brihadeeswarar',   nameHi: 'बृहदीश्वर',          nameEn: 'Brihadeeswarar',    cityHi: 'तंजावुर',    cityEn: 'Thanjavur',   stateHi: 'तमिलनाडु',       stateEn: 'Tamil Nadu',      coordinates: { lat: 10.783, lng: 79.132 }, deity: 'shiva',   groups: [] },
  { id: 'padmanabhaswamy',  nameHi: 'पद्मनाभस्वामी',      nameEn: 'Padmanabhaswamy',   cityHi: 'तिरुवनंतपुरम', cityEn: 'Thiruvananthapuram', stateHi: 'केरल',     stateEn: 'Kerala',          coordinates: { lat:  8.483, lng: 76.941 }, deity: 'vishnu',  groups: [] },
  { id: 'banke-bihari',     nameHi: 'बांके बिहारी',       nameEn: 'Banke Bihari',      cityHi: 'वृंदावन',    cityEn: 'Vrindavan',   stateHi: 'उत्तर प्रदेश',   stateEn: 'Uttar Pradesh',   coordinates: { lat: 27.582, lng: 77.705 }, deity: 'krishna', groups: [] },

  // ---------- Statewise marquee temples (one per otherwise-uncovered state/UT) ----------
  // States/UTs with no marquee Hindu pilgrimage temple are intentionally omitted
  // (Nagaland, Mizoram, Ladakh, Chandigarh, Andaman & Nicobar, Lakshadweep,
  // Dadra & Nagar Haveli and Daman & Diu) rather than inventing one.
  { id: 'srinathji',          nameHi: 'श्रीनाथजी',          nameEn: 'Srinathji',          cityHi: 'नाथद्वारा',  cityEn: 'Nathdwara',   stateHi: 'राजस्थान',       stateEn: 'Rajasthan',         coordinates: { lat: 24.937, lng: 73.823 }, deity: 'krishna', groups: [] },
  { id: 'udupi-krishna',      nameHi: 'उडुपी श्रीकृष्ण',     nameEn: 'Udupi Sri Krishna',  cityHi: 'उडुपी',      cityEn: 'Udupi',       stateHi: 'कर्नाटक',        stateEn: 'Karnataka',         coordinates: { lat: 13.341, lng: 74.752 }, deity: 'krishna', groups: [] },
  { id: 'vishnupad-gaya',     nameHi: 'विष्णुपद',           nameEn: 'Vishnupad',          cityHi: 'गया',        cityEn: 'Gaya',        stateHi: 'बिहार',          stateEn: 'Bihar',             coordinates: { lat: 24.747, lng: 85.010 }, deity: 'vishnu',  groups: [] },
  { id: 'bhadrachalam',       nameHi: 'भद्राचलम',           nameEn: 'Bhadrachalam',       cityHi: 'भद्राचलम',   cityEn: 'Bhadrachalam', stateHi: 'तेलंगाना',      stateEn: 'Telangana',         coordinates: { lat: 17.668, lng: 80.888 }, deity: 'rama',    groups: [] },
  { id: 'danteshwari',        nameHi: 'दंतेश्वरी',          nameEn: 'Danteshwari',        cityHi: 'दंतेवाड़ा',  cityEn: 'Dantewada',   stateHi: 'छत्तीसगढ़',      stateEn: 'Chhattisgarh',      coordinates: { lat: 18.898, lng: 81.355 }, deity: 'durga',   groups: [] },
  { id: 'mangueshi',          nameHi: 'मंगेशी',             nameEn: 'Mangueshi',          cityHi: 'पोंडा',      cityEn: 'Ponda',       stateHi: 'गोवा',           stateEn: 'Goa',               coordinates: { lat: 15.456, lng: 73.964 }, deity: 'shiva',   groups: [] },
  { id: 'lakshmi-narayan',    nameHi: 'लक्ष्मीनारायण',       nameEn: 'Lakshmi Narayan',    cityHi: 'नई दिल्ली',  cityEn: 'New Delhi',   stateHi: 'दिल्ली',         stateEn: 'Delhi',             coordinates: { lat: 28.633, lng: 77.197 }, deity: 'vishnu',  groups: [] },
  { id: 'durgiana',           nameHi: 'दुर्गियाना',         nameEn: 'Durgiana',           cityHi: 'अमृतसर',     cityEn: 'Amritsar',    stateHi: 'पंजाब',          stateEn: 'Punjab',            coordinates: { lat: 31.620, lng: 74.864 }, deity: 'durga',   groups: [] },
  { id: 'mansa-devi',         nameHi: 'मनसा देवी',          nameEn: 'Mansa Devi',         cityHi: 'पंचकूला',    cityEn: 'Panchkula',   stateHi: 'हरियाणा',        stateEn: 'Haryana',           coordinates: { lat: 30.726, lng: 76.851 }, deity: 'durga',   groups: [] },
  { id: 'govindajee-imphal',  nameHi: 'श्री गोविंदजी',       nameEn: 'Shree Govindajee',   cityHi: 'इम्फाल',     cityEn: 'Imphal',      stateHi: 'मणिपुर',         stateEn: 'Manipur',           coordinates: { lat: 24.803, lng: 93.952 }, deity: 'krishna', groups: [] },
  { id: 'tripura-sundari',    nameHi: 'त्रिपुर सुंदरी',      nameEn: 'Tripura Sundari',    cityHi: 'उदयपुर',     cityEn: 'Udaipur',     stateHi: 'त्रिपुरा',       stateEn: 'Tripura',           coordinates: { lat: 23.531, lng: 91.481 }, deity: 'durga',   groups: [] },
  { id: 'manakula-vinayagar', nameHi: 'मनाकुला विनायगर',     nameEn: 'Manakula Vinayagar', cityHi: 'पुडुचेरी',   cityEn: 'Puducherry',  stateHi: 'पुडुचेरी',       stateEn: 'Puducherry',        coordinates: { lat: 11.933, lng: 79.832 }, deity: 'ganesha', groups: [] },
  { id: 'parashuram-kund',    nameHi: 'परशुराम कुंड',       nameEn: 'Parashuram Kund',    cityHi: 'तेजू',       cityEn: 'Tezu',        stateHi: 'अरुणाचल प्रदेश', stateEn: 'Arunachal Pradesh', coordinates: { lat: 27.885, lng: 96.288 }, deity: 'vishnu',  groups: [] },
  { id: 'nartiang-durga',     nameHi: 'नारतियांग दुर्गा',    nameEn: 'Nartiang Durga',     cityHi: 'नारतियांग',  cityEn: 'Nartiang',    stateHi: 'मेघालय',         stateEn: 'Meghalaya',         coordinates: { lat: 25.580, lng: 92.210 }, deity: 'durga',   groups: [] },
  { id: 'kirateshwar',        nameHi: 'किरातेश्वर महादेव',   nameEn: 'Kirateshwar Mahadev', cityHi: 'लेगशिप',    cityEn: 'Legship',     stateHi: 'सिक्किम',        stateEn: 'Sikkim',            coordinates: { lat: 27.299, lng: 88.460 }, deity: 'shiva',   groups: [] },
] as const;

export function getTempleById(id: string): TempleEntry | undefined {
  return temples.find((t) => t.id === id);
}

export function templesInGroup(group: TheerthGroup): TempleEntry[] {
  return temples.filter((t) => t.groups.includes(group));
}

export function otherFamous(): TempleEntry[] {
  return temples.filter((t) => t.groups.length === 0);
}
