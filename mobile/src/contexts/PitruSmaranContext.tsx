import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidTithiRule, type SmaranEntry, type SmaranRelation } from '@/panchang/pitruSmaran';

// पितृ स्मरण entries (PRD-17). Private by construction: relation, optional name
// and tithi live ONLY in this device's AsyncStorage — nothing syncs, nothing is
// shared, nothing appears on any share surface. Dates are computed on-device by
// the panchang engine (src/panchang/pitruSmaran.ts).
const STORAGE_KEY = '@vedansh/pitru-smaran';
const PAYLOAD_VERSION = 1;

type StoredPayload = { version: number; entries: SmaranEntry[] };

type PitruSmaranContextValue = {
  entries: SmaranEntry[];
  isLoading: boolean;
  addEntry: (entry: SmaranEntry) => void;
  updateEntry: (id: string, patch: Partial<Omit<SmaranEntry, 'id'>>) => void;
  removeEntry: (id: string) => void;
  getEntry: (id: string) => SmaranEntry | null;
};

const PitruSmaranContext = createContext<PitruSmaranContextValue>({
  entries: [],
  isLoading: true,
  addEntry: () => {},
  updateEntry: () => {},
  removeEntry: () => {},
  getEntry: () => null,
});

const RELATIONS: readonly SmaranRelation[] = [
  'pitaji', 'mataji', 'dadaji', 'dadiji', 'nanaji', 'naniji', 'anya',
];

function isSmaranEntry(raw: unknown): raw is SmaranEntry {
  if (!raw || typeof raw !== 'object') return false;
  const entry = raw as SmaranEntry;
  if (typeof entry.id !== 'string' || entry.id.length === 0) return false;
  if (!RELATIONS.includes(entry.relation)) return false;
  if (entry.name !== undefined && typeof entry.name !== 'string') return false;
  if (typeof entry.createdAtMs !== 'number') return false;
  if (entry.tithiRule === 'sarvapitri') return true;
  return typeof entry.tithiRule === 'object' && entry.tithiRule !== null && isValidTithiRule(entry.tithiRule);
}

// Versioned payload parse. Unknown versions and malformed rows are dropped rather
// than crashing hydration — a future version bump migrates here.
function parsePayload(raw: string): SmaranEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return [];
    const payload = parsed as StoredPayload;
    if (payload.version !== PAYLOAD_VERSION || !Array.isArray(payload.entries)) return [];
    return payload.entries.filter(isSmaranEntry);
  } catch {
    return []; // corrupted JSON — treat as empty, never throw during hydration
  }
}

export function PitruSmaranProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<SmaranEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setEntries(parsePayload(raw));
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((next: SmaranEntry[]) => {
    setEntries(next);
    const payload: StoredPayload = { version: PAYLOAD_VERSION, entries: next };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => undefined);
  }, []);

  const addEntry = useCallback(
    (entry: SmaranEntry) => {
      if (isLoading || !isSmaranEntry(entry)) return;
      persist([...entries.filter((e) => e.id !== entry.id), entry]);
    },
    [isLoading, entries, persist]
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<Omit<SmaranEntry, 'id'>>) => {
      if (isLoading) return;
      const next = entries.map((e) => (e.id === id ? { ...e, ...patch, id } : e));
      if (next.every((e, i) => e === entries[i]) || !next.every(isSmaranEntry)) return;
      persist(next);
    },
    [isLoading, entries, persist]
  );

  const removeEntry = useCallback(
    (id: string) => {
      if (isLoading) return;
      persist(entries.filter((e) => e.id !== id));
    },
    [isLoading, entries, persist]
  );

  const getEntry = useCallback(
    (id: string) => entries.find((e) => e.id === id) ?? null,
    [entries]
  );

  return (
    <PitruSmaranContext.Provider value={{ entries, isLoading, addEntry, updateEntry, removeEntry, getEntry }}>
      {children}
    </PitruSmaranContext.Provider>
  );
}

export function usePitruSmaran() {
  return useContext(PitruSmaranContext);
}
