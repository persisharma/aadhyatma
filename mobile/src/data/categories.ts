import type { ContentCategory } from './texts';

export type CategoryMeta = {
  id: ContentCategory;
  nameHi: string;
  nameEn: string;
  /**
   * Short English display name for the Home launcher grid, where the label sits
   * on one line under a 3-column tile. Accessibility labels and every other
   * surface (category list titles, catalog cards) keep the full `nameEn`.
   */
  shortNameEn?: string;
  status: 'active' | 'coming';
};

export const categories: readonly CategoryMeta[] = [
  { id: 'granth', nameHi: 'ग्रन्थ', nameEn: 'Sacred Books', shortNameEn: 'Books', status: 'active' },
  { id: 'stotram', nameHi: 'स्तोत्रम्', nameEn: 'Hymns & Praise', shortNameEn: 'Hymns', status: 'active' },
  { id: 'chalisa', nameHi: 'चालीसा', nameEn: 'Chalisa', status: 'active' },
  { id: 'japam', nameHi: 'जप', nameEn: 'Japa & Mantras', shortNameEn: 'Japa', status: 'active' },
  { id: 'aarti', nameHi: 'आरती', nameEn: 'Aarti', status: 'active' },
  { id: 'theerth', nameHi: 'तीर्थ', nameEn: 'Pilgrimage', status: 'active' },
  { id: 'sanskar', nameHi: 'संस्कार', nameEn: 'Good Habits', shortNameEn: 'Habits', status: 'active' },
];
