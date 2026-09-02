import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  cancelAllDailyVerseNotifications,
  scheduleDailyVerseRollingWindow,
} from '@/notifications/scheduler';
import { MAX_REMINDER_TIMES, type TimeOfDay } from '@/notifications/pure';
import type { DayAngaMap } from '@/notifications/dayAnga';
import {
  readNotificationPermissionState,
  requestNotificationPermission,
  type NotificationPermissionState,
  type PermissionStatus,
} from '@/notifications/permissionState';
import { useGitaLanguage } from '@/data/gita/language';

const PREFS_KEY = '@vedansh/notif-prefs';
const META_KEY = '@vedansh/notif-meta';

export type { PermissionStatus };

export type NotificationPreferences = {
  dailyVerseEnabled: boolean;
  /** One or more daily reminder times, sorted by hour:minute. */
  times: TimeOfDay[];
  /**
   * Festive reminders — one morning notification on each famous festival in
   * `notifications/festiveReminders.ts`. Default ON: it needs no setup and rides
   * the daily-verse permission grant. Armed by `<FestiveReminderScheduler>`.
   */
  festiveRemindersEnabled: boolean;
};

type NotificationMeta = {
  appOpenCount: number;
  optInPromptShown: boolean;
  /**
   * When the user last said "no" to reminders, epoch ms — an OS-prompt
   * refusal, a "Not now" on the opt-in sheet, or switching the toggle off.
   * Drives the re-offer cadence: until a yes-or-no exists the sheet asks on
   * every open, and after a no it returns once the 15-day snooze elapses.
   * `null` = no decline on record (fresh installs, and every pre-cadence
   * install — deliberately, so users the old Android bug silently opted out
   * get their first re-offer on the launch after updating).
   */
  lastDeclinedAt: number | null;
};

const DEFAULTS: NotificationPreferences = {
  dailyVerseEnabled: true,
  times: [{ hour: 7, minute: 0 }],
  festiveRemindersEnabled: true,
};

const META_DEFAULTS: NotificationMeta = {
  appOpenCount: 0,
  optInPromptShown: false,
  lastDeclinedAt: null,
};

/**
 * How long a "no" silences the opt-in sheet. After an OS-prompt refusal, a
 * "Not now", or a manual toggle-off, the sheet returns once this has elapsed
 * — each further "no" restarts the clock.
 */
export const OPT_IN_REOFFER_SNOOZE_DAYS = 15;
const OPT_IN_REOFFER_SNOOZE_MS = OPT_IN_REOFFER_SNOOZE_DAYS * 24 * 60 * 60 * 1000;

type NotificationPreferencesContextValue = {
  prefs: NotificationPreferences;
  meta: NotificationMeta;
  permissionStatus: PermissionStatus;
  /**
   * Can the OS prompt still be shown? `false` means the only way back is the
   * system Settings app — the UI must say so instead of offering an ask that
   * will never appear.
   */
  canAskAgain: boolean;
  isLoading: boolean;
  /** Should the first-run opt-in sheet be shown right now? */
  shouldShowOptIn: boolean;
  /** Toggle daily verse on/off. When turning on, also requests permission. */
  setDailyVerseEnabled: (enabled: boolean) => Promise<void>;
  /** Toggle festive reminders on/off. When turning on, also requests permission. */
  setFestiveRemindersEnabled: (enabled: boolean) => Promise<void>;
  /** Replace the full set of reminder times. The list is normalised (sorted,
   * deduped, capped at MAX_REMINDER_TIMES) before being persisted. */
  setTimes: (times: TimeOfDay[]) => Promise<void>;
  /** Record that the user dismissed (or accepted) the first-run opt-in sheet. */
  markOptInPromptShown: () => Promise<void>;
  /** Ask the OS for notification permission. Returns the new status. */
  requestPermission: () => Promise<PermissionStatus>;
  /**
   * Publish the panchang context (tithi / vrat) used for notification titles.
   *
   * This provider sits ABOVE `PanchangLocationProvider` in the tree, so it cannot
   * read the user's panchang location itself. `<DailyVerseAngaBridge />` mounts
   * below both, resolves the window, and pushes the result up here — the same
   * headless-component pattern `VratReminderScheduler` uses.
   *
   * `key` identifies the inputs the map was resolved for; republishing an
   * identical key is ignored, so this can never drive a reschedule loop.
   */
  publishDayAngas: (key: string, map: DayAngaMap) => void;
};

const NotificationPreferencesContext =
  createContext<NotificationPreferencesContextValue | null>(null);

