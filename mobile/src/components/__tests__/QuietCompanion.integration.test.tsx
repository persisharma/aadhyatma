/* eslint-disable @typescript-eslint/no-require-imports -- Reload real application modules for each simulated cold boot. */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import * as RN from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the renderer/native boundary and device storage alive across simulated
// process deaths. Providers, stores, permission mapping, scheduler and sheets
// are re-required on each boot; none of those application modules are mocked.
const mockReact = React;
const nativeBoundary = {
  Platform: RN.Platform,
  AppState: RN.AppState,
  NativeModules: RN.NativeModules,
  InteractionManager: RN.InteractionManager,
  Text: RN.Text,
  Modal: RN.Modal,
};
// RN exposes native modules through lazy getters; retain their identity when
// the application module registry resets. Avoid evaluating unrelated RN APIs.
const mockRN = new Proxy(RN, {
  get: (target, key) => key in nativeBoundary
    ? nativeBoundary[key as keyof typeof nativeBoundary]
    : Reflect.get(target, key),
});
// Loading the real bundled scripture corpus on the first boot can be slow in CI.
jest.setTimeout(20000);
const mockStorage = AsyncStorage;
let mockPermission = { status: 'denied', canAskAgain: true };
let mockDecision = { status: 'granted', canAskAgain: true };
const mockRequest = jest.fn(async () => (mockPermission = { ...mockDecision }));
const mockSchedule = jest.fn(async () => 'scheduled');
const mockPin = jest.fn(async () => true);
const mockPinSupported = jest.fn(async () => true);
const mockNavigate = jest.fn();
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => mockPermission),
  requestPermissionsAsync: mockRequest,
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: mockSchedule,
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));
jest.mock('expo-modules-core', () => ({ requireOptionalNativeModule: () => null }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: {} } }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// Decorative leaves do not participate in launch orchestration.
jest.mock('../AppIcon', () => () => null);
jest.mock('../CachedArtwork', () => () => null);

type Tour = ReturnType<typeof import('@/contexts/TourContext').useTour>;
type Preferences = ReturnType<typeof import('@/contexts/NotificationPreferencesContext').useNotificationPreferences>;
type Location = ReturnType<typeof import('@/contexts/PanchangLocationContext').usePanchangLocation>;
let tour: Tour;
let prefs: Preferences;
let location: Location;
let language: ReturnType<typeof import('@/data/gita/language').useGitaLanguage>;
let fontScale: ReturnType<typeof import('@/contexts/FontScaleContext').useFontScale>;
let tree: TestRenderer.ReactTestRenderer | undefined;
let listeners: Set<(state: RN.AppStateStatus) => void>;
const DAY = 86400000;
const TODAY = new Date('2026-10-31T12:00:00Z').getTime();

