import React, { useState, useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  verseLinesByLang,
  meaningByLang,
  meaningSourceLang,
  contentByLang,
  pick,
} from '@/utils/localize';
import { verseToken, meaningToken } from '@/utils/langType';
import { getRandomVerse, findVerse } from '@/data/versePool';
import type { UniformVerse } from '@/data/versePool';
import type { TabParamList } from '@/navigation/types';
import Ornament from '@/components/Ornament';
import ShareButton from '@/components/ShareButton';
import BookmarkButton from '@/components/BookmarkButton';
import { useShare } from '@/utils/shareVerse';
import { useBookmarks } from '@/contexts/BookmarksContext';
import RoutineBanner from '@/components/RoutineBanner';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { useTourTarget } from '@/components/tour/tourTargets';

/**
 * Resolve the verse to show on entry. When a reminder tap forwarded a verse
 * identity, show that exact verse; if it can no longer be found (e.g. an OTA
 * update removed it) fall back to a random one. A manual open has no identity,
 * so it shows a random verse.
 */
function resolveInitialVerse(
  sourceId?: string,
  verseIndex?: number,
  chapter?: number
): UniformVerse | null {
  if (sourceId != null && verseIndex != null) {
    const found = findVerse(sourceId, verseIndex, chapter);
    if (found) return found;
  }
  return getRandomVerse();
}

