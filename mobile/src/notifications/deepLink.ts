import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { panchangTabTarget } from '@/navigation/entryRoutes';
import * as Notifications from 'expo-notifications';
import { findJapamMantra } from '@/data/japam';
import { isJapamAlarmPayload } from './japamAlarms';
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

function isVratReminderPayload(data: unknown): data is { type: 'vrat-reminder'; ruleId: string } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.type === 'vrat-reminder' && typeof d.ruleId === 'string';
}

function isFestiveReminderPayload(
  data: unknown
): data is { type: 'festive-reminder'; ruleId: string } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  // Only `ruleId` gates routing. The payload also carries `sourceId` (the text
  // the message named), but Home re-derives today's content from the date, so
  // routing must not fail on a payload missing it.
  return d.type === 'festive-reminder' && typeof d.ruleId === 'string';
}

function isSadhanaReminderPayload(data: unknown): data is { type: 'sadhana-reminder'; programId: string } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.type === 'sadhana-reminder' && typeof d.programId === 'string';
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
 * The notification's verse identity (`sourceId`/`chapter`/`verseIndex`) is
 * forwarded as params so the tab shows the exact verse the user tapped. We pass
 * the identity baked into the notification rather than re-deriving it on-device,
 * so an OTA pool change between scheduling and tapping can't shift the verse.
 * This stays on the Daily Bhakti tab (not a reader), so reading progress is
 * untouched.
 *
 * Idempotent and side-effect-light: safe to call even if `navigationRef` isn't
 * ready yet (no-ops in that case so the caller can retry on the next tick).
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): boolean {
  if (!navigationRef.isReady()) return false;
  const data = response.notification.request.content.data;

  if (isDailyVersePayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'DailyBhaktiTab',
        params: {
          sourceId: data.sourceId,
          verseIndex: data.verseIndex,
          ...(data.chapter != null ? { chapter: data.chapter } : {}),
        },
      })
    );
    return true;
  }

  // A vrat-reminder tap (PRD-09) deep-links into the observance's detail page,
  // nested inside the Panchang tab's stack.
  if (isVratReminderPayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'PanchangTab',
        // panchangTabTarget carries initial:false so a cold-start deep link
        // can't make ObservanceDetail the lazily-mounted stack's initial route.
        params: panchangTabTarget('ObservanceDetail', { ruleId: data.ruleId }),
      })
    );
    return true;
  }

  // A festive-reminder tap lands on the HOME screen, not on a reader.
  //
  // The reading stays one tap away, because Home's FOR TODAY row leads with the
  // festival's own content on a festival day (`getTodayRecommendationsForDate`
  // reads the same curated catalog the notification's copy came from). Landing
  // here rather than deep in a reader keeps three things true: the reader's
  // `setProgress` effect can't clobber the user's resume position on a tap they
  // may have made from a lock screen (the same reason `daily-verse` above stays
  // on a tab), the day's Panchang/routine context arrives with the reading, and
  // a notification armed up to four months ago can't strand the user on content
  // an OTA update has since renamed — Home recomputes today from today.
  //
  // `{ screen: 'Home' }` is explicit: focusing `HomeTab` alone would restore
  // whatever screen the Home stack was left on, which may be several readers deep.
  if (isFestiveReminderPayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: { screen: 'Home' },
      } as never)
    );
    return true;
  }

  // A sadhana-reminder tap (PRD-11) opens Today's Practice, where the active
  // sankalp's day is shown. Lands on the Home tab's RoutineToday screen; reading
  // progress is untouched (the user chooses to open the day's reading there).
  if (isSadhanaReminderPayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'HomeTab',
        params: { screen: 'RoutineToday' },
      } as never)
    );
    return true;
  }

  // A Japam-alarm tap opens the counter with the mantra preselected and the
  // audio loop auto-started — so a tap on the lock-screen alarm drops the
  // user directly into chanting. The mantraId is validated against the
  // catalogue to survive content revisions (a stale alarm shouldn't crash
  // the screen).
  if (isJapamAlarmPayload(data)) {
    if (findJapamMantra(data.mantraId)) {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'HomeTab',
          params: {
            screen: 'JapamCounter',
            params: { mantraId: data.mantraId, autoPlay: true },
          },
        } as never)
      );
      return true;
    }
    navigationRef.dispatch(
      CommonActions.navigate({ name: 'HomeTab' } as never)
    );
    return false;
  }

  return false;
}
