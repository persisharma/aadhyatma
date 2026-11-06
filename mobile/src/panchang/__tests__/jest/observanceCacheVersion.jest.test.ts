import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateObservanceCache } from '../../observanceCache';
import { getStoredObservanceYear } from '../../observanceStore';

jest.mock('@/utils/derivedCacheReset', () => ({ awaitDerivedCacheReset: jest.fn(async () => {}) }));

it('drops v11 dates, hydrates corrected v12 dates and retains user follows', async () => {
  const city = 'occasion-cache-regression';
  const follows = '@vedansh/vrat-follows';
  await AsyncStorage.clear();
  await AsyncStorage.setItem(follows, JSON.stringify(['rishi-panchami']));
  for (const system of ['purnimant', 'amanta'] as const) {
    await AsyncStorage.setItem(`@vedansh:observances:v11:${city}:${system}:2026`, JSON.stringify([['rishi-panchami', '2026-09-16']]));
    await AsyncStorage.setItem(`@vedansh:observances:v12:${city}:${system}:2026`, JSON.stringify([['rishi-panchami', '2026-09-15']]));
  }
  await hydrateObservanceCache(city, ['purnimant', 'amanta'], [2026]);
  for (const system of ['purnimant', 'amanta'] as const) {
    expect(await AsyncStorage.getItem(`@vedansh:observances:v11:${city}:${system}:2026`)).toBeNull();
    expect(getStoredObservanceYear(city, system, 2026)).toEqual([['rishi-panchami', '2026-09-15']]);
  }
  expect(await AsyncStorage.getItem(follows)).toBe(JSON.stringify(['rishi-panchami']));
});
