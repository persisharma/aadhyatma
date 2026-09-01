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
import { lagnaAt, type LagnaSpan } from './lagnaSweep';
import { horaForDay, horaAt, BENEFIC_HORA, type HoraRuler } from './hora';

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
  | 'swarna'
  // Phase 3 (PRD-16/P3 §4.6): the 13th occasion, with दिशा शूल.
  | 'yatra';

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
  | 'shukra-asta'
  | 'disha-shool';

/** The eight travel directions the यात्रा picker offers (PRD-16/P3 §4.6). */
export type DishaDirection =
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'north'
  | 'northeast';

export const DISHA_ORDER: readonly DishaDirection[] = [
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
  'north',
  'northeast',
];

export const DISHA_LABELS: Readonly<Record<DishaDirection, { hi: string; en: string }>> = {
  east: { hi: 'पूर्व', en: 'East' },
  southeast: { hi: 'आग्नेय', en: 'South-East' },
  south: { hi: 'दक्षिण', en: 'South' },
  southwest: { hi: 'नैऋत्य', en: 'South-West' },
  west: { hi: 'पश्चिम', en: 'West' },
  northwest: { hi: 'वायव्य', en: 'North-West' },
  north: { hi: 'उत्तर', en: 'North' },
  northeast: { hi: 'ईशान', en: 'North-East' },
};

/**
 * दिशा शूल — the vara-keyed barred CARDINAL direction, 0 = Sunday
 * (Sun/Fri → पश्चिम, Mon/Sat → पूर्व, Tue/Wed → उत्तर, Thu → दक्षिण).
 * ⚠ CONTENT — DRAFT rows pinned in docs/roadmap/conventions/muhurat-lagna-v1.md
 * pending §10 two-source review; intercardinal directions carry no shool in v1
 * (a recorded variant choice, same doc).
 */
export const DISHA_SHOOL_BY_VARA: readonly DishaDirection[] = [
  'west',
  'east',
  'north',
  'north',
  'south',
  'west',
  'east',
];

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

/**
 * Per-occasion lagna preference (PRD-16/P3 §4.4). Indices are 0-based rashis
 * (0 = Mesha … 11 = Meena). A PREFERRED lagna is a tie-break + evidence word;
 * a BARRED lagna demotes a shreshtha segment to madhyam — it never excludes a
 * day by itself (variant choice recorded in muhurat-lagna-v1.md).
 * ⚠ CONTENT — all tables ship EMPTY (grading inert; the lagna chip still
 * renders) until the §10 two-source review lands the muhurat-lagna-v1.md
 * candidate rows. Pinned by test.
 */
export type LagnaRule = {
  preferred: readonly number[];
  barred: readonly number[];
};

const NO_LAGNA_RULE: LagnaRule = { preferred: [], barred: [] };

export type EventRule = {
  id: OccasionId;
  nameHi: string;
  nameEn: string;
  group: OccasionGroup;
  /** Masa shuddhi (Phase 2). DRAFT content, same §10 gate as the anga tables. */
  masa: MasaRule;
  /** Lagna preference (Phase 3). DRAFT — ships empty until §10 (see LagnaRule). */
  lagna: LagnaRule;
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
  /** Phase 3: `lagna` = preferred-lagna match (false while the tables are empty DRAFT). */
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean; lagna: boolean };
  /** The angas during THIS window, when they differ from sunrise; else null. */
  angaAtWindow: { nakshatraIndex: number; tithiIndex: number } | null;
  /**
   * Phase 3: the lagna span this segment sits in (0-based rashi). Splitting
   * guarantees one span covers the whole segment. Null only on the legacy
   * no-spans path (a caller that passed no `lagnas` — the §4.2 fallback).
   */
  lagnaRashiIndex: number | null;
  /** Phase 3: the hora at the segment start — EVIDENCE and tie-break only. */
  horaRuler: HoraRuler | null;
  /** Phase 3: the parent window's kind when this segment came from a split. */
  splitFrom: 'choghadiya' | 'abhijit' | null;
};

