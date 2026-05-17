import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  cancelAllDailyVerseNotifications,
  scheduleDailyVerseRollingWindow,
} from '@/notifications/scheduler';
import type { TimeOfDay } from '@/notifications/pure';

const PREFS_KEY = '@vedansh/notif-prefs';
const META_KEY = '@vedansh/notif-meta';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type NotificationPreferences = {
  dailyVerseEnabled: boolean;
  time: TimeOfDay;
  quietStart: TimeOfDay;
  quietEnd: TimeOfDay;
};

type NotificationMeta = {
  appOpenCount: number;
  optInPromptShown: boolean;
};

const DEFAULTS: NotificationPreferences = {
  dailyVerseEnabled: true,
  time: { hour: 7, minute: 0 },
  quietStart: { hour: 22, minute: 0 },
  quietEnd: { hour: 6, minute: 0 },
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
  setTime: (time: TimeOfDay) => Promise<void>;
  setQuietHours: (start: TimeOfDay, end: TimeOfDay) => Promise<void>;
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

function parsePrefs(raw: string | null): NotificationPreferences {
  if (!raw) return DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      dailyVerseEnabled:
        typeof parsed.dailyVerseEnabled === 'boolean'
          ? parsed.dailyVerseEnabled
          : DEFAULTS.dailyVerseEnabled,
      time: isTimeOfDay(parsed.time) ? parsed.time : DEFAULTS.time,
      quietStart: isTimeOfDay(parsed.quietStart) ? parsed.quietStart : DEFAULTS.quietStart,
      quietEnd: isTimeOfDay(parsed.quietEnd) ? parsed.quietEnd : DEFAULTS.quietEnd,
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
  // Mirror of the latest prefs/meta so updater-style writes don't read stale
  // state from a setter's closure. Without this, two writes in the same tick
  // (e.g. setTime + setDailyVerseEnabled from the opt-in modal) clobber each
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
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reconcile the OS notification schedule whenever prefs change and after
  // app foreground (dates advance).
  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    (async () => {
      if (prefs.dailyVerseEnabled && permissionStatus === 'granted') {
        await scheduleDailyVerseRollingWindow({
          enabled: true,
          time: prefs.time,
          quietStart: prefs.quietStart,
          quietEnd: prefs.quietEnd,
        }).catch(() => undefined);
      } else {
        await cancelAllDailyVerseNotifications().catch(() => undefined);
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, prefs, permissionStatus]);

  // On app foreground transitions, re-check permission and reconcile.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') {
        readPermissionStatus().then((status) => {
          setPermissionStatus((cur) => (cur === status ? cur : status));
        });
        if (prefs.dailyVerseEnabled) {
          scheduleDailyVerseRollingWindow({
            enabled: true,
            time: prefs.time,
            quietStart: prefs.quietStart,
            quietEnd: prefs.quietEnd,
          }).catch(() => undefined);
        }
      }
    });
    return () => sub.remove();
  }, [prefs]);

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

  const setTime = useCallback<NotificationPreferencesContextValue['setTime']>(
    async (time) => {
      await persistPrefs((prev) => ({ ...prev, time }));
    },
    [persistPrefs]
  );

  const setQuietHours = useCallback<
    NotificationPreferencesContextValue['setQuietHours']
  >(
    async (quietStart, quietEnd) => {
      await persistPrefs((prev) => ({ ...prev, quietStart, quietEnd }));
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
      setTime,
      setQuietHours,
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
      setTime,
      setQuietHours,
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
}

