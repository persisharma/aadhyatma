import { DASHA_ORDER, type DashaLord } from './kundali';

export const NAMAKSHAR_CONVENTION_VERSION = 1;

export type Syllable = { hi: string; latin: string };

export type CharanaEntry = {
  charanaIndex: number;
  nakshatraIndex: number;
  pada: 1 | 2 | 3 | 4;
  syllables: readonly Syllable[];
  thin: boolean;
};

export type NakshatraAttrs = {
  nakshatraIndex: number;
  lord: DashaLord;
  gana: 'dev' | 'manushya' | 'rakshasa';
  deityHi: string;
  deityEn: string;
};

const ROWS: readonly (readonly string[])[] = [
  ['चू|Chu', 'चे|Che', 'चो|Cho', 'ला|La'],
  ['ली|Li', 'लू|Lu', 'ले|Le', 'लो|Lo'],
  ['अ|A', 'ई|I', 'उ|U', 'ए|E'],
  ['ओ|O', 'वा|Va', 'वी|Vi', 'वू|Vu'],
  ['वे|Ve', 'वो|Vo', 'का|Ka', 'की|Ki'],
  ['कु|Ku', 'घ|Gha', 'ङ|Ang', 'छ|Chha'],
  ['के|Ke', 'को|Ko', 'हा|Ha', 'ही|Hi'],
  ['हू|Hu', 'हे|He', 'हो|Ho', 'डा|Da'],
  ['डी|Di', 'डू|Du', 'डे|De', 'डो|Do'],
  ['मा|Ma', 'मी|Mi', 'मू|Mu', 'मे|Me'],
  ['मो|Mo', 'टा|Ta', 'टी|Ti', 'टू|Tu'],
  ['टे|Te', 'टो|To', 'पा|Pa', 'पी|Pi'],
  ['पू|Pu', 'ष|Sha', 'ण|Na', 'ठ|Tha'],
  ['पे|Pe', 'पो|Po', 'रा|Ra', 'री|Ri'],
  ['रू|Ru', 'रे|Re', 'रो|Ro', 'ता|Ta'],
  ['ती|Ti', 'तू|Tu', 'ते|Te', 'तो|To'],
  ['ना|Na', 'नी|Ni', 'नू|Nu', 'ने|Ne'],
  ['नो|No', 'या|Ya', 'यी|Yi', 'यू|Yu'],
  ['ये|Ye', 'यो|Yo', 'भा|Bha', 'भी|Bhi'],
  ['भू|Bhu', 'धा|Dha', 'फा|Pha', 'ढा|Dha'],
  ['भे|Bhe', 'भो|Bho', 'जा|Ja', 'जी|Ji'],
  ['जू|Ju,खी|Khi', 'जे|Je,खू|Khu', 'जो|Jo,खे|Khe', 'घा|Gha,खो|Kho'],
  ['गा|Ga', 'गी|Gi', 'गू|Gu', 'गे|Ge'],
  ['गो|Go', 'सा|Sa', 'सी|Si', 'सू|Su'],
  ['से|Se', 'सो|So', 'दा|Da', 'दी|Di'],
  ['दू|Du', 'थ|Tha', 'झ|Jha', 'ञ|Nya'],
  ['दे|De', 'दो|Do', 'चा|Cha', 'ची|Chi'],
] as const;

const THIN_CHARANAS = new Set([22, 49, 50, 51, 101, 103]);

function parseSyllables(value: string): readonly Syllable[] {
  return value.split(',').map((pair) => {
    const [hi, latin] = pair.split('|');
    return { hi, latin };
  });
}

export const CHARANA_TABLE: readonly CharanaEntry[] = ROWS.flatMap((row, nakshatraIndex) =>
  row.map((value, padaIndex) => {
    const charanaIndex = nakshatraIndex * 4 + padaIndex;
    return {
      charanaIndex,
      nakshatraIndex,
      pada: (padaIndex + 1) as 1 | 2 | 3 | 4,
      syllables: parseSyllables(value),
      thin: THIN_CHARANAS.has(charanaIndex),
    };
  })
);

const ATTR_ROWS = [
  ['dev', 'अश्विनी कुमार', 'Ashwini Kumaras'], ['manushya', 'यम', 'Yama'],
  ['rakshasa', 'अग्नि', 'Agni'], ['manushya', 'ब्रह्मा (प्रजापति)', 'Brahma (Prajapati)'],
  ['dev', 'चन्द्र (सोम)', 'Chandra (Soma)'], ['manushya', 'रुद्र', 'Rudra'],
  ['dev', 'अदिति', 'Aditi'], ['dev', 'बृहस्पति', 'Brihaspati'],
  ['rakshasa', 'सर्प (नाग)', 'Serpents (Nagas)'], ['rakshasa', 'पितर', 'Pitris'],
  ['manushya', 'भग', 'Bhaga'], ['manushya', 'अर्यमन्', 'Aryaman'],
  ['dev', 'सविता', 'Savitar'], ['rakshasa', 'विश्वकर्मा (त्वष्टा)', 'Vishvakarma (Tvashtar)'],
  ['dev', 'वायु', 'Vayu'], ['rakshasa', 'इन्द्राग्नि', 'Indragni'],
  ['dev', 'मित्र', 'Mitra'], ['rakshasa', 'इन्द्र', 'Indra'],
  ['rakshasa', 'निरृति', 'Nirriti'], ['manushya', 'आपः (जल)', 'Apas (waters)'],
  ['manushya', 'विश्वेदेवा', 'Vishvedevas'], ['dev', 'विष्णु', 'Vishnu'],
  ['rakshasa', 'अष्ट वसु', 'Eight Vasus'], ['rakshasa', 'वरुण', 'Varuna'],
  ['manushya', 'अज एकपाद', 'Aja Ekapada'], ['manushya', 'अहिर्बुध्न्य', 'Ahirbudhnya'],
  ['dev', 'पूषा', 'Pushan'],
] as const;

export const NAKSHATRA_ATTRS: readonly NakshatraAttrs[] = ATTR_ROWS.map(
  ([gana, deityHi, deityEn], nakshatraIndex) => ({
    nakshatraIndex,
    lord: DASHA_ORDER[nakshatraIndex % DASHA_ORDER.length],
    gana,
    deityHi,
    deityEn,
  })
);

export const NAMAKSHAR_SOURCE = {
  convention: 'namakshar-v1',
  verified: false,
  referenceUrls: [] as readonly string[],
  notes: 'Draft table. Two-source editorial review is required before release.',
} as const;
