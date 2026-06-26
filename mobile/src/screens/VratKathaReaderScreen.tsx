import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import LanguageToggle from '@/components/LanguageToggle';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import KathaSectionPage from '@/components/KathaSectionPage';
import { getKathaContent } from '@/panchang/kathaContent';
import type { KathaContentSection } from '@/panchang/types';
import type { HomeStackParamList } from '@/navigation/types';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

type Props = NativeStackScreenProps<HomeStackParamList, 'VratKathaReader'>;

export default function VratKathaReaderScreen({ navigation, route }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { width } = useWindowDimensions();

  const katha = getKathaContent(route.params.kathaId);
  const sections = katha?.sections ?? [];
  const total = sections.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<KathaContentSection>>(null);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: width, offset: width * index, index }),
    [width]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
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

  const title = katha
    ? contentByLang(lang, katha.titleHi, katha.titleEn)
    : contentByLang(lang, 'कथा', 'Katha');

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.topSide}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={16}
              style={({ pressed }) => [
                styles.back,
                { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
            </Pressable>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}
          >
            {title}
          </Text>
          <View style={[styles.topSide, { alignItems: 'flex-end' }]}>
            {total > 0 && (
              <Text style={[styles.counter, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily }]}>
                {currentIndex + 1} / {total}
              </Text>
            )}
          </View>
        </View>

        {!katha ? (
          <View style={styles.empty}>
            <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 14 }}>
              {contentByLang(lang, 'यह कथा अभी उपलब्ध नहीं है।', 'This katha is not available yet.')}
            </Text>
          </View>
        ) : (
          <>
            <ReadingProgressBar current={currentIndex + 1} total={total} />
            <View style={styles.toggleRow}>
              <LanguageToggle />
            </View>
            <View style={styles.listContainer}>
              <FlatList
                ref={listRef}
                data={sections}
                keyExtractor={(s) => s.id}
                renderItem={({ item, index }) => (
                  <KathaSectionPage section={item} index={index} total={total} width={width} />
                )}
                extraData={lang}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
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
                <View style={styles.dotsOverlay}>
                  <View style={styles.dots}>
                    {sections.map((s, i) => (
                      <View
                        key={s.id}
                        style={
                          i === currentIndex
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
  topBar: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topSide: { width: 80, flexDirection: 'row', alignItems: 'center' },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backGlyph: { fontSize: 22, lineHeight: 24, marginTop: -2, includeFontPadding: false },
  title: { flex: 1, textAlign: 'center', fontSize: 18, includeFontPadding: false, marginHorizontal: 4 },
  counter: { includeFontPadding: false, minWidth: 44, textAlign: 'right', fontStyle: 'italic' },
  toggleRow: { paddingTop: 6, paddingBottom: 6, alignItems: 'center' },
  listContainer: { flex: 1 },
  list: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dotsOverlay: { position: 'absolute', bottom: 6, left: 0, right: 0, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80%' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotCurrent: { width: 18, height: 6, borderRadius: 999 },
});
