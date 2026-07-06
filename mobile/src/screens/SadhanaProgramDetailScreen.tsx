import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import { getDeityBackground } from '@/data/backgrounds';
import { useSadhana } from '@/contexts/SadhanaContext';
import { getProgram } from '@/data/sadhana/programs';
import { completedDayCount, programDayCount } from '@/data/sadhana/progress';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SadhanaProgramDetail'>;

export default function SadhanaProgramDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { enrollmentFor, enroll, abandon, isReminderEnabled, setReminderEnabled } = useSadhana();

  const program = getProgram(route.params.programId);
  if (!program) {
    navigation.goBack();
    return null;
  }

  const enrollment = enrollmentFor(program.id);
  const total = programDayCount(program);
  const done = enrollment ? completedDayCount(enrollment) : 0;
  const active = enrollment?.status === 'active';
  const completed = enrollment?.status === 'completed';

  const begin = () => {
    enroll(program.id);
    // Land the user on Today so they can start the first day immediately.
    navigation.navigate('RoutineToday');
  };

  return (
    <RoutineShell
      titleHi="संकल्प"
      titleEn="Sankalp"
      background={program.deity ? getDeityBackground(program.deity) : undefined}
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: scriptTitleFont(lang, typography.screenTitle.fontFamily),
            fontSize: 24,
            color: colors.ink,
            textAlign: 'center',
          }}
        >
          {contentByLang(lang, program.titleHi, program.titleEn)}
        </Text>
        <Text
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 14,
            color: colors.saffronDeep,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {contentByLang(lang, program.subtitleHi, program.subtitleEn)}
        </Text>

        <View
          style={[
            styles.introCard,
            {
              backgroundColor: colors.parchmentSoft,
              borderColor: colors.goldTint,
              borderRadius: radii.lg,
              padding: spacing.lg,
              marginTop: spacing.lg,
            },
            elevation.card,
          ]}
        >
          <Text
            style={{
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 15,
              color: colors.inkSoft,
              lineHeight: 24,
            }}
          >
            {contentByLang(lang, program.introHi, program.introEn)}
          </Text>
        </View>

        {(active || completed) && (
          <Text
            style={{
              fontFamily: scriptBodyFont(lang, typography.cardMeta.fontFamily),
              fontSize: typography.cardMeta.fontSize,
              color: colors.inkMuted,
              textAlign: 'center',
              marginTop: spacing.lg,
            }}
          >
            {completed
              ? contentByLang(lang, 'यह संकल्प पूर्ण हो चुका है।', 'This sankalp is complete.')
              : contentByLang(lang, `चल रहा है · दिन ${done} / ${total}`, `In progress · Day ${done} / ${total}`)}
          </Text>
        )}

        {active ? (
          <>
            <View
              style={[
                styles.reminderRow,
                { borderColor: colors.goldTint, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.lg },
              ]}
            >
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={{ fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), fontSize: typography.cardHindi.fontSize, color: colors.ink }}>
                  {contentByLang(lang, 'दैनिक स्मरण', 'Daily reminder')}
                </Text>
                <Text style={{ fontFamily: scriptBodyFont(lang, typography.cardMeta.fontFamily), fontSize: typography.cardMeta.fontSize, color: colors.inkMuted, marginTop: 2 }}>
                  {contentByLang(lang, 'आपके नित्य स्मरण समय पर', 'At your daily reminder time')}
                </Text>
              </View>
              <Switch
                value={isReminderEnabled(program.id)}
                onValueChange={(v) => setReminderEnabled(program.id, v)}
                trackColor={{ true: colors.saffron, false: colors.divider }}
                thumbColor={colors.onPrimary}
              />
            </View>
            <RoutineButton
              label={contentByLang(lang, 'आज की साधना', "Today's practice")}
              onPress={() => navigation.navigate('RoutineToday')}
            />
            <RoutineButton
              label={contentByLang(lang, 'संकल्प स्थगित करें', 'Set this sankalp aside')}
              variant="ghost"
              onPress={() => {
                abandon(program.id);
                navigation.goBack();
              }}
            />
          </>
        ) : (
          <RoutineButton
            label={
              completed
                ? contentByLang(lang, 'फिर से संकल्प लें', 'Begin again')
                : contentByLang(lang, 'संकल्प लें', 'Begin this sankalp')
            }
            onPress={begin}
          />
        )}

        <Text
          style={{
            fontFamily: scriptBodyFont(lang, typography.cardLatin.fontFamily),
            fontSize: 12,
            color: colors.inkMuted,
            marginTop: spacing.lg,
            textAlign: 'center',
            lineHeight: 18,
          }}
        >
          {meaningByLang(
            lang,
            'कोई दिन छूटे तो संकल्प रुकता है, टूटता नहीं — अगले दिन वहीं से आगे।',
            'Miss a day and the sankalp pauses, it never breaks — continue the next day.'
          )}
        </Text>
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  introCard: { borderWidth: 1 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
});
