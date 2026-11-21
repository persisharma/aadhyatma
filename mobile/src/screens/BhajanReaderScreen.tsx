import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View, useWindowDimensions, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { getBhajan, type BhajanData, type BhajanVerse } from '@/data/bhajan';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, meaningToken } from '@/utils/langType';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useReadDwell } from './_useReadDwell';
import ReaderHeader from '@/components/ReaderHeader';
import ReaderPageCounter from '@/components/ReaderPageCounter';
import { useReaderJump } from './_useReaderJump';
import ReaderControlRow from '@/components/ReaderControlRow';
import BookmarkButton from '@/components/BookmarkButton';
import ShareButton from '@/components/ShareButton';
import VersePage from '@/components/VersePage';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import AddToRoutineButton from '@/components/AddToRoutineButton';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import AutoSlideButton from '@/components/AutoSlideButton';
import { useReaderPlayback } from '@/screens/_useAutoSlide';
import { clampIndex } from '@/utils/clamp';
import { useShare } from '@/utils/shareVerse';
import type { BhajanStackParamList } from '@/navigation/types';

// Typed against the shared list: one component serves the Home and Bhajan-tab
// stacks (RULEBOOK §6.0.1).
type Props = NativeStackScreenProps<BhajanStackParamList, 'BhajanReader'>;

const DOT_COUNT = 5;
const NO_VERSES: BhajanVerse[] = [];

/**
 * Flat bhajan reader (design.md §34.1) — the aarti reader shell keyed by a
 * stable catalog id. An id with no verified payload (stale route, removed
 * text) leaves immediately instead of rendering an empty pager.
 */
export default function BhajanReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { setProgress } = useReadingProgress();
  const { share, busy: shareBusy } = useShare();
  const { width } = useWindowDimensions();

  const sourceId = route.params.bhajanId;
  const bhajan = useMemo<BhajanData | null>(() => getBhajan(sourceId), [sourceId]);
  const verses = bhajan?.verses ?? NO_VERSES;
  const listRef = useRef<FlatList<BhajanVerse>>(null);
  const initialIndex = clampIndex(route.params.initialIndex, verses.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Hooks run before the missing-payload exit below (rules of hooks).
  const { readAloud, autoSlide } = useReaderPlayback({
    sourceId,
    data: verses,
    offset: 0,
    verseCount: verses.length,
    currentIndex,
    listRef,
  });

  useEffect(() => {
    if (!bhajan) {
      if (navigation.canGoBack()) navigation.goBack();
      return;
    }
    setProgress({ sourceId, verseIndex: currentIndex, updatedAt: Date.now() });
  }, [bhajan, sourceId, currentIndex, setProgress, navigation]);
  useReadDwell(sourceId, undefined, currentIndex);

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

  const dotStyles = useMemo(() => {
    const total = verses.length;
    const buckets = Math.max(1, Math.ceil(total / DOT_COUNT));
    const active = Math.min(DOT_COUNT - 1, Math.floor(currentIndex / buckets));
    return Array.from({ length: DOT_COUNT }, (_, i) => i === active);
  }, [verses.length, currentIndex]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex((prev) => {
      if (prev !== idx && idx >= 0 && idx < verses.length) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        return idx;
      }
      return prev;
    });
  }, [width, verses.length]);

  const jump = useReaderJump({ listRef, setCurrentIndex, readAloud, autoSlide });

  // Re-render visible pages when the language flips, a bookmark toggles, or a
  // share is in flight — the in-page header actions depend on all three.
  const listExtraData = useMemo(() => ({ lang, bookmarks, shareBusy }), [lang, bookmarks, shareBusy]);

  if (!bhajan) return <View style={[styles.root, { backgroundColor: colors.parchment }]} testID="bhajan-reader-missing" />;

  const topTitle = contentByLang(lang, bhajan.titleHi, bhajan.titleEn);
  const meaningTok = meaningToken(lang, typography);

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={topTitle}
          onBack={() => navigation.goBack()}
          right={<ReaderPageCounter current={currentIndex + 1} total={verses.length} {...jump} />}
        />

        <ReadingProgressBar current={currentIndex + 1} total={verses.length} />

        <ReaderControlRow leading={<AutoSlideButton control={autoSlide} floating={false} />}
          trailing={<ReadAloudButton control={readAloud} />}>
          <LanguageToggle />
          <AddToRoutineButton sourceId={sourceId} />
        </ReaderControlRow>

        <View style={styles.listContainer}>
          <FlatList
            CellRendererComponent={autoSlide.Cell}
            ref={listRef}
            data={verses}
            keyExtractor={(v) => v.id}
            renderItem={({ item, index }) => (
              <VersePage
                showIllustration={index === 0}
                verse={item}
                sourceId={sourceId}
                width={width}
                belowContent={
                  index === 0 ? (
                    // Plain credit, never a link (RULEBOOK §11.16).
                    <View
                      testID="bhajan-attribution"
                      style={[styles.attribution, { borderColor: colors.divider }]}
                    >
                      <Text style={[{ color: colors.saffronDeep }, pillTextStyle(lang, typography.sectionLabel)]}>
                        {contentByLang(lang, 'रचना', 'Composed by')}
                      </Text>
                      <Text style={{ color: colors.inkSoft, fontFamily: meaningTok.fontFamily, fontSize: 15, lineHeight: 22 }}>
                        {contentByLang(lang, bhajan.attributionHi, bhajan.attributionEn)}
                      </Text>
                    </View>
                  ) : undefined
                }
                topActions={
                  <>
                    <BookmarkButton
                      isBookmarked={isBookmarked(`${sourceId}:${index}`)}
                      onToggle={() => {
                        const id = `${sourceId}:${index}`;
                        if (isBookmarked(id)) { removeBookmark(id); }
                        else {
                          addBookmark({ id, sourceId, verseIndex: index, savedAt: Date.now(), previewHi: item.lines[0] ?? '', previewEn: item.linesEn[0] ?? '' });
                        }
                      }}
                    />
                    <ShareButton
                      busy={shareBusy}
                      onPress={() => {
                        share(
                          {
                            sourceId,
                            sectionNameHi: bhajan.titleHi,
                            sectionNameEn: bhajan.titleEn,
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
  listContainer: { flex: 1 },
  list: { flex: 1 },
  attribution: { marginTop: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  dotsOverlay: { position: 'absolute', bottom: 4, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
