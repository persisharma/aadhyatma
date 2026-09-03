import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { panchangTabTarget } from '@/navigation/entryRoutes';
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
 * Resolve the notification tap that LAUNCHED the app into a cold-start target
 * for `TabNavigator`'s initial route — the same shape a cold widget URL yields.
 *
 * Only the daily verse resolves here, and it resolves to exactly what
 * `handleNotificationResponse` would dispatch for it (the Daily Bhakti tab with
 * the baked verse identity). The difference is timing: App.tsx reads this
 * before `NavigationContainer` mounts, so Daily Bhakti IS the first committed
 * tab. Dispatching the same navigate after mount — the path the live listener
 * still takes for warm taps — commits Home first and only then redirects, and
 * the user watches Home flash by on a tap that never asked for it.
 *
 * The other families land on nested stack screens (`initial: false` routes)
 * whose parent tab is the honest first frame, so they keep the post-mount
 * dispatch. Returns null for anything that is not a well-formed daily verse.
 */
export function coldStartTargetFromNotification(
  response: Notifications.NotificationResponse | null | undefined
): StartTarget | null {
  const data = response?.notification?.request?.content?.data;
  if (!isDailyVersePayload(data)) return null;
  return {
    kind: 'verse',
    sourceId: data.sourceId,
    verseIndex: data.verseIndex,
    ...(data.chapter != null ? { chapter: data.chapter } : {}),
  };
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

  // A muhurat-reminder tap (PRD-16 §6.7) opens the followed day's detail —
  // the screen that carries the window the notification just named, plus the
  // reasoning behind it. Nested in the Panchang stack like the vrat route, and
  // `panchangTabTarget` carries initial:false so a cold-start tap cannot make
  // MuhuratDayDetail the lazily-mounted stack's initial route.
  //
  // The date rides the payload rather than being re-derived from "today": a
  // notice armed days ago names ONE specific muhurat, and an advance notice is
  // by definition read on a different day than the one it points at.
  if (isMuhuratReminderPayload(data)) {
    // Validate the occasion against EVENT_RULES the same way the japam route
    // validates its mantra: a notice armed months ago must not open a screen
    // for an occasion a later release retired.
    const known = EVENT_RULES.find((r) => r.id === data.occasionId);
    if (known) {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'PanchangTab',
          params: panchangTabTarget('MuhuratDayDetail', {
            occasionId: known.id,
            dateMs: data.dateMs,
          }),
        })
      );
      return true;
    }
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

  if (isPitruSmaranReminderPayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MoreTab',
        params: { screen: 'PitruSmaranDetail', params: { entryId: data.entryId }, initial: false },
      } as never)
    );
    return true;
  }

  // A janma-tithi tap (PRD-29) opens that person's detail in the More stack —
  // the screen carrying this year's date and the day's practice. The person id
  // is validated by the screen itself (a removed person renders its own
  // not-found state), so a stale notice cannot crash a route.
  if (isJanmaTithiReminderPayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MoreTab',
        params: { screen: 'JanmaTithiDetail', params: { personId: data.personId }, initial: false },
      } as never)
    );
    return true;
  }

  if (isPitruPakshaReminderPayload(data)) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'MoreTab',
        params: { screen: 'PitruPakshaOverview', initial: false },
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

  // A routine-reminder tap (PRD-07 P3) lands on Today's Practice — byte-for-
  // byte the sadhana-reminder landing, and for the same reasons: RoutineToday
  // is where all of today's practice lives (this routine, other routines,
  // active sankalps), and a lock-screen tap must never open a reader whose
  // `setProgress` effect could clobber the resume position.
  if (isRoutineReminderPayload(data)) {
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
