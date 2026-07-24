import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useJapamAlarms, type AlarmDraft, type AlarmPatch } from '@/contexts/JapamAlarmsContext';
import { japamMantras, findJapamMantra } from '@/data/japam';
import { getJapamAudioSource } from '@assets/japam-audio';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';
import TimeStepper from '@/components/TimeStepper';
import {
  ALL_WEEKDAYS,
  DAY_LETTERS_EN,
  DAY_LETTERS_HI,
  MAX_JAPAM_ALARMS,
  describeUntilFire,
  formatTimeLabel,
  localDateKey,
  nextAlarmFireTimestamp,
  normalizeRepeatDays,
  prefers12HourClock,
  repeatSummary,
  type JapamAlarm,
} from '@/notifications/japamAlarms';
import type { TimeOfDay } from '@/notifications/pure';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'JapamAlarms'>;

const DEFAULT_TIME: TimeOfDay = { hour: 6, minute: 0 };

// Tracking/uppercase are Latin-only affordances — on Devanagari they split the
// shirorekha ("शि व"), so Hindi labels reset both and take the Devanagari face.
const INDIC_LABEL_RESET = { letterSpacing: 0, textTransform: 'none' } as const;

/** "Mon, 6 Jul" — the short date used by skip-next copy. Locale-formatted
 *  with a plain fallback when Intl data is unavailable. */
function shortDateLabel(ts: number, isHi: boolean): string {
  const d = new Date(ts);
  try {
    return d.toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return localDateKey(d);
  }
}

/** Re-render dependency that advances every `ms` — keeps "rings in …"
 *  countdowns fresh while a screen or sheet is on screen. `enabled: false`
 *  stops the interval (e.g. while the editor modal is closed). */
function useNowTick(ms: number, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
  return now;
}

type EditorState =
  | { kind: 'new' }
  | { kind: 'edit'; alarm: JapamAlarm }
  | null;

