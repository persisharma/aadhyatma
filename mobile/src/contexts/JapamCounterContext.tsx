import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAPAM_BEADS_PER_ROUND } from '@/data/japam';

const STORAGE_KEY = '@vedansh/japam-counter';

export type JapamCounterEntry = {
  count: number;
  rounds: number;
  updatedAt: number;
};

type EntryMap = Record<string, JapamCounterEntry>;

type JapamCounterContextValue = {
  isLoading: boolean;
  getEntry: (mantraId: string) => JapamCounterEntry;
  /** Increments the bead count, rolling over to a new round at JAPAM_BEADS_PER_ROUND. */
  increment: (mantraId: string) => JapamCounterEntry;
  /** Resets only the current bead count (not round count). */
  resetBeads: (mantraId: string) => void;
  /** Clears the entire entry — beads and rounds. */
  clear: (mantraId: string) => void;
};

const EMPTY: JapamCounterEntry = { count: 0, rounds: 0, updatedAt: 0 };

const JapamCounterContext = createContext<JapamCounterContextValue>({
  isLoading: true,
  getEntry: () => EMPTY,
  increment: () => EMPTY,
  resetBeads: () => {},
  clear: () => {},
});

export function JapamCounterProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<EntryMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') setEntries(parsed as EntryMap);
          } catch {
            /* corrupted JSON — leave empty */
          }
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((next: EntryMap) => {
    setEntries(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const getEntry = useCallback(
    (mantraId: string) => entries[mantraId] ?? EMPTY,
    [entries]
  );

  const increment = useCallback(
    (mantraId: string): JapamCounterEntry => {
      const current = entries[mantraId] ?? EMPTY;
      const nextCount = current.count + 1;
      const completedRound = nextCount >= JAPAM_BEADS_PER_ROUND;
      const updated: JapamCounterEntry = {
        count: completedRound ? 0 : nextCount,
        rounds: completedRound ? current.rounds + 1 : current.rounds,
        updatedAt: Date.now(),
      };
      persist({ ...entries, [mantraId]: updated });
      return updated;
    },
    [entries, persist]
  );

  const resetBeads = useCallback(
    (mantraId: string) => {
      const current = entries[mantraId];
      if (!current || current.count === 0) return;
      persist({
        ...entries,
        [mantraId]: { ...current, count: 0, updatedAt: Date.now() },
      });
    },
    [entries, persist]
  );

  const clear = useCallback(
    (mantraId: string) => {
      if (!(mantraId in entries)) return;
      const next = { ...entries };
      delete next[mantraId];
      persist(next);
    },
    [entries, persist]
  );

  return (
    <JapamCounterContext.Provider value={{ isLoading, getEntry, increment, resetBeads, clear }}>
      {children}
    </JapamCounterContext.Provider>
  );
}

export function useJapamCounter() {
  return useContext(JapamCounterContext);
}
