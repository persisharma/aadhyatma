import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View, useWindowDimensions, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { getDurgaStotramChapter, durgaStotramChaptersManifest, type DurgaStotramVerse } from '@/data/durga-stotram';
import { useGitaLanguage } from '@/data/gita/language';
import { titleFontByLang } from '@/utils/langType';
import { contentByLang } from '@/utils/localize';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import NextChapterCard from '@/components/NextChapterCard';
import PrevChapterCard from '@/components/PrevChapterCard';
import ShivaStrotamVersePage from '@/components/ShivaStrotamVersePage';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import { useSafeChapter } from './_useSafeChapter';
import type { HomeStackParamList } from '@/navigation/types';

type NextTransitionItem = {
  __type: 'transition';
  id: string;
  nextChapter: number;
  nextTitleHi: string;
  nextTitleEn: string;
};

type PrevTransitionItem = {
  __type: 'prev-transition';
  id: string;
  prevChapter: number;
  prevTitleHi: string;
  prevTitleEn: string;
  prevVerseCount: number;
};

type FlatListItem = DurgaStotramVerse | NextTransitionItem | PrevTransitionItem;

type Props = NativeStackScreenProps<HomeStackParamList, 'DurgaStotramReader'>;

const DOT_COUNT = 5;

export default function DurgaStotramReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getDurgaStotramChapter, navigation, 'DurgaStotramChapters');
  const listRef = useRef<FlatList<FlatListItem>>(null);
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const isLastChapter = chapter == null ? true : chapter.chapter >= durgaStotramChaptersManifest.length;
  const isFirstChapter = chapter == null ? true : chapter.chapter <= 1;
  const data: FlatListItem[] = useMemo(() => {
    if (chapter == null) return [];
    const items: FlatListItem[] = [];
    if (!isFirstChapter) {
      const prev = durgaStotramChaptersManifest[chapter.chapter - 2];
      if (prev) {
        items.push({
          __type: 'prev-transition' as const,
          id: 'transition-prev',
          prevChapter: chapter.chapter - 1,
          prevTitleHi: prev.titleHi,
          prevTitleEn: prev.titleEn,
          prevVerseCount: prev.verseCount,
        });
      }
    }
    items.push(...chapter.verses);
    if (!isLastChapter) {
      const next = durgaStotramChaptersManifest[chapter.chapter];
      if (next) {
        items.push({
          __type: 'transition' as const,
          id: 'transition-next',
          nextChapter: chapter.chapter + 1,
          nextTitleHi: next.titleHi,
          nextTitleEn: next.titleEn,
        });
      }
    }
    return items;
  }, [chapter, isFirstChapter, isLastChapter]);
  const offset = isFirstChapter ? 0 : 1;
  const hasNavigatedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (chapter == null) return;
    setProgress({ sourceId: 'durga-stotram', chapter: chapter.chapter, verseIndex: currentIndex, updatedAt: Date.now() });
  }, [chapter, currentIndex, setProgress]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length === 0) return;
    const first = viewableItems[0];
    if (first.index == null) return;
    const item = first.item as FlatListItem;
    if ('__type' in item && item.__type === 'transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        setTimeout(() => {
          navigation.replace('DurgaStotramReader', { chapter: item.nextChapter });
        }, 400);
      }
      return;
    }
    if ('__type' in item && item.__type === 'prev-transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        setTimeout(() => {
          navigation.replace('DurgaStotramReader', { chapter: item.prevChapter, initialIndex: item.prevVerseCount - 1 });
        }, 400);
      }
      return;
    }
    const verseIdx = first.index - offset;
    setCurrentIndex((prev) => {
      if (prev !== verseIdx) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      return verseIdx >= 0 ? verseIdx : prev;
    });
  }).current;

  const getItemLayout = useCallback((_: unknown, index: number) => ({ length: width, offset: width * index, index }), [width]);

  const goToStart = useCallback(() => {
    listRef.current?.scrollToIndex({ index: offset, animated: true });
    setCurrentIndex(0);
  }, [offset]);

  const dotStyles = useMemo(() => {
    const buckets = Math.max(1, Math.ceil(verseCount / DOT_COUNT));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [verseCount, currentIndex]);

  const topTitle = chapter ? (contentByLang(lang, chapter.titleHi, chapter.titleEn)) : '';

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / width) - offset;
    setCurrentIndex((prev) => {
      if (prev !== idx && idx >= 0 && idx < verseCount) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        return idx;
      }
      return prev;
    });
  }, [width, verseCount, offset]);

  if (!chapter) return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.topSide}>
            <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={16} style={({ pressed }) => [styles.back, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }, pressed && { opacity: 0.7 }]}>
              <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
            </Pressable>
          </View>
          <Text style={[styles.title, { color: colors.ink, fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize, fontStyle: lang === 'en' ? 'italic' : 'normal' }]} numberOfLines={1}>
            {topTitle}
          </Text>
          <View style={[styles.topSide, { alignItems: 'flex-end' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.counter, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize, fontStyle: 'italic' }]}>
                {currentIndex + 1} / {verseCount}
              </Text>
              <BookmarkButton
                isBookmarked={isBookmarked(`durga-stotram:${chapter.chapter}:${currentIndex}`)}
                onToggle={() => {
                  const id = `durga-stotram:${chapter.chapter}:${currentIndex}`;
                  if (isBookmarked(id)) { removeBookmark(id); }
                  else {
                    const v = chapter.verses[currentIndex];
                    addBookmark({ id, sourceId: 'durga-stotram', chapter: chapter.chapter, verseIndex: currentIndex, savedAt: Date.now(), previewHi: v.sanskrit[0] ?? '', previewEn: v.linesEn[0] ?? '' });
                  }
                }}
              />
              <ShareButton
                busy={shareBusy}
                onPress={() => {
                  const v = chapter.verses[currentIndex];
                  const isIntro = v.number === 0;
                  share(
                    {
                      sourceId: 'durga-stotram',
                      sectionNameHi: chapter.titleHi,
                      sectionNameEn: chapter.titleEn,
                      verseLabelHi: isIntro ? 'परिचय' : `श्लोक ${v.chapter}.${v.number}`,
                      verseLabelEn: isIntro ? 'Introduction' : `Verse ${v.chapter}.${v.number}`,
                      linesHi: [...v.sanskrit],
                      linesEn: [...v.linesEn],
                      meaningHi: v.meaningHi,
                      meaningEn: v.meaningEn,
                    },
                    lang
                  );
                }}
              />
            </View>
          </View>
        </View>

        <ReadingProgressBar current={currentIndex + 1} total={verseCount} />

        <View style={[styles.toggleRow, { flexDirection: 'row', justifyContent: 'center', gap: 18 }]}><LanguageToggle /><AddToRoutineButton sourceId="durga-stotram" chapter={chapter.chapter} /></View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if ('__type' in item && item.__type === 'transition') {
                return <NextChapterCard width={width} nextTitle={contentByLang(lang, item.nextTitleHi, item.nextTitleEn)} lang={lang} />;
              }
              if ('__type' in item && item.__type === 'prev-transition') {
                return <PrevChapterCard width={width} prevTitle={contentByLang(lang, item.prevTitleHi, item.prevTitleEn)} lang={lang} />;
              }
              return <ShivaStrotamVersePage verse={item} sourceId="durga-stotram" width={width} />;
            }}
            extraData={lang}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialNumToRender={1}
            windowSize={3}
            removeClippedSubviews
            maxToRenderPerBatch={2}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={getItemLayout}
            initialScrollIndex={initialIndex + offset}
            onScrollToIndexFailed={() => undefined}
            style={styles.list}
          />
          {currentIndex > 0 && <JumpToStartButton onPress={goToStart} lang={lang} />}
          <View style={styles.dotsOverlay}>
            <View style={styles.dots}>
              {dotStyles.map((isCurrent, i) => (
                <View key={i} style={isCurrent ? [styles.dotCurrent, { backgroundColor: colors.saffronDeep }] : [styles.dot, { backgroundColor: colors.dotRest }]} />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topSide: { width: 120, flexDirection: 'row', alignItems: 'center' },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { fontSize: 22, lineHeight: 24, marginTop: -2, includeFontPadding: false },
  title: { flex: 1, textAlign: 'center', includeFontPadding: false, marginHorizontal: 4 },
  counter: { includeFontPadding: false, minWidth: 48, textAlign: 'right' },
  toggleRow: { paddingVertical: 6, paddingBottom: 12, alignItems: 'center' },
  listContainer: { flex: 1 },
  list: { flex: 1 },
  dotsOverlay: { position: 'absolute', bottom: 4, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
