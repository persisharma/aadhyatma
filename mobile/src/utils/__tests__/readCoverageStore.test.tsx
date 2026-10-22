import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { __resetReadCoverageStore, markRead, resetChapter, restore, useReadCoverage } from '../readCoverageStore';
import { READ_DWELL_MS, useReadDwell } from '@/screens/_useReadDwell';

let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
}));

const KEY = '@vedansh/read-coverage';
const PROGRESS_KEY = '@vedansh/reading-progress';

type View = ReturnType<typeof useReadCoverage>;
let view!: View;
function Probe() {
  view = useReadCoverage();
  return null;
}

function Reader({ verseIndex }: { verseIndex: number }) {
  useReadDwell('bhagavad-gita', 3, verseIndex);
  return null;
}

async function flush() {
  await act(async () => {
    for (let i = 0; i < 6; i++) await Promise.resolve();
  });
}

async function mount(el: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(el);
  });
  await flush();
  return tree;
}

beforeEach(() => {
  mockStore = {};
  __resetReadCoverageStore();
  jest.useRealTimers();
});

test('first launch seeds coverage once from saved positions and persists it', async () => {
  mockStore[PROGRESS_KEY] = JSON.stringify({
    'bhagavad-gita::3': { sourceId: 'bhagavad-gita', chapter: 3, verseIndex: 4, updatedAt: 1 },
  });
  await mount(<Probe />);
  expect(view.isLoading).toBe(false);
  expect(view.getChapterCoverage('bhagavad-gita', 3)).toEqual({ chapter: 3, read: 5, total: 43, complete: false });
  expect(JSON.parse(mockStore[KEY]).read['bhagavad-gita::3']).toEqual([[0, 4]]);
});

test('an install with no saved positions still persists an (empty) seed, so it never re-seeds', async () => {
  await mount(<Probe />);
  expect(view.isLoading).toBe(false);
  expect(JSON.parse(mockStore[KEY]).read).toEqual({});
});

test('a stored blob wins over the backfill, and marks/resets/undo update every reader of the store', async () => {
  mockStore[KEY] = JSON.stringify({ v: 1, read: { 'bhagavad-gita::2': [[0, 9]] }, paath: {}, paathAt: {} });
  mockStore[PROGRESS_KEY] = JSON.stringify({
    'bhagavad-gita::3': { sourceId: 'bhagavad-gita', chapter: 3, verseIndex: 20, updatedAt: 1 },
  });
  await mount(<Probe />);
  expect(view.getChapterCoverage('bhagavad-gita', 3)?.read).toBe(0);
  expect(view.getChapterCoverage('bhagavad-gita', 2)?.read).toBe(10);

  await act(async () => markRead('bhagavad-gita', 2, 10));
  expect(view.getChapterCoverage('bhagavad-gita', 2)?.read).toBe(11);

  let removed!: ReturnType<typeof resetChapter>;
  await act(async () => {
    removed = resetChapter('bhagavad-gita', 2);
  });
  expect(view.getChapterCoverage('bhagavad-gita', 2)?.read).toBe(0);
  await act(async () => restore(removed));
  expect(view.getChapterCoverage('bhagavad-gita', 2)?.read).toBe(11);
  expect(JSON.parse(mockStore[KEY]).read['bhagavad-gita::2']).toEqual([[0, 10]]);
});

describe('useReadDwell', () => {
  async function mountReader(verseIndex: number) {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    return mount(
      <>
        <Probe />
        <Reader verseIndex={verseIndex} />
      </>
    );
  }
  const show = (tree: TestRenderer.ReactTestRenderer, verseIndex: number) =>
    act(async () => tree.update(<><Probe /><Reader verseIndex={verseIndex} /></>));
  const wait = (ms: number) =>
    act(async () => {
      jest.advanceTimersByTime(ms);
    });

  test('a verse kept on screen for the dwell time is marked when the reader pages on', async () => {
    const tree = await mountReader(5);
    await wait(READ_DWELL_MS);
    expect(view.isVerseRead('bhagavad-gita', 3, 5)).toBe(false); // recorded on leaving, not mid-read
    await show(tree, 6);
    expect(view.isVerseRead('bhagavad-gita', 3, 5)).toBe(true);
    expect(view.isVerseRead('bhagavad-gita', 3, 6)).toBe(false);
  });

  test('a fast swipe past a verse marks nothing', async () => {
    const tree = await mountReader(4);
    await wait(READ_DWELL_MS - 1);
    await show(tree, 5);
    expect(view.isVerseRead('bhagavad-gita', 3, 4)).toBe(false);
  });

  test('leaving the reader records the verse only if it stayed long enough', async () => {
    const tree = await mountReader(8);
    await wait(1000);
    await act(async () => tree.update(<Probe />));
    expect(view.isVerseRead('bhagavad-gita', 3, 8)).toBe(false);

    await act(async () => tree.update(<><Probe /><Reader verseIndex={9} /></>));
    await wait(READ_DWELL_MS);
    await act(async () => tree.update(<Probe />));
    expect(view.isVerseRead('bhagavad-gita', 3, 9)).toBe(true);
  });

  test('time in the background never counts; returning restarts the clock', async () => {
    const listeners: ((s: string) => void)[] = [];
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, cb: (s: string) => void) => {
      listeners.push(cb);
      return { remove: () => undefined };
    }) as unknown as typeof AppState.addEventListener);
    const tree = await mountReader(10);
    await wait(2000);
    await act(async () => listeners.forEach((l) => l('background')));
    await wait(10_000);
    await act(async () => listeners.forEach((l) => l('active')));
    await wait(2000);
    await show(tree, 11);
    expect(view.isVerseRead('bhagavad-gita', 3, 10)).toBe(false); // 2 s + 2 s, never 3 s in one stretch

    await wait(READ_DWELL_MS);
    await act(async () => listeners.forEach((l) => l('background'))); // backgrounding after 3 s records it
    expect(view.isVerseRead('bhagavad-gita', 3, 11)).toBe(true);
    spy.mockRestore();
  });
});
