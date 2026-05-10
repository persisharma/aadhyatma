import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { LibraryEntry } from '@/data/texts';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import type { HomeStackParamList } from './types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const aartiIndexById: Record<string, number> = {
  'om-jai-jagdish': 0,
  'hanuman-aarti': 1,
  'sankat-mochan': 2,
  'jai-ganesh-deva': 3,
  'om-jai-shiv-omkara': 4,
  'jai-ambe-gauri': 5,
  'aarti-kunj-bihari': 6,
};

const chalisaIds = new Set(['hanuman-chalisa', 'shiv-chalisa', 'durga-chalisa', 'ganesh-chalisa']);

const stotramChaptersRouteById: Record<string, keyof HomeStackParamList> = {
  'shiva-strotam': 'ShivaStrotamChapters',
  'durga-stotram': 'DurgaStotramChapters',
  'ganesh-stotram': 'GaneshStotramChapters',
  'vishnu-sahasranama': 'VishnuSahasranamaChapters',
  'hanuman-ashtak': 'HanumanAshtakChapters',
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
  'ram-stuti': 'RamStutiReader',
  'ramcharitmanas': 'RamcharitmanasReader',
  'sundarkand': 'SundarkandReader',
  'bhagavad-gita': 'GitaReader',
};

export function navigateToEntryStart(nav: Nav, entry: LibraryEntry): void {
  if (entry.category === 'japam') {
    nav.navigate('JapamCounter', { mantraId: entry.id });
    return;
  }
  if (chalisaIds.has(entry.id)) {
    nav.navigate('ChalisaReader', { initialIndex: 0, chalisaId: entry.id });
    return;
  }
  const aartiIndex = aartiIndexById[entry.id];
  if (aartiIndex != null) {
    nav.navigate('AartiReader', { aartiIndex });
    return;
  }
  const chaptersRoute = stotramChaptersRouteById[entry.id];
  if (chaptersRoute) {
    (nav.navigate as (name: keyof HomeStackParamList) => void)(chaptersRoute);
    return;
  }
}

export function navigateToProgress(nav: Nav, progress: ReadingProgress): void {
  if (chalisaIds.has(progress.sourceId)) {
    nav.navigate('ChalisaReader', { initialIndex: progress.verseIndex, chalisaId: progress.sourceId });
    return;
  }
  const aartiIndex = aartiIndexById[progress.sourceId];
  if (aartiIndex != null) {
    nav.navigate('AartiReader', { aartiIndex, initialIndex: progress.verseIndex });
    return;
  }
  const readerRoute = stotramReaderRouteBySourceId[progress.sourceId];
  if (readerRoute && progress.chapter != null) {
    (nav.navigate as (name: keyof HomeStackParamList, params: object) => void)(readerRoute, {
      chapter: progress.chapter,
      initialIndex: progress.verseIndex,
    });
    return;
  }
}
