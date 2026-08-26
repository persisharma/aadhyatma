import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OccasionId } from '@/panchang/eventMuhurat';
import { DEFAULT_REMINDER, type VratReminderPref } from '@/contexts/VratFollowContext';

// PRD-16 §6.7 — the follow + reminder store for the Event Muhurat Finder.
//
// This mirrors VratFollowContext's SHAPE (local-first AsyncStorage, load-time
// normalize, idempotent follow/unfollow, per-item reminder override) but not
// its keying, because the two follow different things:
//
//   a vrat follow  -> a RECURRING ObservanceRule; "next occurrence" is
//                     recomputed by the festival engine and the follow never
//                     expires.
//   a muhurat follow -> ONE specific civil day for one occasion. The date IS
//                     the identity, and once it is past the follow is dead.
//
// Hence: composite key (occasionId + civil date), soonest-first ordering
// instead of a user-ranked `order`, and PRUNE-ON-LOAD. Without the prune a
// one-shot store grows without bound and `followCount` counts reminders that
// can never fire again.
const STORAGE_KEY = '@vedansh/muhurat-follows';

/**
 * A muhurat is a TIME, not a day, so the day-of notice can ride the window
 * itself. Everything else is the shipped vrat pref, imported rather than
 * re-declared so the two cannot drift.
 */
export type MuhuratReminderPref = VratReminderPref & {
  /**
   * Fire the day-of notice a fixed lead before the day's best window instead of
   * at `dayOfTime`. Default for muhurat follows — see DEFAULT_MUHURAT_REMINDER.
   */
  dayOfAtWindow?: boolean;
};

/** Built-in default: the shipped vrat default, plus window-anchored day-of. */
export const DEFAULT_MUHURAT_REMINDER: MuhuratReminderPref = {
  ...DEFAULT_REMINDER,
  dayOfAtWindow: true,
};

export type MuhuratFollow = {
  occasionId: OccasionId;
  /** Civil day, `YYYY-MM-DD` local. Absolute — never an offset from a scan. */
  dateKey: string;
  addedAt: number;
  reminder?: MuhuratReminderPref;
};

type MuhuratFollowContextValue = {
  /** Always soonest-first — the only sane ranking for dated one-shots. */
  follows: MuhuratFollow[];
  isLoading: boolean;
  followCount: number;
  isFollowing: (occasionId: OccasionId, dateKey: string) => boolean;
  getFollow: (occasionId: OccasionId, dateKey: string) => MuhuratFollow | undefined;
  follow: (occasionId: OccasionId, dateKey: string, pref?: MuhuratReminderPref) => void;
  unfollow: (occasionId: OccasionId, dateKey: string) => void;
  setReminder: (occasionId: OccasionId, dateKey: string, pref: MuhuratReminderPref) => void;
  /** Drop follows whose day has passed. Called on load and on day rollover. */
  pruneExpired: (today?: Date) => void;
};

const MuhuratFollowContext = createContext<MuhuratFollowContextValue>({
  follows: [],
  isLoading: true,
  followCount: 0,
  isFollowing: () => false,
  getFollow: () => undefined,
  follow: () => {},
  unfollow: () => {},
  setReminder: () => {},
  pruneExpired: () => {},
});

/** Local civil-date key. Must match `dateKeyFor` in panchangDayStore. */
export function followDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** `YYYY-MM-DD` → local midnight of that day. */
export function dateFromFollowKey(key: string): Date {
  const [y, m, d] = key.split('-').map((n) => Number(n));
  return new Date(y, m - 1, d);
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeReminderPref(raw: unknown): MuhuratReminderPref | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const adv = r.advanceDays;
  if (adv !== 0 && adv !== 1 && adv !== 2 && adv !== 3) return null;
  if (typeof r.dayOf !== 'boolean') return null;
  let dayOfTime: { hour: number; minute: number } | undefined;
  const t = r.dayOfTime as { hour?: unknown; minute?: unknown } | undefined;
  if (t && typeof t.hour === 'number' && typeof t.minute === 'number') {
    dayOfTime = { hour: t.hour, minute: t.minute };
  }
  return {
    advanceDays: adv,
    dayOf: r.dayOf,
    ...(dayOfTime ? { dayOfTime } : {}),
    ...(typeof r.dayOfAtWindow === 'boolean' ? { dayOfAtWindow: r.dayOfAtWindow } : {}),
  };
}

const keyOf = (occasionId: string, dateKey: string) => `${occasionId}:${dateKey}`;

const bySoonest = (a: MuhuratFollow, b: MuhuratFollow) =>
  a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : a.occasionId < b.occasionId ? -1 : 1;

