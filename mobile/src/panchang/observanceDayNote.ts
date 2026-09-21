// The one line an observance card adds under its description to say what THIS
// day is for. Pure, and derived only from the day's already-solved panchang —
// no engine entry point is reachable from here, because the card renders on the
// Panchang tab's scroll path.
//
// It exists because a vrat is not a calendar box. Three rules need it:
//   • a chandrodaya vrat is kept through a night whose tithi ends the next
//     morning, so the card names the moonrise that actually breaks the fast;
//   • दर्श अमावस्या is fixed by the afternoon, and when the amavasya opens
//     mid-morning that afternoon belongs to the day BEFORE the one the calendar
//     heads अमावस्या;
//   • the udaya अमावस्या व्रत row is then the snan-daan morning, and without a
//     line saying so the two amavasya cards are indistinguishable — which is
//     exactly what a reader asked about (10 vs 11 Sep 2026).
import type { ObservanceRule } from './types';

export type ObservanceDayNote = { hi: string; en: string };

/** The day's solved panchang, narrowed to the fields a note can read. */
export type ObservanceDaySolve = {
  sunrise: Date;
  sunset: Date;
  moonrise: Date | null;
  /** Sunrise tithi index, 0-based (14 = purnima, 28 = chaturdashi, 29 = amavasya). */
  tithiIndex: number;
  /** When the sunrise tithi ends; null when this day's solve does not know. */
  tithiEnd: Date | null;
};

const CHATURDASHI = 28;
const AMAVASYA = 29;

/**
 * Aparahna — the fourth of the day's five equal parts. `tithiAtAparahna`
 * (`engine.ts`) samples its MIDPOINT to pick the observance day; this returns the
 * whole part, because what a reader needs is the span the tarpan is performed in.
 */
export function aparahnaSpan(sunrise: Date, sunset: Date): { start: Date; end: Date; mid: Date } {
  const day = sunset.getTime() - sunrise.getTime();
  return {
    start: new Date(sunrise.getTime() + 0.6 * day),
    end: new Date(sunrise.getTime() + 0.8 * day),
    mid: new Date(sunrise.getTime() + 0.7 * day),
  };
}

/**
 * Is the amavasya running at `instant`, judged from the sunrise tithi alone? A
 * tithi runs ~20–26 h, so at most one changeover falls between sunrise and
 * sunset: the amavasya is either already running (and may end), or it is the
 * chaturdashi's successor (and starts when that ends). Anything else is a day
 * the amavasya does not touch in daylight.
 */
function amavasyaCovers(solve: ObservanceDaySolve, instant: Date): boolean {
  const { tithiIndex, tithiEnd } = solve;
  if (tithiIndex === AMAVASYA) return tithiEnd === null || tithiEnd.getTime() > instant.getTime();
  if (tithiIndex === CHATURDASHI) return tithiEnd !== null && tithiEnd.getTime() <= instant.getTime();
  return false;
}

export function observanceDayNote(
  rule: Pick<ObservanceRule, 'id' | 'dayRule'>,
  solve: ObservanceDaySolve | null,
  formatTime: (d: Date) => string
): ObservanceDayNote | null {
  if (!solve) return null;

  if (rule.dayRule === 'chandrodaya') {
    if (!solve.moonrise) return null;
    const t = formatTime(solve.moonrise);
    return {
      hi: `व्रत इसी रात्रि — चंद्रोदय ${t}, दर्शन व अर्घ्य के बाद पारण`,
      en: `Kept this night — moonrise ${t}, parana after darshan and arghya`,
    };
  }

  if (rule.id === 'darsha-amavasya') {
    const { start, end, mid } = aparahnaSpan(solve.sunrise, solve.sunset);
    // The rare lunation where the amavasya covers no day's aparahna at all and
    // the rule fell back to the sunrise day (Ashadha 2026 — RULEBOOK §23.8).
    // The day is still the vrat's; naming an aparahna window it does not fill
    // would not be true, so the card simply says nothing.
    if (!amavasyaCovers(solve, mid)) return null;
    return {
      hi: `व्रत व पितृ तर्पण इसी दिन — अपराह्न ${formatTime(start)}–${formatTime(end)}`,
      en: `Kept this day — vrat and pitru tarpan in the aparahna, ${formatTime(start)}–${formatTime(end)}`,
    };
  }

  if (rule.id === 'amavasya-vrat') {
    // Only on a genuine udaya amavasya. The matcher's kshaya fallback can seat
    // this rule on a day whose sunrise tithi is the chaturdashi, and there
    // `tithiEnd` is not the amavasya's end — printing it would misstate the day.
    if (solve.tithiIndex !== AMAVASYA || !solve.tithiEnd) return null;
    const t = formatTime(solve.tithiEnd);
    return {
      hi: `स्नान व दान प्रातः — अमावस्या तिथि ${t} तक`,
      en: `Snan and daan at dawn — Amavasya tithi until ${t}`,
    };
  }

  return null;
}
