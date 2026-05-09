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
import {
  hanumanChalisaTitleEn,
  hanumanChalisaTitleHi,
  hanumanChalisaVerses,
  type HanumanChalisaVerse,
} from '@/data/hanuman-chalisa';
import {
  shivChalisaTitleEn,
  shivChalisaTitleHi,
  shivChalisaVerses,
  type ShivChalisaVerse,
} from '@/data/shiv-chalisa';
import {
  durgaChalisaTitleEn,
  durgaChalisaTitleHi,
  durgaChalisaVerses,
  type DurgaChalisaVerse,
} from '@/data/durga-chalisa';
import {
  ganeshChalisaTitleEn,
  ganeshChalisaTitleHi,
  ganeshChalisaVerses,
  type GaneshChalisaVerse,
} from '@/data/ganesh-chalisa';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import BookmarkButton from '@/components/BookmarkButton';
import LanguageToggle from '@/components/LanguageToggle';
import VersePage from '@/components/VersePage';
import NextChapterCard from '@/components/NextChapterCard';
import type { RootStackParamList } from '@/navigation/types';

type ChalisaVerse = HanumanChalisaVerse | ShivChalisaVerse | DurgaChalisaVerse | GaneshChalisaVerse;

type ChalisaConfig = {
  id: string;
  titleHi: string;
  titleEn: string;
  verses: readonly ChalisaVerse[];
};

const chalisaConfigs: ChalisaConfig[] = [
  {
    id: 'hanuman-chalisa',
    titleHi: hanumanChalisaTitleHi,
    titleEn: hanumanChalisaTitleEn,
    verses: hanumanChalisaVerses,
  },
  {
    id: 'shiv-chalisa',
    titleHi: shivChalisaTitleHi,
    titleEn: shivChalisaTitleEn,
    verses: shivChalisaVerses,
  },
  {
    id: 'durga-chalisa',
    titleHi: durgaChalisaTitleHi,
    titleEn: durgaChalisaTitleEn,
    verses: durgaChalisaVerses,
  },
  {
    id: 'ganesh-chalisa',
    titleHi: ganeshChalisaTitleHi,
    titleEn: ganeshChalisaTitleEn,
    verses: ganeshChalisaVerses,
  },
];

type TransitionItem = {
  __type: 'transition';
  id: string;
  nextChalisaId: string;
  nextTitleHi: string;
  nextTitleEn: string;
};

type FlatListItem = ChalisaVerse | TransitionItem;

type Props = NativeStackScreenProps<RootStackParamList, 'ChalisaReader'>;

const DOT_COUNT = 5;

export default function ChalisaReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { width } = useWindowDimensions();

  const chalisaId = route.params?.chalisaId ?? 'hanuman-chalisa';
  const configIndex = chalisaConfigs.findIndex((c) => c.id === chalisaId);
  const config = chalisaConfigs[configIndex >= 0 ? configIndex : 0];
  const isLastChalisa = configIndex >= chalisaConfigs.length - 1;

  const data: FlatListItem[] = useMemo(() => {
    if (isLastChalisa) return [...config.verses];
    const next = chalisaConfigs[configIndex + 1];
    return [
      ...config.verses,
      {
        __type: 'transition' as const,
        id: 'transition-next',
        nextChalisaId: next.id,
        nextTitleHi: next.titleHi,
        nextTitleEn: next.titleEn,
      },
    ];
  }, [config, configIndex, isLastChalisa]);

  const listRef = useRef<FlatList<FlatListItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(route.params?.initialIndex ?? 0);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    setProgress({
      sourceId: config.id,
      verseIndex: currentIndex,
      updatedAt: Date.now(),
    });
  }, [currentIndex, setProgress, config.id]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

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
          navigation.replace('ChalisaReader', { initialIndex: 0, chalisaId: item.nextChalisaId });
        }, 400);
      }
      return;
    }
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

  const verseCount = config.verses.length;

  const dotStyles = useMemo(() => {
    const buckets = Math.ceil(verseCount / DOT_COUNT);
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [currentIndex, verseCount]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const idx = Math.round(offsetX / width);
      setCurrentIndex((prev) => {
        if (prev !== idx && idx >= 0 && idx < verseCount) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          return idx;
        }
        return prev;
      });
    },
    [width, verseCount]
  );

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if ('__type' in item && item.__type === 'transition') {
        return (
          <NextChapterCard
            width={width}
            nextTitle={lang === 'hi' ? item.nextTitleHi : item.nextTitleEn}
            lang={lang}
          />
        );
      }
      return <VersePage verse={item as ChalisaVerse} width={width} />;
    },
    [width, lang]
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
            {lang === 'hi' ? config.titleHi : config.titleEn}
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
                {currentIndex + 1} / {verseCount}
              </Text>
              <BookmarkButton
                isBookmarked={isBookmarked(`${config.id}::${currentIndex}`)}
                onToggle={() => {
                  const id = `${config.id}::${currentIndex}`;
                  if (isBookmarked(id)) {
                    removeBookmark(id);
                  } else {
                    const v = config.verses[currentIndex];
                    addBookmark({
                      id,
                      sourceId: config.id,
                      verseIndex: currentIndex,
                      savedAt: Date.now(),
                      previewHi: v.lines[0] ?? '',
                      previewEn: v.linesEn[0] ?? '',
                    });
                  }
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
            data={data}
            keyExtractor={(item) => ('__type' in item ? item.id : item.id)}
            renderItem={renderItem}
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
            initialScrollIndex={route.params?.initialIndex ?? 0}
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
    width: 80,
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
