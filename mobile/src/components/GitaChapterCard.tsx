import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { cardFontByLang, isLatinLang, pillTextStyle } from '@/utils/langType';
import type { GitaChapterSummary } from '@/data/gita';

type Props = {
  chapter: GitaChapterSummary;
  onPress: () => void;
  chapterLabelHi?: string;
  chapterLabelEn?: string;
  unitLabelHi?: string;
  unitLabelEn?: string;
};

export default function GitaChapterCard({
  chapter,
  onPress,
  chapterLabelHi = 'अध्याय',
  chapterLabelEn = 'Chapter',
  unitLabelHi = 'श्लोक',
  unitLabelEn = 'verses',
}: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const primaryTitle = contentByLang(lang, chapter.titleHi, chapter.titleEn);
  const primaryFontFamily = cardFontByLang(lang);
  const primaryFontSize = isLatinLang(lang) ? 16 : 17;
  const primaryIsItalic = lang === 'en';

  const chapterLabel = contentByLang(lang, chapterLabelHi, chapterLabelEn);
  const unitLabel = contentByLang(lang, unitLabelHi, unitLabelEn);
  const chapterTag = `${chapterLabel} ${chapter.chapter}`;
  const verseMeta = `${chapter.verseCount} ${unitLabel}`;

  const a11yLabel = `${chapterTag}. ${primaryTitle}. ${verseMeta}. Tap to open.`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
        },
        pressed && { opacity: 0.86 },
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
      />

      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.thumb, { borderRadius: radii.md }]}
      >
        <Text
          style={[
            styles.thumbNumber,
            {
              color: colors.parchmentSoft,
              fontFamily: typography.thumb.fontFamily,
            },
          ]}
        >
          {chapter.chapter}
        </Text>
      </LinearGradient>

      <View style={styles.meta}>
        <Text
          style={[
            styles.tag,
            pillTextStyle(lang, typography.versePill),
            { color: colors.saffronDeep },
          ]}
        >
          {chapterTag.toUpperCase()}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontFamily: primaryFontFamily,
              fontSize: primaryFontSize,
              fontStyle: primaryIsItalic ? 'italic' : 'normal',
            },
          ]}
          numberOfLines={2}
        >
          {primaryTitle}
        </Text>
        <Text
          style={[
            styles.sub,
            {
              color: colors.inkMuted,
              fontSize: typography.cardMeta.fontSize,
              letterSpacing: typography.cardMeta.letterSpacing,
            },
          ]}
        >
          {verseMeta}
        </Text>
      </View>

      <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#3C1E0A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  thumb: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbNumber: {
    fontSize: 20,
    includeFontPadding: false,
    marginTop: -1,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  tag: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  title: {
    // Devanagari title — leave Android's includeFontPadding on so top matras of
    // the chapter name aren't clipped (iOS is unaffected either way).
  },
  sub: {
    opacity: 0.9,
  },
  chev: {
    fontSize: 26,
    marginLeft: 6,
    includeFontPadding: false,
  },
});
