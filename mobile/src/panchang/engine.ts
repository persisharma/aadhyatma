import {
  Body,
  EclipticGeoMoon,
  SunPosition,
  MakeTime,
  SearchRiseSet,
  Observer,
} from 'astronomy-engine';

import type { PanchangData, Paksha } from './types';
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

const observer = new Observer(UJJAIN_LAT, UJJAIN_LNG, UJJAIN_ELEV);

function getAyanamsa(year: number): number {
  return 23.853 + 0.01396 * (year - 2000);
}

function getSiderealSunLng(date: Date, year: number): number {
  const astroTime = MakeTime(date);
  const tropical = SunPosition(astroTime).elon;
  return (tropical - getAyanamsa(year) + 360) % 360;
}

function getSiderealMoonLng(date: Date, year: number): number {
  const astroTime = MakeTime(date);
  const tropical = EclipticGeoMoon(astroTime).lon;
  return (tropical - getAyanamsa(year) + 360) % 360;
}

function computeSunrise(localDate: Date): Date {
  const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Sun, observer, +1, astroTime, 1);
  if (!result) throw new Error(`No sunrise found for ${localDate.toISOString()}`);
  return result.date;
}

function computeSunset(localDate: Date): Date {
  const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0);
  const astroTime = MakeTime(startOfDay);
  const result = SearchRiseSet(Body.Sun, observer, -1, astroTime, 1);
  if (!result) throw new Error(`No sunset found for ${localDate.toISOString()}`);
  return result.date;
}

function computeMoonrise(localDate: Date): Date | null {
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

function computeKaranaIndex(tithiIndex: number, sunLng: number, moonLng: number): number {
  const diff = (moonLng - sunLng + 360) % 360;
  const karanaAbsolute = Math.floor(diff / 6);
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

function computeLunarMonth(sunrise: Date, year: number): { index: number; isAdhik: boolean } {
  const sunLng = getSiderealSunLng(sunrise, year);
  const solarMonth = Math.floor(sunLng / 30);
  const lunarMonthIndex = (solarMonth + 1) % 12;
  return { index: lunarMonthIndex, isAdhik: false };
}

function computeVikramSamvat(localDate: Date, lunarMonthIndex: number): number {
  const gregYear = localDate.getFullYear();
  if (lunarMonthIndex >= 0 && lunarMonthIndex <= 8) {
    return gregYear + 57;
  }
  return gregYear + 56;
}

export function computePanchangForDate(localDate: Date): PanchangData {
  const year = localDate.getFullYear();
  const sunrise = computeSunrise(localDate);

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

  const sunset = computeSunset(localDate);
  const moonrise = computeMoonrise(localDate);

  const brahmaMuhurtaEnd = new Date(sunrise.getTime() - 48 * 60 * 1000);
  const brahmaMuhurtaStart = new Date(sunrise.getTime() - 96 * 60 * 1000);

  const { index: lunarMonthIndex, isAdhik } = computeLunarMonth(sunrise, year);
  const vikramSamvat = computeVikramSamvat(localDate, lunarMonthIndex);

  return {
    date: localDate,
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
    nakshatra: {
      index: nakshatraIndex,
      nameHi: NAKSHATRA_NAMES_HI[nakshatraIndex],
      nameEn: NAKSHATRA_NAMES_EN[nakshatraIndex],
      endTime: nakshatraEndTime,
    },
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
