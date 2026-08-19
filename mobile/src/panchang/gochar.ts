import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  GRAHA_ORDER,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  NAKSHATRA_SPAN,
  TRANSIT_SUPPORT_HOUSES,
  computeRashifal,
  getCurrentDasha,
  getSiderealPlanetLongitude,
  houseForRashi,
  indiaDateKey,
  indiaDayAnchor,
  isRetrograde,
} from './kundali';
import type { Graha, KundaliChart, RashifalGuidance } from './kundali';

/**
 * Gochar (transit) engine — PRD-20.
 *
 * Pure like `kundali.ts`: explicit `Date` + `KundaliChart` in, typed data out.
 * No React, storage, wall-clock reads, randomness, or network. Every daily
 * quantity is evaluated at the shared 06:00 IST anchor (`indiaDayAnchor`),
 * the same convention `computeRashifal` uses, so a civil day has exactly one
 * answer. All copy is traditional guidance/reflection framing (RULEBOOK
 * §14.3) — never predictions, fear copy, or directives.
 */

const DAY_MS = 86_400_000;

export type GocharTransit = {
  graha: Graha;
  siderealLongitude: number;
  transitRashiIndex: number;
  degreeInRashi: number;
  houseFromMoon: number;
  houseFromLagna: number;
  retrograde: boolean;
  /** Classical gochar support is read from the Moon sign (janma rashi). */
  supportive: boolean;
};

export type GocharSnapshot = {
  dateKey: string;
  janmaRashiIndex: number;
  lagnaRashiIndex: number;
  transits: readonly GocharTransit[];
};

export type IngressEvent = {
  graha: Graha;
  at: Date;
  fromRashiIndex: number;
  toRashiIndex: number;
};

export type SadeSatiPhase = 'none' | 'rising' | 'peak' | 'setting';

export type SadeSatiStatus = {
  phase: SadeSatiPhase;
  /** Saturn transiting the 4th/8th from the Moon — the classical dhaiya. */
  secondary: 'ardhashtama' | 'ashtama' | null;
  saturnRashiIndex: number;
  houseFromMoon: number;
  /** Next Saturn sign ingress (phase boundary candidate); null if beyond scan. */
  nextTransitionAt: Date | null;
  headlineHi: string;
  headlineEn: string;
  bodyHi: string;
  bodyEn: string;
};

export type TaraBalaTone = 'favourable' | 'steady' | 'reflective';

export type TaraBala = {
  /** 1…9 in the classical Janma → Param Mitra cycle. */
  index: number;
  nameHi: string;
  nameEn: string;
  tone: TaraBalaTone;
  janmaNakshatraIndex: number;
  dayNakshatraIndex: number;
};

export type PersonalGuidance = RashifalGuidance & {
  lagnaRashiIndex: number;
  favourHouseFromLagna: number;
  pauseHouseFromLagna: number;
  reflectionHouseFromLagna: number;
  /** Current Vimshottari lords at the day anchor; null outside the 120-year table. */
  mahaLord: Graha | null;
  antarLord: Graha | null;
  /** Set only when a focus transit belongs to a running dasha lord. */
  dashaNoteHi: string | null;
  dashaNoteEn: string | null;
  taraBala: TaraBala;
  sadeSatiPhase: SadeSatiPhase;
};

export const TARA_NAMES_HI = [
  'जन्म',
  'सम्पत्',
  'विपत्',
  'क्षेम',
  'प्रत्यरि',
  'साधक',
  'वध',
  'मित्र',
  'परम मित्र',
] as const;

export const TARA_NAMES_EN = [
  'Janma',
  'Sampat',
  'Vipat',
  'Kshema',
  'Pratyari',
  'Sadhaka',
  'Vadha',
  'Mitra',
  'Param Mitra',
] as const;

/** Classical tara tones; “reflective” marks the traditionally cautioned taras. */
const TARA_TONES: readonly TaraBalaTone[] = [
  'steady',
  'favourable',
  'reflective',
  'favourable',
  'reflective',
  'favourable',
  'reflective',
  'favourable',
  'favourable',
];

function requireChartMoon(chart: KundaliChart) {
  const moon = chart.grahas.find((position) => position.graha === 'moon');
  if (!moon) throw new Error('Moon position is required');
  return moon;
}

function transitRashiAt(graha: Graha, anchor: Date): number {
  return Math.floor(getSiderealPlanetLongitude(graha, anchor) / 30) % 12;
}

