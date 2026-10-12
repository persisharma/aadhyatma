import { library, type ContentCategory, type Deity, type LibraryEntry } from '@/data/texts';

/**
 * The library categories a temple's detail screen surfaces as "आरती व चालीसा"
 * (design.md §27 item 10). These two are what a visitor expects at the shrine
 * itself; stotrams, kavach, ashtakam etc. stay on the deity hub (DeityDetail).
 * Array order is display order.
 */
export const THEERTH_READING_CATEGORIES: readonly ContentCategory[] = ['chalisa', 'aarti'];

/**
 * Every shipped chalisa and aarti for a temple's presiding deity, chalisas
 * first, and within a category the texts whose *primary* deity is this one
 * ahead of secondary tags (Hanuman Chalisa is tagged `rama` too, but a Rama
 * temple should lead with Ram Chalisa). Only `active`, non-hidden entries —
 * a temple never advertises a reading that cannot open.
 *
 * Derived purely from `temple.deity` ∩ `LibraryEntry.deities`: there is no
 * per-temple text list, so a temple whose deity has no shipped chalisa/aarti
 * (Konark → `surya` today) gets an empty array and the screen hides the block.
 * Pure and cheap (one pass over `library`), so it is called at render time
 * from the lazy detail route — never from the launch path.
 */
export function relatedReadingsForDeity(deity: Deity): LibraryEntry[] {
  const out: LibraryEntry[] = [];
  for (const category of THEERTH_READING_CATEGORIES) {
    const primary: LibraryEntry[] = [];
    const secondary: LibraryEntry[] = [];
    for (const entry of library) {
      if (entry.category !== category) continue;
      if (entry.hidden || entry.status !== 'active') continue;
      if (!entry.deities.includes(deity)) continue;
      (entry.deities[0] === deity ? primary : secondary).push(entry);
    }
    out.push(...primary, ...secondary);
  }
  return out;
}
