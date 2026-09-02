/**
 * जन्म तिथि reminder opt-ins (PRD-29 §3.5) — default OFF, per person; every
 * write prunes ids that have left the roster, so a removed person's opt-in
 * cannot outlive their birth details.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  __resetJanmaPrefsForTests,
  getJanmaPrefsSnapshot,
  JANMA_TITHI_PREFS_KEY,
  loadJanmaPrefs,
  parseJanmaPrefs,
  serializeJanmaPrefs,
  setJanmaReminder,
} from '../../janmaTithiPrefs';

describe('janmaTithiPrefs', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    __resetJanmaPrefsForTests();
  });

  test('absence means OFF — the empty store hydrates with no reminders', async () => {
    const state = await loadJanmaPrefs();
    expect(state.hydrated).toBe(true);
    expect(state.prefs.reminders).toEqual({});
  });

  test('parse keeps only `true` under the current version', () => {
    expect(parseJanmaPrefs(null).reminders).toEqual({});
    expect(parseJanmaPrefs('not-json').reminders).toEqual({});
    expect(parseJanmaPrefs('{"version":99,"reminders":{"p-1":true}}').reminders).toEqual({});
    expect(
      parseJanmaPrefs('{"version":1,"reminders":{"p-1":true,"p-2":false,"p-3":"yes","":true}}').reminders
    ).toEqual({ 'p-1': true });
  });

  test('flip on, persist, read back; flip off removes the key entirely', async () => {
    await setJanmaReminder('p-1', true, ['p-1', 'p-2']);
    expect(getJanmaPrefsSnapshot().prefs.reminders).toEqual({ 'p-1': true });
    __resetJanmaPrefsForTests();
    const reread = await loadJanmaPrefs();
    expect(reread.prefs.reminders).toEqual({ 'p-1': true });

    await setJanmaReminder('p-1', false, ['p-1', 'p-2']);
    expect(getJanmaPrefsSnapshot().prefs.reminders).toEqual({});
    expect(parseJanmaPrefs(await AsyncStorage.getItem(JANMA_TITHI_PREFS_KEY)).reminders).toEqual({});
  });

  test('a write prunes opt-ins whose person has left the roster', async () => {
    await setJanmaReminder('p-1', true, ['p-1', 'p-2']);
    await setJanmaReminder('p-2', true, ['p-1', 'p-2']);
    // p-1 was removed from the roster; the next write drops their opt-in too.
    await setJanmaReminder('p-2', true, ['p-2']);
    expect(getJanmaPrefsSnapshot().prefs.reminders).toEqual({ 'p-2': true });
  });

  test('enabling an id not on the roster stores nothing', async () => {
    await setJanmaReminder('p-ghost', true, ['p-1']);
    expect(getJanmaPrefsSnapshot().prefs.reminders).toEqual({});
  });

  test('serialize round-trips through parse', () => {
    const prefs = { reminders: { 'p-1': true as const, 'p-2': true as const } };
    expect(parseJanmaPrefs(serializeJanmaPrefs(prefs))).toEqual(prefs);
  });
});
