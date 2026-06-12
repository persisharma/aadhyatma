import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  /** Centered caption that gently fades in and out, e.g. "साधना पूर्ण · आज". */
  caption: string;
  /** Called once the shower has settled, so the parent can unmount the overlay. */
  onDone?: () => void;
};

/**
 * Pushpa-varsha — an app-wide one-shot flower shower that plays the moment a
 * daily routine is completed, on whatever screen the user is on. Marigold/lotus
 * petals drift down the full width of the screen from above (devas showering
 * flowers) while a soft caption fades in and out at center. Reverent, not
 * confetti (design.md §11): no scale pops, just a gentle fall. Pointer-events
 * pass through so the screen beneath stays fully interactive.
 */
const PETALS = [
  { left: 4, size: 10, drift: -14, rot: 40, fall: 0.78 },
  { left: 12, size: 12, drift: 10, rot: -32, fall: 0.62 },
  { left: 21, size: 9, drift: -8, rot: 60, fall: 0.86 },
  { left: 30, size: 13, drift: 12, rot: -52, fall: 0.7 },
  { left: 38, size: 10, drift: -10, rot: 26, fall: 0.9 },
  { left: 47, size: 11, drift: 8, rot: -40, fall: 0.66 },
  { left: 55, size: 9, drift: -12, rot: 50, fall: 0.82 },
  { left: 63, size: 12, drift: 6, rot: -22, fall: 0.74 },
  { left: 71, size: 10, drift: -8, rot: 44, fall: 0.88 },
  { left: 79, size: 13, drift: 12, rot: -48, fall: 0.6 },
  { left: 86, size: 9, drift: -10, rot: 34, fall: 0.8 },
  { left: 92, size: 11, drift: 6, rot: -28, fall: 0.72 },
  { left: 16, size: 8, drift: -6, rot: 56, fall: 0.68 },
  { left: 67, size: 8, drift: 8, rot: -36, fall: 0.84 },
];

export default function RoutineCelebration({ caption, onDone }: Props) {
  const { colors, typography } = useTheme();
  const { height } = useWindowDimensions();
  const vals = useRef(PETALS.map(() => new Animated.Value(0))).current;
  const cap = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const petals = Animated.stagger(
      60,
      vals.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 1600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    const captionFade = Animated.timing(cap, {
      toValue: 1,
      duration: 2200,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    const seq = Animated.parallel([petals, captionFade]);
    seq.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => seq.stop();
    // Run once on mount; vals/cap/onDone are stable for this overlay's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fall the full screen height (plus a margin) so petals clear the bottom edge.
  const reach = (height || 800) + 40;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {PETALS.map((p, i) => {
        const v = vals[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: -24,
              left: `${p.left}%`,
              opacity: v.interpolate({ inputRange: [0, 0.1, 0.78, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, reach * p.fall] }) },
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

      <Animated.View
        style={[
          styles.captionWrap,
          {
            opacity: cap.interpolate({ inputRange: [0, 0.18, 0.7, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              {
                translateY: cap.interpolate({
                  inputRange: [0, 0.18],
                  outputRange: [10, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.captionPill, { backgroundColor: colors.parchmentSoft, borderColor: colors.goldTint, shadowColor: colors.ink }]}>
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 18, color: colors.saffronDeep }}>
            {caption}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50, elevation: 50 },
  captionWrap: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
  captionPill: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
