import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { moreTabTarget, panchangTabTarget } from '@/navigation/entryRoutes';
import * as Notifications from 'expo-notifications';
import { findJapamMantra } from '@/data/japam';
import { EVENT_RULES } from '@/panchang/eventMuhurat';
import { isJapamAlarmPayload } from './japamAlarms';
import type { TabParamList } from '@/navigation/types';
import type { StartTarget } from '@/navigation/startTarget';
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

function isMuhuratReminderPayload(
  data: unknown
): data is { type: 'muhurat-reminder'; occasionId: string; dateMs: number } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === 'muhurat-reminder' &&
    typeof d.occasionId === 'string' &&
    typeof d.dateMs === 'number' &&
    Number.isFinite(d.dateMs)
  );
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

function isRoutineReminderPayload(data: unknown): data is { type: 'routine-reminder' } {
  if (!data || typeof data !== 'object') return false;
  // Gated on `type` only. `routineId`/`dateKey` ride along as a record but must
  // not drive routing: a stale notification for a since-deleted routine still
  // lands safely on RoutineToday, which simply doesn't show it.
  return (data as Record<string, unknown>).type === 'routine-reminder';
}

function isPitruSmaranReminderPayload(data: unknown): data is { type: 'pitru-smaran-reminder'; entryId: string } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.type === 'pitru-smaran-reminder' && typeof d.entryId === 'string';
}

function isPitruPakshaReminderPayload(data: unknown): data is { type: 'pitru-paksha-reminder' } {
  return Boolean(data && typeof data === 'object' && (data as Record<string, unknown>).type === 'pitru-paksha-reminder');
}

function isJanmaTithiReminderPayload(data: unknown): data is { type: 'janma-tithi-reminder'; personId: string } {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return d.type === 'janma-tithi-reminder' && typeof d.personId === 'string';
}

/**
 * Resolve a notification payload to the screen it names — the ONE routing
 * table for every family, shared by the cold-start path (the target becomes
 * `TabNavigator`'s initial route, see `navigation/startTarget.ts`) and the warm
 * path (`handleNotificationResponse` dispatches the same object). Returns null
 * for anything unrecognised or invalid, which on a cold start means the
 * ordinary Home launch.
 *
 * Every landing is a tab or a nested stack screen, never a reader. Opening a
 * reader runs its `setProgress` effect, which would overwrite the user's saved
 * reading position ("bookmark") on a tap they may have made from a lock screen.
 */
