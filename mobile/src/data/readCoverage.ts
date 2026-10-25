/**
 * Read coverage — WHICH verse-pages of a text the reader has actually read
 * (design.md §84, RULEBOOK §3).
 *
 * This is deliberately separate from the reading *position*
 * (`ReadingProgressContext`): the position is one cursor per subsection that
 * "Start over" moves back to the first verse, so on its own it cannot say how
 * much of a text was read. Coverage only grows as verses are read, and shrinks
 * only on an explicit reset or when a full reading (पाठ) completes — at which
 * point the पाठ count goes up and the next reading starts from a clean slate.
 *
 * Everything here is pure (no React, no storage) so the rules are testable with
 * `tsx --test`; `ReadCoverageContext` owns persistence and the React surface.
 */
import { library } from '@/data/texts';
import { shivaStrotamChaptersManifest } from '@/data/shiva-strotam';
import { durgaStotramChaptersManifest } from '@/data/durga-stotram';
import { saraswatiStotramChaptersManifest } from '@/data/saraswati-stotram';
import { ganeshStotramChaptersManifest } from '@/data/ganesh-stotram';
import { vishnuSahasranamaChaptersManifest } from '@/data/vishnu-sahasranama';
import { hanumanAshtakChaptersManifest } from '@/data/hanuman-ashtak';
import { krishnaStotramChaptersManifest } from '@/data/krishna-stotram';
import { bajrangBaanChaptersManifest } from '@/data/bajrang-baan';
import { ramStutiChaptersManifest } from '@/data/ram-stuti';
import { ramcharitmanasChaptersManifest } from '@/data/ramcharitmanas';
import { valmikiRamayanChaptersManifest } from '@/data/valmiki-ramayan';
import { sundarkandChaptersManifest } from '@/data/sundarkand';
import { gitaChaptersManifest } from '@/data/gita';
import { garudPuranChaptersManifest } from '@/data/garud-puran';
import { gitaSaarChaptersManifest } from '@/data/gita-saar';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import { getVersePoolLastPositions } from '@/data/versePool';

/** Inclusive `[first, last]` run of read verse indices within one subsection. */
export type VerseRange = readonly [number, number];

export type CoverageState = {
  v: 1;
  /**
   * `<sourceId>::<chapter>` → sorted, disjoint, non-adjacent inclusive ranges of
   * read verse indices. Texts without subsections use chapter 1, matching the
   * versePool convention for flat sources.
   */
  read: Record<string, VerseRange[]>;
  /** sourceId → completed full readings (पाठ). A reset never lowers it. */
  paath: Record<string, number>;
  /** sourceId → epoch ms of the most recent completed reading. */
  paathAt: Record<string, number>;
};

export const EMPTY_COVERAGE: CoverageState = { v: 1, read: {}, paath: {}, paathAt: {} };

export type ChapterShape = { chapter: number; verseCount: number };

type ManifestRow = { chapter: number; verseCount: number };

/**
 * Library rows that read another source's corpus. Ram's aarti opens the Ram
 * Stuti reader, which records under `ram-stuti`, so its card reports that.
 */
const COVERAGE_ALIAS: Record<string, string> = { 'ram-aarti': 'ram-stuti' };

let chapteredShapes: Record<string, readonly ManifestRow[]> | null = null;

/** Same manifest set as `entryRoutes.chapterCountBySourceId`; manifests only, never corpora. */
function chapteredManifests(): Record<string, readonly ManifestRow[]> {
  if (chapteredShapes) return chapteredShapes;
  chapteredShapes = {
    'shiva-strotam': shivaStrotamChaptersManifest,
    'durga-stotram': durgaStotramChaptersManifest,
    'saraswati-stotram': saraswatiStotramChaptersManifest,
    'ganesh-stotram': ganeshStotramChaptersManifest,
    'vishnu-sahasranama': vishnuSahasranamaChaptersManifest,
    'hanuman-ashtak': hanumanAshtakChaptersManifest,
    'krishna-stotram': krishnaStotramChaptersManifest,
    'bajrang-baan': bajrangBaanChaptersManifest,
    'ram-stuti': ramStutiChaptersManifest,
    ramcharitmanas: ramcharitmanasChaptersManifest,
    'valmiki-ramayan': valmikiRamayanChaptersManifest,
    sundarkand: sundarkandChaptersManifest,
    'bhagavad-gita': gitaChaptersManifest,
    'garud-puran': garudPuranChaptersManifest,
    'gita-saar': gitaSaarChaptersManifest,
  };
  return chapteredShapes;
}

