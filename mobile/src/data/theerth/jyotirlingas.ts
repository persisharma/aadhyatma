import type { Deity } from '@/data/texts';

/**
 * 12 Jyotirlinga reference data — coordinates + names only.
 *
 * Origin stories and significance prose are intentionally absent here.
 * Per RULEBOOK §10.3, those must be sourced verbatim from authoritative
 * published editions (Shiva Purāṇa via Gita Press, temple-trust sites,
 * ASI listings) and cited per §10.1 / §10.2. The detail screen renders
 * a "content pending" placeholder until that sourcing sprint lands.
 *
 * Coordinates are approximate (~10 m precision) and used only for pin
 * placement on the stylised India map.
 */
export type JyotirlingaPlaceholder = {
  id: string;
  nameHi: string;
  nameEn: string;
  cityHi: string;
  cityEn: string;
  stateHi: string;
  stateEn: string;
  coordinates: { lat: number; lng: number };
  deity: Deity;
};

export const jyotirlingas: readonly JyotirlingaPlaceholder[] = [
  {
    id: 'somnath',
    nameHi: 'सोमनाथ',
    nameEn: 'Somnath',
    cityHi: 'वेरावल',
    cityEn: 'Veraval',
    stateHi: 'गुजरात',
    stateEn: 'Gujarat',
    coordinates: { lat: 20.888, lng: 70.402 },
    deity: 'shiva',
  },
  {
    id: 'mallikarjuna',
    nameHi: 'मल्लिकार्जुन',
    nameEn: 'Mallikarjuna',
    cityHi: 'श्रीशैलम',
    cityEn: 'Srisailam',
    stateHi: 'आंध्र प्रदेश',
    stateEn: 'Andhra Pradesh',
    coordinates: { lat: 16.074, lng: 78.869 },
    deity: 'shiva',
  },
  {
    id: 'mahakaleshwar',
    nameHi: 'महाकालेश्वर',
    nameEn: 'Mahakaleshwar',
    cityHi: 'उज्जैन',
    cityEn: 'Ujjain',
    stateHi: 'मध्य प्रदेश',
    stateEn: 'Madhya Pradesh',
    coordinates: { lat: 23.183, lng: 75.768 },
    deity: 'shiva',
  },
  {
    id: 'omkareshwar',
    nameHi: 'ओंकारेश्वर',
    nameEn: 'Omkareshwar',
    cityHi: 'खंडवा',
    cityEn: 'Khandwa',
    stateHi: 'मध्य प्रदेश',
    stateEn: 'Madhya Pradesh',
    coordinates: { lat: 22.243, lng: 76.150 },
    deity: 'shiva',
  },
  {
    id: 'kedarnath',
    nameHi: 'केदारनाथ',
    nameEn: 'Kedarnath',
    cityHi: 'रुद्रप्रयाग',
    cityEn: 'Rudraprayag',
    stateHi: 'उत्तराखंड',
    stateEn: 'Uttarakhand',
    coordinates: { lat: 30.735, lng: 79.067 },
    deity: 'shiva',
  },
  {
    id: 'bhimashankar',
    nameHi: 'भीमाशंकर',
    nameEn: 'Bhimashankar',
    cityHi: 'पुणे',
    cityEn: 'Pune',
    stateHi: 'महाराष्ट्र',
    stateEn: 'Maharashtra',
    coordinates: { lat: 19.072, lng: 73.536 },
    deity: 'shiva',
  },
  {
    id: 'kashi-vishwanath',
    nameHi: 'काशी विश्वनाथ',
    nameEn: 'Kashi Vishwanath',
    cityHi: 'वाराणसी',
    cityEn: 'Varanasi',
    stateHi: 'उत्तर प्रदेश',
    stateEn: 'Uttar Pradesh',
    coordinates: { lat: 25.311, lng: 83.011 },
    deity: 'shiva',
  },
  {
    id: 'trimbakeshwar',
    nameHi: 'त्र्यंबकेश्वर',
    nameEn: 'Trimbakeshwar',
    cityHi: 'नाशिक',
    cityEn: 'Nashik',
    stateHi: 'महाराष्ट्र',
    stateEn: 'Maharashtra',
    coordinates: { lat: 19.933, lng: 73.531 },
    deity: 'shiva',
  },
  {
    id: 'vaidyanath',
    nameHi: 'वैद्यनाथ',
    nameEn: 'Vaidyanath',
    cityHi: 'देवघर',
    cityEn: 'Deoghar',
    stateHi: 'झारखंड',
    stateEn: 'Jharkhand',
    coordinates: { lat: 24.492, lng: 86.700 },
    deity: 'shiva',
  },
  {
    id: 'nageshwar',
    nameHi: 'नागेश्वर',
    nameEn: 'Nageshwar',
    cityHi: 'द्वारका',
    cityEn: 'Dwarka',
    stateHi: 'गुजरात',
    stateEn: 'Gujarat',
    coordinates: { lat: 22.337, lng: 69.081 },
    deity: 'shiva',
  },
  {
    id: 'rameshwaram',
    nameHi: 'रामेश्वरम्',
    nameEn: 'Rameshwaram',
    cityHi: 'रामेश्वरम्',
    cityEn: 'Rameshwaram',
    stateHi: 'तमिलनाडु',
    stateEn: 'Tamil Nadu',
    coordinates: { lat: 9.288, lng: 79.317 },
    deity: 'shiva',
  },
  {
    id: 'grishneshwar',
    nameHi: 'घृष्णेश्वर',
    nameEn: 'Grishneshwar',
    cityHi: 'औरंगाबाद',
    cityEn: 'Aurangabad',
    stateHi: 'महाराष्ट्र',
    stateEn: 'Maharashtra',
    coordinates: { lat: 20.027, lng: 75.180 },
    deity: 'shiva',
  },
] as const;

export function getJyotirlingaById(id: string): JyotirlingaPlaceholder | undefined {
  return jyotirlingas.find((j) => j.id === id);
}
