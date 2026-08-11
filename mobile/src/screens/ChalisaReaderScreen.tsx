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
import { getChalisa, type ChalisaVerse } from '@/data/chalisaRegistry';
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
import VersePage from '@/components/VersePage';
import WhenToRecitePanel from '@/components/WhenToRecitePanel';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import { useAudioPlayerContext } from '@/contexts/AudioPlayerContext';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderReadAloud } from '@/screens/_useReaderReadAloud';
import { getTrackForText } from '@/data/audio/tracks';
import { hasRealAudio } from '@assets/audio-library';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChalisaReader'>;

const DOT_COUNT = 5;

export default function ChalisaReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { playTrack, openNowPlaying } = useAudioPlayerContext();
  const { width } = useWindowDimensions();
  const chalisaId = route.params?.chalisaId ?? 'hanuman-chalisa';
  const audioTrack = useMemo(() => {
    const t = getTrackForText(chalisaId);
    return t && hasRealAudio(t.id) ? t : undefined;
  }, [chalisaId]);
  const chalisa = useMemo(() => getChalisa(chalisaId), [chalisaId]);
  const verses = chalisa.verses;
  const total = verses.length;
  const listRef = useRef<FlatList<ChalisaVerse>>(null);
  const initialIndex = clampIndex(route.params?.initialIndex, total);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Flat reader: list index === verse index, so no offset.
  const readAloud = useReaderReadAloud({
    sourceId: chalisaId,
    data: verses,
    offset: 0,
    verseCount: total,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    setProgress({
      sourceId: chalisaId,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
  }, [chalisaId, currentIndex, setProgress]);

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
        <ReaderHeader
          title={contentByLang(lang, chalisa.titleHi, chalisa.titleEn)}
          onBack={() => navigation.goBack()}
          backAccessibilityLabel="Back to home"
          right={
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
          }
          // Counter (+ optional recorded ▶); the read-aloud control now lives on the
          // toggle row, so the header side column is back to its compact size.
          sideWidth={audioTrack ? 84 : 60}
        />

        <ReadingProgressBar current={currentIndex + 1} total={total} />

        <View style={styles.toggleRow}>
          <LanguageToggle />
          <AddToRoutineButton sourceId={chalisaId} />
          {/* Pinned to the right edge so the toggle group stays centred; the read-aloud
              pill (▶ + "सुनें") sits inline with the toggle, clear of the progress bar. */}
          <View style={styles.readAloudSlot}>
            <ReadAloudButton control={readAloud} />
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={verses as ChalisaVerse[]}
            keyExtractor={(v) => v.id}
            renderItem={({ item, index }) => (
              <VersePage
                verse={item}
                sourceId={chalisaId}
                width={width}
                belowContent={index === 0 ? <WhenToRecitePanel sourceId={chalisaId} /> : undefined}
                topActions={
                  <>
                    <BookmarkButton
                      isBookmarked={isBookmarked(`${chalisaId}::${index}`)}
                      onToggle={() => {
                        const id = `${chalisaId}::${index}`;
                        if (isBookmarked(id)) {
                          removeBookmark(id);
                        } else {
                          addBookmark({
                            id,
                            sourceId: chalisaId,
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
                            sourceId: chalisaId,
                            sectionNameHi: chalisa.titleHi,
                            sectionNameEn: chalisa.titleEn,
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
  counter: {
    includeFontPadding: false,
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
