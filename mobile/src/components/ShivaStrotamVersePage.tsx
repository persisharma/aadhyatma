import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { ShivaStrotamVerse } from '@/data/shiva-strotam';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';

type Props = {
  verse: ShivaStrotamVerse;
  sourceId: string;
  width: number;
};

export default function ShivaStrotamVersePage({ verse, sourceId, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const bg = getReaderBackground(sourceId, verse);

  const meaning = lang === 'hi' ? verse.meaningHi : verse.meaningEn;
  const meaningLabel = lang === 'hi' ? 'अर्थ · Meaning' : 'Meaning · अर्थ';
  const verseLines = lang === 'hi' ? verse.sanskrit : verse.linesEn;
  const isIntro = verse.number === 0;
  const pillText = isIntro
    ? (lang === 'hi' ? 'परिचय · Introduction' : 'Introduction · परिचय')
    : lang === 'hi'
      ? `श्लोक · ${verse.chapter}.${verse.number}`
      : `Shloka · ${verse.chapter}.${verse.number}`;

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
    ...verseLines,
    meaningLabel,
    meaning,
  ].join('. ');

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

        {!isIntro && <Ornament />}

        {!isIntro && (
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
        )}
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
    gap: 4,
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
