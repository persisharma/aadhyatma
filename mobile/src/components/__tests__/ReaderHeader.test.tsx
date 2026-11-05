import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import ReaderHeader from '../ReaderHeader';

const trees: ReactTestRenderer[] = [];
afterEach(() => { act(() => trees.splice(0).forEach(tree => tree.unmount())); });
function render(lang: Lang, extra: Partial<React.ComponentProps<typeof ReaderHeader>> = {}) {
  const title = contentByLang(lang, 'ॐ जय शिव ओंकारा', 'Om Jai Shiv Omkara');
  const onBack = jest.fn();
  const onAction = jest.fn();
  let tree!: ReactTestRenderer;
  act(() => { tree = create(<GitaLanguageProvider initialLang={lang}>
    <ReaderHeader title={title} onBack={onBack} right={<Pressable accessibilityLabel="Header action" onPress={onAction}><Text>100 / 100</Text></Pressable>} {...extra} />
  </GitaLanguageProvider>); });
  trees.push(tree);
  return { tree, title, onBack, onAction };
}

test.each<Lang>(['hi', 'en', 'gu', 'kn'])('%s preserves the full title and both actions', lang => {
  const { tree, title, onBack, onAction } = render(lang);
  const text = tree.root.findAllByType(Text).find(node => node.props.children === title)!;
  expect(text.props.numberOfLines).toBeUndefined();
  expect(text.props.adjustsFontSizeToFit).toBeUndefined();
  expect(text.props.allowFontScaling).toBe(true);
  act(() => tree.root.findAll(node => typeof node.props.onPress === 'function').find(node => node.props.accessibilityLabel === 'Back')!.props.onPress());
  act(() => tree.root.findAll(node => typeof node.props.onPress === 'function').find(node => node.props.accessibilityLabel === 'Header action')!.props.onPress());
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(onAction).toHaveBeenCalledTimes(1);
});

test('balances changing trailing content without reserving 120pt for a bare counter', () => {
  const { tree } = render('en');
  const actions = () => tree.root.findAllByType(View).find(node => node.props.testID === 'reader-header-actions')!;
  expect(StyleSheet.flatten(actions().props.style).minWidth).toBe(48);
  act(() => actions().props.onLayout({ nativeEvent: { layout: { width: 96.2 } } }));
  expect(tree.root.findAllByType(View).some(node => StyleSheet.flatten(node.props.style)?.width === 97)).toBe(true);
  act(() => actions().props.onLayout({ nativeEvent: { layout: { width: 48 } } }));
  expect(tree.root.findAllByType(View).some(node => StyleSheet.flatten(node.props.style)?.width === 97)).toBe(false);
});

test('retains explicit side minima, custom back labels and branded mastheads', () => {
  const { tree, title } = render('hi', { sideWidth: 96, backAccessibilityLabel: 'Back to chapters', titleContent: <Text>Branded title</Text> });
  const actions = tree.root.findAllByType(View).find(node => node.props.testID === 'reader-header-actions')!;
  expect(StyleSheet.flatten(actions.props.style).minWidth).toBe(96);
  expect(tree.root.findAll(node => typeof node.props.onPress === 'function').some(node => node.props.accessibilityLabel === 'Back to chapters')).toBe(true);
  expect(tree.root.findAllByType(View).some(node => node.props.accessibilityLabel === title)).toBe(true);
});
