export type Paksha = 'shukla' | 'krishna';

export type CalendarSystem = 'purnimant' | 'amanta';

export type GeoLocation = {
  latitude: number;
  longitude: number;
  elevation: number;
};

export type LocationSource = 'default' | 'city' | 'gps' | 'pincode';

export type PanchangLocation = GeoLocation & {
  // Either the id of a bundled city (see locations.ts) or `pin-<6 digits>` for a
  // pincode-resolved location (see pincodes.ts). GPS fixes are snapped to the
  // nearest pincode centroid, falling back to the nearest bundled city, so cache
  // keys stay finite and labels work offline in both cases.
  cityId: string;
  labelHi: string;
  labelEn: string;
  source: LocationSource;
};

export type PanchangComputationOptions = {
  calendarSystem?: CalendarSystem;
  // Omitted ⇒ Ujjain (the historical default; precomputed observance tables assume it).
  location?: GeoLocation & { cityId?: string };
  // Optional civil-date basis for callers that persist dated output. The normal
  // in-app Panchang keeps its historical device-local behaviour when omitted.
  civilTimeZone?: string;
};

export type PanchangElement = {
  index: number;
  nameHi: string;
  nameEn: string;
  endTime: Date | null;
};

export type PanchangData = {
  date: Date;
  calendarSystem: CalendarSystem;
  vara: { nameHi: string; nameEn: string; index: number };
  tithi: PanchangElement & { paksha: Paksha };
  // Kshaya (skipped) angas: begin after this day's sunrise and end before the
  // next sunrise, so they are the sunrise-anga of no civil day. Null on normal
  // days. Their start instant is the main anga's endTime; endTime is non-null.
  kshayaTithi: (PanchangElement & { paksha: Paksha }) | null;
  kshayaNakshatra: PanchangElement | null;
  nakshatra: PanchangElement;
  yoga: PanchangElement;
  karana: PanchangElement;
  // Late-onset Vishti (PRD-16/P3 §0.3): a Bhadra that STARTS after sunrise —
  // the karana following the sunrise karana is Vishti. Null when the sunrise
  // karana is itself Vishti (that interval is sunrise → karana.endTime) or when
  // no Vishti begins this day. start = karana.endTime; end is its solved end.
  lateVishti: { start: Date; end: Date } | null;
  sunrise: Date;
  sunset: Date;
  moonrise: Date | null;
  brahmaMuhurta: { start: Date; end: Date };
  vikramSamvat: number;
  lunarMonth: { nameHi: string; nameEn: string; index: number; isAdhik: boolean };
};

export type FestivalMarker = 'star' | 'dot' | 'halfmoon';

export type ObservanceCategory = 'festival' | 'vrat' | 'upavas' | 'katha' | 'regional';

export type ObservanceVisibility = 'default' | 'advanced' | 'regional';

export type ObservanceRuleType =
  | 'lunar-tithi'
  | 'solar-sankranti'
  | 'weekday-in-lunar-month'
  | 'relative-to-lunar'
  | 'nakshatra'
  | 'range'
  | 'catalog-only';

export type ObservanceRecurrence = 'annual' | 'monthly' | 'seasonal' | 'catalog';

export type ObservanceRelativeRule = 'friday-before-purnima';

/**
 * Which instant of the civil day the rule's tithi must cover for the day to BE
 * the observance day (the vyapini convention).
 *
 * - `udaya` — the tithi running at sunrise. The default, and right for the
 *   large majority: Ekadashi, Purnima, Amavasya, Navratri, Dussehra.
 * - `chandrodaya` — the tithi running at MOONRISE. Correct for vrats whose
 *   defining act is the evening moon that ends the fast: Sankashti Chaturthi,
 *   Karwa Chauth, Bahula Chaturthi. Their tithi typically begins mid-morning
 *   and ends before the next day's mid-morning, so the sunrise answer names
 *   the day AFTER the night on which the vrat is actually kept.
 * - `madhyahna` — the tithi running at MIDDAY (the sunrise–sunset midpoint).
 *   Correct where the defining worship happens at madhyahna: Ganesh Chaturthi
 *   (sthapana), Ram Navami (janma), monthly Vinayaka Chaturthi. When the tithi
 *   opens shortly after sunrise, the sunrise answer names the day AFTER the
 *   midday actually worshipped (Ganesh Chaturthi 2026: 15 Sep instead of 14).
 *
 * The remaining non-sunrise conventions (pradosh, nishita) are not modelled
 * yet — see `VERIFICATION.md` "±1-day muhurta shift".
 */
