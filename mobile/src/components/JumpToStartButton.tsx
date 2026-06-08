import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
};

/**
 * Compact header control that returns the reader to the first verse of the
 * current chapter. Shown only when the reader is past verse 1 (e.g. after a
 * subsection auto-jump) so the user always has a one-tap path back to the
 * start without swiping back through every page.
 */
export default function JumpToStartButton({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={[
        styles.circle,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Jump to beginning"
    >
      <Text style={[styles.icon, { color: colors.inkMuted }]}>⇤</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    includeFontPadding: false,
  },
});
