import React, { useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { INFINITY_PATH, INFINITY_SAMPLES, infinityPoint } from './japamInfinityGeometry';

const JYOTI = { core: '#FFF9DF', gold: '#FFE4A0', amber: '#DFA13D' } as const;
type Props = {
  loop: number; progress: Animated.Value; running: boolean; reduced: boolean;
  count: number; total: number; factor: number; showNumbers: boolean; markerSize?: number;
};

/** Native interpolation graph is rebuilt only for geometry changes. */
export default function JapamInfinityLoop({ loop, progress, running, reduced, count, total, factor, showNumbers, markerSize = 40 }: Props) {
  const { colors } = useTheme();
  const half = markerSize / 2;
  const coordinates = useMemo(() => {
    const inputRange = Array.from({ length: INFINITY_SAMPLES + 1 }, (_, i) => i / INFINITY_SAMPLES);
    return {
      inputRange,
      x: inputRange.map(t => infinityPoint(t).x * loop - half),
      y: inputRange.map(t => infinityPoint(t).y * loop - half),
      tails: [.012, .024, .036].map(offset => ({
        x: inputRange.map(t => infinityPoint(t - offset).x * loop - 4),
        y: inputRange.map(t => infinityPoint(t - offset).y * loop - 4),
      })),
    };
  }, [loop, half]);
  const transforms = useMemo(() => ({
    marker: [
      { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.x }) },
      { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: coordinates.y }) },
    ],
    tails: coordinates.tails.map(tail => [
      { translateX: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: tail.x }) },
      { translateY: progress.interpolate({ inputRange: coordinates.inputRange, outputRange: tail.y }) },
    ]),
  }), [coordinates, progress]);
  return <View testID="japam-infinity-loop" style={{ width: loop, height: loop * .65 }}>
    <Svg width={loop} height={loop * .65} viewBox="0 0 1000 650" style={StyleSheet.absoluteFill}>
      <Defs><RadialGradient id="infinity-ambient" cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={colors.gold} stopOpacity={.14} /><Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
      </RadialGradient></Defs>
      <Ellipse cx={500} cy={325} rx={500} ry={325} fill="url(#infinity-ambient)" />
      <Path d={INFINITY_PATH} stroke={colors.gold} strokeWidth={34} opacity={.25} fill="none" />
      <Path d={INFINITY_PATH} stroke={colors.saffronDeep} strokeWidth={12} fill="none" strokeLinecap="round" />
    </Svg>
    {running && !reduced ? transforms.tails.map((transform, i) => <Animated.View key={i}
      style={[styles.tail, { backgroundColor: colors.saffronDeep, opacity: .5 - i * .15, transform }]} />) : null}
    <Animated.View testID="japam-infinity-marker" style={[styles.light, {
      width: markerSize, height: markerSize,
      transform: reduced ? [{ translateX: loop / 2 - half }, { translateY: loop * .325 - half }] : transforms.marker,
    }]}>
      <Svg width={markerSize} height={markerSize}>
        <Defs><RadialGradient id="infinity-jyoti" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={JYOTI.core} stopOpacity={1} />
          <Stop offset=".2" stopColor={JYOTI.gold} stopOpacity={1} />
          <Stop offset=".42" stopColor={colors.sunCore} stopOpacity={.75} />
          <Stop offset=".7" stopColor={JYOTI.amber} stopOpacity={.22} />
          <Stop offset="1" stopColor={colors.sunCore} stopOpacity={0} />
        </RadialGradient></Defs>
        <Circle cx={half} cy={half} r={half} fill="url(#infinity-jyoti)" />
        <Circle cx={half} cy={half} r={markerSize * .15} fill={JYOTI.core} stroke={colors.saffronDeep} strokeWidth={1.5} />
      </Svg>
    </Animated.View>
    {showNumbers ? <View style={[styles.numbers, { top: loop * .325 - 26 * factor }]}>
      {[count, total].map((value, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 38 * factor,
        lineHeight: 52 * factor, color: colors.inkSoft, fontFamily: fontFamilies.latinSemiBold }}>{value}</Text>)}
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  light: { position: 'absolute', top: 0, left: 0 },
  tail: { position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderRadius: 4 },
  numbers: { position: 'absolute', left: '3%', right: '3%', flexDirection: 'row', alignItems: 'center' },
});