export type DayVerdict = {
  dateMs: number;
  tier: MuhuratTier;
  /** Best window's factors; sunrise factors (lagna false) when the day is excluded. */
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean; lagna: boolean };
  doshas: DoshaKey[];
  /** Qualifying windows (kaal + bhadra removed, split + window-graded), best first; empty when excluded. */
  windows: MuhuratWindow[];
  /** Sunrise anga, retained: the almanac reading the Panchang tab shows. */
  sunriseAnga: { nakshatraIndex: number; tithiIndex: number };
  /**
   * Bhadra as an interval — sunrise-Vishti (sunrise → karana end) or the
   * Phase-3 late-onset Vishti (karana end → its own end); else null.
   */
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
const VISHTI_KARANA_INDEX = 6; // भद्रा — sunrise interval (Phase 2) + late-onset via p.lateVishti (Phase 3).
const PANCHAK_FIRST = 22; // Dhanishta … Revati (coarse: whole-nakshatra, not half-Dhanishta).

const GENERAL_GOOD_TITHIS = [1, 2, 4, 6, 9, 10, 12, 14, 16, 17, 19, 21, 24, 25, 27] as const;
const DP = 'https://www.drikpanchang.com/shubh-dates/';
const DHARMA_SINDHU_SAMSKARAS = 'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=17';
const DHARMA_SINDHU_UPANAYANA = 'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=18';
const MUHURTA_RAMAN = 'https://lakshminarayanlenasia.com/articles/muhurta.pdf';
const DRAFT = (page: string, notes: string, extraUrls: readonly string[] = []) =>
  ({ convention: 'drikpanchang', verified: false, referenceUrls: [DP + page, ...extraUrls], notes } as const);

