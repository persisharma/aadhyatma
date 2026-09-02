import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
  /**
   * Distance from the bottom edge. Defaults to `spacing.xl`. Home used to pass a
   * larger offset so the FAB cleared the docked RoutineBanner (it was otherwise
   * hidden behind it — search-smoke #57); since the routine banner moved inline
   * on Home, the FAB uses the default offset and no caller overrides it today.
   */
  bottomOffset?: number;
};

export default function SearchFloatingButton({ onPress, bottomOffset }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Search verses, sections, and mantras"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          right: spacing.xl,
          bottom: bottomOffset ?? spacing.xl,
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text
        style={[
          styles.glyph,
          {
            color: colors.saffron,
            fontFamily: typography.readerTitle.fontFamily,
          },
        ]}
      >
        ⌕
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Keep a positive z so the FAB stays above the scroll content it floats over.
    zIndex: 5,
    elevation: 8,
  },
  glyph: {
    fontSize: 26,
    lineHeight: 28,
    includeFontPadding: false,
  },
});
