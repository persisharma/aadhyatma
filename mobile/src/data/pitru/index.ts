/**
 * पितृ पक्ष परिचय registry accessors (PRD-44, RULEBOOK §28). Verified-only
 * across the board — a draft row is indistinguishable from absence on every
 * surface, so flipping a status lights the surface up with zero code change
 * (the §19/§26/§27 pattern).
 *
 * LAUNCH-GRAPH RULE (launchGraph.test.ts): PitruPakshaOverviewScreen is
 * imported eagerly by the More stack and reads `hasPitruShiksha()` for its
 * परिचय door, so anything statically re-exported here sits on every cold
 * start. The content registries therefore load through `require()` thunks —
 * the daan/valmiki/pincodes pattern. Only types are re-exported statically.
 */
import type {
  PitruKathaEntry,
  PitruLessonEntry,
  PitruLessonKind,
  PitruPrashnaEntry,
  PitruPrincipleEntry,
} from './types';

export type {
  PitruContentStatus,
  PitruFortnightDay,
  PitruKathaEntry,
  PitruKathaSection,
  PitruLessonEntry,
  PitruLessonKind,
  PitruPrashnaEntry,
  PitruPrincipleEntry,
  PitruReaderRef,
  PitruSource,
} from './types';

export function getPitruLessons(kind?: PitruLessonKind): readonly PitruLessonEntry[] {
  const all = (require('./lessons') as typeof import('./lessons')).getPitruLessons();
  return kind ? all.filter((entry) => entry.kind === kind) : all;
}

export function getPitruPrinciples(): readonly PitruPrincipleEntry[] {
  return (require('./principles') as typeof import('./principles')).getPitruPrinciples();
}

export function getPitruKathas(): readonly PitruKathaEntry[] {
  return (require('./kathas') as typeof import('./kathas')).getPitruKathas();
}

export function getPitruKatha(id: string): PitruKathaEntry | null {
  return (require('./kathas') as typeof import('./kathas')).getPitruKatha(id);
}

export function getPitruPrashna(): readonly PitruPrashnaEntry[] {
  return (require('./prashna') as typeof import('./prashna')).getPitruPrashna();
}

/**
 * The door predicate every host uses (overview card, day chip, DISCOVER):
 * true only when at least one verified concept lesson exists. An all-draft
 * registry renders NO door anywhere — absent, never a teaser.
 */
export function hasPitruShiksha(): boolean {
  return getPitruLessons('parichay').length > 0;
}
