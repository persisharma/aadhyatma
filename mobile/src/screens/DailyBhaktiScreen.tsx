import React, { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { getRandomVerse } from '@/data/versePool';
import type { UniformVerse } from '@/data/versePool';
import Ornament from '@/components/Ornament';
import ShareButton from '@/components/ShareButton';
import BookmarkButton from '@/components/BookmarkButton';
import { useShare } from '@/utils/shareVerse';
import { useBookmarks } from '@/contexts/BookmarksContext';

export default function DailyBhaktiScreen() {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const [verse, setVerse] = useState<UniformVerse | null>(() => getRandomVerse());

  const { share, busy: shareBusy } = useShare();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const refresh = useCallback(() => {
    setVerse(getRandomVerse());
  }, []);

  const isHindi = lang === 'hi';
  const bookmarkId = verse
    ? `${verse.sourceId}:${verse.chapter ?? 0}:${verse.verseIndex}`
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
              {isHindi ? 'दैनिक श्लोक उपलब्ध नहीं' : 'No verses available'}
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
                fontFamily: typography.screenTitle.fontFamily,
                fontSize: 22,
                color: colors.ink,
                textAlign: 'center',
              }}
            >
              दैनिक भक्ति
            </Text>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 14,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              Daily Verse
            </Text>
          </View>

          {/* Verse Card */}
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
            {/* Top row: source pill + action icons */}
            <View style={styles.cardHeader}>
              <View style={[styles.pill, { backgroundColor: 'rgba(184, 98, 27, 0.1)' }]}>
                <Text style={[styles.pillText, { color: colors.saffronDeep }]}>
                  {isHindi ? verse.sourceNameHi : verse.sourceNameEn} · {isHindi ? verse.labelHi : verse.labelEn}
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

            {/* Verse text — swap based on language */}
            {isHindi ? (
              <Text
                style={{
                  fontFamily: typography.verse.fontFamily,
                  fontSize: 19,
                  color: colors.ink,
                  lineHeight: 34,
                  marginTop: 14,
                }}
              >
                {verse.textHi.join('\n')}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_600SemiBold',
                  fontSize: 17,
                  color: colors.ink,
                  lineHeight: 28,
                  marginTop: 14,
                }}
              >
                {verse.textEn.length > 0 ? verse.textEn.join('\n') : verse.textHi.join('\n')}
              </Text>
            )}

            {/* Ornament divider */}
            <View style={styles.ornamentWrap}>
              <Ornament />
            </View>

            {/* Meaning section */}
            <Text style={[styles.meaningLabel, { color: colors.saffronDeep }]}>
              {isHindi ? 'अर्थ' : 'Meaning'}{' '}
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.inkMuted }}>
                · {isHindi ? 'Meaning' : 'अर्थ'}
              </Text>
            </Text>

            {/* Meaning text — based on language */}
            <Text
              style={{
                fontFamily: isHindi ? typography.meaning.fontFamily : 'CormorantGaramond_500Medium',
                fontSize: isHindi ? 14 : 16,
                color: colors.inkSoft,
                lineHeight: isHindi ? 24 : 28,
                marginTop: 6,
              }}
            >
              {isHindi ? verse.meaningHi : verse.meaningEn}
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
                {isHindi ? verse.sourceNameHi : verse.sourceNameEn}
              </Text>
              <Pressable
                onPress={refresh}
                accessibilityRole="button"
                accessibilityLabel={isHindi ? 'अगला श्लोक' : 'Next verse'}
                hitSlop={16}
                style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={{ fontSize: 14, color: colors.saffron }}>↻ next</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
