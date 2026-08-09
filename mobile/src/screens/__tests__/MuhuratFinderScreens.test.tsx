/**
 * Smoke coverage for the Event Muhurat Finder surfaces (PRD-16 Phase 1,
 * RULEBOOK §4.10): the occasion picker, ranked results, day detail, the
 * abujh calendar, and the Panchang-tab door. Panchang/muhurat values come
 * from the real engine (no engine mocks) on pinned 2026 dates; only the
 * navigation/context shells are mocked, following KundaliExperience.test.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import MuhuratFinderScreen from '@/screens/MuhuratFinderScreen';
import MuhuratResultsScreen from '@/screens/MuhuratResultsScreen';
import MuhuratDayDetailScreen from '@/screens/MuhuratDayDetailScreen';
import AbujhDaysScreen from '@/screens/AbujhDaysScreen';
import MuhuratFinderDoor from '@/components/MuhuratFinderDoor';
import { EVENT_RULES } from '@/panchang/eventMuhurat';

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

// The finder hook drives Results/Abujh; feed it deterministic engine output
// for a pinned date so the smoke is stable and fast (the hook's own chunked
// scan is covered by the tsx engine suite + e2e).
jest.mock('@/panchang/useMuhuratFinder', () => {
  const { computePanchangForDate } = jest.requireActual('@/panchang/engine');
  const { computeMuhuratDay } = jest.requireActual('@/panchang/muhurat');
  const { computeAstaFlags, evaluateDay, getEventRule, summarize } = jest.requireActual('@/panchang/eventMuhurat');
  const d = new Date(2026, 7, 17); // validated shreshtha Vahan day
  const p = computePanchangForDate(d);
  const next = computePanchangForDate(new Date(2026, 7, 18));
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
  const verdict = evaluateDay(
    getEventRule('vahan'),
    d.getTime(),
    d.getDay(),
    p,
    m,
    computeAstaFlags(new Date(2026, 7, 17, 12))
  );
  return {
    FINDER_WINDOW_DAYS: 92,
    useMuhuratFinder: () => ({ loading: false, summary: summarize([verdict]), firstAfter: [] }),
    useAbujhDays: () => ({
      loading: false,
      days: [
        {
          dateMs: new Date(2026, 9, 21).getTime(),
          nameHi: 'दशहरा',
          nameEn: 'Dussehra',
          nakshatraHi: 'धनिष्ठा',
          nakshatraEn: 'Dhanishta',
          source: 'festival',
        },
      ],
    }),
  };
});

const nav = mockNavigation as never;

function renderWithLang(el: React.ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(<GitaLanguageProvider>{el}</GitaLanguageProvider>);
  });
  return renderer;
}

const texts = (renderer: TestRenderer.ReactTestRenderer): string =>
  JSON.stringify(renderer.toJSON());

afterEach(() => {
  mockNavigation.navigate.mockClear();
});

test('MuhuratFinderScreen lists every occasion and the abujh door', () => {
  const r = renderWithLang(
    <MuhuratFinderScreen navigation={nav} route={{ key: 'k', name: 'MuhuratFinder' } as never} />
  );
  for (const rule of EVENT_RULES) {
    r.root.findByProps({ testID: `muhurat-occasion-${rule.id}` });
  }
  act(() => {
    r.root.findByProps({ testID: 'muhurat-occasion-griha-pravesh' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith('MuhuratResults', { occasionId: 'griha-pravesh' });
  act(() => {
    r.root.findByProps({ testID: 'muhurat-abujh-door' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith('AbujhDays');
  act(() => r.unmount());
});

test('MuhuratResultsScreen ranks the validated 17 Aug 2026 Vahan day shreshtha, best window first', () => {
  const r = renderWithLang(
    <MuhuratResultsScreen
      navigation={nav}
      route={{ key: 'k', name: 'MuhuratResults', params: { occasionId: 'vahan' } } as never}
    />
  );
  const body = texts(r);
  expect(body).toContain('श्रेष्ठ');
  expect(body).toContain('अमृत'); // 17 Aug's best window is Amrit (engine-validated)
  const card = r.root.findByProps({ testID: 'muhurat-result-17' });
  act(() => card.props.onPress());
  expect(mockNavigation.navigate).toHaveBeenCalledWith(
    'MuhuratDayDetail',
    expect.objectContaining({ occasionId: 'vahan' })
  );
  act(() => r.unmount());
});

test('MuhuratDayDetailScreen renders answer-first with provenance and the doshas list', async () => {
  const r = renderWithLang(
    <MuhuratDayDetailScreen
      navigation={nav}
      route={{
        key: 'k',
        name: 'MuhuratDayDetail',
        params: { occasionId: 'vahan', dateMs: new Date(2026, 7, 17).getTime() },
      } as never}
    />
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  const body = texts(r);
  expect(body).toContain('दृक्पंचांग'); // provenance is part of the copy, not a footer
  expect(body).toContain('अनुकूल');
  expect(body).toContain('भद्रा'); // doshas list names what was checked
  const link = r.root.findByProps({ testID: 'muhurat-day-timings-link' });
  act(() => link.props.onPress());
  expect(mockNavigation.navigate).toHaveBeenCalledWith('MuhuratDetail', {
    dateMs: new Date(2026, 7, 17).getTime(),
  });
  act(() => r.unmount());
});

test('AbujhDaysScreen lists engine-resolved days and opens the day timings', () => {
  const r = renderWithLang(
    <AbujhDaysScreen navigation={nav} route={{ key: 'k', name: 'AbujhDays' } as never} />
  );
  expect(texts(r)).toContain('दशहरा');
  const day = r.root.findByProps({ testID: 'abujh-day-10-21' });
  act(() => day.props.onPress());
  expect(mockNavigation.navigate).toHaveBeenCalledWith('MuhuratDetail', {
    dateMs: new Date(2026, 9, 21).getTime(),
  });
  act(() => r.unmount());
});

test('MuhuratFinderDoor carries the NEW badge and fires its onPress', () => {
  const onPress = jest.fn();
  const r = renderWithLang(<MuhuratFinderDoor onPress={onPress} />);
  expect(texts(r)).toContain('शुभ मुहूर्त खोज');
  act(() => {
    r.root.findByProps({ testID: 'muhurat-finder-door' }).props.onPress();
  });
  expect(onPress).toHaveBeenCalled();
  act(() => r.unmount());
});
