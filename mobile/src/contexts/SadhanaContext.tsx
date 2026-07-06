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
import { getProgram } from '@/data/sadhana/programs';
import { programDayCount, withDayCommitted } from '@/data/sadhana/progress';
import type { DayCompletion, SadhanaEnrollment } from '@/data/sadhana/types';

const ENROLLMENTS_KEY = '@vedansh/sadhana';
const CELEBRATED_KEY = '@vedansh/sadhana-celebrated';
const DAY_CELEBRATED_KEY = '@vedansh/sadhana-day-celebrated';
const REMINDERS_KEY = '@vedansh/sadhana-reminders';

type SadhanaContextValue = {
  enrollments: SadhanaEnrollment[];
  activeEnrollments: SadhanaEnrollment[];
  isLoading: boolean;
  /** True when the user is currently enrolled (any status) in this program. */
  enrollmentFor: (programId: string) => SadhanaEnrollment | undefined;
  /** Take (or restart) a sankalp. Re-enrolling a finished/abandoned one resets it. */
  enroll: (programId: string) => void;
  /** Set a sankalp aside — gentle, no data loss beyond marking it abandoned. */
  abandon: (programId: string) => void;
  /** Record today's day as done. Advances the vow; on the final day → completed. */
  commitDay: (programId: string, dayIndex: number, via: DayCompletion['via']) => void;
  /** Whether a completed program has already played its पूर्णाहुति celebration. */
  wasCelebrated: (programId: string) => boolean;
  markCelebrated: (programId: string) => void;
  /** Whether a sankalp day has already played its daily completion shower today. */
  wasDayCelebrated: (programId: string, dayIndex: number) => boolean;
  markDayCelebrated: (programId: string, dayIndex: number) => void;
  /** Program ids with a daily reminder enabled (PRD-11 P3). */
  reminderProgramIds: string[];
  isReminderEnabled: (programId: string) => boolean;
  setReminderEnabled: (programId: string, enabled: boolean) => void;
};

const SadhanaContext = createContext<SadhanaContextValue | null>(null);

function isEnrollmentArray(v: unknown): v is SadhanaEnrollment[] {
  return (
    Array.isArray(v) &&
    v.every((e) => e && typeof e === 'object' && 'programId' in e && 'completedDays' in e)
  );
}

