import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { JAPAM_BEADS_PER_ROUND as N } from '@/data/japam';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { useFontScale } from '@/contexts/FontScaleContext';
import { startInfinityMotion } from './japamInfinityPlayback';
import JapamInfinityLoop from './JapamInfinityLoop';
import JapamMandala from './JapamMandala';

type Props = {
  count: number; size: number; hint: string; notice?: string | null;
  labelFontFamily: string; running: boolean; cycleMs?: number;
  phase?: Animated.Value; onCycle: () => void; ringText?: string; ringsActive?: boolean;
  reading?: React.ReactNode;
};

/** The clock and counting owner are unchanged; ornamentation is decorative. */
export default function JapamInfinity({ count, size, hint, notice, labelFontFamily, running, cycleMs, phase, onCycle, ringText, ringsActive = true, reading }: Props) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { factor } = useFontScale();
  const { fontScale, width: windowWidth } = useWindowDimensions();
  const numbersBelow = !ringText && factor * fontScale > 1.25;
  const mandalaSize = Math.min(windowWidth - 24, Math.max(size, 280), 340);
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const [fallbackProgress] = useState(() => phase ?? new Animated.Value(0));
  const progress = phase ?? fallbackProgress;
  const cycleCallback = useRef(onCycle);
  cycleCallback.current = onCycle;
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!running || !active) return;
    return startInfinityMotion({
      readPhase: callback => progress.stopAnimation(callback),
      setPhase: value => progress.setValue(value),
      stopPhase: () => progress.stopAnimation(),
      onCycle: () => cycleCallback.current(),
      animate: (duration, complete) => {
        const animation = Animated.timing(progress, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true, isInteraction: false });
        animation.start(({ finished }) => complete(finished));
        return animation;
      },
    }, cycleMs);
  }, [running, active, progress, cycleMs]);
  const width = ringText ? mandalaSize : size;
  return <View testID="japam-infinity" style={[styles.root, { width, minHeight: width }]} pointerEvents="none"
    importantForAccessibility={reading ? 'auto' : 'no-hide-descendants'} accessibilityElementsHidden={!reading}>
    <View testID="japam-infinity-panel" style={{ width, alignItems: 'center' }}
      importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {ringText ? <JapamMandala key={`${ringText}|${labelFontFamily}`} text={ringText} size={mandalaSize}
        fontFamily={labelFontFamily} animate={running && ringsActive && active} reduced={reduced} phase={progress}>
        {layout => <View style={{ position: 'absolute', left: (mandalaSize - (layout.loop || 80)) / 2,
          top: layout.loop ? (mandalaSize - layout.loop * .65) / 2 : mandalaSize + 6 }}>
          <JapamInfinityLoop loop={layout.loop || 80} progress={progress} running={running} reduced={reduced}
            count={count} total={N} factor={factor} showNumbers compactNumbers markerSize={22} />
        </View>}
      </JapamMandala> : <JapamInfinityLoop loop={size} progress={progress} running={running} reduced={reduced}
        count={count} total={N} factor={factor} showNumbers={!numbersBelow} />}
    </View>
    {reading ? <View testID="japam-infinity-reading" style={styles.reading}>{reading}</View> : null}
    {numbersBelow ? <Text testID="japam-infinity-count" style={{ fontSize: 32 * factor, color: colors.ink,
      fontFamily: fontFamilies.latinSemiBold, textAlign: 'center', marginTop: 8 }}>{count} / {N}</Text> : null}
    <View style={[styles.track, { backgroundColor: colors.divider }]}>
      <View style={{ width: `${count / N * 100}%`, height: 3, backgroundColor: colors.saffron }} />
    </View>
    <Text style={[styles.hint, { fontSize: 12 * factor, color: notice ? colors.saffronDeep : colors.inkMuted, fontFamily: labelFontFamily }]}>{notice ?? hint}</Text>
  </View>;
}

const styles = StyleSheet.create({
  root: { justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  reading: { width: '100%', paddingHorizontal: 8, marginTop: 6 },
  track: { width: '80%', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 12 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
});
