import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ReadingProgressProvider } from '@/contexts/ReadingProgressContext';
import LibraryCard from '@/components/LibraryCard';
import GitaChapterCard from '@/components/GitaChapterCard';
import GranthProgressScope from '@/components/GranthProgressScope';
import ProgressResetDialog from '@/components/ProgressResetDialog';
import { useResumeSheetCoverage } from '@/components/useResumeSheetCoverage';
import { gitaChaptersManifest } from '@/data/gita';
import { library, type LibraryEntry } from '@/data/texts';
import { __resetReadCoverageStore } from '@/utils/readCoverageStore';

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

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

const gita = library.find((e) => e.id === 'bhagavad-gita') as LibraryEntry;
const chalisa = library.find((e) => e.id === 'hanuman-chalisa') as LibraryEntry;
const COVERAGE_KEY = '@vedansh/read-coverage';

/** Gita ch 1 complete (47), ch 3 read to 3.23 but the position back at 3.5 after a Start Over. */
function seedGita() {
  mockStore[COVERAGE_KEY] = JSON.stringify({
    v: 1,
    read: { 'bhagavad-gita::1': [[0, 46]], 'bhagavad-gita::3': [[0, 22]] },
    paath: { 'hanuman-chalisa': 2 },
    paathAt: {},
  });
  mockStore['@vedansh/reading-progress'] = JSON.stringify({
    'bhagavad-gita::1': { sourceId: 'bhagavad-gita', chapter: 1, verseIndex: 46, updatedAt: 1 },
    'bhagavad-gita::3': { sourceId: 'bhagavad-gita', chapter: 3, verseIndex: 4, updatedAt: 2 },
  });
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

// Every tree is unmounted after its test: the reset undo holds a 6 s timer that
// must not fire after Jest tears the environment down.
const mounted: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => {
    mounted.splice(0).forEach((t) => t.unmount());
  });
});

async function render(el: React.ReactElement, lang: 'hi' | 'en' = 'hi') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <ReadingProgressProvider>{el}</ReadingProgressProvider>
      </GitaLanguageProvider>
    );
  });
  await act(async () => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
  });
  mounted.push(tree);
  return tree;
}

beforeEach(() => {
  mockStore = {};
  __resetReadCoverageStore();
  jest.clearAllMocks();
});

describe('LibraryCard read coverage', () => {
  test('a chaptered text shows a bar with percent read and where you stopped', async () => {
    seedGita();
    const tree = await render(<LibraryCard entry={gita} onPress={() => undefined} />);
    expect(tree.root.findAllByProps({ testID: 'library-card-progress' }).length).toBeGreaterThan(0);
    expect(textOf(tree)).toContain('9% · 3.5'); // floor(70 / 701 · 100)
  });

  test('a short text shows its पाठ count instead of a bar', async () => {
    seedGita();
    const tree = await render(<LibraryCard entry={chalisa} onPress={() => undefined} />);
    expect(textOf(tree)).toContain('2 पाठ');
  });

  test('an unread text renders exactly as before', async () => {
    const tree = await render(<LibraryCard entry={gita} onPress={() => undefined} />);
    expect(tree.root.findAllByProps({ testID: 'library-card-progress' })).toHaveLength(0);
  });

  test('long-press asks to reset; confirming clears the marks and offers an inline undo', async () => {
    seedGita();
    const tree = await render(<LibraryCard entry={gita} onPress={() => undefined} />, 'en');
    const card = tree.root.find((n) => n.props.accessibilityLabel?.startsWith('Bhagavad') && n.props.onLongPress);
    await act(async () => card.props.onLongPress());
    const dialog = tree.root.findByType(ProgressResetDialog);
    expect(dialog.props.visible).toBe(true);
    expect(dialog.props.readCount).toBe(70);
    await act(async () => dialog.props.onConfirm());
    expect(textOf(tree)).toContain('Progress reset');
    expect(JSON.parse(mockStore[COVERAGE_KEY]).read['bhagavad-gita::3']).toBeUndefined();
    // The पाठ count of another text is untouched; the undo restores both chapters.
    expect(JSON.parse(mockStore[COVERAGE_KEY]).paath['hanuman-chalisa']).toBe(2);
    const undo = tree.root.findByProps({ testID: 'progress-reset-undo' });
    await act(async () => undo.props.onPress());
    expect(JSON.parse(mockStore[COVERAGE_KEY]).read['bhagavad-gita::3']).toEqual([[0, 22]]);
    expect(textOf(tree)).toContain('9% · 3.5');
  });
});

