import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native', () => ({
  Image: 'Image', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
  StyleSheet: { create: (x: unknown) => x, absoluteFillObject: {} },
  Platform: { OS: 'ios', select: (options: Record<string, unknown>) => options.ios ?? options.default },
}));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: 'ReaderHeader' }));
jest.mock('@/components/DeityIcon', () => ({ __esModule: true, default: 'DeityIcon' }));
jest.mock('@/components/DeityCard', () => ({ __esModule: true, default: ({ testID, onPress, iconKey }: { testID: string; onPress: () => void; iconKey?: string }) => {
  const React = require('react');
  return React.createElement('Pressable', { testID, onPress, iconKey });
} }));
jest.mock('@/components/KidsStoryArt', () => ({ __esModule: true, default: 'KidsStoryArt' }));
jest.mock('@/components/LanguageToggle', () => ({ __esModule: true, default: 'LanguageToggle' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({
  colors: {}, elevation: { card: {}, raised: {} }, radii: { lg: 16, sm: 10 }, typography: require('@/theme/typography').typography, spacing: { readingGutter: 22, xxl: 24, lg: 16, md: 12 },
}) }));
jest.mock('@/utils/langType', () => ({
  meaningToken: () => ({}), titleFontByLang: () => 'test-font', isLatinLang: (lang: string) => lang === 'en', pillTextStyle: () => ({}),
}));
jest.mock('@/utils/localize', () => ({ pick: (lang: string, values: Record<string, string>) => values[lang] }));

const Library = require('../KidsStoryLibraryScreen').default;
// ListingCard forwards its testID to the Pressable it renders: select the host.
const card = (tree: TestRenderer.ReactTestRenderer, testID: string) =>
  tree.root.find(node => node.type === ('Pressable' as any) && node.props.testID === testID);
const texts = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType('Text' as any).map(node => [].concat(node.props.children).join(''));
const Deity = require('../KidsStoryDeityScreen').default;

test('Home library opens a deity shelf before a story', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Library navigation={navigation} />); });
  expect(tree.root.findAllByType('Pressable' as any).filter(node => node.props.testID === 'kids-story-deity-krishna')).toHaveLength(1);
  expect(tree.root.findAllByType('Pressable' as any).filter(node => node.props.testID === 'kids-story-deity-ganesha')).toHaveLength(1);
  expect(tree.root.findAllByType('Pressable' as any).filter(node => node.props.testID === 'kids-story-deity-hanuman')).toHaveLength(1);
  expect(tree.root.findAllByProps({ testID: 'kids-story-krishna-janma' })).toHaveLength(0);
  act(() => tree.root.findAllByType('Pressable' as any).find(node => node.props.testID === 'kids-story-deity-krishna')!.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('KidsStoryDeity', { deityId: 'krishna' });
  act(() => tree.unmount());
});

test('library shows the Ramayana comic card and opens the native comic shelf', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Library navigation={navigation} />); });
  const card = tree.root.findAllByType('Pressable' as any).find(node => node.props.testID === 'kids-story-ramayan-comic');
  expect(card).toBeTruthy();
  // RULEBOOK §3: the comic card shows painted art (Rama's bow-arrow), not a Devanagari letter tile.
  expect(card!.props.iconKey).toBe('bowArrow');
  act(() => card!.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('RamayanComic');
  act(() => tree.unmount());
});

test.each([
  ['krishna', ['krishna-janma', 'putana', 'kaliya-nag']],
  ['ganesha', ['ganesha-birth']],
  ['hanuman', ['hanuman-sun']],
])('%s shelf opens every published story in the shared reader', (deityId, storyIds) => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Deity navigation={navigation} route={{ params: { deityId } }} />); });
  for (const storyId of storyIds) {
    act(() => card(tree, `kids-story-${storyId}`).props.onPress());
    expect(navigation.navigate).toHaveBeenLastCalledWith('KidsStoryReader', { storyId });
  }
  expect(tree.root.findAllByType('Pressable' as any)).toHaveLength(storyIds.length);
  expect(tree.root.findAllByProps({ testID: 'kids-story-planned-kaliya-nag' })).toHaveLength(0);
  expect(tree.root.findAllByType('Text' as any).some(node => node.props.children === 'New picture stories are being prepared for this shelf.')).toBe(false);
  act(() => tree.unmount());
});

