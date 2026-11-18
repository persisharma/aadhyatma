import { library, type Deity, type ContentCategory } from './texts';

/** Familiar weekday associations are suggestions, never exclusive worship rules. */
export const weekdayReadingDeities: readonly Deity[] = ['surya', 'shiva', 'hanuman', 'ganesha', 'vishnu', 'durga', 'shani'];
const forms: readonly ContentCategory[] = ['chalisa', 'aarti', 'ashtakam', 'japam'];
export function deityDayEntries(day: number) {
  const deity = weekdayReadingDeities[day];
  if (!deity) return [];
  return forms.flatMap((category) => {
    const entry = library.find((item) => item.category === category && item.status === 'active' && !item.hidden && item.deities.includes(deity));
    return entry ? [entry] : [];
  });
}
