import React from 'react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { Text, Image, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import OccasionTimingsCard from '../OccasionTimingsCard';
import PanchangShareCard from '../PanchangShareCard';
import OccasionShareCard from '../OccasionShareCard';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { computeDayInputs, dayAt } from '@/panchang/panchangDayStore';
import { findTimingOccurrences, solveOccasion, type OccasionTiming } from '@/panchang/occasionTimings';
import { runSynchronously } from '@/panchang/backgroundWork';
import { buildPanchangShareModel } from '@/panchang/panchangShareModel';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { panchangShareable } from '@/utils/panchangShare';
import { hydrateShareBrand } from '@/utils/shareBrandStore';
const mockShare = jest.fn();
let mockFontFactor = 1;
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockFontFactor }) }));
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: mockShare, busy: false }) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Circle: 'Circle', Path: 'Path', Ellipse: 'Ellipse', G: 'G', Defs: 'Defs', LinearGradient: 'Gradient', Stop: 'Stop' }));
const date = new Date(2026, 10, 8), opts = { calendarSystem: 'purnimant' as const, location: { cityId: 'delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 } };
const days = [0, 1].map(i => computeDayInputs(dayAt(date, i), opts));
const items = runSynchronously(findTimingOccurrences(date, opts, new Set())).map(o => solveOccasion(o, days));
const model = buildPanchangShareModel({ p: days[0].p, md: computeMuhuratDay(days[0].p.sunrise, days[0].p.sunset, days[1].p.sunrise, date.getDay()), observances: [], placeHi: 'नई दिल्ली', placeEn: 'New Delhi', calendarSystem: 'purnimant', lang: 'hi', occasionTimings: items });
const trees: TestRenderer.ReactTestRenderer[] = [];
async function mount(node: React.ReactNode, lang: Lang = 'hi') { let tree!: TestRenderer.ReactTestRenderer; await act(async () => { tree = TestRenderer.create(<ThemeProvider><GitaLanguageProvider initialLang={lang}>{node}</GitaLanguageProvider></ThemeProvider>); }); trees.push(tree); return tree; }
const copy = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(t => t.props.children).join('\n');
afterEach(() => { act(() => trees.splice(0).forEach(t => t.unmount())); mockShare.mockClear(); mockFontFactor = 1; });
test('Large reading enlarges ritual times and notes while export typography stays fixed', async () => {
  const item = { ...items[0], noteHi: 'दर्शन आवश्यक है।' };
  const screen = await mount(<OccasionTimingsCard items={[item]} date={date} place="नई दिल्ली" />);
  const timingSize = () => StyleSheet.flatten(screen.root.findAllByType(Text).find(t => String(t.props.children).includes('19:50'))!.props.style).fontSize;
  expect(timingSize()).toBe(21);
  mockFontFactor = 1.15;
  await act(async () => screen.update(<ThemeProvider><GitaLanguageProvider initialLang="hi"><OccasionTimingsCard items={[item]} date={date} place="नई दिल्ली" /></GitaLanguageProvider></ThemeProvider>));
  expect(timingSize()).toBe(24);
  const note = screen.root.findAllByType(Text).find(t => t.props.children === item.noteHi)!;
  expect(StyleSheet.flatten(note.props.style)).toMatchObject({ fontSize: 15, lineHeight: 26 });
  const share = await mount(<PanchangShareCard model={model} lang="hi" />);
  expect(StyleSheet.flatten(share.root.findAllByType(Text).find(t => String(t.props.children).includes('19:50'))!.props.style).fontSize).toBe(20);
});
for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) test(`${lang}: actual compact share retains all sixteen starts and four Vaas while adding real ritual`, async () => {
  const tree = await mount(<PanchangShareCard model={model} lang={lang} />, lang);
  expect(tree.root.findAllByProps({ testID: 'panchang-share-occasion' }).length).toBeGreaterThan(0);
  expect(copy(tree)).toContain('19:50'); expect(copy(tree)).toContain(model.sunrise);
  for (const period of [...model.day, ...model.night]) expect(copy(tree)).toContain(period.start);
  expect(copy(tree)).toContain(model.agni.value); expect(copy(tree)).toContain(model.dishaShool.value);
});
test('ordinary date has no new strip; ritual share sends the same data to the existing provider', async () => {
  const ordinary = await mount(<PanchangShareCard model={{ ...model, occasionTimings: [] }} lang="hi" />);
  expect(ordinary.root.findAllByProps({ testID: 'panchang-share-occasion' })).toHaveLength(0);
  const tree = await mount(<OccasionTimingsCard items={items} date={date} place="नई दिल्ली" placeEn="New Delhi" />);
  const action = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button' && n.props.testID === 'occasion-share').at(-1)!;
  await act(async () => action.props.onPress());
  const payload = mockShare.mock.calls[0][0]; expect(payload.sourceId).toBe('panchang.occasion');
  expect(payload.text('en')).toContain('New Delhi'); expect(payload.text('en')).toContain('19:50');
});
test('focused export preserves both next-day dates, notes and all windows', async () => {
  const item: OccasionTiming = { ...items[0], windows: [{ labelHi: 'पारण', labelEn: 'Parana', start: new Date(2026, 10, 9, 6), end: new Date(2026, 10, 9, 8) }], noteHi: 'दर्शन आवश्यक है।', noteEn: 'Actual sighting is required.' };
  const tree = await mount(<OccasionShareCard items={[item]} date={date} placeHi="नई दिल्ली" placeEn="New Delhi" lang="en" />, 'en');
  expect(copy(tree)).toContain('06:00, 9 Nov – 08:00, 9 Nov'); expect(copy(tree)).toContain(item.noteEn);
});
test('full export waits for both painted corners and the festival miniature before capture', async () => {
  await hydrateShareBrand();
  const onReady = jest.fn();
  const input = { p: days[0].p, md: computeMuhuratDay(days[0].p.sunrise, days[0].p.sunset, days[1].p.sunrise, date.getDay()), observances: [], placeHi: 'नई दिल्ली', placeEn: 'New Delhi', calendarSystem: 'purnimant' as const, lang: 'hi' as const, occasionTimings: items };
  const payload = panchangShareable(input);
  expect(payload.awaitsArt).toBe(true);
  const tree = await mount(payload.render({ lang: 'hi', onReady }));
  act(() => tree.root.findByType(PanchangShareCard).props.onIconLoad());
  const load = (id: string) => tree.root.findAllByType(Image).find(n => n.props.testID === id)!.props.onLoad();
  act(() => { load('festival-art-left'); load('festival-art-right'); });
  expect(onReady).not.toHaveBeenCalledWith(true);
  act(() => load('festival-art-diya'));
  expect(onReady).toHaveBeenCalledWith(true);
});
test('focused export also waits for the complete painted artwork', async () => {
  const onReady = jest.fn();
  const tree = await mount(<OccasionShareCard items={items} date={date} placeHi="नई दिल्ली" placeEn="New Delhi" lang="en" onReady={onReady} />);
  const load = (id: string) => tree.root.findAllByType(Image).find(n => n.props.testID === id)!.props.onLoad();
  act(() => { load('festival-art-left'); load('festival-art-right'); });
  expect(onReady).not.toHaveBeenCalledWith(true);
  act(() => load('festival-art-diya'));
  expect(onReady).toHaveBeenCalledWith(true);
});
test('bundled painted art matches the reviewed transparent source and atlas map', () => {
  const root = path.resolve(__dirname, '../../../..');
  const provenance = JSON.parse(readFileSync(path.join(root, 'docs/reviews/festival-art/provenance.json'), 'utf8'));
  expect(provenance.columns * provenance.rows).toBe(12);
  expect(provenance.cells).toEqual(['diya', 'fire', 'shastra', 'kalash', 'moon', 'sun', 'shiva', 'ganesh', 'rakhi', 'lotus', 'top-left-flowers', 'top-right-flowers']);
  for (const file of provenance.files) {
    const bytes = readFileSync(path.join(root, file.path));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
    expect(bytes.length).toBe(file.bytes);
    expect(file.hasAlpha).toBe(true);
  }
  expect(provenance.files[0].bytes).toBeLessThan(500_000);
});
