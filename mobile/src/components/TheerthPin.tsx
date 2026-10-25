import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeContext';
import DeityIcon from './DeityIcon';
import type { DeityIconKey } from '@/data/deities';

const PIN_GLYPH_SIZE = 22;
const HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 };

type Props = {
  x: number;
  y: number;
  label: string;
  deityKey: DeityIconKey;
  onPress: () => void;
};

export default function TheerthPin({ x, y, label, deityKey, onPress }: Props) {
  const { colors, typography } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <View
      style={[
        styles.anchor,
        {
          left: x - PIN_GLYPH_SIZE / 2,
          top: y - PIN_GLYPH_SIZE / 2,
        },
      ]}
      pointerEvents="box-none"
    >
      {showTooltip ? (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.divider,
            },
          ]}
        >
          <Text
            style={[
              styles.tooltipText,
              {
                color: colors.ink,
                fontFamily: typography.cardHindi.fontFamily,
                fontSize: 13,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={HIT_SLOP}
        onPress={handlePress}
        onLongPress={() => setShowTooltip(true)}
        onPressOut={() => setShowTooltip(false)}
        delayLongPress={250}
      >
        {/* Presiding-deity glyph replaces the old ॥ marker, matching the
            pilgrimage cards' per-temple deity icons (design.md §29). */}
        <DeityIcon iconKey={deityKey} size={PIN_GLYPH_SIZE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: PIN_GLYPH_SIZE,
    height: PIN_GLYPH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    bottom: PIN_GLYPH_SIZE + 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    maxWidth: 160,
    alignItems: 'center',
  },
  tooltipText: {
    includeFontPadding: false,
    textAlign: 'center',
  },
});
