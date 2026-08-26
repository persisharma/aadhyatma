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

describe('opt-in sheet cadence: every open until confirmed, then 15-day snooze', () => {
  const PREFS_KEY = '@vedansh/notif-prefs';
  const META_KEY = '@vedansh/notif-meta';
  const DAY_MS = 24 * 60 * 60 * 1000;

  /** Festive reminders are off too, so no launch OS ask competes with the
   * sheet — these tests isolate the sheet's own cadence. */
  async function seedOff(meta: Record<string, unknown>) {
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        dailyVerseEnabled: false,
        festiveRemindersEnabled: false,
        times: [{ hour: 7, minute: 0 }],
      })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 12, ...meta })
    );
  }

  test('with no decline on record the sheet asks on every open — optInPromptShown no longer settles it', async () => {
    // Persisted state the pre-fix Android builds left behind: reminder
    // silently flipped off, sheet burned once, OS prompt never shown.
    await seedOff({ optInPromptShown: true });

    await mountAndHydrate();

    expect(mockRequest).not.toHaveBeenCalled();
    expect(captured.permissionStatus).toBe('undetermined');
    expect(captured.shouldShowOptIn).toBe(true);
  });

  test('with festive reminders still on (their default), the OS ask runs first and the sheet follows', async () => {
    // The actual post-update state of a pre-fix Android install: daily verse
    // silently off, festive reminders default-on, permission never answered.
    // Festive drives the launch OS ask; the sheet must not stack on top of it,
    // and once the ask resolves (granted here) it opens to offer daily verse.
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ dailyVerseEnabled: false, times: [{ hour: 7, minute: 0 }] })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 12, optInPromptShown: true })
    );

    await mountAndHydrate();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(captured.permissionStatus).toBe('granted');
    expect(captured.prefs.festiveRemindersEnabled).toBe(true);
    expect(captured.prefs.dailyVerseEnabled).toBe(false);
    expect(captured.shouldShowOptIn).toBe(true);
  });

  test('dismissing the sheet stamps the decline and starts the snooze', async () => {
    await seedOff({ optInPromptShown: true });
    await mountAndHydrate();
    expect(captured.shouldShowOptIn).toBe(true);

    const before = Date.now();
    await act(async () => {
      await captured.markOptInPromptShown();
    });
    await flush();

    expect(captured.shouldShowOptIn).toBe(false);
    const meta = JSON.parse((await AsyncStorage.getItem(META_KEY)) ?? '{}');
    expect(meta.optInPromptShown).toBe(true);
    expect(meta.lastDeclinedAt).toBeGreaterThanOrEqual(before);
  });

  test('a fresh "no" keeps the sheet away…', async () => {
    await seedOff({ optInPromptShown: true, lastDeclinedAt: Date.now() - DAY_MS });

    await mountAndHydrate();

    expect(captured.shouldShowOptIn).toBe(false);
  });

  test('…and it returns once 15 days have passed', async () => {
    await seedOff({ optInPromptShown: true, lastDeclinedAt: Date.now() - 16 * DAY_MS });

    await mountAndHydrate();

    expect(captured.shouldShowOptIn).toBe(true);
  });

  test('an OS-prompt refusal counts as the "no": the flip-off stamps the decline', async () => {
    // Fresh install, launch ask fires, user refuses.
    mockRequest.mockResolvedValue({ status: 'denied', canAskAgain: true });

    await mountAndHydrate();

    expect(captured.prefs.dailyVerseEnabled).toBe(false);
    // Refused seconds ago → snoozed, not re-offered on this open.
    expect(captured.shouldShowOptIn).toBe(false);
    const meta = JSON.parse((await AsyncStorage.getItem(META_KEY)) ?? '{}');
    expect(typeof meta.lastDeclinedAt).toBe('number');
  });

  test('manually switching the reminder off also starts the snooze', async () => {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
    mockGet.mockResolvedValue({ status: 'granted', canAskAgain: true });
    await mountAndHydrate();
    expect(captured.prefs.dailyVerseEnabled).toBe(true);

    await act(async () => {
      await captured.setDailyVerseEnabled(false);
    });
    await flush();

    expect(captured.prefs.dailyVerseEnabled).toBe(false);
    expect(captured.shouldShowOptIn).toBe(false);
    const meta = JSON.parse((await AsyncStorage.getItem(META_KEY)) ?? '{}');
    expect(typeof meta.lastDeclinedAt).toBe('number');
  });

  test('no sheet at all when the OS is hard-blocked — Enable could never succeed', async () => {
    // Android < 13 with notifications switched off in system settings: expo
    // reports denied + canAskAgain=false without the app ever asking.
    await seedOff({ optInPromptShown: false });
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: false });

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('denied');
    expect(captured.canAskAgain).toBe(false);
    expect(captured.shouldShowOptIn).toBe(false);
  });

  test('offers from the very first open — a fresh install with no opens yet', async () => {
    // Festive off too, so no launch OS ask competes and permission stays
    // undetermined; this isolates the open-count gate.
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        dailyVerseEnabled: false,
        festiveRemindersEnabled: false,
        times: [{ hour: 7, minute: 0 }],
      })
    );
    await AsyncStorage.setItem(
      META_KEY,
      JSON.stringify({ appOpenCount: 0, optInPromptShown: false })
    );

    await mountAndHydrate();

    // This mount bumps the count to 1 — the first open — and the sheet offers.
    expect(captured.shouldShowOptIn).toBe(true);
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
