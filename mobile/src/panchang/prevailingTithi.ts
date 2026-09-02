import type { PanchangData } from './types';
import { TITHI_NAMES_HI, TITHI_NAMES_EN } from './names';

export type PrevailingTithi = {
  nameHi: string;
  nameEn: string;
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
 */
export function prevailingTithi(p: PanchangData, at: Date): PrevailingTithi {
  const { tithi, kshayaTithi } = p;
  if (!tithi.endTime || at.getTime() <= tithi.endTime.getTime()) {
    return { nameHi: tithi.nameHi, nameEn: tithi.nameEn, endTime: tithi.endTime };
  }
  if (kshayaTithi && (!kshayaTithi.endTime || at.getTime() <= kshayaTithi.endTime.getTime())) {
    return { nameHi: kshayaTithi.nameHi, nameEn: kshayaTithi.nameEn, endTime: kshayaTithi.endTime };
  }
  const successor = ((kshayaTithi ?? tithi).index + 1) % 30;
  return { nameHi: TITHI_NAMES_HI[successor], nameEn: TITHI_NAMES_EN[successor], endTime: null };
}

/**
 * The tithi that TAKES OVER later on this same civil day, or null when no
 * handover happens within it.
 *
 * A day is labelled by its sunrise tithi (udaya-vyapini), and that tithi
 * usually ends mid-morning — so "तृतीया तक 8:51 AM" states when the label stops
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
