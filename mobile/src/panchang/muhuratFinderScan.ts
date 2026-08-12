/**
 * Framework-free core of the Event Muhurat Finder scans (PRD-16). Kept out of
 * the React hook so it holds NO react/react-native imports and is unit-testable
 * under the tsx engine suite.
 *
 * The per-day inputs themselves live in the shared `muhuratDayStore` — keyed by
 * ABSOLUTE date and scoped to (location, calendar system), so a day solved by
 * any surface (the occasion finder, the picker warmup, the abujh calendar) is
 * free for every other one, survives a midnight rollover, and can be hydrated
 * from disk. The expensive part of every day is the sunrise/sunset bisection
 * inside `computePanchangForDate`, and it is occasion-INDEPENDENT.
 */
import { getUpcomingObservances } from './festivalEngine';
import { computePanchangForDate } from './engine';
import { ABUJH_RULE_IDS, pushyaYogaFor } from './abujhMuhurat';
import { cachedDayInputs, dateKeyFor, dayStoreFor, scopeKeyFor } from './muhuratDayStore';
import type { ScanOptions } from './muhuratDayStore';
import type { ResolvedObservance } from './types';

/** Default finder horizon (~3 months) and the extended "first dates after" reach. */
export const FINDER_WINDOW_DAYS = 92;
export const FIRST_AFTER_MAX_DAYS = 260;
export const CHUNK_DAYS = 7;

/** The location/options shapes both scans pass to the engine — owned by the store. */
export type { ScanLocation, ScanOptions, DayInputs } from './muhuratDayStore';

export const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const dayAt = (start: Date, i: number): Date =>
  new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);

export const yieldToUi = (): Promise<void> => new Promise<void>((r) => setTimeout(r, 0));

/**
 * The civil-date keys a scan of `count` days from `start` will touch — what the
 * hooks hand to `hydrateMuhuratDays` so the persisted solves are in memory
 * before the sweep begins.
 */
export const dayKeysFrom = (start: Date, count: number): string[] =>
  Array.from({ length: count }, (_, i) => dateKeyFor(dayAt(start, i)));

export type AbujhDay = {
  dateMs: number;
  nameHi: string;
  nameEn: string;
  /** Sunrise nakshatra, for the caption line. */
  nakshatraHi: string;
  nakshatraEn: string;
  source: 'festival' | 'pushya';
};

const byDate = (a: AbujhDay, b: AbujhDay) => a.dateMs - b.dateMs;

export type AbujhScanHooks = {
  isCancelled: () => boolean;
  /** Streamed, already-sorted snapshots as more days are found (progressive paint). */
  onProgress: (days: AbujhDay[]) => void;
};

/**
 * Upcoming abujh days. Festival-anchored ones come from the festival engine
 * (kshaya/vriddhi handled there) and are cheap (precomputed for the Ujjain
 * default) — they paint FIRST so the screen never shows a bare spinner. The
 * Guru/Ravi Pushya days then stream in from the shared chunked panchang sweep.
 *
 * Every day-solve is individually guarded: a single malformed solve is skipped,
 * so the scan always resolves (the old un-guarded version could strand the
 * spinner forever on a bad day — the "stuck on click" report).
 */
export async function scanAbujhDays(
  start: Date,
  horizonDays: number,
  opts: ScanOptions,
  hooks: AbujhScanHooks
): Promise<AbujhDay[]> {
  const scan = dayStoreFor(scopeKeyFor(opts.location, opts.calendarSystem));

  // 1) Festival abujh days — cheap, resolved up-front, painted immediately.
  const festival: AbujhDay[] = [];
  try {
    const observances = getUpcomingObservances(start, 60, opts.calendarSystem, horizonDays, opts.location)
      .filter((o: ResolvedObservance) => ABUJH_RULE_IDS.includes(o.rule.id));
    for (const o of observances) {
      if (hooks.isCancelled()) return [...festival].sort(byDate);
      try {
        const p = computePanchangForDate(o.date, opts);
        festival.push({
          dateMs: o.date.getTime(),
          nameHi: o.rule.nameHi,
          nameEn: o.rule.nameEn,
          nakshatraHi: p.nakshatra.nameHi,
          nakshatraEn: p.nakshatra.nameEn,
          source: 'festival',
        });
      } catch {
        // Skip a single malformed festival solve; keep the rest of the list.
      }
    }
  } catch {
    // Festival resolve failed wholesale — still deliver the pushya days below.
  }
  festival.sort(byDate);
  if (festival.length) hooks.onProgress([...festival]);

  // 2) Guru/Ravi Pushya days — the shared, chunked panchang sweep.
  const pushya: AbujhDay[] = [];
  let heavyThisChunk = false;
  for (let i = 0; i < horizonDays; i += 1) {
    if (hooks.isCancelled()) break;
    const d = dayAt(start, i);
    // Only Thursdays/Sundays can carry the yoga — skip the other five solves.
    if (d.getDay() !== 0 && d.getDay() !== 4) continue;
    try {
      const { inputs, miss } = cachedDayInputs(scan, d, opts);
      if (miss) heavyThisChunk = true;
      const yoga = pushyaYogaFor(inputs.p, d.getDay());
      if (yoga) {
        pushya.push({
          dateMs: d.getTime(),
          nameHi: yoga.nameHi,
          nameEn: yoga.nameEn,
          nakshatraHi: inputs.p.nakshatra.nameHi,
          nakshatraEn: inputs.p.nakshatra.nameEn,
          source: 'pushya',
        });
      }
    } catch {
      // A single bad day-solve must not abort the whole scan.
    }
    if (i % (CHUNK_DAYS * 2) === CHUNK_DAYS * 2 - 1) {
      const merged = [...festival, ...pushya].sort(byDate);
      if (merged.length) hooks.onProgress(merged);
      // Only cede the thread when this chunk actually did astronomy — a fully
      // cached chunk (warm picker / re-entry) resolves in a single tick.
      if (heavyThisChunk) await yieldToUi();
      heavyThisChunk = false;
    }
  }

  return [...festival, ...pushya].sort(byDate);
}
