import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import MuhuratScanStart from '../MuhuratScanStart';
import type { Lang } from '@/data/gita/language';
let mockLang: Lang = 'en';
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({ location: { labelHi: 'जयपुर', labelEn: 'Jaipur' } }),
}));
test.each([
  ['en', 'Dates from 21 Nov · IST', 'NotoSerifDevanagari_600SemiBold'],
  ['hi', '21 नवं से तिथियाँ · IST', 'NotoSerifDevanagari_600SemiBold'],
  ['gu', 'થી તારીખો · IST', 'NotoSerifGujarati_600SemiBold'],
  ['kn', 'ರಿಂದ ದಿನಾಂಕಗಳು · IST', 'NotoSerifKannada_600SemiBold'],
] as const)('%s scan date is complete, script-safe and scalable', (lang, label, font) => {
  mockLang = lang;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<MuhuratScanStart date={new Date(2026, 10, 21)} />); });
  const line = tree.root.findByProps({ testID: 'muhurat-scan-start' });
  expect(line.props.children).toContain(label);
  expect(line.props.numberOfLines).toBeUndefined();
  expect(line.props.allowFontScaling).not.toBe(false);
  const style = StyleSheet.flatten(line.props.style);
  expect(style.fontFamily).toBe(font);
  expect(style.lineHeight / style.fontSize).toBeGreaterThanOrEqual(1.7);
  act(() => tree.unmount());
});
