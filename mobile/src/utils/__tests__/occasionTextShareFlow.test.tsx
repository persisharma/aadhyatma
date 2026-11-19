import React from 'react';
import { Platform, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import OccasionTimingsCard from '@/components/OccasionTimingsCard';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { ShareProvider } from '../shareVerse';
import { SMART_LINK } from '@/data/shareLinks';
import type { OccasionTiming } from '@/panchang/occasionTimings';
import { occasionShareText } from '@/panchang/occasionTimingFormat';
jest.mock('@/components/OccasionInlineArtwork', () => () => null);
jest.mock('@/components/ShareTargetSheet', () => 'ShareTargetSheet');
jest.mock('@/components/ShareCardMount', () => ({ __esModule: true, default: 'ShareCardMount', ShareCardPreview: 'ShareCardPreview' }));
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));
const mockMoment = jest.fn();
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => mockMoment }));
const day = new Date(2026, 10, 8);
const item: OccasionTiming = { id: 'diwali-lakshmi', ruleId: 'diwali', date: day, nameHi: 'दीपावली', nameEn: 'Diwali', motif: 'diya', windows: [{ labelHi: 'पूजा', labelEn: 'Puja', start: new Date(2026, 10, 8, 17, 54), end: new Date(2026, 10, 8, 19, 50) }], noteHi: 'स्थानीय परंपरा मानें।', noteEn: 'Follow local tradition.' };
let tree: TestRenderer.ReactTestRenderer;
let system: jest.SpyInstance;
const originalOS = Platform.OS;
const sheet = () => tree.root.findByType('ShareTargetSheet' as React.ElementType);
const tap = () => act(() => tree.root.findAll(n => n.props.testID === 'occasion-share' && typeof n.props.onPress === 'function').at(-1)!.props.onPress());
async function open(selected = day, items = [item], dated = true) {
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><GitaLanguageProvider initialLang="hi"><ShareProvider><OccasionTimingsCard items={items} date={selected} dated={dated} place="नई दिल्ली" placeEn="New Delhi" /></ShareProvider></GitaLanguageProvider></ThemeProvider>); });
  tap();
}
async function send(lang: Lang) {
  act(() => sheet().props.onCardLang(lang));
  expect(sheet().props.lang).toBe('hi');
  act(() => sheet().props.onShareText());
  await act(async () => { await new Promise(r => setTimeout(r, 400)); });
  return system.mock.calls.at(-1)![0].message as string;
}
beforeEach(() => { system = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction }); mockMoment.mockClear(); });
afterEach(() => { if (tree) act(() => tree.unmount()); jest.restoreAllMocks(); Object.defineProperty(Platform, 'OS', { value: originalOS }); });
for (const os of ['ios', 'android']) for (const [lang, month] of [['hi', 'नवं'], ['en', 'Nov'], ['gu', 'નવં'], ['kn', 'ನವಂ']] as const) test(`${os}/${lang}: real provider sends date, windows and download link without capture`, async () => {
  Object.defineProperty(Platform, 'OS', { value: os });
  await open();
  const message = await send(lang);
  expect(message).toContain(`8 ${month} 2026`);
  expect(message).toContain('17:54 – 19:50');
  expect(message).toContain(SMART_LINK);
  if (lang === 'en') expect(message).toContain('New Delhi\nDiwali\n8 Nov 2026\nPuja');
  expect(tree.root.findAllByType('ShareCardMount' as React.ElementType)).toHaveLength(0);
});
test('Holika uses its ceremony date, not the adjacent Holi selection', async () => {
  const holika = { ...item, id: 'holi-holika', ruleId: 'holi', nameEn: 'Holika Dahan', date: new Date(2026, 2, 3), windows: [{ ...item.windows[0], start: new Date(2026, 2, 3, 19), end: new Date(2026, 2, 3, 21) }] };
  await open(new Date(2026, 2, 4), [holika]);
  const message = await send('en');
  expect(message).toContain('Holika Dahan\n3 Mar 2026');
  expect(message).not.toContain('4 Mar');
});
test('parana retains next-day endpoints on vrat day and selected date when viewed tomorrow', async () => {
  const parana = { ...item, windows: [{ ...item.windows[0], start: new Date(2026, 10, 9, 6), end: new Date(2026, 10, 9, 8) }] };
  await open(day, [parana]);
  expect(await send('en')).toContain('06:00, 9 Nov – 08:00, 9 Nov');
  act(() => tree.unmount());
  await open(new Date(2026, 10, 9), [parana]);
  const message = await send('en');
  expect(message).toContain('9 Nov 2026'); expect(message).toContain('06:00 – 08:00');
});
test('year-crossing endpoints explicitly identify both years without changing instants', async () => {
  const date = new Date(2026, 11, 31);
  const overnight = { ...item, date, windows: [{ ...item.windows[0], start: new Date(2026, 11, 31, 23), end: new Date(2027, 0, 1, 1) }] };
  await open(date, [overnight]);
  expect(await send('en')).toContain('23:00, 31 Dec 2026 – 01:00, 1 Jan 2027');
  expect(overnight.windows[0].end).toEqual(new Date(2027, 0, 1, 1));
});
test('undated guidance stays undated; dated guidance keeps its date', async () => {
  const guidance = { ...item, windows: [] };
  await open(day, [guidance], false);
  const message = await send('en');
  expect(message).toContain('Follow local tradition.'); expect(message).not.toContain('2026');
  act(() => tree.unmount()); await open(day, [guidance]);
  expect(await send('en')).toContain('8 Nov 2026');
});
test('full Panchang formatter does not duplicate its existing date heading', () => {
  expect(occasionShareText([item], day, 'en')).toBe('Diwali\nPuja · 17:54 – 19:50\nFollow local tradition.');
});
for (const os of ['ios', 'android']) test(`${os}: picker Back/native dismissal report no success and allow reopening`, async () => {
  Object.defineProperty(Platform, 'OS', { value: os });
  await open(); act(() => sheet().props.onClose());
  expect(system).not.toHaveBeenCalled(); tap();
  system.mockResolvedValueOnce({ action: Share.dismissedAction }); await send('en');
  expect(mockMoment).not.toHaveBeenCalled(); tap();
  expect(sheet().props.cardLang).toBe('hi');
});
