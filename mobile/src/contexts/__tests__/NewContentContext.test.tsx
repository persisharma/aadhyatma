import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewContentProvider, useNewContent } from '../NewContentContext';

// Stateful in-memory AsyncStorage mock (jest requires the `mock` prefix to
// reference the closure variable from the hoisted factory; jest.mock is hoisted
// above these imports by babel-jest, so the mock still applies).
let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStore))),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

const STORAGE_KEY = '@vedansh/new-content-state';

type Ctx = ReturnType<typeof useNewContent>;
let captured!: Ctx;
function Probe() {
  captured = useNewContent();
  return null;
}

async function flush() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });
}

async function mountAndHydrate(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <NewContentProvider>
        <Probe />
      </NewContentProvider>
    );
  });
  await flush();
  return tree;
}

beforeEach(() => {
  mockStore = {};
  jest.clearAllMocks();
});

describe('NewContentContext', () => {
  test('fresh install: nothing new; all discoverable ids seeded as known', async () => {
    await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.isNew('krishna-stotram')).toBe(false);
    expect(captured.isNew('bajrang-baan')).toBe(false);
    expect(captured.hasNewInCategory('stotram')).toBe(false);
    const persisted = JSON.parse(mockStore[STORAGE_KEY]);
    expect(persisted.knownIds).toContain('krishna-stotram');
    expect(persisted.knownIds).toContain('hanuman-chalisa');
  });

  test('upgrader (user-action key present): debut-tagged entries are new', async () => {
    mockStore['@vedansh/reading-progress'] = JSON.stringify({});
    await mountAndHydrate();
    expect(captured.isNew('krishna-stotram')).toBe(true);
    expect(captured.isNew('bajrang-baan')).toBe(true);
    expect(captured.isNew('ram-stuti')).toBe(true);
    expect(captured.isNew('hanuman-chalisa')).toBe(false);
    expect(captured.hasNewInCategory('stotram')).toBe(true);
    expect(captured.hasNewInCategory('sanskar')).toBe(true);
    expect(captured.isNew('prabhati-shloka')).toBe(true);
    expect(captured.hasNewInCategory('granth')).toBe(false);
    expect(captured.hasNewInCategory('deity')).toBe(false);
  });

  test('race-proof: a mount-written key alone does NOT mark an upgrader', async () => {
    mockStore['@vedansh/notif-meta'] = JSON.stringify({ any: true });
    await mountAndHydrate();
    expect(captured.isNew('krishna-stotram')).toBe(false);
    expect(captured.hasNewInCategory('stotram')).toBe(false);
  });

  test('markSeen clears NEW for one entry, persists, and leaves others new', async () => {
    mockStore['@vedansh/bookmarks'] = '[]';
    const tree1 = await mountAndHydrate();
    expect(captured.isNew('krishna-stotram')).toBe(true);

    await act(async () => {
      captured.markSeen('krishna-stotram');
      await Promise.resolve();
    });
    expect(captured.isNew('krishna-stotram')).toBe(false);
    expect(captured.isNew('bajrang-baan')).toBe(true);
    expect(JSON.parse(mockStore[STORAGE_KEY]).knownIds).toContain('krishna-stotram');

    await act(async () => {
      tree1.unmount();
    });
    // Remount from persisted state.
    await mountAndHydrate();
    expect(captured.isNew('krishna-stotram')).toBe(false);
    expect(captured.isNew('bajrang-baan')).toBe(true);
  });

  test('OTA-style: an id absent from stored knownIds is new, version-agnostic', async () => {
    mockStore[STORAGE_KEY] = JSON.stringify({
      knownIds: ['hanuman-chalisa', 'bhagavad-gita'], // krishna-stotram NOT known
    });
    await mountAndHydrate();
    expect(captured.isNew('krishna-stotram')).toBe(true);
    expect(captured.isNew('hanuman-chalisa')).toBe(false);
  });

  test('corrupt stored blob is treated as debut without throwing', async () => {
    mockStore[STORAGE_KEY] = '{not valid json';
    await mountAndHydrate(); // no user-action keys → fresh
    expect(captured.isLoading).toBe(false);
    expect(captured.isNew('krishna-stotram')).toBe(false);
  });

  test('isNew is false for an unknown / non-discoverable id', async () => {
    mockStore['@vedansh/bookmarks'] = '[]';
    await mountAndHydrate();
    expect(captured.isNew('does-not-exist')).toBe(false);
  });

  test('storage read failure marks nothing new (safe fallback, not everything new)', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await mountAndHydrate();
    expect(captured.isLoading).toBe(false);
    expect(captured.isNew('krishna-stotram')).toBe(false);
    expect(captured.isNew('hanuman-chalisa')).toBe(false);
    expect(captured.hasNewInCategory('stotram')).toBe(false);
  });

  test('devSimulateUpgrade forces the upgrader state (dev test hook)', async () => {
    await mountAndHydrate(); // fresh → nothing new
    expect(captured.isNew('krishna-stotram')).toBe(false);
    await act(async () => {
      captured.devSimulateUpgrade();
      await Promise.resolve();
    });
    expect(captured.isNew('krishna-stotram')).toBe(true);
    expect(captured.hasNewInCategory('stotram')).toBe(true);
  });

  test('devResetNewState clears NEW back to the nothing-new state (and persists)', async () => {
    mockStore['@vedansh/reading-progress'] = JSON.stringify({}); // upgrader
    await mountAndHydrate();
    expect(captured.isNew('krishna-stotram')).toBe(true);
    await act(async () => {
      captured.devResetNewState();
      await Promise.resolve();
    });
    expect(captured.isNew('krishna-stotram')).toBe(false);
    expect(captured.hasNewInCategory('stotram')).toBe(false);
    expect(JSON.parse(mockStore[STORAGE_KEY]).knownIds).toContain('krishna-stotram');
  });
});
