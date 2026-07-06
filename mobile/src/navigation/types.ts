import type { ContentCategory, Deity } from '@/data/texts';

export type TabParamList = {
  HomeTab: undefined;
  DailyBhaktiTab: { sourceId?: string; chapter?: number; verseIndex?: number } | undefined;
  PanchangTab: undefined;
  // Dedicated audio library + media player.
  AudioTab: undefined;
  MoreTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  CategoryList: { categoryId: ContentCategory };
  DeityList: { deityId: Deity };
  DeityIndex: undefined;
  ChalisaReader: { initialIndex?: number; chalisaId?: string } | undefined;
  GitaChapters: undefined;
  GitaReader: { chapter: number; initialIndex?: number };
  SundarkandChapters: undefined;
  SundarkandReader: { chapter: number; initialIndex?: number };
  ShivaStrotamChapters: undefined;
  ShivaStrotamReader: { chapter: number; initialIndex?: number };
  DurgaStotramChapters: undefined;
  DurgaStotramReader: { chapter: number; initialIndex?: number };
  SaraswatiStotramChapters: undefined;
  SaraswatiStotramReader: { chapter: number; initialIndex?: number };
  GaneshStotramChapters: undefined;
  GaneshStotramReader: { chapter: number; initialIndex?: number };
  VishnuSahasranamaChapters: undefined;
  VishnuSahasranamaReader: { chapter: number; initialIndex?: number };
  HanumanAshtakChapters: undefined;
  HanumanAshtakReader: { chapter: number; initialIndex?: number };
  KrishnaStotramChapters: undefined;
  KrishnaStotramReader: { chapter: number; initialIndex?: number };
  BajrangBaanChapters: undefined;
  BajrangBaanReader: { chapter: number; initialIndex?: number };
  RamStutiChapters: undefined;
  RamStutiReader: { chapter: number; initialIndex?: number };
  RamcharitmanasChapters: undefined;
  RamcharitmanasReader: { chapter: number; initialIndex?: number };
  AartiReader: { aartiIndex: number; initialIndex?: number };
  SanskarReader: { sanskarId: string; initialIndex?: number };
  JapamCounter: { mantraId: string; autoPlay?: boolean };
  VratKathaReader: { kathaId: string };
  // No params → Pilgrimage listing (By Category / By State). `group` or
  // `stateEn` → drilled-in map + flat single-subsection list (PRD-08).
  TheerthMap: { group?: string; stateEn?: string } | undefined;
  TheerthDetail: { templeId: string };
  // Daily Routine (नित्य साधना) — PRD-07
  RoutineToday: undefined;
  RoutineList: undefined;
  RoutineCreate: undefined;
  RoutineDetail: { routineId: string };
  RoutineAddItems: { routineId: string };
  // Sadhana Programs (संकल्प) — PRD-11. Reached via the create-routine fork.
  SadhanaPrograms: undefined;
  SadhanaProgramDetail: { programId: string };
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Wishlist: undefined;
  Profile: undefined;
  Reminders: undefined;
  JapamAlarms: undefined;
};

// Panchang tab stack — the date-first calendar plus the "Vrat & Parv" (व्रत-पर्व)
// catalog journey (PRD-09). PanchangHome hosts the [Calendar | Vrat & Parv] segment.
export type PanchangStackParamList = {
  PanchangHome: undefined;
  ObservanceList: { category: 'vrat' | 'festival' | 'upavas' };
  ObservanceDetail: { ruleId: string };
  KathaLibrary: undefined;
  MyVrat: undefined;
  // Daily Muhurat detail (Choghadiya / Rahu Kaal / Abhijit) — PRD-14
  MuhuratDetail: { dateMs: number };
};

// Audio tab stack (prototype 'tab'/'both' entry styles). The now-playing
// surface is a root overlay, not a route, so the stack only hosts the library.
export type AudioStackParamList = {
  AudioLibrary: undefined;
};

/** @deprecated Use HomeStackParamList instead */
export type RootStackParamList = HomeStackParamList;
