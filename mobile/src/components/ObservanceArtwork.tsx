import React from 'react';
import { StyleSheet, View } from 'react-native';
import StoryIcon from './StoryIcon';
import CachedArtwork from './CachedArtwork';
import { observanceIcon } from '@/panchang/observancePresentation';
import { observancePortraits } from '@/panchang/observancePortraits';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';

/** Real subject paintings; symbolic icons are only the loading/offline fallback. */
export default function ObservanceArtwork({ rule, size = 64 }: {
  rule: Pick<ObservanceRule, 'deityEn' | 'category'>;
  size?: number;
}) {
  const { colors, radii } = useTheme();
  const portraits = observancePortraits(rule);
  const width = size / Math.max(1, portraits.length);
  const fallback = <StoryIcon name={observanceIcon(rule)} size={Math.min(size - 8, width - 4)} />;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width: size, height: size, borderRadius: radii.md, backgroundColor: colors.cardThumbRest }]}
    >
      {portraits.length ? portraits.map(({ source, frame }, index) => (
        <CachedArtwork
          key={index}
          source={source}
          resizeMode="contain"
          style={{ width, height: size, overflow: 'hidden' }}
          imageStyle={{
            width: size * frame.aspect * frame.zoom, height: size * frame.zoom,
            left: width / 2 - size * frame.aspect * frame.zoom * frame.x,
            top: size / 2 - size * frame.zoom * frame.y,
          }}
          fallback={<View style={styles.fallback}>{fallback}</View>}
        />
      )) : fallback}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
