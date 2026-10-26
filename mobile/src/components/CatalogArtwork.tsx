import React, { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import ObservanceArtwork from './ObservanceArtwork';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';

/** Larger catalog panels reuse all of the merged subject/composite decisions. */
export default function CatalogArtwork({ rule, aspectRatio = 1.5, style }: {
  rule: Pick<ObservanceRule, 'id' | 'category' | 'deityEn'>;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, radii } = useTheme();
  const [bounds, setBounds] = useState({ width: 150, height: 150 / aspectRatio });
  return (
    <View
      testID={`catalog-art-${rule.id}`}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={({ nativeEvent: { layout } }) => {
        if (layout.width > 0 && layout.height > 0 && (layout.width !== bounds.width || layout.height !== bounds.height)) {
          setBounds({ width: layout.width, height: layout.height });
        }
      }}
      style={[styles.frame, { aspectRatio, borderRadius: radii.md, backgroundColor: colors.cardThumbRest }, style]}
    >
      <View style={StyleSheet.absoluteFill}>
        <ObservanceArtwork rule={rule} width={bounds.width} height={bounds.height} layout="scene" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ frame: { width: '100%', overflow: 'hidden' } });
