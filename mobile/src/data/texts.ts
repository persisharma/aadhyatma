import { hanumanChalisaTotal } from './hanumanChalisa';

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
    id: 'ramcharitmanas',
    nameHi: 'रामचरितमानस',
    nameEn: 'Ramcharitmanas',
    sub: 'Seven kāṇḍas',
    thumb: 'रा',
    status: 'coming',
  },
  {
    id: 'bhagavad-gita',
    nameHi: 'भगवद् गीता',
    nameEn: 'Bhagavad Gītā',
    sub: '18 adhyāyas',
    thumb: 'भ',
    status: 'coming',
  },
  {
    id: 'sundarkand',
    nameHi: 'सुंदरकाण्ड',
    nameEn: 'Sundarkand',
    sub: 'From Ramcharitmanas',
    thumb: 'सु',
    status: 'coming',
  },
];
