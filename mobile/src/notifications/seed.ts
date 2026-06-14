/**
 * Deterministic verse selection for daily notifications.
 *
 * The same `YYYY-MM-DD` date key always resolves to the same verse from the pool.
 * This means: rescheduling within a day never changes today's verse, and the
 * scheduler can pre-compute a 30-day window without per-day randomness drift.
 *
 * Bundle-only: pool is in-memory from `versePool.ts`, hash is pure JS, no I/O.
 */

import type { UniformVerse } from '@/data/versePool';

/**
 * Format a Date as a local-time `YYYY-MM-DD` key.
 * Local time (not UTC) so the user's "today" matches their phone's "today."
 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Stable 32-bit FNV-1a hash of a string. Deterministic across platforms and
 * JS engines — used to map a date key to a pool index.
 */
export function hashDateKey(key: string): number {
  let h = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    // Multiply by FNV prime; force into uint32.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/**
 * Pick the verse for a given date from the supplied pool.
 *
 * Pure function: same `dateKey` + same `pool` length → same index, every time.
 * Returns `null` only when the pool is empty (no active sections — should never
 * happen in production, but the caller decides how to handle).
 */
export function pickVerseForDateKey(dateKey: string, pool: UniformVerse[]): UniformVerse | null {
  if (pool.length === 0) return null;
  const idx = hashDateKey(dateKey) % pool.length;
  return pool[idx] ?? null;
}

/** A single reminder firing: a calendar day plus a `HHMM` time-of-day. */
export type ReminderSlot = { dateKey: string; hhmm: string };

/**
 * Assign a verse-pool index to each reminder slot (a date + time-of-day).
 *
 * The whole point of multiple daily reminders is variety: distinct times on the
 * same day must surface *different* verses, not the same verse repeated. We
 * scatter by hashing the full `dateKey + hhmm` slot key (so each time-of-day and
 * each day lands somewhere different in the pool), then forward-probe within the
 * day to resolve the rare hash collision — guaranteeing every reminder on a
 * given day is a distinct verse (up to the pool size).
 *
 * Pure and deterministic: the same ordered slots + pool length always yield the
 * same indices, so rescheduling within a day never reshuffles content. Returns
 * `-1` for every slot when the pool is empty (caller skips those).
 */
export function assignSlotVerseIndices(slots: ReminderSlot[], poolLength: number): number[] {
  if (poolLength === 0) return slots.map(() => -1);
  const usedByDay = new Map<string, Set<number>>();
  return slots.map(({ dateKey, hhmm }) => {
    let used = usedByDay.get(dateKey);
    if (!used) {
      used = new Set<number>();
      usedByDay.set(dateKey, used);
    }
    let idx = hashDateKey(`${dateKey}T${hhmm}`) % poolLength;
    let guard = 0;
    while (used.has(idx) && guard < poolLength) {
      idx = (idx + 1) % poolLength;
      guard += 1;
    }
    used.add(idx);
    return idx;
  });
}
