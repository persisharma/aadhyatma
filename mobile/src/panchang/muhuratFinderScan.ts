/**
 * Framework-free core of the Event Muhurat Finder scans (PRD-16). Kept out of
 * the React hook so it holds NO react/react-native imports and is unit-testable
 * under the tsx engine suite.
 *
 * The per-day inputs themselves live in the shared `panchangDayStore` — keyed by
 * ABSOLUTE date and scoped to (location, calendar system), so a day solved by
 * any surface (the occasion finder, the picker warmup, the abujh calendar) is
 * free for every other one, survives a midnight rollover, and can be hydrated
 * from disk. The expensive part of every day is the sunrise/sunset bisection
 * inside `computePanchangForDate` (reached via the store), and it is
 * occasion-INDEPENDENT.
 */
import { getUpcomingObservances } from './festivalEngine';
import { ABUJH_RULE_IDS, pushyaYogaFor } from './abujhMuhurat';
import { computeMuhuratDay } from './muhurat';
import { evaluateDay, type DayVerdict, type EventRule } from './eventMuhurat';
import { computeShubhYogas, type ShubhYogaWindow } from './shubhYoga';
import {
  cachedDayInputs,
  dateKeyFor,
  dayAt,
  dayStoreFor,
  scopeKeyFor,
  yieldToUi,
} from './panchangDayStore';
import type { ScanOptions } from './panchangDayStore';
import type { PanchangData, ResolvedObservance } from './types';

/** Default finder horizon (~3 months) and the extended "first dates after" reach. */
export const FINDER_WINDOW_DAYS = 92;
export const FIRST_AFTER_MAX_DAYS = 260;
export const CHUNK_DAYS = 7;

/** The location/options shapes both scans pass to the engine — owned by the store. */
export type { ScanLocation, ScanOptions, DayInputs } from './panchangDayStore';

/**
 * Civil-day walking helpers. They live in `panchangDayStore` (RN-free, and free
 * of this module's festival-engine dependency) and are re-exported here so the
 * scans and their tests keep importing them from one place.
 */
export { startOfToday, dayAt, dayKeysFrom, yieldToUi } from './panchangDayStore';

/**
 * Civil-date keys of the FESTIVAL-anchored abujh days in a window.
 *
 * Resolved through `festivalEngine` (never re-matched here — it owns the kshaya
 * fallback and vriddhi dedupe), and memoised per (year, system, location) by
 * `resolveObservancesForYear`, so calling this per-day is cheap.
 *
 * `count` is deliberately unbounded: `getUpcomingObservances` applies
 * `.slice(0, count)` AFTER the horizon filter, so a small count silently
 * truncates by OBSERVANCE COUNT rather than by date. Passing 60 here meant a
 * 260-day scan actually stopped at the 60th observance — about 73 days in —
 * and five of the six abujh rules (Akshaya Tritiya, Vasant Panchami,
 * Dhanteras, Akshaya Navami, Dev Uthani Ekadashi) never reached the screen.
 * `withinDays` is the only bound that belongs here.
 */
export function abujhFestivalKeys(start: Date, horizonDays: number, opts: ScanOptions): Set<string> {
  const keys = new Set<string>();
  try {
    for (const o of getUpcomingObservances(
      start,
      Number.MAX_SAFE_INTEGER,
      opts.calendarSystem,
      horizonDays,
      opts.location
    )) {
      if (ABUJH_RULE_IDS.includes(o.rule.id)) keys.add(dateKeyFor(o.date));
    }
  } catch {
    // A festival-resolve failure must not take down grading; the day simply
    // grades without its abujh exemption.
  }
  return keys;
}

/** Is this civil day अबूझ — festival-anchored or a computed Pushya yoga? */
export function isAbujhDay(date: Date, p: PanchangData, opts: ScanOptions): boolean {
  if (pushyaYogaFor(p, date.getDay())) return true;
  return abujhFestivalKeys(date, 1, opts).has(dateKeyFor(date));
}

/**
 * Grade ONE civil day for one occasion, through the shared day store.
 *
 * The day detail and the follow scheduler both need exactly this — a single
 * day's verdict rather than a sweep — and both must read the SAME store the
 * finder filled, so arriving from the results list is a cache hit rather than
 * two fresh solves. Extracted here (rather than duplicated in each caller) so
 * the "two solves: this day + the next day's sunrise" contract exists once.
 *
 * Returns null when the solve fails, so a caller can degrade instead of
 * throwing — the scheduler in particular must never let one bad day take down
 * the whole re-arm.
 */
export function verdictForDate(
  rule: EventRule,
  date: Date,
  opts: ScanOptions
): { verdict: DayVerdict; p: PanchangData } | null {
  try {
    const map = dayStoreFor(scopeKeyFor(opts.location, opts.calendarSystem));
    const { inputs } = cachedDayInputs(map, date, opts);
    const { inputs: next } = cachedDayInputs(
      map,
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      opts
    );
    const p = inputs.p;
    const m = computeMuhuratDay(p.sunrise, p.sunset, next.p.sunrise, date.getDay());
    const abujh = isAbujhDay(date, p, opts);
    // No `direction` here: यात्रा's दिशा is a scan-time input the results screen
    // owns — a followed day re-grades direction-free (nothing is persisted).
    return {
      verdict: evaluateDay(rule, date.getTime(), date.getDay(), p, m, inputs.asta, {
        abujh,
        lagnas: inputs.lagnas,
      }),
      p,
    };
  } catch {
    return null;
  }
}

/**
 * The day's शुभ योग windows through the shared day store (PRD-27, RULEBOOK §24).
 *
 * ANNOTATION ONLY — deliberately outside `evaluateDay` and `verdictForDate`, so
 * no verdict, tier, ordering or empty-state can ever depend on it. Screens call
 * this beside (never inside) the grading path. Same two-solve contract as
 * `verdictForDate` (this day + the next day's sunrise), so on a post-scan
 * surface both days are cache hits. Returns [] on any solve failure — an
 * annotation must never take down the surface it decorates.
 */
export function shubhYogasForDate(date: Date, opts: ScanOptions): ShubhYogaWindow[] {
  try {
    const map = dayStoreFor(scopeKeyFor(opts.location, opts.calendarSystem));
    const { inputs } = cachedDayInputs(map, date, opts);
    const { inputs: next } = cachedDayInputs(
      map,
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      opts
    );
    return computeShubhYogas(inputs.p, next.p.sunrise);
  } catch {
    return [];
  }
}

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
    // Unbounded count — `withinDays` is the horizon. See abujhFestivalKeys for
    // why a count cap here dropped five of the six abujh rules.
    const observances = getUpcomingObservances(
      start,
      Number.MAX_SAFE_INTEGER,
      opts.calendarSystem,
      horizonDays,
      opts.location
    ).filter((o: ResolvedObservance) => ABUJH_RULE_IDS.includes(o.rule.id));
    for (const o of observances) {
      if (hooks.isCancelled()) return [...festival].sort(byDate);
      try {
        // Through the shared store: these observance days sit inside the sweep's
        // own horizon, so solving them separately duplicated work the pushya loop
        // below (or a previous session) already paid for.
        const { inputs } = cachedDayInputs(scan, o.date, opts);
        const p = inputs.p;
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
