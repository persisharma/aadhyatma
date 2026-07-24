import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  MakeTime,
  SiderealTime,
  SunPosition,
} from 'astronomy-engine';

import { getAyanamsa } from './engine';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from './names';

export type Graha =
  | 'sun'
  | 'moon'
  | 'mars'
  | 'mercury'
  | 'jupiter'
  | 'venus'
  | 'saturn'
  | 'rahu'
  | 'ketu';

export type DashaLord =
  | 'ketu'
  | 'venus'
  | 'sun'
  | 'moon'
  | 'mars'
  | 'rahu'
  | 'jupiter'
  | 'saturn'
  | 'mercury';

export type KundaliInput = {
  date: Date;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: 'Asia/Kolkata';
};

export type GrahaPosition = {
  graha: Graha;
  siderealLongitude: number;
  rashiIndex: number;
  degreeInRashi: number;
  nakshatraIndex: number;
  pada: number;
  house: number;
  retrograde: boolean;
};

export type DashaSubPeriod = {
  lord: DashaLord;
  start: Date;
  end: Date;
};

export type DashaPeriod = {
  lord: DashaLord;
  start: Date;
  end: Date;
  antardashas: readonly DashaSubPeriod[];
};

export type KundaliChart = {
  input: KundaliInput;
  ayanamsa: number;
  lagnaLongitude: number;
  lagnaRashiIndex: number;
  /** Sign index for houses 1…12, stored at array indices 0…11. */
  houses: readonly number[];
  grahas: readonly GrahaPosition[];
  vimshottari: readonly DashaPeriod[];
};

export type KundaliResultTab = 'overview' | 'chart' | 'grahas' | 'dasha';

export type KundaliInsight = {
  id: 'lagna' | 'moon' | 'dasha';
  eyebrowHi: string;
  eyebrowEn: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
  targetTab: KundaliResultTab;
};

export type CurrentDasha = {
  maha: DashaPeriod;
  antar: DashaSubPeriod | null;
};

export type RashifalGuidance = {
  dateKey: string;
  rashiIndex: number;
  focusGrahas: readonly Graha[];
  favourHi: string;
  favourEn: string;
  pauseHi: string;
  pauseEn: string;
  practiceHi: string;
  practiceEn: string;
  reflectionHi: string;
  reflectionEn: string;
  sourceId: 'navagraha-stotram' | 'surya-ashtakam' | 'shani-ashtakam';
};

export const GRAHA_ORDER: readonly Graha[] = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
  'rahu',
  'ketu',
];

export const GRAHA_NAMES_HI: Readonly<Record<Graha, string>> = {
  sun: 'सूर्य',
  moon: 'चन्द्र',
  mars: 'मंगल',
  mercury: 'बुध',
  jupiter: 'गुरु',
  venus: 'शुक्र',
  saturn: 'शनि',
  rahu: 'राहु',
  ketu: 'केतु',
};

export const GRAHA_NAMES_EN: Readonly<Record<Graha, string>> = {
  sun: 'Sun',
  moon: 'Moon',
  mars: 'Mars',
  mercury: 'Mercury',
  jupiter: 'Jupiter',
  venus: 'Venus',
  saturn: 'Saturn',
  rahu: 'Rahu',
  ketu: 'Ketu',
};

export const RASHI_NAMES_HI = [
  'मेष',
  'वृषभ',
  'मिथुन',
  'कर्क',
  'सिंह',
  'कन्या',
  'तुला',
  'वृश्चिक',
  'धनु',
  'मकर',
  'कुम्भ',
  'मीन',
] as const;

export const RASHI_NAMES_EN = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrischika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
] as const;

export const DASHA_ORDER: readonly DashaLord[] = [
  'ketu',
  'venus',
  'sun',
  'moon',
  'mars',
  'rahu',
  'jupiter',
  'saturn',
  'mercury',
];

export const DASHA_YEARS: Readonly<Record<DashaLord, number>> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

const BODY_BY_GRAHA: Partial<Record<Graha, Body>> = {
  mars: Body.Mars,
  mercury: Body.Mercury,
  jupiter: Body.Jupiter,
  venus: Body.Venus,
  saturn: Body.Saturn,
};

const DAY_MS = 86_400_000;
const MEAN_TROPICAL_YEAR_DAYS = 365.2425;
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;
const DEG = Math.PI / 180;

function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function signedAngularDifference(to: number, from: number): number {
  return ((to - from + 540) % 360) - 180;
}

