/**
 * PRD-16 Phase 4 — the personalised Tarabala/Chandrabala strip.
 *
 * Pins the §8 contract at the screen level: the strip renders ONLY with a
 * saved Kundali profile (results row + day-detail strip), a fresh read after
 * removal clears it, the no-profile state's only trace is the one results
 * footer line (tappable to the Kundali screen), the share card carries NO
 * personal row even while a profile is saved, and reminder copy carries no
 * bala words. Engine values are real (no engine mocks), same shells as
 * MuhuratFinderScreens.test.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import { MuhuratFollowProvider } from '@/contexts/MuhuratFollowContext';
import MuhuratResultsScreen from '@/screens/MuhuratResultsScreen';
import MuhuratDayDetailScreen from '@/screens/MuhuratDayDetailScreen';
import MuhuratFinderShareCard from '@/components/MuhuratFinderShareCard';
import { KUNDALI_PROFILE_STORAGE_KEY } from '@/panchang/useKundali';
import { __resetJanmaMemoForTests } from '@/panchang/useMuhuratBala';
import { computePanchangForDate, sunriseForDate } from '@/panchang/engine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { lagnaSpansForDay } from '@/panchang/lagnaSweep';
import { computeAstaFlags, evaluateDay, getEventRule } from '@/panchang/eventMuhurat';
import { formatMuhuratReminderContent } from '@/notifications/muhuratReminderPure';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => 'file://x.png') }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: {
      cityId: 'ujjain',
      labelHi: 'उज्जैन',
      labelEn: 'Ujjain',
      latitude: 23.1765,
      longitude: 75.7885,
      elevation: 494,
      source: 'default',
    },
    gpsStatus: 'idle',
    selectCity: jest.fn(),
    requestDeviceLocation: jest.fn(),
  }),
}));

jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
}));

// Deterministic results for the 17 Aug 2026 shreshtha Vahan day (real engine).
jest.mock('@/panchang/useMuhuratFinder', () => {
  const { computePanchangForDate, sunriseForDate } = jest.requireActual('@/panchang/engine');
  const { computeMuhuratDay } = jest.requireActual('@/panchang/muhurat');
  const { computeAstaFlags, evaluateDay, getEventRule, summarize } = jest.requireActual('@/panchang/eventMuhurat');
  const { lagnaSpansForDay } = jest.requireActual('@/panchang/lagnaSweep');
  const d = new Date(2026, 7, 17);
  const p = computePanchangForDate(d);
  const next = computePanchangForDate(new Date(2026, 7, 18));
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
  const lagnas = lagnaSpansForDay(p.sunrise, sunriseForDate(new Date(2026, 7, 18)), 23.1765, 75.7885);
  const verdict = evaluateDay(getEventRule('vahan'), d.getTime(), d.getDay(), p, m, computeAstaFlags(new Date(2026, 7, 17, 12)), { lagnas });
  return {
    FINDER_WINDOW_DAYS: 92,
    useMuhuratFinderWarmup: () => {},
    useMuhuratFinder: () => ({ loading: false, summary: summarize([verdict]), firstAfter: [] }),
    useAbujhDays: () => ({ loading: false, days: [] }),
  };
});

const nav = mockNavigation as never;
const PROFILE = { date: '1995-06-15', time: '10:30', cityId: 'ujjain' };

function render(el: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <GitaLanguageProvider>
        <MuhuratFollowProvider>{el}</MuhuratFollowProvider>
      </GitaLanguageProvider>
    );
  });
  return renderer;
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
}

/**
 * The day detail's cold-store solve + the strip's own deferred read can span
 * several hundred ms under Jest's instrumented engine — poll instead of
 * guessing a sleep.
 */
async function waitFor(check: () => boolean, label: string) {
  for (let i = 0; i < 100; i += 1) {
    if (check()) return;
    await settle();
  }
  throw new Error(`timed out waiting for ${label}`);
}

const texts = (r: TestRenderer.ReactTestRenderer): string => JSON.stringify(r.toJSON());

const results = (
  <MuhuratResultsScreen
    navigation={nav}
    route={{ key: 'k', name: 'MuhuratResults', params: { occasionId: 'vahan' } } as never}
  />
);

const detail = (
  <MuhuratDayDetailScreen
    navigation={nav}
    route={{
      key: 'k',
      name: 'MuhuratDayDetail',
      params: { occasionId: 'vahan', dateMs: new Date(2026, 7, 17).getTime() },
    } as never}
  />
);

beforeEach(async () => {
  await AsyncStorage.clear();
  __resetJanmaMemoForTests();
  mockNavigation.navigate.mockClear();
});

