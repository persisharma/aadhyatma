import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
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
  loadValmikiRamayanChapter,
  valmikiRamayanChaptersManifest,
  valmikiRamayanTitleEn,
  valmikiRamayanTitleHi,
  type ValmikiRamayanChapter,
  type ValmikiRamayanVerse,
} from '@/data/valmiki-ramayan';
import { useGitaLanguage } from '@/data/gita/language';
import ReaderHeader from '@/components/ReaderHeader';
import { contentByLang } from '@/utils/localize';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReadDwell } from './_useReadDwell';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import NextChapterCard from '@/components/NextChapterCard';
import PrevChapterCard from '@/components/PrevChapterCard';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import ValmikiRamayanVersePage from '@/components/ValmikiRamayanVersePage';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import { useValmikiChapter } from './_useValmikiChapter';
import { fontFamilies } from '@/theme/typography';
import { isLatinLang, scriptTitleFont, titleFontByLang } from '@/utils/langType';
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

type FlatListItem = ValmikiRamayanVerse | NextTransitionItem | PrevTransitionItem;

type Props = NativeStackScreenProps<RootStackParamList, 'ValmikiRamayanReader'>;

const SOURCE_ID = 'valmiki-ramayan';
const DOT_COUNT = 5;

/** How close to the end of a kāṇḍa the next one starts loading. */
const PRELOAD_NEXT_WITHIN = 8;

/**
 * The kāṇḍa is loaded, not required (see `data/valmiki-ramayan/index.ts`), so
 * the screen is two components. This one owns the load and its two extra
 * states. `LoadedReader` below is the reader exactly as it was, mounted only
 * once its kāṇḍa is in memory — every piece of its state (the opening verse,
 * the resume position it reports) is therefore initialised from real data, as
 * it was when the kāṇḍa arrived synchronously. Keyed by kāṇḍa so a route that
 * is re-targeted in place starts that state afresh.
 */
export default function ValmikiRamayanReaderScreen({ navigation, route }: Props) {
  const state = useValmikiChapter(route.params.chapter, navigation, 'ValmikiRamayanChapters');
  if (state.status === 'ready') {
    return <LoadedReader key={state.chapter.chapter} chapter={state.chapter} navigation={navigation} route={route} />;
  }
  return <ChapterPending state={state} onBack={() => navigation.goBack()} />;
}

/**
 * What the reader shows while its kāṇḍa is not in memory. The header stays, so
 * Back works throughout. A bad chapter number keeps the plain parchment it
 * always had while it is redirected.
 */
