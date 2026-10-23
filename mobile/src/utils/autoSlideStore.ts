import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── The auto-slide store ────────────────────────────────────────────────────
// A module-level store rather than an App-level provider, for the same reason as
// `readCoverageStore`: nothing on the first frame needs it and the launch graph has
// no headroom. It holds the one persisted preference (pace) and the in-memory
// hand-off that lets a running slideshow survive a chapter reader's
// `navigation.replace` into the next chapter.

export type AutoSlideSpeed = 'slow' | 'normal' | 'fast';

export const AUTO_SLIDE_SPEEDS: readonly AutoSlideSpeed[] = ['slow', 'normal', 'fast'];

const STORAGE_KEY = '@vedansh/auto-slide';

/**
 * A page holds for its reading time, not a fixed interval: a Kids Story caption and a
 * Gita verse with commentary differ ~10×, so any single interval is wrong for one of
 * them. Roughly 18 characters a second at `normal`, with a floor so short pages
 * (an aarti refrain) still register.
 */
const BASE_MS = 3000;
const MS_PER_CHAR = 55;
const MIN_MS = 6000;
const MAX_MS = 120_000;
const SPEED_FACTOR: Record<AutoSlideSpeed, number> = { slow: 1.6, normal: 1, fast: 0.6 };

/** How long page `chars` stays up at `speed`. Pure — exported for tests. */
export function autoSlideDurationMs(chars: number, speed: AutoSlideSpeed): number {
  const raw = BASE_MS + Math.max(0, chars) * MS_PER_CHAR;
  return Math.round(Math.min(MAX_MS, Math.max(MIN_MS, raw)) * SPEED_FACTOR[speed]);
}

/**
 * A chapter reader swaps itself for the next chapter with `navigation.replace`, so the
 * screen instance that was playing unmounts and a fresh one mounts. The outgoing
 * instance arms a hand-off; the incoming one with the same `sourceId` takes it within
 * this window and keeps playing. An unclaimed hand-off simply expires.
 */
export const HANDOFF_MS = 3000;

type Handoff = { sourceId: string; owner: number; at: number };

let snapshot: { speed: AutoSlideSpeed; handoff: Handoff | null } = {
  speed: 'normal',
  handoff: null,
};
let hydrated = false;
const listeners = new Set<() => void>();

function set(next: Partial<typeof snapshot>): void {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function isSpeed(v: unknown): v is AutoSlideSpeed {
  return v === 'slow' || v === 'normal' || v === 'fast';
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (raw == null) return;
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'speed' in parsed && isSpeed(parsed.speed)) {
        set({ speed: parsed.speed });
      }
    })
    .catch(() => undefined);
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  hydrate();
  return () => {
    listeners.delete(onStoreChange);
  };
}

const getSnapshot = () => snapshot;

export function useAutoSlideStore(): typeof snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setAutoSlideSpeed(speed: AutoSlideSpeed): void {
  if (speed === snapshot.speed) return;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ speed })).catch(() => undefined);
  set({ speed });
}

export function armAutoSlideHandoff(sourceId: string, owner: number): void {
  set({ handoff: { sourceId, owner, at: Date.now() } });
}

/**
 * Claims a live hand-off for `sourceId` armed by a different screen instance. Returns
 * true at most once per hand-off.
 */
export function takeAutoSlideHandoff(sourceId: string, owner: number): boolean {
  const h = snapshot.handoff;
  if (!h || h.sourceId !== sourceId || h.owner === owner) return false;
  set({ handoff: null });
  return Date.now() - h.at <= HANDOFF_MS;
}

/** Test seam — restores defaults. Not used in app code. */
export function __resetAutoSlideStore(): void {
  snapshot = { speed: 'normal', handoff: null };
  hydrated = false;
}
