import React from 'react';
import { Alert, PixelRatio, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ShareProvider, useShare, type ShareableVerse, type VerseCardStyle } from '../shareVerse';
import { dailyBhaktiVerse, devotionalVerseShareable } from '../dailyBhaktiShare';
import { getVersePool } from '@/data/versePool';
import { verseLinesByLang } from '../localize';
import type { Lang } from '@/data/gita/language';

const mockCapture = jest.fn((..._args: unknown[]) => Promise.resolve('file:///verse.png'));
const mockInstagram = jest.fn((..._args: unknown[]) => Promise.resolve());
const mockMoment = jest.fn();
jest.mock('react-native-view-shot', () => ({ captureRef: (...args: unknown[]) => mockCapture(...args) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async () => true, shareAsync: (...args: unknown[]) => mockInstagram(...args) }));
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => mockMoment }));
jest.mock('@/components/ShareTargetSheet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { __esModule: true, default: ({ singleCardPreview, ...props }: { singleCardPreview?: React.ReactNode }) => React.createElement('ShareTargetSheet', props, singleCardPreview) };
});
jest.mock('@/components/ShareCard', () => 'ShareCard');
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));

const original = dailyBhaktiVerse(getVersePool().find(v => v.sourceId === 'ratri-shloka' && v.verseIndex === 2)!);
let tree: TestRenderer.ReactTestRenderer;
let shared: jest.SpyInstance;
const sheet = () => tree.root.findByType('ShareTargetSheet' as React.ElementType);
const mounted = () => tree.root.findAllByType('ProseShareCard' as React.ElementType).find(n => n.props.onIllustrationReady)!;
async function advance(ms = 200) { await act(async () => { await jest.advanceTimersByTimeAsync(ms); }); }
async function open(style?: VerseCardStyle, verse: ShareableVerse = original, lang: Lang = 'hi') {
  function Trigger() {
    const { share } = useShare();
    return <Pressable testID="open-style" onPress={() => { void share(verse, lang, { cardStyle: style }); }} />;
  }
  await act(async () => { tree = TestRenderer.create(<ShareProvider><Trigger /></ShareProvider>); });
  act(() => tree.root.findByProps({ testID: 'open-style' }).props.onPress());
}
beforeEach(() => {
  jest.useFakeTimers();
  mockCapture.mockClear(); mockInstagram.mockClear(); mockMoment.mockClear();
  shared = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
});
afterEach(() => { if (tree) act(() => tree.unmount()); jest.restoreAllMocks(); jest.useRealTimers(); });

it('switches both ways without losing the verse or card language, and resets on reopening', async () => {
  await open();
  expect(sheet().props.cardStyle).toBe('current');
  act(() => sheet().props.onCardLang('kn'));
  act(() => sheet().props.onCardStyle('daily-bhakti'));
  const preview = tree.root.findByType('ProseShareCard' as React.ElementType);
  expect(preview.props.page.devotional.art).toBe('shiva');
  expect(preview.props.page.devotional.verse).toBe(verseLinesByLang('kn', original.linesHi, original.linesEn).join('\n'));
  act(() => sheet().props.onCardStyle('current'));
  expect(sheet().props.cardLang).toBe('kn');
  expect(tree.root.findByType('ShareCard' as React.ElementType).props.linesHi).toEqual(original.linesHi);
  act(() => sheet().props.onClose());
  expect(mockCapture).not.toHaveBeenCalled(); expect(shared).not.toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: 'open-style' }).props.onPress());
  expect(sheet().props.cardStyle).toBe('current');
  expect(sheet().props.cardLang).toBe('hi');
});

it('Daily Bhakti opens illustrated and can also export the classic card', async () => {
  await open('daily-bhakti');
  expect(sheet().props.cardStyle).toBe('daily-bhakti');
  act(() => sheet().props.onCardStyle('current'));
  act(() => sheet().props.onShareSystem());
  await advance();
  const capture = tree.root.findByType('ShareCard' as React.ElementType);
  act(() => capture.props.onHeight(900));
  await advance(600);
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(shared.mock.calls[0][0].message).toContain('vedansh.app/get');
});

it.each(['system', 'post', 'story'] as const)('%s exports wait for fresh measured and decoded artwork', async target => {
  await open();
  act(() => sheet().props.onCardStyle('daily-bhakti'));
  const staleReady = tree.root.findByType('ProseShareCard' as React.ElementType).props.onIllustrationReady;
  act(() => target === 'system' ? sheet().props.onShareSystem() : target === 'post' ? sheet().props.onShareInstagramPost() : sheet().props.onShareInstagramStory());
  await advance();
  act(() => { staleReady(true); mounted().props.onHeight(1000); });
  await advance();
  expect(mockCapture).not.toHaveBeenCalled();
  // A rapid second share request cannot replace the in-flight payload.
  act(() => tree.root.findByProps({ testID: 'open-style' }).props.onPress());
  expect(tree.root.findAllByType('ShareTargetSheet' as React.ElementType)).toHaveLength(0);
  act(() => mounted().props.onIllustrationReady(true));
  await advance(600);
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(mockCapture.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: (target === 'system' ? 2000 : target === 'post' ? 1350 : 1920) / PixelRatio.get() });
  expect(target === 'system' ? shared : mockInstagram).toHaveBeenCalledTimes(1);
  expect(mockMoment).toHaveBeenCalledWith('verse-shared');
});

it('failed/offline artwork refuses export and releases the share lock', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await open('daily-bhakti');
  act(() => sheet().props.onShareSystem()); await advance();
  act(() => { mounted().props.onHeight(1000); mounted().props.onIllustrationReady(false); });
  await advance(600);
  expect(mockCapture).not.toHaveBeenCalled(); expect(shared).not.toHaveBeenCalled();
  expect(mockMoment).not.toHaveBeenCalled(); expect(alert).toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: 'open-style' }).props.onPress());
  expect(sheet().props.cardStyle).toBe('daily-bhakti');
});

it('text shares preserve the reading independently of selected style', async () => {
  await open('daily-bhakti');
  act(() => sheet().props.onShareText());
  await advance(500);
  expect(mockCapture).not.toHaveBeenCalled();
  expect(shared.mock.calls[0][0].message).toContain(original.linesHi.join('\n'));
  expect(shared.mock.calls[0][0].message).toContain(original.meaningHi);
});

it('unknown sources use neutral artwork and preserve native meanings, theme and long commentary', () => {
  const verse = { ...original, sourceId: 'unknown-source', meaningTitleHi: 'विषय', meaningTitleEn: 'Theme',
    meaningHi: 'पूरा अर्थ\n\n' + 'व्याख्या '.repeat(400), meaningGu: 'સંપૂર્ણ અર્થ', meaningKn: 'ಸಂಪೂರ್ಣ ಅರ್ಥ' };
  const prepared = devotionalVerseShareable(verse).scopes[0].prepared!;
  expect(prepared.hi.pages).toHaveLength(1);
  expect(prepared.hi.pages[0].devotional).toMatchObject({ art: 'prayer', meaning: `विषय\n${verse.meaningHi}` });
  expect(prepared.en.pages[0].devotional!.meaning).toContain('Theme');
  expect(prepared.gu.pages[0].devotional!.meaning).toContain(verse.meaningGu);
  expect(prepared.kn.pages[0].devotional!.meaning).toContain(verse.meaningKn);
});
