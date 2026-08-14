/**
 * Follow & remind for the Event Muhurat Finder (PRD-16 §6.7).
 *
 * Screen-level coverage of the surfaces the pure planner cannot see: the day
 * detail's follow CTA and followed state, the excluded-day silence, the sheet's
 * muhurat-only window option, and the ★ inventory row. Panchang values come
 * from the real engine on pinned 2026 dates (no engine mocks) — only the
 * navigation shell and the native share/gradient modules are mocked, following
 * MuhuratFinderScreens.test.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GitaLanguageProvider } from '@/data/gita/language';
import { MuhuratFollowProvider } from '@/contexts/MuhuratFollowContext';
import MuhuratDayDetailScreen from '@/screens/MuhuratDayDetailScreen';
import MuhuratFollowList from '@/components/MuhuratFollowList';
import { computePanchangForDate } from '@/panchang/engine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { computeAstaFlags, evaluateDay, getEventRule } from '@/panchang/eventMuhurat';
import { formatClock } from '@/panchang/muhuratFormat';
import { WINDOW_LEAD_MINUTES } from '@/notifications/muhuratReminderPure';

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

const UJJAIN = {
  cityId: 'ujjain',
  labelHi: 'उज्जैन',
  labelEn: 'Ujjain',
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 494,
  source: 'default',
};

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

const nav = mockNavigation as never;

// 17 Aug 2026 — the engine-validated श्रेष्ठ Vahan day the prototype uses.
const GOOD_DAY = new Date(2026, 7, 17);
// 18 Aug 2026 is Shashthi/Swati — not in the Vahan tables, so it grades out.
const EXCLUDED_DAY = new Date(2026, 7, 18);

/** The same verdict the screen will compute, for expectation-building. */
function verdictFor(date: Date) {
  const p = computePanchangForDate(date, { location: UJJAIN as never });
  const next = computePanchangForDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), {
    location: UJJAIN as never,
  });
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay());
  return evaluateDay(
    getEventRule('vahan'),
    date.getTime(),
    date.getDay(),
    p,
    m,
    computeAstaFlags(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12))
  );
}

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

function dayDetail(date: Date) {
  return (
    <MuhuratDayDetailScreen
      navigation={nav}
      route={{
        key: 'k',
        name: 'MuhuratDayDetail',
        params: { occasionId: 'vahan', dateMs: date.getTime() },
      } as never}
    />
  );
}

const texts = (r: TestRenderer.ReactTestRenderer): string => JSON.stringify(r.toJSON());

// Follows are persisted, and jest.setup's AsyncStorage mock is shared across
// tests in the file — without this, a follow made in one test leaves the next
// one already-followed and its CTA missing.
beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => {
  mockNavigation.navigate.mockClear();
});

test('a graded day offers the follow CTA and no followed row', async () => {
  const r = render(dayDetail(GOOD_DAY));
  await settle();
  r.root.findByProps({ testID: 'muhurat-follow-cta' });
  expect(r.root.findAllByProps({ testID: 'muhurat-followed' })).toHaveLength(0);
  act(() => r.unmount());
});

test('an EXCLUDED day offers no follow affordance at all', async () => {
  // Reminding a user about a day the engine rejects is the harm PRD §9.7 names.
  expect(verdictFor(EXCLUDED_DAY).tier).toBe('excluded');
  const r = render(dayDetail(EXCLUDED_DAY));
  await settle();
  expect(r.root.findAllByProps({ testID: 'muhurat-follow-cta' })).toHaveLength(0);
  expect(r.root.findAllByProps({ testID: 'muhurat-followed' })).toHaveLength(0);
  act(() => r.unmount());
});

test('following opens the reminder sheet, which offers the muhurat window option', async () => {
  const r = render(dayDetail(GOOD_DAY));
  await settle();
  await act(async () => {
    r.root.findByProps({ testID: 'muhurat-follow-cta' }).props.onPress();
    await Promise.resolve();
  });
  // The shared vrat sheet, opened with the muhurat day-of options.
  r.root.findByProps({ testID: 'muhurat-reminder-sheet' });
  expect(texts(r)).toContain('मुहूर्त से 30 मिनट पहले');
  act(() => r.unmount());
});

