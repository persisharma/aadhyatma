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
  /** Log chanted beads (default 1; pass a count to batch a tick's worth). */
  logJapaBead: (mantraId: string, beads?: number) => void;
  /** Log completed rounds (default 1; every 108 beads is one round). */
  logJapaRound: (mantraId: string, rounds?: number) => void;
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
    // Update the ref synchronously so back-to-back mutations in one tick (e.g.
    // logging beads then a round rollover) compose instead of clobbering each
    // other via a stale render snapshot.
    activityRef.current = next;
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
    (mantraId: string, beads: number = 1) => {
      const inc = beads > 0 ? Math.floor(beads) : 1;
      mutateToday((day) => {
        const cur = day.japa[mantraId] ?? { beads: 0, rounds: 0 };
        day.japa[mantraId] = { ...cur, beads: cur.beads + inc };
        return day;
      });
    },
    [mutateToday]
  );

  const logJapaRound = useCallback(
    (mantraId: string, rounds: number = 1) => {
      const inc = rounds > 0 ? Math.floor(rounds) : 1;
      mutateToday((day) => {
        const cur = day.japa[mantraId] ?? { beads: 0, rounds: 0 };
        day.japa[mantraId] = { ...cur, rounds: cur.rounds + inc };
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
    ]
  );

  return (
    <UserActivityContext.Provider value={value}>{children}</UserActivityContext.Provider>
  );
}

export function useUserActivity() {
  return useContext(UserActivityContext);
}
