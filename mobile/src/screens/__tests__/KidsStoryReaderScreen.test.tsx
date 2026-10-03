import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

let mockLang = 'hi';
const mockScroll = jest.fn();
jest.mock('react-native', () => {
  const React = require('react');
  return {
    Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    FlatList: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ scrollToIndex: mockScroll }));
      return React.createElement('FlatList', props, props.data.map((item: any, index: number) =>
        React.createElement(React.Fragment, { key: item.id }, props.renderItem({ item, index }))));
    }),
  };
});
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/ReaderHeader', () => {
  const React = require('react');
  return { __esModule: true, default: (props: any) => React.createElement('ReaderHeader', props, props.right) };
});
jest.mock('@/components/KidsStoryArt', () => ({ __esModule: true, default: 'KidsStoryArt' }));
jest.mock('@/components/ReadingProgressBar', () => ({ __esModule: true, default: 'ReadingProgressBar' }));
jest.mock('@/components/LanguageToggle', () => ({ __esModule: true, default: 'LanguageToggle' }));
jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: mockLang }),
  LANGUAGES: ['hi', 'en', 'gu', 'kn'].map(value => ({ value, shortLabel: value })),
}));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({
  colors: {}, typography: { pageCounter: { fontFamily: 'test-font', fontSize: 14 } }, spacing: { readingGutter: 22, lg: 16, md: 12, sm: 8 },
}) }));
jest.mock('@/utils/langType', () => ({ meaningToken: () => ({}), titleFontByLang: () => 'test-font' }));
jest.mock('@/utils/localize', () => ({ pick: (lang: string, values: Record<string, string>) => values[lang] }));

const Screen = require('../KidsStoryReaderScreen').default;
const story = require('@/data/kidsStories/krishna-janma.json');
function mount(pageId?: string, storyId = story.id) {
  const navigation = { goBack: jest.fn() };
  const props = { navigation, route: { params: { storyId, pageId } } };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Screen {...props} />); });
  return { tree, props, navigation, find: (testID: string) => tree.root.findByProps({ testID }) };
}
afterEach(() => { mockLang = 'hi'; mockScroll.mockClear(); });

test('first scene mounts with a horizontal pager, a counter and no page buttons', () => {
  const { tree, find } = mount();
  const pager = find('story-pager');
  expect(pager.props.horizontal).toBe(true);
  expect(pager.props.pagingEnabled).toBe(true);
  expect(pager.props.initialNumToRender).toBe(1);
  expect(pager.props.getItemLayout(null, 2)).toEqual({ length: 390, offset: 780, index: 2 });
  expect(tree.root.findAllByType('Text' as any).some(node => node.props.children === story.pages[0].text.hi)).toBe(true);
  // Gita-style swipe-only navigation: a header counter, no Previous/Next buttons.
  expect(find('story-progress').props.children[0]).toBe(1);
  expect(tree.root.findAllByProps({ testID: 'story-prev' })).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: 'story-next' })).toHaveLength(0);
  act(() => tree.unmount());
});

test('swipes, language changes and layout changes keep one page index', () => {
  const { tree, props, find } = mount('yamuna-crossing');
  expect(find('story-progress').props.children[0]).toBe(12);
  for (const language of ['en', 'gu', 'kn', 'hi']) {
    mockLang = language;
    act(() => tree.update(<Screen {...props} />));
    expect(find('story-progress').props.children[0]).toBe(12);
    expect(find('story-pager').props.keyExtractor(story.pages[11])).toBe('yamuna-crossing');
  }
  act(() => find('story-pager').props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 390 * 12 } } }));
  expect(find('story-progress').props.children[0]).toBe(13);
  const layout = tree.root.findAllByType('View' as any).find(node => node.props.onLayout)!;
  act(() => layout.props.onLayout({ nativeEvent: { layout: { width: 700 } } }));
  expect(find('story-pager').props.initialScrollIndex).toBe(12);
  expect(find('story-pager').props.getItemLayout(null, 12).offset).toBe(8400);
  act(() => find('story-pager').props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 700 * 13 } } }));
  expect(find('story-progress').props.children[0]).toBe(14);
  act(() => tree.unmount());
});

test('unknown story renders a graceful message without a pager', () => {
  mockLang = 'en';
  const { tree } = mount(undefined, 'missing');
  expect(tree.root.findAllByType('Text' as any).some(node => node.props.children === 'Story not found.')).toBe(true);
  expect(tree.root.findAllByProps({ testID: 'story-pager' })).toHaveLength(0);
  act(() => tree.unmount());
});
