import type { ContentCategory } from './texts';

export type CategoryMeta = {
  id: ContentCategory;
  nameHi: string;
  nameEn: string;
  status: 'active' | 'coming';
};

export const categories: readonly CategoryMeta[] = [
  { id: 'granth', nameHi: 'ग्रन्थ', nameEn: 'Sacred Books', status: 'active' },
  { id: 'stotram', nameHi: 'स्तोत्रम्', nameEn: 'Hymns & Praise', status: 'active' },
  { id: 'chalisa', nameHi: 'चालीसा', nameEn: 'Chalisa', status: 'active' },
  { id: 'aarti', nameHi: 'आरती', nameEn: 'Aarti', status: 'coming' },
  { id: 'bhajan', nameHi: 'भजन', nameEn: 'Bhajan', status: 'coming' },
  { id: 'veda', nameHi: 'वेद', nameEn: 'Veda', status: 'coming' },
];
