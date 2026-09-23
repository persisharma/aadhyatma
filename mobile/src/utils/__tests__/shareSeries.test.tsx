import React from 'react';
import { Clipboard, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare, type ShareableProse, type ShareableVerse } from '@/utils/shareVerse';
import { getKathaContent } from '@/panchang/kathaContent';
import { vratKathaShareable } from '@/utils/shareContent';

/**
 * The multi-page (series) share flow (PRD-45, design.md §39.5–§39.6): long prose opens
 * the sheet with a pages strip, the single-page rows export the highlighted page, and
 * the all-pages rows render every selected page one mount at a time and hand them to
 * the OS sheet in one call. A one-page prose share renders no strip and no all-pages
 * rows, and a verse share is untouched.
 */

let captureCount = 0;
const mockCaptureRef = jest.fn((..._args: unknown[]) => Promise.resolve(`file:///tmp/page-${++captureCount}.png`));
const mockShareAsync = jest.fn((..._args: unknown[]) => Promise.resolve());
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));
jest.mock('react-native-view-shot', () => ({
  captureRef: (...args: unknown[]) => mockCaptureRef(...args),
}));

let mockMultiAvailable = true;
const mockShareFiles = jest.fn((..._args: unknown[]) => Promise.resolve(true));
jest.mock('@/utils/multiShare', () => ({
  isMultiShareAvailable: () => mockMultiAvailable,
  shareFiles: (...args: unknown[]) => mockShareFiles(...args),
}));

jest.mock('@/components/ShareCard', () => 'ShareCard');
jest.mock('@/components/ShareStoryCanvas', () => 'ShareStoryCanvas');
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/ShareStoryFrame', () => 'ShareStoryFrame');
jest.mock('@/utils/useTodayKey', () => ({ useTodayKey: () => 'Wed Aug 26 2026' }));
// Stable references: the timely resolver's effect depends on them, so a fresh [] per
// render would re-fire it forever.
const mockNoObservances: never[] = [];
const mockCalendar = ['purnimant', jest.fn()];
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => mockCalendar,
  useObservancesForDate: () => mockNoObservances,
}));

const setString = jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
const rnShare = jest
  .spyOn(Share, 'share')
  .mockResolvedValue({ action: 'sharedAction' } as Awaited<ReturnType<typeof Share.share>>);

const katha = getKathaContent('chhath-puja-katha')!;
const LONG: ShareableProse = vratKathaShareable(katha, 0);

const SHORT: ShareableProse = {
  kind: 'prose',
  sourceId: 'test-short',
  background: null,
  sectionNameHi: 'कथा',
  sectionNameEn: 'Katha',
  scopes: [
    {
      id: 'one',
      labelHi: 'यह',
      labelEn: 'This',
      headerHi: 'छोटी',
      headerEn: 'Short',
      titleHi: 'शीर्षक',
      titleEn: 'Title',
      blocks: [{ kind: 'para', hi: 'एक छोटा वाक्य।', en: 'One short line.' }],
    },
  ],
};

const VERSE: ShareableVerse = {
  sourceId: 'hanuman-chalisa',
  sectionNameHi: 'हनुमान चालीसा',
  sectionNameEn: 'Hanuman Chalisa',
  verseLabelHi: 'चौपाई 12',
  verseLabelEn: 'Verse 12',
  linesHi: ['जय हनुमान ज्ञान गुन सागर'],
  linesEn: ['jai hanuman gyan gun sagar'],
};

const trees: TestRenderer.ReactTestRenderer[] = [];

async function open(content: ShareableProse | ShareableVerse) {
  function Trigger() {
    const { share } = useShare();
    return <Pressable accessibilityLabel="trigger" onPress={() => void share(content, 'en')} />;
  }
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <ShareProvider>
          <Trigger />
        </ShareProvider>
      </ThemeProvider>
    );
  });
  trees.push(tree!);
  await act(async () => byLabel(tree!, 'trigger').props.onPress());
  return tree!;
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

const pageButtons = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAll(
    (n) =>
      typeof n.props.accessibilityLabel === 'string' &&
      /^Page \d+$/.test(n.props.accessibilityLabel) &&
      typeof n.props.onPress === 'function'
  );

async function settle(ms = 300) {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
  });
}

