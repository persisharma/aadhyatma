import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { androidBoxShadow } from '@/theme/elevation';
import { titleScriptFont } from '@/utils/scriptFont';

type Props = {
  /** Centered caption that gently fades in and out, e.g. "साधना पूर्ण · आज". */
  caption: string;
  /** Called once the shower has settled, so the parent can unmount the overlay. */
  onDone?: () => void;
};

/**
 * Pushpa-varsha — an app-wide one-shot flower shower that plays the moment a
 * daily routine is completed, on whatever screen the user is on. Marigold/lotus
 * blossoms drift down the full width of the screen from above (devas showering
 * flowers) while a soft caption fades in and out at center. Reverent, not
 * confetti (design.md §11): no scale pops, just a gentle fall. Pointer-events
 * pass through so the screen beneath stays fully interactive.
 */
const FLOWERS = [
  { left: 4, size: 16, drift: -14, rot: 40, fall: 0.78, turn: 6 },
  { left: 12, size: 18, drift: 10, rot: -32, fall: 0.62, turn: -10 },
  { left: 21, size: 15, drift: -8, rot: 60, fall: 0.86, turn: 16 },
  { left: 30, size: 19, drift: 12, rot: -52, fall: 0.7, turn: -4 },
  { left: 38, size: 16, drift: -10, rot: 26, fall: 0.9, turn: 13 },
  { left: 47, size: 17, drift: 8, rot: -40, fall: 0.66, turn: -14 },
  { left: 55, size: 15, drift: -12, rot: 50, fall: 0.82, turn: 8 },
  { left: 63, size: 18, drift: 6, rot: -22, fall: 0.74, turn: -8 },
  { left: 71, size: 16, drift: -8, rot: 44, fall: 0.88, turn: 15 },
  { left: 79, size: 19, drift: 12, rot: -48, fall: 0.6, turn: -12 },
  { left: 86, size: 15, drift: -10, rot: 34, fall: 0.8, turn: 3 },
  { left: 92, size: 17, drift: 6, rot: -28, fall: 0.72, turn: -16 },
  { left: 16, size: 14, drift: -6, rot: 56, fall: 0.68, turn: 11 },
  { left: 67, size: 14, drift: 8, rot: -36, fall: 0.84, turn: -6 },
];

const OUTER_PETALS = [0, 45, 90, 135, 180, 225, 270, 315];
const INNER_PETALS = [22, 94, 166, 238, 310];
const FLOWER_STAGGER_MS = 120;
const FLOWER_FALL_MS = 5200;
const CAPTION_FADE_MS = 6600;

export default function RoutineCelebration({ caption, onDone }: Props) {
  const { colors, typography } = useTheme();
  const { height } = useWindowDimensions();
  const vals = useRef(FLOWERS.map(() => new Animated.Value(0))).current;
  const cap = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flowers = Animated.stagger(
      FLOWER_STAGGER_MS,
      vals.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: FLOWER_FALL_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    const captionFade = Animated.timing(cap, {
      toValue: 1,
      duration: CAPTION_FADE_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    const seq = Animated.parallel([flowers, captionFade]);
    seq.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => seq.stop();
    // Run once on mount; vals/cap/onDone are stable for this overlay's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fall the full screen height (plus a margin) so flowers clear the bottom edge.
  const reach = (height || 800) + 40;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {FLOWERS.map((p, i) => {
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
            <FallingFlower size={p.size} turn={p.turn} />
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
        <View style={[styles.captionPill, { backgroundColor: colors.parchmentSoft, borderColor: colors.goldTint, shadowColor: colors.ink, ...androidBoxShadow(4, 12, 'rgba(26, 14, 3, 0.16)') }]}>
          <Text style={{ fontFamily: titleScriptFont(caption, typography.cardHindi.fontFamily), fontSize: 18, color: colors.saffronDeep }}>
            {caption}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function FallingFlower({ size, turn }: { size: number; turn: number }) {
  const { colors } = useTheme();
  const outerW = Math.max(5, Math.round(size * 0.38));
  const outerH = Math.round(size * 0.58);
  const innerW = Math.max(4, Math.round(size * 0.3));
  const innerH = Math.round(size * 0.43);
  const center = Math.max(5, Math.round(size * 0.34));

  return (
    <View
      style={{
        width: size,
        height: size,
        transform: [{ rotate: `${turn}deg` }],
      }}
      accessible={false}
    >
      {OUTER_PETALS.map((deg) => (
        <LinearGradient
          key={`outer-${deg}`}
          colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo, colors.saffron]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            left: (size - outerW) / 2,
            top: Math.round(size * 0.02),
            width: outerW,
            height: outerH,
            borderRadius: outerW,
            borderWidth: 0.35,
            borderColor: colors.saffronDeep,
            transform: [{ rotate: `${deg}deg` }],
            transformOrigin: '50% 82%',
          }}
        />
      ))}
      {INNER_PETALS.map((deg) => (
        <LinearGradient
          key={`inner-${deg}`}
          colors={[colors.cardThumbActiveFrom, colors.saffron]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            left: (size - innerW) / 2,
            top: Math.round(size * 0.18),
            width: innerW,
            height: innerH,
            borderRadius: innerW,
            borderWidth: 0.35,
            borderColor: colors.saffronDeep,
            transform: [{ rotate: `${deg}deg` }],
            transformOrigin: '50% 72%',
          }}
        />
      ))}
      <LinearGradient
        colors={[colors.gold, colors.saffronDeep]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          position: 'absolute',
          left: (size - center) / 2,
          top: (size - center) / 2,
          width: center,
          height: center,
          borderRadius: center,
          borderWidth: 0.4,
          borderColor: colors.saffronDeep,
        }}
      />
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
  },
});
