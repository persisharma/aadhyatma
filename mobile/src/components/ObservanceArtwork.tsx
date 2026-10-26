import React from 'react';
import { StyleSheet, View } from 'react-native';
import StoryIcon from './StoryIcon';
import { observanceIcon } from '@/panchang/observancePresentation';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';

/** Bundled paintings render immediately, including offline. */
export default function ObservanceArtwork({ rule, size = 64 }: {
  rule: Pick<ObservanceRule, 'deityEn' | 'category'>;
  size?: number;
}) {
  const { colors, radii } = useTheme();
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width: size, height: size, borderRadius: radii.md, backgroundColor: colors.cardThumbRest }]}
    >
      <StoryIcon name={observanceIcon(rule)} size={size - 8} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
