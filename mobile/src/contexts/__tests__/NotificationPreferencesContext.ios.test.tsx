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
const mockRequest = Notifications.requestPermissionsAsync as unknown as jest.Mock;
const mockSchedule = scheduleDailyVerseRollingWindow as jest.Mock;

type Ctx = ReturnType<typeof useNotificationPreferences>;
let captured!: Ctx;
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
    TestRenderer.create(
      <NotificationPreferencesProvider>
        <Probe />
      </NotificationPreferencesProvider>
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

describe('first install on iOS', () => {
  test('asks on first launch and keeps the default-on reminder when granted', async () => {
    await mountAndHydrate();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(captured.permissionStatus).toBe('granted');
    expect(captured.prefs.dailyVerseEnabled).toBe(true);
    expect(mockSchedule).toHaveBeenCalled();
  });

  test('a refusal lands in the hard-block state and turns the toggle off', async () => {
    mockRequest.mockResolvedValue(IOS_REFUSED);

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('denied');
    expect(captured.canAskAgain).toBe(false);
    expect(captured.prefs.dailyVerseEnabled).toBe(false);
    expect(await AsyncStorage.getItem(NOTIF_PROMPTED_KEY)).toBe('1');
  });

  test('after a refusal the opt-in sheet stays hidden — Enable could never succeed', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    await AsyncStorage.setItem(
      '@vedansh/notif-prefs',
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      '@vedansh/notif-meta',
      JSON.stringify({ appOpenCount: 12, optInPromptShown: false })
    );
    mockGet.mockResolvedValue(IOS_REFUSED);

    await mountAndHydrate();

    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.shouldShowOptIn).toBe(false);
  });
});

describe('later launches on iOS', () => {
  test('an existing grant neither re-prompts nor changes anything', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'granted', canAskAgain: true });

    await mountAndHydrate();

    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.permissionStatus).toBe('granted');
    expect(captured.prefs.dailyVerseEnabled).toBe(true);
  });

  test('revoking in Settings and returning flips the toggle off (foreground path uses the same read)', async () => {
    // Simulated as a cold start after revocation: iOS reports a hard denial.
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue(IOS_REFUSED);

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('denied');
    expect(captured.prefs.dailyVerseEnabled).toBe(false);
  });

  test('a pre-fix iOS install (no prompted flag) is not misread: hard denial stays denied', async () => {
    // Existing iOS users predate NOTIF_PROMPTED_KEY. canAskAgain=false alone
    // must classify their refusal as a real denial — no phantom re-offer.
    mockGet.mockResolvedValue(IOS_REFUSED);
    await AsyncStorage.setItem(
      '@vedansh/notif-prefs',
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      '@vedansh/notif-meta',
      JSON.stringify({ appOpenCount: 12, optInPromptShown: true })
    );

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('denied');
    expect(captured.canAskAgain).toBe(false);
    expect(captured.shouldShowOptIn).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });
});
