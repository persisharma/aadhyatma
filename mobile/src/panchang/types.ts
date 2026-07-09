export type Paksha = 'shukla' | 'krishna';

export type CalendarSystem = 'purnimant' | 'amanta';

export type GeoLocation = {
  latitude: number;
  longitude: number;
  elevation: number;
};

export type LocationSource = 'default' | 'city' | 'gps';

export type PanchangLocation = GeoLocation & {
  // Always the id of a bundled city (see locations.ts) — GPS fixes are snapped
  // to the nearest bundled city so cache keys stay finite and labels work offline.
  cityId: string;
  labelHi: string;
  labelEn: string;
  source: LocationSource;
};

export type PanchangComputationOptions = {
  calendarSystem?: CalendarSystem;
  // Omitted ⇒ Ujjain (the historical default; precomputed observance tables assume it).
  location?: GeoLocation & { cityId?: string };
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
  // Kshaya (skipped) tithi: begins after this day's sunrise and ends before the
  // next sunrise, so it is the sunrise-tithi of no civil day. Null on normal days.
  // Its start instant is tithi.endTime; its endTime is always non-null.
  kshayaTithi: (PanchangElement & { paksha: Paksha }) | null;
  nakshatra: PanchangElement;
  yoga: PanchangElement;
  karana: PanchangElement;
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
