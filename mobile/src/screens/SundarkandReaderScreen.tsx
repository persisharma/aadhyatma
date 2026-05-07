import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  getSundarkandChapter,
  sundarkandTitleEn,
  sundarkandTitleHi,
  type SundarkandVerse,
} from '@/data/sundarkand';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks } from '@/contexts/BookmarksContext';
import BookmarkButton from '@/components/BookmarkButton';
import LanguageToggle from '@/components/LanguageToggle';
import SundarkandVersePage from '@/components/SundarkandVersePage';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SundarkandReader'>;

const DOT_COUNT = 5;

export default function SundarkandReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { width } = useWindowDimensions();

  const chapter = getSundarkandChapter(route.params.chapter);
  const verses = chapter.verses as SundarkandVerse[];
  const verseCount = verses.length;

  const listRef = useRef<FlatList<SundarkandVerse>>(null);
  const [currentIndex, setCurrentIndex] = useState(route.params?.initialIndex ?? 0);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length === 0) return;
    const first = viewableItems[0];
    if (first.index == null) return;
    setCurrentIndex((prev) => {
      if (prev !== first.index) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }
      return first.index ?? prev;
    });
  }).current;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: width, offset: width * index, index }),
    [width]
  );

  const dotStyles = useMemo(() => {
    const buckets = Math.max(1, Math.ceil(verseCount / DOT_COUNT));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [currentIndex, verseCount]);

  const title = lang === 'hi' ? sundarkandTitleHi : sundarkandTitleEn;
  const titleFontFamily =
    lang === 'hi' ? typography.readerTitle.fontFamily : typography.cardLatin.fontFamily;
  const titleItalic = lang === 'en';

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

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.topSide}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back to chapters"
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
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.ink,
                fontFamily: titleFontFamily,
                fontSize: typography.readerTitle.fontSize,
                fontStyle: titleItalic ? 'italic' : 'normal',
              },
            ]}
            numberOfLines={1}
          >
            {title}
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
                isBookmarked={isBookmarked(`sundarkand:${chapter.chapter}:${currentIndex}`)}
                onToggle={() => {
                  const id = `sundarkand:${chapter.chapter}:${currentIndex}`;
                  if (isBookmarked(id)) {
                    removeBookmark(id);
                  } else {
                    const v = verses[currentIndex];
                    addBookmark({
                      id,
                      sourceId: 'sundarkand',
                      chapter: chapter.chapter,
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
            data={verses}
            keyExtractor={(v) => v.id}
            renderItem={({ item }) => <SundarkandVersePage verse={item} width={width} />}
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

          <View style={[styles.dotsOverlay, { backgroundColor: colors.parchment + 'CC' }]}>
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
    paddingBottom: 10,
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
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false,
    marginHorizontal: 4,
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
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  dotsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
