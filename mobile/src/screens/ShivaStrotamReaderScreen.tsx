import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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
import {
  getShivaStrotamChapter,
  shivaStrotamChaptersManifest,
  type ShivaStrotamVerse,
} from '@/data/shiva-strotam';
import { useGitaLanguage } from '@/data/gita/language';
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

type FlatListItem = ShivaStrotamVerse | NextTransitionItem | PrevTransitionItem;

type Props = NativeStackScreenProps<RootStackParamList, 'ShivaStrotamReader'>;

const DOT_COUNT = 5;

export default function ShivaStrotamReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getShivaStrotamChapter, navigation, 'ShivaStrotamChapters');
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const isLastChapter =
    chapter == null ? true : chapter.chapter >= shivaStrotamChaptersManifest.length;
  const isFirstChapter = chapter == null ? true : chapter.chapter <= 1;
  const data: FlatListItem[] = useMemo(() => {
    if (chapter == null) return [];
    const items: FlatListItem[] = [];
    if (!isFirstChapter) {
      const prev = shivaStrotamChaptersManifest[chapter.chapter - 2];
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
      const next = shivaStrotamChaptersManifest[chapter.chapter];
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
  const listRef = useRef<FlatList<FlatListItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const hasNavigatedRef = useRef(false);

  // Called before the null-chapter early return below, so hook order stays stable;
  // with no chapter it simply has zero pages to speak.
  const readAloud = useReaderReadAloud({
    sourceId: 'shiva-strotam',
    data,
    offset,
    verseCount,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    if (chapter == null) return;
    setProgress({
      sourceId: 'shiva-strotam',
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
        setTimeout(() => {
          navigation.replace('ShivaStrotamReader', { chapter: item.nextChapter });
        }, 400);
      }
      return;
    }
    if ('__type' in item && item.__type === 'prev-transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        setTimeout(() => {
          navigation.replace('ShivaStrotamReader', {
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
    const buckets = Math.max(1, Math.ceil(verseCount / DOT_COUNT));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [verseCount, currentIndex]);

  const topTitle = chapter ? contentByLang(lang, chapter.titleHi, chapter.titleEn) : '';

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

  // Re-render visible pages when the language flips, a bookmark toggles, or a
  // share is in flight — the in-page header actions depend on all three.
  const listExtraData = useMemo(
    () => ({ lang, bookmarks, shareBusy }),
    [lang, bookmarks, shareBusy]
  );

  if (!chapter) return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={topTitle}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel="Back to stotram list"
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

        <View style={[styles.toggleRow, { flexDirection: 'row', justifyContent: 'center', gap: 18 }]}>
          <LanguageToggle />
          <AddToRoutineButton sourceId="shiva-strotam" chapter={chapter.chapter} />
          {/* Pinned right so the toggle group stays centred (design.md §56.2). */}
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
              // List index includes the prev-transition card; bookmark ids stay
              // keyed by the verse index within the chapter.
              const verseIndex = index - offset;
              const isIntro = item.number === 0;
              return (
                <ShivaStrotamVersePage
                  verse={item}
                  sourceId="shiva-strotam"
                  width={width}
                  topActions={
                    <>
                      <BookmarkButton
                        isBookmarked={isBookmarked(`shiva-strotam:${chapter.chapter}:${verseIndex}`)}
                        onToggle={() => {
                          const id = `shiva-strotam:${chapter.chapter}:${verseIndex}`;
                          if (isBookmarked(id)) {
                            removeBookmark(id);
                          } else {
                            addBookmark({
                              id,
                              sourceId: 'shiva-strotam',
                              chapter: chapter.chapter,
                              verseIndex,
                              savedAt: Date.now(),
                              previewHi: item.sanskrit[0] ?? '',
                              previewEn: item.linesEn[0] ?? '',
                            });
                          }
                        }}
                      />
                      <ShareButton
                        busy={shareBusy}
                        onPress={() => {
                          share(
                            {
                              sourceId: 'shiva-strotam',
                              sectionNameHi: chapter.titleHi,
                              sectionNameEn: chapter.titleEn,
                              verseLabelHi: isIntro ? 'परिचय' : `श्लोक ${item.chapter}.${item.number}`,
                              verseLabelEn: isIntro ? 'Introduction' : `Verse ${item.chapter}.${item.number}`,
                              linesHi: [...item.sanskrit],
                              linesEn: [...item.linesEn],
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
    paddingVertical: 6,
    paddingBottom: 12,
    alignItems: 'center',
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
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
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
