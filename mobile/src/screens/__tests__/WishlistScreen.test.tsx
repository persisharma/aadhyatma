import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Modal, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarksProvider, useBookmarks, type BookmarkRef } from '@/contexts/BookmarksContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider, useGitaLanguage, type Lang } from '@/data/gita/language';
import { aartiIdByIndex } from '@/data/aarti/ids';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import WishlistScreen from '../WishlistScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
const KEY = '@vedansh/bookmarks';
const saved = (sourceId: string, verseIndex: number, chapter?: number): BookmarkRef => ({
  id: `${sourceId}:${chapter ?? 1}:${verseIndex}`, sourceId, verseIndex, chapter,
  savedAt: 100 - verseIndex, previewHi: 'श्रीभगवानुवाच', previewEn: 'śrībhagavānuvāca',
});
const mixed = [saved('hanuman-chalisa', 2), saved('bhagavad-gita', 8, 2),
  saved('sundarkand', 3, 1), saved('bhagavad-gita', 4, 6)];
let store: ReturnType<typeof useBookmarks>;
let language: ReturnType<typeof useGitaLanguage>;
function Probe() { store = useBookmarks(); language = useGitaLanguage(); return null; }
const navigation = { goBack: jest.fn() };
let trees: TestRenderer.ReactTestRenderer[] = [];
async function mount(items: BookmarkRef[], lang: Lang = 'en', size = 'M') {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
  await AsyncStorage.setItem('@vedansh/font-scale', size);
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider><ThemeProvider><GitaLanguageProvider initialLang={lang}>
        <BookmarksProvider><Probe /><WishlistScreen navigation={navigation as never}
          route={{ key: 'Wishlist', name: 'Wishlist' }} /></BookmarksProvider>
      </GitaLanguageProvider></ThemeProvider></FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}
const controls = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAll(
  (n) => typeof n.props.onPress === 'function' && typeof n.props.testID === 'string');
const control = (tree: TestRenderer.ReactTestRenderer, id: string) =>
  controls(tree).find((n) => n.props.testID === id)!;
const rows = (tree: TestRenderer.ReactTestRenderer) => [...new Set(controls(tree)
  .map((n) => n.props.testID as string).filter((id) => id.startsWith('saved-verse-')))];
const filters = (tree: TestRenderer.ReactTestRenderer) => [...new Set(controls(tree)
  .map((n) => n.props.testID as string).filter((id) => id.startsWith('saved-source-')))];
