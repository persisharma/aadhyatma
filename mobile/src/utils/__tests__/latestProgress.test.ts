import { readingProgressByRecency } from '../latestProgress';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

const entry = (sourceId: string, updatedAt: number, chapter?: number): ReadingProgress => ({
  sourceId,
  chapter,
  verseIndex: 3,
  updatedAt,
});

describe('readingProgressByRecency', () => {
  test('returns an empty array for an empty map', () => {
    expect(readingProgressByRecency({})).toEqual([]);
  });

  test('orders entries newest-first across sources (fallback order for the Home card)', () => {
    const progress = {
      'bhagavad-gita::2': entry('bhagavad-gita', 100, 2),
      'hanuman-chalisa': entry('hanuman-chalisa', 300),
      'sundarkand::1': entry('sundarkand', 200, 1),
    };
    expect(readingProgressByRecency(progress).map((e) => e.sourceId)).toEqual([
      'hanuman-chalisa',
      'sundarkand',
      'bhagavad-gita',
    ]);
  });

  test('orders subsections of one source by recency', () => {
    const progress = {
      'bhagavad-gita::2': entry('bhagavad-gita', 100, 2),
      'bhagavad-gita::12': entry('bhagavad-gita', 500, 12),
    };
    const [latest] = readingProgressByRecency(progress);
    expect(latest.chapter).toBe(12);
    expect(latest.updatedAt).toBe(500);
  });
});