async function settle() {
  await act(async () => {
    // Drain chained storage/scheduler promises without advancing wall time.
    for (let i = 0; i < 100; i++) await Promise.resolve();
  });
}
async function unmount() {
  if (tree) await act(async () => tree!.unmount());
  tree = undefined;
  await settle();
}
async function boot({ platform = 'android', targeted = false }: {
  platform?: 'android' | 'ios';
  targeted?: boolean;
} = {}) {
  await unmount();
  jest.resetModules();
  jest.doMock('react', () => mockReact);
  jest.doMock('react-native', () => mockRN);
  jest.doMock('@react-native-async-storage/async-storage', () => mockStorage);
  mockRN.Platform.OS = platform;
  listeners.clear();
  const { GitaLanguageProvider, useGitaLanguage } = require('@/data/gita/language') as typeof import('@/data/gita/language');
  const { FontScaleProvider, useFontScale } = require('@/contexts/FontScaleContext') as typeof import('@/contexts/FontScaleContext');
  const { ThemeProvider } = require('@/theme/ThemeContext') as typeof import('@/theme/ThemeContext');
  const { PanchangLocationProvider, usePanchangLocation } = require('@/contexts/PanchangLocationContext') as typeof import('@/contexts/PanchangLocationContext');
  const { NotificationPreferencesProvider, useNotificationPreferences } = require('@/contexts/NotificationPreferencesContext') as typeof import('@/contexts/NotificationPreferencesContext');
  const { TourProvider, useTour } = require('@/contexts/TourContext') as typeof import('@/contexts/TourContext');
  const { default: Host } = require('../LaunchAskHost') as typeof import('../LaunchAskHost');
  function Probe() {
    tour = useTour();
    prefs = useNotificationPreferences();
    location = usePanchangLocation();
    language = useGitaLanguage();
    fontScale = useFontScale();
    return null;
  }
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider><FontScaleProvider><ThemeProvider>
        <PanchangLocationProvider><NotificationPreferencesProvider><TourProvider>
          <Probe /><Host targeted={targeted} />
        </TourProvider></NotificationPreferencesProvider></PanchangLocationProvider>
      </ThemeProvider></FontScaleProvider></GitaLanguageProvider>,
    );
  });
  await settle();
  expect(tour.isLoading).toBe(false);
  expect(prefs.isLoading).toBe(false);
}
function buttons() {
  // Expo can import Pressable by its internal path. Query its public control
  // props so module resets do not make component-type identity part of the test.
  return tree!.root.findAll((node) =>
    typeof node.props.onPress === 'function' && node.props.accessibilityRole != null,
  );
}
async function pressLabel(label: string) {
  const button = buttons().find((node) => node.props.accessibilityLabel === label);
  if (!button) throw new Error(`Missing ${label}; rendered: ${buttons().map((node) => node.props.accessibilityLabel).join(', ')}`);
  expect(button.props.disabled).not.toBe(true);
  await act(async () => button.props.onPress());
  await settle();
}
async function pressText(text: string) {
  const button = buttons().find((node) => node.findAllByType(mockRN.Text)
    .some((child) => child.props.children === text));
  if (!button) throw new Error(`Missing button with text: ${text}`);
  expect(button.props.disabled).not.toBe(true);
  await act(async () => button.props.onPress());
  await settle();
}
function visibleModals() {
  return tree!.root.findAllByType(mockRN.Modal).filter((node) => node.props.visible);
}
async function stored(key: string) {
  const raw = await AsyncStorage.getItem(key);
  return raw == null ? null : JSON.parse(raw);
}
async function reachReminder() {
  await pressLabel('English');
  await pressLabel('Setup language continue');
  await pressLabel('Setup city continue');
}
async function finishTour() {
  expect(tour.shouldShowFirstLaunchTour).toBe(true);
  await act(async () => { await tour.markTourCompleted(); });
  await settle();
  expect(tour.shouldShowWhatsNew).toBe(false);
}
beforeEach(async () => {
  jest.useFakeTimers({ now: TODAY, doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'nextTick', 'setImmediate', 'clearImmediate', 'performance'] });
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockPermission = { status: 'denied', canAskAgain: true };
  mockDecision = { status: 'granted', canAskAgain: true };
  mockPinSupported.mockResolvedValue(true);
  mockPin.mockResolvedValue(true);
  listeners = new Set();
  jest.spyOn(mockRN.AppState, 'addEventListener').mockImplementation((_, listener) => {
    listeners.add(listener);
    return { remove: () => { listeners.delete(listener); } };
  });
  // Background cache warming is unrelated to launch decisions.
  jest.spyOn(mockRN.InteractionManager, 'runAfterInteractions').mockImplementation(() => ({
    then: jest.fn(async () => undefined), done: jest.fn(), cancel: jest.fn(),
  }));
  mockRN.NativeModules.VedanshWidget = {
    isPinWidgetSupported: mockPinSupported,
    requestPinWidget: mockPin,
    readPayload: jest.fn(async () => null),
  };
});
afterEach(async () => {
  await unmount();
  delete mockRN.NativeModules.VedanshWidget;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('fresh setup commits choices, enables both reminders with one OS ask, then hands off to tour', async () => {
  await boot();
  expect(visibleModals()).toHaveLength(1);
  expect(mockRequest).not.toHaveBeenCalled();
  expect(mockSchedule).not.toHaveBeenCalled();
  expect(tour.shouldShowFirstLaunchTour).toBe(false);
  await pressLabel('English');
  await pressLabel('Large reading size');
  await pressLabel('Setup language continue');
  await pressText('Delhi');
  expect(location.location.cityId).not.toBe('delhi');
  expect(await AsyncStorage.getItem('@vedansh:panchang-location')).toBeNull();
  await pressLabel('Setup city continue');
  expect(location.location.cityId).toBe('delhi');
  expect(await stored('@vedansh:panchang-location')).toMatchObject({ cityId: 'delhi' });
  await pressLabel('Enable reminders');
  expect(mockRequest).toHaveBeenCalledTimes(1);
  expect(prefs.prefs).toMatchObject({ dailyVerseEnabled: true, festiveRemindersEnabled: true });
  expect(await stored('@vedansh/notif-prefs')).toMatchObject({ dailyVerseEnabled: true, festiveRemindersEnabled: true });
  expect(mockSchedule).toHaveBeenCalled();
  expect(await AsyncStorage.getItem('@vedansh/notif-permission-asked')).toBe('1');
  expect(visibleModals()).toHaveLength(0);
  await finishTour();
  await boot();
  expect(visibleModals()).toHaveLength(0);
  expect(await AsyncStorage.getItem('@vedansh/language')).toBe('en');
  expect(language.lang).toBe('en');
  expect(await AsyncStorage.getItem('@vedansh/font-scale')).toBe('L');
  expect(fontScale.scale).toBe('L');
  expect(location.location.cityId).toBe('delhi');
  expect(mockRequest).toHaveBeenCalledTimes(1);
});

test('process death after language resumes city setup despite the saved language upgrader signal', async () => {
  await boot();
  await pressLabel('Gujarati');
  await pressLabel('Large reading size');
  await pressLabel('Setup language continue');
  await boot();
  expect(tour.shouldShowOnboardingSetup).toBe(true);
  expect(tour.shouldShowWhatsNew).toBe(false);
  expect(tour.shouldShowFirstLaunchTour).toBe(false);
  expect(buttons().some((node) => node.props.accessibilityLabel === 'Setup city continue')).toBe(true);
  expect(await AsyncStorage.getItem('@vedansh/language')).toBe('gu');
  expect(language.lang).toBe('gu');
  expect(await AsyncStorage.getItem('@vedansh/font-scale')).toBe('L');
  expect(fontScale.scale).toBe('L');
  expect(mockRequest).not.toHaveBeenCalled();
});

test('Not now survives an unrelated OS grant and restart without scheduling or a same-day re-ask', async () => {
  await boot();
  await reachReminder();
  await pressText('Not now');
  expect(mockRequest).not.toHaveBeenCalled();
  await finishTour();
  await act(async () => { await prefs.requestPermission(); });
  await settle();
  expect(prefs.permissionStatus).toBe('granted');
  expect(prefs.prefs).toMatchObject({ dailyVerseEnabled: false, festiveRemindersEnabled: false });
  await boot();
  expect(visibleModals()).toHaveLength(0);
  expect(prefs.prefs.dailyVerseEnabled).toBe(false);
  expect(mockSchedule).not.toHaveBeenCalled();
  expect(await stored('@vedansh/launch-asks-v1')).toMatchObject({ declines: 1 });
});

test('iOS hands off to tour only after the actual setup modal dismissal callback', async () => {
  await boot({ platform: 'ios' });
  await reachReminder();
  const modal = visibleModals()[0];
  await pressLabel('Enable reminders');
  expect(mockRequest).toHaveBeenCalledTimes(1);
  expect(visibleModals()).toHaveLength(0);
  expect(tour.shouldShowOnboardingSetup).toBe(true);
  expect(tour.shouldShowFirstLaunchTour).toBe(false);
  await act(async () => modal.props.onDismiss());
  await settle();
  await finishTour();
});

test('later-day widget offer pins the second widget after foreground even when the host unmounts', async () => {
  await boot();
  await reachReminder();
  await pressLabel('Enable reminders');
  await finishTour();
  jest.setSystemTime(TODAY + DAY);
  await boot();
  expect(visibleModals()).toHaveLength(1);
  expect(tree!.root.findAll((node) => node.props.accessibilityLabel === 'Daily verse widget preview').length).toBeGreaterThan(0);
  await pressText('Add both widgets');
  expect(mockPin.mock.calls).toEqual([['verse']]);
  await act(async () => { listeners.forEach((listener) => listener('background')); });
  await unmount();
  await act(async () => { listeners.forEach((listener) => listener('active')); });
  await settle();
  expect(mockPin.mock.calls).toEqual([['verse'], ['panchang']]);
  expect(await stored('@vedansh/daily-bhakti-nudge')).toMatchObject({ widgetAddedAt: expect.any(Number), panchangAddedAt: expect.any(Number) });
  jest.setSystemTime(TODAY + 2 * DAY);
  await boot();
  expect(visibleModals()).toHaveLength(0);
  expect(mockRequest).toHaveBeenCalledTimes(1);
});

test('unsupported Android pinning opens the widget gallery without stamping an add', async () => {
  await boot();
  await reachReminder();
  await pressLabel('Enable reminders');
  await finishTour();
  jest.setSystemTime(TODAY + DAY);
  mockPinSupported.mockResolvedValue(false);
  await boot();
  await pressText('Add both widgets');
  expect(mockNavigate).toHaveBeenCalledWith('MoreTab', {
    screen: 'WidgetGallery', params: undefined, initial: false,
  });
  expect(mockPin).not.toHaveBeenCalled();
  expect((await stored('@vedansh/daily-bhakti-nudge'))?.widgetAddedAt ?? null).toBeNull();
});

test('hard denial persists both reminders off and does not ask permission again on a later launch', async () => {
  mockDecision = { status: 'denied', canAskAgain: false };
  await boot();
  await reachReminder();
  await pressLabel('Enable reminders');
  await finishTour();
  jest.setSystemTime(TODAY + 30 * DAY);
  await boot();
  expect(prefs.permissionStatus).toBe('denied');
  expect(prefs.canAskAgain).toBe(false);
  expect(prefs.prefs).toMatchObject({ dailyVerseEnabled: false, festiveRemindersEnabled: false });
  expect(mockRequest).toHaveBeenCalledTimes(1);
  expect(mockSchedule).not.toHaveBeenCalled();
  expect(buttons().some((node) => node.props.accessibilityLabel === 'Enable reminders')).toBe(false);
});

test('a targeted cold start suppresses setup without consuming the ordinary launch opportunity', async () => {
  await boot({ targeted: true });
  expect(visibleModals()).toHaveLength(0);
  expect(mockRequest).not.toHaveBeenCalled();
  expect((await stored('@vedansh/launch-asks-v1')).lastDay).toBeNull();
  await boot();
  expect(visibleModals()).toHaveLength(1);
  expect(tour.shouldShowOnboardingSetup).toBe(true);
});

test('process death at reminders resumes that step, then resumes the unfinished tour on the next boot', async () => {
  await boot();
  await reachReminder();
  await boot();
  expect(buttons().some((node) => node.props.accessibilityLabel === 'Enable reminders')).toBe(true);
  expect(mockRequest).not.toHaveBeenCalled();
  await pressText('Not now');
  await boot();
  expect(visibleModals()).toHaveLength(0);
  expect(tour.shouldShowOnboardingSetup).toBe(false);
  await finishTour();
});

test('later reminder invitations respect the rest period and persist the third-decline stop choice', async () => {
  // Disable the widget native host to isolate the reminder rest days.
  delete mockRN.NativeModules.VedanshWidget;
  await boot();
  await reachReminder();
  await pressText('Not now');
  await finishTour();
  jest.setSystemTime(TODAY + DAY);
  await boot();
  expect(visibleModals()).toHaveLength(0);
  jest.setSystemTime(TODAY + 2 * DAY);
  await boot();
  expect(visibleModals()).toHaveLength(1);
  await pressText('Not now');
  expect(await stored('@vedansh/launch-asks-v1')).toMatchObject({ declines: 2, stopped: false });
  await boot();
  expect(visibleModals()).toHaveLength(0);
  jest.setSystemTime(TODAY + 4 * DAY);
  await boot();
  await pressText('Don’t ask again');
  expect(await stored('@vedansh/launch-asks-v1')).toMatchObject({ declines: 3, stopped: true });
  jest.setSystemTime(TODAY + 40 * DAY);
  await boot();
  expect(visibleModals()).toHaveLength(0);
  expect(mockRequest).not.toHaveBeenCalled();
  expect(mockSchedule).not.toHaveBeenCalled();
});

test('turning daily reminders off through Settings prevents a later launch invitation', async () => {
  delete mockRN.NativeModules.VedanshWidget;
  await boot();
  await reachReminder();
  await pressLabel('Enable reminders');
  await finishTour();
  await act(async () => { await prefs.setDailyVerseEnabled(false); });
  await settle();
  expect(await stored('@vedansh/notif-meta')).toMatchObject({ optedOutAt: TODAY });
  jest.setSystemTime(TODAY + 40 * DAY);
  await boot();
  expect(prefs.prefs.dailyVerseEnabled).toBe(false);
  expect(visibleModals()).toHaveLength(0);
  expect(mockRequest).toHaveBeenCalledTimes(1);
});

test('an existing verse flow offers only Panchang, and dismissing it suppresses future widget offers', async () => {
  await boot();
  await reachReminder();
  await pressLabel('Enable reminders');
  await finishTour();
  // The public shared store is also what the Home strip writes after a verse flow.
  await act(async () => {
    const { updateNudge } = require('../widgetNudgeStore') as typeof import('../widgetNudgeStore');
    await updateNudge({ widgetAddedAt: TODAY });
  });
  jest.setSystemTime(TODAY + DAY);
  await boot();
  expect(tree!.root.findAll((node) => node.props.accessibilityLabel === 'Daily verse widget preview')).toHaveLength(0);
  expect(tree!.root.findAll((node) => node.props.accessibilityLabel === 'Panchang widget preview').length).toBeGreaterThan(0);
  expect(buttons().some((node) => node.props.accessibilityLabel === 'Add Panchang')).toBe(true);
  await pressText('Not now');
  expect(await stored('@vedansh/daily-bhakti-nudge')).toMatchObject({ widgetAddedAt: TODAY, widgetDismissedAt: TODAY + DAY, panchangAddedAt: null });
  jest.setSystemTime(TODAY + 40 * DAY);
  await boot();
  expect(visibleModals()).toHaveLength(0);
  expect(mockPin).not.toHaveBeenCalled();
});
