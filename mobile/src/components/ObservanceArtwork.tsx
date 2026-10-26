import React from 'react';
import { StyleSheet, View } from 'react-native';
import StoryIcon from './StoryIcon';
import CachedArtwork from './CachedArtwork';
import { observanceIcon } from '@/panchang/observancePresentation';
import { observancePortraits } from '@/panchang/observancePortraits';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';

/** Real subject paintings; symbolic icons are only the loading/offline fallback. */
export default function ObservanceArtwork({ rule, size = 64, width = size, height = size, layout = 'portrait' }: {
  rule: Pick<ObservanceRule, 'deityEn' | 'category'>;
  size?: number;
  width?: number;
  height?: number;
  layout?: 'portrait' | 'scene';
}) {
  const { colors, radii } = useTheme();
  const portraits = observancePortraits(rule);
  const paneWidth = width / Math.max(1, portraits.length);
  const fallback = <StoryIcon name={observanceIcon(rule)} size={Math.min(height - 8, paneWidth - 4)} />;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width, height, borderRadius: radii.md, backgroundColor: colors.cardThumbRest }]}
    >
      {portraits.length ? portraits.map(({ source, frame }, index) => {
        // Full reader scenes work in wide panels. Branded portrait masters and
        // composites retain their reviewed focal frames and every named person.
        const fullScene = layout === 'scene' && portraits.length === 1 && typeof source !== 'number' && source.kind === 'reader-illustration';
        const imageHeight = Math.max(fullScene ? height : height * frame.zoom, paneWidth / frame.aspect);
        const imageWidth = imageHeight * frame.aspect;
        const centeredLeft = paneWidth / 2 - imageWidth * frame.x;
        const centeredTop = height / 2 - imageHeight * frame.y;
        // Keep off-centre subjects visible without exposing unpainted edges.
        const left = fullScene ? Math.max(paneWidth - imageWidth, Math.min(0, centeredLeft)) : centeredLeft;
        const top = fullScene ? Math.max(height - imageHeight, Math.min(0, centeredTop)) : centeredTop;
        return (
          <CachedArtwork
          key={index}
          source={source}
          resizeMode={fullScene ? 'cover' : 'contain'}
          style={{ width: paneWidth, height, overflow: 'hidden' }}
          imageStyle={{ width: imageWidth, height: imageHeight, left, top }}
          fallback={<View style={styles.fallback}>{fallback}</View>}
        />
        );
      }) : fallback}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
