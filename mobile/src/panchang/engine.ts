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

function computeSunrise(localDate: Date, observer: Observer): Date {
  const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Sun, observer, +1, astroTime, 1);
  if (!result) throw new Error(`No sunrise found for ${localDate.toISOString()}`);
  return result.date;
}

function computeSunset(localDate: Date, observer: Observer): Date {
  const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1);
  if (!result) throw new Error(`No sunset found for ${localDate.toISOString()}`);
  return result.date;
}

function computeMoonrise(localDate: Date, observer: Observer): Date | null {
  const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0);
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

function computePhaseAngle(date: Date): number {
  const year = date.getFullYear();
  const sunLng = getSiderealSunLng(date, year);
  const moonLng = getSiderealMoonLng(date, year);
  return (moonLng - sunLng + 360) % 360;
}

function angularAdvance(from: number, to: number): number {
  return (to - from + 360) % 360;
}

function computeKaranaIndex(tithiIndex: number, sunLng: number, moonLng: number): number {
  const diff = (moonLng - sunLng + 360) % 360;
  const karanaBoundaryTolerance = 0.001;
  const karanaProgress = diff / 6;
  const nextBoundary = Math.ceil(karanaProgress);
  const karanaAbsolute = nextBoundary - karanaProgress <= karanaBoundaryTolerance
    ? nextBoundary
    : Math.floor(karanaProgress);
  if (karanaAbsolute === 0) return 10;
  if (karanaAbsolute >= 57) {
    const fixed = [7, 8, 9, 10];
    return fixed[karanaAbsolute - 57] ?? 0;
  }
  return ((karanaAbsolute - 1) % 7);
}

