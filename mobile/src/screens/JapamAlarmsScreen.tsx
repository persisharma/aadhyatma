import React, { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useJapamAlarms } from '@/contexts/JapamAlarmsContext';
import { japamMantras, findJapamMantra } from '@/data/japam';
import { getJapamAudioSource } from '@assets/japam-audio';
import TimeStepper from '@/components/TimeStepper';
import { MAX_JAPAM_ALARMS, type JapamAlarm } from '@/notifications/japamAlarms';
import type { TimeOfDay } from '@/notifications/pure';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'JapamAlarms'>;

const DEFAULT_TIME: TimeOfDay = { hour: 6, minute: 0 };

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
    canAdd,
    addAlarm,
    updateAlarm,
    toggleAlarm,
    removeAlarm,
  } = useJapamAlarms();

  const [editor, setEditor] = useState<EditorState>(null);
  const isHi = lang === 'hi';

  const onOpenSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

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
                  onPress={() => setEditor({ kind: 'edit', alarm })}
                  onToggle={(v) => toggleAlarm(alarm.id, v)}
                />
              ))}
            </View>
          )}

          {canAdd ? (
            <Pressable
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
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                {isHi ? '+ स्मरण जोड़ें' : '+ Add alarm'}
              </Text>
            </Pressable>
          ) : (
            <Text
              style={[
                styles.note,
                { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
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
  onPress,
  onToggle,
}: {
  alarm: JapamAlarm;
  isHi: boolean;
  onPress: () => void;
  onToggle: (next: boolean) => void;
}) {
  const { colors, typography, radii } = useTheme();
  const mantra = findJapamMantra(alarm.mantraId);
  const hh = `${alarm.time.hour}`.padStart(2, '0');
  const mm = `${alarm.time.minute}`.padStart(2, '0');

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
          {hh}:{mm}
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
        {alarm.label ? (
          <Text
            style={[
              styles.rowLabel,
              { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
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
  onCreate: (draft: { mantraId: string; time: TimeOfDay; label?: string }) => void;
  onSave: (
    id: string,
    patch: { mantraId?: string; time?: TimeOfDay; label?: string }
  ) => void;
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
  }>(() => {
    if (state?.kind === 'edit') {
      return {
        mantraId: state.alarm.mantraId,
        time: state.alarm.time,
        label: state.alarm.label ?? '',
      };
    }
    return {
      mantraId: presetMantraId ?? japamMantras[0]?.id ?? '',
      time: DEFAULT_TIME,
      label: '',
    };
  }, [state, presetMantraId]);

  const [mantraId, setMantraId] = useState(initial.mantraId);
  const [time, setTime] = useState(initial.time);

  React.useEffect(() => {
    if (state) {
      setMantraId(initial.mantraId);
      setTime(initial.time);
    }
  }, [state, initial.mantraId, initial.time]);

  const visible = state !== null;
  const lockedMantra = presetMantraId != null;

  const onConfirm = useCallback(() => {
    if (!mantraId) return;
    if (state?.kind === 'edit') {
      onSave(state.alarm.id, { mantraId, time });
    } else {
      onCreate({ mantraId, time });
    }
  }, [state, mantraId, time, onCreate, onSave]);

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
              padding: spacing.xxl,
            },
          ]}
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
                { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
              ]}
            >
              {isHi ? 'समय' : 'Time'}
            </Text>
            <TimeStepper value={time} onChange={setTime} minuteStep={5} />
          </View>

          {!lockedMantra && (
            <View style={styles.editorBlock}>
              <Text
                style={[
                  styles.editorLabel,
                  { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily },
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
                              fontFamily: typography.cardLatin.fontFamily,
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

          <Pressable
            onPress={onConfirm}
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
    borderWidth: 1,
    gap: 14,
  },
  editorTitle: { fontSize: 18, textAlign: 'center', includeFontPadding: false },
  editorBlock: { gap: 8, alignItems: 'center' },
  editorLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
    alignSelf: 'flex-start',
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
