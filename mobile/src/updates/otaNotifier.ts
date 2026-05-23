/**
 * OTA "new content available" notifier.
 *
 * Zero-cost design: no FCM/APNs, no server push. Every OTA bundle ships with
 * a small JSON descriptor (`src/data/otaRelease.json`). When the app boots on
 * a freshly-applied bundle whose descriptor has `notify: true`, we fire a
 * local notification via `expo-notifications`. The fire-once guarantee comes
 * from comparing `Updates.updateId` against an AsyncStorage cursor.
 *
 * The descriptor is bundled per release by `push.sh` (write → publish → revert),
 * so the committed default stays `notify: false`.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

import otaRelease from '@/data/otaRelease.json';
import {
  OTA_NOTIF_IDENTIFIER_PREFIX,
  planOtaReleaseNotification,
  type OtaReleaseMetadata,
} from '@/notifications/pure';

const LAST_NOTIFIED_KEY = '@vedansh/ota-last-notified-update-id';
const OTA_CHANNEL_ID = 'ota-release';

/**
 * Ensure the Android notification channel exists. iOS no-op.
 *
 * Android 8+ requires a channel for any visible notification; without one
 * the OS routes us to a silent fallback. Idempotent — Android dedups by id.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(OTA_CHANNEL_ID, {
      name: 'App updates',
      description: 'New content delivered via over-the-air updates.',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      lightColor: '#B8621B',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } catch {
    // Channel registration is best-effort; without it the notification still
    // fires on the default channel, just with lower priority.
  }
}

/**
 * Best-effort check that fires a local "new content" notification the first
 * time the app boots on a freshly-applied OTA bundle that opted in.
 *
 * Safe to call on every app foreground — idempotent via the updateId cursor.
 * Silently no-ops on dev, when updates are disabled, when permission was
 * never granted, or when the bundled descriptor has `notify: false`.
 */
export async function checkAndNotifyOtaRelease(): Promise<void> {
  if (!Updates.isEnabled) return;

  const metadata = otaRelease as OtaReleaseMetadata;
  const currentUpdateId = Updates.updateId;

  try {
    const lastNotifiedUpdateId = await AsyncStorage.getItem(LAST_NOTIFIED_KEY);

    const plan = planOtaReleaseNotification({
      metadata,
      currentUpdateId,
      lastNotifiedUpdateId,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    });

    if (!plan) {
      // Still record the embedded/first-seen updateId so a later OTA that
      // opts in doesn't try to "catch up" by firing for a bundle the user
      // has already been running silently.
      if (currentUpdateId && currentUpdateId !== lastNotifiedUpdateId) {
        await AsyncStorage.setItem(LAST_NOTIFIED_KEY, currentUpdateId).catch(
          () => undefined
        );
      }
      return;
    }

    // Permission check: don't request, just use what the user has already
    // granted (the daily-verse opt-in handles the ask flow). Denied → silent.
    const perms = await Notifications.getPermissionsAsync();
    if (perms.status !== 'granted') {
      // Still mark as seen so we don't spam them the moment they enable
      // notifications later.
      await AsyncStorage.setItem(LAST_NOTIFIED_KEY, currentUpdateId!).catch(
        () => undefined
      );
      return;
    }

    await ensureAndroidChannel();

    await Notifications.scheduleNotificationAsync({
      identifier: `${OTA_NOTIF_IDENTIFIER_PREFIX}:${currentUpdateId}`,
      content: {
        title: plan.title,
        body: plan.body,
        sound: 'default',
        data: { type: 'ota-release', updateId: currentUpdateId },
      },
      // Use a channel-aware trigger for an immediate delivery on the right
      // Android channel. iOS ignores `channelId` and fires immediately.
      trigger:
        Platform.OS === 'android' ? { channelId: OTA_CHANNEL_ID } : null,
    });

    await AsyncStorage.setItem(LAST_NOTIFIED_KEY, currentUpdateId!).catch(
      () => undefined
    );
  } catch {
    // Non-fatal — OTA notifications are a nicety, not load-bearing.
  }
}

/**
 * Pull a pending OTA bundle in the background. If a new update is available
 * and downloads cleanly, it activates on the NEXT cold start (where
 * `checkAndNotifyOtaRelease` will surface it).
 *
 * Expo applies its own check on launch with the default config, but calling
 * this on foreground lets long-running sessions pick up bundles too.
 */
export async function fetchPendingOtaUpdate(): Promise<void> {
  if (!Updates.isEnabled) return;
  try {
    const check = await Updates.checkForUpdateAsync();
    if (check.isAvailable) {
      await Updates.fetchUpdateAsync();
    }
  } catch {
    // Network / no-update / not-configured all swallowed; we'll retry next foreground.
  }
}