function bisectTithiEnd(sunrise: Date, currentTithiIndex: number): Date | null {
  let lo = sunrise;
  let hi = new Date(lo.getTime() + 30 * 60 * 60 * 1000);
  const year = sunrise.getFullYear();
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

function bisectNakshatraEnd(sunrise: Date, currentNakIndex: number): Date | null {
  let lo = sunrise;
  let hi = new Date(lo.getTime() + 30 * 60 * 60 * 1000);
  const year = sunrise.getFullYear();
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

function findNextPurnimaBoundary(from: Date): Date {
  const startPhase = computePhaseAngle(from);
  const targetAdvance = (180 - startPhase + 360) % 360 || 360;
  let lo = from;
  let hi = new Date(lo.getTime() + 24 * 60 * 60 * 1000);

  for (let i = 0; i < 35 && angularAdvance(startPhase, computePhaseAngle(hi)) < targetAdvance; i++) {
    hi = new Date(hi.getTime() + 24 * 60 * 60 * 1000);
  }

  for (let i = 0; i < 30; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    if (angularAdvance(startPhase, computePhaseAngle(mid)) >= targetAdvance) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

function computePurnimantLunarMonth(sunrise: Date): { index: number; isAdhik: boolean } {
  const purnima = findNextPurnimaBoundary(sunrise);
  const fullMoonLng = getSiderealMoonLng(purnima, purnima.getFullYear());
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
function moonElongation(date: Date): number {
  const year = date.getFullYear();
  return (getSiderealMoonLng(date, year) - getSiderealSunLng(date, year) + 360) % 360;
}

function solarRashi(date: Date): number {
  return Math.floor(getSiderealSunLng(date, date.getFullYear()) / 30) % 12;
}

// Refine to the instant near `estimate` where elongation crosses `target` (0 = new moon,
// 180 = full moon), ascending. Brackets ±2 days, expands a few days if needed, then bisects.
function refineConjunction(estimate: Date, target: number): Date {
  const signed = (d: Date) => {
    const e = moonElongation(d) - target;
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

function newMoonBounds(t: Date): { prevNM: Date; nextNM: Date } {
  const p = moonElongation(t);
  const prevEst = new Date(t.getTime() - (p / 360) * SYNODIC_DAYS * DAY_MS);
  const nextEst = new Date(t.getTime() + ((360 - p) / 360) * SYNODIC_DAYS * DAY_MS);
  return { prevNM: refineConjunction(prevEst, 0), nextNM: refineConjunction(nextEst, 0) };
}

function nextFullMoon(t: Date): Date {
  const p = moonElongation(t);
  const ahead = (((180 - p) % 360 + 360) % 360) / 360 * SYNODIC_DAYS;
  return refineConjunction(new Date(t.getTime() + ahead * DAY_MS), 180);
}

// Amanta lunar month for the lunation containing instant `t`.
function amantaMonthAt(t: Date): { index: number; isAdhik: boolean } {
  const { prevNM, nextNM } = newMoonBounds(t);
  const rashiStart = solarRashi(prevNM);
  return { index: (rashiStart + 1) % 12, isAdhik: rashiStart === solarRashi(nextNM) };
}

// Display month + Adhik flag for the chosen calendar system.
function lunarMonthForSystem(sunrise: Date, system: CalendarSystem): { index: number; isAdhik: boolean } {
  const dayMonth = amantaMonthAt(sunrise);
  if (system === 'amanta') return dayMonth;
  // Purnimanta month = the month of the lunation containing the ending purnima (next full moon).
  // The Adhik flag is a property of the day's lunation and is shown in both systems.
  return { index: amantaMonthAt(nextFullMoon(sunrise)).index, isAdhik: dayMonth.isAdhik };
}

const chaitraNewMoonCache = new Map<number, Date>();
function chaitraNewMoon(gregYear: number): Date {
  const cached = chaitraNewMoonCache.get(gregYear);
  if (cached) return cached;
  // amanta Chaitra begins at the new moon while the Sun is in Meena (rashi 11), ~Mar–Apr.
  let result = newMoonBounds(new Date(gregYear, 2, 27)).prevNM;
  for (const anchor of [new Date(gregYear, 2, 12), new Date(gregYear, 2, 27), new Date(gregYear, 3, 11), new Date(gregYear, 3, 26)]) {
    const b = newMoonBounds(anchor);
    if (solarRashi(b.prevNM) === 11) { result = b.prevNM; break; }
    if (solarRashi(b.nextNM) === 11) { result = b.nextNM; break; }
  }
  chaitraNewMoonCache.set(gregYear, result);
  return result;
}

function localKey(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// Vikram Samvat (Chaitradi): the year number increments with Chaitra — on the day of the
// Chaitra new moon (the amavasya that ends Phalguna), matching drikpanchang. This is the
// correct boundary even when Chaitra Shukla Pratipada is kshaya (skipped at sunrise).
function vikramSamvatFor(sunrise: Date): number {
  const gregYear = sunrise.getFullYear();
  const nmC = chaitraNewMoon(gregYear);
  return localKey(sunrise) >= localKey(nmC) ? gregYear + 57 : gregYear + 56;
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

function sunriseFor(localDate: Date, location?: GeoLocation & { cityId?: string }): Date {
  const key = `${locationKey(location)}:${getLocalDateKey(localDate)}`;
  let cached = sunriseCache.get(key);
  if (!cached) {
    cached = computeSunrise(localDate, observerFor(location ?? UJJAIN_GEO));
    sunriseCache.set(key, cached);
  }
  return cached;
}

// Lightweight tithi + lunar-month for a date, computed at sunrise — exactly the
// two values festival matching needs. Skips the end-time bisections and the
// sunset/moonrise rise/set solves that computePanchangForDate also performs.
export function computeTithiAndMonth(
  localDate: Date,
  options: PanchangComputationOptions = {}
): { tithiIndex: number; lunarMonth: number; paksha: Paksha; isAdhik: boolean } {
  const calendarSystem = options.calendarSystem ?? 'purnimant';
  const cacheKey = `${calendarSystem}:${locationKey(options.location)}:${getLocalDateKey(localDate)}`;
  const cached = tithiMonthCache.get(cacheKey);
  if (cached) return cached;

  const year = localDate.getFullYear();
  const sunrise = sunriseFor(localDate, options.location);
  const sunLng = getSiderealSunLng(sunrise, year);
  const moonLng = getSiderealMoonLng(sunrise, year);
  const tithiIndex = computeTithiIndex(sunLng, moonLng);
  const paksha: Paksha = tithiIndex < 15 ? 'shukla' : 'krishna';
  const { index: lunarMonthIndex, isAdhik } = lunarMonthForSystem(sunrise, calendarSystem);
  const result = { tithiIndex, lunarMonth: lunarMonthIndex + 1, paksha, isAdhik };
  tithiMonthCache.set(cacheKey, result);
  return result;
}

export function computePanchangForDate(localDate: Date, options: PanchangComputationOptions = {}): PanchangData {
  const calendarSystem = options.calendarSystem ?? 'purnimant';
  const observer = observerFor(options.location ?? UJJAIN_GEO);
  const year = localDate.getFullYear();
  const sunrise = sunriseFor(localDate, options.location);

  const sunLng = getSiderealSunLng(sunrise, year);
  const moonLng = getSiderealMoonLng(sunrise, year);

  const tithiIndex = computeTithiIndex(sunLng, moonLng);
  const nakshatraIndex = computeNakshatraIndex(moonLng);
  const yogaIndex = computeYogaIndex(sunLng, moonLng);
  const karanaIndex = computeKaranaIndex(tithiIndex, sunLng, moonLng);
  const varaIndex = localDate.getDay();

  const paksha: Paksha = tithiIndex < 15 ? 'shukla' : 'krishna';

  const tithiEndTime = bisectTithiEnd(sunrise, tithiIndex);
  const nakshatraEndTime = bisectNakshatraEnd(sunrise, nakshatraIndex);

  // Kshaya detection: a tithi or nakshatra can begin after this sunrise and end
  // before the next, touching neither — it is then the sunrise-anga of no civil
  // date (e.g. Ekadashi on 10 Jul 2026). Between consecutive sunrises the index
  // advances by 1 (normal), 0 (vriddhi — spans two sunrises), or 2 (kshaya), so a
  // +2 jump pins the skipped anga. Tomorrow's sunrise comes from the shared memo
  // and the two ephemeris reads are cheap; the end-time bisections run only on
  // actual kshaya days (a handful per year).
  const nextSunrise = sunriseFor(
    new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1),
    options.location
  );
  const nextYear = nextSunrise.getFullYear();
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
      endTime: bisectTithiEnd(tithiEndTime, kshayaIndex),
    };
  }

  let kshayaNakshatra: PanchangData['kshayaNakshatra'] = null;
  if ((nakshatraIndex + 2) % 27 === computeNakshatraIndex(nextMoonLng) && nakshatraEndTime) {
    const kshayaIndex = (nakshatraIndex + 1) % 27;
    kshayaNakshatra = {
      index: kshayaIndex,
      nameHi: NAKSHATRA_NAMES_HI[kshayaIndex],
      nameEn: NAKSHATRA_NAMES_EN[kshayaIndex],
      endTime: bisectNakshatraEnd(nakshatraEndTime, kshayaIndex),
    };
  }

  const sunset = computeSunset(localDate, observer);
  const moonrise = computeMoonrise(localDate, observer);

  const brahmaMuhurtaEnd = new Date(sunrise.getTime() - 48 * 60 * 1000);
  const brahmaMuhurtaStart = new Date(sunrise.getTime() - 96 * 60 * 1000);

  const { index: lunarMonthIndex, isAdhik } = lunarMonthForSystem(sunrise, calendarSystem);
  const vikramSamvat = vikramSamvatFor(sunrise);

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
      endTime: null,
    },
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