function julianDay(date: Date): number {
  return date.getTime() / DAY_MS + 2_440_587.5;
}

function julianCenturies(date: Date): number {
  return (julianDay(date) - 2_451_545) / 36_525;
}

function decimalYear(date: Date): number {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return year + (date.getTime() - start) / (end - start);
}

function ayanamsaAt(date: Date): number {
  return getAyanamsa(decimalYear(date));
}

function tropicalPlanetLongitude(graha: Graha, date: Date): number {
  const astroTime = MakeTime(date);
  if (graha === 'sun') return SunPosition(astroTime).elon;
  if (graha === 'moon') return EclipticGeoMoon(astroTime).lon;
  const body = BODY_BY_GRAHA[graha];
  if (!body) {
    throw new Error(`${graha} does not use a classical-planet ephemeris`);
  }
  return Ecliptic(GeoVector(body, astroTime, true)).elon;
}

/**
 * Mean ascending lunar node, tropical ecliptic longitude of date.
 * Meeus polynomial, adequate well beyond the India/IST v1 date range.
 */
function tropicalMeanRahuLongitude(date: Date): number {
  const t = julianCenturies(date);
  return normalizeDegrees(
    125.04452
      - 1_934.136261 * t
      + 0.0020708 * t * t
      + (t * t * t) / 450_000
  );
}

export function getSiderealPlanetLongitude(graha: Graha, date: Date): number {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid date');
  const ayanamsa = ayanamsaAt(date);
  if (graha === 'rahu') {
    return normalizeDegrees(tropicalMeanRahuLongitude(date) - ayanamsa);
  }
  if (graha === 'ketu') {
    return normalizeDegrees(tropicalMeanRahuLongitude(date) - ayanamsa + 180);
  }
  return normalizeDegrees(tropicalPlanetLongitude(graha, date) - ayanamsa);
}

function isRetrograde(graha: Graha, date: Date): boolean {
  if (graha === 'rahu' || graha === 'ketu') return true;
  if (graha === 'sun' || graha === 'moon') return false;
  const before = getSiderealPlanetLongitude(graha, new Date(date.getTime() - DAY_MS / 2));
  const after = getSiderealPlanetLongitude(graha, new Date(date.getTime() + DAY_MS / 2));
  return signedAngularDifference(after, before) < 0;
}

function meanObliquity(date: Date): number {
  const t = julianCenturies(date);
  return 23.43929111
    - 0.013004167 * t
    - 0.000000164 * t * t
    + 0.000000504 * t * t * t;
}

type HorizonSample = { altitudeSine: number; hourAngle: number };

function eclipticHorizonSample(
  longitude: number,
  localSiderealDegrees: number,
  latitude: number,
  obliquity: number
): HorizonSample {
  const lambda = longitude * DEG;
  const epsilon = obliquity * DEG;
  const phi = latitude * DEG;
  const rightAscension = normalizeDegrees(
    Math.atan2(Math.sin(lambda) * Math.cos(epsilon), Math.cos(lambda)) / DEG
  );
  const declination = Math.asin(Math.sin(lambda) * Math.sin(epsilon));
  let hourAngle = normalizeDegrees(localSiderealDegrees - rightAscension);
  if (hourAngle > 180) hourAngle -= 360;
  return {
    altitudeSine:
      Math.sin(phi) * Math.sin(declination)
      + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle * DEG),
    hourAngle,
  };
}

/**
 * Sidereal ascendant (Lagna): finds both intersections between the ecliptic and
 * the observer's horizon, then chooses the eastern/rising root.
 */
export function computeLagna(input: KundaliInput): number {
  validateKundaliInput(input);
  const localSiderealDegrees = normalizeDegrees(
    SiderealTime(input.date) * 15 + input.longitude
  );
  const obliquity = meanObliquity(input.date);
  const roots: number[] = [];

  for (let degree = 0; degree < 360; degree += 1) {
    let lo = degree;
    let hi = degree + 1;
    let loValue = eclipticHorizonSample(
      lo,
      localSiderealDegrees,
      input.latitude,
      obliquity
    ).altitudeSine;
    const hiValue = eclipticHorizonSample(
      hi,
      localSiderealDegrees,
      input.latitude,
      obliquity
    ).altitudeSine;
    if (loValue === 0 || loValue * hiValue < 0) {
      for (let iteration = 0; iteration < 48; iteration += 1) {
        const mid = (lo + hi) / 2;
        const midValue = eclipticHorizonSample(
          mid,
          localSiderealDegrees,
          input.latitude,
          obliquity
        ).altitudeSine;
        if (loValue * midValue <= 0) {
          hi = mid;
        } else {
          lo = mid;
          loValue = midValue;
        }
      }
      roots.push(normalizeDegrees((lo + hi) / 2));
    }
  }

  const rising = roots.find((root) =>
    eclipticHorizonSample(
      root,
      localSiderealDegrees,
      input.latitude,
      obliquity
    ).hourAngle < 0
  );
  if (rising === undefined) throw new Error('Unable to resolve Lagna');
  return normalizeDegrees(rising - ayanamsaAt(input.date));
}

