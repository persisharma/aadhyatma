// The observances whose day is NOT "the tithi at one instant" — each decided by
// a published multi-clause rule. Every function takes the lunation's SUNRISE day
// (the shared udaya matcher's answer, which already owns the month, adhik and
// kshaya decisions) and returns the civil day the rule names. Pure, RN-free.
//
// Sources and the published years each rule was checked against are in
// RULEBOOK §23.14–23.17 and pinned in `observanceDates.test.ts`.

import { addDays } from './calendarGrid';
import { computeTithiAndMonth, sunriseForDate, sunsetForDate } from './engine';
import {
  arunodaya,
  contains,
  crossingAfter,
  dayFractionSpan,
  elongationAt,
  hinduMidnight,
  nakshatraSpan,
  nishitaSpan,
  overlapMs,
  tithiSpan,
  type Span,
} from './dayRuleInstants';
import type { PanchangComputationOptions } from './types';

const SHUKLA_PURNIMA = 14;
const ROHINI = 3;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Bhadra of a Shukla Purnima — Vishti is its first karana, so Bhadra runs from
 * the Purnima's start until the Moon is 174° ahead of the Sun.
 */
function purnimaBhadraEnd(purnima: Span): Date {
  return crossingAfter(elongationAt, new Date(purnima.start.getTime() + 60_000), 174, 30) ?? purnima.end;
}

/**
 * रक्षा बंधन (Shravana Purnima). Drik: Rakhi in the aparahna, else pradosh,
 * never in Bhadra (Vratraj: "भद्रायां द्वे न कर्तव्ये श्रावणी फाल्गुनी तथा").
 * Dharma Sindhu / ICAS: Purnima must hold three muhurtas on the day; if on the
 * next day it lasts less than three muhurtas past sunrise, Rakhi is tied the
 * previous night once Bhadra ends.
 *
 *  1. A day whose aparahna holds Bhadra-free Purnima → that day (most cover;
 *     equal → later).
 *  2. Else the last day Purnima touches at sunrise, if it lasts ≥ 3 of the
 *     day's 15 muhurtas (0.2 × daylight) past that sunrise.
 *  3. Else the day before it — after Bhadra, in pradosh or later that night.
 *
 * Delhi, published: 2023 30 Aug (rule 3: Purnima only 67 min past 31 Aug's
 * sunrise; Rakhi from 9:01 PM), 2024 19 Aug (rule 1), 2025 9 Aug, 2026 28 Aug,
 * 2027 17 Aug, 2028 5 Aug (rule 2), 2029 23 Aug and 2031 2 Aug (rule 3), 2030
 * 13 Aug (rule 1). The sunrise rule had 2023, 2029 and 2031 a day late.
 */
export function rakshaBandhanDay(sunriseDay: Date, options: PanchangComputationOptions): Date {
  const purnima = tithiSpan(SHUKLA_PURNIMA, sunriseForDate(sunriseDay, options));
  if (!purnima) return sunriseDay;
  const free: Span = { start: purnimaBhadraEnd(purnima), end: purnima.end };
  const days = [addDays(sunriseDay, -1), sunriseDay, addDays(sunriseDay, 1)];

  let best: Date | null = null;
  let bestCover = 0;
  for (const day of days) {
    const cover = overlapMs(dayFractionSpan(day, 0.6, 0.8, options), free);
    if (cover > 0 && cover >= bestCover) {
      best = day;
      bestCover = cover;
    }
  }
  if (best) return best;

  const sunriseDays = days.filter((day) => contains(purnima, sunriseForDate(day, options)));
  const last = sunriseDays[sunriseDays.length - 1];
  if (!last) return sunriseDay;
  const sunrise = sunriseForDate(last, options).getTime();
  const daylight = sunsetForDate(last, options).getTime() - sunrise;
  if (purnima.end.getTime() - sunrise >= 0.2 * daylight) return last;
  return addDays(last, -1);
}

/**
 * होलिका दहन (Phalguna Purnima), given its PRADOSH day (the day whose pradosh
 * the Purnima covers). Drik: "If Bhadra prevails during Pradosh but it ends
 * before midnight then Holika Dahan should be done after Bhadra is over. If
 * Bhadra is getting over after midnight then only Holika Dahan should be done
 * in Bhadra and preferably during Bhadra Punchha." Dharma Sindhu adds the
 * second-day clause: with Bhadra past midnight, if the next day holds Purnima
 * for 3½ of its 4 prahars (7/8 of daylight), Dahan moves to that day's pradosh.
 *
 * Delhi, published: 2023 7 Mar and 2026 3 Mar (second-day clause: 690 ≥ 616 and
 * 623 ≥ 611 min), 2027 21 Mar (590 < 639 min — Dahan stays in Bhadra), 2024
 * 24 Mar, 2025 13 Mar, 2028 10 Mar, 2031 8 Mar (Bhadra ends before midnight),
 * 2029 28 Feb, 2030 19 Mar. Rangwali Holi is the day after.
 */
