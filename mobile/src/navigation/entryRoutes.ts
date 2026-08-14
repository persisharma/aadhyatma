import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { library, type LibraryEntry } from '@/data/texts';
import type { RoutineItem } from '@/data/routine/types';
import type { BookmarkRef } from '@/contexts/BookmarksContext';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import { aartiIndexById } from '@/data/aarti';
import { ashtakamIds as ashtakamIdList } from '@/data/ashtakam';
import { stutiIds as stutiIdList } from '@/data/stuti';
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
import { canonicalSourceId } from '@/data/sourceIdMigration';
import type { HomeStackParamList, PanchangStackParamList } from './types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

/**
 * Nested-navigation params for a screen inside the Panchang tab's stack.
 * Always sets `initial: false`: without it, navigating a LAZILY-mounted
 * Panchang tab makes the target the stack's *initial* route, leaving the
 * calendar (PanchangHome) unreachable for the whole session. Every cross-tab
 * caller (the Home व्रत tile, the vrat-reminder deep link, feature-tour
 * steps) must build its params through this helper rather than hand-rolling
 * the `{ screen, params }` shape.
 */
export function panchangTabTarget<T extends keyof PanchangStackParamList>(
  screen: T,
  params?: PanchangStackParamList[T]
): { screen: T; params?: PanchangStackParamList[T]; initial: false } {
  return { screen, params, initial: false };
}

const chalisaIds = new Set([
  'hanuman-chalisa',
  'shiv-chalisa',
  'durga-chalisa',
  'ganesh-chalisa',
  'gayatri-chalisa',
  'ram-chalisa',
  'krishna-chalisa',
  'vishnu-chalisa',
  'saraswati-chalisa',
]);

// Ashtakam (अष्टकम्) multi-instance form — one AshtakamReader dispatches on
// `ashtakamId`, mirroring the chalisa routing above (PRD-A). Derived from the
// data registry so new ashtakams route without touching this file (a hardcoded
// mirror here silently orphaned mahalakshmi-/surya-ashtakam from the library).
const ashtakamIds = new Set<string>(ashtakamIdList);

// Suktam (सूक्तम्) multi-instance form — one SuktamReader dispatches on `suktamId`.
const suktamIds = new Set(['devi-suktam', 'purusha-suktam', 'narayana-suktam']);

// Kavacham (कवच) multi-instance form — one KavachamReader dispatches on `kavachamId`.
const kavachamIds = new Set([
  'rama-raksha-stotra',
  'ganesha-kavacham',
  'shiva-kavacham',
  'durga-kavach',
]);

// Stuti (स्तुति) multi-instance form — one StutiReader dispatches on `stutiId`.
// Derived from the data registry (same rationale as ashtakamIds above).
const stutiIds = new Set<string>(stutiIdList);

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
  // Ram's aarti (library id 'ram-aarti') reuses the Ram Stuti content, so it
  // opens the same chapters/reader routes rather than the index-based AartiReader.
  'ram-aarti': 'RamStutiChapters',
  'ramcharitmanas': 'RamcharitmanasChapters',
  'valmiki-ramayan': 'ValmikiRamayanChapters',
  'sundarkand': 'SundarkandChapters',
  'bhagavad-gita': 'GitaChapters',
};

/**
 * How many chapters (subsections) each chaptered text actually ships, read
 * straight off the shipped manifests rather than mirrored by hand — a hardcoded
 * count here would go stale the moment a text gains or loses a chapter (the
 * same failure mode that once orphaned mahalakshmi-/surya-ashtakam above).
 * `texts.ts` already imports these modules to compute its verse counts, so this
 * adds no weight to the bundle.
 *
 * Used to skip the chapters index for single-chapter texts — see
 * `buildEntryStartTarget`.
 */
