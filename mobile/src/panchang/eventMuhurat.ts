/**
 * Event Muhurat Finder — occasion-level day grading (PRD-16 Phase 1).
 * See docs/roadmap/prds/16-event-muhurat-finder.md and RULEBOOK §17.
 *
 * PURE: verdicts are derived from a `PanchangData` + `MuhuratDay` the caller
 * already computed — no I/O and no wall-clock reads. The one
 * astronomy import is `getSiderealPlanetLongitude` (itself pure, same boundary
 * as kundali.ts) for the Shukra/Guru asta check; callers pass the instant.
 *
 * ⚠ CONTENT GATE (RULEBOOK §17): the nakshatra/tithi/vara tables in
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
  | 'vyapar'
  // Phase 2 occasions (PRD-16 §4.3, TRD-16/P2 §4.4)
  | 'mundan'
  | 'annaprashan'
  | 'karnavedha'
  | 'upanayana'
  | 'sampatti'
  | 'swarna';

/** Picker grouping (TRD-16/P2 §6.1): twelve occasions need sections. */
export type OccasionGroup = 'bhavan' | 'sanskar' | 'arambh';

export const GROUP_LABELS: Readonly<Record<OccasionGroup, { hi: string; en: string }>> = {
  bhavan: { hi: 'भवन', en: 'Home & Land' },
  sanskar: { hi: 'संस्कार', en: 'Sanskar' },
  arambh: { hi: 'क्रय व आरम्भ', en: 'Purchases & Beginnings' },
};

export const GROUP_ORDER: readonly OccasionGroup[] = ['bhavan', 'sanskar', 'arambh'];

export type DoshaKey =
  | 'rikta'
  | 'amavasya'
  | 'bhadra'
  | 'panchak'
  | 'adhik'
  | 'vyatipata'
  | 'vaidhriti'
  | 'chaturmas'
  | 'masa'
  | 'guru-asta'
  | 'shukra-asta';

/**
 * Per-occasion lunar-month rules (TRD-16/P2 §4.3). Indices are the
 * PURNIMANT month, 1 = Chaitra … 12 = Phalguna — the same normalisation
 * `isChaturmasDay` applies, so the user's amanta setting cannot move a bar.
 * `preferred` is informational (empty-state copy); only `barred` grades.
 */
export type MasaRule = {
  preferred: readonly number[];
  barred: readonly number[];
};

const NO_MASA_RULE: MasaRule = { preferred: [], barred: [] };

export type EventRule = {
  id: OccasionId;
  nameHi: string;
  nameEn: string;
  group: OccasionGroup;
  /** Masa shuddhi (Phase 2). DRAFT content, same §10 gate as the anga tables. */
  masa: MasaRule;
  /** 0-based indexes into the 27-nakshatra tables (names.ts). */
  nakshatras: readonly number[];
  /** 0-based indexes into the 30-tithi array (shukla 1..15 → 0..14, krishna → 15..29). */
  tithis: readonly number[];
  /** Favourable weekdays, 0=Sunday. */
  varas: readonly number[];
  /** Weekdays that block a two-factor day from the workable tier. */
  avoidVaras: readonly number[];
  doshas: readonly DoshaKey[];
  /** §10 provenance. `verified: false` = tables are draft (RULEBOOK §17). */
  source: { convention: 'drikpanchang'; verified: boolean; referenceUrls: readonly string[]; notes: string };
};

export type MuhuratTier = 'shreshtha' | 'madhyam' | 'excluded';

export type MuhuratWindow = {
  kind: 'choghadiya' | 'abhijit';
  nameHi: string;
  nameEn: string;
  start: Date;
  end: Date;
  /** Phase 2: this window's own grade, from the anga prevailing at its start. */
  tier: Exclude<MuhuratTier, 'excluded'>;
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean };
  /** The angas during THIS window, when they differ from sunrise; else null. */
  angaAtWindow: { nakshatraIndex: number; tithiIndex: number } | null;
};