/** The id whose coverage a library row (or a stored progress entry) reports. */
export function coverageSourceId(sourceId: string): string {
  const canonical = canonicalSourceId(sourceId);
  return COVERAGE_ALIAS[canonical] ?? canonical;
}

let poolPositions: ReturnType<typeof getVersePoolLastPositions> | null = null;

/**
 * Subsections and their verse-page counts for a source, or null when the source
 * has no countable pages (japa, theerth, unknown ids). Flat texts are one
 * chapter-1 subsection sized by the reader's own page count (the verse pool
 * reads it off the payload), falling back to the library `verseCount` — the
 * two can disagree (an aarti row may count stanzas differently from the pages
 * its reader swipes through), and completion must follow the pages.
 */
export function getCoverageShape(sourceId: string): ChapterShape[] | null {
  const id = coverageSourceId(sourceId);
  const manifest = chapteredManifests()[id];
  if (manifest) return manifest.map((c) => ({ chapter: c.chapter, verseCount: c.verseCount }));
  const entry = library.find((e) => e.id === id);
  if (!entry?.verseCount || entry.verseCount <= 0) return null;
  poolPositions = poolPositions ?? getVersePoolLastPositions();
  const pooled = poolPositions[id]?.chapters[1];
  return [{ chapter: 1, verseCount: pooled != null ? pooled + 1 : entry.verseCount }];
}

export function coverageKey(sourceId: string, chapter?: number): string {
  return `${coverageSourceId(sourceId)}::${chapter ?? 1}`;
}

function keyPrefix(sourceId: string): string {
  return `${coverageSourceId(sourceId)}::`;
}

// ── Range arithmetic ─────────────────────────────────────────────────────────

export function rangesCount(ranges: readonly VerseRange[] | undefined): number {
  if (!ranges) return 0;
  let n = 0;
  for (const [a, b] of ranges) n += b - a + 1;
  return n;
}

export function rangesHas(ranges: readonly VerseRange[] | undefined, index: number): boolean {
  if (!ranges) return false;
  for (const [a, b] of ranges) {
    if (index < a) return false;
    if (index <= b) return true;
  }
  return false;
}

/** Union of `ranges` and `[from, to]`, kept sorted, disjoint and non-adjacent. */
export function addRange(ranges: readonly VerseRange[] | undefined, from: number, to: number): VerseRange[] {
  const out: VerseRange[] = [];
  let lo = from;
  let hi = to;
  let placed = false;
  for (const [a, b] of ranges ?? []) {
    if (b < lo - 1) {
      out.push([a, b]);
    } else if (a > hi + 1) {
      if (!placed) {
        out.push([lo, hi]);
        placed = true;
      }
      out.push([a, b]);
    } else {
      lo = Math.min(lo, a);
      hi = Math.max(hi, b);
    }
  }
  if (!placed) out.push([lo, hi]);
  return out;
}

