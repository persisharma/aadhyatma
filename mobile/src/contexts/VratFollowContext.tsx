import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// PRD-09 §5.1 — a thin local-first follow + priority store mirroring
// BookmarksContext / RoutineContext. Each follow references an ObservanceRule
// by id (festivals.ts); ordering is explicit, user-controlled priority.
const STORAGE_KEY = '@vedansh/vrat-follows';
// PRD-09 §5.1 — the global reminder default; per-vrat prefs override it.
const REMINDER_DEFAULT_KEY = '@vedansh/vrat-reminder-default';

export type VratReminderPref = {
  advanceDays: 0 | 1 | 2 | 3; // evening-before notice; 0 = off
  dayOf: boolean; // morning-of notice
  dayOfTime?: { hour: number; minute: number }; // else global default
};

/** Built-in default when the user hasn't customized: evening-before + 07:00 day-of. */
export const DEFAULT_REMINDER: VratReminderPref = {
  advanceDays: 1,
  dayOf: true,
  dayOfTime: { hour: 7, minute: 0 },
};

export type VratFollow = {
  ruleId: string; // -> ObservanceRule.id in festivals.ts
  order: number; // follow order (lower = followed earlier); used as the reminder
  // scheduling priority fallback when over the iOS cap (see vratReminderPure.ts)
  addedAt: number;
  reminder?: VratReminderPref; // undefined => use global default (P3)
};

type VratFollowContextValue = {
  follows: VratFollow[]; // always in follow order (order === index)
  isLoading: boolean;
  followCount: number;
  reminderCount: number; // follows whose resolved reminder still fires
  reminderDefault: VratReminderPref;
  isFollowing: (ruleId: string) => boolean;
  follow: (ruleId: string) => void;
  unfollow: (ruleId: string) => void;
  setReminder: (ruleId: string, pref: VratReminderPref | undefined) => void;
  setReminderDefault: (pref: VratReminderPref) => void;
};

const VratFollowContext = createContext<VratFollowContextValue>({
  follows: [],
  isLoading: true,
  followCount: 0,
  reminderCount: 0,
  reminderDefault: DEFAULT_REMINDER,
  isFollowing: () => false,
  follow: () => {},
  unfollow: () => {},
  setReminder: () => {},
  setReminderDefault: () => {},
});

// Validate a stored reminder preference; returns null if malformed so callers
// fall back to the global default.
function normalizeReminderPref(raw: unknown): VratReminderPref | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { advanceDays?: unknown; dayOf?: unknown; dayOfTime?: unknown };
  const adv = r.advanceDays;
  if (adv !== 0 && adv !== 1 && adv !== 2 && adv !== 3) return null;
  if (typeof r.dayOf !== 'boolean') return null;
  let dayOfTime: { hour: number; minute: number } | undefined;
  const t = r.dayOfTime as { hour?: unknown; minute?: unknown } | undefined;
  if (t && typeof t.hour === 'number' && typeof t.minute === 'number') {
    dayOfTime = { hour: t.hour, minute: t.minute };
  }
  return { advanceDays: adv, dayOf: r.dayOf, ...(dayOfTime ? { dayOfTime } : {}) };
}

// Load-time normalization: drop malformed entries, de-dup by ruleId (keep the
// first seen), sort by stored order, then re-index to a clean 0..n-1 sequence.
function normalize(raw: unknown): { items: VratFollow[]; changed: boolean } {
  if (!Array.isArray(raw)) return { items: [], changed: false };
  let changed = false;
  const seen = new Set<string>();
  const valid: VratFollow[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') {
      changed = true;
      continue;
    }
    const item = entry as Partial<VratFollow>;
    if (typeof item.ruleId !== 'string' || item.ruleId.length === 0) {
      changed = true;
      continue;
    }
    if (seen.has(item.ruleId)) {
      changed = true;
      continue;
    }
    seen.add(item.ruleId);
    const reminder = normalizeReminderPref(item.reminder);
    valid.push({
      ruleId: item.ruleId,
      addedAt: typeof item.addedAt === 'number' ? item.addedAt : 0,
      order: typeof item.order === 'number' ? item.order : Number.MAX_SAFE_INTEGER,
      ...(reminder ? { reminder } : {}),
    });
  }
  valid.sort((a, b) => a.order - b.order);
  const items = valid.map((it, idx) => {
    if (it.order !== idx) changed = true;
    return { ...it, order: idx };
  });
  return { items, changed };
}

