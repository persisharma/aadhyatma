import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
};

export default function SearchFloatingButton({ onPress }: Props) {
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
          bottom: spacing.xl,
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
  },
  glyph: {
    fontSize: 26,
    lineHeight: 28,
    includeFontPadding: false,
  },
});
