import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { TimeOfDay } from '@/notifications/pure';

type Props = {
  value: TimeOfDay;
  onChange: (next: TimeOfDay) => void;
  minuteStep?: number;
};

export default function TimeStepper({ value, onChange, minuteStep = 15 }: Props) {
  const { colors, radii } = useTheme();

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
        label="HR"
        valueText={hh}
        onUp={() => bumpHour(1)}
        onDown={() => bumpHour(-1)}
        accentColor={colors.saffronDeep}
        chevronColor={colors.saffron}
      />
      <Text style={[styles.colon, { color: colors.inkMuted }]}>:</Text>
      <Column
        label="MIN"
        valueText={mm}
        onUp={() => bumpMinute(1)}
        onDown={() => bumpMinute(-1)}
        accentColor={colors.saffronDeep}
        chevronColor={colors.saffron}
      />
    </View>
  );
}

type ColumnProps = {
  label: string;
  valueText: string;
  onUp: () => void;
  onDown: () => void;
  accentColor: string;
  chevronColor: string;
};

function Column({ label, valueText, onUp, onDown, accentColor, chevronColor }: ColumnProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.col}>
      <Pressable
        onPress={onUp}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        hitSlop={10}
        style={({ pressed }) => [styles.chevron, pressed && { opacity: 0.5 }]}
      >
        <Text style={[styles.chevronText, { color: chevronColor }]}>▵</Text>
      </Pressable>
      <Text style={[styles.value, { color: accentColor }]}>{valueText}</Text>
      <Pressable
        onPress={onDown}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        hitSlop={10}
        style={({ pressed }) => [styles.chevron, pressed && { opacity: 0.5 }]}
      >
        <Text style={[styles.chevronText, { color: chevronColor }]}>▿</Text>
      </Pressable>
      <Text style={[styles.label, { color: colors.inkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 2,
  },
  col: {
    alignItems: 'center',
    width: 48,
  },
  colon: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
    marginBottom: 14,
    includeFontPadding: false,
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
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    includeFontPadding: false,
    marginVertical: 1,
  },
  label: {
    fontSize: 8,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1.5,
    marginTop: 2,
    includeFontPadding: false,
  },
});
