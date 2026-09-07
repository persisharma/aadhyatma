/**
 * Persistence + fan-out for the analytics seam (`events.ts`).
 *
 * One in-memory log, one serialized write queue, one sink list — the shape
 * `birthProfileStore.ts` established. Three rules carried over from it:
 *  - only a SUCCESSFUL read is memoized, so a transient storage failure cannot
 *    pin the session to an empty log with no path back;
 *  - writes are serialized, so two surfaces logging at once cannot lose a row;
 *  - the write is fire-and-forget from the CALLER's point of view but still
 *    queued internally — see `logEvent`.
 *
 * Where this DIFFERS from the other stores, deliberately: a failed write is
 * swallowed. Every other store surfaces failures because the user is looking at
 * the thing that failed to save. Nothing renders this log, so a storage error
 * here must never reach a screen or block the navigation that triggered it —
 * losing a diagnostic row is strictly better than a analytics call that can
 * make a tab tap fail.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  appendEvent,
  parseStoredLog,
  serializeLog,
  sharedScreenView,
  type AnalyticsEvent,
  type AnalyticsSection,
  type EntryPoint,
} from './events';

export const ANALYTICS_LOG_STORAGE_KEY = '@vedansh:analytics-log:v1';

/**
 * A destination for events. Register a real provider here when one is chosen;
 * until then the list is empty and the on-device log is the only record.
 *
 * A sink that throws is dropped from the fan-out for the rest of the session —
 * a broken destination must not turn every logged event into an unhandled
 * rejection.
 */
export type AnalyticsSink = (event: AnalyticsEvent) => void;

let log: readonly AnalyticsEvent[] = [];
let hydrated = false;
let lastReadFailed = false;
let loadPromise: Promise<readonly AnalyticsEvent[]> | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();
const sinks = new Set<AnalyticsSink>();

/** Injectable clock so tests pin `at` without freezing global time. */
let now: () => number = () => Date.now();

export function registerSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

export function getEventsSnapshot(): readonly AnalyticsEvent[] {
  return log;
}

/** Hydrate once per process. Only a successful read is memoized. */
export function loadAnalyticsLog(): Promise<readonly AnalyticsEvent[]> {
  if (hydrated && !lastReadFailed) return Promise.resolve(log);
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(ANALYTICS_LOG_STORAGE_KEY)
      .then((raw) => {
        const parsed = parseStoredLog(raw);
        hydrated = true;
        lastReadFailed = false;
        // Rows logged before hydration landed are kept and ordered after the
        // stored ones: dropping them would lose exactly the launch-path events
        // (a notification tap on a cold start) that the entry_point field is
        // most interesting for.
        log = log.length > 0 ? [...parsed, ...log] : parsed;
        return log;
      })
      .catch(() => {
        loadPromise = null;
        hydrated = true;
        lastReadFailed = true;
        return log;
      });
  }
  return loadPromise;
}

function persist(): void {
  const run = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(ANALYTICS_LOG_STORAGE_KEY, serializeLog(log));
      lastReadFailed = false;
    } catch {
      // Swallowed by design — see the module header.
    }
  };
  writeQueue = writeQueue.then(run, run);
}

/**
 * Record an event: append in memory, hand it to every sink, then persist.
 *
 * Synchronous and non-throwing on purpose. Callers are navigation handlers and
 * render effects; making them await a storage round trip would put AsyncStorage
 * on the tab-tap path, and letting this throw would let a logging bug break
 * navigation.
 */
export function logEvent(event: AnalyticsEvent): void {
  log = appendEvent(log, event);
  for (const sink of [...sinks]) {
    try {
      sink(event);
    } catch {
      sinks.delete(sink);
    }
  }
  persist();
  // Hydration is started lazily by the first event rather than at launch, so
  // this layer adds nothing to the startup graph (`data/__tests__/launchGraph`).
  void loadAnalyticsLog();
}

/**
 * The one call site shape for the shared Panchang/Vrat/Jyotish screen
 * (handover §5). Every view of that screen logs `section` + `entry_point`.
 */
export function logSharedScreenView(section: AnalyticsSection, entryPoint: EntryPoint): void {
  logEvent(sharedScreenView(section, entryPoint, now()));
}

/** Flush the pending write queue. Tests await this; production never needs it. */
export function flushAnalyticsWrites(): Promise<unknown> {
  return writeQueue;
}

export function __setAnalyticsClockForTests(clock: () => number): void {
  now = clock;
}

export function __resetAnalyticsStoreForTests(): void {
  log = [];
  hydrated = false;
  lastReadFailed = false;
  loadPromise = null;
  writeQueue = Promise.resolve();
  sinks.clear();
  now = () => Date.now();
}
