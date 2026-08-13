import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Lang } from '@/data/gita/language';
import { buildCalendarMonth } from '@/panchang/calendarGrid';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { transliterateDevanagari } from '@/utils/transliterate';

type Props = {
  visible: boolean;
  /** Current value as `YYYY-MM-DD`, or '' when unset. */
  value: string;
  lang: Lang;
  /** Localized sheet title. Defaults to the birth-date wording used by Jyotish. */
  title?: string;
  minDate?: string;
  maxDate?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
};

// English month names are the a11y/Maestro anchor (stable across languages, §3.0).
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAYS_HI = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];

function todayKey(): string {
  // The IST civil day — consistent with the rest of the Jyotish stack.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

function monthLabel(monthIndex: number, lang: Lang): string {
  if (lang === 'en') return MONTHS_EN[monthIndex];
  if (lang === 'hi') return MONTHS_HI[monthIndex];
  return transliterateDevanagari(MONTHS_HI[monthIndex], lang);
}

function parseKey(key: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

export default function CalendarDatePicker({
  visible,
  value,
  lang,
  title,
  minDate = '1900-01-01',
  maxDate,
  onSelect,
  onClose,
}: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const resolvedMax = maxDate ?? todayKey();
  const minYear = Number(minDate.slice(0, 4));
  const maxYear = Number(resolvedMax.slice(0, 4));

  const [visibleYear, setVisibleYear] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState(0);
  const [selectedKey, setSelectedKey] = useState('');
  const [yearListOpen, setYearListOpen] = useState(false);

  // Reset to the value's month each time the sheet opens (empty → land on max).
  useEffect(() => {
    if (!visible) return;
    const anchor = parseKey(value) ?? parseKey(resolvedMax)!;
    setVisibleYear(anchor.year);
    setVisibleMonth(anchor.month);
    setSelectedKey(parseKey(value) ? value : '');
    setYearListOpen(false);
  }, [visible, value, resolvedMax]);

  const cells = useMemo(() => {
    const visibleMonthDate = new Date(visibleYear, visibleMonth, 1);
    const selected = parseKey(selectedKey);
    const selectedDate = selected
      ? new Date(selected.year, selected.month, selected.day)
      : visibleMonthDate;
    return buildCalendarMonth({ visibleMonth: visibleMonthDate, selectedDate, today: new Date() });
  }, [visibleYear, visibleMonth, selectedKey]);

  const goMonth = (delta: number) => {
    const next = new Date(visibleYear, visibleMonth + delta, 1);
    setVisibleYear(next.getFullYear());
    setVisibleMonth(next.getMonth());
  };

  const confirmable = Boolean(selectedKey) && selectedKey >= minDate && selectedKey <= resolvedMax;

  const monthTitle = `${monthLabel(visibleMonth, lang)} ${visibleYear}`;
  const monthTitleEn = `${MONTHS_EN[visibleMonth]} ${visibleYear}`;
  const weekdays = lang === 'en'
    ? WEEKDAYS_EN
    : lang === 'hi'
      ? WEEKDAYS_HI
      : WEEKDAYS_HI.map((d) => transliterateDevanagari(d, lang));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onDismiss={Keyboard.dismiss}
      accessibilityViewIsModal
    >
      <View style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.sheet,
            { backgroundColor: colors.parchment, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg },
          ]}
        >
          <View style={[styles.header, { paddingHorizontal: spacing.xxl, borderBottomColor: colors.divider }]}>
            <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 18 }}>
              {title ?? contentByLang(lang, 'जन्म तिथि चुनें', 'Choose birth date')}
            </Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close date picker" hitSlop={10}>
              <Text style={{ color: colors.saffronDeep, fontSize: 24 }}>×</Text>
            </Pressable>
          </View>

          <View style={[styles.body, { paddingHorizontal: spacing.xxl }]}>
            <View style={styles.navRow}>
              <Pressable
                onPress={() => goMonth(-1)}
                disabled={yearListOpen}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                hitSlop={10}
                style={({ pressed }) => [styles.navArrow, pressed && { opacity: 0.5 }]}
              >
                <Text style={[styles.navArrowText, { color: colors.saffronDeep }]}>‹</Text>
              </Pressable>
              <Pressable
                onPress={() => setYearListOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={`${monthTitleEn}, tap to change year`}
                style={({ pressed }) => [styles.monthTitle, pressed && { opacity: 0.6 }]}
              >
                <Text style={{ color: colors.ink, fontFamily: fontFamilies.interSemiBold, fontSize: 16 }}>
                  {monthTitle} {yearListOpen ? '▴' : '▾'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => goMonth(1)}
                disabled={yearListOpen}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                hitSlop={10}
                style={({ pressed }) => [styles.navArrow, pressed && { opacity: 0.5 }]}
              >
                <Text style={[styles.navArrowText, { color: colors.saffronDeep }]}>›</Text>
              </Pressable>
            </View>

            {yearListOpen ? (
              <>
                <View style={styles.monthStrip}>
                  {MONTHS_EN.map((name, index) => {
                    const selected = index === visibleMonth;
                    return (
                      <Pressable
                        key={name}
                        onPress={() => setVisibleMonth(index)}
                        accessibilityRole="button"
                        accessibilityLabel={`Month ${name}`}
                        accessibilityState={{ selected }}
                        style={({ pressed }) => [
                          styles.monthChip,
                          { borderColor: selected ? colors.saffron : colors.divider, borderRadius: radii.pill },
                          selected && { backgroundColor: colors.saffronTint },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected ? colors.saffronDeep : colors.inkMuted,
                            fontFamily: fontFamilies.interSemiBold,
                            fontSize: 12,
                          }}
                        >
                          {monthLabel(index, lang).slice(0, 3)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <ScrollView style={styles.yearList} keyboardShouldPersistTaps="handled">
                {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((year) => {
                  const selected = year === visibleYear;
                  return (
                    <Pressable
                      key={year}
                      onPress={() => {
                        setVisibleYear(year);
                        setYearListOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Year ${year}`}
                      accessibilityState={{ selected }}
                      style={({ pressed }) => [
                        styles.yearRow,
                        { borderBottomColor: colors.divider },
                        selected && { backgroundColor: colors.saffronTint },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected ? colors.saffronDeep : colors.ink,
                          fontFamily: selected ? fontFamilies.interSemiBold : fontFamilies.inter,
                          fontSize: 16,
                          textAlign: 'center',
                        }}
                      >
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={styles.weekRow}>
                  {weekdays.map((day, index) => (
                    <Text key={index} style={[styles.weekday, { color: colors.inkMuted }]}>
                      {day}
                    </Text>
                  ))}
                </View>
                <View style={styles.grid}>
                  {cells.map((cell) => {
                    if (!cell.isCurrentMonth) {
                      return <View key={cell.key} style={styles.cell} />;
                    }
                    const disabled = cell.key < minDate || cell.key > resolvedMax;
                    const selected = cell.key === selectedKey;
                    return (
                      <Pressable
                        key={cell.key}
                        onPress={() => setSelectedKey(cell.key)}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled }}
                        accessibilityLabel={`${cell.date.getDate()} ${MONTHS_EN[cell.date.getMonth()]} ${cell.date.getFullYear()}`}
                        style={styles.cell}
                      >
                        <View
                          style={[
                            styles.dayPill,
                            selected && { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
                          ]}
                        >
                          <Text
                            style={{
                              color: disabled ? colors.divider : selected ? colors.saffronDeep : colors.ink,
                              fontFamily: selected ? fontFamilies.interSemiBold : fontFamilies.inter,
                              fontSize: 15,
                            }}
                          >
                            {cell.date.getDate()}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.footer}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={styles.cancel}
              >
                <Text style={{ color: colors.saffronDeep, fontFamily: fontFamilies.interSemiBold, fontSize: 14 }}>
                  {contentByLang(lang, 'रद्द करें', 'Cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!confirmable) return;
                  onSelect(selectedKey);
                  onClose();
                }}
                disabled={!confirmable}
                accessibilityRole="button"
                accessibilityLabel="Confirm date"
                style={({ pressed }) => [
                  styles.confirm,
                  { backgroundColor: colors.saffronDeep, borderRadius: radii.pill },
                  (pressed || !confirmable) && { opacity: 0.6 },
                ]}
              >
                <Text style={{ color: colors.onPrimary, fontFamily: fontFamilies.interSemiBold, fontSize: 14 }}>
                  {contentByLang(lang, 'चुनें', 'Confirm')}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { overflow: 'hidden' },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: { paddingTop: 12, paddingBottom: 8 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navArrowText: { fontSize: 26, includeFontPadding: false },
  monthTitle: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    paddingVertical: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' },
  dayPill: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 10 },
  monthChip: { minHeight: 36, minWidth: 52, paddingHorizontal: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  yearList: { maxHeight: 220 },
  yearRow: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  cancel: { minHeight: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  confirm: { minHeight: 44, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
});
