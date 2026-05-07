import type { ContentCategory, Deity } from '@/data/texts';

export type TabParamList = {
  HomeTab: undefined;
  DailyBhaktiTab: undefined;
  MoreTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CategoryList: { categoryId: ContentCategory };
  DeityList: { deityId: Deity };
  DeityIndex: undefined;
  ChalisaReader: { initialIndex?: number } | undefined;
  GitaChapters: undefined;
  GitaReader: { chapter: number; initialIndex?: number };
  SundarkandChapters: undefined;
  SundarkandReader: { chapter: number; initialIndex?: number };
  ShivaStrotamChapters: undefined;
  ShivaStrotamReader: { chapter: number; initialIndex?: number };
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Wishlist: undefined;
};

/** @deprecated Use HomeStackParamList instead */
export type RootStackParamList = HomeStackParamList;