export function resolveNotificationTarget(data: unknown): StartTarget | null {
  // The Daily Bhakti tab shows the exact verse the user tapped. We forward the
  // identity (`sourceId`/`chapter`/`verseIndex`) baked into the notification
  // rather than re-deriving it on-device, so an OTA pool change between
  // scheduling and tapping can't shift the verse.
  if (isDailyVersePayload(data)) {
    return {
      name: 'DailyBhaktiTab',
      params: {
        sourceId: data.sourceId,
        verseIndex: data.verseIndex,
        ...(data.chapter != null ? { chapter: data.chapter } : {}),
      },
    };
  }

  // A vrat-reminder tap (PRD-09) deep-links into the observance's detail page,
  // nested inside the Panchang tab's stack. panchangTabTarget carries
  // initial:false so a cold-start deep link can't make ObservanceDetail the
  // lazily-mounted stack's initial route (back would have nothing to pop).
  if (isVratReminderPayload(data)) {
    return { name: 'PanchangTab', params: panchangTabTarget('ObservanceDetail', { ruleId: data.ruleId }) };
  }

  // A muhurat-reminder tap (PRD-16 §6.7) opens the followed day's detail —
  // the screen that carries the window the notification just named, plus the
  // reasoning behind it. The date rides the payload rather than being
  // re-derived from "today": a notice armed days ago names ONE specific
  // muhurat, and an advance notice is by definition read on a different day
  // than the one it points at. The occasion is validated against EVENT_RULES
  // the same way the japam route validates its mantra: a notice armed months
  // ago must not open a screen for an occasion a later release retired.
  if (isMuhuratReminderPayload(data)) {
    const known = EVENT_RULES.find((r) => r.id === data.occasionId);
    if (!known) return null;
    return {
      name: 'PanchangTab',
      params: panchangTabTarget('MuhuratDayDetail', { occasionId: known.id, dateMs: data.dateMs }),
    };
  }

  // A festive-reminder tap lands on the HOME screen, not on a reader.
  //
  // The reading stays one tap away, because Home's FOR TODAY row leads with the
  // festival's own content on a festival day (`getTodayRecommendationsForDate`
  // reads the same curated catalog the notification's copy came from). Landing
  // here keeps the day's Panchang/routine context alongside the reading, and a
  // notification armed up to four months ago can't strand the user on content
  // an OTA update has since renamed — Home recomputes today from today.
  //
  // `{ screen: 'Home' }` is explicit: focusing `HomeTab` alone would restore
  // whatever screen the Home stack was left on, which may be several readers deep.
  if (isFestiveReminderPayload(data)) {
    return { name: 'HomeTab', params: { screen: 'Home' } };
  }

  if (isPitruSmaranReminderPayload(data)) {
    return { name: 'MoreTab', params: moreTabTarget('PitruSmaranDetail', { entryId: data.entryId }) };
  }

  // A janma-tithi tap (PRD-29) opens that person's detail in the More stack —
  // the screen carrying this year's date and the day's practice. The person id
  // is validated by the screen itself (a removed person renders its own
  // not-found state), so a stale notice cannot crash a route.
  if (isJanmaTithiReminderPayload(data)) {
    return { name: 'MoreTab', params: moreTabTarget('JanmaTithiDetail', { personId: data.personId }) };
  }

  if (isPitruPakshaReminderPayload(data)) {
    return { name: 'MoreTab', params: moreTabTarget('PitruPakshaOverview') };
  }

  // A sadhana-reminder tap (PRD-11) and a routine-reminder tap (PRD-07 P3)
  // both open Today's Practice — where all of today's practice lives (this
  // routine, other routines, active sankalps). Reading progress is untouched;
  // the user chooses to open the day's reading there.
  if (isSadhanaReminderPayload(data) || isRoutineReminderPayload(data)) {
    return { name: 'HomeTab', params: { screen: 'RoutineToday' } };
  }

  // A Japam-alarm tap opens the counter with the mantra preselected and the
  // audio loop auto-started — so a tap on the lock-screen alarm drops the
  // user directly into chanting. The mantraId is validated against the
  // catalogue to survive content revisions (a stale alarm shouldn't crash
  // the screen); an unknown mantra resolves to nothing, i.e. plain Home.
  if (isJapamAlarmPayload(data) && findJapamMantra(data.mantraId)) {
    return {
      name: 'HomeTab',
      params: { screen: 'JapamCounter', params: { mantraId: data.mantraId, autoPlay: true } },
    };
  }

  return null;
}

/**
 * The notification tap that LAUNCHED the app, as `TabNavigator`'s initial
 * route. Same table as the warm path, read by App.tsx before
 * `NavigationContainer` mounts so the named screen is the first one committed.
 */
export function startTargetFromNotification(
  response: Notifications.NotificationResponse | null | undefined
): StartTarget | null {
  return resolveNotificationTarget(response?.notification?.request?.content?.data);
}

/**
 * Resolve a notification response into a navigation dispatch. Returns true if
 * we recognised the payload and routed; false otherwise.
 *
 * Idempotent and side-effect-light: safe to call even if `navigationRef` isn't
 * ready yet (no-ops in that case so the caller can retry on the next tick).
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): boolean {
  if (!navigationRef.isReady()) return false;
  const data = response.notification.request.content.data;

  const target = resolveNotificationTarget(data);
  if (target) {
    navigationRef.dispatch(CommonActions.navigate(target));
    return true;
  }

  // A japam alarm whose mantra no longer exists still deserves a landing —
  // Home — but is reported as unhandled so callers can tell it was stale.
  if (isJapamAlarmPayload(data)) {
    navigationRef.dispatch(CommonActions.navigate({ name: 'HomeTab' }));
  }
  return false;
}
