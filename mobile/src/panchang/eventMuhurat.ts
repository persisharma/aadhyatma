/**
 * Event Muhurat Finder — occasion-level day grading (PRD-16 Phase 1).
 * See docs/roadmap/prds/16-event-muhurat-finder.md and RULEBOOK §14.
 *
 * PURE: verdicts are derived from a `PanchangData` + `MuhuratDay` the caller
 * already computed — no I/O and no wall-clock reads. The one
 * astronomy import is `getSiderealPlanetLongitude` (itself pure, same boundary
 * as kundali.ts) for the Shukra/Guru asta check; callers pass the instant.
 *
 * ⚠ CONTENT GATE (RULEBOOK §14): the nakshatra/tithi/vara tables in
 * EVENT_RULES are DRAFT. Factor model (nakshatra + vara + tithi + masa
 * shuddhi) and the asta rule follow DrikPanchang's stated method (citing
 * Muhurta Chintamani / Dharmasindhu); the Nov-2026 output was cross-checked
 * against published lists (exact tithi/nakshatra/vara match on 11/25/26 Nov,
 * see PRD-16). Per-occasion tables still need full §10 review — two
 * concordant authoritative sources each — before a store release exposes
 * this surface.
 */
import type { MuhuratDay, ChoghadiyaPeriod } from './muhurat';
import type { PanchangData } from './types';
import { getSiderealPlanetLongitude } from './kundali';

export type OccasionId =
  | 'griha-pravesh'
  | 'vahan'
  | 'namkaran'
  | 'vidyarambh'
  | 'bhumi-pujan'
  | 'vyapar';

export type DoshaKey =
  | 'rikta'
  | 'amavasya'
  | 'bhadra'
  | 'panchak'
  | 'adhik'
  | 'vyatipata'
  | 'vaidhriti'
  | 'chaturmas'
  | 'guru-asta'
  | 'shukra-asta';

export type EventRule = {
  id: OccasionId;
  nameHi: string;
  nameEn: string;
  /** 0-based indexes into the 27-nakshatra tables (names.ts). */
  nakshatras: readonly number[];
  /** 0-based indexes into the 30-tithi array (shukla 1..15 → 0..14, krishna → 15..29). */
  tithis: readonly number[];
  /** Favourable weekdays, 0=Sunday. */
  varas: readonly number[];
  /** Weekdays that block a two-factor day from the workable tier. */
  avoidVaras: readonly number[];
  doshas: readonly DoshaKey[];
  /** §10 provenance. `verified: false` = tables are draft (RULEBOOK §14). */
  source: { convention: 'drikpanchang'; verified: boolean; referenceUrls: readonly string[]; notes: string };
};

export type MuhuratTier = 'shreshtha' | 'madhyam' | 'excluded';

export type MuhuratWindow = {
  kind: 'choghadiya' | 'abhijit';
  nameHi: string;
  nameEn: string;
  start: Date;
  end: Date;
};

export type DayVerdict = {
  dateMs: number;
  tier: MuhuratTier;
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean };
  doshas: DoshaKey[];
  /** Auspicious daytime windows (kaal slots removed), best first; empty when excluded. */
  windows: MuhuratWindow[];
};

export type FinderSummary = {
  verdicts: DayVerdict[];
  shreshtha: DayVerdict[];
  madhyam: DayVerdict[];
  /** Dosha → number of scanned days it excluded (for the empty-state reasons). */
  doshaDays: Partial<Record<DoshaKey, number>>;
};

// Rikta tithis (Chaturthi/Navami/Chaturdashi, both pakshas) + Amavasya.
const RIKTA = new Set([3, 8, 13, 18, 23, 28]);
const AMAVASYA = 29;
const VISHTI_KARANA_INDEX = 6; // भद्रा — sunrise karana only; window solver is Phase 2 (PRD-16 §5).
const PANCHAK_FIRST = 22; // Dhanishta … Revati (coarse: whole-nakshatra, not half-Dhanishta).
const PUSHYA = 7;

const GENERAL_GOOD_TITHIS = [1, 2, 4, 6, 9, 10, 12, 14, 16, 17, 19, 21, 24, 25, 27] as const;
const DP = 'https://www.drikpanchang.com/shubh-dates/';
const DRAFT = (page: string, notes: string) =>
  ({ convention: 'drikpanchang', verified: false, referenceUrls: [DP + page], notes } as const);

