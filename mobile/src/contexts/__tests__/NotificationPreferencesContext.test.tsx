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

/** What Android reports for a permission the app has never requested. */
const ANDROID_NEVER_ASKED = { status: 'denied', canAskAgain: true };

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockGet.mockResolvedValue(ANDROID_NEVER_ASKED);
  mockRequest.mockResolvedValue({ status: 'granted', canAskAgain: false });
  mockSchedule.mockResolvedValue(0);
});

describe('first install on Android', () => {
  test('asks for notification permission on first launch', async () => {
    await mountAndHydrate();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(captured.permissionStatus).toBe('granted');
  });

  test('keeps the daily verse on and schedules it once permission is granted', async () => {
    await mountAndHydrate();

    expect(captured.prefs.dailyVerseEnabled).toBe(true);
    expect(mockSchedule).toHaveBeenCalled();
    const [config] = mockSchedule.mock.calls[mockSchedule.mock.calls.length - 1];
    expect(config).toEqual({ enabled: true, times: [{ hour: 7, minute: 0 }] });
  });

  test('does not report "denied" before the user has answered the prompt', async () => {
    // The prompt is left unanswered (dismissed without a choice).
    mockRequest.mockResolvedValue(ANDROID_NEVER_ASKED);
    await mountAndHydrate();

    // We asked, so this launch reflects the refusal — but the pre-ask read
    // that drove the request must not have been a denial.
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(await AsyncStorage.getItem(NOTIF_PROMPTED_KEY)).toBe('1');
  });
});

describe('after the user has answered', () => {
  test('a refusal turns the toggle off and does not re-prompt on the next launch', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: true });

    await mountAndHydrate();

    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.permissionStatus).toBe('denied');
    expect(captured.prefs.dailyVerseEnabled).toBe(false);
    // Still askable, so the UI can offer the prompt again rather than Settings.
    expect(captured.canAskAgain).toBe(true);
  });

  test('a hard block (canAskAgain=false) reports denied and points at Settings', async () => {
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: false });

    await mountAndHydrate();

    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.permissionStatus).toBe('denied');
    expect(captured.canAskAgain).toBe(false);
    expect(captured.prefs.dailyVerseEnabled).toBe(false);
  });

  test('an already-granted permission neither prompts nor disables', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'granted', canAskAgain: false });

    await mountAndHydrate();

    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.permissionStatus).toBe('granted');
    expect(captured.prefs.dailyVerseEnabled).toBe(true);
  });
});

describe('opt-in sheet re-offer for unanswered installs', () => {
  const PREFS_KEY = '@vedansh/notif-prefs';
  const META_KEY = '@vedansh/notif-meta';

  /** Persisted state the pre-fix Android builds left behind: reminder silently
   * flipped off, sheet already dismissed once, OS prompt never actually shown. */
  async function seedAffectedInstall() {
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 12, optInPromptShown: true })
    );
  }

  test('re-offers the sheet when the OS permission was never answered', async () => {
    await seedAffectedInstall();

    await mountAndHydrate();

    // No auto-prompt (reminder is off), but the sheet comes back once.
    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.permissionStatus).toBe('undetermined');
    expect(captured.shouldShowOptIn).toBe(true);
  });

  test('the re-offer happens once: dismissing it settles both flags', async () => {
    await seedAffectedInstall();
    await mountAndHydrate();
    expect(captured.shouldShowOptIn).toBe(true);

    await act(async () => {
      await captured.markOptInPromptShown();
    });
    await flush();

    expect(captured.shouldShowOptIn).toBe(false);
    const meta = JSON.parse((await AsyncStorage.getItem(META_KEY)) ?? '{}');
    expect(meta.optInPromptShown).toBe(true);
    expect(meta.optInReofferShown).toBe(true);
  });

  test('no re-offer once the user has actually answered the OS prompt', async () => {
    await seedAffectedInstall();
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: true });

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('denied');
    expect(captured.shouldShowOptIn).toBe(false);
  });

  test('no re-offer when a stored optInReofferShown flag says it already ran', async () => {
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 12, optInPromptShown: true, optInReofferShown: true })
    );

    await mountAndHydrate();

    expect(captured.shouldShowOptIn).toBe(false);
  });

  test('no sheet at all when the OS is hard-blocked — Enable could never succeed', async () => {
    // Android < 13 with notifications switched off in system settings: expo
    // reports denied + canAskAgain=false without the app ever asking.
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 12, optInPromptShown: false })
    );
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: false });

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('denied');
    expect(captured.canAskAgain).toBe(false);
    expect(captured.shouldShowOptIn).toBe(false);
  });

  test('first-offer path is untouched: fresh meta still gates on the third open', async () => {
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 1, optInPromptShown: false })
    );

    await mountAndHydrate();

    // This mount bumps the count to 2 — still below the third-open gate.
    expect(captured.shouldShowOptIn).toBe(false);
  });
});

describe('user-driven toggle', () => {
  test('turning the toggle back on re-asks and enables when granted', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: true });
    await mountAndHydrate();
    expect(captured.prefs.dailyVerseEnabled).toBe(false);

    mockRequest.mockResolvedValue({ status: 'granted', canAskAgain: false });
    await act(async () => {
      await captured.setDailyVerseEnabled(true);
    });
    await flush();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(captured.permissionStatus).toBe('granted');
    expect(captured.prefs.dailyVerseEnabled).toBe(true);
  });

  test('the toggle bounces back when the re-ask is refused', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: true });
    await mountAndHydrate();

    mockRequest.mockResolvedValue({ status: 'denied', canAskAgain: false });
    await act(async () => {
      await captured.setDailyVerseEnabled(true);
    });
    await flush();

    expect(captured.prefs.dailyVerseEnabled).toBe(false);
    expect(captured.canAskAgain).toBe(false);
  });
});
