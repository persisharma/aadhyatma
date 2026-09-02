import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Switch, Text } from 'react-native';

/**
 * PRD-29 Part A जन्म तिथि screens — list (living + pitru sections, empty-state
 * Kundali door), detail (tithi caption, this-year pill, nakshatra, practice
 * rows, per-person reminder opt-in with the OS-grant gate). Solve persistence
 * is mocked — the layer's own behaviour is pinned by `pitruSmaranSolves`'s
 * suites; the derivation itself runs real (pinned by janmaTithi.test.ts).
 */

jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View: RNView } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(RNView, p, children) };
});

const mockRootNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockRootNavigate, goBack: jest.fn(), getState: () => ({ routeNames: [] }) }),
}));

let mockRoster: { hydrated: boolean; roster: { activeId: string | null; people: unknown[] }; error: boolean } = {
  hydrated: true,
  roster: { activeId: null, people: [] },
  error: false,
};
jest.mock('@/panchang/useKundali', () => ({
  useBirthProfileRoster: () => mockRoster,
}));

// The persisted solve layer is module state with real astronomy behind it —
// replaced so the suites are deterministic and fast. The janma detail's
// warm-first read makes these answer synchronously on first render.
const mockNext = new Date(2026, 9, 29);
const mockFollowing = new Date(2027, 9, 18);
jest.mock('@/panchang/pitruSmaranSolves', () => {
  const actual = jest.requireActual('@/panchang/pitruSmaranSolves');
  return {
    ...actual,
    hydrateSmaranSolves: jest.fn(() => Promise.resolve()),
    persistSmaranSolves: jest.fn(() => Promise.resolve()),
    knownOccurrences: jest.fn((_rule: unknown, _today: Date, count: number) =>
      [mockNext, mockFollowing].slice(0, count)
    ),
    ensureOccurrences: jest.fn((_rule: unknown, _today: Date, count: number) =>
      [mockNext, mockFollowing].slice(0, count)
    ),
  };
});

let mockEntries: import('@/panchang/pitruSmaran').SmaranEntry[] = [];
jest.mock('@/contexts/PitruSmaranContext', () => ({
  usePitruSmaran: () => ({ entries: mockEntries, isLoading: false }),
}));
jest.mock('@/panchang/usePitruSmaranSolves', () => ({
  useSmaranListSolve: () => null,
}));

let mockPermissionStatus: 'undetermined' | 'granted' | 'denied' = 'granted';
let mockGrantResult: 'granted' | 'denied' = 'granted';
const mockRequestPermission = jest.fn(() => Promise.resolve(mockGrantResult));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({
    permissionStatus: mockPermissionStatus,
    requestPermission: mockRequestPermission,
  }),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { __resetJanmaPrefsForTests, getJanmaPrefsSnapshot } from '@/panchang/janmaTithiPrefs';
import { __resetKulRecordStoreForTests } from '@/panchang/kulParamparaStore';
import type { PersonProfile } from '@/panchang/birthProfiles';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const JanmaTithiListScreen = jest.requireActual<typeof import('../JanmaTithiListScreen')>(
  '../JanmaTithiListScreen'
).default;
const JanmaTithiDetailScreen = jest.requireActual<typeof import('../JanmaTithiDetailScreen')>(
  '../JanmaTithiDetailScreen'
).default;

const MADHU: PersonProfile = { id: 'p-1', name: 'मधुसूदन', date: '1988-11-12', time: '06:40', cityId: 'jaipur' };
const VEDIKA: PersonProfile = { id: 'p-2', date: '2019-01-23', time: '09:15', cityId: 'ujjain' };

function withPeople(people: PersonProfile[]) {
  mockRoster = { hydrated: true, roster: { activeId: people[0]?.id ?? null, people }, error: false };
}

function wrap(children: React.ReactNode) {
  return (
    <FontScaleProvider>
      <ThemeProvider>
        <GitaLanguageProvider initialLang="hi">{children}</GitaLanguageProvider>
      </ThemeProvider>
    </FontScaleProvider>
  );
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(async () => {
  act(() => {
    trees.splice(0).forEach((t) => t.unmount());
  });
  jest.clearAllMocks();
  mockEntries = [];
  mockRoster = { hydrated: true, roster: { activeId: null, people: [] }, error: false };
  mockPermissionStatus = 'granted';
  mockGrantResult = 'granted';
  await AsyncStorage.clear();
  __resetJanmaPrefsForTests();
  __resetKulRecordStoreForTests();
});

async function render(node: React.ReactElement): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(wrap(node));
  });
  trees.push(tree);
  await flush();
  return tree;
}

