import React, { useMemo } from 'react';
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
import { verseToken, meaningToken, scriptTitleFont, pillTextStyle } from '@/utils/langType';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';

export type LinesVersePageVerse = {
  id: string;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

type Props = {
  verse: LinesVersePageVerse;
  sourceId: string;
  width: number;
  /** Per-verse actions (bookmark/share) rendered in the page header beside the pill. */
  topActions?: React.ReactNode;
};

export default function SundarkandVersePage({ verse, sourceId, width, topActions }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const bg = useMemo(() => getReaderBackground(sourceId, verse), [sourceId, verse]);
  const meaning = meaningByLang(lang, verse.meaningHi, verse.meaningEn, { gu: verse.meaningGu, kn: verse.meaningKn });
  const meaningLabel = pick(lang, { hi: 'भावार्थ', en: 'Meaning', gu: 'ભાવાર્થ', kn: 'ಭಾವಾರ್ಥ' });
  const verseLines = verseLinesByLang(lang, verse.lines, verse.linesEn);
  const verseTok = verseToken(lang, typography);
  const pillText = useMemo(
    () => contentByLang(lang, verse.labelHi, verse.labelEn),
    [lang, verse.labelHi, verse.labelEn]
  );

  const meaningTok = meaningToken(meaningSourceLang(lang), typography);
  const bodyStyle = {
    color: meaningSourceLang(lang) === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaningTok.fontFamily,
    fontSize: meaningTok.fontSize,
    lineHeight: meaningTok.lineHeight,
  } as const;

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
        accessible={false}
      >
        <View style={styles.headerRow}>
          <View
            accessible
            accessibilityLabel={a11yLabel}
            style={[
              styles.pill,
              { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                pillTextStyle(lang, typography.versePill),
                { color: colors.saffronDeep },
              ]}
            >
              {pillText}
            </Text>
          </View>
          {topActions ? <View style={styles.headerActions}>{topActions}</View> : null}
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

        <Ornament />

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
    // Clears the pager-dots overlay and the screen/tab-bar seam so the last
    // meaning line never reads as tucked under the bar (design.md B2).
    paddingBottom: 64,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  verseBlock: {
    gap: 6,
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
