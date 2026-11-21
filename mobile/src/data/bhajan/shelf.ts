import { deities } from '../deities';
import { library, type LibraryEntry } from '../texts';
import { BHAJAN_REGIONS, bhajanGroupOf, bhajanIds, type BhajanGroupId } from './ids';

export type BhajanShelfGroup = {
  id: BhajanGroupId;
  nameHi: string;
  nameEn: string;
  entries: LibraryEntry[];
};

/** Visible bhajans in library order — what the shelf and its door count. */
export function bhajanShelfEntries(
  source: readonly LibraryEntry[] = library,
  ids: ReadonlySet<string> = bhajanIds
): LibraryEntry[] {
  return source.filter(
    (entry) => entry.category === 'bhajan' && entry.status === 'active' && !entry.hidden && ids.has(entry.id)
  );
}

/**
 * Shelf sections: one per deity in `deities.ts` order, then the regional
 * groups in `BHAJAN_REGIONS` order. Empty groups are dropped, and an entry
 * with no catalog group is left off rather than filed under a guess.
 */
export function groupBhajanShelf(
  entries: readonly LibraryEntry[],
  groupOf: (id: string) => BhajanGroupId | undefined = bhajanGroupOf
): BhajanShelfGroup[] {
  const byGroup = new Map<BhajanGroupId, LibraryEntry[]>();
  for (const entry of entries) {
    const group = groupOf(entry.id);
    if (!group) continue;
    const list = byGroup.get(group) ?? [];
    list.push(entry);
    byGroup.set(group, list);
  }
  const ordered: { id: BhajanGroupId; nameHi: string; nameEn: string }[] = [
    ...deities.map((d) => ({ id: d.id as BhajanGroupId, nameHi: d.nameHi, nameEn: d.nameEn })),
    ...BHAJAN_REGIONS,
  ];
  return ordered
    .map((group) => ({ ...group, entries: byGroup.get(group.id) ?? [] }))
    .filter((group) => group.entries.length > 0);
}
