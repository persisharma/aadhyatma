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
const features = (lang: Lang) => contentByLang(lang, 'मुहूर्त · चौघड़िया · व्रत-त्योहार · कुंडली · पाठ', 'Muhurat · Choghadiya · Festivals · Kundali');

function render(lang: Lang, brand?: { name: string; line: string | null } | null) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<PanchangShareCard model={model} lang={lang} brand={brand} />); });
  return tree;
}
const texts = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(n => n.props.children);

describe.each(['hi', 'en', 'gu', 'kn'] as Lang[])('%s co-branding', lang => {
  it('without a profile the card is unchanged: no chip, feature line, download pill', () => {
    const tree = render(lang, null);
    expect(tree.root.findAllByProps({ testID: 'panchang-share-brand-chip' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'panchang-share-brand-line' })).toHaveLength(0);
    expect(texts(tree)).toContain(features(lang));
    expect(tree.root.findByProps({ testID: 'panchang-share-download-link' }).props.children).toBe('vedansh.app/get');
    act(() => tree.unmount());
  });

  it('a name alone adds the header chip beside the city and keeps the feature line', () => {
    const tree = render(lang, { name: 'पं. रमेश शर्मा', line: null });
    const chip = tree.root.findByProps({ testID: 'panchang-share-brand-chip' });
    const city = tree.root.findByProps({ testID: 'panchang-share-location-chip' });
    expect(chip.parent).toBe(city.parent);
    const name = tree.root.findByProps({ testID: 'panchang-share-brand-name' });
    expect(name.props.children).toBe('पं. रमेश शर्मा');
    // Fixed image text: never scaled by system settings, shrinks only as a last resort.
    expect(name.props.allowFontScaling).toBe(false);
    expect(name.props.numberOfLines).toBe(1);
    expect(name.props.adjustsFontSizeToFit).toBe(true);
    expect(texts(tree)).toContain(features(lang));
    expect(tree.root.findAllByProps({ testID: 'panchang-share-brand-line' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('title · contact replaces the feature line; the Vedansh pill stays', () => {
    const tree = render(lang, { name: 'पं. रमेश शर्मा', line: 'ज्योतिषाचार्य · 98290 12345' });
    const line = tree.root.findByProps({ testID: 'panchang-share-brand-line' });
    expect(line.props.children).toBe('ज्योतिषाचार्य · 98290 12345');
    expect(line.props.allowFontScaling).toBe(false);
    // Devanagari line on any card language: Noto face with mark headroom.
    expect(StyleSheet.flatten(line.props.style).fontFamily).toMatch(/Devanagari/);
    expect(texts(tree)).not.toContain(features(lang));
    expect(tree.root.findByProps({ testID: 'panchang-share-download-pill' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'panchang-share-download-link' }).props.children).toBe('vedansh.app/get');
    act(() => tree.unmount());
  });
});

it('a Latin name or line is drawn in the Latin face on an Indic card', () => {
  const tree = render('hi', { name: 'Pt. Ramesh Sharma', line: 'Jyotishacharya' });
  expect(StyleSheet.flatten(tree.root.findByProps({ testID: 'panchang-share-brand-name' }).props.style).fontFamily).toMatch(/Cormorant/);
  expect(StyleSheet.flatten(tree.root.findByProps({ testID: 'panchang-share-brand-line' }).props.style).fontFamily).toMatch(/Cormorant/);
  act(() => tree.unmount());
});
