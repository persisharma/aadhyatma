/**
 * The AsyncStorage layer under the shared muhurat day store. It is what turns a
 * one-session cache into a persistent one: re-entering the finder or cold-starting
 * the app must not re-solve ~90–260 days of astronomy.
 *
 * These pin the storage contract only — that hydrate fills the in-memory store,
 * that persist writes the right days once, that an LRU eviction drops that city's
 * disk data, and that stale-version / past-dated keys are purged. The CALCULATION
 * contract (fresh == cached == serialize→revive over a full year) is proven
 * separately by `dayCacheParity.e2e.test.ts` under the tsx engine suite, so this
 * suite seeds the store with cheap fixtures instead of running the real engine.
 *
 * Lives in `__tests__/jest/` because `npm run test:engine` globs
 * `src/panchang/__tests__/*.test.ts` into `tsx --test`, which would try (and
 * fail) to run a Jest suite. The nested dir is outside that non-recursive glob
 * while `jest.config.js` reaches it with `__tests__/**\/*.jest.test.*`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MUHURAT_DAY_CACHE_VERSION } from '../../muhuratDaySerde';
import {
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  __resetMuhuratDayStore,
  MAX_CITIES,
  type DayInputs,
} from '../../muhuratDayStore';
import {
  hydrateMuhuratDays,
  persistMuhuratDays,
  muhuratDayStorageKey,
  __resetMuhuratDayCache,
} from '../../muhuratDayCache';

const UJJAIN = { cityId: 'ujjain', latitude: 23.1793, longitude: 75.7849, elevation: 494 };
const DELHI = { cityId: 'delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 };
const SYSTEM = 'purnimant' as const;

/** A cheap stand-in for a solved day — Date-bearing, so the serde round-trip is exercised. */
const fakeDay = (dateKey: string): DayInputs => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    p: {
      date,
      calendarSystem: SYSTEM,
      vara: { nameHi: 'बुधवार', nameEn: 'Wednesday', index: 3 },
      tithi: { index: 5, nameHi: 'पंचमी', nameEn: 'Panchami', endTime: new Date(y, m - 1, d, 14, 30), paksha: 'shukla' },
      kshayaTithi: null,
      kshayaNakshatra: null,
      nakshatra: { index: 9, nameHi: 'आश्लेषा', nameEn: 'Ashlesha', endTime: null },
      yoga: { index: 3, nameHi: 'आयुष्मान्', nameEn: 'Ayushman', endTime: new Date(y, m - 1, d, 9, 0) },
      karana: { index: 2, nameHi: 'बालव', nameEn: 'Balava', endTime: null },
      sunrise: new Date(y, m - 1, d, 6, 12),
      sunset: new Date(y, m - 1, d, 18, 44),
      moonrise: null,
      brahmaMuhurta: { start: new Date(y, m - 1, d, 4, 24), end: new Date(y, m - 1, d, 5, 12) },
      vikramSamvat: 2083,
      lunarMonth: { nameHi: 'श्रावण', nameEn: 'Shravana', index: 4, isAdhik: false },
    },
    asta: { shukraAsta: false, guruAsta: false },
  } as DayInputs;
};

