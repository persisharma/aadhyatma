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
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import LanguageToggle from '@/components/LanguageToggle';
import VersePage from '@/components/VersePage';
import VerseAudioPlayer from '@/components/VerseAudioPlayer';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChalisaReader'>;

const DOT_COUNT = 5;

export default function ChalisaReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();
  const chalisaId = route.params?.chalisaId ?? 'hanuman-chalisa';
  const chalisa = useMemo(() => getChalisa(chalisaId), [chalisaId]);
  const verses = chalisa.verses;
  const total = verses.length;
  const listRef = useRef<FlatList<ChalisaVerse>>(null);
  const initialIndex = clampIndex(route.params?.initialIndex, total);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  // The verse the *user* navigated to. Only user-driven swipes update this, so
  // the audio player seeks on manual navigation but not when it scrolls the
  // page itself (which would fight its own playback).
  const [userVerseIndex, setUserVerseIndex] = useState(initialIndex);
  const programmaticScrollRef = useRef(false);

  // Audio advanced into a new verse → scroll the page to follow it, without
  // marking it as a user navigation.
  const followAudioToVerse = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      programmaticScrollRef.current = true;
      listRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
      setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 450);
    },
    [total]
  );

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
    const idx = first.index;
    setCurrentIndex((prev) => {
      if (prev !== idx) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          /* haptics unavailable — fine */
        });
      }
      return idx;
    });
    if (!programmaticScrollRef.current) setUserVerseIndex(idx);
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
      if (idx < 0 || idx >= total) return;
      setCurrentIndex((prev) => {
        if (prev !== idx) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        }
        return idx;
      });
      if (!programmaticScrollRef.current) setUserVerseIndex(idx);
    },
    [width, total]
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
                fontFamily:
                  lang === 'hi'
                    ? typography.readerTitle.fontFamily
                    : typography.cardLatin.fontFamily,
                fontSize: typography.readerTitle.fontSize,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              },
            ]}
            numberOfLines={1}
          >
            {lang === 'hi' ? chalisa.titleHi : chalisa.titleEn}
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
              <BookmarkButton
                isBookmarked={isBookmarked(`${chalisaId}::${currentIndex}`)}
                onToggle={() => {
                  const id = `${chalisaId}::${currentIndex}`;
                  if (isBookmarked(id)) {
                    removeBookmark(id);
                  } else {
                    const v = verses[currentIndex];
                    addBookmark({
                      id,
                      sourceId: chalisaId,
                      verseIndex: currentIndex,
                      savedAt: Date.now(),
                      previewHi: v.lines[0] ?? '',
                      previewEn: v.linesEn[0] ?? '',
                    });
                  }
                }}
              />
              <ShareButton
                busy={shareBusy}
                onPress={() => {
                  const v = verses[currentIndex];
                  share(
                    {
                      sourceId: chalisaId,
                      sectionNameHi: chalisa.titleHi,
                      sectionNameEn: chalisa.titleEn,
                      verseLabelHi: v.labelHi,
                      verseLabelEn: v.labelEn,
                      linesHi: [...v.lines],
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

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={verses as ChalisaVerse[]}
            keyExtractor={(v) => v.id}
            renderItem={({ item }) => <VersePage verse={item} sourceId={chalisaId} width={width} />}
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

        <VerseAudioPlayer
          sourceId={chalisaId}
          userVerseIndex={userVerseIndex}
          onAudioVerseChange={followAudioToVerse}
          lang={lang}
        />
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
