import { hanumanChalisaTotal } from './hanuman-chalisa';
import { sundarkandTotal } from './sundarkand';
import { shivaStrotamTotal } from './shiva-strotam';

export type TextStatus = 'active' | 'coming';
export type ContentCategory = 'granth' | 'stotram' | 'chalisa' | 'aarti' | 'bhajan' | 'veda';
export type Deity = 'rama' | 'krishna' | 'shiva' | 'hanuman' | 'durga' | 'ganesha';

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
  {
    id: 'ramcharitmanas',
    nameHi: 'रामचरितमानस',
    nameEn: 'Ramcharitmanas',
    sub: 'Seven kāṇḍas',
    thumb: 'रा',
    status: 'coming',
    category: 'granth',
    deities: ['rama'],
    hidden: true,
  },
];
