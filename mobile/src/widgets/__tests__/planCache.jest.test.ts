import AsyncStorage from '@react-native-async-storage/async-storage';
import { cachedWidgetPlan, WIDGET_PLAN_CACHE_KEY } from '../planCache';
import { planWidgetPayload, type WidgetPlanInput } from '../planPayload';
import { DEFAULT_LOCATION } from '@/panchang/locations';
import * as festivals from '@/panchang/festivalEngine';
import { currentBuildFingerprint } from '@/utils/buildFingerprint';
import { clearDerivedCaches } from '@/utils/derivedCacheReset';

jest.mock('@/utils/buildFingerprint', () => ({ currentBuildFingerprint: jest.fn(() => 'build-a') }));

const input: WidgetPlanInput = {
  generatedAt: new Date('2026-09-21T06:00:00Z'), locale: 'hi', location: DEFAULT_LOCATION,
  calendarSystem: 'purnimant', deviceTimeZone: 'Asia/Kolkata', activity: {},
};

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
  (currentBuildFingerprint as jest.Mock).mockReturnValue('build-a');
});

test('a second launch reads the persisted window with zero new solves and fresh language/Japam totals', async () => {
  const compute = jest.fn(planWidgetPayload);
  const first = await cachedWidgetPlan(input, compute);
  const second = await cachedWidgetPlan({ ...input, locale: 'en', activity: {
    '2026-09-21': { reads: {}, japa: { 'om-namah-shivaya': { beads: 23, rounds: 2 } } },
  } }, compute);
  expect(compute).toHaveBeenCalledTimes(1);
  expect(second.panchang.days).toEqual(first.panchang.days);
  expect(second.locale).toBe('en');
  expect(second.japam.totalBeads).toBe(23);
  expect(second.japam.totalRounds).toBe(2);
  const stored = JSON.parse((await AsyncStorage.getItem(WIDGET_PLAN_CACHE_KEY))!);
  expect(stored.payload.japam.totalBeads).toBe(0);
  expect(stored.payload.japam.lastUsedMantraId).toBeUndefined();
});

test.each([
  ['date rollover', { generatedAt: new Date('2026-09-22T06:00:00Z') }],
  ['calendar', { calendarSystem: 'amanta' }],
  ['time zone', { deviceTimeZone: 'America/Los_Angeles' }],
  ['coordinates even with the same city id', { location: { ...DEFAULT_LOCATION, latitude: 12.97, longitude: 77.59 } }],
] as const)('%s invalidates the window', async (_name, change) => {
  const compute = jest.fn(planWidgetPayload);
  await cachedWidgetPlan(input, compute);
  await cachedWidgetPlan({ ...input, ...change }, compute);
  expect(compute).toHaveBeenCalledTimes(2);
});

test('an OTA invalidates the window even when appVersion is unchanged', async () => {
  const compute = jest.fn(planWidgetPayload);
  await cachedWidgetPlan(input, compute);
  (currentBuildFingerprint as jest.Mock).mockReturnValue('build-b');
  await cachedWidgetPlan(input, compute);
  expect(compute).toHaveBeenCalledTimes(2);
});

test('city observance upgrades invalidate cached fallback labels', async () => {
  const compute = jest.fn(planWidgetPayload);
  const read = jest.spyOn(festivals, 'getObservancesForDateKey').mockReturnValue([]);
  await cachedWidgetPlan(input, compute);
  read.mockReturnValue([{ rule: { id: 'changed', nameHi: 'पर्व', nameEn: 'Festival' } }] as never);
  const payload = await cachedWidgetPlan(input, compute);
  expect(compute).toHaveBeenCalledTimes(2);
  expect(payload.panchang.days[0].vrat?.en).toBe('Festival');
});

test('a corrupt cache and a failed cache write still return a fresh plan', async () => {
  await AsyncStorage.setItem(WIDGET_PLAN_CACHE_KEY, '{bad');
  const compute = jest.fn(planWidgetPayload);
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk unavailable'));
  expect((await cachedWidgetPlan(input, compute)).panchang.days).toHaveLength(14);
  expect(compute).toHaveBeenCalledTimes(1);
});

test('cancellation during calculation publishes and persists nothing', async () => {
  let cancelled = false;
  const pending = cachedWidgetPlan(input, planWidgetPayload, () => cancelled);
  setTimeout(() => { cancelled = true; }, 0);
  await expect(pending).rejects.toThrow('cancelled');
  expect(await AsyncStorage.getItem(WIDGET_PLAN_CACHE_KEY)).toBeNull();
});

test('build-change sweeping clears only the derived widget window', async () => {
  await AsyncStorage.multiSet([[WIDGET_PLAN_CACHE_KEY, 'cache'], ['@vedansh/japam-counter', 'private']]);
  await clearDerivedCaches();
  expect(await AsyncStorage.getItem(WIDGET_PLAN_CACHE_KEY)).toBeNull();
  expect(await AsyncStorage.getItem('@vedansh/japam-counter')).toBe('private');
});