test('no saved Kundali: the strip is absent everywhere; the ONLY trace is the results footer line', async () => {
  const r = render(results);
  await settle();
  expect(r.root.findAllByProps({ testID: 'muhurat-bala-row' })).toHaveLength(0);
  expect(texts(r)).not.toContain('आपके लिए');
  // The one italic footer line, tappable to the shipped Kundali screen.
  const footer = r.root.findByProps({ testID: 'muhurat-bala-footer' });
  act(() => footer.props.onPress());
  expect(mockNavigation.navigate).toHaveBeenCalledWith('Kundali', undefined);
  act(() => r.unmount());

  const d = render(detail);
  await waitFor(() => texts(d).includes('सर्वोत्तम समय'), "the detail answer");
  await settle();
  expect(d.root.findAllByProps({ testID: 'muhurat-bala-strip' })).toHaveLength(0);
  // Not even the footer hint on the detail (§8.4: results list only).
  expect(d.root.findAllByProps({ testID: 'muhurat-bala-footer' })).toHaveLength(0);
  act(() => d.unmount());
});

test('with a saved Kundali: the quiet row on result cards, the full strip on the day detail, no footer', async () => {
  await AsyncStorage.setItem(KUNDALI_PROFILE_STORAGE_KEY, JSON.stringify(PROFILE));

  const r = render(results);
  await settle();
  r.root.findByProps({ testID: 'muhurat-bala-row' });
  expect(texts(r)).toContain('आपके लिए');
  expect(texts(r)).toContain('तारा');
  expect(r.root.findAllByProps({ testID: 'muhurat-bala-footer' })).toHaveLength(0);
  act(() => r.unmount());

  const d = render(detail);
  await waitFor(() => d.root.findAllByProps({ testID: 'muhurat-bala-strip' }).length > 0, 'the detail strip');
  const body = texts(d);
  // The explainer names the janma values it counted from (auditable against
  // the Kundali screen) and states the annotation contract in words.
  expect(body).toContain('जन्म नक्षत्र');
  expect(body).toContain('श्रेणी नहीं बदलता');
  act(() => d.unmount());
});

test('removing the profile clears the strip on the next read', async () => {
  await AsyncStorage.setItem(KUNDALI_PROFILE_STORAGE_KEY, JSON.stringify(PROFILE));
  const withProfile = render(results);
  await settle();
  withProfile.root.findByProps({ testID: 'muhurat-bala-row' });
  act(() => withProfile.unmount());

  await AsyncStorage.removeItem(KUNDALI_PROFILE_STORAGE_KEY);
  const after = render(results);
  await settle();
  expect(after.root.findAllByProps({ testID: 'muhurat-bala-row' })).toHaveLength(0);
  after.root.findByProps({ testID: 'muhurat-bala-footer' });
  act(() => after.unmount());
});

test('a corrupt profile is a guest state — no strip, never a rendered guess', async () => {
  await AsyncStorage.setItem(KUNDALI_PROFILE_STORAGE_KEY, '{"date":"not-a-date"}');
  const r = render(results);
  await settle();
  expect(r.root.findAllByProps({ testID: 'muhurat-bala-row' })).toHaveLength(0);
  r.root.findByProps({ testID: 'muhurat-bala-footer' });
  act(() => r.unmount());
});

test('the share card carries NO personal row, even with a profile saved (absence pinned)', async () => {
  await AsyncStorage.setItem(KUNDALI_PROFILE_STORAGE_KEY, JSON.stringify(PROFILE));
  const d = new Date(2026, 7, 17);
  const p = computePanchangForDate(d);
  const next = computePanchangForDate(new Date(2026, 7, 18));
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
  const lagnas = lagnaSpansForDay(p.sunrise, sunriseForDate(new Date(2026, 7, 18)), 23.1765, 75.7885);
  const verdict = evaluateDay(getEventRule('vahan'), d.getTime(), d.getDay(), p, m, computeAstaFlags(new Date(2026, 7, 17, 12)), { lagnas });

  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <GitaLanguageProvider>
        <MuhuratFinderShareCard rule={getEventRule('vahan')} verdict={verdict} p={p} cityLabel="उज्जैन" />
      </GitaLanguageProvider>
    );
  });
  await settle();
  const body = texts(renderer);
  // The Phase-3 lagna line is general panchang data and belongs; anything
  // profile-derived must be structurally impossible here.
  expect(body).toContain('लग्न');
  expect(body).not.toContain('तारा');
  expect(body).not.toContain('चंद्राष्टम');
  expect(body).not.toContain('आपके लिए');
  expect(body).not.toContain('जन्म');
  act(() => renderer.unmount());
});

test('reminder copy never carries bala words (it lands on a lock screen)', () => {
  const { title, body } = formatMuhuratReminderContent({
    id: 'muhurat-reminder:vahan:2026-08-17:day-of',
    occasionId: 'vahan',
    dateKey: '2026-08-17',
    kind: 'day-of',
    fireAt: new Date(2026, 7, 17, 5, 37),
    nameHi: 'वाहन क्रय',
    nameEn: 'Vehicle Purchase',
    windowLabelHi: 'अमृत 6:07 – 7:41 AM',
  } as never);
  for (const s of [title, body]) {
    expect(s).not.toContain('तारा');
    expect(s).not.toContain('चंद्राष्टम');
    expect(s).not.toContain('चन्द्र बल');
    expect(s).not.toContain('आपके लिए');
  }
});
