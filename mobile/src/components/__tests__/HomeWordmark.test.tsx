import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import HomeWordmark from '../HomeWordmark';
import VedanshWordmark, { companionTagline } from '../VedanshWordmark';
import ShareBrandFooter from '../ShareBrandFooter';
import { lightColors } from '@/theme/colors';
import manifest from '@assets/branding/wordmarks/manifest.json';

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
    for (const text of texts.filter(n => n.props.testID === 'home-wordmark-tagline')) {
      expect(text.props.allowFontScaling).toBe(true);
      expect(text.props.numberOfLines).toBeUndefined();
      const style = StyleSheet.flatten(text.props.style);
      expect(style.lineHeight / style.fontSize).toBeGreaterThanOrEqual(1.5);
    }
    const image = tree.root.findByType(Image);
    const imageStyle = StyleSheet.flatten(image.props.style);
    expect(image.props.testID).toBe(`vedansh-wordmark-${lang === 'hi' ? 'hi' : 'en'}`);
    expect(imageStyle.tintColor).toBeUndefined();
    const frame = StyleSheet.flatten(tree.root.findByProps({ testID: 'home-wordmark-artwork-frame' }).props.style);
    expect(frame.height).toBe(36);
    expect(frame.width).toBeCloseTo(lang === 'hi' ? 97 : 124);
    expect(imageStyle.width).toBeLessThanOrEqual(frame.width);
    expect(imageStyle.width / imageStyle.aspectRatio).toBeLessThanOrEqual(frame.height);
    const metrics = manifest.names[lang === 'hi' ? 'hi' : 'en'];
    const ink = metrics.homeFrame;
    const sourceScale = imageStyle.width / metrics.width;
    expect((ink.letteringBottom - ink.letteringTop) * sourceScale).toBeCloseTo(30);
    const imageTop = (42 - metrics.height * sourceScale) / 2 + ink.translateY;
    expect(imageTop + (ink.letteringTop + ink.letteringBottom) / 2 * sourceScale).toBeCloseTo(21);
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

// Source geometry checks protect the actual regressions in the supplied device
// screenshots: a launch-sized copper heading and the missing side ornaments.
test.each([false, true])('keeps the compact Home crest and unmodified flute artwork (compact=%s)', async compact => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><GitaLanguageProvider initialLang="hi"><HomeWordmark compact={compact} /></GitaLanguageProvider></ThemeProvider>); });
  const crest = tree.root.findByProps({ testID: 'home-wordmark-crest' });
  expect(StyleSheet.flatten(crest.props.style).height).toBe(42);
  expect(crest.props.accessibilityLabel).toBe('वेदांश़');
  for (const side of ['left', 'right']) {
    const om = tree.root.findByProps({ testID: `home-wordmark-om-${side}` });
    expect(StyleSheet.flatten(om.props.style)).toMatchObject({ width: 30, height: 30, borderColor: lightColors.iconAccent });
    expect(om.findByType(Text).props.children).toBe('ॐ');
    expect(tree.root.findAllByType(View).filter(n => n.props.testID === `home-wordmark-rule-${side}`)).toHaveLength(compact ? 0 : 1);
  }
  const image = tree.root.findByType(Image);
  expect(StyleSheet.flatten(image.props.style).tintColor).toBeUndefined();
  expect(manifest.lettering.hindiNukta).toBe('round separated dot below sh');
  const subtitle = tree.root.findByProps({ testID: 'home-wordmark-tagline' });
  expect(StyleSheet.flatten(subtitle.props.style)).toMatchObject({ fontSize: 14, color: lightColors.inkSoft });
  act(() => tree.unmount());
});

test.each([320, 360, 375, 390, 393.45, 414, 430, 768])('Home crest leaves the settings target clear at %sdp', viewport => {
  const content = viewport - 32; // Home's shared 16dp gutters
  const compact = content < 350;
  for (const lang of languages) {
    const metrics = manifest.names[lang === 'hi' ? 'hi' : 'en'];
    const name = metrics.homeFrame.width;
    const width = name + 2 * 30 + (compact ? 2 * 6 : 2 * 22 + 4 * 10);
    // A centered crest must finish before the right-aligned 44dp Settings hit target.
    expect((content + width) / 2).toBeLessThanOrEqual(content - 44);
  }
});

test('Home can omit its subtitle without losing the crest', async () => {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><GitaLanguageProvider initialLang="hi"><HomeWordmark showTagline={false} /></GitaLanguageProvider></ThemeProvider>); });
  expect(tree.root.findAllByProps({ testID: 'home-wordmark-tagline' })).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'home-wordmark-crest' })).toBeDefined();
  act(() => tree.unmount());
});
