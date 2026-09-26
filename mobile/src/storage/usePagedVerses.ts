import { useMemo } from 'react';
import { readContent } from '../storage/content';
export type LoadingVerse = { __type: 'loading'; id: string };
/** Source adapter for web and component tests; native uses the bounded SQLite hook. */
export function usePagedVerses<T>(key: string, count: number, current: number) {
  const verses: (T | LoadingVerse)[] = useMemo(() => count ? readContent<{verses:T[]}>(key).verses : [], [key,count]);
  return { verses, getVerse: (index: number) => verses[index] as T, error: false, retry: () => {} };
}