const dayKeyFromToday = (offset: number): string => {
  const now = new Date();
  return dateKeyFor(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
};

beforeEach(async () => {
  // The AsyncStorage mock's methods are themselves jest.fn()s shared across the
  // file, so a spy over one inherits the previous test's call log — restore the
  // spies AND clear the underlying mocks, or the call-count assertions bleed.
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetMuhuratDayStore();
  __resetMuhuratDayCache();
});

describe('hydrateMuhuratDays', () => {
  test('loads persisted days into the in-memory store, Dates intact', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const key = dayKeyFromToday(1);
    await persistOne(scope, key);
    __resetMuhuratDayStore(); // simulate a cold start: disk warm, memory empty

    await hydrateMuhuratDays(UJJAIN, SYSTEM, [key]);

    const hit = dayStoreFor(scope).get(key);
    expect(hit).toBeDefined();
    // A revived day must be indistinguishable from a solved one — real Dates,
    // not the ISO strings a plain JSON round-trip would leave behind.
    expect(hit!.p.sunrise).toBeInstanceOf(Date);
    expect(hit!.p.sunrise.getTime()).toBe(fakeDay(key).p.sunrise.getTime());
    expect(hit!.p.tithi.endTime).toBeInstanceOf(Date);
    expect(hit!.p.tithi.nameEn).toBe('Panchami');
  });

  test('does not read disk for days already warm in memory', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const warm = dayKeyFromToday(1);
    const cold = dayKeyFromToday(2);
    dayStoreFor(scope).set(warm, fakeDay(warm));
    const multiGet = spyOnStorage('multiGet');

    await hydrateMuhuratDays(UJJAIN, SYSTEM, [warm, cold]);

    expect(multiGet).toHaveBeenCalledTimes(1);
    expect(multiGet.mock.calls[0][0]).toEqual([muhuratDayStorageKey(scope, cold)]);
  });

  test('skips disk entirely when every wanted day is already in memory', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const key = dayKeyFromToday(0);
    dayStoreFor(scope).set(key, fakeDay(key));
    const multiGet = spyOnStorage('multiGet');
    const getAllKeys = spyOnStorage('getAllKeys');

    await hydrateMuhuratDays(UJJAIN, SYSTEM, [key]);

    // Not even the purge sweep: re-entering a warm surface must not wait on a
    // disk round-trip that cannot tell it anything new.
    expect(multiGet).not.toHaveBeenCalled();
    expect(getAllKeys).not.toHaveBeenCalled();
  });

  test('purges past-dated and stale-version keys', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const past = muhuratDayStorageKey(scope, dayKeyFromToday(-1));
    const stale = `@vedansh:muhurat-days:v${MUHURAT_DAY_CACHE_VERSION - 1}:${scope}:${dayKeyFromToday(3)}`;
    const future = muhuratDayStorageKey(scope, dayKeyFromToday(3));
    await AsyncStorage.multiSet([
      [past, '{}'],
      [stale, '{}'],
      [future, '{}'],
    ]);

    await hydrateMuhuratDays(UJJAIN, SYSTEM, [dayKeyFromToday(3)]);

    const keys = await AsyncStorage.getAllKeys();
    expect(keys).not.toContain(past);
    expect(keys).not.toContain(stale);
    expect(keys).toContain(future);
  });

  test('a corrupt entry is ignored, not fatal', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const key = dayKeyFromToday(1);
    await AsyncStorage.setItem(muhuratDayStorageKey(scope, key), 'not json{{');

    await expect(hydrateMuhuratDays(UJJAIN, SYSTEM, [key])).resolves.toBeUndefined();
    expect(dayStoreFor(scope).has(key)).toBe(false);
  });
});

describe('persistMuhuratDays', () => {
  test('writes the scope’s future days and skips past ones', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const map = dayStoreFor(scope);
    const yesterday = dayKeyFromToday(-1);
    const today = dayKeyFromToday(0);
    const tomorrow = dayKeyFromToday(1);
    [yesterday, today, tomorrow].forEach((k) => map.set(k, fakeDay(k)));

    await persistMuhuratDays(UJJAIN, SYSTEM);

    const keys = await AsyncStorage.getAllKeys();
    // Yesterday is dead weight — it can never be a finder result again.
    expect(keys).not.toContain(muhuratDayStorageKey(scope, yesterday));
    expect(keys).toContain(muhuratDayStorageKey(scope, today));
    expect(keys).toContain(muhuratDayStorageKey(scope, tomorrow));
  });

  test('writes each day once — a second call with nothing new is a no-op', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const key = dayKeyFromToday(1);
    dayStoreFor(scope).set(key, fakeDay(key));
    await persistMuhuratDays(UJJAIN, SYSTEM);

    const multiSet = spyOnStorage('multiSet');
    await persistMuhuratDays(UJJAIN, SYSTEM);
    expect(multiSet).not.toHaveBeenCalled();

    // …but a newly solved day still gets written.
    const next = dayKeyFromToday(2);
    dayStoreFor(scope).set(next, fakeDay(next));
    await persistMuhuratDays(UJJAIN, SYSTEM);
    expect(multiSet).toHaveBeenCalledTimes(1);
    const written = multiSet.mock.calls[0][0] as readonly (readonly [string, string])[];
    expect(written.map(([k]) => k)).toEqual([muhuratDayStorageKey(scope, next)]);
  });

  test('round-trips through disk: persist → cold start → hydrate gives back the day', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const key = dayKeyFromToday(1);
    dayStoreFor(scope).set(key, fakeDay(key));
    await persistMuhuratDays(UJJAIN, SYSTEM);

    __resetMuhuratDayStore();
    __resetMuhuratDayCache();
    await hydrateMuhuratDays(UJJAIN, SYSTEM, [key]);

    expect(dayStoreFor(scope).get(key)).toEqual(fakeDay(key));
  });
});