export function computeGocharSnapshot(chart: KundaliChart, date: Date): GocharSnapshot {
  const moon = requireChartMoon(chart);
  const anchor = indiaDayAnchor(date);
  const transits = GRAHA_ORDER.map((graha) => {
    const siderealLongitude = getSiderealPlanetLongitude(graha, anchor);
    const transitRashiIndex = Math.floor(siderealLongitude / 30) % 12;
    const houseFromMoon = houseForRashi(transitRashiIndex, moon.rashiIndex);
    return {
      graha,
      siderealLongitude,
      transitRashiIndex,
      degreeInRashi: siderealLongitude % 30,
      houseFromMoon,
      houseFromLagna: houseForRashi(transitRashiIndex, chart.lagnaRashiIndex),
      retrograde: isRetrograde(graha, anchor),
      supportive: TRANSIT_SUPPORT_HOUSES[graha].includes(houseFromMoon),
    };
  });
  return {
    dateKey: indiaDateKey(date),
    janmaRashiIndex: moon.rashiIndex,
    lagnaRashiIndex: chart.lagnaRashiIndex,
    transits,
  };
}

/**
 * First sign change of `graha` strictly after `from`, found by a one-day walk
 * and bisected to under an hour. Retrograde re-entry into the previous sign
 * is an ingress too. Returns null when no change occurs within `maxDays`.
 */
