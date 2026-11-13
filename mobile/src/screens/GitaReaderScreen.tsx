import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
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
import { getGitaChapter, gitaChaptersManifest, type GitaVerse } from '@/data/gita';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReadDwell } from './_useReadDwell';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import GitaVersePage from '@/components/GitaVersePage';
import NextChapterCard from '@/components/NextChapterCard';
import PrevChapterCard from '@/components/PrevChapterCard';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import { clampIndex } from '@/utils/clamp';
import { contentByLang, pick } from '@/utils/localize';
import AppIcon from '@/components/AppIcon';
import ReaderHeader from '@/components/ReaderHeader';
import GitaVerseJumpSheet, { JUMP_LABEL } from '@/components/GitaVerseJumpSheet';
import { useShare } from '@/utils/shareVerse';
import { useSafeChapter } from './_useSafeChapter';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import AutoSlideButton from '@/components/AutoSlideButton';
import { useReaderPlayback } from './_useAutoSlide';
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

type FlatListItem = GitaVerse | NextTransitionItem | PrevTransitionItem;

type Props = NativeStackScreenProps<RootStackParamList, 'GitaReader'>;

const DOT_COUNT = 5;

export default function GitaReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getGitaChapter, navigation, 'GitaChapters');
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const isLastChapter =
    chapter == null ? true : chapter.chapter >= gitaChaptersManifest.length;
  const isFirstChapter = chapter == null ? true : chapter.chapter <= 1;
  const data: FlatListItem[] = useMemo(() => {
    if (chapter == null) return [];
    const items: FlatListItem[] = [];
    if (!isFirstChapter) {
      const prev = gitaChaptersManifest[chapter.chapter - 2];
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
      const next = gitaChaptersManifest[chapter.chapter];
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
  const [jumpVisible, setJumpVisible] = useState(false);
  const jumpVisibleRef = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  // Called before the null-chapter early return below, so hook order stays stable;
  // with no chapter it simply has zero pages to speak.
  const { readAloud, autoSlide } = useReaderPlayback({
    sourceId: 'bhagavad-gita',
    data,
    offset,
    verseCount,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    if (chapter == null) return;
    setProgress({
      sourceId: 'bhagavad-gita',
      chapter: chapter.chapter,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
  }, [chapter, currentIndex, setProgress]);
  useReadDwell('bhagavad-gita', chapter?.chapter, chapter && !jumpVisible ? currentIndex : -1);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (jumpVisibleRef.current || hasNavigatedRef.current || viewableItems.length === 0) return;
    const first = viewableItems[0];
    if (first.index == null) return;
    const item = first.item as FlatListItem;
    if ('__type' in item && item.__type === 'transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        transitionTimer.current = setTimeout(() => {
          navigation.replace('GitaReader', { chapter: item.nextChapter });
        }, 400);
      }
      return;
    }
    if ('__type' in item && item.__type === 'prev-transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        transitionTimer.current = setTimeout(() => {
          navigation.replace('GitaReader', {
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

  const topTitle = chapter
    ? contentByLang(
        lang,
        `अध्याय ${chapter.chapter} · ${chapter.titleHi}`,
        `Chapter ${chapter.chapter} · ${chapter.titleEn}`
      )
    : '';

  const listExtraData = useMemo(
    () => ({ lang, bookmarks, shareBusy }),
    [lang, bookmarks, shareBusy]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (jumpVisibleRef.current || hasNavigatedRef.current) return;
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

  const openJump = () => {
    if (hasNavigatedRef.current) return;
    jumpVisibleRef.current = true;
    readAloud.stop();
    autoSlide.stop();
    setJumpVisible(true);
  };
  const closeJump = () => {
    jumpVisibleRef.current = false;
    setJumpVisible(false);
  };
  const jumpToVerse = (targetChapter: number, targetVerse: number): boolean => {
    if (hasNavigatedRef.current) return true;
    // Resolve only the chosen chapter, and locate the actual verse number. Never
    // scroll through skipped pages or substitute a clamped, incorrect target.
    try {
      const target = getGitaChapter(targetChapter);
      const index = target.verses.findIndex(verse => verse.number === targetVerse);
      if (index < 0) return false;
      readAloud.stop();
      autoSlide.stop();
      hasNavigatedRef.current = true;
      navigation.replace('GitaReader', { chapter: targetChapter, initialIndex: index });
      return true;
    } catch {
      hasNavigatedRef.current = false;
      return false;
    }
  };

  if (!chapter) return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={topTitle}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel="Back to chapters"
          // Keep the original counter text; the surrounding target opens the picker.
          sideWidth={60}
          right={
            <Pressable testID="gita-jump-trigger" accessibilityRole="button"
              accessibilityLabel={pick(lang, JUMP_LABEL)}
              accessibilityValue={{ text: `${chapter.chapter}.${currentIndex + 1}` }}
              onPress={openJump} style={styles.counterTarget}>
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
            <AppIcon name="caretDown" size={12} color={colors.saffronDeep} />
            </Pressable>
          }
        />

        <ReadingProgressBar current={currentIndex + 1} total={verseCount} />

        <View style={styles.toggleRow}>
          <LanguageToggle />
          <AddToRoutineButton sourceId="bhagavad-gita" chapter={chapter.chapter} />
          {/* Pinned to the right edge so the toggle group stays centred; the read-aloud
              pill (▶ + "सुनें") sits inline with the toggle, clear of the progress bar. */}
          <View style={styles.readAloudSlot}>
            <ReadAloudButton control={readAloud} />
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            CellRendererComponent={autoSlide.Cell}
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
              const bookmarkId = `bhagavad-gita:${chapter.chapter}:${verseIdx}`;
              return (
                <GitaVersePage
                  showIllustration={verseIdx === 0}
                  verse={item}
                  sourceId="bhagavad-gita"
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
                              sourceId: 'bhagavad-gita',
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
                              sourceId: 'bhagavad-gita',
                              verseIndex: verseIdx,
                              sectionNameHi: 'भगवद् गीता',
                              sectionNameEn: 'Bhagavad Gītā',
                              verseLabelHi: `श्लोक ${item.chapter}.${item.number}`,
                              verseLabelEn: `Verse ${item.chapter}.${item.number}`,
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
            scrollEnabled={!jumpVisible}
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
          <AutoSlideButton control={autoSlide} />

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
      {jumpVisible && <GitaVerseJumpSheet chapter={chapter.chapter}
        verse={chapter.verses[currentIndex].number} onClose={closeJump} onOpen={jumpToVerse} />}
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
  counterTarget: { minHeight: 48, minWidth: 60, flexDirection: 'row', alignItems: 'center', gap: 4 },
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
