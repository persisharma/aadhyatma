import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { computePanchangForDate } from './engine';
import { computeMuhuratDay } from './muhurat';
import { getUpcomingObservances } from './festivalEngine';
import {
  computeAstaFlags,
  evaluateDay,
  getEventRule,
  summarize,
  type DayVerdict,
  type FinderSummary,
  type OccasionId,
} from './eventMuhurat';
import { ABUJH_RULE_IDS, pushyaYogaFor, type PushyaYoga } from './abujhMuhurat';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarSystem } from './usePanchang';
import type { PanchangData, ResolvedObservance } from './types';

/** Default finder horizon (~3 months) and the extended "first dates after" reach. */
export const FINDER_WINDOW_DAYS = 92;
const FIRST_AFTER_MAX_DAYS = 260;
const CHUNK_DAYS = 7;

export type FinderState = {
  loading: boolean;
  summary: FinderSummary | null;
  /** When the window is empty: the first shreshtha/madhyam days beyond it. */
  firstAfter: DayVerdict[];
};

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0));

const dayAt = (start: Date, i: number) =>
  new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);

/**
 * Per-day scan inputs — the panchang solve and the combustion (asta) flags — are
 * occasion-INDEPENDENT: they depend only on the location, calendar system and
 * civil day, never on which occasion is being graded. The expensive part is the
 * sunrise/sunset bisection inside `computePanchangForDate`; recomputing all ~92
 * days on every occasion tap is what made each card feel slow. Cache them
 * module-side keyed by location + system + start-day so the FIRST occasion pays
 * the astronomy cost once and every later occasion (or re-entry) reuses it —
 * `evaluateDay` over cached days is effectively free. Bounded to a few keys so
 * it can't grow without limit across cities/day-rollovers.
 */
type DayInputs = { p: PanchangData; asta: ReturnType<typeof computeAstaFlags> };
const DAY_INPUT_CACHE = new Map<string, Map<number, DayInputs>>();
const MAX_CACHED_KEYS = 3;

function dayInputsFor(key: string): Map<number, DayInputs> {
  let cache = DAY_INPUT_CACHE.get(key);
  if (!cache) {
    if (DAY_INPUT_CACHE.size >= MAX_CACHED_KEYS) {
      const oldest = DAY_INPUT_CACHE.keys().next().value;
      if (oldest !== undefined) DAY_INPUT_CACHE.delete(oldest);
    }
    cache = new Map();
    DAY_INPUT_CACHE.set(key, cache);
  }
  return cache;
}

/**
 * Scan `days` civil days from today for the occasion, one panchang solve per
 * day (each day's "next sunrise" is the next day's solve, reused). Chunked
 * behind InteractionManager + setTimeout yields — the same responsiveness
 * boundary as useMuhurat/useObservancesForDate — so Home/Panchang interactions
 * are never blocked by the sweep.
 */
export function useMuhuratFinder(occasionId: OccasionId, days: number = FINDER_WINDOW_DAYS): FinderState {
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [state, setState] = useState<FinderState>({ loading: true, summary: null, firstAfter: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, summary: null, firstAfter: [] });
    const task = InteractionManager.runAfterInteractions(async () => {
      const opts = { calendarSystem, location };
      const rule = getEventRule(occasionId);
      const start = startOfToday();
      const scanKey = `${location.cityId}|${location.latitude},${location.longitude}|${calendarSystem}|${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`;
      const scan = dayInputsFor(scanKey);
      // Compute a day's occasion-independent inputs once, then reuse across every
      // occasion. Flags whether it actually did astronomy so the loop can skip
      // yielding in fully-cached chunks (a repeat occasion resolves in one tick).
      let heavyThisChunk = false;
      const inputsAt = (i: number): DayInputs => {
        let di = scan.get(i);
        if (!di) {
          const d = dayAt(start, i);
          const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
          di = { p: computePanchangForDate(d, opts), asta: computeAstaFlags(noon) };
          scan.set(i, di);
          heavyThisChunk = true;
        }
        return di;
      };
      const verdicts: DayVerdict[] = [];
      const firstAfter: DayVerdict[] = [];
      for (let i = 0; i < FIRST_AFTER_MAX_DAYS; i += 1) {
        if (cancelled) return;
        const d = dayAt(start, i);
        const { p, asta } = inputsAt(i);
        const { p: next } = inputsAt(i + 1);
        const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
        const v = evaluateDay(rule, d.getTime(), d.getDay(), p, m, asta);
        if (i < days) {
          verdicts.push(v);
        } else if (v.tier !== 'excluded') {
          firstAfter.push(v);
        }
        // Past the window we only keep going while the window came up empty.
        if (i >= days - 1) {
          const anyInWindow = verdicts.some((x) => x.tier !== 'excluded');
          if (anyInWindow || firstAfter.length >= 3) break;
        }
        if (i % CHUNK_DAYS === CHUNK_DAYS - 1) {
          if (heavyThisChunk) await yieldToUi();
          heavyThisChunk = false;
        }
      }
      if (cancelled) return;
      setState({ loading: false, summary: summarize(verdicts), firstAfter });
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [occasionId, days, calendarSystem, location]);

  return state;
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

export type AbujhState = { loading: boolean; days: AbujhDay[] };

/**
 * Upcoming abujh days: festival-anchored ones come from the festival engine
 * (kshaya/vriddhi handling included — never re-matched here, see
 * abujhMuhurat.ts); Guru/Ravi Pushya days come from the same chunked panchang
 * sweep the finder uses.
 */
export function useAbujhDays(horizonDays: number = FIRST_AFTER_MAX_DAYS): AbujhState {
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [state, setState] = useState<AbujhState>({ loading: true, days: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, days: [] });
    const task = InteractionManager.runAfterInteractions(async () => {
      const opts = { calendarSystem, location };
      const start = startOfToday();
      const festival: AbujhDay[] = getUpcomingObservances(start, 60, calendarSystem, horizonDays, location)
        .filter((o: ResolvedObservance) => ABUJH_RULE_IDS.includes(o.rule.id))
        .map((o) => {
          const p = computePanchangForDate(o.date, opts);
          return {
            dateMs: o.date.getTime(),
            nameHi: o.rule.nameHi,
            nameEn: o.rule.nameEn,
            nakshatraHi: p.nakshatra.nameHi,
            nakshatraEn: p.nakshatra.nameEn,
            source: 'festival' as const,
          };
        });
      if (cancelled) return;
      const pushya: AbujhDay[] = [];
      for (let i = 0; i < horizonDays; i += 1) {
        if (cancelled) return;
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        // Only Thursdays/Sundays can carry the yoga — skip the other five solves.
        if (d.getDay() !== 0 && d.getDay() !== 4) continue;
        const p = computePanchangForDate(d, opts);
        const yoga: PushyaYoga | null = pushyaYogaFor(p, d.getDay());
        if (yoga) {
          pushya.push({
            dateMs: d.getTime(),
            nameHi: yoga.nameHi,
            nameEn: yoga.nameEn,
            nakshatraHi: p.nakshatra.nameHi,
            nakshatraEn: p.nakshatra.nameEn,
            source: 'pushya',
          });
        }
        if (i % (CHUNK_DAYS * 2) === 0) await yieldToUi();
      }
      if (cancelled) return;
      const days = [...festival, ...pushya].sort((a, b) => a.dateMs - b.dateMs);
      setState({ loading: false, days });
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [calendarSystem, location, horizonDays]);

  return state;
}
