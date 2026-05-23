export type Paksha = 'shukla' | 'krishna';

export type PanchangElement = {
  index: number;
  nameHi: string;
  nameEn: string;
  endTime: Date | null;
};

export type PanchangData = {
  date: Date;
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

export type FestivalRule = {
  id: string;
  nameHi: string;
  nameEn: string;
  type?: 'lunar' | 'solar';
  lunarMonth: number;
  paksha: Paksha;
  tithi: number;
  solarLongitude?: number;
  marker: FestivalMarker;
  linkSectionId?: string;
};

export type ResolvedFestival = {
  date: Date;
  rule: FestivalRule;
};
