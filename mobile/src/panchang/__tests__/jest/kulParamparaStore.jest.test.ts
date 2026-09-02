/**
 * कुल परम्परा store (PRD-29 Part B) — hydrate/save against the in-memory
 * AsyncStorage mock; the pure model's own invariants live in the tsx suite
 * (`__tests__/kulParampara.test.ts`).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { KUL_PARAMPARA_STORAGE_KEY, serializeKulRecord } from '../../kulParampara';
import {
  __resetKulRecordStoreForTests,
  getKulRecordSnapshot,
  kulVratRuleById,
  loadKulRecord,
  nextKulVratOccurrence,
  saveKulRecord,
} from '../../kulParamparaStore';
import { OBSERVANCE_RULES } from '../../festivals';

describe('kulParamparaStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    __resetKulRecordStoreForTests();
  });

  test('hydrates a stored record once and memoizes the read', async () => {
    await AsyncStorage.setItem(
      KUL_PARAMPARA_STORAGE_KEY,
      serializeKulRecord({ gotra: 'भारद्वाज', kuldev: { kind: 'kuldevi', deityId: 'durga' } })
    );
    const state = await loadKulRecord();
    expect(state.hydrated).toBe(true);
    expect(state.record.gotra).toBe('भारद्वाज');
    expect(state.record.kuldev).toEqual({ kind: 'kuldevi', deityId: 'durga' });
    expect(getKulRecordSnapshot()).toBe(state);
  });

  test('save normalizes, persists, and publishes only after the write lands', async () => {
    const ruleId = OBSERVANCE_RULES[0].id;
    await saveKulRecord({
      kuldev: { kind: 'kuldevta', customName: '  खेतला जी  ' },
      kulVrat: { ruleId },
      temple: { templeId: 'no-such-temple', customName: 'घर का मन्दिर' },
    });
    expect(getKulRecordSnapshot().record.kuldev).toEqual({ kind: 'kuldevta', customName: 'खेतला जी' });
    expect(getKulRecordSnapshot().record.temple).toEqual({ customName: 'घर का मन्दिर' });
    const raw = await AsyncStorage.getItem(KUL_PARAMPARA_STORAGE_KEY);
    expect(raw).not.toBeNull();
    // A fresh process reads back exactly what was published.
    __resetKulRecordStoreForTests();
    const reread = await loadKulRecord();
    expect(reread.record.kulVrat).toEqual({ ruleId });
  });

  test('a rejected write leaves the published record untouched and propagates', async () => {
    await saveKulRecord({ gotra: 'कश्यप' });
    const setItem = jest
      .spyOn(AsyncStorage, 'setItem')
      .mockRejectedValueOnce(new Error('disk full'));
    await expect(saveKulRecord({ gotra: 'भारद्वाज' })).rejects.toThrow('disk full');
    expect(getKulRecordSnapshot().record.gotra).toBe('कश्यप');
    setItem.mockRestore();
  });

  test('a corrupt stored record hydrates as the empty record, never a crash', async () => {
    await AsyncStorage.setItem(KUL_PARAMPARA_STORAGE_KEY, 'not-json');
    const state = await loadKulRecord();
    expect(state.hydrated).toBe(true);
    expect(state.record).toEqual({});
  });

  test('kulVratRuleById and nextKulVratOccurrence answer only for known rules', () => {
    expect(kulVratRuleById('no-such-rule')).toBeNull();
    expect(nextKulVratOccurrence('no-such-rule', new Date(2026, 7, 31))).toBeNull();
    const rule = OBSERVANCE_RULES.find((r) => r.visibility === 'default');
    expect(rule).toBeDefined();
    expect(kulVratRuleById(rule!.id)?.id).toBe(rule!.id);
  });
});
