import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';

const HOLD_DELAY_MS = 350;
const HOLD_INTERVAL_MS = 90;

/**
 * Chevron that steps once per tap and auto-repeats while held — makes
 * 1-unit stepping usable without demanding dozens of taps. The single step
 * fires on press-UP (onPress) and the repeat starts from onLongPress: a scroll
 * drag that merely begins on the chevron is terminated by the ScrollView
 * before either fires, so it can never mutate the value. (RN suppresses
 * onPress after onLongPress, so a held press doesn't double-step.)
 *
 * Extracted from TimeStepper so both the reminder time stepper and the
 * birth-time AM/PM picker (ClockTimePicker) share one press implementation.
 */
function RepeatChevron({
  onStep,
  accessibilityLabel,
  glyph,
  color,
}: {
  onStep: () => void;
  accessibilityLabel: string;
  glyph: string;
  color: string;
}) {
  const stepRef = useRef(onStep);
  stepRef.current = onStep;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRepeat = useCallback(() => {
    stepRef.current();
    const tick = () => {
      stepRef.current();
      timerRef.current = setTimeout(tick, HOLD_INTERVAL_MS);
    };
    timerRef.current = setTimeout(tick, HOLD_INTERVAL_MS);
  }, []);

  useEffect(() => stop, [stop]);

  return (
    <Pressable
      onPress={() => stepRef.current()}
      onLongPress={startRepeat}
      delayLongPress={HOLD_DELAY_MS}
      onPressOut={stop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={({ pressed }) => [styles.chevron, pressed && { opacity: 0.5 }]}
    >
      <Text style={[styles.chevronText, { color }]}>{glyph}</Text>
    </Pressable>
  );
}

export type StepperColumnProps = {
  label: string;
  valueText: string;
  onUp: () => void;
  onDown: () => void;
  accentColor: string;
  chevronColor: string;
};

export function StepperColumn({
  label,
  valueText,
  onUp,
  onDown,
  accentColor,
  chevronColor,
}: StepperColumnProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.col}>
      <RepeatChevron
        onStep={onUp}
        accessibilityLabel={`Increase ${label}`}
        glyph="▵"
        color={chevronColor}
      />
      <Text style={[styles.value, { color: accentColor }]}>{valueText}</Text>
      <RepeatChevron
        onStep={onDown}
        accessibilityLabel={`Decrease ${label}`}
        glyph="▿"
        color={chevronColor}
      />
      <Text style={[styles.label, { color: colors.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    alignItems: 'center',
    width: 48,
  },
  chevron: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 16,
    includeFontPadding: false,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamilies.interSemiBold,
    textAlign: 'center',
    includeFontPadding: false,
    marginVertical: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: fontFamilies.inter,
    letterSpacing: 1.5,
    marginTop: 2,
    includeFontPadding: false,
  },
});
