import type { ObservanceRule, Paksha } from './types';

type ObservanceSeed = Omit<
  ObservanceRule,
  'category' | 'deityHi' | 'deityEn' | 'shortDescriptionHi' | 'shortDescriptionEn'
> &
  Partial<Pick<ObservanceRule, 'category' | 'deityHi' | 'deityEn' | 'shortDescriptionHi' | 'shortDescriptionEn'>>;

function festival(seed: ObservanceSeed): ObservanceRule {
  return {
    category: 'festival',
    deityHi: 'पारंपरिक पर्व',
    deityEn: 'Traditional observance',
    shortDescriptionHi: `${seed.nameHi} के दिन विशेष पूजा, पाठ और स्मरण का महत्व माना जाता है।`,
    shortDescriptionEn: `${seed.nameEn} is observed with special puja, reading, and remembrance.`,
    ...seed,
  };
}

export const FESTIVAL_RULES: ObservanceRule[] = [
  festival({ id: 'makar-sankranti', nameHi: 'मकर संक्रांति', nameEn: 'Makar Sankranti', type: 'solar', lunarMonth: 10, paksha: 'krishna', tithi: 1, solarLongitude: 270, marker: 'star', deityHi: 'सूर्य देव', deityEn: 'Surya Deva' }),
  festival({ id: 'vasant-panchami', nameHi: 'वसंत पंचमी', nameEn: 'Vasant Panchami', lunarMonth: 11, paksha: 'shukla', tithi: 5, marker: 'star', deityHi: 'मां सरस्वती', deityEn: 'Maa Saraswati' }),
  festival({ id: 'maha-shivaratri', nameHi: 'महा शिवरात्रि', nameEn: 'Maha Shivaratri', lunarMonth: 11, paksha: 'krishna', tithi: 14, marker: 'star', deityHi: 'भगवान शिव', deityEn: 'Lord Shiva', linkSectionId: 'shiv-chalisa' }),
  festival({ id: 'holi', nameHi: 'होली', nameEn: 'Holi', lunarMonth: 12, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna' }),
  festival({ id: 'ram-navami', nameHi: 'राम नवमी', nameEn: 'Ram Navami', lunarMonth: 1, paksha: 'shukla', tithi: 9, marker: 'star', deityHi: 'श्री राम', deityEn: 'Shri Ram', linkSectionId: 'ram-stuti' }),
  festival({ id: 'hanuman-jayanti', nameHi: 'हनुमान जयंती', nameEn: 'Hanuman Jayanti', lunarMonth: 1, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'हनुमान जी', deityEn: 'Hanuman Ji', linkSectionId: 'hanuman-chalisa' }),
  festival({ id: 'akshaya-tritiya', nameHi: 'अक्षय तृतीया', nameEn: 'Akshaya Tritiya', lunarMonth: 2, paksha: 'shukla', tithi: 3, marker: 'star', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama' }),
  festival({ id: 'guru-purnima', nameHi: 'गुरु पूर्णिमा', nameEn: 'Guru Purnima', lunarMonth: 4, paksha: 'shukla', tithi: 15, marker: 'star', deityHi: 'गुरु परंपरा', deityEn: 'Guru Parampara' }),
  festival({ id: 'raksha-bandhan', nameHi: 'रक्षा बंधन', nameEn: 'Raksha Bandhan', lunarMonth: 5, paksha: 'shukla', tithi: 15, marker: 'star' }),
  festival({ id: 'janmashtami', nameHi: 'जन्माष्टमी', nameEn: 'Janmashtami', lunarMonth: 5, paksha: 'krishna', tithi: 8, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna', linkSectionId: 'bhagavad-gita' }),
  festival({ id: 'ganesh-chaturthi', nameHi: 'गणेश चतुर्थी', nameEn: 'Ganesh Chaturthi', lunarMonth: 6, paksha: 'shukla', tithi: 4, marker: 'star', deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh', linkSectionId: 'ganesh-chalisa' }),
  festival({ id: 'navratri-start', nameHi: 'नवरात्रि प्रारंभ', nameEn: 'Navratri Begins', lunarMonth: 7, paksha: 'shukla', tithi: 1, marker: 'star', deityHi: 'मां दुर्गा', deityEn: 'Maa Durga', linkSectionId: 'durga-stotram' }),
  festival({ id: 'dussehra', nameHi: 'दशहरा', nameEn: 'Dussehra', lunarMonth: 7, paksha: 'shukla', tithi: 10, marker: 'star', deityHi: 'श्री राम', deityEn: 'Shri Ram', linkSectionId: 'ram-stuti' }),
  festival({ id: 'karwa-chauth', nameHi: 'करवा चौथ', nameEn: 'Karwa Chauth', lunarMonth: 8, paksha: 'krishna', tithi: 4, marker: 'star', category: 'vrat', deityHi: 'मां गौरी', deityEn: 'Maa Gauri' }),
  festival({ id: 'diwali', nameHi: 'दीपावली', nameEn: 'Diwali', lunarMonth: 8, paksha: 'krishna', tithi: 15, marker: 'star', deityHi: 'मां लक्ष्मी', deityEn: 'Maa Lakshmi' }),
  festival({ id: 'govardhan-puja', nameHi: 'गोवर्धन पूजा', nameEn: 'Govardhan Puja', lunarMonth: 8, paksha: 'shukla', tithi: 1, marker: 'star', deityHi: 'श्री कृष्ण', deityEn: 'Shri Krishna' }),
  festival({ id: 'bhai-dooj', nameHi: 'भाई दूज', nameEn: 'Bhai Dooj', lunarMonth: 8, paksha: 'shukla', tithi: 2, marker: 'star' }),
  festival({ id: 'dev-uthani-ekadashi', nameHi: 'देव उठनी एकादशी', nameEn: 'Dev Uthani Ekadashi', lunarMonth: 8, paksha: 'shukla', tithi: 11, marker: 'dot', category: 'vrat', deityHi: 'श्री विष्णु', deityEn: 'Shri Vishnu', linkSectionId: 'vishnu-sahasranama' }),
];

export const EKADASHI_NAMES: { lunarMonth: number; paksha: Paksha; nameHi: string; nameEn: string }[] = [
  { lunarMonth: 1, paksha: 'shukla', nameHi: 'कामदा एकादशी', nameEn: 'Kamada Ekadashi' },
  { lunarMonth: 1, paksha: 'krishna', nameHi: 'वरूथिनी एकादशी', nameEn: 'Varuthini Ekadashi' },
  { lunarMonth: 2, paksha: 'shukla', nameHi: 'मोहिनी एकादशी', nameEn: 'Mohini Ekadashi' },
  { lunarMonth: 2, paksha: 'krishna', nameHi: 'अपरा एकादशी', nameEn: 'Apara Ekadashi' },
  { lunarMonth: 3, paksha: 'shukla', nameHi: 'निर्जला एकादशी', nameEn: 'Nirjala Ekadashi' },
  { lunarMonth: 3, paksha: 'krishna', nameHi: 'योगिनी एकादशी', nameEn: 'Yogini Ekadashi' },
  { lunarMonth: 4, paksha: 'shukla', nameHi: 'देवशयनी एकादशी', nameEn: 'Devshayani Ekadashi' },
  { lunarMonth: 4, paksha: 'krishna', nameHi: 'कामिका एकादशी', nameEn: 'Kamika Ekadashi' },
  { lunarMonth: 5, paksha: 'shukla', nameHi: 'पुत्रदा एकादशी', nameEn: 'Putrada Ekadashi' },
  { lunarMonth: 5, paksha: 'krishna', nameHi: 'अजा एकादशी', nameEn: 'Aja Ekadashi' },
  { lunarMonth: 6, paksha: 'shukla', nameHi: 'परिवर्तिनी एकादशी', nameEn: 'Parivartini Ekadashi' },
  { lunarMonth: 6, paksha: 'krishna', nameHi: 'इन्दिरा एकादशी', nameEn: 'Indira Ekadashi' },
  { lunarMonth: 7, paksha: 'shukla', nameHi: 'पापांकुशा एकादशी', nameEn: 'Papankusha Ekadashi' },
  { lunarMonth: 7, paksha: 'krishna', nameHi: 'रमा एकादशी', nameEn: 'Rama Ekadashi' },
  { lunarMonth: 8, paksha: 'shukla', nameHi: 'देव उठनी एकादशी', nameEn: 'Dev Uthani Ekadashi' },
  { lunarMonth: 8, paksha: 'krishna', nameHi: 'उत्पन्ना एकादशी', nameEn: 'Utpanna Ekadashi' },
  { lunarMonth: 9, paksha: 'shukla', nameHi: 'मोक्षदा एकादशी', nameEn: 'Mokshada Ekadashi' },
  { lunarMonth: 9, paksha: 'krishna', nameHi: 'सफला एकादशी', nameEn: 'Saphala Ekadashi' },
  { lunarMonth: 10, paksha: 'shukla', nameHi: 'पुत्रदा एकादशी', nameEn: 'Putrada Ekadashi' },
  { lunarMonth: 10, paksha: 'krishna', nameHi: 'षटतिला एकादशी', nameEn: 'Shattila Ekadashi' },
  { lunarMonth: 11, paksha: 'shukla', nameHi: 'जया एकादशी', nameEn: 'Jaya Ekadashi' },
  { lunarMonth: 11, paksha: 'krishna', nameHi: 'विजया एकादशी', nameEn: 'Vijaya Ekadashi' },
  { lunarMonth: 12, paksha: 'shukla', nameHi: 'आमलकी एकादशी', nameEn: 'Amalaki Ekadashi' },
  { lunarMonth: 12, paksha: 'krishna', nameHi: 'पापमोचनी एकादशी', nameEn: 'Papmochani Ekadashi' },
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const EKADASHI_RULES: ObservanceRule[] = EKADASHI_NAMES.map((item) => ({
  id: slugify(item.nameEn),
  nameHi: item.nameHi,
  nameEn: item.nameEn,
  category: 'vrat',
  lunarMonth: item.lunarMonth,
  paksha: item.paksha,
  tithi: 11,
  marker: 'halfmoon',
  deityHi: 'श्री विष्णु',
  deityEn: 'Shri Vishnu',
  shortDescriptionHi: `${item.nameHi} विष्णु उपासना और एकादशी व्रत का दिन है।`,
  shortDescriptionEn: `${item.nameEn} is observed for Vishnu worship and Ekadashi vrat.`,
  linkSectionId: 'vishnu-sahasranama',
}));

export const OBSERVANCE_RULES: ObservanceRule[] = [
  ...FESTIVAL_RULES,
  ...EKADASHI_RULES,
];
