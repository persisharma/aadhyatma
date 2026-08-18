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
