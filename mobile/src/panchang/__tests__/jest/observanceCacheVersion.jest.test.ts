import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateObservanceCache } from '../../observanceCache';
import { getStoredObservanceYear } from '../../observanceStore';

jest.mock('@/utils/derivedCacheReset', () => ({ awaitDerivedCacheReset: jest.fn(async () => {}) }));

// v13 (Nov 2026): a civil date is India's, not the device zone's — city scans made
// on a phone outside India were a day off, so every v12 scan is discarded.
it('drops dates stored by an older engine, hydrates the current version and retains user follows', async () => {
  const city = 'occasion-cache-regression';
  const follows = '@vedansh/vrat-follows';
  await AsyncStorage.clear();
  await AsyncStorage.setItem(follows, JSON.stringify(['rishi-panchami']));
  for (const system of ['purnimant', 'amanta'] as const) {
    await AsyncStorage.setItem(`@vedansh:observances:v12:${city}:${system}:2026`, JSON.stringify([['rishi-panchami', '2026-09-16']]));
    await AsyncStorage.setItem(`@vedansh:observances:v13:${city}:${system}:2026`, JSON.stringify([['rishi-panchami', '2026-09-15']]));
  }
  await hydrateObservanceCache(city, ['purnimant', 'amanta'], [2026]);
  for (const system of ['purnimant', 'amanta'] as const) {
    expect(await AsyncStorage.getItem(`@vedansh:observances:v12:${city}:${system}:2026`)).toBeNull();
    expect(getStoredObservanceYear(city, system, 2026)).toEqual([['rishi-panchami', '2026-09-15']]);
  }
  expect(await AsyncStorage.getItem(follows)).toBe(JSON.stringify(['rishi-panchami']));
});