export function SadhanaProvider({ children }: { children: React.ReactNode }) {
  const [enrollments, setEnrollments] = useState<SadhanaEnrollment[]>([]);
  const [celebrated, setCelebrated] = useState<string[]>([]);
  const [dayCelebrated, setDayCelebrated] = useState<string[]>([]);
  const [reminderProgramIds, setReminderProgramIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(ENROLLMENTS_KEY),
      AsyncStorage.getItem(CELEBRATED_KEY),
      AsyncStorage.getItem(DAY_CELEBRATED_KEY),
      AsyncStorage.getItem(REMINDERS_KEY),
    ])
      .then(([rawE, rawC, rawD, rawR]) => {
        if (cancelled) return;
        if (rawE) {
          try {
            const parsed = JSON.parse(rawE);
            if (isEnrollmentArray(parsed)) setEnrollments(parsed);
          } catch {
            /* corrupted — leave empty */
          }
        }
        if (rawC) {
          try {
            const parsed = JSON.parse(rawC);
            if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
              setCelebrated(parsed);
            }
          } catch {
            /* corrupted — leave empty */
          }
        }
        if (rawD) {
          try {
            const parsed = JSON.parse(rawD);
            if (
              parsed &&
              typeof parsed === 'object' &&
              parsed.date === toDateKey(new Date()) &&
              Array.isArray(parsed.keys) &&
              parsed.keys.every((x: unknown) => typeof x === 'string')
            ) {
              setDayCelebrated(parsed.keys);
            }
          } catch {
            /* corrupted — leave empty */
          }
        }
        if (rawR) {
          try {
            const parsed = JSON.parse(rawR);
            if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
              setReminderProgramIds(parsed);
            }
          } catch {
            /* corrupted — leave empty */
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

  const persist = useCallback((next: SadhanaEnrollment[]) => {
    setEnrollments(next);
    AsyncStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const persistCelebrated = useCallback((next: string[]) => {
    setCelebrated(next);
    AsyncStorage.setItem(CELEBRATED_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const persistDayCelebrated = useCallback((next: string[]) => {
    setDayCelebrated(next);
    AsyncStorage.setItem(
      DAY_CELEBRATED_KEY,
      JSON.stringify({ date: toDateKey(new Date()), keys: next })
    ).catch(() => undefined);
  }, []);

  const enrollmentFor = useCallback(
    (programId: string) => enrollments.find((e) => e.programId === programId),
    [enrollments]
  );

  const enroll = useCallback(
    (programId: string) => {
      if (!getProgram(programId)) return;
      const fresh: SadhanaEnrollment = {
        programId,
        startedOn: toDateKey(new Date()),
        status: 'active',
        completedDays: {},
      };
      // Re-enrolling replaces any prior (completed/abandoned/active) enrollment
      // for the same program — a new vow starts clean.
      persist([...enrollments.filter((e) => e.programId !== programId), fresh]);
    },
    [enrollments, persist]
  );

  const abandon = useCallback(
    (programId: string) => {
      persist(
        enrollments.map((e) =>
          e.programId === programId ? { ...e, status: 'abandoned' as const } : e
        )
      );
    },
    [enrollments, persist]
  );

  const commitDay = useCallback(
    (programId: string, dayIndex: number, via: DayCompletion['via']) => {
      const program = getProgram(programId);
      if (!program) return;
      const total = programDayCount(program);
      persist(
        enrollments.map((e) => {
          if (e.programId !== programId || e.status !== 'active') return e;
          // Idempotent: don't re-commit a day already recorded.
          if (e.completedDays[dayIndex]) return e;
          const today = toDateKey(new Date());
          const completedDays = withDayCommitted(e, dayIndex, { at: today, via });
          const isDone = Object.keys(completedDays).length >= total;
          return {
            ...e,
            completedDays,
            status: isDone ? ('completed' as const) : e.status,
            completedOn: isDone ? today : e.completedOn,
          };
        })
      );
    },
    [enrollments, persist]
  );

  const wasCelebrated = useCallback((programId: string) => celebrated.includes(programId), [
    celebrated,
  ]);

  const markCelebrated = useCallback(
    (programId: string) => {
      if (celebrated.includes(programId)) return;
      persistCelebrated([...celebrated, programId]);
    },
    [celebrated, persistCelebrated]
  );

  const dayCelebrationKey = useCallback((programId: string, dayIndex: number) => {
    return `${programId}:${dayIndex}`;
  }, []);

  const wasDayCelebrated = useCallback(
    (programId: string, dayIndex: number) => dayCelebrated.includes(dayCelebrationKey(programId, dayIndex)),
    [dayCelebrated, dayCelebrationKey]
  );

  const markDayCelebrated = useCallback(
    (programId: string, dayIndex: number) => {
      const key = dayCelebrationKey(programId, dayIndex);
      if (dayCelebrated.includes(key)) return;
      persistDayCelebrated([...dayCelebrated, key]);
    },
    [dayCelebrated, dayCelebrationKey, persistDayCelebrated]
  );

  const persistReminders = useCallback((next: string[]) => {
    setReminderProgramIds(next);
    AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const isReminderEnabled = useCallback(
    (programId: string) => reminderProgramIds.includes(programId),
    [reminderProgramIds]
  );

  const setReminderEnabled = useCallback(
    (programId: string, enabled: boolean) => {
      const has = reminderProgramIds.includes(programId);
      if (enabled && !has) persistReminders([...reminderProgramIds, programId]);
      else if (!enabled && has) persistReminders(reminderProgramIds.filter((id) => id !== programId));
    },
    [reminderProgramIds, persistReminders]
  );

  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.status === 'active' || e.status === 'completed'),
    [enrollments]
  );

  const value = useMemo<SadhanaContextValue>(
    () => ({
      enrollments,
      activeEnrollments,
      isLoading,
      enrollmentFor,
      enroll,
      abandon,
      commitDay,
      wasCelebrated,
      markCelebrated,
      wasDayCelebrated,
      markDayCelebrated,
      reminderProgramIds,
      isReminderEnabled,
      setReminderEnabled,
    }),
    [
      enrollments,
      activeEnrollments,
      isLoading,
      enrollmentFor,
      enroll,
      abandon,
      commitDay,
      wasCelebrated,
      markCelebrated,
      wasDayCelebrated,
      markDayCelebrated,
      reminderProgramIds,
      isReminderEnabled,
      setReminderEnabled,
    ]
  );

  return <SadhanaContext.Provider value={value}>{children}</SadhanaContext.Provider>;
}

export function useSadhana(): SadhanaContextValue {
  const ctx = useContext(SadhanaContext);
  if (!ctx) {
    throw new Error('useSadhana must be used inside <SadhanaProvider>. Check App.tsx wiring.');
  }
  return ctx;
}
