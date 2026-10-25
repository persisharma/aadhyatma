import React from 'react';
import { Alert, Clipboard, PixelRatio, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare, DevotionalPreview, type ShareableVerse } from '@/utils/shareVerse';
import { buildInstagramCaption } from '@/data/shareLinks';
import { STORY_OUTPUT_HEIGHT, STORY_OUTPUT_WIDTH } from '@/utils/shareStoryLayout';

/**
 * End-to-end guard for the share-target flow (design.md §39): the share button
 * opens the picker, the Instagram branch puts the hashtag caption on the clipboard
 * before opening the sheet, and the plain branch still behaves exactly as it did.
 */

const mockCaptureRef = jest.fn((..._args: unknown[]) => Promise.resolve('file:///tmp/verse.png'));
const mockShareAsync = jest.fn((..._args: unknown[]) => Promise.resolve());
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: (...args: unknown[]) => mockCaptureRef(...args),
}));

// The rating ask (§54): a dispatched share is a "good moment". Mock the light
// context so the provider mounts standalone and we can assert the moment fires.
const mockRequestAsk = jest.fn();
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => mockRequestAsk }));

// ShareCard pulls in the reader background plates (image assets + gradients); the
// flow under test only cares that something mounted and was captured. The story
// canvas is stubbed the same way — its geometry is pinned by shareStoryLayout.test.ts.
let mockMeasuredHeight: number | null = 675;
jest.mock('@/components/ShareCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { __esModule: true, default: function MockShareCard(props: { onHeight?: (height: number) => void }) {
    const { onHeight } = props;
    React.useEffect(() => { if (mockMeasuredHeight != null) onHeight?.(mockMeasuredHeight); }, [onHeight]);
    return React.createElement('ShareCard', props);
  } };
});
jest.mock('@/components/ShareStoryCanvas', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { __esModule: true, default: function MockShareStoryCanvas(props: { onHeight?: (height: number) => void }) {
    const { onHeight } = props;
    React.useEffect(() => { if (mockMeasuredHeight != null) onHeight?.(mockMeasuredHeight + 285); }, [onHeight]);
    return React.createElement('ShareStoryCanvas', props);
  } };
});
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/ShareStoryFrame', () => 'ShareStoryFrame');

// Pinned date so the timely tags are deterministic: Wednesday is Ganesha's vaar,
// which the Hanuman-tagged fixture does not match, so the default block stays
// date-free and the exact-caption assertion below holds on any run date. (The real
// hook also registers a midnight/foreground listener that would keep Jest alive.)
jest.mock('@/utils/useTodayKey', () => ({ useTodayKey: () => 'Wed Aug 26 2026' }));

// The real hook runs a whole-year observance solve. Stub it: this suite is about
// the share flow, and the tag rules themselves are pinned by shareHashtags.test.ts.
// `mockObservances` drives the one test that checks the timely tags reach the caption.
let mockObservances: { rule: { nameHi: string; nameEn: string; deityEn: string } }[] = [];
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
  useObservancesForDate: () => mockObservances,
}));

const setString = jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
const rnShare = jest
  .spyOn(Share, 'share')
  .mockResolvedValue({ action: 'sharedAction' } as Awaited<ReturnType<typeof Share.share>>);

const VERSE: ShareableVerse = {
  sourceId: 'hanuman-chalisa',
  sectionNameHi: 'हनुमान चालीसा',
  sectionNameEn: 'Hanuman Chalisa',
  verseLabelHi: 'चौपाई 12',
  verseLabelEn: 'Verse 12',
  linesHi: ['जय हनुमान ज्ञान गुन सागर'],
  linesEn: ['jai hanuman gyan gun sagar'],
};

function Trigger() {
  const { share } = useShare();
  return (
    <Pressable accessibilityLabel="trigger" onPress={() => void share(VERSE, 'en')} />
  );
}

const trees: TestRenderer.ReactTestRenderer[] = [];