export default function JapamAlarmsScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const {
    alarms,
    permissionStatus,
    exactAlarmStatus,
    canAdd,
    addAlarm,
    updateAlarm,
    toggleAlarm,
    removeAlarm,
    openExactAlarmSettings,
  } = useJapamAlarms();

  // Feature-tour anchor (design.md §47): the "+ Add alarm" button — the last
  // scroll child, so scroll it into view before the tour measures it.
  const alarmsScrollRef = React.useRef<ScrollView>(null);
  const japamAddRef = useTourTarget('japamAdd', (ref) => scrollNodeIntoView(alarmsScrollRef, ref));

  const [editor, setEditor] = useState<EditorState>(null);
  const isHi = lang === 'hi';
  const use12h = useMemo(() => prefers12HourClock(), []);
  // Countdowns only render on enabled rows — no interval when nothing ticks.
  const nowMs = useNowTick(30_000, alarms.some((a) => a.enabled));

  const onOpenSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);
  const onOpenExactAlarmSettings = useCallback(() => {
    openExactAlarmSettings().catch(() => undefined);
  }, [openExactAlarmSettings]);

  const titleHi = 'जप स्मरण';
  const titleEn = 'Japam Alarms';
  const subHi = 'चुने हुए समय पर मंत्र-ध्वनि शुरू हो जायेगी।';
  const subEn = 'Wake to the mantra you chose, at the time you chose.';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.back,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
          </Pressable>
          <View style={styles.titleBlock}>
            <Text
              style={[
                styles.titleHi,
                { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
              ]}
            >
              {isHi ? titleHi : titleEn}
            </Text>
            <Text
              style={[
                styles.titleEn,
                {
                  color: colors.inkMuted,
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                },
              ]}
            >
              {isHi ? titleEn : titleHi}
            </Text>
          </View>
          <View style={styles.backSpacer} />
        </View>

        <ScrollView
          ref={alarmsScrollRef}
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.intro,
              { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
            ]}
          >
            {isHi ? subHi : subEn}
          </Text>

          {permissionStatus === 'denied' && (
            <Pressable
              onPress={onOpenSystemSettings}
              accessibilityRole="button"
              accessibilityLabel="Open system settings"
              style={({ pressed }) => [
                styles.permissionBanner,
                {
                  backgroundColor: colors.parchmentDeep,
                  borderColor: colors.divider,
                  borderRadius: radii.sm,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.permissionText,
                  { color: colors.inkSoft, fontFamily: typography.meaning.fontFamily },
                ]}
              >
                {isHi
                  ? 'सूचना अनुमति बंद है — सेटिंग्स में जाकर खोलें।'
                  : 'Notifications are disabled. Tap to open Settings.'}
              </Text>
            </Pressable>
          )}

          {permissionStatus === 'granted' &&
            exactAlarmStatus === 'needs-permission' &&
            alarms.some((alarm) => alarm.enabled) && (
              <Pressable
                onPress={onOpenExactAlarmSettings}
                accessibilityRole="button"
                accessibilityLabel="Allow precise alarm timing"
                style={({ pressed }) => [
                  styles.permissionBanner,
                  {
                    backgroundColor: colors.parchmentDeep,
                    borderColor: colors.divider,
                    borderRadius: radii.sm,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.permissionText,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.meaning.fontFamily,
                    },
                  ]}
                >
                  {isHi
                    ? 'सटीक समय पर जप अलार्म के लिए “अलार्म और रिमाइंडर” की अनुमति दें। अनुमति न होने पर अलार्म देर से बज सकता है।'
                    : 'Allow “Alarms & reminders” for precise Japam timing. Without it, Android may delay the alarm. Tap to open Settings.'}
                </Text>
              </Pressable>
            )}

          {alarms.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
                ]}
              >
                {isHi ? 'अभी कोई स्मरण नहीं' : 'No alarms yet'}
              </Text>
              <Text
                style={[
                  styles.emptyBody,
                  { color: colors.inkMuted, fontFamily: typography.meaning.fontFamily },
                ]}
              >
                {isHi
                  ? 'पहला जप-स्मरण जोड़ें।'
                  : 'Add your first Japam alarm to begin.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {alarms.map((alarm) => (
                <AlarmRow
                  key={alarm.id}
                  alarm={alarm}
                  isHi={isHi}
                  use12h={use12h}
                  nowMs={nowMs}
                  onPress={() => setEditor({ kind: 'edit', alarm })}
                  onToggle={(v) => toggleAlarm(alarm.id, v)}
                />
              ))}
            </View>
          )}

          {canAdd ? (
            <Pressable
              ref={japamAddRef}
              collapsable={false}
              onPress={() => setEditor({ kind: 'new' })}
              accessibilityRole="button"
              accessibilityLabel={isHi ? 'स्मरण जोड़ें' : 'Add alarm'}
              style={({ pressed }) => [
                styles.addBtn,
                {
                  borderColor: colors.saffron,
                  borderRadius: radii.sm,
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.addBtnText,
                  {
                    color: colors.saffronDeep,
                    fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily,
                  },
                  isHi && INDIC_LABEL_RESET,
                ]}
              >
                {isHi ? '+ स्मरण जोड़ें' : '+ Add alarm'}
              </Text>
            </Pressable>
          ) : (
            <Text
              style={[
                styles.note,
                { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
                isHi && INDIC_LABEL_RESET,
              ]}
            >
              {isHi
                ? `अधिकतम ${MAX_JAPAM_ALARMS} स्मरण।`
                : `Up to ${MAX_JAPAM_ALARMS} alarms.`}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>

      <AlarmEditorSheet
        state={editor}
        onClose={() => setEditor(null)}
        onCreate={async (draft) => {
          await addAlarm(draft);
          setEditor(null);
        }}
        onSave={async (id, patch) => {
          await updateAlarm(id, patch);
          setEditor(null);
        }}
        onDelete={async (id) => {
          await removeAlarm(id);
          setEditor(null);
        }}
      />
    </View>
  );
}

function AlarmRow({
  alarm,
  isHi,
  use12h,
  nowMs,
  onPress,
  onToggle,
}: {
  alarm: JapamAlarm;
  isHi: boolean;
  use12h: boolean;
  nowMs: number;
  onPress: () => void;
  onToggle: (next: boolean) => void;
}) {
  const { colors, typography, radii } = useTheme();
  const mantra = findJapamMantra(alarm.mantraId);
  // The a11y label stays 24 h regardless of display so tests and screen
  // readers address a stable name.
  const hh = `${alarm.time.hour}`.padStart(2, '0');
  const mm = `${alarm.time.minute}`.padStart(2, '0');

  const repeatLine = useMemo(() => {
    const parts = [repeatSummary(alarm.repeatDays, isHi)];
    if (alarm.enabled) {
      const fireAt = nextAlarmFireTimestamp(alarm, new Date(nowMs));
      parts.push(describeUntilFire(fireAt, nowMs, isHi));
      if (
        alarm.skipNextDate !== undefined &&
        alarm.skipNextDate >= localDateKey(new Date(nowMs))
      ) {
        const skipped = new Date(`${alarm.skipNextDate}T12:00:00`);
        parts.push(
          isHi
            ? `${shortDateLabel(skipped.getTime(), true)} छोड़ेंगे`
            : `skips ${shortDateLabel(skipped.getTime(), false)}`
        );
      }
    }
    return parts.join(' · ');
  }, [alarm, isHi, nowMs]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Edit alarm at ${hh}:${mm}`}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.lg,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowTime,
            { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
          ]}
        >
          {formatTimeLabel(alarm.time, use12h)}
        </Text>
        <Text
          style={[
            styles.rowMantra,
            { color: colors.inkSoft, fontFamily: typography.meaning.fontFamily },
          ]}
          numberOfLines={1}
        >
          {mantra
            ? isHi
              ? mantra.nameHi
              : mantra.nameEn
            : isHi
              ? 'अज्ञात मंत्र'
              : 'Unknown mantra'}
        </Text>
        <Text
          style={[
            styles.rowRepeat,
            { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
            isHi && INDIC_LABEL_RESET,
          ]}
          numberOfLines={1}
        >
          {repeatLine}
        </Text>
        {alarm.label ? (
          <Text
            style={[
              styles.rowLabel,
              { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
              isHi && INDIC_LABEL_RESET,
            ]}
            numberOfLines={1}
          >
            {alarm.label}
          </Text>
        ) : null}
      </View>
      <Switch
        value={alarm.enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.divider, true: colors.saffron }}
        thumbColor={colors.parchment}
        ios_backgroundColor={colors.divider}
        accessibilityLabel={isHi ? 'स्मरण चालू / बंद' : 'Toggle alarm'}
      />
    </Pressable>
  );
}

/** Shared editor sheet — used by JapamAlarmsScreen and by JapamCounter's
 *  inline "set alarm for this mantra" entry-point (presetMantraId locks
 *  the mantra picker). */
type EditorProps = {
  state: EditorState;
  presetMantraId?: string;
  onClose: () => void;
  onCreate: (draft: AlarmDraft) => void;
  onSave: (id: string, patch: AlarmPatch) => void;
  onDelete?: (id: string) => void;
};

export function AlarmEditorSheet({
  state,
  presetMantraId,
  onClose,
  onCreate,
  onSave,
  onDelete,
}: EditorProps) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const isHi = lang === 'hi';

  const initial = useMemo<{
    mantraId: string;
    time: TimeOfDay;
    label: string;
    days: number[];
    skipNextDate: string | undefined;
  }>(() => {
    if (state?.kind === 'edit') {
      return {
        mantraId: state.alarm.mantraId,
        time: state.alarm.time,
        label: state.alarm.label ?? '',
        days: state.alarm.repeatDays ?? [...ALL_WEEKDAYS],
        skipNextDate: state.alarm.skipNextDate,
      };
    }
    return {
      mantraId: presetMantraId ?? japamMantras[0]?.id ?? '',
      time: DEFAULT_TIME,
      label: '',
      days: [...ALL_WEEKDAYS],
      skipNextDate: undefined,
    };
  }, [state, presetMantraId]);

  const [mantraId, setMantraId] = useState(initial.mantraId);
  const [time, setTime] = useState(initial.time);
  const [label, setLabel] = useState(initial.label);
  // Concrete weekday selection: all 7 = daily, none = once.
  const [days, setDays] = useState<number[]>(initial.days);
  const [skipNextDate, setSkipNextDate] = useState<string | undefined>(
    initial.skipNextDate
  );

  React.useEffect(() => {
    if (state) {
      setMantraId(initial.mantraId);
      setTime(initial.time);
      setLabel(initial.label);
      setDays(initial.days);
      setSkipNextDate(initial.skipNextDate);
    }
  }, [state, initial]);

  const visible = state !== null;
  const lockedMantra = presetMantraId != null;
  const nowMs = useNowTick(30_000, visible);
  const use12h = useMemo(() => prefers12HourClock(), []);

  const repeatDaysValue = useMemo(
    () => (days.length === 7 ? undefined : normalizeRepeatDays(days)),
    [days]
  );

  const toggleDay = useCallback((day: number) => {
    // A changed pattern redefines which occurrence is "next" — drop any skip.
    setSkipNextDate(undefined);
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const onChangeTime = useCallback((next: TimeOfDay) => {
    setSkipNextDate(undefined);
    setTime(next);
  }, []);

  // Next fire (with the pending skip) drives the "rings in …" preview; the
  // next fire WITHOUT it is the occurrence the skip button offers to skip.
  const previewFireAt = useMemo(
    () =>
      nextAlarmFireTimestamp(
        { time, repeatDays: repeatDaysValue, skipNextDate },
        new Date(nowMs)
      ),
    [time, repeatDaysValue, skipNextDate, nowMs]
  );
  const skipCandidateTs = useMemo(
    () =>
      nextAlarmFireTimestamp(
        { time, repeatDays: repeatDaysValue },
        new Date(nowMs)
      ),
    [time, repeatDaysValue, nowMs]
  );

  const isOnce = days.length === 0;
  const canSkip = state?.kind === 'edit' && !isOnce;

  const onToggleSkip = useCallback(() => {
    setSkipNextDate((cur) =>
      cur !== undefined ? undefined : localDateKey(new Date(skipCandidateTs))
    );
  }, [skipCandidateTs]);

  const onConfirm = useCallback(() => {
    if (!mantraId) return;
    if (state?.kind === 'edit') {
      onSave(state.alarm.id, {
        mantraId,
        time,
        label,
        repeatDays: repeatDaysValue ?? null,
        skipNextDate: skipNextDate ?? null,
      });
    } else {
      onCreate({
        mantraId,
        time,
        ...(label.trim() ? { label: label.trim() } : {}),
        ...(repeatDaysValue !== undefined ? { repeatDays: repeatDaysValue } : {}),
      });
    }
  }, [state, mantraId, time, label, repeatDaysValue, skipNextDate, onCreate, onSave]);

  const dayLetters = isHi ? DAY_LETTERS_HI : DAY_LETTERS_EN;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.editorCard,
            {
              backgroundColor: colors.parchment,
              borderColor: colors.cardActiveBorder,
              borderRadius: radii.lg,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={[styles.editorScroll, { padding: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <Text
            style={[
              styles.editorTitle,
              { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
            ]}
          >
            {state?.kind === 'edit'
              ? isHi
                ? 'स्मरण सम्पादन'
                : 'Edit alarm'
              : isHi
                ? 'नया स्मरण'
                : 'New alarm'}
          </Text>

          <View style={styles.editorBlock}>
            <Text
              style={[
                styles.editorLabel,
                { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
                isHi && INDIC_LABEL_RESET,
              ]}
            >
              {isHi ? 'समय' : 'Time'}
            </Text>
            <TimeStepper value={time} onChange={onChangeTime} minuteStep={1} />
          </View>

          <View style={styles.editorBlock}>
            <Text
              style={[
                styles.editorLabel,
                { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
                isHi && INDIC_LABEL_RESET,
              ]}
            >
              {isHi ? 'दोहराव' : 'Repeat'}
            </Text>
            <View style={styles.dayChipsRow}>
              {ALL_WEEKDAYS.map((day) => {
                const selected = days.includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`Repeat ${
                      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
                    }`}
                    hitSlop={4}
                    style={({ pressed }) => [
                      styles.dayChip,
                      {
                        borderColor: selected ? colors.saffron : colors.divider,
                        backgroundColor: selected
                          ? 'rgba(184, 98, 27, 0.10)'
                          : colors.parchmentSoft,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        {
                          color: selected ? colors.saffronDeep : colors.inkMuted,
                          fontFamily: typography.cardLatin.fontFamily,
                        },
                      ]}
                    >
                      {dayLetters[day]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text
              style={[
                styles.repeatSummary,
                { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
              ]}
            >
              {repeatSummary(repeatDaysValue, isHi)}
              {isOnce
                ? isHi
                  ? ' — बजने के बाद बंद हो जायेगा'
                  : ' — turns off after ringing'
                : ''}
            </Text>
          </View>

          {!lockedMantra && (
            <View style={styles.editorBlock}>
              <Text
                style={[
                  styles.editorLabel,
                  { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
                  isHi && INDIC_LABEL_RESET,
                ]}
              >
                {isHi ? 'मंत्र' : 'Mantra'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mantraChipsRow}
              >
                {japamMantras.map((m) => {
                  const selected = m.id === mantraId;
                  const hasAudio = getJapamAudioSource(m.id) != null;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setMantraId(m.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={isHi ? m.nameHi : m.nameEn}
                      style={({ pressed }) => [
                        styles.mantraChip,
                        {
                          borderColor: selected
                            ? colors.saffron
                            : colors.divider,
                          backgroundColor: selected
                            ? 'rgba(184, 98, 27, 0.10)'
                            : colors.parchmentSoft,
                          borderRadius: radii.sm,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.mantraChipText,
                          {
                            color: selected ? colors.saffronDeep : colors.ink,
                            fontFamily: typography.readerTitle.fontFamily,
                          },
                        ]}
                      >
                        {isHi ? m.nameHi : m.nameEn}
                      </Text>
                      {!hasAudio && (
                        <Text
                          style={[
                            styles.mantraChipSub,
                            {
                              color: colors.inkMuted,
                              fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily,
                              fontStyle: isHi ? 'normal' : 'italic',
                            },
                          ]}
                        >
                          {isHi ? 'ध्वनि शीघ्र' : 'audio soon'}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.editorBlock}>
            <Text
              style={[
                styles.editorLabel,
                { color: colors.inkMuted, fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily },
                isHi && INDIC_LABEL_RESET,
              ]}
            >
              {isHi ? 'नाम (वैकल्पिक)' : 'Label (optional)'}
            </Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder={isHi ? 'जैसे — ब्रह्ममुहूर्त' : 'e.g. Brahmamuhurta'}
              placeholderTextColor={colors.inkMuted}
              maxLength={40}
              returnKeyType="done"
              accessibilityLabel={isHi ? 'स्मरण का नाम' : 'Alarm label'}
              style={[
                styles.labelInput,
                {
                  color: colors.ink,
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.sm,
                  fontFamily: typography.meaning.fontFamily,
                },
              ]}
            />
          </View>

          {canSkip && (
            <Pressable
              onPress={onToggleSkip}
              accessibilityRole="button"
              accessibilityState={{ selected: skipNextDate !== undefined }}
              accessibilityLabel={isHi ? 'अगली बार छोड़ें' : 'Skip next alarm'}
              style={({ pressed }) => [
                styles.skipBtn,
                {
                  borderColor:
                    skipNextDate !== undefined ? colors.saffron : colors.divider,
                  backgroundColor:
                    skipNextDate !== undefined
                      ? 'rgba(184, 98, 27, 0.10)'
                      : colors.parchmentSoft,
                  borderRadius: radii.sm,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.skipBtnText,
                  {
                    color:
                      skipNextDate !== undefined
                        ? colors.saffronDeep
                        : colors.inkSoft,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                {skipNextDate !== undefined
                  ? isHi
                    ? `छोड़ेंगे: ${shortDateLabel(
                        new Date(`${skipNextDate}T12:00:00`).getTime(),
                        true
                      )} ✓`
                    : `Skipping ${shortDateLabel(
                        new Date(`${skipNextDate}T12:00:00`).getTime(),
                        false
                      )} ✓`
                  : isHi
                    ? `अगली बार छोड़ें (${shortDateLabel(skipCandidateTs, true)})`
                    : `Skip next (${shortDateLabel(skipCandidateTs, false)})`}
              </Text>
            </Pressable>
          )}

          <Text
            style={[
              styles.previewText,
              { color: colors.inkSoft, fontFamily: typography.cardLatin.fontFamily },
            ]}
            accessibilityLabel="Next ring preview"
          >
            {isHi
              ? `${formatTimeLabel(time, use12h)} — ${describeUntilFire(previewFireAt, nowMs, true)} बजेगा`
              : `Rings ${describeUntilFire(previewFireAt, nowMs, false)} — at ${formatTimeLabel(time, use12h)}`}
          </Text>

          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm alarm"
            style={({ pressed }) => [
              styles.editorPrimary,
              {
                backgroundColor: colors.saffron,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.editorPrimaryText,
                {
                  color: colors.onPrimary,
                  fontFamily: typography.readerTitle.fontFamily,
                },
              ]}
            >
              {state?.kind === 'edit'
                ? isHi
                  ? 'सहेजें'
                  : 'Save'
                : isHi
                  ? 'जोड़ें'
                  : 'Add'}
            </Text>
          </Pressable>

          {state?.kind === 'edit' && onDelete && (
            <Pressable
              onPress={() => onDelete(state.alarm.id)}
              style={styles.editorDelete}
              hitSlop={8}
            >
              <Text
                style={[
                  styles.editorDeleteText,
                  { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
                ]}
              >
                {isHi ? 'हटायें' : 'Delete'}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onClose} style={styles.editorCancel} hitSlop={8}>
            <Text
              style={[
                styles.editorCancelText,
                { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
              ]}
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </Text>
          </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
    includeFontPadding: false,
  },
  backSpacer: { width: 44, height: 44 },
  titleBlock: { flex: 1, alignItems: 'center' },
  titleHi: { fontSize: 18, textAlign: 'center', includeFontPadding: false },
  titleEn: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  scroll: { paddingTop: 6, gap: 14 },
  intro: {
    fontSize: 13,
    lineHeight: 20,
    includeFontPadding: false,
    marginTop: 2,
  },
  list: { gap: 10 },
  row: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: { flex: 1, gap: 2 },
  rowTime: { fontSize: 28, includeFontPadding: false },
  rowMantra: { fontSize: 14, includeFontPadding: false },
  rowRepeat: { fontSize: 11, letterSpacing: 0.4, includeFontPadding: false },
  rowLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    includeFontPadding: false,
    marginTop: 2,
  },
  emptyCard: {
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: { fontSize: 16, includeFontPadding: false },
  emptyBody: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
  },
  addBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  permissionBanner: { padding: 12, borderWidth: 1 },
  permissionText: { fontSize: 13, lineHeight: 20, includeFontPadding: false },
  note: {
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 6,
    includeFontPadding: false,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  editorCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '88%',
    borderWidth: 1,
  },
  editorScroll: { gap: 14 },
  editorTitle: { fontSize: 18, textAlign: 'center', includeFontPadding: false },
  editorBlock: { gap: 8, alignItems: 'center' },
  editorLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
    alignSelf: 'flex-start',
  },
  dayChipsRow: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: { fontSize: 13, includeFontPadding: false },
  repeatSummary: {
    fontSize: 11,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  labelInput: {
    alignSelf: 'stretch',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 44,
  },
  skipBtn: {
    alignSelf: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 40,
    justifyContent: 'center',
  },
  skipBtnText: { fontSize: 12, includeFontPadding: false },
  previewText: {
    fontSize: 12,
    textAlign: 'center',
    includeFontPadding: false,
  },
  mantraChipsRow: { gap: 8, paddingVertical: 2 },
  mantraChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  mantraChipText: { fontSize: 14, includeFontPadding: false },
  mantraChipSub: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
    includeFontPadding: false,
  },
  editorPrimary: {
    marginTop: 6,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorPrimaryText: { fontSize: 15, includeFontPadding: false },
  editorDelete: {
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorDeleteText: {
    fontSize: 13,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  editorCancel: {
    paddingVertical: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorCancelText: { fontSize: 13, fontStyle: 'italic', opacity: 0.85 },
});
