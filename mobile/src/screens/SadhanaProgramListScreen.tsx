import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { RoutineShell } from '@/components/RoutineShell';
import { useSadhana } from '@/contexts/SadhanaContext';
import { SADHANA_PROGRAMS } from '@/data/sadhana/programs';
import { completedDayCount, programDayCount } from '@/data/sadhana/progress';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SadhanaPrograms'>;

export default function SadhanaProgramListScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { enrollmentFor } = useSadhana();

  return (
    <RoutineShell
      titleHi="संकल्प"
      titleEn="Sadhana Programs"
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 14,
            color: colors.inkSoft,
            lineHeight: 21,
            marginBottom: spacing.lg,
          }}
        >
          {contentByLang(
            lang,
            'एक तैयार संकल्प चुनें — नियत दिनों तक प्रतिदिन का पाठ, पूर्ण होने तक।',
            'Choose a ready sankalp — a daily reading for a set number of days, all the way to completion.'
          )}
        </Text>

        {SADHANA_PROGRAMS.map((p) => {
          const enrollment = enrollmentFor(p.id);
          const total = programDayCount(p);
          const done = enrollment ? completedDayCount(enrollment) : 0;
          const active = enrollment?.status === 'active';
          const completed = enrollment?.status === 'completed';
          const badge = completed
            ? contentByLang(lang, 'पूर्ण', 'Complete')
            : active
              ? contentByLang(lang, `दिन ${done} / ${total}`, `Day ${done} / ${total}`)
              : contentByLang(lang, `${total} दिन`, `${total} days`);
          return (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate('SadhanaProgramDetail', { programId: p.id })}
              accessibilityRole="button"
              style={[
                styles.card,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: active || completed ? colors.saffron : colors.goldTint,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  marginBottom: spacing.md,
                },
                elevation.card,
              ]}
            >
              <View style={styles.cardTop}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                    fontSize: 18,
                    color: colors.ink,
                  }}
                >
                  {contentByLang(lang, p.titleHi, p.titleEn)}
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.parchmentHighlight, borderColor: colors.goldTint, borderRadius: radii.pill },
                  ]}
                >
                  <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 11, color: colors.saffronDeep }}>
                    {badge}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: 13,
                  color: colors.inkMuted,
                  marginTop: 6,
                }}
              >
                {contentByLang(lang, p.subtitleHi, p.subtitleEn)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
});
