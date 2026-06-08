import type { ContentCategory, Deity } from '@/data/texts';

export type TabParamList = {
  HomeTab: undefined;
  DailyBhaktiTab: undefined;
  PanchangTab: undefined;
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
  JapamCounter: { mantraId: string };
  // Daily Routine (नित्य साधना) — PRD-07
  RoutineToday: undefined;
  RoutineList: undefined;
  RoutineCreate: undefined;
  RoutineDetail: { routineId: string };
  RoutineAddItems: { routineId: string };
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Wishlist: undefined;
  Profile: undefined;
  Reminders: undefined;
};

/** @deprecated Use HomeStackParamList instead */
export type RootStackParamList = HomeStackParamList;