const chapterCountBySourceId: Record<string, number> = {
  'shiva-strotam': shivaStrotamChaptersManifest.length,
  'durga-stotram': durgaStotramChaptersManifest.length,
  'saraswati-stotram': saraswatiStotramChaptersManifest.length,
  'ganesh-stotram': ganeshStotramChaptersManifest.length,
  'vishnu-sahasranama': vishnuSahasranamaChaptersManifest.length,
  'hanuman-ashtak': hanumanAshtakChaptersManifest.length,
  'krishna-stotram': krishnaStotramChaptersManifest.length,
  'bajrang-baan': bajrangBaanChaptersManifest.length,
  'ram-stuti': ramStutiChaptersManifest.length,
  // ram-aarti reuses the Ram Stuti content, so it inherits its chapter count.
  'ram-aarti': ramStutiChaptersManifest.length,
  'ramcharitmanas': ramcharitmanasChaptersManifest.length,
  'valmiki-ramayan': valmikiRamayanChaptersManifest.length,
  'sundarkand': sundarkandChaptersManifest.length,
  'bhagavad-gita': gitaChaptersManifest.length,
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
  'ram-aarti': 'RamStutiReader',
  'ramcharitmanas': 'RamcharitmanasReader',
  'valmiki-ramayan': 'ValmikiRamayanReader',
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
  if (ashtakamIds.has(entry.id)) {
    return { screen: 'AshtakamReader', params: { initialIndex: 0, ashtakamId: entry.id } };
  }
  if (suktamIds.has(entry.id)) {
    return { screen: 'SuktamReader', params: { initialIndex: 0, suktamId: entry.id } };
  }
  if (kavachamIds.has(entry.id)) {
    return { screen: 'KavachamReader', params: { initialIndex: 0, kavachamId: entry.id } };
  }
  if (stutiIds.has(entry.id)) {
    return { screen: 'StutiReader', params: { initialIndex: 0, stutiId: entry.id } };
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
    // A single-chapter text has nothing to choose from: its chapters index is a
    // one-row list, so routing through it costs a second tap and shows no
    // information the card didn't already carry. Open the reader directly.
    // Every "open this text" surface starts here — the Home FOR TODAY row, the
    // By-Purpose discovery lists, search, category/deity lists, Rashifal — so
    // fixing it once fixes the two-tap open everywhere.
    const readerRoute = stotramReaderRouteBySourceId[entry.id];
    if (readerRoute && chapterCountBySourceId[entry.id] === 1) {
      return { screen: readerRoute, params: { chapter: 1, initialIndex: 0 } };
    }
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
  if (item.kind === 'vidhi') {
    // Vidhi screens live on the Panchang stack (PRD-19); the cross-tab
    // navigate bubbles up from the Home stack to the tab navigator.
    (nav.navigate as (name: string, params: object) => void)(
      'PanchangTab',
      panchangTabTarget('VidhiDetail', { vidhiId: item.sourceId })
    );
    return true;
  }
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

// (A `canResumeProgress` pre-check predicate mirroring navigateToProgress's
// branches lived here as the render gate of the retired Home continue-reading
// card — deleted with the card, design.md §49. navigateToProgress itself
// returns false for unroutable entries, which is the contract the remaining
// callers rely on.)
export function navigateToProgress(nav: Nav, progress: ReadingProgress): boolean {
  const sourceId = canonicalSourceId(progress.sourceId);
  if (chalisaIds.has(sourceId)) {
    nav.navigate('ChalisaReader', { initialIndex: progress.verseIndex, chalisaId: sourceId });
    return true;
  }
  if (ashtakamIds.has(sourceId)) {
    nav.navigate('AshtakamReader', { initialIndex: progress.verseIndex, ashtakamId: sourceId });
    return true;
  }
  if (suktamIds.has(sourceId)) {
    nav.navigate('SuktamReader', { initialIndex: progress.verseIndex, suktamId: sourceId });
    return true;
  }
  if (kavachamIds.has(sourceId)) {
    nav.navigate('KavachamReader', { initialIndex: progress.verseIndex, kavachamId: sourceId });
    return true;
  }
  if (stutiIds.has(sourceId)) {
    nav.navigate('StutiReader', { initialIndex: progress.verseIndex, stutiId: sourceId });
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
    // the user reach sibling chapters after resuming. Skipped for single-chapter
    // texts: there are no siblings to reach, so the push only strands the user on
    // a one-row list when they press back (same rule as buildEntryStartTarget).
    const chaptersRoute = stotramChaptersRouteById[sourceId];
    if (chaptersRoute && chapterCountBySourceId[sourceId] !== 1) {
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
  if (ashtakamIds.has(sourceId)) {
    return {
      screen: 'AshtakamReader',
      params: { initialIndex: p.verseIndex, ashtakamId: sourceId },
    };
  }
  if (suktamIds.has(sourceId)) {
    return {
      screen: 'SuktamReader',
      params: { initialIndex: p.verseIndex, suktamId: sourceId },
    };
  }
  if (kavachamIds.has(sourceId)) {
    return {
      screen: 'KavachamReader',
      params: { initialIndex: p.verseIndex, kavachamId: sourceId },
    };
  }
  if (stutiIds.has(sourceId)) {
    return {
      screen: 'StutiReader',
      params: { initialIndex: p.verseIndex, stutiId: sourceId },
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
