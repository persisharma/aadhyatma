import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Modal, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { gitaChaptersManifest, getGitaChapter } from '@/data/gita';
import GitaVerseJumpSheet, { JUMP_LABEL, parseVerseNumber } from '../GitaVerseJumpSheet';
import { cardFontByLang } from '@/utils/langType';

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => { act(() => trees.splice(0).forEach(tree => tree.unmount())); jest.restoreAllMocks(); });
function control(tree: TestRenderer.ReactTestRenderer, id: string) {
  return tree.root.findAll(n => n.props.testID === id && typeof n.props.onPress === 'function')[0];
}
async function render(lang: Lang = 'hi', size = 'M') {
  jest.spyOn(AsyncStorage, 'getItem').mockImplementation(async key => key === '@vedansh/font-scale' ? size : null);
  const onOpen = jest.fn(() => true);
  const onClose = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 24, bottom: 16, left: 0, right: 0 }}><FontScaleProvider><ThemeProvider><GitaLanguageProvider initialLang={lang}>
    <GitaVerseJumpSheet chapter={2} verse={12} onOpen={onOpen} onClose={onClose} />
  </GitaLanguageProvider></ThemeProvider></FontScaleProvider></SafeAreaInsetsContext.Provider>); });
  trees.push(tree);
  return { tree, onOpen, onClose };
}

test.each(['47', '४७', '૪૭', '೪೭', ' ४7 '])('accepts localized input %s', text => expect(parseVerseNumber(text, 72)).toBe(47));
test.each(['', '0', '73', '-1', '2.47', '4x', '1e1', 'Infinity', '1 2'])('rejects invalid input %s', text => expect(parseVerseNumber(text, 72)).toBeNull());

test.each(['hi', 'en', 'gu', 'kn'] as Lang[])('%s has script-safe labels at both reading sizes', async lang => {
  for (const size of ['M', 'L']) {
    const { tree } = await render(lang, size);
    const heading = tree.root.findAllByType(Text).find(n => n.props.children === JUMP_LABEL[lang])!;
    expect(StyleSheet.flatten(heading.props.style).fontFamily).toBe(cardFontByLang(lang));
    expect(heading.props.allowFontScaling).not.toBe(false);
    expect(control(tree, 'gita-jump-open').props.accessibilityState.disabled).toBe(false);
    expect(StyleSheet.flatten(control(tree, 'gita-jump-open').props.style).minHeight).toBeGreaterThanOrEqual(48);
  }
});

test('selection is a draft; Open submits once and cancellation submits nothing', async () => {
  const { tree, onOpen, onClose } = await render();
  act(() => control(tree, 'gita-jump-verse-47').props.onPress());
  expect(onOpen).not.toHaveBeenCalled();
  expect(control(tree, 'gita-jump-verse-47').props.accessibilityState.selected).toBe(true);
  act(() => control(tree, 'gita-jump-cancel').props.onPress());
  act(() => tree.root.findByType(Modal).props.onRequestClose());
  act(() => control(tree, 'gita-jump-backdrop').props.onPress());
  expect(onClose).toHaveBeenCalledTimes(3);
  expect(onOpen).not.toHaveBeenCalled();
  act(() => { control(tree, 'gita-jump-open').props.onPress(); control(tree, 'gita-jump-open').props.onPress(); });
  expect(onOpen).toHaveBeenCalledTimes(1);
  expect(onOpen).toHaveBeenCalledWith(2, 47);
});

test('chapter counts match actual corpus, selecting a shorter chapter resets draft to verse 1', async () => {
  const { tree, onOpen } = await render();
  for (const summary of gitaChaptersManifest) {
    expect(getGitaChapter(summary.chapter).verses).toHaveLength(summary.verseCount);
    act(() => control(tree, 'gita-jump-chapter').props.onPress());
    act(() => control(tree, `gita-jump-chapter-${summary.chapter}`).props.onPress());
    expect(tree.root.findByType(TextInput).props.value).toBe('1');
    expect(control(tree, `gita-jump-verse-${summary.verseCount}`)).toBeDefined();
    expect(control(tree, `gita-jump-verse-${summary.verseCount + 1}`)).toBeUndefined();
  }
  expect(onOpen).not.toHaveBeenCalled();
});

test('invalid typed input disables Open; valid input and a load failure allow retry', async () => {
  const { tree, onOpen } = await render('en');
  act(() => tree.root.findByType(TextInput).props.onChangeText('99'));
  expect(control(tree, 'gita-jump-open').props.disabled).toBe(true);
  act(() => tree.root.findByType(TextInput).props.onSubmitEditing());
  expect(onOpen).not.toHaveBeenCalled();
  act(() => tree.root.findByType(TextInput).props.onChangeText('೪೭'));
  onOpen.mockReturnValueOnce(false);
  act(() => control(tree, 'gita-jump-open').props.onPress());
  expect(tree.root.findAllByType(Text).some(n => n.props.accessibilityRole === 'alert')).toBe(true);
  act(() => control(tree, 'gita-jump-open').props.onPress());
  expect(onOpen).toHaveBeenCalledTimes(2);
  expect(onOpen).toHaveBeenLastCalledWith(2, 47);
});


test('typed target is brought into the visible grid without moving the reader', async () => {
  const scroll = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
  const { tree, onOpen } = await render();
  act(() => control(tree, 'gita-jump-verse-47').props.onLayout({ nativeEvent: { layout: { y: 620 } } }));
  act(() => tree.root.findByType(TextInput).props.onChangeText('47'));
  expect(scroll).toHaveBeenCalledWith({ y: 560, animated: false });
  expect(onOpen).not.toHaveBeenCalled();
});
