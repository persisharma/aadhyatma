/**
 * The build-change cache reset. Two claims are worth real tests here, and they
 * pull in opposite directions:
 *
 *   1. It DOES clear the derived caches when the build moves (a store update or
 *      an OTA), or the bug that got baked into cached data outlives its fix.
 *   2. It NEVER clears anything else. This is the dangerous half — the same
 *      `@vedansh` namespace holds bookmarks, japam counts, followed vrats, birth
 *      details, family remembrance entries and the chosen city. A sweep that
 *      over-reached would destroy data no engine can recompute, silently, on
 *      update, for every user at once.
 *
 * So the exclusion test enumerates the real key set from the app rather than a
 * couple of examples: if someone adds a prefix to the allowlist that catches user
 * data, this fails.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BUILD_FINGERPRINT_KEY,
  DERIVED_CACHE_KEY_PREFIXES,
  awaitDerivedCacheReset,
  clearDerivedCaches,
  resetDerivedCachesIfBuildChanged,
  __resetDerivedCacheResetForTests,
} from '../derivedCacheReset';

/**
 * Every key the app writes that is NOT a derived cache, as of this suite. Drawn
 * from the `@vedansh` literals across src/ — user data, preferences, notification
 * bookkeeping and one-shot flags. The sweep must leave all of them alone.
 */
const MUST_SURVIVE = [
  // Practice and history — irreplaceable.
  '@vedansh/bookmarks',
  '@vedansh/reading-progress',
  '@vedansh/japam-counter',
  '@vedansh/japam-alarms',
  '@vedansh/japam-alarms/once-armed',
  '@vedansh/routines',
  '@vedansh/routine-done',
  '@vedansh/routine-celebrated',
  '@vedansh/sadhana',
  '@vedansh/sadhana-celebrated',
  '@vedansh/sadhana-day-celebrated',
  '@vedansh/sadhana-reminders',
  '@vedansh/vidhi-checklist',
  '@vedansh/user-activity',
  '@vedansh/search-recent',
  '@vedansh/new-content-state',
  // Followed days and private entries.
  '@vedansh/vrat-follows',
  '@vedansh/vrat-reminder-default',
  '@vedansh/muhurat-follows',
  '@vedansh/pitru-smaran',
  // Birth details and starred names, several privacy-sensitive by design.
  '@vedansh:kundali-birth-profile:v1',
  '@vedansh:guna-milan-draft:v1',
  '@vedansh:guna-milan-metrics:v1',
  '@vedansh:namkaran-session:v1',
  '@vedansh:namkaran-shortlist:v1',
  // Preferences. The two panchang ones are the easiest mistake in this file:
  // they look panchang-shaped, and clearing them resets the user's city to Ujjain.
  '@vedansh:panchang-location',
  '@vedansh:panchang-calendar-system',
  '@vedansh/language',
  '@vedansh/regionalLanguage',
  '@vedansh/font-scale',
  '@vedansh/read-aloud',
  // Notification bookkeeping — mirrors what is actually scheduled with the OS.
  '@vedansh/notif-meta',
  '@vedansh/notif-prefs',
  '@vedansh/notif-permission-asked',
  // One-shot flags that already carry their own version suffix.
  '@vedansh/tour-completed-v6',
  '@vedansh/whats-new-seen-v1.4.7',
  '@vedansh/onboarding-setup-v1',
  '@vedansh/rating-prompt',
];

/** Representative keys under each allowlisted prefix. */
const MUST_BE_SWEPT = [
  '@vedansh:panchang-days:v3:ujjain:purnimant:2026-08-14',
  '@vedansh:muhurat-days:v1:ujjain:purnimant:2026-08-14',
  '@vedansh:observances:v2:delhi:amanta:2026',
  '@vedansh/widget:last-plan-key-v1',
];

const seedAll = async (): Promise<void> => {
  await AsyncStorage.multiSet(
    [...MUST_SURVIVE, ...MUST_BE_SWEPT].map((key) => [key, 'seeded'] as [string, string])
  );
};

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetDerivedCacheResetForTests();
});

describe('clearDerivedCaches', () => {
  test('removes every derived-cache key', async () => {
    await seedAll();

    const removed = await clearDerivedCaches();

    expect(removed).toBe(MUST_BE_SWEPT.length);
    const left = await AsyncStorage.getAllKeys();
    for (const key of MUST_BE_SWEPT) expect(left).not.toContain(key);
  });

  test('leaves every non-cache key untouched — user data is not recomputable', async () => {
    await seedAll();

    await clearDerivedCaches();

    const left = await AsyncStorage.getAllKeys();
    for (const key of MUST_SURVIVE) expect(left).toContain(key);
    expect(await AsyncStorage.getItem('@vedansh/japam-counter')).toBe('seeded');
  });

  test('no allowlisted prefix matches a key that must survive', async () => {
    // The invariant behind the test above, stated directly: a future prefix that
    // over-reaches fails here even if nobody seeds a matching key.
    for (const key of MUST_SURVIVE) {
      const overreaching = DERIVED_CACHE_KEY_PREFIXES.filter((p) => key.startsWith(p));
      expect(overreaching).toEqual([]);
    }
  });

  test('never sweeps its own fingerprint marker', async () => {
    // A marker inside the swept set would be erased with the caches, and every
    // launch would then look like a build change and re-sweep.
    expect(DERIVED_CACHE_KEY_PREFIXES.some((p) => BUILD_FINGERPRINT_KEY.startsWith(p))).toBe(false);
  });
});

