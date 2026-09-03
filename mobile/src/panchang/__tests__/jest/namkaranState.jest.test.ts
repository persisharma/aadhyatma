import assert from 'node:assert/strict';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildNamkaranShareModel } from '../../namkaranShare';
import { candidateFromLongitude } from '../../namkaran';
import {
  NAMKARAN_SESSION_STORAGE_KEY,
  NAMKARAN_SHORTLIST_STORAGE_KEY,
  clearRememberedNamkaranSession,
  parseStoredNamkaranSession,
  parseStoredNamkaranShortlist,
  saveNamkaranShortlistIds,
  saveRememberedNamkaranSession,
  validateNamkaranInput,
} from '../../namkaranState';

test('session storage is versioned and accepts exact or honestly unknown time', () => {
  assert.deepEqual(validateNamkaranInput({ date: '2026-08-13', time: '06:20' }), {});
  assert.deepEqual(validateNamkaranInput({ date: '2026-08-13', time: null }), {});
  assert.deepEqual(validateNamkaranInput({ date: 'bad', time: 'noon' }), {
    date: 'Use a valid YYYY-MM-DD date',
    time: 'Use 24-hour HH:mm in IST',
  });
  assert.deepEqual(parseStoredNamkaranSession(JSON.stringify({ version: 1, conventionVersion: 1, input: { date: '2026-08-13', time: null } })), { date: '2026-08-13', time: null });
  assert.equal(parseStoredNamkaranSession(JSON.stringify({ version: 1, conventionVersion: 2, input: { date: '2026-08-13', time: '12:00' } })), null);
});

test('explicit opt-out wins over a session write already in flight', async () => {
  await clearRememberedNamkaranSession();
  const realSetItem = AsyncStorage.setItem.bind(AsyncStorage);
  const setItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const before = setItem.mock.calls.length;
  setItem.mockImplementationOnce(async (key, value) => { await gate; await realSetItem(key, value); });
  const save = saveRememberedNamkaranSession({ date: '2026-08-13', time: '06:20' });
  while (setItem.mock.calls.length === before) await Promise.resolve();
  const clear = clearRememberedNamkaranSession();
  release();
  await Promise.all([save, clear]);
  assert.equal(await AsyncStorage.getItem(NAMKARAN_SESSION_STORAGE_KEY), null);
});

test('shortlist is a separable id-only record and survives convention changes', async () => {
  await AsyncStorage.removeItem(NAMKARAN_SESSION_STORAGE_KEY);
  await AsyncStorage.removeItem(NAMKARAN_SHORTLIST_STORAGE_KEY);
  await saveNamkaranShortlistIds(['keshav', 'keshav', 'meera']);
  const raw = await AsyncStorage.getItem(NAMKARAN_SHORTLIST_STORAGE_KEY);
  assert.deepEqual(parseStoredNamkaranShortlist(raw), ['keshav', 'meera']);
  assert.doesNotMatch(raw ?? '', /date|time|charana|birth/i);
  assert.equal(await AsyncStorage.getItem(NAMKARAN_SESSION_STORAGE_KEY), null);
  assert.deepEqual(parseStoredNamkaranShortlist(JSON.stringify({ version: 1, conventionVersion: 99, ids: ['keshav'] })), ['keshav']);
});

test('share model is an explicit allow-list with no birth basis', () => {
  const model = buildNamkaranShareModel(candidateFromLongitude(61), [{
    id: 'keshav', hi: 'केशव', latin: 'Keshav', gender: 'boy', charanas: [24],
    meaningHi: 'विष्णु का नाम', meaningEn: 'A name of Vishnu', syllableCount: 3,
  }]);
  const serialized = JSON.stringify(model);
  assert.match(serialized, /Keshav/);
  assert.doesNotMatch(serialized, /birth|date|time|city|basis|longitude/i);
});
