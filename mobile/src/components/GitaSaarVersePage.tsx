import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import {
  verseLinesByLang,
  meaningByLang,
  meaningSourceLang,
  contentByLang,
  pick,
} from '@/utils/localize';
import {
  verseToken,
  meaningToken,
  scriptBodyFont,
  scriptTitleFont,
  pillTextStyle,
  eyebrowTextStyle,
  titleFontByLang,
} from '@/utils/langType';
import type { GitaSaarVerse } from '@/data/gita-saar';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import Ornament from './Ornament';

type Props = {
  verse: GitaSaarVerse;
  sourceId: string;
  width: number;
  topActions?: React.ReactNode;
  /** Rendered under the saar on the theme's last page — the one-line essence. */
  closing?: { hi: string; en: string };
  /** Opens the Gita reader on this shloka (design.md §75: the quote travels with its hand-off). */
  onOpenInGita?: () => void;
};

/**
 * One page of the गीता सार reader: the group eyebrow, the `श्लोक · c.v` pill,
 * the corpus Sanskrit / IAST, the सार (the theme's plain-language sense), and
 * the hand-off into the Gita reader for the full bhāvārtha and commentary.
 * Reading content sizes only from the shared typography tokens (RULEBOOK §3).
 */
export default function GitaSaarVersePage({
  verse,
  sourceId,
  width,
  topActions,
  closing,
  onOpenInGita,
}: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const bg = getReaderBackground(sourceId, verse);

  const saar = meaningByLang(lang, verse.meaningHi, verse.meaningEn);
  const groupTitle = contentByLang(lang, verse.groupTitleHi, verse.groupTitleEn);
  const groupIntro = contentByLang(lang, verse.groupIntroHi, verse.groupIntroEn);
  const themeLine = contentByLang(lang, verse.themeHi, verse.themeEn);
  const closingText = closing ? meaningByLang(lang, closing.hi, closing.en) : null;

  const saarLabel = pick(lang, { hi: 'सार', en: 'Essence', gu: 'સાર', kn: 'ಸಾರ' });
  const closingLabel = pick(lang, {
    hi: 'एक पंक्ति में',
    en: 'In one line',
    gu: 'એક પંક્તિમાં',
    kn: 'ಒಂದು ಸಾಲಿನಲ್ಲಿ',
  });
  const openInGitaLabel = pick(lang, {
    hi: 'पूरा अर्थ गीता में पढ़ें ›',
    en: 'Read the full meaning in the Gita ›',
    gu: 'પૂરો અર્થ ગીતામાં વાંચો ›',
    kn: 'ಪೂರ್ಣ ಅರ್ಥವನ್ನು ಗೀತೆಯಲ್ಲಿ ಓದಿ ›',
  });

  // Same vocabulary as the Gita reader: the pill names the shloka as printed.
  const pillText = contentByLang(
    lang,
    `श्लोक · ${verse.gitaChapter}.${verse.gitaVerse}`,
    `Shloka · ${verse.gitaChapter}.${verse.gitaVerse}`
  );

  const meaningTok = meaningToken(meaningSourceLang(lang), typography);
  const bodyStyle = {
    color: meaningSourceLang(lang) === 'en' ? colors.ink : colors.inkSoft,
    fontFamily: meaningTok.fontFamily,
    fontSize: meaningTok.fontSize,
    lineHeight: meaningTok.lineHeight,
  } as const;

  const labelStyle = {
    color: colors.saffronDeep,
    fontFamily:
      lang === 'en'
        ? typography.meaningLabel.fontFamily
        : scriptTitleFont(lang, typography.readerTitle.fontFamily),
    fontSize: typography.meaningLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.meaningLabel.letterSpacing : 0,
  } as const;

  const a11yLabel = [
    `Verse ${verse.gitaChapter}.${verse.gitaVerse}`,
    groupTitle,
    ...verse.sanskrit,
    saarLabel,
    saar,
  ].join('. ');

  return (
    <View style={[styles.page, { width, backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenGutter }]}
        showsVerticalScrollIndicator={false}
        accessible={false}
      >
        <View style={styles.headerRow}>
          <View
            accessible
            accessibilityLabel={a11yLabel}
            style={[styles.pill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}
          >
            <Text
              style={[styles.pillText, pillTextStyle(lang, typography.versePill), { color: colors.saffronDeep }]}
            >
              {pillText}
            </Text>
          </View>
          {topActions ? <View style={styles.headerActions}>{topActions}</View> : null}
        </View>

        {/* Group eyebrow: which section of the reading order this page belongs to. */}
        <Text
          testID="gita-saar-group"
          style={[
            styles.eyebrow,
            eyebrowTextStyle(lang, typography.sectionLabel.fontSize),
            { color: colors.inkMuted },
          ]}
        >
          {groupTitle}
        </Text>
        {verse.isGroupStart ? (
          <Text
            style={[
              styles.groupIntro,
              {
                color: colors.inkSoft,
                fontFamily: lang === 'en' ? typography.subtitle.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 15,
                lineHeight: 23,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              },
            ]}
          >
            {groupIntro}
          </Text>
        ) : null}

        <View style={styles.verseBlock}>
          {verseLinesByLang(lang, verse.sanskrit, verse.transliteration).map((line, idx) => {
            const tok = verseToken(lang, typography);
            return (
              <Text
                key={`v-${idx}`}
                style={[
                  styles.verseLine,
                  { color: colors.ink, fontFamily: tok.fontFamily, fontSize: tok.fontSize, lineHeight: tok.lineHeight },
                ]}
              >
                {line}
              </Text>
            );
          })}
        </View>

        <Ornament />

        <Text style={[styles.sectionLabel, labelStyle]}>{saarLabel}</Text>
        <Text
          style={[
            styles.themeLine,
            {
              color: colors.saffronDeep,
              fontFamily: titleFontByLang(lang),
              fontSize: 17,
              lineHeight: 25,
              fontStyle: lang === 'en' ? 'italic' : 'normal',
            },
          ]}
        >
          {themeLine}
        </Text>
        <Text style={[styles.body, bodyStyle]}>{saar}</Text>

        {onOpenInGita ? (
          <Pressable
            onPress={onOpenInGita}
            accessibilityRole="button"
            accessibilityLabel={`Open Gita reader for ${verse.gitaChapter}.${verse.gitaVerse}`}
            testID="gita-saar-open-in-gita"
            hitSlop={8}
            style={({ pressed }) => [
              styles.handoff,
              { borderColor: colors.divider, borderRadius: radii.pill, backgroundColor: colors.parchmentSoft },
              pressed && { opacity: 0.86 },
            ]}
          >
            <Text
              style={{
                color: colors.saffronDeep,
                fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 14,
                includeFontPadding: false,
              }}
            >
              {openInGitaLabel}
            </Text>
          </Pressable>
        ) : null}

        {closingText ? (
          <>
            <Ornament />
            <Text style={[styles.sectionLabel, labelStyle]}>{closingLabel}</Text>
            <Text style={[styles.body, styles.closing, bodyStyle]}>{closingText}</Text>
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
    // Clears the pager-dots overlay and the screen/tab-bar seam (design.md B2).
    paddingBottom: 64,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  eyebrow: {
    marginBottom: 6,
  },
  groupIntro: {
    marginBottom: 14,
  },
  verseBlock: {
    gap: 4,
    marginTop: 6,
  },
  verseLine: {
    // Devanagari verse body — keep Android's font padding so top matras aren't clipped.
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 10,
    alignSelf: 'center',
  },
  themeLine: {
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    // Devanagari meaning prose — keep Android's font padding (no matra clip).
  },
  closing: {
    textAlign: 'center',
  },
  handoff: {
    alignSelf: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
