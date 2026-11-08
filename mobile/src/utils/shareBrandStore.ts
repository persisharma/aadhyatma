import { useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHARE_BRAND_KEY, initialShareBrand, parseShareBrand, type ShareBrand } from '@/data/shareBrand';

/** Suvichar keeps the sender name here; a first-time profile starts from it (never switched on by it). */
const SUVICHAR_KEY = '@vedansh/suvichar/v1';

type Snapshot = { brand: ShareBrand; hydrated: boolean };

let snapshot: Snapshot = { brand: initialShareBrand, hydrated: false };
let hydrating: Promise<void> | null = null;
let writes: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();

function set(next: Snapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

function suvicharName(raw: string | null): string {
  try {
    const name = JSON.parse(raw ?? '{}')?.name;
    return typeof name === 'string' ? name : '';
  } catch {
    return '';
  }
}

/**
 * Reads the saved profile once per app run. Nothing is loaded at startup: the first
 * Panchang share (or its sheet) asks for it, and every write waits for it, so a default
 * can never overwrite what the person saved.
 */
export function hydrateShareBrand(): Promise<void> {
  if (!hydrating) {
    hydrating = (async () => {
      let brand = initialShareBrand;
      try {
        const raw = await AsyncStorage.getItem(SHARE_BRAND_KEY);
        brand = parseShareBrand(raw);
        if (raw == null) {
          const name = suvicharName(await AsyncStorage.getItem(SUVICHAR_KEY));
          if (name) brand = parseShareBrand(JSON.stringify({ ...brand, name }));
        }
      } catch {
        // Unreadable storage leaves the plain card; the person can still set the profile up.
      }
      set({ brand, hydrated: true });
    })();
  }
  return hydrating;
}

/** Merges, normalizes and saves; writes run one after another and always store the latest profile. */
export async function updateShareBrand(patch: Partial<ShareBrand>): Promise<void> {
  await hydrateShareBrand();
  set({ brand: parseShareBrand(JSON.stringify({ ...snapshot.brand, ...patch })), hydrated: true });
  writes = writes
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(SHARE_BRAND_KEY, JSON.stringify(snapshot.brand)))
    .catch(() => undefined);
  return writes;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => snapshot;

/** The profile as last read or saved (Send as text, at press time). */
export function getShareBrand(): ShareBrand {
  return snapshot.brand;
}

/** The saved profile, live: the sheet's preview and every capture mount read the same value. */
export function useShareBrand(): Snapshot {
  useEffect(() => {
    void hydrateShareBrand();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Jest only: forget the in-memory profile between tests. */
export function resetShareBrandForTests() {
  snapshot = { brand: initialShareBrand, hydrated: false };
  hydrating = null;
  writes = Promise.resolve();
}
