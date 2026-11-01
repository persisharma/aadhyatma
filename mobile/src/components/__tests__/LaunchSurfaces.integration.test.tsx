/* eslint-disable @typescript-eslint/no-require-imports -- Reload real stores for simulated cold boots. */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import * as RN from 'react-native';

const mockReact = React;
const nativeBoundary = { Platform: RN.Platform, AppState: RN.AppState, InteractionManager: RN.InteractionManager, Text: RN.Text, Modal: RN.Modal };
const mockRN = new Proxy(RN, { get: (target, key) => key in nativeBoundary ? nativeBoundary[key as keyof typeof nativeBoundary] : Reflect.get(target, key) });
const DAY = 86400000;
const NOW = new Date('2026-10-31T06:00:00Z').getTime();
const LAUNCH_KEY = '@vedansh/launch-asks-v1', EXPLORE_KEY = '@vedansh/explore-sheet-v1';
const mockStorage = new Map<string, string>();
let mockPrefs: any, mockNudge: any, mockTargeted = false;
let mockUrl: string | null = null;
let mockTracking = false;
let mockPendingUpdate = false;
let mockTrackingRead: Promise<{ status: string }>;
const mockStartTracking = jest.fn(async (): Promise<void> => undefined);
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => { mockStorage.set(key, value); }),
  multiGet: jest.fn(async () => []),
}));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }), CommonActions: { navigate: (payload: object) => ({ type: 'NAVIGATE', payload }) } }));
jest.mock('@/notifications/deepLink', () => ({ navigationRef: { isReady: () => true, getCurrentRoute: () => ({name: 'Home'}), dispatch: jest.fn(), addListener: () => () => undefined } }));
jest.mock('@/contexts/TourContext', () => ({ useTour: () => ({ isLoading: false, shouldShowFirstLaunchTour: false, shouldShowOnboardingSetup: false, shouldShowWhatsNew: false }) }));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({ useNotificationPreferences: () => mockPrefs }));
jest.mock('@/contexts/RatingPromptContext', () => ({ useRatingPrompt: () => ({ visible: false }) }));
jest.mock('expo-updates', () => ({ isEnabled: true, useUpdates: () => ({ isUpdatePending: mockPendingUpdate }) }));
jest.mock('expo-notifications', () => ({ getLastNotificationResponseAsync: jest.fn(async () => null), addNotificationResponseReceivedListener: () => ({ remove: jest.fn() }) }));
jest.mock('expo-sensors', () => ({ Magnetometer: { isAvailableAsync: jest.fn(async () => true) } }));
jest.mock('expo-tracking-transparency', () => ({ getTrackingPermissionsAsync: () => mockTrackingRead }));
jest.mock('react-native/Libraries/Linking/Linking', () => ({ __esModule: true, default: { getInitialURL: jest.fn(async () => mockUrl), addEventListener: () => ({ remove: jest.fn() }) } }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));
jest.mock('@/components/AppIcon', () => 'AppIcon');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
jest.mock('@/components/OnboardingSetupSheet', () => function MockSetup() { return null; });
jest.mock('@/components/ReminderOptInModal', () => function MockReminder() { return require('react').createElement('Reminder'); });
jest.mock('@/components/DailyBhaktiNudge', () => ({ WidgetHowToSheet: () => require('react').createElement('Widgets') }));
jest.mock('@/components/widgetNudgeStore', () => ({ loadNudgeRecord: async () => undefined, nudgeSnapshot: () => mockNudge, updateNudge: jest.fn(), startWidgetPinFlow: jest.fn() }));
jest.mock('@/widgets/native', () => ({ hasWidgetHost: () => true, readWidgetPayload: async () => ({ kind: 'missing' }) }));
jest.mock('@/utils/metaAppEvents', () => ({ metaTrackingAvailable: () => mockTracking, startMetaAppEvents: () => mockStartTracking() }));

