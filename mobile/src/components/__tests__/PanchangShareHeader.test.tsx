import React from 'react';
import { StyleSheet, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import PanchangShareCard from '../PanchangShareCard';
import type { PanchangShareModel } from '@/panchang/panchangShareModel';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';

jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Circle: 'Circle', Path: 'Path' }));
jest.mock('@/data/shareLinks', () => ({ SMART_LINK: 'https://vedansh.app/get' }));

const anga = { name: 'नवमी', lines: ['11:54 तक, फिर दशमी'] };
const vaas = { value: 'तुला', line: 'सूर्य राशि', valueWarn: false, lineWarn: false };
const model: PanchangShareModel = {
  place: 'डीडवाना', date: 'मंगलवार, 3 नवंबर 2026', identity: 'कार्तिक कृष्ण नवमी',
  brahma: '05:07 – 05:55', sunrise: '06:43', sunset: '17:46', moonrise: '00:53',
  festival: null, tithi: anga, nakshatra: anga, yoga: anga, karana: anga,
  day: [], night: [], abhijit: '11:52 – 12:37', rahu: '15:00 – 16:23',
  gulika: '12:15 – 13:38', yamaganda: '09:29 – 10:52',
  surya: vaas, chandra: vaas, dishaShool: vaas, agni: vaas,
};

it.each(['hi', 'en', 'gu', 'kn'] as Lang[])('%s share chrome reserves matras without negative margins or a mixed-font baseline', lang => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<PanchangShareCard model={model} lang={lang} />); });
  const node = (id: string) => tree.root.findByProps({ testID: id });
  const subtitle = tree.root.findAllByType(Text).find(n =>
    n.props.children === contentByLang(lang, 'पूर्ण पंचांग', 'Full Panchang'))!;
  const subtitleStyle = StyleSheet.flatten(subtitle.props.style);
  expect(subtitleStyle.lineHeight / subtitleStyle.fontSize).toBeGreaterThanOrEqual(1.5);
  expect(StyleSheet.flatten(subtitle.parent!.props.style).gap).toBeGreaterThanOrEqual(3);

  for (const id of ['panchang-share-subtitle', 'panchang-share-location', 'panchang-share-download-label', 'panchang-share-download-link']) {
    const n = node(id), s = StyleSheet.flatten(n.props.style);
    expect(s.marginTop ?? 0).toBeGreaterThanOrEqual(0);
    expect(n.props.allowFontScaling).toBe(false);
    expect(s.includeFontPadding).toBe(false);
  }
  const location = node('panchang-share-location');
  expect(location.props.adjustsFontSizeToFit).toBe(true);
  expect(StyleSheet.flatten(location.props.style).lineHeight).toBeUndefined();
  expect(StyleSheet.flatten(node('panchang-share-location-chip').props.style).alignItems).toBe('center');
  const pillStyle = StyleSheet.flatten(node('panchang-share-download-pill').props.style);
  expect(pillStyle).toMatchObject({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' });
  const label = node('panchang-share-download-label'), link = node('panchang-share-download-link');
  expect(label.parent).toBe(link.parent);
  expect(label.findAllByType(Text)).toHaveLength(1); // no nested URL sharing its Indic baseline
  expect(link.props.children).toBe('vedansh.app/get');
  expect(StyleSheet.flatten(location.props.style).transform[0].translateY).toBeGreaterThan(0);
  expect(StyleSheet.flatten(link.props.style).transform[0].translateY).toBeLessThan(0);
  act(() => tree.unmount());
});
