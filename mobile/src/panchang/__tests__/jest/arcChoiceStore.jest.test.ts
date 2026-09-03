/**
 * पर्व-अर्क choice store (PRD-28) — occurrence-scoped like the vidhi checklist:
 * a choice binds ONE sthapana date; corrupt/foreign documents parse to "no
 * choice"; listeners fire on every save/clear so the reminder scheduler and the
 * strip re-derive together.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ARC_CHOICE_KEY,
  arcChoiceFor,
  clearArcChoice,
  getArcChoicesSnapshot,
  loadArcChoices,
  parseArcChoices,
  saveArcChoice,
  subscribeArcChoices,
} from '../../arcChoiceStore';

describe('arcChoiceStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('parse: accepts only well-formed records with an offered duration', () => {
    expect(parseArcChoices(null)).toEqual({});
    expect(parseArcChoices('not json')).toEqual({});
    expect(parseArcChoices('[1,2]')).toEqual({});
    expect(
      parseArcChoices(
        JSON.stringify({
          'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 5 },
          bad1: { dateKey: '14-09-2026', durationDays: 5 },
          bad2: { dateKey: '2026-09-14', durationDays: 4 },
          bad3: 'x',
        })
      )
    ).toEqual({ 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 5 } });
  });

  test('save → load round-trips; the choice answers only for its own sthapana date', async () => {
    await saveArcChoice('ganesh-utsav', '2026-09-14', 7);
    const state = await loadArcChoices();
    expect(state).toEqual({ 'ganesh-utsav': { dateKey: '2026-09-14', durationDays: 7 } });
    expect(arcChoiceFor(state, 'ganesh-utsav', '2026-09-14')).toBe(7);
    expect(arcChoiceFor(state, 'ganesh-utsav', '2027-09-03')).toBeNull(); // next year starts unchosen
    expect(arcChoiceFor(state, 'sharad-navratri', '2026-09-14')).toBeNull();
    expect(arcChoiceFor(null, 'ganesh-utsav', '2026-09-14')).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem(ARC_CHOICE_KEY))!)).toEqual(state);
  });

  test('clear removes the arc’s record ("decide later") and publishes; listeners see every change', async () => {
    const seen: number[] = [];
    const unsubscribe = subscribeArcChoices(() => seen.push(Object.keys(getArcChoicesSnapshot() ?? {}).length));
    await saveArcChoice('ganesh-utsav', '2026-09-14', 3);
    await clearArcChoice('ganesh-utsav');
    unsubscribe();
    expect(seen).toEqual([1, 0]);
    expect(await loadArcChoices()).toEqual({});
  });

  test('a storage failure degrades to no choice — today’s behaviour, never a crash', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk'));
    await expect(loadArcChoices()).resolves.toEqual({});
    spy.mockRestore();
  });
});
