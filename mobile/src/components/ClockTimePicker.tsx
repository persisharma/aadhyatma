import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
 * Birth-time picker: the reminder stepper's HR/MIN columns in 12-hour form plus
 * an AM/PM toggle. HR/MIN step the underlying 24-hour minute-of-day (so the
 * hour column crosses noon/midnight the way a clock does); AM/PM is derived
 * from the current hour and the toggle shifts ±12h. Emits 24-hour `HH:mm`.
 */
export default function ClockTimePicker({ value, onChange, label }: Props) {
  const { colors, radii } = useTheme();
  const total = parseMinutes(value);
  const hour24 = Math.floor(total / 60);
  const minute = total % 60;
  const isAm = hour24 < 12;
  const hour12 = hour24 % 12 || 12;

  const bumpHour = (delta: number) => onChange(formatMinutes(total + delta * 60));
  const bumpMinute = (delta: number) => onChange(formatMinutes(total + delta));
  const togglePeriod = () => onChange(formatMinutes(total + (isAm ? DAY_MINUTES / 2 : -DAY_MINUTES / 2)));

  return (
    <View
      accessibilityLabel={label ? `${label}, ${hour12}:${String(minute).padStart(2, '0')} ${isAm ? 'AM' : 'PM'}` : undefined}
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
        valueText={`${hour12}`}
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
      <View style={styles.periodCol}>
        <Pressable
          onPress={togglePeriod}
          accessibilityRole="button"
          accessibilityLabel="Toggle AM/PM"
          accessibilityValue={{ text: isAm ? 'AM' : 'PM' }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.period,
            { borderColor: colors.saffron, borderRadius: radii.pill },
            pressed && { opacity: 0.5 },
          ]}
        >
          <Text style={[styles.periodText, { color: colors.saffronDeep }]}>{isAm ? 'AM' : 'PM'}</Text>
        </Pressable>
        <Text style={[styles.periodLabel, { color: colors.inkMuted }]}>AM/PM</Text>
      </View>
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
  periodCol: {
    alignItems: 'center',
    width: 52,
    marginLeft: 6,
  },
  period: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodText: {
    fontSize: 15,
    fontFamily: fontFamilies.interSemiBold,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  periodLabel: {
    fontSize: 10,
    fontFamily: fontFamilies.inter,
    letterSpacing: 1.5,
    marginTop: 2,
    includeFontPadding: false,
  },
});
