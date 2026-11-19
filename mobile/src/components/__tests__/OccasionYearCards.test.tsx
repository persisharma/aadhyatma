import React from 'react';
import { Image, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { OCCASION_CARD_PROFILES, occasionGuidance } from '@/panchang/occasionTimings';
import { occasionHeroSubject, occasionIdentityPaintings } from '@/panchang/occasionHeroArt';
import { observanceSubjects } from '@/panchang/observancePortraits';
import reviewed from '@/panchang/__tests__/fixtures/occasionCards.json';
import manifest from '@/data/festivalHeroManifest.json';
import OccasionTimingsCard from '../OccasionTimingsCard';
import OccasionShareCard from '../OccasionShareCard';
const mockShare = jest.fn();
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: mockShare, busy: false }) }));
jest.mock('@/utils/backgroundAssetCache', () => ({ subscribeBackgroundAsset: (_request: unknown, callback: (uri: string) => void) => { callback('file:///hero.webp'); return () => {}; }, evictBackgroundAsset: jest.fn() }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: require('react-native').View }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Circle: 'Circle', Path: 'Path', Ellipse: 'Ellipse', G: 'G', Defs: 'Defs', LinearGradient: 'Gradient', Stop: 'Stop' }));
const date = new Date(2026, 10, 6);
const rules = [...new Map(OBSERVANCE_RULES.map(r => [r.id, r])).values()];
const trees: TestRenderer.ReactTestRenderer[] = [];
async function mount(node: React.ReactNode, lang: Lang = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><GitaLanguageProvider initialLang={lang}>{node}</GitaLanguageProvider></ThemeProvider>); });
  trees.push(tree); return tree;
}
const copy = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(n => n.props.children).join('\n');
afterEach(() => { act(() => trees.splice(0).forEach(t => t.unmount())); mockShare.mockClear(); });
test('closed full-year inventory: every one of 197 named identities has a profile, guidance and reviewed subject', () => {
  expect(rules.map(r => ({ id: r.id, nameEn: r.nameEn, deityEn: r.deityEn }))).toEqual(reviewed);
  expect(reviewed).toHaveLength(197);
  expect(new Set(OCCASION_CARD_PROFILES.map(p => p.ruleId))).toEqual(new Set(reviewed.map(r => r.id)));
  for (const r of rules) {
    expect(Object.prototype.hasOwnProperty.call(observanceSubjects, r.deityEn)).toBe(true);
    const card = occasionGuidance(r, date);
    expect(card.windows).toEqual([]);
    expect(card.noteHi?.trim()).toBeTruthy(); expect(card.noteEn?.trim()).toBeTruthy();
    expect(occasionHeroSubject(card) || occasionIdentityPaintings(r.id).length).toBeTruthy();
  }
  expect(occasionIdentityPaintings('unknown-new-rule')).toEqual([]);
});
test('ceremony scenes stay distinct from the festival identity', () => {
  expect(occasionHeroSubject({ id: 'holi-holika', ruleId: 'holi' })).toBe('holika');
  expect(occasionHeroSubject({ id: 'holi-guidance', ruleId: 'holi' })).toBeNull();
  expect(occasionHeroSubject({ id: 'maha-navami-vijaya', ruleId: 'maha-navami' })).toBe('shastra');
  expect(occasionHeroSubject({ id: 'maha-navami-guidance', ruleId: 'maha-navami' })).toBeNull();
});
test('all ten new scenes retain their reviewed bytes; no raw asset is required into the native bundle', () => {
  const root = path.resolve(__dirname, '../../../..');
  const records = JSON.parse(readFileSync(path.join(root, 'docs/reviews/festival-hero/provenance.json'), 'utf8'));
  expect(records).toHaveLength(10);
  for (const r of records) {
    const bytes = readFileSync(path.join(root, r.path));
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(r.sha256);
    expect((manifest.assets as Record<string, { hash: string }>)[r.name].hash).toBe(r.sha256.slice(0, 16));
  }
});
for (const lang of ['hi', 'en', 'gu', 'kn'] as Lang[]) test(`${lang}: catalog-only card has real guidance and no invented date/time`, async () => {
  const rule = rules.find(r => r.ruleType === 'catalog-only' || r.recurrence === 'catalog')!;
  expect(rule).toBeTruthy();
  const tree = await mount(<OccasionShareCard items={[occasionGuidance(rule, date)]} date={date} dated={false} placeHi="दिल्ली" placeEn="Delhi" lang={lang} />, lang);
  expect(copy(tree)).not.toContain('6/11/2026');
  expect(copy(tree)).not.toContain('Timings are for');
  expect(copy(tree)).not.toContain('समय चुने');
  expect(copy(tree)).toContain('vedansh.app/get');
  expect(tree.root.findAllByProps({ testID: 'occasion-hero-image' }).length).toBeGreaterThan(0);
});
test('two occasions on one day share individually through the real provider contract', async () => {
  const first = occasionGuidance(rules.find(r => r.id === 'rama-ekadashi')!, date);
  const second = occasionGuidance(rules.find(r => r.id === 'pradosh-vrat-krishna') ?? rules.find(r => r.id.startsWith('pradosh-vrat'))!, date);
  const tree = await mount(<OccasionTimingsCard items={[first, second]} date={date} place="दिल्ली" placeEn="Delhi" />);
  const actions = tree.root.findAll(n => typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button' && String(n.props.testID).startsWith('occasion-share'));
  expect(actions).toHaveLength(2);
  for (let i = 0; i < 2; i++) {
    act(() => actions[i].props.onPress());
    const payload = mockShare.mock.calls[i][0];
    const render = payload.render({ lang: 'en' });
    expect(render.props.items).toEqual([[first, second][i]]);
    expect(payload.text('en')).toContain([first, second][i].nameEn);
    expect(payload.text('en')).not.toContain([first, second][1 - i].nameEn);
  }
});
test('changing occasion identity clears decoded-image readiness', async () => {
  const onReady = jest.fn();
  const item = occasionGuidance(rules.find(r => r.id === 'rama-ekadashi')!, date);
  const props = { date, placeHi: 'दिल्ली', placeEn: 'Delhi', lang: 'en' as const, onReady };
  const tree = await mount(<OccasionShareCard items={[item]} {...props} />);
  act(() => tree.root.findAllByType(Image).forEach(n => n.props.onLoad?.()));
  expect(onReady).toHaveBeenLastCalledWith(true);
  const other = occasionGuidance(rules.find(r => r.id === 'ram-navami')!, date);
  await act(async () => tree.update(<ThemeProvider><GitaLanguageProvider initialLang="en"><OccasionShareCard items={[other]} {...props} /></GitaLanguageProvider></ThemeProvider>));
  expect(onReady).toHaveBeenLastCalledWith(false);
});
test('a decoded hero that later fails cannot remain capture-ready', async () => {
  const onReady = jest.fn();
  const item = occasionGuidance(rules.find(r => r.id === 'rama-ekadashi')!, date);
  const tree = await mount(<OccasionShareCard items={[item]} date={date} placeHi="दिल्ली" placeEn="Delhi" lang="en" onReady={onReady} />);
  act(() => tree.root.findAllByType(Image).forEach(n => n.props.onLoad?.()));
  expect(onReady).toHaveBeenLastCalledWith(true);
  act(() => tree.root.findAllByType(Image).find(n => n.props.testID === 'occasion-hero-image')!.props.onError());
  expect(onReady).toHaveBeenLastCalledWith(false);
});
