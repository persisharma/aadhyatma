import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LibraryEntry } from '@/data/texts';
import type { BookmarkRef } from '@/contexts/BookmarksContext';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import { aartiIndexById } from '@/data/aarti';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import type { HomeStackParamList } from './types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const chalisaIds = new Set(['hanuman-chalisa', 'shiv-chalisa', 'durga-chalisa', 'ganesh-chalisa']);

const theerthIds = new Set([
  'dvadasha-jyotirlinga',
  'char-dham',
  'chota-char-dham',
  'shakti-peeth',
  'famous-theerth',
]);

const stotramChaptersRouteById: Record<string, keyof HomeStackParamList> = {
  'shiva-strotam': 'ShivaStrotamChapters',
  'durga-stotram': 'DurgaStotramChapters',
  'ganesh-stotram': 'GaneshStotramChapters',
  'vishnu-sahasranama': 'VishnuSahasranamaChapters',
  'hanuman-ashtak': 'HanumanAshtakChapters',
  'krishna-stotram': 'KrishnaStotramChapters',
  'bajrang-baan': 'BajrangBaanChapters',
  'ram-stuti': 'RamStutiChapters',
  'ramcharitmanas': 'RamcharitmanasChapters',
  'sundarkand': 'SundarkandChapters',
  'bhagavad-gita': 'GitaChapters',
};

const stotramReaderRouteBySourceId: Record<string, keyof HomeStackParamList> = {
  'shiva-strotam': 'ShivaStrotamReader',
  'durga-stotram': 'DurgaStotramReader',
  'ganesh-stotram': 'GaneshStotramReader',
  'vishnu-sahasranama': 'VishnuSahasranamaReader',
  'hanuman-ashtak': 'HanumanAshtakReader',
  'krishna-stotram': 'KrishnaStotramReader',
  'bajrang-baan': 'BajrangBaanReader',
  'ram-stuti': 'RamStutiReader',
  'ramcharitmanas': 'RamcharitmanasReader',
  'sundarkand': 'SundarkandReader',
  'bhagavad-gita': 'GitaReader',
};

export function navigateToEntryStart(nav: Nav, entry: LibraryEntry): boolean {
  if (entry.category === 'japam') {
    nav.navigate('JapamCounter', { mantraId: entry.id });
    return true;
  }
  if (entry.category === 'theerth' && theerthIds.has(entry.id)) {
    nav.navigate('TheerthMap', { theerthId: entry.id });
    return true;
  }
  if (chalisaIds.has(entry.id)) {
    nav.navigate('ChalisaReader', { initialIndex: 0, chalisaId: entry.id });
    return true;
  }
  const aartiIndex = (aartiIndexById as Record<string, number>)[entry.id];
  if (aartiIndex != null) {
    nav.navigate('AartiReader', { aartiIndex });
    return true;
  }
  const chaptersRoute = stotramChaptersRouteById[entry.id];
  if (chaptersRoute) {
    (nav.navigate as (name: keyof HomeStackParamList) => void)(chaptersRoute);
    return true;
  }
  return false;
}

export function navigateToProgress(nav: Nav, progress: ReadingProgress): boolean {
  const sourceId = canonicalSourceId(progress.sourceId);
  if (chalisaIds.has(sourceId)) {
    nav.navigate('ChalisaReader', { initialIndex: progress.verseIndex, chalisaId: sourceId });
    return true;
  }
  const aartiIndex = (aartiIndexById as Record<string, number>)[sourceId];
  if (aartiIndex != null) {
    nav.navigate('AartiReader', { aartiIndex, initialIndex: progress.verseIndex });
    return true;
  }
  const readerRoute = stotramReaderRouteBySourceId[sourceId];
  if (readerRoute && progress.chapter != null) {
    (nav.navigate as (name: keyof HomeStackParamList, params: object) => void)(readerRoute, {
      chapter: progress.chapter,
      initialIndex: progress.verseIndex,
    });
    return true;
  }
  return false;
}

function chapterFromBookmark(bm: BookmarkRef): number | null {
  if (typeof bm.chapter === 'number' && bm.chapter > 0) return bm.chapter;
  // Legacy bookmark ids encoded chapter at parts[1]:
  // `<sourceId>:<chapter>:<verseIndex>` for chaptered readers.
  const parts = bm.id.split(':');
  if (parts.length >= 3) {
    const parsed = Number(parts[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export type BookmarkTarget = {
  screen: keyof HomeStackParamList;
  params: object;
};

/**
 * Build a HomeStack target from a progress-like descriptor. Used by the
 * notification deep-link handler (PRD-01); shares the same routing tables as
 * `navigateToProgress` so behaviour stays consistent.
 */
export function buildProgressTarget(p: {
  sourceId: string;
  chapter?: number;
  verseIndex: number;
}): BookmarkTarget | null {
  const sourceId = canonicalSourceId(p.sourceId);
  if (theerthIds.has(sourceId)) {
    return {
      screen: 'TheerthMap',
      params: { theerthId: sourceId },
    };
  }
  if (chalisaIds.has(sourceId)) {
    return {
      screen: 'ChalisaReader',
      params: { initialIndex: p.verseIndex, chalisaId: sourceId },
    };
  }
  const aartiIndex = (aartiIndexById as Record<string, number>)[sourceId];
  if (aartiIndex != null) {
    return {
      screen: 'AartiReader',
      params: { aartiIndex, initialIndex: p.verseIndex },
    };
  }
  const readerRoute = stotramReaderRouteBySourceId[sourceId];
  if (readerRoute && p.chapter != null) {
    return {
      screen: readerRoute,
      params: { chapter: p.chapter, initialIndex: p.verseIndex },
    };
  }
  return null;
}

/**
 * Build a React Navigation descriptor for a bookmark, suitable for use as the
 * second argument of `rootNav.navigate('HomeTab', target)` from a screen
 * outside the Home stack. Returns null if the bookmark's sourceId is unknown
 * or a chaptered reader is missing a chapter.
 */
export function buildBookmarkTarget(bm: BookmarkRef): BookmarkTarget | null {
  const sourceId = canonicalSourceId(bm.sourceId);
  if (chalisaIds.has(sourceId)) {
    return {
      screen: 'ChalisaReader',
      params: { initialIndex: bm.verseIndex, chalisaId: sourceId },
    };
  }
  const aartiIndex = (aartiIndexById as Record<string, number>)[sourceId];
  if (aartiIndex != null) {
    return {
      screen: 'AartiReader',
      params: { aartiIndex, initialIndex: bm.verseIndex },
    };
  }
  const readerRoute = stotramReaderRouteBySourceId[sourceId];
  if (readerRoute) {
    const chapter = chapterFromBookmark(bm);
    if (chapter == null) return null;
    return {
      screen: readerRoute,
      params: { chapter, initialIndex: bm.verseIndex },
    };
  }
  return null;
}

/**
 * Navigate to the reader for a saved bookmark from inside the Home stack.
 * Returns false on unknown sourceId or missing chapter.
 */
export function navigateToBookmark(nav: Nav, bm: BookmarkRef): boolean {
  const target = buildBookmarkTarget(bm);
  if (!target) return false;
  (nav.navigate as (name: keyof HomeStackParamList, params: object) => void)(
    target.screen,
    target.params
  );
  return true;
}