export function computeWholeSignHouses(lagnaRashiIndex: number): readonly number[] {
  if (!Number.isInteger(lagnaRashiIndex) || lagnaRashiIndex < 0 || lagnaRashiIndex > 11) {
    throw new Error(`Invalid Lagna rashi index: ${lagnaRashiIndex}`);
  }
  return Array.from({ length: 12 }, (_, index) => (lagnaRashiIndex + index) % 12);
}

function houseForRashi(rashiIndex: number, lagnaRashiIndex: number): number {
  return ((rashiIndex - lagnaRashiIndex + 12) % 12) + 1;
}

export function computeGrahaPositions(
  input: KundaliInput,
  lagnaRashiIndex: number
): readonly GrahaPosition[] {
  validateKundaliInput(input);
  return GRAHA_ORDER.map((graha) => {
    const siderealLongitude = getSiderealPlanetLongitude(graha, input.date);
    const rashiIndex = Math.floor(siderealLongitude / 30) % 12;
    const nakshatraIndex = Math.floor(siderealLongitude / NAKSHATRA_SPAN) % 27;
    return {
      graha,
      siderealLongitude,
      rashiIndex,
      degreeInRashi: siderealLongitude % 30,
      nakshatraIndex,
      pada: Math.min(4, Math.floor((siderealLongitude % NAKSHATRA_SPAN) / PADA_SPAN) + 1),
      house: houseForRashi(rashiIndex, lagnaRashiIndex),
      retrograde: isRetrograde(graha, input.date),
    };
  });
}

function yearsToMs(years: number): number {
  return years * MEAN_TROPICAL_YEAR_DAYS * DAY_MS;
}

function antardashasFor(
  mahaLord: DashaLord,
  mahaStart: Date
): readonly DashaSubPeriod[] {
  const mahaYears = DASHA_YEARS[mahaLord];
  const startIndex = DASHA_ORDER.indexOf(mahaLord);
  let cursor = mahaStart.getTime();
  return Array.from({ length: DASHA_ORDER.length }, (_, offset) => {
    const lord = DASHA_ORDER[(startIndex + offset) % DASHA_ORDER.length];
    const start = new Date(cursor);
    cursor += yearsToMs((mahaYears * DASHA_YEARS[lord]) / 120);
    return { lord, start, end: new Date(cursor) };
  });
}

