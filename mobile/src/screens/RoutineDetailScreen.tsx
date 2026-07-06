import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { useRoutines } from '@/contexts/RoutineContext';
import { resolveRoutineItem } from '@/data/routine/units';
import { WEEKDAY_LABELS, deityLabelForWeekday } from '@/data/routine/vaar';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineDetail'>;

export default function RoutineDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines, removeItem, deleteRoutine } = useRoutines();

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
            <Text style={{ ...typography.sectionLabel, color: colors.inkMuted, marginBottom: 8 }}>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  info: { flex: 1, minWidth: 0 },
});
