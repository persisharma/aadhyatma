import type { BookmarkRef } from '@/contexts/BookmarksContext';
import type { HomeStackParamList } from './types';

export type WishlistNavigationTarget =
  | { screen: 'GitaReader'; params: HomeStackParamList['GitaReader'] }
  | { screen: 'ShivaStrotamReader'; params: HomeStackParamList['ShivaStrotamReader'] }
  | { screen: 'SundarkandReader'; params: HomeStackParamList['SundarkandReader'] }
  | { screen: 'ChalisaReader'; params: NonNullable<HomeStackParamList['ChalisaReader']> };

function getChapter(bm: BookmarkRef): number {
  if (typeof bm.chapter === 'number') return bm.chapter;

  const [, chapter] = bm.id.split(':');
  const parsed = Number(chapter);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function buildWishlistNavigationTarget(bm: BookmarkRef): WishlistNavigationTarget {
  if (bm.sourceId === 'bhagavad-gita') {
    return {
      screen: 'GitaReader',
      params: { chapter: getChapter(bm), initialIndex: bm.verseIndex },
    };
  }

  if (bm.sourceId === 'shiva-strotam') {
    return {
      screen: 'ShivaStrotamReader',
      params: { chapter: getChapter(bm), initialIndex: bm.verseIndex },
    };
  }

  if (bm.sourceId === 'sundarkand') {
    return {
      screen: 'SundarkandReader',
      params: { chapter: getChapter(bm), initialIndex: bm.verseIndex },
    };
  }

  return {
    screen: 'ChalisaReader',
    params: { initialIndex: bm.verseIndex },
  };
}
