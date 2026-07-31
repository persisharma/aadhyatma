import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';

/**
 * A `− 1.0× +` stepper for a playback or speech rate.
 *
 * Extracted from `JapamAudioPlayer`'s tempo block when read-aloud needed the same
 * control in its settings sheet (design.md §54). The two callers pass different
 * bounds and labels but the geometry, disabled-at-bounds treatment and a11y are
 * fixed here — the same reasoning that produced `ReaderHeader` and `TextField`.
 *
 * `accessibilityLabel`s on the two buttons are English and un-localized so Maestro
 * can drive them regardless of reading language, matching `ReaderHeader`'s back label.
 */

/** Float comparisons need slack — 0.5 + 0.1×5 is not exactly 1.0. */
const EPSILON = 1e-3;

export default function RateStepper({
  value,
  onChange,
  min,
  max,
  step,
  label,
  labelFontFamily,
  style,
}: {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  /** Optional caption above the row (already localized). */
  label?: string;
  labelFontFamily?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, typography } = useTheme();

  const atMin = value <= min + EPSILON;
  const atMax = value >= max - EPSILON;

  const decrease = useCallback(
    () => onChange(Math.max(min, +(value - step).toFixed(2))),
    [onChange, value, step, min]
  );
  const increase = useCallback(
    () => onChange(Math.min(max, +(value + step).toFixed(2))),
    [onChange, value, step, max]
  );

  return (
    <View style={[styles.block, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.inkMuted, fontFamily: labelFontFamily }]}>
          {label}
        </Text>
      ) : null}
      <View style={styles.row}>
        <Pressable
          onPress={decrease}
          accessibilityRole="button"
          accessibilityLabel="Slower"
          accessibilityState={{ disabled: atMin }}
          disabled={atMin}
          hitSlop={8}
          style={({ pressed }) => [
            styles.btn,
            { borderColor: colors.divider, borderRadius: radii.md },
            pressed && { opacity: 0.7 },
            atMin && { opacity: 0.4 },
          ]}
        >
          <Text style={[styles.glyph, { color: colors.inkSoft }]}>−</Text>
        </Pressable>

        <Text
          style={[
            styles.value,
            { color: colors.ink, fontFamily: typography.pageCounter.fontFamily },
          ]}
        >
          {value.toFixed(1)}×
        </Text>

        <Pressable
          onPress={increase}
          accessibilityRole="button"
          accessibilityLabel="Faster"
          accessibilityState={{ disabled: atMax }}
          disabled={atMax}
          hitSlop={8}
          style={({ pressed }) => [
            styles.btn,
            { borderColor: colors.divider, borderRadius: radii.md },
            pressed && { opacity: 0.7 },
            atMax && { opacity: 0.4 },
          ]}
        >
          <Text style={[styles.glyph, { color: colors.inkSoft }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center' },
  label: {
    fontSize: 11,
    fontStyle: 'italic',
    includeFontPadding: false,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 18, lineHeight: 20, includeFontPadding: false },
  value: { fontSize: 14, minWidth: 38, textAlign: 'center', includeFontPadding: false },
});
