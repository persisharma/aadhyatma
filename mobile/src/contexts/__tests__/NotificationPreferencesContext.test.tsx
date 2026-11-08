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

// Android is the platform under test. expo-notifications reports a
// never-requested POST_NOTIFICATIONS as `denied` there, which used to (a) skip
// the first-run permission prompt and (b) flip the default-on daily-verse
// toggle off before the user had ever been asked. These tests pin both.
Platform.OS = 'android';

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

/** What Android reports for a permission the app has never requested. */
const ANDROID_NEVER_ASKED = { status: 'denied', canAskAgain: true };

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockGet.mockResolvedValue(ANDROID_NEVER_ASKED);
  mockRequest.mockResolvedValue({ status: 'granted', canAskAgain: false });
  mockSchedule.mockResolvedValue(0);
});

afterEach(() => {
  act(() => mounted?.unmount());
});
test('fresh android launch does not request OS permission or opt into reminders', async () => {
  mockGet.mockResolvedValue({ status: 'denied', canAskAgain: true });
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
