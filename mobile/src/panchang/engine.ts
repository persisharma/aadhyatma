import {
  Body,
  EclipticGeoMoon,
  SunPosition,
  MakeTime,
  SearchRiseSet,
  Observer,
} from 'astronomy-engine';

import type { CalendarSystem, GeoLocation, PanchangComputationOptions, PanchangData, Paksha } from './types';
import {
  TITHI_NAMES_HI, TITHI_NAMES_EN,
  NAKSHATRA_NAMES_HI, NAKSHATRA_NAMES_EN,
  YOGA_NAMES_HI, YOGA_NAMES_EN,
  KARANA_NAMES_HI, KARANA_NAMES_EN,
  VARA_NAMES_HI, VARA_NAMES_EN,
  LUNAR_MONTH_NAMES_HI, LUNAR_MONTH_NAMES_EN,
} from './names';

const UJJAIN_LAT = 23.1765;
const UJJAIN_LNG = 75.7885;
const UJJAIN_ELEV = 494;

export const UJJAIN_CITY_ID = 'ujjain';
export const UJJAIN_GEO: GeoLocation = { latitude: UJJAIN_LAT, longitude: UJJAIN_LNG, elevation: UJJAIN_ELEV };

// Stable cache-key fragment for a location. Used by every location-sensitive cache
// (tithi/month memo here, festival year cache, persisted observance cache) so keys
// can never drift apart. Undefined ⇒ the Ujjain default.
export function locationKey(loc?: { cityId?: string; latitude: number; longitude: number }): string {
  if (!loc) return UJJAIN_CITY_ID;
  return loc.cityId ?? `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
}

const observerCache = new Map<string, Observer>();

function observerFor(loc: GeoLocation & { cityId?: string }): Observer {
  const key = locationKey(loc);
  let cached = observerCache.get(key);
  if (!cached) {
    cached = new Observer(loc.latitude, loc.longitude, loc.elevation);
    observerCache.set(key, cached);
  }
  return cached;
}

export function getAyanamsa(year: number): number {
  return 23.853 + 0.01396 * (year - 2000);
}

export function getSiderealSunLng(date: Date, year: number): number {
  const astroTime = MakeTime(date);
  const tropical = SunPosition(astroTime).elon;
  return (tropical - getAyanamsa(year) + 360) % 360;
}

export function getSiderealMoonLng(date: Date, year: number): number {
  const astroTime = MakeTime(date);
  const tropical = EclipticGeoMoon(astroTime).lon;
  return (tropical - getAyanamsa(year) + 360) % 360;
}

type CivilParts = { year: number; month: number; day: number };

function civilParts(date: Date, timeZone?: string): CivilParts {
  if (!timeZone) return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day') };
}

function instantYear(date: Date, timeZone?: string): number {
  return civilParts(date, timeZone).year;
}

function civilStart(localDate: Date, timeZone?: string): Date {
  if (!timeZone) return new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0);
  const target = { year: localDate.getFullYear(), month: localDate.getMonth() + 1, day: localDate.getDate() };
  const wantedUtc = Date.UTC(target.year, target.month - 1, target.day);
  let instant = wantedUtc;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  for (let iteration = 0; iteration < 4; iteration += 1) {
    const parts = formatter.formatToParts(new Date(instant));
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    const representedUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
    const correction = wantedUtc - representedUtc;
    instant += correction;
    if (correction === 0) break;
  }
  return new Date(instant);
}

function computeSunrise(localDate: Date, observer: Observer, civilTimeZone?: string): Date {
  const startOfDay = civilStart(localDate, civilTimeZone);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Sun, observer, +1, astroTime, 1);
  if (!result) throw new Error(`No sunrise found for ${localDate.toISOString()}`);
  return result.date;
}

function computeSunset(localDate: Date, observer: Observer, civilTimeZone?: string): Date {
  const startOfDay = civilStart(localDate, civilTimeZone);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1);
  if (!result) throw new Error(`No sunset found for ${localDate.toISOString()}`);
  return result.date;
}

function computeMoonrise(localDate: Date, observer: Observer, civilTimeZone?: string): Date | null {
  const startOfDay = civilStart(localDate, civilTimeZone);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Moon, observer, +1, astroTime, 1);
  if (!result) return null;
  return result.date;
}

function computeTithiIndex(sunLng: number, moonLng: number): number {
  const diff = (moonLng - sunLng + 360) % 360;
  return Math.floor(diff / 12);
}

function computeNakshatraIndex(moonLng: number): number {
  return Math.floor(moonLng / (360 / 27));
}

function computeYogaIndex(sunLng: number, moonLng: number): number {
  const sum = (sunLng + moonLng) % 360;
  return Math.floor(sum / (360 / 27));
}

function computePhaseAngle(date: Date, civilTimeZone?: string): number {
  const year = instantYear(date, civilTimeZone);
  const sunLng = getSiderealSunLng(date, year);
  const moonLng = getSiderealMoonLng(date, year);
  return (moonLng - sunLng + 360) % 360;
}

function angularAdvance(from: number, to: number): number {
  return (to - from + 360) % 360;
}

/**
 * Which of the 60 half-tithi slots the elongation sits in (0..59), with the
 * same near-boundary snap `computeKaranaIndex` has always used. Extracted so
 * the karana END solver targets the boundary of the SAME slot the displayed
 * karana came from — recomputing it from the lossy name index would be wrong
 * (each movable name repeats eight times per month).
 */
function karanaAbsoluteAt(sunLng: number, moonLng: number): number {
  const diff = (moonLng - sunLng + 360) % 360;
  const karanaBoundaryTolerance = 0.001;
  const karanaProgress = diff / 6;
  const nextBoundary = Math.ceil(karanaProgress);
  return nextBoundary - karanaProgress <= karanaBoundaryTolerance
    ? nextBoundary
    : Math.floor(karanaProgress);
}

function karanaNameIndexFor(karanaAbsolute: number): number {
  if (karanaAbsolute === 0) return 10;
  if (karanaAbsolute >= 57) {
    const fixed = [7, 8, 9, 10];
    return fixed[karanaAbsolute - 57] ?? 0;
  }
  return ((karanaAbsolute - 1) % 7);
}

function computeKaranaIndex(tithiIndex: number, sunLng: number, moonLng: number): number {
  return karanaNameIndexFor(karanaAbsoluteAt(sunLng, moonLng));
}

/**
 * End of the karana in slot `karanaAbsolute` (PRD-16 Phase 2 / TRD-16/P2 §4.2):
 * the instant the Sun–Moon elongation crosses the slot's upper 6° boundary.
 * A parameterised twin of `bisectTithiEnd` — karana boundaries sit every 6°
 * where tithi boundaries sit every 12°, so a karana is half a tithi
 * (~10–13.4 h) and the 30 h bracket is generous.
 */
function bisectKaranaEnd(sunrise: Date, karanaAbsolute: number, civilTimeZone?: string): Date | null {
  let lo = sunrise;
  let hi = new Date(lo.getTime() + 30 * 60 * 60 * 1000);
  const year = instantYear(sunrise, civilTimeZone);
  const targetBoundary = (((karanaAbsolute + 1) % 60) * 6) % 360;

  for (let i = 0; i < 20; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const sunLng = getSiderealSunLng(mid, year);
    const moonLng = getSiderealMoonLng(mid, year);
    const diff = (moonLng - sunLng + 360) % 360;

    if (diff >= targetBoundary && (diff - targetBoundary) < 180) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

function bisectTithiEnd(sunrise: Date, currentTithiIndex: number, civilTimeZone?: string): Date | null {
  let lo = sunrise;
  let hi = new Date(lo.getTime() + 30 * 60 * 60 * 1000);
  const year = instantYear(sunrise, civilTimeZone);
  const targetBoundary = ((currentTithiIndex + 1) % 30) * 12;

  for (let i = 0; i < 20; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const sunLng = getSiderealSunLng(mid, year);
    const moonLng = getSiderealMoonLng(mid, year);
    const diff = (moonLng - sunLng + 360) % 360;

    if (diff >= targetBoundary && (diff - targetBoundary) < 180) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

function bisectNakshatraEnd(sunrise: Date, currentNakIndex: number, civilTimeZone?: string): Date | null {
  let lo = sunrise;
  let hi = new Date(lo.getTime() + 30 * 60 * 60 * 1000);
  const year = instantYear(sunrise, civilTimeZone);
  const targetBoundary = ((currentNakIndex + 1) % 27) * (360 / 27);

  for (let i = 0; i < 20; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const moonLng = getSiderealMoonLng(mid, year);

    if (moonLng >= targetBoundary && (moonLng - targetBoundary) < 180) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

function findNextPurnimaBoundary(from: Date, civilTimeZone?: string): Date {
  const startPhase = computePhaseAngle(from, civilTimeZone);
  const targetAdvance = (180 - startPhase + 360) % 360 || 360;
  let lo = from;
  let hi = new Date(lo.getTime() + 24 * 60 * 60 * 1000);

  for (let i = 0; i < 35 && angularAdvance(startPhase, computePhaseAngle(hi, civilTimeZone)) < targetAdvance; i++) {
    hi = new Date(hi.getTime() + 24 * 60 * 60 * 1000);
  }

  for (let i = 0; i < 30; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    if (angularAdvance(startPhase, computePhaseAngle(mid, civilTimeZone)) >= targetAdvance) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

function computePurnimantLunarMonth(sunrise: Date, civilTimeZone?: string): { index: number; isAdhik: boolean } {
  const purnima = findNextPurnimaBoundary(sunrise, civilTimeZone);
  const fullMoonLng = getSiderealMoonLng(purnima, instantYear(purnima, civilTimeZone));
  const fullMoonSlot = Math.round(fullMoonLng / 30) % 12;
  const lunarMonthIndex = (fullMoonSlot + 6) % 12;
  return { index: lunarMonthIndex, isAdhik: false };
}

function resolveCalendarMonthIndex(purnimantMonthIndex: number, paksha: Paksha, calendarSystem: CalendarSystem): number {
  if (calendarSystem === 'amanta' && paksha === 'krishna') {
    return (purnimantMonthIndex + 11) % 12;
  }
  return purnimantMonthIndex;
}

// --- Corrected lunar month / Adhik Maas / Vikram Samvat (new-moon anchored, sankranti-based) ---
// Replaces the per-day "moon longitude at next purnima → nearest 30° slot" heuristic, which
// produced single-day month spikes, never detected Adhik (leap) months, and rolled the samvat
// year too early. The lunar month is named from the solar rashi at the lunation's new moon
// (Sūrya-Siddhānta amanta rule); a lunation with no solar sankranti inside it is Adhik.
const DAY_MS = 86400000;
const SYNODIC_DAYS = 29.530588;

// Sun–Moon elongation in [0, 360): 0 at new moon, 180 at full moon.
function moonElongation(date: Date, civilTimeZone?: string): number {
  const year = instantYear(date, civilTimeZone);
  return (getSiderealMoonLng(date, year) - getSiderealSunLng(date, year) + 360) % 360;
}

function solarRashi(date: Date, civilTimeZone?: string): number {
  return Math.floor(getSiderealSunLng(date, instantYear(date, civilTimeZone)) / 30) % 12;
}

// Refine to the instant near `estimate` where elongation crosses `target` (0 = new moon,
// 180 = full moon), ascending. Brackets ±2 days, expands a few days if needed, then bisects.
function refineConjunction(estimate: Date, target: number, civilTimeZone?: string): Date {
  const signed = (d: Date) => {
    const e = moonElongation(d, civilTimeZone) - target;
    return ((e + 540) % 360) - 180; // wrap into (-180, 180], ascending through 0 at target
  };
  let lo = new Date(estimate.getTime() - 2 * DAY_MS);
  let hi = new Date(estimate.getTime() + 2 * DAY_MS);
  for (let g = 0; signed(lo) > 0 && g < 8; g++) lo = new Date(lo.getTime() - DAY_MS);
  for (let g = 0; signed(hi) < 0 && g < 8; g++) hi = new Date(hi.getTime() + DAY_MS);
  for (let i = 0; i < 40; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    if (signed(mid) < 0) lo = mid; else hi = mid;
  }
  return new Date((lo.getTime() + hi.getTime()) / 2);
}

function newMoonBounds(t: Date, civilTimeZone?: string): { prevNM: Date; nextNM: Date } {
  const p = moonElongation(t, civilTimeZone);
  const prevEst = new Date(t.getTime() - (p / 360) * SYNODIC_DAYS * DAY_MS);
  const nextEst = new Date(t.getTime() + ((360 - p) / 360) * SYNODIC_DAYS * DAY_MS);
  return { prevNM: refineConjunction(prevEst, 0, civilTimeZone), nextNM: refineConjunction(nextEst, 0, civilTimeZone) };
}

function nextFullMoon(t: Date, civilTimeZone?: string): Date {
  const p = moonElongation(t, civilTimeZone);
  const ahead = (((180 - p) % 360 + 360) % 360) / 360 * SYNODIC_DAYS;
  return refineConjunction(new Date(t.getTime() + ahead * DAY_MS), 180, civilTimeZone);
}

// Amanta lunar month for the lunation containing instant `t`.
function amantaMonthAt(t: Date, civilTimeZone?: string): { index: number; isAdhik: boolean } {
  const { prevNM, nextNM } = newMoonBounds(t, civilTimeZone);
  const rashiStart = solarRashi(prevNM, civilTimeZone);
  return { index: (rashiStart + 1) % 12, isAdhik: rashiStart === solarRashi(nextNM, civilTimeZone) };
}

// Display month + Adhik flag for the chosen calendar system.
function lunarMonthForSystem(sunrise: Date, system: CalendarSystem, civilTimeZone?: string): { index: number; isAdhik: boolean } {
  const dayMonth = amantaMonthAt(sunrise, civilTimeZone);
  if (system === 'amanta') return dayMonth;
  // Purnimanta month = the month of the lunation containing the ending purnima (next full moon).
  // The Adhik flag is a property of the day's lunation and is shown in both systems.
  return { index: amantaMonthAt(nextFullMoon(sunrise, civilTimeZone), civilTimeZone).index, isAdhik: dayMonth.isAdhik };
}

const chaitraNewMoonCache = new Map<string, Date>();
function chaitraNewMoon(gregYear: number, civilTimeZone?: string): Date {
  const cacheKey = `${civilTimeZone ?? 'local'}:${gregYear}`;
  const cached = chaitraNewMoonCache.get(cacheKey);
  if (cached) return cached;
  // amanta Chaitra begins at the new moon while the Sun is in Meena (rashi 11), ~Mar–Apr.
  const anchor = (month: number, day: number) => civilStart(new Date(gregYear, month, day, 12), civilTimeZone);
  let result = newMoonBounds(anchor(2, 27), civilTimeZone).prevNM;
  for (const date of [anchor(2, 12), anchor(2, 27), anchor(3, 11), anchor(3, 26)]) {
    const b = newMoonBounds(date, civilTimeZone);
    if (solarRashi(b.prevNM, civilTimeZone) === 11) { result = b.prevNM; break; }
    if (solarRashi(b.nextNM, civilTimeZone) === 11) { result = b.nextNM; break; }
  }
  chaitraNewMoonCache.set(cacheKey, result);
  return result;
}

function localKey(d: Date, civilTimeZone?: string): number {
  const { year, month, day } = civilParts(d, civilTimeZone);
  return year * 10000 + month * 100 + day;
}

// Vikram Samvat (Chaitradi): the year number increments with Chaitra — on the day of the
// Chaitra new moon (the amavasya that ends Phalguna), matching drikpanchang. This is the
// correct boundary even when Chaitra Shukla Pratipada is kshaya (skipped at sunrise).
function vikramSamvatFor(sunrise: Date, civilTimeZone?: string): number {
  const gregYear = instantYear(sunrise, civilTimeZone);
  const nmC = chaitraNewMoon(gregYear, civilTimeZone);
  return localKey(sunrise, civilTimeZone) >= localKey(nmC, civilTimeZone) ? gregYear + 57 : gregYear + 56;
}

const tithiMonthCache = new Map<string, { tithiIndex: number; lunarMonth: number; paksha: Paksha; isAdhik: boolean }>();

function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Sunrise memo shared by every solver. A day's sunrise is solved once per location:
// computePanchangForDate needs today's AND tomorrow's (kshaya detection), and
// tomorrow's own call, useMuhurat's today+tomorrow pair, and the festival scans all
// ask for the same instants — without the memo each is an independent root-find.
const sunriseCache = new Map<string, Date>();

function sunriseFor(localDate: Date, location?: GeoLocation & { cityId?: string }, civilTimeZone?: string): Date {
  const key = `${locationKey(location)}:${civilTimeZone ?? 'local'}:${getLocalDateKey(localDate)}`;
  let cached = sunriseCache.get(key);
  if (!cached) {
    cached = computeSunrise(localDate, observerFor(location ?? UJJAIN_GEO), civilTimeZone);
    sunriseCache.set(key, cached);
  }
  return cached;
}

/**
 * A civil day's local sunrise, through the shared memo (PRD-16/P3). The lagna
 * sweep needs [sunrise, nextSunrise) and `computePanchangForDate` has already
 * solved tomorrow's sunrise for kshaya detection, so this is a cache hit in
 * every real call path — never a second root-find.
 */
export function sunriseForDate(localDate: Date, options: PanchangComputationOptions = {}): Date {
  return sunriseFor(localDate, options.location, options.civilTimeZone);
}

// Lightweight tithi + lunar-month for a date, computed at sunrise — exactly the
// two values festival matching needs. Skips the end-time bisections and the
// sunset/moonrise rise/set solves that computePanchangForDate also performs.
export function computeTithiAndMonth(
  localDate: Date,
  options: PanchangComputationOptions = {}
): { tithiIndex: number; lunarMonth: number; paksha: Paksha; isAdhik: boolean } {
  const calendarSystem = options.calendarSystem ?? 'purnimant';
  const cacheKey = `${calendarSystem}:${locationKey(options.location)}:${options.civilTimeZone ?? 'local'}:${getLocalDateKey(localDate)}`;
  const cached = tithiMonthCache.get(cacheKey);
  if (cached) return cached;

  const year = localDate.getFullYear();
  const sunrise = sunriseFor(localDate, options.location, options.civilTimeZone);
  const sunLng = getSiderealSunLng(sunrise, year);
  const moonLng = getSiderealMoonLng(sunrise, year);
  const tithiIndex = computeTithiIndex(sunLng, moonLng);
  const paksha: Paksha = tithiIndex < 15 ? 'shukla' : 'krishna';
  const { index: lunarMonthIndex, isAdhik } = lunarMonthForSystem(sunrise, calendarSystem, options.civilTimeZone);
  const result = { tithiIndex, lunarMonth: lunarMonthIndex + 1, paksha, isAdhik };
  tithiMonthCache.set(cacheKey, result);
  return result;
}

export function computePanchangForDate(localDate: Date, options: PanchangComputationOptions = {}): PanchangData {
  const calendarSystem = options.calendarSystem ?? 'purnimant';
  const observer = observerFor(options.location ?? UJJAIN_GEO);
  const year = localDate.getFullYear();
  const sunrise = sunriseFor(localDate, options.location, options.civilTimeZone);

  const sunLng = getSiderealSunLng(sunrise, year);
  const moonLng = getSiderealMoonLng(sunrise, year);

  const tithiIndex = computeTithiIndex(sunLng, moonLng);
  const nakshatraIndex = computeNakshatraIndex(moonLng);
  const yogaIndex = computeYogaIndex(sunLng, moonLng);
  const karanaIndex = computeKaranaIndex(tithiIndex, sunLng, moonLng);
  const varaIndex = new Date(Date.UTC(year, localDate.getMonth(), localDate.getDate())).getUTCDay();

  const paksha: Paksha = tithiIndex < 15 ? 'shukla' : 'krishna';

  const tithiEndTime = bisectTithiEnd(sunrise, tithiIndex, options.civilTimeZone);
  const nakshatraEndTime = bisectNakshatraEnd(sunrise, nakshatraIndex, options.civilTimeZone);
  // Phase 2 (TRD-16/P2 §4.2): the karana's end, solved like the tithi's. This
  // is what lets Bhadra be an interval instead of a whole-day flag, and it
  // surfaces on the Panchang tab / Muhurat card automatically (elementLine
  // prints endTime whenever it is non-null — TRD §1.2 blast radius).
  const karanaAbsolute = karanaAbsoluteAt(sunLng, moonLng);
  const karanaEndTime = bisectKaranaEnd(sunrise, karanaAbsolute, options.civilTimeZone);

  // Late-onset Vishti (PRD-16/P3 §0.3): a Bhadra whose karana BEGINS during
  // the day was invisible while only the sunrise karana was read — a finder
  // quoting minute-grade windows must not miss an afternoon Bhadra. A karana
  // lasts ~10–13.4 h, so at most one boundary falls inside daylight: checking
  // the slot after the sunrise karana suffices for the daytime windows the
  // finder offers. One extra bisection on ~13% of days.
  let lateVishti: PanchangData['lateVishti'] = null;
  if (karanaIndex !== 6 && karanaNameIndexFor((karanaAbsolute + 1) % 60) === 6 && karanaEndTime) {
    const lateEnd = bisectKaranaEnd(karanaEndTime, (karanaAbsolute + 1) % 60, options.civilTimeZone);
    if (lateEnd) lateVishti = { start: karanaEndTime, end: lateEnd };
  }

  // Kshaya detection: a tithi or nakshatra can begin after this sunrise and end
  // before the next, touching neither — it is then the sunrise-anga of no civil
  // date (e.g. Ekadashi on 10 Jul 2026). Between consecutive sunrises the index
  // advances by 1 (normal), 0 (vriddhi — spans two sunrises), or 2 (kshaya), so a
  // +2 jump pins the skipped anga. Tomorrow's sunrise comes from the shared memo
  // and the two ephemeris reads are cheap; the end-time bisections run only on
  // actual kshaya days (a handful per year).
  const nextSunrise = sunriseFor(
    new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1),
    options.location,
    options.civilTimeZone
  );
  const nextYear = instantYear(nextSunrise, options.civilTimeZone);
  const nextSunLng = getSiderealSunLng(nextSunrise, nextYear);
  const nextMoonLng = getSiderealMoonLng(nextSunrise, nextYear);

  let kshayaTithi: PanchangData['kshayaTithi'] = null;
  if ((tithiIndex + 2) % 30 === computeTithiIndex(nextSunLng, nextMoonLng) && tithiEndTime) {
    const kshayaIndex = (tithiIndex + 1) % 30;
    kshayaTithi = {
      index: kshayaIndex,
      paksha: kshayaIndex < 15 ? 'shukla' : 'krishna',
      nameHi: TITHI_NAMES_HI[kshayaIndex],
      nameEn: TITHI_NAMES_EN[kshayaIndex],
      endTime: bisectTithiEnd(tithiEndTime, kshayaIndex, options.civilTimeZone),
    };
  }

  let kshayaNakshatra: PanchangData['kshayaNakshatra'] = null;
  if ((nakshatraIndex + 2) % 27 === computeNakshatraIndex(nextMoonLng) && nakshatraEndTime) {
    const kshayaIndex = (nakshatraIndex + 1) % 27;
    kshayaNakshatra = {
      index: kshayaIndex,
      nameHi: NAKSHATRA_NAMES_HI[kshayaIndex],
      nameEn: NAKSHATRA_NAMES_EN[kshayaIndex],
      endTime: bisectNakshatraEnd(nakshatraEndTime, kshayaIndex, options.civilTimeZone),
    };
  }

  const sunset = computeSunset(localDate, observer, options.civilTimeZone);
  const moonrise = computeMoonrise(localDate, observer, options.civilTimeZone);

  const brahmaMuhurtaEnd = new Date(sunrise.getTime() - 48 * 60 * 1000);
  const brahmaMuhurtaStart = new Date(sunrise.getTime() - 96 * 60 * 1000);

  const { index: lunarMonthIndex, isAdhik } = lunarMonthForSystem(sunrise, calendarSystem, options.civilTimeZone);
  const vikramSamvat = vikramSamvatFor(sunrise, options.civilTimeZone);

  return {
    date: localDate,
    calendarSystem,
    vara: {
      index: varaIndex,
      nameHi: VARA_NAMES_HI[varaIndex],
      nameEn: VARA_NAMES_EN[varaIndex],
    },
    tithi: {
      index: tithiIndex,
      paksha,
      nameHi: TITHI_NAMES_HI[tithiIndex],
      nameEn: TITHI_NAMES_EN[tithiIndex],
      endTime: tithiEndTime,
    },
    kshayaTithi,
    nakshatra: {
      index: nakshatraIndex,
      nameHi: NAKSHATRA_NAMES_HI[nakshatraIndex],
      nameEn: NAKSHATRA_NAMES_EN[nakshatraIndex],
      endTime: nakshatraEndTime,
    },
    kshayaNakshatra,
    yoga: {
      index: yogaIndex,
      nameHi: YOGA_NAMES_HI[yogaIndex],
      nameEn: YOGA_NAMES_EN[yogaIndex],
      endTime: null,
    },
    karana: {
      index: karanaIndex,
      nameHi: KARANA_NAMES_HI[karanaIndex],
      nameEn: KARANA_NAMES_EN[karanaIndex],
      endTime: karanaEndTime,
    },
    lateVishti,
    sunrise,
    sunset,
    moonrise,
    brahmaMuhurta: { start: brahmaMuhurtaStart, end: brahmaMuhurtaEnd },
    vikramSamvat,
    lunarMonth: {
      index: lunarMonthIndex + 1,
      nameHi: LUNAR_MONTH_NAMES_HI[lunarMonthIndex],
      nameEn: LUNAR_MONTH_NAMES_EN[lunarMonthIndex],
      isAdhik,
    },
  };
}
