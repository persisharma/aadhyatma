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

        {(() => {
          const withStatus = SADHANA_PROGRAMS.map((p) => ({ p, e: enrollmentFor(p.id) }));
          const inProgress = withStatus.filter((x) => x.e?.status === 'active');
          const completed = withStatus.filter((x) => x.e?.status === 'completed');
          const available = withStatus.filter(
            (x) => x.e?.status !== 'active' && x.e?.status !== 'completed'
          );

          const Section = ({ titleHi, titleEn, rows }: { titleHi: string; titleEn: string; rows: typeof withStatus }) =>
            rows.length === 0 ? null : (
              <>
                <Text
                  style={{
                    fontFamily: typography.cardLatin.fontFamily,
                    fontSize: 12,
                    letterSpacing: 0.5,
                    color: colors.inkMuted,
                    textTransform: 'uppercase',
                    marginTop: spacing.md,
                    marginBottom: spacing.sm,
                  }}
                >
                  {contentByLang(lang, titleHi, titleEn)}
                </Text>
                {rows.map(({ p, e }) => {
                  const total = programDayCount(p);
                  const done = e ? completedDayCount(e) : 0;
                  const active = e?.status === 'active';
                  const isDone = e?.status === 'completed';
                  const badge = isDone
                    ? contentByLang(lang, '✓ पूर्ण', '✓ Complete')
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
                          borderColor: active || isDone ? colors.saffron : colors.goldTint,
                          borderRadius: radii.lg,
                          padding: spacing.lg,
                          marginBottom: spacing.md,
                          opacity: isDone ? 0.9 : 1,
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
                            {
                              backgroundColor: colors.parchmentHighlight,
                              borderColor: colors.goldTint,
                              borderRadius: radii.pill,
                            },
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
              </>
            );

          return (
            <>
              <Section titleHi="चल रहा है" titleEn="In progress" rows={inProgress} />
              <Section titleHi="उपलब्ध" titleEn="Available" rows={available} />
              <Section titleHi="पूर्ण संकल्प" titleEn="Completed sankalps" rows={completed} />
            </>
          );
        })()}
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
});
