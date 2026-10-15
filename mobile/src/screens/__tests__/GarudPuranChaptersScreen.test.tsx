import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: 'ReaderHeader' }));
jest.mock('@/components/LanguageToggle', () => ({ __esModule: true, default: 'LanguageToggle' }));
jest.mock('@/components/ShareButton', () => ({ __esModule: true, default: 'ShareButton' }));
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: jest.fn(), busy: false }) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/contexts/ReadingProgressContext', () => ({
  useReadingProgress: () => ({
    getChapterProgress: (_source: string, chapter: number) => (chapter === 5 ? { verseIndex: 1 } : undefined),
  }),
}));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => {
  const { spacing, radii } = require('@/theme/spacing');
  return { colors: require('@/theme/colors').lightColors, spacing, radii, typography: require('@/theme/typography').typography };
} }));

const Screen = require('../GarudPuranChaptersScreen').default;
const { garudPuranChaptersManifest } = require('@/data/garud-puran');
const { garudPuranThumbFocus } = require('@assets/garud-puran');

function mount() {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Screen navigation={navigation} />); });
  const cards = tree.root.findAll(node => typeof node.props.testID === 'string' && /^garud-puran-reading-\d+$/.test(node.props.testID) && node.props.accessibilityRole === 'button');
  return { tree, navigation, cards: cards.filter((node, index) => cards.findIndex(other => other.props.testID === node.props.testID) === index) };
}

test('twelve readings on the shared listing card keep the Maestro label shape', () => {
  const { tree, cards } = mount();
  expect(cards).toHaveLength(12);
  expect(cards[0].props.accessibilityLabel).toBe('Reading 1. Karma and its consequences. 2 pages. Tap to open.');
  expect(cards.find(card => card.props.testID === 'garud-puran-reading-5')!.props.accessibilityLabel)
    .toBe('Reading 5. Babhruvahana and Sudeva. 3 pages. Tap to open.');
  expect(tree.root.findAllByType('LanguageToggle' as any)).toHaveLength(1);
  act(() => tree.unmount());
});

test('three group headings are announced as headers and the paper texture is gone', () => {
  const { tree } = mount();
  const headers = tree.root.findAll(node => node.props.accessibilityRole === 'header' && typeof node.props.children === 'string');
  expect([...new Set(headers.map(node => node.props.children))]).toEqual(['Teachings for life', 'Stories and their meaning', 'Understanding traditions']);
  expect(tree.root.findAllByType('BackgroundLayer' as any)).toHaveLength(0);
  act(() => tree.unmount());
});

test('progress shows only on a reading the user has opened, and the card resumes there', () => {
  const { navigation, cards } = mount();
  const opened = cards.find(card => card.props.testID === 'garud-puran-reading-5')!;
  expect(opened.props.accessibilityValue).toEqual({ min: 0, max: 100, now: Math.round((2 / 3) * 100) });
  expect(cards[0].props.accessibilityValue).toBeUndefined();
  act(() => opened.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('GarudPuranReader', { chapter: 5, initialIndex: 1 });
});

test('every painting has a focal point for the 4:5 thumb', () => {
  for (const reading of garudPuranChaptersManifest) {
    expect(garudPuranThumbFocus[reading.artId]).toBeGreaterThanOrEqual(0);
    expect(garudPuranThumbFocus[reading.artId]).toBeLessThanOrEqual(1);
  }
});
