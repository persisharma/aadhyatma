import { runInBackground } from './backgroundWork';
import { findTimingOccurrences, solveOccasion, timingsOnDay, type OccasionTiming, type TimingOccurrence } from './occasionTimings';
import { cachedDayInputsAsync, dayAt, dateKeyFor, dayStoreFor, scopeKeyFor, type ScanOptions } from './panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from './panchangDayCache';
import type { ObservanceLens } from './lenses';

/** One location-scoped, cancellable path for screen, preview, PNG and text.
 * Only shared day inputs persist. No cached answers survive a city change. */
export async function prepareOccasionTimings(date: Date, options: ScanOptions, lenses: ReadonlySet<ObservanceLens>, cancelled = () => false, ruleId?: string): Promise<OccasionTiming[] | undefined> {
  const occurrences: TimingOccurrence[] = [];
  for (const offset of [-1, 0, 1]) {
    const found = await runInBackground(findTimingOccurrences(dayAt(date, offset), options, lenses, ruleId), cancelled);
    if (cancelled() || !found) return;
    occurrences.push(...found);
  }
  const days = new Map<string, Date>();
  for (const o of occurrences) for (const offset of [0, 1]) {
    const day = dayAt(o.date, offset); days.set(dateKeyFor(day), day);
  }
  if (!days.size) return [];
  await hydratePanchangDays(options.location, options.calendarSystem, [...days.keys()]);
  if (cancelled()) return;
  const store = dayStoreFor(scopeKeyFor(options.location, options.calendarSystem));
  for (const day of days.values()) {
    await cachedDayInputsAsync(store, day, options, cancelled);
    if (cancelled()) return;
  }
  function* solve(): Generator<void, OccasionTiming[], void> {
    const items: OccasionTiming[] = [];
    for (const o of occurrences) { items.push(solveOccasion(o, [...days.keys()].map(k => store.get(k)!))); yield; }
    return ruleId ? items : timingsOnDay(items, date);
  }
  const result = await runInBackground(solve(), cancelled);
  if (!cancelled()) { void persistPanchangDays(options.location, options.calendarSystem); return result; }
}
