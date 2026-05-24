import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@vedansh/user-activity';

export type DateKey = string; // 'YYYY-MM-DD'
export type MonthKey = string; // 'YYYY-MM'

export type DailyEntry = {
  /** Number of unique verse-page advances per source. */
  reads: Record<string, number>;
  /** Per-mantra japa counters for the day. */
  japa: Record<string, { beads: number; rounds: number }>;
};

type ActivityMap = Record<DateKey, DailyEntry>;

export type ActivityTotals = {
  totalReads: number;
  totalBeads: number;
  totalRounds: number;
  perSource: Record<string, number>;
  perMantra: Record<string, { beads: number; rounds: number }>;
  /** Number of unique days with any logged activity. */
  activeDays: number;
};

export type UserActivityContextValue = {
  activity: ActivityMap;
  isLoading: boolean;
  /** Log a verse advance on a reader. Called when the user pages forward to a new verse/chapter pair. */
  logRead: (sourceId: string) => void;
  /** Log a single bead tap. */
  logJapaBead: (mantraId: string) => void;
  /** Log a completed round (every 108 beads). */
  logJapaRound: (mantraId: string) => void;
  /** Returns aggregated stats over an inclusive [start,end] DateKey window. */
  totalsBetween: (startKey: DateKey, endKey: DateKey) => ActivityTotals;
  /** Lifetime totals across every recorded day. */
  lifetimeTotals: () => ActivityTotals;
  /** Totals for a specific calendar day. */
  dayTotals: (dateKey: DateKey) => ActivityTotals;
  /** Totals for a specific calendar month (YYYY-MM). */
  monthTotals: (monthKey: MonthKey) => ActivityTotals;
  /** Day keys (oldest → newest) where any activity happened. */
  activeDateKeys: () => DateKey[];
  /** Consecutive-day streak ending today (today inclusive if active, else 0). */
  currentStreak: () => number;
  /** Longest consecutive-day streak ever recorded. */
  longestStreak: () => number;
  /** Number of active days within the last N days, inclusive of today. */
  activeDaysInLastN: (n: number) => number;
};

const EMPTY_TOTALS: ActivityTotals = {
  totalReads: 0,
  totalBeads: 0,
  totalRounds: 0,
  perSource: {},
  perMantra: {},
  activeDays: 0,
};

const UserActivityContext = createContext<UserActivityContextValue>({
  activity: {},
  isLoading: true,
  logRead: () => {},
  logJapaBead: () => {},
  logJapaRound: () => {},
  totalsBetween: () => EMPTY_TOTALS,
  lifetimeTotals: () => EMPTY_TOTALS,
  dayTotals: () => EMPTY_TOTALS,
  monthTotals: () => EMPTY_TOTALS,
  activeDateKeys: () => [],
  currentStreak: () => 0,
  longestStreak: () => 0,
  activeDaysInLastN: () => 0,
});

export function toDateKey(d: Date): DateKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function toMonthKey(d: Date): MonthKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function emptyDay(): DailyEntry {
  return { reads: {}, japa: {} };
}

function aggregate(entries: DailyEntry[]): ActivityTotals {
  const totals: ActivityTotals = {
    totalReads: 0,
    totalBeads: 0,
    totalRounds: 0,
    perSource: {},
    perMantra: {},
    activeDays: 0,
  };
  for (const e of entries) {
    let dayActive = false;
    for (const [src, n] of Object.entries(e.reads)) {
      if (n > 0) dayActive = true;
      totals.totalReads += n;
      totals.perSource[src] = (totals.perSource[src] ?? 0) + n;
    }
    for (const [mid, jr] of Object.entries(e.japa)) {
      if (jr.beads > 0 || jr.rounds > 0) dayActive = true;
      totals.totalBeads += jr.beads;
      totals.totalRounds += jr.rounds;
      const cur = totals.perMantra[mid] ?? { beads: 0, rounds: 0 };
      totals.perMantra[mid] = {
        beads: cur.beads + jr.beads,
        rounds: cur.rounds + jr.rounds,
      };
    }
    if (dayActive) totals.activeDays += 1;
  }
  return totals;
}

