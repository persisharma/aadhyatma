import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native', () => ({ Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: (x: unknown) => x }, Text: 'Text', View: 'View' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: 'ReaderHeader' }));
jest.mock('@/components/DeityIcon', () => ({ __esModule: true, default: 'DeityIcon' }));
jest.mock('@/components/DeityCard', () => ({ __esModule: true, default: ({ testID, onPress }: { testID: string; onPress: () => void }) => {
  const React = require('react');
  return React.createElement('Pressable', { testID, onPress });
} }));
jest.mock('@/components/KidsStoryArt', () => ({ __esModule: true, default: 'KidsStoryArt' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({
  colors: {}, elevation: { card: {}, raised: {} }, radii: { lg: 16 }, typography: { subtitle: { fontSize: 15 } }, spacing: { readingGutter: 22, xxl: 24, lg: 16, md: 12 },
}) }));
jest.mock('@/utils/langType', () => ({ meaningToken: () => ({}), titleFontByLang: () => 'test-font' }));
jest.mock('@/utils/localize', () => ({ pick: (lang: string, values: Record<string, string>) => values[lang] }));

const Library = require('../KidsStoryLibraryScreen').default;
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

test.each([
  ['krishna', ['krishna-janma', 'putana', 'kaliya-nag']],
  ['ganesha', ['ganesha-birth']],
  ['hanuman', ['hanuman-sun']],
])('%s shelf opens every published story in the shared reader', (deityId, storyIds) => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Deity navigation={navigation} route={{ params: { deityId } }} />); });
  for (const storyId of storyIds) {
    act(() => tree.root.findByProps({ testID: `kids-story-${storyId}` }).props.onPress());
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
    act(() => tree.root.findByProps({ testID: `kids-story-${story.id}` }).props.onPress());
    expect(navigation.navigate).toHaveBeenLastCalledWith('KidsStoryReader', { storyId: story.id });
  }
  expect(tree.root.findAllByType('Text' as any).filter(node =>
    Array.isArray(node.props.children) && node.props.children.includes(' · Introduction')
  )).toHaveLength(4);
  expect(buttons[7].props.accessibilityLabel).toContain('Day 7 · Kalaratri');
  act(() => tree.unmount());
});

test('covers derive their height from reviewed artwork and tab-hosted catalogs have no second bottom inset', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  for (const Component of [Library, Deity]) {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<Component navigation={navigation} route={{ params: { deityId: 'durga' } }} />); });
    expect(tree.root.findByType('SafeAreaView' as any).props.edges).toEqual(['top', 'left', 'right']);
    const scroll = tree.root.findByType('ScrollView' as any);
    expect(scroll.props.contentContainerStyle.paddingBottom).toBe(12);
    for (const art of tree.root.findAllByType('KidsStoryArt' as any)) {
      expect(art.parent!.props.style.width).toBe(120);
      expect(art.parent!.props.style.height).toBeUndefined();
    }
    act(() => tree.unmount());
  }
});
