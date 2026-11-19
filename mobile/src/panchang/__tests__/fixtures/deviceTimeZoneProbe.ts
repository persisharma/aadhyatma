/**
 * Prints, as JSON, a slice of everything the Panchang derives from a date:
 * day solves, a live year of observances, the Pitru Paksha fortnight and the
 * text the screens print. `deviceTimeZone.test.ts` runs this file once per
 * device time zone and requires byte-identical output — the process `TZ` is the
 * only thing that differs between runs.
 *
 * Labels (civil dates) are printed from their local y/m/d, which is what they
 * carry in every zone; instants are printed in UTC.
 */
import { computePanchangForDate } from '../../engine';
import { resolveObservancesForYearLive } from '../../festivalEngine';
import { pitruPakshaDayName, pitruPakshaWindow } from '../../pitruSmaran';
import { formatClock, formatEndInstant } from '../../muhuratFormat';
import { successorTithiToday } from '../../prevailingTithi';
import { civilDateOf, civilTodayKey, msUntilNextCivilDay } from '../../civilTime';
import { CITIES } from '../../locations';

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const city = (id: string) => {
  const found = CITIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown city ${id}`);
  return { cityId: found.id, latitude: found.latitude, longitude: found.longitude, elevation: found.elevation };
};

// 17 Nov 2026 is the audited case; the others sit on kshaya days, a festival,
// a year boundary and both solstice-side sunrises.
const DAYS: [number, number, number][] = [
  [2026, 0, 29], [2026, 2, 3], [2026, 5, 21], [2026, 6, 10], [2026, 7, 31], [2026, 10, 17], [2026, 11, 31], [2027, 0, 1],
];
const PLACES = { ujjain: undefined, bengaluru: city('bengaluru'), guwahati: city('guwahati') };

const days: Record<string, unknown> = {};
for (const [name, location] of Object.entries(PLACES)) {
  for (const [y, m, d] of DAYS) {
    const p = computePanchangForDate(new Date(y, m, d), { location });
    days[`${name} ${y}-${m + 1}-${d}`] = {
      solve: { ...p, date: ymd(p.date) },
      sunriseClock: formatClock(p.sunrise),
      sunsetClock: formatClock(p.sunset),
      tithiEnds: p.tithi.endTime ? formatEndInstant(p.tithi.endTime, p.date, 'en') : null,
      nakshatraEnds: p.nakshatra.endTime ? formatEndInstant(p.nakshatra.endTime, p.date, 'hi') : null,
      successorToday: successorTithiToday(p)?.nameEn ?? null,
    };
  }
}

const year = (y: number, system: 'purnimant' | 'amanta', location?: ReturnType<typeof city>) =>
  resolveObservancesForYearLive(y, system, location).map((o) => `${o.rule.id}@${ymd(o.date)}`).sort();
const observances = {
  'ujjain 2026 purnimant': year(2026, 'purnimant'),
  'bengaluru 2025 amanta': year(2025, 'amanta', city('bengaluru')),
};

const window = pitruPakshaWindow(2026);
const pitru: Record<string, unknown> = { window: window && { purnima: ymd(window.purnima), start: ymd(window.start), end: ymd(window.end) } };
if (window) {
  for (let day = new Date(window.purnima); day.getTime() <= window.end.getTime(); day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    pitru[ymd(day)] = pitruPakshaDayName(day, {}, window)?.nameEn ?? null;
  }
}

// IST midnight is 18:30 UTC: the civil date must roll over there and nowhere else.
const NOWS = ['2026-11-17T18:29:59Z', '2026-11-17T18:30:00Z', '2026-11-18T01:30:00Z', '2026-12-31T20:00:00Z'];
const today = NOWS.map((iso) => {
  const now = new Date(iso);
  return { iso, key: civilTodayKey(now), label: ymd(civilDateOf(now)), msToNextDay: msUntilNextCivilDay(now) };
});

process.stdout.write(JSON.stringify({ days, observances, pitru, today }));
