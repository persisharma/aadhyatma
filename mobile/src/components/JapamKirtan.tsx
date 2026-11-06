import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { radii } from '@/theme/spacing';
import { JAPAM_BEADS_PER_ROUND as N } from '@/data/japam';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useFontScale } from '@/contexts/FontScaleContext';
import { startInfinityMotion } from './japamInfinityPlayback';
import { KIRTAN_BEAT_MS, type KirtanFigure } from './japamKirtanFigure';
import JapamMantraRing, { RING_INNER_PERIOD_MS, RING_OUTER_PERIOD_MS } from './JapamMantraRing';

type Props = {
  figure: KirtanFigure;
  count: number;
  size: number;
  hint: string;
  notice?: string | null;
  labelFontFamily: string;
  running: boolean;
  onCycle: () => void;
  ringText?: string;
  ringsActive?: boolean;
};

/** The rig is authored on a 200 × 260 canvas; every part box is the full canvas. */
const CW = 200;
const CH = 260;
const PIVOT = {
  hips: [100, 150], neck: [100, 64], shoulderL: [72, 80], shoulderR: [128, 80],
  elbowL: [58, 112], elbowR: [142, 112], hipL: [88, 150], hipR: [112, 150], tail: [114, 154],
} as const;

/**
 * PLACEHOLDER palettes — flat material colours for the stand-in shapes only.
 * Painted layered art replaces every part (design.md §35.2) before release.
 */
const FIGURES: Record<KirtanFigure, { skin: string; cloth: string; sash: string; trim: string; hair: string; brow: string; scale: number }> = {
  hanuman: { skin: '#C46A32', cloth: '#F1E2C4', sash: '#9E2B1B', trim: '#D9A441', hair: '#5A2E14', brow: '#5A2E14', scale: 1 },
  child: { skin: '#D9A07A', cloth: '#E8B83A', sash: '#B8621B', trim: '#F2C46B', hair: '#2E1A0E', brow: '#2E1A0E', scale: 0.86 },
  sadhu: { skin: '#B98A62', cloth: '#D9772B', sash: '#8A3E0B', trim: '#EFE7DA', hair: '#EFE7DA', brow: '#3A2414', scale: 1 },
};
const MANJIRA = { face: '#E6B54A', rim: '#8A5A12', cord: '#9E2B1B' } as const;
/** Limb outline so arms read against a same-coloured body. */
const OUTLINE = 'rgba(40, 18, 6, 0.55)';

/**
 * Kirtan japa: a figure dances in kirtan, one manjira clash per japa. The first
 * tap starts the beat, the next pauses; each completed beat counts once through
 * the same driver and arbitration as Infinity.
 */
