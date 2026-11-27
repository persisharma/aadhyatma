import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AccessibilityInfo, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
  (AsyncStorage.setItem as jest.Mock).mockReset().mockResolvedValue(undefined);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
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

it.each(['ios', 'android'] as const)('uses the audit keyboard wrapper on %s without dropping tap handling', async os => {
  const previous = Platform.OS;
  try {
    Platform.OS = os;
    await input('daan-entry-note', 'Re-render');
    const scroll = tree.root.findByType(ScrollView);
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.props.keyboardDismissMode).toBe('on-drag');
    expect(scroll.props.automaticallyAdjustKeyboardInsets).toBe(true);
    const avoid = tree.root.findByType(KeyboardAvoidingView);
    expect(avoid.props.enabled).toBe(os === 'android');
    expect(avoid.props.behavior).toBe(os === 'android' ? 'height' : undefined);
  } finally { Platform.OS = previous; }
});
it('retains valid input on a double write failure, then retries without a duplicate entry', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('full'));
  await input('daan-entry-note', 'Keep me');
  await input('daan-entry-amount', '₹१,०००.५०');
  await save();
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
  expect(goBack).not.toHaveBeenCalled();
  expect(node('daan-entry-amount').props.value).toBe('₹१,०००.५०');
  expect(node('daan-entry-note').props.value).toBe('Keep me');
  expect(node('daan-save-error').props.children).toContain('not saved');
  expect(node('daan-entry-save').props.disabled).toBe(false);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  await save();
  const entries = parseLedgerPayload((AsyncStorage.setItem as jest.Mock).mock.calls.at(-1)[1]);
  expect(entries).toHaveLength(1);
  expect(entries[0]).toMatchObject({ amountInr: 1000.5, note: 'Keep me' });
  expect(goBack).toHaveBeenCalledTimes(1);
});
it('waits for persistence, ignores repeat taps and locks editable fields while saving', async () => {
  let resolve!: () => void;
  (AsyncStorage.setItem as jest.Mock).mockImplementation(() => new Promise<void>(r => { resolve = r; }));
  let pending!: Promise<void>;
  await input('daan-entry-amount', '500');
  await act(async () => { pending = node('daan-entry-save').props.onPress(); });
  expect(goBack).not.toHaveBeenCalled();
  expect(node('daan-entry-save').props.accessibilityState.busy).toBe(true);
  expect(node('daan-entry-amount').props.editable).toBe(false);
  await act(async () => { await node('daan-entry-save').props.onPress(); });
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  await act(async () => { resolve(); await pending; });
  expect(goBack).toHaveBeenCalledTimes(1);
});
it('recovers a transient write failure without losing the amount', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('temporary')).mockResolvedValue(undefined);
  await input('daan-entry-amount', '૫૦૦'); await save();
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
  expect(goBack).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByProps({ testID: 'daan-save-error' })).toHaveLength(0);
});

it('gives the iOS decimal pad a Done bar that dismisses it and validates the amount', async () => {
  const dismiss = jest.spyOn(require('react-native').Keyboard, 'dismiss').mockImplementation(() => {});
  // The jest preset renders as iOS: the amount field points at the accessory.
  expect(node('daan-entry-amount').props.inputAccessoryViewID).toBe('daan-amount-accessory');
  expect(node('daan-amount-done').props.accessibilityLabel).toBe('Done');
  await act(async () => node('daan-amount-done').props.onPress());
  expect(dismiss).toHaveBeenCalledTimes(1);
  // Blur (what dismissing does) marks the field touched, so an invalid amount shows its alert.
  await input('daan-entry-amount', '500abc');
  await act(async () => node('daan-entry-amount').props.onBlur());
  expect(node('daan-amount-error').props.accessibilityRole).toBe('alert');
  dismiss.mockRestore();
});
