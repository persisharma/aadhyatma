import type { PanchangData, PanchangElement, Paksha } from './types';
import { TITHI_NAMES_HI, TITHI_NAMES_EN, LUNAR_MONTH_NAMES_HI, LUNAR_MONTH_NAMES_EN } from './names';

export type PrevailingTithi = {
  index: number;
  nameHi: string;
  nameEn: string;
  paksha: PanchangData['tithi']['paksha'];
  // Null when the running tithi's end is not solvable from this day's data —
  // the successor case below, whose end lands after the next sunrise and so
  // belongs to tomorrow's solve.
  endTime: Date | null;
};

/**
 * The tithi actually running at `at`, for a live "today" surface. PURE — the
 * caller passes the instant; no `Date.now()` here.
 *
 * A civil day's headline tithi is the one current AT SUNRISE (udaya-vyapini,
 * the convention every list/tile surface keeps), but a tithi lasts ~20–27 h,
 * so on most days it ends mid-day and a different tithi is running by evening
 * — and on kshaya days a second tithi begins AND ends before the next sunrise.
 * Point queries walk the day's solved chain:
 *
 *   sunrise tithi (till its endTime)
 *     → kshaya tithi when present (till its endTime)
 *       → the successor by index, (last + 1) % 30 — its end belongs to the
 *         next civil day's solve, so endTime is null rather than a guess.
 *
 * A null endTime on a link means "did not end within this day" and terminates
 * the walk there. Instants before sunrise resolve to the sunrise tithi: it is
 * almost always the one already running pre-dawn (it began the previous day),
 * and the rare pre-dawn end would need yesterday's solve to name — the sunrise
 * answer is the almanac's own for that day.
 *
 * `tithiChain` is that walk as DATA — the ordered links, link 0 always the
 * sunrise tithi — and `prevailingTithi` is the point query over it. Surfaces
 * that must render the handover rather than ask about one instant (the
 * home-screen widget, which precomputes its own refresh instants because
 * WidgetKit/AppWidget draw off a timeline, not a live clock) read the chain, so
 * they can never name a successor the live query would not.
 */
export function tithiChain(p: PanchangData): PrevailingTithi[] {
  const { tithi, kshayaTithi } = p;
  const link = (element: PanchangElement & { paksha: Paksha }): PrevailingTithi => ({
    index: element.index,
    nameHi: element.nameHi,
    nameEn: element.nameEn,
    paksha: element.paksha,
    endTime: element.endTime,
  });
  const chain: PrevailingTithi[] = [link(tithi)];
  if (!tithi.endTime) return chain;
  if (kshayaTithi) {
    chain.push(link(kshayaTithi));
    if (!kshayaTithi.endTime) return chain;
  }
  const successor = ((kshayaTithi ?? tithi).index + 1) % 30;
  chain.push({
    index: successor,
    nameHi: TITHI_NAMES_HI[successor],
    nameEn: TITHI_NAMES_EN[successor],
    paksha: successor < 15 ? 'shukla' : 'krishna',
    endTime: null,
  });
  return chain;
}

export function prevailingTithi(p: PanchangData, at: Date): PrevailingTithi {
  const chain = tithiChain(p);
  return chain.find((link) => !link.endTime || at.getTime() <= link.endTime.getTime()) ?? chain[chain.length - 1];
}

/**
 * The tithi that TAKES OVER later on this same civil day, or null when no
 * handover happens within it.
 *
 * A day is labelled by its sunrise tithi (udaya-vyapini), and that tithi
 * usually ends mid-morning — so "तृतीया तक 08:51" states when the label stops
 * being true without ever saying what is true for the remaining fifteen hours.
 * That is the gap this fills: the rest of the day belongs to the successor, and
 * a vrat fixed on the successor's tithi is kept on THIS date, not the next one
 * the almanac labels with it.
 *
 * Null — deliberately, rather than a name that would mislead — when:
 * - the sunrise tithi has no end in this day's solve (it runs past the next
 *   sunrise, so the label holds all day); or
 * - it ends after midnight (the successor's day is tomorrow, and the तक line
 *   already carries that date); or
 * - the day is kshaya, where a second tithi begins AND ends before the next
 *   sunrise: the caller already renders both, and the third would start
 *   tomorrow.
 */
export function successorTithiToday(p: PanchangData): { nameHi: string; nameEn: string } | null {
  if (p.kshayaTithi) return null;
  const end = p.tithi.endTime;
  if (!end) return null;
  if (end.getFullYear() !== p.date.getFullYear()
    || end.getMonth() !== p.date.getMonth()
    || end.getDate() !== p.date.getDate()) return null;
  const successor = (p.tithi.index + 1) % 30;
  return { nameHi: TITHI_NAMES_HI[successor], nameEn: TITHI_NAMES_EN[successor] };
}

/**
 * Whether the walk from sunrise to `at` has passed an Amavasya or Purnima end —
 * the only handovers that can change the displayed lunar month: the end of
 * Amavasya (index 29: the amanta month turns, and either system's Adhik flag
 * follows the new lunation) and the end of Purnima (index 14: the purnimanta
 * month turns). Cheap: a walk over at most three links, no solve.
 */
export function passedMonthBoundary(p: PanchangData, at: Date): boolean {
  for (const link of tithiChain(p)) {
    if (!link.endTime || at.getTime() <= link.endTime.getTime()) return false;
    if (link.index === 14 || link.index === 29) return true;
  }
  return false;
}

/**
 * The lunar month running at `at`, for the same live "today" surfaces that
 * read `prevailingTithi`. PURE and solve-free — the caller resolves
 * `nextDayMonth` (tomorrow's sunrise month) off the render path, and only when
 * `passedMonthBoundary` says it is needed.
 *
 * A day's `lunarMonth` is fixed at sunrise. Once a month boundary has passed,
 * the month now running is the one tomorrow's sunrise reports — a tithi lasts
 * at least ~19 h and boundaries are fifteen tithis apart, so no second
 * boundary can fall between `at` and the next sunrise. Before either, or while
 * `nextDayMonth` is still resolving (null), the sunrise month holds.
 */
export function prevailingLunarMonth(
  p: PanchangData,
  at: Date,
  nextDayMonth: { lunarMonth: number; isAdhik: boolean } | null,
): PanchangData['lunarMonth'] {
  if (!nextDayMonth || !passedMonthBoundary(p, at)) return p.lunarMonth;
  const { lunarMonth, isAdhik } = nextDayMonth;
  return {
    index: lunarMonth,
    nameHi: LUNAR_MONTH_NAMES_HI[lunarMonth - 1],
    nameEn: LUNAR_MONTH_NAMES_EN[lunarMonth - 1],
    isAdhik,
  };
}
