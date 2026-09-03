/**
 * जिज्ञासा · Ask Vedansh (PRD-41) — shared types.
 *
 * Everything in `src/ask/` is a deterministic grammar over the engines the app
 * already ships: no model, no network, no telemetry. This file is imported by
 * the UI hook (`useAsk.ts`) and is therefore the ONLY module in this directory
 * that may sit on the launch import graph — keep it types-only.
 */
import type { CalendarSystem } from '@/panchang/types';
import type { ScanLocation } from '@/panchang/panchangDayStore';
import type { Lang } from '@/data/gita/language';
import type {
  HomeStackParamList,
  MoreStackParamList,
  PanchangStackParamList,
} from '@/navigation/types';

export type Localized = { hi: string; en: string };

/**
 * The closed entity vocabularies the resolver can tag. Every one is derived
 * from a registry that already ships (see `lexicon.ts`), never hand-listed.
 */
export type EntityType =
  | 'deity'
  | 'observance'
  | 'occasion'
  | 'disha'
  | 'room'
  | 'mantra'
  | 'vidhi';

export type LexEntry = {
  type: EntityType;
  id: string;
  /** Display label for traces / did-you-mean chips (Devanagari). */
  label: string;
  /** Folded surface form this entry matches on. */
  key: string;
  /**
   * A recurring observance FAMILY (ekadashi, pradosh, purnima…) rather than a
   * named instance. Resolves to "the next one of any name" — PRD-41 §13.3.
   */
  isClass?: boolean;
  /** Member rule ids for a class entry. */
  members?: readonly string[];
};

export type AskFamily =
  | 'panchang'
  | 'observance'
  | 'muhurat'
  | 'bhog'
  | 'vidhi'
  | 'katha'
  | 'japam'
  | 'vastu'
  | 'sadhana';

export type AskTarget =
  | { tab: 'home'; screen: keyof HomeStackParamList; params?: object }
  | { tab: 'panchang'; screen: keyof PanchangStackParamList; params?: object }
  | { tab: 'more'; screen: keyof MoreStackParamList; params?: object };

export type AskAction = { label: Localized; target: AskTarget };

export type AskLine = { label: Localized; value: Localized; tone?: 'neutral' | 'avoid' };

export type AskAnswer = {
  intentId: string;
  family: AskFamily;
  /** Small eyebrow above the headline — "नैवेद्य · श्री गणेश". */
  tag: Localized;
  headline: Localized;
  sub?: Localized;
  lines: AskLine[];
  /** The computation trail, shown collapsed under "गणना देखें". */
  working: string[];
  /** Content-backed answers only: what was verified, when. Never a URL. */
  provenance?: Localized;
  /** Family-variance / tradition note carried verbatim from the registry. */
  note?: Localized;
  actions: AskAction[];
  confidence: 'exact' | 'likely';
};

export type SadhanaSummary = {
  programId: string;
  titleHi: string;
  titleEn: string;
  dayIndex: number;
  total: number;
  doneToday: boolean;
};

export type AskContext = {
  now: Date;
  location: ScanLocation;
  calendarSystem: CalendarSystem;
  lang: Lang;
  /** Active enrolments, supplied by the UI from SadhanaContext (Phase 2/3). */
  sadhana?: readonly SadhanaSummary[];
  /**
   * Ask-from-context (Phase 3): the surface the question was asked from can
   * seed an entity so "iska bhog kya hai" resolves against it.
   */
  seed?: { type: EntityType; id: string };
};

export type ResolvedSlots = Partial<Record<EntityType, LexEntry>> & {
  /** 0 = today, 1 = tomorrow (कल), 2 = परसों. */
  dayOffset?: number;
};

export type AskIntent = {
  id: string;
  family: AskFamily;
  /** Trigger lexemes, in any of hi / en / Hinglish; folded at registry build. */
  triggers: readonly string[];
  /** Entity types this intent needs. All required unless listed in `optional`. */
  slots: readonly EntityType[];
  optional?: readonly EntityType[];
  /**
   * Negative lexemes: if any is present the intent is INELIGIBLE. Lets a
   * broad trigger ("kaise kare") yield to a sibling that owns the word
   * ("puja kaise kare" is a vidhi, not a fast).
   */
  blockers?: readonly string[];
  /** Example questions, in Devanagari, for chips and the rotating placeholder. */
  examples: readonly Localized[];
  resolve: (ctx: AskContext, slots: ResolvedSlots) => AskAnswer | null;
};

export type ScoredIntent = { intentId: string; score: number; trigger: string };

export type AskTrace = {
  key: string;
  entities: ResolvedSlots;
  scored: ScoredIntent[];
};

export type AskSuggestion = { question: Localized };

export type AskResolution =
  | { kind: 'answer'; answer: AskAnswer; trace: AskTrace }
  /** The stance guard fired: predictive / personal-advice framing. */
  | { kind: 'declined'; trace: AskTrace }
  /** Nothing eligible. `suggestions` are did-you-mean chips. */
  | { kind: 'none'; trace: AskTrace; suggestions: AskSuggestion[] };
