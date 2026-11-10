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
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { isLatinLang, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { useJapamAlarms, type AlarmDraft, type AlarmPatch } from '@/contexts/JapamAlarmsContext';
import { japamMantras, findJapamMantra } from '@/data/japam';
import { getJapamAudioSource } from '@assets/japam-audio';
import { useTourTarget, scrollNodeIntoView } from '@/components/tour/tourTargets';
import TimeStepper from '@/components/TimeStepper';
import {
  ALL_WEEKDAYS,
  MAX_JAPAM_ALARMS,
  dayLetters as dayLettersFor,
  describeUntilFire,
  formatTimeLabel,
  localDateKey,
  nextAlarmFireTimestamp,
  normalizeRepeatDays,
  repeatSummary,
  type JapamAlarm,
} from '@/notifications/japamAlarms';
import type { TimeOfDay } from '@/notifications/pure';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'JapamAlarms'>;

const DEFAULT_TIME: TimeOfDay = { hour: 6, minute: 0 };

// Tracking/uppercase are Latin-only affordances — on Indic scripts they split the
// shirorekha ("शि व"), so hi/gu/kn labels reset both and take their script face.
const INDIC_LABEL_RESET = { letterSpacing: 0, textTransform: 'none' } as const;

/** "Mon, 6 Jul" — the short date used by skip-next copy. Locale-formatted
 *  with a plain fallback when Intl data is unavailable. */
const DATE_LOCALE: Record<Lang, string> = { hi: 'hi-IN', en: 'en-IN', gu: 'gu-IN', kn: 'kn-IN' };

function shortDateLabel(ts: number, lang: Lang): string {
  const d = new Date(ts);
  try {
    return d.toLocaleDateString(DATE_LOCALE[lang], {
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
  const latin = isLatinLang(lang);
  const labelFont = latin ? typography.cardLatin.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
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
  const title = pick(lang, { hi: titleHi, en: titleEn, gu: 'જપ સ્મરણ', kn: 'ಜಪ ಸ್ಮರಣ' });
  // The second title line is the bilingual companion: Hindi under English, English under the rest.
  const titleCompanion = latin ? titleHi : titleEn;

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
                { color: colors.ink, fontFamily: titleFont },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.titleEn,
                {
                  color: colors.inkMuted,
                  fontFamily: fontFamilies.latinItalic,
                },
              ]}
            >
              {titleCompanion}
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
              { color: colors.inkMuted, fontFamily: bodyFont },
            ]}
          >
            {pick(lang, {
              hi: 'चुने हुए समय पर मंत्र-ध्वनि शुरू हो जायेगी।',
              en: 'Wake to the mantra you chose, at the time you chose.',
              gu: 'પસંદ કરેલા સમયે મંત્ર-ધ્વનિ શરૂ થશે.',
              kn: 'ಆಯ್ಕೆ ಮಾಡಿದ ಸಮಯದಲ್ಲಿ ಮಂತ್ರ-ಧ್ವನಿ ಆರಂಭವಾಗುತ್ತದೆ.',
            })}
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
                  { color: colors.inkSoft, fontFamily: bodyFont },
                ]}
              >
                {pick(lang, {
                  hi: 'सूचना अनुमति बंद है — सेटिंग्स में जाकर खोलें।',
                  en: 'Notifications are disabled. Tap to open Settings.',
                  gu: 'સૂચના પરવાનગી બંધ છે — સેટિંગ્સમાં જઈને ચાલુ કરો.',
                  kn: 'ಸೂಚನೆ ಅನುಮತಿ ಆಫ್ ಆಗಿದೆ — ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಆನ್ ಮಾಡಿ.',
                })}
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
                      fontFamily: bodyFont,
                    },
                  ]}
                >
                  {pick(lang, {
                    hi: 'सटीक समय पर जप अलार्म के लिए “अलार्म और रिमाइंडर” की अनुमति दें। अनुमति न होने पर अलार्म देर से बज सकता है।',
                    en: 'Allow “Alarms & reminders” for precise Japam timing. Without it, Android may delay the alarm. Tap to open Settings.',
                    gu: 'ચોક્કસ સમયે જપ અલાર્મ માટે “અલાર્મ અને રિમાઇન્ડર”ની પરવાનગી આપો. પરવાનગી ન હોય તો અલાર્મ મોડું વાગી શકે છે.',
                    kn: 'ನಿಖರ ಸಮಯದ ಜಪ ಅಲಾರಂಗಾಗಿ “ಅಲಾರಂಗಳು ಮತ್ತು ಜ್ಞಾಪನೆಗಳು” ಅನುಮತಿ ನೀಡಿ. ಅನುಮತಿ ಇಲ್ಲದಿದ್ದರೆ ಅಲಾರಂ ತಡವಾಗಿ ಮೊಳಗಬಹುದು.',
                  })}
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
                  { color: colors.ink, fontFamily: titleFont },
                ]}
              >
                {pick(lang, { hi: 'अभी कोई स्मरण नहीं', en: 'No alarms yet', gu: 'હજી કોઈ સ્મરણ નથી', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸ್ಮರಣ ಇಲ್ಲ' })}
              </Text>
              <Text
                style={[
                  styles.emptyBody,
                  { color: colors.inkMuted, fontFamily: bodyFont },
                ]}
              >
                {pick(lang, {
                  hi: 'पहला जप-स्मरण जोड़ें।',
                  en: 'Add your first Japam alarm to begin.',
                  gu: 'પહેલું જપ-સ્મરણ ઉમેરો.',
                  kn: 'ಮೊದಲ ಜಪ-ಸ್ಮರಣ ಸೇರಿಸಿ.',
                })}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {alarms.map((alarm) => (
                <AlarmRow
                  key={alarm.id}
                  alarm={alarm}
                  lang={lang}
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
              accessibilityLabel={pick(lang, { hi: 'स्मरण जोड़ें', en: 'Add alarm', gu: 'સ્મરણ ઉમેરો', kn: 'ಸ್ಮರಣ ಸೇರಿಸಿ' })}
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
                    fontFamily: labelFont,
                  },
                  !latin && INDIC_LABEL_RESET,
                ]}
              >
                {pick(lang, { hi: '+ स्मरण जोड़ें', en: '+ Add alarm', gu: '+ સ્મરણ ઉમેરો', kn: '+ ಸ್ಮರಣ ಸೇರಿಸಿ' })}
              </Text>
            </Pressable>
          ) : (
            <Text
              style={[
                styles.note,
                { color: colors.inkMuted, fontFamily: labelFont },
                !latin && INDIC_LABEL_RESET,
              ]}
            >
              {pick(lang, {
                hi: `अधिकतम ${MAX_JAPAM_ALARMS} स्मरण।`,
                en: `Up to ${MAX_JAPAM_ALARMS} alarms.`,
                gu: `વધુમાં વધુ ${MAX_JAPAM_ALARMS} સ્મરણ.`,
                kn: `ಗರಿಷ್ಠ ${MAX_JAPAM_ALARMS} ಸ್ಮರಣ.`,
              })}
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
  lang,
  nowMs,
  onPress,
  onToggle,
}: {
  alarm: JapamAlarm;
  lang: Lang;
  nowMs: number;
  onPress: () => void;
  onToggle: (next: boolean) => void;
}) {
  const { colors, typography, radii } = useTheme();
  const latin = isLatinLang(lang);
  const labelFont = latin ? typography.cardLatin.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily);
  const mantra = findJapamMantra(alarm.mantraId);
  // The a11y label stays 24 h regardless of display so tests and screen
  // readers address a stable name.
  const hh = `${alarm.time.hour}`.padStart(2, '0');
  const mm = `${alarm.time.minute}`.padStart(2, '0');

  const repeatLine = useMemo(() => {
    const parts = [repeatSummary(alarm.repeatDays, lang)];
    if (alarm.enabled) {
      const fireAt = nextAlarmFireTimestamp(alarm, new Date(nowMs));
      parts.push(describeUntilFire(fireAt, nowMs, lang));
      if (
        alarm.skipNextDate !== undefined &&
        alarm.skipNextDate >= localDateKey(new Date(nowMs))
      ) {
        const skipped = new Date(`${alarm.skipNextDate}T12:00:00`);
        const date = shortDateLabel(skipped.getTime(), lang);
        parts.push(
          pick(lang, { hi: `${date} छोड़ेंगे`, en: `skips ${date}`, gu: `${date} છોડશે`, kn: `${date} ಬಿಡಲಾಗುವುದು` })
        );
      }
    }
    return parts.join(' · ');
  }, [alarm, lang, nowMs]);

  return (
    <Pressable
      onPress={onPress}
      accessible={false}
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
      {/* Label lives on the text block, not the row Pressable: an accessible
          row container would collapse the Switch below out of the a11y tree. */}
      <View
        style={styles.rowText}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Edit alarm at ${hh}:${mm}`}
      >
        <Text
          style={[
            styles.rowTime,
            { color: colors.ink, fontFamily: typography.readerTitle.fontFamily },
          ]}
        >
          {formatTimeLabel(alarm.time)}
        </Text>
        <Text
          style={[
            styles.rowMantra,
            { color: colors.inkSoft, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) },
          ]}
          numberOfLines={1}
        >
          {mantra
            ? contentByLang(lang, mantra.nameHi, mantra.nameEn)
            : pick(lang, { hi: 'अज्ञात मंत्र', en: 'Unknown mantra', gu: 'અજ્ઞાત મંત્ર', kn: 'ಅಜ್ಞಾತ ಮಂತ್ರ' })}
        </Text>
        <Text
          style={[
            styles.rowRepeat,
            { color: colors.inkMuted, fontFamily: labelFont },
            !latin && INDIC_LABEL_RESET,
          ]}
          numberOfLines={1}
        >
          {repeatLine}
        </Text>
        {alarm.label ? (
          <Text
            style={[
              styles.rowLabel,
              { color: colors.inkMuted, fontFamily: labelFont },
              !latin && INDIC_LABEL_RESET,
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
        accessibilityLabel={pick(lang, { hi: 'स्मरण चालू / बंद', en: 'Toggle alarm', gu: 'સ્મરણ ચાલુ / બંધ', kn: 'ಸ್ಮರಣ ಆನ್ / ಆಫ್' })}
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
  const latin = isLatinLang(lang);
  const labelFont = latin ? typography.cardLatin.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  // Text that stayed in the Latin face for hi too; gu/kn need their own script face.
  const chromeFont = scriptBodyFont(lang, typography.cardLatin.fontFamily);

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
  // A stotra-paath alarm (§35.1) is not in the mantra list; edit it with its
  // own chip leading the row so the selection stays visible.
  const pickerMantras = useMemo(() => {
    const own = findJapamMantra(initial.mantraId);
    return own && !japamMantras.includes(own) ? [own, ...japamMantras] : japamMantras;
  }, [initial.mantraId]);
  const nowMs = useNowTick(30_000, visible);

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

  const dayLetters = dayLettersFor(lang);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close alarm editor"
        />
        <View
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
              { color: colors.ink, fontFamily: titleFont },
            ]}
          >
            {state?.kind === 'edit'
              ? pick(lang, { hi: 'स्मरण सम्पादन', en: 'Edit alarm', gu: 'સ્મરણ સંપાદન', kn: 'ಸ್ಮರಣ ಸಂಪಾದನೆ' })
              : pick(lang, { hi: 'नया स्मरण', en: 'New alarm', gu: 'નવું સ્મરણ', kn: 'ಹೊಸ ಸ್ಮರಣ' })}
          </Text>

          <View style={styles.editorBlock}>
            <Text
              style={[
                styles.editorLabel,
                { color: colors.inkMuted, fontFamily: labelFont },
                !latin && INDIC_LABEL_RESET,
              ]}
            >
              {pick(lang, { hi: 'समय', en: 'Time', gu: 'સમય', kn: 'ಸಮಯ' })}
            </Text>
            <TimeStepper value={time} onChange={onChangeTime} minuteStep={1} />
          </View>

          <View style={styles.editorBlock}>
            <Text
              style={[
                styles.editorLabel,
                { color: colors.inkMuted, fontFamily: labelFont },
                !latin && INDIC_LABEL_RESET,
              ]}
            >
              {pick(lang, { hi: 'दोहराव', en: 'Repeat', gu: 'પુનરાવર્તન', kn: 'ಪುನರಾವರ್ತನೆ' })}
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
                          fontFamily: chromeFont,
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
                { color: colors.inkMuted, fontFamily: chromeFont },
              ]}
            >
              {repeatSummary(repeatDaysValue, lang)}
              {isOnce
                ? pick(lang, {
                    hi: ' — बजने के बाद बंद हो जायेगा',
                    en: ' — turns off after ringing',
                    gu: ' — વાગ્યા પછી બંધ થઈ જશે',
                    kn: ' — ಮೊಳಗಿದ ನಂತರ ಆಫ್ ಆಗುತ್ತದೆ',
                  })
                : ''}
            </Text>
          </View>

          {!lockedMantra && (
            <View style={styles.editorBlock}>
              <Text
                style={[
                  styles.editorLabel,
                  { color: colors.inkMuted, fontFamily: labelFont },
                  !latin && INDIC_LABEL_RESET,
                ]}
              >
                {pick(lang, { hi: 'मंत्र', en: 'Mantra', gu: 'મંત્ર', kn: 'ಮಂತ್ರ' })}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mantraChipsRow}
              >
                {pickerMantras.map((m) => {
                  const selected = m.id === mantraId;
                  const hasAudio = getJapamAudioSource(m.id) != null;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setMantraId(m.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={contentByLang(lang, m.nameHi, m.nameEn)}
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
                            fontFamily: titleFont,
                          },
                        ]}
                      >
                        {contentByLang(lang, m.nameHi, m.nameEn)}
                      </Text>
                      {!hasAudio && (
                        <Text
                          style={[
                            styles.mantraChipSub,
                            {
                              color: colors.inkMuted,
                              fontFamily: labelFont,
                              fontStyle: latin ? 'italic' : 'normal',
                            },
                          ]}
                        >
                          {pick(lang, { hi: 'ध्वनि शीघ्र', en: 'audio soon', gu: 'ધ્વનિ ટૂંક સમયમાં', kn: 'ಧ್ವನಿ ಶೀಘ್ರದಲ್ಲೇ' })}
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
                { color: colors.inkMuted, fontFamily: labelFont },
                !latin && INDIC_LABEL_RESET,
              ]}
            >
              {pick(lang, { hi: 'नाम (वैकल्पिक)', en: 'Label (optional)', gu: 'નામ (વૈકલ્પિક)', kn: 'ಹೆಸರು (ಐಚ್ಛಿಕ)' })}
            </Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder={pick(lang, { hi: 'जैसे — ब्रह्ममुहूर्त', en: 'e.g. Brahmamuhurta', gu: 'જેમ કે — બ્રહ્મમુહૂર્ત', kn: 'ಉದಾ — ಬ್ರಹ್ಮಮುಹೂರ್ತ' })}
              placeholderTextColor={colors.inkMuted}
              maxLength={40}
              returnKeyType="done"
              accessibilityLabel={pick(lang, { hi: 'स्मरण का नाम', en: 'Alarm label', gu: 'સ્મરણનું નામ', kn: 'ಸ್ಮರಣದ ಹೆಸರು' })}
              style={[
                styles.labelInput,
                {
                  color: colors.ink,
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.sm,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                },
              ]}
            />
          </View>

          {canSkip && (
            <Pressable
              onPress={onToggleSkip}
              accessibilityRole="button"
              accessibilityState={{ selected: skipNextDate !== undefined }}
              accessibilityLabel={pick(lang, { hi: 'अगली बार छोड़ें', en: 'Skip next alarm', gu: 'આગલી વાર છોડો', kn: 'ಮುಂದಿನ ಬಾರಿ ಬಿಡಿ' })}
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
                    fontFamily: chromeFont,
                  },
                ]}
              >
                {skipNextDate !== undefined
                  ? (() => {
                      const date = shortDateLabel(new Date(`${skipNextDate}T12:00:00`).getTime(), lang);
                      return pick(lang, {
                        hi: `छोड़ेंगे: ${date} ✓`,
                        en: `Skipping ${date} ✓`,
                        gu: `છોડશે: ${date} ✓`,
                        kn: `ಬಿಡಲಾಗುವುದು: ${date} ✓`,
                      });
                    })()
                  : (() => {
                      const date = shortDateLabel(skipCandidateTs, lang);
                      return pick(lang, {
                        hi: `अगली बार छोड़ें (${date})`,
                        en: `Skip next (${date})`,
                        gu: `આગલી વાર છોડો (${date})`,
                        kn: `ಮುಂದಿನ ಬಾರಿ ಬಿಡಿ (${date})`,
                      });
                    })()}
              </Text>
            </Pressable>
          )}

          <Text
            style={[
              styles.previewText,
              { color: colors.inkSoft, fontFamily: chromeFont },
            ]}
            accessibilityLabel="Next ring preview"
          >
            {(() => {
              const at = formatTimeLabel(time);
              const until = describeUntilFire(previewFireAt, nowMs, lang);
              return pick(lang, {
                hi: `${at} — ${until} बजेगा`,
                en: `Rings ${until} — at ${at}`,
                gu: `${at} — ${until} વાગશે`,
                kn: `${at} — ${until} ಮೊಳಗುತ್ತದೆ`,
              });
            })()}
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
                  fontFamily: titleFont,
                },
              ]}
            >
              {state?.kind === 'edit'
                ? pick(lang, { hi: 'सहेजें', en: 'Save', gu: 'સાચવો', kn: 'ಉಳಿಸಿ' })
                : pick(lang, { hi: 'जोड़ें', en: 'Add', gu: 'ઉમેરો', kn: 'ಸೇರಿಸಿ' })}
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
                  { color: colors.inkMuted, fontFamily: chromeFont },
                ]}
              >
                {pick(lang, { hi: 'हटायें', en: 'Delete', gu: 'દૂર કરો', kn: 'ತೆಗೆದುಹಾಕಿ' })}
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onClose} style={styles.editorCancel} hitSlop={8}>
            <Text
              style={[
                styles.editorCancelText,
                { color: colors.inkMuted, fontFamily: chromeFont },
              ]}
            >
              {pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' })}
            </Text>
          </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.readingGutter,
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
