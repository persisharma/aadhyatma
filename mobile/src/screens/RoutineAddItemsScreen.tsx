import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';
import { useRoutines } from '@/contexts/RoutineContext';
import { library, type LibraryEntry } from '@/data/texts';
import { deityForWeekday, WEEKDAY_LABELS } from '@/data/routine/vaar';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineAddItems'>;

// Theerth (pilgrimage) entries open a map + per-temple detail, not a verse
// reader — they can't be practised as a daily-routine item, so they're excluded
// from the "Add Content" list (no Add button for theerth).
const addable: LibraryEntry[] = library.filter(
  (e) => e.status === 'active' && !e.hidden && e.category !== 'theerth',
);

export default function RoutineAddItemsScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines, addItem, removeItem } = useRoutines();

  const routine = routines.find((r) => r.id === route.params.routineId);
  const isWeekday = routine?.mode === 'weekday';
  const [day, setDay] = useState<number>(new Date().getDay());
  const suggestedDeity = deityForWeekday(day);
  const isFocused = useIsFocused();

  // If the routine vanishes (e.g. deleted from RoutineDetail while this screen is
  // still mounted underneath in the stack), pop back — but only while focused and
  // from an effect. Deleting a routine updates context and re-renders every
  // mounted routine screen; a render-time goBack() here fired "Cannot update a
  // component during render" and popped an extra screen, stranding the user on the
  // empty Today screen. The focus + effect guard makes delete a single clean pop.
  useEffect(() => {
    if (isFocused && !routine) {
      navigation.goBack();
    }
  }, [isFocused, routine, navigation]);

  if (!routine) {
    return null;
  }

  const findItem = (sourceId: string) => routine.items.find((i) => i.sourceId === sourceId);

  const toggle = (entry: LibraryEntry) => {
    const existing = findItem(entry.id);
    if (existing) {
      removeItem(routine.id, existing.id);
      return;
    }
    const isJapam = entry.category === 'japam';
    addItem(routine.id, {
      kind: isJapam ? 'japam' : 'section',
      sourceId: entry.id,
      ...(isJapam ? { targetRounds: 1 } : {}),
      ...(isWeekday ? { weekdays: [day] } : {}),
    });
  };

  // Suggested (deity-of-day) first when building a weekday routine.
  const ordered = isWeekday
    ? [...addable].sort((a, b) => {
        const as = a.deities.includes(suggestedDeity) ? 0 : 1;
        const bs = b.deities.includes(suggestedDeity) ? 0 : 1;
        return as - bs;
      })
    : addable;

  return (
    <RoutineShell
      titleHi="सामग्री जोड़ें"
      titleEn="Add Content"
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isWeekday && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ ...pillTextStyle(lang, typography.sectionLabel), color: colors.inkMuted, marginBottom: 8 }}>
              {pick(lang, { hi: 'किस दिन के लिए', en: 'For which day', gu: 'કયા દિવસ માટે', kn: 'ಯಾವ ದಿನಕ್ಕಾಗಿ' })}
            </Text>
            <View style={styles.dayStrip}>
              {WEEKDAY_LABELS.map((w, i) => (
                <Pressable
                  key={w.short}
                  onPress={() => setDay(i)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: radii.sm,
                    borderWidth: i === day ? 1.5 : 1,
                    borderColor: i === day ? colors.saffron : colors.divider,
                    backgroundColor: i === day ? colors.parchmentHighlight : colors.parchmentSoft,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 11, color: colors.inkMuted }}>
                    {w.short}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {ordered.map((entry) => {
          const added = !!findItem(entry.id);
          const suggested = isWeekday && entry.deities.includes(suggestedDeity);
          return (
            <View key={entry.id} style={[styles.row, { borderBottomColor: colors.divider }]}>
              <View style={[styles.thumb, { backgroundColor: colors.saffronTint, borderRadius: radii.sm }]}>
                <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 16, color: colors.saffronDeep }}>
                  {entry.thumb}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 14, color: colors.ink, flexShrink: 1 }}>
                    {contentByLang(lang, entry.nameHi, entry.nameEn)}
                  </Text>
                  {suggested && (
                    <View style={{ backgroundColor: colors.goldTint, borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ ...pillTextStyle(lang, typography.versePill), color: colors.saffronDeep }}>
                        {pick(lang, { hi: 'सुझाव', en: 'SUGGESTED', gu: 'સૂચન', kn: 'ಸೂಚನೆ' })}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
                  {entry.category === 'japam'
                    ? pick(lang, { hi: '1 माला · 108', en: '1 mala · 108', gu: '1 માળા · 108', kn: '1 ಮಾಲಾ · 108' })
                    : pick(lang, { hi: 'पूरा पाठ', en: 'Whole text', gu: 'આખો પાઠ', kn: 'ಸಂಪೂರ್ಣ ಪಠ್ಯ' })}
                </Text>
              </View>
              <Pressable
                onPress={() => toggle(entry)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`${added ? pick(lang, { hi: 'हटाएँ', en: 'Remove', gu: 'દૂર કરો', kn: 'ತೆಗೆದುಹಾಕಿ' }) : pick(lang, { hi: 'जोड़ें', en: 'Add', gu: 'ઉમેરો', kn: 'ಸೇರಿಸಿ' })} ${contentByLang(lang, entry.nameHi, entry.nameEn)}`}
              >
                <Text style={{ color: added ? colors.gold : colors.saffron, fontSize: 22 }}>{added ? '✓' : '＋'}</Text>
              </Pressable>
            </View>
          );
        })}

        <RoutineButton
          label={pick(lang, { hi: 'पूर्ण', en: 'Done', gu: 'પૂર્ણ', kn: 'ಮುಗಿದಿದೆ' })}
          onPress={() => navigation.navigate('RoutineToday')}
        />
        <Text
          style={{
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 11,
            color: colors.inkMuted,
            marginTop: spacing.md,
            lineHeight: 16,
          }}
        >
          {pick(lang, {
            hi: 'पूरे पाठ या जप जोड़ें। अध्याय-स्तर पर चयन शीघ्र आ रहा है।',
            en: 'Add whole texts or japa. Chapter-level selection is coming soon.',
            gu: 'આખા પાઠ કે જપ ઉમેરો. અધ્યાય-સ્તરની પસંદગી ટૂંક સમયમાં આવી રહી છે.',
            kn: 'ಸಂಪೂರ್ಣ ಪಠ್ಯ ಅಥವಾ ಜಪ ಸೇರಿಸಿ. ಅಧ್ಯಾಯ-ಮಟ್ಟದ ಆಯ್ಕೆ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ.',
          })}
        </Text>
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  dayStrip: { flexDirection: 'row', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1 },
  thumb: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
