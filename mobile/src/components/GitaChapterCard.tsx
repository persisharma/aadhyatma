import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { GitaChapterSummary } from '@/data/gita';

type Props = {
  chapter: GitaChapterSummary;
  onPress: () => void;
};

export default function GitaChapterCard({ chapter, onPress }: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const primaryTitle = lang === 'hi' ? chapter.titleHi : chapter.titleEn;
  const primaryFontFamily =
    lang === 'hi' ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily;
  const primaryFontSize = lang === 'hi' ? 17 : 16;
  const primaryIsItalic = lang === 'en';

  const chapterTag =
    lang === 'hi' ? `अध्याय ${chapter.chapter}` : `Chapter ${chapter.chapter}`;
  const verseMeta =
    lang === 'hi' ? `${chapter.verseCount} श्लोक` : `${chapter.verseCount} verses`;

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
            {
              color: colors.saffronDeep,
              fontSize: typography.versePill.fontSize,
              letterSpacing: typography.versePill.letterSpacing,
              fontWeight: typography.versePill.fontWeight,
            },
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
    includeFontPadding: false,
  },
  sub: {
    includeFontPadding: false,
    opacity: 0.9,
  },
  chev: {
    fontSize: 26,
    marginLeft: 6,
    includeFontPadding: false,
  },
});
