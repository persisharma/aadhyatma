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

test('Krishna shelf opens the published story; planned story and empty shelves do not', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Deity navigation={navigation} route={{ params: { deityId: 'krishna' } }} />); });
  act(() => tree.root.findByProps({ testID: 'kids-story-krishna-janma' }).props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('KidsStoryReader', { storyId: 'krishna-janma' });
  expect(tree.root.findByProps({ testID: 'kids-story-planned-kaliya-nag' }).props.onPress).toBeUndefined();
  act(() => tree.update(<Deity navigation={navigation} route={{ params: { deityId: 'ganesha' } }} />));
  expect(tree.root.findAllByProps({ testID: 'kids-story-krishna-janma' })).toHaveLength(0);
  expect(tree.root.findAllByType('Text' as any).some(node => node.props.children === 'New picture stories are being prepared for this shelf.')).toBe(true);
  act(() => tree.unmount());
});
