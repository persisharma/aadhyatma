/**
 * Rendering matrix for the Observance Detail "How to observe" home — the four
 * §6.3 states of PRD-09 Phase 4:
 *   1. verified upvas facts only → उपवास विधि heading + facts panel;
 *   2. vidhi only → exactly the shipped PRD-19 Phase 2B block (पूजा विधि
 *      heading + card, testID observance-vidhi-card) — zero regression;
 *   3. both → one उपवास विधि section, facts first, the vidhi card beneath them
 *      keeping its own पूजा विधि identity;
 *   4. neither → no section and NO placeholder string anywhere in the tree.
 *
 * The shipped registry exposes verified entries only (all v1 entries are
 * draft until the §8 two-source review), so states 1 and 3 are exercised by
 * mocking `getUpvasInfo` with fixture verified entries — the same shape the
 * registry will serve once entries flip.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import type { UpvasInfoEntry } from '@/panchang/types';

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

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

jest.mock('@/contexts/VratFollowContext', () => ({
  useVratFollows: () => ({ isFollowing: () => false, follow: jest.fn(), unfollow: jest.fn() }),
}));

jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: {
      cityId: 'ujjain',
      labelHi: 'उज्जैन',
      labelEn: 'Ujjain',
      latitude: 23.1793,
      longitude: 75.7849,
      elevation: 494,
      source: 'default',
    },
    isLoading: false,
  }),
}));

// The occurrence solve is not this suite's subject — pin it so the matrix is
// deterministic and fast. getRuleById stays real (the matrix keys off real rules).
jest.mock('@/panchang/vratCatalog', () => {
  const actual = jest.requireActual('@/panchang/vratCatalog');
  return {
    ...actual,
    getNextOccurrence: jest.fn((ruleId: string) => ({
      date: new Date(2026, 9, 29),
      rule: actual.getRuleById(ruleId),
    })),
  };
});

const mockGetUpvasInfo = jest.fn((_id: string): UpvasInfoEntry | null => null);
jest.mock('@/panchang/upvasContent', () => ({
  getUpvasInfo: (id: string) => mockGetUpvasInfo(id),
}));

const mockUseUpvasParana = jest.fn((): unknown => null);
jest.mock('@/panchang/useUpvasParana', () => ({
  useUpvasParana: () => mockUseUpvasParana(),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const ObservanceDetailScreen = require('@/screens/ObservanceDetailScreen').default;
/* eslint-enable @typescript-eslint/no-require-imports */

const nav = mockNavigation as never;
const renderers: TestRenderer.ReactTestRenderer[] = [];

function renderDetail(ruleId: string): TestRenderer.ReactTestRenderer {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(
      <GitaLanguageProvider>
        <ObservanceDetailScreen
          navigation={nav}
          route={{ key: 'k', name: 'ObservanceDetail', params: { ruleId } } as never}
        />
      </GitaLanguageProvider>
    );
  });
  renderers.push(renderer);
  return renderer;
}

const texts = (renderer: TestRenderer.ReactTestRenderer): string =>
  JSON.stringify(renderer.toJSON());

const has = (r: TestRenderer.ReactTestRenderer, testID: string): boolean =>
  r.root.findAllByProps({ testID }).length > 0;

/** Fixture verified entries — the shape the registry serves post-review. */
const FIXTURE_SANKASHTI: UpvasInfoEntry = {
  id: 'sankashti-chaturthi-upvas',
  fastType: 'phalahar',
  fastTypeNoteHi: 'चंद्रोदय तक फलाहार',
  fastTypeNoteEn: 'Fruit fare until moonrise',
  window: { kind: 'sunrise-to-moonrise', textHi: 'सूर्योदय से चंद्रोदय तक।', textEn: 'From sunrise to moonrise.' },
  parana: { kind: 'same-day-after-moonrise', textHi: 'चंद्र दर्शन के उपरांत व्रत खोलें।', textEn: 'Break the fast after sighting the moon.' },
  strictnessHi: 'परम्परा अनुसार कठोरता भिन्न रहती है।',
  strictnessEn: 'Strictness varies by tradition.',
  status: 'verified',
  source: { referenceUrls: ['https://a', 'https://b'], verificationNote: 'fixture' },
};

const FIXTURE_KARWA: UpvasInfoEntry = {
  ...FIXTURE_SANKASHTI,
  id: 'karwa-chauth-upvas',
  fastType: 'nirjala',
  fastTypeNoteHi: 'चंद्रोदय तक — जल भी वर्जित',
  fastTypeNoteEn: 'Until moonrise — even water is abstained',
  whoObservesHi: 'सुहागिन स्त्रियाँ।',
  whoObservesEn: 'Married women.',
};

afterEach(() => {
  while (renderers.length > 0) {
    const renderer = renderers.pop()!;
    act(() => renderer.unmount());
  }
  mockNavigation.navigate.mockClear();
  mockGetUpvasInfo.mockReset();
  mockGetUpvasInfo.mockReturnValue(null);
  mockUseUpvasParana.mockReset();
  mockUseUpvasParana.mockReturnValue(null);
});

