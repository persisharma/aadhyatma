import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import LanguageToggle from '@/components/LanguageToggle';
import ComicPage from '@/components/ComicPage';
import AutoSlideButton from '@/components/AutoSlideButton';
import { useAutoSlide } from './_useAutoSlide';
import { comicLanguage, comicPageIndex, comicPages, getComicBook } from '@/data/comicBooks';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

type Page = ReturnType<typeof comicPages>[number];
/** Reading-time allowance for a panel's artwork, in characters of text. */
const PANEL_LOOK_CHARS = 40;
export default function ComicReaderScreen({ route, navigation }: NativeStackScreenProps<HomeStackParamList, 'ComicReader'>) {
  const { lang } = useGitaLanguage();
  const language = comicLanguage(lang);
  const { colors, typography, spacing } = useTheme();
  const book = getComicBook(route.params.comicId);
  const pages = useMemo(() => book ? comicPages(book) : [], [book]);
  const start = book ? comicPageIndex(book, route.params.episodeId, route.params.panelId) : 0;
  const [index, setIndex] = useState(start);
  const routeAnchor = route.params.panelId ?? book?.episodes.find(e => e.id === route.params.episodeId)?.panels[0]?.id;
  const [anchor, setAnchor] = useState(routeAnchor);
  const { width } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(width);
  const pager = useRef<FlatList<Page>>(null);
  useEffect(() => {
    setIndex(start);
    setAnchor(routeAnchor);
    pager.current?.scrollToIndex({ index: start, animated: false });
  }, [book, start, routeAnchor]);
  const current = pages[index] ?? pages[0];
  // Paced on every panel's words plus a beat per panel to take in the art.
  const pageChars = useCallback((position: number) => {
    const page = pages[position];
    if (!page) return 0;
    return page.rows.flat().reduce((n, panel) => {
      const copy = panel[language];
      return n + PANEL_LOOK_CHARS + copy.narration.length + (copy.speaker?.length ?? 0) + (copy.dialogue?.length ?? 0);
    }, 0);
  }, [pages, language]);
  // Programmatic scrolls never fire onMomentumScrollEnd on iOS, so set the index too.
  const goToPage = useCallback((position: number) => {
    setAnchor(undefined);
    pager.current?.scrollToIndex({ index: position, animated: true });
    setIndex(position);
  }, []);
  const autoSlide = useAutoSlide({
    sourceId: `comic:${route.params.comicId}`,
    pageCount: pages.length,
    currentIndex: index,
    pageChars,
    goToPage,
    continuesPastEnd: false,
  });
  return <SafeAreaView testID="comic-native-reader" style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={book?.title[language] ?? ''} onBack={() => navigation.goBack()} sideWidth={60} style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 4, minHeight: 56 }} right={current &&
      <Text testID="comic-progress" style={{ ...typography.pageCounter, color: colors.inkMuted, textAlign: 'right', minWidth: 48 }}>{index + 1} / {pages.length}</Text>} />
    {book ? <>
      <ReadingProgressBar current={index + 1} total={pages.length} />
      <View style={{ paddingVertical: 8, justifyContent: 'center' }}>
        <View pointerEvents="box-none" style={{ position: 'absolute', left: spacing.readingGutter }}><AutoSlideButton control={autoSlide} floating={false} /></View>
        <LanguageToggle />
      </View>
      <View style={{ flex: 1 }} onLayout={event => { if (event.nativeEvent.layout.width > 0) setPageWidth(event.nativeEvent.layout.width); }}>
        <FlatList testID="comic-pager" key={pageWidth} ref={pager} CellRendererComponent={autoSlide.Cell} data={pages} extraData={{ language, typography }} keyExtractor={page => page.id}
          horizontal pagingEnabled directionalLockEnabled showsHorizontalScrollIndicator={false} initialScrollIndex={index}
          initialNumToRender={1} maxToRenderPerBatch={2} windowSize={3}
          getItemLayout={(_, position) => ({ length: pageWidth, offset: pageWidth * position, index: position })}
          onMomentumScrollEnd={event => { setAnchor(undefined); setIndex(Math.max(0, Math.min(pages.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)))); }}
          renderItem={({ item: page }) => <ComicPage page={page} width={pageWidth} language={language} comicId={route.params.comicId}
            anchor={page === current ? anchor : undefined} onUserScroll={() => setAnchor(undefined)} />} />
      </View>
    </> : <Text testID="comic-reader-error" style={{ ...meaningToken(lang, typography), color: colors.ink, padding: spacing.readingGutter }}>{pick(lang, { hi: 'कथा नहीं मिली।', en: 'Story not found.', gu: 'વાર્તા મળી નથી.', kn: 'ಕಥೆ ಸಿಗಲಿಲ್ಲ.' })}</Text>}
  </SafeAreaView>;
}