export const EVENT_RULES: readonly EventRule[] = [
  {
    id: 'griha-pravesh',
    group: 'bhavan',
    masa: { preferred: [11, 12, 2, 3], barred: [] },
    lagna: NO_LAGNA_RULE,
    nameHi: 'गृह प्रवेश',
    nameEn: 'Griha Pravesh',
    nakshatras: [3, 4, 11, 13, 16, 20, 22, 25, 26],
    tithis: [1, 2, 4, 6, 9, 10, 12, 14, 16, 17, 19, 21, 24, 25, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'panchak', 'adhik', 'vyatipata', 'vaidhriti', 'chaturmas', 'guru-asta', 'shukra-asta'],
    source: DRAFT(
      'griha-pravesh-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending complete golden coverage. DrikPanchang publishes the city/year result set and states that Nakshatra, weekday, Tithi, lunar month, Guru/Shukra Asta and Adhik Masa are applied. B. V. Raman, Muhurtha ch. XI (printed pp. 68–69) independently supplies the house-entry rule family. Nov-2026 output matched published lists on 11/25/26 Nov (PRD-16 validation).',
      [MUHURTA_RAMAN]
    ),
  },
  {
    id: 'vahan',
    group: 'arambh',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nameHi: 'वाहन क्रय',
    nameEn: 'Vehicle Purchase',
    nakshatras: [0, 3, 4, 6, 7, 12, 13, 14, 16, 22, 23, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'vehicle-buying-auspicious-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending a second rule-table source and city/year goldens. Replaces the obsolete vehicle-purchase slug with the live published page.'
    ),
  },
  {
    id: 'namkaran',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nameHi: 'नामकरण',
    nameEn: 'Naming Ceremony',
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 22, 23, 25, 26],
    tithis: [0, 1, 2, 4, 6, 9, 10, 12, 15, 16, 17, 19, 21, 24, 25, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'sanskara/namakarana/namakarana-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. The table is the conservative DrikPanchang + Dharma Sindhu ch. 17 + B. V. Raman (printed p. 29) intersection: Chitra and both Dwadashis are omitted where the sources diverge.',
      [DHARMA_SINDHU_SAMSKARAS, MUHURTA_RAMAN]
    ),
  },
  {
    id: 'vidyarambh',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nameHi: 'विद्यारम्भ',
    nameEn: 'Starting Education',
    nakshatras: [0, 4, 5, 6, 7, 12, 13, 14, 16, 21, 22, 23, 26],
    tithis: [1, 2, 4, 9, 10, 16, 17, 19, 24, 25],
    varas: [3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'sanskara/education/vidyarambha/vidyarambha-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. Nakshatra and Tithi arrays use the conservative intersection of DrikPanchang and Dharma Sindhu ch. 17.',
      [DHARMA_SINDHU_SAMSKARAS]
    ),
  },
  {
    id: 'bhumi-pujan',
    group: 'bhavan',
    masa: { preferred: [11, 12, 2, 3], barred: [] },
    lagna: NO_LAGNA_RULE,
    nameHi: 'भूमि पूजन',
    nameEn: 'Bhumi Pujan',
    nakshatras: [3, 4, 6, 7, 11, 12, 13, 16, 20, 21, 22, 25, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'panchak', 'adhik', 'vyatipata', 'vaidhriti', 'chaturmas', 'guru-asta', 'shukra-asta'],
    source: {
      convention: 'drikpanchang',
      verified: false,
      referenceUrls: [MUHURTA_RAMAN],
      notes: 'SOURCED 2026-08-19, verification remains false pending a second authoritative table and goldens. The recorded DrikPanchang top-level slug returns 404 and no replacement dedicated page was found, so it was removed instead of being replaced with a guessed URL. B. V. Raman, Muhurtha ch. X (printed pp. 65–66), is the currently opened foundation-laying rule family.',
    },
  },
  {
    id: 'vyapar',
    group: 'arambh',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nameHi: 'व्यापार आरम्भ',
    nameEn: 'Starting a Business',
    nakshatras: [0, 3, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'business-opening-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. B. V. Raman, Muhurtha ch. VIII (printed pp. 58–59), is the independent rule-family source.',
      [MUHURTA_RAMAN]
    ),
  },
  // ── Phase 2 occasions (PRD-16 §4.3, TRD-16/P2 §4.4). All DRAFT pending §10. ──
  {
    id: 'mundan',
    nameHi: 'मुंडन',
    nameEn: 'Mundan',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nakshatras: [0, 4, 6, 7, 12, 13, 14, 17, 21, 22, 23],
    tithis: [1, 2, 4, 6, 9, 10, 12, 16, 17, 19, 21, 24, 25, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'sanskara/mundana/mundana-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. DrikPanchang and Dharma Sindhu ch. 17 agree on the Nakshatra set; Purnima was removed from the generic Tithi set because neither source admits it for Chudakarana.',
      [DHARMA_SINDHU_SAMSKARAS, MUHURTA_RAMAN]
    ),
  },
  {
    id: 'annaprashan',
    nameHi: 'अन्नप्राशन',
    nameEn: 'Annaprashan',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
    tithis: [1, 2, 4, 6, 9, 12, 16, 17, 19, 21, 24, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'sanskara/annaprashana/annaprashana-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. Nakshatras and Tithis use the conservative DrikPanchang + Dharma Sindhu ch. 17 + B. V. Raman (printed pp. 29–30) intersection; Dwadashi and Purnima were removed from the earlier draft. Age-window guidance (6th/8th month) is caption copy only — the finder scans its normal horizon.',
      [DHARMA_SINDHU_SAMSKARAS, MUHURTA_RAMAN]
    ),
  },
  {
    id: 'karnavedha',
    nameHi: 'कर्णवेध',
    nameEn: 'Karnavedha',
    group: 'sanskar',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nakshatras: [0, 4, 6, 7, 12, 13, 21, 22, 26],
    tithis: [1, 2, 4, 5, 6, 9, 11, 12, 16, 17, 19, 20, 21, 24, 26, 27],
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'sanskara/karnavedha/karnavedha-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. Arrays use the conservative DrikPanchang + Dharma Sindhu ch. 17 + B. V. Raman (printed p. 30) intersection; Ashwini was added and Swati/Anuradha removed from the earlier draft.',
      [DHARMA_SINDHU_SAMSKARAS, MUHURTA_RAMAN]
    ),
  },
  {
    id: 'upanayana',
    nameHi: 'उपनयन',
    nameEn: 'Upanayana',
    group: 'sanskar',
    // The one populated masa bar (PRD: "stricter; Chaturmas-barred"): the
    // conservative lunar window is Magha–Vaisakha; Ashadha–Pausha are barred
    // beyond the separate Chaturmas day rule. DRAFT — the sharpest §10 review target.
    masa: { preferred: [11, 12, 1, 2], barred: [4, 5, 6, 7, 8, 9, 10] },
    lagna: NO_LAGNA_RULE,
    nakshatras: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26],
    tithis: [1, 2, 4, 9, 16, 17],
    varas: [3, 4, 5],
    avoidVaras: [0, 2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'panchak', 'adhik', 'vyatipata', 'vaidhriti', 'chaturmas', 'guru-asta', 'shukra-asta'],
    source: DRAFT(
      'sanskara/upanayana/upanayana-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending city/year goldens. This conservative table intersects DrikPanchang, Dharma Sindhu ch. 18 and B. V. Raman (printed pp. 31–32): Magha–Vaisakha lunar months, Wed/Thu/Fri, and the common Tithis. The sources mix solar- and lunar-month wording, so that convention choice is recorded rather than hidden.',
      [DHARMA_SINDHU_UPANAYANA, MUHURTA_RAMAN]
    ),
  },
  {
    id: 'sampatti',
    nameHi: 'सम्पत्ति क्रय',
    nameEn: 'Property Purchase',
    group: 'arambh',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nakshatras: [3, 4, 6, 7, 11, 12, 13, 16, 20, 21, 22, 25, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'property-registration-auspicious-dates.html',
      'SOURCED 2026-08-19, verification remains false pending table reconciliation and city/year goldens. Replaces the obsolete property-purchase slug; B. V. Raman, Muhurtha ch. XII (printed pp. 70–71), is the independent property rule-family source.',
      [MUHURTA_RAMAN]
    ),
  },
  {
    id: 'swarna',
    nameHi: 'स्वर्ण क्रय',
    nameEn: 'Gold Purchase',
    group: 'arambh',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    nakshatras: [0, 3, 6, 7, 11, 12, 13, 20, 21, 25, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti'],
    source: DRAFT(
      'gold-purchase-dates-with-muhurat.html',
      'SOURCED 2026-08-19, verification remains false pending table reconciliation and city/year goldens. B. V. Raman, Muhurtha ch. VIII (printed p. 58), supplies the independent buying-jewellery rule family. Overlap with abujh days is intentional.',
      [MUHURTA_RAMAN]
    ),
  },
  // ── Phase 3 occasion (PRD-16/P3 §4.6): यात्रा completes parent §4.3. ──
  {
    id: 'yatra',
    nameHi: 'यात्रा',
    nameEn: 'Travel',
    group: 'arambh',
    masa: NO_MASA_RULE,
    lagna: NO_LAGNA_RULE,
    // Classical laghu/kshipra travel set: Ashwini, Mrigashira, Punarvasu,
    // Pushya, Hasta, Anuradha, Shravana, Dhanishta, Revati. DRAFT.
    nakshatras: [0, 4, 6, 7, 12, 16, 21, 22, 26],
    tithis: GENERAL_GOOD_TITHIS,
    varas: [1, 3, 4, 5],
    avoidVaras: [2, 6],
    doshas: ['rikta', 'amavasya', 'bhadra', 'adhik', 'vyatipata', 'vaidhriti', 'disha-shool'],
    source: {
      convention: 'drikpanchang',
      verified: false,
      referenceUrls: [DP],
      notes:
        'DRAFT §10 pending — the exact published-list page slug is unverified (authored without content egress). ' +
        'दिशा शूल rows and the intercardinal variant choice are pinned in docs/roadmap/conventions/muhurat-lagna-v1.md. ' +
        'No destination geocoding, no Chandra-vasa in v1 (PRD-16/P3 §14).',
    },
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
  // The UI appends the chosen direction's name (the reason must NAME the
  // direction — PRD-16/P3 §4.6); the engine label stays direction-free.
  'disha-shool': { hi: 'दिशा शूल', en: 'Disha Shool' },
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
 *
 * Phase 3 (PRD-16/P3 §0.3): a Vishti that STARTS during the day — the karana
 * after the sunrise karana — is solved by the engine into `p.lateVishti` and
 * returned here, so an afternoon Bhadra removes windows exactly like a
 * sunrise one. `?? null` keeps a pre-v3 cached day (no such field) defensive.
 */
export function bhadraInterval(p: PanchangData): { start: Date; end: Date | null } | null {
  if (p.karana.index === VISHTI_KARANA_INDEX) return { start: p.sunrise, end: p.karana.endTime };
  return p.lateVishti ?? null;
}

const AUSPICIOUS_CHOGHADIYA = new Set<ChoghadiyaPeriod['key']>(['labh', 'amrit', 'shubh', 'char']);

/** A window before grading — what `auspiciousWindows` yields. */
export type RawMuhuratWindow = Omit<
  MuhuratWindow,
  'tier' | 'factors' | 'angaAtWindow' | 'lagnaRashiIndex' | 'horaRuler' | 'splitFrom'
>;

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
 * Minimum usable segment length after splitting — ~1 ghatika (PRD-16/P3 §4.3).
 * Shorter split parts are DROPPED, never clipped or merged — the same doctrine
 * as kaal slots and bhadra. This also settles the boundary-within-minutes-of-
 * window-start edge case: the leading sliver falls under the floor and the
 * window effectively starts at the boundary (no hysteresis — the rule is
 * length, not distance).
 */
export const MIN_SEGMENT_MINUTES = 24;
const MIN_SEGMENT_MS = MIN_SEGMENT_MINUTES * 60_000;

/**
 * Grade one civil day for one occasion (PRD-16; Phase 2 = TRD-16/P2 §2,
 * Phase 3 = PRD-16/P3 §4.3).
 *
 * Two passes:
 *  1. DAY pass — doshas that hold from sunrise to sunset (masa, chaturmas,
 *     adhik, yoga flags, asta, and — for यात्रा with a chosen direction — the
 *     vara-keyed दिशा शूल). Any hit ⇒ excluded outright.
 *  2. WINDOW pass — bhadra-overlapped windows dropped, then each survivor is
 *     SPLIT at every lagna boundary and every anga (tithi/nakshatra)
 *     changeover inside it; sub-24-minute parts are dropped; each remaining
 *     segment is graded on the anga prevailing at ITS start (kshaya-aware)
 *     plus the anga doshas at that instant, plus the lagna factor from the
 *     one span that now covers the whole segment. The day's tier is the best
 *     segment's. This resolves TRD-16/P2 §4.1's "graded at start, flagged"
 *     deferral — the segment IS the window.
 *
 * Lagna rule (§4.3): श्रेष्ठ requires all three anga factors AND a non-barred
 * lagna; a barred lagna demotes to मध्यम (never excludes a day by itself); a
 * PREFERRED lagna is a tie-break + evidence word. Hora is EVIDENCE and
 * tie-break only — it never moves a tier (RULEBOOK §17).
 *
 * `opts.abujh` lifts the SEASONAL bars only (chaturmas, masa, asta) — the
 * narrow reading recorded in RULEBOOK §17.8; per-window doshas still apply.
 * `opts.lagnas` are the day's spans from `DayInputs`; when absent (legacy
 * callers — the §4.2 fallback) no lagna splitting happens and the lagna
 * factor is inert. `opts.direction` is यात्रा's chosen travel direction —
 * scan-time input only, never persisted.
 */
export function evaluateDay(
  rule: EventRule,
  dateMs: number,
  weekday: number,
  p: PanchangData,
  m: MuhuratDay,
  asta: { shukraAsta: boolean; guruAsta: boolean },
  opts?: { abujh?: boolean; lagnas?: readonly LagnaSpan[]; direction?: DishaDirection }
): DayVerdict {
  const sunriseAnga = { nakshatraIndex: p.nakshatra.index, tithiIndex: p.tithi.index };
  const bhadra = rule.doshas.includes('bhadra') ? bhadraInterval(p) : null;
  const sunriseFactors = {
    nakshatra: rule.nakshatras.includes(p.nakshatra.index),
    tithi: rule.tithis.includes(p.tithi.index),
    vara: rule.varas.includes(weekday),
    lagna: false,
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
  if (
    rule.doshas.includes('disha-shool') &&
    opts?.direction &&
    DISHA_SHOOL_BY_VARA[weekday] === opts.direction
  ) {
    dayDoshaList.push('disha-shool');
  }
  if (dayDoshaList.length > 0) {
    return { ...base, tier: 'excluded', factors: sunriseFactors, doshas: dayDoshaList, windows: [] };
  }

  // ── pass 2: split-and-grade per window ──
  // Splits run over windows AFTER kaal/bhadra removal, so a boundary landing
  // inside a removed interval is unreachable by construction (§13).
  const spans = opts?.lagnas && opts.lagnas.length > 0 ? opts.lagnas : null;
  const horas = horaForDay(m.sunrise, m.sunset, m.nextSunrise, weekday);
  const candidates = windowsOutsideBhadra(auspiciousWindows(m), bhadra);
  const graded: MuhuratWindow[] = [];
  const failedDoshas = new Set<DoshaKey>();
  for (const w of candidates) {
    const startMs = w.start.getTime();
    const endMs = w.end.getTime();
    // Boundaries strictly inside the window: anga changeovers (kshaya ends
    // included — the skipped anga inserts its own segment, §13) and lagna
    // span starts.
    const cuts = new Set<number>();
    const addCut = (d: Date | null | undefined) => {
      if (!d) return;
      const t = d.getTime();
      if (t > startMs && t < endMs) cuts.add(t);
    };
    addCut(p.tithi.endTime);
    addCut(p.kshayaTithi?.endTime);
    addCut(p.nakshatra.endTime);
    addCut(p.kshayaNakshatra?.endTime);
    if (spans) for (const s of spans) addCut(s.start);
    const edges = [startMs, ...[...cuts].sort((a, b) => a - b), endMs];
    const splitFrom = cuts.size > 0 ? w.kind : null;

    for (let i = 0; i < edges.length - 1; i += 1) {
      if (edges[i + 1] - edges[i] < MIN_SEGMENT_MS) continue; // dropped, never clipped
      const segStart = new Date(edges[i]);
      const segEnd = new Date(edges[i + 1]);
      const tithiIndex = angaAt(p.tithi, p.kshayaTithi, segStart, 30);
      const nakshatraIndex = angaAt(p.nakshatra, p.kshayaNakshatra, segStart, 27);
      const segDoshas = angaDoshas(tithiIndex, nakshatraIndex).filter((d) => rule.doshas.includes(d));
      if (segDoshas.length > 0) {
        for (const d of segDoshas) failedDoshas.add(d);
        continue;
      }
      const lagnaRashiIndex = spans ? lagnaAt(spans, segStart) : null;
      const lagnaBarred = lagnaRashiIndex !== null && rule.lagna.barred.includes(lagnaRashiIndex);
      const factors = {
        nakshatra: rule.nakshatras.includes(nakshatraIndex),
        tithi: rule.tithis.includes(tithiIndex),
        vara: rule.varas.includes(weekday),
        lagna: lagnaRashiIndex !== null && rule.lagna.preferred.includes(lagnaRashiIndex),
      };
      const ok = Number(factors.nakshatra) + Number(factors.tithi) + Number(factors.vara);
      let tier: Exclude<MuhuratTier, 'excluded'>;
      if (ok === 3 && !lagnaBarred) tier = 'shreshtha';
      else if (ok === 3) tier = 'madhyam'; // barred lagna demotes, never excludes (§4.3)
      else if (ok === 2 && !rule.avoidVaras.includes(weekday)) tier = 'madhyam';
      else continue; // this segment fails on factors — not offered
      graded.push({
        kind: w.kind,
        nameHi: w.nameHi,
        nameEn: w.nameEn,
        start: segStart,
        end: segEnd,
        tier,
        factors,
        angaAtWindow:
          tithiIndex === sunriseAnga.tithiIndex && nakshatraIndex === sunriseAnga.nakshatraIndex
            ? null
            : { nakshatraIndex, tithiIndex },
        lagnaRashiIndex,
        horaRuler: horaAt(horas, segStart)?.ruler ?? null,
        splitFrom,
      });
    }
  }

  if (graded.length === 0) {
    // Excluded via the window pass. Name the reasons honestly: anga doshas that
    // ate windows, and bhadra when it removed windows and nothing survived.
    const doshas = [...failedDoshas];
    if (bhadra && candidates.length < auspiciousWindows(m).length) doshas.push('bhadra');
    return { ...base, tier: 'excluded', factors: sunriseFactors, doshas, windows: [] };
  }

  // Best-first: shreshtha segments lead; within a tier a PREFERRED lagna wins
  // (§4.3 — "distinguishes the best segment among equals"); then the window
  // priority from auspiciousWindows (Amrit → Abhijit → Shubh → rest) holds as
  // it has since Phase 1; a benefic hora (Guru/Shukra/Budh) breaks only the
  // remaining ties — TIE-break, not a reordering (§4.5): it must never move a
  // window past a higher-priority equal-tier one, let alone move a tier.
  // Within full ties the stable sort keeps time order.
  const rank = (t: MuhuratTier) => (t === 'shreshtha' ? 0 : 1);
  const lagnaRank = (x: MuhuratWindow) => (x.factors.lagna ? 0 : 1);
  const priorityRank = (x: MuhuratWindow) =>
    x.nameEn === 'Amrit' ? 0 : x.kind === 'abhijit' ? 1 : x.nameEn === 'Shubh' ? 2 : 3;
  const horaRank = (x: MuhuratWindow) => (x.horaRuler && BENEFIC_HORA.has(x.horaRuler) ? 0 : 1);
  graded.sort(
    (a, b) =>
      rank(a.tier) - rank(b.tier) ||
      lagnaRank(a) - lagnaRank(b) ||
      priorityRank(a) - priorityRank(b) ||
      horaRank(a) - horaRank(b)
  );
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
