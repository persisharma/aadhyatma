import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { JAPAM_BEADS_PER_ROUND as N } from '@/data/japam';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useFontScale } from '@/contexts/FontScaleContext';
import { INFINITY_PATH, INFINITY_SAMPLES, infinityPoint } from './japamInfinityGeometry';
import { startInfinityMotion } from './japamInfinityPlayback';

// Light-material highlights, like the mala's fixed wood/brass material colours.
const JYOTI = { core: '#FFF9DF', gold: '#FFE4A0', amber: '#DFA13D' } as const;

type Props = {
  count: number;
  size: number;
  hint: string;
  notice?: string | null;
  labelFontFamily: string;
  running: boolean;
  onCycle: () => void;
};

/** Tap-controlled loops. The parent arbitrates silent-cycle versus audio counts. */
export default function JapamInfinity({ count, size, hint, notice, labelFontFamily, running, onCycle }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { factor } = useFontScale();
  const { fontScale } = useWindowDimensions();
  const numbersBelow = factor * fontScale > 1.25;
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const progress = useRef(new Animated.Value(0)).current;
  const cycleCallback = useRef(onCycle);
  cycleCallback.current = onCycle;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!running || !active) return;
    return startInfinityMotion({
      readPhase: (callback) => progress.stopAnimation(callback),
      setPhase: (value) => progress.setValue(value),
      stopPhase: () => progress.stopAnimation(),
      onCycle: () => cycleCallback.current(),
      animate: (duration, complete) => {
        const animation = Animated.timing(progress, {
          toValue: 1, duration, easing: Easing.linear, useNativeDriver: true,
        });
        animation.start(({ finished }) => complete(finished));
        return animation;
      },
    });
  }, [running, active, progress]);
  // One closed figure-eight, repeated until the next tap pauses it.
  const coordinates = useMemo(() => {
    const inputRange = Array.from({ length: INFINITY_SAMPLES + 1 }, (_, i) => i / INFINITY_SAMPLES);
    return {
      inputRange,
      x: inputRange.map((t) => infinityPoint(t).x * size - 16),
      y: inputRange.map((t) => infinityPoint(t).y * size - 16),
      tails: [0.012, 0.024, 0.036].map((offset) => ({
        x: inputRange.map((t) => infinityPoint(t - offset).x * size - 4),
        y: inputRange.map((t) => infinityPoint(t - offset).y * size - 4),
      })),
    };
  }, [size]);
  return (
    <View testID="japam-infinity" style={[styles.root, { width: size, minHeight: size }]} pointerEvents="none"
      importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View style={{ width: size, height: size * 0.65 }}>
        <Svg width={size} height={size * 0.65} viewBox="0 0 1000 650">
          <Defs>
            <RadialGradient id="infinity-ambient" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.parchmentSoft} stopOpacity={0.95} />
              <Stop offset="0.6" stopColor={colors.gold} stopOpacity={0.08} />
              <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={500} cy={325} rx={500} ry={325} fill="url(#infinity-ambient)" />
          <Path d={INFINITY_PATH} stroke={colors.gold} strokeWidth={22} opacity={0.06} fill="none" />
          <Path d={INFINITY_PATH} stroke={colors.gold} strokeWidth={6} fill="none" />
        </Svg>
        {running && !reduced ? coordinates.tails.map((tail, i) => (
          <Animated.View key={i} style={[styles.tail, { backgroundColor: colors.saffron,
            opacity: 0.2 - i * 0.05, transform: [
              { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: tail.x }) },
              { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: tail.y }) },
            ],
          }]} />
        )) : null}
        <Animated.View testID="japam-infinity-marker" style={[styles.light, {
          transform: reduced ? [{ translateX: size / 2 - 16 }, { translateY: size * 0.325 - 16 }] : [
            { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.x }) },
            { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.y }) },
          ],
        }]}>
          <Svg width={32} height={32}>
            <Defs>
              <RadialGradient id="infinity-jyoti" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={JYOTI.core} stopOpacity={1} />
                <Stop offset="0.23" stopColor={JYOTI.gold} stopOpacity={0.95} />
                <Stop offset="0.48" stopColor={JYOTI.amber} stopOpacity={0.38} />
                <Stop offset="1" stopColor={colors.saffron} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={16} cy={16} r={16} fill="url(#infinity-jyoti)" />
            <Circle cx={16} cy={16} r={3.3} fill={JYOTI.core} />
          </Svg>
        </Animated.View>
        {!numbersBelow && <View style={[styles.numbers, { top: size * 0.325 - 26 * factor }]}>
          <Text style={[styles.number, { fontSize: 38 * factor, lineHeight: 52 * factor, color: colors.ink, fontFamily: fontFamilies.latinSemiBold }]}>{count}</Text>
          <Text style={[styles.number, { fontSize: 38 * factor, lineHeight: 52 * factor, color: colors.saffronDeep, fontFamily: fontFamilies.latinSemiBold }]}>{N}</Text>
        </View>}
      </View>
      {numbersBelow && <Text style={{ fontSize: 32 * factor, color: colors.ink, fontFamily: fontFamilies.latinSemiBold, textAlign: 'center' }}>
        {count} / {N}
      </Text>}
      <View style={[styles.track, { backgroundColor: colors.divider }]}>
        <View style={{ width: `${(count / N) * 100}%`, height: 3, backgroundColor: colors.saffron }} />
      </View>
      <Text style={[styles.hint, { fontSize: 12 * factor, color: notice ? colors.saffronDeep : colors.inkMuted, fontFamily: labelFontFamily }]}>
        {notice ?? hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  light: { position: 'absolute', top: 0, left: 0, width: 32, height: 32 },
  tail: { position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderRadius: 4 },
  numbers: { position: 'absolute', left: '3%', right: '3%', flexDirection: 'row', alignItems: 'center' },
  number: { flex: 1, textAlign: 'center', fontSize: 38, lineHeight: 52 },
  track: { width: '80%', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 12 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
});
