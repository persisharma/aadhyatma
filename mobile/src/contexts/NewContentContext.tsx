import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { library } from '@/data/texts';
import { temples } from '@/data/theerth/temples';
import { compareSemver } from '@/utils/semverCompare';

const STORAGE_KEY = '@vedansh/new-content-state';

/**
 * Keys written ONLY by a deliberate user action in a prior session — never
 * during a fresh cold-start mount. Used to distinguish a returning user
 * (upgrader) from a genuine fresh install at the feature's debut without racing
 * sibling providers that write their keys on mount (e.g. notif-meta).
 */
const UPGRADER_SIGNAL_KEYS = [
  '@vedansh/bookmarks',
  '@vedansh/reading-progress',
  '@vedansh/search-recent',
  '@vedansh/japam-counter',
  '@vedansh/language',
];

/** An entry counts as debut-new only if its addedInVersion is above this floor. */
const PRE_FEATURE_BASELINE = '1.2.0';

/**
 * Temples are tracked alongside library texts but live in a separate dataset, so
 * their NEW-state keys are namespaced to guarantee they never collide with a
 * library entry id. Screens that render temples build their key via this helper.
 */
export const TEMPLE_NEW_PREFIX = 'theerth-temple:';
export function templeNewKey(templeId: string): string {
  return `${TEMPLE_NEW_PREFIX}${templeId}`;
}

/**
 * Unified registry of everything that participates in NEW tracking: discoverable
 * library texts plus every temple. Keeping one list means isNew / markSeen /
 * hasNewInCategory work identically for texts and temples, and the upgrader-vs-
 * fresh seeding below covers both in one pass.
 */
type Discoverable = { id: string; category: string; addedInVersion?: string };

const discoverableEntries = library.filter((e) => e.status === 'active' && !e.hidden);
const discoverables: Discoverable[] = [
  ...discoverableEntries.map((e) => ({
    id: e.id,
    category: e.category as string,
    addedInVersion: e.addedInVersion,
  })),
  ...temples.map((t) => ({
    id: templeNewKey(t.id),
    category: 'theerth',
    addedInVersion: t.addedInVersion,
  })),
];
const discoverableIds = discoverables.map((d) => d.id);
const debutNewIds = discoverables
  .filter(
    (d) => d.addedInVersion != null && compareSemver(d.addedInVersion, PRE_FEATURE_BASELINE) > 0
  )
  .map((d) => d.id);

/** Seed for a returning user: everything discoverable is known EXCEPT debut-new. */
function upgraderSeed(): string[] {
  return discoverableIds.filter((id) => !debutNewIds.includes(id));
}

type NewContentContextValue = {
  isLoading: boolean;
  /** True when `id` is a discoverable entry the user has not yet acknowledged. */
  isNew: (id: string) => boolean;
  /** True when a category contains at least one NEW (discoverable, unacknowledged) entry. */
  hasNewInCategory: (categoryId: string) => boolean;
  /** Mark an entry acknowledged (clears its NEW badge, persisted). */
  markSeen: (id: string) => void;
  /** __DEV__-only test hook: force the upgrader state so e2e can verify badges. */
  devSimulateUpgrade: () => void;
  /** __DEV__-only test hook: reset to the "nothing new" state (everything known) so e2e leaves clean state. */
  devResetNewState: () => void;
};

const NewContentContext = createContext<NewContentContextValue>({
  isLoading: true,
  isNew: () => false,
  hasNewInCategory: () => false,
  markSeen: () => {},
  devSimulateUpgrade: () => {},
  devResetNewState: () => {},
});

export function NewContentProvider({ children }: { children: React.ReactNode }) {
  const [knownIds, setKnownIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.knownIds)) {
              // Existing state — use as-is. Any discoverable id not in this set
              // (e.g. content added since last run) is automatically NEW.
              if (!cancelled) setKnownIds(parsed.knownIds);
              return;
            }
          } catch {
            /* corrupt blob — fall through to debut seed */
          }
        }
        // Debut / fresh install: classify upgrader vs fresh, then seed.
        let isUpgrader = false;
        try {
          const keys = await AsyncStorage.getAllKeys();
          isUpgrader = UPGRADER_SIGNAL_KEYS.some((k) => keys.includes(k));
        } catch {
          isUpgrader = false;
        }
        const seed = isUpgrader ? upgraderSeed() : discoverableIds.slice();
        if (!cancelled) setKnownIds(seed);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ knownIds: seed })).catch(
          () => undefined
        );
      } catch {
        // Storage read failed entirely — treat as "everything already known"
        // so we DON'T flash NEW on every entry (empty knownIds would mark all
        // discoverable entries new, the opposite of the safe fallback).
        if (!cancelled) setKnownIds(discoverableIds.slice());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: string[]) => {
    setKnownIds(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ knownIds: next })).catch(() => undefined);
  }, []);

  const isNew = useCallback(
    (id: string) => !isLoading && discoverableIds.includes(id) && !knownIds.includes(id),
    [isLoading, knownIds]
  );

  const hasNewInCategory = useCallback(
    (categoryId: string) =>
      !isLoading &&
      discoverables.some((d) => d.category === categoryId && !knownIds.includes(d.id)),
    [isLoading, knownIds]
  );

  const markSeen = useCallback(
    (id: string) => {
      if (isLoading) return;
      if (knownIds.includes(id)) return;
      persist([...knownIds, id]);
    },
    [isLoading, knownIds, persist]
  );

  const devSimulateUpgrade = useCallback(() => {
    if (!__DEV__) return;
    persist(upgraderSeed());
  }, [persist]);

  const devResetNewState = useCallback(() => {
    if (!__DEV__) return;
    persist(discoverableIds.slice()); // everything known → nothing new
  }, [persist]);

  return (
    <NewContentContext.Provider
      value={{ isLoading, isNew, hasNewInCategory, markSeen, devSimulateUpgrade, devResetNewState }}
    >
      {children}
    </NewContentContext.Provider>
  );
}

export function useNewContent() {
  return useContext(NewContentContext);
}