describe('resetDerivedCachesIfBuildChanged', () => {
  test('sweeps and records the fingerprint when the build moved', async () => {
    await seedAll();
    await AsyncStorage.setItem(BUILD_FINGERPRINT_KEY, 'old-update|1.4.6|1.4.6|51');

    await resetDerivedCachesIfBuildChanged('new-update|1.4.7|1.4.7|52');

    const left = await AsyncStorage.getAllKeys();
    for (const key of MUST_BE_SWEPT) expect(left).not.toContain(key);
    for (const key of MUST_SURVIVE) expect(left).toContain(key);
    expect(await AsyncStorage.getItem(BUILD_FINGERPRINT_KEY)).toBe('new-update|1.4.7|1.4.7|52');
  });

  test('does nothing when the build is unchanged', async () => {
    await seedAll();
    await AsyncStorage.setItem(BUILD_FINGERPRINT_KEY, 'same');
    const multiRemove = jest.spyOn(AsyncStorage, 'multiRemove');
    multiRemove.mockClear(); // the official mock's methods are shared jest.fn()s

    await resetDerivedCachesIfBuildChanged('same');

    expect(multiRemove).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toHaveLength(
      MUST_SURVIVE.length + MUST_BE_SWEPT.length + 1
    );
  });

  test('sweeps on an install that predates the mechanism (no marker yet)', async () => {
    // The rollout case, and the one that matters most: the caches on that device
    // were built by exactly the release this update supersedes.
    await seedAll();

    await resetDerivedCachesIfBuildChanged('first-run');

    const left = await AsyncStorage.getAllKeys();
    for (const key of MUST_BE_SWEPT) expect(left).not.toContain(key);
    expect(await AsyncStorage.getItem(BUILD_FINGERPRINT_KEY)).toBe('first-run');
  });

  test('a fresh install just records the fingerprint', async () => {
    await resetDerivedCachesIfBuildChanged('fresh');

    expect(await AsyncStorage.getAllKeys()).toEqual([BUILD_FINGERPRINT_KEY]);
    expect(await AsyncStorage.getItem(BUILD_FINGERPRINT_KEY)).toBe('fresh');
  });

  test('does NOT record the fingerprint when the sweep fails', async () => {
    await seedAll();
    jest.spyOn(AsyncStorage, 'multiRemove').mockRejectedValueOnce(new Error('disk full'));

    // Never rejects — a failed reset must not take down app startup.
    await expect(resetDerivedCachesIfBuildChanged('v2')).resolves.toBeUndefined();

    // Unwritten on purpose: the next launch retries rather than recording a
    // sweep that never happened.
    expect(await AsyncStorage.getItem(BUILD_FINGERPRINT_KEY)).toBeNull();
  });

  test('is idempotent — a second call reuses the first sweep', async () => {
    await seedAll();
    const first = resetDerivedCachesIfBuildChanged('v2');
    const second = resetDerivedCachesIfBuildChanged('v3-ignored');

    expect(second).toBe(first);
    await first;
    expect(await AsyncStorage.getItem(BUILD_FINGERPRINT_KEY)).toBe('v2');
  });
});

describe('awaitDerivedCacheReset', () => {
  test('stays pending until the sweep finishes, then reports it done', async () => {
    await seedAll();

    // Hold the sweep open at its first storage read so "still in flight" is a
    // real state to observe rather than a race against the microtask queue.
    //
    // Done by stalling `getAllKeys`, NOT by wrapping `multiRemove`: every method
    // on the official AsyncStorage mock is already a `jest.fn`, so `spyOn`
    // returns that SAME fn — a saved reference to it calls the new
    // implementation, and a call-through recurses forever.
    let releaseKeys: (keys: string[]) => void = () => {};
    const stalled = new Promise<string[]>((resolve) => {
      releaseKeys = resolve;
    });
    jest.spyOn(AsyncStorage, 'getAllKeys').mockImplementationOnce(() => stalled);

    void resetDerivedCachesIfBuildChanged('v2');
    let done = false;
    const waiting = awaitDerivedCacheReset().then(() => {
      done = true;
    });
    await Promise.resolve();
    await Promise.resolve();

    // A cache that awaited the gate here is still correctly blocked.
    expect(done).toBe(false);

    releaseKeys([...MUST_BE_SWEPT, ...MUST_SURVIVE]);
    await waiting;

    expect(done).toBe(true);
    // …and by the time it was released, the stale days were already gone.
    expect(await AsyncStorage.getAllKeys()).not.toContain(MUST_BE_SWEPT[0]);
  });

  test('resolves immediately when no reset was registered', async () => {
    // A headless entry point or a test suite that never loads App.tsx has no
    // build change to react to and must not hang waiting for one.
    await expect(awaitDerivedCacheReset()).resolves.toBeUndefined();
  });
});
