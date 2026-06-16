// In-memory store for per-location observance years, shared between the sync
// festival engine (reads) and the AsyncStorage-backed observanceCache (writes).
// Lives in its own module — with no React Native or AsyncStorage imports — so the
// engine stays importable under `tsx --test`, and so festivalEngine ⇄ observanceCache
// never form an import cycle.
import type { CalendarSystem } from './types';

export type StoredObservanceEntry = { id: string; date: string };

const store = new Map<string, StoredObservanceEntry[]>();
const listeners = new Set<() => void>();

export function observanceStoreKey(cityId: string, calendarSystem: CalendarSystem, year: number): string {
  return `${cityId}:${calendarSystem}:${year}`;
}

export function getStoredObservanceYear(
  cityId: string,
  calendarSystem: CalendarSystem,
  year: number
): StoredObservanceEntry[] | null {
  return store.get(observanceStoreKey(cityId, calendarSystem, year)) ?? null;
}

export function setStoredObservanceYear(
  cityId: string,
  calendarSystem: CalendarSystem,
  year: number,
  entries: StoredObservanceEntry[]
): void {
  store.set(observanceStoreKey(cityId, calendarSystem, year), entries);
  listeners.forEach((listener) => listener());
}

// Hooks subscribe so Ujjain-fallback observances silently upgrade to
// location-accurate ones when a background scan or hydration lands.
export function subscribeObservanceStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
