import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { chalisaImages } from '@assets/chalisa';
import { imageKeyForVerse } from '@/data/verseImages';
import Ornament from './Ornament';

type ChalisaVerse = {
  id: string;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

type Props = {
  verse: ChalisaVerse;
  width: number;
};

export default function VersePage({ verse, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const imageKey = useMemo(() => imageKeyForVerse(verse.id), [verse.id]);
  const bg = chalisaImages[imageKey];

  const verseLines = lang === 'hi' ? verse.lines : verse.linesEn;
  const meaning = lang === 'hi' ? verse.meaningHi : verse.meaningEn;
  const meaningLabel = lang === 'hi' ? 'भावार्थ' : 'Meaning';
  const pillText = lang === 'hi' ? verse.labelHi : verse.labelEn;

  const bodyHiStyle = {
    color: colors.inkSoft,
    fontFamily: typography.meaning.fontFamily,
    fontSize: typography.meaning.fontSize,
    lineHeight: typography.meaning.lineHeight,
  } as const;

  const bodyEnStyle = {
    color: colors.ink,
    fontFamily: 'CormorantGaramond_500Medium' as const,
    fontSize: 18,
    lineHeight: 30,
  };

  const bodyStyle = lang === 'hi' ? bodyHiStyle : bodyEnStyle;

  const a11yLabel = [pillText, ...verseLines, meaningLabel, meaning].join('. ');

  return (
    <View style={[styles.page, { width, backgroundColor: colors.parchment }]}>
      <ImageBackground source={bg} style={StyleSheet.absoluteFill} resizeMode="cover">
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
          {verseLines.map((line, idx) => (
            <Text
              key={`l-${idx}`}
              style={[
                styles.verseLine,
                {
                  color: colors.ink,
                  fontFamily:
                    lang === 'hi'
                      ? typography.verse.fontFamily
                      : 'CormorantGaramond_600SemiBold',
                  fontSize: lang === 'hi' ? typography.verse.fontSize : 18,
                  lineHeight: lang === 'hi' ? typography.verse.lineHeight : 28,
                  fontStyle: lang === 'en' ? 'italic' : 'normal',
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
    gap: 6,
  },
  verseLine: {
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
});
