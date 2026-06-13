import { hanumanChalisaTotal } from './hanuman-chalisa';
import { sundarkandTotal } from './sundarkand';
import { shivaStrotamTotal } from './shiva-strotam';
import { durgaStotramTotal } from './durga-stotram';
import { ganeshStotramTotal } from './ganesh-stotram';
import { vishnuSahasranamaTotal } from './vishnu-sahasranama';
import { shivChalisaCounts } from './shiv-chalisa';
import { durgaChalisaCounts } from './durga-chalisa';
import { ganeshChalisaCounts } from './ganesh-chalisa';
import { hanumanAshtakTotal } from './hanuman-ashtak';
import { bajrangBaanTotal } from './bajrang-baan';
import { ramStutiTotal } from './ram-stuti';
import { krishnaStotramTotal } from './krishna-stotram';
import { ramcharitmanasTotal } from './ramcharitmanas';
import { aartiCollection } from './aarti';
import { japamMantras } from './japam';

export type TextStatus = 'active' | 'coming';
export type ContentCategory =
  | 'granth'
  | 'stotram'
  | 'chalisa'
  | 'japam'
  | 'aarti'
  | 'theerth';
export type Deity = 'rama' | 'krishna' | 'vishnu' | 'shiva' | 'hanuman' | 'durga' | 'ganesha' | 'savitr';

export type LibraryEntry = {
  id: string;
  nameHi: string;
  nameEn: string;
  sub: string;
  thumb: string;
  status: TextStatus;
  category: ContentCategory;
  deities: Deity[];
  verseCount?: number;
  /** When true, HomeScreen omits this entry from the library list. */
  hidden?: boolean;
};

