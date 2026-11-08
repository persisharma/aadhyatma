import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { ringSeparator, ringWords } from './japamMantraRingLayout';
import { layoutMandala, mandalaClusters, mandalaPageOpacity, MANDALA_MEASURE_SIZE, MANDALA_PERIODS, type MandalaBand, type MandalaLayout } from './japamMandalaLayout';

type Props = {
  text: string;
  size: number;
  fontFamily: string;
  animate: boolean;
  reduced: boolean;
  phase: Animated.Value;
  children: (layout: MandalaLayout) => React.ReactNode;
};

function beadPath(radius: number, count: number, dot: number, centre: number, offset = 0): string {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count * 360 + offset) * Math.PI / 180;
    const x = centre + radius * Math.sin(a), y = centre - radius * Math.cos(a);
    return `M${x - dot},${y}a${dot},${dot} 0 1,0 ${dot * 2},0a${dot},${dot} 0 1,0 ${-dot * 2},0`;
  }).join(' ');
}

const Frame = React.memo(function Frame({ size, outer, middle, inner }: { size: number; outer: number; middle: number; inner: number }) {
  const { colors } = useTheme();
  const centre = size / 2;
  const paths = useMemo(() => ({
    edge: beadPath(outer + size * .006, 96, .65, centre),
    middle: beadPath(middle, 32, 1.1, centre),
    fine: beadPath(middle, 32, .45, centre, 5.625),
    inner: beadPath(Math.max(0, inner - 3), 64, .45, centre),
  }), [outer, middle, inner, centre, size]);
  return <Svg testID="japam-mandala-frame" width={size} height={size} style={StyleSheet.absoluteFill}>
    {[outer, outer + 3, middle, middle - 2, inner, Math.max(0, inner - 2)].map((r, i) => (
      <Circle key={i} cx={centre} cy={centre} r={r} stroke={colors.gold} strokeWidth={.7} opacity={i % 2 ? .45 : .8} fill="none" />
    ))}
    <Path d={`${paths.edge} ${paths.middle} ${paths.fine} ${paths.inner}`} fill={colors.gold} opacity={.75} />
    {Array.from({ length: 16 }, (_, i) => {
      const a = i * Math.PI / 8, radius = size * .476, scale = size / 330;
      return <G key={i} transform={`translate(${centre + radius * Math.sin(a)} ${centre - radius * Math.cos(a)}) rotate(${i * 22.5}) scale(${scale})`}>
        <Path d="M0,5 C-4,1 -3,-5 0,-7 C3,-5 4,1 0,5 Z M-1,5 C-6,5 -8,1 -7,-2 C-3,-1 -1,2 -1,5 Z M1,5 C6,5 8,1 7,-2 C3,-1 1,2 1,5 Z M0,5 L0,8"
          fill={colors.saffronTint} stroke={colors.saffron} strokeWidth={.8} />
      </G>;
    })}
  </Svg>;
});