test('state 1 — upvas only: उपवास विधि heading + facts panel, no vidhi card', () => {
  mockGetUpvasInfo.mockImplementation((id) => (id === 'sankashti-chaturthi-upvas' ? FIXTURE_SANKASHTI : null));
  const r = renderDetail('sankashti-chaturthi-vrat');
  const body = texts(r);
  expect(body).toContain('उपवास विधि');
  expect(has(r, 'observance-upvas-panel')).toBe(true);
  expect(has(r, 'observance-vidhi-card')).toBe(false);
  expect(body).toContain('फलाहार');
  expect(body).toContain('सूर्योदय से चंद्रोदय तक।');
  expect(body).toContain('चंद्र दर्शन के उपरांत व्रत खोलें।');
  // No computed line while the derivation is null — the rule text stands alone.
  expect(has(r, 'observance-upvas-parana-computed')).toBe(false);
});

test('state 1 — the computed moonrise line renders beneath the rule text when derivable', () => {
  mockGetUpvasInfo.mockImplementation((id) => (id === 'sankashti-chaturthi-upvas' ? FIXTURE_SANKASHTI : null));
  mockUseUpvasParana.mockReturnValue({
    kind: 'instant',
    date: new Date(2026, 9, 29),
    at: new Date(2026, 9, 29, 20, 7),
  });
  const r = renderDetail('sankashti-chaturthi-vrat');
  const body = texts(r);
  expect(has(r, 'observance-upvas-parana-computed')).toBe(true);
  expect(body).toContain('चंद्रोदय');
  expect(body).toContain('8:07 PM');
  expect(body).toContain('उज्जैन'); // the location the line was computed for
});

test('state 2 — vidhi only: exactly the shipped PRD-19 block, unchanged', () => {
  const r = renderDetail('diwali');
  const body = texts(r);
  expect(body).toContain('पूजा विधि');
  expect(body).not.toContain('उपवास विधि');
  expect(has(r, 'observance-vidhi-card')).toBe(true);
  expect(has(r, 'observance-upvas-panel')).toBe(false);
  // The shipped subtitle shape, WITHOUT the composed-state "पूजा विधि · " prefix.
  expect(body).toMatch(/\d+ चरण · लगभग \d+ मिनट/);
  expect(body).not.toMatch(/पूजा विधि · \d+ चरण/);
});

test('state 3 — both: one उपवास विधि home, facts first, vidhi card beneath with its own identity', () => {
  mockGetUpvasInfo.mockImplementation((id) => (id === 'karwa-chauth-upvas' ? FIXTURE_KARWA : null));
  mockUseUpvasParana.mockReturnValue({
    kind: 'instant',
    date: new Date(2026, 9, 29),
    at: new Date(2026, 9, 29, 20, 7),
  });
  const r = renderDetail('karwa-chauth');
  const body = texts(r);
  expect(body).toContain('उपवास विधि');
  expect(has(r, 'observance-upvas-panel')).toBe(true);
  expect(has(r, 'observance-vidhi-card')).toBe(true);
  // The card keeps its own पूजा विधि identity row inside the shared section.
  expect(body).toMatch(/पूजा विधि · \d+ चरण/);
  // Facts render before the card: the panel contains the vidhi card (§6.3).
  const panel = r.root.findByProps({ testID: 'observance-upvas-panel' });
  expect(panel.findAllByProps({ testID: 'observance-vidhi-card' }).length).toBeGreaterThan(0);
  // The card still deep-links with the occurrence date.
  act(() => {
    r.root.findByProps({ testID: 'observance-vidhi-card' }).props.onPress();
  });
  expect(mockNavigation.navigate).toHaveBeenCalledWith(
    'VidhiDetail',
    expect.objectContaining({ vidhiId: 'karwa-chauth-puja', dateMs: new Date(2026, 9, 29).getTime() })
  );
});

test('state 4 — neither: no section, and never a placeholder', () => {
  // masik-kalashtami has a katha but neither vidhiId-resolved vidhi nor a
  // verified upvas entry — the page simply ends after the Story.
  const r = renderDetail('masik-kalashtami');
  const body = texts(r);
  expect(body).not.toContain('उपवास विधि');
  expect(body).not.toContain('पूजा विधि');
  expect(has(r, 'observance-upvas-panel')).toBe(false);
  expect(has(r, 'observance-vidhi-card')).toBe(false);
  for (const placeholder of ['Coming soon', 'coming soon', 'जल्द', 'शीघ्र आ रहा']) {
    expect(body).not.toContain(placeholder);
  }
});

test('a draft (filtered) entry is indistinguishable from no entry on the screen', () => {
  // The real registry returns null for drafts; the screen must show state 2/4
  // behaviour even though the rule CARRIES an upvasId hook.
  const r = renderDetail('karwa-chauth'); // upvasId set, registry mock returns null
  expect(has(r, 'observance-upvas-panel')).toBe(false);
  expect(texts(r)).toContain('पूजा विधि'); // falls back to the shipped vidhi-only block
});
