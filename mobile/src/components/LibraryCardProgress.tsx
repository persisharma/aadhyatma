import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import type { SourceCoverage } from '@/data/readCoverage';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import ReadProgressBar from '@/components/ReadProgressBar';
import ResetUndoPill from '@/components/ResetUndoPill';

type Props = {
  coverage: SourceCoverage;
  /** The text's latest saved position, shown as `chapter.verse` beside the percentage. */
  pin?: ReadingProgress;
  onUndo: (() => void) | null;
};

/**
 * The read-coverage row under a library card's subtitle (design.md §84).
 * Texts with subsections get a bar + percentage + where you stopped; short
 * single texts read again and again (chalisa, aarti) get a "✓ N पाठ" chip
 * instead, since a bar would sit at 100% forever after the first reading.
 */
export default function LibraryCardProgress({ coverage, pin, onUndo }: Props) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();
  if (onUndo) return <ResetUndoPill onUndo={onUndo} />;
  const { read, total, pct, paath, hasChapters } = coverage;
  if (read === 0 && paath === 0) return null;

  const paathLabel = paath > 0 ? `${paath} ${contentByLang(lang, 'पाठ', paath === 1 ? 'reading' : 'readings')}` : '';
  const chip =
    paath > 0 ? (
      <View style={[styles.chip, { backgroundColor: colors.goldChipBg, borderRadius: radii.pill }]}>
        <CheckIcon size={12} weight="bold" color={colors.saffronDeep} />
        <Text style={[styles.chipText, { color: colors.saffronDeep }]}>{paathLabel}</Text>
      </View>
    ) : null;

  if (hasChapters && read > 0) {
    const where = pin?.chapter != null ? ` · ${pin.chapter}.${pin.verseIndex + 1}` : '';
    return (
      <View testID="library-card-progress" style={styles.wrap}>
        <View style={styles.barRow}>
          <View style={styles.bar}>
            <ReadProgressBar pct={pct} />
          </View>
          <Text style={[styles.label, { color: colors.saffronDeep }]}>{`${pct}%${where}`}</Text>
        </View>
        {chip}
      </View>
    );
  }

  return (
    <View testID="library-card-progress" style={[styles.wrap, styles.chipRow]}>
      {chip}
      {read > 0 ? <Text style={[styles.label, { color: colors.inkMuted }]}>{`${read} / ${total}`}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    flex: 1,
    minWidth: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 12,
  },
});