async function openPicker() {
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

/**
 * The provider waits one frame + 60 ms for the off-screen card to lay out before
 * it captures, so a bare `act()` returns before the share has run.
 */
async function settle() {
  await act(async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
  });
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

describe('share target flow', () => {
  beforeEach(() => {
    mockCaptureRef.mockClear();
    mockShareAsync.mockClear();
    setString.mockClear();
    rnShare.mockClear();
    mockRequestAsk.mockClear();
    mockObservances = [];
    mockMeasuredHeight = 675;
  });

  afterEach(() => {
    // Unmount so the provider's effects tear down; a live tree keeps Jest running.
    for (const tree of trees.splice(0)) act(() => tree.unmount());
  });



  test('missing native measurement times out without exporting a guessed or clipped card', async () => {
    jest.useFakeTimers();
    mockMeasuredHeight = null;
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    try {
      const tree = await openPicker();
      act(() => byLabel(tree, 'Share to other apps').props.onPress());
      await act(async () => { await jest.advanceTimersByTimeAsync(6000); });
      expect(mockCaptureRef).not.toHaveBeenCalled();
      expect(rnShare).not.toHaveBeenCalled();
      expect(alert).toHaveBeenCalled();
      expect(tree.root.findAllByType('ShareCard' as never)).toHaveLength(0);
    } finally { alert.mockRestore(); jest.useRealTimers(); }
  });

  test('waits for native height and exports a long verse as one full-height image', async () => {
    mockMeasuredHeight = null;
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    await settle();
    expect(mockCaptureRef).not.toHaveBeenCalled();
    const frame = tree.root.findAllByType(View).find(n => n.props.pointerEvents === 'none')!;
    expect(StyleSheet.flatten(frame.props.style).height).toBeUndefined();
    act(() => tree.root.findByType('ShareCard' as never).props.onHeight(1650.3));
    await settle();
    expect(mockCaptureRef).toHaveBeenCalledTimes(1);
    expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 3302 / PixelRatio.get() });
    expect(rnShare).toHaveBeenCalledTimes(1);
  });

  test('a tall story export preserves the whole card and the story frame', async () => {
    mockMeasuredHeight = 1800;
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share as Instagram story or reel').props.onPress());
    await settle();
    expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 4170 / PixelRatio.get() });
  });

  test('a long capture does not leave later short verses with a tall empty image', async () => {
    mockMeasuredHeight = 1800;
    const long = await openPicker();
    await act(async () => byLabel(long, 'Share to other apps').props.onPress());
    await settle();
    expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({ height: 3600 / PixelRatio.get() });
    mockCaptureRef.mockClear();
    mockMeasuredHeight = 675;
    await act(async () => byLabel(long, 'trigger').props.onPress());
    await act(async () => byLabel(long, 'Share to other apps').props.onPress());
    await settle();
    expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 1350 / PixelRatio.get() });
  });

  test('the share button opens the picker instead of sharing straight away', async () => {
    const tree = await openPicker();
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
    expect(tree.root.findAllByType('ShareCard' as never)).toHaveLength(0);
    expect(tree.root.findAllByType('ShareStoryCanvas' as never)).toHaveLength(0);
    expect(mockShareAsync).not.toHaveBeenCalled();
    expect(rnShare).not.toHaveBeenCalled();
  });

  test('Instagram copies the hashtag caption, then shares the PNG', async () => {
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    await settle();

    expect(setString).toHaveBeenCalledTimes(1);
    const copied = setString.mock.calls[0][0] as unknown as string;
    expect(copied).toBe(
      buildInstagramCaption({
        sourceId: VERSE.sourceId,
        sectionNameHi: VERSE.sectionNameHi,
        sectionNameEn: VERSE.sectionNameEn,
        verseLabelHi: VERSE.verseLabelHi,
        verseLabelEn: VERSE.verseLabelEn,
        firstLineHi: VERSE.linesHi[0],
        firstLineEn: VERSE.linesEn[0],
        lang: 'en',
      })
    );
    expect(copied).toContain('#HanumanChalisa');
    expect(copied).toContain('#JaiHanuman');

    expect(mockShareAsync).toHaveBeenCalledTimes(1);
    expect(mockShareAsync.mock.calls[0][0]).toBe('file:///tmp/verse.png');
  });

  test('the post row exports 4:5 and the story row exports a full 9:16 frame', async () => {
    const density = jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
    try {
      const post = await openPicker();
      await act(async () => byLabel(post, 'Share on Instagram').props.onPress());
      await settle();
      expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({ width: 360, height: 450 });

      mockCaptureRef.mockClear();
      const story = await openPicker();
      await act(async () =>
        byLabel(story, 'Share as Instagram story or reel').props.onPress()
      );
      await settle();
      // A 4:5 export here is the bug: Instagram fills the 9:16 frame from it and
      // crops the card's header band and branding footer away.
      expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({
        width: STORY_OUTPUT_WIDTH / 3,
        height: STORY_OUTPUT_HEIGHT / 3,
      });
    } finally { density.mockRestore(); }
  });

  test('Android export dimensions stay in physical pixels at high density', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
    const density = jest.spyOn(PixelRatio, 'get').mockReturnValue(3);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    try {
      const post = await openPicker();
      await act(async () => byLabel(post, 'Share on Instagram').props.onPress());
      await settle();
      expect(mockCaptureRef.mock.calls[0][1]).toMatchObject({ width: 1080, height: 1350 });
    } finally { Object.defineProperty(Platform, 'OS', descriptor); density.mockRestore(); }
  });

  test('the story row mounts the 9:16 canvas, the post row the bare card', async () => {
    const post = await openPicker();
    await act(async () => byLabel(post, 'Share on Instagram').props.onPress());
    expect(post.root.findAllByType('ShareCard' as never).length).toBe(1);
    expect(post.root.findAllByType('ShareStoryCanvas' as never).length).toBe(0);
    await settle();

    const story = await openPicker();
    await act(async () =>
      byLabel(story, 'Share as Instagram story or reel').props.onPress()
    );
    expect(story.root.findAllByType('ShareStoryCanvas' as never).length).toBe(1);
    expect(story.root.findAllByType('ShareCard' as never).length).toBe(0);
    await settle();
  });

  test("today's festival reaches the caption when it is the text's deity", async () => {
    mockObservances = [
      { rule: { nameHi: 'हनुमान जयंती', nameEn: 'Hanuman Jayanti', deityEn: 'Hanuman' } },
    ];
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    await settle();
    const copied = setString.mock.calls[0][0] as unknown as string;
    expect(copied).toContain('#HanumanJayanti');
  });

  test('no observance today leaves the caption date-free', async () => {
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    await settle();
    const copied = setString.mock.calls[0][0] as unknown as string;
    expect(copied).not.toContain('Jayanti');
    expect(copied).toContain('#HanumanChalisa');
  });

  test('the plain Share branch does not touch the clipboard', async () => {
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    await settle();
    expect(setString).not.toHaveBeenCalled();
    // Jest's Platform.OS is 'ios', so this is the unchanged image + caption path.
    expect(rnShare).toHaveBeenCalledTimes(1);
    expect(rnShare.mock.calls[0][0]).toEqual({
      message: expect.not.stringContaining('#'),
      url: 'file:///tmp/verse.png',
    });
  });

  test('a dispatched share reports the verse-shared moment (§54)', async () => {
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    await settle();
    expect(rnShare).toHaveBeenCalledTimes(1);
    expect(mockRequestAsk).toHaveBeenCalledWith('verse-shared');
  });

  test('Send as text shares the full verse as a plain message, no capture', async () => {
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Send as text').props.onPress());
    await settle();
    await settle();
    expect(mockCaptureRef).not.toHaveBeenCalled();
    expect(rnShare).toHaveBeenCalledTimes(1);
    const payload = rnShare.mock.calls[0][0] as { message: string; url?: string };
    expect(payload.url).toBeUndefined();
    expect(payload.message).toContain('Hanuman Chalisa · Verse 12');
    expect(payload.message).toContain('jai hanuman gyan gun sagar');
    expect(payload.message).toContain('https://vedansh.app/get');
    expect(mockRequestAsk).toHaveBeenCalledWith('verse-shared');
  });

  test('a dismissed text share does not report the moment', async () => {
    rnShare.mockResolvedValueOnce({ action: 'dismissedAction' } as Awaited<ReturnType<typeof Share.share>>);
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Send as text').props.onPress());
    await settle();
    await settle();
    expect(rnShare).toHaveBeenCalledTimes(1);
    expect(mockRequestAsk).not.toHaveBeenCalled();
  });

  test('the card language chip re-languages the card, caption and hashtags — not the sheet', async () => {
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Card language: Hindi').props.onPress());
    // Chrome stays in the reader's English.
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
    expect(tree.root.findAll(n => n.props.children === 'Share this verse').length).toBeGreaterThan(0);
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    await settle();
    expect(tree.root.findAllByType('ShareCard' as never)).toHaveLength(0);
    expect(mockCaptureRef).toHaveBeenCalledTimes(1);
    const copied = setString.mock.calls[0][0] as string;
    expect(copied).toContain('हनुमान चालीसा · चौपाई 12');
    expect(copied).toContain('जय हनुमान ज्ञान गुन सागर');
  });

  test('the card is mounted in the chosen card language', async () => {
    mockMeasuredHeight = null;
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Card language: Kannada').props.onPress());
    await act(async () => byLabel(tree, 'Share to other apps').props.onPress());
    await settle();
    const card = tree.root.findByType('ShareCard' as never);
    expect(card.props.lang).toBe('kn');
    // Finish the measurement so the capture completes. Leaving it pending keeps a
    // 5 s timeout alive whose "could not share" Alert fires after the Jest env is
    // torn down — a ReferenceError that fails this suite on CI's slower runner.
    act(() => card.props.onHeight(675));
    await settle();
    await settle();
  });

  test('the Instagram-without-image error path does NOT report the moment', async () => {
    // No image → the branch that only shows an alert, never a share sheet.
    mockCaptureRef.mockResolvedValueOnce(null as never);
    const tree = await openPicker();
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    await settle();
    expect(mockShareAsync).not.toHaveBeenCalled();
    expect(mockRequestAsk).not.toHaveBeenCalled();
  });
});


