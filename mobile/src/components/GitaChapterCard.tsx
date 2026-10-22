import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import ListCard, { CARD_TITLE_SIZES, CardThumb, CardTitles } from './ListCard';
import type { GitaChapterSummary } from '@/data/gita';

type Props = {
  chapter: GitaChapterSummary;
  onPress: () => void;
  chapterLabelHi?: string;
  chapterLabelEn?: string;
  unitLabelHi?: string;
  unitLabelEn?: string;
  /**
   * English unit label for a one-verse subsection ("1 verse", not "1 verses").
   * Devanagari needs no counterpart — श्लोक / पद are already number-agnostic.
   */
  unitLabelEnSingular?: string;
};

/**
 * A chapter-index row as the shared regular `ListCard` (design.md §8): the
 * chapter numeral in the thumb (a number is data, not an icon), bilingual
 * chapter title, and "अध्याय 1 · 47 श्लोक" meta. The unit label lives in the
 * meta line rather than its own eyebrow, since the thumb already shows the
 * number.
 */
export default function GitaChapterCard({
  chapter,
  onPress,
  chapterLabelHi = 'अध्याय',
  chapterLabelEn = 'Chapter',
  unitLabelHi = 'श्लोक',
  unitLabelEn = 'verses',
  unitLabelEnSingular = 'verse',
}: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();

  const { primary, secondary } = orderTitlesByLanguage(lang, chapter.titleHi, chapter.titleEn, CARD_TITLE_SIZES);
  const primaryTitle = contentByLang(lang, chapter.titleHi, chapter.titleEn);

  const chapterLabel = contentByLang(lang, chapterLabelHi, chapterLabelEn);
  const unitLabel = contentByLang(
    lang,
    unitLabelHi,
    chapter.verseCount === 1 ? unitLabelEnSingular : unitLabelEn
  );
  const chapterTag = `${chapterLabel} ${chapter.chapter}`;
  const verseMeta = `${chapter.verseCount} ${unitLabel}`;

  const a11yLabel = `${chapterTag}. ${primaryTitle}. ${verseMeta}. Tap to open.`;

  return (
    <ListCard
      onPress={onPress}
      accessibilityLabel={a11yLabel}
      // Chapter indexes space their cards with the container's `gap`.
      style={styles.inList}
      leading={
        <CardThumb>
          <Text style={[styles.numeral, { color: colors.parchmentSoft, fontFamily: typography.thumb.fontFamily }]}>
            {chapter.chapter}
          </Text>
        </CardThumb>
      }
    >
      <CardTitles primary={primary} secondary={secondary} meta={`${chapterTag} · ${verseMeta}`} />
    </ListCard>
  );
}

const styles = StyleSheet.create({
  inList: { marginBottom: 0 },
  numeral: {
    fontSize: 22,
    includeFontPadding: false,
    marginTop: -1,
  },
});
