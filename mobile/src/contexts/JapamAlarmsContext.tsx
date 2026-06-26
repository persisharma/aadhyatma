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
  MAX_JAPAM_ALARMS,
  makeAlarmId,
  parseStoredAlarms,
  sortAlarms,
  type JapamAlarm,
} from '@/notifications/japamAlarms';
import {
  cancelAllJapamAlarmNotifications,
  scheduleJapamAlarms,
} from '@/notifications/japamAlarmScheduler';
import type { TimeOfDay } from '@/notifications/pure';

const STORAGE_KEY = '@vedansh/japam-alarms';

export type AlarmDraft = {
  mantraId: string;
  time: TimeOfDay;
  label?: string;
};

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

type JapamAlarmsContextValue = {
  alarms: JapamAlarm[];
  isLoading: boolean;
  permissionStatus: PermissionStatus;
  canAdd: boolean;
  addAlarm: (draft: AlarmDraft) => Promise<JapamAlarm | null>;
  updateAlarm: (id: string, patch: Partial<AlarmDraft>) => Promise<void>;
  toggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  removeAlarm: (id: string) => Promise<void>;
  requestPermission: () => Promise<PermissionStatus>;
};

const JapamAlarmsContext = createContext<JapamAlarmsContextValue | null>(null);

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

export function JapamAlarmsProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<JapamAlarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const alarmsRef = useRef<JapamAlarm[]>([]);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [raw, status] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          readPermissionStatus(),
        ]);
        if (cancelled) return;
        const loaded = sortAlarms(parseStoredAlarms(raw));
        alarmsRef.current = loaded;
        setAlarms(loaded);
        setPermissionStatus(status);
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
        readPermissionStatus().then((status) => {
          setPermissionStatus((cur) => (cur === status ? cur : status));
        });
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

  const requestPermission = useCallback<JapamAlarmsContextValue['requestPermission']>(
    async () => {
      try {
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

  const addAlarm = useCallback<JapamAlarmsContextValue['addAlarm']>(
    async (draft) => {
      if (alarmsRef.current.length >= MAX_JAPAM_ALARMS) return null;
      if (permissionStatus !== 'granted') {
        await requestPermission();
      }
      const alarm: JapamAlarm = {
        id: makeAlarmId(),
        mantraId: draft.mantraId,
        time: { hour: draft.time.hour, minute: draft.time.minute },
        enabled: true,
        ...(draft.label?.trim() ? { label: draft.label.trim() } : {}),
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
      canAdd,
      addAlarm,
      updateAlarm,
      toggleAlarm,
      removeAlarm,
      requestPermission,
    }),
    [
      alarms,
      isLoading,
      permissionStatus,
      canAdd,
      addAlarm,
      updateAlarm,
      toggleAlarm,
      removeAlarm,
      requestPermission,
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
