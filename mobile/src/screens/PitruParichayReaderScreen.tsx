/**
 * पितृ पक्ष परिचय — the concept lessons as a paged reader (design.md §74,
 * Sept 2026 UX review).
 *
 * This is the Vrat Katha reader (`VratKathaReaderScreen`) with the परिचय
 * lessons as its sections: `ReaderHeader` with the `n / m` counter,
 * `ReadingProgressBar`, the toggle row (`LanguageToggle` centred, read-aloud
 * pinned right), a horizontal paged `FlatList` of `KathaSectionPage`s, and the
 * §5 pager dots. The lessons used to be seven collapsed cards on the परिचय
 * scroll, each unlocked with और पढ़ें; a परिचय is read, and every other long
 * text in the app is read in exactly this shell.
 *
 * The list ends on a `NextChapterCard` naming the fortnight. Settling on it
 * hands off to `PitruPakshaOverview` after the house 400 ms (the auto-advance
 * contract, RULEBOOK §3) via `popTo`, so a reader opened FROM a dated day
 * returns to that calendar rather than stacking a second copy of it.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import KathaSectionPage from '@/components/KathaSectionPage';
import LanguageToggle from '@/components/LanguageToggle';
import NextChapterCard from '@/components/NextChapterCard';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import { useGitaLanguage } from '@/data/gita/language';
import { getPitruLessons } from '@/data/pitru';
import type { MoreStackParamList } from '@/navigation/types';
import type { KathaContentSection } from '@/panchang/types';
import { useReaderReadAloud } from '@/screens/_useReaderReadAloud';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruParichayReader'>;

/** The appended hand-off page. `__type` keeps read-aloud from speaking it. */
type TransitionItem = { __type: 'transition'; id: string };
type ReaderItem = KathaContentSection | TransitionItem;

const HANDOFF_DELAY_MS = 400;

function isTransition(item: ReaderItem): item is TransitionItem {
  return '__type' in item;
}

export default function PitruParichayReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { width } = useWindowDimensions();

  // Verified-only accessor; plain copies because the section type's arrays are
  // mutable and the registry's are readonly.
  const sections = useMemo<KathaContentSection[]>(
    () =>
      getPitruLessons('parichay').map((lesson) => ({
        id: lesson.id,
        titleHi: lesson.titleHi,
        titleEn: lesson.titleEn,
        bodyHi: [...lesson.bodyHi],
        bodyEn: [...lesson.bodyEn],
      })),
    []
  );
  const total = sections.length;
  const data = useMemo<ReaderItem[]>(
    () => (total > 0 ? [...sections, { __type: 'transition', id: '__fortnight' }] : []),
    [sections, total]
  );

  const requested = route.params?.lessonId;
  const initialIndex = Math.max(0, requested ? sections.findIndex((s) => s.id === requested) : 0);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<ReaderItem>>(null);
  const handedOff = useRef(false);
  // Cleared on unmount: backing out inside the 400 ms must not still navigate.
  const handoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (handoffTimer.current) clearTimeout(handoffTimer.current);
  }, []);

  const readAloud = useReaderReadAloud({
    sourceId: 'pitru-parichay',
    data,
    offset: 0,
    verseCount: total,
    currentIndex: Math.min(currentIndex, Math.max(0, total - 1)),
    listRef,
  });

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: width, offset: width * index, index }),
    [width]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex((prev) => {
        if (prev !== idx && idx >= 0 && idx <= total) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          return idx;
        }
        return prev;
      });
      if (idx === total && total > 0 && !handedOff.current) {
        handedOff.current = true;
        handoffTimer.current = setTimeout(() => navigation.popTo('PitruPakshaOverview'), HANDOFF_DELAY_MS);
      }
    },
    [width, total, navigation]
  );

  // On the hand-off card the counter holds at the last lesson.
  const shown = Math.min(currentIndex, total - 1) + 1;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]} testID="pitru-parichay-reader">
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ReaderHeader
          title={contentByLang(lang, 'पितृ पक्ष — परिचय', 'Pitru Paksha — an introduction')}
          onBack={() => navigation.goBack()}
          right={
            total > 0 ? (
              <Text
                testID="pitru-parichay-counter"
                style={[styles.counter, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily }]}
              >
                {shown} / {total}
              </Text>
            ) : null
          }
          sideWidth={80}
        />

        {total > 0 && (
          <>
            <ReadingProgressBar current={shown} total={total} />
            <View style={styles.toggleRow}>
              <LanguageToggle />
              {/* Pinned right so the toggle stays centred (design.md §56.2). */}
              <View style={styles.readAloudSlot}>
                <ReadAloudButton control={readAloud} />
              </View>
            </View>
            <View style={styles.listContainer}>
              <FlatList
                ref={listRef}
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) =>
                  isTransition(item) ? (
                    <View testID="pitru-parichay-next" style={styles.cell}>
                      <NextChapterCard
                        width={width}
                        lang={lang}
                        nextTitle={contentByLang(lang, 'पक्ष की सोलह तिथियाँ', 'The fortnight’s sixteen tithis')}
                      />
                    </View>
                  ) : (
                    <View testID={`pitru-parichay-page-${item.id}`} style={styles.cell}>
                      <KathaSectionPage
                        section={item}
                        index={index}
                        total={total}
                        width={width}
                        pillHi="परिचय"
                        pillEn="Introduction"
                      />
                    </View>
                  )
                }
                extraData={lang}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                initialNumToRender={1}
                windowSize={3}
                maxToRenderPerBatch={2}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={() => undefined}
                style={styles.list}
              />
              {total > 1 && (
                <View style={styles.dotsOverlay} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <View style={styles.dots}>
                    {sections.map((s, i) => (
                      <View
                        key={s.id}
                        style={
                          i === Math.min(currentIndex, total - 1)
                            ? [styles.dotCurrent, { backgroundColor: colors.saffronDeep }]
                            : [styles.dot, { backgroundColor: colors.dotRest }]
                        }
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  counter: { includeFontPadding: false, minWidth: 44, textAlign: 'right', fontStyle: 'italic' },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: 6, paddingBottom: 6, alignItems: 'center' },
  readAloudSlot: { position: 'absolute', right: 16, top: 6, bottom: 6, justifyContent: 'center' },
  listContainer: { flex: 1 },
  list: { flex: 1 },
  // The testID wrapper must fill the FlatList cell: KathaSectionPage's flex:1
  // ScrollView collapses inside an unsized parent and long lessons stop scrolling.
  cell: { flex: 1 },
  dotsOverlay: { position: 'absolute', bottom: 6, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80%' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
