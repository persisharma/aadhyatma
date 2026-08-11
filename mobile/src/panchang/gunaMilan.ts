import { getSiderealPlanetLongitude } from './kundali';
import {
  GANA_BY_NAKSHATRA,
  GANA_ORDER,
  GANA_SCORE,
  GRAHA_MAITRI_SCORE,
  KOOTA_MAX,
  NADI_BY_NAKSHATRA,
  RASHI_LORD_BY_RASHI,
  RASHI_LORD_ORDER,
  SCORE_BANDS,
  VARNA_BY_RASHI,
  VARNA_RANK,
  VASHYA_ORDER,
  VASHYA_SCORE,
  YONI_BY_NAKSHATRA,
  YONI_ORDER,
  YONI_SCORE,
  type Gana,
  type Nadi,
  type RashiLord,
  type Varna,
  type Vashya,
  type Yoni,
} from './gunaMilanConvention';

const IST_OFFSET_MS = 330 * 60_000;
const DAY_MS = 86_400_000;
const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = 360 / 108;

export type GunaMilanRole = 'groom' | 'bride';
export type KootaId = keyof typeof KOOTA_MAX;
export type GunaMilanBandId = typeof SCORE_BANDS[number]['id'];

export type GunaMilanPersonInput = {
  name?: string;
  /** YYYY-MM-DD, interpreted as an IST civil date. */
  date: string;
  /** HH:mm in IST, or null when unknown. */
  time: string | null;
};

export type MoonClassification = {
  longitude: number;
  nakshatraIndex: number;
  padaIndex: number;
  rashiIndex: number;
  degreesInRashi: number;
  varna: Varna;
  vashya: Vashya;
  yoni: Yoni;
  gana: Gana;
  nadi: Nadi;
  rashiLord: RashiLord;
};

export type KootaScore = {
  id: KootaId;
  score: number;
  max: number;
  groomValue: string;
  brideValue: string;
};

export type DoshaFlag = {
  id: 'bhakoot' | 'nadi';
  present: boolean;
  cancelled: boolean;
  cancellationRule: 'same-rashi-lord' | 'friendly-rashi-lords' | null;
};

export type ExactGunaMilanResult = {
  kind: 'exact';
  total: number;
  baseBand: GunaMilanBandId;
  band: GunaMilanBandId;
  kootas: readonly KootaScore[];
  groom: MoonClassification;
  bride: MoonClassification;
  flags: readonly DoshaFlag[];
  allTimesChecked: boolean;
  groomNakshatraIndices: readonly number[];
  brideNakshatraIndices: readonly number[];
  unknownTimeRoles: readonly GunaMilanRole[];
  groomClassifications: readonly MoonClassification[];
  brideClassifications: readonly MoonClassification[];
};

export type UncertainGunaMilanResult = {
  kind: 'range';
  minTotal: number;
  maxTotal: number;
  varyingKootas: readonly KootaId[];
  groomNakshatraIndices: readonly number[];
  brideNakshatraIndices: readonly number[];
  unknownTimeRoles: readonly GunaMilanRole[];
  possibilityCount: number;
};

export type GunaMilanResult = ExactGunaMilanResult | UncertainGunaMilanResult;

type LongitudeResolver = (date: Date) => number;

function tableIndex<T extends string>(values: readonly T[], value: T): number {
  const index = values.indexOf(value);
  if (index < 0) throw new Error(`Convention value not found: ${value}`);
  return index;
}

export function normalizeLongitude(longitude: number): number {
  if (!Number.isFinite(longitude)) throw new Error('Moon longitude must be finite');
  return ((longitude % 360) + 360) % 360;
}

export function classifyMoonLongitude(longitude: number): MoonClassification {
  const normalized = normalizeLongitude(longitude);
  const rashiIndex = Math.min(11, Math.floor(normalized / 30));
  const degreesInRashi = normalized - rashiIndex * 30;
  // The small epsilon makes exact rational boundaries (360/27 and 360/108)
  // belong to the interval beginning there despite binary floating-point noise.
  const nakshatraIndex = Math.min(26, Math.floor(normalized / NAKSHATRA_SPAN + 1e-10));
  const padaIndex = Math.min(3, Math.floor(normalized / PADA_SPAN + 1e-10) % 4);
  let vashya: Vashya;
  if (rashiIndex === 0 || rashiIndex === 1) vashya = 'chatushpada';
  else if (rashiIndex === 2 || rashiIndex === 5 || rashiIndex === 6 || rashiIndex === 10) vashya = 'manava';
  else if (rashiIndex === 3 || rashiIndex === 11) vashya = 'jalachara';
  else if (rashiIndex === 4) vashya = 'vanachara';
  else if (rashiIndex === 7) vashya = 'keeta';
  else if (rashiIndex === 8) vashya = degreesInRashi < 15 ? 'manava' : 'chatushpada';
  else vashya = degreesInRashi < 15 ? 'chatushpada' : 'jalachara';

  return {
    longitude: normalized,
    nakshatraIndex,
    padaIndex,
    rashiIndex,
    degreesInRashi,
    varna: VARNA_BY_RASHI[rashiIndex],
    vashya,
    yoni: YONI_BY_NAKSHATRA[nakshatraIndex],
    gana: GANA_BY_NAKSHATRA[nakshatraIndex],
    nadi: NADI_BY_NAKSHATRA[nakshatraIndex],
    rashiLord: RASHI_LORD_BY_RASHI[rashiIndex],
  };
}