export type ObservanceDayRule = 'udaya' | 'chandrodaya' | 'madhyahna';

/**
 * Where a rule sits inside a multi-day festival arc (PRD-28, पर्व-अर्क).
 *
 * - `sthapana` — the day the deity is installed / the arc opens (Ganesh
 *   Chaturthi, Navratri ghatasthapana). Always ordinal 1.
 * - `day` — a named day inside the arc (each of Diwali's five days).
 * - `visarjan` — the day the rite is concluded and the murti immersed
 *   (Anant Chaturdashi for the ten-day Ganesh arc, Vijayadashami for
 *   Navratri). The arc's LAST rule-bound ordinal.
 *
 * The relation is purely additive: a rule's tithi, dayRule and every other
 * field are untouched, and a rule with no `arcId` behaves exactly as before.
 * The arc definitions themselves live in `arcs.ts`.
 */
export type ArcRole = 'sthapana' | 'day' | 'visarjan';

export type ObservanceRule = {
  id: string;
  nameHi: string;
  nameEn: string;
  category: ObservanceCategory;
  visibility: ObservanceVisibility;
  ruleType: ObservanceRuleType;
  recurrence: ObservanceRecurrence;
  type?: 'lunar' | 'solar';
  lunarMonth?: number;
  monthSystem?: CalendarSystem | 'both';
  paksha?: Paksha;
  tithi?: number;
  weekday?: number;
  nakshatra?: number;
  solarLongitude?: number;
  solarIngress?: number;
  relativeRule?: ObservanceRelativeRule;
  /**
   * Day-selection convention (vyapini). Absent means `udaya` — every rule that
   * does not say otherwise is fixed by the tithi at sunrise.
   */
  dayRule?: ObservanceDayRule;
  /**
   * Festival-arc membership (PRD-28) — optional and additive. `arcId` names an
   * `ArcDefinition` in `arcs.ts`; `arcRole` says what this day IS in the arc;
   * `arcOrdinal` is its 1-based position among the arc's rule-bound days when
   * the arc's calendar span is at its customary length (the live ordinal is
   * always recomputed from resolved dates — see `resolveArcOccurrence`).
   * All three are present together or absent together (`arcs.test.ts`).
   */
  arcId?: string;
  arcRole?: ArcRole;
  arcOrdinal?: number;
  marker: FestivalMarker;
  deityHi: string;
  deityEn: string;
  shortDescriptionHi: string;
  shortDescriptionEn: string;
  linkSectionId?: string;
  articleId?: string;
  detailRoute?: string;
  sourceUrl: string;
  kathaId?: string;
  /**
   * Published puja-vidhi hook (PRD-19) — id into VIDHI_BY_ID
   * (mobile/src/data/vidhi). Same mechanism as kathaId: the day panel's
   * ObservanceCard grows a "॥ पूजा विधि" action pill when this resolves.
   */
  vidhiId?: string;
  /**
   * Structured fasting-info hook (PRD-09 Phase 4) — id into the
   * `upvasContent/` registry (mobile/src/panchang/upvasContent). Same
   * mechanism as kathaId/vidhiId; many rules may share one entry (all
   * Ekadashis → 'ekadashi-upvas'). Resolves through `getUpvasInfo`, which
   * exposes VERIFIED entries only — a draft entry is indistinguishable from
   * no entry at every call site.
   */
  upvasId?: string;
  /**
   * Sourced bhog/naivedya/vrat-food hook (PRD-23) — id into the
   * `bhogContent` registry. The accessor exposes VERIFIED entries only, so a
   * draft profile is indistinguishable from no guidance at every surface.
   */
  bhogId?: string;
  searchTerms?: string[];
};

export type ResolvedObservance = {
  date: Date;
  rule: ObservanceRule;
};

export type KathaKind = 'vrat-katha' | 'festival-legend' | 'mahatmya';

export type KathaContentStatus =
  | 'source-link-only'
  | 'needs-original-content'
  | 'original-content-ready'
  | 'licensed-content-ready';

export type KathaLanguageAvailability = 'metadata-only' | 'hindi' | 'english' | 'bilingual';

export type KathaCatalogEntry = {
  id: string;
  nameHi: string;
  nameEn: string;
  kind: KathaKind;
  contentStatus: KathaContentStatus;
  languageAvailability: KathaLanguageAvailability;
  summaryHi: string;
  summaryEn: string;
  sourceUrl: string;
  sourceAttribution: string;
  relatedRuleIds: string[];
};

