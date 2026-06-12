import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  /** Called once all petals have settled, so the parent can unmount the overlay. */
  onDone?: () => void;
  left: number;
  right: number;
  bottom: number;
};

/**
 * Pushpa-varsha — a gentle one-shot flower shower over the completed routine
 * chip. Marigold/lotus petals drift down and fade. Reverent, not confetti
 * (design.md §11): no scale pops, just a soft fall. Pointer-events pass through
 * so the chip beneath stays tappable.
 */
const PETALS = [
  { left: 6, size: 9, drift: -10, rot: 40, fall: 70 },
  { left: 20, size: 11, drift: 8, rot: -30, fall: 86 },
  { left: 34, size: 8, drift: -6, rot: 60, fall: 64 },
  { left: 48, size: 12, drift: 10, rot: -52, fall: 94 },
  { left: 60, size: 9, drift: -8, rot: 25, fall: 74 },
  { left: 72, size: 10, drift: 6, rot: -40, fall: 80 },
  { left: 84, size: 8, drift: -10, rot: 50, fall: 66 },
  { left: 92, size: 11, drift: 4, rot: -20, fall: 90 },
];

export default function RoutineCelebration({ onDone, left, right, bottom }: Props) {
  const { colors } = useTheme();
  const vals = useRef(PETALS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const seq = Animated.stagger(
      70,
      vals.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 1100,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    seq.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => seq.stop();
    // Run once on mount; vals/onDone are stable for this overlay's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View pointerEvents="none" style={[styles.overlay, { left, right, bottom }]}>
      {PETALS.map((p, i) => {
        const v = vals[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: `${p.left}%`,
              opacity: v.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.fall] }) },
                { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] }) },
              ],
            }}
          >
            <LinearGradient
              colors={[colors.cardThumbActiveFrom, colors.saffron]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: p.size,
                height: Math.round(p.size * 1.6),
                borderRadius: p.size,
                borderWidth: 0.5,
                borderColor: colors.saffronDeep,
              }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', height: 120, zIndex: 6, elevation: 7 },
});
