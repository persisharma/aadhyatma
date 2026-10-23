import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CachedArtwork from './CachedArtwork';
import { useTheme } from '@/theme/ThemeContext';
import { practiceArtwork } from '@/data/routine/artwork';
import type { RoutineItem } from '@/data/routine/types';

/** Decorative R2 subject plate; the adjacent reading button owns the label. */
export default function PracticePortrait({ item }: { item: RoutineItem }) {
  const { colors, typography } = useTheme();
  return (
    <CachedArtwork source={practiceArtwork(item)} resizeMode="contain"
      style={[styles.portrait, { backgroundColor: colors.parchmentDeep, borderColor: colors.goldTint }]}
      fallback={<View style={styles.fallback}><Text style={{ color: colors.inkMuted, fontFamily: typography.readerTitle.fontFamily }}>॥</Text></View>}
    />
  );
}
const styles = StyleSheet.create({
  portrait: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, overflow: 'hidden' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
