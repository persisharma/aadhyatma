import { latestReadingProgress } from '../latestProgress';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

const entry = (sourceId: string, updatedAt: number, chapter?: number): ReadingProgress => ({
  sourceId,
  chapter,
  verseIndex: 3,
  updatedAt,
});

describe('latestReadingProgress', () => {
  test('returns null for an empty map', () => {
    expect(latestReadingProgress({})).toBeNull();
  });

  test('picks the most recently updated entry across sources', () => {
    const progress = {
      'bhagavad-gita::2': entry('bhagavad-gita', 100, 2),
      'hanuman-chalisa': entry('hanuman-chalisa', 300),
      'sundarkand::1': entry('sundarkand', 200, 1),
    };
    expect(latestReadingProgress(progress)?.sourceId).toBe('hanuman-chalisa');
  });

  test('picks the latest subsection when one source has several', () => {
    const progress = {
      'bhagavad-gita::2': entry('bhagavad-gita', 100, 2),
      'bhagavad-gita::12': entry('bhagavad-gita', 500, 12),
    };
    const latest = latestReadingProgress(progress);
    expect(latest?.chapter).toBe(12);
    expect(latest?.updatedAt).toBe(500);
  });
});
