import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { library, type LibraryEntry } from '@/data/texts';
import type { RoutineItem } from '@/data/routine/types';
import type { BookmarkRef } from '@/contexts/BookmarksContext';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import { aartiIndexById } from '@/data/aarti';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import type { HomeStackParamList } from './types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const chalisaIds = new Set(['hanuman-chalisa', 'shiv-chalisa', 'durga-chalisa', 'ganesh-chalisa', 'lakshmi-chalisa', 'saraswati-chalisa', 'vishnu-chalisa', 'krishna-chalisa', 'ram-chalisa']);

const theerthIds = new Set([
  'dvadasha-jyotirlinga',
  'char-dham',
  'chota-char-dham',
  'shakti-peeth',
  'famous-theerth',
]);
// A theerth library entry maps to a category drill-in on the map (or the
// listing for the all-temples "famous-theerth" entry).
const THEERTH_ENTRY_TO_GROUP: Record<string, string | undefined> = {
  'dvadasha-jyotirlinga': 'jyotirlinga',
  'char-dham': 'char-dham',
  'chota-char-dham': 'chota-char-dham',
  'shakti-peeth': 'shakti-peeth',
  'famous-theerth': undefined,
};
function theerthEntryParams(id: string): { group?: string } {
  const group = THEERTH_ENTRY_TO_GROUP[id];
  return group ? { group } : {};
}
const sanskarIds = new Set(['prabhati-shloka', 'surya-namaskar', 'tulsi-puja', 'bhojan-mantra', 'gau-seva', 'sandhya-deepam', 'ratri-shloka', 'vidyarambha-prarthana']);

const stotramChaptersRouteById: Record<string, keyof HomeStackParamList> = {
  'shiva-strotam': 'ShivaStrotamChapters',
  'durga-stotram': 'DurgaStotramChapters',
  'saraswati-stotram': 'SaraswatiStotramChapters',
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
  'saraswati-stotram': 'SaraswatiStotramReader',
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

export function buildEntryStartTarget(entry: LibraryEntry): BookmarkTarget | null {
  if (entry.category === 'japam') {
    return { screen: 'JapamCounter', params: { mantraId: entry.id } };
  }
  if (entry.category === 'theerth' && theerthIds.has(entry.id)) {
    return { screen: 'TheerthMap', params: theerthEntryParams(entry.id) };
  }
  if (chalisaIds.has(entry.id)) {
    return { screen: 'ChalisaReader', params: { initialIndex: 0, chalisaId: entry.id } };
  }
  if (sanskarIds.has(entry.id)) {
    return { screen: 'SanskarReader', params: { initialIndex: 0, sanskarId: entry.id } };
  }
  const aartiIndex = (aartiIndexById as Record<string, number>)[entry.id];
  if (aartiIndex != null) {
    return { screen: 'AartiReader', params: { aartiIndex } };
  }
  const chaptersRoute = stotramChaptersRouteById[entry.id];
  if (chaptersRoute) {
    return { screen: chaptersRoute, params: {} };
  }
  return null;
}

export function navigateToEntryStart(nav: Nav, entry: LibraryEntry): boolean {
  const target = buildEntryStartTarget(entry);
  if (!target) return false;
  if (Object.keys(target.params).length === 0) {
    (nav.navigate as (name: keyof HomeStackParamList) => void)(target.screen);
  } else {
    (nav.navigate as (name: keyof HomeStackParamList, params: object) => void)(target.screen, target.params);
  }
  return true;
}

/**
 * Open the content for a routine item. Whole sections defer to
 * `navigateToEntryStart`; a `chapter` item opens that chapter's reader; japam
 * opens the counter. Returns false if the source is unknown / unroutable.
 */
export function navigateToRoutineItem(nav: Nav, item: RoutineItem): boolean {
  if (item.kind === 'japam') {
    nav.navigate('JapamCounter', { mantraId: item.sourceId });
    return true;
  }
  if (item.kind === 'chapter' && item.chapter != null) {
    const readerRoute = stotramReaderRouteBySourceId[item.sourceId];
    if (!readerRoute) return false;
    (nav.navigate as (name: keyof HomeStackParamList, params: object) => void)(readerRoute, {
      chapter: item.chapter,
      initialIndex: 0,
    });
    return true;
  }
  const entry = library.find((e) => e.id === item.sourceId);
  if (entry) return navigateToEntryStart(nav, entry);
  return false;
}

export function navigateToProgress(nav: Nav, progress: ReadingProgress): boolean {
  const sourceId = canonicalSourceId(progress.sourceId);
  if (chalisaIds.has(sourceId)) {
    nav.navigate('ChalisaReader', { initialIndex: progress.verseIndex, chalisaId: sourceId });
    return true;
  }
  if (sanskarIds.has(sourceId)) {
    nav.navigate('SanskarReader', { initialIndex: progress.verseIndex, sanskarId: sourceId });
    return true;
  }
  const aartiIndex = (aartiIndexById as Record<string, number>)[sourceId];
  if (aartiIndex != null) {
    nav.navigate('AartiReader', { aartiIndex, initialIndex: progress.verseIndex });
    return true;
  }
  const readerRoute = stotramReaderRouteBySourceId[sourceId];
  if (readerRoute && progress.chapter != null) {
    // Push the chapter (subsection) index under the reader so pressing back from
    // the reader lands on the subsection list rather than the section list — lets
    // the user reach sibling chapters after resuming.
    const chaptersRoute = stotramChaptersRouteById[sourceId];
    if (chaptersRoute) {
      (nav.navigate as (name: keyof HomeStackParamList) => void)(chaptersRoute);
    }
    (nav.navigate as (name: keyof HomeStackParamList, params: object) => void)(readerRoute, {
      chapter: progress.chapter,
      initialIndex: progress.verseIndex,
    });
    return true;
  }
  return false;
}

/**
 * True when an entry opens a chapter (subsection) index rather than a single
 * flat reader — i.e. progress is tracked per `<sourceId>::<chapter>` and the
 * section-level resume sheet must route through the subsection list.
 */
export function isChapteredEntry(entry: LibraryEntry): boolean {
  return stotramChaptersRouteById[entry.id] != null;
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
      params: theerthEntryParams(sourceId),
    };
  }
  if (chalisaIds.has(sourceId)) {
    return {
      screen: 'ChalisaReader',
      params: { initialIndex: p.verseIndex, chalisaId: sourceId },
    };
  }
  if (sanskarIds.has(sourceId)) {
    return {
      screen: 'SanskarReader',
      params: { sanskarId: sourceId, initialIndex: p.verseIndex },
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
  if (sanskarIds.has(sourceId)) {
    return {
      screen: 'SanskarReader',
      params: { sanskarId: sourceId, initialIndex: bm.verseIndex },
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
