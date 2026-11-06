import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FestivalPaintedCell } from './FestivalMotif';
import { useTheme } from '@/theme/ThemeContext';

/** Decorative artwork has no layout/text responsibility. The two border lines
 * and the painted marigold/mango corners match the approved compact strip. */
export default function FestiveCorners({ size = 72, onLoad }: {
  size?: number; onLoad?: (slot: 'left' | 'right') => void;
}) {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" accessible={false}
      style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 14 }]}>
      <View style={{ position: 'absolute', left: 2, top: 2, right: 2, bottom: 2,
        borderWidth: .65, borderColor: colors.gold, borderRadius: 12 }} />
      <View style={{ position: 'absolute', left: 0, top: 0 }}>
        <FestivalPaintedCell cell={10} size={size} testID="festival-art-left"
          onLoad={() => onLoad?.('left')} />
      </View>
      <View style={{ position: 'absolute', right: 0, top: 0 }}>
        <FestivalPaintedCell cell={11} size={size} testID="festival-art-right"
          onLoad={() => onLoad?.('right')} />
      </View>
    </View>
  );
}
