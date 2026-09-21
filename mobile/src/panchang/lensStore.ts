import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getLensSnapshot,
  LENS_STORAGE_KEY,
  lensesForLocation,
  parseStoredLenses,
  publishLenses,
  seedLensSnapshot,
  serializeLenses,
  type ObservanceLens,
} from './lenses';
// This module is itself behind a `require()` thunk (see `useLenses`), so pulling
// the catalog in here costs the launch path nothing.
import { getLensesWithContent } from './vratCatalog';

/**
 * The AsyncStorage half of the क्षेत्रीय पंचांग preference (PRD-42 §4.2).
 *
 * The in-memory set, its subscribers and the stored key all live in `lenses.ts`,
 * which is I/O-free and therefore safe on the launch path. THIS module imports
 * AsyncStorage and must stay off it: reach it through `useLenses`, which requires
 * it lazily inside the effect and the toggle. `launchGraph.test.ts` is what keeps
 * that honest.
 *
 * The stored value is a SORTED comma list, not JSON, because the value is a set of
 * short ids and a canonical string is what lets a write be skipped and a memo key
 * compare by identity.
 *
 * SEEDING IS SILENT, POST-LAUNCH AND ONCE. `seedFromLocationOnce` runs after
 * interactions settle on the first Panchang entry, and writes only when nothing
 * has ever been written — a user who turned every lens OFF has an empty set that
 * must never be re-seeded back on. The seed marker is a SEPARATE key so "empty
 * because I chose empty" and "empty because we have not looked yet" stay
 * distinguishable; collapsing them is the bug that hands a user back a lens they
 * deliberately removed.
 *
 * Storage failure degrades to the empty set — today's app, byte for byte.
 */

export { LENS_STORAGE_KEY } from './lenses';

/** Set once the seeding pass has run, so it never runs twice. Value is the seeding city. */
export const LENS_SEEDED_KEY = '@vedansh:panchang-lenses-seeded';

export async function loadLenses(): Promise<Set<ObservanceLens>> {
  try {
    return seedLensSnapshot(await AsyncStorage.getItem(LENS_STORAGE_KEY));
  } catch {
    return seedLensSnapshot(null);
  }
}

async function write(next: Set<ObservanceLens>): Promise<void> {
  try {
    await AsyncStorage.setItem(LENS_STORAGE_KEY, serializeLenses(next));
  } catch {
    // Best-effort, like every other panchang preference: the in-memory set still
    // publishes, so the screen the user is looking at is correct for this session.
  }
  publishLenses(next);
}

export async function setLensEnabled(lens: ObservanceLens, enabled: boolean): Promise<void> {
  const current = getLensSnapshot() ?? (await loadLenses());
  const next = new Set(current);
  if (enabled) next.add(lens);
  else next.delete(lens);
  if (next.size === current.size && [...next].every((l) => current.has(l))) return;
  await write(next);
}

/** Every lens off — the explicit "show me the universal calendar only" act. */
export async function clearLenses(): Promise<void> {
  await write(new Set());
}

/**
 * Every OFFERED lens on — the sheet's "सभी चुनें". Offered means "brings something
 * in this build" (`getLensesWithContent`), never the whole registry: a stored id
 * for an empty calendar would be a switch that changes nothing. A deliberate tap
 * like any other, so it may include `jain` and `sindhi`: the seeding ban
 * (§23a.12) is on INFERRING a tradition, never on the user choosing to see
 * everything the app ships.
 */
export async function setAllLenses(): Promise<void> {
  const current = getLensSnapshot() ?? (await loadLenses());
  const offered = getLensesWithContent();
  if (offered.every((lens) => current.has(lens))) return;
  const next = new Set(current);
  offered.forEach((lens) => next.add(lens));
  await write(next);
}

/**
 * Seed from the chosen city, exactly once per install, and only when the user has
 * never made a choice of their own.
 *
 * Returns the lenses it seeded, so the caller can name them in the one dismissible
 * line §4.2 allows. Returns `[]` for the three deliberate holes (Ujjain, Delhi,
 * Chandigarh), for an unknown location, and on every call after the first — a
 * no-op the caller renders as nothing.
 */
export async function seedFromLocationOnce(location: {
  cityId: string;
  isTehsil?: boolean;
  labelEn?: string;
}): Promise<readonly ObservanceLens[]> {
  try {
    const [[, seeded], [, stored]] = await AsyncStorage.multiGet([LENS_SEEDED_KEY, LENS_STORAGE_KEY]);
    if (seeded != null) return [];
    // Mark FIRST: a crash between the mark and the write must not re-seed on the
    // next launch, because by then the user may have deliberately emptied the set.
    await AsyncStorage.setItem(LENS_SEEDED_KEY, location.cityId);
    // A set already exists from before this key was introduced — respect it.
    if (stored != null) return [];
    // Seed only calendars that bring something: a "Maharashtra calendar added"
    // line over a calendar that changes nothing would be a false promise.
    const offered = new Set(getLensesWithContent());
    const seedLenses = lensesForLocation(location).filter((lens) => offered.has(lens));
    if (seedLenses.length === 0) {
      publishLenses(parseStoredLenses(stored));
      return [];
    }
    await write(new Set(seedLenses));
    return seedLenses;
  } catch {
    return [];
  }
}