export default function DailyBhaktiScreen() {
  const { colors, typography, spacing } = useTheme();
  // Feature-tour spotlight anchors (design.md §47).
  const dailyVerseRef = useTourTarget('dailyVerse');
  const shareButtonRef = useTourTarget('shareButton');
  const { lang } = useGitaLanguage();
  const screenTitle = orderTitlesByLanguage(lang, 'दैनिक भक्ति', 'Daily Verse', {
    devPrimary: 22,
    devSecondary: 14,
    latPrimary: 22,
    latSecondary: 14,
  });
  const route = useRoute<RouteProp<TabParamList, 'DailyBhaktiTab'>>();
  const { sourceId, chapter, verseIndex } = route.params ?? {};
  const [verse, setVerse] = useState<UniformVerse | null>(() =>
    resolveInitialVerse(sourceId, verseIndex, chapter)
  );

  const { share, busy: shareBusy } = useShare();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  // Manual opens show a random verse. Arriving from a reminder tap forwards the
  // exact verse identity baked into that notification, which locks the tab to
  // that verse — even if the screen was already mounted (e.g. the user had
  // browsed away with "next"). Looked up by identity, so it always matches the
  // notification regardless of pool-size drift.
  useEffect(() => {
    if (sourceId == null || verseIndex == null) return;
    const found = findVerse(sourceId, verseIndex, chapter);
    if (found) setVerse(found);
  }, [sourceId, chapter, verseIndex]);

  const refresh = useCallback(() => {
    setVerse(getRandomVerse());
  }, []);

  // Mirror each reader's bookmark-id convention: chaptered sources use
  // `id:chapter:idx`; chapterless ones (sanskar, japam) use `id::idx`, so an
  // empty chapter segment keeps Daily Bhakti bookmarks in sync with the reader.
  const bookmarkId = verse
    ? `${verse.sourceId}:${verse.chapter ?? ''}:${verse.verseIndex}`
    : '';

  if (!verse) {
    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={[styles.empty, { paddingHorizontal: spacing.xxl }]}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 32, color: colors.inkMuted, opacity: 0.4 }}>॥</Text>
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 15, color: colors.inkMuted, textAlign: 'center', marginTop: 12 }}>
              {pick(lang, {
                hi: 'दैनिक श्लोक उपलब्ध नहीं',
                en: 'No verses available',
                gu: 'દૈનિક શ્લોક ઉપલબ્ધ નથી',
                kn: 'ದೈನಿಕ ಶ್ಲೋಕ ಲಭ್ಯವಿಲ್ಲ',
              })}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.titleArea}>
            <Text
              style={{
                fontFamily: screenTitle.primary.fontFamily,
                fontSize: screenTitle.primary.fontSize,
                fontStyle: screenTitle.primary.fontStyle,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              {screenTitle.primary.text}
            </Text>
            <Text
              style={{
                fontFamily: screenTitle.secondary.fontFamily,
                fontSize: screenTitle.secondary.fontSize,
                fontStyle: screenTitle.secondary.fontStyle,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              {screenTitle.secondary.text}
            </Text>
          </View>

          {/* Verse Card */}
          <View ref={dailyVerseRef} collapsable={false} style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
            {/* Top row: source pill + action icons */}
            <View style={styles.cardHeader}>
              <View style={[styles.pill, { backgroundColor: 'rgba(184, 98, 27, 0.1)' }]}>
                <Text style={[styles.pillText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, verse.sourceNameHi, verse.sourceNameEn)} · {contentByLang(lang, verse.labelHi ?? '', verse.labelEn ?? '')}
                </Text>
              </View>
              <View style={styles.headerActions}>
                <BookmarkButton
                  isBookmarked={isBookmarked(bookmarkId)}
                  onToggle={() => {
                    if (isBookmarked(bookmarkId)) {
                      removeBookmark(bookmarkId);
                    } else {
                      addBookmark({
                        id: bookmarkId,
                        sourceId: verse.sourceId,
                        chapter: verse.chapter,
                        verseIndex: verse.verseIndex,
                        savedAt: Date.now(),
                        previewHi: verse.textHi.slice(0, 2).join(' '),
                        previewEn: verse.textEn.slice(0, 2).join(' '),
                      });
                    }
                  }}
                />
                <View ref={shareButtonRef} collapsable={false}>
                  <ShareButton
                    busy={shareBusy}
                    onPress={() => {
                      share(
                        {
                          sourceId: verse.sourceId,
                          sectionNameHi: verse.sourceNameHi,
                          sectionNameEn: verse.sourceNameEn,
                          verseLabelHi: verse.labelHi ?? '',
                          verseLabelEn: verse.labelEn ?? '',
                          linesHi: verse.textHi,
                          linesEn: verse.textEn,
                          meaningHi: verse.meaningHi,
                          meaningEn: verse.meaningEn,
                        },
                        lang
                      );
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Verse text — script follows the reading language (gu/kn re-script the Devanagari) */}
            <Text
              style={{
                fontFamily: verseToken(lang, typography).fontFamily,
                fontSize: verseToken(lang, typography).fontSize,
                color: colors.ink,
                lineHeight: verseToken(lang, typography).lineHeight,
                marginTop: 14,
              }}
            >
              {verseLinesByLang(
                lang,
                verse.textHi,
                verse.textEn.length > 0 ? verse.textEn : verse.textHi
              ).join('\n')}
            </Text>

            {/* Ornament divider */}
            <View style={styles.ornamentWrap}>
              <Ornament />
            </View>

            {/* Meaning section */}
            <Text style={[styles.meaningLabel, { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'अर्थ', 'Meaning')}{' '}
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.inkMuted }}>
                · {contentByLang(lang, 'Meaning', 'अर्थ')}
              </Text>
            </Text>

            {/* Meaning text — styled by the meaning's source language (kn meaning is English) */}
            <Text
              style={{
                fontFamily: meaningToken(meaningSourceLang(lang), typography).fontFamily,
                fontSize: meaningToken(meaningSourceLang(lang), typography).fontSize,
                color: meaningSourceLang(lang) === 'en' ? colors.ink : colors.inkSoft,
                lineHeight: meaningToken(meaningSourceLang(lang), typography).lineHeight,
                marginTop: 6,
              }}
            >
              {meaningByLang(lang, verse.meaningHi, verse.meaningEn)}
            </Text>

            {/* Card footer: source label | next */}
            <View style={styles.cardFooter}>
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                  fontSize: 11,
                  color: colors.inkMuted,
                }}
              >
                {contentByLang(lang, verse.sourceNameHi, verse.sourceNameEn)}
              </Text>
              <Pressable
                onPress={refresh}
                accessibilityRole="button"
                accessibilityLabel={pick(lang, { hi: 'अगला श्लोक', en: 'Next verse', gu: 'આગળનો શ્લોક', kn: 'ಮುಂದಿನ ಶ್ಲೋಕ' })}
                hitSlop={16}
                style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 14, color: colors.saffron }}>↻ next</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <RoutineBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 20, paddingBottom: 80 },
  titleArea: { marginBottom: 20, alignItems: 'center' },
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#3c1e0a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    flexShrink: 1,
  },
  pillText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  ornamentWrap: { marginVertical: 14 },
  meaningLabel: {
    fontFamily: 'NotoSerifDevanagari_600SemiBold',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(138, 62, 11, 0.15)',
  },
  nextBtn: {
    minWidth: 68,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