describe('chapter cards inside GranthProgressScope', () => {
  async function renderList() {
    return render(
      <GranthProgressScope sourceId="bhagavad-gita">
        {gitaChaptersManifest.slice(0, 4).map((chapter) => (
          <GitaChapterCard key={chapter.chapter} chapter={chapter} onPress={() => undefined} />
        ))}
      </GranthProgressScope>
    );
  }

  test('show ✓ for a finished chapter, read count + saved verse for a partial one, and a summary', async () => {
    seedGita();
    const tree = await renderList();
    expect(tree.root.findAllByProps({ testID: 'chapter-complete' }).length).toBeGreaterThan(0);
    const text = textOf(tree);
    expect(text).toContain('23 / 43 श्लोक · अंतिम 5');
    expect(text).toContain('70 / 701 पठित · 1 / 18 पूर्ण');
    // Untouched chapter keeps today's subtitle.
    expect(text).toContain('42 श्लोक');
  });

  test('outside a scope the card is unchanged even when the chapter has been read', async () => {
    seedGita();
    const tree = await render(<GitaChapterCard chapter={gitaChaptersManifest[2]} onPress={() => undefined} />);
    expect(textOf(tree)).toContain('43 श्लोक');
    expect(textOf(tree)).not.toContain('23 / 43');
  });

  test('long-press resets just that chapter', async () => {
    seedGita();
    const tree = await renderList();
    const ch3 = tree.root.find((n) => n.props.accessibilityLabel?.startsWith('अध्याय 3') && n.props.onLongPress);
    await act(async () => ch3.props.onLongPress());
    const dialog = tree.root.findByType(ProgressResetDialog);
    expect(dialog.props.readCount).toBe(23);
    await act(async () => dialog.props.onConfirm());
    const read = JSON.parse(mockStore[COVERAGE_KEY]).read;
    expect(read['bhagavad-gita::3']).toBeUndefined();
    expect(read['bhagavad-gita::1']).toEqual([[0, 46]]);
  });
});

describe('resume sheet coverage', () => {
  let out!: ReturnType<typeof useResumeSheetCoverage>;
  const navigate = jest.fn();
  const close = jest.fn();
  function Probe() {
    out = useResumeSheetCoverage(
      gita,
      { sourceId: 'bhagavad-gita', chapter: 3, verseIndex: 4, updatedAt: 2 },
      { navigate } as unknown as Parameters<typeof useResumeSheetCoverage>[2],
      close
    );
    return null;
  }

  test('reports chapter + overall coverage and jumps to the first unread verse', async () => {
    seedGita();
    await render(<Probe />);
    expect(out.coverageHi).toBe('इस भाग में 23 / 43 पठित · कुल 9%');
    expect(out.nextUnreadHi).toBe('अध्याय 3 · श्लोक 24');
    expect(out.onAllChapters).toBeDefined();
    await act(async () => out.onNextUnread!());
    expect(close).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('GitaReader', expect.objectContaining({ chapter: 3, initialIndex: 23 }));
  });

  test('with nothing read yet it adds only the chapters link', async () => {
    await render(<Probe />);
    expect(out.coverageHi).toBeUndefined();
    expect(out.onNextUnread).toBeUndefined();
    expect(out.onAllChapters).toBeDefined();
  });
});
