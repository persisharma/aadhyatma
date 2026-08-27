// Persistent per-location observance cache. A non-Ujjain location's festival dates
// are computed once on-device (chunked, off the render path), persisted to
// AsyncStorage, and hydrated into the in-memory observanceStore on app start —
// the slow live scan never reruns for a city it has already covered.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { awaitDerivedCacheReset } from '@/utils/derivedCacheReset';
import { launchMark } from '@/utils/launchTrace';
import { resolveObservancesForYearLiveChunked, type ObservanceLocation } from './festivalEngine';
import { locationKey, UJJAIN_CITY_ID } from './engine';
import {
  getStoredObservanceYear,
  setStoredObservanceYear,
  type StoredObservanceEntry,
} from './observanceStore';
import type { CalendarSystem, ResolvedObservance } from './types';

// Bump whenever OBSERVANCE_RULES or the month engine changes (the same trigger as
// regenerating precomputedObservances.ts); stale versions are purged on hydrate.
// v2: kshaya-tithi fallback + vriddhi dedupe in matchesLunarTithiRuleOnDate.
const CACHE_VERSION = 2;
const KEY_ROOT = '@vedansh:observances:';
const KEY_PREFIX = `${KEY_ROOT}v${CACHE_VERSION}:`;

function storageKey(cityId: string, calendarSystem: CalendarSystem, year: number): string {
  return `${KEY_PREFIX}${cityId}:${calendarSystem}:${year}`;
}

function serialize(results: ResolvedObservance[]): StoredObservanceEntry[] {
  return results.map(({ rule, date }) => ({
    id: rule.id,
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  }));
}

function parseEntries(raw: string | null): StoredObservanceEntry[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (item): item is StoredObservanceEntry =>
        typeof item?.id === 'string' && typeof item?.date === 'string'
    );
  } catch {
    return null;
  }
}

// Load persisted years for a city into the in-memory store and drop entries
// written by older cache versions. Safe to call repeatedly.
export async function hydrateObservanceCache(
  cityId: string,
  calendarSystems: CalendarSystem[],
  years: number[]
): Promise<void> {
  // A build change (store update or OTA) drops these scans wholesale — hydrate
  // after that sweep, never into the teeth of it. `warmObservanceCache` always
  // hydrates before it scans and persists, so gating here orders the writes too.
  await awaitDerivedCacheReset();

  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const stale = allKeys.filter((key) => key.startsWith(KEY_ROOT) && !key.startsWith(KEY_PREFIX));
    if (stale.length > 0) await AsyncStorage.multiRemove(stale);
  } catch {
    // purge is best-effort
  }

  if (cityId === UJJAIN_CITY_ID) return;

  const wanted: { key: string; cityId: string; system: CalendarSystem; year: number }[] = [];
  for (const system of calendarSystems) {
    for (const year of years) {
      if (getStoredObservanceYear(cityId, system, year)) continue;
      wanted.push({ key: storageKey(cityId, system, year), cityId, system, year });
    }
  }
  if (wanted.length === 0) return;

  try {
    const pairs = await AsyncStorage.multiGet(wanted.map((w) => w.key));
    pairs.forEach(([key, raw]) => {
      const meta = wanted.find((w) => w.key === key);
      const entries = parseEntries(raw);
      if (meta && entries) setStoredObservanceYear(meta.cityId, meta.system, meta.year, entries);
    });
  } catch {
    // hydration is best-effort — missing years just stay on the Ujjain fallback
  }
}

// Serialize warm-ups so rapid location switches can't start parallel multi-second
// scans, and tag each call so a newer switch supersedes older queued scans instead of
// stacking them — otherwise tapping through several cities backs up minutes of work.
let warmChain: Promise<void> = Promise.resolve();
let warmSeq = 0;
let latestWarmSeq = 0;

// Ensure the given years exist for this location: hydrate from disk if persisted,
// otherwise run the chunked live scan once and persist the result. Resolves when
// every requested year is available in the in-memory store (or the call is superseded).
export function warmObservanceCache(
  location: ObservanceLocation,
  calendarSystem: CalendarSystem,
  years?: number[]
): Promise<void> {
  const cityId = locationKey(location);
  if (cityId === UJJAIN_CITY_ID) return Promise.resolve();
  const currentYear = new Date().getFullYear();
  const targetYears = years ?? [currentYear, currentYear + 1];
  const mySeq = ++warmSeq;
  latestWarmSeq = mySeq;

  warmChain = warmChain.then(async () => {
    await hydrateObservanceCache(cityId, [calendarSystem], targetYears);
    for (const year of targetYears) {
      // A newer location switch has superseded this scan — stop spending CPU on a
      // city the user has already navigated away from.
      if (mySeq !== latestWarmSeq) return;
      if (getStoredObservanceYear(cityId, calendarSystem, year)) continue;
      // The heaviest thing this app can do on its own: a full year of per-day
      // astronomy, chunked to 8ms slices but continuous for as long as it runs.
      // Marked at both ends because a non-Ujjain city runs it ~3s into launch.
      launchMark(`observance-scan-start ${year}`);
      const results = await resolveObservancesForYearLiveChunked(year, calendarSystem, location);
      launchMark(`observance-scan-done ${year}`);
      const entries = serialize(results);
      setStoredObservanceYear(cityId, calendarSystem, year, entries);
      try {
        await AsyncStorage.setItem(storageKey(cityId, calendarSystem, year), JSON.stringify(entries));
      } catch {
        // persistence is best-effort — in-memory store still serves this session
      }
    }
  });
  return warmChain;
}
