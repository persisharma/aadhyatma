import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { useRoutines } from '@/contexts/RoutineContext';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { navigateToRoutineItem } from '@/navigation/entryRoutes';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineToday'>;

export default function RoutineTodayScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { markManualDone, unmarkManualDone } = useRoutines();
  const { currentStreak } = useUserActivity();
  const { entries, doneCount, total, hasRoutine } = useRoutineToday();
  // General-typed nav for the centralized routing helper (this screen has no
  // route params, which is incompatible with the helper's route-agnostic Nav).
  const itemNav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const streak = currentStreak();

  const right = (
    <Pressable
      onPress={() => navigation.navigate('RoutineList')}
      accessibilityRole="button"
      accessibilityLabel={pick(lang, { hi: 'सभी साधनाएँ', en: 'All routines', gu: 'બધી સાધનાઓ', kn: 'ಎಲ್ಲಾ ಸಾಧನೆಗಳು' })}
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
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
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
              {pick(lang, { hi: 'आज के लिए कोई पाठ निर्धारित नहीं', en: 'Nothing scheduled for today', gu: 'આજ માટે કંઈ નિર્ધારિત નથી', kn: 'ಇಂದಿಗೆ ಏನೂ ನಿಗದಿಯಾಗಿಲ್ಲ' })}
            </Text>
            <RoutineButton
              label={pick(lang, { hi: 'साधना जोड़ें', en: 'Add a routine', gu: 'સાધના ઉમેરો', kn: 'ಸಾಧನೆ ಸೇರಿಸಿ' })}
              variant="ghost"
              onPress={() => navigation.navigate('RoutineList')}
            />
          </View>
        ) : (
          <>
            {/* Progress header */}
            <View
              style={{
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.goldTint,
                borderWidth: 1,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 16, color: colors.ink }}>
                {doneCount}/{total} · {pick(lang, { hi: 'पूर्ण', en: 'done', gu: 'પૂર્ણ', kn: 'ಪೂರ್ಣ' })}
              </Text>
              <View style={[styles.track, { backgroundColor: colors.divider, borderRadius: radii.pill, marginTop: spacing.sm }]}>
                <View
                  style={{
                    width: `${total > 0 ? Math.round((doneCount / total) * 100) : 0}%`,
                    height: '100%',
                    backgroundColor: colors.saffron,
                    borderRadius: radii.pill,
                  }}
                />
              </View>
              {streak > 0 && (
                <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.saffronDeep, marginTop: spacing.sm }}>
                  {pick(lang, {
                    hi: `निरंतरता · ${streak} दिन`,
                    en: `Streak · ${streak} days`,
                    gu: `સાતત્ય · ${streak} દિવસ`,
                    kn: `ಸತತತೆ · ${streak} ದಿನ`,
                  })}
                </Text>
              )}
            </View>

            {entries.map((e) => {
              const tail = e.done
                ? e.doneMode === 'auto'
                  ? pick(lang, { hi: 'अंत तक पढ़ा', en: 'read to end', gu: 'અંત સુધી વાંચ્યું', kn: 'ಕೊನೆಯವರೆಗೆ ಓದಲಾಗಿದೆ' })
                  : pick(lang, { hi: 'चिह्नित', en: 'marked', gu: 'ચિહ્નિત', kn: 'ಗುರುತಿಸಲಾಗಿದೆ' })
                : contentByLang(lang, e.display.subHi, e.display.subEn);
              return (
                <View
                  key={e.key}
                  style={[styles.itemRow, { borderBottomColor: colors.divider }]}
                >
                  <Pressable
                    onPress={() =>
                      e.done ? (e.doneMode === 'manual' ? unmarkManualDone(e.key) : undefined) : markManualDone(e.key)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={pick(lang, { hi: 'पूर्ण चिह्नित करें', en: 'Mark done', gu: 'પૂર્ણ ચિહ્નિત કરો', kn: 'ಪೂರ್ಣ ಎಂದು ಗುರುತಿಸಿ' })}
                    hitSlop={10}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 1.5,
                      borderColor: e.done ? colors.saffron : colors.gold,
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
                        fontSize: 15,
                        color: e.done ? colors.inkMuted : colors.ink,
                        textDecorationLine: e.done ? 'line-through' : 'none',
                      }}
                    >
                      {contentByLang(lang, e.display.titleHi, e.display.titleEn)}
                    </Text>
                    <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, marginTop: 1 }}>
                      {contentByLang(lang, e.routine.nameHi || e.routine.nameEn, e.routine.nameEn || e.routine.nameHi)} · {tail}
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => navigateToRoutineItem(itemNav, e.item)} hitSlop={8}>
                    <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
                  </Pressable>
                </View>
              );
            })}

            <Text
              style={{
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 11,
                color: colors.inkMuted,
                marginTop: spacing.lg,
                lineHeight: 16,
              }}
            >
              {pick(lang, {
                hi: 'किसी पंक्ति पर टैप कर पाठ खोलें। अंतिम पृष्ठ तक पहुँचने पर स्वतः पूर्ण होगा। ◯ को टैप कर स्वयं चिह्नित करें।',
                en: 'Tap a row to open the text. It auto-completes when you reach the last page. Tap ◯ to mark it yourself.',
                gu: 'કોઈ પંક્તિ પર ટૅપ કરી પાઠ ખોલો. છેલ્લા પૃષ્ઠ સુધી પહોંચતાં આપમેળે પૂર્ણ થશે. ◯ પર ટૅપ કરી જાતે ચિહ્નિત કરો.',
                kn: 'ಪಠ್ಯ ತೆರೆಯಲು ಸಾಲನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ. ಕೊನೆಯ ಪುಟ ತಲುಪಿದಾಗ ಸ್ವಯಂ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ. ನೀವೇ ಗುರುತಿಸಲು ◯ ಟ್ಯಾಪ್ ಮಾಡಿ.',
              })}
            </Text>
          </>
        )}
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, width: '100%', overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  itemInfo: { flex: 1, minWidth: 0 },
});
