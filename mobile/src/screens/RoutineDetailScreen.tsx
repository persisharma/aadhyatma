import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutines } from '@/contexts/RoutineContext';
import { resolveRoutineItem } from '@/data/routine/units';
import { WEEKDAY_LABELS, deityForWeekday } from '@/data/routine/vaar';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import { deities as deityMeta } from '@/data/deities';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineDetail'>;

export default function RoutineDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines, removeItem, deleteRoutine } = useRoutines();
  const isHi = lang === 'hi';

  const routine = routines.find((r) => r.id === route.params.routineId);
  if (!routine) {
    navigation.goBack();
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
          accessibilityLabel={isHi ? 'जोड़ें' : 'Add'}
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
              {isHi ? 'वार · देव' : 'Weekday · deity'}
            </Text>
            <View style={styles.dayStrip}>
              {WEEKDAY_LABELS.map((w, i) => {
                const dMeta = deityMeta.find((d) => d.id === deityForWeekday(i));
                return (
                  <View
                    key={w.short}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
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
                    <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 11, color: colors.saffronDeep, marginTop: 2 }}>
                      {(isHi ? dMeta?.nameHi : dMeta?.nameEn)?.replace(/^(श्री |माँ |Shri |Maa )/, '').slice(0, 6) ?? ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {routine.items.length === 0 && (
          <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginVertical: 32 }}>
            {isHi ? 'कोई वस्तु नहीं जोड़ी गई' : 'No items added yet'}
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
                  {isHi ? d.titleHi : d.titleEn}
                </Text>
                <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, marginTop: 1 }}>
                  {isHi ? d.subHi : d.subEn}
                  {days ? ` · ${days}` : ''}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => removeItem(routine.id, item.id)}
                accessibilityRole="button"
                accessibilityLabel={isHi ? 'हटाएँ' : 'Remove'}
                hitSlop={10}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 20 }}>×</Text>
              </Pressable>
            </View>
          );
        })}

        <RoutineButton
          label={isHi ? 'इस साधना को हटाएँ' : 'Delete this routine'}
          variant="ghost"
          onPress={() => {
            deleteRoutine(routine.id);
            navigation.goBack();
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