export function holikaDahanDay(pradoshDay: Date, options: PanchangComputationOptions): Date {
  const purnima = tithiSpan(SHUKLA_PURNIMA, sunsetForDate(pradoshDay, options));
  if (!purnima) return pradoshDay;
  if (purnimaBhadraEnd(purnima).getTime() <= hinduMidnight(pradoshDay, options).getTime()) return pradoshDay;
  const next = addDays(pradoshDay, 1);
  const sunrise = sunriseForDate(next, options).getTime();
  const daylight = sunsetForDate(next, options).getTime() - sunrise;
  return purnima.end.getTime() - sunrise >= (7 / 8) * daylight ? next : pradoshDay;
}

export type TwoTraditionDays = { smarta: Date; vaishnava: Date };

/**
 * एकादशी — Smarta and Vaishnava days by Dharmasindhu, as Drik applies them
 * (and as the open-source `jyotisha` panchanga encodes them). Look at the tithi
 * at sunrise on d, d+1, d+2, where d is the first day whose sunrise tithi is
 * this lunation's Dashami or Ekadashi (D = Dashami, E = Ekadashi, W = Dwadashi,
 * T = Trayodashi, C = Chaturdashi), searching d from `anchor` − 3 to + 1 (null
 * when no such day opens one of the patterns below):
 *
 *  - E E W or D W W — Smarta d+1 (Ekadashi on two sunrises: the second; Nirjala
 *    2024 18 Jun, Rama 2024 28 Oct). Vaishnava d+2 if Dashami still runs at
 *    d+1's arunodaya, else d+1.
 *  - D W T, E W T, E W W, E W C — Smarta d. Vaishnava d only for a pure E W T /
 *    E W C (Ekadashi already running at arunodaya); else d+1 — Dashami at
 *    arunodaya (Vijaya 2024 6/7 Mar) or Dwadashi on two sunrises (Nirjala 2025
 *    6/7 Jun, the Mahadvadashi).
 *  - D E T, E E T — Dwadashi touches no sunrise: Smarta d (Devutthana 2025
 *    1 Nov), Vaishnava (and yati) d+1.
 */
export function ekadashiDays(anchor: Date, ekadashiIndex: number, options: PanchangComputationOptions): TwoTraditionDays | null {
  const opts = { calendarSystem: options.calendarSystem, location: options.location };
  const rel = (day: Date): number => (computeTithiAndMonth(day, opts).tithiIndex - ekadashiIndex + 30) % 30;
  const relAt = (instant: Date): number => (Math.floor(elongationAt(instant) / 12) - ekadashiIndex + 30) % 30;
  const D = 29, E = 0, W = 1, T = 2, C = 3;
  const is = (p: number[], ...patterns: number[][]) => patterns.some((q) => q.every((v, i) => v === p[i]));

  for (let offset = -3; offset <= 1; offset++) {
    const d = startOfDay(addDays(anchor, offset));
    const first = rel(d);
    if (first !== D && first !== E) continue;
    const p = [first, rel(addDays(d, 1)), rel(addDays(d, 2))];
    if (is(p, [E, E, W], [D, W, W])) {
      const next = addDays(d, 1);
      return { smarta: next, vaishnava: relAt(arunodaya(next, opts)) === D ? addDays(d, 2) : next };
    }
    if (is(p, [D, W, T], [E, W, T], [E, W, W], [E, W, C])) {
      const pure = relAt(arunodaya(d, opts)) === E && is(p, [E, W, T], [E, W, C]);
      return { smarta: d, vaishnava: pure ? d : addDays(d, 1) };
    }
    if (is(p, [D, E, T], [E, E, T])) {
      return { smarta: d, vaishnava: addDays(d, 1) };
    }
  }
  // No Dashami/Ekadashi sunrise near `anchor` opens a known pattern: not this
  // lunation's Ekadashi.
  return null;
}

