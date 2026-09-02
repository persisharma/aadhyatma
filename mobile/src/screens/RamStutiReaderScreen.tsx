import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View, useWindowDimensions, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { getRamStutiChapter, type RamStutiVerse } from '@/data/ram-stuti';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import ReaderHeader from '@/components/ReaderHeader';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import ShivaStrotamVersePage from '@/components/ShivaStrotamVersePage';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import { useSafeChapter } from './_useSafeChapter';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RamStutiReader'>;

const DOT_COUNT = 5;

export default function RamStutiReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getRamStutiChapter, navigation, 'RamStutiChapters');
  const listRef = useRef<FlatList<RamStutiVerse>>(null);
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (chapter == null) return;
    setProgress({ sourceId: 'ram-stuti', chapter: chapter.chapter, verseIndex: currentIndex, updatedAt: Date.now() });
  }, [chapter, currentIndex, setProgress]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length === 0) return;
    const first = viewableItems[0];
    if (first.index == null) return;
    setCurrentIndex((prev) => {
      if (prev !== first.index) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      return first.index ?? prev;
    });
  }).current;

  const getItemLayout = useCallback((_: unknown, index: number) => ({ length: width, offset: width * index, index }), [width]);

  const goToStart = useCallback(() => {
    listRef.current?.scrollToIndex({ index: 0, animated: true });
    setCurrentIndex(0);
  }, []);

  const dotStyles = useMemo(() => {
    const buckets = Math.max(1, Math.ceil(verseCount / DOT_COUNT));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [verseCount, currentIndex]);

  const topTitle = chapter ? (contentByLang(lang, chapter.titleHi, chapter.titleEn)) : '';

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / width);
    setCurrentIndex((prev) => {
      if (prev !== idx && idx >= 0 && idx < verseCount) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        return idx;
      }
      return prev;
    });
  }, [width, verseCount]);

  // Re-render visible pages when the language flips, a bookmark toggles, or a
  // share is in flight — the in-page header actions depend on all three.
  const listExtraData = useMemo(() => ({ lang, bookmarks, shareBusy }), [lang, bookmarks, shareBusy]);

  if (!chapter) return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={topTitle}
          onBack={() => navigation.goBack()}
          right={
            <Text style={[styles.counter, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize, fontStyle: 'italic' }]}>
              {currentIndex + 1} / {verseCount}
            </Text>
          }
        />

        <ReadingProgressBar current={currentIndex + 1} total={verseCount} />

        <View style={[styles.toggleRow, { flexDirection: 'row', justifyContent: 'center', gap: 18 }]}><LanguageToggle /><AddToRoutineButton sourceId="ram-stuti" chapter={chapter.chapter} /></View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={chapter.verses}
            keyExtractor={(v) => v.id}
            renderItem={({ item, index }) => (
              <ShivaStrotamVersePage
                verse={item}
                sourceId="ram-stuti"
                width={width}
                topActions={
                  <>
                    <BookmarkButton
                      isBookmarked={isBookmarked(`ram-stuti:${chapter.chapter}:${index}`)}
                      onToggle={() => {
                        const id = `ram-stuti:${chapter.chapter}:${index}`;
                        if (isBookmarked(id)) { removeBookmark(id); }
                        else {
                          addBookmark({ id, sourceId: 'ram-stuti', chapter: chapter.chapter, verseIndex: index, savedAt: Date.now(), previewHi: item.sanskrit[0] ?? '', previewEn: item.linesEn[0] ?? '' });
                        }
                      }}
                    />
                    <ShareButton
                      busy={shareBusy}
                      onPress={() => {
                        const isIntro = item.number === 0;
                        share(
                          {
                            sourceId: 'ram-stuti',
                            sectionNameHi: chapter.titleHi,
                            sectionNameEn: chapter.titleEn,
                            verseLabelHi: isIntro ? 'परिचय' : `श्लोक ${item.chapter}.${item.number}`,
                            verseLabelEn: isIntro ? 'Introduction' : `Verse ${item.chapter}.${item.number}`,
                            linesHi: [...item.sanskrit],
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
          {currentIndex > 0 && <JumpToStartButton onPress={goToStart} lang={lang} />}
          <View style={styles.dotsOverlay}>
            <View style={styles.dots}>
              {dotStyles.map((isCurrent, i) => (
                <View key={i} style={isCurrent ? [styles.dotCurrent, { backgroundColor: colors.saffronDeep }] : [styles.dot, { backgroundColor: colors.dotRest }]} />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  counter: { includeFontPadding: false, minWidth: 48, textAlign: 'right' },
  toggleRow: { paddingVertical: 6, paddingBottom: 12, alignItems: 'center' },
  listContainer: { flex: 1 },
  list: { flex: 1 },
  dotsOverlay: { position: 'absolute', bottom: 4, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
