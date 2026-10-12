import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { ReadingImage } from '@/data/readerIllustrationAsset';
import ReadingBanner from './ReadingBanner';
import AppIcon from './AppIcon';
import StoryIcon from './StoryIcon';

/** Shared Option 2 painting and divider; reserved space keeps reading stable. */
export default function ReadingArtwork({ source }: {
  source?: ReadingImage | null;
}) {
  const { colors } = useTheme();
  return (
    <>
      {source ? (
        <ReadingBanner source={source} testID="prose-reading-illustration" style={styles.plate} fallback={
          <View style={styles.fallback}><StoryIcon name="granth" size={96} /></View>
        } />
      ) : null}
      <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.rule, { backgroundColor: colors.gold }]} />
        <AppIcon name="peace" size={18} weight="fill" color={colors.gold} />
        <View style={[styles.rule, { backgroundColor: colors.gold }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  plate: { marginTop: 8 },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', opacity: 0.8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 16, opacity: 0.75 },
  rule: { flex: 1, height: 1 },
});
