import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { BajrangBaanVerse } from '@/data/bajrang-baan';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';

type Props = {
  verse: BajrangBaanVerse;
  sourceId: string;
  width: number;
};

export default function BajrangBaanVersePage({ verse, sourceId, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const bg = useMemo(
    () => getReaderBackground(sourceId, verse),
    [sourceId, verse]
  );
  const meaning = lang === 'hi' ? verse.meaningHi : verse.meaningEn;
  const meaningLabel = lang === 'hi' ? 'भावार्थ' : 'Meaning';
  const verseLines = lang === 'hi' ? verse.lines : verse.linesEn;
  const pillText = useMemo(
    () => (lang === 'hi' ? verse.labelHi : verse.labelEn),
    [lang, verse.labelHi, verse.labelEn]
  );

  const bodyHiStyle = {
    color: colors.inkSoft,
    fontFamily: typography.meaning.fontFamily,
    fontSize: typography.meaning.fontSize,
    lineHeight: typography.meaning.lineHeight,
  } as const;

  const bodyEnStyle = {
    color: colors.ink,
    fontFamily: typography.meaningEnglish.fontFamily,
    fontSize: typography.meaningEnglish.fontSize,
    lineHeight: typography.meaningEnglish.lineHeight,
  };

  const bodyStyle = lang === 'hi' ? bodyHiStyle : bodyEnStyle;

  const a11yLabel = [pillText, ...verseLines, meaningLabel, meaning].join('. ');

  return (
    <View style={[styles.page, { width, backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={bg} />

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
                      : typography.verseLatin.fontFamily,
                  fontSize:
                    lang === 'hi'
                      ? typography.verse.fontSize
                      : typography.verseLatin.fontSize,
                  lineHeight:
                    lang === 'hi'
                      ? typography.verse.lineHeight
                      : typography.verseLatin.lineHeight,
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
