import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
  /**
   * Distance from the bottom edge. Defaults to `spacing.xl`. On Home the docked
   * RoutineBanner occupies the bottom; the caller passes a larger offset so the
   * FAB clears it (it used to be hidden behind the banner — search-smoke #57).
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
    // Sit above the docked RoutineBanner (a sibling rendered after this on
    // Home) so taps reach the FAB rather than the banner beneath it.
    zIndex: 5,
    elevation: 8,
  },
  glyph: {
    fontSize: 26,
    lineHeight: 28,
    includeFontPadding: false,
  },
});
