import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
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
  hanumanChalisaTotal,
  hanumanChalisaVerses,
  type HanumanChalisaVerse,
} from '@/data/hanuman-chalisa';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import BookmarkButton from '@/components/BookmarkButton';
import LanguageToggle from '@/components/LanguageToggle';
import VersePage from '@/components/VersePage';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChalisaReader'>;

const DOT_COUNT = 5;

export default function ChalisaReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<HanumanChalisaVerse>>(null);
  const [currentIndex, setCurrentIndex] = useState(route.params?.initialIndex ?? 0);

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
    const buckets = Math.ceil(hanumanChalisaTotal / DOT_COUNT);
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [currentIndex]);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            hitSlop={12}
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
            {lang === 'hi' ? hanumanChalisaTitleHi : hanumanChalisaTitleEn}
          </Text>

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
            {currentIndex + 1} / {hanumanChalisaTotal}
          </Text>
          <BookmarkButton
            isBookmarked={isBookmarked(`hanuman-chalisa::${currentIndex}`)}
            onToggle={() => {
              const id = `hanuman-chalisa::${currentIndex}`;
              if (isBookmarked(id)) {
                removeBookmark(id);
              } else {
                const v = hanumanChalisaVerses[currentIndex];
                addBookmark({
                  id,
                  sourceId: 'hanuman-chalisa',
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

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <FlatList
          ref={listRef}
          data={hanumanChalisaVerses as HanumanChalisaVerse[]}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => <VersePage verse={item} width={width} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          windowSize={3}
          removeClippedSubviews
          maxToRenderPerBatch={2}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          getItemLayout={getItemLayout}
          initialScrollIndex={route.params?.initialIndex ?? 0}
          style={styles.list}
        />

        <View style={styles.bottom}>
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
          <Text
            style={[
              styles.swipeHint,
              {
                color: colors.inkMuted,
                fontFamily: typography.swipeHint.fontFamily,
                fontSize: typography.swipeHint.fontSize,
                fontStyle: 'italic',
              },
            ]}
          >
            {currentIndex === 0
              ? 'swipe →'
              : currentIndex === hanumanChalisaTotal - 1
                ? '← swipe'
                : '← swipe →'}
          </Text>
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
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    includeFontPadding: false,
  },
  counter: {
    includeFontPadding: false,
  },
  toggleRow: {
    paddingVertical: 6,
    paddingBottom: 12,
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  bottom: {
    paddingHorizontal: 28,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  swipeHint: {
    includeFontPadding: false,
  },
});
