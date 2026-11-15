import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Modal } from 'react-native';
import { DaanLedgerProvider } from '@/contexts/DaanLedgerContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import DaanLedgerScreen from '../DaanLedgerScreen';
let mockStored: string | null;
let mockLang = 'en';
let mockFactor = 1;
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockFactor }) }));
const mockSetItem = jest.fn(async (_key: string, value: string) => { mockStored = value; });
const mockShare = jest.fn(async (_value: {message: string}) => undefined);
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(async () => mockStored), setItem: (k: string, v: string) => mockSetItem(k, v) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/utils/useRatingShare', () => ({ useRatingShare: () => mockShare }));
jest.mock('@/components/ReaderHeader', () => 'ReaderHeader');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
const entry = { id: 'one', isoDate: '2026-11-10', category: 'anna', gupt: false, note: 'Khichdi at the temple', amountInr: 98765, tithiHi: 'तिथि', tithiEn: 'Stored tithi', createdAtMs: 123 };
const other = { ...entry, id: 'two', isoDate: '2025-12-31', note: 'Other record' };
let tree: TestRenderer.ReactTestRenderer;
const navigation = { goBack: jest.fn(), navigate: jest.fn(), addListener: jest.fn(() => jest.fn()) };
async function mount() { await act(async () => { tree = TestRenderer.create(<ThemeProvider><DaanLedgerProvider><DaanLedgerScreen navigation={navigation as never} route={{} as never} /></DaanLedgerProvider></ThemeProvider>); }); }
const node = (id: string) => tree.root.findAllByProps({ testID: id })[0];
const press = async (id: string) => { await act(async () => node(id).props.onPress()); };
const stored = () => JSON.parse(mockStored!).entries;
beforeEach(() => { jest.clearAllMocks(); mockLang = 'en'; mockFactor = 1; mockStored = JSON.stringify({ version: 1, entries: [entry, other] }); });
afterEach(async () => { if (tree) await act(async () => tree.unmount()); });
test('opening does not write; confirm removes only the selected stable ID once and survives restart', async () => {
  await mount(); await press('daan-entry-remove-one'); expect(mockSetItem).not.toHaveBeenCalled();
  expect(JSON.stringify(node('daan-remove-identity').props.children)).toContain('2026-11-10');
  expect(node('daan-remove-note').props.children).toBe(entry.note);
  const confirm = node('daan-remove-confirm').props.onPress;
  await act(async () => { confirm(); confirm(); });
  expect(mockSetItem).toHaveBeenCalledTimes(1); expect(stored()).toEqual([other]);
  await act(async () => tree.unmount()); await mount();
  expect(node('daan-entry-one')).toBeUndefined(); expect(node('daan-entry-two')).toBeDefined();
});
test.each(['cancel', 'backdrop', 'back'])('%s preserves bytes without writing', async (dismiss) => {
  await mount(); const original = mockStored; await press('daan-entry-remove-one');
  if (dismiss === 'back') await act(async () => tree.root.findByType(Modal).props.onRequestClose());
  else await press(`daan-remove-${dismiss}`);
  expect(mockStored).toBe(original); expect(mockSetItem).not.toHaveBeenCalled(); expect(node('daan-remove-dialog')).toBeUndefined();
});
test('restart while pending keeps the record and clears confirmation', async () => {
  await mount(); await press('daan-entry-remove-one'); await act(async () => tree.unmount()); await mount();
  expect(node('daan-remove-dialog')).toBeUndefined(); expect(node('daan-entry-one')).toBeDefined(); expect(mockSetItem).not.toHaveBeenCalled();
});
test.each(['hi', 'en', 'gu', 'kn'])('Gupt confirmation exposes only public identity/date in %s; final deletion empties register', async (lang) => {
  mockLang = lang; mockStored = JSON.stringify({ version: 1, entries: [{ ...entry, gupt: true, note: undefined, amountInr: undefined }] });
  await mount(); await press('daan-entry-remove-one');
  const identity = JSON.stringify(node('daan-remove-identity').props.children);
  expect(identity).toContain('2026-11-10'); expect(identity).not.toMatch(/Anna|अन्न|અન્ન|ಅನ್ನ|Khichdi|98765|Stored tithi/);
  expect(node('daan-remove-note')).toBeUndefined(); await press('daan-remove-confirm'); expect(stored()).toEqual([]);
  expect(node('daan-ledger-export')).toBeUndefined(); expect(node('daan-ledger-empty-katha')).toBeDefined();
});
test('long notes remain complete; cancel preserves export and add navigation', async () => {
  const long = 'A long personal memory. '.repeat(300); mockStored = JSON.stringify({ version: 1, entries: [{ ...entry, note: long }, other] });
  await mount(); await press('daan-entry-remove-one'); expect(node('daan-remove-note').props.children).toBe(long);
  expect(node('daan-remove-note').props.numberOfLines).toBeUndefined(); await press('daan-remove-cancel'); await press('daan-ledger-export');
  expect(mockShare.mock.calls[0][0].message).toContain(long); await press('daan-ledger-add'); expect(navigation.navigate).toHaveBeenCalledWith('DaanEntry', {});
});

test('blur cancels without writing, and repeated remove taps keep the original target', async () => {
  await mount(); await press('daan-entry-remove-one'); await press('daan-entry-remove-two');
  expect(JSON.stringify(node('daan-remove-identity').props.children)).toContain('2026-11-10');
  const blur = (navigation.addListener.mock.calls as unknown as [string, () => void][]).find(([event]) => event === 'blur')![1];
  await act(async () => blur()); expect(mockSetItem).not.toHaveBeenCalled(); expect(node('daan-remove-dialog')).toBeUndefined();
});

test('failed existing optimistic storage write is not represented as durable deletion', async () => {
  await mount(); await press('daan-entry-remove-one');
  mockSetItem.mockImplementationOnce(async () => { throw new Error('storage full'); });
  await press('daan-remove-confirm'); expect(node('daan-entry-one')).toBeUndefined();
  await act(async () => tree.unmount()); await mount();
  // Existing provider behavior: failed write leaves the original stored bytes.
  expect(node('daan-entry-one')).toBeDefined();
});


test.each(['hi', 'en', 'gu', 'kn'].flatMap(lang => [1, 1.15].map(factor => [lang, factor] as const)))('confirmation keeps actions and complete notes in %s at scale %s', async (lang, factor) => {
  mockLang = lang; mockFactor = factor; await mount(); await press('daan-entry-remove-one');
  expect(node('daan-remove-note').props.children).toBe(entry.note);
  expect(node('daan-remove-note').props.allowFontScaling).not.toBe(false);
  expect(node('daan-remove-confirm').props.accessibilityRole).toBe('button');
  expect(node('daan-remove-cancel').props.accessibilityLabel).toBeTruthy();
  expect(node('daan-remove-dialog').props.accessibilityViewIsModal).toBe(true);
});

test('a stale confirmation cannot delete a newly selected record', async () => {
  await mount(); await press('daan-entry-remove-one'); const old = node('daan-remove-confirm').props.onPress;
  await press('daan-remove-cancel'); await press('daan-entry-remove-two');
  await act(async () => old()); expect(mockSetItem).not.toHaveBeenCalled();
  await press('daan-remove-confirm'); expect(stored()).toEqual([entry]);
});