export type DayVerdict = {
  dateMs: number;
  tier: MuhuratTier;
  /** Best window's factors; sunrise factors when the day is excluded. */
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean };
  doshas: DoshaKey[];
  /** Qualifying windows (kaal + bhadra removed, window-graded), best first; empty when excluded. */
  windows: MuhuratWindow[];
  /** Sunrise anga, retained: the almanac reading the Panchang tab shows. */
  sunriseAnga: { nakshatraIndex: number; tithiIndex: number };
  /** Bhadra as an interval when Vishti is the sunrise karana; else null. */
  bhadra: { start: Date; end: Date } | null;
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

const GENERAL_GOOD_TITHIS = [1, 2, 4, 6, 9, 10, 12, 14, 16, 17, 19, 21, 24, 25, 27] as const;
const DP = 'https://www.drikpanchang.com/shubh-dates/';
const DRAFT = (page: string, notes: string) =>
  ({ convention: 'drikpanchang', verified: false, referenceUrls: [DP + page], notes } as const);

export const EVENT_RULES: readonly EventRule[] = [
  {
    id: 'griha-pravesh',
    group: 'bhavan',
    masa: { preferred: [11, 12, 2, 3], barred: [] },
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
    group: 'arambh',
    masa: NO_MASA_RULE,
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
    group: 'sanskar',
    masa: NO_MASA_RULE,
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
    group: 'sanskar',
    masa: NO_MASA_RULE,
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
    group: 'bhavan',
    masa: { preferred: [11, 12, 2, 3], barred: [] },
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
    group: 'arambh',
    masa: NO_MASA_RULE,
    nameHi: 'व्यापार आरम्भ',
    nameEn: 'Starting a Business',
    nakshatras: [0, 3, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('business-opening-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  // ── Phase 2 occasions (PRD-16 §4.3, TRD-16/P2 §4.4). All DRAFT pending §10. ──
  {
    id: 'mundan',
    nameHi: 'मुंडन',
    nameEn: 'Mundan',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    nakshatras: [0, 4, 6, 7, 12, 13, 14, 17, 21, 22, 23],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('chudakarana-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  {
    id: 'annaprashan',
    nameHi: 'अन्नप्राशन',
    nameEn: 'Annaprashan',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
    tithis: [1, 2, 4, 6, 9, 11, 12, 14, 16, 17, 19, 21, 24, 26, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'annaprashan-dates-with-muhurat.html',
      'DRAFT §10 pending. Age-window guidance (6th/8th month) is caption copy only — the finder scans its normal horizon, the same treatment namkaran shipped with.'
    ),
  },
  {
    id: 'karnavedha',
    nameHi: 'कर्णवेध',
    nameEn: 'Karnavedha',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    nakshatras: [4, 6, 7, 12, 13, 14, 16, 21, 22, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('karnavedha-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  {
    id: 'upanayana',
    nameHi: 'उपनयन',
    nameEn: 'Upanayana',
    group: 'sanskar',
    // The one populated masa bar (PRD: "stricter; Chaturmas-barred"): the
    // traditional window is Magha–Jyeshtha; Margashirsha/Pausha are barred
    // beyond the Chaturmas months. DRAFT — the sharpest §10 review target.
    masa: { preferred: [11, 12, 1, 2, 3], barred: [5, 6, 7, 8, 9, 10] },
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26],
    tithis: [1, 2, 4, 9, 10, 11],
    varas: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'panchak', 'adhik', 'vyatipata', 'vaidhriti', 'chaturmas', 'guru-asta', 'shukra-asta'],
    source: DRAFT('upanayana-dates-with-muhurat.html', 'DRAFT §10 pending. Shukla-paksha tithis only; masa window Magha–Jyeshtha.'),
  },
  {
    id: 'sampatti',
    nameHi: 'सम्पत्ति क्रय',
    nameEn: 'Property Purchase',
    group: 'arambh',
    masa: NO_MASA_RULE,
    nakshatras: [3, 4, 6, 7, 11, 12, 13, 16, 20, 21, 22, 25, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('property-purchase-dates-with-muhurat.html', 'DRAFT §10 pending.'),
  },
  {
    id: 'swarna',
    nameHi: 'स्वर्ण क्रय',
    nameEn: 'Gold Purchase',
    group: 'arambh',
    masa: NO_MASA_RULE,
    nakshatras: [0, 3, 6, 7, 11, 12, 13, 20, 21, 25, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT('gold-purchase-dates-with-muhurat.html', 'DRAFT §10 pending. Overlaps the abujh days heavily by design (PRD §4.3).'),
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
  masa: { hi: 'मास शुद्धि', en: 'Unsuitable month' },
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
/**
 * The PURNIMANT lunar-month index (1 = Chaitra … 12 = Phalguna) regardless of
 * the user's calendar-system setting — amanta and purnimant disagree across
 * the whole krishna paksha, and every month-based rule (Chaturmas, masa
 * shuddhi) must not move when the user flips the setting.
 */
export function normalisedPurnimantMonth(p: PanchangData): number {
  let month = p.lunarMonth.index; // 1-based, Chaitra=1 … Phalguna=12
  if (p.calendarSystem === 'amanta' && p.tithi.paksha === 'krishna') {
    month = (month % 12) + 1;
  }
  return month;
}

export function isChaturmasDay(p: PanchangData): boolean {
  const month = normalisedPurnimantMonth(p);
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

/**
 * DAY-LEVEL doshas — the ones that cannot change between sunrise and sunset:
 * month/season bars, yoga flags (yoga end-times are unsolved by design), and
 * the asta combustions. Tithi/nakshatra-derived doshas (rikta, amavasya,
 * panchak) are NOT here — Phase 2 evaluates those per WINDOW, at the anga
 * prevailing when the window opens (TRD-16/P2 §4.1).
 */
function dayLevelDoshas(
  rule: EventRule,
  p: PanchangData,
  asta: { shukraAsta: boolean; guruAsta: boolean }
): DoshaKey[] {
  const out: DoshaKey[] = [];
  if (p.lunarMonth.isAdhik) out.push('adhik');
  if (p.yoga.index === 16) out.push('vyatipata');
  if (p.yoga.index === 26) out.push('vaidhriti');
  if (isChaturmasDay(p)) out.push('chaturmas');
  if (rule.masa.barred.includes(normalisedPurnimantMonth(p))) out.push('masa');
  if (asta.guruAsta) out.push('guru-asta');
  if (asta.shukraAsta) out.push('shukra-asta');
  return out;
}

/** Tithi/nakshatra doshas at a specific anga pair (window-time, Phase 2). */
function angaDoshas(tithiIndex: number, nakshatraIndex: number): DoshaKey[] {
  const out: DoshaKey[] = [];
  if (RIKTA.has(tithiIndex)) out.push('rikta');
  if (tithiIndex === AMAVASYA) out.push('amavasya');
  if (nakshatraIndex >= PANCHAK_FIRST) out.push('panchak');
  return out;
}

/**
 * The anga index prevailing at instant `t` (TRD-16/P2 §4.1). Kshaya-aware:
 * on a kshaya day the next anga is NOT `index + 1` — the skipped anga (which
 * touches no sunrise) comes first, then ITS successor. `PanchangData` already
 * carries the skipped anga and both end instants, so this is pure arithmetic.
 */
export function angaAt(
  main: { index: number; endTime: Date | null },
  kshaya: { index: number; endTime: Date | null } | null,
  t: Date,
  mod: number
): number {
  if (!main.endTime || t.getTime() < main.endTime.getTime()) return main.index;
  if (kshaya) {
    if (!kshaya.endTime || t.getTime() < kshaya.endTime.getTime()) return kshaya.index;
    return (kshaya.index + 1) % mod;
  }
  return (main.index + 1) % mod;
}

/**
 * भद्रा as an interval (TRD-16/P2 §4.2): when Vishti is the sunrise karana, it
 * runs from sunrise until the karana's solved end. Ends past sunset ⇒ the
 * whole day is inside it. A solver-less day (endTime null — pre-Phase-2 cached
 * data cannot reach here after the cache-version bump, but stay defensive)
 * degrades to the Phase-1 whole-day reading via `end: null` → callers treat
 * the interval as open-ended.
 */
export function bhadraInterval(p: PanchangData): { start: Date; end: Date | null } | null {
  if (p.karana.index !== VISHTI_KARANA_INDEX) return null;
  return { start: p.sunrise, end: p.karana.endTime };
}

const AUSPICIOUS_CHOGHADIYA = new Set<ChoghadiyaPeriod['key']>(['labh', 'amrit', 'shubh', 'char']);

/** A window before grading — what `auspiciousWindows` yields. */
export type RawMuhuratWindow = Omit<MuhuratWindow, 'tier' | 'factors' | 'angaAtWindow'>;

/**
 * Usable daytime windows: auspicious day-choghadiya whose slot is not a kaal
 * (both are exact eighths of the daytime, so exclusion is dropping a slot),
 * plus Abhijit. Best-first: Abhijit and Amrit lead.
 */
export function auspiciousWindows(m: MuhuratDay): RawMuhuratWindow[] {
  const kaalStarts = new Set([m.rahu.start.getTime(), m.gulika.start.getTime(), m.yamaganda.start.getTime()]);
  const windows: RawMuhuratWindow[] = m.dayChoghadiya
    .filter((c) => AUSPICIOUS_CHOGHADIYA.has(c.key) && !kaalStarts.has(c.start.getTime()))
    .map((c) => ({ kind: 'choghadiya' as const, nameHi: c.nameHi, nameEn: c.nameEn, start: c.start, end: c.end }));
  if (m.abhijit) {
    windows.push({ kind: 'abhijit', nameHi: 'अभिजित', nameEn: 'Abhijit', start: m.abhijit.start, end: m.abhijit.end });
  }
  const priority = (w: RawMuhuratWindow) => (w.nameEn === 'Amrit' ? 0 : w.kind === 'abhijit' ? 1 : w.nameEn === 'Shubh' ? 2 : 3);
  return windows.sort((a, b) => priority(a) - priority(b) || a.start.getTime() - b.start.getTime());
}

/** Windows with any bhadra overlap removed — dropped, not clipped (§4.2). */
export function windowsOutsideBhadra(
  windows: RawMuhuratWindow[],
  bhadra: { start: Date; end: Date | null } | null
): RawMuhuratWindow[] {
  if (!bhadra) return windows;
  if (!bhadra.end) return []; // open-ended: Phase-1 whole-day fallback
  const end = bhadra.end.getTime();
  return windows.filter((w) => w.end.getTime() <= bhadra.start.getTime() || w.start.getTime() >= end);
}

/**
 * The SEASONAL bars — the ones an abujh day lifts (PRD-16 §4.2, RULEBOOK
 * §17.8). अबूझ days are auspicious in their entirety, so the season-long bars
 * (Chaturmas, the masa tables, Guru/Shukra asta) yield to them; the per-day
 * doshas (rikta, panchak, bhadra, …) still apply. This narrow line is an
 * interpolation, not a sourced rule — the §10 review may move it.
 */
const SEASONAL_DOSHAS: ReadonlySet<DoshaKey> = new Set<DoshaKey>(['chaturmas', 'masa', 'guru-asta', 'shukra-asta']);

/**
 * Grade one civil day for one occasion (PRD-16; Phase 2 = TRD-16/P2 §2).
 *
 * Two passes:
 *  1. DAY pass — doshas that hold from sunrise to sunset (masa, chaturmas,
 *     adhik, yoga flags, asta). Any hit ⇒ excluded outright.
 *  2. WINDOW pass — bhadra-overlapped windows dropped, then each surviving
 *     window graded on the anga prevailing AT ITS START (kshaya-aware) plus
 *     the anga doshas at that instant. The day's tier is the best window's.
 *
 * `opts.abujh` lifts the SEASONAL bars only (chaturmas, masa, asta) — the
 * narrow reading recorded in RULEBOOK §17.8; per-window doshas still apply.
 */
export function evaluateDay(
  rule: EventRule,
  dateMs: number,
  weekday: number,
  p: PanchangData,
  m: MuhuratDay,
  asta: { shukraAsta: boolean; guruAsta: boolean },
  opts?: { abujh?: boolean }
): DayVerdict {
  const sunriseAnga = { nakshatraIndex: p.nakshatra.index, tithiIndex: p.tithi.index };
  const bhadra = rule.doshas.includes('bhadra') ? bhadraInterval(p) : null;
  const sunriseFactors = {
    nakshatra: rule.nakshatras.includes(p.nakshatra.index),
    tithi: rule.tithis.includes(p.tithi.index),
    vara: rule.varas.includes(weekday),
  };
  const base = {
    dateMs,
    sunriseAnga,
    bhadra: bhadra && bhadra.end ? { start: bhadra.start, end: bhadra.end } : null,
  };

  // ── pass 1: day-level ──
  const dayDoshaList = dayLevelDoshas(rule, p, asta)
    .filter((d) => rule.doshas.includes(d) || d === 'masa')
    .filter((d) => !(opts?.abujh && SEASONAL_DOSHAS.has(d)));
  if (dayDoshaList.length > 0) {
    return { ...base, tier: 'excluded', factors: sunriseFactors, doshas: dayDoshaList, windows: [] };
  }

  // ── pass 2: per-window ──
  const candidates = windowsOutsideBhadra(auspiciousWindows(m), bhadra);
  const graded: MuhuratWindow[] = [];
  const failedDoshas = new Set<DoshaKey>();
  for (const w of candidates) {
    const tithiIndex = angaAt(p.tithi, p.kshayaTithi, w.start, 30);
    const nakshatraIndex = angaAt(p.nakshatra, p.kshayaNakshatra, w.start, 27);
    const wDoshas = angaDoshas(tithiIndex, nakshatraIndex).filter((d) => rule.doshas.includes(d));
    if (wDoshas.length > 0) {
      for (const d of wDoshas) failedDoshas.add(d);
      continue;
    }
    const factors = {
      nakshatra: rule.nakshatras.includes(nakshatraIndex),
      tithi: rule.tithis.includes(tithiIndex),
      vara: rule.varas.includes(weekday),
    };
    const ok = Number(factors.nakshatra) + Number(factors.tithi) + Number(factors.vara);
    let tier: Exclude<MuhuratTier, 'excluded'>;
    if (ok === 3) tier = 'shreshtha';
    else if (ok === 2 && !rule.avoidVaras.includes(weekday)) tier = 'madhyam';
    else continue; // this window fails on factors — not offered
    graded.push({
      ...w,
      tier,
      factors,
      angaAtWindow:
        tithiIndex === sunriseAnga.tithiIndex && nakshatraIndex === sunriseAnga.nakshatraIndex
          ? null
          : { nakshatraIndex, tithiIndex },
    });
  }

  if (graded.length === 0) {
    // Excluded via the window pass. Name the reasons honestly: anga doshas that
    // ate windows, and bhadra when it removed windows and nothing survived.
    const doshas = [...failedDoshas];
    if (bhadra && candidates.length < auspiciousWindows(m).length) doshas.push('bhadra');
    return { ...base, tier: 'excluded', factors: sunriseFactors, doshas, windows: [] };
  }

  // Best-first: shreshtha windows lead; within a tier the priority order from
  // auspiciousWindows is preserved (stable sort).
  const rank = (t: MuhuratTier) => (t === 'shreshtha' ? 0 : 1);
  graded.sort((a, b) => rank(a.tier) - rank(b.tier));
  return { ...base, tier: graded[0].tier, factors: graded[0].factors, doshas: [], windows: graded };
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
