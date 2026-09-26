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
  getGitaSaarChapter,
  gitaSaarChaptersManifest,
  gitaSaarTitleEn,
  gitaSaarTitleHi,
  type GitaSaarVerse,
} from '@/data/gita-saar';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import GitaSaarVersePage from '@/components/GitaSaarVersePage';
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

const SOURCE_ID = 'gita-saar';

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

type FlatListItem = GitaSaarVerse | NextTransitionItem | PrevTransitionItem;

type Props = NativeStackScreenProps<RootStackParamList, 'GitaSaarReader'>;

const DOT_COUNT = 5;

/**
 * गीता सार reader — the Gita reader shell (design.md §9) paged over one theme's
 * verses. A "chapter" is a theme; swiping past the last page crosses into the
 * next theme through the house transition cards, exactly as the Gita crosses
 * adhyāyas. Each page hands off into `GitaReader` on its own shloka.
 */
export default function GitaSaarReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getGitaSaarChapter, navigation, 'GitaSaarChapters');
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const isLastChapter = chapter == null ? true : chapter.chapter >= gitaSaarChaptersManifest.length;
  const isFirstChapter = chapter == null ? true : chapter.chapter <= 1;
  const data: FlatListItem[] = useMemo(() => {
    if (chapter == null) return [];
    const items: FlatListItem[] = [];
    if (!isFirstChapter) {
      const prev = gitaSaarChaptersManifest[chapter.chapter - 2];
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
      const next = gitaSaarChaptersManifest[chapter.chapter];
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

  // Before the null-chapter early return, so hook order stays stable.
  const readAloud = useReaderReadAloud({
    sourceId: SOURCE_ID,
    data,
    offset,
    verseCount,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    if (chapter == null) return;
    setProgress({
      sourceId: SOURCE_ID,
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
          navigation.replace('GitaSaarReader', { chapter: item.nextChapter });
        }, 400);
      }
      return;
    }
    if ('__type' in item && item.__type === 'prev-transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        setTimeout(() => {
          navigation.replace('GitaSaarReader', {
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
    (_: unknown, index: number) => ({ length: width, offset: width * index, index }),
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

  const topTitle = chapter
    ? contentByLang(lang, `${gitaSaarTitleHi} · ${chapter.titleHi}`, `${gitaSaarTitleEn} · ${chapter.titleEn}`)
    : '';

  const listExtraData = useMemo(() => ({ lang, bookmarks, shareBusy }), [lang, bookmarks, shareBusy]);

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
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={topTitle}
          onBack={() => navigation.goBack()}
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
          <AddToRoutineButton sourceId={SOURCE_ID} chapter={chapter.chapter} />
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
              const bookmarkId = `${SOURCE_ID}:${chapter.chapter}:${verseIdx}`;
              const isLastPage = verseIdx === verseCount - 1;
              return (
                <GitaSaarVersePage
                  verse={item}
                  sourceId={SOURCE_ID}
                  width={width}
                  closing={isLastPage ? { hi: chapter.closingHi, en: chapter.closingEn } : undefined}
                  onOpenInGita={() =>
                    navigation.navigate('GitaReader', {
                      chapter: item.gitaChapter,
                      initialIndex: item.gitaVerse - 1,
                    })
                  }
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
                              sourceId: SOURCE_ID,
                              chapter: chapter.chapter,
                              verseIndex: verseIdx,
                              savedAt: Date.now(),
                              previewHi: item.sanskrit.slice(0, 2).join(' '),
                              previewEn: item.transliteration.slice(0, 2).join(' '),
                            });
                          }
                        }}
                      />
                      <ShareButton
                        busy={shareBusy}
                        onPress={() => {
                          share(
                            {
                              sourceId: SOURCE_ID,
                              sectionNameHi: `${gitaSaarTitleHi} · ${chapter.titleHi}`,
                              sectionNameEn: `${gitaSaarTitleEn} · ${chapter.titleEn}`,
                              verseLabelHi: `श्लोक ${item.gitaChapter}.${item.gitaVerse}`,
                              verseLabelEn: `Verse ${item.gitaChapter}.${item.gitaVerse}`,
                              linesHi: [...item.sanskrit],
                              linesEn: [...item.transliteration],
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
