import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { cardFontByLang, isLatinLang, pillTextStyle } from '@/utils/langType';
import { useReadCoverage } from '@/utils/readCoverageStore';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useGranthProgressScope } from '@/components/GranthProgressScope';
import ReadProgressBar from '@/components/ReadProgressBar';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
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

export default function GitaChapterCard({
  chapter,
  onPress,
  chapterLabelHi = 'अध्याय',
  chapterLabelEn = 'Chapter',
  unitLabelHi = 'श्लोक',
  unitLabelEn = 'verses',
  unitLabelEnSingular = 'verse',
}: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const primaryTitle = contentByLang(lang, chapter.titleHi, chapter.titleEn);
  const primaryFontFamily = cardFontByLang(lang);
  const primaryFontSize = isLatinLang(lang) ? 16 : 17;
  const primaryIsItalic = lang === 'en';

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
    <Pressable
      onPress={onPress}
      onLongPress={read > 0 ? askReset : undefined}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityValue={read > 0 ? { text: complete ? 'Complete' : `${read} of ${chapter.verseCount} read` } : undefined}
      accessibilityActions={read > 0 ? [{ name: 'longpress', label: 'Reset progress' }] : undefined}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'longpress') askReset();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
        },
        pressed && { opacity: 0.86 },
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
      />

      {complete ? (
        <View testID="chapter-complete" style={[styles.thumb, { borderRadius: radii.md, backgroundColor: colors.saffronDeep }]}>
          <CheckIcon size={22} weight="bold" color={colors.parchmentSoft} />
        </View>
      ) : (
        <LinearGradient
          colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.thumb, { borderRadius: radii.md }]}
        >
          <Text
            style={[
              styles.thumbNumber,
              {
                color: colors.parchmentSoft,
                fontFamily: typography.thumb.fontFamily,
              },
            ]}
          >
            {chapter.chapter}
          </Text>
        </LinearGradient>
      )}

      <View style={styles.meta}>
        <Text
          style={[
            styles.tag,
            pillTextStyle(lang, typography.versePill),
            { color: colors.saffronDeep },
          ]}
        >
          {chapterTag.toUpperCase()}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: colors.ink,
              fontFamily: primaryFontFamily,
              fontSize: primaryFontSize,
              fontStyle: primaryIsItalic ? 'italic' : 'normal',
            },
          ]}
          numberOfLines={2}
        >
          {primaryTitle}
        </Text>
        <Text
          style={[
            styles.sub,
            {
              color: colors.inkMuted,
              fontSize: typography.cardMeta.fontSize,
              letterSpacing: typography.cardMeta.letterSpacing,
            },
          ]}
        >
          {progressMeta ?? verseMeta}
        </Text>
        {read > 0 && !complete ? <ReadProgressBar pct={(read / chapter.verseCount) * 100} /> : null}
      </View>

      <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    ...elevation.lifted,
  },
  thumb: {
    overflow: 'hidden',
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbNumber: {
    fontSize: 20,
    includeFontPadding: false,
    marginTop: -1,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  tag: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  title: {
    // Devanagari title — leave Android's includeFontPadding on so top matras of
    // the chapter name aren't clipped (iOS is unaffected either way).
  },
  sub: {
    opacity: 0.9,
  },
  chev: {
    fontSize: 26,
    marginLeft: 6,
    includeFontPadding: false,
  },
});
