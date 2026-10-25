import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { useReadCoverage } from '@/utils/readCoverageStore';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useGranthProgressScope } from '@/components/GranthProgressScope';
import ReadProgressBar from '@/components/ReadProgressBar';
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
 * number. Inside a `GranthProgressScope` the meta carries the read count and
 * a coverage bar follows it; a finished chapter's thumb turns into a ✓.
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

  // Read coverage shows only inside a GranthProgressScope (the chapters
  // screens); elsewhere the card is exactly as before (design.md §84).
  const scope = useGranthProgressScope();
  const { getChapterCoverage } = useReadCoverage();
  const { getChapterProgress } = useReadingProgress();
  const cov = scope ? getChapterCoverage(scope.sourceId, chapter.chapter) : null;
  const read = cov?.read ?? 0;
  const complete = !!cov?.complete;
  const pin = scope ? getChapterProgress(scope.sourceId, chapter.chapter) : undefined;
  const lastLabel = pick(lang, { hi: 'अंतिम', en: 'last', gu: 'છેલ્લું', kn: 'ಕೊನೆಯ' });
  const progressMeta =
    read > 0
      ? `${read} / ${chapter.verseCount} ${unitLabel}${pin ? ` · ${lastLabel} ${pin.verseIndex + 1}` : ''}`
      : null;
  const askReset = () => {
    if (scope && read > 0) {
      scope.askReset({ sourceId: scope.sourceId, chapter: chapter.chapter, label: `${chapterTag} · ${primaryTitle}`, readCount: read });
    }
  };

  // The label stays exactly as before — Maestro flows match on it; progress rides on accessibilityValue.
  const a11yLabel = `${chapterTag}. ${primaryTitle}. ${verseMeta}. Tap to open.`;

  return (
    <ListCard
      onPress={onPress}
      onLongPress={read > 0 ? askReset : undefined}
      accessibilityLabel={a11yLabel}
      accessibilityValue={read > 0 ? { text: complete ? 'Complete' : `${read} of ${chapter.verseCount} read` } : undefined}
      accessibilityActions={read > 0 ? [{ name: 'longpress', label: 'Reset progress' }] : undefined}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'longpress') askReset();
      }}
      // Chapter indexes space their cards with the container's `gap`.
      style={styles.inList}
      leading={
        complete ? (
          <CardThumb done testID="chapter-complete">
            <CheckIcon size={22} weight="bold" color={colors.parchmentSoft} />
          </CardThumb>
        ) : (
          <CardThumb>
            <Text style={[styles.numeral, { color: colors.parchmentSoft, fontFamily: typography.thumb.fontFamily }]}>
              {chapter.chapter}
            </Text>
          </CardThumb>
        )
      }
    >
      <CardTitles primary={primary} secondary={secondary} meta={`${chapterTag} · ${progressMeta ?? verseMeta}`} />
      {read > 0 && !complete ? (
        <View style={styles.bar}>
          <ReadProgressBar pct={(read / chapter.verseCount) * 100} />
        </View>
      ) : null}
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
  bar: { marginTop: 6 },
});
