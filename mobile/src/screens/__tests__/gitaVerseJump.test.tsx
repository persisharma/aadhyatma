import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, FlatList, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackRouter, StackActions, CommonActions } from '@react-navigation/routers';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ReadingProgressProvider, useReadingProgress } from '@/contexts/ReadingProgressContext';
import { BookmarksProvider, useBookmarks } from '@/contexts/BookmarksContext';
import { ShareProvider } from '@/utils/shareVerse';
import { __resetReadCoverageStore, useReadCoverage } from '@/utils/readCoverageStore';
import * as gita from '@/data/gita';
import GitaReaderScreen from '../GitaReaderScreen';
import GitaVersePage from '@/components/GitaVersePage';

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => null) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn() }));
jest.mock('expo-haptics', () => ({ ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' }, impactAsync: jest.fn(async () => {}) }));
const mockStopSpeech = jest.fn();
const mockStopSlide = jest.fn();
jest.mock('../_useAutoSlide', () => ({ useReaderPlayback: () => ({
  readAloud: { visible: false, stop: mockStopSpeech },
  autoSlide: { visible: false, stop: mockStopSlide },
}) }));

let tree: TestRenderer.ReactTestRenderer;
let progress: ReturnType<typeof useReadingProgress>;
let saved: ReturnType<typeof useBookmarks>;
let coverage: ReturnType<typeof useReadCoverage>;
let stack: any;
const router = StackRouter({ initialRouteName: 'Search' });
const options = { routeNames: ['Search', 'GitaReader'], routeParamList: {}, routeGetIdList: {} };
const replace = jest.fn();
function Probe() { saved = useBookmarks(); progress = useReadingProgress(); coverage = useReadCoverage(); return null; }
function Journey() {
  const { isLoading } = useReadingProgress();
  const [state, setState] = useState(() => router.getRehydratedState({
    stale: true, routes: [{ name: 'Search', params: { query: 'action' } }, { name: 'GitaReader', params: { chapter: 2, initialIndex: 11 } }], index: 1,
  }, options));
  stack = state;
  const route = state.routes[state.index];
  const navigation = {
    replace: (name: string, params: object) => { replace(name, params); setState(old => router.getRehydratedState(router.getStateForAction(old, StackActions.replace(name, params), options) ?? old, options)); },
    goBack: () => setState(old => router.getRehydratedState(router.getStateForAction(old, CommonActions.goBack(), options) ?? old, options)),
    navigate: jest.fn(),
  };
  return <><Probe />{!isLoading && route.name === 'GitaReader' && <GitaReaderScreen key={route.key} route={route as any} navigation={navigation as any} />}</>;
}
const press = (id: string) => act(() => tree.root.findAll(n => n.props.testID === id && typeof n.props.onPress === 'function')[0].props.onPress());
const type = (value: string) => act(() => tree.root.findByType(TextInput).props.onChangeText(value));
beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-11-13T10:00:00Z'));
  Object.defineProperty(AppState, 'currentState', { configurable: true, value: 'active' });
  await AsyncStorage.clear();
  __resetReadCoverageStore();
  replace.mockClear(); mockStopSpeech.mockClear(); mockStopSlide.mockClear();
  await act(async () => { tree = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 24, bottom: 16, left: 0, right: 0 }}><GitaLanguageProvider initialLang="en"><BookmarksProvider><ReadingProgressProvider><ShareProvider><Journey /></ShareProvider></ReadingProgressProvider></BookmarksProvider></GitaLanguageProvider></SafeAreaInsetsContext.Provider>); });
});
afterEach(() => { act(() => tree.unmount()); jest.useRealTimers(); jest.restoreAllMocks(); });

test('cancel preserves position, stored progress and Back stack; sheet time is not reading', async () => {
  const before = progress.getChapterProgress('bhagavad-gita', 2);
  press('gita-jump-trigger');
  expect(mockStopSpeech).toHaveBeenCalled(); expect(mockStopSlide).toHaveBeenCalled();
  expect(tree.root.findByType(FlatList).props.scrollEnabled).toBe(false);
  type('४७');
  act(() => jest.advanceTimersByTime(10_000));
  act(() => tree.root.findByType(Modal).props.onRequestClose());
  expect(progress.getChapterProgress('bhagavad-gita', 2)).toEqual(before);
  expect(coverage.getChapterCoverage('bhagavad-gita', 2)?.read ?? 0).toBe(0);
  expect(replace).not.toHaveBeenCalled();
  press('gita-jump-trigger');
  expect(tree.root.findByType(TextInput).props.value).toBe('12');
  press('gita-jump-cancel');
  act(() => tree.root.findByType(GitaReaderScreen).props.navigation.goBack());
  expect(stack.routes).toHaveLength(1);
  expect(stack.routes[0].params).toEqual({ query: 'action' });
});

