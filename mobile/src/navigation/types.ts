import type { OccasionId } from '@/panchang/eventMuhurat';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ContentCategory, Deity } from '@/data/texts';
import type { PurposeId } from '@/data/purposes';

export type TabParamList = {
  // Nested-navigator params so cross-tab jumps (e.g. Pitru Smaran's गीता पाठ
  // links into the Gita reader) are type-checked.
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  DailyBhaktiTab: { sourceId?: string; chapter?: number; verseIndex?: number } | undefined;
  // Nested-navigator params so cross-tab jumps like
  // navigate('PanchangTab', { screen: 'ObservanceList', params: {...}, initial: false })
  // are type-checked instead of hidden behind `useNavigation<any>()`.
  PanchangTab: NavigatorScreenParams<PanchangStackParamList> | undefined;
  // Dedicated audio library + media player.
  AudioTab: undefined;
  // Nested params typed so the Panchang day chip can deep-link to a Pitru Smaran
  // detail (PRD-17) without an untyped navigator cast.
  MoreTab: NavigatorScreenParams<MoreStackParamList> | undefined;
};

/**
 * Guided puja flows (PRD-19). `dateMs` is the festival occurrence the vidhi was
 * opened for — the samagri checklist persists per that date.
 *
 * These three routes are registered on BOTH the Home stack and the Panchang
 * stack, and this shared type is the single source of truth for their params.
 * The duplication is deliberate: a vidhi journey has doors on both tabs (Home's
 * DISCOVER card, search rows and routine items; Panchang's Vrat & Parv tile,
 * day pill and observance detail), and a cross-tab `navigate` would leave back
 * popping to whichever tab root hosted the screen instead of the surface the
 * user actually came from. Registering the flow in both stacks lets every door
 * push in place, so back always retraces the journey.
 */
export type VidhiStackParamList = {
  VidhiCatalog: undefined;
  VidhiDetail: { vidhiId: string; dateMs?: number };
  VidhiConduct: { vidhiId: string; dateMs?: number; initialStep?: number };
};

export type HomeStackParamList = VidhiStackParamList & {
  Home: undefined;
  Search: undefined;
  CategoryList: { categoryId: ContentCategory };
  DeityList: { deityId: Deity };
  DeityIndex: undefined;
  DeityDetail: { deityId: Deity };
  BrowseByPurpose: undefined;
  PurposeList: { purposeId: PurposeId };
  ChalisaReader: { initialIndex?: number; chalisaId?: string } | undefined;
  AshtakamReader: { initialIndex?: number; ashtakamId?: string } | undefined;
  SuktamReader: { initialIndex?: number; suktamId?: string } | undefined;
  KavachamReader: { initialIndex?: number; kavachamId?: string } | undefined;
  StutiReader: { initialIndex?: number; stutiId?: string } | undefined;
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
  ValmikiRamayanChapters: undefined;
  ValmikiRamayanReader: { chapter: number; initialIndex?: number };
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
  WidgetGallery: undefined;
  // पितृ स्मरण — tithi-based family remembrance (PRD-17, same pattern as Reminders).
  PitruSmaranList: undefined;
  PitruSmaranEdit: { entryId?: string } | undefined;
  PitruSmaranDetail: { entryId: string };
  PitruPakshaOverview: undefined;
};

export type PanchangHomeMode = 'calendar' | 'catalog' | 'jyotish';

// Panchang tab stack — the date-first calendar, the "Vrat & Parv" catalog
// (PRD-09), and the Jyotish tools landing (PRD-C).
export type PanchangStackParamList = VidhiStackParamList & {
  PanchangHome:
    | {
        initialTab?: PanchangHomeMode;
        dateMs?: number;
        /** PRD-16: ring these days (epoch ms) on the month calendar for an occasion. */
        muhuratOverlay?: { occasionId: OccasionId; days: number[] };
      }
    | undefined;
  ObservanceList: { category: 'vrat' | 'festival' | 'upavas' };
  ObservanceDetail: { ruleId: string };
  KathaLibrary: undefined;
  MyVrat: undefined;
  // Daily Muhurat detail (Choghadiya / Rahu Kaal / Abhijit) — PRD-14
  MuhuratDetail: { dateMs: number };
  MuhuratFinder: undefined;
  MuhuratResults: { occasionId: OccasionId };
  MuhuratDayDetail: { occasionId: OccasionId; dateMs: number };
  AbujhDays: undefined;
  Kundali: { editing?: boolean } | undefined;
  Rashifal: { rashiIndex?: number } | undefined;
  GunaMilan: undefined;
  Namkaran: undefined;
  NamkaranResult: {
    basis:
      | { kind: 'birth'; date: string; time: string | null }
      | { kind: 'manual'; nakshatraIndex: number; pada: 1 | 2 | 3 | 4 };
    /** Set when this charana was opened from an unknown-time candidate list. It
     * is one of the day's possibilities, not a settled answer, so the screen
     * keeps its provenance visible and offers no exact-syllable share
     * (PRD-17 §8.3 invariant 5). Browsing a rashi cell does NOT set it — that
     * is a table lookup, not a claim about this child's birth. */
    fromUnknownTime?: boolean;
  };
  /** Rashi-level naming detail: the 9 charanas a Moon sign holds. Its own
   * route because both the entry browse door and the result's rashi
   * cross-check reach it — a browse mode would strand the second caller. */
  NamkaranRashi: {
    rashiIndex: number;
    /** Charana indices belonging to an unknown-time day, when the detail was
     * opened from such a result. Those rows mark as that day's possibilities
     * and pass `fromUnknownTime` on, so the detail cannot become a side door
     * to an exact share the range path withholds (RULEBOOK §18.3/§18.8). */
    dayCharanas?: readonly number[];
  };
};

// Audio tab stack (prototype 'tab'/'both' entry styles). The now-playing
// surface is a root overlay, not a route, so the stack only hosts the library.
export type AudioStackParamList = {
  AudioLibrary: undefined;
};

/** @deprecated Use HomeStackParamList instead */
export type RootStackParamList = HomeStackParamList;
