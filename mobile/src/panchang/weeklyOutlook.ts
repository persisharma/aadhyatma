import { computeTaraBala, type TaraBala, type TaraBalaTone } from './gochar';
import {
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  NAKSHATRA_SPAN,
  getSiderealPlanetLongitude,
  houseForRashi,
  indiaDateKey,
  indiaDayAnchor,
} from './kundali';
import type { KundaliChart } from './kundali';

/**
 * Weekly outlook — PRD-20 Phase 5.
 *
 * Seven India civil days folded over two classical daily measures: chandra
 * bala (the Moon's transit house from the janma rashi) and tara bala (the
 * 9-cycle from the janma nakshatra). Each day gets one of three quiet tones
 * with the traditional basis named in the copy — no numeric rating, no
 * binary verdict, no prediction (RULEBOOK §14.3). Pure: explicit chart +
 * start date in, typed data out.
 */

const DAY_MS = 86_400_000;

/** Classical chandra bala: supportive Moon transit houses from the janma rashi. */
export const CHANDRA_BALA_HOUSES: readonly number[] = [1, 3, 6, 7, 10, 11];

export type WeeklyDayTone = TaraBalaTone;

export type WeeklyDay = {
  dateKey: string;
  anchor: Date;
  moonRashiIndex: number;
  chandraBalaHouse: number;
  chandraBalaFavourable: boolean;
  taraBala: TaraBala;
  tone: WeeklyDayTone;
  lineHi: string;
  lineEn: string;
};

export type WeeklyOutlook = {
  startDateKey: string;
  janmaRashiIndex: number;
  janmaNakshatraIndex: number;
  days: readonly WeeklyDay[];
};

function ordinalEn(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function toneFor(chandraFavourable: boolean, tara: TaraBala): WeeklyDayTone {
  if (chandraFavourable && tara.tone === 'favourable') return 'favourable';
  if (!chandraFavourable && tara.tone === 'reflective') return 'reflective';
  return 'steady';
}

function linesFor(
  tone: WeeklyDayTone,
  house: number,
  tara: TaraBala
): { hi: string; en: string } {
  const basisHi = `चन्द्र ${house} भाव (${HOUSE_THEME_HI[house - 1]}) में, ${tara.nameHi} तारा`;
  const basisEn = `Moon in the ${ordinalEn(house)} bhava (${HOUSE_THEME_EN[house - 1]}), ${tara.nameEn} tara`;
  if (tone === 'favourable') {
    return {
      hi: `${basisHi} — परम्परा में सहज, अनुकूल दिन माना जाता है।`,
      en: `${basisEn} — traditionally read as an easy, supportive day.`,
    };
  }
  if (tone === 'reflective') {
    return {
      hi: `${basisHi} — परम्परा में धैर्य और ठहराव का दिन; चिंतन को स्थान दें।`,
      en: `${basisEn} — traditionally a day for patience and pause; give reflection its space.`,
    };
  }
  return {
    hi: `${basisHi} — मिला-जुला दिन; नियमित कार्य और सहज गति उपयुक्त मानी जाती है।`,
    en: `${basisEn} — a mixed day; routine work at an easy pace is the traditional reading.`,
  };
}

export function computeWeeklyOutlook(
  chart: KundaliChart,
  startDate: Date
): WeeklyOutlook {
  const moon = chart.grahas.find((position) => position.graha === 'moon');
  if (!moon) throw new Error('Moon position is required');
  const start = indiaDayAnchor(startDate);

  const days = Array.from({ length: 7 }, (_, offset) => {
    const anchor = indiaDayAnchor(new Date(start.getTime() + offset * DAY_MS));
    const moonLongitude = getSiderealPlanetLongitude('moon', anchor);
    const moonRashiIndex = Math.floor(moonLongitude / 30) % 12;
    const dayNakshatraIndex = Math.floor(moonLongitude / NAKSHATRA_SPAN) % 27;
    const chandraBalaHouse = houseForRashi(moonRashiIndex, moon.rashiIndex);
    const chandraBalaFavourable = CHANDRA_BALA_HOUSES.includes(chandraBalaHouse);
    const taraBala = computeTaraBala(moon.nakshatraIndex, dayNakshatraIndex);
    const tone = toneFor(chandraBalaFavourable, taraBala);
    const lines = linesFor(tone, chandraBalaHouse, taraBala);
    return {
      dateKey: indiaDateKey(anchor),
      anchor,
      moonRashiIndex,
      chandraBalaHouse,
      chandraBalaFavourable,
      taraBala,
      tone,
      lineHi: lines.hi,
      lineEn: lines.en,
    };
  });

  return {
    startDateKey: indiaDateKey(start),
    janmaRashiIndex: moon.rashiIndex,
    janmaNakshatraIndex: moon.nakshatraIndex,
    days,
  };
}
