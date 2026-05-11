import { useEffect, useMemo } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * Resolve a chaptered reader's chapter from `route.params.chapter`. If the
 * chapter is out of range (e.g. a stale bookmark surviving a content split),
 * the reader is redirected to its chapters index instead of crashing inside
 * the data accessor.
 *
 * Returns `null` while the redirect is pending, in which case the screen
 * should render an empty placeholder.
 */
export function useSafeChapter<T>(
  rawChapter: number | undefined,
  getChapter: (chapter: number) => T,
  navigation: NativeStackNavigationProp<HomeStackParamList>,
  fallbackRoute: keyof HomeStackParamList
): T | null {
  const chapter = useMemo(() => {
    if (typeof rawChapter !== 'number' || !Number.isFinite(rawChapter)) return null;
    try {
      return getChapter(rawChapter);
    } catch {
      return null;
    }
  }, [rawChapter, getChapter]);

  useEffect(() => {
    if (chapter == null) {
      // Defer to next tick so React doesn't navigate during render.
      const id = setTimeout(() => {
        (navigation.replace as (name: keyof HomeStackParamList) => void)(fallbackRoute);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [chapter, navigation, fallbackRoute]);

  return chapter;
}