export function findNextIngress(
  graha: Graha,
  from: Date,
  maxDays: number
): IngressEvent | null {
  if (!Number.isFinite(from.getTime())) throw new Error('Invalid date');
  if (!Number.isInteger(maxDays) || maxDays <= 0) {
    throw new Error(`Invalid maxDays: ${maxDays}`);
  }
  let previousTime = from.getTime();
  let previousRashi = transitRashiAt(graha, from);
  for (let day = 1; day <= maxDays; day += 1) {
    const time = from.getTime() + day * DAY_MS;
    const rashi = transitRashiAt(graha, new Date(time));
    if (rashi !== previousRashi) {
      let lo = previousTime;
      let hi = time;
      while (hi - lo > 3_600_000) {
        const mid = (lo + hi) / 2;
        if (transitRashiAt(graha, new Date(mid)) === previousRashi) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return {
        graha,
        at: new Date(hi),
        fromRashiIndex: previousRashi,
        toRashiIndex: rashi,
      };
    }
    previousTime = time;
    previousRashi = rashi;
  }
  return null;
}

const SLOW_INGRESS_GRAHAS: readonly Graha[] = ['jupiter', 'saturn', 'rahu'];
const FAST_INGRESS_GRAHAS: readonly Graha[] = ['sun', 'mars', 'mercury', 'venus'];
export const SLOW_INGRESS_SCAN_DAYS = 400;
export const FAST_INGRESS_SCAN_DAYS = 45;

/**
 * Notable upcoming sign changes: slow movers (Jupiter/Saturn/Rahu) within
 * 400 days, fast movers within 45. Moon (a change every ~2¼ days) and Ketu
 * (always exactly opposite Rahu) are deliberately absent. Sorted soonest first.
 */
export function computeUpcomingIngresses(date: Date): readonly IngressEvent[] {
  const anchor = indiaDayAnchor(date);
  const events: IngressEvent[] = [];
  for (const graha of SLOW_INGRESS_GRAHAS) {
    const event = findNextIngress(graha, anchor, SLOW_INGRESS_SCAN_DAYS);
    if (event) events.push(event);
  }
  for (const graha of FAST_INGRESS_GRAHAS) {
    const event = findNextIngress(graha, anchor, FAST_INGRESS_SCAN_DAYS);
    if (event) events.push(event);
  }
  return events.sort((a, b) => a.at.getTime() - b.at.getTime());
}

function sadeSatiPhaseForHouse(houseFromMoon: number): SadeSatiPhase {
  if (houseFromMoon === 12) return 'rising';
  if (houseFromMoon === 1) return 'peak';
  if (houseFromMoon === 2) return 'setting';
  return 'none';
}

const SADE_SATI_COPY: Readonly<
  Record<Exclude<SadeSatiPhase, 'none'>, {
    headlineHi: string;
    headlineEn: string;
    bodyHi: string;
    bodyEn: string;
  }>
> = {
  rising: {
    headlineHi: 'साढ़े साती · प्रथम चरण (उदय)',
    headlineEn: 'Sade Sati · first phase (rising)',
    bodyHi:
      'परम्परा में शनि का चन्द्र राशि से बारहवें भाव का गोचर साढ़े साती का आरम्भिक चरण माना जाता है — विश्राम, व्यय-विवेक और आन्तरिक तैयारी पर सहज ध्यान का समय। यह धैर्य और नियमित साधना का पारम्परिक संकेत है, किसी घटना की सूचना नहीं।',
    bodyEn:
      'Tradition reads Saturn transiting the twelfth house from the Moon sign as the opening phase of Sade Sati — a time for gentle attention to rest, mindful spending, and inner preparation. It is a traditional cue for patience and steady practice, not notice of an event.',
  },
  peak: {
    headlineHi: 'साढ़े साती · द्वितीय चरण (मध्य)',
    headlineEn: 'Sade Sati · second phase (middle)',
    bodyHi:
      'शनि इस समय आपकी जन्म राशि पर ही गोचर कर रहा है — परम्परा में यह साढ़े साती का मध्य चरण है, जिसे कर्तव्य, अनुशासन और आत्म-निरीक्षण से जोड़ा जाता है। इसे धैर्यपूर्वक साधना का निमंत्रण समझें, भय का कारण नहीं।',
    bodyEn:
      'Saturn is currently transiting your Moon sign itself — traditionally the middle phase of Sade Sati, associated with duty, discipline, and self-review. Read it as an invitation to patient practice, not a cause for fear.',
  },
  setting: {
    headlineHi: 'साढ़े साती · तृतीय चरण (समापन)',
    headlineEn: 'Sade Sati · third phase (closing)',
    bodyHi:
      'शनि आपकी जन्म राशि से दूसरे भाव में गोचर कर रहा है — परम्परा में यह साढ़े साती का समापन चरण है, जिसे संसाधनों, वाणी और परिवार के विषयों में संयम से जोड़ा जाता है। नियमित साधना और सहज धैर्य ही इसका पारम्परिक उत्तर है।',
    bodyEn:
      'Saturn is transiting the second house from your Moon sign — traditionally the closing phase of Sade Sati, linked with measured care around resources, speech, and family matters. Steady practice and easy patience are its traditional response.',
  },
};

export function computeSadeSati(
  chart: KundaliChart,
  date: Date,
  options?: { boundaryScanDays?: number }
): SadeSatiStatus {
  const moon = requireChartMoon(chart);
  const anchor = indiaDayAnchor(date);
  const saturnRashiIndex = transitRashiAt('saturn', anchor);
  const houseFromMoon = houseForRashi(saturnRashiIndex, moon.rashiIndex);
  const phase = sadeSatiPhaseForHouse(houseFromMoon);
  const secondary =
    houseFromMoon === 4 ? 'ardhashtama' : houseFromMoon === 8 ? 'ashtama' : null;
  const boundaryScanDays = options?.boundaryScanDays ?? 1_200;
  const nextTransitionAt =
    boundaryScanDays > 0
      ? (findNextIngress('saturn', anchor, boundaryScanDays)?.at ?? null)
      : null;

  if (phase === 'none') {
    const secondaryHi =
      secondary === 'ardhashtama'
        ? ' शनि इस समय चन्द्र से चौथे भाव में है — परम्परा इसे छोटी ढैया कहती है और घर व स्थिरता के विषयों में सहज संयम सुझाती है।'
        : secondary === 'ashtama'
          ? ' शनि इस समय चन्द्र से आठवें भाव में है — परम्परा इसे ढैया कहती है और परिवर्तन के विषयों में धैर्य सुझाती है।'
          : '';
    const secondaryEn =
      secondary === 'ardhashtama'
        ? ' Saturn is currently in the fourth house from the Moon — tradition calls this the smaller dhaiya and suggests easy moderation around home and steadiness.'
        : secondary === 'ashtama'
          ? ' Saturn is currently in the eighth house from the Moon — tradition calls this a dhaiya and suggests patience around themes of change.'
          : '';
    return {
      phase,
      secondary,
      saturnRashiIndex,
      houseFromMoon,
      nextTransitionAt,
      headlineHi: 'साढ़े साती · इस समय नहीं',
      headlineEn: 'Sade Sati · not at present',
      bodyHi: `इस समय शनि आपकी जन्म राशि से साढ़े साती के भावों (12, 1, 2) में गोचर नहीं कर रहा।${secondaryHi}`,
      bodyEn: `Saturn is not currently transiting the Sade Sati houses (12, 1, 2) from your Moon sign.${secondaryEn}`,
    };
  }

  const copy = SADE_SATI_COPY[phase];
  return {
    phase,
    secondary,
    saturnRashiIndex,
    houseFromMoon,
    nextTransitionAt,
    ...copy,
  };
}

export function computeTaraBala(
  janmaNakshatraIndex: number,
  dayNakshatraIndex: number
): TaraBala {
  for (const [label, value] of [
    ['janma', janmaNakshatraIndex],
    ['day', dayNakshatraIndex],
  ] as const) {
    if (!Number.isInteger(value) || value < 0 || value > 26) {
      throw new Error(`Invalid ${label} nakshatra index: ${value}`);
    }
  }
  const count = ((dayNakshatraIndex - janmaNakshatraIndex + 27) % 27) + 1;
  const index = ((count - 1) % 9) + 1;
  return {
    index,
    nameHi: TARA_NAMES_HI[index - 1],
    nameEn: TARA_NAMES_EN[index - 1],
    tone: TARA_TONES[index - 1],
    janmaNakshatraIndex,
    dayNakshatraIndex,
  };
}

type DashaMatch = {
  role: 'favour' | 'pause';
  level: 'maha' | 'antar';
  graha: Graha;
};

function dashaNoteFor(match: DashaMatch): { hi: string; en: string } {
  const levelHi = match.level === 'maha' ? 'महादशा' : 'अन्तर्दशा';
  const levelEn = match.level === 'maha' ? 'Mahadasha' : 'Antardasha';
  const nameHi = GRAHA_NAMES_HI[match.graha];
  const nameEn = GRAHA_NAMES_EN[match.graha];
  if (match.role === 'favour') {
    return {
      hi: `आज का अनुकूल गोचर उसी ${nameHi} का है जिसकी ${levelHi} इस समय चल रही है — परम्परा में ऐसे दिन इस अवधि के विषयों पर सहज, शांत ध्यान के लिए उपयुक्त माने जाते हैं।`,
      en: `Today's supportive transit belongs to ${nameEn}, whose ${levelEn} is currently running — tradition treats such days as suited to calm, easy attention on this period's themes.`,
    };
  }
  return {
    hi: `आज का ठहराव-संकेत उसी ${nameHi} से जुड़ा है जिसकी ${levelHi} इस समय चल रही है — परम्परा में ऐसे दिन धैर्य और नियमित साधना को विशेष महत्व दिया जाता है।`,
    en: `Today's pause cue involves ${nameEn}, whose ${levelEn} is currently running — tradition gives special weight to patience and steady practice on such days.`,
  };
}

/**
 * Full-chart daily guidance. Strict superset of `computeRashifal` for the
 * chart's janma rashi: the favour/pause/reflection fields are byte-identical
 * (the landing's existing rows render unchanged), extended with Lagna-house
 * context, running-dasha awareness, tara bala, and the Sade Sati phase flag.
 */
export function computePersonalGuidance(
  chart: KundaliChart,
  date: Date
): PersonalGuidance {
  const moon = requireChartMoon(chart);
  const base = computeRashifal(date, moon.rashiIndex);
  const anchor = indiaDayAnchor(date);

  const lagnaHouseOf = (graha: Graha) =>
    houseForRashi(transitRashiAt(graha, anchor), chart.lagnaRashiIndex);

  const current = getCurrentDasha(chart, anchor);
  const mahaLord = current?.maha.lord ?? null;
  const antarLord = current?.antar?.lord ?? null;
  const match: DashaMatch | null =
    mahaLord === base.favourGraha
      ? { role: 'favour', level: 'maha', graha: base.favourGraha }
      : mahaLord === base.pauseGraha
        ? { role: 'pause', level: 'maha', graha: base.pauseGraha }
        : antarLord === base.favourGraha
          ? { role: 'favour', level: 'antar', graha: base.favourGraha }
          : antarLord === base.pauseGraha
            ? { role: 'pause', level: 'antar', graha: base.pauseGraha }
            : null;
  const dashaNote = match ? dashaNoteFor(match) : null;

  const dayNakshatraIndex =
    Math.floor(getSiderealPlanetLongitude('moon', anchor) / NAKSHATRA_SPAN) % 27;
  const saturnHouseFromMoon = houseForRashi(
    transitRashiAt('saturn', anchor),
    moon.rashiIndex
  );

  return {
    ...base,
    lagnaRashiIndex: chart.lagnaRashiIndex,
    favourHouseFromLagna: lagnaHouseOf(base.favourGraha),
    pauseHouseFromLagna: lagnaHouseOf(base.pauseGraha),
    reflectionHouseFromLagna: lagnaHouseOf(base.reflectionGraha),
    mahaLord,
    antarLord,
    dashaNoteHi: dashaNote?.hi ?? null,
    dashaNoteEn: dashaNote?.en ?? null,
    taraBala: computeTaraBala(moon.nakshatraIndex, dayNakshatraIndex),
    sadeSatiPhase: sadeSatiPhaseForHouse(saturnHouseFromMoon),
  };
}

/** Shared display helper: the house themes the active transits touch. */
export function activeHouseThemes(
  snapshot: GocharSnapshot
): readonly { house: number; themeHi: string; themeEn: string }[] {
  const houses = new Set<number>();
  for (const transit of snapshot.transits) {
    if (transit.supportive) houses.add(transit.houseFromMoon);
  }
  return [...houses]
    .sort((a, b) => a - b)
    .map((house) => ({
      house,
      themeHi: HOUSE_THEME_HI[house - 1],
      themeEn: HOUSE_THEME_EN[house - 1],
    }));
}
