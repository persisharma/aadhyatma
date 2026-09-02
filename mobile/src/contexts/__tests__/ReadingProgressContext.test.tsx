import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ReadingProgressProvider, useReadingProgress } from '../ReadingProgressContext';
import { toDateKey } from '@/contexts/UserActivityContext';

// Stateful in-memory AsyncStorage mock.
let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
}));

// ReadingProgressProvider depends on useUserActivity().logRead — stub it with
// a shared spy so tests can assert when a read is (not) logged.
const mockLogRead = jest.fn();
jest.mock('@/contexts/UserActivityContext', () => ({
  ...jest.requireActual('@/contexts/UserActivityContext'),
  useUserActivity: () => ({ logRead: mockLogRead }),
}));

const STORAGE_KEY = '@vedansh/reading-progress';

type Ctx = ReturnType<typeof useReadingProgress>;
let captured!: Ctx;
function Probe() {
  captured = useReadingProgress();
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
      <ReadingProgressProvider>
        <Probe />
      </ReadingProgressProvider>
    );
  });
  await flush();
  return tree;
}

beforeEach(() => {
  mockStore = {};
  jest.clearAllMocks();
});

describe('ReadingProgressContext — per-subsection progress', () => {
  test('tracks each chapter separately; reading a 2nd chapter does not clobber the 1st', async () => {
    await mountAndHydrate();

    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 1, verseIndex: 4, updatedAt: 100 });
    });
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 3, verseIndex: 9, updatedAt: 200 });
    });

    expect(captured.getChapterProgress('sundarkand', 1)?.verseIndex).toBe(4);
    expect(captured.getChapterProgress('sundarkand', 3)?.verseIndex).toBe(9);
  });

  test('getProgress returns the most-recently-updated position across chapters', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.setProgress({ sourceId: 'bhagavad-gita', chapter: 2, verseIndex: 10, updatedAt: 100 });
    });
    await act(async () => {
      captured.setProgress({ sourceId: 'bhagavad-gita', chapter: 1, verseIndex: 3, updatedAt: 300 });
    });

    const latest = captured.getProgress('bhagavad-gita');
    expect(latest?.chapter).toBe(1);
    expect(latest?.verseIndex).toBe(3);
  });

  test('getChapterProgress is undefined for an unread chapter (so it falls back to verse 1)', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 1, verseIndex: 4, updatedAt: 100 });
    });
    expect(captured.getChapterProgress('sundarkand', 5)).toBeUndefined();
  });

  test('clearProgress removes every chapter for the source', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 1, verseIndex: 4, updatedAt: 100 });
    });
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 3, verseIndex: 9, updatedAt: 200 });
    });
    await act(async () => {
      captured.clearProgress('sundarkand');
    });
    expect(captured.getChapterProgress('sundarkand', 1)).toBeUndefined();
    expect(captured.getChapterProgress('sundarkand', 3)).toBeUndefined();
    expect(captured.getProgress('sundarkand')).toBeUndefined();
  });

  test('clearChapterProgress removes only the named chapter, leaving siblings intact', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 1, verseIndex: 4, updatedAt: 100 });
    });
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 3, verseIndex: 9, updatedAt: 200 });
    });
    await act(async () => {
      captured.clearChapterProgress('sundarkand', 3);
    });
    expect(captured.getChapterProgress('sundarkand', 3)).toBeUndefined();
    expect(captured.getChapterProgress('sundarkand', 1)?.verseIndex).toBe(4);
  });

  test('migrates a legacy book-keyed entry to the per-chapter key', async () => {
    // Legacy shape: keyed by bare sourceId, one position per book.
    mockStore[STORAGE_KEY] = JSON.stringify({
      sundarkand: { sourceId: 'sundarkand', chapter: 2, verseIndex: 6, updatedAt: 50 },
    });
    await mountAndHydrate();

    // Old position is still reachable, now addressable per chapter.
    expect(captured.getChapterProgress('sundarkand', 2)?.verseIndex).toBe(6);
    expect(captured.getProgress('sundarkand')?.verseIndex).toBe(6);

    // Re-persisted under the composite key.
    const persisted = JSON.parse(mockStore[STORAGE_KEY]);
    expect(persisted['sundarkand::2']).toBeTruthy();
    expect(persisted.sundarkand).toBeUndefined();
  });

  test('refreshes same-page progress when the saved timestamp is from an earlier day', async () => {
    const stale = new Date();
    stale.setDate(stale.getDate() - 1);
    mockStore[STORAGE_KEY] = JSON.stringify({
      'durga-chalisa': {
        sourceId: 'durga-chalisa',
        verseIndex: 40,
        updatedAt: stale.getTime(),
      },
    });
    await mountAndHydrate();

    await act(async () => {
      captured.setProgress({
        sourceId: 'durga-chalisa',
        verseIndex: 40,
        updatedAt: Date.now(),
      });
    });

    const refreshed = captured.getProgress('durga-chalisa');
    expect(refreshed?.verseIndex).toBe(40);
    expect(toDateKey(new Date(refreshed!.updatedAt))).toBe(toDateKey(new Date()));
  });

  test('same-page same-day write is a hard no-op — updatedAt untouched, no read logged', async () => {
    // Anchor mid-day so "+5 minutes" cannot cross midnight.
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    mockStore[STORAGE_KEY] = JSON.stringify({
      'ratri-shloka': { sourceId: 'ratri-shloka', verseIndex: 3, updatedAt: noon.getTime() },
    });
    await mountAndHydrate();
    mockLogRead.mockClear();

    // Re-opening a text at its saved page must NOT bump updatedAt: routine and
    // sadhana completion (and their doneAt timestamps) are derived live from
    // getProgress()'s max-updatedAt entry, so a bump on a sibling chapter's
    // re-open would flip which entry is "latest" and un-complete done items.
    await act(async () => {
      captured.setProgress({
        sourceId: 'ratri-shloka',
        verseIndex: 3,
        updatedAt: noon.getTime() + 5 * 60_000,
      });
    });
    expect(captured.getProgress('ratri-shloka')?.updatedAt).toBe(noon.getTime());
    expect(mockLogRead).not.toHaveBeenCalled();
  });

  test('setProgress keeps a stable identity across writes (mounted readers must not re-run persist effects on every write)', async () => {
    await mountAndHydrate();
    const before = captured.setProgress;
    await act(async () => {
      captured.setProgress({ sourceId: 'sundarkand', chapter: 1, verseIndex: 4, updatedAt: 100 });
    });
    expect(captured.getChapterProgress('sundarkand', 1)?.verseIndex).toBe(4);
    expect(captured.setProgress).toBe(before);
  });
});
