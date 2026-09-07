import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
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
// Rendered in a native Modal so callers nested inside a ScrollView cannot place
// the sheet at the bottom of the scroll content, outside the visible viewport.
//
// PRD-16 §6.7 reuses this sheet for muhurat follows rather than forking it
// (§7/§9, RULEBOOK §9). A muhurat is a TIME, not a day, so the caller may pass
// its own `dayOfOptions` (adding the window-anchored choice), a `subtitle`
// naming the specific day, a `dayOfLabel`, and a `footnote` explaining the
// clamp. Everything else — layout, pills, switch, save — is shared.

type AdvanceValue = 0 | 1 | 2 | 3;

const ADVANCE_OPTIONS: { value: AdvanceValue; hi: string; en: string }[] = [
  { value: 0, hi: 'बंद', en: 'Off' },
  { value: 1, hi: '1 दिन', en: '1 day' },
  { value: 2, hi: '2 दिन', en: '2 days' },
  { value: 3, hi: '3 दिन', en: '3 days' },
];

/**
 * One day-of choice. `atWindow` marks the muhurat-only option that anchors the
 * notice to the day's best window instead of a wall-clock time; the vrat sheet
 * never passes it, so its behaviour is unchanged.
 */
export type DayOfOption = {
  key: string;
  hour: number;
  minute: number;
  hi: string;
  en: string;
  atWindow?: boolean;
};

// Vrat day-of presets. "Sunrise" is a labelled early-morning proxy (06:00) in
// v1; true location/date-aware sunrise is a P4 follow-up.
const TIME_OPTIONS: readonly DayOfOption[] = [
  { key: '0700', hour: 7, minute: 0, en: '07:00', hi: '07:00' },
  { key: '0800', hour: 8, minute: 0, en: '08:00', hi: '08:00' },
  { key: 'sunrise', hour: 6, minute: 0, en: 'Sunrise', hi: 'सूर्योदय' },
] as const;

function timeKeyFor(options: readonly DayOfOption[], pref: VratReminderPref): string {
  if ((pref as { dayOfAtWindow?: boolean }).dayOfAtWindow) {
    const w = options.find((o) => o.atWindow);
    if (w) return w.key;
  }
  const t = pref.dayOfTime;
  if (!t) return options[0].key;
  const exact = options.find((o) => !o.atWindow && o.hour === t.hour && o.minute === t.minute);
  return exact ? exact.key : options.find((o) => !o.atWindow)?.key ?? options[0].key;
}

export default function VratReminderSheet({
  visible,
  onClose,
  titleName,
  subtitle,
  initial,
  onSave,
  dayOfOptions = TIME_OPTIONS,
  dayOfLabel,
  footnote,
  testID,
}: {
  visible: boolean;
  onClose: () => void;
  titleName: string | null; // null => editing the global default
  /** Overrides the derived "for X" line — e.g. a muhurat's date + window. */
  subtitle?: string;
  initial: VratReminderPref;
  onSave: (pref: VratReminderPref) => void;
  dayOfOptions?: readonly DayOfOption[];
  /** Overrides the "व्रत के दिन / On the day" row label. */
  dayOfLabel?: { hi: string; en: string };
  /** Quiet line under the save button — the muhurat sheet explains the clamp. */
  footnote?: string;
  testID?: string;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const [advanceDays, setAdvanceDays] = useState<AdvanceValue>(initial.advanceDays);
  const [dayOf, setDayOf] = useState<boolean>(initial.dayOf);
  const [tKey, setTKey] = useState<string>(timeKeyFor(dayOfOptions, initial));

  // Re-seed when (re)opened for a different target.
  useEffect(() => {
    if (visible) {
      setAdvanceDays(initial.advanceDays);
      setDayOf(initial.dayOf);
      setTKey(timeKeyFor(dayOfOptions, initial));
    }
  }, [visible, initial, dayOfOptions]);

  if (!visible) return null;

  const save = () => {
    const t = dayOfOptions.find((o) => o.key === tKey) ?? dayOfOptions[0];
    onSave({
      advanceDays,
      dayOf,
      dayOfTime: { hour: t.hour, minute: t.minute },
      // Only ever set for callers that passed a window option, so the vrat
      // sheet's saved pref shape is byte-for-byte what it was.
      ...(dayOfOptions.some((o) => o.atWindow) ? { dayOfAtWindow: Boolean(t.atWindow) } : {}),
    } as VratReminderPref);
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
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
    <View style={[StyleSheet.absoluteFill, styles.overlay]} testID={testID}>
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
          {subtitle
            ? subtitle
            : titleName
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
            <Text style={optLabel}>
              {contentByLang(lang, dayOfLabel?.hi ?? 'व्रत के दिन', dayOfLabel?.en ?? 'On the day')}
            </Text>
            <Text style={optHint}>{contentByLang(lang, 'सुबह का स्मरण', 'morning reminder')}</Text>
          </View>
          <Switch
            testID="reminder-sheet-day-of"
            value={dayOf}
            onValueChange={setDayOf}
            trackColor={{ true: colors.saffron, false: colors.divider }}
            thumbColor={colors.parchment}
            accessibilityLabel={contentByLang(lang, dayOfLabel?.hi ?? 'व्रत के दिन', dayOfLabel?.en ?? 'On the day')}
          />
        </View>

        {/* Day-of time */}
        <View style={styles.optRowLast}>
          <View style={{ marginBottom: 8 }}>
            <Text style={optLabel}>{contentByLang(lang, 'दिन का समय', 'Day-of time')}</Text>
            <Text style={optHint}>{contentByLang(lang, 'स्थानीय', 'local')}</Text>
          </View>
          <View style={styles.pillRow}>
            {dayOfOptions.map((o) => {
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
          testID="reminder-sheet-save"
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
        >
          <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 14, color: colors.parchment }}>
            {contentByLang(lang, 'सहेजें', 'Save reminders')}
          </Text>
        </Pressable>
        {footnote ? (
          <Text
            style={{
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 11.5,
              color: colors.inkMuted,
              textAlign: 'center',
              lineHeight: 18,
              marginTop: 10,
            }}
          >
            {footnote}
          </Text>
        ) : null}
      </View>
    </View>
    </Modal>
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
