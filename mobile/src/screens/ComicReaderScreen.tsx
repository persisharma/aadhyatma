import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import LanguageToggle from '@/components/LanguageToggle';
import ComicPanel from '@/components/ComicPanel';
import ComicLanguageNotice from '@/components/ComicLanguageNotice';
import { comicLanguage, comicPageIndex, comicPages, getComicBook } from '@/data/comicBooks';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken } from '@/utils/langType';
import { pick } from '@/utils/localize';
import type { HomeStackParamList } from '@/navigation/types';

type Page = ReturnType<typeof comicPages>[number];
export default function ComicReaderScreen({ route, navigation }: NativeStackScreenProps<HomeStackParamList, 'ComicReader'>) {
  const { lang } = useGitaLanguage();
  const language = comicLanguage(lang);
  const { colors, typography, spacing } = useTheme();
  const book = getComicBook(route.params.comicId);
  const pages = useMemo(() => book ? comicPages(book) : [], [book]);
  const start = book ? comicPageIndex(book, route.params.episodeId, route.params.panelId) : 0;
  const [index, setIndex] = useState(start);
  const { width } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(width);
  const pager = useRef<FlatList<Page>>(null);
  useEffect(() => {
    setIndex(start);
    pager.current?.scrollToIndex({ index: start, animated: false });
  }, [book, start]);
  const current = pages[index] ?? pages[0];
  return <SafeAreaView testID="comic-native-reader" style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={current?.episode[language].title ?? ''} onBack={() => navigation.goBack()} sideWidth={60} style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 4, minHeight: 56 }} right={current &&
      <Text testID="comic-progress" style={{ ...typography.pageCounter, color: colors.inkMuted, textAlign: 'right', minWidth: 48 }}>{index + 1} / {pages.length}</Text>} />
    {book ? <>
      <ReadingProgressBar current={index + 1} total={pages.length} />
      <View style={{ paddingVertical: 8 }}><LanguageToggle compact /></View>
      <ComicLanguageNotice />
      <View style={{ flex: 1 }} onLayout={event => { if (event.nativeEvent.layout.width > 0) setPageWidth(event.nativeEvent.layout.width); }}>
        <FlatList testID="comic-pager" key={pageWidth} ref={pager} data={pages} extraData={{ language, typography }} keyExtractor={page => page.panel.id}
          horizontal pagingEnabled directionalLockEnabled showsHorizontalScrollIndicator={false} initialScrollIndex={index}
          initialNumToRender={1} maxToRenderPerBatch={2} windowSize={3}
          getItemLayout={(_, position) => ({ length: pageWidth, offset: pageWidth * position, index: position })}
          onMomentumScrollEnd={event => setIndex(Math.max(0, Math.min(pages.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth))))}
          renderItem={({ item: page }) => <ScrollView testID={`comic-page-${page.panel.id}`} directionalLockEnabled nestedScrollEnabled style={{ width: pageWidth, flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 8, gap: 6 }}>
            {page.episodeIndex === 0 && !!page.episode[language].framing && <Text style={{ ...meaningToken(language, typography), color: colors.inkSoft, paddingHorizontal: 8 }}>{page.episode[language].framing}</Text>}
            <ComicPanel panel={page.panel} language={language} />
          </ScrollView>} />
      </View>
    </> : <Text testID="comic-reader-error" style={{ ...meaningToken(lang, typography), color: colors.ink, padding: spacing.readingGutter }}>{pick(lang, { hi: 'कथा नहीं मिली।', en: 'Story not found.', gu: 'વાર્તા મળી નથી.', kn: 'ಕಥೆ ಸಿಗಲಿಲ್ಲ.' })}</Text>}
  </SafeAreaView>;
}
