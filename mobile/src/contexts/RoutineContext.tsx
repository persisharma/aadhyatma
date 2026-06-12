import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toDateKey } from '@/contexts/UserActivityContext';
import type { Routine, RoutineItem, RoutineScheduleMode } from '@/data/routine/types';

const ROUTINES_KEY = '@vedansh/routines';
const DONE_KEY = '@vedansh/routine-done';
const CELEBRATED_KEY = '@vedansh/routine-celebrated';

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type DoneState = { date: string; keys: string[] };

type RoutineContextValue = {
  routines: Routine[];
  isLoading: boolean;
  createRoutine: (nameHi: string, nameEn: string, mode: RoutineScheduleMode) => string;
  deleteRoutine: (routineId: string) => void;
  addItem: (routineId: string, item: Omit<RoutineItem, 'id'>) => void;
  removeItem: (routineId: string, itemId: string) => void;
  /** Manually mark an item done for today (offline-recitation fallback). */
  markManualDone: (key: string) => void;
  unmarkManualDone: (key: string) => void;
  isManualDone: (key: string) => boolean;
  /** True once today's completion celebration (pushpa-varsha) has played. */
  celebratedToday: boolean;
  /** Record that today's celebration has played, so it fires only once a day. */
  markCelebratedToday: () => void;
};

const RoutineContext = createContext<RoutineContextValue | null>(null);

function isRoutineArray(v: unknown): v is Routine[] {
  return Array.isArray(v) && v.every((r) => r && typeof r === 'object' && 'id' in r && 'items' in r);
}

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());
  const [celebratedDate, setCelebratedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(ROUTINES_KEY),
      AsyncStorage.getItem(DONE_KEY),
      AsyncStorage.getItem(CELEBRATED_KEY),
    ])
      .then(([rawR, rawD, rawC]) => {
        if (cancelled) return;
        if (rawR) {
          try {
            const parsed = JSON.parse(rawR);
            if (isRoutineArray(parsed)) setRoutines(parsed);
          } catch {
            /* corrupted — leave empty */
          }
        }
        if (rawD) {
          try {
            const parsed = JSON.parse(rawD) as DoneState;
            // Completion is daily — discard yesterday's marks.
            if (parsed?.date === toDateKey(new Date()) && Array.isArray(parsed.keys)) {
              setDoneKeys(new Set(parsed.keys));
            }
          } catch {
            /* corrupted — leave empty */
          }
        }
        // Stored as a plain date key; staleness is handled by comparing to
        // today at read time (see `celebratedToday`), so no date guard here.
        if (rawC) setCelebratedDate(rawC);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistRoutines = useCallback((next: Routine[]) => {
    setRoutines(next);
    AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const persistDone = useCallback((next: Set<string>) => {
    setDoneKeys(next);
    const payload: DoneState = { date: toDateKey(new Date()), keys: Array.from(next) };
    AsyncStorage.setItem(DONE_KEY, JSON.stringify(payload)).catch(() => undefined);
  }, []);

  const createRoutine = useCallback(
    (nameHi: string, nameEn: string, mode: RoutineScheduleMode) => {
      const id = newId();
      const routine: Routine = {
        id,
        nameHi: nameHi.trim(),
        nameEn: nameEn.trim(),
        mode,
        items: [],
        createdAt: Date.now(),
      };
      persistRoutines([...routines, routine]);
      return id;
    },
    [routines, persistRoutines]
  );

  const deleteRoutine = useCallback(
    (routineId: string) => persistRoutines(routines.filter((r) => r.id !== routineId)),
    [routines, persistRoutines]
  );

  const addItem = useCallback(
    (routineId: string, item: Omit<RoutineItem, 'id'>) => {
      persistRoutines(
        routines.map((r) =>
          r.id === routineId ? { ...r, items: [...r.items, { ...item, id: newId() }] } : r
        )
      );
    },
    [routines, persistRoutines]
  );

  const removeItem = useCallback(
    (routineId: string, itemId: string) => {
      persistRoutines(
        routines.map((r) =>
          r.id === routineId ? { ...r, items: r.items.filter((i) => i.id !== itemId) } : r
        )
      );
    },
    [routines, persistRoutines]
  );

  const markManualDone = useCallback(
    (key: string) => {
      const next = new Set(doneKeys);
      next.add(key);
      persistDone(next);
    },
    [doneKeys, persistDone]
  );

  const unmarkManualDone = useCallback(
    (key: string) => {
      const next = new Set(doneKeys);
      next.delete(key);
      persistDone(next);
    },
    [doneKeys, persistDone]
  );

  const isManualDone = useCallback((key: string) => doneKeys.has(key), [doneKeys]);

  const markCelebratedToday = useCallback(() => {
    const today = toDateKey(new Date());
    setCelebratedDate(today);
    AsyncStorage.setItem(CELEBRATED_KEY, today).catch(() => undefined);
  }, []);

  const celebratedToday = celebratedDate === toDateKey(new Date());

  const value = useMemo<RoutineContextValue>(
    () => ({
      routines,
      isLoading,
      createRoutine,
      deleteRoutine,
      addItem,
      removeItem,
      markManualDone,
      unmarkManualDone,
      isManualDone,
      celebratedToday,
      markCelebratedToday,
    }),
    [
      routines,
      isLoading,
      createRoutine,
      deleteRoutine,
      addItem,
      removeItem,
      markManualDone,
      unmarkManualDone,
      isManualDone,
      celebratedToday,
      markCelebratedToday,
    ]
  );

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutines(): RoutineContextValue {
  const ctx = useContext(RoutineContext);
  if (!ctx) {
    throw new Error('useRoutines must be used inside <RoutineProvider>. Check App.tsx wiring.');
  }
  return ctx;
}