export const EVENT_RULES: readonly EventRule[] = [
  {
    id: 'griha-pravesh',
    nameHi: 'गृह प्रवेश',
    nameEn: 'Griha Pravesh',
    nakshatras: [3, 4, 11, 13, 16, 20, 22, 25, 26],
    tithis: [1, 2, 4, 6, 9, 10, 12, 14, 16, 17, 19, 21, 24, 25, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'panchak', 'adhik', 'vyatipata', 'vaidhriti', 'chaturmas', 'guru-asta', 'shukra-asta'],
    source: DRAFT(
      'griha-pravesh-dates-with-muhurat.html',
      'DRAFT §10 pending. Asta bar is the Muhurta Chintamani/Dharmasindhu rule DrikPanchang cites for Griha Pravesh. Nov-2026 output matched published lists on 11/25/26 Nov (PRD-16 validation).'
    ),
  },
  {
    id: 'vahan',
    nameHi: 'वाहन क्रय',
    nameEn: 'Vehicle Purchase',
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 22, 23, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('vehicle-purchase-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  {
    id: 'namkaran',
    nameHi: 'नामकरण',
    nameEn: 'Naming Ceremony',
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
    tithis: [0, 1, 2, 4, 6, 9, 10, 11, 12, 15, 16, 17, 19, 21, 24, 25, 26, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('namkaran-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  {
    id: 'vidyarambh',
    nameHi: 'विद्यारम्भ',
    nameEn: 'Starting Education',
    nakshatras: [0, 6, 7, 12, 13, 14, 16, 20, 21, 22, 23, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('vidyarambha-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  {
    id: 'bhumi-pujan',
    nameHi: 'भूमि पूजन',
    nameEn: 'Bhumi Pujan',
    nakshatras: [3, 4, 6, 7, 11, 12, 13, 16, 20, 21, 22, 25, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'panchak', 'adhik', 'vyatipata', 'vaidhriti', 'chaturmas', 'guru-asta', 'shukra-asta'],
    source: DRAFT('bhumi-pujan-dates-with-muhurat.html', 'DRAFT §10 pending. Shares Griha Pravesh masa/asta bars.'),
  },
  {
    id: 'vyapar',
    nameHi: 'व्यापार आरम्भ',
    nameEn: 'Starting a Business',
    nakshatras: [0, 3, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('business-opening-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
];

export function getEventRule(id: OccasionId): EventRule {
  const rule = EVENT_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Unknown occasion: ${id}`);
  return rule;
}

export const DOSHA_LABELS: Readonly<Record<DoshaKey, { hi: string; en: string }>> = {
  rikta: { hi: 'रिक्ता तिथि', en: 'Rikta tithi' },
  amavasya: { hi: 'अमावस्या', en: 'Amavasya' },
  bhadra: { hi: 'भद्रा (विष्टि करण)', en: 'Bhadra (Vishti karana)' },
  panchak: { hi: 'पंचक', en: 'Panchak' },
  adhik: { hi: 'अधिक मास', en: 'Adhik maas' },
  vyatipata: { hi: 'व्यतीपात योग', en: 'Vyatipata yoga' },
  vaidhriti: { hi: 'वैधृति योग', en: 'Vaidhriti yoga' },
  chaturmas: { hi: 'चातुर्मास', en: 'Chaturmas' },
  'guru-asta': { hi: 'गुरु अस्त', en: 'Guru asta (Jupiter combust)' },
  'shukra-asta': { hi: 'शुक्र अस्त', en: 'Shukra asta (Venus combust)' },
};

export const TIER_LABELS: Readonly<Record<Exclude<MuhuratTier, 'excluded'>, { hi: string; en: string }>> = {
  shreshtha: { hi: 'श्रेष्ठ', en: 'Shreshtha' },
  madhyam: { hi: 'मध्यम', en: 'Madhyam' },
};

/**
 * Chaturmas from the sunrise anga alone: Ashadha Shukla Ekadashi (Devshayani)
 * through Kartik Shukla Dashami — the bar lifts on Dev Uthani Ekadashi. The
 * tithi-span reading; published lists resume earlier in Kartik Shukla
 * (post-Diwali) — convention documented in PRD-16 §9 and surfaced in the UI.
 * Kshaya-safe: when Kartik Shukla Ekadashi touches no sunrise (2026), the
 * sunrise tithi jumps Dashami → Dwadashi and the window still closes on the
 * right civil day. Month is normalised to purnimant, so a user's amanta
 * setting cannot move the season (engine: amanta krishna = purnimant − 1).
 */
export function isChaturmasDay(p: PanchangData): boolean {
  let month = p.lunarMonth.index; // 1-based, Chaitra=1 … Phalguna=12
  if (p.calendarSystem === 'amanta' && p.tithi.paksha === 'krishna') {
    month = (month % 12) + 1;
  }
  const t = p.tithi.index;
  if (month === 4) return p.tithi.paksha === 'shukla' && t >= 10; // Ashadha: Devshayani onwards
  if (month === 5 || month === 6 || month === 7) return true; // Shravana · Bhadrapada · Ashwin
  if (month === 8) return p.tithi.paksha === 'krishna' || t < 10; // Kartik: until Dev Uthani
  return false;
}

// Combustion orbs. Flat 10° for Venus (the 8° retrograde-Shukra variant is a
// documented open question, PRD-16 §9), 11° for Jupiter. Validated against the
// 2026 conjunctions: Guru asta 15 Jul – 13 Aug, Shukra asta 18 – 30 Oct.
const VENUS_ORB_DEG = 10;
const JUPITER_ORB_DEG = 11;

function elongation(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

/** Asta flags at an instant (pass local noon of the civil day). */
export function computeAstaFlags(at: Date): { shukraAsta: boolean; guruAsta: boolean } {
  const sun = getSiderealPlanetLongitude('sun', at);
  return {
    shukraAsta: elongation(getSiderealPlanetLongitude('venus', at), sun) < VENUS_ORB_DEG,
    guruAsta: elongation(getSiderealPlanetLongitude('jupiter', at), sun) < JUPITER_ORB_DEG,
  };
}

function dayDoshas(p: PanchangData, asta: { shukraAsta: boolean; guruAsta: boolean }): DoshaKey[] {
  const out: DoshaKey[] = [];
  const t = p.tithi.index;
  if (RIKTA.has(t)) out.push('rikta');
  if (t === AMAVASYA) out.push('amavasya');
  if (p.karana.index === VISHTI_KARANA_INDEX) out.push('bhadra');
  if (p.nakshatra.index >= PANCHAK_FIRST) out.push('panchak');
  if (p.lunarMonth.isAdhik) out.push('adhik');
  if (p.yoga.index === 16) out.push('vyatipata');
  if (p.yoga.index === 26) out.push('vaidhriti');
  if (isChaturmasDay(p)) out.push('chaturmas');
  if (asta.guruAsta) out.push('guru-asta');
  if (asta.shukraAsta) out.push('shukra-asta');
  return out;
}

const AUSPICIOUS_CHOGHADIYA = new Set<ChoghadiyaPeriod['key']>(['labh', 'amrit', 'shubh', 'char']);

/**
 * Usable daytime windows: auspicious day-choghadiya whose slot is not a kaal
 * (both are exact eighths of the daytime, so exclusion is dropping a slot),
 * plus Abhijit. Best-first: Abhijit and Amrit lead.
 */
export function auspiciousWindows(m: MuhuratDay): MuhuratWindow[] {
  const kaalStarts = new Set([m.rahu.start.getTime(), m.gulika.start.getTime(), m.yamaganda.start.getTime()]);
  const windows: MuhuratWindow[] = m.dayChoghadiya
    .filter((c) => AUSPICIOUS_CHOGHADIYA.has(c.key) && !kaalStarts.has(c.start.getTime()))
    .map((c) => ({ kind: 'choghadiya' as const, nameHi: c.nameHi, nameEn: c.nameEn, start: c.start, end: c.end }));
  if (m.abhijit) {
    windows.push({ kind: 'abhijit', nameHi: 'अभिजित', nameEn: 'Abhijit', start: m.abhijit.start, end: m.abhijit.end });
  }
  const priority = (w: MuhuratWindow) => (w.nameEn === 'Amrit' ? 0 : w.kind === 'abhijit' ? 1 : w.nameEn === 'Shubh' ? 2 : 3);
  return windows.sort((a, b) => priority(a) - priority(b) || a.start.getTime() - b.start.getTime());
}

export function evaluateDay(
  rule: EventRule,
  dateMs: number,
  weekday: number,
  p: PanchangData,
  m: MuhuratDay,
  asta: { shukraAsta: boolean; guruAsta: boolean }
): DayVerdict {
  const doshas = dayDoshas(p, asta).filter((d) => rule.doshas.includes(d));
  const factors = {
    nakshatra: rule.nakshatras.includes(p.nakshatra.index),
    tithi: rule.tithis.includes(p.tithi.index),
    vara: rule.varas.includes(weekday),
  };
  let tier: MuhuratTier;
  if (doshas.length > 0) tier = 'excluded';
  else {
    const ok = Number(factors.nakshatra) + Number(factors.tithi) + Number(factors.vara);
    if (ok === 3) tier = 'shreshtha';
    else if (ok === 2 && !rule.avoidVaras.includes(weekday)) tier = 'madhyam';
    else tier = 'excluded';
  }
  return { dateMs, tier, factors, doshas, windows: tier === 'excluded' ? [] : auspiciousWindows(m) };
}

export function summarize(verdicts: DayVerdict[]): FinderSummary {
  const doshaDays: Partial<Record<DoshaKey, number>> = {};
  for (const v of verdicts) {
    for (const d of v.doshas) doshaDays[d] = (doshaDays[d] ?? 0) + 1;
  }
  return {
    verdicts,
    shreshtha: verdicts.filter((v) => v.tier === 'shreshtha'),
    madhyam: verdicts.filter((v) => v.tier === 'madhyam'),
    doshaDays,
  };
}
