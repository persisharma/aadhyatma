import React from 'react';
import { Clipboard, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare, type ShareableProse, type ShareableVerse } from '@/utils/shareVerse';
import { buildShareCaption } from '@/data/shareLinks';
import { getKathaContent } from '@/panchang/kathaContent';
import { vratKathaShareable } from '@/utils/shareContent';

/**
 * Direct WhatsApp / Instagram hand-off through the one provider (design.md §39.11):
 * the sheet's WhatsApp rows exist only when WhatsApp can be opened, they send the
 * system capture + caption straight to WhatsApp, the Instagram rows open Instagram
 * itself, and every refusal falls back to the unchanged OS-sheet path.
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

const mockShareFiles = jest.fn((..._args: unknown[]) => Promise.resolve(true));
jest.mock('@/utils/multiShare', () => ({
  isMultiShareAvailable: () => true,
  shareFiles: (...args: unknown[]) => mockShareFiles(...args),
}));

let mockWhatsAppAvailable = false;
const mockShareToWhatsApp = jest.fn((..._args: unknown[]) => Promise.resolve(true));
const mockShareToInstagram = jest.fn((..._args: unknown[]) => Promise.resolve(true));
jest.mock('@/utils/directShare', () => ({
  isWhatsAppDirectAvailable: () => Promise.resolve(mockWhatsAppAvailable),
  shareToWhatsApp: (...args: unknown[]) => mockShareToWhatsApp(...args),
  shareToInstagram: (...args: unknown[]) => mockShareToInstagram(...args),
}));

const mockRequestAsk = jest.fn();
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => mockRequestAsk }));

jest.mock('@/components/ShareCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { __esModule: true, default: function MockShareCard(props: { onHeight?: (height: number) => void }) {
    const { onHeight } = props;
    React.useEffect(() => { onHeight?.(675); }, [onHeight]);
    return React.createElement('ShareCard', props);
  } };
});
jest.mock('@/components/ShareStoryCanvas', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { __esModule: true, default: function MockShareStoryCanvas(props: { onHeight?: (height: number) => void }) {
    const { onHeight } = props;
    React.useEffect(() => { onHeight?.(960); }, [onHeight]);
    return React.createElement('ShareStoryCanvas', props);
  } };
});
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/ShareStoryFrame', () => 'ShareStoryFrame');
jest.mock('@/utils/useTodayKey', () => ({ useTodayKey: () => 'Wed Aug 26 2026' }));
const mockNoObservances: never[] = [];
const mockCalendar = ['purnimant', jest.fn()];
jest.mock('@/panchang/festivalEngine', () => ({
  ...jest.requireActual('@/panchang/festivalEngine'),
  getCachedObservancesForDate: () => mockNoObservances,
}));
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => mockCalendar,
  useObservancesForDate: () => mockNoObservances,
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
const LONG: ShareableProse = vratKathaShareable(getKathaContent('chhath-puja-katha')!, 0);

const trees: TestRenderer.ReactTestRenderer[] = [];

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

async function open(content: ShareableVerse | ShareableProse) {
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
  if (!('kind' in content)) act(() => byLabel(tree!, 'Card style: Current card').props.onPress());
  return tree!;
}

async function waitFor(check: () => boolean) {
  for (let attempt = 0; attempt < 30 && !check(); attempt += 1) {
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    });
  }
}

const VERSE_CAPTION = buildShareCaption({
  sectionNameHi: VERSE.sectionNameHi,
  sectionNameEn: VERSE.sectionNameEn,
  verseLabelHi: VERSE.verseLabelHi,
  verseLabelEn: VERSE.verseLabelEn,
  firstLineHi: VERSE.linesHi[0],
  firstLineEn: VERSE.linesEn[0],
  lang: 'en',
});

// The first test pays the provider's cold module load.
jest.setTimeout(30000);

describe('direct WhatsApp / Instagram share', () => {
  beforeEach(() => {
    captureCount = 0;
    mockWhatsAppAvailable = false;
    mockCaptureRef.mockClear();
    mockShareAsync.mockClear();
    mockShareFiles.mockClear();
    mockShareToWhatsApp.mockReset();
    mockShareToWhatsApp.mockImplementation(() => Promise.resolve(true));
    mockShareToInstagram.mockReset();
    mockShareToInstagram.mockImplementation(() => Promise.resolve(true));
    setString.mockClear();
    rnShare.mockClear();
    mockRequestAsk.mockClear();
  });
  afterEach(() => {
    for (const tree of trees.splice(0)) act(() => tree.unmount());
  });

  test('no WhatsApp row when WhatsApp cannot be opened directly (iOS, older binary)', async () => {
    const tree = await open(VERSE);
    expect(byLabel(tree, 'Share on WhatsApp')).toBeUndefined();
    expect(byLabel(tree, 'Share to other apps')).toBeDefined();
  });

  test('the WhatsApp row sends the captured card and the download caption straight to WhatsApp', async () => {
    mockWhatsAppAvailable = true;
    const tree = await open(VERSE);
    await waitFor(() => !!byLabel(tree, 'Share on WhatsApp'));
    await act(async () => byLabel(tree, 'Share on WhatsApp').props.onPress());
    await waitFor(() => mockShareToWhatsApp.mock.calls.length > 0);
    expect(mockShareToWhatsApp).toHaveBeenCalledWith(['file:///tmp/page-1.png'], VERSE_CAPTION);
    expect(VERSE_CAPTION).toContain('https://vedansh.app/get');
    expect(rnShare).not.toHaveBeenCalled();
    expect(mockShareAsync).not.toHaveBeenCalled();
    expect(setString).not.toHaveBeenCalled();
    expect(mockRequestAsk).toHaveBeenCalledWith('verse-shared');
  });

  test('a refused WhatsApp hand-off falls back to the OS sheet with the same image and caption', async () => {
    mockWhatsAppAvailable = true;
    mockShareToWhatsApp.mockImplementation(() => Promise.resolve(false));
    const tree = await open(VERSE);
    await waitFor(() => !!byLabel(tree, 'Share on WhatsApp'));
    await act(async () => byLabel(tree, 'Share on WhatsApp').props.onPress());
    await waitFor(() => rnShare.mock.calls.length > 0);
    // Jest runs as iOS: the unchanged image + caption activity sheet.
    expect(rnShare).toHaveBeenCalledWith({ message: VERSE_CAPTION, url: 'file:///tmp/page-1.png' }, { dialogTitle: 'Share verse' });
  });

  test('Instagram post opens Instagram itself, with the hashtag caption already copied', async () => {
    const tree = await open(VERSE);
    await act(async () => byLabel(tree, 'Share on Instagram').props.onPress());
    await waitFor(() => mockShareToInstagram.mock.calls.length > 0);
    expect(mockShareToInstagram).toHaveBeenCalledWith('file:///tmp/page-1.png', 'post');
    expect(setString).toHaveBeenCalledTimes(1);
    expect(mockShareAsync).not.toHaveBeenCalled();
    expect(mockRequestAsk).toHaveBeenCalledWith('verse-shared');
  });

  test('Instagram story falls back to the OS sheet when Instagram cannot be opened', async () => {
    mockShareToInstagram.mockImplementation(() => Promise.resolve(false));
    const tree = await open(VERSE);
    await act(async () => byLabel(tree, 'Share as Instagram story').props.onPress());
    await waitFor(() => mockShareAsync.mock.calls.length > 0);
    expect(mockShareToInstagram).toHaveBeenCalledWith('file:///tmp/page-1.png', 'story');
    expect(mockShareAsync).toHaveBeenCalledWith('file:///tmp/page-1.png', expect.objectContaining({ dialogTitle: 'Share to Instagram story' }));
  });

  test('Instagram reel skips the story hand-off and opens the share sheet, where Instagram offers Reel', async () => {
    const tree = await open(VERSE);
    await act(async () => byLabel(tree, 'Share as Instagram reel').props.onPress());
    await waitFor(() => mockShareAsync.mock.calls.length > 0);
    expect(mockShareToInstagram).not.toHaveBeenCalled();
    expect(mockShareAsync).toHaveBeenCalledWith('file:///tmp/page-1.png', expect.objectContaining({ dialogTitle: 'Share as Instagram reel' }));
    // The hashtag caption is still copied first.
    expect(setString).toHaveBeenCalledTimes(1);
    expect(mockRequestAsk).toHaveBeenCalledWith('verse-shared');
  });

  test('a series offers a WhatsApp album that sends every selected page straight to WhatsApp', async () => {
    mockWhatsAppAvailable = true;
    const tree = await open(LONG);
    await waitFor(() => !!byLabel(tree, 'Share all pages on WhatsApp'));
    // The single-card WhatsApp row belongs to non-series sheets only.
    expect(byLabel(tree, 'Share on WhatsApp')).toBeUndefined();
    const pages = tree.root.findAll((n) => /^Page \d+$/.test(n.props.accessibilityLabel ?? '') && typeof n.props.onPress === 'function').length;
    await act(async () => byLabel(tree, 'Share all pages on WhatsApp').props.onPress());
    await waitFor(() => mockShareToWhatsApp.mock.calls.length > 0);
    const [uris, caption] = mockShareToWhatsApp.mock.calls[0] as [string[], string];
    expect(uris).toEqual(Array.from({ length: pages }, (_, i) => `file:///tmp/page-${i + 1}.png`));
    expect(caption).toContain(`${pages} pages`);
    expect(caption).toContain('https://vedansh.app/get');
    expect(mockShareFiles).not.toHaveBeenCalled();
    expect(mockRequestAsk).toHaveBeenCalledWith('prose-shared');
  });

  test('a refused WhatsApp album falls back to the one OS sheet with every page', async () => {
    mockWhatsAppAvailable = true;
    mockShareToWhatsApp.mockImplementation(() => Promise.resolve(false));
    const tree = await open(LONG);
    await waitFor(() => !!byLabel(tree, 'Share all pages on WhatsApp'));
    await act(async () => byLabel(tree, 'Share all pages on WhatsApp').props.onPress());
    await waitFor(() => mockShareFiles.mock.calls.length > 0);
    const [uris, opts] = mockShareFiles.mock.calls[0] as [string[], { message?: string }];
    expect(uris).toEqual(mockShareToWhatsApp.mock.calls[0][0]);
    expect(opts.message).toBe(mockShareToWhatsApp.mock.calls[0][1]);
  });
});
