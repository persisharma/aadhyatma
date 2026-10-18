import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
let mockLang = 'hi';
let mockLarge = false;
const mockScroll = jest.fn();
const mockShare = jest.fn();
jest.mock('react-native', () => {
  const React = require('react');
  return {
    Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View', Image: 'Image',
    StyleSheet: { create: (x: unknown) => x, absoluteFillObject: {} },
    Platform: { OS: 'ios', select: (options: Record<string, unknown>) => options.ios ?? options.default },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    FlatList: React.forwardRef(function MockList(props: any, ref: any) {
      React.useImperativeHandle(ref, () => ({ scrollToIndex: mockScroll }));
      return React.createElement('FlatList', props, props.data.map((item: any, index: number) =>
        React.createElement(React.Fragment, { key: props.keyExtractor(item) }, props.renderItem({ item, index }))));
    }),
  };
});
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: (props: any) => {
  const React = require('react'); return React.createElement('ReaderHeader', props, props.right);
} }));
jest.mock('@/components/ShareButton', () => ({ __esModule: true, default: 'ShareButton' }));
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: mockShare, busy: false }) }));
jest.mock('@/components/ReadingProgressBar', () => ({ __esModule: true, default: 'ReadingProgressBar' }));
jest.mock('@/components/LanguageToggle', () => ({ __esModule: true, default: 'LanguageToggle' }));
jest.mock('@/components/ComicPage', () => ({ __esModule: true, default: 'ComicPage' }));
jest.mock('@/components/ComicArt', () => ({ __esModule: true, default: 'ComicArt' }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({
  colors: {}, spacing: { readingGutter: 22, md: 12, sm: 8 }, radii: { lg: 18, sm: 10 }, elevation: { raised: {} },
  typography: { ...require('@/theme/typography').typography, meaning: { fontSize: mockLarge ? 23 : 20 } },
}) }));
const Screen = require('../ComicReaderScreen').default;
const Shelf = require('../ComicChaptersScreen').default;
const { getComicBook, comicPages, comicPageIndex } = require('@/data/comicBooks');
const book = getComicBook('balakanda-v1');
const trees: TestRenderer.ReactTestRenderer[] = [];
function mount(params: any = { comicId: 'balakanda-v1' }, Component = Screen) {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };
  const props = { navigation, route: { params } };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Component {...props} />); });
  trees.push(tree);
  return { tree, props, navigation, find: (testID: string) => tree.root.findByProps({ testID }) };
}
afterEach(() => { trees.splice(0).forEach(tree => act(() => tree.unmount())); mockLang = 'hi'; mockLarge = false; });
test('29 native episode cards open the selected scene in the reader', () => {
  const { tree, find, navigation } = mount(undefined, Shelf);
  expect(find('comic-episodes').props.data).toHaveLength(29);
  act(() => tree.root.find(node => node.type === ('Pressable' as any) && node.props.testID === 'comic-episode-bk-06').props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('ComicReader', { comicId: 'balakanda-v1', episodeId: 'bk-06' });
  expect(tree.root.findAllByType('WebView' as any)).toHaveLength(0);
});
test('each prasang card shows its curated key scene, filled into the shared listing thumb', () => {
  const { comicEpisodeCovers } = require('@/data/comicBooks/episodeCovers');
  const { tree, find } = mount(undefined, Shelf);
  const arts = tree.root.findAllByType('ComicArt' as any);
  expect(arts).toHaveLength(29);
  book.episodes.forEach((episode: any, index: number) => {
    const cover = comicEpisodeCovers[episode.id];
    expect(cover).toBeTruthy();
    expect(episode.panels.map((panel: any) => panel.id)).toContain(cover.panelId);
    expect(arts[index].props.panel.id).toBe(cover.panelId);
    expect(arts[index].props.fill).toBe(true);
  });
  const visible = tree.root.findAllByType('Text' as any).map(node => [].concat(node.props.children).join(''));
  expect(visible).toContain('प्रसंग 1');
  expect(visible).toContain(book.episodes[0].hi.title);
  expect(visible).not.toContain(book.episodes[0].en.title);
  expect(visible).toContain(`${book.episodes[0].panels.length} पृष्ठ`);
  expect(find('comic-episodes').props.ListHeaderComponent.props.children.startsWith('29 प्रसंग · ')).toBe(true);
});
test('the episode index sends all 29 titles to the listing share picker', () => {
  const { tree } = mount(undefined, Shelf);
  act(() => tree.root.findByType('ShareButton' as any).props.onPress());
  const content = mockShare.mock.calls.at(-1)?.[0];
  expect(content.scopes.flatMap((scope: any) => scope.prepared.en.pages)
    .flatMap((page: any) => page.blocks.filter((block: any) => block.kind === 'heading'))).toHaveLength(29);
});
test('62 grouped pages use swipe paging and unrestricted vertical scrolling without source/web controls', () => {
  const { tree, find } = mount();
  expect(find('comic-pager').props.data).toHaveLength(62);
  expect(find('comic-pager').props.horizontal).toBe(true);
  expect(find('comic-pager').props.pagingEnabled).toBe(true);
  expect(find('comic-native-reader').props.edges).toEqual(['top', 'left', 'right']);
  expect(tree.root.findAllByType('ComicPage' as any)).toHaveLength(62);
  expect(tree.root.findAllByType('WebView' as any)).toHaveLength(0);
  expect(tree.root.findAllByType('Pressable' as any)).toHaveLength(0);
});
test('swiping, language/size changes, rotation and route changes keep the intended scene', () => {
  const { tree, props, find } = mount({ comicId: 'balakanda-v1', panelId: 'bk-06-03' });
  const start = comicPageIndex(book, undefined, 'bk-06-03');
  expect(find('comic-progress').props.children[0]).toBe(start + 1);
  act(() => find('comic-pager').props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: (start + 1) * 390 } } }));
  for (const lang of ['en', 'gu', 'kn', 'hi']) {
    mockLang = lang; mockLarge = true;
    act(() => tree.update(<Screen {...props} />));
    expect(find('comic-progress').props.children[0]).toBe(start + 2);
    expect(find('comic-pager').props.extraData.typography.meaning.fontSize).toBe(23);
  }
  const viewport = tree.root.findAllByType('View' as any).find(node => node.props.onLayout)!;
  act(() => viewport.props.onLayout({ nativeEvent: { layout: { width: 768 } } }));
  expect(find('comic-pager').props.initialScrollIndex).toBe(start + 1);
  expect(find('comic-pager').props.getItemLayout(null, 3).offset).toBe(2304);
  const next = { ...props, route: { params: { comicId: 'balakanda-v1', episodeId: 'bk-29' } } };
  act(() => tree.update(<Screen {...next} />));
  expect(find('comic-progress').props.children[0]).toBe(comicPageIndex(book, 'bk-29') + 1);
});
test('unknown comic is handled and authored regional text preserves app language', () => {
  expect(mount({ comicId: 'missing' }).find('comic-reader-error')).toBeTruthy();
  mockLang = 'gu';
  const { tree, find } = mount();
  expect(tree.root.findAllByProps({testID:'comic-language-fallback'})).toHaveLength(0);
  expect(tree.root.findAllByType('ComicPage' as any).every(node => node.props.language === 'gu')).toBe(true);
  expect(mockLang).toBe('gu');
});
