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
      const verdicts: DayVerdict[] = [];
      const firstAfter: DayVerdict[] = [];
      let p: PanchangData = computePanchangForDate(start, opts);
      for (let i = 0; i < FIRST_AFTER_MAX_DAYS; i += 1) {
        if (cancelled) return;
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const next = computePanchangForDate(
          new Date(start.getFullYear(), start.getMonth(), start.getDate() + i + 1),
          opts
        );
        const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
        const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
        const v = evaluateDay(rule, d.getTime(), d.getDay(), p, m, computeAstaFlags(noon));
        p = next;
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
        if (i % CHUNK_DAYS === CHUNK_DAYS - 1) await yieldToUi();
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
