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
import { registerForRemotePushAsync } from '@/notifications/pushRegistration';
import { MAX_REMINDER_TIMES, type TimeOfDay } from '@/notifications/pure';

const PREFS_KEY = '@vedansh/notif-prefs';
const META_KEY = '@vedansh/notif-meta';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

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

async function readPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

export function NotificationPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [meta, setMeta] = useState<NotificationMeta>(META_DEFAULTS);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
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
        const [prefsRaw, metaRaw, status] = await Promise.all([
          AsyncStorage.getItem(PREFS_KEY),
          AsyncStorage.getItem(META_KEY),
          readPermissionStatus(),
        ]);
        if (cancelled) return;
        const loadedPrefs = parsePrefs(prefsRaw);
        const loadedMeta = parseMeta(metaRaw);
        prefsRef.current = loadedPrefs;
        metaRef.current = loadedMeta;
        setPrefs(loadedPrefs);
        setMeta(loadedMeta);
        setPermissionStatus(status);
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

        // The toggle defaults to ON, but a fresh install starts with
        // `undetermined` permission, so the reconciliation effect below would
        // silently cancel everything. Request permission once per cold start
        // while still undetermined so the default-on behaviour actually fires.
        // The OS rate-limits the prompt itself once the user has answered.
        if (loadedPrefs.dailyVerseEnabled && status === 'undetermined') {
          try {
            const { status: requested } = await Notifications.requestPermissionsAsync({
              ios: { allowAlert: true, allowBadge: true, allowSound: true },
            });
            if (cancelled) return;
            const next: PermissionStatus =
              requested === 'granted'
                ? 'granted'
                : requested === 'denied'
                  ? 'denied'
                  : 'undetermined';
            setPermissionStatus((cur) => (cur === next ? cur : next));
          } catch {
            // Non-fatal: leave status as-is; the reconciliation effect will
            // simply continue to cancel until permission is granted.
          }
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
        await scheduleDailyVerseRollingWindow({
          enabled: true,
          times: prefs.times,
        }).catch(() => undefined);
      } else {
        await cancelAllDailyVerseNotifications().catch(() => undefined);
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, prefs, permissionStatus, foregroundTick]);

  // Keep the toggle honest: `enabled=true` with a `denied` OS permission is
  // an inconsistent state — reminders can't fire, so the UI must not claim
  // they're on. This catches three cases at once:
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
        readPermissionStatus().then((status) => {
          setPermissionStatus((cur) => (cur === status ? cur : status));
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
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      const next: PermissionStatus =
        status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
      setPermissionStatus(next);
      if (next === 'granted') {
        // Fire-and-forget remote push registration as soon as the user opts
        // in — no reason to wait for the next cold start.
        registerForRemotePushAsync().catch(() => undefined);
      }
      return next;
    } catch {
      return 'undetermined';
    }
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
      isLoading,
      shouldShowOptIn,
      setDailyVerseEnabled,
      setTimes,
      markOptInPromptShown,
      requestPermission,
    }),
    [
      prefs,
      meta,
      permissionStatus,
      isLoading,
      shouldShowOptIn,
      setDailyVerseEnabled,
      setTimes,
      markOptInPromptShown,
      requestPermission,
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

