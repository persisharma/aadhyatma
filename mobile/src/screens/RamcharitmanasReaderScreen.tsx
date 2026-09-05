import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View, useWindowDimensions, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { getRamcharitmanasChapter, type RamcharitmanasVerse } from '@/data/ramcharitmanas';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import ReaderHeader from '@/components/ReaderHeader';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import JumpToStartButton from '@/components/JumpToStartButton';
import RamcharitmanasVersePage from '@/components/RamcharitmanasVersePage';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import { useSafeChapter } from './_useSafeChapter';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useReaderReadAloud } from './_useReaderReadAloud';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RamcharitmanasReader'>;

const DOT_COUNT = 5;

export default function RamcharitmanasReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const chapter = useSafeChapter(route.params.chapter, getRamcharitmanasChapter, navigation, 'RamcharitmanasChapters');
  const listRef = useRef<FlatList<RamcharitmanasVerse>>(null);
  const verseCount = chapter?.verses.length ?? 0;
  const initialIndex = clampIndex(route.params.initialIndex, verseCount);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Called before the null-chapter early return below, so hook order stays stable;
  // single-chapter text today, so the list carries no transition cards and no offset.
  const readAloud = useReaderReadAloud({
    sourceId: 'ramcharitmanas',
    data: chapter?.verses ?? [],
    offset: 0,
    verseCount,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    if (chapter == null) return;
    setProgress({ sourceId: 'ramcharitmanas', chapter: chapter.chapter, verseIndex: currentIndex, updatedAt: Date.now() });
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
  const listExtraData = useMemo(
    () => ({ lang, bookmarks, shareBusy }),
    [lang, bookmarks, shareBusy]
  );

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

        <View style={[styles.toggleRow, { flexDirection: 'row', justifyContent: 'center', gap: 18 }]}>
          <LanguageToggle />
          <AddToRoutineButton sourceId="ramcharitmanas" chapter={chapter.chapter} />
          {/* Pinned right so the toggle group stays centred (design.md §56.2). */}
          <View style={styles.readAloudSlot}>
            <ReadAloudButton control={readAloud} />
          </View>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={chapter.verses}
            keyExtractor={(v) => v.id}
            renderItem={({ item, index }) => (
              <RamcharitmanasVersePage
                verse={item}
                sourceId="ramcharitmanas"
                width={width}
                topActions={
                  <>
                    <BookmarkButton
                      isBookmarked={isBookmarked(`ramcharitmanas:${chapter.chapter}:${index}`)}
                      onToggle={() => {
                        const id = `ramcharitmanas:${chapter.chapter}:${index}`;
                        if (isBookmarked(id)) { removeBookmark(id); }
                        else {
                          addBookmark({ id, sourceId: 'ramcharitmanas', chapter: chapter.chapter, verseIndex: index, savedAt: Date.now(), previewHi: item.lines[0] ?? '', previewEn: item.linesEn[0] ?? '' });
                        }
                      }}
                    />
                    <ShareButton
                      busy={shareBusy}
                      onPress={() => {
                        share(
                          {
                            sourceId: 'ramcharitmanas',
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
  readAloudSlot: { position: 'absolute', right: 16, top: 6, bottom: 12, justifyContent: 'center' },
  listContainer: { flex: 1 },
  list: { flex: 1 },
  dotsOverlay: { position: 'absolute', bottom: 4, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
