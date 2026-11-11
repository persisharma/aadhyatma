import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  return {
    LinearGradient: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      mockReact.createElement(mockView, props, children),
  };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const {
  loadValmikiRamayanChapter,
  peekValmikiRamayanChapter,
  valmikiRamayanChaptersManifest,
} = jest.requireActual<typeof import('@/data/valmiki-ramayan')>('@/data/valmiki-ramayan');
const ValmikiRamayanReaderScreen = jest.requireActual<
  typeof import('../ValmikiRamayanReaderScreen')
>('../ValmikiRamayanReaderScreen').default;
// The global stand-in for the one native seam (jest.setup.js): reads the real
// published part files from disk.
const { readValmikiPart } = jest.requireMock<typeof import('@/data/valmiki-ramayan/partReader')>(
  '@/data/valmiki-ramayan/partReader'
);
const mockReadPart = readValmikiPart as jest.MockedFunction<typeof readValmikiPart>;
const readPartFromDisk = mockReadPart.getMockImplementation()!;

type ReaderProps = React.ComponentProps<typeof ValmikiRamayanReaderScreen>;

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = jest.fn();
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];
navigation.replace = jest.fn() as unknown as ReaderProps['navigation']['replace'];

const routeFor = (chapter: number, initialIndex = 0) =>
  ({
    key: 'ValmikiRamayanReader-test',
    name: 'ValmikiRamayanReader',
    params: { chapter, initialIndex },
  }) as ReaderProps['route'];

const screen = (route: ReaderProps['route']) => (
  <GitaLanguageProvider initialLang="hi">
    <ShareProvider>
      <ValmikiRamayanReaderScreen navigation={navigation} route={route} />
    </ShareProvider>
  </GitaLanguageProvider>
);

let tree: TestRenderer.ReactTestRenderer | undefined;
function mount(chapter: number, initialIndex = 0): TestRenderer.ReactTestRenderer {
  act(() => {
    tree = TestRenderer.create(screen(routeFor(chapter, initialIndex)));
  });
  return tree!;
}
const textOf = (t: TestRenderer.ReactTestRenderer) =>
  t.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
const has = (t: TestRenderer.ReactTestRenderer, testID: string) => t.root.findAllByProps({ testID }).length > 0;
/** Let the part reads, the parses and the yields between them run to the end. */
async function settle() {
  for (let i = 0; i < 400; i += 1) {
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(resolve));
    });
    if (tree && !has(tree, 'valmiki-chapter-loading')) return;
  }
}

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  mockReadPart.mockImplementation(readPartFromDisk);
  jest.clearAllMocks();
});

describe('a kāṇḍa that is not in memory yet', () => {
  test('opens on a loading state with a working Back, then on its first verse', async () => {
    // Kāṇḍa 4: no other test in this file loads it first.
    expect(peekValmikiRamayanChapter(4)).toBeNull();
    const t = mount(4);

    expect(has(t, 'valmiki-chapter-loading')).toBe(true);
    assert.match(textOf(t), /वाल्मीकि रामायण/);
    const loading = t.root.findByProps({ testID: 'valmiki-chapter-loading' });
    expect(loading.props.accessibilityRole).toBe('progressbar');
    expect(loading.props.accessibilityLabel).toBe('खुल रहा है');
    // Back is live while the kāṇḍa is still being read.
    const back = t.root.findAll(
      (node) => node.props.accessibilityLabel === 'Back to chapters' && typeof node.props.onPress === 'function'
    )[0];
    act(() => back.props.onPress());
    expect(navigation.goBack).toHaveBeenCalledTimes(1);

    await settle();
    const firstVerse = (await loadValmikiRamayanChapter(4)).verses[0];
    expect(has(t, 'valmiki-chapter-loading')).toBe(false);
    assert.ok(textOf(t).includes(firstVerse.lines[0]));
    assert.ok(textOf(t).includes(firstVerse.meaningHi));
  });

  test('a read that fails offers Retry, and Retry opens the kāṇḍa', async () => {
    expect(peekValmikiRamayanChapter(5)).toBeNull();
    mockReadPart.mockRejectedValue(new Error('asset unreadable'));
    const t = mount(5);
    await settle();

    expect(has(t, 'valmiki-chapter-failed')).toBe(true);
    assert.match(textOf(t), /यह काण्ड खुल नहीं सका/);
    // Nothing half-read is kept as if it were the kāṇḍa.
    expect(peekValmikiRamayanChapter(5)).toBeNull();

    mockReadPart.mockImplementation(readPartFromDisk);
    act(() => {
      t.root.findByProps({ testID: 'valmiki-chapter-retry' }).props.onPress();
    });
    expect(has(t, 'valmiki-chapter-loading')).toBe(true);
    await settle();

    const firstVerse = (await loadValmikiRamayanChapter(5)).verses[0];
    expect(has(t, 'valmiki-chapter-failed')).toBe(false);
    assert.ok(textOf(t).includes(firstVerse.lines[0]));
  });

  test('a part that is not the published part is refused, not shown', async () => {
    expect(peekValmikiRamayanChapter(7)).toBeNull();
    mockReadPart.mockResolvedValue('[]');
    const t = mount(7);
    await settle();
    expect(has(t, 'valmiki-chapter-failed')).toBe(true);
    expect(peekValmikiRamayanChapter(7)).toBeNull();
  });

  test('leaving while it loads is harmless', async () => {
    expect(peekValmikiRamayanChapter(6)).toBeNull();
    const t = mount(6);
    expect(has(t, 'valmiki-chapter-loading')).toBe(true);
    act(() => t.unmount());
    tree = undefined;
    // The load itself still completes and is kept for the next visit.
    await loadValmikiRamayanChapter(6);
    expect(peekValmikiRamayanChapter(6)).not.toBeNull();
  });
});

