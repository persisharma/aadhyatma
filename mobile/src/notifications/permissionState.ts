/**
 * Shared OS notification-permission state for every reminder feature.
 *
 * Android is why this module exists. `Notifications.getPermissionsAsync()`
 * never reports `undetermined` there: for a `POST_NOTIFICATIONS` permission the
 * app has never requested, expo-notifications resolves
 * `{ status: 'denied', canAskAgain: true }` — it derives the status from
 * `NotificationManagerCompat.areNotificationsEnabled()`, which stays false
 * until the runtime permission is granted. So on Android a fresh install and a
 * refusal look identical if you read `status` alone, and treating a fresh
 * install as a refusal is exactly what left reminders off by default and
 * skipped the first-run prompt.
 *
 * Two signals disambiguate it:
 *  - `canAskAgain === false` — the OS will not show its prompt again, so
 *    Settings is the only path. That is a genuine hard denial on both
 *    platforms (and on Android < 13, where there is no runtime prompt at all).
 *  - whether *we* ever showed the OS prompt — persisted here under one
 *    app-wide key, because the permission itself is app-wide: daily-verse
 *    reminders and japam alarms share it, and whichever asks first answers the
 *    question for both.
 *
 * iOS behaviour is unchanged by the mapping: it reports `undetermined` before
 * the ask and `denied` + `canAskAgain: false` after a refusal.
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type NotificationPermissionState = {
  /** Effective status: `denied` only when the user has actually refused. */
  status: PermissionStatus;
  /** Can the OS prompt still be shown? `false` ⇒ Settings is the only path. */
  canAskAgain: boolean;
};

/** Raw shape we care about from `expo-notifications`' permission response. */
export type RawPermissionResponse = {
  status?: string;
  canAskAgain?: boolean;
};

/** App-wide "we have shown the OS notification prompt at least once" flag. */
export const NOTIF_PROMPTED_KEY = '@vedansh/notif-permission-asked';

const UNKNOWN: NotificationPermissionState = {
  status: 'undetermined',
  canAskAgain: true,
};

/**
 * Map a raw permission response onto the effective state, given whether this
 * app has ever put the OS prompt on screen.
 *
 * Pure — the platform quirks it encodes are covered by unit tests.
 */
export function resolveNotificationPermission(
  raw: RawPermissionResponse | null | undefined,
  hasPrompted: boolean
): NotificationPermissionState {
  if (!raw) return UNKNOWN;
  const canAskAgain = raw.canAskAgain !== false;
  if (raw.status === 'granted') return { status: 'granted', canAskAgain: true };
  // No prompt left to show — Settings is the only remaining path, on either
  // platform. This is the one case that is unambiguously a hard block.
  if (!canAskAgain) return { status: 'denied', canAskAgain: false };
  if (raw.status !== 'denied') return { status: 'undetermined', canAskAgain: true };
  // `denied` + askable: a refusal only if we have actually asked. Otherwise
  // this is Android reporting a never-requested permission (see file header).
  return { status: hasPrompted ? 'denied' : 'undetermined', canAskAgain: true };
}

/** Has the app ever shown the OS notification prompt? */
export async function hasPromptedForNotifications(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(NOTIF_PROMPTED_KEY)) === '1';
  } catch {
    return false;
  }
}

async function markPromptedForNotifications(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');
  } catch {
    // Non-fatal: worst case we offer the prompt once more on a later launch.
  }
}

/** Read the current effective permission state. Never throws. */
export async function readNotificationPermissionState(): Promise<NotificationPermissionState> {
  try {
    const [raw, hasPrompted] = await Promise.all([
      Notifications.getPermissionsAsync(),
      hasPromptedForNotifications(),
    ]);
    return resolveNotificationPermission(raw as RawPermissionResponse, hasPrompted);
  } catch {
    return UNKNOWN;
  }
}

/**
 * Show the OS permission prompt and return the resulting state.
 *
 * Records that we asked, so a later `denied` read is understood as a refusal
 * rather than a never-requested Android permission. The flag is written only
 * after the request resolves, so a thrown call doesn't burn the first ask.
 */
export async function requestNotificationPermission(
  options: Notifications.NotificationPermissionsRequest = {
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  }
): Promise<NotificationPermissionState> {
  try {
    const raw = await Notifications.requestPermissionsAsync(options);
    await markPromptedForNotifications();
    return resolveNotificationPermission(raw as RawPermissionResponse, true);
  } catch {
    return UNKNOWN;
  }
}
