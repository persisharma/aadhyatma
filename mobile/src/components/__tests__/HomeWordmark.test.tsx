import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import HomeWordmark from '../HomeWordmark';
import VedanshWordmark, { companionTagline } from '../VedanshWordmark';
import ShareBrandFooter from '../ShareBrandFooter';

const languages: Lang[] = ['hi', 'en', 'gu', 'kn'];
for (const lang of languages) for (const scale of ['M', 'L']) {
  test(`Home branding uses ${lang} at reading size ${scale} with growing text`, async () => {
    await AsyncStorage.setItem('@vedansh/font-scale', scale);
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(<FontScaleProvider><ThemeProvider><GitaLanguageProvider initialLang={lang}>
        <HomeWordmark />
      </GitaLanguageProvider></ThemeProvider></FontScaleProvider>);
    });
    const texts = tree.root.findAllByType(Text);
    expect(texts.some(n => n.props.children === companionTagline(lang))).toBe(true);
    for (const text of texts) {
      expect(text.props.allowFontScaling).toBe(true);
      expect(text.props.numberOfLines).toBeUndefined();
      const style = StyleSheet.flatten(text.props.style);
      expect(style.lineHeight / style.fontSize).toBeGreaterThanOrEqual(1.5);
    }
    act(() => tree.unmount());
  });
}
test('launch lockup includes both approved names and the companion subtitle', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<VedanshWordmark lang="en" bilingual />); });
  expect(tree.root.findAllByType(Image)).toHaveLength(2);
  expect(tree.root.findByProps({ testID: 'vedansh-wordmark-en' })).toBeDefined();
  expect(tree.root.findByProps({ testID: 'vedansh-wordmark-hi' })).toBeDefined();
  expect(tree.root.findAllByType(Text).map(n => n.props.children)).toEqual(['Your spiritual companion']);
  act(() => tree.unmount());
});
test.each(languages)('export footer respects card language %s and keeps the download link', lang => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ShareBrandFooter lang={lang} />); });
  const texts = tree.root.findAllByType(Text);
  expect(texts.some(n => n.props.children === companionTagline(lang))).toBe(true);
  expect(texts.some(n => String(n.props.children).includes('vedansh.app/get'))).toBe(true);
  expect(tree.root.findByType(VedanshWordmark).props.fixedExport).toBe(true);
  act(() => tree.unmount());
});
