import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  isBookmarked: boolean;
  onToggle: () => void;
};

export default function BookmarkButton({ isBookmarked, onToggle }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={12}
      style={[
        styles.circle,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      accessibilityState={{ selected: isBookmarked }}
    >
      <Text
        style={[
          styles.icon,
          { color: isBookmarked ? colors.saffron : colors.inkMuted },
        ]}
      >
        {isBookmarked ? '♥' : '♡'}
      </Text>
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
