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
  MAX_JAPAM_ALARMS,
  isOnceAlarm,
  localDateKey,
  makeAlarmId,
  normalizeRepeatDays,
  parseStoredAlarms,
  sortAlarms,
  type JapamAlarm,
} from '@/notifications/japamAlarms';
import {
  cancelAllJapamAlarmNotifications,
  firedOnceAlarmIds,
  scheduleJapamAlarms,
} from '@/notifications/japamAlarmScheduler';
import {
  getNativeAlarmCapability,
  isIosNativeAlarmSupported,
  requestAndroidExactAlarmPermission,
  requestIosAlarmPermission,
  getIosAlarmAuthorizationStatus,
} from '@/notifications/japamAlarmNative';
import type { TimeOfDay } from '@/notifications/pure';

const STORAGE_KEY = '@vedansh/japam-alarms';

export type AlarmDraft = {
  mantraId: string;
  time: TimeOfDay;
  label?: string;
  /** Weekday selection: undefined = daily, [] = once, subset = weekly. */
  repeatDays?: number[];
};

/** `null` clears an optional field; `undefined` leaves it untouched. */
export type AlarmPatch = {
  mantraId?: string;
  time?: TimeOfDay;
  label?: string;
  repeatDays?: number[] | null;
  skipNextDate?: string | null;
};

type PermissionStatus = 'granted' | 'denied' | 'undetermined';
type ExactAlarmStatus = 'granted' | 'needs-permission' | 'unavailable';

type JapamAlarmsContextValue = {
  alarms: JapamAlarm[];
  isLoading: boolean;
  permissionStatus: PermissionStatus;
  exactAlarmStatus: ExactAlarmStatus;
  canAdd: boolean;
  addAlarm: (draft: AlarmDraft) => Promise<JapamAlarm | null>;
  updateAlarm: (id: string, patch: AlarmPatch) => Promise<void>;
  toggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  requestPermission: () => Promise<PermissionStatus>;
  openExactAlarmSettings: () => Promise<boolean>;
};

const JapamAlarmsContext = createContext<JapamAlarmsContextValue | null>(null);