test('the next kāṇḍa starts loading while the last verses of this one are on screen', async () => {
  // Kāṇḍa 6 is in memory from the test above; kāṇḍa 7 was refused and is not.
  const sixth = await loadValmikiRamayanChapter(6);
  expect(peekValmikiRamayanChapter(7)).toBeNull();
  mount(6, sixth.verses.length - 3);
  for (let i = 0; i < 400 && !peekValmikiRamayanChapter(7); i += 1) {
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(resolve));
    });
  }
  expect(peekValmikiRamayanChapter(7)).not.toBeNull();
});

test('opening a kāṇḍa at its start does not load the next one', async () => {
  // Kāṇḍa 2 has not been opened by any test above.
  await loadValmikiRamayanChapter(1);
  expect(peekValmikiRamayanChapter(2)).toBeNull();
  const reads = mockReadPart.mock.calls.length;
  mount(1, 0);
  for (let i = 0; i < 20; i += 1) {
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(resolve));
    });
  }
  expect(mockReadPart.mock.calls.length).toBe(reads);
  expect(peekValmikiRamayanChapter(2)).toBeNull();
});

describe('a kāṇḍa already in memory', () => {
  test('renders its first verse on the very first commit — no loading state', async () => {
    const chapter = await loadValmikiRamayanChapter(1);
    const reads = mockReadPart.mock.calls.length;
    const t = mount(1);

    expect(has(t, 'valmiki-chapter-loading')).toBe(false);
    assert.match(textOf(t), /वाल्मीकि रामायण/);
    assert.ok(textOf(t).includes(chapter.verses[0].lines[0]));
    assert.ok(textOf(t).includes(chapter.verses[0].meaningHi));
    // ...and nothing is read from disk again.
    expect(mockReadPart.mock.calls.length).toBe(reads);
  });

  test('every kāṇḍa renders its first verse', async () => {
    for (const summary of valmikiRamayanChaptersManifest) {
      const chapter = await loadValmikiRamayanChapter(summary.chapter);
      expect(chapter.verses).toHaveLength(summary.verseCount);
      const t = mount(summary.chapter);
      assert.ok(
        textOf(t).includes(chapter.verses[0].lines[0]),
        `kāṇḍa ${summary.chapter} (${summary.titleEn}) did not render its first verse`
      );
      act(() => t.unmount());
      tree = undefined;
    }
  });

  test('opens at the requested verse and reports that position, never verse 1', async () => {
    const chapter = await loadValmikiRamayanChapter(2);
    const t = mount(2, 120);
    // The page counter is the reader's own account of where it is.
    assert.match(textOf(t), new RegExp(`121\\s*/\\s*${chapter.verses.length}`));
  });

  test('a route re-targeted in place to another kāṇḍa starts from that kāṇḍa’s verse', async () => {
    const second = await loadValmikiRamayanChapter(2);
    const third = await loadValmikiRamayanChapter(3);
    const t = mount(2, 50);
    assert.match(textOf(t), new RegExp(`51\\s*/\\s*${second.verses.length}`));
    act(() => {
      t.update(screen(routeFor(3, 0)));
    });
    assert.match(textOf(t), new RegExp(`1\\s*/\\s*${third.verses.length}`));
    assert.ok(textOf(t).includes(third.verses[0].lines[0]));
  });
});

test('a chapter number that is not a kāṇḍa is sent back to the chapters index', async () => {
  jest.useFakeTimers();
  const t = mount(99);
  expect(has(t, 'valmiki-chapter-loading')).toBe(false);
  expect(has(t, 'valmiki-chapter-failed')).toBe(false);
  act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(navigation.replace).toHaveBeenCalledWith('ValmikiRamayanChapters');
  jest.useRealTimers();
});
