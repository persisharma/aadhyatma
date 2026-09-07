/**
 * Roster store behaviour (PRD-24 Phase 2 §C2): hydrate-once, save-after-every-
 * capture upsert, delete, and the real-registry validators (a retired id in a
 * stored payload is dropped on read).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  __resetHomeRosterStoreForTests,
  deleteHome,
  loadHomeRoster,
  saveHome,
} from '../homeRecordStore';
import { VASTU_HOMES_STORAGE_KEY, type HomeRecord } from '../homeRecord';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
  };
});

const home = (over: Partial<HomeRecord> = {}): HomeRecord => ({
  id: 'h1',
  version: 1,
  label: 'देखा गया 3BHK',
  kind: 'flat',
  template: 'flat-3bhk',
  role: 'considering',
  facing: 'east',
  rooms: [
    { roomId: 'kitchen', ordinal: 1, zone: 'southeast', via: 'manual', recordedAt: '2026-09-06T10:00:00.000Z' },
  ],
  createdAt: '2026-09-06T09:00:00.000Z',
  updatedAt: '2026-09-06T10:00:00.000Z',
  ...over,
});

beforeEach(async () => {
  await AsyncStorage.clear();
  __resetHomeRosterStoreForTests();
  jest.clearAllMocks();
});

test('hydrates empty, saves an upsert, and republishes the written roster', async () => {
  const first = await loadHomeRoster();
  expect(first.roster.homes).toHaveLength(0);
  const roster = await saveHome(home());
  expect(roster.homes.map((h) => h.id)).toEqual(['h1']);
  const raw = await AsyncStorage.getItem(VASTU_HOMES_STORAGE_KEY);
  expect(raw).toContain('"kitchen"');
});

test('save after every capture updates the same home in place', async () => {
  await saveHome(home());
  const updated = await saveHome(
    home({ rooms: [...home().rooms, { roomId: 'toilet', ordinal: 1, zone: 'northeast', via: 'manual', recordedAt: '2026-09-06T10:01:00.000Z' }] })
  );
  expect(updated.homes).toHaveLength(1);
  expect(updated.homes[0].rooms).toHaveLength(2);
});

test('a stored payload with a retired room id drops the placement on read', async () => {
  const stored = {
    version: 1,
    livingId: null,
    homes: [
      {
        ...home(),
        rooms: [
          ...home().rooms,
          { roomId: 'no-such-room-anymore', ordinal: 1, zone: 'north', via: 'manual', recordedAt: null },
        ],
      },
    ],
  };
  await AsyncStorage.setItem(VASTU_HOMES_STORAGE_KEY, JSON.stringify(stored));
  const state = await loadHomeRoster();
  expect(state.roster.homes[0].rooms.map((r) => r.roomId)).toEqual(['kitchen']);
});

test('deleteHome removes the record and persists', async () => {
  await saveHome(home());
  const roster = await deleteHome('h1');
  expect(roster.homes).toHaveLength(0);
  const state = await loadHomeRoster();
  expect(state.roster.homes).toHaveLength(0);
});
