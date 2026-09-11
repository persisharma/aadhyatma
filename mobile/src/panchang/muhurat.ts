/**
 * Daily Muhurat — Choghadiya, Rahu/Gulika/Yamaganda Kaal, and Abhijit Muhurat.
 * See docs/roadmap/prds/14-daily-muhurat.md and trds/14-daily-muhurat.trd.md.
 *
 * PURE: every window is derived arithmetically from three timestamps
 * (sunrise, sunset, next day's sunrise) + the weekday. No astronomy, no I/O, no
 * `Date.now()`/argless `new Date()` — callers pass every input, so this whole
 * module is unit-testable without bootstrapping React Native or the engine.
 *
 * Convention: DrikPanchang. Day/night are each split into 8 equal choghadiya;
 * Rahu/Gulika/Yamaganda are fixed weekday-indexed eighths of the daytime;
 * Abhijit is the 8th of the 15 equal day-muhurtas (≈ solar noon).
 */

export type MuhuratQuality = 'auspicious' | 'avoid';

export type ChoghadiyaKey = 'udveg' | 'char' | 'labh' | 'amrit' | 'kaal' | 'shubh' | 'rog';

export type ChoghadiyaPeriod = {
  key: ChoghadiyaKey;
  nameHi: string;
  nameEn: string;
  quality: MuhuratQuality;
  phase: 'day' | 'night';
  start: Date;
  end: Date;
};

export type KaalKey = 'rahu' | 'gulika' | 'yamaganda';

export type KaalWindow = { key: KaalKey; nameHi: string; nameEn: string; start: Date; end: Date };

export type MuhuratDay = {
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  dayChoghadiya: ChoghadiyaPeriod[]; // 8, sunrise → sunset
  nightChoghadiya: ChoghadiyaPeriod[]; // 8, sunset → next sunrise
  rahu: KaalWindow;
  gulika: KaalWindow;
  yamaganda: KaalWindow;
  /** The 8th of 15 day-muhurtas (≈ solar noon), or null if it collapses. */
  abhijit: { start: Date; end: Date } | null;
};

// Fixed 7-choghadiya wheel. Day/night sequences walk this wheel from a
// weekday-specific start index, wrapping to fill 8 slots (the 8th repeats the 1st).
const WHEEL: ChoghadiyaKey[] = ['udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog'];

const NAMES: Record<ChoghadiyaKey, { hi: string; en: string; quality: MuhuratQuality }> = {
  udveg: { hi: 'उद्वेग', en: 'Udveg', quality: 'avoid' },
  char: { hi: 'चर', en: 'Char', quality: 'auspicious' }, // "movable" — good (DrikPanchang)
  labh: { hi: 'लाभ', en: 'Labh', quality: 'auspicious' },
  amrit: { hi: 'अमृत', en: 'Amrit', quality: 'auspicious' },
  kaal: { hi: 'काल', en: 'Kaal', quality: 'avoid' },
  shubh: { hi: 'शुभ', en: 'Shubh', quality: 'auspicious' },
  rog: { hi: 'रोग', en: 'Rog', quality: 'avoid' },
};

// Day-choghadiya starting wheel index by weekday (0=Sun … 6=Sat). DrikPanchang:
// Sun→Udveg, Mon→Amrit, Tue→Rog, Wed→Labh, Thu→Shubh, Fri→Char, Sat→Kaal.
// The day sequence then walks the wheel one key at a time.
const DAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4];
const DAY_STRIDE = 1;
// Night sequence starts +5 around the wheel from the day start (DrikPanchang:
// Sun→Shubh, Mon→Char, Tue→Kaal, Wed→Udveg, Thu→Amrit, Fri→Rog, Sat→Labh) —
// and KEEPS striding by 5 (≡ −2) for every following period. The night order is
// its own cycle, Shubh → Amrit → Char → Rog → Kaal → Labh → Udveg, not the day
// wheel read forward from a shifted start. Walking the day wheel +1 from the
// night start got only the first period right: a Saturday evening read
// Labh · Amrit · Kaal · Shubh … where every almanac prints Labh · Udveg · Shubh ·
// Amrit · Char · Rog · Kaal · Labh (reported Sep 2026 as the morning's Kaal and
// Shubh "showing again" at 10:30 PM).
const NIGHT_OFFSET = 5;
const NIGHT_STRIDE = 5;

// Kaal = the k-th equal eighth of the daytime (1-indexed) by weekday (Sun … Sat).
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];
const YAMAGANDA_SEG = [5, 4, 3, 2, 1, 7, 6];

