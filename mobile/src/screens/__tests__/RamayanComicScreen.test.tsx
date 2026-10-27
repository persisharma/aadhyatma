import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native', () => ({
  Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
  StyleSheet: { create: (x: unknown) => x, absoluteFillObject: {} },
}));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: 'ReaderHeader' }));
jest.mock('@/components/DeityIcon', () => ({ __esModule: true, default: 'DeityIcon' }));
jest.mock('@/components/ListCard', () => ({
  __esModule: true,
  CARD_TITLE_SIZES: {},
  CardThumb: 'CardThumb',
  CardTitles: 'CardTitles',
  default: ({ testID, onPress, disabled }: { testID: string; onPress?: () => void; disabled?: boolean }) => {
    const React = require('react');
    return React.createElement('Pressable', { testID, onPress, disabled });
  },
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({ colors: {}, spacing: { xxl: 24, md: 12 }, typography: require('@/theme/typography').typography }) }));
jest.mock('@/utils/langType', () => ({ titleFontByLang: () => 'test-font' }));
jest.mock('@/utils/titleByLanguage', () => ({ orderTitlesByLanguage: (_l: string, hi: string, en: string) => ({ primary: { text: en }, secondary: { text: hi } }) }));
jest.mock('@/utils/localize', () => ({ pick: (lang: string, values: Record<string, string>) => values[lang] }));

const Shelf = require('../RamayanComicScreen').default;
const cardOf = (tree: TestRenderer.ReactTestRenderer, testID: string) =>
  tree.root.findAllByType('Pressable' as any).find(node => node.props.testID === testID);

test('the shelf lists seven kandas; Bala and Ayodhya open their chapter listing', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Shelf navigation={navigation} />); });

  for (const id of ['bala', 'ayodhya', 'aranya', 'kishkindha', 'sundara', 'yuddha', 'uttara']) {
    expect(cardOf(tree, `ramayan-kanda-${id}`)).toBeTruthy();
  }
  const bala = cardOf(tree, 'ramayan-kanda-bala')!;
  expect(bala.props.disabled).toBe(false);
  act(() => bala.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('ComicChapters', { comicId: 'balakanda-v1' });

  const ayodhya = cardOf(tree, 'ramayan-kanda-ayodhya')!;
  expect(ayodhya.props.disabled).toBe(false);
  act(() => ayodhya.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('ComicChapters', { comicId: 'ayodhyakanda-v1' });
  act(() => tree.unmount());
});

test('the unshipped kandas are disabled "coming soon" rows with no target', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Shelf navigation={navigation} />); });
  for (const id of ['aranya', 'kishkindha', 'sundara', 'yuddha', 'uttara']) {
    const card = cardOf(tree, `ramayan-kanda-${id}`)!;
    expect(card.props.disabled).toBe(true);
    expect(card.props.onPress).toBeUndefined();
  }
  act(() => tree.unmount());
});
