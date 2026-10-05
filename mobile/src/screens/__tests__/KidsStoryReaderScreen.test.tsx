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
jest.mock('@/components/LanguageToggle', () => ({ __esModule: true, default: 'LanguageToggle' }));
jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: mockLang }),
}));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({
  colors: {}, typography: {}, spacing: { readingGutter: 22, lg: 16, md: 12, sm: 8 },
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

test('first scene mounts with a horizontal pager and vertically scrolling captions', () => {
  const { tree, find } = mount();
  const pager = find('story-pager');
  expect(pager.props.horizontal).toBe(true);
  expect(pager.props.pagingEnabled).toBe(true);
  expect(pager.props.initialNumToRender).toBe(1);
  expect(pager.props.getItemLayout(null, 2)).toEqual({ length: 390, offset: 780, index: 2 });
  expect(tree.root.findAllByType('Text' as any).some(node => node.props.children === story.pages[0].text.hi)).toBe(true);
  expect(find('story-prev').props.disabled).toBe(true);
  act(() => tree.unmount());
});

test('swipes, buttons, language changes and layout changes keep one page index', () => {
  const { tree, props, find, navigation } = mount('yamuna-crossing');
  expect(find('story-progress').props.children[0]).toBe(8);
  for (const language of ['en', 'gu', 'kn', 'hi']) {
    mockLang = language;
    act(() => tree.update(<Screen {...props} />));
    expect(find('story-progress').props.children[0]).toBe(8);
    expect(find('story-pager').props.keyExtractor(story.pages[7])).toBe('yamuna-crossing');
  }
  act(() => find('story-pager').props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 390 * 8 } } }));
  expect(find('story-progress').props.children[0]).toBe(9);
  act(() => find('story-prev').props.onPress());
  expect(mockScroll).toHaveBeenLastCalledWith({ index: 7, animated: true });
  expect(find('story-progress').props.children[0]).toBe(8);
  act(() => find('story-next').props.onPress());
  expect(mockScroll).toHaveBeenLastCalledWith({ index: 8, animated: true });
  const layout = tree.root.findAllByType('View' as any).find(node => node.props.onLayout)!;
  act(() => layout.props.onLayout({ nativeEvent: { layout: { width: 700 } } }));
  expect(find('story-pager').props.initialScrollIndex).toBe(8);
  expect(find('story-pager').props.getItemLayout(null, 8).offset).toBe(5600);
  act(() => find('story-pager').props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 700 * 9 } } }));
  act(() => find('story-next').props.onPress());
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

test('unknown story renders a graceful message without a pager', () => {
  mockLang = 'en';
  const { tree } = mount(undefined, 'missing');
  expect(tree.root.findAllByType('Text' as any).some(node => node.props.children === 'Story not found.')).toBe(true);
  expect(tree.root.findAllByProps({ testID: 'story-pager' })).toHaveLength(0);
  act(() => tree.unmount());
});
