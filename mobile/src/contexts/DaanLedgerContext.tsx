import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setItemWithRetry } from '@/utils/persistWithRetry';
import {
  DAAN_LEDGER_PAYLOAD_VERSION,
  DAAN_LEDGER_STORAGE_KEY,
  isDaanLedgerEntry,
  parseLedgerPayload,
  sanitizeLedgerEntry,
  type DaanLedgerEntry,
  type DaanLedgerPayload,
} from '@/data/daan/ledger';

// दान-पुण्य खाता (PRD-26). Private by construction: entries live ONLY in this
// device's AsyncStorage — nothing syncs, nothing totals, nothing reaches any
// share surface. Gupt entries are sanitized (note/amount/occasion stripped)
// BEFORE persistence, so the detail is never captured, not merely hidden.
type DaanLedgerContextValue = {
  entries: DaanLedgerEntry[];
  isLoading: boolean;
  addEntry: (entry: DaanLedgerEntry) => Promise<boolean>;
  removeEntry: (id: string) => Promise<boolean>;
};

const DaanLedgerContext = createContext<DaanLedgerContextValue>({
  entries: [],
  isLoading: true,
  addEntry: async () => false,
  removeEntry: async () => false,
});

export function DaanLedgerProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DaanLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const entriesRef = useRef<DaanLedgerEntry[]>([]);
  const writes = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    AsyncStorage.getItem(DAAN_LEDGER_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          entriesRef.current = parseLedgerPayload(raw);
          setEntries(entriesRef.current);
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  // Serialize mutations against the last durable state. A failed add must not
  // appear saved, and a queued removal must not be undone by a stale add retry.
  const mutate = useCallback((change: (current: DaanLedgerEntry[]) => DaanLedgerEntry[]) => {
    const result = writes.current.then(async () => {
      const next = change(entriesRef.current);
      const payload: DaanLedgerPayload = { version: DAAN_LEDGER_PAYLOAD_VERSION, entries: next };
      if (!await setItemWithRetry(DAAN_LEDGER_STORAGE_KEY, JSON.stringify(payload))) return false;
      entriesRef.current = next;
      setEntries(next);
      return true;
    });
    writes.current = result.catch(() => undefined);
    return result;
  }, []);

  const addEntry = useCallback(async (entry: DaanLedgerEntry) => {
    if (isLoading) return false;
    const sanitized = sanitizeLedgerEntry(entry);
    if (!isDaanLedgerEntry(sanitized)) return false;
    return mutate(current => [sanitized, ...current.filter(e => e.id !== sanitized.id)]);
  }, [isLoading, mutate]);

  const removeEntry = useCallback(async (id: string) => {
    if (isLoading) return false;
    return mutate(current => current.filter(e => e.id !== id));
  }, [isLoading, mutate]);

  return (
    <DaanLedgerContext.Provider value={{ entries, isLoading, addEntry, removeEntry }}>
      {children}
    </DaanLedgerContext.Provider>
  );
}

export function useDaanLedger() {
  return useContext(DaanLedgerContext);
}
