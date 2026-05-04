import { hanumanChalisaTotal } from './hanumanChalisa';
import { sundarkandTotal } from './sundarkand';

export type TextStatus = 'active' | 'coming';

export type LibraryEntry = {
  id: string;
  nameHi: string;
  nameEn: string;
  sub: string;
  thumb: string;
  status: TextStatus;
  verseCount?: number;
};

export const library: readonly LibraryEntry[] = [
  {
    id: 'hanuman-chalisa',
    nameHi: 'हनुमान चालीसा',
    nameEn: 'Hanuman Chalisa',
    sub: `${hanumanChalisaTotal} verses · Hindi with meaning`,
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
    sub: `${sundarkandTotal} readings · Hindi/English meaning`,
    thumb: 'सु',
    status: 'active',
    verseCount: sundarkandTotal,
  },
  {
    id: 'ramcharitmanas',
    nameHi: 'रामचरितमानस',
    nameEn: 'Ramcharitmanas',
    sub: 'Seven kāṇḍas',
    thumb: 'रा',
    status: 'coming',
  },
];
