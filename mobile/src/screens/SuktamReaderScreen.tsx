import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { getSuktam, type SuktamVerse } from '@/data/suktam';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import VersePage from '@/components/VersePage';
import WhenToRecitePanel from '@/components/WhenToRecitePanel';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import { useAudioPlayerContext } from '@/contexts/AudioPlayerContext';
import { getTrackForText } from '@/data/audio/tracks';
import { hasRealAudio } from '@assets/audio-library';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SuktamReader'>;

const DOT_COUNT = 5;

export default function SuktamReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { playTrack, openNowPlaying } = useAudioPlayerContext();
  const { width } = useWindowDimensions();
  const suktamId = route.params?.suktamId ?? 'devi-suktam';
  const audioTrack = useMemo(() => {
    const t = getTrackForText(suktamId);
    return t && hasRealAudio(t.id) ? t : undefined;
  }, [suktamId]);
  const suktam = useMemo(() => getSuktam(suktamId), [suktamId]);
  const verses = suktam.verses;
  const total = verses.length;
  const listRef = useRef<FlatList<SuktamVerse>>(null);
  const initialIndex = clampIndex(route.params?.initialIndex, total);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setProgress({
      sourceId: suktamId,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
  }, [suktamId, currentIndex, setProgress]);

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
          /* haptics unavailable — fine */
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
        <View style={styles.topBar}>
          <View style={styles.topSide}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
              hitSlop={16}
              style={({ pressed }) => [
                styles.back,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.ink,
                fontFamily: titleFontByLang(lang),
                fontSize: typography.readerTitle.fontSize,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              },
            ]}
            numberOfLines={1}
          >
            {contentByLang(lang, suktam.titleHi, suktam.titleEn)}
          </Text>

          <View style={[styles.topSide, { alignItems: 'flex-end' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
              {audioTrack && (
                <Pressable
                  onPress={() => {
                    playTrack(audioTrack);
                    openNowPlaying();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${audioTrack.titleEn} audio`}
                  hitSlop={10}
                  style={({ pressed }) => [
                    { paddingHorizontal: 4, paddingVertical: 2 },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={{ color: colors.saffronDeep, fontSize: 16, includeFontPadding: false }}>
                    ▶
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <ReadingProgressBar current={currentIndex + 1} total={total} />

        <View style={[styles.toggleRow, { flexDirection: 'row', justifyContent: 'center', gap: 18 }]}>
          <LanguageToggle />
          <AddToRoutineButton sourceId={suktamId} />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={verses as SuktamVerse[]}
            keyExtractor={(v) => v.id}
            renderItem={({ item, index }) => (
              <VersePage
                verse={item}
                sourceId={suktamId}
                width={width}
                belowContent={index === 0 ? <WhenToRecitePanel sourceId={suktamId} /> : undefined}
                topActions={
                  <>
                    <BookmarkButton
                      isBookmarked={isBookmarked(`${suktamId}::${index}`)}
                      onToggle={() => {
                        const id = `${suktamId}::${index}`;
                        if (isBookmarked(id)) {
                          removeBookmark(id);
                        } else {
                          addBookmark({
                            id,
                            sourceId: suktamId,
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
                            sourceId: suktamId,
                            sectionNameHi: suktam.titleHi,
                            sectionNameEn: suktam.titleEn,
                            verseLabelHi: item.labelHi,
                            verseLabelEn: item.labelEn,
                            linesHi: [...item.lines],
                            linesEn: [...item.linesEn],
                            meaningHi: item.meaningHi,
                            meaningEn: item.meaningEn,
                            meaningGu: item.meaningGu,
                            meaningKn: item.meaningKn,
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
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topSide: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
    includeFontPadding: false,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
    marginHorizontal: 4,
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