function inclusiveNakshatraCount(fromIndex: number, toIndex: number): number {
  return ((toIndex - fromIndex + 27) % 27) + 1;
}

function taraHalf(fromIndex: number, toIndex: number): number {
  const remainder = inclusiveNakshatraCount(fromIndex, toIndex) % 9;
  return remainder === 3 || remainder === 5 || remainder === 7 ? 0 : 1.5;
}

function rashiDistance(fromIndex: number, toIndex: number): number {
  return ((toIndex - fromIndex + 12) % 12) + 1;
}

function isBhakootUnfavorable(groomRashi: number, brideRashi: number): boolean {
  const pair = [
    rashiDistance(groomRashi, brideRashi),
    rashiDistance(brideRashi, groomRashi),
  ].sort((a, b) => a - b).join('/');
  return pair === '2/12' || pair === '5/9' || pair === '6/8';
}

function scoreBand(total: number): GunaMilanBandId {
  const band = SCORE_BANDS.find((candidate) => total >= candidate.min && total <= candidate.max);
  if (!band) throw new Error(`Score outside convention: ${total}`);
  return band.id;
}

function bhakootFlag(groom: MoonClassification, bride: MoonClassification): DoshaFlag {
  if (!isBhakootUnfavorable(groom.rashiIndex, bride.rashiIndex)) {
    return { id: 'bhakoot', present: false, cancelled: false, cancellationRule: null };
  }
  if (groom.rashiLord === bride.rashiLord) {
    return { id: 'bhakoot', present: true, cancelled: true, cancellationRule: 'same-rashi-lord' };
  }
  const lordScore = GRAHA_MAITRI_SCORE[
    tableIndex(RASHI_LORD_ORDER, bride.rashiLord)
  ][tableIndex(RASHI_LORD_ORDER, groom.rashiLord)];
  if (lordScore === 5) {
    return { id: 'bhakoot', present: true, cancelled: true, cancellationRule: 'friendly-rashi-lords' };
  }
  return { id: 'bhakoot', present: true, cancelled: false, cancellationRule: null };
}

function nadiFlag(groom: MoonClassification, bride: MoonClassification): DoshaFlag {
  if (groom.nadi !== bride.nadi) {
    return { id: 'nadi', present: false, cancelled: false, cancellationRule: null };
  }
  // V1 does not claim a Nadi cancellation. Published schools disagree on
  // rashi/nakshatra/pada exceptions, so the base score and caution stay visible.
  return { id: 'nadi', present: true, cancelled: false, cancellationRule: null };
}

function interpretedBand(
  total: number,
  bhakoot: DoshaFlag,
  nadi: DoshaFlag
): GunaMilanBandId {
  if (nadi.present && !nadi.cancelled) return 'below-reference';
  if (bhakoot.present && !bhakoot.cancelled) {
    if (total >= 26) return 'very-good';
    if (total >= 21) return 'middling';
    return 'below-reference';
  }
  return scoreBand(total);
}