describe('series share flow', () => {
  beforeEach(() => {
    captureCount = 0;
    mockMultiAvailable = true;
    mockCaptureRef.mockClear();
    mockShareAsync.mockClear();
    mockShareFiles.mockClear();
    setString.mockClear();
    rnShare.mockClear();
  });
  afterEach(() => {
    for (const tree of trees.splice(0)) act(() => tree.unmount());
  });

  test('long prose opens the sheet with a pages strip and the all-pages rows', async () => {
    const tree = await open(LONG);
    expect(pageButtons(tree).length).toBeGreaterThan(1);
    expect(byLabel(tree, 'Share all pages')).toBeDefined();
    expect(byLabel(tree, 'Share as Instagram carousel')).toBeDefined();
    // The single-page rows keep their stable labels.
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
    // Two scopes on a multi-section katha.
    expect(tree.root.findAll((n) => /^Scope: /.test(n.props.accessibilityLabel ?? '') && n.props.onPress).length).toBe(2);
  });

  test('one-page prose renders no strip and no all-pages rows', async () => {
    const tree = await open(SHORT);
    expect(pageButtons(tree)).toHaveLength(0);
    expect(byLabel(tree, 'Share all pages')).toBeUndefined();
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
  });

  test('a verse share still opens the verse sheet with no series UI', async () => {
    const tree = await open(VERSE);
    expect(byLabel(tree, 'Share all pages')).toBeUndefined();
    expect(pageButtons(tree)).toHaveLength(0);
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
  });

  test('a single-page row exports the highlighted page and names it in the caption', async () => {
    const tree = await open(LONG);
    const total = pageButtons(tree).length;
    await act(async () => pageButtons(tree)[1].props.onPress()); // highlight page 2
    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    await settle();
    expect(mockCaptureRef).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType('ProseShareCard' as never).length).toBe(0); // sheet + mount gone
    expect(rnShare).toHaveBeenCalledTimes(1);
    const payload = rnShare.mock.calls[0][0] as { message: string; url: string };
    expect(payload.url).toBe('file:///tmp/page-1.png');
    expect(payload.message).toContain(`page 2/${total}`);
    expect(mockShareFiles).not.toHaveBeenCalled();
  });

  test('the highlighted page is what gets mounted for capture', async () => {
    const tree = await open(LONG);
    await act(async () => pageButtons(tree)[1].props.onPress());
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    // Sheet closed; only the off-screen mount remains.
    const mounted = tree.root.findAllByType('ProseShareCard' as never);
    expect(mounted).toHaveLength(1);
    expect(mounted[0].props.pageIndex).toBe(1);
    await settle();
    expect(setString).toHaveBeenCalledTimes(1);
    expect(mockShareAsync).toHaveBeenCalledTimes(1);
  });

  test('Share all pages renders every selected page, one at a time, into one share call', async () => {
    const tree = await open(LONG);
    const total = pageButtons(tree).length;
    // Drop the last page from the series: highlight it, then tap it again.
    await act(async () => pageButtons(tree)[total - 1].props.onPress());
    await act(async () => pageButtons(tree)[total - 1].props.onPress());
    await act(async () => byLabel(tree, 'Share all pages').props.onPress());
    await settle(1500);
    expect(mockCaptureRef).toHaveBeenCalledTimes(total - 1);
    expect(mockShareFiles).toHaveBeenCalledTimes(1);
    const [uris, opts] = mockShareFiles.mock.calls[0] as [string[], { message?: string }];
    expect(uris).toEqual(Array.from({ length: total - 1 }, (_, i) => `file:///tmp/page-${i + 1}.png`));
    expect(opts.message).toContain(`${total - 1} pages`);
    expect(setString).not.toHaveBeenCalled();
  });

  test('Instagram carousel copies the caption, pauses on the hand-off steps, then shares all pages', async () => {
    const tree = await open(LONG);
    const total = pageButtons(tree).length;
    await act(async () => byLabel(tree, 'Share as Instagram carousel').props.onPress());
    await settle(1500);
    expect(setString).toHaveBeenCalledTimes(1);
    expect(setString.mock.calls[0][0]).toContain('#');
    expect(mockShareFiles).not.toHaveBeenCalled();
    const next = byLabel(tree, 'Continue to Instagram');
    expect(next).toBeDefined();
    await act(async () => next.props.onPress());
    await settle(600);
    expect(mockShareFiles).toHaveBeenCalledTimes(1);
    expect((mockShareFiles.mock.calls[0][0] as string[]).length).toBe(total);
  });

  test('the last page cannot be deselected', async () => {
    const tree = await open(LONG);
    const n = pageButtons(tree).length;
    for (let i = n - 1; i >= 0; i--) {
      await act(async () => pageButtons(tree)[i].props.onPress()); // highlight
      await act(async () => pageButtons(tree)[i].props.onPress()); // toggle off
    }
    const selected = pageButtons(tree).filter((b) => b.props.accessibilityState?.selected);
    expect(selected).toHaveLength(1);
  });

  test('on a binary without the multi-image module the all-pages rows are disabled', async () => {
    mockMultiAvailable = false;
    const tree = await open(LONG);
    expect(byLabel(tree, 'Share all pages').props.disabled).toBe(true);
    expect(byLabel(tree, 'Share as Instagram carousel').props.disabled).toBe(true);
    expect(byLabel(tree, 'Share to other apps').props.disabled).toBeFalsy();
  });

  test('switching scope re-paginates', async () => {
    const tree = await open(LONG);
    const before = pageButtons(tree).length;
    const whole = tree.root.findAll(
      (n) => /^Scope: Whole katha/.test(n.props.accessibilityLabel ?? '') && typeof n.props.onPress === 'function'
    )[0];
    await act(async () => whole.props.onPress());
    expect(pageButtons(tree).length).toBeGreaterThan(before);
  });
});
