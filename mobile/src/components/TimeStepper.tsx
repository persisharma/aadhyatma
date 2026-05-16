import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { TimeOfDay } from '@/notifications/pure';

type Props = {
  value: TimeOfDay;
  onChange: (next: TimeOfDay) => void;
  /** Minute granularity. Default 15. */
  minuteStep?: number;
};

/**
 * Compact, dependency-free time picker. Two columns (hour / minute) with
 * arrow buttons. Wraps at 24 hours and at 60 minutes. Matches the parchment
 * design tokens — no platform date picker, no extra deps (bundle-only).
 */
export default function TimeStepper({ value, onChange, minuteStep = 15 }: Props) {
  const { colors, typography, radii } = useTheme();

  const bumpHour = useCallback(
    (delta: number) => {
      const hour = (value.hour + delta + 24) % 24;
      onChange({ hour, minute: value.minute });
    },
    [value, onChange]
  );

  const bumpMinute = useCallback(
    (delta: number) => {
      const step = minuteStep > 0 ? minuteStep : 15;
      const totalMinutes = value.hour * 60 + value.minute + delta * step;
      const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
      onChange({
        hour: Math.floor(normalized / 60),
        minute: normalized % 60,
      });
    },
    [value, onChange, minuteStep]
  );

  const hh = `${value.hour}`.padStart(2, '0');
  const mm = `${value.minute}`.padStart(2, '0');

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.md,
        },
      ]}
      accessibilityLabel={`Time: ${hh}:${mm}`}
    >
      <Column
        label="Hr"
        valueText={hh}
        onIncrement={() => bumpHour(1)}
        onDecrement={() => bumpHour(-1)}
        valueColor={colors.ink}
        labelColor={colors.inkMuted}
        chevronColor={colors.saffron}
        labelFontFamily={typography.cardLatin.fontFamily}
        valueFontFamily={typography.readerTitle.fontFamily}
      />
      <View style={[styles.colon, { backgroundColor: 'transparent' }]}>
        <Text
          style={[
            styles.colonText,
            { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
          ]}
        >
          :
        </Text>
      </View>
      <Column
        label="Min"
        valueText={mm}
        onIncrement={() => bumpMinute(1)}
        onDecrement={() => bumpMinute(-1)}
        valueColor={colors.ink}
        labelColor={colors.inkMuted}
        chevronColor={colors.saffron}
        labelFontFamily={typography.cardLatin.fontFamily}
        valueFontFamily={typography.readerTitle.fontFamily}
      />
    </View>
  );
}

type ColumnProps = {
  label: string;
  valueText: string;
  onIncrement: () => void;
  onDecrement: () => void;
  valueColor: string;
  labelColor: string;
  chevronColor: string;
  labelFontFamily: string;
  valueFontFamily: string;
};

function Column({
  label,
  valueText,
  onIncrement,
  onDecrement,
  valueColor,
  labelColor,
  chevronColor,
  labelFontFamily,
  valueFontFamily,
}: ColumnProps) {
  return (
    <View style={styles.col}>
      <Pressable
        onPress={onIncrement}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        hitSlop={8}
        style={({ pressed }) => [styles.chevron, pressed && { opacity: 0.5 }]}
      >
        <Text style={[styles.chevronText, { color: chevronColor }]}>▲</Text>
      </Pressable>
      <Text style={[styles.value, { color: valueColor, fontFamily: valueFontFamily }]}>
        {valueText}
      </Text>
      <Pressable
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        hitSlop={8}
        style={({ pressed }) => [styles.chevron, pressed && { opacity: 0.5 }]}
      >
        <Text style={[styles.chevronText, { color: chevronColor }]}>▼</Text>
      </Pressable>
      <Text style={[styles.label, { color: labelColor, fontFamily: labelFontFamily }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  col: {
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  colon: {
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colonText: {
    fontSize: 28,
    lineHeight: 36,
    includeFontPadding: false,
  },
  chevron: {
    paddingVertical: 4,
  },
  chevronText: {
    fontSize: 14,
    includeFontPadding: false,
  },
  value: {
    fontSize: 30,
    lineHeight: 36,
    minWidth: 44,
    textAlign: 'center',
    includeFontPadding: false,
  },
  label: {
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 4,
    includeFontPadding: false,
  },
});
