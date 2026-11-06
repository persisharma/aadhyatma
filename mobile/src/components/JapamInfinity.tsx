import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { radii } from '@/theme/spacing';
import { JAPAM_BEADS_PER_ROUND as N } from '@/data/japam';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useFontScale } from '@/contexts/FontScaleContext';
import { INFINITY_PATH, INFINITY_SAMPLES, infinityPoint } from './japamInfinityGeometry';
import { startInfinityMotion } from './japamInfinityPlayback';
import JapamMantraRing, { RING_INNER_PERIOD_MS, RING_OUTER_PERIOD_MS } from './JapamMantraRing';

// Light-material highlights, like the mala's fixed wood/brass material colours.
const JYOTI = { core: '#FFF9DF', gold: '#FFE4A0', amber: '#DFA13D' } as const;
/** The jyoti's glow box; the bright core sits at its centre. */
const MARKER = 40;
const HALF = MARKER / 2;

type Props = {
  count: number;
  size: number;
  hint: string;
  notice?: string | null;
  labelFontFamily: string;
  running: boolean;
  onCycle: () => void;
  /** The mantra as displayed (current script); its words circle the panel's sides. */
  ringText?: string;
  /** False while the screen is blurred, so the side rings rest. */
  ringsActive?: boolean;
};

/** The ∞ spans 0.06–0.94 of its box (`infinityPoint`). */
const LOOP_SPAN = 0.88;
/** Side room kept beyond each ring when narrowing the ∞. */
const RING_CLEARANCE = 8;
/** Ring centre-line to the ∞'s outer curve: half the outer text's height plus air. */
const RING_INSET = 15;
const RING_SPACING = 20;

