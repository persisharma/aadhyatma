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

/** Persisted shape. `marks` maps an item key → epoch-ms of when it was offered
 * today. Legacy builds stored `keys: string[]` (no time); those migrate to
 * `marks` with timestamp 0 (= "offered, time unknown"). */
type DoneState = { date: string; marks: Record<string, number> };
type LegacyDoneState = { date: string; keys: string[] };

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
  /** Epoch-ms when the item was manually marked offered today, or undefined. */
  manualDoneAt: (key: string) => number | undefined;
  /** Signature of the routine-item set whose completion was celebrated today,
   * or null if today's completion hasn't played its pushpa-varsha yet. */
  celebratedSignatureToday: string | null;
  /** Record that the given completed set has played its pushpa-varsha today, so
   * it replays only when the set changes (e.g. a new section is added). */
  markCelebrated: (signature: string) => void;
};

const RoutineContext = createContext<RoutineContextValue | null>(null);

function isRoutineArray(v: unknown): v is Routine[] {
  return Array.isArray(v) && v.every((r) => r && typeof r === 'object' && 'id' in r && 'items' in r);
}

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [doneMarks, setDoneMarks] = useState<Record<string, number>>({});
  const [celebrated, setCelebrated] = useState<{ date: string; sig: string } | null>(null);
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
            const parsed = JSON.parse(rawD) as Partial<DoneState & LegacyDoneState>;
            // Completion is daily — discard yesterday's marks.
            if (parsed?.date === toDateKey(new Date())) {
              if (parsed.marks && typeof parsed.marks === 'object') {
                setDoneMarks({ ...parsed.marks });
              } else if (Array.isArray(parsed.keys)) {
                // Legacy `{ date, keys }` — migrate to timestamped marks. The
                // original time is unknown, so 0 = "offered, time unknown".
                const migrated: Record<string, number> = {};
                for (const k of parsed.keys) migrated[k] = 0;
                setDoneMarks(migrated);
              }
            }
          } catch {
            /* corrupted — leave empty */
          }
        }
        // Stored as JSON `{ date, sig }`; staleness is handled by comparing the
        // date to today at read time (see `celebratedSignatureToday`). A legacy
        // bare-date value (pre-signature builds) fails JSON.parse and is ignored.
        if (rawC) {
          try {
            const parsed = JSON.parse(rawC);
            if (
              parsed &&
              typeof parsed === 'object' &&
              typeof parsed.date === 'string' &&
              typeof parsed.sig === 'string'
            ) {
              setCelebrated({ date: parsed.date, sig: parsed.sig });
            }
          } catch {
            /* legacy/corrupted — leave unset */
          }
        }
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

  const persistDone = useCallback((next: Record<string, number>) => {
    setDoneMarks(next);
    const payload: DoneState = { date: toDateKey(new Date()), marks: next };
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
      // Record the moment it was offered, so the Today row can show "offered 7:12 AM".
      persistDone({ ...doneMarks, [key]: Date.now() });
    },
    [doneMarks, persistDone]
  );

  const unmarkManualDone = useCallback(
    (key: string) => {
      const next = { ...doneMarks };
      delete next[key];
      persistDone(next);
    },
    [doneMarks, persistDone]
  );

  const isManualDone = useCallback(
    (key: string) => Object.prototype.hasOwnProperty.call(doneMarks, key),
    [doneMarks]
  );

  const manualDoneAt = useCallback((key: string) => doneMarks[key], [doneMarks]);

  const markCelebrated = useCallback((signature: string) => {
    const record = { date: toDateKey(new Date()), sig: signature };
    setCelebrated(record);
    AsyncStorage.setItem(CELEBRATED_KEY, JSON.stringify(record)).catch(() => undefined);
  }, []);

  const celebratedSignatureToday =
    celebrated && celebrated.date === toDateKey(new Date()) ? celebrated.sig : null;

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
      manualDoneAt,
      celebratedSignatureToday,
      markCelebrated,
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
      manualDoneAt,
      celebratedSignatureToday,
      markCelebrated,
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
