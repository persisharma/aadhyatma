import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPLORE_KEY, HOUR, initialExploreState, pickExplore, recordVisit } from '@/data/discovery/policy';

const mockDisk = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockDisk.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockDisk.set(key, value); }),
  multiGet: jest.fn(async (keys: string[]) => keys.map(key => [key, mockDisk.get(key) ?? null])),
}));
const now = new Date(2026, 10, 3, 12).getTime();
const store = () => require('@/data/discovery/store') as typeof import('@/data/discovery/store');
beforeEach(() => { jest.resetModules(); mockDisk.clear(); jest.clearAllMocks(); });

test('reset waits for hydration and queued visits, preserves other data and survives cold reload', async () => {
  const dirty = { ...initialExploreState(now), visited: ['routine', 'japam'], shown: [now], declined: { puja: now }, streak: 2, sleepUntil: now + 7 * 24 * HOUR, last: 'japam' };
  mockDisk.set(EXPLORE_KEY, JSON.stringify(dirty));
  mockDisk.set('@vedansh/routines', '[{"id":"saved-routine"}]');
  mockDisk.set('@vedansh/launch-asks-v1', '{"lastDay":"2026-11-03"}');
  mockDisk.set('@vedansh/notification-preferences', '{"enabled":false}');
  const unrelated = [...mockDisk].filter(([key]) => key !== EXPLORE_KEY);
  const s = store();
  await s.loadExplore();
  const visit = s.updateExplore(state => recordVisit(state, 'gita'));
  expect(await s.resetExploreHistory(now)).toBe(true);
  await visit;
  expect(s.exploreSnapshot().state.visited).toEqual([]);
  expect(pickExplore(s.exploreSnapshot().state, now)?.id).toBe('routine');
  expect([...mockDisk].filter(([key]) => key !== EXPLORE_KEY)).toEqual(unrelated);
  await s.updateExplore(state => recordVisit(state, 'puja'));
  jest.resetModules();
  const reloaded = store();
  await reloaded.loadExplore();
  expect(reloaded.exploreSnapshot().firstCollectionSession).toBe(false);
  expect(reloaded.exploreSnapshot().state.visited).toEqual(['puja']);
  expect(reloaded.exploreSnapshot().state.shown).toEqual([]);
  expect(reloaded.exploreSnapshot().state.declined).toEqual({});
  expect(reloaded.exploreSnapshot().state.sleepUntil).toBe(0);
});

test('reset on the first collection session clears seeded visits without seeding them again', async () => {
  mockDisk.set('@vedansh/routines', '[{"id":"saved"}]');
  const s = store();
  expect(await s.resetExploreHistory(now)).toBe(true);
  expect(s.exploreSnapshot().state.visited).toEqual([]);
  jest.resetModules();
  const reloaded = store();
  await reloaded.loadExplore();
  expect(reloaded.exploreSnapshot().state.visited).toEqual([]);
  expect(pickExplore(reloaded.exploreSnapshot().state, now)?.id).toBe('routine');
});

test('a failed reset preserves persisted history and fails closed', async () => {
  const dirty = JSON.stringify({ ...initialExploreState(now), visited: ['routine'] });
  mockDisk.set(EXPLORE_KEY, dirty);
  const s = store();
  await s.loadExplore();
  const storage = require('@react-native-async-storage/async-storage') as typeof AsyncStorage;
  jest.mocked(storage.setItem).mockRejectedValueOnce(new Error('disk full'));
  expect(await s.resetExploreHistory(now)).toBe(false);
  expect(mockDisk.get(EXPLORE_KEY)).toBe(dirty);
  expect(s.exploreSnapshot().ready).toBe(false);
});

test('failed hydration cannot overwrite unknown history with a reset', async () => {
  const storage = require('@react-native-async-storage/async-storage') as typeof AsyncStorage;
  jest.mocked(storage.getItem).mockRejectedValueOnce(new Error('read failed'));
  expect(await store().resetExploreHistory(now)).toBe(false);
  expect(storage.setItem).not.toHaveBeenCalled();
});
