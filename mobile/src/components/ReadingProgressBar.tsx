import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  /** 1-based position of the current page (e.g. 1 for the first of `total`). */
  current: number;
  /** Total number of pages in the text. */
  total: number;
};

/**
 * Thin reading-progress bar shown under a reader's top bar — the continuous
 * form of the "n / total" page counter, so a reader can see how far into the
 * text they are. Renders nothing when there are no pages to track.
 */
export default function ReadingProgressBar({ current, total }: Props) {
  const { colors } = useTheme();
  if (total <= 0) return null;
  const pct = Math.max(0, Math.min(1, current / total)) * 100;
  return (
    <View style={[styles.track, { backgroundColor: colors.divider }]}>
      <View
        testID="reading-progress-fill"
        style={[styles.fill, { backgroundColor: colors.saffron, width: `${pct}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 3, width: '100%', overflow: 'hidden' },
  fill: { height: 3, borderRadius: 999 },
});
