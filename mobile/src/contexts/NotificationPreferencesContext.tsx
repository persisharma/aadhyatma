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
};

type NotificationMeta = {
  appOpenCount: number;
  optInPromptShown: boolean;
};

const DEFAULTS: NotificationPreferences = {
  dailyVerseEnabled: true,
  times: [{ hour: 7, minute: 0 }],
};

const META_DEFAULTS: NotificationMeta = {
  appOpenCount: 0,
  optInPromptShown: false,
};

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

        // The toggle defaults to ON, but a fresh install has not been granted
        // notification permission yet, so the reconciliation effect below would
        // silently cancel everything. Ask on the first launch that finds the
        // permission unanswered, so the default-on behaviour actually fires.
        //
        // `status === 'undetermined'` here means "never answered" on BOTH
        // platforms — `readNotificationPermissionState()` folds Android's
        // "denied because never requested" into it (see permissionState.ts).
        // Reading expo's raw status instead is what used to skip this ask
        // entirely on Android and leave reminders off out of the box.
        //
        // `requestNotificationPermission()` records the ask, so a refusal
        // resolves as `denied` from the next launch on and we don't re-prompt
        // every cold start; the opt-in sheet (third open) is the second chance.
        if (loadedPrefs.dailyVerseEnabled && state.status === 'undetermined' && state.canAskAgain) {
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
  }, [isLoading, prefs, permissionStatus, foregroundTick, lang, dayAngas]);

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
  useEffect(() => {
    if (isLoading) return;
    if (prefs.dailyVerseEnabled && permissionStatus === 'denied') {
      const next = { ...prefsRef.current, dailyVerseEnabled: false };
      prefsRef.current = next;
      setPrefs(next);
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => undefined);
    }
  }, [isLoading, prefs.dailyVerseEnabled, permissionStatus]);

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
      } else {
        await persistPrefs((prev) => ({ ...prev, dailyVerseEnabled: false }));
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
    await persistMeta((prev) => ({ ...prev, optInPromptShown: true }));
  }, [persistMeta]);

  const publishDayAngas = useCallback<
    NotificationPreferencesContextValue['publishDayAngas']
  >((key, map) => {
    if (dayAngaKeyRef.current === key) return;
    dayAngaKeyRef.current = key;
    setDayAngas(map);
  }, []);

  const shouldShowOptIn =
    !isLoading &&
    !prefs.dailyVerseEnabled &&
    !meta.optInPromptShown &&
    meta.appOpenCount >= 3;

  const value = useMemo<NotificationPreferencesContextValue>(
    () => ({
      prefs,
      meta,
      permissionStatus,
      canAskAgain: permission.canAskAgain,
      isLoading,
      shouldShowOptIn,
      setDailyVerseEnabled,
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