export function computeVimshottariDasha(
  moonLongitude: number,
  birthDate: Date
): readonly DashaPeriod[] {
  if (!Number.isFinite(moonLongitude)) throw new Error('Invalid Moon longitude');
  if (!Number.isFinite(birthDate.getTime())) throw new Error('Invalid birth date');
  const moon = normalizeDegrees(moonLongitude);
  const nakshatraIndex = Math.floor(moon / NAKSHATRA_SPAN) % 27;
  const firstLord = DASHA_ORDER[nakshatraIndex % DASHA_ORDER.length];
  const fractionElapsed = (moon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  let cursor = birthDate.getTime() - yearsToMs(DASHA_YEARS[firstLord] * fractionElapsed);
  const firstIndex = DASHA_ORDER.indexOf(firstLord);

  return Array.from({ length: DASHA_ORDER.length }, (_, offset) => {
    const lord = DASHA_ORDER[(firstIndex + offset) % DASHA_ORDER.length];
    const start = new Date(cursor);
    cursor += yearsToMs(DASHA_YEARS[lord]);
    return {
      lord,
      start,
      end: new Date(cursor),
      antardashas: antardashasFor(lord, start),
    };
  });
}

export function computeKundali(input: KundaliInput): KundaliChart {
  validateKundaliInput(input);
  const lagnaLongitude = computeLagna(input);
  const lagnaRashiIndex = Math.floor(lagnaLongitude / 30) % 12;
  const grahas = computeGrahaPositions(input, lagnaRashiIndex);
  const moon = grahas.find((position) => position.graha === 'moon');
  if (!moon) throw new Error('Moon position is required');
  return {
    input: { ...input, date: new Date(input.date.getTime()) },
    ayanamsa: ayanamsaAt(input.date),
    lagnaLongitude,
    lagnaRashiIndex,
    houses: computeWholeSignHouses(lagnaRashiIndex),
    grahas,
    vimshottari: computeVimshottariDasha(moon.siderealLongitude, input.date),
  };
}

export function getCurrentDasha(
  chart: KundaliChart,
  at: Date
): CurrentDasha | null {
  const time = at.getTime();
  const maha = chart.vimshottari.find(
    (period) => time >= period.start.getTime() && time < period.end.getTime()
  );
  if (!maha) return null;
  const antar =
    maha.antardashas.find(
      (period) => time >= period.start.getTime() && time < period.end.getTime()
    ) ?? null;
  return { maha, antar };
}

export function buildKundaliInsights(
  chart: KundaliChart,
  at: Date
): readonly KundaliInsight[] {
  const moon = chart.grahas.find((position) => position.graha === 'moon');
  if (!moon) throw new Error('Moon position is required');
  const current = getCurrentDasha(chart, at) ?? {
    maha: chart.vimshottari[0],
    antar: null,
  };
  const dashaHi = GRAHA_NAMES_HI[current.maha.lord];
  const dashaEn = GRAHA_NAMES_EN[current.maha.lord];

  return [
    {
      id: 'lagna',
      eyebrowHi: 'आरम्भ बिंदु · लग्न',
      eyebrowEn: 'Starting point · Lagna',
      titleHi: `${RASHI_NAMES_HI[chart.lagnaRashiIndex]} लग्न`,
      titleEn: `${RASHI_NAMES_EN[chart.lagnaRashiIndex]} Lagna`,
      bodyHi:
        'लग्न जन्म के समय पूर्वी क्षितिज पर उदित राशि है और प्रथम भाव निर्धारित करता है। पारम्परिक ज्योतिष में इसी से शेष कुंडली को पढ़ना आरम्भ होता है।',
      bodyEn:
        'Lagna is the sign rising at birth and sets the first house. In traditional Jyotish it is the starting lens for reading the rest of the chart.',
      targetTab: 'chart',
    },
    {
      id: 'moon',
      eyebrowHi: 'अन्तर लय · चन्द्र',
      eyebrowEn: 'Inner rhythm · Moon',
      titleHi: `${RASHI_NAMES_HI[moon.rashiIndex]} राशि · ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} पद ${moon.pada}`,
      titleEn: `${RASHI_NAMES_EN[moon.rashiIndex]} · ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} Pada ${moon.pada}`,
      bodyHi:
        'चन्द्र राशि मन की पारम्परिक दृष्टि देती है और नक्षत्र उसकी स्थिति को अधिक सूक्ष्म बनाता है। यह विचार का साधन है, स्थायी व्यक्तित्व-निर्णय नहीं।',
      bodyEn:
        'The Moon sign is a traditional lens on inner rhythm, and the nakshatra refines its placement. It is a reflection aid, not a fixed personality verdict.',
      targetTab: 'grahas',
    },
    {
      id: 'dasha',
      eyebrowHi: 'समय दृष्टि · दशा',
      eyebrowEn: 'Timing lens · Dasha',
      titleHi: `${dashaHi} महादशा`,
      titleEn: `${dashaEn} Mahadasha`,
      bodyHi:
        'दशा एक पारम्परिक ग्रह-अवधि है जो समय पर विचार को व्यवस्थित करती है। यह किसी घटना की गारंटी नहीं देती।',
      bodyEn:
        'A Dasha is a traditional planetary period that organises reflection around time. It does not guarantee an event.',
      targetTab: 'dasha',
    },
  ];
}

const TRANSIT_SUPPORT_HOUSES: Readonly<Record<Graha, readonly number[]>> = {
  sun: [3, 6, 10, 11],
  moon: [1, 3, 6, 7, 10, 11],
  mars: [3, 6, 11],
  mercury: [2, 4, 6, 8, 10, 11],
  jupiter: [2, 5, 7, 9, 11],
  venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  saturn: [3, 6, 11],
  rahu: [3, 6, 10, 11],
  ketu: [3, 6, 10, 11],
};

const HOUSE_THEME_HI = [
  'स्वयं और ऊर्जा',
  'संसाधन और वाणी',
  'संवाद और प्रयास',
  'घर और स्थिरता',
  'रचनात्मकता और अध्ययन',
  'दिनचर्या और सेवा',
  'संबंध और सहयोग',
  'परिवर्तन और धैर्य',
  'सीख और दृष्टि',
  'कर्तव्य और काम',
  'समुदाय और सहयोग',
  'विश्राम और समापन',
] as const;

const HOUSE_THEME_EN = [
  'self and energy',
  'resources and speech',
  'communication and effort',
  'home and steadiness',
  'creativity and learning',
  'routine and service',
  'relationships and cooperation',
  'change and patience',
  'learning and perspective',
  'duties and work',
  'community and support',
  'rest and closure',
] as const;

function indiaDayAnchor(date: Date): Date {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid date');
  const shifted = new Date(date.getTime() + 330 * 60_000);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      0,
      30
    )
  );
}

