import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

/**
 * How much of a text (or subsection) has been read — the coverage bar on
 * library cards, chapter cards and the chapters summary (design.md §84).
 * Distinct from ReadingProgressBar, which is the reader's *position* line.
 */
export default function ReadProgressBar({ pct }: { pct: number }) {
  const { colors } = useTheme();
  const width = `${Math.max(0, Math.min(100, pct))}%` as const;
  return (
    <View style={[styles.track, { backgroundColor: colors.saffronTint }]}>
      <View style={[styles.fill, { width, backgroundColor: colors.saffronDeep }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 999, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 999 },
});