describe('JanmaTithiListScreen', () => {
  test('empty roster renders the explainer and the Kundali door', async () => {
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(
      <JanmaTithiListScreen navigation={nav as never} route={{ key: 'l', name: 'JanmaTithiList' } as never} />
    );
    expect(allText(tree)).toContain('जन्म विवरण से तिथि निकलती है');
    act(() => byLabel(tree, 'Add birth details in Kundali').props.onPress());
    // Cross-tab hand-off through the helper: initial:false must ride along.
    expect(mockRootNavigate).toHaveBeenCalledWith(
      'PanchangTab',
      expect.objectContaining({ screen: 'Kundali', initial: false })
    );
  });

  test('living rows carry label + tithi + this year; pitru section renders; tap opens detail', async () => {
    withPeople([MADHU, VEDIKA]);
    mockEntries = [
      { id: 'e-1', relation: 'dadaji', tithiRule: { lunarMonth: 7, paksha: 'krishna', tithi: 10 }, createdAtMs: 1 },
    ];
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(
      <JanmaTithiListScreen navigation={nav as never} route={{ key: 'l', name: 'JanmaTithiList' } as never} />
    );
    const text = allText(tree);
    expect(text).toContain('मधुसूदन');
    expect(text).toContain('कार्तिक');
    expect(text).toContain('दादाजी');
    const row = tree.root.findAll(
      (n) => typeof n.props.accessibilityLabel === 'string'
        && n.props.accessibilityLabel.startsWith('Janma tithi मधुसूदन')
        && typeof n.props.onPress === 'function'
    )[0];
    act(() => row.props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('JanmaTithiDetail', { personId: 'p-1' });
  });
});

describe('JanmaTithiDetailScreen', () => {
  const route = { key: 'd', name: 'JanmaTithiDetail', params: { personId: 'p-1' } } as never;

  test('renders the four lines: birth, tithi, this year, nakshatra — and the sunrise-convention note', async () => {
    withPeople([MADHU]);
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<JanmaTithiDetailScreen navigation={nav as never} route={route} />);
    const text = allText(tree);
    expect(text).toContain('मधुसूदन');
    expect(text).toContain('कार्तिक'); // the derived tithi (Kartik Shukla Trayodashi for 1988-11-12)
    expect(text).toContain('इस वर्ष');
    expect(text).toContain('जन्म नक्षत्र');
    expect(text).toContain('सूर्योदय तिथि');
    // The dirghayu paath practice row points at the shipped section.
    expect(byLabel(tree, 'Open Vishnu Sahasranama Excerpt')).toBeTruthy();
  });

  test('a removed person renders the not-found state, never a crash', async () => {
    withPeople([VEDIKA]);
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<JanmaTithiDetailScreen navigation={nav as never} route={route} />);
    expect(allText(tree)).toContain('यह व्यक्ति नहीं मिला।');
  });

  test('reminder defaults OFF; enabling persists only after the OS grant succeeds', async () => {
    withPeople([MADHU]);
    mockPermissionStatus = 'undetermined';
    mockGrantResult = 'granted';
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<JanmaTithiDetailScreen navigation={nav as never} route={route} />);
    const toggle = tree.root.findAllByType(Switch)[0];
    expect(toggle.props.value).toBe(false);
    await act(async () => {
      await toggle.props.onValueChange(true);
    });
    expect(mockRequestPermission).toHaveBeenCalled();
    expect(getJanmaPrefsSnapshot().prefs.reminders['p-1']).toBe(true);
  });

  test('a denied grant leaves the preference honestly off', async () => {
    withPeople([MADHU]);
    mockPermissionStatus = 'undetermined';
    mockGrantResult = 'denied';
    const nav = { navigate: jest.fn(), goBack: jest.fn() };
    const tree = await render(<JanmaTithiDetailScreen navigation={nav as never} route={route} />);
    const toggle = tree.root.findAllByType(Switch)[0];
    await act(async () => {
      await toggle.props.onValueChange(true);
    });
    expect(getJanmaPrefsSnapshot().prefs.reminders['p-1']).toBeUndefined();
  });
});