it('reports a devotional preview ready only after paint and resets for changed content', () => {
  const card = {
    background: null, header: 'Lakshmi', pageIndex: 0, pageCount: 1, lang: 'hi' as const,
    page: { title: null, usedDp: 0, blocks: [], devotional: { art: 'lakshmi' as const, verse: 'Om', meaning: 'Peace', heroHeight: 90, continuation: false } },
  };
  let tree: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<DevotionalPreview card={card} />); });
  const prose = () => tree!.root.find(node => (node.type as unknown) === 'ProseShareCard');
  expect(tree!.root.findAllByProps({ testID: 'devotional-preview-ready' })).toHaveLength(0);
  act(() => { prose().props.onHeight(1200); prose().props.onIllustrationReady(true); });
  expect(tree!.root.findAllByType(View).filter(node => node.props.testID === 'devotional-preview-ready')).toHaveLength(1);
  expect(tree!.root.findAllByType(View).some(node => StyleSheet.flatten(node.props.style)?.height === 480)).toBe(true);
  act(() => { tree!.update(<DevotionalPreview card={{ ...card, page: { ...card.page, devotional: { ...card.page.devotional, meaning: 'A changed meaning' } } }} />); });
  expect(tree!.root.findAllByProps({ testID: 'devotional-preview-ready' })).toHaveLength(0);
  act(() => prose().props.onIllustrationReady(false));
  expect(tree!.root.findAllByProps({ testID: 'devotional-preview-ready' })).toHaveLength(0);
  act(() => tree!.unmount());
});