async function readPermissionStatus(): Promise<PermissionStatus> {
  try {
    // On iOS the scheduler routes alarms through AlarmKit, so the meaningful
    // authorisation is AlarmKit's — not expo-notifications'. Reading the wrong
    // signal here would make the reconcile effect cancel every alarm on the
    // next launch (notifications stays 'undetermined' since we never ask it).
    if (Platform.OS === 'ios' && isIosNativeAlarmSupported()) {
      return await getIosAlarmAuthorizationStatus();
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

async function readExactAlarmStatus(): Promise<ExactAlarmStatus> {
  if (Platform.OS !== 'android') return 'unavailable';
  const capability = await getNativeAlarmCapability();
  if (!capability.supported) return 'unavailable';
  return capability.canScheduleExact ? 'granted' : 'needs-permission';
}

export function JapamAlarmsProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<JapamAlarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [exactAlarmStatus, setExactAlarmStatus] =
    useState<ExactAlarmStatus>('unavailable');
  const alarmsRef = useRef<JapamAlarm[]>([]);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [raw, status, exactStatus] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          readPermissionStatus(),
          readExactAlarmStatus(),
        ]);
        if (cancelled) return;
        const loaded = sortAlarms(parseStoredAlarms(raw));
        alarmsRef.current = loaded;
        setAlarms(loaded);
        setPermissionStatus(status);
        setExactAlarmStatus(exactStatus);
        setIsLoading(false);
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reconcile OS schedule whenever alarms / permission / foreground change.
  // The foregroundTick dependency catches "phone rebooted at 2 AM, alarm at
  // 6 AM didn't fire because the scheduling was lost, user opens app at
  // 7 AM" — re-running the scheduler on each foreground re-arms everything
  // for the next day from a fresh state.
  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    (async () => {
      if (permissionStatus === 'granted') {
        await scheduleJapamAlarms(alarms).catch(() => undefined);
      } else {
        await cancelAllJapamAlarmNotifications().catch(() => undefined);
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [alarms, permissionStatus, isLoading, foregroundTick]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') {
        Promise.all([readPermissionStatus(), readExactAlarmStatus()]).then(
          ([status, exactStatus]) => {
            setPermissionStatus((cur) => (cur === status ? cur : status));
            setExactAlarmStatus((cur) =>
              cur === exactStatus ? cur : exactStatus
            );
          }
        );
        setForegroundTick((t) => t + 1);
      }
    });
    return () => sub.remove();
  }, []);

  const persist = useCallback(
    async (
      updater: (prev: JapamAlarm[]) => JapamAlarm[]
    ): Promise<JapamAlarm[]> => {
      const next = sortAlarms(updater(alarmsRef.current));
      alarmsRef.current = next;
      setAlarms(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(
        () => undefined
      );
      return next;
    },
    []
  );

  // Housekeeping on load + each foreground: drop skip-next dates that have
  // passed (the skipped occurrence is behind us), and auto-disable one-time
  // alarms whose recorded fire moment went by — a "once" alarm that rang
  // shouldn't sit armed for tomorrow like a stock repeating alarm would.
  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    (async () => {
      const now = new Date();
      const todayKey = localDateKey(now);
      const firedOnce = new Set(await firedOnceAlarmIds(now));
      if (cancelled) return;
      let changed = false;
      const next = alarmsRef.current.map((a) => {
        let out = a;
        if (out.skipNextDate !== undefined && out.skipNextDate < todayKey) {
          const { skipNextDate: _dropped, ...rest } = out;
          out = rest;
          changed = true;
        }
        if (out.enabled && isOnceAlarm(out) && firedOnce.has(out.id)) {
          out = { ...out, enabled: false };
          changed = true;
        }
        return out;
      });
      if (changed) await persist(() => next);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, foregroundTick, persist]);

  const requestPermission = useCallback<JapamAlarmsContextValue['requestPermission']>(
    async () => {
      try {
        // iOS native-alarm path: prompt for AlarmKit authorisation, which is
        // what actually gates whether the scheduled alarms fire.
        if (Platform.OS === 'ios' && isIosNativeAlarmSupported()) {
          const granted = await requestIosAlarmPermission();
          const next: PermissionStatus = granted ? 'granted' : 'denied';
          setPermissionStatus(next);
          return next;
        }
        const { status } = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowBadge: false, allowSound: true },
        });
        const next: PermissionStatus =
          status === 'granted'
            ? 'granted'
            : status === 'denied'
              ? 'denied'
              : 'undetermined';
        setPermissionStatus(next);
        return next;
      } catch {
        return 'undetermined';
      }
    },
    []
  );

  const openExactAlarmSettings = useCallback<
    JapamAlarmsContextValue['openExactAlarmSettings']
  >(async () => {
    const handled = await requestAndroidExactAlarmPermission();
    if (!handled) return false;
    const next = await readExactAlarmStatus();
    setExactAlarmStatus(next);
    return true;
  }, []);

  const addAlarm = useCallback<JapamAlarmsContextValue['addAlarm']>(
    async (draft) => {
      if (alarmsRef.current.length >= MAX_JAPAM_ALARMS) return null;
      if (permissionStatus !== 'granted') {
        await requestPermission();
      }
      const days =
        draft.repeatDays !== undefined
          ? normalizeRepeatDays(draft.repeatDays)
          : undefined;
      const alarm: JapamAlarm = {
        id: makeAlarmId(),
        mantraId: draft.mantraId,
        time: { hour: draft.time.hour, minute: draft.time.minute },
        enabled: true,
        ...(draft.label?.trim() ? { label: draft.label.trim() } : {}),
        // All seven days is canonically "daily" — stored as no repeatDays.
        ...(days !== undefined && days.length < 7 ? { repeatDays: days } : {}),
      };
      await persist((prev) => [...prev, alarm]);
      return alarm;
    },
    [permissionStatus, persist, requestPermission]
  );

  const updateAlarm = useCallback<JapamAlarmsContextValue['updateAlarm']>(
    async (id, patch) => {
      await persist((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const next: JapamAlarm = {
            ...a,
            ...(patch.mantraId ? { mantraId: patch.mantraId } : {}),
            ...(patch.time
              ? { time: { hour: patch.time.hour, minute: patch.time.minute } }
              : {}),
          };
          if (patch.label !== undefined) {
            const trimmed = patch.label.trim();
            if (trimmed) next.label = trimmed;
            else delete next.label;
          }
          if (patch.repeatDays !== undefined) {
            if (patch.repeatDays === null) {
              delete next.repeatDays;
            } else {
              const days = normalizeRepeatDays(patch.repeatDays);
              if (days.length < 7) next.repeatDays = days;
              else delete next.repeatDays;
            }
          }
          if (patch.skipNextDate !== undefined) {
            if (patch.skipNextDate === null) delete next.skipNextDate;
            else next.skipNextDate = patch.skipNextDate;
          }
          // A changed time or repeat selection re-defines which occurrence is
          // "next" — a previously chosen skip no longer refers to anything.
          if (
            patch.skipNextDate === undefined &&
            (patch.time !== undefined || patch.repeatDays !== undefined)
          ) {
            delete next.skipNextDate;
          }
          return next;
        })
      );
    },
    [persist]
  );

  const toggleAlarm = useCallback<JapamAlarmsContextValue['toggleAlarm']>(
    async (id, enabled) => {
      if (enabled && permissionStatus !== 'granted') {
        await requestPermission();
      }
      await persist((prev) =>
        prev.map((a) => (a.id === id ? { ...a, enabled } : a))
      );
    },
    [permissionStatus, persist, requestPermission]
  );

  const removeAlarm = useCallback<JapamAlarmsContextValue['removeAlarm']>(
    async (id) => {
      await persist((prev) => prev.filter((a) => a.id !== id));
    },
    [persist]
  );

  const canAdd = alarms.length < MAX_JAPAM_ALARMS;

  const value = useMemo<JapamAlarmsContextValue>(
    () => ({
      alarms,
      isLoading,
      permissionStatus,
      exactAlarmStatus,
      canAdd,
      addAlarm,
      updateAlarm,
      toggleAlarm,
      removeAlarm,
      requestPermission,
      openExactAlarmSettings,
    }),
    [
      alarms,
      isLoading,
      permissionStatus,
      exactAlarmStatus,
      canAdd,
      addAlarm,
      updateAlarm,
      toggleAlarm,
      removeAlarm,
      requestPermission,
      openExactAlarmSettings,
    ]
  );

  return (
    <JapamAlarmsContext.Provider value={value}>
      {children}
    </JapamAlarmsContext.Provider>
  );
}

export function useJapamAlarms(): JapamAlarmsContextValue {
  const ctx = useContext(JapamAlarmsContext);
  if (!ctx) {
    throw new Error(
      'useJapamAlarms() must be used inside <JapamAlarmsProvider>.'
    );
  }
  return ctx;
}
