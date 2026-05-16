import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { buildProgressTarget } from '@/navigation/entryRoutes';
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
 * we successfully routed; false if the payload was unrecognised or the route
 * helper couldn't build a target.
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

  const target = buildProgressTarget({
    sourceId: data.sourceId,
    chapter: data.chapter,
    verseIndex: data.verseIndex,
  });

  if (!target) {
    // Routing helper rejected — fall back to the Daily Bhakti tab so the tap
    // is never a silent no-op.
    navigationRef.dispatch(
      CommonActions.navigate({ name: 'DailyBhaktiTab' })
    );
    return false;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'HomeTab',
      params: {
        screen: target.screen,
        params: target.params,
      },
    } as never)
  );
  return true;
}
