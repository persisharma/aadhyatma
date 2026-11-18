import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DaanEntryScreen from '../DaanEntryScreen';
import { DaanLedgerProvider } from '@/contexts/DaanLedgerContext';
import { buildLedgerCsv, parseLedgerPayload } from '@/data/daan/ledger';
let mockLang = 'en';
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/components/ReaderHeader', () => 'ReaderHeader');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant'],
  useTodayPanchang: () => ({ today: { tithi: { paksha: 'shukla', nameHi: 'नवमी', nameEn: 'Navami' }, lunarMonth: { nameHi: 'कार्तिक', nameEn: 'Kartika' }, vara: { nameHi: 'बुधवार', nameEn: 'Wednesday' } } }),
}));
const goBack = jest.fn();
let tree: TestRenderer.ReactTestRenderer;
const node = (id: string) => tree.root.findAllByProps({ testID: id })[0];
const input = async (id: string, value: string) => { await act(async () => node(id).props.onChangeText(value)); };
const save = async () => { await act(async () => node('daan-entry-save').props.onPress()); };
beforeEach(async () => {
  jest.clearAllMocks(); mockLang = 'en';
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  await act(async () => { tree = TestRenderer.create(<DaanLedgerProvider><DaanEntryScreen navigation={{ goBack } as never} route={{ params: { occasionId: 'test' } } as never} /></DaanLedgerProvider>); });
});
afterEach(async () => { await act(async () => tree.unmount()); });
it.each(['1,000', '₹१,०००', '૧,૦૦૦', '೧,೦೦೦'])('saves %s through the real provider and CSV', async inputText => {
  await input('daan-entry-amount', inputText);
  expect(JSON.stringify(node('daan-amount-preview').props.children)).toContain('₹1,000.00');
  await save();
  const raw = (AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)[1];
  const entries = parseLedgerPayload(raw);
  expect(entries[0].amountInr).toBe(1000);
  expect(buildLedgerCsv(entries)).toMatch(/,1000$/);
  expect(goBack).toHaveBeenCalledTimes(1);
});
it.each(['en', 'hi', 'gu', 'kn'])('blocks invalid save and retains the draft in %s', async lang => {
  mockLang = lang;
  await input('daan-entry-note', 'My note');
  await input('daan-entry-amount', '500abc');
  await save();
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  expect(goBack).not.toHaveBeenCalled();
  expect(node('daan-entry-amount').props.value).toBe('500abc');
  expect(node('daan-entry-note').props.value).toBe('My note');
  expect(node('daan-amount-error').props.accessibilityRole).toBe('alert');
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(node('daan-amount-error').props.children);
  await input('daan-entry-amount', '500.50');
  expect(tree.root.findAllByProps({ testID: 'daan-amount-error' })).toHaveLength(0);
  await save();
  expect(parseLedgerPayload((AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)[1])[0]).toMatchObject({ amountInr: 500.5, note: 'My note' });
});
it('allows blank and clears stale validation after deleting invalid input', async () => {
  await input('daan-entry-amount', '₹'); await save();
  await input('daan-entry-amount', ''); await save();
  expect(parseLedgerPayload((AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)[1])[0].amountInr).toBeUndefined();
});
it('Gupt bypasses invalid hidden input and never persists or displays details', async () => {
  await input('daan-entry-amount', '500abc');
  await input('daan-entry-note', 'Secret');
  await act(async () => node('daan-gupt-switch').props.onValueChange(true));
  expect(tree.root.findAllByProps({ testID: 'daan-amount-preview' })).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: 'daan-entry-amount' })).toHaveLength(0);
  await save();
  const raw = (AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)[1];
  expect(raw).not.toMatch(/Secret|500abc|amountInr|occasionId/);
  expect(parseLedgerPayload(raw)[0].gupt).toBe(true);
});