// Rewrite `order` to match array position; reuse unchanged objects.
function reindex(list: VratFollow[]): VratFollow[] {
  return list.map((it, idx) => (it.order === idx ? it : { ...it, order: idx }));
}

export function VratFollowProvider({ children }: { children: React.ReactNode }) {
  const [follows, setFollows] = useState<VratFollow[]>([]);
  const [reminderDefault, setReminderDefaultState] = useState<VratReminderPref>(DEFAULT_REMINDER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rawFollows, rawDefault] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(REMINDER_DEFAULT_KEY),
        ]);
        if (!cancelled && rawFollows) {
          try {
            const { items, changed } = normalize(JSON.parse(rawFollows));
            setFollows(items);
            if (changed) {
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
            }
          } catch {
            /* corrupted follows JSON — leave empty */
          }
        }
        if (!cancelled && rawDefault) {
          try {
            const pref = normalizeReminderPref(JSON.parse(rawDefault));
            if (pref) setReminderDefaultState(pref);
          } catch {
            /* corrupted default JSON — keep the built-in default */
          }
        }
      } catch {
        /* storage read failure — safe defaults (empty follows, built-in default) */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: VratFollow[]) => {
    setFollows(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const follow = useCallback(
    (ruleId: string) => {
      if (isLoading) return;
      if (follows.some((f) => f.ruleId === ruleId)) return; // idempotent
      persist([...follows, { ruleId, addedAt: Date.now(), order: follows.length }]);
    },
    [isLoading, follows, persist]
  );

  const unfollow = useCallback(
    (ruleId: string) => {
      if (isLoading) return;
      if (!follows.some((f) => f.ruleId === ruleId)) return;
      persist(reindex(follows.filter((f) => f.ruleId !== ruleId)));
    },
    [isLoading, follows, persist]
  );

  const isFollowing = useCallback(
    (ruleId: string) => follows.some((f) => f.ruleId === ruleId),
    [follows]
  );

  const setReminderDefault = useCallback((pref: VratReminderPref) => {
    setReminderDefaultState(pref);
    AsyncStorage.setItem(REMINDER_DEFAULT_KEY, JSON.stringify(pref)).catch(() => undefined);
  }, []);

  const setReminder = useCallback(
    (ruleId: string, pref: VratReminderPref | undefined) => {
      if (isLoading) return;
      if (!follows.some((f) => f.ruleId === ruleId)) return; // no-op for non-followed
      const next = follows.map((f) => {
        if (f.ruleId !== ruleId) return f;
        if (pref === undefined) {
          const copy = { ...f };
          delete copy.reminder;
          return copy;
        }
        return { ...f, reminder: pref };
      });
      persist(next);
    },
    [isLoading, follows, persist]
  );

  // "reminders on" = follows whose resolved reminder (per-vrat override, else the
  // global default) would still fire at least one notice.
  const reminderCount = follows.filter((f) => {
    const r = f.reminder ?? reminderDefault;
    return r.dayOf || r.advanceDays > 0;
  }).length;

  return (
    <VratFollowContext.Provider
      value={{
        follows,
        isLoading,
        followCount: follows.length,
        reminderCount,
        reminderDefault,
        isFollowing,
        follow,
        unfollow,
        setReminder,
        setReminderDefault,
      }}
    >
      {children}
    </VratFollowContext.Provider>
  );
}

export function useVratFollows() {
  return useContext(VratFollowContext);
}
