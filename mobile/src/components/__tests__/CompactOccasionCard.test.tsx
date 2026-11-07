import React from 'react';
import * as RN from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import CompactOccasionCard from '../CompactOccasionCard';
import OccasionSection from '../OccasionSection';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import { occasionRange } from '@/panchang/occasionTimingFormat';
import { vratOccasionTarget, panchangDatedEntry } from '@/navigation/vratOccasionTarget';
import { contentByLang } from '@/utils/localize';
import { formatShortDate } from '@/panchang/muhuratFormat';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import measuredClocks from './fixtures/compactOccasionClockWidths.json';

const mockShare = jest.fn();
let mockFactor = 1;
let mockDimensions = { width: 390, height: 844, scale: 3, fontScale: 1 };
// Mock the underlying export, not Babel's namespace copy. The old namespace
// spy left the component on RN's default 750dp / fontScale=2 in every case.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockDimensions }));
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockFactor }) }));
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: mockShare, busy: false }) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Circle: 'Circle', Path: 'Path', Ellipse: 'Ellipse', G: 'G', Defs: 'Defs', LinearGradient: 'Gradient', Stop: 'Stop' }));
const date = new Date(2026, 10, 8);
const window = { labelHi: 'प्रदोष व वृषभ लग्न', labelEn: 'Pradosh and Vrishabha lagna', start: new Date(2026, 10, 8, 18, 3), end: new Date(2026, 10, 8, 20) };
const diwali: OccasionTiming = { id: 'diwali-lakshmi', ruleId: 'diwali', date, nameHi: 'दीपावली · लक्ष्मी पूजा', nameEn: 'Diwali · Lakshmi puja', motif: 'diya', windows: [window] };
const midnight: OccasionTiming = { id: 'masik-shivaratri-shiva', ruleId: 'masik-shivaratri', date: new Date(2026, 10, 7), nameHi: 'मासिक शिवरात्रि', nameEn: 'Masik Shivaratri', motif: 'shiva', windows: [{ ...window, labelHi: 'निशिता पूजा', labelEn: 'Nishita puja', start: new Date(2026, 10, 7, 23, 44), end: new Date(2026, 10, 8, 0, 36) }] };
const guidance: OccasionTiming = { ...diwali, id: 'hanuman-guidance', ruleId: 'hanuman-jayanti-kartik', windows: [], noteHi: 'क्षेत्रीय परंपरा', noteEn: 'Regional tradition' };
let tree: TestRenderer.ReactTestRenderer;
// React Native exposes both a composite and host instance for each testID.
const views = (id: string) => tree.root.findAllByType(RN.View).filter(n => n.props.testID === id);
const texts = (id: string) => tree.root.findAllByType(RN.Text).filter(n => n.props.testID === id);
const press = (id: string) => tree.root.findAllByProps({ testID: id }).find(n => typeof n.props.onPress === 'function')!;
const onOpenVrat = jest.fn();
async function mount(node: React.ReactNode, lang: Lang = 'hi') {
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><GitaLanguageProvider initialLang={lang}>{node}</GitaLanguageProvider></ThemeProvider>); });
  const width = mockDimensions.width;
  act(() => views('compact-occasion-card')[0]?.props.onLayout?.({ nativeEvent: { layout: { width: width - 28 } } }));
  return tree;
}
beforeEach(() => { mockFactor = 1; mockDimensions = { width: 390, height: 844, scale: 3, fontScale: 1 }; });
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); jest.clearAllMocks(); });

for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) for (const factor of [1, 1.15]) for (const width of [320, 390]) {
  test(`${lang}, factor ${factor}, width ${width}: complete windows, safe type and no hero artwork`, async () => {
    mockFactor = factor;
    mockDimensions = { width, height: 844, scale: 3, fontScale: width === 320 ? 1.3 : 1 };
    await mount(<CompactOccasionCard items={[diwali, midnight, guidance]} date={date} onOpenVrat={onOpenVrat} />, lang);
    expect(views('compact-occasion-card')).toHaveLength(1);
    const times = views('compact-occasion-time');
    expect(times.map(t => t.props.accessibilityLabel)).toEqual([occasionRange(window, date, lang), occasionRange(midnight.windows[0], date, lang)]);
    expect(texts('compact-occasion-clock').map(t => t.props.children)).toEqual(['18:03', '20:00', '23:44', '00:36']);
    expect(texts('compact-occasion-date').map(t => t.props.children)).toEqual([formatShortDate(midnight.windows[0].start, lang), formatShortDate(midnight.windows[0].end, lang)]);
    expect(views('occasion-inline-art')).toHaveLength(0);
    for (const text of tree.root.findAllByType(RN.Text)) {
      expect(text.props.allowFontScaling).not.toBe(false);
      expect(text.props.numberOfLines).toBeUndefined();
      expect(text.props.adjustsFontSizeToFit).not.toBe(true);
    }
    expect(times[1].props.accessibilityLabel).toContain('7 ');
    expect(tree.root.findAllByType(RN.Text).map(n => n.props.children)).toContain(contentByLang(lang, diwali.nameHi, diwali.nameEn));
    for (const text of texts('compact-occasion-date')) {
      expect(text.props.style.fontSize).toBeLessThan(texts('compact-occasion-clock')[0].props.style.fontSize);
      expect(text.props.style.lineHeight).toBeGreaterThanOrEqual(text.props.style.fontSize * 1.65);
    }
    expect(views('compact-occasion-row-layout')[1].props.style.flexDirection).toBe(width === 320 || factor > 1 ? 'column' : 'row');
    // Bound the real shipped font's widest HH:MM (all 1,440 clocks), including
    // the system scale actually seen by the component, against its time column.
    const scale = factor * mockDimensions.fontScale;
    const group = times[0].props.style;
    const endpoint = times[0].findAllByType(RN.View).find(n => n.props.style?.minWidth != null)!;
    expect(measuredClocks.maxClockAdvance * scale).toBeLessThanOrEqual(endpoint.props.style.minWidth);
    const available = typeof group.width === 'number' ? group.width : width - 58.4;
    expect(2 * endpoint.props.style.minWidth + measuredClocks.dashAdvance * scale + 2 * group.columnGap).toBeLessThanOrEqual(available);
  });
}