const KAAL_NAMES: Record<KaalKey, { hi: string; en: string }> = {
  rahu: { hi: 'राहु काल', en: 'Rahu Kaal' },
  gulika: { hi: 'गुलिक काल', en: 'Gulika Kaal' },
  yamaganda: { hi: 'यमगण्ड', en: 'Yamaganda' },
};

/** Split [from, to] into `n` equal spans as [start, end] Date pairs. */
export function splitEqual(from: Date, to: Date, n: number): Array<[Date, Date]> {
  const span = (to.getTime() - from.getTime()) / n;
  const out: Array<[Date, Date]> = [];
  for (let i = 0; i < n; i += 1) {
    out.push([new Date(from.getTime() + span * i), new Date(from.getTime() + span * (i + 1))]);
  }
  return out;
}

function buildChoghadiya(
  parts: Array<[Date, Date]>,
  startIndex: number,
  stride: number,
  phase: 'day' | 'night'
): ChoghadiyaPeriod[] {
  return parts.map(([start, end], i) => {
    const key = WHEEL[(startIndex + i * stride) % WHEEL.length];
    const meta = NAMES[key];
    return { key, nameHi: meta.hi, nameEn: meta.en, quality: meta.quality, phase, start, end };
  });
}

function kaalFrom(
  dayParts: Array<[Date, Date]>,
  key: KaalKey,
  segment1Based: number
): KaalWindow {
  const [start, end] = dayParts[segment1Based - 1];
  return { key, nameHi: KAAL_NAMES[key].hi, nameEn: KAAL_NAMES[key].en, start, end };
}

/**
 * Compute all of a day's muhurat windows.
 * @param weekday 0=Sunday … 6=Saturday (from the civil date, e.g. `date.getDay()`).
 */
export function computeMuhuratDay(
  sunrise: Date,
  sunset: Date,
  nextSunrise: Date,
  weekday: number
): MuhuratDay {
  const wd = ((weekday % 7) + 7) % 7;
  const dayParts = splitEqual(sunrise, sunset, 8);
  const nightParts = splitEqual(sunset, nextSunrise, 8);

  const dayStart = DAY_START_INDEX[wd];
  const nightStart = (dayStart + NIGHT_OFFSET) % WHEEL.length;

  // Abhijit — 8th of 15 equal day-muhurtas.
  const dayDur = sunset.getTime() - sunrise.getTime();
  const muhurta = dayDur / 15;
  const abhijit =
    dayDur > 0
      ? {
          start: new Date(sunrise.getTime() + muhurta * 7),
          end: new Date(sunrise.getTime() + muhurta * 8),
        }
      : null;

  return {
    sunrise,
    sunset,
    nextSunrise,
    dayChoghadiya: buildChoghadiya(dayParts, dayStart, DAY_STRIDE, 'day'),
    nightChoghadiya: buildChoghadiya(nightParts, nightStart, NIGHT_STRIDE, 'night'),
    rahu: kaalFrom(dayParts, 'rahu', RAHU_SEG[wd]),
    gulika: kaalFrom(dayParts, 'gulika', GULIKA_SEG[wd]),
    yamaganda: kaalFrom(dayParts, 'yamaganda', YAMAGANDA_SEG[wd]),
    abhijit,
  };
}

function contains(start: Date, end: Date, at: Date): boolean {
  const t = at.getTime();
  return t >= start.getTime() && t < end.getTime();
}

/**
 * The next auspicious choghadiya starting at/after `at` (day then night, in
 * chronological order — the wheel arrays are already sorted). Null when nothing
 * auspicious remains in this muhurat day (late night before the next sunrise).
 * Callers use this to answer "when is it good next?" while an avoid period is
 * running — a period whose start equals the running one's end matches, since
 * choghadiya are contiguous.
 */
export function nextAuspiciousPeriod(md: MuhuratDay, at: Date): ChoghadiyaPeriod | null {
  const t = at.getTime();
  return (
    [...md.dayChoghadiya, ...md.nightChoghadiya].find(
      (p) => p.quality === 'auspicious' && p.start.getTime() >= t
    ) ?? null
  );
}

/** Which choghadiya + kaal (if any) contain `at`. Caller passes the clock. */
export function classifyNow(
  md: MuhuratDay,
  at: Date
): { nowChoghadiya: ChoghadiyaPeriod | null; nowKaal: KaalWindow | null } {
  const all = [...md.dayChoghadiya, ...md.nightChoghadiya];
  const nowChoghadiya = all.find((p) => contains(p.start, p.end, at)) ?? null;
  const nowKaal =
    [md.rahu, md.gulika, md.yamaganda].find((k) => contains(k.start, k.end, at)) ?? null;
  return { nowChoghadiya, nowKaal };
}
