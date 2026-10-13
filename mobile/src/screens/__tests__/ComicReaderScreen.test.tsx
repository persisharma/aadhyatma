import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('react-native', () => ({
  Pressable: 'Pressable', Text: 'Text', View: 'View', ActivityIndicator: 'ActivityIndicator',
  StyleSheet: { create: (x: unknown) => x },
}));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: 'ReaderHeader' }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('@/utils/langType', () => ({ titleFontByLang: () => 'test-font' }));
jest.mock('@/utils/localize', () => ({ pick: (lang: string, values: Record<string, string>) => values[lang] }));

const Screen = require('../ComicReaderScreen').default;

function render(comicId: string) {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Screen navigation={navigation} route={{ params: { comicId } }} />); });
  return { tree, navigation };
}

test('loads the comic reader in a WebView at the CDN url', () => {
  const { tree } = render('balakanda-v1');
  const webview = tree.root.findByProps({ testID: 'comic-reader-webview' });
  expect(webview.props.source.uri).toBe('https://cdn.vedansh.app/comics/balakanda-v1/index.html');
  expect(tree.root.findAllByProps({ testID: 'comic-reader-error' })).toHaveLength(0);
});

test('shows an error + retry when the WebView fails to load', () => {
  const { tree } = render('balakanda-v1');
  act(() => tree.root.findByProps({ testID: 'comic-reader-webview' }).props.onError());
  expect(tree.root.findAllByProps({ testID: 'comic-reader-webview' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'comic-reader-error' })).toBeTruthy();
  act(() => tree.root.findByProps({ testID: 'comic-reader-retry' }).props.onPress());
  expect(tree.root.findByProps({ testID: 'comic-reader-webview' }).props.source.uri)
    .toBe('https://cdn.vedansh.app/comics/balakanda-v1/index.html');
});

test('unknown comic id renders the error state without a retry', () => {
  const { tree } = render('does-not-exist');
  expect(tree.root.findAllByProps({ testID: 'comic-reader-webview' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'comic-reader-error' })).toBeTruthy();
  expect(tree.root.findAllByProps({ testID: 'comic-reader-retry' })).toHaveLength(0);
});