function isTimeOfDay(v: unknown): v is TimeOfDay {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as { hour: unknown }).hour === 'number' &&
    typeof (v as { minute: unknown }).minute === 'number' &&
    (v as TimeOfDay).hour >= 0 &&
    (v as TimeOfDay).hour < 24 &&
    (v as TimeOfDay).minute >= 0 &&
    (v as TimeOfDay).minute < 60
  );
}

function normaliseTimes(times: TimeOfDay[]): TimeOfDay[] {
  const out = times.map((t) => ({ hour: t.hour, minute: t.minute }));
  out.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  // Drop duplicate hour:minute entries before capping so two identical times
  // can never occupy two of the limited slots, and the visible list always
  // matches the (already deduped) set of scheduled notifications.
  return deduplicateTimes(out).slice(0, MAX_REMINDER_TIMES);
}

function deduplicateTimes(times: TimeOfDay[]): TimeOfDay[] {
  const seen = new Set<number>();
  const out: TimeOfDay[] = [];
  for (const t of times) {
    const key = t.hour * 60 + t.minute;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function parsePrefs(raw: string | null): NotificationPreferences {
  if (!raw) return DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences> & {
      time?: unknown;
    };
    // Migrate from the previous single-time shape (`time`) — early users had
    // exactly one reminder configured before this screen supported many.
    const rawTimes: unknown[] = Array.isArray(parsed.times)
      ? parsed.times
      : isTimeOfDay(parsed.time)
        ? [parsed.time]
        : [];
    const validTimes = rawTimes.filter(isTimeOfDay);
    const times =
      validTimes.length > 0 ? normaliseTimes(validTimes) : DEFAULTS.times;
    return {
      dailyVerseEnabled:
        typeof parsed.dailyVerseEnabled === 'boolean'
          ? parsed.dailyVerseEnabled
          : DEFAULTS.dailyVerseEnabled,
      times,
      // Absent key = a user who upgraded from before festive reminders existed.
      // They fall to the default (on), which is the same treatment a fresh
      // install gets — the feature ships enabled, not opted into.
      festiveRemindersEnabled:
        typeof parsed.festiveRemindersEnabled === 'boolean'
          ? parsed.festiveRemindersEnabled
          : DEFAULTS.festiveRemindersEnabled,
    };
  } catch {
    return DEFAULTS;
  }
}

function parseMeta(raw: string | null): NotificationMeta {
  if (!raw) return META_DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationMeta>;
    return {
      appOpenCount:
        typeof parsed.appOpenCount === 'number' && parsed.appOpenCount >= 0
          ? parsed.appOpenCount
          : META_DEFAULTS.appOpenCount,
      optInPromptShown:
        typeof parsed.optInPromptShown === 'boolean'
          ? parsed.optInPromptShown
          : META_DEFAULTS.optInPromptShown,
      // Absent on every pre-cadence install by design: a missing decline
      // reads as "snooze already over", so the sheet re-offers on the first
      // launch after updating and the normal 15-day cadence takes it from there.
      lastDeclinedAt:
        typeof parsed.lastDeclinedAt === 'number' &&
        Number.isFinite(parsed.lastDeclinedAt) &&
        parsed.lastDeclinedAt > 0
          ? parsed.lastDeclinedAt
          : META_DEFAULTS.lastDeclinedAt,
    };
  } catch {
    return META_DEFAULTS;
  }
}

const UNKNOWN_PERMISSION: NotificationPermissionState = {
  status: 'undetermined',
  canAskAgain: true,
};

function samePermission(
  a: NotificationPermissionState,
  b: NotificationPermissionState
): boolean {
  return a.status === b.status && a.canAskAgain === b.canAskAgain;
}