export default function JapamKirtan({ figure, count, size, hint, notice, labelFontFamily, running, onCycle, ringText, ringsActive = true }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { factor } = useFontScale();
  const { width: windowWidth } = useWindowDimensions();
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const beat = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const cycleCallback = useRef(onCycle);
  cycleCallback.current = onCycle;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  // The counted beat: one completed cycle = one clash = one japa.
  useEffect(() => {
    if (!running || !active) return;
    return startInfinityMotion({
      cycleMs: KIRTAN_BEAT_MS,
      readPhase: (callback) => beat.stopAnimation(callback),
      setPhase: (value) => beat.setValue(value),
      stopPhase: () => beat.stopAnimation(),
      onCycle: () => cycleCallback.current(),
      animate: (duration, complete) => {
        const animation = Animated.timing(beat, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true });
        animation.start(({ finished }) => complete(finished));
        return animation;
      },
    });
  }, [running, active, beat]);
  // The two-beat sway and alternating step: decorative, never counted.
  useEffect(() => {
    if (!running || !active || reduced) return;
    return startInfinityMotion({
      cycleMs: KIRTAN_BEAT_MS * 2,
      readPhase: (callback) => sway.stopAnimation(callback),
      setPhase: (value) => sway.setValue(value),
      stopPhase: () => sway.stopAnimation(),
      animate: (duration, complete) => {
        const animation = Animated.timing(sway, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true });
        animation.start(({ finished }) => complete(finished));
        return animation;
      },
    });
  }, [running, active, reduced, sway]);

  const height = Math.round(size * 0.72);
  const panelWidth = Math.max(size, Math.min(windowWidth - 16, size + 160));
  const palette = FIGURES[figure];
  const figH = height * 0.9 * palette.scale;
  const figW = (figH * CW) / CH;
  const unit = figH / CH;
  const figLeft = (panelWidth - figW) / 2;
  const figTop = height - figH - 4;
  const haloX = panelWidth / 2;
  // Halo centred on the chest; its top may tuck slightly under the panel edge.
  const haloY = figTop + 95 * unit;
  const outerRadius = Math.floor(Math.min(height * 0.46, panelWidth * 0.32, haloY + 10));
  const innerRadius = outerRadius - 20;

  const rot = (value: Animated.Value, input: number[], degrees: number[]) =>
    reduced ? '0deg' : value.interpolate({ inputRange: input, outputRange: degrees.map((d) => `${d}deg`) });
  // Manjira: hands meet at the end of each beat (the count), open mid-beat, and
  // close fast — a strike, not a wave.
  const strike = [0, 0.55, 0.9, 1];
  const part = (pivot: readonly [number, number], rotate: string | Animated.AnimatedInterpolation<string>) => ({
    position: 'absolute' as const, left: 0, top: 0, width: figW, height: figH,
    transformOrigin: [pivot[0] * unit, pivot[1] * unit, 0], transform: [{ rotate }],
  });
  // Knees give on the strike, rise as the hands open.
  const bounce = reduced ? 0 : beat.interpolate({ inputRange: strike, outputRange: [4 * unit, -3 * unit, 1 * unit, 4 * unit] });
  const svg = (children: React.ReactNode) => (
    <Svg width={figW} height={figH} viewBox={`0 0 ${CW} ${CH}`}>{children}</Svg>
  );

  return (
    <View testID="japam-kirtan" style={[styles.root, { width: size, minHeight: size }]} pointerEvents="none"
      importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View testID="japam-kirtan-panel" style={[styles.panel, { width: panelWidth, height,
        backgroundColor: colors.skyNightTop, borderColor: colors.nightGlassBorder }]}>
        <Svg width={panelWidth} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="kirtan-night" cx="50%" cy="45%" r="65%">
              <Stop offset="0" stopColor={colors.skyNightLower} stopOpacity={1} />
              <Stop offset="0.55" stopColor={colors.skyNightUpper} stopOpacity={1} />
              <Stop offset="1" stopColor={colors.skyNightTop} stopOpacity={1} />
            </RadialGradient>
            <RadialGradient id="kirtan-halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.sunCore} stopOpacity={0.45} />
              <Stop offset="0.6" stopColor={colors.sunCore} stopOpacity={0.12} />
              <Stop offset="1" stopColor={colors.sunCore} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={panelWidth} height={height} fill="url(#kirtan-night)" />
          <Circle cx={haloX} cy={haloY} r={Math.max(24, innerRadius - 6)} fill="url(#kirtan-halo)" />
          <Ellipse cx={panelWidth / 2} cy={height - 6} rx={figW * 0.5} ry={6} fill={colors.skyHillsNight} />
        </Svg>
        {ringText && outerRadius >= 40 ? (
          <JapamMantraRing key={`${ringText}|${labelFontFamily}`} testID="japam-kirtan-halo"
            text={ringText} fontFamily={labelFontFamily} cx={haloX} cy={haloY}
            animate={ringsActive && active && !reduced}
            rings={[
              { radius: outerRadius, fontSize: 13, color: colors.nightGold, opacity: 0.9, direction: 1, periodMs: RING_OUTER_PERIOD_MS },
              { radius: innerRadius, fontSize: 11, color: colors.sunCore, opacity: 0.85, direction: -1, periodMs: RING_INNER_PERIOD_MS },
            ]} />
        ) : null}
        <Animated.View testID="japam-kirtan-figure" style={{ position: 'absolute', left: figLeft, top: figTop, width: figW, height: figH,
          transform: [{ translateY: bounce }] }}>
          {figure === 'hanuman' ? (
            <Animated.View style={part(PIVOT.tail, rot(sway, [0, 0.5, 1], [-10, 10, -10]))}>
              {svg(<Path d="M114 152 C150 160 172 132 166 100 C162 80 176 70 186 74" stroke={palette.skin} strokeWidth={7}
                strokeLinecap="round" fill="none" />)}
            </Animated.View>
          ) : null}
          <Animated.View testID="japam-kirtan-leg-left" style={part(PIVOT.hipL, rot(sway, [0, 0.25, 0.5, 1], [0, 24, 0, 0]))}>
            {svg(<G>
              <Path d="M78 146 L98 146 L96 222 L80 222 Z" fill={palette.cloth} />
              <Rect x={80} y={222} width={14} height={14} rx={3} fill={palette.skin} />
              <Ellipse cx={84} cy={238} rx={11} ry={5} fill={palette.skin} />
            </G>)}
          </Animated.View>
          <Animated.View testID="japam-kirtan-leg-right" style={part(PIVOT.hipR, rot(sway, [0, 0.5, 0.75, 1], [0, 0, -24, 0]))}>
            {svg(<G>
              <Path d="M102 146 L122 146 L120 222 L104 222 Z" fill={palette.cloth} />
              <Rect x={106} y={222} width={14} height={14} rx={3} fill={palette.skin} />
              <Ellipse cx={116} cy={238} rx={11} ry={5} fill={palette.skin} />
            </G>)}
          </Animated.View>
          <Animated.View testID="japam-kirtan-torso" style={part(PIVOT.hips, rot(sway, [0, 0.25, 0.5, 0.75, 1], [0, 5, 0, -5, 0]))}>
            {svg(<G>
              {figure === 'sadhu'
                ? <Path d="M70 78 Q100 66 130 78 L138 156 L62 156 Z" fill={palette.cloth} />
                : <Path d="M72 76 Q100 68 128 76 L132 132 Q100 140 68 132 Z" fill={palette.skin} />}
              <Path d="M66 130 Q100 142 134 130 L138 158 L62 158 Z" fill={palette.cloth} />
              <Path d="M66 132 Q100 146 134 132 L134 140 Q100 152 66 140 Z" fill={palette.sash} />
              <Path d={figure === 'sadhu' ? 'M82 80 Q100 120 118 80' : 'M80 78 Q100 110 120 78'} stroke={palette.trim} strokeWidth={3} fill="none" />
            </G>)}
            <Animated.View style={part(PIVOT.neck, rot(beat, strike, [3, -5, 4, 3]))}>
              {svg(<G>
                <Rect x={92} y={56} width={16} height={12} fill={palette.skin} />
                {figure === 'sadhu' ? <Circle cx={100} cy={14} r={11} fill={palette.hair} /> : null}
                {figure === 'child' ? <Path d="M100 12 Q108 4 112 14" stroke={palette.hair} strokeWidth={4} fill="none" /> : null}
                <Circle cx={100} cy={40} r={22} fill={palette.skin} />
                {figure === 'hanuman' ? <Ellipse cx={100} cy={50} rx={13} ry={9} fill="#E7B48C" /> : null}
                {figure === 'hanuman' ? <Path d="M80 26 L86 10 L94 22 L100 6 L106 22 L114 10 L120 26 Z" fill={palette.trim} /> : null}
                {figure === 'sadhu' ? <Path d="M84 48 Q100 82 116 48 Q100 58 84 48 Z" fill={palette.hair} /> : null}
                <Path d="M92 40 Q95 37 98 40 M102 40 Q105 37 108 40" stroke={palette.brow} strokeWidth={1.6} fill="none" />
                <Path d="M100 22 L100 30" stroke={palette.sash} strokeWidth={2.4} />
              </G>)}
            </Animated.View>
            <Animated.View style={part(PIVOT.shoulderL, rot(beat, strike, [0, -10, -2, 0]))}>
              {svg(<G>
                <Path d="M72 80 L58 112" stroke={OUTLINE} strokeWidth={15} strokeLinecap="round" />
                <Path d="M72 80 L58 112" stroke={figure === 'sadhu' ? palette.cloth : palette.skin} strokeWidth={12} strokeLinecap="round" />
              </G>)}
              <Animated.View style={part(PIVOT.elbowL, rot(beat, strike, [0, -34, -6, 0]))}>
                {svg(<G>
                  <Path d="M58 112 L92 96" stroke={OUTLINE} strokeWidth={13} strokeLinecap="round" />
                  <Path d="M58 112 L92 96" stroke={palette.skin} strokeWidth={10} strokeLinecap="round" />
                  <Path d="M93 90 L98 80" stroke={MANJIRA.cord} strokeWidth={1.5} />
                  <Ellipse cx={96} cy={96} rx={4} ry={12} fill={MANJIRA.face} stroke={MANJIRA.rim} strokeWidth={1.4} />
                </G>)}
              </Animated.View>
            </Animated.View>
            <Animated.View style={part(PIVOT.shoulderR, rot(beat, strike, [0, 10, 2, 0]))}>
              {svg(<G>
                <Path d="M128 80 L142 112" stroke={OUTLINE} strokeWidth={15} strokeLinecap="round" />
                <Path d="M128 80 L142 112" stroke={figure === 'sadhu' ? palette.cloth : palette.skin} strokeWidth={12} strokeLinecap="round" />
              </G>)}
              <Animated.View style={part(PIVOT.elbowR, rot(beat, strike, [0, 34, 6, 0]))}>
                {svg(<G>
                  <Path d="M142 112 L108 96" stroke={OUTLINE} strokeWidth={13} strokeLinecap="round" />
                  <Path d="M142 112 L108 96" stroke={palette.skin} strokeWidth={10} strokeLinecap="round" />
                  <Path d="M107 90 L102 80" stroke={MANJIRA.cord} strokeWidth={1.5} />
                  <Ellipse cx={104} cy={96} rx={4} ry={12} fill={MANJIRA.face} stroke={MANJIRA.rim} strokeWidth={1.4} />
                </G>)}
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
      <Text style={[styles.count, { fontSize: 32 * factor, color: colors.ink, fontFamily: fontFamilies.latinSemiBold }]}>
        {count} / {N}
      </Text>
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
  count: { textAlign: 'center', marginTop: 8 },
  track: { width: '80%', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
});
