import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
};

/**
 * Top-right circular pill on the Home screen that opens the global search.
 * Mirrors the HelpFloatingButton pattern (RULEBOOK §3 — no system blue).
 */
export default function SearchFloatingButton({ onPress }: Props) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

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
          top: spacing.xl + insets.top,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 22,
    lineHeight: 24,
    includeFontPadding: false,
    marginTop: -1,
  },
});
