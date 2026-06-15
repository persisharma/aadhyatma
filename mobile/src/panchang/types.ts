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

export type ObservanceCategory = 'festival' | 'vrat';

export type ObservanceRule = {
  id: string;
  nameHi: string;
  nameEn: string;
  category: ObservanceCategory;
  type?: 'lunar' | 'solar';
  lunarMonth: number;
  paksha: Paksha;
  tithi: number;
  solarLongitude?: number;
  marker: FestivalMarker;
  deityHi: string;
  deityEn: string;
  shortDescriptionHi: string;
  shortDescriptionEn: string;
  linkSectionId?: string;
  articleId?: string;
  detailRoute?: string;
};

export type ResolvedObservance = {
  date: Date;
  rule: ObservanceRule;
};

export type FestivalRule = ObservanceRule;
export type ResolvedFestival = ResolvedObservance;
