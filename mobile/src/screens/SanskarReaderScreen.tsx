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
import { getSanskar, type SanskarVerse } from '@/data/sanskar';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import ReaderHeader from '@/components/ReaderHeader';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import SanskarVersePage from '@/components/SanskarVersePage';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SanskarReader'>;

const DOT_COUNT = 5;

export default function SanskarReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();
  const sanskarId = route.params.sanskarId;
  const sanskarData = useMemo(() => getSanskar(sanskarId), [sanskarId]);
  const verses = sanskarData.verses;
  const total = verses.length;
  const listRef = useRef<FlatList<SanskarVerse>>(null);
  const initialIndex = clampIndex(route.params?.initialIndex, total);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setProgress({
      sourceId: sanskarId,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
  }, [sanskarId, currentIndex, setProgress]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length === 0) return;
    const first = viewableItems[0];
    if (first.index == null) return;
    setCurrentIndex((prev) => {
      if (prev !== first.index) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          /* haptics unavailable */
        });
      }
      return first.index ?? prev;
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

  const dotStyles = useMemo(() => {
    const buckets = Math.max(1, Math.ceil(total / DOT_COUNT));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [currentIndex, total]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / width);
      setCurrentIndex((prev) => {
        if (prev !== idx && idx >= 0 && idx < total) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          return idx;
        }
        return prev;
      });
    },
    [width, total]
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
          title={contentByLang(lang, sanskarData.titleHi, sanskarData.titleEn)}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel="Back to home"
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
              {currentIndex + 1} / {total}
            </Text>
          }
        />

        <ReadingProgressBar current={currentIndex + 1} total={total} />

        <View style={[styles.toggleRow, { flexDirection: 'row', justifyContent: 'center', gap: 18 }]}>
          <LanguageToggle />
          <AddToRoutineButton sourceId={sanskarId} />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={verses}
            keyExtractor={(v) => v.id}
            renderItem={({ item, index }) => (
              <SanskarVersePage
                verse={item}
                sourceId={sanskarId}
                width={width}
                topActions={
                  <>
                    <BookmarkButton
                      isBookmarked={isBookmarked(`${sanskarId}::${index}`)}
                      onToggle={() => {
                        const id = `${sanskarId}::${index}`;
                        if (isBookmarked(id)) {
                          removeBookmark(id);
                        } else {
                          addBookmark({
                            id,
                            sourceId: sanskarId,
                            verseIndex: index,
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
                            sourceId: sanskarId,
                            sectionNameHi: sanskarData.titleHi,
                            sectionNameEn: sanskarData.titleEn,
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
            )}
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
            initialScrollIndex={initialIndex}
            onScrollToIndexFailed={() => undefined}
            style={styles.list}
          />

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
  },
  toggleRow: {
    paddingVertical: 6,
    paddingBottom: 12,
    alignItems: 'center',
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