let tree: TestRenderer.ReactTestRenderer | undefined;
async function flush() {
  await act(async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); });
}
async function tick() {
  await flush();
  for (let i = 0; i < 12; i++) {
    await act(async () => { await jest.advanceTimersByTimeAsync(250); });
    await flush();
  }
}
async function unmount() {
  if (tree) await act(async () => tree!.unmount());
  tree = undefined;
}
async function boot({ host = true } = {}) {
  await unmount();
  jest.resetModules();
  jest.doMock('react', () => mockReact);
  jest.doMock('react-native', () => mockRN);
  const Host = require('../LaunchAskHost').default;
  const Explore = require('../explore/ExploreLaunch').default;
  await act(async () => {
    tree = TestRenderer.create(<>{host && <Host targeted={mockTargeted} />}<Explore /></>);
  });
  await tick();
}
function exploreVisible() { return tree!.root.findAllByProps({ testID: 'explore-heading' }).length > 0; }
function launchRecord() { return JSON.parse(mockStorage.get(LAUNCH_KEY)!); }
beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  jest.clearAllMocks();
  mockRN.Platform.OS = 'android';
  Object.defineProperty(mockRN.AppState, 'currentState', { configurable: true, writable: true, value: 'active' });
  jest.spyOn(mockRN.AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  jest.spyOn(mockRN.InteractionManager, 'runAfterInteractions').mockImplementation(fn => { if (typeof fn === 'function') fn(); return { cancel: jest.fn(), then: jest.fn(), done: jest.fn() }; });
  mockStorage.clear();
  mockStorage.set(LAUNCH_KEY, JSON.stringify({ firstDay: '2026-10-20', lastDay: null, declines: 0, stopped: false }));
  mockStorage.set(EXPLORE_KEY, JSON.stringify({version: 1, enabled: true, createdAt: NOW - 2 * DAY, visited: [], shown: [], declined: {}, streak: 0, sleepUntil: 0}));
  mockPrefs = { isLoading: false, shouldShowOptIn: false, prefs: { dailyVerseEnabled: true }, meta: {lastDeclinedAt: null, optedOutAt: null}, permissionStatus: 'granted', canAskAgain: true };
  mockNudge = { widgetDismissedAt: null, widgetAddedAt: null, panchangAddedAt: null };
  mockTargeted = false;
  mockUrl = null;
  mockTracking = false;
  mockPendingUpdate = false;
  mockTrackingRead = Promise.resolve({ status: 'granted' });
});
afterEach(async () => { await unmount(); jest.restoreAllMocks(); jest.useRealTimers(); });

test('the widget offer owns the slot and Explore never opens over it', async () => {
  await boot();
  expect(tree!.root.findAllByType('Widgets' as any)).toHaveLength(1);
  expect(exploreVisible()).toBe(false);
  expect(JSON.parse(mockStorage.get(EXPLORE_KEY)!).shown).toEqual([]);
});
test('the new reminder cadence wins even when the legacy 15-day flag is false', async () => {
  mockStorage.set(LAUNCH_KEY, JSON.stringify({firstDay: '2026-10-20', lastDay: '2026-10-30', lastReminderDay: '2026-10-29', declines: 1, stopped: false}));
  mockPrefs.prefs.dailyVerseEnabled = false;
  mockPrefs.meta.lastDeclinedAt = NOW - 2 * DAY;
  await boot();
  expect(tree!.root.findAllByType('Reminder' as any)).toHaveLength(1);
  expect(exploreVisible()).toBe(false);
});
test('a stopped reminder leaves Explore available, which persists the shared daily limit across cold boots', async () => {
  mockStorage.set(LAUNCH_KEY, JSON.stringify({firstDay: '2026-10-20', lastDay: null, declines: 3, stopped: true}));
  mockPrefs.prefs.dailyVerseEnabled = false;
  mockPrefs.shouldShowOptIn = true;
  mockNudge.widgetDismissedAt = NOW - DAY;
  await boot();
  expect(exploreVisible()).toBe(true);
  expect(launchRecord().lastDay).toBe('2026-10-31');
  await boot();
  expect(exploreVisible()).toBe(false);
  jest.setSystemTime(NOW + DAY);
  await boot();
  expect(exploreVisible()).toBe(true);
  expect(launchRecord().lastDay).toBe('2026-11-01');
});
test('Explore waits for host selection and checks an atomic claim at display time', async () => {
  await boot({host: false});
  expect(exploreVisible()).toBe(false);
  const store = require('../launchAskStore') as typeof import('../launchAskStore');
  await act(async () => { await store.hydrateLaunchAsks(); store.completeLaunchSelection(); });
  await act(async () => { await jest.advanceTimersByTimeAsync(400); });
  await act(async () => { expect(store.claimLaunchAsk()).toBe(true); });
  await tick();
  expect(exploreVisible()).toBe(false);
});
test('a slow iOS measurement initialization keeps Explore waiting for host selection', async () => {
  mockRN.Platform.OS = 'ios';
  let resolve!: () => void;
  mockStartTracking.mockReturnValueOnce(new Promise<void>(done => { resolve = done; }));
  mockNudge.widgetDismissedAt = NOW;
  await boot();
  expect(mockStartTracking).toHaveBeenCalledTimes(1);
  expect(exploreVisible()).toBe(false);
  await act(async () => { resolve(); });
  await tick();
  expect(exploreVisible()).toBe(true);
});
test('a targeted launch suppresses Explore alongside the host', async () => {
  mockTargeted = true;
  mockUrl = 'vedansh://widget/verse';
  await boot();
  expect(exploreVisible()).toBe(false);
  expect(tree!.root.findAllByType('Widgets' as any)).toHaveLength(0);
});
test('a staged update waits for the next opportunity once Explore owns the current slot', async () => {
  mockNudge.widgetDismissedAt = NOW;
  await boot();
  expect(exploreVisible()).toBe(true);
  mockPendingUpdate = true;
  const Host = require('../LaunchAskHost').default, Explore = require('../explore/ExploreLaunch').default;
  await act(async () => { tree!.update(<><Host /><Explore /></>); });
  await tick();
  expect(exploreVisible()).toBe(true);
  expect((require('../launchAskStore') as typeof import('../launchAskStore')).claimLaunchAsk()).toBe(false);
});
