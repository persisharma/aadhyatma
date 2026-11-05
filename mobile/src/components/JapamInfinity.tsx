import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { JAPAM_BEADS_PER_ROUND as N } from '@/data/japam';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useFontScale } from '@/contexts/FontScaleContext';
import { INFINITY_PATH, INFINITY_SAMPLES, infinityPoint } from './japamInfinityGeometry';

type Props = {
  count: number;
  rounds: number;
  size: number;
  hint: string;
  notice?: string | null;
  labelFontFamily: string;
  hydrated: boolean;
};

/** Display-only: movement follows real beads, never generates chant counts. */
export default function JapamInfinity({ count, rounds, size, hint, notice, labelFontFamily, hydrated }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { factor } = useFontScale();
  const { fontScale } = useWindowDimensions();
  const numbersBelow = factor * fontScale > 1.25;
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const total = rounds * N + count;
  const progress = useRef(new Animated.Value(0)).current;
  const pending = useRef(0);
  const running = useRef<ReturnType<typeof Animated.timing> | null>(null);
  const generation = useRef(0);
  const previous = useRef(total);
  const wasHydrated = useRef(hydrated);
  const cancelSwings = useCallback(() => {
    generation.current++;
    pending.current = 0;
    const animation = running.current;
    running.current = null;
    animation?.stop();
    progress.setValue(0);
  }, [progress]);
  const playNext = useCallback(function nextSwing() {
    if (running.current || pending.current === 0) return;
    pending.current--;
    progress.setValue(0);
    const epoch = generation.current;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    running.current = animation;
    animation.start(({ finished }) => {
      if (epoch !== generation.current || running.current !== animation) return;
      running.current = null;
      progress.setValue(0); // 0 and 1 are the same centre crossing.
      if (finished) nextSwing();
      else pending.current = 0;
    });
  }, [progress]);
  useEffect(() => cancelSwings, [cancelSwings]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const delta = total - previous.current;
    const restored = !wasHydrated.current || !hydrated;
    wasHydrated.current = hydrated;
    previous.current = total;
    if (restored || reduced || !active || delta <= 0 || delta > N) {
      cancelSwings();
      return;
    }
    // Every accepted chant gets a complete swing. Rapid taps queue rather than
    // restarting the current swing; only the counter provider records chants.
    pending.current += delta;
    playNext();
  }, [total, hydrated, reduced, active, cancelSwings, playNext]);
  // A complete figure-eight per chant, independent of the 108-bead progress bar.
  const coordinates = useMemo(() => {
    const inputRange = Array.from({ length: INFINITY_SAMPLES + 1 }, (_, i) => i / INFINITY_SAMPLES);
    return {
      inputRange,
      x: inputRange.map((t) => infinityPoint(t).x * size - 5),
      y: inputRange.map((t) => infinityPoint(t).y * size - 5),
    };
  }, [size]);
  return (
    <View testID="japam-infinity" style={[styles.root, { width: size, minHeight: size }]} pointerEvents="none"
      importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View style={{ width: size, height: size * 0.65 }}>
        <Svg width={size} height={size * 0.65} viewBox="0 0 1000 650">
          <Path d={INFINITY_PATH} stroke={colors.gold} strokeWidth={22} opacity={0.1} fill="none" />
          <Path d={INFINITY_PATH} stroke={colors.gold} strokeWidth={6} fill="none" />
        </Svg>
        <Animated.View style={[styles.light, {
          backgroundColor: colors.saffron,
          shadowColor: colors.saffron,
          transform: [
            { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.x }) },
            { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.y }) },
          ],
        }]} />
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
  light: { position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderRadius: 5,
    shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 3 },
  numbers: { position: 'absolute', left: '3%', right: '3%', flexDirection: 'row', alignItems: 'center' },
  number: { flex: 1, textAlign: 'center', fontSize: 38, lineHeight: 52 },
  track: { width: '80%', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 12 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
});
