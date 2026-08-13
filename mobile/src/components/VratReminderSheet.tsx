import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import type { VratReminderPref } from '@/contexts/VratFollowContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';

// PRD-09 §6.5 reminder sheet. Per-vrat (titleName set) or the global default
// (titleName null). Mirrors the v2 prototype: advance-notice pills, an
// on-the-day toggle, and day-of time pills.
//
// Implemented as an in-tree absolute overlay rather than a transparent RN
// <Modal>: a transparent Modal lives in a separate iOS window that the e2e
// (Maestro) accessibility snapshot can't read into, and it merges poorly for
// VoiceOver. An in-tree overlay stays in the RN view hierarchy.

type AdvanceValue = 0 | 1 | 2 | 3;

const ADVANCE_OPTIONS: { value: AdvanceValue; hi: string; en: string }[] = [
  { value: 0, hi: 'बंद', en: 'Off' },
  { value: 1, hi: '1 दिन', en: '1 day' },
  { value: 2, hi: '2 दिन', en: '2 days' },
  { value: 3, hi: '3 दिन', en: '3 days' },
];

// Day-of presets. "Sunrise" is a labelled early-morning proxy (06:00) in v1;
// true location/date-aware sunrise is a P4 follow-up.
const TIME_OPTIONS = [
  { key: '0700', hour: 7, minute: 0, en: '07:00', hi: '07:00' },
  { key: '0800', hour: 8, minute: 0, en: '08:00', hi: '08:00' },
  { key: 'sunrise', hour: 6, minute: 0, en: 'Sunrise', hi: 'सूर्योदय' },
] as const;

function timeKeyFor(t?: { hour: number; minute: number }): string {
  if (!t) return '0700';
  if (t.hour === 8) return '0800';
  if (t.hour === 6) return 'sunrise';
  return '0700';
}

export default function VratReminderSheet({
  visible,
  onClose,
  titleName,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  titleName: string | null; // null => editing the global default
  initial: VratReminderPref;
  onSave: (pref: VratReminderPref) => void;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const [advanceDays, setAdvanceDays] = useState<AdvanceValue>(initial.advanceDays);
  const [dayOf, setDayOf] = useState<boolean>(initial.dayOf);
  const [tKey, setTKey] = useState<string>(timeKeyFor(initial.dayOfTime));

  // Re-seed when (re)opened for a different target.
  useEffect(() => {
    if (visible) {
      setAdvanceDays(initial.advanceDays);
      setDayOf(initial.dayOf);
      setTKey(timeKeyFor(initial.dayOfTime));
    }
  }, [visible, initial]);

  if (!visible) return null;

  const save = () => {
    const t = TIME_OPTIONS.find((o) => o.key === tKey) ?? TIME_OPTIONS[0];
    onSave({ advanceDays, dayOf, dayOfTime: { hour: t.hour, minute: t.minute } });
    onClose();
  };

  const pillStyle = (selected: boolean, disabled?: boolean) => [
    styles.pill,
    {
      borderColor: colors.saffron,
      borderRadius: radii.pill,
      backgroundColor: selected ? colors.saffron : 'transparent',
      opacity: disabled ? 0.4 : 1,
    },
  ];
  const pillText = (selected: boolean) => ({
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
    color: selected ? colors.parchment : colors.saffronDeep,
  });
  const optLabel = { fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14, color: colors.ink };
  const optHint = { fontFamily: fontFamilies.latinItalic, fontSize: 11, color: colors.inkMuted, marginTop: 1 };

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <Pressable
        accessible={false}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.modalBackdrop }]}
        onPress={onClose}
        accessibilityLabel="Close reminders"
      />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.parchment, borderColor: colors.divider, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.divider }]} />
        <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 17, color: colors.ink }}>
          {contentByLang(lang, 'अनुस्मारक', 'Reminders')}
        </Text>
        <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkMuted, marginTop: 2, marginBottom: 14 }}>
          {titleName
            ? meaningByLang(
                lang,
                `${titleName} के लिए`,
                `For ${titleName}.`
              )
            : meaningByLang(
                lang,
                'सभी फ़ॉलो किए व्रतों के लिए डिफ़ॉल्ट',
                'Default for all followed vrats.'
              )}
        </Text>

        {/* Advance notice */}
        <View style={[styles.optRow, { borderBottomColor: colors.divider }]}>
          <View style={{ marginBottom: 8 }}>
            <Text style={optLabel}>{contentByLang(lang, 'पहले से सूचना', 'Advance notice')}</Text>
            <Text style={optHint}>{contentByLang(lang, 'दिन पहले, शाम को', 'day(s) before, evening')}</Text>
          </View>
          <View style={styles.pillRow}>
            {ADVANCE_OPTIONS.map((o) => {
              const sel = advanceDays === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setAdvanceDays(o.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={o.en}
                  style={pillStyle(sel)}
                >
                  <Text style={pillText(sel)}>{contentByLang(lang, o.hi, o.en)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* On the day */}
        <View style={[styles.optRowInline, { borderBottomColor: colors.divider }]}>
          <View>
            <Text style={optLabel}>{contentByLang(lang, 'व्रत के दिन', 'On the day')}</Text>
            <Text style={optHint}>{contentByLang(lang, 'सुबह का स्मरण', 'morning reminder')}</Text>
          </View>
          <Switch
            value={dayOf}
            onValueChange={setDayOf}
            trackColor={{ true: colors.saffron, false: colors.divider }}
            thumbColor={colors.parchment}
            accessibilityLabel={contentByLang(lang, 'व्रत के दिन', 'On the day')}
          />
        </View>

        {/* Day-of time */}
        <View style={styles.optRowLast}>
          <View style={{ marginBottom: 8 }}>
            <Text style={optLabel}>{contentByLang(lang, 'दिन का समय', 'Day-of time')}</Text>
            <Text style={optHint}>{contentByLang(lang, 'स्थानीय', 'local')}</Text>
          </View>
          <View style={styles.pillRow}>
            {TIME_OPTIONS.map((o) => {
              const sel = tKey === o.key;
              return (
                <Pressable
                  key={o.key}
                  onPress={() => setTKey(o.key)}
                  disabled={!dayOf}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  accessibilityLabel={o.en}
                  style={pillStyle(sel, !dayOf)}
                >
                  <Text style={pillText(sel)}>{contentByLang(lang, o.hi, o.en)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save reminders"
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
        >
          <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 14, color: colors.parchment }}>
            {contentByLang(lang, 'सहेजें', 'Save reminders')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { justifyContent: 'flex-end' },
  sheet: { borderTopWidth: 1, paddingHorizontal: spacing.readingGutter, paddingTop: 10, paddingBottom: 34 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 2.5, marginBottom: 12 },
  optRow: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  optRowInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  optRowLast: { paddingVertical: 14 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderWidth: 1, minHeight: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { marginTop: 12, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
});
