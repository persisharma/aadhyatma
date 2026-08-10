import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Linking, Modal } from 'react-native';
import { INSTAGRAM_URL } from '@/data/shareLinks';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';

/**
 * MoreScreen redesign (V4 grouped-list): three inset lists — साधना / ऐप / जानकारी.
 * These tests pin the structure (rows present with the a11y labels the Maestro
 * more-smoke flow relies on), navigation targets, and that Language / Reading-size
 * rows open their picker sheets instead of the old inline controls.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
const mockSetItem = jest.fn((_key: string, _value: string) => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: (key: string, value: string) => mockSetItem(key, value),
}));
jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(View, p, children) };
});

jest.mock('@/contexts/BookmarksContext', () => ({
  useBookmarks: () => ({ bookmarks: [] }),
}));
jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({
    lifetimeTotals: () => ({ totalReads: 1, totalBeads: 0, totalRounds: 0, perSource: {}, perMantra: {}, activeDays: 1 }),
    currentStreak: () => 1,
  }),
}));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({ prefs: { dailyVerseEnabled: true, times: [{ hour: 7, minute: 0 }] } }),
}));
jest.mock('@/contexts/JapamAlarmsContext', () => ({
  useJapamAlarms: () => ({ alarms: [] }),
}));
const mockResetTour = jest.fn();
jest.mock('@/contexts/TourContext', () => ({
  useTour: () => ({ resetTour: mockResetTour }),
}));
const mockOpenRatingPrompt = jest.fn();
jest.mock('@/contexts/RatingPromptContext', () => ({
  useRatingPrompt: () => ({ open: mockOpenRatingPrompt }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const MoreScreen = jest.requireActual<typeof import('../MoreScreen')>('../MoreScreen').default;

function makeNav(): { navigate: jest.Mock; goBack: jest.Mock } {
  return { navigate: jest.fn(), goBack: jest.fn() };
}

async function renderMore(nav: ReturnType<typeof makeNav>) {
  let tree: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <MoreScreen navigation={nav as never} route={{ key: 'MoreHome', name: 'MoreHome' } as never} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return tree!;
}

function byLabel(tree: TestRenderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function'
  )[0];
}

describe('MoreScreen (redesign)', () => {
  beforeEach(() => {
    mockGetItem.mockReset().mockResolvedValue(null);
    mockSetItem.mockReset().mockResolvedValue(undefined);
    mockResetTour.mockClear();
    mockOpenRatingPrompt.mockClear();
  });

  test('renders the practice/app/info rows with their a11y labels', async () => {
    const tree = await renderMore(makeNav());
    expect(byLabel(tree, 'Open Sadhak profile')).toBeDefined();
    expect(byLabel(tree, 'Wishlist, 0 verses saved')).toBeDefined();
    expect(byLabel(tree, 'Reminders, daily verse on at 07:00')).toBeDefined();
    expect(byLabel(tree, 'Japam alarms, none set')).toBeDefined();
    expect(byLabel(tree, 'Language, Hindi')).toBeDefined();
    expect(byLabel(tree, 'Reading size, Standard')).toBeDefined();
    expect(byLabel(tree, 'Home-Screen Widgets, new')).toBeDefined();
    expect(byLabel(tree, 'Rate the app')).toBeDefined();
    expect(byLabel(tree, 'Follow on Instagram')).toBeDefined();
    expect(byLabel(tree, 'About and disclaimer')).toBeDefined();
    expect(byLabel(tree, 'Report an error')).toBeDefined();
    expect(byLabel(tree, 'Show App Tour')).toBeDefined();
  });

  test('tapping Show App Tour replays the feature tour', async () => {
    const tree = await renderMore(makeNav());
    act(() => byLabel(tree, 'Show App Tour').props.onPress());
    expect(mockResetTour).toHaveBeenCalled();
  });

  test('rows navigate to their destinations', async () => {
    const nav = makeNav();
    const tree = await renderMore(nav);
    act(() => byLabel(tree, 'Open Sadhak profile').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('Profile');
    act(() => byLabel(tree, 'Wishlist, 0 verses saved').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('Wishlist');
    act(() => byLabel(tree, 'Reminders, daily verse on at 07:00').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('Reminders');
    act(() => byLabel(tree, 'Japam alarms, none set').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('JapamAlarms');
    act(() => byLabel(tree, 'Home-Screen Widgets, new').props.onPress());
    expect(nav.navigate).toHaveBeenCalledWith('WidgetGallery');
  });

  test('tapping Rate the app opens the rating sheet instead of leaving the app', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const tree = await renderMore(makeNav());
    act(() => byLabel(tree, 'Rate the app').props.onPress());
    expect(mockOpenRatingPrompt).toHaveBeenCalledTimes(1);
    // The store hand-off happens from the sheet's primary button, not this row.
    expect(openURL).not.toHaveBeenCalled();
    openURL.mockRestore();
  });

  test('tapping Follow on Instagram opens the public profile URL', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const tree = await renderMore(makeNav());
    await act(async () => byLabel(tree, 'Follow on Instagram').props.onPress());
    expect(openURL).toHaveBeenCalledWith(INSTAGRAM_URL);
    openURL.mockRestore();
  });

  const openModals = (tree: TestRenderer.ReactTestRenderer) =>
    tree.root.findAllByType(Modal).filter((m) => m.props.visible === true).length;

  test('tapping Language opens a picker sheet', async () => {
    const tree = await renderMore(makeNav());
    expect(openModals(tree)).toBe(0);
    act(() => byLabel(tree, 'Language, Hindi').props.onPress());
    expect(openModals(tree)).toBe(1);
  });

  test('tapping Reading size opens a picker sheet', async () => {
    const tree = await renderMore(makeNav());
    expect(openModals(tree)).toBe(0);
    act(() => byLabel(tree, 'Reading size, Standard').props.onPress());
    expect(openModals(tree)).toBe(1);
  });
});
