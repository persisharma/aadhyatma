import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAPAM_BEADS_PER_ROUND } from '@/data/japam';
import { useUserActivity } from '@/contexts/UserActivityContext';

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
  /** Adds `beads` (default 1) to the count, rolling over to new rounds at
   *  JAPAM_BEADS_PER_ROUND. Safe to call several times in one synchronous tick
   *  (each call composes on the latest value) and to add many beads at once. */
  increment: (mantraId: string, beads?: number) => JapamCounterEntry;
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
  const { logJapaBead, logJapaRound } = useUserActivity();

  // Mirror of `entries` that is updated synchronously by `persist`, so that
  // several mutations in a single tick (e.g. a bead-count delta plus its round
  // rollover) each compose on the latest value instead of a stale render
  // snapshot. Kept in sync on render too, for the async-load path.
  const entriesRef = useRef<EntryMap>({});
  entriesRef.current = entries;

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
    entriesRef.current = next;
    setEntries(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const getEntry = useCallback(
    (mantraId: string) => entries[mantraId] ?? EMPTY,
    [entries]
  );

  const increment = useCallback(
    (mantraId: string, beads: number = 1): JapamCounterEntry => {
      const n = beads > 0 ? Math.floor(beads) : 1;
      const current = entriesRef.current[mantraId] ?? EMPTY;
      const total = current.count + n;
      const completedRounds = Math.floor(total / JAPAM_BEADS_PER_ROUND);
      const updated: JapamCounterEntry = {
        count: total % JAPAM_BEADS_PER_ROUND,
        rounds: current.rounds + completedRounds,
        updatedAt: Date.now(),
      };
      persist({ ...entriesRef.current, [mantraId]: updated });
      logJapaBead(mantraId, n);
      if (completedRounds > 0) logJapaRound(mantraId, completedRounds);
      return updated;
    },
    [persist, logJapaBead, logJapaRound]
  );

  const resetBeads = useCallback(
    (mantraId: string) => {
      const current = entriesRef.current[mantraId];
      if (!current || current.count === 0) return;
      persist({
        ...entriesRef.current,
        [mantraId]: { ...current, count: 0, updatedAt: Date.now() },
      });
    },
    [persist]
  );

  const clear = useCallback(
    (mantraId: string) => {
      if (!(mantraId in entriesRef.current)) return;
      const next = { ...entriesRef.current };
      delete next[mantraId];
      persist(next);
    },
    [persist]
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