const Band = React.memo(function Band({ band, size, index, fontFamily, animate, reduced, phase }: {
  band: MandalaBand; size: number; index: number; fontFamily: string; animate: boolean; reduced: boolean; phase: Animated.Value;
}) {
  const { colors } = useTheme();
  const [turn] = useState(() => new Animated.Value(0));
  const period = MANDALA_PERIODS[index];
  const direction = index === 0 ? 1 : -1;
  const rotate = useMemo(() => turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${direction * 360}deg`] }), [turn, direction]);
  const opacities = useMemo(() => band.pages.map((_, page) => phase.interpolate(mandalaPageOpacity(page, band.pages.length))), [band.pages, phase]);
  useEffect(() => {
    if (!animate || reduced) return;
    let live = true;
    let motion: Animated.CompositeAnimation | undefined;
    const run = (from: number) => {
      if (!live) return;
      motion = Animated.timing(turn, { toValue: 1, duration: Math.max(1, Math.round(period * (1 - from))), easing: Easing.linear, useNativeDriver: true, isInteraction: false });
      motion.start(({ finished }) => {
        if (!live || !finished) return;
        turn.setValue(0); run(0);
      });
    };
    turn.stopAnimation(value => run(Number.isFinite(value) ? Math.max(0, Math.min(1, value)) % 1 : 0));
    return () => { live = false; motion?.stop(); turn.stopAnimation(); };
  }, [animate, reduced, period, turn]);
  return <Animated.View testID="japam-mandala-band" style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
    {band.pages.map((page, pageIndex) => reduced && pageIndex > 0 ? null : (
      <Animated.View key={pageIndex} testID="japam-mandala-page" style={[StyleSheet.absoluteFill, { opacity: reduced ? 1 : opacities[pageIndex] }]}>
        {page.map(token => {
          const a = token.angleDeg * Math.PI / 180;
          return <Text key={token.key} testID="japam-mandala-word" allowFontScaling={false} numberOfLines={1}
            style={[styles.word, { fontFamily, fontSize: band.fontSize, lineHeight: band.lineHeight,
              color: index ? colors.inkMuted : colors.saffronDeep, width: token.width,
              left: size / 2 + band.radius * Math.sin(a) - token.width / 2,
              top: size / 2 - band.radius * Math.cos(a) - band.lineHeight / 2,
              transform: [{ rotate: `${token.angleDeg}deg` }],
            }]}>{token.text}</Text>;
        })}
      </Animated.View>
    ))}
  </Animated.View>;
});

/** Only measurement/layout changes allocate the decorative frame and native rings. */
export default function JapamMandala({ text, size, fontFamily, animate, reduced, phase, children }: Props) {
  const unique = useMemo(() => [...new Set([...ringWords(text).slice(0, 160).flatMap(mandalaClusters), ringSeparator(text)])], [text]);
  const pending = useRef<Record<string, number>>({});
  const committed = useRef(false);
  const alive = useRef(true);
  const [widths, setWidths] = useState<Record<string, number>>({});
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const layout = useMemo(() => layoutMandala(text, size, widths), [text, size, widths]);
  const decorations = useMemo(() => layout ? <>
    <Frame size={size} outer={layout.outer} middle={layout.middle} inner={layout.inner} />
    {layout.bands.map((band, index) => <Band key={index} band={band} index={index} size={size}
      fontFamily={fontFamily} animate={animate} reduced={reduced} phase={phase} />)}
  </> : <Frame size={size} outer={size * .46} middle={size * .37} inner={size * .28} />,
  [layout, size, fontFamily, animate, reduced, phase]);
  return <View testID="japam-mandala" pointerEvents="none" style={{ width: size, height: size + (layout?.loop === 0 ? 64 : 0) }}>
    {!committed.current && <View style={styles.measureArea}>
      {unique.map(token => <Text key={token} allowFontScaling={false} numberOfLines={1}
        style={[styles.measureWord, { fontFamily, fontSize: MANDALA_MEASURE_SIZE, lineHeight: MANDALA_MEASURE_SIZE * 2 }]}
        onLayout={event => {
          const width = event.nativeEvent.layout.width;
          if (!alive.current || committed.current || !Number.isFinite(width) || width <= 0) return;
          pending.current[token] = width;
          if (unique.every(word => pending.current[word] > 0)) {
            committed.current = true;
            setWidths({ ...pending.current });
          }
        }}>{token}</Text>)}
    </View>}
    {decorations}
    {layout ? children(layout) : null}
  </View>;
}

const styles = StyleSheet.create({
  measureArea: { position: 'absolute', left: 0, top: 0, width: 10000, height: 44, opacity: 0, overflow: 'hidden' },
  measureWord: { position: 'absolute', left: 0, top: 0 },
  word: { position: 'absolute', textAlign: 'center', includeFontPadding: true },
});