test('2.12 → 2.47 opens exact content, persists only target, skips no coverage and retains bookmark/share actions', async () => {
  press('gita-jump-trigger'); type('૪૭'); press('gita-jump-open');
  await act(async () => {});
  expect(replace).toHaveBeenCalledWith('GitaReader', { chapter: 2, initialIndex: 46 });
  expect(stack.routes).toHaveLength(2);
  expect(progress.getChapterProgress('bhagavad-gita', 2)?.verseIndex).toBe(46);
  const page = tree.root.findAllByType(GitaVersePage).find(n => n.props.verse.number === 47)!;
  expect(page.props.showIllustration).toBe(false);
  expect(page.props.verse).toEqual(gita.getGitaChapter(2).verses[46]);
  expect(page.props.topActions.props.children).toHaveLength(2);
  act(() => page.props.topActions.props.children[0].props.onToggle());
  expect(saved.isBookmarked('bhagavad-gita:2:46')).toBe(true);
  expect(saved.bookmarks.find(item => item.id === 'bhagavad-gita:2:46')?.verseIndex).toBe(46);
  expect(coverage.getChapterCoverage('bhagavad-gita', 2)?.read ?? 0).toBe(0);
  act(() => jest.advanceTimersByTime(3100));
  act(() => tree.root.findByType(GitaReaderScreen).props.navigation.goBack());
  expect(coverage.isVerseRead('bhagavad-gita', 2, 46)).toBe(true);
  expect(coverage.isVerseRead('bhagavad-gita', 2, 45)).toBe(false);
  expect(coverage.getChapterCoverage('bhagavad-gita', 2)?.read ?? 0).toBe(1);
  const stored = JSON.parse((await AsyncStorage.getItem('@vedansh/reading-progress'))!);
  expect(stored['bhagavad-gita::2'].verseIndex).toBe(46);
});

test('cross-chapter jump only loads chosen chapter on Open; swiping and Back still work', async () => {
  const load = jest.spyOn(gita, 'getGitaChapter');
  press('gita-jump-trigger'); press('gita-jump-chapter'); press('gita-jump-chapter-18'); type('७८');
  expect(load).not.toHaveBeenCalledWith(18);
  press('gita-jump-open');
  expect(replace).toHaveBeenCalledWith('GitaReader', { chapter: 18, initialIndex: 77 });
  expect(tree.root.findByType(FlatList).props.initialScrollIndex).toBe(78);
  const list = tree.root.findByType(FlatList);
  act(() => list.props.onViewableItemsChanged({ viewableItems: [{ index: 77, item: list.props.data[77] }] }));
  expect(progress.getChapterProgress('bhagavad-gita', 18)?.verseIndex).toBe(76);
  expect(progress.getChapterProgress('bhagavad-gita', 2)?.verseIndex).toBe(11);
  expect(coverage.getSourceCoverage('bhagavad-gita')?.read ?? 0).toBe(0);
  act(() => tree.root.findByType(GitaReaderScreen).props.navigation.goBack());
  expect(stack.routes[0].name).toBe('Search');
});

test('chapter load failure leaves original reader and draft intact for retry', () => {
  press('gita-jump-trigger'); type('47');
  jest.spyOn(gita, 'getGitaChapter').mockImplementationOnce(() => { throw new Error('load failed'); });
  press('gita-jump-open');
  expect(replace).not.toHaveBeenCalled();
  expect(progress.getChapterProgress('bhagavad-gita', 2)?.verseIndex).toBe(11);
  expect(tree.root.findByType(TextInput).props.value).toBe('47');
  press('gita-jump-open');
  expect(replace).toHaveBeenCalledTimes(1);
});

test('pending transition cannot navigate after reader unmount', () => {
  const list = tree.root.findByType(FlatList);
  const index = list.props.data.length - 1;
  act(() => list.props.onViewableItemsChanged({ viewableItems: [{ index, item: list.props.data[index] }] }));
  act(() => tree.root.findByType(GitaReaderScreen).props.navigation.goBack());
  act(() => jest.advanceTimersByTime(500));
  expect(replace).not.toHaveBeenCalled();
});


test('stale pager callbacks do not move or trigger chapter transitions while choosing', () => {
  const list = tree.root.findByType(FlatList);
  press('gita-jump-trigger');
  const index = list.props.data.length - 1;
  act(() => {
    list.props.onViewableItemsChanged({ viewableItems: [{ index, item: list.props.data[index] }] });
    list.props.onScroll({ nativeEvent: { contentOffset: { x: 9999 } } });
    jest.advanceTimersByTime(500);
  });
  expect(replace).not.toHaveBeenCalled();
  expect(progress.getChapterProgress('bhagavad-gita', 2)?.verseIndex).toBe(11);
  press('gita-jump-cancel');
  expect(tree.root.findByType(FlatList).props.scrollEnabled).toBe(true);
});
