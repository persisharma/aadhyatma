import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { StepperColumn } from './StepperColumn';

type Props = {
  /** 24-hour `HH:mm`. Invalid/empty falls back to 06:00 for display only. */
  value: string;
  /** Emits the new 24-hour `HH:mm`. */
  onChange: (next: string) => void;
  /** Accessibility label for the whole control (e.g. "Groom birth time"). */
  label?: string;
};

const DAY_MINUTES = 24 * 60;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const FALLBACK_MINUTES = 6 * 60; // 06:00 when the stored value is empty/invalid.

function parseMinutes(value: string): number {
  const match = TIME_PATTERN.exec(value);
  if (!match) return FALLBACK_MINUTES;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatMinutes(minuteOfDay: number): string {
  const total = ((minuteOfDay % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Birth-time picker: the reminder stepper's HR/MIN columns in 24-hour form.
 * HR/MIN step the underlying minute-of-day (so the hour column crosses
 * midnight the way a clock does). Emits 24-hour `HH:mm`.
 */
export default function ClockTimePicker({ value, onChange, label }: Props) {
  const { colors, radii } = useTheme();
  const total = parseMinutes(value);
  const hour24 = Math.floor(total / 60);
  const minute = total % 60;

  const bumpHour = (delta: number) => onChange(formatMinutes(total + delta * 60));
  const bumpMinute = (delta: number) => onChange(formatMinutes(total + delta));

  return (
    <View
      accessibilityLabel={label ? `${label}, ${formatMinutes(total)}` : undefined}
      style={[
        styles.row,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.md,
        },
      ]}
    >
      <StepperColumn
        label="Hour"
        valueText={String(hour24).padStart(2, '0')}
        onUp={() => bumpHour(1)}
        onDown={() => bumpHour(-1)}
        accentColor={colors.saffronDeep}
        chevronColor={colors.saffron}
      />
      <Text style={[styles.colon, { color: colors.inkMuted }]}>:</Text>
      <StepperColumn
        label="Minute"
        valueText={String(minute).padStart(2, '0')}
        onUp={() => bumpMinute(1)}
        onDown={() => bumpMinute(-1)}
        accentColor={colors.saffronDeep}
        chevronColor={colors.saffron}
      />
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
  colon: {
    fontSize: 18,
    fontFamily: fontFamilies.interSemiBold,
    lineHeight: 22,
    marginBottom: 14,
    includeFontPadding: false,
  },
});
