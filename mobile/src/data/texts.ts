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
  | 'sanskar';
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
  /**
   * Semver the entry's content shipped in (debut marker). Used only to seed the
   * "NEW" debut state for upgrading users; runtime detection is content-ID-set based.
   */
  addedInVersion?: string;
};

export const library: readonly LibraryEntry[] = [
  {
    id: 'hanuman-chalisa',
    nameHi: 'हनुमान चालीसा',
    nameEn: 'Hanuman Chalisa',
    sub: '40 चौपाई + 3 दोहा · अर्थ सहित',
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
    sub: '18 अध्याय · 701-श्लोक पाठ',
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
    sub: `16 अनुभाग · ${sundarkandTotal} पद`,
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
    nameHi: 'रामचरितमानस मंगलाचरण',
    nameEn: 'Ramcharitmanas Mangalacharan',
    sub: `${ramcharitmanasTotal} पद · अर्थ सहित`,
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
    sub: `3 चयनित स्तोत्र · ${durgaStotramTotal} पद`,
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
    nameHi: 'विष्णु सहस्रनाम अंश',
    nameEn: 'Vishnu Sahasranama Excerpt',
    sub: `4 अनुभाग · ${vishnuSahasranamaTotal} चयनित पद`,
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
    addedInVersion: '1.3.0',
  },
  {
    id: 'shiv-chalisa',
    nameHi: 'शिव चालीसा',
    nameEn: 'Shiv Chalisa',
    sub: '40 चौपाई + 3 दोहा · अर्थ सहित',
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
    sub: '40 चौपाई + 1 दोहा · अर्थ सहित',
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
    sub: '40 चौपाई + 3 दोहा · अर्थ सहित',
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
    addedInVersion: '1.3.0',
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
    addedInVersion: '1.3.0',
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
  {
    id: 'prabhati-shloka',
    nameHi: 'प्रभाती श्लोक',
    nameEn: 'Morning Slokas',
    sub: '४ श्लोक · अर्थ सहित',
    thumb: 'प्र',
    status: 'active',
    category: 'sanskar',
    deities: ['durga'],
    verseCount: 4,
  },
  {
    id: 'surya-namaskar',
    nameHi: 'सूर्य नमस्कार',
    nameEn: 'Surya Namaskar',
    sub: '१२ चरण · मंत्र सहित',
    thumb: 'सू',
    status: 'active',
    category: 'sanskar',
    deities: ['krishna'],
    verseCount: 13,
  },
  {
    id: 'tulsi-puja',
    nameHi: 'तुलसी पूजा',
    nameEn: 'Tulsi Puja',
    sub: '५ मंत्र · विधि सहित',
    thumb: 'तु',
    status: 'active',
    category: 'sanskar',
    deities: ['krishna'],
    verseCount: 5,
  },
  {
    id: 'bhojan-mantra',
    nameHi: 'भोजन मंत्र',
    nameEn: 'Meal Prayer',
    sub: '४ श्लोक · अर्थ सहित',
    thumb: 'भो',
    status: 'active',
    category: 'sanskar',
    deities: ['krishna'],
    verseCount: 4,
  },
  {
    id: 'gau-seva',
    nameHi: 'गौ सेवा',
    nameEn: 'Serving Cows & Birds',
    sub: '४ मंत्र · विधि सहित',
    thumb: 'गौ',
    status: 'active',
    category: 'sanskar',
    deities: ['krishna'],
    verseCount: 4,
  },
  {
    id: 'sandhya-deepam',
    nameHi: 'सन्ध्या दीपम्',
    nameEn: 'Evening Lamp',
    sub: '४ श्लोक · विधि सहित',
    thumb: 'दी',
    status: 'active',
    category: 'sanskar',
    deities: ['durga'],
    verseCount: 4,
  },
  {
    id: 'ratri-shloka',
    nameHi: 'रात्रि श्लोक',
    nameEn: 'Bedtime Slokas',
    sub: '४ श्लोक · अर्थ सहित',
    thumb: 'रा',
    status: 'active',
    category: 'sanskar',
    deities: ['rama'],
    verseCount: 4,
  },
];