export const library: readonly LibraryEntry[] = [
  {
    id: 'hanuman-chalisa',
    nameHi: 'हनुमान चालीसा',
    nameEn: 'Hanuman Chalisa',
    sub: `${hanumanChalisaTotal} चौपाई · अर्थ सहित`,
    thumb: 'ह',
    status: 'active',
    category: 'chalisa',
    deities: ['hanuman', 'rama'],
    verseCount: hanumanChalisaTotal,
  },
  {
    id: 'bhagavad-gita',
    nameHi: 'भगवद् गीता',
    nameEn: 'Bhagavad Gītā',
    sub: '18 अध्याय · 701 श्लोक',
    thumb: 'भ',
    status: 'active',
    category: 'granth',
    deities: ['krishna'],
    verseCount: 701,
  },
  {
    id: 'sundarkand',
    nameHi: 'सुंदरकाण्ड',
    nameEn: 'Sundarkand',
    sub: `16 सर्ग · ${sundarkandTotal} पद`,
    thumb: 'सु',
    status: 'active',
    category: 'granth',
    deities: ['hanuman', 'rama'],
    verseCount: sundarkandTotal,
  },
  {
    id: 'shiva-strotam',
    nameHi: 'शिव स्तोत्रम्',
    nameEn: 'Shiva Stotram',
    sub: `4 स्तोत्र · अर्थ सहित`,
    thumb: 'श',
    status: 'active',
    category: 'stotram',
    deities: ['shiva'],
    verseCount: shivaStrotamTotal,
  },
  ...japamMantras.map<LibraryEntry>((m) => ({
    id: m.id,
    nameHi: m.nameHi,
    nameEn: m.nameEn,
    sub: m.sub,
    thumb: m.thumb,
    status: 'active',
    category: 'japam',
    deities: m.deities,
  })),
  {
    id: 'ramcharitmanas',
    nameHi: 'रामचरितमानस',
    nameEn: 'Ramcharitmanas',
    sub: `१ काण्ड · ${ramcharitmanasTotal} पद`,
    thumb: 'रा',
    status: 'active',
    category: 'granth',
    deities: ['rama'],
    verseCount: ramcharitmanasTotal,
  },
  {
    id: 'durga-stotram',
    nameHi: 'दुर्गा स्तोत्रम्',
    nameEn: 'Durga Stotram',
    sub: `3 स्तोत्र · ${durgaStotramTotal} श्लोक`,
    thumb: 'दु',
    status: 'active',
    category: 'stotram',
    deities: ['durga'],
    verseCount: durgaStotramTotal,
  },
  {
    id: 'ganesh-stotram',
    nameHi: 'गणेश स्तोत्रम्',
    nameEn: 'Ganesh Stotram',
    sub: `3 स्तोत्र · ${ganeshStotramTotal} श्लोक`,
    thumb: 'ग',
    status: 'active',
    category: 'stotram',
    deities: ['ganesha'],
    verseCount: ganeshStotramTotal,
  },
  {
    id: 'vishnu-sahasranama',
    nameHi: 'विष्णु सहस्रनाम',
    nameEn: 'Vishnu Sahasranama',
    sub: `4 अध्याय · ${vishnuSahasranamaTotal} श्लोक`,
    thumb: 'वि',
    status: 'active',
    category: 'stotram',
    deities: ['krishna', 'rama'],
    verseCount: vishnuSahasranamaTotal,
  },
  {
    id: 'krishna-stotram',
    nameHi: 'कृष्ण स्तोत्रम्',
    nameEn: 'Krishna Stotram',
    sub: `${krishnaStotramTotal} श्लोक · अर्थ सहित`,
    thumb: 'कृ',
    status: 'active',
    category: 'stotram',
    deities: ['krishna'],
    verseCount: krishnaStotramTotal,
  },
  {
    id: 'shiv-chalisa',
    nameHi: 'शिव चालीसा',
    nameEn: 'Shiv Chalisa',
    sub: `${shivChalisaCounts.totalVerses} चौपाई · अर्थ सहित`,
    thumb: 'शि',
    status: 'active',
    category: 'chalisa',
    deities: ['shiva'],
    verseCount: shivChalisaCounts.totalVerses,
  },
  {
    id: 'durga-chalisa',
    nameHi: 'दुर्गा चालीसा',
    nameEn: 'Durga Chalisa',
    sub: `${durgaChalisaCounts.totalVerses} चौपाई · अर्थ सहित`,
    thumb: 'दु',
    status: 'active',
    category: 'chalisa',
    deities: ['durga'],
    verseCount: durgaChalisaCounts.totalVerses,
  },
  {
    id: 'ganesh-chalisa',
    nameHi: 'गणेश चालीसा',
    nameEn: 'Ganesh Chalisa',
    sub: `${ganeshChalisaCounts.totalVerses} चौपाई · अर्थ सहित`,
    thumb: 'गण',
    status: 'active',
    category: 'chalisa',
    deities: ['ganesha'],
    verseCount: ganeshChalisaCounts.totalVerses,
  },
  {
    id: 'hanuman-ashtak',
    nameHi: 'संकटमोचन हनुमानाष्टक',
    nameEn: 'Sankat Mochan Hanuman Ashtak',
    sub: `${hanumanAshtakTotal} श्लोक · अर्थ सहित`,
    thumb: 'ह',
    status: 'active',
    category: 'stotram',
    deities: ['hanuman'],
    verseCount: hanumanAshtakTotal,
  },
  {
    id: 'bajrang-baan',
    nameHi: 'बजरंग बाण',
    nameEn: 'Bajrang Baan',
    sub: `${bajrangBaanTotal} छन्द · अर्थ सहित`,
    thumb: 'ब',
    status: 'active',
    category: 'stotram',
    deities: ['hanuman'],
    verseCount: bajrangBaanTotal,
  },
  {
    id: 'ram-stuti',
    nameHi: 'राम स्तुति',
    nameEn: 'Ram Stuti',
    sub: `${ramStutiTotal} पद · अर्थ सहित`,
    thumb: 'रा',
    status: 'active',
    category: 'stotram',
    deities: ['rama'],
    verseCount: ramStutiTotal,
  },
  {
    id: 'om-jai-jagdish',
    nameHi: 'ॐ जय जगदीश हरे',
    nameEn: 'Om Jai Jagdish Hare',
    sub: '9 पद · व्याख्या सहित',
    thumb: 'ॐ',
    status: 'active',
    category: 'aarti',
    deities: ['vishnu'],
    verseCount: 9,
  },
  {
    id: 'hanuman-aarti',
    nameHi: 'हनुमान जी की आरती',
    nameEn: 'Hanuman Ji Ki Aarti',
    sub: '14 पद · व्याख्या सहित',
    thumb: 'ह',
    status: 'active',
    category: 'aarti',
    deities: ['hanuman'],
    verseCount: 14,
  },
  {
    id: 'jai-ganesh-deva',
    nameHi: 'जय गणेश देवा',
    nameEn: 'Jai Ganesh Deva',
    sub: '7 पद · व्याख्या सहित',
    thumb: 'ग',
    status: 'active',
    category: 'aarti',
    deities: ['ganesha'],
    verseCount: 7,
  },
  {
    id: 'om-jai-shiv-omkara',
    nameHi: 'ॐ जय शिव ओमकारा',
    nameEn: 'Om Jai Shiv Omkara',
    sub: '9 पद · व्याख्या सहित',
    thumb: 'ॐ',
    status: 'active',
    category: 'aarti',
    deities: ['shiva'],
    verseCount: 9,
  },
  {
    id: 'jai-ambe-gauri',
    nameHi: 'जय अम्बे गौरी',
    nameEn: 'Jai Ambe Gauri',
    sub: '14 पद · व्याख्या सहित',
    thumb: 'जय',
    status: 'active',
    category: 'aarti',
    deities: ['durga'],
    verseCount: 14,
  },
  {
    id: 'aarti-kunj-bihari',
    nameHi: 'आरती कुंजबिहारी की',
    nameEn: 'Aarti Kunj Bihari Ki',
    sub: '6 पद · व्याख्या सहित',
    thumb: 'कृ',
    status: 'active',
    category: 'aarti',
    deities: ['krishna'],
    verseCount: 6,
  },
  // ─────────── Theerth (तीर्थ) — pilgrimage map archetype ───────────
  // One LibraryEntry per yatra; each opens TheerthMapScreen with that
  // group's pins pre-filtered. Per RULEBOOK §11, content is verified
  // sourced prose per temple (PRD-07 Phase 4). v1 shows pins + a
  // pending-verification placeholder on the detail screen.
  {
    id: 'dvadasha-jyotirlinga',
    nameHi: 'द्वादश ज्योतिर्लिङ्ग',
    nameEn: 'Dvādaśa Jyotirlinga',
    sub: '12 ज्योतिर्लिङ्ग · मानचित्र दर्शन',
    thumb: 'ज्यो',
    status: 'active',
    category: 'theerth',
    deities: ['shiva'],
  },
  {
    id: 'char-dham',
    nameHi: 'चार धाम',
    nameEn: 'Char Dham',
    sub: '4 धाम · मानचित्र दर्शन',
    thumb: 'चा',
    status: 'active',
    category: 'theerth',
    deities: ['vishnu', 'krishna', 'shiva'],
  },
  {
    id: 'chota-char-dham',
    nameHi: 'छोटा चार धाम',
    nameEn: 'Chota Char Dham',
    sub: '4 धाम · उत्तराखंड',
    thumb: 'छो',
    status: 'active',
    category: 'theerth',
    deities: ['shiva', 'vishnu', 'durga'],
  },
  {
    id: 'shakti-peeth',
    nameHi: 'शक्ति पीठ',
    nameEn: 'Shakti Peeth',
    sub: '6 शक्ति पीठ · देवी दर्शन',
    thumb: 'श',
    status: 'active',
    category: 'theerth',
    deities: ['durga'],
  },
  {
    id: 'famous-theerth',
    nameHi: 'प्रसिद्ध तीर्थ',
    nameEn: 'Famous Theerths',
    sub: 'सम्पूर्ण मानचित्र · 29 तीर्थ',
    thumb: 'प्र',
    status: 'active',
    category: 'theerth',
    deities: ['shiva', 'vishnu', 'krishna', 'durga', 'savitr'],
  },
];
