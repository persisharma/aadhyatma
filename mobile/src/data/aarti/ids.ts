/**
 * Canonical aarti sourceIds in their fixed display order. The position in this
 * array is the value used by `AartiReader`'s `aartiIndex` route param, and is
 * also the suffix in the legacy `aarti-N` sourceId form (migrated on hydrate).
 *
 * Kept apart from `index.ts` so launch-path modules (`sourceIdMigration`,
 * `entryRoutes`, `backgrounds`) can read the ids without pulling every aarti
 * payload into the static launch graph (`launchGraph.test.ts`).
 */
export const aartiIdByIndex = [
  'om-jai-jagdish',
  'hanuman-aarti',
  'jai-ganesh-deva',
  'om-jai-shiv-omkara',
  'jai-ambe-gauri',
  'aarti-kunj-bihari',
  'saraswati-aarti',
  'gayatri-aarti',
  'khatu-shyam-aarti',
  // Appended, never inserted: the index is persisted in legacy `aarti-N` ids.
  'om-jai-lakshmi-mata',
  'jay-adhya-shakti',
] as const satisfies readonly string[];

export type AartiId = (typeof aartiIdByIndex)[number];

export const aartiIndexById: Readonly<Record<AartiId, number>> = Object.freeze(
  aartiIdByIndex.reduce<Record<string, number>>((acc, id, i) => {
    acc[id] = i;
    return acc;
  }, {}) as Record<AartiId, number>
);
