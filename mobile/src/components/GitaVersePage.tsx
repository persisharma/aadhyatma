import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { GitaVerse } from '@/data/gita';
import { gitaImages } from '@assets/gita';
import Ornament from './Ornament';

type Props = {
  verse: GitaVerse;
  width: number;
};

export default function GitaVersePage({ verse, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const meaning = lang === 'hi' ? verse.meaningHi : verse.meaningEn;
  const commentary = lang === 'hi' ? verse.commentaryHi : verse.commentaryEn;
  const otherCommentary = lang === 'hi' ? verse.commentaryEn : verse.commentaryHi;
  const hasCommentary = commentary.length > 0;
  const commentaryFallbackNote =
    !hasCommentary && otherCommentary.length > 0
      ? lang === 'hi'
        ? 'इस श्लोक की विस्तृत व्याख्या केवल अंग्रेज़ी में उपलब्ध है।'
        : 'Extended commentary is available in Hindi only for this verse.'
      : null;

  const meaningLabel = lang === 'hi' ? 'अर्थ · Meaning' : 'Meaning · अर्थ';
  const commentaryLabel = lang === 'hi' ? 'व्याख्या · Commentary' : 'Commentary · व्याख्या';

  const pillText = `श्लोक · ${verse.chapter}.${verse.number}`;

  const bodyHiStyle = {
    color: colors.inkSoft,
    fontFamily: typography.meaning.fontFamily,
    fontSize: typography.meaning.fontSize,
    lineHeight: typography.meaning.lineHeight,
  } as const;

  const bodyEnStyle = {
    color: colors.ink,
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 18,
    lineHeight: 30,
  } as const;

  const bodyStyle = lang === 'hi' ? bodyHiStyle : bodyEnStyle;

  const a11yLabel = [
    `Verse ${verse.chapter}.${verse.number}`,
    ...verse.sanskrit,
    meaningLabel,
    meaning,
    commentaryLabel,
    ...commentary,
  ].join('. ');

  return (
    <View style={[styles.page, { width, backgroundColor: colors.parchment }]}>
      <ImageBackground
        source={gitaImages.krishna_arjuna_vishvarupa}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            colors.overlayTop,
            colors.overlayUpper,
            colors.overlayLower,
            colors.overlayBottom,
          ]}
          locations={[0, 0.4, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenGutter },
        ]}
        showsVerticalScrollIndicator={false}
        accessible
        accessibilityLabel={a11yLabel}
      >
        <View
          style={[
            styles.pill,
            { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              {
                color: colors.saffronDeep,
                fontSize: typography.versePill.fontSize,
                fontWeight: typography.versePill.fontWeight,
                letterSpacing: typography.versePill.letterSpacing,
              },
            ]}
          >
            {pillText}
          </Text>
        </View>

        <View style={styles.verseBlock}>
          {(lang === 'hi' ? verse.sanskrit : verse.transliteration).map((line, idx) => (
            <Text
              key={`v-${idx}`}
              style={[
                styles.verseLine,
                lang === 'hi'
                  ? {
                      color: colors.ink,
                      fontFamily: typography.verse.fontFamily,
                      fontSize: typography.verse.fontSize,
                      lineHeight: typography.verse.lineHeight,
                    }
                  : {
                      color: colors.ink,
                      fontFamily: 'CormorantGaramond_600SemiBold',
                      fontSize: 20,
                      lineHeight: 32,
                    },
              ]}
            >
              {line}
            </Text>
          ))}
        </View>

        <Ornament />

        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.saffronDeep,
              fontFamily: typography.meaningLabel.fontFamily,
              fontSize: typography.meaningLabel.fontSize,
              letterSpacing: typography.meaningLabel.letterSpacing,
            },
          ]}
        >
          {meaningLabel}
        </Text>
        <Text style={[styles.body, bodyStyle]}>{meaning}</Text>

        {hasCommentary || commentaryFallbackNote ? (
          <>
            <Ornament />

            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.saffronDeep,
                  fontFamily: typography.meaningLabel.fontFamily,
                  fontSize: typography.meaningLabel.fontSize,
                  letterSpacing: typography.meaningLabel.letterSpacing,
                },
              ]}
            >
              {commentaryLabel}
            </Text>
            {hasCommentary ? (
              <View style={styles.paragraphs}>
                {commentary.map((paragraph, idx) => (
                  <Text key={`c-${idx}`} style={[styles.body, bodyStyle]}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            ) : (
              <Text
                style={[
                  styles.fallbackNote,
                  {
                    color: colors.inkMuted,
                    fontFamily: 'CormorantGaramond_400Regular_Italic',
                    fontSize: 14,
                    lineHeight: 22,
                  },
                ]}
              >
                {commentaryFallbackNote}
              </Text>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 18,
  },
  pillText: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  verseBlock: {
    gap: 4,
  },
  verseLine: {
    includeFontPadding: false,
  },
  translitBlock: {
    marginTop: 14,
    gap: 2,
  },
  translitLine: {
    includeFontPadding: false,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 12,
    alignSelf: 'center',
    includeFontPadding: false,
  },
  body: {
    includeFontPadding: false,
  },
  paragraphs: {
    gap: 14,
  },
  fallbackNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    includeFontPadding: false,
    opacity: 0.8,
  },
});