export type KathaContentSection = {
  id: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string[];
  bodyEn: string[];
};

export type KathaContentEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  contentStatus: KathaContentStatus;
  languageAvailability: KathaLanguageAvailability;
  sourceUrls?: string[];
  sourceNoteHi: string;
  sourceNoteEn: string;
  sections: KathaContentSection[];
};

export type FestivalRule = ObservanceRule;
export type ResolvedFestival = ResolvedObservance;

// ─── Structured upvas/fasting content (PRD-09 Phase 4) ──────────────────────

/** The fast's kind, rendered as the panel's headline chip. */
export type UpvasFastType = 'nirjala' | 'phalahar' | 'one-meal' | 'night-vigil';

export type UpvasWindowKind =
  | 'sunrise-to-next-sunrise'
  | 'sunrise-to-moonrise'
  | 'sunrise-to-parana'
  | 'day-and-night-vigil';

/**
 * How the parana (fast-breaking) rule renders. The verified TEXT is canonical
 * and always renders; a derived date/time line is added beneath it only for
 * the two machine-checkable kinds (see `upvasParana.ts`), and only when the
 * derivation is honest — never an invented time.
 */
export type UpvasParanaKind =
  | 'next-day-sunrise-tithi-bound' // computable: parana-day sunrise → boundTithi end
  | 'same-day-after-moonrise' // computable: the occurrence day's moonrise
  | 'text-only'; // the rule renders in words only, ever

export type UpvasParanaRule = {
  kind: UpvasParanaKind;
  /** 1–15 within the paksha; required iff kind === 'next-day-sunrise-tithi-bound'. */
  boundTithi?: number;
  /** The rule in words — ALWAYS present and always rendered. */
  textHi: string;
  textEn: string;
};

/**
 * Verification state (PRD-09/P4 §8). Entries enter the repo as 'draft' with a
 * dated `verificationNote`; `getUpvasInfo` exposes 'verified' only. Flipping to
 * 'verified' is a reviewed content change — two concordant published sources
 * per entry — never authorized by automation passing.
 */
export type UpvasContentStatus = 'draft' | 'verified';

export type UpvasInfoEntry = {
  id: string;
  fastType: UpvasFastType;
  /** One line beside the chip, e.g. "जल भी वर्जित" / "Even water is abstained". */
  fastTypeNoteHi: string;
  fastTypeNoteEn: string;
  window: {
    kind: UpvasWindowKind;
    /** Authored, verified — always what renders. */
    textHi: string;
    textEn: string;
  };
  parana?: UpvasParanaRule;
  /** Variants note: nirjala vs phalahar options, traditional exemptions. */
  strictnessHi: string;
  strictnessEn: string;
  whoObservesHi?: string;
  whoObservesEn?: string;
  status: UpvasContentStatus;
  /** Review metadata — never rendered. ≥2 reference URLs per entry. */
  source: { referenceUrls: string[]; verificationNote: string };
};

// ─── Bhog / naivedya / vrat-food guidance (PRD-23) ────────────────────────

export type BhogContentStatus = 'draft' | 'verified';

export type BhogGuidanceItem = {
  id: string;
  textHi: string;
  textEn: string;
};

export type BhogShoppingItem = {
  id: string;
  itemHi: string;
  itemEn: string;
  qty?: string;
  optional?: boolean;
};

/**
 * One independently reviewed food/offering profile. Eating rules and deity
 * offerings are deliberately separate fields: food allowed during a fast is
 * not automatically suitable naivedya, and an abhisheka ingredient is not
 * automatically food.
 */
export type BhogContentEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** ObservanceRule ids carrying this profile through `bhogId`. */
  observanceIds: string[];
  /** Published vidhis whose preparation screen reuses this guidance. */
  vidhiIds: string[];
  offerings: BhogGuidanceItem[];
  permittedDuringFast?: BhogGuidanceItem[];
  abstainedDuringFast?: BhogGuidanceItem[];
  doNotOffer?: BhogGuidanceItem[];
  paranaMealHi?: string;
  paranaMealEn?: string;
  traditionNoteHi: string;
  traditionNoteEn: string;
  /** Additive groceries; do not duplicate the vidhi's base samagri. */
  shoppingItems: BhogShoppingItem[];
  status: BhogContentStatus;
  /** Review-only provenance; never rendered. */
  source: {
    referenceUrls: string[];
    verificationNote: string;
    variantNote?: string;
  };
};
