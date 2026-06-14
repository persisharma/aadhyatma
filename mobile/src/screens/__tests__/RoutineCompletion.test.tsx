/**
 * Unit tests for routine completion logic (PRD-07 §5.3) — pure, no providers.
 */
import { library } from '@/data/texts';
import { getVersePool } from '@/data/versePool';
import { toDateKey } from '@/contexts/UserActivityContext';
import { itemRunsOn, routineItemKey, type Routine, type RoutineItem } from '@/data/routine/types';
import { isItemAutoComplete, __resetUnitsCache, type CompletionCtx } from '@/data/routine/units';

// Hoisted by babel-jest above the imports regardless of position here.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const todayKey = toDateKey(new Date());
const todayMs = Date.now();
const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

function ctx(over: Partial<CompletionCtx>): CompletionCtx {
  return {
    getProgress: () => undefined,
    japaRoundsToday: () => 0,
    todayKey,
    toDateKey,
    ...over,
  };
}

beforeEach(() => __resetUnitsCache());

describe('routine item helpers', () => {
  const daily: Routine = { id: 'r1', nameHi: '', nameEn: '', mode: 'daily', items: [], createdAt: 0 };
  const weekly: Routine = { id: 'r2', nameHi: '', nameEn: '', mode: 'weekday', items: [], createdAt: 0 };
  const item: RoutineItem = { id: 'i1', kind: 'section', sourceId: 'hanuman-chalisa', weekdays: [1, 3] };

  it('daily items run every weekday', () => {
    for (let d = 0; d < 7; d += 1) expect(itemRunsOn(daily, item, d)).toBe(true);
  });

  it('weekday items run only on their tagged days', () => {
    expect(itemRunsOn(weekly, item, 1)).toBe(true);
    expect(itemRunsOn(weekly, item, 2)).toBe(false);
    expect(itemRunsOn(weekly, item, 3)).toBe(true);
  });

  it('builds a stable item key', () => {
    expect(routineItemKey('r1', 'i1')).toBe('r1:i1');
  });
});

describe('japam completion', () => {
  const item: RoutineItem = { id: 'i', kind: 'japam', sourceId: 'gayatri', targetRounds: 2 };

  it('completes when today rounds meet the target', () => {
    expect(isItemAutoComplete(item, ctx({ japaRoundsToday: () => 2 }))).toBe(true);
    expect(isItemAutoComplete(item, ctx({ japaRoundsToday: () => 3 }))).toBe(true);
  });

  it('is incomplete below the target', () => {
    expect(isItemAutoComplete(item, ctx({ japaRoundsToday: () => 1 }))).toBe(false);
  });
});

describe('whole-section (non-chaptered) completion via verseCount', () => {
  const entry = library.find((e) => e.id === 'hanuman-chalisa');
  const total = entry?.verseCount ?? 0;
  const item: RoutineItem = { id: 'i', kind: 'section', sourceId: 'hanuman-chalisa' };

  it('requires reaching the last verse-page, read today', () => {
    expect(total).toBeGreaterThan(0);
    const atEnd = { sourceId: 'hanuman-chalisa', verseIndex: total - 1, updatedAt: todayMs };
    expect(isItemAutoComplete(item, ctx({ getProgress: () => atEnd }))).toBe(true);
  });

  it('is incomplete partway through', () => {
    const mid = { sourceId: 'hanuman-chalisa', verseIndex: 0, updatedAt: todayMs };
    expect(isItemAutoComplete(item, ctx({ getProgress: () => mid }))).toBe(false);
  });

  it('does not count reading from a previous day', () => {
    const stale = { sourceId: 'hanuman-chalisa', verseIndex: total - 1, updatedAt: yesterdayMs };
    expect(isItemAutoComplete(item, ctx({ getProgress: () => stale }))).toBe(false);
  });
});

describe('chapter completion for a pooled chaptered source', () => {
  // Shiva Stotram is chaptered (each stotra is a chapter) and lives in the pool.
  const pooled = getVersePool().filter((v) => v.sourceId === 'shiva-strotam' && v.chapter === 1);
  const lastIdx = pooled.reduce((m, v) => Math.max(m, v.verseIndex), 0);
  const item: RoutineItem = { id: 'i', kind: 'chapter', sourceId: 'shiva-strotam', chapter: 1 };

  it('completes at the last verse-page of the chapter', () => {
    expect(pooled.length).toBeGreaterThan(0);
    const atEnd = { sourceId: 'shiva-strotam', chapter: 1, verseIndex: lastIdx, updatedAt: todayMs };
    expect(isItemAutoComplete(item, ctx({ getProgress: () => atEnd }))).toBe(true);
  });

  it('is incomplete on a different chapter', () => {
    const other = { sourceId: 'shiva-strotam', chapter: 2, verseIndex: lastIdx, updatedAt: todayMs };
    expect(isItemAutoComplete(item, ctx({ getProgress: () => other }))).toBe(false);
  });
});