export function UserActivityProvider({ children }: { children: React.ReactNode }) {
  const [activity, setActivity] = useState<ActivityMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const activityRef = useRef<ActivityMap>({});
  activityRef.current = activity;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as ActivityMap;
          if (parsed && typeof parsed === 'object') setActivity(parsed);
        } catch {}
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((next: ActivityMap) => {
    setActivity(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const mutateToday = useCallback(
    (mutate: (day: DailyEntry) => DailyEntry) => {
      if (isLoading) return;
      const key = toDateKey(new Date());
      const cur = activityRef.current[key] ?? emptyDay();
      const next = mutate({
        reads: { ...cur.reads },
        japa: { ...cur.japa },
      });
      persist({ ...activityRef.current, [key]: next });
    },
    [isLoading, persist]
  );

  const logRead = useCallback(
    (sourceId: string) => {
      mutateToday((day) => {
        day.reads[sourceId] = (day.reads[sourceId] ?? 0) + 1;
        return day;
      });
    },
    [mutateToday]
  );

  const logJapaBead = useCallback(
    (mantraId: string) => {
      mutateToday((day) => {
        const cur = day.japa[mantraId] ?? { beads: 0, rounds: 0 };
        day.japa[mantraId] = { ...cur, beads: cur.beads + 1 };
        return day;
      });
    },
    [mutateToday]
  );

  const logJapaRound = useCallback(
    (mantraId: string) => {
      mutateToday((day) => {
        const cur = day.japa[mantraId] ?? { beads: 0, rounds: 0 };
        day.japa[mantraId] = { ...cur, rounds: cur.rounds + 1 };
        return day;
      });
    },
    [mutateToday]
  );

  const totalsBetween = useCallback<UserActivityContextValue['totalsBetween']>(
    (startKey, endKey) => {
      const entries: DailyEntry[] = [];
      for (const [key, val] of Object.entries(activity)) {
        if (key >= startKey && key <= endKey) entries.push(val);
      }
      return aggregate(entries);
    },
    [activity]
  );

  const lifetimeTotals = useCallback(() => aggregate(Object.values(activity)), [activity]);

  const dayTotals = useCallback<UserActivityContextValue['dayTotals']>(
    (dateKey) => {
      const e = activity[dateKey];
      return e ? aggregate([e]) : EMPTY_TOTALS;
    },
    [activity]
  );

  const monthTotals = useCallback<UserActivityContextValue['monthTotals']>(
    (monthKey) => {
      const entries: DailyEntry[] = [];
      for (const [key, val] of Object.entries(activity)) {
        if (key.startsWith(`${monthKey}-`)) entries.push(val);
      }
      return aggregate(entries);
    },
    [activity]
  );

  const activeDateKeys = useCallback(() => {
    return Object.keys(activity).sort();
  }, [activity]);

  const currentStreak = useCallback(() => {
    const keys = new Set(Object.keys(activity));
    let streak = 0;
    const cursor = new Date();
    // Allow today to be skipped — count from yesterday if today is empty.
    const todayKey = toDateKey(cursor);
    if (!keys.has(todayKey)) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (keys.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [activity]);

  const longestStreak = useCallback(() => {
    const sortedKeys = Object.keys(activity).sort();
    if (sortedKeys.length === 0) return 0;
    let best = 1;
    let run = 1;
    for (let i = 1; i < sortedKeys.length; i++) {
      const prev = new Date(`${sortedKeys[i - 1]}T00:00:00Z`);
      prev.setUTCDate(prev.getUTCDate() + 1);
      const expected = toDateKey(
        new Date(
          Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate())
        )
      );
      if (sortedKeys[i] === expected) {
        run += 1;
        if (run > best) best = run;
      } else {
        run = 1;
      }
    }
    return best;
  }, [activity]);

  const activeDaysInLastN = useCallback<UserActivityContextValue['activeDaysInLastN']>(
    (n) => {
      if (n <= 0) return 0;
      const keys = new Set(Object.keys(activity));
      let count = 0;
      const cursor = new Date();
      for (let i = 0; i < n; i++) {
        if (keys.has(toDateKey(cursor))) count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return count;
    },
    [activity]
  );

  const value = useMemo<UserActivityContextValue>(
    () => ({
      activity,
      isLoading,
      logRead,
      logJapaBead,
      logJapaRound,
      totalsBetween,
      lifetimeTotals,
      dayTotals,
      monthTotals,
      activeDateKeys,
      currentStreak,
      longestStreak,
      activeDaysInLastN,
    }),
    [
      activity,
      isLoading,
      logRead,
      logJapaBead,
      logJapaRound,
      totalsBetween,
      lifetimeTotals,
      dayTotals,
      monthTotals,
      activeDateKeys,
      currentStreak,
      longestStreak,
      activeDaysInLastN,
    ]
  );

  return (
    <UserActivityContext.Provider value={value}>{children}</UserActivityContext.Provider>
  );
}

export function useUserActivity() {
  return useContext(UserActivityContext);
}
