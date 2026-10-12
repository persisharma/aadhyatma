import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { getGarudPuranChapter, garudPuranChaptersManifest, type GarudPuranPage } from '@/data/garud-puran';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import GarudPuranPageView from '@/components/GarudPuranPage';
import NextChapterCard from '@/components/NextChapterCard';
import PrevChapterCard from '@/components/PrevChapterCard';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import { clampIndex } from '@/utils/clamp';
import { contentByLang } from '@/utils/localize';
import ReaderHeader from '@/components/ReaderHeader';
import { useShare } from '@/utils/shareVerse';
import { useSafeChapter } from './_useSafeChapter';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderReadAloud } from './_useReaderReadAloud';
import type { RootStackParamList } from '@/navigation/types';

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

type FlatListItem = GarudPuranPage | NextTransitionItem | PrevTransitionItem;

type Props = NativeStackScreenProps<RootStackParamList, 'GarudPuranReader'>;

const DOT_COUNT = 3;

export default function GarudPuranReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getGarudPuranChapter, navigation, 'GarudPuranChapters');
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const chapterPosition = garudPuranChaptersManifest.findIndex(row => row.chapter === chapter?.chapter);
  const isLastChapter = chapterPosition < 0 || chapterPosition === garudPuranChaptersManifest.length - 1;
  const isFirstChapter = chapterPosition <= 0;
  const data: FlatListItem[] = useMemo(() => {
    if (chapter == null) return [];
    const items: FlatListItem[] = [];
    if (!isFirstChapter) {
      const prev = garudPuranChaptersManifest[chapterPosition - 1];
      if (prev) {
        items.push({
          __type: 'prev-transition' as const,
          id: 'transition-prev',
          prevChapter: prev.chapter,
          prevTitleHi: prev.titleHi,
          prevTitleEn: prev.titleEn,
          prevVerseCount: prev.verseCount,
        });
      }
    }
    items.push(...chapter.verses);
    if (!isLastChapter) {
      const next = garudPuranChaptersManifest[chapterPosition + 1];
      if (next) {
        items.push({
          __type: 'transition' as const,
          id: 'transition-next',
          nextChapter: next.chapter,
          nextTitleHi: next.titleHi,
          nextTitleEn: next.titleEn,
        });
      }
    }
    return items;
  }, [chapter, chapterPosition, isFirstChapter, isLastChapter]);

  const offset = isFirstChapter ? 0 : 1;
  const listRef = useRef<FlatList<FlatListItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const hasNavigatedRef = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); }, []);

  // Called before the null-chapter early return below, so hook order stays stable;
  // with no chapter it simply has zero pages to speak.
  const readAloud = useReaderReadAloud({
    sourceId: 'garud-puran',
    data,
    offset,
    verseCount,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    if (chapter == null) return;
    setProgress({
      sourceId: 'garud-puran',
      chapter: chapter.chapter,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
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
        transitionTimer.current = setTimeout(() => {
          navigation.replace('GarudPuranReader', { chapter: item.nextChapter });
        }, 400);
      }
      return;
    }
    if ('__type' in item && item.__type === 'prev-transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        transitionTimer.current = setTimeout(() => {
          navigation.replace('GarudPuranReader', {
            chapter: item.prevChapter,
            initialIndex: item.prevVerseCount - 1,
          });
        }, 400);
      }
      return;
    }
    const verseIdx = first.index - offset;
    setCurrentIndex((prev) => {
      if (prev !== verseIdx) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }
      return verseIdx >= 0 ? verseIdx : prev;
    });
  }).current;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  const goToStart = useCallback(() => {
    listRef.current?.scrollToIndex({ index: offset, animated: true });
    setCurrentIndex(0);
  }, [offset]);

  const dotStyles = useMemo(() => {
    const dotCount = Math.min(DOT_COUNT, verseCount);
    const buckets = Math.max(1, Math.ceil(verseCount / Math.max(1, dotCount)));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: dotCount }, (_, i) => i === active);
  }, [verseCount, currentIndex]);

  const topTitle = chapter
    ? contentByLang(
        lang,
        `पाठ ${chapter.chapter} · ${chapter.titleHi}`,
        `Reading ${chapter.chapter} · ${chapter.titleEn}`
      )
    : '';

  const listExtraData = useMemo(
    () => ({ lang, bookmarks, shareBusy }),
    [lang, bookmarks, shareBusy]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / width) - offset;
      if (idx < 0 || idx >= verseCount) return;
      setCurrentIndex((prev) => {
        if (prev !== idx) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          return idx;
        }
        return prev;
      });
    },
    [width, verseCount, offset]
  );

  if (!chapter) return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        <Image source={require('../../assets/garud-puran/reading-parchment.webp')} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessible={false} />
      </View>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          title={topTitle}
          onBack={() => navigation.popTo('GarudPuranChapters')}
          backAccessibilityLabel="Back to readings"
          // Bare counter only — the read-aloud control now lives on the toggle row.
          sideWidth={60}
          right={
            <Text
              style={[
                styles.counter,
                {
                  color: colors.inkMuted,
                  fontFamily: typography.pageCounter.fontFamily,
                  fontSize: typography.pageCounter.fontSize,
                  fontStyle: 'italic',
                },
              ]}
            >
              {currentIndex + 1} / {verseCount}
            </Text>
          }
        />

        <ReadingProgressBar current={currentIndex + 1} total={verseCount} />

        <View style={styles.toggleRow}>
          <LanguageToggle />
          <AddToRoutineButton sourceId="garud-puran" chapter={chapter.chapter} />
          {/* Pinned to the right edge so the toggle group stays centred; the read-aloud
              pill (▶ + "सुनें") sits inline with the toggle, clear of the progress bar. */}
          <View style={styles.readAloudSlot}>
            <ReadAloudButton control={readAloud} />
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              if ('__type' in item && item.__type === 'transition') {
                return (
                  <NextChapterCard
                    width={width}
                    nextTitle={contentByLang(lang, item.nextTitleHi, item.nextTitleEn)}
                    lang={lang}
                  />
                );
              }
              if ('__type' in item && item.__type === 'prev-transition') {
                return (
                  <PrevChapterCard
                    width={width}
                    prevTitle={contentByLang(lang, item.prevTitleHi, item.prevTitleEn)}
                    lang={lang}
                  />
                );
              }
              const verseIdx = index - offset;
              const bookmarkId = `garud-puran:${chapter.chapter}:${verseIdx}`;
              return (
                <GarudPuranPageView
                  verse={item}
                  source={chapter.source}
                  width={width}
                  topActions={
                    <>
                      <BookmarkButton
                        isBookmarked={isBookmarked(bookmarkId)}
                        onToggle={() => {
                          if (isBookmarked(bookmarkId)) {
                            removeBookmark(bookmarkId);
                          } else {
                            addBookmark({
                              id: bookmarkId,
                              sourceId: 'garud-puran',
                              chapter: chapter.chapter,
                              verseIndex: verseIdx,
                              savedAt: Date.now(),
                              previewHi: item.titleHi,
                              previewEn: item.titleEn,
                            });
                          }
                        }}
                      />
                      <ShareButton
                        busy={shareBusy}
                        onPress={() => {
                          share(
                            {
                              sourceId: 'garud-puran',
                              sectionNameHi: 'गरुड़ पुराण — चयनित व्याख्या',
                              sectionNameEn: 'Garud Puran — selected editorial reading',
                              verseLabelHi: `${chapter.source.citeHi} · ${item.titleHi}`,
                              verseLabelEn: `${chapter.source.citeEn} · ${item.titleEn}`,
                              linesHi: [item.titleHi],
                              linesEn: [item.titleEn],
                              meaningHi: item.meaningHi,
                              meaningEn: item.meaningEn,
                            },
                            lang
                          );
                        }}
                      />
                    </>
                  }
                />
              );
            }}
            extraData={listExtraData}
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
                <View
                  key={i}
                  style={
                    isCurrent
                      ? [styles.dotCurrent, { backgroundColor: colors.saffronDeep }]
                      : [styles.dot, { backgroundColor: colors.dotRest }]
                  }
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  counter: {
    includeFontPadding: false,
    minWidth: 48,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingTop: 6,
    paddingBottom: 12,
  },
  readAloudSlot: {
    position: 'absolute',
    right: 16,
    top: 6,
    bottom: 12,
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  dotsOverlay: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotCurrent: {
    width: 18,
    height: 6,
    borderRadius: 999,
  },
});
