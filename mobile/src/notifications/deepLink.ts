import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import type { TabParamList } from '@/navigation/types';
import type { NotificationPayload } from './pure';

/**
 * Top-level navigation ref. Used to dispatch from outside React tree
 * (notification taps, deep links). Attach to `<NavigationContainer ref={...}>`.
 */
export const navigationRef = createNavigationContainerRef<TabParamList>();

function isDailyVersePayload(data: unknown): data is NotificationPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === 'daily-verse' &&
    typeof d.sourceId === 'string' &&
    typeof d.verseIndex === 'number'
  );
}

/**
 * Resolve a notification response into a navigation dispatch. Returns true if
 * we recognised the payload and routed; false otherwise.
 *
 * A daily-verse tap always lands on the Daily Bhakti tab rather than deep-
 * linking into the exact verse in a reader. Opening a reader runs that reader's
 * `setProgress` effect, which would overwrite the user's saved reading position
 * ("bookmark"). Landing on Daily Bhakti keeps the reminder lightweight and
 * leaves the resume position untouched.
 *
 * Idempotent and side-effect-light: safe to call even if `navigationRef` isn't
 * ready yet (no-ops in that case so the caller can retry on the next tick).
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): boolean {
  if (!navigationRef.isReady()) return false;
  const data = response.notification.request.content.data;
  if (!isDailyVersePayload(data)) return false;

  navigationRef.dispatch(CommonActions.navigate({ name: 'DailyBhaktiTab' }));
  return true;
}