const press = (node: TestRenderer.ReactTestInstance) => act(() => node.props.onPress());
const button = (tree: TestRenderer.ReactTestRenderer, label: string) => tree.root.findAll(
  (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function')[0];
beforeEach(async () => { await AsyncStorage.clear(); jest.clearAllMocks(); });
afterEach(() => {
  for (const tree of trees) {
    const all = control(tree, 'saved-source-all');
    if (all) press(all);
    act(() => tree.unmount());
  }
  trees = [];
});

test('filters 30 mixed saves in existing order and opens the exact older verse', async () => {
  const items = Array.from({ length: 30 }, (_, i) => saved(
    ['hanuman-chalisa', 'bhagavad-gita', 'sundarkand'][i % 3], i, 2));
  const tree = await mount(items);
  expect(filters(tree)).toHaveLength(4);
  expect(control(tree, 'saved-source-all').props.accessibilityLabel).toBe('All, 30');
  expect(control(tree, 'saved-source-bhagavad-gita').props.accessibilityLabel).toBe('Bhagavad Gītā, 10');
  press(control(tree, 'saved-source-bhagavad-gita'));
  const expected = items.filter((bm) => bm.sourceId === 'bhagavad-gita');
  expect(rows(tree)).toEqual(expected.map((bm) => `saved-verse-${bm.id}`));
  const older = expected[expected.length - 1];
  press(control(tree, `saved-verse-${older.id}`));
  expect(mockNavigate).toHaveBeenCalledWith('HomeTab', {
    screen: 'GitaReader', params: { chapter: 2, initialIndex: older.verseIndex },
  });
  // More's tab stack stays mounted during Home reader visits. Exercise a
  // provider update while that same screen instance retains its selection.
  await act(async () => store.addBookmark(saved('hanuman-chalisa', 42)));
  expect(control(tree, 'saved-source-bhagavad-gita').props.accessibilityState.selected).toBe(true);
  expect(rows(tree)).toEqual(expected.map((bm) => `saved-verse-${bm.id}`));
  press(control(tree, 'saved-source-all'));
  expect(rows(tree)).toHaveLength(31);
});

test('cancel preserves saves; confirm removes only the chosen save and updates counts/storage', async () => {
  const tree = await mount(mixed);
  press(control(tree, 'saved-source-bhagavad-gita'));
  const bm = mixed[1];
  press(control(tree, `remove-saved-${bm.id}`));
  expect(tree.root.findByType(Modal).props.visible).toBe(true);
  press(button(tree, 'Cancel'));
  expect(rows(tree)).toHaveLength(2);
  expect(store.bookmarks).toHaveLength(4);
  press(control(tree, `remove-saved-${bm.id}`));
  await act(async () => button(tree, 'Remove').props.onPress());
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(rows(tree)).toEqual([`saved-verse-${mixed[3].id}`]);
  expect(control(tree, 'saved-source-bhagavad-gita').props.accessibilityLabel).toBe('Bhagavad Gītā, 1');
  expect(control(tree, 'saved-source-all').props.accessibilityLabel).toBe('All, 3');
  expect(JSON.parse((await AsyncStorage.getItem(KEY))!)).toEqual(mixed.filter((b) => b.id !== bm.id));
});

test('reader removal updates the retained filter and resets All when its source disappears', async () => {
  const tree = await mount(mixed);
  press(control(tree, 'saved-source-bhagavad-gita'));
  await act(async () => store.removeBookmark(mixed[1].id));
  expect(rows(tree)).toHaveLength(1);
  await act(async () => store.removeBookmark(mixed[3].id));
  expect(control(tree, 'saved-source-all').props.accessibilityState.selected).toBe(true);
  expect(rows(tree)).toEqual([`saved-verse-${mixed[0].id}`, `saved-verse-${mixed[2].id}`]);
  expect(control(tree, 'saved-source-bhagavad-gita')).toBeUndefined();
});

test.each([{ items: [] }, { items: [mixed[0]] }, { items: [mixed[1], mixed[3]] }])(
  'hides redundant filters for $items', async ({ items }) => {
    const tree = await mount(items);
    expect(filters(tree)).toHaveLength(0);
    expect(rows(tree)).toHaveLength(items.length);
  });

test('collapsing to one source resets selection before another source is later added', async () => {
  const tree = await mount([mixed[0], mixed[1]]);
  press(control(tree, 'saved-source-bhagavad-gita'));
  await act(async () => store.removeBookmark(mixed[0].id));
  expect(filters(tree)).toHaveLength(0);
  await act(async () => store.addBookmark(mixed[2]));
  expect(control(tree, 'saved-source-all').props.accessibilityState.selected).toBe(true);
  expect(rows(tree)).toHaveLength(2);
});

test('legacy and canonical aarti saves share a filter and preserve exact routes', async () => {
  const legacy = { ...saved('aarti-0', 2), id: 'aarti:0:2' };
  const tree = await mount([mixed[1], legacy, saved(aartiIdByIndex[0], 3)]);
  const filter = control(tree, `saved-source-${aartiIdByIndex[0]}`);
  expect(filters(tree)).toHaveLength(3);
  expect(filter.props.accessibilityLabel).toMatch(/, 2$/);
  press(filter);
  expect(rows(tree)).toHaveLength(2);
  press(control(tree, `saved-verse-${aartiIdByIndex[0]}:2`));
  expect(mockNavigate).toHaveBeenCalledWith('HomeTab', {
    screen: 'AartiReader', params: { aartiIndex: 0, initialIndex: 2 },
  });
});

test.each(['hi', 'en', 'gu', 'kn'] as Lang[])('localized filters grow without scaling caps in %s', async (lang) => {
  const tree = await mount(mixed, lang, 'L');
  const filter = control(tree, 'saved-source-bhagavad-gita');
  expect(filter.props.accessibilityLabel).toBe(`${contentByLang(lang, 'भगवद् गीता', 'Bhagavad Gītā')}, 2`);
  const text = filter.findByType(Text);
  expect(StyleSheet.flatten(text.props.style).fontFamily).toBe(titleFontByLang(lang));
  expect(text.props.numberOfLines).toBeUndefined();
  expect(text.props.maxFontSizeMultiplier).toBeUndefined();
  expect(text.props.allowFontScaling).not.toBe(false);
  expect(StyleSheet.flatten(typeof filter.props.style === 'function' ? filter.props.style({ pressed: false }) : filter.props.style).minHeight).toBeGreaterThanOrEqual(44);
  press(filter);
  await act(async () => language.setLang(lang === 'en' ? 'hi' : 'en'));
  expect(control(tree, 'saved-source-bhagavad-gita').props.accessibilityState.selected).toBe(true);
  expect(rows(tree)).toHaveLength(2);
});

test('removal and opening are sibling screen-reader targets', async () => {
  const tree = await mount(mixed);
  const open = control(tree, `saved-verse-${mixed[0].id}`);
  const remove = control(tree, `remove-saved-${mixed[0].id}`);
  expect(open.parent).toBe(remove.parent);
  expect(remove.props.accessibilityLabel).toContain('Remove: Hanuman Chalisa');
});

test('unknown sources stay visible and filterable without inventing a reader target', async () => {
  const unknown = saved('future-scripture', 0);
  const tree = await mount([...mixed, unknown]);
  press(control(tree, 'saved-source-future-scripture'));
  expect(rows(tree)).toEqual([`saved-verse-${unknown.id}`]);
  press(control(tree, `saved-verse-${unknown.id}`));
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('loading hides incomplete filters and never writes storage defaults', async () => {
  let resolve!: (value: string | null) => void;
  const originalGet = (AsyncStorage.getItem as jest.Mock).getMockImplementation();
  const get = jest.spyOn(AsyncStorage, 'getItem').mockImplementation((key) =>
    key === KEY ? new Promise((r) => { resolve = r; }) : Promise.resolve(null));
  let tree!: TestRenderer.ReactTestRenderer;
  try {
    await act(async () => {
      tree = TestRenderer.create(<GitaLanguageProvider initialLang="en"><BookmarksProvider>
        <WishlistScreen navigation={navigation as never} route={{ key: 'Wishlist', name: 'Wishlist' }} />
      </BookmarksProvider></GitaLanguageProvider>);
    });
    trees.push(tree);
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(filters(tree)).toHaveLength(0);
    await act(async () => resolve(JSON.stringify(mixed)));
    expect(filters(tree)).toHaveLength(4);
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(KEY, '[]');
  } finally { get.mockImplementation(originalGet!); }
});

test('recreated settings screen retains selection through storage hydration after a reader visit', async () => {
  const first = await mount(mixed);
  press(control(first, 'saved-source-bhagavad-gita'));
  act(() => first.unmount());
  trees = [];
  const reopened = await mount(mixed);
  expect(control(reopened, 'saved-source-bhagavad-gita').props.accessibilityState.selected).toBe(true);
  expect(rows(reopened)).toHaveLength(2);
});
