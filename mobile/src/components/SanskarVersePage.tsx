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
import { verseToken, meaningToken } from '@/utils/langType';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';
import type { SanskarVerse } from '@/data/sanskar';

type Props = {
  verse: SanskarVerse;
  sourceId: string;
  width: number;
};

export default function SanskarVersePage({ verse, sourceId, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const bg = useMemo(() => getReaderBackground(sourceId, verse), [sourceId, verse]);

  const isIntro = verse.type === 'intro';
  const isStep = verse.type === 'step';
  const isVidhi = verse.type === 'vidhi';

  const pillText = useMemo(() => {
    if (isIntro) {
      return pick(lang, { hi: 'परिचय', en: 'Introduction', gu: 'પરિચય', kn: 'ಪರಿಚಯ' });
    }
    if (isVidhi) {
      return pick(lang, { hi: 'विधि', en: 'Method', gu: 'વિધિ', kn: 'ವಿಧಿ' });
    }
    if (isStep) {
      const label = contentByLang(lang, verse.labelHi, verse.labelEn);
      const stepNum = verse.number - 1; // subtract 1 because intro is verse 1
      const prefix = contentByLang(lang, `चरण ${stepNum}`, `Step ${stepNum}`);
      return `${prefix} · ${label}`;
    }
    return contentByLang(lang, verse.labelHi, verse.labelEn);
  }, [isIntro, isStep, isVidhi, lang, verse.labelHi, verse.labelEn, verse.number]);

  const verseLines = verseLinesByLang(lang, verse.lines, verse.linesEn);
  const meaning = meaningByLang(lang, verse.meaningHi, verse.meaningEn);
  const meaningLabel = pick(lang, { hi: 'भावार्थ', en: 'Meaning', gu: 'ભાવાર્થ', kn: 'ಭಾವಾರ್ಥ' });
  const hasVidhi = !!(verse.vidhiHi || verse.vidhiEn);
  const vidhiContent = meaningByLang(lang, verse.vidhiHi ?? '', verse.vidhiEn ?? '');
  const vidhiLabel = pick(lang, {
    hi: 'कैसे करें',
    en: 'How to',
    gu: 'કેવી રીતે કરવું',
    kn: 'ಹೇಗೆ ಮಾಡಬೇಕು',
  });

  const verseTok = verseToken(lang, typography);
  const verseLineStyle = useMemo(
    () => ({
      color: colors.ink,
      fontFamily: verseTok.fontFamily,
      fontSize: verseTok.fontSize,
      lineHeight: verseTok.lineHeight,
      fontStyle: (lang === 'en' ? 'italic' : 'normal') as 'italic' | 'normal',
    }),
    [lang, colors.ink, verseTok]
  );

  const meaningTok = meaningToken(meaningSourceLang(lang), typography);
  const bodyStyle = useMemo(
    () => ({
      color: meaningSourceLang(lang) === 'en' ? colors.ink : colors.inkSoft,
      fontFamily: meaningTok.fontFamily,
      fontSize: meaningTok.fontSize,
      lineHeight: meaningTok.lineHeight,
    }),
    [lang, colors.ink, colors.inkSoft, meaningTok]
  );

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
        {/* Pill */}
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
            numberOfLines={1}
          >
            {pillText}
          </Text>
        </View>

        {/* Verse lines */}
        <View style={styles.verseBlock}>
          {verseLines.map((line, idx) => (
            <Text key={`l-${idx}`} style={[styles.verseLine, verseLineStyle]}>
              {line}
            </Text>
          ))}
        </View>

        <Ornament />

        {/* Meaning label */}
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

        {/* Meaning body */}
        <Text style={[styles.body, bodyStyle]}>{meaning}</Text>

        {/* Vidhi section (below meaning) */}
        {hasVidhi && vidhiContent ? (
          <View style={styles.vidhiSection}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.saffronDeep,
                  fontSize: typography.sectionLabel.fontSize,
                  fontWeight: typography.sectionLabel.fontWeight,
                  letterSpacing: typography.sectionLabel.letterSpacing,
                },
              ]}
            >
              {vidhiLabel}
            </Text>
            <Text style={[styles.body, bodyStyle]}>{vidhiContent}</Text>
          </View>
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
  vidhiSection: {
    marginTop: 28,
  },
});
