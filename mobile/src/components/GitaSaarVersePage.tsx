import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import AutoSlideScrollView from '@/components/AutoSlideScrollView';
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
} from '@/utils/langType';
import type { GitaSaarVerse } from '@/data/gita-saar';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import GitaSaarDivider from './GitaSaarDivider';
import ProseParagraph from './ProseParagraph';

type Props = {
  verse: GitaSaarVerse;
  sourceId: string;
  chapterTitle?: string;
  width: number;
  /** Measured pager viewport: bounds the nested vertical reader on native. */
  height?: number;
  topActions?: React.ReactNode;
  /** Rendered under the saar on the theme's last page — the one-line essence. */
  closing?: { hi: string; en: string };
  /** Opens the Gita reader on this shloka (design.md §77: the quote travels with its hand-off). */
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
  chapterTitle,
  width,
  height,
  topActions,
  closing,
  onOpenInGita,
}: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();

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
    <View style={[styles.page, { width, height, backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getReaderBackground(sourceId, verse)} />

      <AutoSlideScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        nestedScrollEnabled
        directionalLockEnabled
        accessible={false}
      >
        <View style={{ paddingHorizontal: spacing.screenGutter }}>
          {chapterTitle ? (
            <ProseParagraph style={[styles.chapterTitle, {
              color: colors.ink,
              fontFamily: lang === 'en' ? fontFamilies.latinBold : scriptTitleFont(lang, typography.screenTitle.fontFamily),
              fontSize: typography.screenTitle.fontSize,
            }]}>{chapterTitle}</ProseParagraph>
          ) : null}
          {/* Group eyebrow: which section of the reading order this page belongs to. */}
          <ProseParagraph
            testID="gita-saar-group"
            style={[
              styles.eyebrow,
              { fontFamily: lang === 'en' ? typography.subtitle.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 16, lineHeight: 25 },
              { color: colors.inkMuted },
            ]}
          >
            {groupTitle}
          </ProseParagraph>
          {verse.isGroupStart ? (
            <ProseParagraph
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
            </ProseParagraph>
          ) : null}

        </View>
        <View style={{ paddingHorizontal: spacing.screenGutter }}>
          <View style={styles.headerRow}>
            <View
              accessible
              accessibilityLabel={a11yLabel}
              style={[styles.pill, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}
            >
              <ProseParagraph
                style={[styles.pillText, pillTextStyle(lang, typography.versePill), { color: colors.saffronDeep }]}
              >
                {pillText}
              </ProseParagraph>
            </View>
            {topActions ? <View style={styles.headerActions}>{topActions}</View> : null}
          </View>

          <View style={styles.verseBlock}>
            {verseLinesByLang(lang, verse.sanskrit, verse.transliteration).map((line, idx) => {
              const tok = verseToken(lang, typography);
              return (
                <ProseParagraph
                  key={`v-${idx}`}
                  style={[
                    styles.verseLine,
                    { color: colors.ink, fontFamily: tok.fontFamily, fontSize: tok.fontSize, lineHeight: tok.lineHeight },
                  ]}
                >
                  {line}
                </ProseParagraph>
              );
            })}
          </View>

          <GitaSaarDivider />

          <ProseParagraph style={[styles.sectionLabel, labelStyle]}>{saarLabel}</ProseParagraph>
          <ProseParagraph
            style={[
              styles.themeLine,
              {
                color: colors.ink,
                fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.screenTitle.fontFamily),
                fontSize: meaningTok.fontSize + 3,
                lineHeight: meaningTok.lineHeight + 2,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              },
            ]}
          >
            {themeLine}
          </ProseParagraph>
          <ProseParagraph style={[styles.body, bodyStyle]}>{saar}</ProseParagraph>

          {onOpenInGita ? (
            <Pressable
              onPress={onOpenInGita}
              accessibilityRole="button"
              accessibilityLabel={`Open Gita reader for ${verse.gitaChapter}.${verse.gitaVerse}`}
              testID="gita-saar-open-in-gita"
              hitSlop={8}
              style={({ pressed }) => [
                styles.handoff,
                { borderColor: colors.gold, borderRadius: radii.pill, backgroundColor: colors.parchmentSoft },
                pressed && { opacity: 0.86 },
              ]}
            >
              <ProseParagraph
                style={{
                  color: colors.saffronDeep,
                  fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.readerTitle.fontFamily),
                  fontSize: 14,
                  textAlign: 'center',
                  flexShrink: 1,
                }}
              >
                {openInGitaLabel}
              </ProseParagraph>
            </Pressable>
          ) : null}

          {closingText ? (
            <>
              <GitaSaarDivider />
              <ProseParagraph style={[styles.sectionLabel, labelStyle]}>{closingLabel}</ProseParagraph>
              <ProseParagraph style={[styles.body, styles.closing, bodyStyle]}>{closingText}</ProseParagraph>
            </>
          ) : null}
        </View>
      </AutoSlideScrollView>
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
  chapterTitle: { lineHeight: 54, paddingVertical: 8, marginBottom: 6 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    maxWidth: '100%',
    flexShrink: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    textTransform: 'uppercase',
    includeFontPadding: true,
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
    textAlign: 'center',
    // Devanagari verse body — keep Android's font padding so top matras aren't clipped.
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  themeLine: {
    textAlign: 'left',
    paddingVertical: 4,
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
    maxWidth: '100%',
    marginTop: 24,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