function indiaDateKey(date: Date): string {
  const shifted = new Date(date.getTime() + 330 * 60_000);
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    String(shifted.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export function computeRashifal(date: Date, rashiIndex: number): RashifalGuidance {
  if (!Number.isInteger(rashiIndex) || rashiIndex < 0 || rashiIndex > 11) {
    throw new Error(`Invalid rashi index: ${rashiIndex}`);
  }
  const anchor = indiaDayAnchor(date);
  const transits = GRAHA_ORDER.map((graha) => {
    const longitude = getSiderealPlanetLongitude(graha, anchor);
    const transitRashi = Math.floor(longitude / 30) % 12;
    const house = houseForRashi(transitRashi, rashiIndex);
    const supportive = TRANSIT_SUPPORT_HOUSES[graha].includes(house);
    return { graha, house, supportive };
  });
  const supportive = transits.filter((transit) => transit.supportive);
  const reflective = transits.filter((transit) => !transit.supportive);
  const favourTransit = supportive[0] ?? transits[0];
  const pauseTransit = reflective[0] ?? transits[transits.length - 1];
  const moonTransit = transits.find((transit) => transit.graha === 'moon')!;
  const focusGrahas = [favourTransit.graha, pauseTransit.graha].filter(
    (graha, index, values) => values.indexOf(graha) === index
  );
  const sourceId: RashifalGuidance['sourceId'] =
    pauseTransit.graha === 'saturn'
      ? 'shani-ashtakam'
      : pauseTransit.graha === 'sun'
        ? 'surya-ashtakam'
        : 'navagraha-stotram';

  return {
    dateKey: indiaDateKey(date),
    rashiIndex,
    focusGrahas,
    favourHi: `${HOUSE_THEME_HI[favourTransit.house - 1]} में शांत, क्रमबद्ध प्रयास को स्थान दें।`,
    favourEn: `Give calm, orderly attention to ${HOUSE_THEME_EN[favourTransit.house - 1]}.`,
    pauseHi: `${HOUSE_THEME_HI[pauseTransit.house - 1]} से जुड़े विषयों में जल्दबाज़ी या निश्चित निष्कर्ष से रुकें।`,
    pauseEn: `Pause before rushing or forcing certainty around ${HOUSE_THEME_EN[pauseTransit.house - 1]}.`,
    practiceHi: 'कुछ शांत श्वासों के बाद अपनी चुनी हुई प्रार्थना या स्तोत्र का पाठ करें।',
    practiceEn: 'After a few quiet breaths, recite a prayer or stotra you already trust.',
    reflectionHi: `आज ${HOUSE_THEME_HI[moonTransit.house - 1]} को किस प्रकार धैर्य चाहिए?`,
    reflectionEn: `Where could ${HOUSE_THEME_EN[moonTransit.house - 1]} benefit from patience today?`,
    sourceId,
  };
}

function validateKundaliInput(input: KundaliInput): void {
  if (input.timezone !== 'Asia/Kolkata') {
    throw new Error('PRD-C v1 supports Asia/Kolkata only');
  }
  if (!Number.isFinite(input.date.getTime())) throw new Error('Invalid birth date');
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new Error(`Invalid latitude: ${input.latitude}`);
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new Error(`Invalid longitude: ${input.longitude}`);
  }
}
