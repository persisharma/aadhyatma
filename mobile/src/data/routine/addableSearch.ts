import { fold } from '@/ask/fold';
import { deities } from '@/data/deities';
import type { LibraryEntry } from '@/data/texts';

// Search for the Add Content list (RoutineAddItemsScreen). Matches across
// scripts and spellings via the ask-engine `fold` (pure, no registries, so it
// keeps the engine off the launch graph): "हनुमान", "Hanuman" and "hanumaan" all
// meet. The entry's tagged deity names are searched too, so "shiv" surfaces the
// Shiva stotrams and japa. Gujarati/Kannada input folds to nothing, so it falls
// back to a plain substring match on the name as displayed.

const haystacks = new Map<string, string>();

function haystack(entry: LibraryEntry): string {
  let h = haystacks.get(entry.id);
  if (h === undefined) {
    const deityNames = entry.deities.flatMap((id) => {
      const d = deities.find((m) => m.id === id);
      return d ? [d.nameHi, d.nameEn] : [];
    });
    h = [entry.nameHi, entry.nameEn, ...deityNames].map(fold).join('|');
    haystacks.set(entry.id, h);
  }
  return h;
}

export function filterAddable<T extends LibraryEntry>(
  entries: readonly T[],
  query: string,
  displayName: (entry: T) => string,
): readonly T[] {
  const raw = query.trim().toLowerCase();
  if (!raw) return entries;
  const q = fold(raw);
  return entries.filter(
    (e) => displayName(e).toLowerCase().includes(raw) || (q !== '' && haystack(e).includes(q)),
  );
}
