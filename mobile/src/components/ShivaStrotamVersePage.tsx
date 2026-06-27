import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  verseLinesByLang,
  meaningByLang,
  meaningSourceLang,
  contentByLang,
  pick,
} from '@/utils/localize';
import { verseToken, meaningToken, scriptTitleFont } from '@/utils/langType';
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

  const meaning = meaningByLang(lang, verse.meaningHi, verse.meaningEn, { gu: verse.meaningGu, kn: verse.meaningKn });
  const meaningLabel = pick(lang, {
    hi: 'अर्थ · Meaning',
    en: 'Meaning · अर्थ',
    gu: 'અર્થ · Meaning',
    kn: 'ಅರ್ಥ · Meaning',
  });
  const verseLines = verseLinesByLang(lang, verse.sanskrit, verse.linesEn);
  const verseTok = verseToken(lang, typography);
  const isIntro = verse.number === 0;
  const pillText = isIntro
    ? pick(lang, {
        hi: 'परिचय · Introduction',
        en: 'Introduction · परिचय',
        gu: 'પરિચય · Introduction',
        kn: 'ಪರಿಚಯ · Introduction',
      })
    : contentByLang(
        lang,
        `श्लोक · ${verse.chapter}.${verse.number}`,
        `Shloka · ${verse.chapter}.${verse.number}`
      );

  const meaningTok = meaningToken(meaningSourceLang(lang), typography);
  const bodyStyle = {
    color: meaningSourceLang(lang) === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaningTok.fontFamily,
    fontSize: meaningTok.fontSize,
    lineHeight: meaningTok.lineHeight,
  } as const;

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
                  fontFamily: verseTok.fontFamily,
                  fontSize: verseTok.fontSize,
                  lineHeight: verseTok.lineHeight,
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
                fontFamily: lang === 'en' ? typography.meaningLabel.fontFamily : scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: typography.meaningLabel.fontSize,
                letterSpacing: lang === 'en' ? typography.meaningLabel.letterSpacing : 0,
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
    // Devanagari verse body — keep Android's font padding (no top-matra clip).
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 12,
    alignSelf: 'center',
  },
  body: {
    // Devanagari meaning prose — keep Android's font padding (no matra clip).
  },
});