export function NotificationPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang } = useGitaLanguage();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [meta, setMeta] = useState<NotificationMeta>(META_DEFAULTS);
  const [permission, setPermission] =
    useState<NotificationPermissionState>(UNKNOWN_PERMISSION);
  const permissionStatus = permission.status;
  const [isLoading, setIsLoading] = useState(true);
  // Panchang context for notification titles, pushed up by <DailyVerseAngaBridge />.
  // Starts empty: the first reconcile schedules plain titles and the bridge's
  // publish reschedules them with panchang. That extra pass costs one more
  // cancel+reschedule at cold start — the same work this effect already does on
  // every foreground — which is cheaper than gating the whole schedule on an
  // astronomy solve that may never arrive (e.g. the bridge isn't mounted in tests).
  const [dayAngas, setDayAngas] = useState<DayAngaMap>({});
  const dayAngaKeyRef = useRef<string | null>(null);
  /** Tracks whether we've already bumped the app-open count for this mount. */
  const openCountBumpedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [foregroundTick, setForegroundTick] = useState(0);
  // Mirror of the latest prefs/meta so updater-style writes don't read stale
  // state from a setter's closure. Without this, two writes in the same tick
  // (e.g. setTimes + setDailyVerseEnabled from the opt-in modal) clobber each
  // other and the saved time silently reverts to the previous value.
  const prefsRef = useRef<NotificationPreferences>(DEFAULTS);
  const metaRef = useRef<NotificationMeta>(META_DEFAULTS);

  // Hydrate on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prefsRaw, metaRaw, state] = await Promise.all([
          AsyncStorage.getItem(PREFS_KEY),
          AsyncStorage.getItem(META_KEY),
          readNotificationPermissionState(),
        ]);
        if (cancelled) return;
        const loadedPrefs = parsePrefs(prefsRaw);
        const loadedMeta = parseMeta(metaRaw);
        prefsRef.current = loadedPrefs;
        metaRef.current = loadedMeta;
        setPrefs(loadedPrefs);
        setMeta(loadedMeta);
        setPermission(state);
        setIsLoading(false);

        // Bump app-open count for this cold start exactly once. We cap at a
        // safe upper bound so we don't grow this number indefinitely.
        if (!openCountBumpedRef.current) {
          openCountBumpedRef.current = true;
          const next = Math.min(loadedMeta.appOpenCount + 1, 9999);
          if (next !== loadedMeta.appOpenCount) {
            const updated = { ...loadedMeta, appOpenCount: next };
            metaRef.current = updated;
            setMeta(updated);
            AsyncStorage.setItem(META_KEY, JSON.stringify(updated)).catch(() => undefined);
          }
        }

        // The daily-verse and festive toggles default to ON, but a fresh
        // install has not been granted notification permission yet, so the
        // reconciliation effects below would silently cancel everything. Ask
        // on EVERY launch that finds the permission still unanswered (this
        // effect runs each cold start), so the default-on behaviour actually
        // fires — per product rule, the ask repeats until the user confirms a
        // yes or a no. One grant covers every notification family (§38).
        //
        // `status === 'undetermined'` here means "never answered" on BOTH
        // platforms — `readNotificationPermissionState()` folds Android's
        // "denied because never requested" into it (see permissionState.ts).
        // Reading expo's raw status instead is what used to skip this ask
        // entirely on Android and leave reminders off out of the box.
        //
        // `requestNotificationPermission()` records the ask, so a refusal
        // resolves as `denied` from the next launch on and this stops firing;
        // the refusal also flips the toggles off below, which stamps
        // `lastDeclinedAt` and hands the follow-up to the opt-in sheet's
        // 15-day re-offer cadence.
        if (
          (loadedPrefs.dailyVerseEnabled || loadedPrefs.festiveRemindersEnabled) &&
          state.status === 'undetermined' &&
          state.canAskAgain
        ) {
          const requested = await requestNotificationPermission();
          if (cancelled) return;
          setPermission((cur) => (samePermission(cur, requested) ? cur : requested));
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reconcile the OS notification schedule whenever prefs change, permission
  // changes, or the app returns to foreground (foregroundTick advances dates).
  // Single scheduling path eliminates the race where two concurrent calls to
  // scheduleDailyVerseRollingWindow cancel each other's work.
  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    (async () => {
      if (prefs.dailyVerseEnabled && permissionStatus === 'granted') {
        await scheduleDailyVerseRollingWindow(
          { enabled: true, times: prefs.times },
          new Date(),
          lang,
          dayAngas
        ).catch(() => undefined);
      } else {
        await cancelAllDailyVerseNotifications().catch(() => undefined);
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // `lang` is included so changing the reading language reschedules the queued
    // notifications into the new language (they're built ahead of time). `dayAngas`
    // for the same reason: titles carry the fire day's tithi/vrat, so a new
    // resolution (first solve, location switch, day rollover) must rewrite them.
    // Depends on the two daily-verse fields rather than the whole `prefs` object,
    // so toggling an unrelated pref (festive reminders) can't trigger a pointless
    // cancel-and-reschedule of the whole 30-day window.
  }, [
    isLoading,
    prefs.dailyVerseEnabled,
    prefs.times,
    permissionStatus,
    foregroundTick,
    lang,
    dayAngas,
  ]);

  // Keep the toggle honest: `enabled=true` with a `denied` OS permission is
  // an inconsistent state — reminders can't fire, so the UI must not claim
  // they're on. `denied` here is the *effective* status, so a fresh Android
  // install (never asked) no longer trips this and silently disables the
  // default-on reminder before the user has seen a prompt. This catches three
  // cases at once:
  //   (a) launch-time auto-request returned denied,
  //   (b) the OS rate-limited subsequent prompts into a hard denial,
  //   (c) the user revoked notifications in system settings and returned
  //       to the app (foreground re-check picks up the new status).
  // Once flipped, the user must toggle on again to re-prompt — and on a
  // hard denial that toggle bounces back, surfacing the OS-side block.
  // Festive reminders ride the same grant, so a denial has to flip that
  // toggle too — otherwise the Reminders screen shows an "on" switch for
  // pushes the OS will never deliver.
  //
  // Every flip is also a user "no" (they refused the prompt or revoked in
  // system settings), so it stamps the decline and starts the re-offer snooze
  // — otherwise the opt-in sheet would reappear on the very next open.
  useEffect(() => {
    if (isLoading) return;
    if (permissionStatus !== 'denied') return;
    if (!prefs.dailyVerseEnabled && !prefs.festiveRemindersEnabled) return;
    const next = {
      ...prefsRef.current,
      dailyVerseEnabled: false,
      festiveRemindersEnabled: false,
    };
    prefsRef.current = next;
    setPrefs(next);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => undefined);
    const nextMeta = { ...metaRef.current, lastDeclinedAt: Date.now() };
    metaRef.current = nextMeta;
    setMeta(nextMeta);
    AsyncStorage.setItem(META_KEY, JSON.stringify(nextMeta)).catch(() => undefined);
  }, [isLoading, prefs.dailyVerseEnabled, prefs.festiveRemindersEnabled, permissionStatus]);

  // On app foreground transitions, re-check permission and bump foregroundTick
  // so the reconciliation effect re-runs with fresh dates.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') {
        readNotificationPermissionState().then((state) => {
          setPermission((cur) => (samePermission(cur, state) ? cur : state));
        });
        setForegroundTick((t) => t + 1);
      }
    });
    return () => sub.remove();
  }, []);

  const persistPrefs = useCallback(
    async (updater: (prev: NotificationPreferences) => NotificationPreferences) => {
      const next = updater(prefsRef.current);
      prefsRef.current = next;
      setPrefs(next);
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => undefined);
    },
    []
  );

  const persistMeta = useCallback(
    async (updater: (prev: NotificationMeta) => NotificationMeta) => {
      const next = updater(metaRef.current);
      metaRef.current = next;
      setMeta(next);
      await AsyncStorage.setItem(META_KEY, JSON.stringify(next)).catch(() => undefined);
    },
    []
  );

  const requestPermission = useCallback<
    NotificationPreferencesContextValue['requestPermission']
  >(async () => {
    const next = await requestNotificationPermission();
    setPermission(next);
    return next.status;
  }, []);

  const setDailyVerseEnabled = useCallback<
    NotificationPreferencesContextValue['setDailyVerseEnabled']
  >(
    async (enabled) => {
      if (enabled) {
        let status = permissionStatus;
        if (status !== 'granted') {
          status = await requestPermission();
        }
        const granted = status === 'granted';
        await persistPrefs((prev) => ({ ...prev, dailyVerseEnabled: granted }));
        if (status === 'denied') {
          // The enable attempt surfaced the OS prompt and the user refused —
          // that's a "no": snooze the opt-in sheet for the full window.
          await persistMeta((prev) => ({ ...prev, lastDeclinedAt: Date.now() }));
        }
      } else {
        await persistPrefs((prev) => ({ ...prev, dailyVerseEnabled: false }));
        // Switching the reminder off is the clearest "no" of all — start the
        // snooze so the re-offer waits its 15 days rather than nagging.
        await persistMeta((prev) => ({ ...prev, lastDeclinedAt: Date.now() }));
      }
    },
    [permissionStatus, persistPrefs, persistMeta, requestPermission]
  );

  const setFestiveRemindersEnabled = useCallback<
    NotificationPreferencesContextValue['setFestiveRemindersEnabled']
  >(
    async (enabled) => {
      if (enabled) {
        let status = permissionStatus;
        if (status !== 'granted') {
          status = await requestPermission();
        }
        // On a hard denial the switch bounces back, surfacing the OS-side block —
        // same contract as the daily-verse toggle.
        const granted = status === 'granted';
        await persistPrefs((prev) => ({ ...prev, festiveRemindersEnabled: granted }));
      } else {
        await persistPrefs((prev) => ({ ...prev, festiveRemindersEnabled: false }));
      }
    },
    [permissionStatus, persistPrefs, requestPermission]
  );

  const setTimes = useCallback<NotificationPreferencesContextValue['setTimes']>(
    async (times) => {
      const next = normaliseTimes(times);
      // Always keep at least one reminder — the toggle, not an empty list, is
      // how users turn reminders off.
      const safe = next.length > 0 ? next : DEFAULTS.times;
      await persistPrefs((prev) => ({ ...prev, times: safe }));
    },
    [persistPrefs]
  );

  const markOptInPromptShown = useCallback<
    NotificationPreferencesContextValue['markOptInPromptShown']
  >(async () => {
    // Closing the sheet without enabling is a "no": stamp the decline so the
    // next offer waits out the snooze. The stamp is harmless on the Enable
    // path (the sheet calls this there too) — with the reminder on, the gate
    // never consults it.
    await persistMeta((prev) => ({
      ...prev,
      optInPromptShown: true,
      lastDeclinedAt: Date.now(),
    }));
  }, [persistMeta]);

  const publishDayAngas = useCallback<
    NotificationPreferencesContextValue['publishDayAngas']
  >((key, map) => {
    if (dayAngaKeyRef.current === key) return;
    dayAngaKeyRef.current = key;
    setDayAngas(map);
  }, []);

  // Hard-blocked: the OS will not prompt again, so the sheet's Enable button
  // cannot succeed — don't show an offer that dead-ends. The Reminders screen's
  // banner (which routes to system Settings) owns this state.
  const permissionHardBlocked =
    permissionStatus === 'denied' && !permission.canAskAgain;
  // The ask cadence, per product rule: until the user has confirmed a yes or a
  // no, ask on every open; after a "no", come back once per snooze window.
  // `lastDeclinedAt` is the single record of a "no" (OS refusal, sheet
  // dismissal, manual toggle-off — every path stamps it), so "no decline on
  // record" IS the not-yet-confirmed state, and an elapsed snooze re-offers.
  // A "yes" needs no marker: the reminder is then on and the `!enabled` guard
  // holds the sheet closed. (`optInPromptShown` no longer gates repeat offers
  // — it survives only as a legacy field older builds may read.)
  const reofferSnoozeOver =
    meta.lastDeclinedAt === null ||
    Date.now() - meta.lastDeclinedAt >= OPT_IN_REOFFER_SNOOZE_MS;
  // While the permission is unanswered and any toggle is on, the hydrate
  // effect is putting the OS prompt on screen this launch — hold the sheet
  // back so two asks never stack. The moment that request resolves,
  // permissionStatus changes and this recomputes: granted keeps festive alive
  // and the sheet then offers the daily verse; denied stamps the decline and
  // snoozes it.
  const osAskInFlight =
    permissionStatus === 'undetermined' &&
    (prefs.dailyVerseEnabled || prefs.festiveRemindersEnabled);
  const shouldShowOptIn =
    !isLoading &&
    !prefs.dailyVerseEnabled &&
    !permissionHardBlocked &&
    !osAskInFlight &&
    // First open onwards (Aug 2026): the count is bumped to ≥ 1 during the
    // hydrate that clears `isLoading`, so this offers on the very first launch
    // rather than waiting to "earn the ask". Kept as an explicit guard so the
    // sheet still can't fire before the launch's open has been counted.
    meta.appOpenCount >= 1 &&
    reofferSnoozeOver;

  const value = useMemo<NotificationPreferencesContextValue>(
    () => ({
      prefs,
      meta,
      permissionStatus,
      canAskAgain: permission.canAskAgain,
      isLoading,
      shouldShowOptIn,
      setDailyVerseEnabled,
      setFestiveRemindersEnabled,
      setTimes,
      markOptInPromptShown,
      requestPermission,
      publishDayAngas,
    }),
    [
      prefs,
      meta,
      permissionStatus,
      permission.canAskAgain,
      isLoading,
      shouldShowOptIn,
      setDailyVerseEnabled,
      setFestiveRemindersEnabled,
      setTimes,
      markOptInPromptShown,
      requestPermission,
      publishDayAngas,
    ]
  );

  return (
    <NotificationPreferencesContext.Provider value={value}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
}

export function useNotificationPreferences(): NotificationPreferencesContextValue {
  const ctx = useContext(NotificationPreferencesContext);
  if (!ctx) {
    throw new Error(
      'useNotificationPreferences() must be used inside <NotificationPreferencesProvider>.'
    );
  }
  return ctx;
}

/** Set foreground notification handler. Call once at app boot. */
export function configureForegroundNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android 8+ drops notifications that aren't bound to a channel. Without
  // this, scheduled daily-verse reminders can be silently suppressed by the
  // OS or shown with no heads-up, even when permission is granted.
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Daily verse reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: '#B8621B',
    }).catch(() => undefined);
  }
}

