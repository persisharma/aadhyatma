import { hanumanChalisaTotal } from './hanuman-chalisa';
import { sundarkandCounts, sundarkandTotal } from './sundarkand';
import { shivaStrotamTotal } from './shiva-strotam';

export type TextStatus = 'active' | 'coming';

export type LibraryEntry = {
  id: string;
  nameHi: string;
  nameEn: string;
  sub: string;
  thumb: string;
  status: TextStatus;
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
    verseCount: hanumanChalisaTotal,
  },
  {
    id: 'bhagavad-gita',
    nameHi: 'भगवद् गीता',
    nameEn: 'Bhagavad Gītā',
    sub: '18 अध्याय · 701 श्लोक',
    thumb: 'भ',
    status: 'active',
    verseCount: 701,
  },
  {
    id: 'sundarkand',
    nameHi: 'सुंदरकाण्ड',
    nameEn: 'Sundarkand',
    sub: `${sundarkandCounts.dohas} दोहे · अर्थ सहित`,
    thumb: 'सु',
    status: 'active',
    verseCount: sundarkandTotal,
  },
  {
    id: 'shiva-strotam',
    nameHi: 'शिव स्तोत्रम्',
    nameEn: 'Shiva Stotram',
    sub: `2 स्तोत्र · अर्थ सहित`,
    thumb: 'श',
    status: 'active',
    verseCount: shivaStrotamTotal,
  },
  {
    id: 'ramcharitmanas',
    nameHi: 'रामचरितमानस',
    nameEn: 'Ramcharitmanas',
    sub: 'Seven kāṇḍas',
    thumb: 'रा',
    status: 'coming',
    hidden: true,
  },
];