test('measured clock advances refer to the exact shipped Inter font', () => {
  const bytes = readFileSync(require.resolve(measuredClocks.font));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(measuredClocks.sha256);
  expect(measuredClocks.clocksMeasured).toBe(24 * 60);
});

test('every prahar is retained in one card and guidance does not invent a time', async () => {
  const shiva = { ...diwali, id: 'five-windows', windows: Array.from({ length: 5 }, (_, index) => ({ ...window, labelEn: `Prahar ${index}` })) };
  await mount(<CompactOccasionCard items={[shiva, guidance]} date={date} onOpenVrat={onOpenVrat} />);
  expect(views('compact-occasion-time')).toHaveLength(5);
  expect(tree.root.findAllByType(RN.Text).filter(n => n.props.children === shiva.nameHi)).toHaveLength(1);
});

test('a narrow host stacks even inside a wide viewport; repeating layout does not publish another render', async () => {
  const rendered = jest.fn();
  await mount(<React.Profiler id="card" onRender={rendered}><CompactOccasionCard items={[diwali]} date={date} onOpenVrat={onOpenVrat} /></React.Profiler>);
  act(() => views('compact-occasion-card')[0].props.onLayout({ nativeEvent: { layout: { width: 230 } } }));
  expect(views('compact-occasion-row-layout')[0].props.style.flexDirection).toBe('column');
  const count = rendered.mock.calls.length;
  act(() => views('compact-occasion-card')[0].props.onLayout({ nativeEvent: { layout: { width: 230 } } }));
  expect(rendered).toHaveBeenCalledTimes(count);
});

test('empty ordinary days omit the summary; guidance-only days have a door and no fabricated clocks', async () => {
  await mount(<CompactOccasionCard items={[]} date={date} onOpenVrat={onOpenVrat} />);
  expect(views('compact-occasion-card')).toHaveLength(0);
  await act(async () => tree.update(<ThemeProvider><GitaLanguageProvider initialLang="hi"><CompactOccasionCard items={[guidance]} date={date} onOpenVrat={onOpenVrat} /></GitaLanguageProvider></ThemeProvider>));
  expect(views('compact-occasion-time')).toHaveLength(0);
  act(() => press('compact-occasion-open-vrat').props.onPress());
  expect(onOpenVrat).toHaveBeenCalledTimes(1);
});

test('error retry and the Vrat action stay reachable without images', async () => {
  const retry = jest.fn();
  await mount(<CompactOccasionCard items={[]} date={date} error onRetry={retry} onOpenVrat={onOpenVrat} />);
  act(() => press('compact-occasion-retry').props.onPress());
  expect(retry).toHaveBeenCalledTimes(1);
  act(() => press('compact-occasion-open-vrat').props.onPress());
  expect(onOpenVrat).toHaveBeenCalledTimes(1);
});

test('summary → dated Vrat → own-occurrence detail/share keeps payloads separate', async () => {
  const navigate = jest.fn(), detail = jest.fn();
  const props = { items: [diwali, midnight], date, place: 'जयपुर', placeEn: 'Jaipur', onOpenVrat: () => navigate('VratTab', vratOccasionTarget(date)), onOpenDetail: detail };
  await mount(<OccasionSection presentation="summary" {...props} />);
  act(() => press('compact-occasion-open-vrat').props.onPress());
  const target = navigate.mock.calls[0][1];
  const entry = panchangDatedEntry(target.params)!;
  expect(entry.mode).toBe('catalog'); expect(+entry.date).toBe(+date);
  await act(async () => tree.update(<ThemeProvider><GitaLanguageProvider initialLang="hi"><OccasionSection presentation="illustrated" {...props} date={entry.date} /></GitaLanguageProvider></ThemeProvider>));
  expect(views('compact-occasion-card')).toHaveLength(0);
  expect(views('occasion-inline-art')).toHaveLength(2);
  act(() => press(`occasion-detail-${midnight.id}`).props.onPress());
  expect(detail).toHaveBeenCalledWith(midnight.ruleId, midnight.date);
  act(() => press('occasion-share').props.onPress());
  const payload = mockShare.mock.calls[0][0];
  expect(payload.text('en')).toContain('Diwali');
  expect(payload.text('en')).not.toContain('Shivaratri');
  expect(payload.render({ lang: 'en' }).props.items).toEqual([diwali]);
});
