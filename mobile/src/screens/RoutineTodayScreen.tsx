import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutines } from '@/contexts/RoutineContext';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { practiceSummary, offeredTail } from '@/data/routine/practiceView';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import MalaStreak from '@/components/MalaStreak';
import PracticeSeal from '@/components/PracticeSeal';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineToday'>;

export default function RoutineTodayScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { markManualDone, unmarkManualDone } = useRoutines();
  const { currentStreak } = useUserActivity();
  const { entries, doneCount, total, hasRoutine } = useRoutineToday();
  // General-typed nav for the centralized routing helper (this screen has no
  // route params, which is incompatible with the helper's route-agnostic Nav).
  const itemNav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const isHi = lang === 'hi';
  const streak = currentStreak();
  const summary = practiceSummary(doneCount, total, isHi);
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const right = (
    <Pressable
      onPress={() => navigation.navigate('RoutineList')}
      accessibilityRole="button"
      accessibilityLabel={isHi ? 'सभी साधनाएँ' : 'All routines'}
      hitSlop={12}
    >
      <Text style={{ color: colors.saffron, fontSize: 22 }}>≡</Text>
    </Pressable>
  );

  return (
    <RoutineShell
      titleHi="आज की साधना"
      titleEn="Today's Practice"
      onBack={() => navigation.goBack()}
      right={right}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {!hasRoutine || total === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.goldTint,
                borderRadius: radii.lg,
              },
              elevation.card,
            ]}
          >
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 30, color: colors.inkMuted, opacity: 0.4 }}>
              ॥
            </Text>
            <Text
              style={{
                fontFamily: typography.meaning.fontFamily,
                fontSize: 14,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 12,
              }}
            >
              {isHi ? 'आज के लिए कोई पाठ निर्धारित नहीं' : 'Nothing scheduled for today'}
            </Text>
            <RoutineButton
              label={isHi ? 'साधना जोड़ें' : 'Add a routine'}
              variant="ghost"
              onPress={() => navigation.navigate('RoutineList')}
            />
          </View>
        ) : (
          <>
            {/* Completion summary card */}
            <View
              style={[
                styles.summary,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.goldTint,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                },
                elevation.card,
              ]}
            >
              {summary.allDone && (
                <View style={{ marginBottom: spacing.sm }}>
                  <PracticeSeal size={56} />
                </View>
              )}

              <Text
                style={{
                  fontFamily: isHi ? typography.screenTitle.fontFamily : typography.verseLatin.fontFamily,
                  fontSize: 26,
                  color: colors.ink,
                  textAlign: 'center',
                }}
              >
                {summary.big}
              </Text>
              <Text
                style={{
                  fontFamily: isHi ? typography.meaning.fontFamily : typography.cardLatin.fontFamily,
                  fontSize: 14,
                  color: colors.inkSoft,
                  textAlign: 'center',
                  marginTop: 3,
                }}
              >
                {summary.sub}
              </Text>

              {!summary.allDone && (
                <View
                  style={[
                    styles.track,
                    { backgroundColor: colors.parchmentDeep, borderRadius: radii.pill, marginTop: spacing.lg },
                  ]}
                >
                  <LinearGradient
                    colors={[colors.gold, colors.saffron]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${pct}%`, height: '100%', borderRadius: radii.pill }}
                  />
                </View>
              )}

              <View style={{ marginTop: spacing.lg }}>
                <MalaStreak streak={streak} />
              </View>
            </View>

            {/* Today's items */}
            <View style={{ marginTop: spacing.lg }}>
              {entries.map((e, i) => {
                const tail = offeredTail(e.done, e.doneAt, isHi);
                const titleMain = isHi ? e.display.titleHi : e.display.titleEn;
                const titleAlt = isHi ? e.display.titleEn : e.display.titleHi;
                const last = i === entries.length - 1;
                return (
                  <View
                    key={e.key}
                    style={[
                      styles.itemRow,
                      { borderBottomColor: colors.divider, borderBottomWidth: last ? 0 : 1 },
                    ]}
                  >
                    <Pressable
                      onPress={() =>
                        e.done ? (e.doneMode === 'manual' ? unmarkManualDone(e.key) : undefined) : markManualDone(e.key)
                      }
                      accessibilityRole="button"
                      accessibilityState={{ checked: e.done }}
                      accessibilityLabel={
                        e.done
                          ? isHi
                            ? 'अर्पित — चिह्न हटाएँ'
                            : 'Offered — tap to undo'
                          : isHi
                            ? 'अर्पित चिह्नित करें'
                            : 'Mark offered'
                      }
                      hitSlop={10}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: colors.saffron,
                        backgroundColor: e.done ? colors.saffron : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {e.done && <Text style={{ color: colors.onPrimary, fontSize: 14 }}>✓</Text>}
                    </Pressable>

                    <Pressable style={styles.itemInfo} onPress={() => navigateToRoutineItem(itemNav, e.item)}>
                      <Text
                        style={{
                          fontFamily: typography.cardHindi.fontFamily,
                          fontSize: 16,
                          color: e.done ? colors.inkMuted : colors.ink,
                        }}
                      >
                        {titleMain}
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.cardLatin.fontFamily,
                          fontSize: 12,
                          color: e.done ? colors.inkMuted : colors.saffronDeep,
                          marginTop: 2,
                        }}
                      >
                        {titleAlt} · {tail}
                      </Text>
                    </Pressable>

                    <Pressable onPress={() => navigateToRoutineItem(itemNav, e.item)} hitSlop={8}>
                      <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Text
              style={{
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 12,
                color: colors.inkMuted,
                marginTop: spacing.lg,
                lineHeight: 17,
              }}
            >
              {isHi
                ? 'पाठ खोलने के लिए पंक्ति पर टैप करें — अंतिम पृष्ठ तक पहुँचने पर स्वतः अर्पित होगा। या ◯ को टैप कर स्वयं अर्पित चिह्नित करें।'
                : 'Open a reading to begin — it completes on its own when you reach the last page. Or tap the circle to mark it offered.'}
            </Text>
          </>
        )}
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  emptyCard: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, borderWidth: 1 },
  summary: { alignItems: 'center', borderWidth: 1 },
  track: { height: 7, width: '100%', overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  itemInfo: { flex: 1, minWidth: 0 },
});
