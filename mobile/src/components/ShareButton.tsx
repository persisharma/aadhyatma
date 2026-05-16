import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  onPress: () => void;
  onLongPress?: () => void;
  busy?: boolean;
};

export default function ShareButton({ onPress, onLongPress, busy }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      disabled={busy}
      hitSlop={12}
      style={[
        styles.circle,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          opacity: busy ? 0.5 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Share verse"
      accessibilityHint="Long-press to share a screenshot of this reader instead"
    >
      <Text style={[styles.icon, { color: colors.saffron }]}>↗</Text>
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
    fontSize: 18,
    fontWeight: '600',
    marginTop: -1,
    includeFontPadding: false,
  },
});
