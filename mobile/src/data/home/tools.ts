/**
 * उपकरण — the fixed tool row on Home (TRD-42 §5.2).
 *
 * These eight doors were scattered before: व्रत/कुंडली/मुहूर्त were spliced into
 * the CATEGORIES grid, पूजा विधि and वास्तु only existed as a Discover card and
 * a More row, and पंचांग had no Home door at all. A user could not learn where
 * any of them lived, because the Discover carousel reshuffled on every open.
 *
 * So this registry is deliberately **static and ordered**. No shuffle, no
 * lifecycle badge, no per-user ranking: the whole point is that a tool sits in
 * the same square on every visit. Order runs daily-calendar first, then the
 * dated/occasional tools, then the two browse surfaces.
 *
 * Data only — navigation lives in `ToolsRow`, so this module stays pure and the
 * order is unit-testable without a navigator.
 *
 * There is deliberately no पंचांग tile: the Today strip two rows above already
 * opens that tab, and so does the tab bar (TRD-42 §13.1). A third door to the
 * same screen is not a tool, it is clutter.
 */
import type { CategoryIconKey } from '@/components/CategoryIcon';

export type HomeToolId =
  | 'pitru'
  | 'vrat'
  | 'muhurat'
  | 'kundali'
  | 'vidhi'
  | 'japam'
  | 'vastu'
  | 'theerth';

export type HomeTool = {
  id: HomeToolId;
  nameHi: string;
  nameEn: string;
  /** Short English label for the tile caption; falls back to `nameEn`. */
  shortNameEn?: string;
  iconKey: CategoryIconKey;
};

export const HOME_TOOLS: readonly HomeTool[] = [
  { id: 'vrat', nameHi: 'व्रत-पर्व', nameEn: 'Vrat & Parv', shortNameEn: 'Vrat', iconKey: 'vrat' },
  { id: 'muhurat', nameHi: 'मुहूर्त', nameEn: 'Muhurat', iconKey: 'muhurat' },
  { id: 'kundali', nameHi: 'कुंडली', nameEn: 'Kundali', iconKey: 'insight' },
  { id: 'vidhi', nameHi: 'पूजा विधि', nameEn: 'Puja Vidhi', shortNameEn: 'Vidhi', iconKey: 'vidhi' },
  { id: 'japam', nameHi: 'जप', nameEn: 'Japa & Mantras', shortNameEn: 'Japa', iconKey: 'japam' },
  { id: 'vastu', nameHi: 'वास्तु', nameEn: 'Vastu Disha', shortNameEn: 'Vastu', iconKey: 'vastu' },
  { id: 'theerth', nameHi: 'तीर्थ', nameEn: 'Pilgrimage', shortNameEn: 'Theerth', iconKey: 'theerth' },
  /**
   * पितृ स्मरण held a STANDING zero-state Discover card — it stayed until you
   * saved a tithi, because the Panchang ledger is a planning surface and the
   * Today strip only mentions it on the day. Deleting the carousel would have
   * left it with no Home door at all (`PitruSmaranTouchpoints` is the guard that
   * caught it), and नया is the wrong home: those cards clear on open, this one
   * must persist while the ledger is empty.
   */
  { id: 'pitru', nameHi: 'पितृ स्मरण', nameEn: 'Pitru Smaran', shortNameEn: 'Pitru', iconKey: 'calendar' },
];
