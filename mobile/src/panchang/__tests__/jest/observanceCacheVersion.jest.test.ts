import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateObservanceCache } from '../../observanceCache';
import { getStoredObservanceYear } from '../../observanceStore';

jest.mock('@/utils/derivedCacheReset', () => ({ awaitDerivedCacheReset: jest.fn(async () => {}) }));

// v14 adds Vaikuntha Chaturdashi. Previously scanned cities must reload their
// observance year to pick up the new date, while saved follows stay intact.
it('discards old city dates and rehydrates the new observance without changing follows', async () => {
  const city = 'occasion-cache-regression';
  const follows = '@vedansh/vrat-follows';
  await AsyncStorage.clear();
  await AsyncStorage.setItem(follows, JSON.stringify(['rishi-panchami']));
  const existing = [['rishi-panchami', '2026-09-15']];
  const current = [...existing, ['vaikuntha-chaturdashi', '2026-11-23']];
  for (const system of ['purnimant', 'amanta'] as const) {
    await AsyncStorage.setItem(`@vedansh:observances:v13:${city}:${system}:2026`, JSON.stringify(existing));
    await AsyncStorage.setItem(`@vedansh:observances:v14:${city}:${system}:2026`, JSON.stringify(current));
  }
  await hydrateObservanceCache(city, ['purnimant', 'amanta'], [2026]);
  for (const system of ['purnimant', 'amanta'] as const) {
    expect(await AsyncStorage.getItem(`@vedansh:observances:v13:${city}:${system}:2026`)).toBeNull();
    expect(getStoredObservanceYear(city, system, 2026)).toEqual(current);
  }
  expect(await AsyncStorage.getItem(follows)).toBe(JSON.stringify(['rishi-panchami']));
});
