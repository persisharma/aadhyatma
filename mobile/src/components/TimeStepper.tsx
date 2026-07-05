import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
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

const HOLD_DELAY_MS = 350;
const HOLD_INTERVAL_MS = 90;

/**
 * Chevron that fires once on press and auto-repeats while held — makes
 * 1-minute stepping usable without demanding 59 taps. The action fires on
 * press-in (not press-up) so the repeat is a seamless continuation of the
 * first step.
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

  const start = useCallback(() => {
    stepRef.current();
    const tick = () => {
      stepRef.current();
      timerRef.current = setTimeout(tick, HOLD_INTERVAL_MS);
    };
    timerRef.current = setTimeout(tick, HOLD_DELAY_MS);
  }, []);

  useEffect(() => stop, [stop]);

  return (
    <Pressable
      onPressIn={start}
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

function Column({ label, valueText, onUp, onDown, accentColor, chevronColor }: ColumnProps) {
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
