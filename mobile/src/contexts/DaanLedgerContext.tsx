import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  addEntry: (entry: DaanLedgerEntry) => void;
  removeEntry: (id: string) => void;
};

const DaanLedgerContext = createContext<DaanLedgerContextValue>({
  entries: [],
  isLoading: true,
  addEntry: () => {},
  removeEntry: () => {},
});

export function DaanLedgerProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DaanLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(DAAN_LEDGER_STORAGE_KEY)
      .then((raw) => {
        if (raw) setEntries(parseLedgerPayload(raw));
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((next: DaanLedgerEntry[]) => {
    setEntries(next);
    const payload: DaanLedgerPayload = { version: DAAN_LEDGER_PAYLOAD_VERSION, entries: next };
    AsyncStorage.setItem(DAAN_LEDGER_STORAGE_KEY, JSON.stringify(payload)).catch(() => undefined);
  }, []);

  const addEntry = useCallback(
    (entry: DaanLedgerEntry) => {
      if (isLoading) return;
      const sanitized = sanitizeLedgerEntry(entry);
      if (!isDaanLedgerEntry(sanitized)) return;
      persist([sanitized, ...entries.filter((e) => e.id !== sanitized.id)]);
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

  return (
    <DaanLedgerContext.Provider value={{ entries, isLoading, addEntry, removeEntry }}>
      {children}
    </DaanLedgerContext.Provider>
  );
}

export function useDaanLedger() {
  return useContext(DaanLedgerContext);
}
