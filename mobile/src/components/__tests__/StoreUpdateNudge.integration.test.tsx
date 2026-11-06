/* eslint-disable @typescript-eslint/no-require-imports -- Simulate cold-process module stores. */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, Linking, Modal, Platform } from 'react-native';
import * as RN from 'react-native';
const nativeBoundary = { AppState, Linking, Modal, Platform };
const mockRN = new Proxy(RN, { get: (target, key) => key in nativeBoundary ? nativeBoundary[key as keyof typeof nativeBoundary] : Reflect.get(target, key) });
const mockStorage = new Map<string, string>();
let mockRuntime: string | null = '1.5.3', mockPending = false, mockLang = 'en';
let mockReadError = false, mockWriteError = false, mockBrand = false;
let mockTour = { isLoading: false, shouldShowFirstLaunchTour: false, shouldShowOnboardingSetup: false, shouldShowWhatsNew: false };
const mockNavigate = jest.fn(), mockOpen = jest.fn(async (_url: string) => undefined);
const mockReact = React;
const originalDevDescriptor = Object.getOwnPropertyDescriptor(globalThis, '__DEV__');
function setDev(value: boolean) {
  Object.defineProperty(globalThis, '__DEV__', { configurable: true, writable: true, value });
}
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => { if (mockReadError && key.includes('store-update')) throw Error('offline'); return mockStorage.get(key) ?? null; }),
  setItem: jest.fn(async (key: string, value: string) => { if (mockWriteError && key.includes('store-update')) throw Error('full'); mockStorage.set(key, value); }),
}));
jest.mock('expo-updates', () => ({ isEnabled: true, get runtimeVersion() { return mockRuntime; }, useUpdates: () => ({ isUpdatePending: mockPending }) }));
jest.mock('@/contexts/TourContext', () => ({ useTour: () => mockTour }));
jest.mock('@/navigation/brandLaunchIntent', () => ({ useBrandLaunchVisible: () => mockBrand }));
jest.mock('@/contexts/NotificationPreferencesContext', () => ({ useNotificationPreferences: () => ({ isLoading: false, prefs: { dailyVerseEnabled: false }, meta: {}, permissionStatus: 'undetermined', canAskAgain: true }) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock('@/navigation/entryRoutes', () => ({ moreTabTarget: () => ({}) }));
jest.mock('@/widgets/native', () => ({ hasWidgetHost: () => false, readWidgetPayload: jest.fn() }));
jest.mock('@/widgets/contract', () => ({ widgetDateKey: jest.fn(), WIDGET_TIME_ZONE: 'Asia/Kolkata' }));
jest.mock('@/utils/metaAppEvents', () => ({ metaTrackingAvailable: () => false, startMetaAppEvents: async () => undefined }));
jest.mock('../OnboardingSetupSheet', () => 'Setup');
jest.mock('../ReminderOptInModal', () => 'Reminder');
jest.mock('../DailyBhaktiNudge', () => ({ WidgetHowToSheet: 'Widgets' }));
jest.mock('../widgetNudgeStore', () => ({ loadNudgeRecord: async () => undefined, nudgeSnapshot: () => ({}), updateNudge: jest.fn(), startWidgetPinFlow: jest.fn() }));
jest.mock('../dailyBhaktiNudgeView', () => ({ nudgeWidgets: jest.fn(), widgetAddedPatch: jest.fn() }));
jest.mock('@/data/shareLinks', () => ({ APP_STORE_URL: 'https://apps.apple.com/app/id6766086529', PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.prashantsharma.vedansh' }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: require('react-native').View }));
let tree: TestRenderer.ReactTestRenderer | undefined;
const LAUNCH_KEY = '@vedansh/launch-asks-v1';
async function boot(targeted = false) {
  if (tree) await act(async () => tree!.unmount());
  jest.resetModules(); jest.doMock('react', () => mockReact); jest.doMock('react-native', () => mockRN);
  const Host = require('../LaunchAskHost').default;
  await act(async () => { tree = TestRenderer.create(<Host targeted={targeted} />); for (let i = 0; i < 30; i++) await Promise.resolve(); });
  await act(async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); });
}
function shown() { return tree!.root.findAllByProps({ testID: 'store-update-heading' }).length > 0; }
function button(id: string) { return tree!.root.findAllByProps({ testID: id }).find(n => typeof n.props.onPress === 'function')!; }
beforeEach(() => {
  setDev(false);
  jest.useFakeTimers({ now: Date.UTC(2026, 10, 3, 6) });
  mockStorage.clear(); mockRuntime = '1.5.3'; mockPending = false; mockReadError = false; mockWriteError = false; mockBrand = false; mockLang = 'en';
  mockTour = { isLoading: false, shouldShowFirstLaunchTour: false, shouldShowOnboardingSetup: false, shouldShowWhatsNew: false };
  mockStorage.set(LAUNCH_KEY, JSON.stringify({ firstDay: '2026-10-01', lastDay: null, declines: 0, stopped: false }));
  nativeBoundary.Platform.OS = 'android';
  Object.defineProperty(nativeBoundary.AppState, 'currentState', { configurable: true, value: 'active' });
  jest.spyOn(nativeBoundary.Linking, 'openURL').mockImplementation(mockOpen);
  mockOpen.mockReset().mockResolvedValue(undefined); mockNavigate.mockClear();
});
afterEach(async () => {
  if (tree) await act(async () => tree!.unmount());
  tree = undefined;
  if (originalDevDescriptor) Object.defineProperty(globalThis, '__DEV__', originalDevDescriptor);
  else Reflect.deleteProperty(globalThis, '__DEV__');
  jest.restoreAllMocks(); jest.useRealTimers();
});

test('older native runtime claims the real shared slot, Later continues and cooldown survives cold boots', async () => {
  await boot(); expect(shown()).toBe(true);
  expect(JSON.parse(mockStorage.get(LAUNCH_KEY)!).lastDay).toBe('2026-11-03');
  expect(require('../launchAskStore').claimRatingAsk(true)).toBe(false);
  await act(async () => button('store-update-later').props.onPress());
  expect(shown()).toBe(false); expect(mockNavigate).not.toHaveBeenCalled();
  jest.advanceTimersByTime(2 * 86400000); await boot(); expect(shown()).toBe(false);
  jest.advanceTimersByTime(86400000); await boot(); expect(shown()).toBe(true);
});
test.each(['1.5.4', '1.5.5', '1.5.10', null])('%s native runtime never shows', async version => { mockRuntime = version; await boot(); expect(shown()).toBe(false); });
test.each(['target', 'brand', 'whatsNew', 'tour', 'setup', 'pending', 'readError', 'writeError', 'dev'])('%s suppresses the nudge', async reason => {
  if (reason === 'brand') mockBrand = true;
  if (reason === 'whatsNew') mockTour.shouldShowWhatsNew = true;
  if (reason === 'tour') mockTour.shouldShowFirstLaunchTour = true;
  if (reason === 'setup') mockTour.shouldShowOnboardingSetup = true;
  if (reason === 'pending') mockPending = true;
  if (reason === 'readError') mockReadError = true;
  if (reason === 'writeError') mockWriteError = true;
  if (reason === 'dev') setDev(true);
  await boot(reason === 'target'); expect(shown()).toBe(false);
});
test.each(['ios', 'android'] as const)('%s opens the store listing once and dismisses', async platform => {
  nativeBoundary.Platform.OS = platform; await boot(); expect(shown()).toBe(true);
  await act(async () => { const press = button('store-update-now').props.onPress; press(); press(); });
  expect(mockOpen).toHaveBeenCalledTimes(1);
  expect(mockOpen.mock.calls[0][0]).toContain(platform === 'ios' ? 'apps.apple.com' : 'play.google.com');
  expect(shown()).toBe(false);
});
test('failed handoff allows retry or Later; Back is also dismissible', async () => {
  mockOpen.mockRejectedValueOnce(Error('offline')); await boot();
  await act(async () => button('store-update-now').props.onPress());
  expect(shown()).toBe(true); expect(button('store-update-now').props.disabled).toBe(false);
  expect(tree!.root.findAllByProps({ accessibilityRole: 'alert' }).length).toBeGreaterThan(0);
  await act(async () => tree!.root.findByType(nativeBoundary.Modal).props.onRequestClose()); expect(shown()).toBe(false);
});
test.each(['hi', 'en', 'gu', 'kn'])('%s renders translated copy and both reachable controls', async lang => {
  mockLang = lang; await boot(); expect(shown()).toBe(true);
  expect(button('store-update-later').props.accessibilityLabel).toBeTruthy();
  expect(button('store-update-now').props.accessibilityLabel).toBeTruthy();
});
