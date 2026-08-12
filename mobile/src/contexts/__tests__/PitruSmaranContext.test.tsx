import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View } from 'react-native';

/**
 * PitruSmaranContext (PRD-17): versioned AsyncStorage payload
 * (`@vedansh/pitru-smaran`, `{version:1, entries:[]}`), tolerant hydration
 * (unknown versions / malformed rows dropped, corrupted JSON → empty), and CRUD
 * that always persists the versioned shape.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
const mockSetItem = jest.fn((_key: string, _value: string) => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: (key: string, value: string) => mockSetItem(key, value),
}));

import { PitruSmaranProvider, usePitruSmaran } from '../PitruSmaranContext';
import type { SmaranEntry } from '@/panchang/pitruSmaran';

const STORAGE_KEY = '@vedansh/pitru-smaran';

const VALID_ENTRY: SmaranEntry = {
  id: 'smaran-1',
  relation: 'pitaji',
  tithiRule: { lunarMonth: 11, paksha: 'krishna', tithi: 8 },
  createdAtMs: 1700000000000,
};

type Captured = ReturnType<typeof usePitruSmaran>;

function Consumer({ onValue }: { onValue: (value: Captured) => void }) {
  onValue(usePitruSmaran());
  return <View />;
}

async function renderWithProvider(): Promise<{ tree: TestRenderer.ReactTestRenderer; value: () => Captured }> {
  let latest: Captured | null = null;
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <PitruSmaranProvider>
        <Consumer onValue={(v) => { latest = v; }} />
      </PitruSmaranProvider>
    );
  });
  return { tree, value: () => latest as unknown as Captured };
}

function lastPersisted(): { version: number; entries: SmaranEntry[] } {
  const calls = mockSetItem.mock.calls.filter(([key]) => key === STORAGE_KEY);
  expect(calls.length).toBeGreaterThan(0);
  return JSON.parse(calls[calls.length - 1][1]);
}

describe('PitruSmaranContext', () => {
  let trees: TestRenderer.ReactTestRenderer[] = [];

  beforeEach(() => {
    mockGetItem.mockReset().mockResolvedValue(null);
    mockSetItem.mockReset().mockResolvedValue(undefined);
    trees = [];
  });

  // VirtualizedList-free, but unmounting in act() is the house rule for every
  // suite that renders trees with async effects (see wiki overview gotchas).
  afterEach(() => {
    act(() => {
      trees.forEach((t) => t.unmount());
    });
  });

  test('hydrates a version-1 payload', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ version: 1, entries: [VALID_ENTRY] }));
    const { tree, value } = await renderWithProvider();
    trees.push(tree);
    expect(value().isLoading).toBe(false);
    expect(value().entries).toEqual([VALID_ENTRY]);
  });

  test('drops unknown payload versions, malformed rows, and corrupted JSON', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ version: 2, entries: [VALID_ENTRY] }));
    const a = await renderWithProvider();
    trees.push(a.tree);
    expect(a.value().entries).toEqual([]);

    mockGetItem.mockResolvedValue(
      JSON.stringify({
        version: 1,
        entries: [
          VALID_ENTRY,
          { id: 'bad-1', relation: 'cousin', tithiRule: 'sarvapitri', createdAtMs: 1 }, // unknown relation
          { id: 'bad-2', relation: 'mataji', tithiRule: { lunarMonth: 13, paksha: 'shukla', tithi: 1 }, createdAtMs: 1 }, // invalid rule
          'not-an-object',
        ],
      })
    );
    const b = await renderWithProvider();
    trees.push(b.tree);
    expect(b.value().entries).toEqual([VALID_ENTRY]);

    mockGetItem.mockResolvedValue('{corrupted');
    const c = await renderWithProvider();
    trees.push(c.tree);
    expect(c.value().entries).toEqual([]);
  });

  test('addEntry persists the versioned payload', async () => {
    const { tree, value } = await renderWithProvider();
    trees.push(tree);
    await act(async () => {
      value().addEntry(VALID_ENTRY);
    });
    expect(value().entries).toEqual([VALID_ENTRY]);
    expect(lastPersisted()).toEqual({ version: 1, entries: [VALID_ENTRY] });
  });

  test('addEntry rejects an invalid entry outright', async () => {
    const { tree, value } = await renderWithProvider();
    trees.push(tree);
    await act(async () => {
      value().addEntry({ ...VALID_ENTRY, tithiRule: { lunarMonth: 0, paksha: 'shukla', tithi: 1 } });
    });
    expect(value().entries).toEqual([]);
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  test('updateEntry patches in place and keeps the id', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ version: 1, entries: [VALID_ENTRY] }));
    const { tree, value } = await renderWithProvider();
    trees.push(tree);
    await act(async () => {
      value().updateEntry('smaran-1', { relation: 'dadaji', tithiRule: 'sarvapitri' });
    });
    expect(value().entries).toEqual([
      { ...VALID_ENTRY, relation: 'dadaji', tithiRule: 'sarvapitri' },
    ]);
    expect(lastPersisted().entries[0].relation).toBe('dadaji');
  });

  test('removeEntry deletes and persists', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ version: 1, entries: [VALID_ENTRY] }));
    const { tree, value } = await renderWithProvider();
    trees.push(tree);
    await act(async () => {
      value().removeEntry('smaran-1');
    });
    expect(value().entries).toEqual([]);
    expect(lastPersisted()).toEqual({ version: 1, entries: [] });
  });

  test('getEntry resolves by id', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ version: 1, entries: [VALID_ENTRY] }));
    const { tree, value } = await renderWithProvider();
    trees.push(tree);
    expect(value().getEntry('smaran-1')).toEqual(VALID_ENTRY);
    expect(value().getEntry('missing')).toBeNull();
  });
});