/** Tap-controlled loops. The parent arbitrates silent-cycle versus audio counts. */
export default function JapamInfinity({ count, size, hint, notice, labelFontFamily, running, onCycle, ringText, ringsActive = true }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { factor } = useFontScale();
  const { fontScale, width: windowWidth } = useWindowDimensions();
  const numbersBelow = factor * fontScale > 1.25;
  // The night panel is wider than the ∞ (8 pt page margins, capped on tablets).
  // With mantra rings, the ∞ narrows so its outer curves clear the rings
  // centred on the panel's side edges; the panel keeps the `size` height.
  const height = size * 0.65;
  const panelWidth = Math.max(size, Math.min(windowWidth - 16, size + 160));
  const ringRoom = ringText ? Math.round(Math.max(40, Math.min(80, panelWidth * 0.2))) : 0;
  const loop = ringText ? Math.min(size, Math.floor((panelWidth - 2 * (ringRoom + RING_CLEARANCE)) / LOOP_SPAN)) : size;
  const stageLeft = (panelWidth - loop) / 2;
  const stageTop = (height - loop * 0.65) / 2;
  const outerRadius = Math.floor(Math.min(height / 2 - 12, (panelWidth - LOOP_SPAN * loop) / 2 - RING_INSET));
  const innerRadius = outerRadius - RING_SPACING;
  const showRings = Boolean(ringText) && outerRadius >= 28;
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
      x: inputRange.map((t) => infinityPoint(t).x * loop - HALF),
      y: inputRange.map((t) => infinityPoint(t).y * loop - HALF),
      tails: [0.012, 0.024, 0.036].map((offset) => ({
        x: inputRange.map((t) => infinityPoint(t - offset).x * loop - 4),
        y: inputRange.map((t) => infinityPoint(t - offset).y * loop - 4),
      })),
    };
  }, [loop]);
  return (
    <View testID="japam-infinity" style={[styles.root, { width: size, minHeight: size }]} pointerEvents="none"
      importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {/* A lamp-lit night panel (the Panchang sky's deep-sepia stops), so the
          path, the moving jyoti and the parchment page never blend together. */}
      <View testID="japam-infinity-panel" style={[styles.panel, { width: panelWidth, height,
        backgroundColor: colors.skyNightTop, borderColor: colors.nightGlassBorder }]}>
        <Svg width={panelWidth} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="infinity-night" cx="50%" cy="50%" r="60%">
              <Stop offset="0" stopColor={colors.skyNightLower} stopOpacity={1} />
              <Stop offset="0.55" stopColor={colors.skyNightUpper} stopOpacity={1} />
              <Stop offset="1" stopColor={colors.skyNightTop} stopOpacity={1} />
            </RadialGradient>
            <RadialGradient id="infinity-side-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.sunCore} stopOpacity={0.42} />
              <Stop offset="0.55" stopColor={colors.sunCore} stopOpacity={0.12} />
              <Stop offset="1" stopColor={colors.sunCore} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={panelWidth} height={height} fill="url(#infinity-night)" />
          {showRings ? [0, panelWidth].map((x) => (
            <Circle key={x} cx={x} cy={height / 2} r={Math.max(24, innerRadius)} fill="url(#infinity-side-glow)" />
          )) : null}
        </Svg>
        {showRings && ringText ? ([[0, 1], [panelWidth, -1]] as const).map(([cx, turn]) => (
          <JapamMantraRing key={`${cx}|${ringText}|${labelFontFamily}`} testID="japam-mantra-rings"
            text={ringText} fontFamily={labelFontFamily} cx={cx} cy={height / 2}
            animate={ringsActive && active && !reduced}
            rings={[
              { radius: outerRadius, fontSize: 13, color: colors.nightGold, opacity: 0.92, direction: turn, periodMs: RING_OUTER_PERIOD_MS },
              ...(innerRadius >= 24 ? [{ radius: innerRadius, fontSize: 11, color: colors.sunCore, opacity: 0.88,
                direction: (turn === 1 ? -1 : 1) as 1 | -1, periodMs: RING_INNER_PERIOD_MS }] : []),
            ]} />
        )) : null}
        <View style={[styles.stage, { left: stageLeft, top: stageTop, width: loop, height: loop * 0.65 }]}>
          <Svg width={loop} height={loop * 0.65} viewBox="0 0 1000 650" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="infinity-ambient" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.sunCore} stopOpacity={0.16} />
                <Stop offset="1" stopColor={colors.sunCore} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={500} cy={325} rx={500} ry={325} fill="url(#infinity-ambient)" />
            <Path d={INFINITY_PATH} stroke={colors.sunCore} strokeWidth={34} opacity={0.08} fill="none" />
            <Path d={INFINITY_PATH} stroke={colors.saffron} strokeWidth={9} fill="none" strokeLinecap="round" />
          </Svg>
          {running && !reduced ? coordinates.tails.map((tail, i) => (
            <Animated.View key={i} style={[styles.tail, { backgroundColor: colors.sunCore,
              opacity: 0.5 - i * 0.15, transform: [
                { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: tail.x }) },
                { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: tail.y }) },
              ],
            }]} />
          )) : null}
          <Animated.View testID="japam-infinity-marker" style={[styles.light, {
            transform: reduced ? [{ translateX: loop / 2 - HALF }, { translateY: loop * 0.325 - HALF }] : [
              { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.x }) },
              { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.y }) },
            ],
          }]}>
            <Svg width={MARKER} height={MARKER}>
              <Defs>
                <RadialGradient id="infinity-jyoti" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={JYOTI.core} stopOpacity={1} />
                  <Stop offset="0.2" stopColor={JYOTI.gold} stopOpacity={1} />
                  <Stop offset="0.42" stopColor={colors.sunCore} stopOpacity={0.75} />
                  <Stop offset="0.7" stopColor={JYOTI.amber} stopOpacity={0.22} />
                  <Stop offset="1" stopColor={colors.sunCore} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={HALF} cy={HALF} r={HALF} fill="url(#infinity-jyoti)" />
              <Circle cx={HALF} cy={HALF} r={4.5} fill={JYOTI.core} />
            </Svg>
          </Animated.View>
          {!numbersBelow && <View style={[styles.numbers, { top: loop * 0.325 - 26 * factor }]}>
            <Text style={[styles.number, { fontSize: 38 * factor, lineHeight: 52 * factor, color: colors.nightInk, fontFamily: fontFamilies.latinSemiBold }]}>{count}</Text>
            <Text style={[styles.number, { fontSize: 38 * factor, lineHeight: 52 * factor, color: colors.nightGold, fontFamily: fontFamilies.latinSemiBold }]}>{N}</Text>
          </View>}
        </View>
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
  panel: { borderRadius: radii.xl, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  stage: { position: 'absolute', top: 0 },
  light: { position: 'absolute', top: 0, left: 0, width: MARKER, height: MARKER },
  tail: { position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderRadius: 4 },
  numbers: { position: 'absolute', left: '3%', right: '3%', flexDirection: 'row', alignItems: 'center' },
  number: { flex: 1, textAlign: 'center', fontSize: 38, lineHeight: 52 },
  track: { width: '80%', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 12 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
});