/**
 * कृष्ण जन्माष्टमी — Smarta and Vaishnava (ISKCON) days. Drik: "The preference
 * is given to the day … when Ashtami Tithi prevails during Nishita and further
 * rules are added to include Rohini Nakshatra"; "Vaishnavism never observe
 * Janmashtami on Saptami Tithi". Nishita is the 8th of the night's 15 muhurtas.
 *
 * Smarta, between d1 (the day the Ashtami begins, or the day before its sunrise
 * day) and d2 = d1 + 1:
 *  1. One Nishita holds Ashtami AND Rohini → that day (2023 6 Sep, 2024 26 Aug,
 *     2029 31 Aug).
 *  2. Ashtami in only one Nishita → that day (2025 15 Aug, 2026 4 Sep, 2028
 *     13 Aug) — EXCEPT when that Ashtami began after d1's sunset and on d2 it is
 *     the sunrise tithi and meets Rohini in daylight: then d2 (2027 25 Aug,
 *     2016 25 Aug).
 *  3. Both or neither → d2.
 *
 * Vaishnava, as ISKCON's GCal computes it: the day whose sunrise has Ashtami
 * (a kshaya Ashtami: the day after it); on two such days, the one with Rohini
 * at sunrise, then at midnight, then the second only if it is a Monday or
 * Wednesday (2023 7 Sep, 2025 16 Aug, 2029 1 Sep).
 */
export function janmashtamiDays(sunriseDay: Date, options: PanchangComputationOptions): TwoTraditionDays {
  const opts = { calendarSystem: options.calendarSystem, location: options.location };
  const ASHTAMI = 22;
  const ashtami = tithiSpan(ASHTAMI, sunriseForDate(addDays(sunriseDay, -1), opts));
  if (!ashtami) return { smarta: sunriseDay, vaishnava: sunriseDay };
  const rohini = nakshatraSpan(ROHINI, ashtami.start);

  // Smarta.
  const d1 = startOfDay(
    ashtami.start.getTime() < sunriseForDate(ashtami.start, opts).getTime()
      ? addDays(ashtami.start, -1)
      : ashtami.start
  );
  const d2 = addDays(d1, 1);
  const nishita = (day: Date) => nishitaSpan(day, opts);
  const ashtamiAt = (day: Date) => overlapMs(nishita(day), ashtami) > 0;
  const jayantiAt = (day: Date) => ashtamiAt(day) && rohini !== null && overlapMs(nishita(day), rohini) > 0;
  let smarta: Date;
  const j1 = jayantiAt(d1);
  const j2 = jayantiAt(d2);
  if (j1 !== j2) {
    smarta = j1 ? d1 : d2;
  } else if (ashtamiAt(d1) !== ashtamiAt(d2)) {
    smarta = ashtamiAt(d1) ? d1 : d2;
    const nightOnly = ashtami.start.getTime() >= sunsetForDate(d1, opts).getTime();
    const d2Sunrise = sunriseForDate(d2, opts);
    const d2Daylight: Span = { start: d2Sunrise, end: sunsetForDate(d2, opts) };
    const meetsRohiniByDay =
      rohini !== null &&
      overlapMs(d2Daylight, { start: new Date(Math.max(ashtami.start.getTime(), rohini.start.getTime())), end: new Date(Math.min(ashtami.end.getTime(), rohini.end.getTime())) }) > 0;
    if (smarta === d1 && nightOnly && contains(ashtami, d2Sunrise) && meetsRohiniByDay) smarta = d2;
  } else {
    smarta = d2;
  }

  // Vaishnava (GCal).
  const sunriseDays = [d1, d2, addDays(d2, 1)].filter((day) => contains(ashtami, sunriseForDate(day, opts)));
  let vaishnava: Date;
  if (sunriseDays.length === 0) {
    vaishnava = startOfDay(addDays(ashtami.end, ashtami.end.getTime() < sunriseForDate(ashtami.end, opts).getTime() ? 0 : 1));
  } else if (sunriseDays.length === 1) {
    vaishnava = sunriseDays[0];
  } else {
    const [a, b] = sunriseDays;
    const rohiniAt = (instant: Date) => rohini !== null && contains(rohini, instant);
    const ra = rohiniAt(sunriseForDate(a, opts));
    const rb = rohiniAt(sunriseForDate(b, opts));
    const ma = rohiniAt(hinduMidnight(a, opts));
    const mb = rohiniAt(hinduMidnight(b, opts));
    const monOrWed = [1, 3].includes(b.getDay());
    if (ra !== rb) vaishnava = ra ? a : b;
    else if (ra && ma !== mb) vaishnava = ma ? a : b;
    else vaishnava = monOrWed ? b : a;
  }
  return { smarta: startOfDay(smarta), vaishnava: startOfDay(vaishnava) };
}
