import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CachedArtwork from './CachedArtwork';
import { useTheme } from '@/theme/ThemeContext';
import { practiceArtwork, practicePortraitFrames } from '@/data/routine/artwork';
import type { RoutineItem } from '@/data/routine/types';

/** Decorative R2 subject plate; the adjacent reading button owns the label. */
export default function PracticePortrait({ item }: { item: RoutineItem }) {
  const { colors, typography } = useTheme();
  const source = practiceArtwork(item);
  const frame = practicePortraitFrames[source.stem];
  const size = 60;
  return (
    <CachedArtwork source={source} resizeMode="contain"
      imageStyle={frame ? { width: size * 2 * frame.zoom, height: size * frame.zoom,
        left: size / 2 - size * 2 * frame.zoom * frame.x, top: size / 2 - size * frame.zoom * frame.y } : undefined}
      style={[styles.portrait, { backgroundColor: colors.parchmentDeep, borderColor: colors.goldTint }]}
      fallback={<View style={styles.fallback}><Text style={{ color: colors.inkMuted, fontFamily: typography.readerTitle.fontFamily }}>॥</Text></View>}
    />
  );
}
const styles = StyleSheet.create({
  portrait: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, overflow: 'hidden' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
