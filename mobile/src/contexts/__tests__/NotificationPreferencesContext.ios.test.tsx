import React from 'react';
import { Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleDailyVerseRollingWindow } from '@/notifications/scheduler';
import { NOTIF_PROMPTED_KEY } from '@/notifications/permissionState';
import {
  NotificationPreferencesProvider,
  useNotificationPreferences,
} from '../NotificationPreferencesContext';

// iOS counterpart of NotificationPreferencesContext.test.tsx. iOS reports the
// permission honestly (`undetermined` before the ask, `denied` +
// canAskAgain=false after a refusal), so this suite pins that the effective-
// status mapping is a no-op there: same first-launch ask, same default-on
// outcome, and a refusal lands in the hard-block state that routes to Settings.
Platform.OS = 'ios';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('@/notifications/scheduler', () => ({
  scheduleDailyVerseRollingWindow: jest.fn().mockResolvedValue(0),
  cancelAllDailyVerseNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: 'hi' }),
}));

const mockGet = Notifications.getPermissionsAsync as unknown as jest.Mock;
const mockRequest =
  Notifications.requestPermissionsAsync as unknown as jest.Mock;
const mockSchedule = scheduleDailyVerseRollingWindow as jest.Mock;

type Ctx = ReturnType<typeof useNotificationPreferences>;
let captured!: Ctx;
let mounted: TestRenderer.ReactTestRenderer;
function Probe() {
  captured = useNotificationPreferences();
  return null;
}

async function flush() {
  await act(async () => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
  });
}

async function mountAndHydrate() {
  await act(async () => {
    mounted = TestRenderer.create(
      <NotificationPreferencesProvider>
        <Probe />
      </NotificationPreferencesProvider>,
    );
  });
  await flush();
}

/** What iOS reports before the app has ever asked. */
const IOS_FRESH = { status: 'undetermined', canAskAgain: true };
/** What iOS reports after the user refused — it never re-prompts. */
const IOS_REFUSED = { status: 'denied', canAskAgain: false };

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockGet.mockResolvedValue(IOS_FRESH);
  mockRequest.mockResolvedValue({ status: 'granted', canAskAgain: true });
  mockSchedule.mockResolvedValue(0);
});

afterEach(() => {
  act(() => mounted?.unmount());
});
test('fresh ios launch does not request OS permission or opt into reminders', async () => {
  mockGet.mockResolvedValue({ status: 'undetermined', canAskAgain: true });
  await mountAndHydrate();
  expect(mockRequest).not.toHaveBeenCalled();
  expect(captured.prefs.dailyVerseEnabled).toBe(false);
  expect(captured.prefs.festiveRemindersEnabled).toBe(false);
});
test('one explained enable action grants both reminder toggles with one OS request', async () => {
  await mountAndHydrate();
  await act(async () => {
    await captured.enableReminders();
  });
  expect(mockRequest).toHaveBeenCalledTimes(1);
  expect(captured.prefs.dailyVerseEnabled).toBe(true);
  expect(captured.prefs.festiveRemindersEnabled).toBe(true);
});
test('Not now persists both toggles off even if another feature later gains permission', async () => {
  await mountAndHydrate();
  await act(async () => {
    await captured.declineReminders();
    await captured.requestPermission();
  });
  expect(captured.permissionStatus).toBe('granted');
  expect(captured.prefs.dailyVerseEnabled).toBe(false);
  expect(captured.prefs.festiveRemindersEnabled).toBe(false);
});
test('OS denial keeps both toggles off', async () => {
  mockRequest.mockResolvedValue({ status: 'denied', canAskAgain: false });
  await mountAndHydrate();
  await act(async () => {
    await captured.enableReminders();
  });
  expect(captured.permissionStatus).toBe('denied');
  expect(captured.prefs.dailyVerseEnabled).toBe(false);
  expect(captured.prefs.festiveRemindersEnabled).toBe(false);
  expect(captured.shouldShowOptIn).toBe(false);
});
test('a manual Settings switch-off survives restart as an explicit opt-out', async () => {
  mockGet.mockResolvedValue({ status: 'granted', canAskAgain: false });
  await mountAndHydrate();
  await act(async () => {
    await captured.enableReminders();
    await captured.setDailyVerseEnabled(false);
  });
  expect(captured.meta.optedOutAt).toEqual(expect.any(Number));
  expect(captured.shouldShowOptIn).toBe(false);
  act(() => mounted.unmount());
  await mountAndHydrate();
  expect(captured.meta.optedOutAt).toEqual(expect.any(Number));
});
test('existing saved on preferences remain on without a prompt', async () => {
  await AsyncStorage.setItem(
    '@vedansh/notif-prefs',
    JSON.stringify({
      dailyVerseEnabled: true,
      festiveRemindersEnabled: true,
      times: [{ hour: 8, minute: 15 }],
    }),
  );
  mockGet.mockResolvedValue({ status: 'granted', canAskAgain: false });
  await mountAndHydrate();
  expect(mockRequest).not.toHaveBeenCalled();
  expect(captured.prefs.dailyVerseEnabled).toBe(true);
  expect(captured.prefs.times).toEqual([{ hour: 8, minute: 15 }]);
});
