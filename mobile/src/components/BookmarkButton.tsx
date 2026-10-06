import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import AppIcon from './AppIcon';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeContext';
import { useReducedMotion } from '@/utils/useReducedMotion';

type Props = {
  isBookmarked: boolean;
  onToggle: () => void;
};

export default function BookmarkButton({ isBookmarked, onToggle }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    // Pulse only on save (design.md §25); removal stays quiet. Collapses to the
    // final frame under reduce-motion.
    if (!isBookmarked && !reduceMotion) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
    onToggle();
  };

  return (
    <Pressable
      onPress={handleToggle}
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
      <Animated.View style={{ transform: [{ scale }] }}>
        <AppIcon name="heart" size={21} color={isBookmarked ? colors.iconAccent : colors.iconInk} weight={isBookmarked ? 'fill' : 'regular'} />
      </Animated.View>
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
});