/**
 * Load-time normalization: drop malformed entries, de-dup by (occasion, date),
 * DROP ENTRIES WHOSE DAY IS PAST, then sort soonest-first. `changed` tells the
 * caller to rewrite storage so the prune is durable rather than re-run forever.
 */
export function normalizeFollows(
  raw: unknown,
  todayKey: string
): { items: MuhuratFollow[]; changed: boolean } {
  if (!Array.isArray(raw)) return { items: [], changed: false };
  let changed = false;
  const seen = new Set<string>();
  const valid: MuhuratFollow[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') {
      changed = true;
      continue;
    }
    const item = entry as Partial<MuhuratFollow>;
    if (typeof item.occasionId !== 'string' || item.occasionId.length === 0) {
      changed = true;
      continue;
    }
    if (typeof item.dateKey !== 'string' || !DATE_KEY_RE.test(item.dateKey)) {
      changed = true;
      continue;
    }
    // One-shot: a day that has passed can never fire again. Lexical compare is
    // safe and correct for zero-padded YYYY-MM-DD.
    if (item.dateKey < todayKey) {
      changed = true;
      continue;
    }
    const k = keyOf(item.occasionId, item.dateKey);
    if (seen.has(k)) {
      changed = true;
      continue;
    }
    seen.add(k);
    const reminder = normalizeReminderPref(item.reminder);
    valid.push({
      occasionId: item.occasionId as OccasionId,
      dateKey: item.dateKey,
      addedAt: typeof item.addedAt === 'number' ? item.addedAt : 0,
      ...(reminder ? { reminder } : {}),
    });
  }
  valid.sort(bySoonest);
  return { items: valid, changed };
}

export function MuhuratFollowProvider({ children }: { children: React.ReactNode }) {
  const [follows, setFollows] = useState<MuhuratFollow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          try {
            const { items, changed } = normalizeFollows(JSON.parse(raw), followDateKey(new Date()));
            setFollows(items);
            if (changed) {
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
            }
          } catch {
            /* corrupted JSON — leave empty */
          }
        }
      } catch {
        /* storage read failure — safe default (no follows) */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: MuhuratFollow[]) => {
    setFollows(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const follow = useCallback(
    (occasionId: OccasionId, dateKey: string, pref?: MuhuratReminderPref) => {
      if (isLoading) return;
      if (follows.some((f) => f.occasionId === occasionId && f.dateKey === dateKey)) return; // idempotent
      persist(
        [...follows, { occasionId, dateKey, addedAt: Date.now(), ...(pref ? { reminder: pref } : {}) }].sort(
          bySoonest
        )
      );
    },
    [isLoading, follows, persist]
  );

  const unfollow = useCallback(
    (occasionId: OccasionId, dateKey: string) => {
      if (isLoading) return;
      if (!follows.some((f) => f.occasionId === occasionId && f.dateKey === dateKey)) return;
      persist(follows.filter((f) => !(f.occasionId === occasionId && f.dateKey === dateKey)));
    },
    [isLoading, follows, persist]
  );

  const setReminder = useCallback(
    (occasionId: OccasionId, dateKey: string, pref: MuhuratReminderPref) => {
      if (isLoading) return;
      if (!follows.some((f) => f.occasionId === occasionId && f.dateKey === dateKey)) return;
      persist(
        follows.map((f) =>
          f.occasionId === occasionId && f.dateKey === dateKey ? { ...f, reminder: pref } : f
        )
      );
    },
    [isLoading, follows, persist]
  );

  const pruneExpired = useCallback(
    (today: Date = new Date()) => {
      if (isLoading) return;
      const todayKey = followDateKey(today);
      const kept = follows.filter((f) => f.dateKey >= todayKey);
      if (kept.length !== follows.length) persist(kept);
    },
    [isLoading, follows, persist]
  );

  const isFollowing = useCallback(
    (occasionId: OccasionId, dateKey: string) =>
      follows.some((f) => f.occasionId === occasionId && f.dateKey === dateKey),
    [follows]
  );

  const getFollow = useCallback(
    (occasionId: OccasionId, dateKey: string) =>
      follows.find((f) => f.occasionId === occasionId && f.dateKey === dateKey),
    [follows]
  );

  const value = useMemo(
    () => ({
      follows,
      isLoading,
      followCount: follows.length,
      isFollowing,
      getFollow,
      follow,
      unfollow,
      setReminder,
      pruneExpired,
    }),
    [follows, isLoading, isFollowing, getFollow, follow, unfollow, setReminder, pruneExpired]
  );

  return <MuhuratFollowContext.Provider value={value}>{children}</MuhuratFollowContext.Provider>;
}

export function useMuhuratFollows() {
  return useContext(MuhuratFollowContext);
}
