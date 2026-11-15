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
  /**
   * Where the category's listing lives. Default `'home'`: a Home launcher tile.
   * `'bhajan-tab'`: the listing is the Bhajan tab's text shelf (design.md §34.1),
   * so HomeScreen leaves it off the grid; every lookup-by-id consumer (deity
   * detail, routine chips, share hashtags) still treats it as a category.
   */
  placement?: 'home' | 'bhajan-tab';
};

// Array order = Home launcher rank: usefulness + app USP first. Daily-recite
// forms lead (Chalisa/Aarti/Stotram), then the flagship read + interactive-USP
// tools (Granth/Japa), then habit/browse surfaces, then the thin new PRD-A
// parity forms (2–4 texts each) which trail — their NEW badges handle discovery.
// The Home grid additionally interleaves non-content tiles — व्रत + कुंडली after
// जप, देवता + उद्देश्य after तीर्थ — and appends a नित्य साधना (RoutineToday) tile
// last so the grid closes on a full 3-wide row; see HomeScreen. Every other
// consumer looks a category up by id, so this order
// only drives display (order-independent everywhere else).
export const categories: readonly CategoryMeta[] = [
  { id: 'chalisa', nameHi: 'चालीसा', nameEn: 'Chalisa', status: 'active' },
  { id: 'aarti', nameHi: 'आरती', nameEn: 'Aarti', status: 'active' },
  { id: 'stotram', nameHi: 'स्तोत्रम्', nameEn: 'Hymns & Praise', shortNameEn: 'Hymns', status: 'active' },
  { id: 'granth', nameHi: 'ग्रन्थ', nameEn: 'Sacred Books', shortNameEn: 'Books', status: 'active' },
  { id: 'japam', nameHi: 'जप', nameEn: 'JapMala', status: 'active' },
  { id: 'sanskar', nameHi: 'संस्कार', nameEn: 'Good Habits', shortNameEn: 'Habits', status: 'active' },
  { id: 'theerth', nameHi: 'तीर्थ', nameEn: 'Pilgrimage', status: 'active' },
  // PRD-A (Content Breadth Engine) — new textual forms, ranked last (thin/parity;
  // NEW badges surface them). All render through multi-instance readers.
  // Kavacham — protective "armour" hymns; active with Rama Raksha Stotra (38 shlokas).
  { id: 'kavacham', nameHi: 'कवच', nameEn: 'Kavacham', shortNameEn: 'Kavach', status: 'active' },
  // Ashtakam — eight-verse hymns; active with Lingashtakam.
  { id: 'ashtakam', nameHi: 'अष्टकम्', nameEn: 'Ashtakam', status: 'active' },
  // Suktam — Vedic/Puranic hymns (सूक्त); active with Devi Suktam (Tantrokta).
  { id: 'suktam', nameHi: 'सूक्तम्', nameEn: 'Suktam', status: 'active' },
  // Bhajan lyrics with meaning — reached from the Bhajan tab, never the Home
  // grid (placement), so the grid stays 15 (5×3) + दान-पुण्य.
  { id: 'bhajan', nameHi: 'भजन', nameEn: 'Bhajans', status: 'active', placement: 'bhajan-tab' },
  // NOTE: स्तुति (Stuti) is intentionally NOT a category. Its texts (Krishna
  // Stuti, Durga Stuti) are filed under `stotram` — स्तुति ≈ स्तोत्रम् to users,
  // and Ram Stuti already lived there. They still render via the multi-instance
  // StutiReader (routed by id). With the interleaved + नित्य साधना tiles the Home
// grid is 15 (5×3).
];