test('the followed row states the RESOLVED fire times, with day-of clamped behind the window', async () => {
  const verdict = verdictFor(GOOD_DAY);
  const best = verdict.windows[0];
  expect(best).toBeTruthy();

  const r = render(dayDetail(GOOD_DAY));
  await settle();
  await act(async () => {
    r.root.findByProps({ testID: 'muhurat-follow-cta' }).props.onPress();
    await Promise.resolve();
  });
  await settle();

  r.root.findByProps({ testID: 'muhurat-followed' });
  const shown = texts(r);

  // Day-of lands WINDOW_LEAD_MINUTES before the window opens — not at 07:00.
  const expected = formatClock(new Date(best.start.getTime() - WINDOW_LEAD_MINUTES * 60_000));
  expect(shown).toContain(expected);
  // The evening-before notice is stated too, so the user can see both.
  expect(shown).toContain('6:00 PM');
  act(() => r.unmount());
});

test('the followed row is reachable again through "change"', async () => {
  const r = render(dayDetail(GOOD_DAY));
  await settle();
  await act(async () => {
    r.root.findByProps({ testID: 'muhurat-follow-cta' }).props.onPress();
    await Promise.resolve();
  });
  await settle();
  await act(async () => {
    r.root.findByProps({ testID: 'muhurat-follow-edit' }).props.onPress();
    await Promise.resolve();
  });
  r.root.findByProps({ testID: 'muhurat-reminder-sheet' });
  act(() => r.unmount());
});

test('saving with both notices off unfollows the day', async () => {
  const r = render(dayDetail(GOOD_DAY));
  await settle();
  await act(async () => {
    r.root.findByProps({ testID: 'muhurat-follow-cta' }).props.onPress();
    await Promise.resolve();
  });
  await settle();
  r.root.findByProps({ testID: 'muhurat-followed' });

  // Advance = बंद, on-the-day switch off, then save.
  await act(async () => {
    r.root.findByProps({ accessibilityLabel: 'Off' }).props.onPress();
    await Promise.resolve();
  });
  await act(async () => {
    r.root.findByProps({ accessibilityLabel: 'मुहूर्त के दिन' }).props.onValueChange(false);
    await Promise.resolve();
  });
  await act(async () => {
    r.root.findByProps({ testID: 'reminder-sheet-save' }).props.onPress();
    await Promise.resolve();
  });
  await settle();

  expect(r.root.findAllByProps({ testID: 'muhurat-followed' })).toHaveLength(0);
  r.root.findByProps({ testID: 'muhurat-follow-cta' });
  act(() => r.unmount());
});

test('the ★ inventory lists a followed muhurat and opens its day', async () => {
  const onOpen = jest.fn();
  let renderer!: TestRenderer.ReactTestRenderer;
  // One tree so the follow made on the detail screen is visible to the list.
  act(() => {
    renderer = TestRenderer.create(
      <GitaLanguageProvider>
        <MuhuratFollowProvider>
          {dayDetail(GOOD_DAY)}
          <MuhuratFollowList onOpen={onOpen} />
        </MuhuratFollowProvider>
      </GitaLanguageProvider>
    );
  });
  await settle();
  // Nothing followed yet → the section is absent entirely.
  expect(renderer.root.findAllByProps({ testID: 'muhurat-follow-list' })).toHaveLength(0);

  await act(async () => {
    renderer.root.findByProps({ testID: 'muhurat-follow-cta' }).props.onPress();
    await Promise.resolve();
  });
  await settle();

  renderer.root.findByProps({ testID: 'muhurat-follow-list' });
  const row = renderer.root.findByProps({ testID: 'muhurat-follow-row-vahan' });
  act(() => row.props.onPress());
  expect(onOpen).toHaveBeenCalledWith('vahan', GOOD_DAY.getTime());
  act(() => renderer.unmount());
});
