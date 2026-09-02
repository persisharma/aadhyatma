import React, { useEffect } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { useRoutines } from '@/contexts/RoutineContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { resolveRoutineItem } from '@/data/routine/units';
import { WEEKDAY_LABELS, deityLabelForWeekday } from '@/data/routine/vaar';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import TimeStepper from '@/components/TimeStepper';
import type { HomeStackParamList } from '@/navigation/types';

/** Default reminder time when the toggle first turns on — the daily-verse
 * default. A routine time is user-chosen, so a collision with another family
 * is the user's own schedule: no offset games (PRD-07 P3 §5.1). */
const DEFAULT_REMINDER = { hour: 7, minute: 0 };

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineDetail'>;

export default function RoutineDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines, removeItem, deleteRoutine, setReminder } = useRoutines();
  const { permissionStatus, canAskAgain, requestPermission } = useNotificationPreferences();

  const routine = routines.find((r) => r.id === route.params.routineId);
  const isFocused = useIsFocused();

  // Missing routine — either a stale deep-link or, more commonly, the routine
  // we just deleted. Pop back exactly once, from an effect, and only while
  // focused. Calling goBack() during render fired "Cannot update a component
  // during render" and, stacked on the delete handler's own goBack() plus the
  // sibling RoutineAddItems guard, double-popped past My Routines to the empty
  // Today screen. The focus + effect guard makes delete a single, clean pop.
  useEffect(() => {
    if (isFocused && !routine) {
      navigation.goBack();
    }
  }, [isFocused, routine, navigation]);

  if (!routine) {
    return null;
  }
  const isWeekday = routine.mode === 'weekday';

  // ---- स्मरण / Reminder (PRD-07 P3) ----
  const reminderOn = Boolean(routine.reminder);
  // The OS will not prompt again → the toggle row becomes the shared
  // settings-path banner (as on ReminderSettingsScreen); Settings is the only
  // path left.
  const permissionHardBlocked = permissionStatus === 'denied' && !canAskAgain;
  // Union of the routine's item weekdays — a weekday routine's real schedule.
  const dayUnion = isWeekday
    ? [...new Set(routine.items.flatMap((i) => i.weekdays ?? []))].sort((a, b) => a - b)
    : [];

  const onToggleReminder = async (next: boolean) => {
    if (!next) {
      // Off is a plain clear; the field's absence is the switch.
      setReminder(routine.id, undefined);
      return;
    }
    // Turning ON is the permission moment — the headless scheduler never
    // prompts. Persist only after a grant (the Pitru-Smaran honesty pattern):
    // a refusal leaves the routine saved with the toggle honestly off.
    let status = permissionStatus;
    if (status !== 'granted') {
      status = await requestPermission();
    }
    if (status === 'granted') {
      setReminder(routine.id, DEFAULT_REMINDER);
    }
  };

  const reminderCaption = !isWeekday
    ? contentByLang(lang, 'प्रतिदिन इसी समय', 'Every day at this time')
    : dayUnion.length === 0
      ? contentByLang(lang, 'कोई दिन निर्धारित नहीं — पहले सामग्री जोड़ें', 'No days scheduled — add content first')
      : contentByLang(
          lang,
          `केवल ${dayUnion.map((d) => WEEKDAY_LABELS[d].shortHi).join(' · ')} — इस साधना के दिनों पर`,
          `Only ${dayUnion.map((d) => WEEKDAY_LABELS[d].short).join(' · ')} — this sadhana's days`
        );

  return (
    <RoutineShell
      titleHi={routine.nameHi || routine.nameEn}
      titleEn={routine.nameEn || routine.nameHi}
      onBack={() => navigation.goBack()}
      right={
        <Pressable
          onPress={() => navigation.navigate('RoutineAddItems', { routineId: routine.id })}
          accessibilityRole="button"
          accessibilityLabel={pick(lang, { hi: 'जोड़ें', en: 'Add', gu: 'ઉમેરો', kn: 'ಸೇರಿಸಿ' })}
          hitSlop={12}
        >
          <Text style={{ color: colors.saffron, fontSize: 24 }}>＋</Text>
        </Pressable>
      }
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isWeekday && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ ...pillTextStyle(lang, typography.sectionLabel), color: colors.inkMuted, marginBottom: 8 }}>
              {pick(lang, { hi: 'वार · देव', en: 'Weekday · deity', gu: 'વાર · દેવ', kn: 'ವಾರ · ದೇವ' })}
            </Text>
            <View style={styles.dayStrip}>
              {WEEKDAY_LABELS.map((w, i) => (
                <View
                  key={w.short}
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    paddingHorizontal: 2,
                    borderRadius: radii.sm,
                    borderWidth: 1,
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 10, color: colors.inkMuted }}>
                    {w.short}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 10, color: colors.saffronDeep, marginTop: 2, textAlign: 'center' }}
                  >
                    {deityLabelForWeekday(i, lang)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ ...pillTextStyle(lang, typography.sectionLabel), color: colors.inkMuted, marginBottom: 8 }}>
            {pick(lang, { hi: 'स्मरण', en: 'Reminder', gu: 'સ્મરણ', kn: 'ಸ್ಮರಣ' })}
          </Text>
          <View
            style={{
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.goldTint,
              borderWidth: 1,
              borderRadius: radii.lg,
              padding: spacing.md,
            }}
          >
            {permissionHardBlocked ? (
              <Pressable
                onPress={() => Linking.openSettings().catch(() => undefined)}
                accessibilityRole="button"
                accessibilityLabel="Open system settings"
              >
                <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, lineHeight: 20, color: colors.inkSoft }}>
                  {contentByLang(lang, 'सूचनाएँ बंद हैं — Settings में सक्षम करें', 'Notifications are disabled. Tap to open Settings.')}
                </Text>
              </Pressable>
            ) : (
              <>
                <View style={styles.reminderRow}>
                  <View style={{ flex: 1, paddingRight: spacing.md }}>
                    <Text style={{ fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), fontSize: typography.cardHindi.fontSize, color: colors.ink }}>
                      {isWeekday
                        ? contentByLang(lang, 'साप्ताहिक स्मरण', 'Weekly reminder')
                        : contentByLang(lang, 'दैनिक स्मरण', 'Daily reminder')}
                    </Text>
                    <Text style={{ fontFamily: lang === 'en' ? typography.cardMeta.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: typography.cardMeta.fontSize, color: colors.inkMuted, marginTop: 2 }}>
                      {reminderOn
                        ? contentByLang(lang, 'इस साधना के लिए सूचना', 'A nudge for this sadhana')
                        : contentByLang(lang, 'बंद — चालू करने पर समय चुनें', 'Off by default — turn on to pick a time')}
                    </Text>
                  </View>
                  <Switch
                    value={reminderOn}
                    onValueChange={onToggleReminder}
                    trackColor={{ true: colors.saffron, false: colors.divider }}
                    thumbColor={colors.onPrimary}
                    ios_backgroundColor={colors.divider}
                    accessibilityLabel={pick(lang, { hi: 'साधना स्मरण चालू / बंद', en: 'Toggle routine reminder', gu: 'સાધના સ્મરણ ચાલુ / બંધ', kn: 'ಸಾಧನಾ ಸ್ಮರಣ ಆನ್ / ಆಫ್' })}
                  />
                </View>
                {routine.reminder && (
                  <View style={[styles.reminderTimeWrap, { borderTopColor: colors.divider }]}>
                    <View style={{ alignItems: 'center' }}>
                      <TimeStepper
                        value={routine.reminder}
                        onChange={(next) => setReminder(routine.id, next)}
                      />
                    </View>
                    {/* Weekday-aware caption: the fire days, or the empty-union
                        warning under which nothing is scheduled (§5.1). */}
                    <Text style={{ fontFamily: lang === 'en' ? typography.cardMeta.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: spacing.sm, textAlign: 'center' }}>
                      {reminderCaption}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {routine.items.length === 0 && (
          <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginVertical: 32 }}>
            {pick(lang, { hi: 'कोई वस्तु नहीं जोड़ी गई', en: 'No items added yet', gu: 'કોઈ વસ્તુ ઉમેરી નથી', kn: 'ಯಾವುದೇ ವಸ್ತು ಸೇರಿಸಿಲ್ಲ' })}
          </Text>
        )}

        {routine.items.map((item) => {
          const d = resolveRoutineItem(item);
          const days = isWeekday
            ? (item.weekdays ?? []).map((wd) => WEEKDAY_LABELS[wd]?.short).join(' ')
            : '';
          return (
            <View key={item.id} style={[styles.row, { borderBottomColor: colors.divider }]}>
              <Pressable style={styles.info} onPress={() => navigateToRoutineItem(navigation, item)}>
                <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 15, color: colors.ink }}>
                  {contentByLang(lang, d.titleHi, d.titleEn)}
                </Text>
                <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, marginTop: 1 }}>
                  {contentByLang(lang, d.subHi, d.subEn)}
                  {days ? ` · ${days}` : ''}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => removeItem(routine.id, item.id)}
                accessibilityRole="button"
                accessibilityLabel={pick(lang, { hi: 'हटाएँ', en: 'Remove', gu: 'દૂર કરો', kn: 'ತೆಗೆದುಹಾಕಿ' })}
                hitSlop={10}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 20 }}>×</Text>
              </Pressable>
            </View>
          );
        })}

        <RoutineButton
          label={pick(lang, { hi: 'इस साधना को हटाएँ', en: 'Delete this routine', gu: 'આ સાધના કાઢી નાખો', kn: 'ಈ ಸಾಧನೆ ಅಳಿಸಿ' })}
          variant="ghost"
          onPress={() => {
            // Don't goBack() here: deleting drops `routine` to undefined, and the
            // effect above pops once to My Routines. A goBack() here would pop a
            // second time, landing on the empty Today screen.
            deleteRoutine(routine.id);
          }}
        />
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  dayStrip: { flexDirection: 'row', gap: 4 },
  reminderRow: { flexDirection: 'row', alignItems: 'center' },
  reminderTimeWrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  info: { flex: 1, minWidth: 0 },
});