function ChapterPending({
  state,
  onBack,
}: {
  state: { status: 'loading' } | { status: 'failed'; retry: () => void } | { status: 'invalid' };
  onBack: () => void;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  if (state.status === 'invalid') return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;
  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={contentByLang(lang, valmikiRamayanTitleHi, valmikiRamayanTitleEn)}
          onBack={onBack}
          backAccessibilityLabel="Back to chapters"
        />
        {state.status === 'loading' ? (
          <View
            testID="valmiki-chapter-loading"
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={contentByLang(lang, 'खुल रहा है', 'Opening')}
            style={styles.pending}
          >
            <ActivityIndicator color={colors.saffron} />
          </View>
        ) : (
          <View testID="valmiki-chapter-failed" style={styles.pending}>
            <Text
              style={{
                color: colors.ink,
                // Fonts follow the script (design.md §3): the message is Latin in
                // English and re-scripted for gu/kn.
                fontFamily: titleFontByLang(lang),
                fontSize: 17,
                lineHeight: 28,
                textAlign: 'center',
              }}
            >
              {contentByLang(lang, 'यह काण्ड खुल नहीं सका', 'This kanda could not open')}
            </Text>
            <Pressable
              testID="valmiki-chapter-retry"
              onPress={state.retry}
              accessibilityRole="button"
              style={[styles.retry, { backgroundColor: colors.saffron }]}
            >
              <Text
                style={{
                  color: colors.parchment,
                  fontFamily: isLatinLang(lang) ? fontFamilies.inter : scriptTitleFont(lang, fontFamilies.devanagariBold),
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                {contentByLang(lang, 'पुनः प्रयास', 'Retry')}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function LoadedReader({ chapter, navigation, route }: Props & { chapter: ValmikiRamayanChapter }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const verses = useMemo(() => chapter.verses as ValmikiRamayanVerse[], [chapter]);
  const verseCount = verses.length;
  const initialIndex = clampIndex(route.params?.initialIndex, verseCount);
  const isLastChapter = chapter.chapter >= valmikiRamayanChaptersManifest.length;
  const isFirstChapter = chapter.chapter <= 1;
  const data: FlatListItem[] = useMemo(() => {
    const items: FlatListItem[] = [];
    if (!isFirstChapter) {
      const prev = valmikiRamayanChaptersManifest[chapter.chapter - 2];
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
    items.push(...verses);
    if (!isLastChapter) {
      const next = valmikiRamayanChaptersManifest[chapter.chapter];
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
  }, [chapter, verses, isFirstChapter, isLastChapter]);

  const offset = isFirstChapter ? 0 : 1;
  const listRef = useRef<FlatList<FlatListItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const hasNavigatedRef = useRef(false);

  const { readAloud, autoSlide } = useReaderPlayback({
    sourceId: SOURCE_ID,
    data,
    offset,
    verseCount,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    setProgress({
      sourceId: SOURCE_ID,
      chapter: chapter.chapter,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
  }, [chapter, currentIndex, setProgress]);
  useReadDwell(SOURCE_ID, chapter.chapter, currentIndex);

  // The reader slides straight into the next kāṇḍa from its last page. Start
  // reading that kāṇḍa's parts while the last few verses are on screen, so the
  // hand-over opens on text rather than on a loading state.
  const nearEnd = !isLastChapter && currentIndex >= verseCount - PRELOAD_NEXT_WITHIN;
  useEffect(() => {
    if (nearEnd) loadValmikiRamayanChapter(chapter.chapter + 1).catch(() => undefined);
  }, [nearEnd, chapter.chapter]);

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
          navigation.replace('ValmikiRamayanReader', { chapter: item.nextChapter });
        }, 400);
      }
      return;
    }
    if ('__type' in item && item.__type === 'prev-transition') {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        setTimeout(() => {
          navigation.replace('ValmikiRamayanReader', {
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
  }, [currentIndex, verseCount]);

  const title = contentByLang(lang, valmikiRamayanTitleHi, valmikiRamayanTitleEn);

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

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={title}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel="Back to chapters"
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
          <AddToRoutineButton sourceId={SOURCE_ID} chapter={chapter.chapter} />
          {/* Pinned right so the toggle group stays centred (design.md §56.2). */}
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
              const bookmarkId = `${SOURCE_ID}:${chapter.chapter}:${verseIdx}`;
              return (
                <ValmikiRamayanVersePage
                  showIllustration={verseIdx === 0}
                  verse={item}
                  sourceId={SOURCE_ID}
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
                              sourceId: SOURCE_ID,
                              chapter: chapter.chapter,
                              verseIndex: verseIdx,
                              savedAt: Date.now(),
                              previewHi: item.lines[0] ?? '',
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
                              sourceId: SOURCE_ID,
                              verseIndex: verseIdx,
                              stanza: item.stanza,
                              sectionNameHi: chapter.titleHi,
                              sectionNameEn: chapter.titleEn,
                              verseLabelHi: item.labelHi,
                              verseLabelEn: item.labelEn,
                              linesHi: [...item.lines],
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
  pending: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  retry: {
    marginTop: 16,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 22,
    borderRadius: 999,
  },
  counter: {
    includeFontPadding: false,
    minWidth: 56,
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
