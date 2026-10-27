import React from 'react';
import { StyleSheet, View } from 'react-native';
import CachedArtwork from './CachedArtwork';
import { observanceThumbnail } from '@/panchang/observanceThumbnails';
import { observanceIllustrations, type ObservanceArtVariant } from '@/panchang/observancePortraits';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';

/** Scene crops belong to their slot; a deity's face is not an event illustration. */
export default function ObservanceArtwork({ rule, size = 78, width = size, height = size, variant = 'list' }: {
  rule: Pick<ObservanceRule, 'deityEn' | 'category'> & Partial<Pick<ObservanceRule, 'id'>>;
  size?: number;
  width?: number;
  height?: number;
  variant?: ObservanceArtVariant;
}) {
  const { colors, radii } = useTheme();
  const paintings = observanceIllustrations(rule, variant);
  const multiple = paintings.length > 1;
  // Separate complete miniatures for unmatched joint subjects, never vertical
  // slices of enlarged faces. Known shared scenes use one complete painting.
  const plateWidth = multiple ? width / paintings.length : width;
  const plateHeight = multiple ? Math.min(plateWidth, height) : height;

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width, height, borderRadius: radii.sm, backgroundColor: colors.parchmentSoft }]}>
      {paintings.length ? paintings.map(({ source, frame }, index) => {
        const imageHeight = Math.max(plateHeight * frame.zoom, plateWidth / frame.aspect);
        const focusY = variant === 'upcoming' && frame.aspect < 1.4 ? 0.3 : frame.y;
        const imageWidth = imageHeight * frame.aspect;
        return (
          <CachedArtwork key={index} source={observanceThumbnail(source)} resizeMode="contain"
            style={{ width: plateWidth, height: plateHeight, overflow: 'hidden', borderRadius: multiple ? radii.sm : 0 }}
            imageStyle={{ width: imageWidth, height: imageHeight,
              right: 'auto', bottom: 'auto',
              left: imageWidth < plateWidth ? (plateWidth - imageWidth) / 2 : Math.min(0, Math.max(plateWidth - imageWidth, plateWidth / 2 - imageWidth * frame.x)),
              top: Math.min(0, Math.max(plateHeight - imageHeight, plateHeight / 2 - imageHeight * focusY)),
            }}
            />
        );
      }) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
