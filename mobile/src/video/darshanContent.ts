import { library, type Deity } from '@/data/texts';
import { relatedReadingsForDeity } from '@/data/theerth/relatedReadings';

/** Actual shipped readers, ordered from aarti/chalisa to longer devotional
 * readings. No made-up temple-specific prayer or unavailable content cards. */
export function darshanReadingsForDeity(deity: Deity) {
  const primary = relatedReadingsForDeity(deity);
  const seen = new Set(primary.map((entry) => entry.id));
  return [...primary, ...library.filter((entry) =>
    entry.status === 'active' && !entry.hidden && entry.deities.includes(deity)
    && ['stotram', 'ashtakam', 'kavacham'].includes(entry.category) && !seen.has(entry.id),
  )].slice(0, 4);
}
