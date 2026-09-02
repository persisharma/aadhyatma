import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { StepperColumn } from './StepperColumn';
import type { TimeOfDay } from '@/notifications/pure';

type Props = {
  value: TimeOfDay;
  onChange: (next: TimeOfDay) => void;
  minuteStep?: number;
  /**
   * Minute-of-day keys (`hour * 60 + minute`) already taken by other reminders.
   * Stepping skips over these so a row can never land on a time another row
   * already holds — keeping the list duplicate-free without a row vanishing
   * mid-edit. Should exclude this row's own current value.
   */
  taken?: ReadonlySet<number>;
};

const EMPTY_TAKEN: ReadonlySet<number> = new Set();
const DAY_MINUTES = 24 * 60;

export default function TimeStepper({
  value,
  onChange,
  minuteStep = 15,
  taken = EMPTY_TAKEN,
}: Props) {
  const { colors, radii } = useTheme();

  const bumpHour = useCallback(
    (delta: number) => {
      let hour = value.hour;
      // Advance whole hours in the requested direction, skipping any hour whose
      // hour:minute is already taken. 24 iterations is a hard stop — with at
      // most a few reminders a free hour always exists well before that.
      for (let i = 0; i < 24; i += 1) {
        hour = (hour + delta + 24) % 24;
        if (!taken.has(hour * 60 + value.minute)) break;
      }
      onChange({ hour, minute: value.minute });
    },
    [value, onChange, taken]
  );

  const bumpMinute = useCallback(
    (delta: number) => {
      const step = minuteStep > 0 ? minuteStep : 15;
      let total = value.hour * 60 + value.minute;
      const slots = Math.max(1, Math.floor(DAY_MINUTES / step));
      // Step by `step` minutes (wrapping at midnight), skipping taken slots.
      for (let i = 0; i < slots; i += 1) {
        total = ((total + delta * step) % DAY_MINUTES + DAY_MINUTES) % DAY_MINUTES;
        if (!taken.has(total)) break;
      }
      onChange({
        hour: Math.floor(total / 60),
        minute: total % 60,
      });
    },
    [value, onChange, minuteStep, taken]
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
      <StepperColumn
        label="HR"
        valueText={hh}
        onUp={() => bumpHour(1)}
        onDown={() => bumpHour(-1)}
        accentColor={colors.saffronDeep}
        chevronColor={colors.saffron}
      />
      <Text style={[styles.colon, { color: colors.inkMuted }]}>:</Text>
      <StepperColumn
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