describe('eviction', () => {
  test('an LRU eviction drops that city’s disk keys and leaves the others', async () => {
    const ujjainScope = scopeKeyFor(UJJAIN, SYSTEM);
    const delhiScope = scopeKeyFor(DELHI, SYSTEM);
    const key = dayKeyFromToday(1);
    dayStoreFor(ujjainScope).set(key, fakeDay(key));
    await persistMuhuratDays(UJJAIN, SYSTEM);
    dayStoreFor(delhiScope).set(key, fakeDay(key));
    await persistMuhuratDays(DELHI, SYSTEM);

    // Ujjain is the LRU (Delhi was touched last); one city past the cap evicts
    // exactly it — Delhi must survive, disk data included.
    await fillPastCap(2);

    const keys = await AsyncStorage.getAllKeys();
    expect(keys).not.toContain(muhuratDayStorageKey(ujjainScope, key));
    expect(keys).toContain(muhuratDayStorageKey(delhiScope, key));
  });

  test('an evicted city re-persists from scratch (its persisted set is cleared)', async () => {
    const scope = scopeKeyFor(UJJAIN, SYSTEM);
    const key = dayKeyFromToday(1);
    dayStoreFor(scope).set(key, fakeDay(key));
    await persistMuhuratDays(UJJAIN, SYSTEM);

    await fillPastCap(1);
    expect(await AsyncStorage.getAllKeys()).not.toContain(muhuratDayStorageKey(scope, key));

    // Coming back to the city must rewrite its days — the in-memory "already on
    // disk" bookkeeping must not outlive the disk data it describes.
    dayStoreFor(scope).set(key, fakeDay(key));
    await persistMuhuratDays(UJJAIN, SYSTEM);
    expect(await AsyncStorage.getAllKeys()).toContain(muhuratDayStorageKey(scope, key));
  });
});

// --- helpers -------------------------------------------------------------

/** Seed one day into the store and flush it to disk. */
async function persistOne(scope: string, dateKey: string): Promise<void> {
  dayStoreFor(scope).set(dateKey, fakeDay(dateKey));
  await persistMuhuratDays(scope === scopeKeyFor(DELHI, SYSTEM) ? DELHI : UJJAIN, SYSTEM);
}

/**
 * `jest.spyOn` over an already-mocked method (every AsyncStorage method is a
 * jest.fn in the official mock) returns that SAME mock, call history included —
 * so a spy created mid-test would count calls made earlier in the test. Clear it
 * on creation: these assertions are always about "from here on".
 */
function spyOnStorage<M extends 'multiGet' | 'multiSet' | 'multiRemove' | 'getAllKeys'>(method: M) {
  const spy = jest.spyOn(AsyncStorage, method);
  spy.mockClear();
  return spy;
}

/** Let the fire-and-forget eviction cleanup settle. */
const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

/**
 * Touch enough fresh scopes to push the store exactly one past `MAX_CITIES`,
 * evicting exactly one city: the least-recently-used one. `heldCities` is how
 * many real cities the test has already touched — overshooting would evict them
 * all and stop proving that only the LRU one is dropped.
 */
async function fillPastCap(heldCities: number): Promise<void> {
  for (let i = 0; i <= MAX_CITIES - heldCities; i += 1) dayStoreFor(`filler${i}:${SYSTEM}`);
  await flush();
}
