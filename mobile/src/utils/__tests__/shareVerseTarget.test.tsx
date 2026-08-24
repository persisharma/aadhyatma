import React from 'react';
import { Clipboard, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare, type ShareableVerse } from '@/utils/shareVerse';
import { buildInstagramCaption } from '@/data/shareLinks';

/**
 * End-to-end guard for the share-target flow (design.md §39): the share button
 * opens the picker, the Instagram branch puts the hashtag caption on the clipboard
 * before opening the sheet, and the plain branch still behaves exactly as it did.
 */

const mockShareAsync = jest.fn((..._args: unknown[]) => Promise.resolve());
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('file:///tmp/verse.png')),
}));

// ShareCard pulls in the reader background plates (image assets + gradients); the
// flow under test only cares that something mounted and was captured.
jest.mock('@/components/ShareCard', () => 'ShareCard');

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
    mockShareAsync.mockClear();
    setString.mockClear();
    rnShare.mockClear();
  });

  test('the share button opens the picker instead of sharing straight away', async () => {
    const tree = await openPicker();
    expect(byLabel(tree, 'Share on Instagram')).toBeDefined();
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
});