export function calculateGunaMilanFromLongitudes(
  groomLongitude: number,
  brideLongitude: number,
  allTimesChecked = false
): ExactGunaMilanResult {
  const groom = classifyMoonLongitude(groomLongitude);
  const bride = classifyMoonLongitude(brideLongitude);
  const varna = VARNA_RANK[groom.varna] >= VARNA_RANK[bride.varna] ? 1 : 0;
  const vashya = VASHYA_SCORE[
    tableIndex(VASHYA_ORDER, bride.vashya)
  ][tableIndex(VASHYA_ORDER, groom.vashya)];
  const tara = taraHalf(bride.nakshatraIndex, groom.nakshatraIndex)
    + taraHalf(groom.nakshatraIndex, bride.nakshatraIndex);
  const yoni = YONI_SCORE[
    tableIndex(YONI_ORDER, bride.yoni)
  ][tableIndex(YONI_ORDER, groom.yoni)];
  const grahaMaitri = GRAHA_MAITRI_SCORE[
    tableIndex(RASHI_LORD_ORDER, bride.rashiLord)
  ][tableIndex(RASHI_LORD_ORDER, groom.rashiLord)];
  const gana = GANA_SCORE[
    tableIndex(GANA_ORDER, groom.gana)
  ][tableIndex(GANA_ORDER, bride.gana)];
  const bhakoot = isBhakootUnfavorable(groom.rashiIndex, bride.rashiIndex) ? 0 : 7;
  const nadi = groom.nadi === bride.nadi ? 0 : 8;
  const kootas: readonly KootaScore[] = [
    { id: 'varna', score: varna, max: KOOTA_MAX.varna, groomValue: groom.varna, brideValue: bride.varna },
    { id: 'vashya', score: vashya, max: KOOTA_MAX.vashya, groomValue: groom.vashya, brideValue: bride.vashya },
    { id: 'tara', score: tara, max: KOOTA_MAX.tara, groomValue: String(groom.nakshatraIndex), brideValue: String(bride.nakshatraIndex) },
    { id: 'yoni', score: yoni, max: KOOTA_MAX.yoni, groomValue: groom.yoni, brideValue: bride.yoni },
    { id: 'grahaMaitri', score: grahaMaitri, max: KOOTA_MAX.grahaMaitri, groomValue: groom.rashiLord, brideValue: bride.rashiLord },
    { id: 'gana', score: gana, max: KOOTA_MAX.gana, groomValue: groom.gana, brideValue: bride.gana },
    { id: 'bhakoot', score: bhakoot, max: KOOTA_MAX.bhakoot, groomValue: String(groom.rashiIndex), brideValue: String(bride.rashiIndex) },
    { id: 'nadi', score: nadi, max: KOOTA_MAX.nadi, groomValue: groom.nadi, brideValue: bride.nadi },
  ];
  const total = kootas.reduce((sum, koota) => sum + koota.score, 0);
  const bhakootDosha = bhakootFlag(groom, bride);
  const nadiDosha = nadiFlag(groom, bride);
  return {
    kind: 'exact',
    total,
    baseBand: scoreBand(total),
    band: interpretedBand(total, bhakootDosha, nadiDosha),
    kootas,
    groom,
    bride,
    flags: [bhakootDosha, nadiDosha],
    allTimesChecked,
    groomNakshatraIndices: [groom.nakshatraIndex],
    brideNakshatraIndices: [bride.nakshatraIndex],
    unknownTimeRoles: [],
    groomClassifications: [groom],
    brideClassifications: [bride],
  };
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseIstMoment(dateText: string, timeText: string): Date {
  const dateMatch = DATE_PATTERN.exec(dateText);
  const timeMatch = TIME_PATTERN.exec(timeText);
  if (!dateMatch || !timeMatch) throw new Error('Use YYYY-MM-DD and 24-hour HH:mm in IST');
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const civil = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (civil.getUTCFullYear() !== year || civil.getUTCMonth() !== month - 1 || civil.getUTCDate() !== day) {
    throw new Error('Enter a valid IST birth date');
  }
  return new Date(civil.getTime() - IST_OFFSET_MS);
}

function resolveMoon(date: Date): number {
  return getSiderealPlanetLongitude('moon', date);
}

function classificationSignature(value: MoonClassification): string {
  return [value.nakshatraIndex, value.padaIndex, value.rashiIndex, value.vashya].join(':');
}

function unwrapFrom(start: number, current: number): number {
  let delta = normalizeLongitude(current) - start;
  if (delta < -180) delta += 360;
  if (delta > 180) delta -= 360;
  return start + delta;
}

function boundaryTimes(
  startMs: number,
  endMs: number,
  startLongitude: number,
  endUnwrapped: number,
  resolver: LongitudeResolver
): number[] {
  const boundaries = new Set<number>();
  for (const step of [PADA_SPAN, 15, 30]) {
    const first = Math.floor(startLongitude / step) + 1;
    const last = Math.floor(endUnwrapped / step);
    for (let index = first; index <= last; index += 1) boundaries.add(index * step);
  }
  const times: number[] = [];
  for (const boundary of [...boundaries].sort((a, b) => a - b)) {
    let low = startMs;
    let high = endMs;
    for (let iteration = 0; iteration < 44 && high - low > 1; iteration += 1) {
      const mid = Math.floor((low + high) / 2);
      const longitude = unwrapFrom(startLongitude, resolver(new Date(mid)));
      if (longitude < boundary) low = mid + 1;
      else high = mid;
    }
    times.push(high);
  }
  return times;
}

export function enumerateMoonClassificationsForIstDate(
  dateText: string,
  resolver: LongitudeResolver = resolveMoon
): readonly MoonClassification[] {
  const start = parseIstMoment(dateText, '00:00');
  const startMs = start.getTime();
  const endMs = startMs + DAY_MS - 1;
  const startLongitude = normalizeLongitude(resolver(start));
  let endUnwrapped = unwrapFrom(startLongitude, resolver(new Date(endMs)));
  if (endUnwrapped < startLongitude) endUnwrapped += 360;
  if (endUnwrapped - startLongitude > 30) {
    throw new Error('Unexpected Moon motion while checking an IST civil day');
  }
  const crossings = boundaryTimes(startMs, endMs, startLongitude, endUnwrapped, resolver);
  const cuts = [startMs, ...crossings, endMs];
  const samples = new Set<number>([startMs, endMs]);
  for (let index = 0; index < cuts.length - 1; index += 1) {
    samples.add(Math.floor((cuts[index] + cuts[index + 1]) / 2));
  }
  const unique = new Map<string, MoonClassification>();
  for (const sampleMs of [...samples].sort((a, b) => a - b)) {
    const classification = classifyMoonLongitude(resolver(new Date(sampleMs)));
    unique.set(classificationSignature(classification), classification);
  }
  return [...unique.values()];
}

function exactPossibilities(input: GunaMilanPersonInput): readonly MoonClassification[] {
  if (input.time) {
    return [classifyMoonLongitude(resolveMoon(parseIstMoment(input.date, input.time)))];
  }
  return enumerateMoonClassificationsForIstDate(input.date);
}

function resultSignature(result: ExactGunaMilanResult): string {
  return JSON.stringify({
    total: result.total,
    kootas: result.kootas.map(({ id, score }) => [id, score]),
    flags: result.flags,
  });
}

export function aggregateGunaMilanPossibilities(
  groomPossibilities: readonly MoonClassification[],
  bridePossibilities: readonly MoonClassification[],
  allTimesChecked = true,
  unknownTimeRoles: readonly GunaMilanRole[] = [
    ...(groomPossibilities.length > 1 ? ['groom' as const] : []),
    ...(bridePossibilities.length > 1 ? ['bride' as const] : []),
  ]
): GunaMilanResult {
  if (groomPossibilities.length === 0 || bridePossibilities.length === 0) {
    throw new Error('At least one Moon classification is required for each role');
  }
  const results: ExactGunaMilanResult[] = [];
  for (const groom of groomPossibilities) {
    for (const bride of bridePossibilities) {
      results.push(calculateGunaMilanFromLongitudes(groom.longitude, bride.longitude));
    }
  }
  const unique = new Map(results.map((result) => [resultSignature(result), result]));
  if (unique.size === 1) {
    const stable = [...unique.values()][0];
    return {
      ...stable,
      allTimesChecked,
      groomNakshatraIndices: [...new Set(groomPossibilities.map((value) => value.nakshatraIndex))],
      brideNakshatraIndices: [...new Set(bridePossibilities.map((value) => value.nakshatraIndex))],
      unknownTimeRoles,
      groomClassifications: groomPossibilities,
      brideClassifications: bridePossibilities,
    };
  }
  const totals = results.map((result) => result.total);
  const varyingKootas = (Object.keys(KOOTA_MAX) as KootaId[]).filter((id) => {
    const values = new Set(results.map((result) => result.kootas.find((koota) => koota.id === id)!.score));
    return values.size > 1;
  });
  return {
    kind: 'range',
    minTotal: Math.min(...totals),
    maxTotal: Math.max(...totals),
    varyingKootas,
    groomNakshatraIndices: [...new Set(groomPossibilities.map((value) => value.nakshatraIndex))],
    brideNakshatraIndices: [...new Set(bridePossibilities.map((value) => value.nakshatraIndex))],
    unknownTimeRoles,
    possibilityCount: results.length,
  };
}

export function calculateGunaMilan(
  groomInput: GunaMilanPersonInput,
  brideInput: GunaMilanPersonInput
): GunaMilanResult {
  const groomPossibilities = exactPossibilities(groomInput);
  const bridePossibilities = exactPossibilities(brideInput);
  return aggregateGunaMilanPossibilities(
    groomPossibilities,
    bridePossibilities,
    !groomInput.time || !brideInput.time,
    [
      ...(!groomInput.time ? ['groom' as const] : []),
      ...(!brideInput.time ? ['bride' as const] : []),
    ]
  );
}

export function calculateExactGunaMilan(
  groomInput: GunaMilanPersonInput & { time: string },
  brideInput: GunaMilanPersonInput & { time: string }
): ExactGunaMilanResult {
  const groomLongitude = resolveMoon(parseIstMoment(groomInput.date, groomInput.time));
  const brideLongitude = resolveMoon(parseIstMoment(brideInput.date, brideInput.time));
  return calculateGunaMilanFromLongitudes(groomLongitude, brideLongitude);
}
