import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  verseLinesByLang,
  meaningByLang,
  commentaryByLang,
  meaningSourceLang,
  contentByLang,
  pick,
} from '@/utils/localize';
import { verseToken, meaningToken, scriptBodyFont, scriptTitleFont, pillTextStyle } from '@/utils/langType';
import type { GitaVerse } from '@/data/gita';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';

type Props = {
  verse: GitaVerse;
  sourceId: string;
  width: number;
  topActions?: React.ReactNode;
};

export default function GitaVersePage({ verse, sourceId, width, topActions }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const bg = getReaderBackground(sourceId, verse);

  const meaning = meaningByLang(lang, verse.meaningHi, verse.meaningEn, { gu: verse.meaningGu, kn: verse.meaningKn });
  const commentary = commentaryByLang(lang, verse.commentaryHi, verse.commentaryEn);
  // The fallback source is the language the meaning is NOT drawn from: hi/gu read the
  // Devanagari source, so their fallback is English; en/kn read English, fallback is Hindi.
  const otherCommentary =
    meaningSourceLang(lang) === 'en' ? verse.commentaryHi : verse.commentaryEn;
  const hasCommentary = commentary.length > 0;
  const commentaryFallbackNote =
    !hasCommentary && otherCommentary.length > 0
      ? pick(lang, {
          hi: 'इस श्लोक की विस्तृत व्याख्या केवल अंग्रेज़ी में उपलब्ध है।',
          en: 'Extended commentary is available in Hindi only for this verse.',
          gu: 'આ શ્લોકની વિગતવાર વ્યાખ્યા ફક્ત અંગ્રેજીમાં ઉપલબ્ધ છે.',
          kn: 'ಈ ಶ್ಲೋಕದ ವಿವರವಾದ ವ್ಯಾಖ್ಯಾನ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತ್ರ ಲಭ್ಯವಿದೆ.',
        })
      : null;

  // Single-language section labels — unified with VersePage's भावार्थ pattern
  // across all readers (design.md §9).
  const meaningLabel = pick(lang, {
    hi: 'भावार्थ',
    en: 'Meaning',
    gu: 'ભાવાર્થ',
    kn: 'ಭಾವಾರ್ಥ',
  });
  const commentaryLabel = pick(lang, {
    hi: 'व्याख्या',
    en: 'Commentary',
    gu: 'વ્યાખ્યા',
    kn: 'ವ್ಯಾಖ್ಯಾನ',
  });

  const pillText = contentByLang(
    lang,
    `श्लोक · ${verse.chapter}.${verse.number}`,
    `Shloka · ${verse.chapter}.${verse.number}`
  );

  // Meaning body styling follows the meaning's SOURCE language (kn meaning is English),
  // while verse lines below follow the display script. inkSoft for Devanagari-origin
  // prose (hi/gu), ink for Latin (en/kn) — preserving the original hi/en split exactly.
  const meaningTok = meaningToken(meaningSourceLang(lang), typography);
  const bodyStyle = {
    color: meaningSourceLang(lang) === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaningTok.fontFamily,
    fontSize: meaningTok.fontSize,
    lineHeight: meaningTok.lineHeight,
  } as const;

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
        <View style={styles.headerRow}>
          <View
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
          {verseLinesByLang(lang, verse.sanskrit, verse.transliteration).map((line, idx) => {
            const tok = verseToken(lang, typography);
            return (
              <Text
                key={`v-${idx}`}
                style={[
                  styles.verseLine,
                  {
                    color: colors.ink,
                    fontFamily: tok.fontFamily,
                    fontSize: tok.fontSize,
                    lineHeight: tok.lineHeight,
                  },
                ]}
              >
                {line}
              </Text>
            );
          })}
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

        {hasCommentary || commentaryFallbackNote ? (
          <>
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
                    fontFamily: lang === 'en' ? 'CormorantGaramond_400Regular_Italic' : scriptBodyFont(lang, typography.meaning.fontFamily),
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
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  verseBlock: {
    gap: 4,
  },
  verseLine: {
    // Devanagari verse body — keep Android's font padding so the first line's
    // top matras/shirorekha aren't clipped (the reported Japam-style clip).
  },
  translitBlock: {
    marginTop: 14,
    gap: 2,
  },
  translitLine: {
    // Latin romanization — includeFontPadding:false is safe (no matras).
    includeFontPadding: false,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 12,
    alignSelf: 'center',
  },
  body: {
    // Devanagari meaning prose — keep Android's font padding (no matra clip).
  },
  paragraphs: {
    gap: 14,
  },
  fallbackNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