test('Maa Durga shelf has nine ordered form routes, a festival introduction and four additional stories', () => {
  const { navadurgaReadings, storiesForDeity } = require('@/data/kidsStories');
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Library navigation={navigation} />); });
  act(() => tree.root.findByProps({ testID: 'kids-story-deity-durga' }).props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('KidsStoryDeity', { deityId: 'durga' });
  act(() => tree.unmount());
  act(() => { tree = TestRenderer.create(<Deity navigation={navigation} route={{ params: { deityId: 'durga' } }} />); });
  const buttons = tree.root.findAllByType('Pressable' as any);
  expect(buttons).toHaveLength(14);
  expect(buttons.map(node => node.props.testID)).toEqual([
    'kids-story-durga-navaratri',
    ...navadurgaReadings.map((form: { storyId: string }) => `kids-story-${form.storyId}`),
    'kids-story-durga-raktabeej', 'kids-story-durga-shumbha-nishumbha',
    'kids-story-durga-suratha-samadhi', 'kids-story-durga-shakambhari',
  ]);
  for (const story of storiesForDeity('durga')) {
    act(() => card(tree, `kids-story-${story.id}`).props.onPress());
    expect(navigation.navigate).toHaveBeenLastCalledWith('KidsStoryReader', { storyId: story.id });
  }
  // One style for every card: no Story/Introduction tag and no per-card age —
  // the shelf states the age once and introductions say so in their own line.
  const visible = texts(tree);
  expect(visible.filter(text => /Introduction|Story$|^6\+ ·/.test(text))).toEqual([]);
  expect(visible).toContain('Ages 6+ · 14 illustrated readings');
  expect(visible).toContain('Day 7');
  expect(visible).not.toContain('Day 7 · Kalaratri');
  expect(buttons[7].props.accessibilityLabel).toContain('Day 7 · Kalaratri');
  act(() => tree.unmount());
});

test('every shelf card is the shared listing card: reading-language title, one-line description, count-only meta, filled thumb', () => {
  const { storiesForDeity } = require('@/data/kidsStories');
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Deity navigation={navigation} route={{ params: { deityId: 'durga' } }} />); });
  const visible = texts(tree);
  for (const story of storiesForDeity('durga')) {
    expect(visible).toContain(story.title.en);
    expect(visible).not.toContain(story.title.hi);
    expect(visible).toContain(`${story.pages.length} pages`);
  }
  const descriptions = tree.root.findAllByType('Text' as any).filter(node => node.props.numberOfLines === 1);
  expect(descriptions).toHaveLength(14);
  expect(tree.root.findAllByType('LanguageToggle' as any)).toHaveLength(1);
  for (const art of tree.root.findAllByType('KidsStoryArt' as any)) {
    expect(art.props.fill).toBe(true);
    const box = Object.assign({}, ...[].concat(art.parent!.props.style));
    expect(box).toMatchObject({ width: 92, minHeight: 115, alignSelf: 'stretch' });
  }
  act(() => tree.unmount());
});

test('tab-hosted catalogs have no second bottom inset', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  for (const Component of [Library, Deity]) {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<Component navigation={navigation} route={{ params: { deityId: 'durga' } }} />); });
    expect(tree.root.findByType('SafeAreaView' as any).props.edges).toEqual(['top', 'left', 'right']);
    const scroll = tree.root.findByType('ScrollView' as any);
    expect(scroll.props.contentContainerStyle.paddingBottom).toBe(12);
    act(() => tree.unmount());
  }
});