/** First index in `[0, count)` not covered by `ranges`, or null when all are read. */
export function firstGap(ranges: readonly VerseRange[] | undefined, count: number): number | null {
  let next = 0;
  for (const [a, b] of ranges ?? []) {
    if (a > next) break;
    next = Math.max(next, b + 1);
  }
  return next < count ? next : null;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export type ChapterCoverage = { chapter: number; read: number; total: number; complete: boolean };

export type SourceCoverage = {
  sourceId: string;
  read: number;
  total: number;
  /** Whole percent, floored so a nearly-finished text never shows 100%. */
  pct: number;
  chapters: ChapterCoverage[];
  chaptersComplete: number;
  /** True when the text has more than one subsection (bar UI); false for short texts (पाठ chip). */
  hasChapters: boolean;
  paath: number;
  paathAt?: number;
};

export function getChapterCoverage(
  state: CoverageState,
  sourceId: string,
  chapter?: number
): ChapterCoverage | null {
  const shape = getCoverageShape(sourceId);
  const ch = chapter ?? 1;
  const row = shape?.find((c) => c.chapter === ch);
  if (!row) return null;
  const read = Math.min(row.verseCount, rangesCount(state.read[coverageKey(sourceId, ch)]));
  return { chapter: ch, read, total: row.verseCount, complete: read >= row.verseCount };
}

export function getSourceCoverage(state: CoverageState, sourceId: string): SourceCoverage | null {
  const shape = getCoverageShape(sourceId);
  if (!shape) return null;
  const id = coverageSourceId(sourceId);
  let read = 0;
  let total = 0;
  let chaptersComplete = 0;
  const chapters = shape.map((row) => {
    const r = Math.min(row.verseCount, rangesCount(state.read[coverageKey(id, row.chapter)]));
    read += r;
    total += row.verseCount;
    const complete = r >= row.verseCount;
    if (complete) chaptersComplete += 1;
    return { chapter: row.chapter, read: r, total: row.verseCount, complete };
  });
  return {
    sourceId: id,
    read,
    total,
    pct: total > 0 ? Math.floor((read / total) * 100) : 0,
    chapters,
    chaptersComplete,
    hasChapters: shape.length > 1,
    paath: state.paath[id] ?? 0,
    paathAt: state.paathAt[id],
  };
}

export function isVerseRead(state: CoverageState, sourceId: string, chapter: number | undefined, verseIndex: number): boolean {
  return rangesHas(state.read[coverageKey(sourceId, chapter)], verseIndex);
}

/**
 * The first unread verse, scanning subsections in order from `fromChapter`
 * (wrapping round to the first), or null when every verse is read.
 */
export function findFirstUnread(
  state: CoverageState,
  sourceId: string,
  fromChapter?: number
): { chapter: number; verseIndex: number } | null {
  const shape = getCoverageShape(sourceId);
  if (!shape || shape.length === 0) return null;
  const start = Math.max(0, shape.findIndex((c) => c.chapter === (fromChapter ?? shape[0].chapter)));
  for (let k = 0; k < shape.length; k += 1) {
    const row = shape[(start + k) % shape.length];
    const gap = firstGap(state.read[coverageKey(sourceId, row.chapter)], row.verseCount);
    if (gap != null) return { chapter: row.chapter, verseIndex: gap };
  }
  return null;
}

// ── Mutations (all return a new state; unchanged input → same reference) ─────

export type MarkResult = { state: CoverageState; completedChapter: boolean; completedPaath: boolean };

function withoutSource(read: CoverageState['read'], sourceId: string): CoverageState['read'] {
  const prefix = keyPrefix(sourceId);
  const next: CoverageState['read'] = {};
  for (const [k, v] of Object.entries(read)) if (!k.startsWith(prefix)) next[k] = v;
  return next;
}

/** When every subsection of a source is fully read, bank a पाठ and clear it for the next reading. */
function settlePaath(state: CoverageState, sourceId: string, now: number): { state: CoverageState; completed: boolean } {
  const cov = getSourceCoverage(state, sourceId);
  if (!cov || cov.total === 0 || cov.read < cov.total) return { state, completed: false };
  const id = cov.sourceId;
  return {
    state: {
      ...state,
      read: withoutSource(state.read, id),
      paath: { ...state.paath, [id]: (state.paath[id] ?? 0) + 1 },
      paathAt: { ...state.paathAt, [id]: now },
    },
    completed: true,
  };
}

/**
 * Record one verse-page as read. Out-of-range indices (chapter transition cards,
 * unknown subsections) are ignored, as are pages already read.
 */
export function markVerseRead(
  state: CoverageState,
  sourceId: string,
  chapter: number | undefined,
  verseIndex: number,
  now: number
): MarkResult {
  const unchanged = { state, completedChapter: false, completedPaath: false };
  const shape = getCoverageShape(sourceId);
  const ch = chapter ?? 1;
  const row = shape?.find((c) => c.chapter === ch);
  if (!row || !Number.isInteger(verseIndex) || verseIndex < 0 || verseIndex >= row.verseCount) return unchanged;
  const key = coverageKey(sourceId, ch);
  if (rangesHas(state.read[key], verseIndex)) return unchanged;
  const ranges = addRange(state.read[key], verseIndex, verseIndex);
  const next: CoverageState = { ...state, read: { ...state.read, [key]: ranges } };
  const completedChapter = rangesCount(ranges) >= row.verseCount;
  if (!completedChapter) return { state: next, completedChapter: false, completedPaath: false };
  const settled = settlePaath(next, sourceId, now);
  return { state: settled.state, completedChapter: true, completedPaath: settled.completed };
}

/** What a reset removed, so an undo can put it back. */
export type CoverageSnapshot = { read: CoverageState['read'] };

export function resetChapterCoverage(
  state: CoverageState,
  sourceId: string,
  chapter?: number
): { state: CoverageState; snapshot: CoverageSnapshot } {
  const key = coverageKey(sourceId, chapter);
  if (!(key in state.read)) return { state, snapshot: { read: {} } };
  const read = { ...state.read };
  const removed = read[key];
  delete read[key];
  return { state: { ...state, read }, snapshot: { read: { [key]: removed } } };
}

export function resetSourceCoverage(
  state: CoverageState,
  sourceId: string
): { state: CoverageState; snapshot: CoverageSnapshot } {
  const prefix = keyPrefix(sourceId);
  const removed: CoverageState['read'] = {};
  for (const [k, v] of Object.entries(state.read)) if (k.startsWith(prefix)) removed[k] = v;
  if (Object.keys(removed).length === 0) return { state, snapshot: { read: {} } };
  return { state: { ...state, read: withoutSource(state.read, sourceId) }, snapshot: { read: removed } };
}

/** Merge a reset's snapshot back in (union, so verses read since the reset are kept). */
export function restoreCoverage(state: CoverageState, snapshot: CoverageSnapshot): CoverageState {
  const keys = Object.keys(snapshot.read);
  if (keys.length === 0) return state;
  const read = { ...state.read };
  for (const k of keys) {
    let merged = read[k];
    for (const [a, b] of snapshot.read[k]) merged = addRange(merged, a, b);
    read[k] = merged ?? [];
  }
  return { ...state, read };
}

// ── Persistence helpers ─────────────────────────────────────────────────────

function isRange(x: unknown): x is VerseRange {
  return Array.isArray(x) && x.length === 2 && Number.isInteger(x[0]) && Number.isInteger(x[1]) && x[0] >= 0 && x[1] >= x[0];
}

/** Defensive parse of a stored blob; anything malformed is dropped, never thrown. */
export function parseCoverage(raw: unknown): CoverageState {
  if (!raw || typeof raw !== 'object') return EMPTY_COVERAGE;
  const obj = raw as Partial<CoverageState>;
  const read: CoverageState['read'] = {};
  if (obj.read && typeof obj.read === 'object') {
    for (const [k, v] of Object.entries(obj.read)) {
      if (!Array.isArray(v)) continue;
      let ranges: VerseRange[] | undefined;
      for (const r of v) if (isRange(r)) ranges = addRange(ranges, r[0], r[1]);
      if (ranges) read[k] = ranges;
    }
  }
  const counts = (m: unknown): Record<string, number> => {
    const out: Record<string, number> = {};
    if (m && typeof m === 'object') {
      for (const [k, v] of Object.entries(m as Record<string, unknown>)) {
        if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = v;
      }
    }
    return out;
  };
  return { v: 1, read, paath: counts(obj.paath), paathAt: counts(obj.paathAt) };
}

/**
 * One-time seed for installs that predate coverage: everything up to and
 * including each subsection's saved position counts as read (a saved position
 * past the first page means the reader paged through to it). A position on the
 * first page seeds nothing. A text whose seed covers it completely is banked as
 * one पाठ instead of sitting at 100%.
 */
export function backfillFromProgress(
  entries: readonly { sourceId: string; chapter?: number; verseIndex: number; updatedAt: number }[]
): CoverageState {
  let state: CoverageState = { ...EMPTY_COVERAGE, read: {} };
  const latestBySource: Record<string, number> = {};
  for (const e of entries) {
    if (!Number.isInteger(e.verseIndex) || e.verseIndex <= 0) continue;
    const shape = getCoverageShape(e.sourceId);
    const ch = e.chapter ?? 1;
    const row = shape?.find((c) => c.chapter === ch);
    if (!row) continue;
    const key = coverageKey(e.sourceId, ch);
    const last = Math.min(e.verseIndex, row.verseCount - 1);
    state = { ...state, read: { ...state.read, [key]: addRange(state.read[key], 0, last) } };
    const id = coverageSourceId(e.sourceId);
    latestBySource[id] = Math.max(latestBySource[id] ?? 0, e.updatedAt);
  }
  for (const [id, at] of Object.entries(latestBySource)) state = settlePaath(state, id, at).state;
  return state;
}
