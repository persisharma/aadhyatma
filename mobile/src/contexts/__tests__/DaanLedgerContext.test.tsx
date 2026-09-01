import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View } from 'react-native';

/**
 * DaanLedgerContext (PRD-26): versioned AsyncStorage payload
 * (`@vedansh/daan-ledger:v1`), tolerant hydration, add/remove that always
 * persists the versioned shape — and the gupt guarantee at the context
 * boundary: a gupt entry is sanitized (note/amount/occasion stripped) BEFORE
 * it is stored, so the detail never reaches disk.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
const mockSetItem = jest.fn((_key: string, _value: string) => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: (key: string, value: string) => mockSetItem(key, value),
}));

import { DaanLedgerProvider, useDaanLedger } from '../DaanLedgerContext';
import { DAAN_LEDGER_STORAGE_KEY, type DaanLedgerEntry } from '@/data/daan/ledger';

const VALID_ENTRY: DaanLedgerEntry = {
  id: 'daan-1',
  isoDate: '2026-01-14',
  tithiHi: 'माघ कृष्ण द्वितीया, रविवार',
  tithiEn: 'Magha Krishna Dwitiya, Sunday',
  category: 'anna',
  gupt: false,
  note: 'खिचड़ी',
  createdAtMs: 1700000000000,
};

type Captured = ReturnType<typeof useDaanLedger>;

function Consumer({ onValue }: { onValue: (value: Captured) => void }) {
  onValue(useDaanLedger());
  return <View />;
}

async function renderWithProvider(): Promise<{ tree: TestRenderer.ReactTestRenderer; value: () => Captured }> {
  let latest: Captured | null = null;
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <DaanLedgerProvider>
        <Consumer onValue={(v) => { latest = v; }} />
      </DaanLedgerProvider>
    );
  });
  return { tree, value: () => latest as unknown as Captured };
}

afterEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockImplementation(() => Promise.resolve(null));
});

test('hydrates from the versioned payload and filters malformed rows', async () => {
  mockGetItem.mockImplementation(() =>
    Promise.resolve(JSON.stringify({ version: 1, entries: [VALID_ENTRY, { id: 'broken' }] }))
  );
  const { tree, value } = await renderWithProvider();
  expect(value().isLoading).toBe(false);
  expect(value().entries).toEqual([VALID_ENTRY]);
  await act(async () => tree.unmount());
});

test('addEntry persists the versioned shape with the new entry first', async () => {
  const { tree, value } = await renderWithProvider();
  await act(async () => value().addEntry({ ...VALID_ENTRY, id: 'daan-2' }));
  expect(value().entries.map((e) => e.id)).toEqual(['daan-2']);
  const [key, raw] = mockSetItem.mock.calls[0];
  expect(key).toBe(DAAN_LEDGER_STORAGE_KEY);
  expect(JSON.parse(raw).version).toBe(1);
  await act(async () => tree.unmount());
});

test('a gupt entry is stripped of note/amount/occasion before it touches disk', async () => {
  const { tree, value } = await renderWithProvider();
  await act(async () =>
    value().addEntry({
      ...VALID_ENTRY,
      id: 'daan-3',
      gupt: true,
      note: 'secret detail',
      amountInr: 501,
      occasionId: 'makar-sankranti',
    })
  );
  const stored = JSON.parse(mockSetItem.mock.calls[0][1]);
  expect(stored.entries[0].gupt).toBe(true);
  expect(stored.entries[0].note).toBeUndefined();
  expect(stored.entries[0].amountInr).toBeUndefined();
  expect(stored.entries[0].occasionId).toBeUndefined();
  expect(mockSetItem.mock.calls[0][1]).not.toContain('secret detail');
  await act(async () => tree.unmount());
});

test('removeEntry deletes and persists', async () => {
  mockGetItem.mockImplementation(() =>
    Promise.resolve(JSON.stringify({ version: 1, entries: [VALID_ENTRY] }))
  );
  const { tree, value } = await renderWithProvider();
  await act(async () => value().removeEntry(VALID_ENTRY.id));
  expect(value().entries).toEqual([]);
  expect(JSON.parse(mockSetItem.mock.calls[0][1]).entries).toEqual([]);
  await act(async () => tree.unmount());
});
