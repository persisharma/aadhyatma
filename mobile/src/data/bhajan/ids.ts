import type { Deity } from '../texts';

/**
 * Bhajan text shelf (भजन संग्रह) — the launch-safe half of the registry.
 *
 * Kept apart from `index.ts` so launch-path modules (`entryRoutes`,
 * `backgrounds`, `searchIndex`) can read ids and groups without pulling any
 * bhajan payload into the static launch graph (`launchGraph.test.ts`).
 *
 * A row is added here only after its JSON clears RULEBOOK §11.1–§11.6 (two
 * independent published sources, verbatim lines, complete text) and RULEBOOK §34. The
 * acquisition backlog — including rows on copyright or identity hold — lives in
 * `docs/content-parity/bhajan-library.md`, never here.
 *
 * Ids are persisted in bookmarks, reading progress and routines: append only,
 * never rename or reuse one.
 */

/**
 * Groups that are not a deity: regional devotional traditions. Devotional only —
 * a folk song with no devotional subject (Kesariya Balam, Ghoomar) never ships
 * on this shelf (RULEBOOK §34.5).
 */
export type BhajanRegion = 'rajasthani' | 'lok-bhajan';

/** Where a bhajan sits on the shelf: under the deity it addresses, or a region. */
export type BhajanGroupId = Deity | BhajanRegion;

export type BhajanCatalogRow = {
  id: string;
  group: BhajanGroupId;
};

/**
 * Verified bhajans, in shelf order within each group. Empty until the first
 * texts are collated — the Bhajan tab hides the shelf's door while it is.
 */
export const bhajanCatalog: readonly BhajanCatalogRow[] = [];

export const bhajanIds: ReadonlySet<string> = new Set(bhajanCatalog.map((row) => row.id));

export function bhajanGroupOf(id: string): BhajanGroupId | undefined {
  return bhajanCatalog.find((row) => row.id === id)?.group;
}

/** Region groups follow every deity group on the shelf, in this order. */
export const BHAJAN_REGIONS: readonly { id: BhajanRegion; nameHi: string; nameEn: string }[] = [
  { id: 'rajasthani', nameHi: 'राजस्थानी भजन', nameEn: 'Rajasthani Bhajans' },
  { id: 'lok-bhajan', nameHi: 'लोक भजन', nameEn: 'Folk Bhajans' },
];
